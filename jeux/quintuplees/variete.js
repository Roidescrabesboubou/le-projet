/* Les Quintuplées — variété des parties (mode « les cinq à la fois »)
   1) une situation secrète par sœur, 2) un cadre de partie, 3) les clichés déjà vus (cette partie et les précédentes),
   4) des goûts secrets à découvrir, 5) une idée imposée pour chaque étape. Tout est tiré au début de la partie. */
const VAR_SITU = {
  ichika: [
    "Elle a décroché un petit rôle dans un film, mais la scène clé est un baiser à l'écran avec un acteur qu'elle ne supporte pas, et ça la travaille.",
    "Son agence la pousse à quitter le lycée pour se consacrer au cinéma ; elle n'en a encore rien dit à ses sœurs.",
    "Elle s'est mise en secret à apprendre à cuisiner pour prouver à Nino qu'elle n'est pas une catastrophe, et c'est une catastrophe.",
    "Elle a perdu un pari contre Yotsuba et doit rendre un service à quelqu'un chaque jour de la semaine.",
    "Elle dort mal : un rêve qui revient sur leur mère la poursuit, et elle le cache derrière ses blagues.",
    "Elle a décidé de ranger enfin sa chambre, devenue un champ de bataille, et cherche de l'aide sans vouloir l'avouer.",
    "Un magazine veut l'interviewer sur « sa vie amoureuse » et elle doit inventer quelque chose avant vendredi."
  ],
  nino: [
    "Elle est fâchée avec Ichika à cause d'un vêtement emprunté et abîmé : elles ne se parlent plus et toute la maison le sent.",
    "Elle prépare un concours de stylisme et il lui manque un modèle pour présenter sa tenue.",
    "Le vieux téléphone qui contient toutes les photos de famille ne s'allume plus, et elle y tient plus qu'à tout.",
    "Elle s'est brûlé la main : interdite de cuisine cette semaine, elle est d'une humeur massacrante.",
    "Elle joue en cachette à un jeu de rythme dans une salle d'arcade et vise le meilleur score du quartier.",
    "Elle a reçu une lettre d'amour anonyme et veut à tout prix démasquer son auteur.",
    "Elle a une peur bleue des orages, et la météo en annonce plusieurs cette semaine."
  ],
  miku: [
    "Elle a décidé d'apprendre la guitare et s'entraîne en cachette, encore très mal.",
    "Elle veut lancer une chaîne vidéo mais se fige dès qu'une caméra la regarde.",
    "Elle a promis, sur un coup de tête, de courir la course de fond du lycée, alors qu'elle déteste courir.",
    "Elle a perdu son casque fétiche et se sent nue sans lui.",
    "Elle cherche un petit boulot pour s'offrir quelque chose dont elle refuse de parler.",
    "Elle est jalouse des notes d'Itsuki et s'en veut d'être jalouse.",
    "Elle s'est mise au dessin et remplit un carnet qu'elle ne montre à personne."
  ],
  yotsuba: [
    "Elle s'est tordu la cheville : interdite de sport pendant deux semaines, elle tourne en rond comme un lion en cage.",
    "Elle a dit oui à trop de clubs à la fois et craque en silence sous le poids des promesses.",
    "Elle a raté un examen, doit le repasser et a honte de l'avouer à ses sœurs.",
    "Elle prépare en secret une surprise pour ses sœurs et a besoin d'un complice discret.",
    "Elle a recueilli en douce un chaton qu'elle cache dans un carton, alors que les animaux sont interdits dans l'immeuble.",
    "Une promesse d'enfance oubliée lui revient en mémoire et la rend mélancolique.",
    "Elle a été choisie pour faire un discours devant tout le lycée et elle est terrifiée."
  ],
  itsuki: [
    "Elle doute de son rêve de devenir enseignante après une note humiliante.",
    "Elle s'est mise au régime et devient irritable dès qu'on parle de nourriture.",
    "Elle a promis de garder le chien d'une voisine, un molosse turbulent qui ne l'écoute pas du tout.",
    "Elle cherche en secret des informations sur leur père biologique et n'en a parlé à personne.",
    "Elle veut participer à un concours d'éloquence mais bafouille dès qu'elle est stressée.",
    "Elle est en froid avec Miku pour une dispute idiote à propos d'un livre emprunté.",
    "Elle a commencé à écrire un roman et cherche un premier lecteur honnête."
  ]
};
const VAR_CADRES = [
  { id: "kyoto", ico: "🏯", name: "Voyage scolaire à Kyoto", ctx: "La classe part une semaine à Kyoto : temples, ruelles de Gion, auberge traditionnelle, bains, couvre-feu des professeurs, chambres des filles interdites aux garçons.",
    parts: [{ ico: "🏯", name: "Matinée de visites", hint: "temples, sanctuaires, guide pressé, groupes de visite" }, { ico: "☀️", name: "Après-midi libre en ville", hint: "ruelles, boutiques de souvenirs, salons de thé, bus perdus" }, { ico: "🌙", name: "Soirée à l'auberge", hint: "repas en yukata, bains, couloirs après le couvre-feu, oreillers" }],
    ev: [["Groupe perdu", "Le groupe s'est dispersé dans les ruelles et une partie de la classe est introuvable."], ["Ronde du professeur", "Le professeur fait sa ronde du couvre-feu et ouvre les portes une à une."], ["Photo de groupe", "Le photographe exige une photo de groupe et chacun doit choisir à côté de qui se placer."]] },
  { id: "festival", ico: "🎆", name: "Festival d'été", ctx: "C'est la semaine du festival d'été du quartier : stands, yukatas, pêche aux poissons rouges, danses, et le grand feu d'artifice qui clôture la semaine.",
    parts: [{ ico: "🏫", name: "Matin (préparatifs)", hint: "lycée en fin d'année, préparation des stands, essayage des yukatas" }, { ico: "🏮", name: "Après-midi au festival", hint: "stands de jeux, chaleur, glaces pilées, foule" }, { ico: "🎆", name: "Soirée de festival", hint: "lanternes, feu d'artifice, retour à pied, appartement Nakano" }],
    ev: [["Foule compacte", "La foule devient si dense qu'on risque de se perdre de vue."], ["Concours du stand", "Un stand organise un concours en duo avec un gros lot."], ["Sandale cassée", "Une lanière de sandale casse en plein milieu de la foule."]] },
  { id: "examens", ico: "📚", name: "Semaine des examens", ctx: "C'est la semaine des examens de fin de trimestre : tout le monde est à cran, les révisions s'enchaînent tard le soir, le moindre échec compte.",
    ev: [["Panne de courant", "Une panne de courant plonge l'immeuble dans le noir en pleine soirée de révision."], ["Rumeur de fuite", "Une rumeur court : le sujet de l'examen aurait fuité, et quelqu'un propose de le vendre."], ["Nuit blanche", "Quelqu'un s'est endormi sur ses cahiers et a raté un rendez-vous important."]] },
  { id: "bunkasai", ico: "🎪", name: "Fête du lycée", ctx: "Le lycée prépare sa fête annuelle : chaque classe monte un café, une maison hantée ou une pièce ; les répétitions, les costumes et les disputes d'organisation occupent tout le monde.",
    parts: [{ ico: "🏫", name: "Matin (cours et répétitions)", hint: "cours écourtés, salles en travaux, costumes" }, { ico: "🎪", name: "Après-midi de préparatifs", hint: "décors, achats de matériel, maison hantée, café de classe" }, { ico: "🌙", name: "Soirée chez les Nakano", hint: "couture des costumes, panneaux à peindre, fatigue" }],
    ev: [["Décor détruit", "Un décor sur lequel la classe a travaillé des heures s'effondre."], ["Rôle vacant", "L'élève qui devait tenir un rôle est malade : il faut un remplaçant tout de suite."], ["Concours des classes", "Le jury annonce un prix pour la meilleure attraction, et la rivalité monte."]] },
  { id: "mer", ico: "🏖️", name: "Classe de mer", ctx: "La classe part trois jours au bord de la mer : plage, activités nautiques, chalets en bois, feu de camp et nuits sous un ciel étoilé.",
    parts: [{ ico: "🌊", name: "Matin à la plage", hint: "activités encadrées, kayak, sable, soleil" }, { ico: "☀️", name: "Après-midi libre", hint: "criques, village de pêcheurs, glaces, coquillages" }, { ico: "🔥", name: "Soirée au camp", hint: "feu de camp, histoires, chalets, balade nocturne" }],
    ev: [["Marée montante", "La marée monte plus vite que prévu et coupe le chemin du retour."], ["Méduse", "Quelqu'un se fait piquer par une méduse."], ["Test de courage", "Les professeurs organisent un test de courage nocturne par deux dans les bois."]] },
  { id: "ski", ico: "⛷️", name: "Séjour au ski", ctx: "La classe passe quelques jours dans un chalet à la montagne : pistes, cours de ski catastrophiques, bains chauds, chocolat chaud, tempête de neige possible.",
    parts: [{ ico: "⛷️", name: "Matin sur les pistes", hint: "cours de ski, télésièges, chutes, moniteur sévère" }, { ico: "☕", name: "Après-midi au village", hint: "boutiques, luge, bonhomme de neige, café" }, { ico: "🌙", name: "Soirée au chalet", hint: "bains chauds, jeux de société, cheminée, couloirs" }],
    ev: [["Tempête de neige", "Une tempête de neige bloque tout le monde au chalet."], ["Télésiège en panne", "Le télésiège s'arrête net, suspendu au-dessus du vide."], ["Coupure d'électricité", "Le chalet n'a plus de chauffage pour la nuit."]] },
  { id: "pluies", ico: "🌧️", name: "Saison des pluies", ctx: "La saison des pluies s'installe : averses à répétition, sorties annulées, tout le monde se retrouve coincé à l'intérieur, à l'appartement ou au lycée.",
    ev: [["Fuite d'eau", "Une fuite d'eau inonde une pièce de l'appartement Nakano."], ["Bus annulé", "Les transports sont coupés : impossible de rentrer avant des heures."], ["Arc-en-ciel", "La pluie s'arrête d'un coup et un immense arc-en-ciel apparaît."]] },
  { id: "nouvelan", ico: "🏮", name: "Vacances du Nouvel An", ctx: "Ce sont les vacances d'hiver : grand ménage de fin d'année, visite au sanctuaire pour le premier vœu, cartes de vœux, soba du réveillon.",
    parts: [{ ico: "🧹", name: "Matin (grand ménage)", hint: "ménage de fin d'année, courses, cartes de vœux" }, { ico: "⛩️", name: "Après-midi en ville", hint: "sanctuaire, oracles omikuji, marché d'hiver" }, { ico: "🌙", name: "Soirée chez les Nakano", hint: "kotatsu, soba, émissions de fin d'année, cloches" }],
    ev: [["Mauvais présage", "Quelqu'un tire un oracle « grande malchance » au sanctuaire."], ["Kotatsu trop petit", "Tout le monde veut se glisser sous le seul kotatsu chauffé."], ["Vieux souvenir", "Le grand ménage fait ressortir une boîte de souvenirs d'enfance."]] }
];
const VAR_GOUTS = {
  ichika: { aime: ["les vieux films muets", "les jeux d'arcade de combat", "les plantes grasses", "les mangas shôjo des années 80", "le karaoké en duo", "nourrir les chats errants"], deteste: ["qu'on la traite de star", "les gens qui chuchotent dans son dos", "le café trop sucré", "les réveils qui sonnent fort"] },
  nino: { aime: ["les films d'horreur", "les jeux vidéo rétro", "les puzzles de mille pièces", "le thé noir à la bergamote", "les petits chiens", "les mangas de baston"], deteste: ["qu'on parle mal de sa mère", "le gaspillage", "les araignées", "les compliments trop faciles"] },
  miku: { aime: ["l'astronomie", "les jeux de cartes à collectionner", "les énigmes logiques", "le rock des années 70", "les poissons rouges", "les escape games"], deteste: ["les foules", "qu'on la compare à ses sœurs", "les films romantiques mièvres", "le crissement de la craie"] },
  yotsuba: { aime: ["le jardinage", "les contes pour enfants", "les origamis", "les jeux de société", "les comédies musicales", "les dessins animés du dimanche matin"], deteste: ["qu'on la plaigne", "les mensonges, même gentils", "les films tristes", "rester enfermée"] },
  itsuki: { aime: ["les romans policiers", "la calligraphie", "les vieux dictionnaires", "les quiz télévisés", "les chats", "la photo argentique"], deteste: ["qu'on se moque de son appétit", "les tricheurs", "les retards", "les histoires de fantômes"] }
};
/* Ce qu'on voit à chaque partie : à ne plus utiliser comme décor d'étape ni comme activité par défaut */
const VAR_CLICHE = { ichika: "théâtre, cinéma, répliques", nino: "cuisine, mode", miku: "généraux de l'époque Sengoku, histoire", yotsuba: "sport, entraînement", itsuki: "nourriture, repas, révisions" };
const VAR_CATS = [
  ["cuisine", /cuisin|recette|fourneau|tablier|casserole|poêle|émince/i],
  ["repas", /\bmange|manger|repas|nourriture|en-cas|goûter|déjeuner|dîner|faim|cafétéria|bouchée|grignot/i],
  ["théâtre", /théâtre|réplique|audition|scénario|actrice|tournage|répétition/i],
  ["histoire du Sengoku", /sengoku|samoura|takeda|nobunaga|généraux|shingen|kawanakajima/i],
  ["sport", /\bsport|entraînement|match|ballon|basket|athlétisme|footing/i],
  ["révisions", /révis|devoirs|examen|fiches|exercices/i],
  ["mode", /stylisme|couture|tenue|vêtement|fashion/i]
];
/* Idées imposées pour chaque étape (on en tire une, une autre à chaque nouvelle tentative) */
const VAR_ETAPES = [
  ["elle doit garder un secret embarrassant et cherche quelqu'un de confiance pour l'aider à le cacher",
   "elle a commis une erreur (objet cassé, parole blessante) et cherche un allié pour la réparer",
   "une dispute éclate entre elle et une sœur, et elle attend de voir de quel côté il se range",
   "elle a perdu quelque chose de précieux et le cherche partout, paniquée",
   "elle doit affronter quelqu'un qui l'a vexée (camarade, voisin, vendeur) et hésite",
   "elle lui confie une petite mission sans explication pour tester sa loyauté",
   "elle doit choisir entre deux options importantes et demande un avis vraiment sincère",
   "elle se retrouve coincée (porte fermée, panne, averse) avec lui et doit tuer le temps"],
  ["un musée insolite (illusions d'optique, objets bizarres)", "un atelier de poterie ou de peinture où ils se salissent", "une salle d'arcade avec un défi à relever",
   "un marché aux puces où chacun doit trouver un cadeau à l'autre pour presque rien", "un planétarium", "un cours d'essai de danse",
   "un pique-nique improvisé au bord de la rivière", "un café à chats", "un bowling", "un escape game à deux"],
  ["la grande roue au coucher du soleil", "un festival de lanternes", "une balade à vélo au bord de la mer", "un aquarium en nocturne",
   "un concert en plein air", "une promenade en barque sur un lac", "un toit pour regarder une pluie d'étoiles filantes", "une fête foraine sous la pluie"],
  ["une peur pour son avenir", "un souvenir de leur mère", "l'impression d'être interchangeable avec ses sœurs", "un échec qu'elle n'a jamais avoué",
   "une jalousie qu'elle a honte d'éprouver envers une sœur", "un rêve qu'elle trouve ridicule", "ce qui la travaille en secret en ce moment (sa situation secrète)"]
];

