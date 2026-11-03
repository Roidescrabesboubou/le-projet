/* ============================================================
   JEU EN LIGNE COMMUN  →  window.Reseau
   Relais MQTT publics et gratuits (aucun serveur à installer),
   les mêmes que Dessine & Devine, le Quiz, le Blind Test, etc.
   À inclure après base.js :
     <script src="../commun/reseau.js"></script>

   HÔTE (celui qui crée la salle) :
     const salle = await Reseau.creer("puissance4", {
       max: 2,                              // joueurs max, hôte compris (facultatif)
       surArrivee(j){},                     // j = {id, pseudo, avatar}
       surDepart(j){},
       surMessage(m, j){}                   // m = ce qu'un invité a envoyé
     });
     salle.code   → "KXRT1"  (à donner aux amis)
     salle.lien   → adresse à partager (…?salle=KXRT1)
   INVITÉ :
     const salle = await Reseau.rejoindre("puissance4", code, {
       surMessage(m){}, surHotePerdu(){}, surFermeture(){}
     });
   LES DEUX :
     salle.envoyer({t:"coup", col:3})       // envoyé à toute la salle
     salle.joueurs  → liste à jour (hôte d'abord)
     salle.moi      → mon identifiant
     salle.quitter()
   Reseau.codeDansAdresse() → code présent dans ?salle=… (ou "")
   Reseau.tester()          → texte : quels relais marchent sur ce réseau
   Les messages dont t commence par « _ » sont réservés au module.
   ============================================================ */
