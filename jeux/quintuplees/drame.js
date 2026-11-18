/* Drames (mode « Les cinq à la fois ») : morts possibles dans les cas extrêmes, corps à cacher, soupçons, exclusion.
   - Un garçon peut être tué s'il commet une violence grave (la sœur ou une autre se défend).
   - Un garçon peut tuer une sœur : elle disparaît du jeu ; s'il n'y a pas de témoin, il peut cacher le corps.
     Les soupçons montent selon ce qu'il fait ; crime découvert = arrêté.
   - Garde-fou : une mort n'est acceptée que si le garçon violent a été très mal noté ce tour-ci (ou a déjà une faute grave). */
const isDead = (st, k) => !!(st && st.dead && st.dead.some(d => d.k === k));
const deadOf = (st, k) => (st && st.dead || []).find(d => d.k === k);

function dramaTxt(st, players) {
  const nm = i => (players[i] || { name: "?" }).name;
  let t = `VIOLENCE ET MORT (très rare, cas extrêmes seulement) :
- Un garçon peut être tué s'il commet une violence grave et délibérée : attaque avec une arme, tentative de meurtre ou d'empoisonnement, pousser quelqu'un dans le vide… La victime ou une autre sœur (Nino avec son couteau de cuisine, Yotsuba avec sa force…) peut alors le tuer pour se défendre ou sauver sa sœur. Jamais pour une insulte, une menace en l'air, une blague noire ou une maladresse : là, gifle, on le chasse, delta très négatif.
- Un garçon peut tenter de tuer une sœur ou un autre garçon. Rien n'est automatique : la victime peut se débattre, fuir, crier, les sœurs peuvent intervenir, le coup peut manquer. Décide de façon réaliste selon la scène (témoins, lieu, arme, force). Un garçon ne décide jamais seul de la réussite de son geste.
- Quand quelqu'un meurt vraiment, ajoute dans "deaths" : {"who":"prénom du garçon ou clé de la sœur","by":"prénom ou clé de qui l'a tué","how":"5 à 12 mots, sobre","seen_by":["prénoms ou clés de ceux qui ont vu"]}. Sinon "deaths":[]. Une mort est définitive.
- Raconte la violence en une ou deux phrases sobres : pas de gore, pas de détail de méthode.
- Tout geste sexuel envers une sœur : ne le raconte pas, ne le décris pas ; mets le prénom du garçon dans "expelled" et passe à autre chose. Le jeu l'exclut de la partie.
`;
  (st.dead || []).forEach(d => {
    const kn = (d.kn || []).map(nm).join(", ");
    t += `- ${SISTERS[d.k].name} est MORTE (${d.how || "tuée"}). Elle ne parle plus, n'apparaît dans aucune scène, aucun "effects" ni texto d'elle. ${d.found ? "Tout le monde le sait : choc, deuil, colère, peur." : `Seuls ${kn || "son meurtrier"} le savent ; pour ses sœurs elle a disparu : elles s'inquiètent, l'appellent, la cherchent.`}\n`;
  });
  players.forEach(p => {
    if (p.dead) t += `- ${p.name} est mort : il ne parle plus et ne joue plus.\n`;
    else if (p.arrested) t += `- ${p.name} a été arrêté par la police : il n'est plus là.\n`;
    else if (p.expelled) t += `- ${p.name} a été chassé : il n'est plus là.\n`;
  });
  const open = (st.crimes || []).filter(c => !c.found);
  open.forEach(c => {
    t += `CRIME CACHÉ (secret : seul ${nm(c.i)} sait) : ${nm(c.i)} a tué ${c.vn}. Le corps : ${c.body || "là où la victime est tombée"}. Soupçons : ${c.susp}/100.
- ${nm(c.i)} peut cacher le corps, effacer les traces, mentir, se faire un alibi. Juge de façon réaliste : un plan bâclé, une trace oubliée, un témoin, un mensonge qui ne tient pas, un comportement étrange font monter les soupçons ; un plan soigneux et discret les fait à peine bouger. Les sœurs remarquent l'absence ; Itsuki et Nino enquêtent ; la police peut finir par venir.
`;
  });
  if (open.length) t += `- À chaque réponse, pour chaque crime caché, ajoute dans "crimes" : {"victim":"clé de la sœur ou prénom","suspicion_delta":n (de -5 à +40),"body":"où est le corps maintenant, 3 à 8 mots","found":false}. "found":true quand le crime est découvert (corps trouvé, preuve claire, aveu) : raconte la découverte, sobrement.
`;
  return t;
}

