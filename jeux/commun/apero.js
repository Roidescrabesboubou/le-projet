/* ============================================================
   JEUX D'APÉRO (dans la même pièce)  →  window.Apero
   Deux façons de jouer, choisies au lancement :
     📱    un seul téléphone : les pseudos sont entrés une fois
           (communs à tous les jeux d'apéro) et le téléphone passe
           de main en main quand il faut jouer en secret ;
     📱📱  chacun son téléphone : salle en ligne de soiree.js.
   À inclure après base.js, reseau.js et soiree.js (+ soiree.css, apero.css).

   Apero.demarrer({ ...les options de Soiree.demarrer...,
     local: true|false   un seul téléphone possible (défaut true)
     multi: true|false   chacun son téléphone possible (défaut true)
     attendus(G) → [id]  un seul téléphone : joueurs qui doivent encore
                         jouer (le téléphone leur est passé un par un) ;
                         [] = écran commun, tout le monde regarde
   })
   Le réglage « Boissons » (gorgées / sans alcool) est ajouté tout seul
   (R.boisson). ctx reçoit en plus : local (un seul téléphone), commun
   (écran commun en un seul téléphone ; moi = le 1er joueur).
   G reçoit _id (et V aussi) : à mettre dans les clés de Apero.phase ;
   G._local = true sur un seul téléphone.

   Chaque jeu est dans jeux/<slug>/jeu.js : Apero.jeu({jeu, entete: {titre,
   emoji, aide}, ...}) le range dans Apero.jeux ; index.html fait
   Apero.seul(slug), La Soirée (jeux/lasoiree) les charge tous. Son style
   (jeu.css) est rangé sous .g-<slug>.
   Facultatif : bilan(G) → [[clé, id, n], …] gorgées dues à des joueurs
   connus (compteur de La Soirée ; une clé n'est comptée qu'une fois).

   Apero.phase(box, cle, construire)  ne reconstruit l'écran que si la
     clé change ; construire() peut rendre une fonction d'arrêt (boucles,
     capteurs) appelée au changement d'écran.
   Apero.boit(R, nom, n, graine)      « 🍺 Léa boit 2 gorgées » ou un gage
   Capteurs (à demander dans un clic, iPhone oblige) :
     await Apero.mouvement()  → true si l'accéléromètre répond
     Apero.surMouvement(cb)   cb({a, x, y, z}) a = secousse (m/s², sans la pesanteur) → arrêt()
     Apero.surOrientation(cb) cb({alpha, beta, gamma}) → arrêt()
     await Apero.micro()      → {niveau() 0…1, arret()}
     await Apero.camera(video, avant) → arrêt()
     Apero.son(freq, ms, type, vol), Apero.boum(ms), Apero.vibrer(motif), Apero.eveil(),
     Apero.audio() (à appeler dans un clic pour débloquer le son), Apero.sonActif()
   ============================================================ */
