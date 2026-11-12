/* ============================================================
   CASINO COMMUN  →  window.Casino
   Outils communs des jeux crash, plinko, mines, course, roue,
   grattage, machine. Chaque jeu a SON portefeuille (comme la
   Roulette, le Blackjack et le Poker) : les jetons ne passent
   pas d'un jeu à l'autre.
   Règle des dons : ../commun/jetons.js (1 000 de bienvenue, 500 le
   lendemain sous 50). Jetons gardés sur l'appareil, et sur le compte
   (casino/<jeu>/<uid>) quand on est connecté. À inclure après base.js et
   jetons.js (+ casino.css).

   Casino.init({jeu, enJeu})  enJeu() = jetons misés pas encore réglés
   Casino.barre(el)           affiche le solde, le cadeau, la synchro
   Casino.top(el)             classement des plus riches du jeu (connectés)
   Casino.solde() · Casino.miser(n) → true/false · Casino.crediter(n)
   Casino.resultat(mise, gain) statistiques + record du jeu
   Casino.surChange(cb)       appelé quand le solde change
   Casino.choixMise(el, {valeurs, def, cle}) → {val()} sélecteur de mise
   Casino.maintenant()        heure calée sur le serveur (jeux à tours communs)
   Casino.hasard(n, sel)      nombre de 0 à 1, le même pour tout le monde
   Casino.ecouter(jeu, cb) / Casino.publier(jeu, {r, m, c, g})
                              mises des autres en direct (casinoLive/<jeu>)
   ============================================================ */