const vPick = a => a[Math.floor(Math.random() * a.length)];
const vShuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
function newVariete() {
  const K = Object.keys(VAR_SITU), lastCadre = (() => { try { return localStorage.getItem("quint_cadre") || ""; } catch (e) { return ""; } })();
  const cadre = vPick(VAR_CADRES.filter(c => c.id !== lastCadre));
  try { localStorage.setItem("quint_cadre", cadre.id); } catch (e) {}
  let prev = {};
  try { prev = JSON.parse(localStorage.getItem("quint_deja") || "{}") || {}; } catch (e) {}
  return {
    cadre: cadre.id,
    situ: Object.fromEntries(K.map(k => [k, vPick(VAR_SITU[k])])),
    gouts: Object.fromEntries(K.map(k => [k, { aime: vShuffle(VAR_GOUTS[k].aime).slice(0, 2), deteste: [vPick(VAR_GOUTS[k].deteste)] }])),
    seen: {}, prev, evUsed: []
  };
}
const cadreOf = st => st && st.var && VAR_CADRES.find(c => c.id === st.var.cadre);
const partsOf = st => (st && st.parts) || PARTS;

/* Texte ajouté au prompt des cinq */
function varTxt(st) {
  const V = st && st.var; if (!V) return "";
  const C = cadreOf(st), K = Object.keys(VAR_SITU), N = k => SISTERS[k].name;
  const seen = K.map(k => { const s = Object.entries(V.seen[k] || {}).filter(([, n]) => n >= 3).map(([c]) => c); return s.length ? N(k) + " → " + s.join(", ") : ""; }).filter(Boolean);
  const prev = K.map(k => (V.prev[k] || []).length ? N(k) + " → " + V.prev[k].join(", ") : "").filter(Boolean);
  return `
${C ? `CADRE DE CETTE PARTIE : ${C.ico} ${C.name}. ${C.ctx} Adapte la situation de départ, les lieux, les sorties et les événements à ce cadre.
` : ""}
CE QUI SE PASSE EN CE MOMENT DANS LA VIE DE CHAQUE SŒUR (tiré pour cette partie, inconnu des garçons) : ça colore son humeur, ses envies, ses scènes et ses étapes ; elle ne le raconte pas d'emblée, mais des indices transparaissent et elle peut s'en ouvrir peu à peu à un garçon de confiance.
${K.map(k => "- " + N(k) + " : " + V.situ[k]).join("\n")}

GOÛTS SECRETS DE CETTE PARTIE (inconnus des garçons) : ne les annonce jamais d'un bloc, mais glisse des indices naturels (un objet, une réaction, une allusion) pour qu'on puisse les deviner.
${K.map(k => "- " + N(k) + " : aime " + V.gouts[k].aime.join(" et ") + " ; déteste " + V.gouts[k].deteste[0]).join("\n")}
Quand un garçon devine, évoque ou touche juste avec l'un de ces goûts (il en parle, le propose, l'offre…), la sœur est agréablement surprise (+4 à +8 dans effects) et tu ajoutes {"player":"Nom","sister":"nino","taste":"le goût, mot pour mot"} dans le champ racine "secrets_found" (sinon "secrets_found":[]). Toucher son aversion la refroidit (-3 à -6), sans secrets_found.

VARIÉTÉ (important) : les sœurs ne se résument pas à leur passion habituelle (${K.map(k => N(k) + " : " + VAR_CLICHE[k]).join(" ; ")}). Ne ramène pas chaque scène à ces clichés : propose d'autres activités, lieux et sujets, tirés du cadre, de leur situation du moment et de leurs goûts secrets. Si un garçon propose lui-même une de ces activités, elles peuvent accepter.
${seen.length ? "- DÉJÀ VU DANS CETTE PARTIE (ne le relance plus toi-même) : " + seen.join(" ; ") + "\n" : ""}${prev.length ? "- DÉJÀ BEAUCOUP VU LORS DES PARTIES PRÉCÉDENTES (évite-le, surtout au début) : " + prev.join(" ; ") + "\n" : ""}`;
}

