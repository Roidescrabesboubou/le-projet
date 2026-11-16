/* ============================================================
   LA SOIRÉE : une seule salle pour tout l'apéro.
   L'hôte choisit le jeu suivant (jeux/<slug>/jeu.js, rangés dans
   Apero.jeux) et tous les téléphones changent ensemble. Pendant ce
   temps, des jeux de fond tournent : Le Contrat, rôles de soirée,
   règles en cours, mot interdit, compteur de gorgées.
   Le G de la soirée (chez l'hôte) contient le G du jeu en cours
   (cur.G) et celui du Contrat (contrat) : leurs actions passent par
   les mêmes messages (# = soirée, % = Contrat, le reste = jeu en cours).
   Les jeux à un seul téléphone (multi: false) tournent sur le
   téléphone de l'hôte, qu'on se passe ; les autres affichent une attente.
   ============================================================ */
(function(){
  const esc = Base.esc, {melanger, hasard, propre} = Soiree;
  const ROLES = window.SOIREE_ROLES, MOTS = window.SOIREE_MOTS;
  const JEUX = ["quipourrait", "ecrans", "western", "couleurs", "mainstable", "shaker", "souffleur", "silence", "pose"];
  const cfg = s => Apero.jeux[s];
  const CONTRAT = () => Apero.jeux.contrat;
  const rid = () => Math.random().toString(36).slice(2, 8);
  const presents = G => G.J.filter(j => !j.parti);
  const jDe = (G, id) => G.J.find(j => j.id === id);
  const nomDe = (V, id) => (V.J.find(j => j.id === id) || {nom: "?"}).nom;
  const peutIA = () => { const s = window.Compte && Compte.session && Compte.session(); return !!(s && (s.ia || s.admin)); };
  const unite = (R, n) => R.boisson === "soft" ? `gage${n > 1 ? "s" : ""}` : `gorgée${n > 1 ? "s" : ""}`;

  Base.entete({
    titre: "La Soirée",
    emoji: "🍻",
    aide: `<p>Une seule salle pour tout l'apéro : chacun entre le code sur son téléphone, puis l'hôte choisit les jeux un par un.</p>
      <ul><li><b>Jeux de fond</b> (à lancer depuis le menu) : ils continuent pendant les autres jeux, avec leur bandeau en haut de l'écran.</li>
      <li>🗡️ <b>Le Contrat</b> : une cible et une mission secrètes toute la soirée.</li>
      <li>🎭 <b>Rôles</b> : Maître du pouce, Maître des questions… redistribués tous les 3 jeux.</li>
      <li>🤐 <b>Mot interdit</b> : chacun a un mot secret que les autres ne doivent pas dire. Piège-les !</li>
      <li>📜 <b>Règles</b> : les règles inventées restent affichées sur tous les téléphones.</li>
      <li>🍺 <b>Compteur</b> : les gorgées sont comptées toutes seules quand un jeu désigne quelqu'un ; ajoute les autres avec ＋1.</li>
      <li>Les jeux à un seul téléphone (Souffleur, Silence, Recrée la pose) se jouent sur le téléphone de l'hôte, qu'on se passe.</li></ul>`
  });

  /* ---------- Gorgées ---------- */
  function ajouter(G, id, n){ if(jDe(G, id)) G.gorg[id] = Math.max(0, (G.gorg[id] || 0) + n); }
  function compter(G){
    let ch = false;
    const prendre = (l, pre) => (l || []).forEach(([k, id, n]) => { const K = pre + k; if(!G.vus[K]){ G.vus[K] = 1; ajouter(G, id, n); ch = true; } });
    if(G.cur && cfg(G.cur.s).bilan) prendre(cfg(G.cur.s).bilan(G.cur.G), "j" + G.cur.n + ":");
    if(G.contrat) prendre(CONTRAT().bilan(G.contrat), "c" + G.contratN + ":");
    return ch;
  }
  function noter(G, t){ G.log.unshift({t, n: ++G.logN}); G.log = G.log.slice(0, 15); }

  /* ---------- Jeux de fond ---------- */
  function distribuer(G){
    const ids = melanger(presents(G).map(j => j.id));
    G.roles = {};
    ROLES.slice(0, Math.min(ROLES.length, ids.length)).forEach((r, i) => { G.roles[r.k] = ids[i]; });
    G.rolesDepuis = 0;
    noter(G, "🎭 Nouveaux rôles : " + ROLES.filter(r => G.roles[r.k]).map(r => r.e + " " + jDe(G, G.roles[r.k]).nom).join(" · "));
  }
  function nouveauMot(G, id){
    if(!G.mot.pioche.length) G.mot.pioche = melanger(MOTS.slice());
    const pris = Object.values(G.mot.M);
    let w = G.mot.pioche.pop();
    if(pris.includes(w) && G.mot.pioche.length) w = G.mot.pioche.pop();
    G.mot.M[id] = w;
  }
  function lancerContrat(G){
    const c = CONTRAT();
    G.contrat = c.nouvelle(presents(G).map(j => ({id: j.id, nom: j.nom, av: j.av})), {boisson: G.R.boisson});
    G.contrat._id = rid(); G.contratN++;
  }

  /* ---------- Jeu en cours ---------- */
  function lancer(G, s){
    const c = cfg(s); if(!c || !JEUX.includes(s)) return false;
    if(c.ia && !peutIA()) return false;
    const J = presents(G).map(j => ({id: j.id, nom: j.nom, av: j.av}));
    if(J.length < (c.min || 2) || J.length > (c.max || 99)) return false;
    const R = {};
    (c.reglages || []).forEach(r => { const v = (G.Rj[s] || {})[r.k]; R[r.k] = v === undefined ? r.def : v; });
    R.boisson = G.R.boisson;
    compter(G);
    const sg = c.nouvelle(J, R); sg._id = rid();
    const loc = c.multi === false; if(loc) sg._local = true;
    G.cur = {s, G: sg, n: ++G.nb, loc, v: 0};
    if(G.roles && ++G.rolesDepuis >= 3) distribuer(G);
    return true;
  }

  function action(G, id, a){
    const t = a.t;
    if(t === "%"){
      if(!G.contrat || !a.a || typeof a.a.t !== "string") return false;
      const r = CONTRAT().action(G.contrat, id, a.a); if(r) compter(G); return r;
    }
    if(t[0] !== "#"){
      if(!G.cur || G.cur.loc) return false;
      const r = cfg(G.cur.s).action(G.cur.G, id, a); if(r) compter(G); return r;
    }
    const j = jDe(G, id), hote = id === G.hote;
    if(!j) return false;
    switch(t){
      case "#tic": return hote && compter(G);
      case "#jeu": return hote && lancer(G, a.s);
      case "#rejouer": return hote && !!G.cur && lancer(G, G.cur.s);
      case "#menu": if(!hote || !G.cur) return false; compter(G); G.cur = null; return true;
      case "#reg": {
        const c = cfg(a.s), r = c && (c.reglages || []).find(x => x.k === a.k);
        const o = r && r.options && r.options.find(x => String(x[0]) === String(a.v));
        if(!hote || !o) return false;
        (G.Rj[a.s] = G.Rj[a.s] || {})[a.k] = o[0]; return true;
      }
      case "#loc": {
        if(!hote || !G.cur || !G.cur.loc || !a.a) return false;
        const r = cfg(G.cur.s).action(G.cur.G, a.m, a.a);
        if(r){ G.cur.v++; compter(G); }
        return r;
      }
      case "#contrat":
        if(!hote) return false;
        if(a.on){ if(G.contrat || presents(G).length < 3) return false; lancerContrat(G); noter(G, "🗡️ Le Contrat commence : lisez vos contrats en secret !"); }
        else { if(!G.contrat) return false; compter(G); G.contrat = null; noter(G, "🗡️ Le Contrat est terminé"); }
        return true;
      case "#roles":
        if(!hote) return false;
        if(a.on) distribuer(G); else { G.roles = null; noter(G, "🎭 Fin des rôles"); }
        return true;
      case "#pris": {
        const r = ROLES.find(x => x.k === a.r), v = jDe(G, a.c);
        if(!G.roles || !r || G.roles[r.k] !== id || !v || v.parti || a.c === id) return false;
        ajouter(G, a.c, r.n);
        noter(G, `${r.e} ${r.nom} : ${v.nom} boit ${r.n}`);
        return true;
      }
      case "#regle": {
        const txt = propre(a.x, 120);
        if(!txt || G.regles.length >= 12) return false;
        G.regles.push({i: ++G.ri, t: txt, par: id});
        noter(G, `📜 Nouvelle règle de ${j.nom} : ${txt}`);
        return true;
      }
      case "#regle-x": {
        const k = G.regles.findIndex(r => r.i === a.i);
        if(k < 0 || !(hote || G.regles[k].par === id)) return false;
        G.regles.splice(k, 1); return true;
      }
      case "#mot":
        if(!hote) return false;
        if(a.on){ G.mot = {M: {}, pioche: melanger(MOTS.slice()), pts: {}, vieux: []}; presents(G).forEach(x => nouveauMot(G, x.id)); noter(G, "🤐 Mot interdit : chacun a reçu son mot secret"); }
        else { G.mot = null; noter(G, "🤐 Fin du mot interdit"); }
        return true;
      case "#piege": {
        const v = jDe(G, a.c);
        if(!G.mot || !G.mot.M[id] || !v || v.parti || a.c === id) return false;
        const w = G.mot.M[id];
        ajouter(G, a.c, 2); G.mot.pts[id] = (G.mot.pts[id] || 0) + 1;
        G.mot.vieux.unshift(w); G.mot.vieux = G.mot.vieux.slice(0, 10);
        noter(G, `🤐 ${v.nom} a dit « ${w} », le mot de ${j.nom} : 2 ${unite(G.R, 2)} !`);
        nouveauMot(G, id);
        return true;
      }
      case "#plus":
        if(a.n !== 1 && a.n !== -1) return false;
        ajouter(G, id, a.n); return true;
    }
    return false;
  }

  /* ---------- Réseau ---------- */
  Soiree.demarrer({
    jeu: "lasoiree", titre: "La Soirée", emoji: "🍻", min: 2, max: 16,
    note: "dans la même pièce, chacun sur son téléphone : un crée la salle, les autres entrent le code. Tous les jeux d'apéro s'enchaînent dans la même salle.",
    hero: {
      texte: "Une seule salle pour tout l'apéro : l'hôte enchaîne les jeux, et Le Contrat, les rôles et le mot interdit tournent en fond toute la soirée.",
      etapes: ["1 · Tout le monde entre le code", "2 · L'hôte choisit les jeux", "3 · Méfiez-vous en continu"]
    },
    reglages: [Apero.BOISSON],
    nouvelle(joueurs, R){
      return {hid: rid(), R, J: joueurs.map(j => ({...j})), hote: joueurs[0].id, cur: null, nb: 0, Rj: {}, contrat: null, contratN: 0,
        roles: null, rolesDepuis: 0, regles: [], ri: 0, mot: null, gorg: {}, vus: {}, log: [], logN: 0};
    },
    action,
    depart(G, id){
      const j = jDe(G, id); if(!j) return;
      j.parti = true;
      if(G.cur && !G.cur.loc) cfg(G.cur.s).depart(G.cur.G, id);
      if(G.contrat) CONTRAT().depart(G.contrat, id);
      if(G.roles) for(const k in G.roles) if(G.roles[k] === id) delete G.roles[k];
      if(G.mot) delete G.mot.M[id];
      compter(G);
    },
    arrivee(G, j){
      const x = jDe(G, j.id);
      if(x){   // téléphone revenu de veille : même id, il garde son compteur
        if(!x.parti) return;
        x.parti = false;
        if(G.cur && !G.cur.loc){ const y = G.cur.G.J && G.cur.G.J.find(z => z.id === j.id); if(y) y.parti = false; }
        if(G.contrat) CONTRAT().arrivee(G.contrat, {...j});
        if(G.mot && !G.mot.M[j.id]) nouveauMot(G, j.id);
        noter(G, `👋 ${x.nom} est de retour`);
        return;
      }
      G.J.push({...j});
      if(G.cur && !G.cur.loc && cfg(G.cur.s).arrivee) cfg(G.cur.s).arrivee(G.cur.G, {...j});
      if(G.contrat) CONTRAT().arrivee(G.contrat, {...j});
      if(G.mot) nouveauMot(G, j.id);
      noter(G, `👋 ${j.nom} rejoint la soirée`);
    },
    publique(G){
      HG = G;   // chez l'hôte : les jeux à un téléphone se lisent directement ici
      const c = G.cur && cfg(G.cur.s);
      return {
        hid: G.hid, R: G.R, J: G.J, hote: G.hote, nb: G.nb, Rj: G.Rj, gorg: G.gorg, log: G.log, regles: G.regles, roles: G.roles,
        cur: G.cur ? {s: G.cur.s, n: G.cur.n, loc: G.cur.loc, v: G.cur.v, V: G.cur.loc ? null : Object.assign(c.publique(G.cur.G), {_id: G.cur.G._id})} : null,
        contrat: G.contrat ? Object.assign(CONTRAT().publique(G.contrat), {_id: G.contrat._id}) : null,
        mot: G.mot ? {pts: G.mot.pts, vieux: G.mot.vieux} : null,
        ia: peutIA()
      };
    },
    privee(G, id){
      const c = G.cur && cfg(G.cur.s);
      return {
        s: G.cur && !G.cur.loc && c.privee ? c.privee(G.cur.G, id) : null,
        c: G.contrat ? CONTRAT().privee(G.contrat, id) : null,
        w: G.mot ? G.mot.M[id] || null : null
      };
    },
    rendre
  });
  let HG = null;

  // l'hôte recompte de temps en temps (sorts de la Roulette révélés après l'animation)
  let dernierCtx = null;
  setInterval(() => { if(dernierCtx && dernierCtx.hote && HG && HG.cur) dernierCtx.envoyer({t: "#tic"}); }, 1500);

  /* ---------- Affichage ---------- */
  function rendre(box, ctx){
    dernierCtx = ctx;
    if(!box.querySelector("#hb") || box._hid !== ctx.V.hid){
      const hj = box.querySelector("#hj"); if(hj) arreterJeu(hj);
      box._hid = ctx.V.hid; box._choix = null; box._motVu = false; box._alerte = null; box._passe = null;
      box.innerHTML = `<div id="hb" class="hb"></div><div id="hp" class="hp" hidden></div><div id="hm"></div><div id="hj" class="hj"></div><div id="hcBox" hidden><div id="hc" class="g-contrat"></div></div>`;
      box._ouvert = null; box._vu = null; box._re = () => rendre(box, dernierCtx);
    }
    const {V, P = {}, moi} = ctx, p = P || {};
    annonces(box, V, p);
    barre(box, ctx, p);
    panneau(box, ctx, p);
    principal(box, ctx, p);
  }

  /* nouvelles du journal en petites bulles (+ vibration pour un contrat à confirmer) */
  function annonces(box, V, p){
    const l = V.log || [], cl = (V.contrat && V.contrat.log) || [];
    const top = l.length ? l[0].n : 0, ctop = cl.length ? cl[0].h : 0;
    if(box._vu){
      l.filter(x => x.n > box._vu.n).reverse().forEach(x => Base.toast(x.t));
      cl.filter(x => x.h > box._vu.h).reverse().forEach(x => Base.toast(x.t));
    }
    box._vu = {n: top, h: ctop};
    const v = p.c && p.c.v;
    const cle = v ? v.tueur + v.m : null;
    if(cle && box._alerte !== cle){ box._alerte = cle; box._ouvert = "contrat"; Apero.vibrer([200, 100, 200]); }
    if(!cle) box._alerte = null;
  }

  function barre(box, ctx, p){
    const V = ctx.V, moi = ctx.moi, hb = box.querySelector("#hb"), R = V.R;
    const role = V.roles && ROLES.find(r => V.roles[r.k] === moi);
    const alerte = p.c && p.c.v;
    const puces = [
      ["gorg", `🍺 ${V.gorg[moi] || 0}`],
      V.contrat ? ["contrat", alerte ? "🗡️ À confirmer !" : "🗡️ Contrat", alerte ? "alerte" : ""] : null,
      V.roles ? ["roles", role ? `${role.e} ${role.nom}` : "🎭 Rôles"] : null,
      ["regles", V.regles.length ? `📜 ${V.regles.length} règle${V.regles.length > 1 ? "s" : ""}` : "📜 Règles"],
      V.mot ? ["mot", "🤐 Mot interdit"] : null
    ].filter(Boolean);
    const html = puces.map(([k, t, c]) => `<button data-o="${k}" class="${box._ouvert === k ? "on" : ""} ${c || ""}">${esc(t)}</button>`).join("");
    if(hb._h === html) return;
    hb._h = html; hb.innerHTML = html;
    hb.querySelectorAll("[data-o]").forEach(b => b.onclick = () => { Apero.audio(); box._ouvert = box._ouvert === b.dataset.o ? null : b.dataset.o; box._re(); });
  }

  function choixJoueurs(V, moi, attr){
    return `<div class="so-choix">${V.J.filter(j => !j.parti && j.id !== moi).map(j => `<button ${attr}="${esc(j.id)}"><span class="av">${esc(j.av)}</span>${esc(j.nom)}</button>`).join("")}</div>`;
  }

  function panneau(box, ctx, p){
    const V = ctx.V, moi = ctx.moi, R = V.R, hp = box.querySelector("#hp"), hcBox = box.querySelector("#hcBox");
    let o = box._ouvert;
    if((o === "contrat" && !V.contrat) || (o === "roles" && !V.roles) || (o === "mot" && !V.mot)) o = box._ouvert = null;
    hp.hidden = !o || o === "contrat";
    hcBox.hidden = o !== "contrat";
    if(o === "contrat"){
      // Le Contrat dans sa boîte à lui : redessiné seulement si son état change (le dossier tenu reste ouvert)
      const hc = box.querySelector("#hc"), cle = JSON.stringify([V.contrat, p.c, ctx.hote]);
      if(hc._k !== cle){
        hc._k = cle;
        CONTRAT().rendre(hc, {V: V.contrat, P: p.c, R: V.contrat.R, hote: ctx.hote, moi, esc, local: false, commun: false,
          maintenant: ctx.maintenant, envoyer: a => ctx.envoyer({t: "%", a}), attente: () => false,
          finHtml: () => ctx.hote ? `<div class="so-actions"><button class="btn ghost" data-so="#contrat">🗡️ Fermer Le Contrat</button></div>` : ""});
      }
      return;
    }
    if(!o){ hp._k = null; hp.innerHTML = ""; return; }
    const cle = JSON.stringify([o, V.gorg, V.roles, V.regles, V.mot, p.w, V.J, ctx.hote, box._motVu]);
    if(hp._k === cle) return;
    hp._k = cle;
    let h = "";
    if(o === "gorg"){
      const l = V.J.filter(j => !j.parti || V.gorg[j.id]).slice().sort((a, b) => (V.gorg[b.id] || 0) - (V.gorg[a.id] || 0));
      h = `<h3>🍺 Compteur de la soirée</h3>
        <ol class="ap-res">${l.map(j => `<li class="${j.id === moi ? "moi" : ""}"><span class="av">${esc(j.av)}</span><span class="n">${esc(j.nom)}</span><b>${V.gorg[j.id] || 0}</b></li>`).join("")}</ol>
        <div class="so-actions"><button class="btn" data-h="plus">＋1 pour moi</button><button class="btn ghost" data-h="moins">−1</button></div>
        <p class="so-note">Compté tout seul quand un jeu désigne quelqu'un. Ajoute toi-même le reste (gorgées distribuées, règles…). En ${R.boisson === "soft" ? "gages" : "gorgées"}.</p>`;
    }else if(o === "roles"){
      const mien = ROLES.find(r => V.roles[r.k] === moi);
      h = `<h3>🎭 Rôles de la soirée</h3>
        ${mien ? `<div class="h-role"><b>${mien.e} Tu es ${esc(mien.nom)}</b><p>${esc(mien.txt)}</p>
          <p class="muted" style="margin:6px 0 2px">🎯 ${esc(mien.btn)} :</p>${choixJoueurs(V, moi, "data-pris")}</div>` : ""}
        <ul class="h-liste">${ROLES.filter(r => V.roles[r.k] && r !== mien).map(r => `<li><b>${r.e} ${esc(r.nom)} : ${esc(nomDe(V, V.roles[r.k]))}</b><br><span class="muted">${esc(r.txt)}</span></li>`).join("")}</ul>
        <p class="so-note">Les rôles changent tous les 3 jeux.</p>
        ${ctx.hote ? `<div class="so-actions"><button class="btn ghost petit" data-h="roles-re">🔄 Redistribuer</button><button class="btn ghost petit" data-h="roles-off">⏹ Arrêter les rôles</button></div>` : ""}`;
    }else if(o === "regles"){
      h = `<h3>📜 Règles en cours</h3>
        ${V.regles.length ? `<ul class="h-liste">${V.regles.map(r => `<li><span>${esc(r.t)} <span class="muted">· ${esc(nomDe(V, r.par))}</span></span>${ctx.hote || r.par === moi ? `<button class="h-x" data-x="${r.i}" title="Retirer">✕</button>` : ""}</li>`).join("")}</ul>`
          : `<p class="muted">Aucune règle pour l'instant. Le Trône ou la Roulette en inventent : notez-les ici pour que personne n'oublie.</p>`}
        <div class="so-ligne"><input class="champ" id="hRegle" maxlength="120" placeholder="Ex. : interdit de dire « boire »" autocomplete="off"><button class="btn ghost" data-h="regle">＋</button></div>`;
    }else if(o === "mot"){
      const pts = V.mot.pts || {};
      h = `<h3>🤐 Mot interdit</h3>
        ${p.w ? `<button class="h-mot ${box._motVu ? "vu" : ""}" data-h="voir">${box._motVu ? `Ton mot : <b>${esc(p.w)}</b>` : "👁️ Touche pour voir ton mot (cache l'écran)"}</button>
          <p class="so-note">Les autres ne doivent pas dire ton mot. Fais-leur dire, puis désigne qui l'a dit : 2 ${unite(R, 2)} pour lui, et tu reçois un nouveau mot.</p>
          <p class="muted" style="margin:6px 0 2px">🎯 Qui a dit ton mot ?</p>${choixJoueurs(V, moi, "data-piege")}` : `<p class="muted">Tu n'as pas de mot pour l'instant.</p>`}
        ${Object.keys(pts).length ? `<p class="so-note">🏆 ${V.J.filter(j => pts[j.id]).sort((a, b) => pts[b.id] - pts[a.id]).map(j => `${esc(j.nom)} ${pts[j.id]}`).join(" · ")}</p>` : ""}
        ${V.mot.vieux.length ? `<p class="so-note">Mots déjà tombés : ${V.mot.vieux.map(esc).join(", ")}</p>` : ""}
        ${ctx.hote ? `<div class="so-actions"><button class="btn ghost petit" data-h="mot-off">⏹ Arrêter le mot interdit</button></div>` : ""}`;
    }
    hp.innerHTML = h;
    const env = a => ctx.envoyer(a);
    hp.querySelectorAll("[data-h]").forEach(b => b.onclick = () => {
      const k = b.dataset.h;
      if(k === "plus") env({t: "#plus", n: 1});
      else if(k === "moins") env({t: "#plus", n: -1});
      else if(k === "roles-re") env({t: "#roles", on: true});
      else if(k === "roles-off"){ if(confirm("Arrêter les rôles ?")) env({t: "#roles", on: false}); }
      else if(k === "mot-off"){ if(confirm("Arrêter le mot interdit ?")) env({t: "#mot", on: false}); }
      else if(k === "voir"){ box._motVu = !box._motVu; box._re(); }
      else if(k === "regle"){ const i = hp.querySelector("#hRegle"); if(i.value.trim()){ env({t: "#regle", x: i.value}); i.value = ""; } }
    });
    const champ = hp.querySelector("#hRegle");
    if(champ) champ.onkeydown = e => { if(e.key === "Enter") hp.querySelector('[data-h="regle"]').click(); };
    hp.querySelectorAll("[data-x]").forEach(b => b.onclick = () => env({t: "#regle-x", i: +b.dataset.x}));
    hp.querySelectorAll("[data-pris]").forEach(b => b.onclick = () => {
      const r = ROLES.find(x => V.roles[x.k] === moi);
      if(r && confirm(`${b.textContent.trim()} boit ${r.n} ?`)) env({t: "#pris", r: r.k, c: b.dataset.pris});
    });
    hp.querySelectorAll("[data-piege]").forEach(b => b.onclick = () => {
      if(confirm(`${b.textContent.trim()} a dit ton mot ?`)){ box._motVu = false; env({t: "#piege", c: b.dataset.piege}); }
    });
  }

  /* ---------- Menu des jeux ou jeu en cours ---------- */
  function arreterJeu(hj){
    if(hj._stop){ try{ hj._stop(); }catch(e){} }
    hj._stop = null; hj._phase = null; hj._k = null; hj.innerHTML = ""; hj.className = "hj";
  }

  function principal(box, ctx, p){
    const V = ctx.V, hm = box.querySelector("#hm"), hj = box.querySelector("#hj");
    const cur = V.cur;
    if(!cur){
      if(hj._n != null){ arreterJeu(hj); hj._n = null; }
      menu(box, ctx);
      return;
    }
    const c = cfg(cur.s);
    if(hj._n !== cur.n){ arreterJeu(hj); hj._n = cur.n; hj.className = "hj g-" + cur.s; box._passe = null; window.scrollTo(0, 0); }
    // bandeau du jeu en cours
    const tete = `<div class="h-tete"><span class="t">${c.entete.emoji} ${esc(c.titre)}</span><button class="btn ghost petit" data-m="aide">❓</button>${ctx.hote ? `<button class="btn ghost petit" data-m="menu">🍻 Autre jeu</button>` : ""}</div>`;
    if(hm._h !== tete){
      hm._h = tete; hm.innerHTML = tete;
      hm.querySelectorAll("[data-m]").forEach(b => b.onclick = () => {
        if(b.dataset.m === "aide") Base.fenetre(c.entete.emoji + " " + c.titre, c.entete.aide, {html: true, bouton: "Compris"});
        else if(confirm("Arrêter ce jeu et revenir au menu ?")) ctx.envoyer({t: "#menu"});
      });
    }
    const finHtml = () => ctx.hote
      ? `<div class="so-actions"><button class="btn so-gros" data-so="#rejouer">🔁 Rejouer</button><button class="btn ghost" data-so="#menu">🍻 Autre jeu</button></div>`
      : `<p class="so-note" style="text-align:center">⏳ L'hôte choisit la suite…</p>`;

    if(cur.loc){
      if(!ctx.hote || !HG || !HG.cur){
        Apero.phase(hj, "attente:" + cur.n, () => {
          hj.innerHTML = `<section class="b-carte ap-passe"><div class="ap-av">${c.entete.emoji}</div><h2>${esc(c.titre)}</h2>
            <p>Ce jeu se joue sur le téléphone de <b>${esc(nomDe(V, V.hote))}</b> : approchez-vous, il passe de main en main.</p>
            <p class="muted">Ton téléphone garde le compteur, ton contrat et ton mot interdit.</p></section>`;
        });
        return;
      }
      locale(hj, ctx, c, finHtml, box);
      return;
    }
    const sub = {V: cur.V, P: p.s, R: cur.V.R, hote: ctx.hote, moi: ctx.moi, esc, local: false, commun: false,
      maintenant: ctx.maintenant, envoyer: ctx.envoyer, attente: ctx.attente, finHtml};
    const cle = JSON.stringify([cur.V, p.s, ctx.hote]);
    if(hj._k === cle) return;
    hj._k = cle;
    c.rendre(hj, sub);
  }

  /* jeu à un seul téléphone, chez l'hôte : comme le mode 📱 d'apero.js */
  function locale(hj, ctx, c, finHtml, box){
    const sg = HG.cur.G;
    const ids = (c.attendus ? c.attendus(sg) : null) || [];
    const qui = ids[0] || null;
    if(qui && box._passe !== qui){
      const j = sg.J.find(x => x.id === qui);
      hj._k = null;
      Apero.phase(hj, "passe:" + qui + ":" + HG.cur.v, () => {
        hj.innerHTML = `<div class="b-carte ap-passe"><p class="muted">📱 Passe le téléphone à</p><div class="ap-av">${esc(j ? j.av : "🙂")}</div>
          <h2>${esc(j ? j.nom : "?")}</h2><p class="muted">Les autres, ne regardez pas l'écran !</p><button class="btn so-gros">C'est moi, j'y vais</button></div>`;
        hj.querySelector("button").onclick = () => { box._passe = qui; box._re(); };
      });
      return;
    }
    if(!qui) box._passe = null;
    const moi = qui || sg.J[0].id;
    const cle = JSON.stringify([HG.cur.n, HG.cur.v, moi]);
    if(hj._k === cle) return;
    hj._k = cle;
    c.rendre(hj, {
      V: Object.assign(c.publique(sg), {_id: sg._id}), P: c.privee ? c.privee(sg, moi) : null, R: sg.R, hote: true, moi, local: true, commun: !qui, esc,
      maintenant: () => Date.now(), envoyer: a => ctx.envoyer({t: "#loc", m: moi, a}), attente: () => false, finHtml
    });
  }

  function menu(box, ctx){
    const V = ctx.V, hm = box.querySelector("#hm"), n = V.J.filter(j => !j.parti).length;
    const choix = box._choix;
    const cle = JSON.stringify([V.Rj, n, ctx.hote, choix, !!V.contrat, !!V.roles, !!V.mot, V.ia, V.R]);
    if(hm._h === cle) return;
    hm._h = cle;
    const dispo = s => { const c = cfg(s); return c && !(c.ia && !V.ia); };
    const carte = s => {
      const c = cfg(s), manque = n < (c.min || 2), trop = n > (c.max || 99);
      return `<button class="h-jeu ${choix === s ? "on" : ""}" data-j="${s}" ${!ctx.hote || manque || trop ? "disabled" : ""}>
        <span class="e">${c.entete.emoji}</span><span class="t"><b>${esc(c.titre)}</b><small>${esc((c.hero && c.hero.texte) || "")}</small>
        <small class="m">${c.multi === false ? "📱 sur le téléphone de l'hôte" : "📱📱 chacun le sien"}${manque ? ` · ${c.min} joueurs minimum` : ""}${trop ? ` · ${c.max} joueurs maximum` : ""}</small></span></button>
        ${choix === s ? reglages(s, V) : ""}`;
    };
    const fond = (k, on, titre, desc, min) => `<div class="h-fond"><span><b>${titre}</b><small>${desc}</small></span>
      ${ctx.hote ? `<button class="btn ${on ? "ghost" : ""} petit" data-f="${k}" data-on="${on ? "" : "1"}" ${!on && n < (min || 2) ? "disabled" : ""}>${on ? "⏹ Arrêter" : "▶️ Lancer"}</button>` : `<span class="so-val">${on ? "✅ En cours" : "—"}</span>`}</div>`;
    hm.innerHTML = `<section class="b-carte">
        <h2 style="margin:0 0 4px;text-align:center">🍻 ${ctx.hote ? "Choisis le prochain jeu" : "Prochain jeu…"}</h2>
        ${ctx.hote ? "" : `<p class="so-attente">⏳ ${esc(nomDe(V, V.hote))} choisit le prochain jeu</p>`}
        <div class="h-jeux">${JEUX.filter(dispo).map(carte).join("")}</div>
      </section>
      <section class="b-carte">
        <h3 style="margin:0">🌙 En fond toute la soirée</h3>
        ${fond("contrat", !!V.contrat, "🗡️ Le Contrat", "Une cible et une mission secrètes, à remplir sans se faire griller.", 3)}
        ${fond("roles", !!V.roles, "🎭 Rôles de soirée", "Maître du pouce, des questions, Trône… redistribués tous les 3 jeux.")}
        ${fond("mot", !!V.mot, "🤐 Mot interdit", "Chacun a un mot secret : piège les autres pour qu'ils le disent.")}
        <p class="so-note">📜 Règles et 🍺 compteur sont toujours là, dans le bandeau du haut.</p>
      </section>`;
    hm.querySelectorAll("[data-j]").forEach(b => b.onclick = () => {
      const s = b.dataset.j, c = cfg(s);
      if((c.reglages || []).length){ box._choix = choix === s ? null : s; box._re(); }
      else lancerJeu(s);
    });
    const lancerJeu = s => { Apero.audio(); Apero.eveil(); box._choix = null; ctx.envoyer({t: "#jeu", s}); };
    hm.querySelectorAll("[data-go]").forEach(b => b.onclick = () => lancerJeu(b.dataset.go));
    hm.querySelectorAll("[data-rk]").forEach(b => b.onclick = () => ctx.envoyer({t: "#reg", s: choix, k: b.dataset.rk, v: b.dataset.rv}));
    hm.querySelectorAll("[data-f]").forEach(b => b.onclick = () => {
      const on = !!b.dataset.on;
      if(!on && !confirm("Arrêter ce jeu de fond pour tout le monde ?")) return;
      Apero.audio(); ctx.envoyer({t: "#" + b.dataset.f, on});
    });
  }
  function reglages(s, V){
    const c = cfg(s), Rj = V.Rj[s] || {};
    return `<div class="h-reg">${(c.reglages || []).filter(r => r.options).map(r => {
      const v = Rj[r.k] === undefined ? r.def : Rj[r.k];
      return `<div class="so-bloc"><b>${esc(r.titre)}</b><div class="pilules">${r.options.map(([x, l]) => `<button data-rk="${r.k}" data-rv="${esc(String(x))}" class="${x === v ? "on" : ""}">${esc(l)}</button>`).join("")}</div></div>`;
    }).join("")}<div class="so-actions"><button class="btn so-gros" data-go="${s}">▶️ Lancer ${esc(c.titre)}</button></div></div>`;
  }

  /* un seul téléphone ? les jeux un par un */
  const menuSalle = document.getElementById("soMenu");
  if(menuSalle){
    const seuls = JEUX.concat(["contrat"]).filter(s => cfg(s) && cfg(s).local !== false);
    const d = Base.el("div", null, "h-seul");
    d.innerHTML = `<p class="so-note">📱 <b>Un seul téléphone ?</b> Joue aux jeux un par un : ${seuls.map(s => `<a href="../${s}/">${cfg(s).entete.emoji} ${esc(cfg(s).titre)}</a>`).join(" · ")}</p>`;
    menuSalle.appendChild(d);
  }
})();