(function(){
  const BASE = "https://salle-de-jeux-249d2-default-rtdb.europe-west1.firebasedatabase.app";
  const S = Base.stock("casino_");
  const fmt = n => Number(Math.floor(n || 0)).toLocaleString("fr-FR");
  const esc = Base.esc;
  let uid = "invite", porte = null, pret = false, syncEtat = "local", attente = null, jeu = "", enJeuFn = () => 0;
  const ecouteurs = [], barres = [];
  const vide = () => ({s: 0, j: -1, b: -1, m: 0, t: 0, st: {}});
  const session = () => window.Compte && Compte.pret && Compte.session && Compte.session();

  const cle = () => "porte_" + jeu + "_" + uid;
  function charger(){ porte = Object.assign(vide(), S.lire(cle(), {})); porte.st = porte.st || {}; }
  function sauver(distant){
    Jetons.examiner(porte, enJeuFn());
    porte.t = Date.now();
    if(porte.s > porte.m) porte.m = porte.s;
    S.ecrire(cle(), porte);
    if(distant !== false) syncBientot();
    signaler();
  }
  function signaler(){ barres.forEach(dessiner); ecouteurs.forEach(f => { try{ f(porte.s); }catch(e){} }); }

  /* ---------- Synchro avec le compte ---------- */
  async function syncLire(){
    if(uid === "invite"){ pret = true; return; }
    syncEtat = "…"; signaler();
    try{
      const r = await Compte.db("casino/" + jeu + "/" + uid);
      if(r && typeof r.s === "number"){
        porte.j = Math.max(porte.j, r.j == null ? -1 : r.j);
        porte.m = Math.max(porte.m || 0, r.m || 0);
        if((r.d || 0) > (porte.t || 0) && !enJeuFn()){ porte.s = r.s; porte.t = r.d; if(typeof r.b === "number") porte.b = r.b; S.ecrire(cle(), porte); }
        else if((r.d || 0) < (porte.t || 0) || r.s !== porte.s) await syncEcrire();
      }else await syncEcrire();
      syncEtat = "ok";
    }catch(e){ syncEtat = "ko"; }
    pret = true; signaler(); verifierDon();
  }
  async function syncEcrire(){
    if(uid === "invite") return;
    const s = session();
    try{
      await Compte.db("casino/" + jeu + "/" + uid, {method: "PUT", body: {n: (s && s.pseudo || Base.joueur.pseudo() || "Joueur").slice(0, 16), s: Math.floor(porte.s), j: Math.max(0, porte.j), b: typeof porte.b === "number" ? porte.b : -1, m: Math.floor(Math.max(porte.m, porte.s)), d: {".sv": "timestamp"}}});
      syncEtat = "ok";
    }catch(e){ syncEtat = "ko"; }
    signaler();
  }
  function syncBientot(){ if(uid === "invite") return; clearTimeout(attente); attente = setTimeout(() => syncEcrire().then(() => topEls.forEach(top)), 1200); }
  function changerCompte(){
    const s = session(), nouveau = s && s.uid ? s.uid : "invite";
    if(nouveau === uid && porte) return;
    uid = nouveau; pret = uid === "invite"; charger(); signaler();
    if(uid !== "invite") syncLire(); else verifierDon();
  }

  /* ---------- Dons ---------- */
  function verifierDon(){
    if(!pret || !porte) return;
    const avant = porte.b, d = Jetons.examiner(porte, enJeuFn());
    if(!d || d.type === "attente"){ if(porte.b !== avant) sauver(); return; }
    Jetons.verser(porte, d); sauver();
    Base.toast(d.type === "bienvenue" ? `🎁 Bienvenue ! ${fmt(d.n)} jetons pour commencer.` : `🎁 +${fmt(d.n)} jetons pour te refaire. Bonne chance !`, 4000);
  }
  function texteCadeau(){
    const d = porte && Jetons.examiner({...porte}, enJeuFn());
    if(d && d.type === "attente") return `🎁 ${fmt(Jetons.RECHARGE)} jetons offerts dans ${Jetons.avantDemain()}`;
    if(d && d.type === "bienvenue") return `🎁 ${fmt(Jetons.BIENVENUE)} jetons de bienvenue…`;
    return `🎁 Sous ${fmt(Jetons.SEUIL)} jetons, ${fmt(Jetons.RECHARGE)} offerts le lendemain`;
  }

  /* ---------- Affichage du portefeuille ---------- */
  function barre(el){
    el.classList.add("b-carte", "ca-porte");
    el.innerHTML = `<div class="ca-ligne"><div class="ca-solde"><small>💰 Tes jetons</small><span>—</span></div><div class="ca-cadeau muted"></div></div><div class="ca-sync"></div><div class="ca-total"></div>`;
    if(window.CasinoTotal) CasinoTotal.bouton(el.querySelector(".ca-total"));
    barres.push(el); if(porte) dessiner(el);
  }
  function dessiner(el){
    if(!porte) return;
    el.querySelector(".ca-solde span").textContent = fmt(porte.s);
    el.querySelector(".ca-cadeau").textContent = texteCadeau();
    const sy = el.querySelector(".ca-sync"); sy.innerHTML = "";
    if(uid === "invite"){
      sy.append(window.Compte && Compte.pret ? "👤 Jetons gardés sur cet appareil. Connecte-toi pour les retrouver partout et entrer au classement." : "Jetons gardés sur cet appareil.");
      if(window.Compte && Compte.pret){ const b = Base.el("button", "Se connecter", "btn ghost petit"); b.onclick = () => Compte.ouvrir("connexion"); sy.appendChild(b); }
    }else sy.textContent = syncEtat === "ok" ? "☁️ Jetons liés à ton compte" : syncEtat === "ko" ? "⚠️ Sauvegarde en ligne indisponible (tes jetons restent sur cet appareil)" : "☁️ Synchronisation…";
  }
  const topEls = [];
  async function top(el){
    if(!topEls.includes(el)) topEls.push(el);
    if(!window.Compte || !Compte.pret){ el.classList.add("cache"); return; }
    try{
      const r = await Compte.db("casino/" + jeu, {auth: false, query: 'orderBy="s"&limitToLast=10'});
      const l = Object.entries(r || {}).map(([id, v]) => ({id, ...v})).filter(x => typeof x.s === "number").sort((a, b) => b.s - a.s);
      if(!l.length){ el.classList.add("cache"); return; }
      el.innerHTML = `<h3 style="margin:0">🏆 Les plus riches</h3><ol class="ca-top">${l.map((x, k) => `<li class="${x.id === uid ? "moi" : ""}"><span>${["🥇", "🥈", "🥉"][k] || (k + 1) + "."} ${esc(x.n)}</span><b>${fmt(x.s)}</b></li>`).join("")}</ol>`;
      el.classList.remove("cache");
    }catch(e){ el.classList.add("cache"); }
  }

  /* ---------- Mises ---------- */
  const solde = () => porte ? porte.s : 0;
  function miser(n){
    n = Math.floor(n);
    if(!porte || !(n > 0) || n > porte.s){ Base.toast(porte && porte.s < n ? "Pas assez de jetons 😢" : "Mise impossible"); return false; }
    porte.s -= n; sauver(); return true;
  }
  function crediter(n){ n = Math.floor(n); if(!porte || !(n > 0)) return; porte.s += n; sauver(); }
  function resultat(mise, gain){
    const st = porte.st[jeu] = porte.st[jeu] || {n: 0, mise: 0, gain: 0, gros: 0};
    st.n++; st.mise += mise; st.gain += gain;
    const net = gain - mise; if(net > st.gros){ st.gros = net; Base.record(jeu, net, {mieux: "haut", texte: "+" + fmt(net) + " jetons"}); }
    sauver(false); syncBientot();
  }
  const stats = () => (porte && porte.st[jeu]) || {n: 0, mise: 0, gain: 0, gros: 0};

  function choixMise(el, o){
    const cle = "mise_" + (o.cle || jeu), vals = o.valeurs || [10, 25, 50, 100, 250, 500, 1000];
    let v = S.lire(cle, o.def || vals[0]);
    el.classList.add("ca-mises");
    const rendre = () => {
      el.innerHTML = `<button class="ca-pm" data-k="-">−</button>${vals.map(x => `<button class="ca-jeton ${x === v ? "on" : ""}" data-v="${x}">${x >= 1000 ? x / 1000 + "k" : x}</button>`).join("")}<button class="ca-pm" data-k="+">+</button><span class="ca-mise">Mise : <b>${fmt(v)}</b></span>`;
      el.querySelectorAll("[data-v]").forEach(b => b.onclick = () => regler(+b.dataset.v));
      el.querySelectorAll("[data-k]").forEach(b => b.onclick = () => { const i = vals.indexOf(v); regler(b.dataset.k === "+" ? vals[Math.min(vals.length - 1, i + 1)] : vals[Math.max(0, i - 1)]); });
    };
    const regler = x => { v = x; S.ecrire(cle, v); rendre(); if(o.change) o.change(v); };
    rendre();
    return {val: () => v, regler, desactiver(d){ el.querySelectorAll("button").forEach(b => b.disabled = d); }};
  }

  /* ---------- Heure commune + hasard commun ---------- */
  let decalage = 0;
  async function caleHeure(){
    try{
      const avant = Date.now(), rep = await fetch(location.href, {method: "HEAD", cache: "no-store"}), d = Date.parse(rep.headers.get("Date"));
      if(d) decalage = d + 500 - (avant + Date.now()) / 2;
    }catch(e){}
  }
  const maintenant = () => Date.now() + decalage;
  function hasard(n, sel){
    let h = Math.imul((n ^ 0x9E3779B9) + Math.imul(sel || 0, 0x632BE5AB), 0x85EBCA6B);
    h ^= h >>> 13; h = Math.imul(h, 0xC2B2AE35); h ^= h >>> 16; h = Math.imul(h, 0x27D4EB2F); h ^= h >>> 15;
    return (h >>> 0) / 4294967296;
  }

  /* ---------- Mises des autres en direct ---------- */
  const flux = {};
  function ecouter(j, cb){
    if(!window.EventSource) return;
    let live = {};
    const ouvrir = () => {
      if(flux[j]) flux[j].close();
      const f = flux[j] = new EventSource(BASE + "/casinoLive/" + j + ".json");
      const recu = ev => {
        let x; try{ x = JSON.parse(ev.data); }catch(e){ return; }
        if(!x) return;
        const p = String(x.path || "/").split("/").filter(Boolean);
        if(!p.length){ if(ev.type === "patch") Object.assign(live, x.data); else live = x.data || {}; }
        else if(p.length === 1){ if(x.data === null) delete live[p[0]]; else live[p[0]] = ev.type === "patch" ? Object.assign(live[p[0]] || {}, x.data) : x.data; }
        else return ouvrir();
        cb(Object.entries(live).filter(([id, l]) => id !== uid && l && maintenant() - (l.d || 0) < 120000).map(([id, l]) => ({id, ...l})));
      };
      f.addEventListener("put", recu); f.addEventListener("patch", recu);
      f.onerror = () => { if(f.readyState === EventSource.CLOSED) setTimeout(() => { if(!document.hidden) ouvrir(); }, 30000); };
    };
    ouvrir();
    document.addEventListener("visibilitychange", () => { if(document.hidden){ if(flux[j]){ flux[j].close(); flux[j] = null; } } else { ouvrir(); caleHeure(); } });
  }
  function publier(j, l){
    if(uid === "invite" || document.hidden) return;
    const s = session(); if(!s) return;
    Compte.db("casinoLive/" + j + "/" + uid, {method: "PUT", body: {n: (s.pseudo || Base.joueur.pseudo() || "Joueur").slice(0, 16), a: String(Base.joueur.avatar()).slice(0, 8), r: l.r | 0, m: Math.floor(l.m || 0), c: String(l.c || "").slice(0, 24), g: Math.floor(l.g || 0), d: {".sv": "timestamp"}}}).catch(() => {});
  }

  /* ---------- Démarrage ---------- */
  function init(o){
    jeu = o.jeu; if(o.enJeu) enJeuFn = o.enJeu;
    charger(); signaler(); caleHeure();
    (function attendre(n){
      if(window.Compte){ changerCompte(); Compte.surChangement(changerCompte); topEls.forEach(top); if(uid === "invite"){ pret = true; verifierDon(); } return; }
      if(n < 60) setTimeout(() => attendre(n + 1), 100); else { pret = true; verifierDon(); }
    })(0);
    setInterval(() => { verifierDon(); signaler(); }, 30000);
  }

  window.Casino = {init, barre, top, solde, miser, crediter, resultat, stats, surChange: f => ecouteurs.push(f), choixMise,
    maintenant, hasard, ecouter, publier, fmt, verifierDon, regle: () => Jetons.regle() + " Ces jetons sont <b>propres à ce jeu</b>."};
})();