(function(){
  const BROKERS = [
    {n: "EMQX",      u: "wss://broker.emqx.io:8084/mqtt"},
    {n: "HiveMQ",    u: "wss://broker.hivemq.com:8884/mqtt"},
    {n: "Mosquitto", u: "wss://test.mosquitto.org:8081/mqtt"}
  ];
  const LIB = "https://cdn.jsdelivr.net/npm/mqtt@5.10.1/dist/mqtt.min.js";
  const LETTRES = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const uid = () => Math.random().toString(36).slice(2, 10);

  let libProm = null;
  function chargerLib(){
    if(window.mqtt) return Promise.resolve();
    if(!libProm) libProm = new Promise((ok, ko) => {
      const s = document.createElement("script");
      s.src = LIB; s.onload = ok; s.onerror = () => { libProm = null; ko(new Error("bibliothèque réseau non chargée")); };
      document.head.appendChild(s);
    });
    return libProm;
  }

  async function connecter(i){
    await chargerLib();
    return new Promise((ok, ko) => {
      const c = mqtt.connect(BROKERS[i].u, {clientId: "sj_" + uid() + uid(), clean: true, connectTimeout: 7000, reconnectPeriod: 0, keepalive: 30});
      const t = setTimeout(() => { c.end(true); ko(new Error("délai dépassé")); }, 8000);
      c.once("connect", () => { clearTimeout(t); c.options.reconnectPeriod = 2000; ok(c); });
      c.once("error", e => { clearTimeout(t); c.end(true); ko(e); });
    });
  }

  function bandeau(t){
    let b = document.querySelector(".b-bandeau");
    if(!t){ if(b) b.remove(); return; }
    if(!b){ b = document.createElement("div"); b.className = "b-bandeau"; document.body.insertBefore(b, document.body.firstChild); }
    b.textContent = t;
  }

  function moiInfos(id){
    const J = window.Base ? Base.joueur : {pseudo: () => "Joueur", avatar: () => "😀"};
    return {id, pseudo: J.pseudo() || "Joueur", avatar: J.avatar()};
  }

  /* Salle commune aux deux rôles */
  function fabriquer(client, jeu, code, hote, o){
    const sujet = "salledejeux-" + jeu + "/v1/" + code;
    const moi = uid() + uid();
    const vus = {};          // id → dernier signe de vie
    const salle = {
      code, hote, moi, ferme: false,
      lien: location.origin + location.pathname + "?salle=" + code,
      joueurs: hote ? [moiInfos(moi)] : [],
      envoyer(m){
        if(salle.ferme) return;
        try{ client.publish(sujet, JSON.stringify({...m, de: moi})); }catch(e){}
        // l'hôte reçoit aussi ses propres messages « de jeu » ? non : il les applique lui-même
      },
      quitter(){
        if(salle.ferme) return;
        salle.envoyer({t: hote ? "_fermeture" : "_depart"});
        salle.ferme = true; clearInterval(vie); bandeau("");
        setTimeout(() => client.end(true), 300);
      }
    };
    client.subscribe(sujet);
    client.on("offline", () => bandeau("⚠️ Connexion perdue… reconnexion en cours"));
    client.on("connect", () => { bandeau(""); client.subscribe(sujet); });
    client.on("message", (tp, buf) => {
      if(tp !== sujet || salle.ferme) return;
      let m; try{ m = JSON.parse(buf.toString()); }catch(e){ return; }
      if(!m || m.de === moi) return;
      vus[m.de] = Date.now();
      if(hote) recuHote(m); else recuInvite(m);
    });

    function majListe(){ salle.envoyer({t: "_liste", joueurs: salle.joueurs}); }

    function recuHote(m){
      const j = salle.joueurs.find(x => x.id === m.de);
      if(m.t === "_bonjour"){
        if(j){ salle.envoyer({t: "_bienvenue", a: m.de}); majListe(); return; }
        if(o.max && salle.joueurs.length >= o.max){ salle.envoyer({t: "_refus", a: m.de, pourquoi: "La salle est complète."}); return; }
        const nj = {id: m.de, pseudo: String(m.pseudo || "Joueur").slice(0, 16), avatar: String(m.avatar || "😀").slice(0, 4)};
        salle.joueurs.push(nj);
        salle.envoyer({t: "_bienvenue", a: m.de});
        majListe();
        o.surArrivee && o.surArrivee(nj);
        return;
      }
      if(m.t === "_depart"){ if(j) partir(j); return; }
      if(m.t === "_vie") return;
      if(!j) return;                       // message d'un inconnu : ignoré
      o.surMessage && o.surMessage(m, j);
    }
    function partir(j){
      salle.joueurs = salle.joueurs.filter(x => x.id !== j.id);
      majListe();
      o.surDepart && o.surDepart(j);
    }

    let hoteVu = Date.now(), perduSignale = false;
    function recuInvite(m){
      if(m.t === "_liste"){ salle.joueurs = m.joueurs || []; hoteVu = Date.now(); o.surListe && o.surListe(salle.joueurs); return; }
      if(m.t === "_fermeture"){ salle.ferme = true; clearInterval(vie); bandeau("La salle a été fermée par l'hôte."); o.surFermeture && o.surFermeture(); setTimeout(() => client.end(true), 300); return; }
      if(m.t === "_vie"){ if(salle.joueurs[0] && m.de === salle.joueurs[0].id) hoteVu = Date.now(); return; }
      if(m.t && m.t[0] === "_") { salle._interne && salle._interne(m); return; }
      if(salle.joueurs[0] && m.de === salle.joueurs[0].id) hoteVu = Date.now();
      o.surMessage && o.surMessage(m);
    }

    const vie = setInterval(() => {
      salle.envoyer({t: "_vie"});
      const now = Date.now();
      if(hote){
        salle.joueurs.slice(1).forEach(j => { if(now - (vus[j.id] || now) > 25000) partir(j); });
        salle.joueurs.slice(1).forEach(j => { if(!vus[j.id]) vus[j.id] = now; });
      }else if(salle.joueurs.length){
        if(now - hoteVu > 20000){
          if(!perduSignale){ perduSignale = true; bandeau("⚠️ L'hôte ne répond plus… (il a peut-être fermé la page)"); o.surHotePerdu && o.surHotePerdu(); }
        }else if(perduSignale){ perduSignale = false; bandeau(""); }
      }
    }, 5000);
    window.addEventListener("beforeunload", () => salle.quitter());
    return salle;
  }

  async function creer(jeu, o){
    o = o || {};
    for(let i = 0; i < BROKERS.length; i++){
      try{
        const c = await connecter(i);
        const code = Array.from({length: 4}, () => LETTRES[Math.floor(Math.random() * LETTRES.length)]).join("") + (i + 1);
        const salle = fabriquer(c, jeu, code, true, o);
        try{ if(window.Groupe) Groupe.salleCreee(code); }catch(e){}
        return salle;
      }catch(e){ o.surEssai && o.surEssai(`Serveur ${BROKERS[i].n} indisponible, essai suivant…`); }
    }
    throw new Error("Impossible de joindre un relais en ligne depuis ce réseau. Essaie un autre réseau (ou le partage de connexion du téléphone).");
  }

  async function rejoindre(jeu, code, o){
    o = o || {};
    code = String(code || "").trim().toUpperCase();
    const bi = parseInt(code.slice(-1)) - 1;
    if(code.length !== 5 || !BROKERS[bi]) throw new Error("Code invalide (5 caractères, par exemple KXRT1).");
    let c;
    try{ c = await connecter(bi); }catch(e){ throw new Error("Relais " + BROKERS[bi].n + " injoignable depuis ce réseau."); }
    const salle = fabriquer(c, jeu, code, false, o);
    return new Promise((ok, ko) => {
      let essais = 0, fini = false;
      salle._interne = m => {
        if(fini || m.a !== salle.moi) return;
        if(m.t === "_bienvenue"){ fini = true; clearInterval(it); ok(salle); }
        if(m.t === "_refus"){ fini = true; clearInterval(it); salle.ferme = true; c.end(true); ko(new Error(m.pourquoi || "Accès refusé.")); }
      };
      const bonjour = () => {
        if(fini) return;
        if(++essais > 10){ fini = true; clearInterval(it); salle.ferme = true; c.end(true); ko(new Error("Aucune salle avec ce code (ou l'hôte a fermé la page).")); return; }
        const me = moiInfos(salle.moi);
        salle.envoyer({t: "_bonjour", pseudo: me.pseudo, avatar: me.avatar});
      };
      const it = setInterval(bonjour, 2000); bonjour();
    });
  }

  async function tester(){
    const res = [];
    for(let i = 0; i < BROKERS.length; i++){
      try{
        const c = await connecter(i), tp = "salledejeux-test/" + uid();
        const ok = await new Promise(r => { const t = setTimeout(() => r(false), 5000); c.subscribe(tp, () => c.publish(tp, "ping")); c.on("message", () => { clearTimeout(t); r(true); }); });
        c.end(true); res.push(BROKERS[i].n + (ok ? " ✅" : " ⚠️"));
      }catch(e){ res.push(BROKERS[i].n + " ❌"); }
    }
    return "Relais : " + res.join(" · ") + (res.some(r => r.includes("✅")) ? " — le jeu en ligne fonctionne sur ce réseau." : " — ce réseau bloque le jeu en ligne.");
  }

  const codeDansAdresse = () => (new URLSearchParams(location.search).get("salle") || "").toUpperCase();

  window.Reseau = {creer, rejoindre, tester, codeDansAdresse, BROKERS};
})();
