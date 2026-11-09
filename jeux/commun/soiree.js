/* ============================================================
   JEUX DE SOIRÉE EN LIGNE  →  window.Soiree
   Tout le salon en ligne (pseudo, créer/rejoindre, code, lien,
   réglages, liste des joueurs) + la synchro hôte → invités.
   Utilisé par : quiaditca, emojis, cadran.
   À inclure après base.js et reseau.js (+ soiree.css).

   Soiree.demarrer({
     jeu: "slug", titre, emoji, min: 3, max: 12,
     hero: {texte, etapes: ["1 · …", …]},
     reglages: [{k, titre, options: [[valeur, "libellé"], …], def}
                | {k, titre, type: "texte", def: "", placeholder}],
     nouvelle(joueurs, R) → G     joueurs = [{id, nom, av}]
     action(G, id, a)     → true si G a changé (a = ce qu'a envoyé ctx.envoyer)
     depart(G, id)        joueur parti en cours de partie
     arrivee(G, j)        (facultatif) joueur arrivé en cours de partie
     publique(G) → V      ce que tout le monde reçoit (rien de secret !)
     privee(G, id) → P    (facultatif) ce que seul ce joueur reçoit
     rendre(box, ctx)     affiche la partie ; ctx = {V, P, moi, hote,
                          envoyer(a), attente(t) (action t pas encore reçue
                          par l'hôte), finHtml() (boutons de fin), R}
   })
   L'hôte fait tourner la partie (G) ; chaque invité reçoit V (+ son P).
   Les actions d'un invité sont renvoyées tant que l'hôte ne les a pas reçues.
   Les champs de saisie gardent leur texte et le focus d'un affichage
   à l'autre s'ils ont un id (change l'id à chaque manche pour les vider).
   ============================================================ */