/* Idée imposée pour l'étape en cours d'un couple sœur / garçon (une nouvelle à chaque tentative) */
function msIdea(st, p, k) {
  const r = p && p.m && p.m[k]; if (!r || r.ms > 3) return "";
  const n = (r.tries[r.ms] || 0);
  if (!r.idea || r.idea.ms !== r.ms || r.idea.n !== n) {
    const used = (r.ideas || []);
    const pool = VAR_ETAPES[r.ms].filter(x => !used.includes(x));
    const txt = vPick(pool.length ? pool : VAR_ETAPES[r.ms]);
    r.idea = { ms: r.ms, n, txt }; r.ideas = used.concat(txt).slice(-20);
  }
  return r.idea.txt;
}
function msBrief(st, p, k, M) {
  const idea = st && st.var ? msIdea(st, p, k) : "";
  if (!idea) return M.brief;
  const lab = ["SITUATION IMPOSÉE", "LIEU IMPOSÉ", "LIEU IMPOSÉ", "SUJET DE LA CONFIDENCE"][p.m[k].ms];
  return M.brief + ` ${lab} pour cette fois : ${idea}. N'en fais pas une scène autour de ses clichés (${VAR_CLICHE[k]})${st.var.cadre ? " ; garde le cadre de la partie" : ""}.`;
}

