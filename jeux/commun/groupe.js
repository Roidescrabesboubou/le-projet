/* ============================================================
   AMIS ET GROUPE  →  window.Groupe
   Chargé sur toutes les pages (garde.js le charge dans les jeux,
   l'accueil et les réglages l'incluent directement).
   Nécessite un compte (compte.js) et les règles Firebase
   « profils / amis / demandes / groupes / invitations ».

   - Amis : demande par pseudo, acceptation, présence en ligne
     et jeu en cours de chaque ami.
   - Groupe : on invite ses amis une fois ; dès qu'un membre crée
     une salle dans un jeu multijoueur, les autres membres sont
     emmenés dans cette salle (?salle=CODE&groupe=1).
   Pour un jeu en ligne : appeler Groupe.salleCreee(code) quand
   l'hôte ouvre sa salle (reseau.js le fait tout seul).
   ============================================================ */
(function(){
  if(window.Groupe) return;
  const src = (document.currentScript && document.currentScript.src) || "";
  const RACINE = src.replace(/jeux\/commun\/groupe\.js.*$/, "");
  const MAX = 12, EN_LIGNE = 150000, LANCEMENT_VALIDE = 10 * 60000;

  const L = (k, d) => { try{ const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); }catch(e){ return d; } };
  const E = (k, v) => { try{ v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); }catch(e){} };
  const el = (tag, txt, cls) => { const e = document.createElement(tag); if(txt != null) e.textContent = txt; if(cls) e.className = cls; return e; };
  const SV = {".sv": "timestamp"};
  const slugPage = decodeURIComponent((location.pathname.match(/\/jeux\/([^/]+)\//) || [])[1] || "");
  const params = new URLSearchParams(location.search);

  /* ---------- État ---------- */
  let moi = null, gid = null, G = null, invits = {}, demandes = {}, amis = {}, profils = {};
  let flux = [], erreur = "", onglet = "groupe", ouvert = false, minuterie = null, vuFluxGroupe = false;

  const catalogue = () => window.SALLE_CATALOGUE || [];
  const titreDe = s => { const g = catalogue().find(x => x.slug === s); return g ? g.title : s; };
  const emojiDe = s => { const g = catalogue().find(x => x.slug === s); return g ? g.emoji || "🎮" : "🎮"; };
  const lieu = () => slugPage ? titreDe(slugPage) : (/\/reglages\/?$/.test(location.pathname) ? "Réglages" : "Accueil");
  const avatar = () => (window.Base && Base.joueur && Base.joueur.avatar()) || L("salle_avatar", "") || "😀";
  const pseudo = () => (moi && moi.pseudo) || L("salle_pseudo", "") || "Joueur";
  const enLigne = p => !!(p && p.vu && Date.now() - p.vu < EN_LIGNE);
  const jeuxMulti = () => catalogue().filter(g => (g.tags || []).includes("Multijoueur") && !g.sansPage && g.etat !== "cache" && g.etat !== "bientot");
  const estChef = () => !!(G && moi && G.chef === moi.uid);
  const membres = () => Object.entries((G && G.membres) || {}).map(([uid, m]) => ({uid, ...m}))
    .sort((a, b) => (b.uid === (G && G.chef)) - (a.uid === (G && G.chef)) || String(a.pseudo).localeCompare(String(b.pseudo)));
  const idAleatoire = () => { const a = new Uint8Array(20), c = "abcdefghijklmnopqrstuvwxyz0123456789"; crypto.getRandomValues(a); return Array.from(a, x => c[x % 36]).join(""); };

  function charger(url, test){
    return new Promise(ok => { if(test()) return ok(); const s = document.createElement("script"); s.src = url; s.onload = ok; s.onerror = ok; document.head.appendChild(s); });
  }

  /* ---------- Accès base ---------- */
  async function db(chemin, opts){
    try{ return await Compte.db(chemin, opts); }
    catch(e){
      if(/Accès refusé/.test(e.message) && !gid) erreur = "regles";
      throw e;
    }
  }
  const maj = corps => db("", {method: "PATCH", body: corps});

  /* Flux en direct (Firebase REST streaming) : surDonnees(objet complet) à chaque changement */
  function appliquer(racine, chemin, d){
    const parts = chemin.split("/").filter(Boolean);
    if(!parts.length) return d;
    racine = racine && typeof racine === "object" ? {...racine} : {};
    let o = racine;
    for(let i = 0; i < parts.length - 1; i++){ o[parts[i]] = o[parts[i]] && typeof o[parts[i]] === "object" ? {...o[parts[i]]} : {}; o = o[parts[i]]; }
    const k = parts[parts.length - 1];
    if(d === null) delete o[k]; else o[k] = d;
    return racine;
  }
  function ecouter(chemin, surDonnees){
    let es = null, arret = false, donnees = null, renouv = null, essais = 0;
    async function ouvrir(){
      if(arret || !moi) return;
      let t; try{ t = await Compte.jeton(); }catch(e){ return; }
      if(arret) return;
      es = new EventSource(`${Compte.DB}/${chemin}.json?auth=${encodeURIComponent(t)}`);
      es.addEventListener("put", e => { essais = 0; const m = JSON.parse(e.data); donnees = appliquer(donnees, m.path, m.data); surDonnees(donnees); });
      es.addEventListener("patch", e => { essais = 0; const m = JSON.parse(e.data); for(const [k, v] of Object.entries(m.data || {})) donnees = appliquer(donnees, m.path.replace(/\/$/, "") + "/" + k, v); surDonnees(donnees); });
      const relancer = ms => { if(es) es.close(); es = null; if(!arret) setTimeout(ouvrir, ms); };
      es.addEventListener("auth_revoked", () => relancer(300));
      es.addEventListener("cancel", () => relancer(15000));
      es.onerror = () => { if(++essais > 4) relancer(10000); };
      clearTimeout(renouv); renouv = setTimeout(() => relancer(0), 45 * 60000);   // jeton valable 1 h
    }
    ouvrir();
    const f = {fermer(){ arret = true; clearTimeout(renouv); if(es) es.close(); }, chemin};
    flux.push(f);
    return f;
  }
  function arreterFlux(filtre){
    flux = flux.filter(f => { if(!filtre || filtre(f.chemin)){ f.fermer(); return false; } return true; });
  }

  /* ---------- Démarrage ---------- */
  let session = 0;
  async function relancer(){
    const n = ++session;
    arreterFlux(); moi = Compte.session(); gid = null; G = null; invits = {}; demandes = {}; amis = {}; erreur = ""; vuFluxGroupe = false;
    dessiner();
    if(!moi || !Compte.pret) return;
    try{
      const p = await db(`profils/${moi.uid}`);
      if(n !== session) return;
      gid = (p && p.groupe) || null;
    }catch(e){ if(n === session){ erreur = "regles"; dessiner(); } return; }
    await presence();
    if(n !== session) return;
    const nouveaux = (avant, apres, quoi) => Object.keys(apres || {}).filter(k => !(avant || {})[k]).forEach(k => notifier(quoi, k, apres[k]));
    let premierI = true, premierD = true;
    ecouter(`invitations/${moi.uid}`, d => { const av = invits; invits = d || {}; if(!premierI) nouveaux(av, invits, "invit"); else Object.keys(invits).forEach(k => notifier("invit", k, invits[k], true)); premierI = false; dessiner(); });
    ecouter(`demandes/${moi.uid}`, d => { const av = demandes; demandes = d || {}; if(!premierD) nouveaux(av, demandes, "demande"); premierD = false; dessiner(); });
    ecouter(`amis/${moi.uid}`, d => { amis = d || {}; chargerAmis(); });
    if(gid) suivreGroupe();
  }

  function suivreGroupe(){
    arreterFlux(c => c.startsWith("groupes/"));
    vuFluxGroupe = false;
    const g = gid;
    ecouter(`groupes/${g}`, d => {
      if(g !== gid) return;
      const avant = G; G = d;
      if(!d || !d.membres || !d.membres[moi.uid]){
        if(vuFluxGroupe || avant) toast(d ? "Tu ne fais plus partie du groupe." : "Le groupe a été dissous.");
        quitterLocal(); return;
      }
      vuFluxGroupe = true;
      verifierLancement();
      dessiner();
    });
  }

  async function presence(){
    if(!moi) return;
    try{
      await db(`profils/${moi.uid}`, {method: "PATCH", body: {pseudo: pseudo().slice(0, 16), avatar: avatar(), vu: SV, ou: lieu().slice(0, 40), groupe: gid || null}});
      if(erreur === "regles") erreur = "";
    }catch(e){}
    if(gid){
      try{ await db(`groupes/${gid}/membres/${moi.uid}`, {method: "PATCH", body: {pseudo: pseudo().slice(0, 16), avatar: avatar(), vu: SV, ou: lieu().slice(0, 40)}}); }
      catch(e){ if(/Accès refusé/.test(e.message)) quitterLocal(); }
    }
  }
  setInterval(() => { if(moi && document.visibilityState === "visible") presence(); }, 45000);
  document.addEventListener("visibilitychange", () => { if(moi && document.visibilityState === "visible") presence(); });

  /* ---------- Amis ---------- */
  async function chargerAmis(){
    if(!moi) return;
    try{
      const ids = Object.keys(amis);
      const res = await Promise.all(ids.map(u => db(`profils/${u}`).catch(() => null)));
      ids.forEach((u, i) => { profils[u] = res[i] || profils[u] || {pseudo: "?"}; });
    }catch(e){}
    dessiner();
  }
  async function demander(p){
    p = String(p || "").trim();
    if(!p) return "Écris le pseudo de ton ami.";
    const cle = Compte.cleDePseudo(p);
    let uid = null;
    try{ uid = await db(`pseudos/${cle}`, {auth: false}); }catch(e){ return "Recherche impossible pour le moment."; }
    if(!uid) return `Aucun joueur nommé « ${p} ».`;
    if(uid === moi.uid) return "C'est toi ! 😄";
    if(amis[uid]) return "Vous êtes déjà amis.";
    if(demandes[uid]){ await accepter(uid); return "✅ Vous êtes maintenant amis !"; }
    try{
      await db(`demandes/${uid}/${moi.uid}`, {method: "PUT", body: {pseudo: pseudo().slice(0, 16), d: SV}});
      popup("👋", "Demande envoyée !", `${p} recevra ta demande d'ami dès qu'il sera sur le site.`);
      return "✅ Demande envoyée !";
    }
    catch(e){ return "❌ " + e.message; }
  }
  async function accepter(u){
    const qui = (demandes[u] && demandes[u].pseudo) || (profils[u] && profils[u].pseudo) || "ton ami";
    await maj({[`amis/${moi.uid}/${u}`]: true, [`amis/${u}/${moi.uid}`]: true, [`demandes/${moi.uid}/${u}`]: null});
    delete demandes[u];
    popup("🤝", "Vous êtes maintenant amis !", `Tu peux inviter ${qui} dans ton groupe.`);
    chargerAmis();
  }
  async function refuser(u){ await db(`demandes/${moi.uid}/${u}`, {method: "DELETE"}); delete demandes[u]; dessiner(); }
  async function retirer(u){
    await maj({[`amis/${moi.uid}/${u}`]: null, [`amis/${u}/${moi.uid}`]: null});
    delete amis[u]; dessiner();
  }

  /* ---------- Groupe ---------- */
  const moiMembre = () => ({pseudo: pseudo().slice(0, 16), avatar: avatar(), vu: SV, ou: lieu().slice(0, 40)});
  async function creer(){
    if(gid) await quitter(true);
    const g = idAleatoire();
    await db(`groupes/${g}`, {method: "PUT", body: {chef: moi.uid, cree: SV, membres: {[moi.uid]: moiMembre()}}});
    gid = g; await presence(); suivreGroupe();
    return g;
  }
  async function rejoindre(g){
    if(gid === g) return;
    if(gid) await quitter(true);
    try{
      await maj({[`groupes/${g}/membres/${moi.uid}`]: moiMembre(), [`invitations/${moi.uid}/${g}`]: null});
    }catch(e){
      await db(`invitations/${moi.uid}/${g}`, {method: "DELETE"}).catch(() => {});
      toast("Ce groupe n'existe plus."); return;
    }
    delete invits[g];
    gid = g; await presence(); suivreGroupe();
    toast("🎉 Tu as rejoint le groupe !");
  }
  async function quitter(silence){
    if(!gid) return;
    const autres = membres().filter(m => m.uid !== moi.uid);
    try{
      if(!autres.length) await db(`groupes/${gid}`, {method: "DELETE"});
      else if(estChef()){
        const nouveau = autres.find(m => enLigne(m)) || autres[0];
        await maj({[`groupes/${gid}/chef`]: nouveau.uid, [`groupes/${gid}/membres/${moi.uid}`]: null});
      }else await db(`groupes/${gid}/membres/${moi.uid}`, {method: "DELETE"});
    }catch(e){}
    quitterLocal();
    presence();
    if(!silence) toast("Tu as quitté le groupe.");
  }
  function quitterLocal(){ arreterFlux(c => c.startsWith("groupes/")); gid = null; G = null; dessiner(); }
  async function exclure(u){ if(estChef()) await db(`groupes/${gid}/membres/${u}`, {method: "DELETE"}); }
  async function nommerChef(u){ if(estChef()) await db(`groupes/${gid}/chef`, {method: "PUT", body: u}); }
  async function inviter(u){
    if(!gid) await creer();
    if(membres().length >= MAX) return toast(`Le groupe est complet (${MAX} max).`);
    await db(`invitations/${u}/${gid}`, {method: "PUT", body: {de: moi.uid, pseudo: pseudo().slice(0, 16), d: SV}});
    popup("📨", "Invitation envoyée !", `${(profils[u] && profils[u].pseudo) || "Ton ami"} va recevoir ton invitation à rejoindre le groupe.`);
  }
  async function refuserInvit(g){ await db(`invitations/${moi.uid}/${g}`, {method: "DELETE"}).catch(() => {}); delete invits[g]; dessiner(); }

  /* Un membre a ouvert une salle : tout le groupe y est invité */
  async function salleCreee(code, slug){
    slug = slug || slugPage;
    if(!moi || !gid || !code || !slug) return false;
    E("salle_groupe_vu", String(code).toUpperCase());
    try{
      await db(`groupes/${gid}/jeu`, {method: "PUT", body: {slug, code: String(code).toUpperCase(), par: moi.uid, pseudo: pseudo().slice(0, 16), d: SV}});
      toast(`📣 Le groupe est invité dans ta salle (${membres().length - 1} ami${membres().length > 2 ? "s" : ""}) !`);
      return true;
    }catch(e){ return false; }
  }
  const urlSalle = j => `${RACINE}jeux/${encodeURIComponent(j.slug)}/?salle=${encodeURIComponent(j.code)}&groupe=1`;
  function verifierLancement(){
    const j = G && G.jeu;
    if(!j || !j.code || j.par === moi.uid) return;
    if(L("salle_groupe_vu", "") === j.code) return;
    if(Math.abs(Date.now() - (j.d || 0)) > LANCEMENT_VALIDE) return;
    if(slugPage === j.slug && (params.get("salle") || "").toUpperCase() === j.code){ E("salle_groupe_vu", j.code); return; }
    proposerLancement(j);
  }
  function allerA(j){
    E("salle_groupe_vu", j.code);
    if(moi && moi.pseudo && !L("salle_pseudo", "")) E("salle_pseudo", moi.pseudo);
    location.href = urlSalle(j);
  }

  /* ---------- Arrivée par une salle du groupe (?salle=CODE&groupe=1) ---------- */
  function autoRejoindre(){
    const code = (params.get("salle") || "").toUpperCase();
    if(!code || params.get("groupe") !== "1") return;
    E("salle_groupe_vu", code);
    const ps = (moi && moi.pseudo) || L("salle_pseudo", "");
    const $ = id => document.getElementById(id);
    const remplir = id => { const i = $(id); if(i && !i.value.trim() && ps){ i.value = ps; i.dispatchEvent(new Event("input", {bubbles: true})); return true; } return false; };
    const go = () => {
      if($("roomCode") && $("p1")){                                  // Les Quintuplées
        if(remplir("p1") && $("btnJoin")) $("btnJoin").click();
        return;
      }
      if($("btnJoin") && $("codeIn")){                               // jeux avec leur propre réseau
        if($("mNet") && $("netBox") && $("netBox").classList.contains("hidden")) $("mNet").click();
        remplir("nameIn"); remplir("netName");
        $("codeIn").value = code;
        $("btnJoin").click();
        return;
      }
      if($("pseudo") && remplir("pseudo") && $("rejoindre")) $("rejoindre").click();   // jeux sur reseau.js
    };
    if(document.readyState === "complete") setTimeout(go, 400); else window.addEventListener("load", () => setTimeout(go, 400));
  }

  /* ---------- Interface ---------- */
  const css = el("style");
  css.textContent = `
.gr-btn{position:fixed;left:14px;bottom:14px;z-index:9000;display:flex;align-items:center;gap:4px;height:44px;min-width:44px;padding:0 12px;border-radius:999px;border:1px solid var(--line,#ecdfd2);background:var(--card,#fff);color:var(--text,#22192b);font:800 1rem Nunito,system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.18);cursor:pointer}
.gr-btn:hover{transform:translateY(-2px)}
.gr-btn .gr-pastille{position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;border-radius:10px;background:#e8607a;color:#fff;font-size:.75rem;display:flex;align-items:center;justify-content:center;padding:0 5px}
.gr-panneau{position:fixed;left:14px;bottom:68px;z-index:9001;width:min(370px,calc(100vw - 28px));max-height:min(72vh,620px);overflow:auto;background:var(--card,#fff);color:var(--text,#22192b);border:1px solid var(--line,#ecdfd2);border-radius:18px;box-shadow:0 16px 40px rgba(0,0,0,.25);font:400 .95rem Nunito,system-ui,sans-serif;padding:14px}
.gr-panneau h3{font:700 1.05rem Fredoka,Nunito,sans-serif;margin:12px 0 6px}
.gr-panneau p{margin:6px 0}
.gr-tete{display:flex;gap:6px;align-items:center;margin-bottom:6px}
.gr-tete .gr-x{margin-left:auto;border:0;background:transparent;font-size:1.3rem;color:var(--muted,#776c80);cursor:pointer}
.gr-onglet{flex:1;border:1px solid var(--line,#ecdfd2);background:var(--bg,#fbf6ef);color:inherit;border-radius:10px;padding:7px;font-weight:800;cursor:pointer;position:relative}
.gr-onglet.on{background:var(--text,#22192b);color:var(--bg,#fff);border-color:var(--text,#22192b)}
.gr-onglet .gr-pastille{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;border-radius:9px;background:#e8607a;color:#fff;font-size:.7rem;display:flex;align-items:center;justify-content:center}
.gr-liste{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.gr-liste li{display:flex;align-items:center;gap:8px;background:var(--bg,#fbf6ef);border:1px solid var(--line,#ecdfd2);border-radius:12px;padding:7px 9px}
.gr-av{font-size:1.4rem;position:relative;flex:none}
.gr-av i{position:absolute;right:-2px;bottom:0;width:10px;height:10px;border-radius:50%;background:#aaa;border:2px solid var(--card,#fff)}
.gr-av i.on{background:#3aa76d}
.gr-qui{flex:1;min-width:0}
.gr-qui b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gr-qui small{color:var(--muted,#776c80);display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gr-b{border:0;border-radius:10px;padding:7px 12px;font-weight:800;background:#e86a92;color:#fff;cursor:pointer;font-size:.85rem;white-space:nowrap}
.gr-b.gris{background:transparent;border:1px solid var(--line,#ecdfd2);color:var(--text,#22192b)}
.gr-b.mini{padding:4px 8px;font-size:.8rem}
.gr-b:disabled{opacity:.5;cursor:default}
.gr-ligne{display:flex;gap:6px;margin:6px 0}
.gr-ligne input{flex:1;min-width:0;border:1px solid var(--line,#ecdfd2);background:var(--bg,#fbf6ef);color:inherit;border-radius:10px;padding:8px 10px;font:inherit}
.gr-note{font-size:.84rem;color:var(--muted,#776c80)}
.gr-msg{font-size:.88rem;font-weight:700;min-height:1.2em}
.gr-jeux{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:6px}
.gr-jeux a{display:flex;flex-direction:column;align-items:center;gap:2px;text-align:center;text-decoration:none;color:inherit;background:var(--bg,#fbf6ef);border:1px solid var(--line,#ecdfd2);border-radius:12px;padding:8px 4px;font-weight:700;font-size:.8rem}
.gr-jeux a span{font-size:1.4rem}
.gr-encours{background:linear-gradient(135deg,#ffefc2,#ffd6e2);color:#22192b;border-radius:12px;padding:10px;display:flex;align-items:center;gap:8px;margin:8px 0}
.gr-notifs{position:fixed;top:12px;right:12px;z-index:9002;display:flex;flex-direction:column;gap:8px;width:min(340px,calc(100vw - 24px))}
.gr-notif{background:var(--card,#fff);color:var(--text,#22192b);border:2px solid #e86a92;border-radius:14px;padding:12px;box-shadow:0 10px 30px rgba(0,0,0,.22);font:400 .95rem Nunito,system-ui,sans-serif;animation:grEntre .25s ease-out}
.gr-notif b{display:block;margin-bottom:8px}
.gr-notif .gr-ligne{margin:0}
@keyframes grEntre{from{transform:translateY(-12px);opacity:0}}
.gr-pop{position:fixed;inset:0;z-index:9004;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.25);animation:grFondu .2s ease-out}
.gr-pop.sort{opacity:0;transition:opacity .2s}
.gr-pop-boite{background:var(--card,#fff);color:var(--text,#22192b);border-radius:20px;padding:22px 24px 18px;width:min(320px,86vw);text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.3);font:400 .95rem Nunito,system-ui,sans-serif;animation:grPop .35s cubic-bezier(.2,1.4,.4,1)}
.gr-pop-ic{font-size:2.6rem;line-height:1;margin-bottom:6px}
.gr-pop-boite b{display:block;font:700 1.2rem Fredoka,Nunito,sans-serif}
.gr-pop-boite p{margin:6px 0 14px;color:var(--muted,#776c80)}
.gr-pop-boite .gr-b{padding:8px 26px}
@keyframes grPop{from{transform:scale(.6);opacity:0}}
@keyframes grFondu{from{opacity:0}}
.gr-toast{position:fixed;left:50%;bottom:70px;transform:translateX(-50%);z-index:9003;background:#22192b;color:#fff;padding:9px 16px;border-radius:12px;font:700 .9rem Nunito,system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25);max-width:90vw;text-align:center}
@media print{.gr-btn,.gr-panneau,.gr-notifs{display:none}}`;
  document.head.appendChild(css);

  let bouton, panneau, notifs;
  function installerUI(){
    bouton = el("button", null, "gr-btn"); bouton.title = "Amis et groupe";
    bouton.onclick = () => { ouvert ? fermer() : ouvrir(); };
    panneau = el("div", null, "gr-panneau"); panneau.hidden = true;
    notifs = el("div", null, "gr-notifs");
    document.body.append(bouton, panneau, notifs);
    document.addEventListener("keydown", e => { if(e.key === "Escape" && ouvert) fermer(); });
    document.addEventListener("mousedown", e => { if(ouvert && !panneau.contains(e.target) && !bouton.contains(e.target) && !notifs.contains(e.target) && !e.target.closest(".gr-pop")) fermer(); });
  }
  function ouvrir(o){
    if(o) onglet = o;
    ouvert = true; panneau.hidden = false; dessiner();
    if(moi) chargerAmis();
    clearInterval(minuterie); minuterie = setInterval(() => { if(ouvert && moi) chargerAmis(); }, 30000);
  }
  function fermer(){ ouvert = false; if(panneau) panneau.hidden = true; clearInterval(minuterie); }

  /* Petit pop-up de confirmation au centre de l'écran (se ferme tout seul) */
  function popup(icone, titre, texte){
    document.querySelectorAll(".gr-pop").forEach(n => n.remove());
    const fond = el("div", null, "gr-pop");
    const b = el("div", null, "gr-pop-boite");
    b.append(el("div", icone, "gr-pop-ic"), el("b", titre), el("p", texte || ""));
    const ok = el("button", "OK", "gr-b"); b.appendChild(ok);
    fond.appendChild(b); document.body.appendChild(fond);
    const fermerPop = () => { fond.classList.add("sort"); setTimeout(() => fond.remove(), 200); };
    ok.onclick = fermerPop;
    fond.addEventListener("mousedown", e => { if(e.target === fond) fermerPop(); });
    setTimeout(() => { if(fond.isConnected) fermerPop(); }, 3500);
  }

  function toast(t){
    document.querySelectorAll(".gr-toast").forEach(n => n.remove());
    const n = el("div", t, "gr-toast"); document.body.appendChild(n);
    setTimeout(() => n.remove(), 3200);
  }

  function carte(titre, boutons, cle){
    if(!notifs) return null;
    if(cle && notifs.querySelector(`[data-cle="${CSS.escape(cle)}"]`)) return null;
    const c = el("div", null, "gr-notif"); if(cle) c.dataset.cle = cle;
    c.appendChild(el("b", titre));
    const l = el("div", null, "gr-ligne");
    boutons.forEach(([t, f, gris]) => { const b = el("button", t, "gr-b" + (gris ? " gris" : "")); b.onclick = async () => { c.remove(); try{ await f(); }catch(e){ toast("❌ " + e.message); } }; l.appendChild(b); });
    c.appendChild(l); notifs.appendChild(c);
    return c;
  }
  function notifier(quoi, id, d, silencieux){
    if(quoi === "invit"){
      if(id === gid) return;
      carte(`🎉 ${d.pseudo || "Un ami"} t'invite dans son groupe !`, [["Rejoindre", () => rejoindre(id)], ["Refuser", () => refuserInvit(id), true]], "i-" + id);
    }
    if(quoi === "demande"){
      if(silencieux) return;
      carte(`👋 ${d.pseudo || "Quelqu'un"} veut être ton ami`, [["Accepter", () => accepter(id)], ["Refuser", () => refuser(id), true]], "d-" + id);
    }
  }
  function proposerLancement(j){
    const cle = "j-" + j.code;
    if(notifs.querySelector(`[data-cle="${CSS.escape(cle)}"]`)) return;
    notifs.querySelectorAll('[data-cle^="j-"]').forEach(n => n.remove());
    let n = 8;
    const c = carte(`${emojiDe(j.slug)} ${j.pseudo || "Un membre"} lance ${titreDe(j.slug)} pour le groupe !`,
      [["Rejoindre", () => allerA(j)], ["Pas cette fois", () => { E("salle_groupe_vu", j.code); clearInterval(t); }, true]], cle);
    if(!c) return;
    const info = el("small", null, "gr-note"); c.insertBefore(info, c.lastChild);
    const t = setInterval(() => {
      if(!c.isConnected) return clearInterval(t);
      info.textContent = `Départ automatique dans ${n} s…`;
      if(n-- <= 0){ clearInterval(t); c.remove(); allerA(j); }
    }, 1000);
    info.textContent = `Départ automatique dans ${n + 1} s…`;
  }

  function dessiner(){
    if(!bouton) return;
    const attente = Object.keys(invits).filter(g => g !== gid).length + Object.keys(demandes).length;
    bouton.innerHTML = "";
    bouton.append(document.createTextNode(G ? `👥 ${membres().length}` : "👥"));
    if(attente) bouton.appendChild(el("span", String(attente), "gr-pastille"));
    if(!ouvert) return;
    panneau.innerHTML = "";
    const tete = el("div", null, "gr-tete");
    [["groupe", "👥 Groupe", Object.keys(invits).filter(g => g !== gid).length], ["amis", "🤝 Amis", Object.keys(demandes).length]].forEach(([k, t, nb]) => {
      const b = el("button", t, "gr-onglet" + (k === onglet ? " on" : "")); b.onclick = () => { onglet = k; dessiner(); };
      if(nb) b.appendChild(el("span", String(nb), "gr-pastille"));
      tete.appendChild(b);
    });
    const x = el("button", "×", "gr-x"); x.onclick = fermer; x.setAttribute("aria-label", "Fermer");
    tete.appendChild(x); panneau.appendChild(tete);

    if(!Compte.pret){ panneau.appendChild(el("p", "Les comptes ne sont pas encore activés sur ce site.", "gr-note")); return; }
    if(!moi){
      panneau.appendChild(el("p", "Connecte-toi pour ajouter des amis et créer un groupe qui vous suit de jeu en jeu."));
      const b = el("button", "👤 Se connecter", "gr-b"); b.onclick = () => { fermer(); Compte.ouvrir("connexion"); };
      panneau.appendChild(b); return;
    }
    if(erreur === "regles"){
      panneau.appendChild(el("p", "⚠️ Les amis et les groupes ne sont pas encore activés : un admin doit mettre à jour les règles Firebase (fichier firebase-regles.json)."));
      return;
    }
    onglet === "amis" ? vueAmis() : vueGroupe();
  }

  function ligneJoueur(av, nom, sous, online, actions){
    const li = el("li");
    const a = el("span", av || "😀", "gr-av"); const i = el("i"); if(online) i.className = "on"; a.appendChild(i);
    const q = el("div", null, "gr-qui"); q.append(el("b", nom), el("small", sous));
    li.append(a, q, ...actions.filter(Boolean));
    return li;
  }
  const bt = (t, f, cls) => { const b = el("button", t, "gr-b " + (cls || "")); b.onclick = async () => { b.disabled = true; try{ await f(); }catch(e){ toast("❌ " + e.message); } b.disabled = false; }; return b; };
  const statut = p => !p ? "" : enLigne(p) ? "En ligne · " + (p.ou || "sur le site") : "Hors ligne";

  function vueGroupe(){
    const P = panneau;
    const inv = Object.entries(invits).filter(([g]) => g !== gid);
    if(inv.length){
      P.appendChild(el("h3", "📨 Invitations"));
      const ul = el("ul", null, "gr-liste");
      inv.forEach(([g, d]) => ul.appendChild(ligneJoueur("🎉", d.pseudo || "Un ami", "t'invite dans son groupe", false, [bt("Rejoindre", () => rejoindre(g)), bt("✕", () => refuserInvit(g), "gris mini")])));
      P.appendChild(ul);
    }
    if(!G){
      P.appendChild(el("h3", "Pas encore de groupe"));
      P.appendChild(el("p", "Crée un groupe et invite tes amis une seule fois : quand l'un de vous ouvre une salle dans un jeu multijoueur, tout le groupe y est emmené automatiquement.", "gr-note"));
      P.appendChild(bt("➕ Créer un groupe", async () => { await creer(); onglet = "groupe"; dessiner(); }));
      return;
    }
    const j = G.jeu;
    if(j && j.code && Math.abs(Date.now() - (j.d || 0)) < 3 * 3600000){
      const b = el("div", null, "gr-encours");
      b.append(el("span", emojiDe(j.slug)), el("span", `Dernière salle : ${titreDe(j.slug)}, lancée par ${j.par === moi.uid ? "toi" : j.pseudo}`));
      b.firstChild.style.fontSize = "1.4rem"; b.lastChild.style.flex = "1";
      if(!(slugPage === j.slug && (params.get("salle") || "").toUpperCase() === j.code) && j.par !== moi.uid) b.appendChild(bt("Y aller", () => allerA(j), "mini"));
      P.appendChild(b);
    }
    const ms = membres();
    P.appendChild(el("h3", `👥 Mon groupe (${ms.length}/${MAX})`));
    const ul = el("ul", null, "gr-liste");
    ms.forEach(m => {
      const chef = m.uid === G.chef, c = m.uid === moi.uid;
      const actions = [];
      if(estChef() && !c){ actions.push(bt("👑", () => nommerChef(m.uid), "gris mini")); actions.push(bt("✕", () => exclure(m.uid), "gris mini")); }
      ul.appendChild(ligneJoueur(m.avatar, (chef ? "👑 " : "") + m.pseudo + (c ? " (toi)" : ""), c ? "Ici · " + lieu() : statut(m), c || enLigne(m), actions));
    });
    P.appendChild(ul);
    if(estChef()) P.appendChild(el("p", "👑 = donner le rôle de chef · ✕ = retirer du groupe", "gr-note"));

    const aInviter = Object.keys(amis).filter(u => !(G.membres || {})[u]);
    P.appendChild(el("h3", "📨 Inviter des amis"));
    if(!Object.keys(amis).length){
      const p = el("p", "Tu n'as pas encore d'amis sur le site. ", "gr-note");
      const a = el("a", "Ajoute-en dans l'onglet Amis."); a.href = "#"; a.onclick = e => { e.preventDefault(); onglet = "amis"; dessiner(); };
      p.appendChild(a); P.appendChild(p);
    }else if(!aInviter.length) P.appendChild(el("p", "Tous tes amis sont déjà dans le groupe 🎉", "gr-note"));
    else{
      const ul2 = el("ul", null, "gr-liste");
      aInviter.sort((a, b) => enLigne(profils[b]) - enLigne(profils[a])).forEach(u => {
        const p = profils[u] || {};
        ul2.appendChild(ligneJoueur(p.avatar, p.pseudo || "?", statut(p), enLigne(p), [bt("Inviter", () => inviter(u), "mini")]));
      });
      P.appendChild(ul2);
    }

    P.appendChild(el("h3", "🎮 Jouer ensemble"));
    P.appendChild(el("p", "Va dans un jeu et crée une salle en ligne : tout le groupe y sera invité automatiquement.", "gr-note"));
    const grille = el("div", null, "gr-jeux");
    jeuxMulti().forEach(g => {
      const a = el("a"); a.href = `${RACINE}jeux/${g.slug}/?groupe=hote`;
      a.append(el("span", g.emoji || "🎮"), document.createTextNode(g.title));
      grille.appendChild(a);
    });
    P.appendChild(grille);
    const q = el("div", null, "gr-ligne"); q.style.marginTop = "12px";
    q.appendChild(bt("🚪 Quitter le groupe", () => quitter(), "gris"));
    P.appendChild(q);
  }

  function vueAmis(){
    const P = panneau;
    P.appendChild(el("h3", "➕ Ajouter un ami"));
    const l = el("div", null, "gr-ligne");
    const inp = el("input"); inp.placeholder = "Pseudo de son compte"; inp.maxLength = 16;
    const msg = el("p", null, "gr-msg");
    const go = bt("Ajouter", async () => { msg.textContent = "…"; msg.textContent = await demander(inp.value); if(/^✅/.test(msg.textContent)) inp.value = ""; });
    inp.addEventListener("keydown", e => { if(e.key === "Enter") go.click(); });
    l.append(inp, go); P.append(l, msg);
    P.appendChild(el("p", `Ton pseudo à donner à tes amis : ${moi.pseudo || "?"}`, "gr-note"));

    const dem = Object.entries(demandes);
    if(dem.length){
      P.appendChild(el("h3", "👋 Demandes reçues"));
      const ul = el("ul", null, "gr-liste");
      dem.forEach(([u, d]) => ul.appendChild(ligneJoueur("👋", d.pseudo || "?", "veut être ton ami", false, [bt("Accepter", () => accepter(u), "mini"), bt("✕", () => refuser(u), "gris mini")])));
      P.appendChild(ul);
    }

    const ids = Object.keys(amis);
    P.appendChild(el("h3", `🤝 Mes amis (${ids.length})`));
    if(!ids.length){ P.appendChild(el("p", "Pas encore d'amis : ajoute-les avec leur pseudo de compte.", "gr-note")); return; }
    const ul = el("ul", null, "gr-liste");
    ids.sort((a, b) => enLigne(profils[b]) - enLigne(profils[a]) || String((profils[a] || {}).pseudo).localeCompare(String((profils[b] || {}).pseudo)))
      .forEach(u => {
        const p = profils[u] || {};
        const dansGroupe = G && (G.membres || {})[u];
        const sup = bt("✕", async () => { if(confirm(`Retirer ${p.pseudo || "cet ami"} de tes amis ?`)) await retirer(u); }, "gris mini");
        ul.appendChild(ligneJoueur(p.avatar, p.pseudo || "?", statut(p) + (dansGroupe ? " · dans ton groupe" : ""), enLigne(p),
          [dansGroupe ? null : bt(gid ? "Inviter" : "Groupe +", () => inviter(u), "mini"), sup]));
      });
    P.appendChild(ul);
  }

  /* ---------- Lancement ---------- */
  async function demarrer(){
    const base = RACINE + "jeux/commun/";
    await charger(base + "catalogue.js", () => window.SALLE_CATALOGUE);
    await charger(base + "compte.js", () => window.Compte);
    if(!window.Compte) return;
    if(!document.body) await new Promise(r => document.addEventListener("DOMContentLoaded", r));
    installerUI();
    let uid = (Compte.session() || {}).uid;
    Compte.surChangement(s => {
      const u = (s || {}).uid;
      if(u !== uid){ uid = u; relancer(); }
      else { moi = s; dessiner(); }
    });
    await relancer();
    autoRejoindre();
    if(params.get("groupe") === "hote" && gid)
      carte("📣 Crée une salle en ligne dans ce jeu : tout ton groupe y sera invité automatiquement.", [["OK", () => {}]], "hote");
  }

  window.Groupe = {
    salleCreee, ouvrir, fermer,
    actuel: () => G ? {id: gid, chef: G.chef, membres: membres()} : null,
    _appliquer: appliquer
  };
  demarrer();
})();