(function(){
  const esc = Base.esc, $ = id => document.getElementById(id);
  // brouillage (XOR sur les octets UTF-8) des infos privées : emojis compris
  const utf8 = new TextEncoder(), deutf8 = new TextDecoder();
  const xor = (b, k) => { const kb = utf8.encode(k); for(let i = 0; i < b.length; i++) b[i] ^= kb[i % kb.length]; return b; };
  const cod = (s, k) => { const b = xor(utf8.encode(s), k); let t = ""; for(let i = 0; i < b.length; i++) t += String.fromCharCode(b[i]); return btoa(t); };
  const decod = (s, k) => { const t = atob(s), b = new Uint8Array(t.length); for(let i = 0; i < t.length; i++) b[i] = t.charCodeAt(i); return deutf8.decode(xor(b, k)); };

  function demarrer(o){
    const stock = Base.stock(o.jeu + "_");
    const REG = o.reglages || [];
    const R = {};
    REG.forEach(r => { R[r.k] = stock.lire("r_" + r.k, r.def); if(r.options && !r.options.some(x => x[0] === R[r.k])) R[r.k] = r.def; });
    const MIN = o.min || 3, MAX = o.max || 12;

    /* ---------- Écrans ---------- */
    const main = Base.el("main", null, "b-page so-page");
    main.innerHTML = `
      <section id="soMenu" class="b-carte so-panneau">
        <div class="so-hero">
          <div class="so-logo">${o.emoji}</div>
          <h2>${esc(o.titre)}</h2>
          <p class="muted">${(o.hero && o.hero.texte) || ""}</p>
          <div class="so-etapes">${((o.hero && o.hero.etapes) || []).map(e => `<span>${esc(e)}</span>`).join("")}</div>
        </div>
        <label class="etiquette" for="soPseudo">Ton pseudo</label>
        <input class="champ" id="soPseudo" maxlength="16" placeholder="Ton prénom ou pseudo" autocomplete="off">
        <div class="so-actions"><button class="btn so-gros" id="soCreer">🏠 Créer une salle</button></div>
        <label class="etiquette" for="soCode">… ou rejoindre une salle</label>
        <div class="so-ligne">
          <input class="champ" id="soCode" maxlength="5" placeholder="CODE" autocomplete="off" style="text-transform:uppercase">
          <button class="btn ghost" id="soRejoindre">Rejoindre</button>
        </div>
        <p class="so-note" id="soMsg">De ${MIN} à ${MAX} joueurs, chacun sur son appareil. Parlez-vous en vocal (Discord…) pendant la partie !</p>
        <div class="so-actions"><button class="btn ghost petit" id="soTester">🩺 Tester la connexion</button></div>
      </section>
      <section id="soSalon" class="b-carte so-panneau cache">
        <div style="text-align:center">
          <p class="muted" style="margin:0">Code de la salle</p>
          <div class="so-code" id="soCodeSalle">····</div>
          <button class="btn ghost petit" id="soCopier">🔗 Copier le lien d'invitation</button>
        </div>
        <h3 style="margin:16px 0 0">Joueurs <span class="muted" id="soNb"></span></h3>
        <ul class="so-liste" id="soListe"></ul>
        ${REG.length ? `<h3 style="margin:16px 0 0">⚙️ Réglages</h3><div class="so-reg" id="soReg"></div>` : ""}
        <p class="so-note" id="soNoteSalon"></p>
        <div class="so-actions">
          <button class="btn so-gros" id="soLancer">Lancer la partie ${o.emoji}</button>
          <button class="btn ghost" id="soQuitter">Quitter</button>
        </div>
      </section>
      <section id="soJeu" class="so-jeu cache">
        <div id="soBox" class="so-box"></div>
        <div class="so-pied"><button class="btn ghost petit" id="soQuitterJeu">🚪 Quitter la salle</button></div>
      </section>`;
    document.body.appendChild(main);
    const box = $("soBox");
    $("soPseudo").value = Base.joueur.pseudo();

    function ecran(id){
      ["soMenu", "soSalon", "soJeu"].forEach(x => $(x).classList.toggle("cache", x !== id));
      if(id !== "soJeu") dernierRendu = "";
      window.scrollTo(0, 0);
    }

    /* ---------- État ---------- */
    let salle = null, G = null, V = null, P = null, gid = 0, decalage = 0;
    const dernier = {};               // hôte : dernier n° d'action reçu de chaque invité
    let attente = [], seq = Date.now(); // invité : actions pas encore confirmées

    /* ---------- Réglages ---------- */
    function libelle(r, v){ const x = r.options && r.options.find(x => x[0] === v); return x ? x[1] : v; }
    function rendreReglages(){
      const zone = $("soReg"); if(!zone) return;
      const hote = salle && salle.hote;
      if(!hote){
        zone.dataset.fait = "";
        zone.innerHTML = REG.map(r => r.type === "texte"
          ? (R[r.k] ? `<div class="so-bloc"><b>${esc(r.titre)}</b><p class="muted" style="margin:0;white-space:pre-line">${esc(R[r.k])}</p></div>` : "")
          : `<div class="so-bloc"><b>${esc(r.titre)}</b><span class="so-val">${esc(libelle(r, R[r.k]))}</span></div>`).join("");
        return;
      }
      if(zone.dataset.fait === "1"){
        zone.querySelectorAll("[data-rk]").forEach(b => b.classList.toggle("on", String(R[b.dataset.rk]) === b.dataset.rv));
        return;
      }
      zone.dataset.fait = "1";
      zone.innerHTML = REG.map(r => r.type === "texte"
        ? `<div class="so-bloc"><b>${esc(r.titre)}</b><textarea class="champ" rows="3" data-rt="${r.k}" maxlength="${r.max || 2000}" placeholder="${esc(r.placeholder || "")}">${esc(R[r.k] || "")}</textarea></div>`
        : `<div class="so-bloc"><b>${esc(r.titre)}</b><div class="pilules">${r.options.map(([v, l]) => `<button data-rk="${r.k}" data-rv="${esc(String(v))}" class="${R[r.k] === v ? "on" : ""}">${esc(l)}</button>`).join("")}</div></div>`).join("");
      zone.querySelectorAll("[data-rk]").forEach(b => b.onclick = () => {
        const r = REG.find(x => x.k === b.dataset.rk), x = r.options.find(x => String(x[0]) === b.dataset.rv);
        R[r.k] = x[0]; stock.ecrire("r_" + r.k, x[0]); rendreReglages(); diffuserSalon();
      });
      let t = null;
      zone.querySelectorAll("[data-rt]").forEach(a => a.oninput = () => {
        R[a.dataset.rt] = a.value; stock.ecrire("r_" + a.dataset.rt, a.value);
        clearTimeout(t); t = setTimeout(diffuserSalon, 800);
      });
    }

    /* ---------- Salon ---------- */
    function afficherSalon(){
      const hote = salle && salle.hote, l = salle ? salle.joueurs : [];
      $("soCodeSalle").textContent = salle ? salle.code : "····";
      const ul = $("soListe"); ul.innerHTML = "";
      l.forEach((j, i) => {
        const li = Base.el("li");
        li.append(Base.el("span", j.avatar, "av"), Base.el("span", j.pseudo + (i === 0 ? " 👑" : "") + (salle && j.id === salle.moi ? " (toi)" : ""), "n"));
        ul.appendChild(li);
      });
      $("soNb").textContent = `(${l.length}/${MAX})`;
      rendreReglages();
      $("soLancer").classList.toggle("cache", !hote);
      $("soLancer").disabled = l.length < MIN;
      $("soNoteSalon").textContent = hote
        ? (l.length < MIN ? `Il faut au moins ${MIN} joueurs : envoie le code ou le lien à tes amis !` : `${l.length} joueurs, c'est parti quand tu veux !`)
        : "⏳ L'hôte va lancer la partie…";
    }

    /* ---------- Contexte donné au jeu ---------- */
    function ctx(){
      const hote = !!(salle && salle.hote);
      return {
        V, P, R, hote, moi: salle ? salle.moi : null, esc,
        maintenant: () => Date.now() + decalage,
        envoyer,
        attente: t => attente.some(x => x.a.t === t),
        finHtml: () => hote
          ? `<div class="so-actions"><button class="btn so-gros" data-so="_rejouer">🔁 Rejouer</button><button class="btn ghost" data-so="_salon">🏠 Retour au salon</button></div>`
          : `<p class="so-note" style="text-align:center">⏳ L'hôte choisit la suite…</p>`
      };
    }

    let dernierRendu = "";
    function afficher(force){
      if(!V) return;
      const cle = JSON.stringify([V, P, attente.map(x => x.n)]);
      if(!force && cle === dernierRendu) return;
      dernierRendu = cle;
      // garde le texte et le focus des champs d'un affichage à l'autre
      const garde = {}, actif = document.activeElement;
      box.querySelectorAll("input[id],textarea[id]").forEach(e => {
        garde[e.id] = {v: e.value, f: e === actif, s: e.selectionStart, e: e.selectionEnd};
      });
      const defil = window.scrollY;
      o.rendre(box, ctx());
      Object.keys(garde).forEach(id => {
        const e = box.querySelector("#" + CSS.escape(id)); if(!e) return;
        const g = garde[id]; e.value = g.v;
        if(g.f){ e.focus({preventScroll: true}); try{ e.setSelectionRange(g.s, g.e); }catch(x){} }
      });
      window.scrollTo(0, defil);
    }
    box.addEventListener("click", e => {
      const b = e.target.closest("[data-so]");
      if(b) envoyer({t: b.dataset.so});
    });

    /* ---------- Hôte ---------- */
    function joueursPartie(){ return salle.joueurs.map(j => ({id: j.id, nom: j.pseudo, av: j.avatar})); }
    function nouvellePartie(){
      if(salle.joueurs.length < MIN){ Base.toast(`Il faut au moins ${MIN} joueurs`); return; }
      G = o.nouvelle(joueursPartie(), Object.assign({}, R)); gid++;
      ecran("soJeu"); maj();
    }
    function publier(){
      V = Object.assign(o.publique(G), {gid});
      P = o.privee ? o.privee(G, salle.moi) : null;
    }
    function diffuser(){
      if(!salle || !salle.hote || !G) return;
      const Pm = {};
      if(o.privee) salle.joueurs.slice(1).forEach(j => { const p = o.privee(G, j.id); if(p != null) Pm[j.id] = cod(JSON.stringify(p), j.id); });
      salle.envoyer({t: "etat", V: Object.assign(o.publique(G), {gid}), P: Pm, ack: dernier, h: Date.now()});
    }
    function diffuserSalon(){ if(salle && salle.hote && !G) salle.envoyer({t: "salon", R}); }
    function maj(){ publier(); diffuser(); afficher(); }
    function traiter(a, id){
      if(!a || typeof a.t !== "string") return;
      if(a.t === "_rejouer" || a.t === "_salon"){
        if(id !== salle.moi) return;
        if(a.t === "_rejouer") nouvellePartie();
        else { G = null; V = null; P = null; ecran("soSalon"); afficherSalon(); diffuserSalon(); }
        return;
      }
      if(!G) return;
      if(o.action(G, id, a)) maj();
    }
    function recuHote(m, j){
      if(m.t === "etat?"){ if(G) diffuser(); else diffuserSalon(); return; }
      if(m.t !== "act" || typeof m.n !== "number") return;
      if(m.n > (dernier[j.id] || 0)){ dernier[j.id] = m.n; traiter(m.a, j.id); }
      diffuser();                       // confirme la réception (ack)
    }

    /* ---------- Invité ---------- */
    function envoyer(a){
      if(!salle) return;
      if(salle.hote){ traiter(a, salle.moi); return; }
      const x = {n: ++seq, a, t: Date.now()};
      attente.push(x);
      salle.envoyer({t: "act", n: x.n, a});
      afficher();
    }
    function recuInvite(m){
      if(m.t === "salon"){
        Object.assign(R, m.R || {}); V = null; P = null; attente = [];
        ecran("soSalon"); afficherSalon(); return;
      }
      if(m.t === "etat" && m.V){
        if(typeof m.h === "number") decalage = m.h - Date.now();
        const nouv = !V || V.gid !== m.V.gid;
        V = m.V;
        const x = m.P && m.P[salle.moi];
        P = null; if(x){ try{ P = JSON.parse(decod(x, salle.moi)); }catch(e){} }
        const ack = (m.ack && m.ack[salle.moi]) || 0;
        attente = attente.filter(a => a.n > ack);
        if(nouv) attente = [];
        if($("soJeu").classList.contains("cache")) ecran("soJeu");
        afficher();
      }
    }
    setInterval(() => {
      if(!salle || salle.hote) return;
      const now = Date.now();
      attente.forEach(x => { if(now - x.t > 3000){ x.t = now; salle.envoyer({t: "act", n: x.n, a: x.a}); } });
    }, 1000);
    setInterval(() => { if(salle && salle.hote){ if(G) diffuser(); else diffuserSalon(); } }, 4000);

    /* ---------- Créer / rejoindre ---------- */
    function pseudoOk(){
      const p = $("soPseudo").value.trim();
      if(!p){ $("soMsg").textContent = "Choisis d'abord un pseudo."; $("soPseudo").focus(); return false; }
      Base.joueur.changerPseudo(p); return true;
    }
    $("soCreer").onclick = async () => {
      if(!pseudoOk()) return;
      $("soMsg").textContent = "Création de la salle…";
      try{
        salle = await Reseau.creer(o.jeu, {
          max: MAX,
          surEssai(t){ $("soMsg").textContent = t; },
          surArrivee(j){
            Base.toast(j.avatar + " " + j.pseudo + " a rejoint la salle");
            if(!G){ afficherSalon(); diffuserSalon(); }
            else { if(o.arrivee) o.arrivee(G, {id: j.id, nom: j.pseudo, av: j.avatar}); maj(); }
          },
          surDepart(j){
            Base.toast(j.pseudo + " est parti·e");
            if(G){ o.depart(G, j.id); maj(); } else afficherSalon();
          },
          surMessage: recuHote
        });
        G = null; V = null; ecran("soSalon"); afficherSalon();
      }catch(e){ $("soMsg").textContent = "❌ " + e.message; }
    };
    async function rejoindre(code){
      if(!pseudoOk()) return;
      $("soMsg").textContent = "Connexion à la salle " + code + "…";
      try{
        salle = await Reseau.rejoindre(o.jeu, code, {
          surMessage: recuInvite,
          surListe(){ if(!V) afficherSalon(); },
          surHotePerdu(){ Base.toast("L'hôte ne répond plus…"); },
          surFermeture(){ Base.toast("L'hôte a fermé la salle."); salle = null; V = null; ecran("soMenu"); }
        });
        V = null; ecran("soSalon"); afficherSalon();
        salle.envoyer({t: "etat?"});
      }catch(e){ $("soMsg").textContent = "❌ " + e.message; }
    }
    $("soRejoindre").onclick = () => { const c = $("soCode").value.trim().toUpperCase(); if(c) rejoindre(c); };
    $("soCode").addEventListener("keydown", e => { if(e.key === "Enter") $("soRejoindre").click(); });
    $("soTester").onclick = async () => { $("soMsg").textContent = "Test des relais…"; $("soMsg").textContent = await Reseau.tester(); };
    $("soCopier").onclick = async () => {
      if(!salle) return;
      try{ await navigator.clipboard.writeText(salle.lien); Base.toast("Lien copié ! Colle-le sur Discord 📨"); }
      catch(e){ Base.fenetre("Lien d'invitation", salle.lien); }
    };
    $("soLancer").onclick = () => { if(salle && salle.hote) nouvellePartie(); };
    const quitter = () => {
      if(salle && salle.hote && G && !confirm("Quitter ? La partie s'arrêtera pour tout le monde.")) return;
      if(salle){ salle.quitter(); salle = null; }
      G = null; V = null; P = null; attente = []; ecran("soMenu");
    };
    $("soQuitter").onclick = quitter;
    $("soQuitterJeu").onclick = quitter;

    const codeLien = Reseau.codeDansAdresse();
    if(codeLien){ $("soCode").value = codeLien; if(Base.joueur.pseudo()) rejoindre(codeLien); else $("soPseudo").focus(); }
  }

  /* petits outils pour les jeux */
  const melanger = a => Base.melanger(a);
  const hasard = a => a[Math.floor(Math.random() * a.length)];
  const propre = (s, n) => String(s == null ? "" : s).replace(/\s+/g, " ").trim().slice(0, n);
  /* podium final : J = [{id, nom, av, pts}] */
  function podium(J, moi, o){
    o = o || {};
    const l = J.slice().sort((a, b) => b.pts - a.pts);
    const med = ["🥇", "🥈", "🥉"];
    return `<ol class="so-podium">${l.map((j, i) => {
      const rang = l.findIndex(x => x.pts === j.pts);
      return `<li class="${j.id === moi ? "moi" : ""}${j.parti ? " parti" : ""}"><span class="r">${med[rang] || (rang + 1)}</span><span class="av">${esc(j.av)}</span><span class="n">${esc(j.nom)}</span><b>${j.pts} ${o.unite || (j.pts > 1 ? "pts" : "pt")}</b></li>`;
    }).join("")}</ol>`;
  }
  /* pastilles « qui a fini » */
  function pastilles(J, faits, o){
    o = o || {};
    return `<div class="so-pastilles">${J.filter(j => !j.parti && !(o.sauf || []).includes(j.id)).map(j =>
      `<span class="${faits.includes(j.id) ? "ok" : ""}" title="${esc(j.nom)}">${esc(j.av)} ${esc(j.nom)}${faits.includes(j.id) ? " ✓" : ""}</span>`).join("")}</div>`;
  }
  function confettis(){
    const fx = document.createElement("div");
    fx.style.cssText = "position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:50";
    document.body.appendChild(fx);
    const c = ["#ff4f7b", "#f2c14e", "#3aa76d", "#5b6bd0", "#e07a2e"];
    for(let i = 0; i < 70; i++){
      const p = document.createElement("i");
      p.style.cssText = `position:absolute;top:-12px;left:${Math.random() * 100}%;width:8px;height:12px;background:${c[i % c.length]};border-radius:2px;transition:transform ${1.6 + Math.random() * 1.4}s cubic-bezier(.2,.6,.4,1),opacity .4s 2.6s;opacity:1`;
      fx.appendChild(p);
      requestAnimationFrame(() => requestAnimationFrame(() => { p.style.transform = `translate(${(Math.random() - .5) * 200}px,${innerHeight + 40}px) rotate(${Math.random() * 720}deg)`; p.style.opacity = "0"; }));
    }
    setTimeout(() => fx.remove(), 3500);
  }

  window.Soiree = {demarrer, melanger, hasard, propre, podium, pastilles, confettis};
})();
