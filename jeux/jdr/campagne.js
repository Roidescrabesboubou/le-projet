/* ============================================================
   TABLE DE LÉGENDES — carnets de campagne du maître du jeu
   - Une campagne = cartes (avec objets posés dessus), PNJ (fiche,
     ressenti envers chaque héros, souvenirs), lore, créatures,
     rencontres préparées et notes.
   - Tout reste sur l'appareil du MJ (localStorage) : rien n'est
     envoyé aux joueurs tant que le MJ ne le montre pas (une carte
     affichée part sans ses objets cachés ni ses notes secrètes).
   - Export / import en fichier JSON pour changer d'appareil.
   ============================================================ */
const Camp = (() => {
  const CLE = "jdr_camps", CLE_A = "jdr_campActive";
  const nid = () => Math.random().toString(36).slice(2, 10);
  const lire = (k, d) => { try{ const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); }catch(e){ return d; } };
  const ecrireCle = (k, v) => { try{ localStorage.setItem(k, JSON.stringify(v)); return true; }catch(e){ return false; } };
  let camps = lire(CLE, null), v = 0;

  const vide = (nom, u) => ({id: nid(), nom: nom || "Ma campagne", u: JDR.UNIV[u] ? u : "fantasy", cartes: {}, monstres: [], pnj: [], lore: [], rencontres: [], notes: "", maj: Date.now()});
  function reparer(c){
    if(!c || typeof c !== "object") return null;
    const r = vide(String(c.nom || "Campagne").slice(0, 40), c.u);
    r.id = String(c.id || r.id).slice(0, 12);
    for(const [n, k] of Object.entries(c.cartes && typeof c.cartes === "object" ? c.cartes : {})){
      const l = Array.isArray(k) ? k : k && k.l;
      if(Array.isArray(l) && l.length) r.cartes[String(n).slice(0, 50)] = {l: l.map(String), o: k && Array.isArray(k.o) ? k.o.filter(o => o && typeof o === "object") : []};
    }
    ["monstres", "pnj", "lore", "rencontres"].forEach(k => { if(Array.isArray(c[k])) r[k] = c[k].filter(x => x && typeof x === "object"); });
    r.pnj.forEach(p => {
      p.id = String(p.id || nid()); p.nom = String(p.nom || "PNJ"); p.emo = String(p.emo || "🧑");
      p.souvenirs = Array.isArray(p.souvenirs) ? p.souvenirs.filter(s => s && s.t) : [];
      p.avis = p.avis && typeof p.avis === "object" && !Array.isArray(p.avis) ? p.avis : {};
      p.attitude = Math.max(-3, Math.min(3, parseInt(p.attitude) || 0));
    });
    r.lore.forEach(x => { x.id = String(x.id || nid()); x.titre = String(x.titre || "Sans titre"); x.txt = String(x.txt || ""); });
    r.rencontres = r.rencontres.filter(x => Array.isArray(x.liste));
    r.notes = String(c.notes || "");
    r.maj = +c.maj || Date.now();
    return r;
  }

  // Première fois : reprend l'ancienne « bibliothèque » du MJ (cartes, créatures, notes)
  if(!camps || typeof camps !== "object"){
    camps = {};
    const old = lire("jdr_mjlib", null), notes = lire("jdr_mjnotes", "");
    const aOld = old && (Object.keys(old.cartes || {}).length || (old.monstres || []).length);
    const c = vide(aOld || notes ? "Ma bibliothèque" : "Ma première campagne");
    if(old){
      for(const [n, l] of Object.entries(old.cartes || {})) if(Array.isArray(l) && l.length) c.cartes[n] = {l, o: []};
      if(Array.isArray(old.monstres)) c.monstres = old.monstres;
    }
    c.notes = typeof notes === "string" ? notes : "";
    camps[c.id] = c;
    ecrireCle(CLE, camps); ecrireCle(CLE_A, c.id);
  }
  for(const k of Object.keys(camps)){ const r = reparer(camps[k]); if(r) camps[k] = r; else delete camps[k]; }

  function ecrire(){
    v++;
    if(!ecrireCle(CLE, camps)) Base.toast("⚠️ Plus de place pour sauvegarder : exporte puis supprime une vieille campagne.", 6000);
  }
  const liste = () => Object.values(camps).sort((a, b) => b.maj - a.maj);
  function creer(nom, u){ const c = vide(String(nom || "").trim().slice(0, 40) || "Nouvelle campagne", u); camps[c.id] = c; ecrire(); choisir(c.id); return c; }
  function active(){
    let id = lire(CLE_A, null);
    if(!camps[id]){ const l = liste(); id = l.length ? l[0].id : creer("Ma première campagne").id; ecrireCle(CLE_A, id); }
    return camps[id];
  }
  function choisir(id){ if(camps[id]){ ecrireCle(CLE_A, id); v++; } }
  function sauver(){ active().maj = Date.now(); ecrire(); }
  function supprimer(id){ delete camps[id]; ecrire(); active(); }
  function exporter(c){
    c = c || active();
    const blob = new Blob([JSON.stringify({tableDeLegendes: 1, date: new Date().toISOString(), campagne: c}, null, 1)], {type: "application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "campagne-" + (c.nom.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase().replace(/^-|-$/g, "") || "jdr") + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }
  function importer(o){
    const c = reparer(o && o.campagne ? o.campagne : o);
    if(!c) throw new Error("fichier de campagne illisible");
    c.id = nid();
    if(liste().some(x => x.nom === c.nom)) c.nom = (c.nom + " (importée)").slice(0, 40);
    c.maj = Date.now();
    camps[c.id] = c; ecrire(); choisir(c.id);
    return c;
  }
  return {liste, active, choisir, creer, sauver, supprimer, exporter, importer, nid, get version(){ return v; }};
})();
const camp = () => Camp.active();

/* ---------- Objets posés sur les cartes ---------- */
const ASSETS = [
  ["Mobilier", "🪑 🛏️ 🚪 🪟 🕯️ 🔦 🏺 🛢️ 📦 🧰 🪞 🖼️ 🗄️ ⚱️ 🛋️ 🍺 🍖"],
  ["Nature", "🌲 🌳 🌴 🌵 🪨 🌾 🍄 🌸 🪵 💧 🔥 ❄️ 🌋 🌊"],
  ["Trésors", "💰 💎 🗝️ 📜 📖 🧪 ⚔️ 🛡️ 🏹 🪄 💍 👑 🗡️ 🧭 🔮"],
  ["Dangers", "🕳️ ⚠️ 🕸️ ☠️ 💀 🦴 ⛓️ 🧨 ☢️ ⚡ 🩸"],
  ["Lieux", "⛲ 🗿 🏛️ ⛺ 🪦 ⚰️ 🗼 🚩 🏴 ⛩️ 🛖 🪧 🔔"],
  ["Personnages", "🧙 🧝 🧛 🧟 👸 🤴 🧔 👵 👴 💂 🥷 🤖 🐴 🐕 🐈 🦉 🐉"]
];
const EMOS_PNJ = ["🧑", "👩", "👨", "🧔", "👵", "👴", "👸", "🤴", "🧙", "🧝", "🧛", "🧚", "💂", "🥷", "🕵️", "👩‍🔬", "🤖", "👽", "🐉", "🦊", "😈"];
const CATS_LORE = [["lieu", "🏰", "Lieu"], ["faction", "⚜️", "Faction"], ["histoire", "📜", "Histoire"], ["quete", "🎯", "Quête"], ["objet", "💎", "Objet"], ["autre", "📝", "Autre"]];
const catLore = k => CATS_LORE.find(c => c[0] === k) || CATS_LORE[5];
const ATTITUDES = [[-3, "😡", "Hostile"], [-2, "😠", "Méfiant"], [-1, "😒", "Réservé"], [0, "😐", "Neutre"], [1, "🙂", "Amical"], [2, "😊", "Allié"], [3, "🥰", "Dévoué"]];
const attitude = n => ATTITUDES[Math.max(-3, Math.min(3, Math.round(+n || 0))) + 3];
const aujourdhui = () => new Date().toLocaleDateString("fr-FR", {day: "numeric", month: "short"});

/* Côté hôte : ce qu'on accepte d'une carte envoyée par le MJ (jamais de note secrète ni d'objet caché) */
function nettoyerObjets(o, W, H){
  const vus = new Set(), r = [];
  for(const x of Array.isArray(o) ? o : []){
    if(!x || typeof x !== "object" || x.c) continue;
    const ox = parseInt(x.x), oy = parseInt(x.y), k = ox + "," + oy;
    if(!(ox >= 0 && oy >= 0 && ox < W && oy < H) || vus.has(k)) continue;
    vus.add(k);
    r.push({id: String(x.id || uid()).slice(0, 12), x: ox, y: oy, e: String(x.e || "❓").slice(0, 12), n: String(x.n || "").slice(0, 40), t: String(x.t || "").slice(0, 200), b: !!x.b, p: String(x.p || "").slice(0, 12)});
    if(r.length >= 80) break;
  }
  return r;
}
/* Côté MJ : version « joueurs » d'une liste d'objets */
const pubObjets = o => (o || []).filter(x => x && !x.c).map(({c, s, ...r}) => r);

/* Carte de la campagne (créée à partir de celle de la partie si besoin) */
function carteCamp(nom, creer){
  const C = camp();
  if(!C.cartes[nom] && creer && G && G.cartes[nom]) C.cartes[nom] = {l: G.cartes[nom].slice(), o: (G.objets && G.objets[nom] || []).map(x => ({...x}))};
  return C.cartes[nom] || null;
}
/* Modifie une carte de la campagne et, si elle existe dans la partie, met la partie à jour (sans changer de lieu) */
function majCarteCamp(nom, f){
  const k = carteCamp(nom, true); if(!k) return;
  f(k); Camp.sauver();
  if(G && G.cartes[nom] && estMJ()) mj({t: "carte", nom, l: k.l, o: pubObjets(k.o), voir: false});
}

/* ---------- Contexte donné à l'IA (seulement pour le MJ) ---------- */
function contexteMJ(jeu){
  const C = camp(), U = UNIV[jeu ? G.u : C.u] || UNIV.fantasy;
  const recent = jeu ? recents(18) : "";
  const cite = s => recent && s && recent.toLowerCase().includes(String(s).toLowerCase().split(" ")[0]);
  let t = `UNIVERS : ${U.nom} — ${U.ambiance}\nCAMPAGNE : ${C.nom}\n`;
  if(jeu){
    t += `HÉROS : ${G.heros.map(h => `${h.nom} (${h.ori} ${classe(h).nom} niv ${h.niv}, PV ${h.pv}/${h.pvMax})${h.bg ? " — " + h.bg.slice(0, 140) : ""}`).join(" ; ")}\n`;
    t += `LIEU ACTUEL : ${G.lieu || G.carte || "?"}\n`;
    const objs = (G.objets && G.objets[G.carte] || []).filter(o => o.n).map(o => o.e + " " + o.n);
    if(objs.length) t += `Sur la carte : ${objs.join(", ")}\n`;
  }
  const pnj = C.pnj.slice(0, 25);
  if(pnj.length){
    const ici = new Set((jeu && G.objets && G.objets[G.carte] || []).map(o => o.p).filter(Boolean));
    t += "PNJ DE LA CAMPAGNE :\n" + pnj.map(p => {
      const detail = ici.has(p.id) || cite(p.nom);
      let s = `- ${p.nom}${p.role ? " (" + p.role + ")" : ""}, attitude ${attitude(p.attitude)[2].toLowerCase()}`;
      if(detail){
        if(p.perso) s += ` ; caractère : ${p.perso.slice(0, 160)}`;
        if(p.but) s += ` ; veut : ${p.but.slice(0, 120)}`;
        if(p.secret) s += ` ; secret : ${p.secret.slice(0, 120)}`;
        const av = Object.entries(p.avis || {}).map(([n, a]) => `${n} ${a.v > 0 ? "+" : ""}${a.v}${a.n ? " (" + a.n.slice(0, 50) + ")" : ""}`);
        if(av.length) s += ` ; envers les héros : ${av.join(", ")}`;
        if(p.souvenirs.length) s += ` ; souvenirs : ${p.souvenirs.slice(-5).map(x => x.t).join(" / ").slice(0, 400)}`;
      }
      return s;
    }).join("\n") + "\n";
  }
  if(C.lore.length){
    const lieu = jeu ? (G.carte || G.lieu || "") : "";
    const tri = C.lore.slice().sort((a, b) => ((b.carte && b.carte === lieu) || cite(b.titre) ? 1 : 0) - ((a.carte && a.carte === lieu) || cite(a.titre) ? 1 : 0));
    let lore = "", n = 0;
    for(const x of tri){
      const s = `- [${catLore(x.cat)[2]}] ${x.titre} : ${x.txt.slice(0, 500)}\n`;
      if(n + s.length > 2600) break;
      lore += s; n += s.length;
    }
    t += "LORE (connu du MJ seulement) :\n" + lore;
  }
  if(C.notes.trim()) t += "NOTES DU MJ : " + C.notes.trim().slice(0, 700) + "\n";
  if(recent) t += "DERNIERS ÉVÉNEMENTS :\n" + recent + "\n";
  return t;
}
async function iaTexte(system, user, max){
  return String(await IA.appeler({system, json: false, max: max || 900, messages: [{role: "user", content: user}]}) || "").trim();
}
async function iaJson(system, user, max){
  const o = IA.json(await IA.appeler({system, json: true, max: max || 900, messages: [{role: "user", content: user}]}));
  if(!o || typeof o !== "object") throw new Error("réponse illisible, réessaie");
  return o;
}
const reCamp = () => rafraichirMJ(ctxMJ);

/* ---------- Assistant IA du MJ ---------- */
const RAPIDES_JEU = [
  ["🌀 Rebondissement", "Propose un rebondissement surprenant mais cohérent pour la suite immédiate de la scène."],
  ["🧑 PNJ improvisé", "Invente un PNJ qui pourrait surgir ici : nom, apparence, façon de parler, ce qu'il veut, un secret."],
  ["🏞️ Décrire le lieu", "Écris une description d'ambiance du lieu actuel (3 à 4 phrases au présent), prête à être lue aux joueurs."],
  ["⚔️ Rencontre", "Propose une rencontre adaptée au niveau du groupe et au lieu : quelles créatures, combien, leur tactique, et un moyen de l'éviter."],
  ["🧩 Énigme", "Propose une énigme ou un mécanisme à résoudre ici, avec la solution et 2 indices progressifs."],
  ["🤔 Que faire ?", "Les joueurs semblent bloqués. Donne-moi 3 pistes pour relancer l'action sans leur mâcher le travail."],
  ["📋 Résumé", "Résume la session jusqu'ici en 5 à 8 puces (faits importants, PNJ croisés, indices, promesses) pour mes notes."]
];
const RAPIDES_PREP = [
  ["💡 Intrigue", "Propose une intrigue de campagne en 3 actes adaptée à cet univers, avec un antagoniste et ses motivations."],
  ["🏰 Lieu", "Invente un lieu marquant pour cette campagne : ambiance, ce qu'on y trouve, un danger, un secret."],
  ["⚜️ Faction", "Invente une faction : son but, son chef, ses méthodes, ce qu'elle peut offrir ou demander aux héros."],
  ["🧑 PNJ", "Invente un PNJ mémorable : nom, apparence, façon de parler, ce qu'il veut, un secret."],
  ["🧩 Énigme", "Propose une énigme pour un donjon, avec la solution et 2 indices progressifs."],
  ["📜 Légende", "Écris une légende locale (5 à 7 phrases) que des villageois pourraient raconter, avec un fond de vérité."]
];
async function assistant(q, jeu){
  q = String(q || "").trim(); if(!q || MJ.aEnCours) return;
  MJ.aEnCours = true; MJ.aQ = ""; reCamp();
  try{
    const r = await iaTexte(`Tu es l'assistant privé d'un maître du jeu humain qui anime un jeu de rôle façon Donjons & Dragons, tout public. Seul le MJ lit tes réponses. Réponds en français, concret et directement utilisable, en moins de 180 mots sauf demande contraire, en texte simple (pas de titres ni de markdown, des tirets pour les listes). Respecte le contexte ci-dessous et ne contredis jamais ce qui s'est passé.\n\n${contexteMJ(jeu)}`, q, 1000);
    MJ.aR.push({q: q.slice(0, 140), r: r.slice(0, 4000)});
    MJ.aR = MJ.aR.slice(-6);
  }catch(e){ Base.toast("❌ " + String(e.message || e).slice(0, 120)); }
  MJ.aEnCours = false; reCamp();
}

/* ---------- PNJ : IA ---------- */
const fichePnjTxt = p => `${p.nom}${p.role ? " (" + p.role + ")" : ""}\nApparence : ${p.apparence || "?"}\nCaractère et façon de parler : ${p.perso || "?"}\nCe qu'il veut : ${p.but || "?"}\nSecret : ${p.secret || "aucun"}\nAttitude générale : ${attitude(p.attitude)[2]}\nCe qu'il pense des héros : ${Object.entries(p.avis || {}).map(([n, a]) => `${n} : ${attitude(a.v)[2]}${a.n ? " (" + a.n + ")" : ""}`).join(" ; ") || "ne les connaît pas"}\nSouvenirs : ${p.souvenirs.slice(-10).map(s => s.t).join(" / ") || "aucun"}`;

async function pnjParler(p, sit){
  Base.toast(`🗣️ ${p.nom} réfléchit…`, 6000);
  try{
    const o = await iaJson(`Tu joues un PNJ dans un jeu de rôle tout public. Reste fidèle à sa fiche, à son ressenti envers chaque héros et à ses souvenirs (il s'en sert, il peut y faire allusion). Il ne révèle son secret que si c'est vraiment logique.\n\nFICHE :\n${fichePnjTxt(p)}\n\nCONTEXTE :\n${contexteMJ(true)}\nRéponds seulement en JSON {"geste":"court geste ou expression, sans le nom","replique":"1 à 3 phrases, à la première personne"}.`,
      sit ? "Situation / ce qu'on lui dit : " + sit : "Fais-le réagir à la scène actuelle.", 600);
    const rep = String(o.replique || "").trim(); if(!rep) throw new Error("pas de réplique");
    const ligne = `${p.emo} ${p.nom}${o.geste ? " (" + String(o.geste).trim().replace(/\.$/, "") + ")" : ""} : « ${rep} »`;
    MJ.recit = (MJ.recit.trim() ? MJ.recit.trim() + "\n" : "") + ligne;
    MJ.onglet = "recit"; reCamp();
    Base.toast("Réplique ajoutée dans 📜 Récit : relis-la avant d'envoyer.");
  }catch(e){ Base.toast("❌ " + String(e.message || e).slice(0, 120)); }
}

async function pnjCompleter(p, idee){
  const C = camp(), U = UNIV[G && enJeu ? G.u : C.u] || UNIV.fantasy;
  const o = await iaJson(`Tu aides un maître du jeu à créer un PNJ marquant pour un jeu de rôle tout public. Univers : ${U.nom} — ${U.ambiance}. Campagne : ${C.nom}.${C.lore.length ? " Lore : " + C.lore.slice(0, 8).map(x => x.titre + " : " + x.txt.slice(0, 120)).join(" | ") : ""}\nGarde ce que le MJ a déjà écrit, complète le reste. Réponds seulement en JSON {"nom":"…","emo":"un seul emoji","role":"son rôle en 2 à 5 mots","apparence":"1 à 2 phrases","perso":"caractère et façon de parler, 1 à 2 phrases","but":"ce qu'il veut","secret":"un secret utile pour l'intrigue","niv":1}.`,
    "Fiche actuelle :\n" + fichePnjTxt(p) + (idee ? "\nIdée du MJ : " + idee : ""), 700);
  ["nom", "role", "apparence", "perso", "but", "secret"].forEach(k => { if(o[k] && !String(p[k] || "").trim()) p[k] = String(o[k]).slice(0, k === "nom" ? 30 : k === "role" ? 50 : 300); });
  if(o.emo && (!p.emo || p.emo === "🧑")) p.emo = String(o.emo).slice(0, 8);
  if(!p.niv && parseInt(o.niv)) p.niv = clamp(parseInt(o.niv), 1, 10);
  return p;
}

/* Propose (sans rien enregistrer) les nouveaux souvenirs et le ressenti, puis le MJ valide */
async function pnjMaj(liste){
  if(!liste.length){ Base.toast("Aucun PNJ de ta campagne n'apparaît dans les derniers événements."); return; }
  Base.toast("🧠 L'IA relit la session…", 8000);
  let o;
  try{
    o = await iaJson(`Tu aides un maître du jeu à tenir à jour la mémoire de ses PNJ. À partir des derniers événements, indique pour chaque PNJ ce dont il se souviendra (seulement ce qu'il a vu, entendu ou appris, 0 à 3 souvenirs courts et concrets, au passé, en nommant les héros) et comment son ressenti évolue (de -3 hostile à +3 dévoué) envers chaque héros concerné, avec une raison courte. Ne change rien s'il ne s'est rien passé pour lui.\nHÉROS : ${G.heros.map(h => h.nom).join(", ")}\n\nPNJ :\n${liste.map(p => "### " + fichePnjTxt(p)).join("\n\n")}\n\nRéponds seulement en JSON {"pnj":[{"nom":"…","souvenirs":["…"],"attitude":0,"avis":[{"heros":"Nom","v":1,"pourquoi":"…"}]}]}.`,
      "DERNIERS ÉVÉNEMENTS :\n" + recents(45), 1400);
  }catch(e){ Base.toast("❌ " + String(e.message || e).slice(0, 120)); return; }
  const props = (Array.isArray(o.pnj) ? o.pnj : []).map(x => {
    const n = String(x && x.nom || "").toLowerCase();
    const p = liste.find(p => p.nom.toLowerCase() === n) || liste.find(p => n && (p.nom.toLowerCase().includes(n) || n.includes(p.nom.toLowerCase()))) || (liste.length === 1 ? liste[0] : null);
    if(!p) return null;
    const sv = (Array.isArray(x.souvenirs) ? x.souvenirs : []).map(s => String(s).trim().slice(0, 200)).filter(Boolean).slice(0, 4);
    const av = (Array.isArray(x.avis) ? x.avis : []).map(a => { const h = trouverHeros(a && a.heros); return h ? {nom: h.nom, v: clamp(parseInt(a.v) || 0, -3, 3), n: String(a.pourquoi || "").slice(0, 80)} : null; }).filter(Boolean);
    const at = x.attitude == null ? p.attitude : clamp(parseInt(x.attitude) || 0, -3, 3);
    return sv.length || av.length || at !== p.attitude ? {p, sv, av, at} : null;
  }).filter(Boolean);
  if(!props.length){ Base.toast("Rien de nouveau à retenir pour ces PNJ."); return; }
  const box = Base.el("div");
  box.innerHTML = `<p class="muted" style="margin-top:0">Coche ce que tu veux garder.</p>` + props.map((x, i) => `
    <div class="encart"><b>${esc(x.p.emo)} ${esc(x.p.nom)}</b>
      ${x.sv.map((s, j) => `<label style="display:flex;gap:6px;margin-top:4px"><input type="checkbox" data-sv="${i}:${j}" checked> <span>💭 ${esc(s)}</span></label>`).join("")}
      ${x.at !== x.p.attitude ? `<label style="display:flex;gap:6px;margin-top:4px"><input type="checkbox" data-at="${i}" checked> <span>Attitude : ${attitude(x.p.attitude)[1]} → ${attitude(x.at)[1]} ${esc(attitude(x.at)[2])}</span></label>` : ""}
      ${x.av.map((a, j) => { const avant = (x.p.avis[a.nom] || {v: 0}).v; return `<label style="display:flex;gap:6px;margin-top:4px"><input type="checkbox" data-av="${i}:${j}" checked> <span>${esc(a.nom)} : ${attitude(avant)[1]} → ${attitude(a.v)[1]} <span class="muted">${esc(a.n)}</span></span></label>`; }).join("")}
    </div>`).join("") + `<button class="btn" id="majOk" style="margin-top:10px">💾 Enregistrer dans les fiches</button>`;
  const dlg = Base.fenetre("🧠 Mémoire des PNJ", box, {bouton: "Annuler"});
  box.querySelector("#majOk").onclick = () => {
    const coche = s => { const e = box.querySelector(s); return e && e.checked; };
    props.forEach((x, i) => {
      x.sv.forEach((s, j) => { if(coche(`[data-sv="${i}:${j}"]`)) x.p.souvenirs.push({t: s, d: aujourdhui()}); });
      x.p.souvenirs = x.p.souvenirs.slice(-40);
      if(coche(`[data-at="${i}"]`)) x.p.attitude = x.at;
      x.av.forEach((a, j) => { if(coche(`[data-av="${i}:${j}"]`)) x.p.avis[a.nom] = {v: a.v, n: a.n}; });
    });
    Camp.sauver(); dlg.close(); reCamp();
    Base.toast("Fiches des PNJ mises à jour 🧠");
  };
}
const pnjCites = () => { const r = recents(45).toLowerCase(); return camp().pnj.filter(p => r.includes(p.nom.toLowerCase().split(" ")[0])); };

/* ---------- Onglets du panneau MJ ---------- */
function ongletPnj(jeu){
  const C = camp(), ia = IA.disponible();
  let h = `<div class="ligne"><button class="btn petit" data-c="pnjNouv">➕ Nouveau PNJ</button>${jeu && ia && C.pnj.length ? `<button class="mini" data-c="pnjMajTous" title="L'IA relit les derniers événements et propose de nouveaux souvenirs et ressentis">🧠 Souvenirs de la session</button>` : ""}</div>`;
  if(!C.pnj.length) return h + `<p class="muted" style="font-size:.85rem">Les PNJ importants ont leur fiche : caractère, secret, ce qu'ils pensent de chaque héros et leurs souvenirs de vos rencontres.${ia ? " L'IA peut les faire parler et tenir leur mémoire à jour." : ""}</p>`;
  for(const p of C.pnj){
    const a = attitude(p.attitude), ouvert = MJ.pnjSel === p.id;
    h += `<div class="mjl"><span class="n" data-pnjo="${esc(p.id)}" style="cursor:pointer">${esc(p.emo)} <b>${esc(p.nom)}</b> <span class="muted">${esc(p.role || "")}</span></span><span title="${esc(a[2])}">${a[1]}</span><button class="mini" data-pnjo="${esc(p.id)}">${ouvert ? "▲" : "▼"}</button></div>`;
    if(ouvert) h += fichePnjHtml(p, jeu);
  }
  return h;
}
function fichePnjHtml(p, jeu){
  const ia = IA.disponible();
  const noms = [...new Set([...(jeu ? G.heros.map(h => h.nom) : []), ...Object.keys(p.avis)])];
  const ici = jeu && G.carte && (G.objets && G.objets[G.carte] || []).some(o => o.p === p.id);
  return `<div class="encart" style="margin:4px 0 10px">
    ${p.apparence ? `<div>👁️ ${esc(p.apparence)}</div>` : ""}${p.perso ? `<div>🎭 ${esc(p.perso)}</div>` : ""}${p.but ? `<div>🎯 ${esc(p.but)}</div>` : ""}${p.secret ? `<div>🤫 <i>${esc(p.secret)}</i></div>` : ""}
    <div class="sous">Ressenti — en général : ${attitude(p.attitude)[1]} ${esc(attitude(p.attitude)[2])} <button class="mini" data-att="-1">−</button> <button class="mini" data-att="1">+</button></div>
    ${noms.length ? noms.map(n => { const x = p.avis[n] || {v: 0, n: ""}, a = attitude(x.v); return `<div class="mjl"><span class="n">${a[1]} <b>${esc(n)}</b> <span class="muted">${esc(x.n || a[2])}</span></span><button class="mini" data-avis="${esc(n)}|-1">−</button><button class="mini" data-avis="${esc(n)}|1">+</button></div>`; }).join("") : `<p class="muted" style="margin:0;font-size:.84rem">Il ne connaît encore aucun héros.</p>`}
    <div class="sous">Souvenirs (${p.souvenirs.length})</div>
    ${p.souvenirs.length ? p.souvenirs.slice(-8).map((s, i, t) => `<div style="font-size:.84rem;display:flex;gap:4px;align-items:start"><span style="flex:1">💭 ${esc(s.t)} <span class="muted">${esc(s.d || "")}</span></span><button class="mini" data-supsv="${p.souvenirs.length - t.length + i}">✖</button></div>`).join("") : `<p class="muted" style="margin:0;font-size:.84rem">Aucun pour l'instant.</p>`}
    <div class="ligne" style="margin-top:6px"><input class="champ" id="pnjSouv" maxlength="200" placeholder="Ajouter un souvenir (ex. : les héros l'ont sauvé des loups)" style="flex:1;min-width:150px;padding:6px"><button class="mini" data-c="pnjSouv">➕</button></div>
    ${jeu && ia ? `<div class="ligne" style="margin-top:8px"><input class="champ" id="pnjSit" maxlength="300" placeholder="Que lui dit-on ? (vide = il réagit à la scène)" value="${esc(MJ.pnjSit)}" style="flex:1;min-width:150px;padding:6px"><button class="mini" data-c="pnjParler">🗣️ Faire parler</button></div>` : ""}
    <div class="ligne" style="margin-top:8px">
      <button class="mini" data-c="pnjEdit">✏️ Modifier</button>
      ${jeu ? `<button class="mini" data-c="pnjPresenter" title="Prépare sa description dans 📜 Récit">📢 Présenter</button><button class="mini" data-c="pnjPlacer" ${G.carte ? "" : "disabled"}>${ici ? "❌ Retirer de la carte" : "📍 Sur la carte"}</button>` : ""}
      ${jeu && ia ? `<button class="mini" data-c="pnjMaj">🧠 Mettre à jour (IA)</button>` : ""}
      <button class="mini" data-c="pnjCombat" title="L'ajouter à la rencontre (onglet 👹)">⚔️ En créature</button>
      <button class="mini" data-c="pnjSup">🗑️</button>
    </div></div>`;
}
function ongletLore(jeu){
  const C = camp();
  let h = `<div class="ligne"><button class="btn petit" data-c="loreNouv">➕ Nouvelle entrée</button></div>`;
  if(!C.lore.length) return h + `<p class="muted" style="font-size:.85rem">L'histoire du monde, les lieux, les factions, les quêtes, les objets légendaires… Visible seulement par toi${IA.disponible() ? " (l'assistant IA s'en sert)" : ""}.</p>`;
  for(const [k, emo, nom] of CATS_LORE){
    const l = C.lore.filter(x => (catLore(x.cat)[0]) === k); if(!l.length) continue;
    h += `<div class="sous">${emo} ${nom}</div>`;
    for(const x of l){
      const ouvert = MJ.loreSel === x.id;
      h += `<div class="mjl"><span class="n" data-loreo="${esc(x.id)}" style="cursor:pointer"><b>${esc(x.titre)}</b>${x.carte ? ` <span class="muted">🗺️ ${esc(x.carte)}</span>` : ""}</span><button class="mini" data-loreo="${esc(x.id)}">${ouvert ? "▲" : "▼"}</button></div>`;
      if(ouvert) h += `<div class="encart" style="margin:4px 0 8px;white-space:pre-wrap">${esc(x.txt) || `<span class="muted">(vide)</span>`}<div class="ligne" style="margin-top:8px;white-space:normal"><button class="mini" data-c="loreEdit">✏️ Modifier</button>${jeu ? `<button class="mini" data-c="loreLire" title="Copie le texte dans 📜 Récit">📢 Raconter</button>` : ""}<button class="mini" data-c="loreSup">🗑️</button></div></div>`;
    }
  }
  return h;
}
function ongletAssistant(jeu){
  if(!IA.disponible()) return `<p class="muted">L'assistant a besoin d'une clé IA (gratuite) dans <a href="${Base.RACINE}reglages/">⚙️ Réglages</a>.</p>`;
  const rap = jeu ? RAPIDES_JEU : RAPIDES_PREP;
  return `<p class="muted" style="margin:0 0 6px;font-size:.84rem">Il connaît ${jeu ? "la partie, " : ""}ton lore, tes PNJ et tes notes. Ses réponses ne sont vues que par toi.</p>
    <div class="puces">${rap.map(([t], i) => `<button data-arap="${i}" ${MJ.aEnCours ? "disabled" : ""}>${t}</button>`).join("")}</div>
    <div class="ligne" style="margin-top:8px"><textarea class="champ" id="aQ" rows="2" maxlength="600" placeholder="Demande ce que tu veux : un nom, une réplique, une idée, une règle…" style="flex:1;min-width:160px">${esc(MJ.aQ)}</textarea><button class="btn petit" data-c="aDemander" ${MJ.aEnCours ? "disabled" : ""}>Demander</button></div>
    ${MJ.aEnCours ? `<p class="attente">L'IA réfléchit…</p>` : ""}
    ${MJ.aR.map((x, i) => ({x, i})).reverse().map(({x, i}) => `<div class="encart"><div class="muted" style="font-size:.78rem;font-weight:800">❓ ${esc(x.q)}</div><div style="white-space:pre-wrap;margin-top:3px">${esc(x.r)}</div>
      <div class="ligne" style="margin-top:6px">${jeu ? `<button class="mini" data-ares="recit:${i}">📜 Vers le récit</button>` : ""}<button class="mini" data-ares="lore:${i}">📚 Au lore</button><button class="mini" data-ares="notes:${i}">📝 Aux notes</button><button class="mini" data-ares="pnj:${i}">🧑 En faire un PNJ</button><button class="mini" data-ares="x:${i}">✖</button></div></div>`).join("")}`;
}

function lierCamp(box, jeu){
  const q = s => box.querySelectorAll(s), C = camp();
  const pnjSel = () => C.pnj.find(p => p.id === MJ.pnjSel), loreSel = () => C.lore.find(x => x.id === MJ.loreSel);
  q("[data-pnjo]").forEach(b => b.onclick = () => { MJ.pnjSel = MJ.pnjSel === b.dataset.pnjo ? null : b.dataset.pnjo; reCamp(); });
  q("[data-loreo]").forEach(b => b.onclick = () => { MJ.loreSel = MJ.loreSel === b.dataset.loreo ? null : b.dataset.loreo; reCamp(); });
  q("[data-att]").forEach(b => b.onclick = () => { const p = pnjSel(); if(!p) return; p.attitude = clamp(p.attitude + +b.dataset.att, -3, 3); Camp.sauver(); reCamp(); });
  q("[data-avis]").forEach(b => b.onclick = () => {
    const p = pnjSel(); if(!p) return;
    const i = b.dataset.avis.lastIndexOf("|"), n = b.dataset.avis.slice(0, i), dv = +b.dataset.avis.slice(i + 1);
    const a = p.avis[n] || {v: 0, n: ""}; a.v = clamp(a.v + dv, -3, 3); p.avis[n] = a; Camp.sauver(); reCamp();
  });
  q("[data-supsv]").forEach(b => b.onclick = () => { const p = pnjSel(); if(!p) return; p.souvenirs.splice(+b.dataset.supsv, 1); Camp.sauver(); reCamp(); });
  q("[data-arap]").forEach(b => b.onclick = () => { const r = (jeu ? RAPIDES_JEU : RAPIDES_PREP)[+b.dataset.arap]; if(r) assistant(r[1], jeu); });
  q("[data-ares]").forEach(b => b.onclick = async () => {
    const [k, i] = b.dataset.ares.split(":"), x = MJ.aR[+i]; if(!x) return;
    if(k === "x"){ MJ.aR.splice(+i, 1); reCamp(); return; }
    if(k === "recit"){ MJ.recit = (MJ.recit.trim() ? MJ.recit.trim() + "\n\n" : "") + x.r; MJ.onglet = "recit"; reCamp(); return; }
    if(k === "notes"){ C.notes = (C.notes.trim() ? C.notes.trim() + "\n\n" : "") + x.r; Camp.sauver(); Base.toast("Ajouté à tes notes 📝"); reCamp(); return; }
    if(k === "lore"){ const e = {id: Camp.nid(), titre: x.q.replace(/^[^\wÀ-ÿ]+/, "").slice(0, 60) || "Idée", cat: "autre", txt: x.r, carte: jeu && G.carte ? G.carte : ""}; C.lore.push(e); Camp.sauver(); editeurLore(e.id); return; }
    if(k === "pnj"){
      b.disabled = true; b.textContent = "…";
      const p = {id: Camp.nid(), nom: "", emo: "🧑", role: "", apparence: "", perso: "", but: "", secret: "", attitude: 0, avis: {}, souvenirs: []};
      try{ await pnjCompleter(p, x.r); if(!p.nom) p.nom = "PNJ sans nom"; C.pnj.push(p); Camp.sauver(); MJ.pnjSel = p.id; MJ.onglet = "pnj"; reCamp(); editeurPnj(p.id); }
      catch(e){ Base.toast("❌ " + String(e.message || e).slice(0, 120)); b.disabled = false; b.textContent = "🧑 En faire un PNJ"; }
    }
  });
  const aq = box.querySelector("#aQ");
  if(aq){ aq.oninput = () => MJ.aQ = aq.value; aq.addEventListener("keydown", e => { if(e.key === "Enter" && !e.shiftKey){ e.preventDefault(); assistant(aq.value, jeu); } }); }
  const sit = box.querySelector("#pnjSit"); if(sit) sit.oninput = () => MJ.pnjSit = sit.value;
  const sv = box.querySelector("#pnjSouv"); if(sv) sv.addEventListener("keydown", e => { if(e.key === "Enter") actionCamp("pnjSouv", jeu, box); });
  q("[data-c]").forEach(b => b.onclick = () => actionCamp(b.dataset.c, jeu, box));
}

function actionCamp(a, jeu, box){
  const C = camp(), p = C.pnj.find(x => x.id === MJ.pnjSel), lo = C.lore.find(x => x.id === MJ.loreSel);
  switch(a){
    case "aDemander": { const e = box.querySelector("#aQ"); assistant(e ? e.value : MJ.aQ, jeu); return; }
    case "pnjNouv": editeurPnj(null); return;
    case "pnjEdit": if(p) editeurPnj(p.id); return;
    case "pnjSup": if(p && confirm(`Supprimer la fiche de ${p.nom} ?`)){ C.pnj = C.pnj.filter(x => x !== p); Camp.sauver(); reCamp(); } return;
    case "pnjSouv": {
      const e = box.querySelector("#pnjSouv"), t = e && e.value.trim(); if(!p || !t) return;
      p.souvenirs.push({t: t.slice(0, 200), d: aujourdhui()}); p.souvenirs = p.souvenirs.slice(-40); Camp.sauver(); reCamp(); return;
    }
    case "pnjParler": if(p) pnjParler(p, MJ.pnjSit.trim()); MJ.pnjSit = ""; return;
    case "pnjMaj": if(p) pnjMaj([p]); return;
    case "pnjMajTous": pnjMaj(pnjCites()); return;
    case "pnjPresenter": if(!p) return; MJ.recit = (MJ.recit.trim() ? MJ.recit.trim() + "\n" : "") + `${p.emo} ${p.nom}${p.role ? ", " + p.role : ""}.${p.apparence ? " " + p.apparence : ""}`; MJ.onglet = "recit"; reCamp(); return;
    case "pnjPlacer": {
      if(!p || !G || !G.carte) return;
      majCarteCamp(G.carte, k => {
        const i = k.o.findIndex(o => o.p === p.id);
        if(i >= 0){ k.o.splice(i, 1); return; }
        const pris = new Set(k.o.map(o => o.x + "," + o.y));
        const ref = G.heros.find(h => h.x >= 0) || {x: 1, y: 1};
        const dist = bfs(ref.x, ref.y, 40, (x, y) => marchable(x, y));
        const libre = Object.keys(dist).filter(c => !pris.has(c) && dist[c] >= 2 && !occupe(...c.split(",").map(Number))).sort((a, b) => dist[a] - dist[b])[0];
        if(!libre){ Base.toast("Pas de place libre sur la carte."); return; }
        const [x, y] = libre.split(",").map(Number);
        k.o.push({id: Camp.nid(), x, y, e: p.emo, n: p.nom, t: (p.apparence || "").slice(0, 200), b: true, p: p.id});
        Base.toast("📍 Déplace-le avec 🖐️ (onglet 🗺️ Cartes).");
      });
      reCamp(); return;
    }
    case "pnjCombat": {
      if(!p) return;
      const niv = clamp(parseInt(p.niv) || 1, 1, 10);
      const def = {id: "pnj_" + p.id, nom: p.nom.slice(0, 30), emo: p.emo, niv, ...statsAuto(niv), portee: 1};
      const e = MJ.rencontre.find(x => x.def.id === def.id);
      if(!e) MJ.rencontre.push({def, n: 1});
      MJ.onglet = "monstres"; reCamp();
      Base.toast(`${p.nom} ajouté à la rencontre (stats de niveau ${niv}, modifiables via ✏️ Modifier → niveau).`);
      return;
    }
    case "loreNouv": editeurLore(null); return;
    case "loreEdit": if(lo) editeurLore(lo.id); return;
    case "loreSup": if(lo && confirm(`Supprimer « ${lo.titre} » ?`)){ C.lore = C.lore.filter(x => x !== lo); Camp.sauver(); reCamp(); } return;
    case "loreLire": if(!lo) return; MJ.recit = (MJ.recit.trim() ? MJ.recit.trim() + "\n\n" : "") + lo.txt; MJ.onglet = "recit"; reCamp(); return;
  }
}

/* ---------- Éditeurs (panneau à côté, la partie continue) ---------- */
function editeurPnj(id){
  const C = camp(), p0 = C.pnj.find(x => x.id === id) || {id: Camp.nid(), nom: "", emo: "🧑", role: "", apparence: "", perso: "", but: "", secret: "", niv: 1, attitude: 0, avis: {}, souvenirs: []};
  const box = Base.el("div");
  const champ = (k, t, ph, n) => `<label class="etiquette" style="margin-top:8px">${t}</label><textarea class="champ" data-k="${k}" rows="${n || 2}" maxlength="300" placeholder="${esc(ph)}">${esc(p0[k] || "")}</textarea>`;
  box.innerHTML = `
    <div class="ligne"><input class="champ" data-k="nom" maxlength="30" placeholder="Nom (vu par les joueurs si tu le poses sur la carte)" value="${esc(p0.nom)}" style="flex:1;min-width:150px"><input class="champ" data-k="emo" maxlength="8" value="${esc(p0.emo)}" style="width:64px;text-align:center;font-size:1.3rem"></div>
    <div class="puces" style="margin-top:6px">${EMOS_PNJ.map(e => `<button data-emo="${e}">${e}</button>`).join("")}</div>
    <input class="champ" data-k="role" maxlength="50" placeholder="Rôle (ex. : forgeron du village, chef des bandits)" value="${esc(p0.role || "")}" style="margin-top:8px">
    ${champ("apparence", "👁️ Apparence <span class=\"muted\">(ce que voient les joueurs)</span>", "Grand, barbe grise tressée, un œil de verre…")}
    ${champ("perso", "🎭 Caractère et façon de parler", "Bourru mais juste, ponctue ses phrases de « par ma forge ! »")}
    ${champ("but", "🎯 Ce qu'il veut", "Retrouver sa fille, se venger du baron…")}
    ${champ("secret", "🤫 Secret <span class=\"muted\">(pour toi)</span>", "C'est lui qui a vendu la carte aux gobelins…")}
    <div class="ligne" style="margin-top:8px"><span class="muted" style="font-weight:800;font-size:.85rem">Niveau s'il se bat</span><select class="mini" data-k="niv">${rg(1, 10).map(n => `<option ${n === (parseInt(p0.niv) || 1) ? "selected" : ""}>${n}</option>`).join("")}</select></div>
    <div class="ligne" style="margin-top:12px;justify-content:space-between">${IA.disponible() ? `<button class="btn ghost petit" id="pnjIa">✨ Compléter avec l'IA</button>` : "<span></span>"}<button class="btn" id="pnjOk">💾 Enregistrer</button></div>`;
  const dlg = ouvrirPanneau(id ? "✏️ " + p0.nom : "🧑 Nouveau PNJ", box);
  dlg.addEventListener("close", reCamp);
  const lireForm = () => { box.querySelectorAll("[data-k]").forEach(e => p0[e.dataset.k] = e.dataset.k === "niv" ? +e.value : e.value.trim()); };
  box.querySelectorAll("[data-emo]").forEach(b => b.onclick = () => box.querySelector('[data-k="emo"]').value = b.dataset.emo);
  const bia = box.querySelector("#pnjIa");
  if(bia) bia.onclick = async () => {
    lireForm(); bia.disabled = true; bia.textContent = "…";
    try{ await pnjCompleter(p0, ""); box.querySelectorAll("[data-k]").forEach(e => e.value = p0[e.dataset.k] == null ? "" : p0[e.dataset.k]); }
    catch(e){ Base.toast("❌ " + String(e.message || e).slice(0, 120)); }
    bia.disabled = false; bia.textContent = "✨ Compléter avec l'IA";
  };
  box.querySelector("#pnjOk").onclick = () => {
    lireForm();
    if(!p0.nom){ Base.toast("Donne un nom à ton PNJ."); return; }
    p0.nom = p0.nom.slice(0, 30); p0.emo = p0.emo.slice(0, 8) || "🧑";
    if(!C.pnj.includes(p0)) C.pnj.push(p0);
    // le jeton sur les cartes suit le nom et l'emoji
    for(const k of Object.values(C.cartes)) k.o.forEach(o => { if(o.p === p0.id){ o.e = p0.emo; o.n = p0.nom; o.t = (p0.apparence || "").slice(0, 200); } });
    Camp.sauver(); MJ.pnjSel = p0.id;
    if(G && enJeu && G.carte && (G.objets[G.carte] || []).some(o => o.p === p0.id)) majCarteCamp(G.carte, () => {});
    Base.toast("Fiche enregistrée 🧑"); dlg.close();
  };
}
function editeurLore(id){
  const C = camp(), x0 = C.lore.find(x => x.id === id) || {id: Camp.nid(), titre: "", cat: "lieu", txt: "", carte: ""};
  const box = Base.el("div");
  box.innerHTML = `
    <input class="champ" id="loT" maxlength="60" placeholder="Titre (ex. : La chute de Valombre)" value="${esc(x0.titre)}">
    <div class="puces" style="margin-top:6px" id="loC">${CATS_LORE.map(([k, e, n]) => `<button data-cat="${k}" class="${catLore(x0.cat)[0] === k ? "on" : ""}">${e} ${n}</button>`).join("")}</div>
    <div class="ligne" style="margin-top:6px"><span class="muted" style="font-weight:800;font-size:.85rem">Lieu lié</span><select class="mini" id="loK"><option value="">—</option>${Object.keys(C.cartes).map(n => `<option ${n === x0.carte ? "selected" : ""}>${esc(n)}</option>`).join("")}</select></div>
    <textarea class="champ" id="loX" rows="9" maxlength="4000" placeholder="Ce que tu sais et que les joueurs vont découvrir…" style="margin-top:8px">${esc(x0.txt)}</textarea>
    <div class="ligne" style="margin-top:10px;justify-content:space-between">${IA.disponible() ? `<button class="btn ghost petit" id="loIa">✨ Développer avec l'IA</button>` : "<span></span>"}<button class="btn" id="loOk">💾 Enregistrer</button></div>`;
  const dlg = ouvrirPanneau(id ? "📚 " + x0.titre : "📚 Nouvelle entrée", box);
  dlg.addEventListener("close", reCamp);
  const q = s => box.querySelector(s);
  let cat = catLore(x0.cat)[0];
  box.querySelectorAll("[data-cat]").forEach(b => b.onclick = () => { cat = b.dataset.cat; box.querySelectorAll("[data-cat]").forEach(y => y.classList.toggle("on", y === b)); });
  if(q("#loIa")) q("#loIa").onclick = async () => {
    const t = q("#loT").value.trim(), x = q("#loX").value.trim(), b = q("#loIa");
    if(!t && !x){ Base.toast("Écris au moins un titre ou une idée."); return; }
    b.disabled = true; b.textContent = "…";
    try{
      const U = UNIV[G && enJeu ? G.u : C.u] || UNIV.fantasy;
      const r = await iaTexte(`Tu aides un maître du jeu à écrire le lore de sa campagne de jeu de rôle tout public. Univers : ${U.nom} — ${U.ambiance}. Campagne : ${C.nom}. Autres entrées : ${C.lore.filter(y => y.id !== x0.id).slice(0, 10).map(y => y.titre).join(", ") || "aucune"}. Écris en français, 6 à 10 phrases concrètes et évocatrices, avec un détail utilisable en partie (indice, danger, secret). Texte simple, sans titre ni markdown. Garde et développe ce que le MJ a écrit.`,
        `Catégorie : ${catLore(cat)[2]}\nTitre : ${t || "(à trouver)"}\nNotes du MJ : ${x || "(aucune)"}`, 900);
      q("#loX").value = x ? x + "\n\n" + r : r;
    }catch(e){ Base.toast("❌ " + String(e.message || e).slice(0, 120)); }
    b.disabled = false; b.textContent = "✨ Développer avec l'IA";
  };
  q("#loOk").onclick = () => {
    x0.titre = q("#loT").value.trim().slice(0, 60) || "Sans titre"; x0.txt = q("#loX").value.trim().slice(0, 4000); x0.cat = cat; x0.carte = q("#loK").value;
    if(!C.lore.includes(x0)) C.lore.push(x0);
    Camp.sauver(); MJ.loreSel = x0.id; MJ.onglet = MJ.onglet === "assistant" ? "lore" : MJ.onglet;
    Base.toast("Entrée enregistrée 📚"); dlg.close();
  };
}