/* Clichés vus : on compte, par sœur, ce dont elle parle (ses répliques, et la narration quand elle est seule avec un garçon) */
function varTrack(st, items) {
  const V = st && st.var; if (!V) return;
  items.forEach(({ s, text }) => {
    if (!s || !text) return;
    const S = (V.seen[s] = V.seen[s] || {});
    VAR_CATS.forEach(([c, re]) => { if (re.test(text)) S[c] = (S[c] || 0) + 1; });
  });
  // mémoire pour les parties suivantes : ce qui a été vu au moins 3 fois
  try {
    const out = {};
    Object.keys(VAR_SITU).forEach(k => { const s = Object.entries(V.seen[k] || {}).filter(([, n]) => n >= 3).map(([c]) => c); if (s.length) out[k] = s; });
    if (Object.keys(out).length) localStorage.setItem("quint_deja", JSON.stringify(out));
  } catch (e) {}
}

/* Goûts secrets découverts (champ IA secrets_found) : +5 au classement, une fois par goût et par garçon */
function varFound(st, o, matchPlayer, show) {
  const V = st && st.var; if (!V || !o || !Array.isArray(o.found)) return;
  o.found.forEach(f => {
    const i = matchPlayer(st, f.player), k = sisKey(f.sister), p = st.players[i];
    if (!p || !k || !V.gouts[k]) return;
    const t = String(f.taste || "").toLowerCase(), norm = x => x.toLowerCase().replace(/^(les?|la|l'|le) /, "");
    const g = V.gouts[k].aime.find(a => t && (norm(t).includes(norm(a).slice(0, 8)) || norm(a).includes(norm(t).slice(0, 8))));
    if (!g) return;
    p.found = p.found || [];
    if (p.found.some(x => x.k === k && x.g === g)) return;
    p.found.push({ k, g });
    show(`🔍 ${p.name} a découvert un goût secret ${/^[AEIOUY]/.test(SISTERS[k].name)?"d'":"de "}${SISTERS[k].name} : elle aime ${g} ! (+5 au classement)`, i);
  });
}
/* Événement du cadre, tiré de temps en temps à la place d'un événement ordinaire */
function varEvent(st) {
  const C = cadreOf(st); if (!C || !C.ev || Math.random() > 0.4) return null;
  const V = st.var, free = C.ev.map((e, i) => i).filter(i => !V.evUsed.includes(i));
  if (!free.length) return null;
  const i = vPick(free); V.evUsed.push(i);
  return { n: C.ev[i][0], t: C.ev[i][1], min: 0 };
}