(function(){
  const esc = Base.esc;
  const S = Base.stock("apero_");
  const AV = Base.joueur.AVATARS;

  /* ---------- Gorgées ou gages ---------- */
  const GAGES = [
    "imite une poule pendant 10 secondes", "parle avec un accent jusqu'au prochain tour", "fais 10 squats",
    "chante le refrain d'une chanson choisie par la table", "fais un compliment sincère à chaque joueur",
    "garde les yeux fermés jusqu'au prochain tour", "raconte ta pire honte en 3 phrases", "fais ta meilleure danse 15 secondes",
    "parle à la troisième personne jusqu'au prochain tour", "laisse ta gauche écrire ton prochain message",
    "fais une déclaration d'amour à un objet de la pièce", "mange quelque chose sans les mains",
    "imite un autre joueur, les autres devinent qui", "fais la planche 20 secondes", "dis l'alphabet à l'envers jusqu'à P",
    "bois un grand verre d'eau", "reste debout jusqu'au prochain tour", "fais un discours de remerciement d'Oscar",
    "laisse la table choisir ta photo de profil pour 10 minutes", "fais 5 pompes"
  ];
  function boit(R, nom, n, graine){
    n = n || 1;
    if(R && R.boisson === "soft"){
      const g = GAGES[Math.abs(Math.round(graine == null ? Math.random() * 1e6 : graine)) % GAGES.length];
      return `🎭 <b>${esc(nom)}</b> : ${esc(g)}`;
    }
    return `🍺 <b>${esc(nom)}</b> boit ${n} gorgée${n > 1 ? "s" : ""}`;
  }
  const BOISSON = {k: "boisson", titre: "Boissons", options: [["alcool", "🍺 Gorgées"], ["soft", "🥤 Sans alcool (gages)"]], def: "alcool"};

  /* ---------- Écrans ---------- */
  function phase(box, cle, construire){
    if(box._phase === cle) return false;
    if(box._stop){ try{ box._stop(); }catch(e){} }
    box._stop = null; box._phase = cle; box.innerHTML = "";
    const r = construire();
    if(typeof r === "function") box._stop = r;
    return true;
  }

  /* ---------- Capteurs ---------- */
  let ac = null;
  function audio(){
    if(!ac){ try{ ac = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ return null; } }
    if(ac.state === "suspended") ac.resume();
    return ac;
  }
  function son(freq, ms, type, vol){
    const a = audio(); if(!a) return;
    const o = a.createOscillator(), g = a.createGain(), t = a.currentTime, d = (ms || 120) / 1000;
    o.type = type || "sine"; o.frequency.value = freq || 660;
    g.gain.setValueAtTime(vol == null ? .25 : vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + .02);
  }
  /* bruit blanc court (explosion, coup de feu) */
  function boum(ms, vol){
    const a = audio(); if(!a) return;
    const d = (ms || 400) / 1000, b = a.createBuffer(1, Math.floor(a.sampleRate * d), a.sampleRate), x = b.getChannelData(0);
    for(let i = 0; i < x.length; i++) x[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / x.length, 2.5);
    const s = a.createBufferSource(), g = a.createGain(); s.buffer = b; g.gain.value = vol == null ? .6 : vol;
    s.connect(g); g.connect(a.destination); s.start();
  }
  const vibrer = m => { try{ if(navigator.vibrate) navigator.vibrate(m); }catch(e){} };

  let verrou = null;
  async function eveil(){
    try{ if(navigator.wakeLock && !verrou){ verrou = await navigator.wakeLock.request("screen"); verrou.addEventListener("release", () => { verrou = null; }); } }catch(e){}
  }
  document.addEventListener("visibilitychange", () => { if(document.visibilityState === "visible" && eveilVoulu) eveil(); });
  let eveilVoulu = false;
  const garderAllume = () => { eveilVoulu = true; eveil(); };

  /* iPhone : les deux demandes partent dans le même clic ; le mouvement suffit pour secouer */
  async function permission(){
    const ask = E => E && typeof E.requestPermission === "function" ? E.requestPermission().then(r => r === "granted", () => false) : Promise.resolve(true);
    const [m] = await Promise.all([ask(window.DeviceMotionEvent), ask(window.DeviceOrientationEvent)]);
    return m;
  }
  /* true si l'accéléromètre envoie vraiment des mesures (sinon : ordinateur → jeu au doigt) */
  async function mouvement(){
    audio();
    if(!window.DeviceMotionEvent) return false;
    if(!await permission()) return false;
    return new Promise(ok => {
      let fini = false;
      const f = e => {
        const g = e.accelerationIncludingGravity || e.acceleration;
        if(g && (g.x != null || g.y != null) && !fini){ fini = true; removeEventListener("devicemotion", f); ok(true); }
      };
      addEventListener("devicemotion", f);
      setTimeout(() => { if(!fini){ fini = true; removeEventListener("devicemotion", f); ok(false); } }, 900);
    });
  }
  function surMouvement(cb){
    let px = null, py, pz;
    const f = e => {
      const l = e.acceleration, g = e.accelerationIncludingGravity || {};
      let a;
      if(l && l.x != null) a = Math.hypot(l.x || 0, l.y || 0, l.z || 0);
      else{   // pas d'accélération sans pesanteur : on prend la variation
        a = px == null ? 0 : Math.hypot((g.x || 0) - px, (g.y || 0) - py, (g.z || 0) - pz);
        px = g.x || 0; py = g.y || 0; pz = g.z || 0;
      }
      cb({a, x: g.x || 0, y: g.y || 0, z: g.z || 0, t: performance.now()});
    };
    addEventListener("devicemotion", f);
    return () => removeEventListener("devicemotion", f);
  }
  function surOrientation(cb){
    const f = e => { if(e.beta != null) cb({alpha: e.alpha, beta: e.beta, gamma: e.gamma, t: performance.now()}); };
    addEventListener("deviceorientation", f);
    return () => removeEventListener("deviceorientation", f);
  }
  async function micro(){
    const a = audio();
    const st = await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: false, noiseSuppression: false, autoGainControl: false}});
    const src = a.createMediaStreamSource(st), an = a.createAnalyser();
    an.fftSize = 1024; src.connect(an);
    const buf = new Float32Array(an.fftSize);
    return {
      niveau(){
        an.getFloatTimeDomainData(buf);
        let s = 0; for(let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
        return Math.min(1, Math.sqrt(s / buf.length) * 4);
      },
      arret(){ st.getTracks().forEach(t => t.stop()); try{ src.disconnect(); }catch(e){} }
    };
  }
  async function camera(video, avant){
    const st = await navigator.mediaDevices.getUserMedia({video: {facingMode: avant ? "user" : "environment", width: {ideal: 640}, height: {ideal: 480}}, audio: false});
    video.setAttribute("playsinline", ""); video.muted = true; video.srcObject = st;
    await video.play().catch(() => {});
    return () => { st.getTracks().forEach(t => t.stop()); video.srcObject = null; };
  }

  /* ---------- Lancement ---------- */
  function demarrer(o){
    o = Object.assign({local: true, multi: true}, o);
    o.reglages = (o.reglages || []).concat([BOISSON]);
    const nouv = o.nouvelle, pub = o.publique;
    o.nouvelle = (j, R) => { const G = nouv(j, R); G._id = Math.random().toString(36).slice(2, 8); return G; };
    o.publique = G => Object.assign(pub(G), {_id: G._id});
    if(!o.note) o.note = "dans la même pièce, chacun sur son téléphone : un crée la salle, les autres entrent le code.";   // après « De 2 à 8 joueurs, »

    if(Reseau.codeDansAdresse() || !o.local){ Soiree.demarrer(o); return; }
    if(!o.multi){ local(o); return; }

    const main = Base.el("main", null, "b-page so-page");
    main.innerHTML = `
      <section class="b-carte so-panneau">
        <div class="so-hero">
          <div class="so-logo">${o.emoji}</div>
          <h2>${esc(o.titre)}</h2>
          <p class="muted">${(o.hero && o.hero.texte) || ""}</p>
          <div class="so-etapes">${((o.hero && o.hero.etapes) || []).map(e => `<span>${esc(e)}</span>`).join("")}</div>
        </div>
        <div class="ap-modes">
          <button class="ap-mode" data-m="local"><span class="i">📱</span><b>Un seul téléphone</b><span>On se le passe</span></button>
          <button class="ap-mode" data-m="multi"><span class="i">📱📱</span><b>Chacun son téléphone</b><span>Une salle, un code</span></button>
        </div>
      </section>`;
    document.body.appendChild(main);
    main.querySelectorAll("[data-m]").forEach(b => b.onclick = () => {
      S.ecrire("mode", b.dataset.m); main.remove();
      if(b.dataset.m === "local") local(o); else Soiree.demarrer(o);
    });
  }

  /* ---------- Un seul téléphone ---------- */
  function joueursLocaux(){ return S.lire("joueurs", []).filter(j => j && j.nom); }
  function local(o){
    const stock = Base.stock(o.jeu + "_");
    const R = {};
    o.reglages.forEach(r => { R[r.k] = stock.lire("r_" + r.k, r.def); if(r.options && !r.options.some(x => x[0] === R[r.k])) R[r.k] = r.def; });
    const MIN = o.min || 3, MAX = o.max || 12;
    let J = joueursLocaux(), G = null, passeA = null;

    const main = Base.el("main", null, "b-page so-page");
    main.innerHTML = `
      <section id="apSalon" class="b-carte so-panneau">
        <div class="so-hero">
          <div class="so-logo">${o.emoji}</div>
          <h2>${esc(o.titre)}</h2>
          <p class="muted">${(o.hero && o.hero.texte) || ""}</p>
        </div>
        <h3 style="margin:16px 0 0">Joueurs <span class="muted" id="apNb"></span></h3>
        <ul class="so-liste" id="apListe"></ul>
        <div class="so-ligne" style="margin-top:8px">
          <input class="champ" id="apNom" maxlength="16" placeholder="Prénom d'un joueur" autocomplete="off">
          <button class="btn ghost" id="apAjout">＋ Ajouter</button>
        </div>
        <p class="so-note">Les mêmes joueurs servent pour tous les jeux d'apéro.</p>
        <h3 style="margin:16px 0 0">⚙️ Réglages</h3><div class="so-reg" id="apReg"></div>
        <div class="so-actions"><button class="btn so-gros" id="apLancer">Lancer ${o.emoji}</button></div>
      </section>
      <section id="apJeu" class="so-jeu cache">
        <div id="apBox" class="so-box"></div>
        <div class="so-pied"><button class="btn ghost petit" id="apStop">⏹ Arrêter la partie</button></div>
      </section>`;
    document.body.appendChild(main);
    const box = main.querySelector("#apBox"), $ = id => main.querySelector("#" + id);

    function salon(){
      const ul = $("apListe"); ul.innerHTML = "";
      J.forEach((j, i) => {
        const li = Base.el("li");
        const x = Base.el("button", "×", "ap-x"); x.title = "Retirer"; x.onclick = () => { J.splice(i, 1); S.ecrire("joueurs", J); salon(); };
        li.append(Base.el("span", j.av, "av"), Base.el("span", j.nom, "n"), x);
        ul.appendChild(li);
      });
      $("apNb").textContent = `(${J.length}/${MAX})`;
      $("apLancer").disabled = J.length < MIN;
      $("apLancer").textContent = J.length < MIN ? `Il faut ${MIN} joueurs minimum` : `Lancer ${o.emoji}`;
      $("apReg").innerHTML = o.reglages.filter(r => r.options).map(r => `<div class="so-bloc"><b>${esc(r.titre)}</b><div class="pilules">${r.options.map(([v, l]) =>
        `<button data-rk="${r.k}" data-rv="${esc(String(v))}" class="${R[r.k] === v ? "on" : ""}">${esc(l)}</button>`).join("")}</div></div>`).join("");
      $("apReg").querySelectorAll("[data-rk]").forEach(b => b.onclick = () => {
        const r = o.reglages.find(x => x.k === b.dataset.rk), x = r.options.find(x => String(x[0]) === b.dataset.rv);
        R[r.k] = x[0]; stock.ecrire("r_" + r.k, x[0]); salon();
      });
    }
    function ajouter(){
      const n = $("apNom").value.trim().slice(0, 16);
      if(!n || J.length >= MAX) return;
      if(J.some(j => j.nom.toLowerCase() === n.toLowerCase())){ Base.toast("Ce prénom est déjà là"); return; }
      const pris = J.map(j => j.av), libres = AV.filter(a => !pris.includes(a));
      J.push({id: "j" + Date.now().toString(36) + Math.floor(Math.random() * 1e3), nom: n, av: (libres.length ? libres : AV)[Math.floor(Math.random() * (libres.length || AV.length))]});
      S.ecrire("joueurs", J); $("apNom").value = ""; $("apNom").focus(); salon();
    }
    $("apAjout").onclick = ajouter;
    $("apNom").addEventListener("keydown", e => { if(e.key === "Enter") ajouter(); });

    function ecran(jeu){
      $("apSalon").classList.toggle("cache", jeu); $("apJeu").classList.toggle("cache", !jeu);
      if(!jeu){ if(box._stop){ try{ box._stop(); }catch(e){} } box._stop = null; box._phase = null; box.innerHTML = ""; salon(); }
      window.scrollTo(0, 0);
    }
    function lancer(){
      G = o.nouvelle(J.map(j => ({id: j.id, nom: j.nom, av: j.av})), Object.assign({}, R));
      G._local = true; passeA = null; box._phase = null; ecran(true); maj();
    }
    $("apLancer").onclick = lancer;
    $("apStop").onclick = () => { if(confirm("Arrêter la partie ?")){ G = null; ecran(false); } };

    function envoyer(moi, a){
      if(!a || !G) return;
      if(a.t === "_rejouer"){ lancer(); return; }
      if(a.t === "_salon"){ G = null; ecran(false); return; }
      if(o.action(G, moi, a)) maj();
    }
    function maj(){
      if(!G) return;
      const ids = (o.attendus ? o.attendus(G) : null) || [];
      const cur = ids[0] || null;
      if(cur && passeA !== cur){
        const j = G.J ? G.J.find(x => x.id === cur) : J.find(x => x.id === cur);
        phase(box, "passe:" + cur + ":" + Math.random(), () => {
          box.innerHTML = `<div class="b-carte ap-passe">
            <p class="muted">📱 Passe le téléphone à</p>
            <div class="ap-av">${esc(j ? j.av : "🙂")}</div>
            <h2>${esc(j ? j.nom : "?")}</h2>
            <p class="muted">Les autres, ne regardez pas l'écran !</p>
            <button class="btn so-gros">C'est moi, j'y vais</button></div>`;
          box.querySelector("button").onclick = () => { passeA = cur; maj(); };
        });
        return;
      }
      if(!cur) passeA = null;
      const moi = cur || (G.J && G.J[0] ? G.J[0].id : J[0].id);
      const ctx = {
        V: o.publique(G), P: o.privee ? o.privee(G, moi) : null, R: G.R || R, hote: true, moi, local: true, commun: !cur, esc,
        maintenant: () => Date.now(),
        envoyer: a => envoyer(moi, a),
        attente: () => false,
        finHtml: () => `<div class="so-actions"><button class="btn so-gros" data-so="_rejouer">🔁 Rejouer</button><button class="btn ghost" data-so="_salon">👥 Changer les joueurs</button></div>`
      };
      o.rendre(box, ctx);
    }
    box.addEventListener("click", e => {
      const b = e.target.closest("[data-so]");
      if(b && G){ const ids = (o.attendus ? o.attendus(G) : null) || []; envoyer(ids[0] || (G.J && G.J[0] ? G.J[0].id : J[0].id), {t: b.dataset.so}); }
    });
    Apero.rafraichir = maj;
    salon();
  }

  /* ---------- Jeux rangés (jeu.js de chaque dossier) ---------- */
  const jeux = {};
  function jeu(o){ jeux[o.jeu] = o; }
  function seul(slug){ const o = jeux[slug]; Base.entete(o.entete); demarrer(o); }

  window.Apero = {demarrer, jeu, jeux, seul, BOISSON, phase, boit, GAGES, son, boum, vibrer, eveil: garderAllume, mouvement, surMouvement, surOrientation, micro, camera, audio,
    sonActif: () => !!(ac && ac.state === "running"),
    rafraichir: () => {}};
})();
