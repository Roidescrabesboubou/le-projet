/* ============================================================
   MÉDAILLES 🏅  →  window.Medailles
   Récompense des défis quotidiens (monnaie séparée des jetons
   du casino). Chargé par garde.js dans les jeux, inclus par l'accueil.

   Par défi du jour terminé (1re partie du jour seulement) :
     raté → 2 🏅 (participation) ; réussi → 5 à 10 🏅 selon le
     nombre de coups, d'erreurs ou d'indices (voir DEFIS).
   Bonus du jour :
     🎯 tous les défis faits      +20 🏅
     💯 tous réussis               +10 🏅
     🔥 série de journées complètes +2 🏅 par jour de série (max +10)

   Un jeu signale la fin de son défi du jour avec :
     Medailles.defi("wordle", nbCoups, gagne)
   (series.js le fait pour les jeux « -dle », le Sudoku et Connexions).
   Sans compte : médailles gardées sur l'appareil. Avec un compte :
   enregistrées en ligne (medailles/<uid>) + classement
   (medailles_classement/<uid>).
   ============================================================ */
(function(){
  if(window.Medailles) return;
  const src = (document.currentScript && document.currentScript.src) || "";
  const RACINE = src.replace(/jeux\/commun\/medailles\.js.*$/, "");
  const START = Date.UTC(2026, 10, 1);
  const BONUS_TOUS = 20, BONUS_PARFAIT = 10, BONUS_SERIE = 2, SERIE_MAX = 10;

  const lin = (e, meilleur, pire) => Math.max(0, Math.min(1, (pire - e) / (pire - meilleur)));
  /* q(e) : qualité de 0 à 1 d'un défi réussi (1 = parfait) */
  const DEFIS = [
    {slug: "wordle",      u: "coup",    q: e => lin(e, 1, 6)},
    {slug: "loldle",      u: "coup",    q: e => lin(e, 1, 12)},
    {slug: "anidle",      u: "coup",    q: e => lin(e, 1, 12)},
    {slug: "onepiecedle", u: "coup",    q: e => lin(e, 1, 12)},
    {slug: "pokedle",     u: "coup",    q: e => lin(e, 1, 12)},
    {slug: "electrodle",  u: "coup",    q: e => lin(e, 1, 12)},
    {slug: "paysdle",     u: "coup",    q: e => lin(e, 1, 8)},
    {slug: "connexions",  u: "erreur",  q: e => lin(e, 0, 4)},
    {slug: "sudoku",      u: "erreur",  q: e => lin(e, 0, 5)},
    {slug: "motscroises", u: "indice",  q: e => lin(e, 0, 5)},
    {slug: "motsfleches", u: "indice",  q: e => lin(e, 0, 5)},
    {slug: "shikaku",     u: "aide",    q: e => lin(e, 0, 5)},
    {slug: "chancedle",   u: "rang",    q: e => lin(e, 0, 6)},   /* e = 7 - rang (1 Banal … 7 Mythique) */
    {slug: "coupdefeu",   u: "journée", calc: (lv, g) => g ? 10 : 2 + Math.floor((Math.max(1, lv) - 1) * 5 / 8)}
  ];
  const parSlug = Object.fromEntries(DEFIS.map(d => [d.slug, d]));
  function gain(slug, e, g){
    const d = parSlug[slug];
    if(d.calc) return d.calc(e, g);
    return g ? 5 + Math.round(5 * d.q(e)) : 2;
  }
  function detail(slug, e, g){
    const d = parSlug[slug];
    if(slug === "coupdefeu") return g ? "8 journées tenues" : `journée ${e} atteinte`;
    if(slug === "chancedle") return "tirage " + (["mythique", "légendaire", "épique", "rare", "joli", "correct", "banal"][e] || "du jour");
    if(!g) return "raté, mais tenté";
    if(d.u === "coup") return `en ${e} coup${e > 1 ? "s" : ""}`;
    return e ? `${e} ${d.u}${e > 1 ? "s" : ""}` : `sans ${d.u}`;
  }

  /* ---------- Dates (heure de Paris) ---------- */
  function jour(){
    const [y, m, d] = new Intl.DateTimeFormat("en-CA", {timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit"}).format(new Date()).split("-").map(Number);
    return Math.floor((Date.UTC(y, m - 1, d) - START) / 864e5);
  }
  const semaine = j => Math.floor((j + 6) / 7);    // semaines du lundi au dimanche
  const dateParis = () => new Intl.DateTimeFormat("en-CA", {timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit"}).format(new Date());
  /* Temps passé sur un défi : depuis la 1re ouverture du jeu aujourd'hui (en secondes) */
  function duree(slug){
    const t0 = +localStorage.getItem("salle_vu_" + slug + "_" + dateParis());
    return t0 ? Math.max(0, Math.min(86400, Math.round((Date.now() - t0) / 1000))) : null;
  }
  (function noterOuverture(){
    const m = location.pathname.match(/\/jeux\/([a-z0-9-]+)\//);
    if(!m) return;
    const k = "salle_vu_" + m[1] + "_" + dateParis();
    try{ if(!localStorage.getItem(k)) localStorage.setItem(k, String(Date.now())); }catch(e){}
  })();

  /* ---------- Stockage ---------- */
  const L = (k, d) => { try{ const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); }catch(e){ return d; } };
  const E = (k, v) => { try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} };
  const SV = {".sv": "timestamp"};
  const session = () => window.Compte && Compte.pret && Compte.session && Compte.session();
  const cleLocale = () => "salle_medailles_" + ((session() || {}).uid || "invite");
  let jours = {};            // { "12": { wordle:{m,e,g}, _tous:20, ... } }
  let enLigne = false, syncPromesse = null, regl = null;
  const ecouteurs = [];

  function totaux(){
    const J = jour(), W = semaine(J);
    let t = 0, sw = 0, auj = 0;
    for(const [j, entree] of Object.entries(jours)){
      let s = 0;
      for(const [k, v] of Object.entries(entree || {})) s += k[0] === "_" ? (+v || 0) : ((v && +v.m) || 0);
      t += s;
      if(semaine(+j) === W) sw += s;
      if(+j === J) auj = s;
    }
    return {t, sw, auj, w: W, j: J};
  }
  function serie(J){
    let n = 0;
    while(jours[J - n] && jours[J - n]._tous) n++;
    return n;
  }

  /* Défis du jour actifs (un jeu caché ou « bientôt » par l'admin n'est pas exigé) */
  function actifs(){
    const cat = window.SALLE_CATALOGUE || [];
    return DEFIS.filter(d => {
      const g = cat.find(x => x.slug === d.slug);
      if(!g) return false;
      const etat = (window.Compte && Compte.etatDe && regl) ? Compte.etatDe(g, regl).etat : g.etat;
      return (etat || "dispo") === "dispo";
    }).map(d => ({...d, jeu: cat.find(x => x.slug === d.slug)}));
  }

  async function db(chemin, opts){ return Compte.db(chemin, opts); }
  const versServeur = (cle, v) => cle[0] === "_" ? v : {m: v.m, e: v.e, g: v.g, ...(v.t != null ? {t: v.t} : {}), d: SV};

  /* Charge les médailles (compte en ligne ou appareil) */
  function charger(){
    if(syncPromesse) return syncPromesse;
    syncPromesse = (async () => {
      if(window.Compte && Compte.reglages) try{ regl = await Promise.race([Compte.reglages(), new Promise(r => setTimeout(() => r(null), 3000))]); }catch(e){}
      jours = L(cleLocale(), {}) || {};
      const s = session();
      enLigne = false;
      if(s){
        try{
          const enl = (await db(`medailles/${s.uid}`)) || {};
          // remise à zéro décidée par un admin : on oublie aussi la copie de l'appareil
          const raz = await db(`medailles_raz/${s.uid}`).catch(() => null);
          const vu = L("salle_medailles_raz_vu_" + s.uid, 0);
          if(raz && raz > vu){ jours = {}; E("salle_medailles_invite", {}); E("salle_medailles_raz_vu_" + s.uid, raz); }
          // médailles gardées sur cet appareil (sans compte, ou pendant que le
          // serveur était injoignable) : on les ajoute au compte, sans rien perdre
          const invite = L("salle_medailles_invite", {}) || {};
          for(const source of [jours, invite]){
            for(const [j, entree] of Object.entries(source || {})){
              for(const [k, v] of Object.entries(entree || {})){
                if(enl[j] && enl[j][k] != null) continue;
                (enl[j] = enl[j] || {})[k] = v;
                try{ await db(`medailles/${s.uid}/${j}/${k}`, {method: "PUT", body: versServeur(k, v)}); }catch(e){}
              }
            }
          }
          E("salle_medailles_invite", {});
          jours = enl; enLigne = true;
          E(cleLocale(), jours);
          majClassement();
        }catch(e){ /* hors ligne ou règles pas à jour : on garde la copie locale */ }
      }
      notifier();
      return jours;
    })();
    return syncPromesse;
  }

  let tClass = null, dernierEnvoi = 0, essaisClass = 0;
  function majClassement(){
    clearTimeout(tClass);
    tClass = setTimeout(envoyerClassement, Math.max(300, dernierEnvoi + 2600 - Date.now()));
  }
  async function envoyerClassement(){
    const s = session(); if(!s || !enLigne) return;
    dernierEnvoi = Date.now();
    const T = totaux();
    try{
      // la base n'accepte pas plus de +160 🏅 par envoi : on rattrape en plusieurs fois si besoin
      const avant = await db(`medailles_classement/${s.uid}`).catch(() => null);
      const t = Math.min(T.t, avant && avant.t != null ? avant.t + 160 : 3000);
      if(avant && avant.t === t && avant.w === T.w && avant.sw === Math.min(T.sw, t)) return;
      await db(`medailles_classement/${s.uid}`, {method: "PUT", body: {n: String(s.pseudo || "Joueur").slice(0, 16), t, w: T.w, sw: Math.min(T.sw, t), d: SV}});
      if(t < T.t) majClassement();
    }catch(e){ if(essaisClass++ < 2) setTimeout(majClassement, 2600); }
  }

  async function ecrire(J, cle, valeur){
    (jours[J] = jours[J] || {})[cle] = valeur;
    E(cleLocale(), jours);
    const s = session();
    if(s && enLigne){
      try{ await db(`medailles/${s.uid}/${J}/${cle}`, {method: "PUT", body: versServeur(cle, valeur)}); }
      catch(e){ console.warn("[Médailles] non enregistrée en ligne :", e.message); }
    }
  }

  /* ---------- Fin d'un défi du jour ---------- */
  let file = Promise.resolve();
  function defi(slug, e, g){
    if(!parSlug[slug]) return Promise.resolve(null);
    file = file.then(() => traiter(slug, Math.max(0, Math.min(500, Math.round(+e || 0))), !!g)).catch(err => { console.warn("[Médailles]", err); return null; });
    return file;
  }
  async function traiter(slug, e, g, silencieux){
    await charger();
    const J = jour();
    if(jours[J] && jours[J][slug]) return null;                       // déjà compté aujourd'hui
    const m = gain(slug, e, g), t = silencieux ? null : duree(slug);
    await ecrire(J, slug, t != null ? {m, e, g, t} : {m, e, g});
    const lignes = [[`${(parSlug[slug] && titre(slug))} ${detail(slug, e, g)}`, m]];
    const reste = await bonus(J, lignes);
    await majClassement();
    notifier();
    if(!silencieux) celebrer(lignes, reste);
    return {m, lignes, reste};
  }
  /* Bonus de la journée (ajoute les lignes gagnées, renvoie le nb de défis restants) */
  async function bonus(J, lignes){
    const act = actifs(), auj = jours[J] || {};
    const faits = act.filter(d => auj[d.slug]);
    if(act.length && faits.length === act.length){
      if(!auj._tous){
        await ecrire(J, "_tous", BONUS_TOUS); lignes.push(["🎯 Tous les défis du jour", BONUS_TOUS]);
        const n = serie(J);
        if(n >= 2){ const b = Math.min(SERIE_MAX, BONUS_SERIE * (n - 1)); await ecrire(J, "_serie", b); lignes.push([`🔥 Série de ${n} jours complets`, b]); }
      }
      if(!auj._parfait && faits.every(d => auj[d.slug].g)){ await ecrire(J, "_parfait", BONUS_PARFAIT); lignes.push(["💯 Tous réussis", BONUS_PARFAIT]); }
    }
    return act.length - faits.length;
  }

  /* Correction du 5 novembre : une partie du jour de Coup de Feu quittée puis
     relancée avec « Partie du jour » était abandonnée (journée 1 → 2 🏅) et la
     vraie partie gagnée ne comptait pas. Ce jour-là seulement, une victoire du
     jour remplace la médaille de participation. */
  async function corriger(){
    const J = 4, CLE = "salle_medailles_corr_" + J;
    if(jour() !== J) return;
    const c = jours[J] && jours[J].coupdefeu;
    if(!c || c.g || L(CLE + "_" + cleLocale(), 0)) return;
    const k = L("cdf_jour_fait_" + J, 0), lv = Math.floor(k / 1e9);
    if(lv < 8) return;
    const v = {m: 10, e: lv, g: true}, lignes = [[`${titre("coupdefeu")} 8 journées tenues (correction)`, 10 - (c.m || 0)]];
    (jours[J] = jours[J] || {}).coupdefeu = v;
    E(cleLocale(), jours);
    E(CLE + "_" + cleLocale(), 1);
    const s = session();
    if(s && enLigne) try{ await db(`medailles/${s.uid}/${J}/coupdefeu`, {method: "PUT", body: versServeur("coupdefeu", v)}); }catch(e){}
    const reste = await bonus(J, lignes);
    await majClassement(); notifier();
    celebrer(lignes, reste, "🔧 Médailles corrigées");
  }

  /* ---------- Rattrapage ----------
     Défis du jour déjà terminés sur cet appareil mais sans médaille
     (par ex. joués avant l'arrivée des médailles) : on lit le résultat
     enregistré par le jeu lui-même. Seulement pour aujourd'hui. */
  const DEBUTS = {anidle: [2026, 10, 3], electrodle: [2026, 10, 8], motscroises: [2026, 10, 4], motsfleches: [2026, 10, 4], shikaku: [2026, 10, 4], chancedle: [2026, 10, 10]};
  function jourDuJeu(slug){
    const [y, m, d] = new Intl.DateTimeFormat("en-CA", {timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit"}).format(new Date()).split("-").map(Number);
    const [sy, sm, sd] = DEBUTS[slug] || [2026, 10, 1];
    return Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(sy, sm, sd)) / 864e5);
  }
  function resultatDuJour(slug){
    try{
      const d = jourDuJeu(slug), st = L(slug + "_statsDaily", null) || {};
      const fini = st.last === d, gagne = st.lastWin === d;
      if(slug === "coupdefeu"){
        const p = L("cdf_jour_premier_" + d, null);
        if(p && p.lv) return {e: p.lv, g: !!p.g};
        const k = L("cdf_jour_fait_" + d, 0); if(!k) return null;
        const lv = Math.floor(k / 1e9); return {e: lv, g: lv >= 8};
      }
      if(["wordle", "paysdle", "loldle", "anidle", "onepiecedle", "pokedle", "electrodle"].includes(slug)){
        const sv = L(slug + "_daily", null);
        if(!fini || !sv || sv.day !== d || !Array.isArray(sv.guesses)) return null;
        return {e: sv.guesses.length, g: ["wordle", "paysdle"].includes(slug) ? gagne : true};
      }
      if(slug === "chancedle"){
        const sv = L("chancedle_daily", null);
        if(!fini || !sv || sv.day !== d || !sv.rang) return null;
        return {e: 7 - sv.rang, g: true};
      }
      if(slug === "connexions"){
        const sv = L("connexions_daily", null);
        if(!sv || sv.day !== d || !sv.over) return null;
        return {e: (sv.attempts || []).filter(a => !a.ok).length, g: !!sv.won};
      }
      if(["sudoku", "motscroises", "motsfleches", "shikaku"].includes(slug)){
        const sv = L(slug + "_jour", null);
        if(!sv || !sv.fini || !fini) return null;
        if(sv.jour != null && sv.jour !== d) return null;
        const e = slug === "sudoku" ? (sv.erreurs || 0) + (sv.indices || 0) : slug === "shikaku" ? (sv.aides || 0) : (sv.indices || 0);
        return {e, g: !!sv.gagne};
      }
    }catch(e){}
    return null;
  }
  function rattraper(){
    file = file.then(async () => {
      const J = jour(), lignes = [];
      let reste = 0;
      for(const d of actifs()){
        if(jours[J] && jours[J][d.slug]) continue;
        const r = resultatDuJour(d.slug);
        if(!r) continue;
        const res = await traiter(d.slug, r.e, r.g, true);
        if(res){ lignes.push(...res.lignes); reste = res.reste; }
      }
      if(lignes.length) celebrer(lignes, reste, "🕐 Défis déjà faits aujourd'hui");
      await corriger();
    }).catch(err => console.warn("[Médailles] rattrapage :", err));
    return file;
  }

  const titre = slug => { const g = (window.SALLE_CATALOGUE || []).find(x => x.slug === slug); return g ? g.title : slug; };

  /* ---------- Affichage ---------- */
  const el = (tag, txt, cls) => { const x = document.createElement(tag); if(txt != null) x.textContent = txt; if(cls) x.className = cls; return x; };
  const css = el("style");
  css.textContent = `
.md-pop{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:9100;width:min(360px,calc(100vw - 24px));background:var(--card,#fff);color:var(--text,#22192b);border:2px solid #f2b705;border-radius:18px;padding:14px 16px;box-shadow:0 16px 40px rgba(0,0,0,.28);font:400 .95rem Nunito,system-ui,sans-serif;animation:mdPop .4s cubic-bezier(.2,1.4,.4,1)}
.md-pop .md-l{display:flex;justify-content:space-between;gap:10px;padding:3px 0}
.md-pop .md-l b{color:#c98a00;white-space:nowrap}
.md-pop .md-tot{border-top:1px solid var(--line,#ecdfd2);margin-top:6px;padding-top:6px;font-weight:800;display:flex;justify-content:space-between}
.md-pop small{display:block;color:var(--muted,#776c80);margin-top:4px}
@keyframes mdPop{from{transform:translate(-50%,30px);opacity:0}}
.md-fond{position:fixed;inset:0;z-index:9200;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;padding:12px}
.md-boite{background:var(--card,#fff);color:var(--text,#22192b);border-radius:18px;padding:18px;width:min(440px,100%);max-height:86vh;overflow:auto;font:400 .95rem Nunito,system-ui,sans-serif;position:relative}
.md-boite h2{font:700 1.25rem Fredoka,Nunito,sans-serif;margin:0 0 10px}
.md-boite .md-x{position:absolute;top:8px;right:12px;border:0;background:transparent;font-size:1.4rem;color:var(--muted,#776c80);cursor:pointer}
.md-ong{display:flex;gap:6px;margin-bottom:10px}
.md-ong button{flex:1;border:1px solid var(--line,#ecdfd2);background:var(--bg,#fbf6ef);color:inherit;border-radius:10px;padding:7px;font-weight:800;cursor:pointer}
.md-ong button.on{background:var(--text,#22192b);color:var(--bg,#fff)}
.md-liste{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px}
.md-liste li{display:flex;gap:8px;align-items:center;background:var(--bg,#fbf6ef);border-radius:10px;padding:6px 10px;font-weight:700}
.md-liste li.moi{outline:2px solid #f2b705}
.md-liste .r{width:24px;text-align:center;color:var(--muted,#776c80)}
.md-liste .n{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.md-regles td{padding:3px 6px;border-bottom:1px solid var(--line,#ecdfd2)}
.md-regles{border-collapse:collapse;width:100%;font-size:.9rem;margin:6px 0}`;
  document.head.appendChild(css);

  function celebrer(lignes, reste, entete){
    document.querySelectorAll(".md-pop").forEach(n => n.remove());
    const p = el("div", null, "md-pop");
    if(entete){ const h = el("div", entete); h.style.cssText = "font-weight:800;margin-bottom:4px"; p.appendChild(h); }
    lignes.forEach(([t, n]) => { const l = el("div", null, "md-l"); l.append(el("span", t), el("b", `+${n} 🏅`)); p.appendChild(l); });
    const T = totaux();
    const tot = el("div", null, "md-tot"); tot.append(el("span", "Aujourd'hui"), el("span", `${T.auj} 🏅`)); p.appendChild(tot);
    p.appendChild(el("small", reste > 0 ? `Encore ${reste} défi${reste > 1 ? "s" : ""} du jour pour le bonus de +${BONUS_TOUS} 🏅` : (session() ? "Tous les défis du jour sont faits, bravo !" : "Connecte-toi pour garder tes médailles et entrer au classement.")));
    p.onclick = () => p.remove();
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 7000);
  }

  function notifier(){ ecouteurs.forEach(f => { try{ f(); }catch(e){} }); }

  /* Compteur 🏅 (barre du haut de l'accueil) */
  function compteur(zone){
    const b = el("button", "🏅 …", "md-compteur");
    b.title = "Tes médailles · classement";
    b.onclick = () => fenetreClassement();
    zone.appendChild(b);
    const maj = () => { b.textContent = `🏅 ${totaux().t.toLocaleString("fr-FR")}`; };
    ecouteurs.push(maj); maj();
    return b;
  }

  /* Panneau « Défis du jour » de l'accueil */
  function panneau(zone){
    const dessiner = () => {
      const J = jour(), auj = jours[J] || {}, act = actifs(), T = totaux();
      const faits = act.filter(d => auj[d.slug]);
      zone.innerHTML = "";
      const tete = el("div", null, "dj-tete");
      tete.append(el("h2", "🏅 Défis du jour"), el("span", `${faits.length}/${act.length} · +${T.auj} 🏅 aujourd'hui`, "dj-score"));
      zone.appendChild(tete);
      const barre = el("div", null, "dj-barre"); const rempli = el("i"); rempli.style.width = (act.length ? faits.length / act.length * 100 : 0) + "%"; barre.appendChild(rempli); zone.appendChild(barre);
      const liste = el("div", null, "dj-liste");
      act.forEach(d => {
        const r = auj[d.slug];
        const a = el("a", null, "dj-defi" + (r ? (r.g ? " ok" : " ko") : ""));
        a.href = `${RACINE}jeux/${d.slug}/`;
        a.title = r ? `${d.jeu.title} : ${detail(d.slug, r.e, r.g)} · +${r.m} 🏅` : `${d.jeu.title} : à faire`;
        a.append(el("span", d.jeu.emoji || "🎮", "dj-em"), el("span", d.jeu.title, "dj-nom"), el("b", r ? `+${r.m}` : "à faire"));
        liste.appendChild(a);
      });
      zone.appendChild(liste);
      const bonus = el("p", null, "dj-bonus");
      const s = serie(J - (auj._tous ? 0 : 1)) ;
      bonus.textContent = auj._tous
        ? `🎯 Bonus « tous les défis » gagné${auj._parfait ? " · 💯 sans faute" : ""}${auj._serie ? ` · 🔥 série de ${serie(J)} jours` : ""} !`
        : `Fais-les tous : 🎯 +${BONUS_TOUS} 🏅 · tous réussis : 💯 +${BONUS_PARFAIT} 🏅${s ? ` · 🔥 série en cours : ${s} jour${s > 1 ? "s" : ""}` : ""}`;
      zone.appendChild(bonus);
      const pied = el("div", null, "dj-pied");
      pied.appendChild(el("span", `Total ${T.t.toLocaleString("fr-FR")} 🏅 · cette semaine ${T.sw.toLocaleString("fr-FR")} 🏅`));
      const bc = el("button", "🏆 Classement", "dj-btn"); bc.onclick = () => fenetreClassement();
      const br = el("button", "ℹ️ Règles", "dj-btn"); br.onclick = () => fenetreRegles();
      pied.append(bc, br);
      zone.appendChild(pied);
      if(!session()) zone.appendChild(el("p", "Connecte-toi pour garder tes médailles sur tous tes appareils et entrer au classement.", "dj-note"));
    };
    ecouteurs.push(dessiner);
    dessiner();
  }

  function boite(titreTxt){
    const fond = el("div", null, "md-fond"), b = el("div", null, "md-boite");
    const x = el("button", "×", "md-x"); x.onclick = () => fond.remove();
    fond.addEventListener("mousedown", e => { if(e.target === fond) fond.remove(); });
    b.append(x, el("h2", titreTxt)); fond.appendChild(b); document.body.appendChild(fond);
    return b;
  }

  function fenetreRegles(){
    const b = boite("🏅 Les médailles");
    b.appendChild(el("p", "Chaque défi du jour rapporte des médailles une fois par jour (ta première partie du jour compte) :"));
    const t = el("table", null, "md-regles");
    [["Défi raté", "2 🏅"], ["Défi réussi", "5 à 10 🏅 selon tes coups, erreurs ou indices"], ["Coup de Feu", "10 🏅 si les 8 journées tiennent, sinon 2 à 6 🏅"],
     ["🎯 Tous les défis du jour", `+${BONUS_TOUS} 🏅`], ["💯 Tous réussis", `+${BONUS_PARFAIT} 🏅`], ["🔥 Série de journées complètes", `+${BONUS_SERIE} 🏅 par jour (max +${SERIE_MAX})`]]
      .forEach(([a, c]) => { const tr = el("tr"); tr.append(el("td", a), el("td", c)); t.appendChild(tr); });
    b.appendChild(t);
    b.appendChild(el("p", "Exemple : le Mot du jour trouvé en 1 coup = 10 🏅, en 6 coups = 5 🏅. Les médailles servent pour l'instant à départager les joueurs au classement.", "muted"));
  }

  async function fenetreClassement(){
    const b = boite("🏆 Classement des médailles");
    const ong = el("div", null, "md-ong"), zone = el("div");
    let mode = "sw";
    const s = session();
    const afficher = async () => {
      ong.querySelectorAll("button").forEach(x => x.classList.toggle("on", x.dataset.m === mode));
      zone.textContent = "Chargement…";
      try{
        const W = semaine(jour());
        const q = mode === "sw" ? `orderBy=${encodeURIComponent('"w"')}&equalTo=${W}` : `orderBy=${encodeURIComponent('"t"')}&limitToLast=50`;
        const r = await fetch(`${Compte.DB}/medailles_classement.json?${q}`);
        if(!r.ok) throw new Error("HTTP " + r.status);
        const l = Object.entries((await r.json()) || {}).map(([id, v]) => ({id, ...v})).filter(x => (x[mode] || 0) > 0 && (mode !== "sw" || x.w === W))
          .sort((a, c) => c[mode] - a[mode]).slice(0, 30);
        zone.innerHTML = "";
        if(!l.length){ zone.appendChild(el("p", mode === "sw" ? "Personne n'a encore de médaille cette semaine. À toi de jouer !" : "Pas encore de médailles au classement.", "muted")); return; }
        const ul = el("ol", null, "md-liste");
        l.forEach((x, i) => {
          const li = el("li", null, s && x.id === s.uid ? "moi" : "");
          li.append(el("span", ["🥇", "🥈", "🥉"][i] || String(i + 1), "r"), el("span", x.n || "?", "n"), el("b", `${(x[mode] || 0).toLocaleString("fr-FR")} 🏅`));
          ul.appendChild(li);
        });
        zone.appendChild(ul);
      }catch(e){ zone.innerHTML = ""; zone.appendChild(el("p", "Classement indisponible pour le moment.", "muted")); }
    };
    [["sw", "Cette semaine"], ["t", "Depuis le début"]].forEach(([m, t]) => { const x = el("button", t); x.dataset.m = m; x.onclick = () => { mode = m; afficher(); }; ong.appendChild(x); });
    b.append(ong, zone);
    const T = totaux();
    b.appendChild(el("p", s ? `Toi : ${T.t.toLocaleString("fr-FR")} 🏅 au total, ${T.sw.toLocaleString("fr-FR")} 🏅 cette semaine.` : "Connecte-toi pour apparaître au classement.", "muted"));
    afficher();
  }

  window.Medailles = {DEFIS, gain, rattraper, resultatDuJour, jour, semaine, defi, charger, totaux, actifs, panneau, compteur, fenetreClassement, fenetreRegles, etat: () => jours, duree,
    surChangement: f => { ecouteurs.push(f); }};

  /* Démarrage : charge, se recharge si le compte change, traite les défis signalés avant le chargement */
  (async () => {
    const base = RACINE + "jeux/commun/";
    const charge = (n, t) => new Promise(ok => { if(t()) return ok(); const s = document.createElement("script"); s.src = base + n; s.onload = ok; s.onerror = ok; document.head.appendChild(s); });
    await charge("catalogue.js", () => window.SALLE_CATALOGUE);
    await charge("compte.js", () => window.Compte);
    let uid = (session() || {}).uid;
    if(window.Compte && Compte.surChangement) Compte.surChangement(s => { const u = (s || {}).uid; if(u !== uid){ uid = u; syncPromesse = null; charger().then(rattraper); } });
    await charger();
    const attente = window.__medailles || []; window.__medailles = {push: a => defi(...a)};
    attente.forEach(a => defi(...a));
    rattraper();
  })();
})();