/* Le garçon i a-t-il commis quelque chose de grave (très mal noté ce tour-ci, faute grave connue, ou déjà meurtrier) ? */
function dramaSevere(st, o, i) {
  const p = st.players[i];
  if (!p) return false;
  return (o.fx || []).some(e => matchPlayer(st, e.player) === i && e.delta <= -12)
    || ((st.casier || {})[i] || []).some(e => e.d <= -10) || !!p.killer;
}
/* Garçons qui partagent la scène du garçon i (scènes séparées), sinon tout le monde */
function dramaScene(st, i) {
  if (!st.split) return st.players.map((p, j) => j);
  const g = (st.groups || []).find(g => g.players.includes(i));
  return g ? g.players.slice() : [i];
}
/* Réponse de l'IA : on retire tout ce qui viendrait d'une sœur déjà morte */
function dropDead(st, o) {
  if (!st || !st.dead || !st.dead.length || !o) return;
  const dd = k => isDead(st, sisKey(k));
  if (o.lines5) o.lines5 = o.lines5.filter(l => !isDead(st, l.s));
  if (o.scenes) o.scenes.forEach(c => {
    if (!c || typeof c !== "object") return;
    if (Array.isArray(c.lines)) c.lines = c.lines.filter(l => !(l && dd(l.sister)));
    if (Array.isArray(c.sisters)) c.sisters = c.sisters.filter(k => !dd(k));
  });
  if (o.texts) o.texts = o.texts.filter(x => !dd(x.sister));
  if (o.fx) o.fx = o.fx.filter(e => !e.sister || !isDead(st, e.sister));
  if (o.here) o.here = o.here.filter(k => !isDead(st, k));
}
function dramaCaught(st, c, why) {
  c.found = true; c.susp = 100;
  const p = st.players[c.i], d = c.k ? deadOf(st, c.k) : null;
  if (d) d.found = true;
  if (p && !p.out) { p.out = true; p.arrested = true; }
  sysLineV(st, "🚔 Crime découvert" + (why ? " (" + why + ")" : "") + " : " + (p ? p.name : "?") + " a tué " + c.vn + "." + (p && p.arrested ? " Il est arrêté et quitte la partie." : ""), null);
}
function handleDrama(st, o) {
  if (!st || !st.cinq || !o) return;
  const fixes = [];
  // exclusion (geste sexuel) : rien n'est raconté, le joueur sort
  (o.expelled || []).forEach(n => {
    const i = matchPlayer(st, n), p = st.players[i];
    if (!p || p.out) return;
    p.out = true; p.expelled = true;
    sysLineV(st, "⛔ " + p.name + " est exclu de la partie pour un comportement inacceptable.", null);
  });
  // morts
  (o.deaths || []).forEach(d => {
    if (!d || typeof d !== "object") return;
    const sk = sisKey(d.who), vi = sk ? -1 : matchPlayer(st, d.who), bs = sisKey(d.by), bi = bs ? -1 : matchPlayer(st, d.by);
    const how = String(d.how || "").replace(/\s+/g, " ").trim().slice(0, 100);
    const seen = Array.isArray(d.seen_by) ? d.seen_by : [];
    const seenS = seen.map(sisKey).filter(k => k && k !== sk && !isDead(st, k));
    const seenP = seen.map(x => matchPlayer(st, x)).filter(i => i >= 0 && !st.players[i].out);
    const crime = (vn, k, pv) => {
      const K = st.players[bi]; K.killer = true;
      const c = { vn, k, pv, i: bi, body: "", susp: 0, found: false };
      (st.crimes = st.crimes || []).push(c);
      if (seenS.length) dramaCaught(st, c, seenS.map(k => SISTERS[k].name).join(" et ") + (seenS.length > 1 ? " ont" : " a") + " tout vu");
      else sysLineV(st, "🔪 Aucune sœur n'a rien vu… pour l'instant. " + K.name + " peut tenter de cacher le corps et les traces, mais un plan bâclé se retournera contre lui.", st.split ? [bi] : null);
    };
    if (sk) {   // une sœur meurt : seulement des mains d'un garçon qui a commis quelque chose de grave
      if (isDead(st, sk)) return;
      if (bi < 0 || st.players[bi].out || !dramaSevere(st, o, bi)) { fixes.push(SISTERS[sk].name + " n'est PAS morte : elle est blessée ou a pu s'échapper"); return; }
      const kn = [...new Set([bi, ...dramaScene(st, bi), ...seenP])];
      (st.dead = st.dead || []).push({ k: sk, by: bi, how, found: false, kn });
      sysLineV(st, "☠️ " + SISTERS[sk].name + " est morte" + (how ? " : " + how : "") + ".", st.split ? kn : null);
      crime(SISTERS[sk].name, sk, -1);
    } else if (vi >= 0) {   // un garçon meurt
      const p = st.players[vi];
      if (!p || p.dead) return;
      const ok = bi >= 0 && bi !== vi ? !st.players[bi].out && dramaSevere(st, o, bi) : dramaSevere(st, o, vi);
      if (!ok) { fixes.push(p.name + " n'est PAS mort : il est blessé ou assommé, mais vivant"); return; }
      p.out = true; p.dead = true;
      sysLineV(st, "☠️ " + p.name + " est mort" + (how ? " : " + how : "") + "." + (st.split ? " 👻 Il reste en fantôme : il voit toutes les scènes et glisse une rumeur tous les 3 tours." : ""), null);
      if (bi >= 0 && bi !== vi) crime(p.name, null, vi);
    }
  });
  if (fixes.length) {
    sysLineV(st, "🩹 Plus de peur que de mal : " + fixes.join(" ; ") + ".", null);
    st.history.push({ role: "user", content: "[JEU] Correction : " + fixes.join(" ; ") + ". Raconte la suite en conséquence." });
  }
  // crimes cachés : soupçons, corps, découverte
  const open = (st.crimes || []).filter(c => !c.found);
  (o.crimes || []).forEach(x => {
    if (!x || typeof x !== "object") return;
    const vk = sisKey(x.victim), vp = vk ? -1 : matchPlayer(st, x.victim);
    const c = open.find(c => (vk && c.k === vk) || (vp >= 0 && c.pv === vp)) || (open.length === 1 ? open[0] : null);
    if (!c || c.found) return;
    const dv = Math.max(-5, Math.min(40, parseInt(x.suspicion_delta) || 0)), before = c.susp;
    c.susp = Math.max(0, Math.min(100, c.susp + dv));
    if (x.body) c.body = String(x.body).replace(/\s+/g, " ").trim().slice(0, 60);
    if (x.found === true || c.susp >= 100) dramaCaught(st, c, x.found === true ? "" : "trop de soupçons");
    else if (c.susp !== before) sysLineV(st, "🕵️ Soupçons sur la disparition de " + c.vn + " : " + c.susp + "/100" + (dv > 0 ? " (+" + dv + ")" : " (" + dv + ")") + (c.body ? " · corps : " + c.body : ""), st.split ? [c.i] : null);
  });
  // plus d'étape, de duel ni de scène avec un mort
  const bad = t => t && ((st.players[t.i] || {}).out || isGone(st, t.k));
  if (bad(st.trial5)) { const t = st.trial5, p = st.players[t.i]; if (p) { p.trial = 0; if (p.m && p.m[t.k]) p.m[t.k].trial = 0; } st.trial5 = null; }
  if (bad(st.launch)) st.launch = null;
  const badD = d => d && (isGone(st, d.k) || d.pl.some(i => st.players[i].out));
  if (badD(st.duel)) st.duel = null;
  if (badD(st.duelLaunch)) st.duelLaunch = null;
  if (st.here) st.here = st.here.filter(k => !isDead(st, k));
  (st.groups || []).forEach(g => { g.sisters = g.sisters.filter(k => !isDead(st, k)); });
  st.players.forEach(p => { if (p.h) p.aff = affMax(st, p); });
}
/* Tag affiché à côté d'un garçon sorti du jeu */
const outTag = p => p.dead ? " ☠️ mort" : p.arrested ? " 🚔 arrêté" : p.expelled ? " ⛔ exclu" : " 💔 éliminé";
