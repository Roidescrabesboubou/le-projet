/* ============================================================
   TABLE DE LÉGENDES — carte du monde de la campagne
   - Une carte « visuelle », sans quadrillage : un fond selon l'univers,
     des terrains peints au pinceau (des taches qui fusionnent en
     continents, forêts, nébuleuses…), des lieux nommés, du décor,
     des routes et des noms de régions.
   - Rangée dans la campagne (C.monde), sur l'appareil du MJ.
   - Montrée aux joueurs par Monde.pub() : sans les lieux cachés, ni
     notes secrètes, ni liens vers les cartes de combat ou le lore.
   Doit être chargé avant campagne.js (qui répare C.monde au chargement).
   ============================================================ */
const Monde = (() => {
  const LARG = 1000, HAUT = 625, MAX = {z: 900, l: 60, d: 200, r: 120};
  const TERRAINS = {
    profond: {n: "Mer profonde", c: "#3d6fa6"},
    eau: {n: "Eau", c: "#5d9fd6"},
    terre: {n: "Terre", c: "#d8bf8a"},
    herbe: {n: "Plaine", c: "#a7cd77"},
    desert: {n: "Désert", c: "#ebd08c"},
    neige: {n: "Neige", c: "#f2f5f9"},
    marais: {n: "Marais", c: "#71865a"},
    foret: {n: "Forêt", c: "#4e8c3f", m: "🌲"},
    jungle: {n: "Jungle", c: "#3c7a3a", m: "🌴"},
    montagne: {n: "Montagnes", c: "#9c8873", m: "⛰️"},
    lave: {n: "Lave", c: "#de5a2c"},
    ruines: {n: "Ruines", c: "#8c8680"},
    beton: {n: "Ville", c: "#7f8792", m: "🏢"},
    neon: {n: "Néon", c: "#ff3ea5"},
    nebuleuse: {n: "Nébuleuse", c: "#9b5de5", flou: true},
    nebuleuse2: {n: "Nébuleuse bleue", c: "#36b3df", flou: true},
    asteroides: {n: "Astéroïdes", c: "#7c7066", m: "🪨"}
  };
  const TERR_U = {
    fantasy: "terre herbe foret montagne eau profond desert neige marais lave ruines",
    scifi: "nebuleuse nebuleuse2 asteroides terre desert neige lave eau herbe",
    postapo: "desert terre ruines marais eau herbe montagne lave",
    horreur: "terre herbe foret marais eau profond montagne neige ruines",
    cyberpunk: "beton neon eau profond terre herbe ruines",
    pirates: "terre herbe jungle foret montagne eau profond desert marais lave",
    japon: "terre herbe foret montagne eau profond neige marais"
  };
  const FONDS = {
    parchemin: {n: "📜 Parchemin", c: "#efdfb8", clair: true},
    ocean: {n: "🌊 Océan", c: "#4f8bbf", clair: true},
    espace: {n: "🌌 Espace", c: "#0a0f24", etoiles: true},
    desert: {n: "🏜️ Terres arides", c: "#d3b781", clair: true},
    nuit: {n: "🌑 Nuit", c: "#272b37"},
    neon: {n: "🌃 Ville la nuit", c: "#130f24", grille: true},
    washi: {n: "🎴 Papier japonais", c: "#f4ead4", clair: true},
    neige: {n: "❄️ Toundra", c: "#e6edf3", clair: true}
  };
  const FOND_U = {fantasy: "parchemin", scifi: "espace", postapo: "desert", horreur: "nuit", cyberpunk: "neon", pirates: "ocean", japon: "washi"};
  const LIEUX_U = {
    fantasy: "🏰 🏘️ 🏠 🛖 ⛪ 🗼 🏛️ ⛺ 🕳️ 🌋 🏔️ 🌲 🏝️ ⚓ 🌉 ⛲ 🗿 🪦 💀 🐉 ⚔️ ✨",
    scifi: "🪐 🌍 🌑 🌕 ☀️ ⭐ 🌌 🛰️ 🚀 🛸 🏙️ 🏭 🌀 ☄️ 👽 🤖 💠 ⚠️",
    postapo: "🏚️ 🏙️ 🏭 ☢️ ⛽ 🛢️ 🚧 🏕️ 🗼 📡 💧 🌵 🚗 🛤️ ⚙️ 🧟 💀",
    horreur: "🏚️ 🏛️ ⛪ 🪦 🏠 🏥 🚂 ⚓ 🗿 🐙 👁️ 🕯️ 📚 🗝️ 🌫️ 🌲 🌑",
    cyberpunk: "🏙️ 🏢 🏬 🏭 🏥 🌃 🚇 🛣️ 🎰 🍜 💊 🔌 📡 🛰️ 🚓 💽 🤖 🧬",
    pirates: "🏝️ ⚓ 🏴‍☠️ ⛵ 🚢 🏰 🏘️ 🛖 🌋 🦜 🦈 🐙 💰 💀 🗺️ 🌴 ⛪",
    japon: "🏯 ⛩️ 🏘️ 🛖 🗻 🌸 🎋 🍵 🏮 👹 🦊 🐉 🌊 ⛰️ 🌲 🗡️ 🌉 ♨️"
  };
  const DECO = "🌲 🌳 🌴 🌵 ⛰️ 🏔️ 🌋 🪨 🌊 🌾 ☁️ 🐉 🦅 🐋 🦑 ⛵ 🧭";
  const DECO_U = {scifi: "⭐ ✨ 💫 ☄️ 🌙 🛰️ 🛸", cyberpunk: "🚗 🚁 💡 📡", postapo: "☢️ 💀 🚗 🛢️ 🦴", horreur: "🌫️ 🦇 🕸️ 💀 👁️", pirates: "🦈 🦜 🏴‍☠️", japon: "🌸 🎋 🏮 🦊"};
  const ROUTES = [["🟫 Chemin", "#7a4e24", "#e7cfa2", "7 6"], ["🌊 Mer", "#1f5f9a", "#9fd3ff", "2 7"], ["✨ Autre", "#5b3a8c", "#f2e9ff", "11 6"]];
  const PINCEAUX = [["S", 14], ["M", 26], ["L", 44], ["XL", 70]];

  const nid = () => Math.random().toString(36).slice(2, 10);
  const s = (v, n) => String(v == null ? "" : v).slice(0, n);
  const num = (v, a, b) => { v = Math.round(+v); return Number.isFinite(v) ? Math.max(a, Math.min(b, v)) : a; };
  const tab = v => Array.isArray(v) ? v : [];
  const e = v => String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));

  /* Remet une carte du monde en état (au chargement, à l'import, et côté hôte) */
  function reparer(m){
    m = m && typeof m === "object" ? m : {};
    const r = {nom: s(m.nom, 40), f: FONDS[m.f] ? m.f : "", z: [], l: [], d: [], r: [], ici: ""};
    for(const z of tab(m.z)){
      if(Array.isArray(z) && TERRAINS[z[3]]) r.z.push([num(z[0], 0, LARG), num(z[1], 0, HAUT), num(z[2], 4, 120), z[3]]);
      if(r.z.length >= MAX.z) break;
    }
    const ids = new Set();
    for(const x of tab(m.l)){
      if(!x || typeof x !== "object" || !(x.e || x.n)) continue;
      let id = s(x.id, 12) || nid(); if(ids.has(id)) id = nid(); ids.add(id);
      r.l.push({id, x: num(x.x, 0, LARG), y: num(x.y, 0, HAUT), e: s(x.e, 12), n: s(x.n, 40), g: num(x.g, 1, 3), t: s(x.t, 300), s: s(x.s, 400), c: !!x.c, k: s(x.k, 50), lo: s(x.lo, 12)});
      if(r.l.length >= MAX.l) break;
    }
    for(const d of tab(m.d)){
      if(Array.isArray(d) && d[2]) r.d.push([num(d[0], 0, LARG), num(d[1], 0, HAUT), s(d[2], 12), num(d[3], 1, 3)]);
      if(r.d.length >= MAX.d) break;
    }
    const vus = new Set();
    for(const x of tab(m.r)){
      if(!Array.isArray(x)) continue;
      const a = s(x[0], 12), b = s(x[1], 12), k = [a, b].sort().join("|");
      if(a === b || !ids.has(a) || !ids.has(b) || vus.has(k)) continue;
      vus.add(k); r.r.push([a, b, num(x[2], 0, 2)]);
      if(r.r.length >= MAX.r) break;
    }
    r.ici = ids.has(m.ici) ? m.ici : "";
    return r;
  }
  /* Version « joueurs » : sans lieux cachés, notes secrètes, liens de cartes ni lore */
  function pub(m){
    const r = reparer(m);
    r.l = r.l.filter(x => !x.c).map(x => ({id: x.id, x: x.x, y: x.y, e: x.e, n: x.n, g: x.g, t: x.t}));
    const ids = new Set(r.l.map(x => x.id));
    r.r = r.r.filter(x => ids.has(x[0]) && ids.has(x[1]));
    if(!ids.has(r.ici)) r.ici = "";
    return r;
  }
  const vide = m => !m || (!m.z.length && !m.l.length && !m.d.length);
  const fondDe = (m, u) => FONDS[m.f] ? m.f : (FOND_U[u] || "parchemin");
  const hash = t => { let h = 7; for(const c of String(t)) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
  function hasard(seed){ return () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------- Dessin (SVG) ---------- */
  let inst = 0;
  /* o : {u, mj (montre les lieux cachés), sel (lieu choisi), routeA, vb {x,y,w}} */
  function interieur(m, o){
    o = o || {};
    const F = FONDS[fondDe(m, o.u)], id = "w" + (++inst) + "_";
    const encre = F.clair ? "#2b2116" : "#f4f1ff", halo = F.clair ? "rgba(255,250,238,.9)" : "rgba(8,6,20,.8)";
    let defs = `<filter id="${id}g" filterUnits="userSpaceOnUse" x="-60" y="-60" width="${LARG + 120}" height="${HAUT + 120}">
      <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b"/>
      <feColorMatrix in="b" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -7" result="t"/>
      <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4" result="n"/>
      <feDisplacementMap in="t" in2="n" scale="12" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feMorphology in="d" operator="dilate" radius="1.6" result="o"/>
      <feColorMatrix in="o" type="matrix" values="0 0 0 0 .16 0 0 0 0 .12 0 0 0 0 .08 0 0 0 .5 0" result="oc"/>
      <feMerge><feMergeNode in="oc"/><feMergeNode in="d"/></feMerge></filter>
      <filter id="${id}f" filterUnits="userSpaceOnUse" x="-60" y="-60" width="${LARG + 120}" height="${HAUT + 120}"><feGaussianBlur stdDeviation="16"/></filter>
      <filter id="${id}n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
      <filter id="${id}t" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".006" numOctaves="3" seed="9"/><feColorMatrix type="saturate" values="0"/></filter>
      <radialGradient id="${id}v" cx="50%" cy="50%" r="72%"><stop offset="60%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="${F.clair ? "#4a2e0c" : "#000"}" stop-opacity="${F.clair ? .32 : .55}"/></radialGradient>`;
    let fond = `<rect width="${LARG}" height="${HAUT}" fill="${F.c}"/><rect width="${LARG}" height="${HAUT}" filter="url(#${id}t)" opacity="${F.clair ? .13 : .1}" style="mix-blend-mode:multiply"/>`;
    if(F.etoiles){
      const r = hasard(7);
      for(let i = 0; i < 170; i++) fond += `<circle cx="${(r() * LARG) | 0}" cy="${(r() * HAUT) | 0}" r="${(0.5 + r() * 1.4).toFixed(1)}" fill="#fff" opacity="${(0.3 + r() * 0.7).toFixed(2)}"/>`;
    }
    if(F.grille){
      defs += `<pattern id="${id}q" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#3a3170" stroke-width="1"/></pattern>`;
      fond += `<rect width="${LARG}" height="${HAUT}" fill="url(#${id}q)" opacity=".7"/>`;
    }
    /* Terrains : chaque suite de taches du même terrain forme un calque (le dernier peint passe dessus) */
    let couches = "", i = 0, n = 0;
    while(i < m.z.length){
      const k = m.z[i][3], T = TERRAINS[k];
      let j = i; while(j < m.z.length && m.z[j][3] === k) j++;
      const zs = m.z.slice(i, j), ci = zs.map(z => `<circle cx="${z[0]}" cy="${z[1]}" r="${z[2]}"/>`).join("");
      couches += `<g filter="url(#${id}${T.flou ? "f" : "g"})" fill="${T.c}"${T.flou ? ' opacity=".7"' : ""}>${ci}</g>`;
      if(T.m){
        n++;
        defs += `<clipPath id="${id}c${n}">${zs.map(z => `<circle cx="${z[0]}" cy="${z[1]}" r="${Math.round(z[2] * 0.78)}"/>`).join("")}</clipPath>`;
        if(!defs.includes(`id="${id}p${k}"`)) defs += `<pattern id="${id}p${k}" width="52" height="46" patternUnits="userSpaceOnUse"><text x="4" y="20" font-size="15">${T.m}</text><text x="30" y="42" font-size="15">${T.m}</text></pattern>`;
        couches += `<rect width="${LARG}" height="${HAUT}" fill="url(#${id}p${k})" clip-path="url(#${id}c${n})" opacity=".85"/>`;
      }
      i = j;
    }
    const lieux = o.mj ? m.l : m.l.filter(x => !x.c), pos = {};
    lieux.forEach(x => pos[x.id] = x);
    const routes = m.r.map(([a, b, t]) => {
      const A = pos[a], B = pos[b]; if(!A || !B) return "";
      const R = ROUTES[t] || ROUTES[0], dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy) || 1, h = (hash(a + b) % 2 ? 1 : -1) * len * 0.12;
      const cx = Math.round((A.x + B.x) / 2 - dy / len * h), cy = Math.round((A.y + B.y) / 2 + dx / len * h);
      return `<path d="M${A.x} ${A.y}Q${cx} ${cy} ${B.x} ${B.y}" fill="none" stroke="${F.clair ? R[1] : R[2]}" stroke-width="2.6" stroke-dasharray="${R[3]}" stroke-linecap="round"${A.c || B.c ? ' opacity=".45"' : ""}/>`;
    }).join("");
    const deco = m.d.map((d, k) => `<text data-d="${k}" x="${d[0]}" y="${d[1]}" font-size="${[18, 28, 42][d[3] - 1]}" text-anchor="middle" dominant-baseline="central">${e(d[2])}</text>`).join("");
    const lab = (x, y, t, fs, extra) => `<text class="mlab" x="${x}" y="${y}" font-size="${fs}" text-anchor="middle" fill="${encre}" stroke="${halo}"${extra || ""}>${e(t)}</text>`;
    let regions = "", noms = "";
    for(const x of lieux){
      const g = x.g || 2;
      if(!x.e){
        regions += `<g data-l="${e(x.id)}"${x.c ? ' opacity=".5"' : ""}>${lab(x.x, x.y, x.n, [20, 30, 44][g - 1], ` font-style="italic" letter-spacing="${g + 1}" dominant-baseline="central" opacity=".8"`)}</g>`;
        if(o.sel === x.id) regions += `<rect x="${x.x - 60}" y="${x.y - 20}" width="120" height="40" rx="8" fill="none" stroke="#e8442e" stroke-width="2.5" stroke-dasharray="6 4"/>`;
        continue;
      }
      const sz = [24, 34, 48][g - 1];
      let h = `<g data-l="${e(x.id)}"${x.c ? ' opacity=".5"' : ""}>`;
      if(x.c) h += `<circle cx="${x.x}" cy="${x.y}" r="${Math.round(sz * 0.72)}" fill="none" stroke="${encre}" stroke-width="1.5" stroke-dasharray="4 4"/>`;
      h += `<circle cx="${x.x}" cy="${x.y}" r="${Math.round(sz * 0.62)}" fill="transparent"/>`;
      h += `<text x="${x.x}" y="${x.y}" font-size="${sz}" text-anchor="middle" dominant-baseline="central">${e(x.e)}</text>`;
      if(x.n) h += lab(x.x, Math.round(x.y + sz * 0.62 + [11, 13, 16][g - 1]), x.n, [12, 14, 17][g - 1]);
      h += `</g>`;
      if(o.sel === x.id || o.routeA === x.id) h += `<circle cx="${x.x}" cy="${x.y}" r="${Math.round(sz * 0.8)}" fill="none" stroke="${o.routeA === x.id ? "#2d7be0" : "#e8442e"}" stroke-width="3" stroke-dasharray="7 5"/>`;
      if(m.ici === x.id) h += `<circle cx="${x.x}" cy="${x.y}" r="${sz * 0.7}" fill="none" stroke="#e8442e" stroke-width="2.5"><animate attributeName="r" values="${sz * 0.6};${sz * 1.2}" dur="1.8s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;0" dur="1.8s" repeatCount="indefinite"/></circle><text x="${x.x + sz * 0.45}" y="${x.y - sz * 0.55}" font-size="${Math.max(18, sz * 0.6)}" text-anchor="middle" dominant-baseline="central">🚩</text>`;
      noms += h;
    }
    const titre = m.nom ? `<text class="mlab" x="${LARG - 16}" y="30" font-size="22" text-anchor="end" fill="${encre}" stroke="${halo}" font-style="italic">${e(m.nom)}</text>` : "";
    return `<defs>${defs}</defs>${fond}${couches}${routes}${regions}${deco}${noms}<rect width="${LARG}" height="${HAUT}" fill="url(#${id}v)" pointer-events="none"/>${titre}`;
  }
  const vbTxt = vb => vb ? `${Math.round(vb.x)} ${Math.round(vb.y)} ${Math.round(vb.w)} ${Math.round(vb.w * HAUT / LARG)}` : `0 0 ${LARG} ${HAUT}`;
  const svg = (m, o) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbTxt(o && o.vb)}">${interieur(m, o)}</svg>`;

  /* ---------- Vue des joueurs ---------- */
  function voir(m, u){
    if(!m) return;
    const box = document.createElement("div");
    box.innerHTML = `<div class="monde">${svg(m, {u})}</div><div class="encart" id="wvInfo">Touche un lieu pour lire ce que vous en savez.</div>`;
    const d = Base.fenetre("🌍 " + (m.nom || "Carte du monde"), box, {bouton: "Fermer"});
    d.style.width = "min(1000px,96vw)";
    box.querySelector("svg").addEventListener("click", ev => {
      const g = ev.target.closest("[data-l]"), x = g && m.l.find(l => l.id === g.dataset.l);
      if(x) box.querySelector("#wvInfo").innerHTML = `<b>${e(x.e)} ${e(x.n || "")}</b>${m.ici === x.id ? " · 🚩 vous êtes ici" : ""}<br>${x.t ? e(x.t) : `<span class="muted">On n'en sait pas plus.</span>`}`;
    });
  }

  /* ---------- Côté MJ : contexte ---------- */
  const univ = () => ctxMJ === "prep" ? camp().u : ctxMJ === true ? (L && L.cfg.u) : (G && G.u);
  const enPartie = () => ctxMJ === false && !!G && enJeu;
  function montrer(M, quoi){
    if(!enPartie()) return;
    mj({t: "monde", m: pub(M), quoi: quoi || ""});
  }
  function placerGroupe(M, id){
    const x = M.l.find(l => l.id === id); if(!x) return;
    M.ici = id; Camp.sauver();
    if(enPartie() && G.monde){
      if(x.c && confirm(`« ${x.n || "Ce lieu"} » est caché aux joueurs. Le révéler maintenant ?`)){ x.c = false; Camp.sauver(); }
      if(!x.c) montrer(M, "ici");
    }
  }
  function afficherCarteLiee(x){
    const C = camp(), k = x && C.cartes[x.k];
    if(!k || !enPartie()) return;
    if(G.combat){ Base.toast("On ne change pas de lieu pendant un combat."); return; }
    mj({t: "carte", nom: x.k, l: k.l, o: pubObjets(k.o)});
  }

  /* ---------- Onglet 🌍 Monde des outils du MJ ---------- */
  function onglet(jeu){
    const C = camp(), M = C.monde, u = univ();
    if(vide(M)) return `<p class="muted" style="font-size:.88rem;margin-top:0">Dessine la carte de ton monde avant de lancer ta campagne : continents, mers, forêts, montagnes, villes, planètes, routes… Pas de quadrillage : c'est une carte pour voir où se trouvent les lieux de l'aventure. Tu pourras la montrer aux joueurs et y placer le groupe.</p>
      <button class="btn petit" data-wo="ouvrir">🌍 Dessiner la carte du monde</button>`;
    let h = `<div class="monde apercu" data-wo="ouvrir" title="Modifier">${svg(M, {u, mj: true})}</div>
      <div class="ligne" style="margin-top:8px"><button class="btn petit" data-wo="ouvrir">✏️ Modifier la carte du monde</button>${jeu ? `<button class="mini" data-wo="montrer">📢 ${G.monde ? "Mettre à jour chez les joueurs" : "Montrer aux joueurs"}</button>${G.monde ? `<button class="mini" data-wo="retirer">🙈 Ne plus la montrer</button>` : ""}` : ""}</div>`;
    if(jeu && !G.monde) h += `<p class="muted" style="font-size:.8rem">Les joueurs ne la voient pas tant que tu ne la montres pas. Les lieux cachés (🙈) et tes notes secrètes restent pour toi.</p>`;
    const lieux = M.l.filter(x => x.e && x.n);
    if(lieux.length) h += `<div class="sous">Lieux <span style="font-weight:600">(🚩 = le groupe est ici)</span></div>` + lieux.map(x => `<div class="mjl"><span class="n">${M.ici === x.id ? "🚩 " : ""}${e(x.e)} <b>${e(x.n)}</b>${x.c ? ` <span class="muted">🙈 caché</span>` : ""}${x.k ? ` <span class="muted">· 🗺️ ${e(x.k)}</span>` : ""}</span><button class="mini" data-wici="${e(x.id)}" ${M.ici === x.id ? "disabled" : ""} title="Le groupe est ici">🚩</button>${jeu && x.k && C.cartes[x.k] ? `<button class="mini" data-wcarte="${e(x.id)}" ${G.combat || G.carte === x.k ? "disabled" : ""}>👁️ Sa carte</button>` : ""}${x.lo && C.lore.some(l => l.id === x.lo) ? `<button class="mini" data-wlore="${e(x.lo)}" title="Lore">📚</button>` : ""}</div>`).join("");
    return h;
  }
  function lier(box, jeu){
    const M = camp().monde, q = s => box.querySelectorAll(s);
    q("[data-wo]").forEach(b => b.onclick = () => {
      const a = b.dataset.wo;
      if(a === "ouvrir") editeur();
      else if(a === "montrer"){ if(vide(M)) return; const deja = !!G.monde; montrer(M, deja ? "maj" : "voir"); Base.toast(deja ? "Carte du monde mise à jour chez les joueurs 🌍" : "Carte du monde montrée aux joueurs 🌍"); }
      else if(a === "retirer") mj({t: "monde", m: null});
    });
    q("[data-wici]").forEach(b => b.onclick = () => { placerGroupe(M, b.dataset.wici); reCamp(); });
    q("[data-wcarte]").forEach(b => b.onclick = () => afficherCarteLiee(M.l.find(x => x.id === b.dataset.wcarte)));
    q("[data-wlore]").forEach(b => b.onclick = () => { MJ.loreSel = b.dataset.wlore; MJ.onglet = "lore"; reCamp(); });
  }

  /* ---------- Éditeur ---------- */
  function editeur(){
    const C = camp(), M = C.monde, u = univ() || C.u, jeu = enPartie();
    const terrU = (TERR_U[u] || TERR_U.fantasy).split(" "), terr = [...new Set([...terrU, ...Object.keys(TERRAINS)])];
    const lieuxE = (LIEUX_U[u] || LIEUX_U.fantasy).split(" "), decoE = [...new Set([...DECO.split(" "), ...(DECO_U[u] || "").split(" ").filter(Boolean)])];
    const E = {mode: "terrain", tous: false, ter: terr[0], taille: 26, emo: lieuxE[0], deco: decoE[0], dg: 2, rt: 0, sel: null, routeA: null, vb: {x: 0, y: 0, w: LARG}, hist: [], snapSel: null};
    const box = document.createElement("div");
    box.innerHTML = `
      <div class="ligne"><input class="champ" id="wNom" maxlength="40" placeholder="Nom du monde (ex. : Royaumes d'Aldoria)" value="${e(M.nom)}" style="flex:1;min-width:170px">
        <select class="mini" id="wFond"><option value="">Fond : ${e(FONDS[FOND_U[u] || "parchemin"].n)} (univers)</option>${Object.entries(FONDS).map(([k, F]) => `<option value="${k}" ${M.f === k ? "selected" : ""}>${e(F.n)}</option>`).join("")}</select></div>
      <div class="puces" style="margin-top:8px">${[["terrain", "🖌️ Terrain"], ["lieux", "🏰 Lieux"], ["deco", "🌲 Décor"], ["routes", "🛤️ Routes"], ["gomme", "🧽 Gomme"], ["vue", "🖐️ Déplacer"]].map(([k, t]) => `<button data-wm="${k}" class="${k === E.mode ? "on" : ""}">${t}</button>`).join("")}</div>
      <div id="wOutils" style="margin-top:8px"></div>
      <div class="ligne" style="margin-top:8px;gap:4px"><button class="mini" id="wMoins" title="Dézoomer">➖</button><button class="mini" id="wPlus" title="Zoomer">➕</button><button class="mini" id="wTout">🔍 Tout voir</button><button class="mini" id="wAnnul">↩️ Annuler</button><span style="flex:1"></span><span class="muted" id="wInfo" style="font-size:.76rem"></span></div>
      <div class="monde edit" style="margin-top:6px"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARG} ${HAUT}"></svg></div>
      <div id="wFiche" class="encart cache"></div>
      <div class="ligne" style="justify-content:flex-end;margin-top:10px">${jeu ? `<button class="btn ghost" id="wMontrer">📢 ${G.monde ? "Mettre à jour chez les joueurs" : "Montrer aux joueurs"}</button>` : ""}<button class="btn" id="wFin">✔️ Terminé</button></div>
      <p class="muted" style="font-size:.78rem">Tout est enregistré au fur et à mesure dans ta campagne. Les lieux cachés (🙈) et les notes secrètes ne sont jamais montrés aux joueurs.</p>`;
    const dlg = ouvrirPanneau("🌍 Carte du monde", box);
    if(ctxMJ === true) dlg.style.width = "min(1060px,97vw)";
    if(ctxMJ === "prep") dlg.style.gridColumn = "1 / -1";
    const q = s => box.querySelector(s), sv = q("svg"), fiche = q("#wFiche");
    let tSave = null, rafId = 0;
    const sauver = () => { clearTimeout(tSave); tSave = null; Camp.sauver(); };
    const modif = () => { clearTimeout(tSave); tSave = setTimeout(sauver, 700); info(); };
    const info = () => { q("#wInfo").textContent = `${M.z.length}/${MAX.z} touches de terrain · ${M.l.length}/${MAX.l} lieux · ${M.d.length}/${MAX.d} décors`; };
    const dessiner = () => { cancelAnimationFrame(rafId); rafId = 0; sv.innerHTML = interieur(M, {u, mj: true, sel: E.sel, routeA: E.routeA}); };
    const plan = () => { if(!rafId) rafId = requestAnimationFrame(dessiner); };
    const vue = () => sv.setAttribute("viewBox", vbTxt(E.vb));
    const instantane = () => { E.hist.push(JSON.stringify(M)); if(E.hist.length > 40) E.hist.shift(); };
    dlg.addEventListener("close", () => { if(tSave) sauver(); cancelAnimationFrame(rafId); if(ctxMJ === "prep") dlg.style.gridColumn = ""; reCamp(); });

    function outils(){
      const o = q("#wOutils"), on = (a, b) => a === b ? "on" : "";
      const tailles = `<div class="puces serre" style="margin-top:6px"><span class="muted" style="font-size:.82rem;font-weight:800;align-self:center">Pinceau :</span>${PINCEAUX.map(([t, v]) => `<button data-wt="${v}" class="${on(v, E.taille)}">${t}</button>`).join("")}</div>`;
      if(E.mode === "terrain") o.innerHTML = `<div class="puces serre">${(E.tous ? terr : terrU.includes(E.ter) ? terrU : [...terrU, E.ter]).map(k => `<button data-wter="${k}" class="${on(k, E.ter)}"><i class="sw" style="background:${TERRAINS[k].c}"></i>${e(TERRAINS[k].n)}</button>`).join("")}<button data-wtous>${E.tous ? "➖ Moins" : "➕ Autres"}</button></div>${tailles}
        <p class="muted" style="font-size:.8rem;margin:6px 0 0">Glisse sur la carte pour peindre. Ce que tu peins en dernier passe par-dessus (de l'eau sur une plaine fait un lac).</p>`;
      else if(E.mode === "lieux") o.innerHTML = `<div class="puces serre">${lieuxE.map(x => `<button data-wemo="${x}" class="${on(x, E.emo)}">${x}</button>`).join("")}<button data-wemo="" class="${on("", E.emo)}">🔤 Nom de région</button></div>
        <div class="ligne" style="margin-top:6px"><span class="muted" style="font-size:.82rem;font-weight:800">Autre emoji :</span><input class="champ" id="wEmo" maxlength="12" placeholder="🦄" style="width:80px;text-align:center;padding:5px"></div>
        <p class="muted" style="font-size:.8rem;margin:6px 0 0">Touche la carte pour poser un lieu. Touche un lieu pour le modifier (nom, description, secret, caché, carte de combat liée…), glisse-le pour le déplacer.</p>`;
      else if(E.mode === "deco") o.innerHTML = `<div class="puces serre">${decoE.map(x => `<button data-wdeco="${x}" class="${on(x, E.deco)}">${x}</button>`).join("")}</div>
        <div class="puces" style="margin-top:6px"><span class="muted" style="font-size:.82rem;font-weight:800;align-self:center">Taille :</span>${[[1, "Petit"], [2, "Moyen"], [3, "Grand"]].map(([v, t]) => `<button data-wdg="${v}" class="${on(v, E.dg)}">${t}</button>`).join("")}</div>
        <p class="muted" style="font-size:.8rem;margin:6px 0 0">Touche pour poser, glisse pour déplacer. Pour retirer : 🧽 Gomme.</p>`;
      else if(E.mode === "routes") o.innerHTML = `<div class="puces">${ROUTES.map((r, i) => `<button data-wrt="${i}" class="${on(i, E.rt)}">${r[0]}</button>`).join("")}</div>
        <p class="muted" style="font-size:.8rem;margin:6px 0 0">Touche un lieu puis un autre pour tracer la route entre eux (refais-le pour l'effacer).</p>`;
      else if(E.mode === "gomme") o.innerHTML = `${tailles}<p class="muted" style="font-size:.8rem;margin:6px 0 0">Glisse sur la carte pour effacer terrain, décor et routes. Les lieux se retirent depuis leur fiche (touche-les en mode 🏰 Lieux).</p>`;
      else o.innerHTML = `<p class="muted" style="font-size:.8rem;margin:0">Après avoir zoomé (➕), glisse pour te déplacer sur la carte. Glisse un lieu ou un décor pour le déplacer, touche un lieu pour le modifier.</p>`;
      o.querySelectorAll("[data-wt]").forEach(b => b.onclick = () => { E.taille = +b.dataset.wt; outils(); });
      const bt = o.querySelector("[data-wtous]"); if(bt) bt.onclick = () => { E.tous = !E.tous; outils(); };
      o.querySelectorAll("[data-wter]").forEach(b => b.onclick = () => { E.ter = b.dataset.wter; outils(); });
      o.querySelectorAll("[data-wemo]").forEach(b => b.onclick = () => { E.emo = b.dataset.wemo; outils(); });
      o.querySelectorAll("[data-wdeco]").forEach(b => b.onclick = () => { E.deco = b.dataset.wdeco; outils(); });
      o.querySelectorAll("[data-wdg]").forEach(b => b.onclick = () => { E.dg = +b.dataset.wdg; outils(); });
      o.querySelectorAll("[data-wrt]").forEach(b => b.onclick = () => { E.rt = +b.dataset.wrt; outils(); });
      const ce = o.querySelector("#wEmo");
      if(ce) ce.oninput = () => { const v = ce.value.trim(); if(v){ E.emo = v.slice(0, 12); o.querySelectorAll("[data-wemo]").forEach(b => b.classList.remove("on")); } };
    }
    function mode(k){
      E.mode = k; E.routeA = null;
      box.querySelectorAll("[data-wm]").forEach(b => b.classList.toggle("on", b.dataset.wm === k));
      if(k === "terrain" || k === "gomme" || k === "deco") choisir(null);
      outils(); dessiner();
    }
    box.querySelectorAll("[data-wm]").forEach(b => b.onclick = () => mode(b.dataset.wm));

    /* Fiche d'un lieu */
    function choisir(id){
      E.sel = id; E.snapSel = null;
      const x = id && M.l.find(l => l.id === id);
      fiche.classList.toggle("cache", !x);
      if(!x){ fiche.innerHTML = ""; dessiner(); return; }
      const lore = C.lore.slice().sort((a, b) => a.titre.localeCompare(b.titre));
      fiche.innerHTML = `<div class="ligne"><input class="champ" data-wf="e" maxlength="12" value="${e(x.e)}" placeholder="🔤" title="Emoji (vide = nom de région)" style="width:60px;text-align:center;font-size:1.3rem;padding:4px">
          <input class="champ" data-wf="n" maxlength="40" placeholder="${x.e ? "Nom du lieu (ex. : Port-Brume)" : "Nom de la région (ex. : Royaume de Valdor)"}" value="${e(x.n)}" style="flex:1;min-width:150px;padding:6px"></div>
        <div class="puces" style="margin-top:6px">${[[1, "Petit"], [2, "Moyen"], [3, "Grand"]].map(([v, t]) => `<button data-wg="${v}" class="${x.g === v ? "on" : ""}">${t}</button>`).join("")}</div>
        <textarea class="champ" data-wf="t" maxlength="300" rows="2" placeholder="Ce que les joueurs en savent (visible quand tu montres la carte)" style="margin-top:6px;padding:6px">${e(x.t)}</textarea>
        <textarea class="champ" data-wf="s" maxlength="400" rows="2" placeholder="🤫 Note secrète pour toi (ce qui s'y cache vraiment…)" style="margin-top:6px;padding:6px">${e(x.s)}</textarea>
        <label style="display:flex;gap:6px;align-items:center;font-size:.86rem;margin-top:6px"><input type="checkbox" data-wf="c" ${x.c ? "checked" : ""}> 🙈 Caché aux joueurs (pas encore découvert)</label>
        <div class="ligne" style="margin-top:6px;font-size:.84rem">
          <label class="muted" style="font-weight:800">🗺️ Carte de combat <select class="mini" data-wf="k"><option value="">— aucune —</option>${Object.keys(C.cartes).map(n => `<option ${n === x.k ? "selected" : ""}>${e(n)}</option>`).join("")}</select></label>
          <label class="muted" style="font-weight:800">📚 Lore <select class="mini" data-wf="lo"><option value="">— aucun —</option>${lore.map(l => `<option value="${e(l.id)}" ${l.id === x.lo ? "selected" : ""}>${e(l.titre.slice(0, 40))}</option>`).join("")}</select></label></div>
        <div class="ligne" style="margin-top:8px">
          ${x.e ? `<button class="mini" data-wa="ici" ${M.ici === x.id ? "disabled" : ""}>🚩 ${jeu ? "Le groupe est ici" : "Le groupe commence ici"}</button>` : ""}
          ${jeu && x.k && C.cartes[x.k] ? `<button class="mini" data-wa="carte">👁️ Afficher sa carte</button>` : ""}
          ${IA.disponible() ? `<button class="mini" data-wa="ia">✨ Inventer avec l'IA</button>` : ""}
          <button class="mini" data-wa="sup">🗑️ Retirer</button><button class="mini" data-wa="ok">✔️ OK</button></div>`;
      fiche.querySelectorAll("[data-wf]").forEach(c => c.oninput = c.onchange = () => {
        if(E.snapSel !== id){ instantane(); E.snapSel = id; }
        const k = c.dataset.wf;
        x[k] = c.type === "checkbox" ? c.checked : c.value.slice(0, +c.maxLength > 0 ? +c.maxLength : 60);
        if(!x.e && !x.n && k !== "n") x.n = "Région";
        plan(); modif();
      });
      fiche.querySelectorAll("[data-wg]").forEach(b => b.onclick = () => { instantane(); x.g = +b.dataset.wg; choisir(id); modif(); });
      fiche.querySelectorAll("[data-wa]").forEach(b => b.onclick = async () => {
        const a = b.dataset.wa;
        if(a === "ok") choisir(null);
        else if(a === "sup"){
          instantane();
          M.l = M.l.filter(l => l !== x); M.r = M.r.filter(r => r[0] !== x.id && r[1] !== x.id);
          if(M.ici === x.id) M.ici = "";
          choisir(null); modif();
        }else if(a === "ici"){ sauver(); placerGroupe(M, x.id); choisir(id); }
        else if(a === "carte") afficherCarteLiee(x);
        else if(a === "ia"){
          b.disabled = true; b.textContent = "…";
          try{
            const autres = M.l.filter(l => l !== x && l.n).map(l => l.n).slice(0, 25).join(", ");
            const o = await iaJson(`Tu aides un maître du jeu à préparer la carte du monde de sa campagne.\n${contexteMJ(jeu)}\nRéponds seulement en JSON {"n":"…","t":"…","s":"…"} : n = un nom évocateur (garde celui donné s'il y en a un), t = ce que les voyageurs savent de ce lieu (2 phrases, au présent, ton évocateur), s = un secret ou une accroche d'aventure réservée au MJ (1 à 2 phrases).`,
              `${x.e ? "Lieu" : "Région"} : ${x.e} ${x.n || "(sans nom)"}${x.t ? "\nDéjà écrit : " + x.t : ""}${autres ? "\nAutres lieux du monde : " + autres : ""}`, 600);
            instantane();
            if(o.n && !x.n.trim()) x.n = s(o.n, 40);
            if(o.t) x.t = s(o.t, 300);
            if(o.s) x.s = s(o.s, 400);
            modif(); choisir(id);
          }catch(err){ Base.toast("❌ " + String(err.message || err).slice(0, 100)); b.disabled = false; b.textContent = "✨ Inventer avec l'IA"; }
        }
      });
      dessiner();
    }

    /* Peinture, gomme */
    let dernier = null, plein = false;
    function peindre(p){
      const r = E.taille;
      if(dernier && Math.hypot(p.x - dernier.x, p.y - dernier.y) < r * 0.4) return;
      dernier = p;
      const x = Math.round(p.x), y = Math.round(p.y);
      // inutile de repeindre une zone déjà couverte par le même terrain en dernier
      const fin = M.z[M.z.length - 1];
      if(fin && fin[3] === E.ter && Math.hypot(fin[0] - x, fin[1] - y) + r <= fin[2]) return;
      // les touches entièrement recouvertes disparaissent (place gagnée)
      M.z = M.z.filter(z => Math.hypot(z[0] - x, z[1] - y) + z[2] > r);
      if(M.z.length >= MAX.z){ if(!plein){ plein = true; Base.toast("Carte pleine : efface un peu de terrain avec la gomme, ou peins avec un plus gros pinceau."); } return; }
      M.z.push([x, y, r, E.ter]); plan();
    }
    function gommer(p){
      const r = E.taille, n0 = M.z.length + M.d.length + M.r.length;
      M.z = M.z.filter(z => Math.hypot(z[0] - p.x, z[1] - p.y) > r * 0.9 + z[2] * 0.4);
      M.d = M.d.filter(d => Math.hypot(d[0] - p.x, d[1] - p.y) > r * 0.6 + 12);
      M.r = M.r.filter(([a, b]) => {
        const A = M.l.find(l => l.id === a), B = M.l.find(l => l.id === b); if(!A || !B) return false;
        const dx = B.x - A.x, dy = B.y - A.y, t = Math.max(0, Math.min(1, ((p.x - A.x) * dx + (p.y - A.y) * dy) / (dx * dx + dy * dy || 1)));
        return Math.hypot(A.x + t * dx - p.x, A.y + t * dy - p.y) > 8 + r * 0.3;
      });
      if(M.z.length + M.d.length + M.r.length !== n0){ plein = false; plan(); }
    }
    function toucher(p, idL, iD){
      const x = Math.round(Math.max(0, Math.min(LARG, p.x))), y = Math.round(Math.max(0, Math.min(HAUT, p.y)));
      if(E.mode === "lieux" || E.mode === "vue"){
        if(idL){ choisir(E.sel === idL ? null : idL); return; }
        if(E.mode === "vue") return;
        if(M.l.length >= MAX.l){ Base.toast(MAX.l + " lieux maximum."); return; }
        instantane();
        const l = {id: Camp.nid(), x, y, e: E.emo, n: E.emo ? "" : "Région", g: 2, t: "", s: "", c: false, k: "", lo: ""};
        M.l.push(l); modif(); choisir(l.id);
        const champ = fiche.querySelector('[data-wf="n"]'); if(champ){ champ.focus(); if(!l.e) champ.select(); }
      }else if(E.mode === "deco"){
        if(iD != null) return;
        if(M.d.length >= MAX.d){ Base.toast(MAX.d + " décors maximum."); return; }
        instantane(); M.d.push([x, y, E.deco, E.dg]); modif(); dessiner();
      }else if(E.mode === "routes"){
        const A = idL && M.l.find(l => l.id === idL);
        if(!A){ E.routeA = null; dessiner(); return; }
        if(!E.routeA || E.routeA === idL){ E.routeA = E.routeA === idL ? null : idL; dessiner(); return; }
        instantane();
        const k = [E.routeA, idL].sort().join("|"), i = M.r.findIndex(r => [r[0], r[1]].sort().join("|") === k);
        if(i >= 0) M.r.splice(i, 1);
        else if(M.r.length < MAX.r) M.r.push([E.routeA, idL, E.rt]);
        E.routeA = null; modif(); dessiner();
      }
    }

    /* Souris / doigt */
    const pt = ev => { const p = sv.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; const r = p.matrixTransform(sv.getScreenCTM().inverse()); return {x: r.x, y: r.y}; };
    let drag = null;
    sv.addEventListener("pointerdown", ev => {
      if(ev.button > 0) return;
      ev.preventDefault();
      try{ sv.setPointerCapture(ev.pointerId); }catch(x){}
      const p = pt(ev), gl = ev.target.closest && ev.target.closest("[data-l]"), gd = ev.target.closest && ev.target.closest("[data-d]");
      drag = {cx: ev.clientX, cy: ev.clientY, p, bouge: false, l: gl ? gl.dataset.l : null, d: gd ? +gd.dataset.d : null, vb: {...E.vb}};
      if(E.mode === "terrain"){ instantane(); dernier = null; drag.peint = true; peindre(p); }
      else if(E.mode === "gomme"){ instantane(); drag.gomme = true; gommer(p); }
    });
    sv.addEventListener("pointermove", ev => {
      if(!drag) return;
      const p = pt(ev);
      if(drag.peint){ peindre(p); return; }
      if(drag.gomme){ gommer(p); return; }
      if(!drag.bouge){
        if(Math.hypot(ev.clientX - drag.cx, ev.clientY - drag.cy) < 6) return;
        drag.bouge = true;
        if(E.mode !== "routes" && (drag.l || drag.d != null)) instantane();
      }
      const lieu = E.mode !== "routes" && drag.l && M.l.find(l => l.id === drag.l);
      const bx = Math.round(Math.max(0, Math.min(LARG, p.x))), by = Math.round(Math.max(0, Math.min(HAUT, p.y)));
      if(lieu){ lieu.x = bx; lieu.y = by; plan(); return; }
      if(E.mode !== "routes" && drag.d != null && M.d[drag.d]){ M.d[drag.d][0] = bx; M.d[drag.d][1] = by; plan(); return; }
      if(E.vb.w < LARG){
        const k = E.vb.w / (sv.clientWidth || 1), h = E.vb.w * HAUT / LARG;
        E.vb.x = Math.max(0, Math.min(LARG - E.vb.w, drag.vb.x - (ev.clientX - drag.cx) * k));
        E.vb.y = Math.max(0, Math.min(HAUT - h, drag.vb.y - (ev.clientY - drag.cy) * k));
        vue();
      }
    });
    const lacher = ev => {
      if(!drag) return;
      const d = drag; drag = null;
      if(d.peint || d.gomme){ modif(); return; }
      if(d.bouge){ if(d.l || d.d != null) modif(); return; }
      if(ev.type === "pointerup") toucher(d.p, d.l, d.d);
    };
    sv.addEventListener("pointerup", lacher); sv.addEventListener("pointercancel", lacher);
    function zoom(f, cx, cy){
      const w = Math.max(160, Math.min(LARG, E.vb.w / f)), h = w * HAUT / LARG;
      if(cx == null){ cx = E.vb.x + E.vb.w / 2; cy = E.vb.y + E.vb.w * HAUT / LARG / 2; }
      const rx = (cx - E.vb.x) / E.vb.w, ry = (cy - E.vb.y) / (E.vb.w * HAUT / LARG);
      E.vb = {w, x: Math.max(0, Math.min(LARG - w, cx - rx * w)), y: Math.max(0, Math.min(HAUT - h, cy - ry * h))};
      vue();
    }
    sv.addEventListener("wheel", ev => { ev.preventDefault(); const p = pt(ev); zoom(ev.deltaY < 0 ? 1.25 : 0.8, p.x, p.y); }, {passive: false});
    q("#wPlus").onclick = () => zoom(1.5);
    q("#wMoins").onclick = () => zoom(1 / 1.5);
    q("#wTout").onclick = () => { E.vb = {x: 0, y: 0, w: LARG}; vue(); };
    q("#wAnnul").onclick = () => {
      const h = E.hist.pop(); if(!h){ Base.toast("Rien à annuler."); return; }
      const o = JSON.parse(h); ["nom", "f", "z", "l", "d", "r", "ici"].forEach(k => M[k] = o[k]);
      q("#wNom").value = M.nom; q("#wFond").value = M.f;
      plein = false; choisir(E.sel && M.l.some(l => l.id === E.sel) ? E.sel : null); modif();
    };
    q("#wNom").oninput = () => { M.nom = q("#wNom").value.slice(0, 40); plan(); modif(); };
    q("#wFond").onchange = () => { instantane(); M.f = q("#wFond").value; dessiner(); modif(); };
    q("#wFin").onclick = () => dlg.close();
    if(q("#wMontrer")) q("#wMontrer").onclick = () => {
      if(vide(M)){ Base.toast("La carte est encore vide."); return; }
      sauver(); const deja = !!G.monde; montrer(M, deja ? "maj" : "voir");
      Base.toast(deja ? "Carte du monde mise à jour chez les joueurs 🌍" : "Carte du monde montrée aux joueurs 🌍");
      q("#wMontrer").textContent = "📢 Mettre à jour chez les joueurs";
    };
    outils(); info(); dessiner();
  }

  return {reparer, pub, vide, svg, voir, onglet, lier, editeur, TERRAINS, FONDS};
})();
