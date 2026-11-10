/* ============================================================
   CHANCEDLE — les badges d'un tirage (nombre de 000000 à 999999)
   Fichier partagé : utilisé par le jeu et par le script qui calcule
   la rareté de chaque badge (donnees.js). Si tu changes un badge,
   il faut recalculer donnees.js.
   Un badge « groupe » n'est donné qu'une fois par groupe : le plus rare.
   ============================================================ */
(function(racine){
  const MAX = 1000000;

  /* nombres premiers jusqu'à 999 999 (crible) */
  const compose = new Uint8Array(MAX); compose[0] = compose[1] = 1;
  for(let i = 2; i * i < MAX; i++) if(!compose[i]) for(let j = i * i; j < MAX; j += i) compose[j] = 1;
  const carres = new Set(), cubes = new Set(), fibo = new Set(), puiss2 = new Set();
  for(let k = 0; k * k < MAX; k++) carres.add(k * k);
  for(let k = 0; k * k * k < MAX; k++) cubes.add(k * k * k);
  for(let a = 0, b = 1; a < MAX; [a, b] = [b, a + b]) fibo.add(a);
  for(let p = 1; p < MAX; p *= 2) puiss2.add(p);
  const JOURS_MOIS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const RETOURNE = {0: 0, 1: 1, 6: 9, 8: 8, 9: 6};

  /* x = infos précalculées sur le nombre */
  function infos(n){
    const s = String(n).padStart(6, "0"), d = [...s].map(Number);
    let serie = 1, maxSerie = 1, paires = 0;
    for(let i = 1; i < 6; i++){
      if(d[i] === d[i - 1]){ serie++; if(serie === 2) paires++; }
      else serie = 1;
      if(serie > maxSerie) maxSerie = serie;
    }
    let monte = 1, descend = 1, suite = 1;
    for(let i = 1; i < 6; i++){
      monte = d[i] === d[i - 1] + 1 ? monte + 1 : 1;
      descend = d[i] === d[i - 1] - 1 ? descend + 1 : 1;
      suite = Math.max(suite, monte, descend);
    }
    let zeros = 0; for(let i = 5; i >= 0 && d[i] === 0; i--) zeros++;
    const somme = d.reduce((a, b) => a + b, 0);
    return {n, s, d, maxSerie, paires, suite, zeros, somme, distincts: new Set(d).size};
  }

  const tousSi = (d, f) => d.every(f);
  function zigzag(d){
    for(let i = 1; i < 5; i++){
      const a = d[i] - d[i - 1], b = d[i + 1] - d[i];
      if(!a || !b || (a > 0) === (b > 0)) return false;
    }
    return d[1] !== d[0];
  }
  function strictement(d, sens){ for(let i = 1; i < 6; i++) if((d[i] - d[i - 1]) * sens <= 0) return false; return true; }

  /* id, emoji, nom, explication, groupe (facultatif), test */
  const BADGES = [
    ["double",   "🟰", "Doublé",           "Deux chiffres identiques côte à côte",               "serie",  x => x.maxSerie === 2],
    ["brelan",   "🎰", "Brelan",           "Trois chiffres identiques côte à côte",              "serie",  x => x.maxSerie === 3],
    ["carre4",   "🃏", "Carré",            "Quatre chiffres identiques côte à côte",             "serie",  x => x.maxSerie === 4],
    ["quinte",   "🖐️", "Cinq à la file",   "Cinq chiffres identiques côte à côte",               "serie",  x => x.maxSerie === 5],
    ["jackpot",  "💎", "Jackpot",          "Les six chiffres identiques",                        "serie",  x => x.maxSerie === 6],
    ["jumeaux",  "👯", "Jumeaux",          "Deux doublés séparés (ex. 112 344)",                 null,     x => x.paires >= 2],
    ["miroir",   "🪞", "Miroir",           "Se lit pareil dans les deux sens",                   null,     x => x.s === [...x.s].reverse().join("")],
    ["echo",     "🔁", "Écho",             "La 2ᵉ moitié répète la 1ʳᵉ (ex. 384 384)",           null,     x => x.s.slice(0, 3) === x.s.slice(3)],
    ["ritour",   "🎵", "Ritournelle",      "Deux chiffres en alternance (ex. 474 747)",          null,     x => x.d[0] !== x.d[1] && x.s === x.s.slice(0, 2).repeat(3)],
    ["suite3",   "📈", "À la suite",       "Trois chiffres qui se suivent (ex. 456 ou 654)",     "suite",  x => x.suite === 3],
    ["suite4",   "🪜", "Escalier",         "Quatre chiffres qui se suivent",                     "suite",  x => x.suite === 4],
    ["suite5",   "🛗", "Grand escalier",   "Cinq chiffres qui se suivent",                       "suite",  x => x.suite === 5],
    ["suite6",   "🚀", "Échelle parfaite", "Les six chiffres se suivent (ex. 234 567)",          "suite",  x => x.suite === 6],
    ["range",    "📶", "Bien rangé",       "Chiffres toujours en hausse, ou toujours en baisse", null,     x => strictement(x.d, 1) || strictement(x.d, -1)],
    ["zigzag",   "⚡", "Zigzag",           "Ça monte, ça descend, ça monte… jusqu'au bout",      null,     x => zigzag(x.d)],
    ["premier",  "🔷", "Premier",          "Un nombre premier",                                  null,     x => !compose[x.n]],
    ["carre",    "⬛", "Carré parfait",    "Le carré d'un entier",                               null,     x => carres.has(x.n)],
    ["cube",     "🧊", "Cube parfait",     "Le cube d'un entier",                                null,     x => cubes.has(x.n)],
    ["fibo",     "🐚", "Fibonacci",        "Un nombre de la suite de Fibonacci",                 null,     x => fibo.has(x.n)],
    ["puiss2",   "🧬", "Puissance de 2",   "1, 2, 4, 8, 16, 32…",                                null,     x => puiss2.has(x.n)],
    ["rond2",    "💯", "Centaine pile",    "Finit par 00",                                       "rond",   x => x.zeros === 2],
    ["rond3",    "🎯", "Millier pile",     "Finit par 000",                                      "rond",   x => x.zeros === 3],
    ["rond4",    "🏁", "Tout rond",        "Finit par 0000 (ou plus)",                           "rond",   x => x.zeros >= 4 && x.n > 0],
    ["petit",    "🐭", "Petit poucet",     "Moins de 10 000",                                    "taille", x => x.n < 10000 && x.n >= 100],
    ["miette",   "🐜", "Miette",           "Moins de 100",                                       "taille", x => x.n < 100],
    ["haut",     "🏔️", "Haut perché",      "990 000 ou plus",                                    "taille", x => x.n >= 990000 && x.n < 999000],
    ["sommet",   "👑", "Sommet",           "999 000 ou plus",                                    "taille", x => x.n >= 999000],
    ["arcenciel","🌈", "Arc-en-ciel",      "Six chiffres tous différents",                       null,     x => x.distincts === 6],
    ["duo",      "✌️", "Duo",              "Seulement deux chiffres différents",                 null,     x => x.distincts === 2],
    ["binaire",  "💻", "Binaire",          "Rien que des 0 et des 1",                            null,     x => tousSi(x.d, c => c < 2)],
    ["balance",  "⚖️", "Balance",          "Les 3 premiers chiffres pèsent autant que les 3 derniers", null, x => x.d[0] + x.d[1] + x.d[2] === x.d[3] + x.d[4] + x.d[5]],
    ["pairs",    "🧦", "Tout pair",        "Que des chiffres pairs",                             null,     x => tousSi(x.d, c => c % 2 === 0)],
    ["impairs",  "🎲", "Tout impair",      "Que des chiffres impairs",                           null,     x => tousSi(x.d, c => c % 2 === 1)],
    ["plume",    "🪶", "Plume",            "La somme des chiffres fait 5 ou moins",              "poids",  x => x.somme <= 5],
    ["lourd",    "🏋️", "Poids lourd",      "La somme des chiffres fait 46 ou plus",              "poids",  x => x.somme >= 46],
    ["milieu",   "🎚️", "Pile au milieu",   "La somme des chiffres fait 27",                      "poids",  x => x.somme === 27],
    ["divisible","🧩", "Divisible",        "Divisible par la somme de ses chiffres",             null,     x => x.somme > 0 && x.n % x.somme === 0],
    ["sept",     "🍀", "Triple sept",      "Contient 777",                                       null,     x => x.s.includes("777")],
    ["diable",   "😈", "Diablotin",        "Contient 666",                                       null,     x => x.s.includes("666")],
    ["reponse",  "🌌", "La grande réponse","Contient 42",                                        null,     x => x.s.includes("42")],
    ["pi",       "🥧", "Pi",               "Commence par 314",                                   null,     x => x.s.startsWith("314")],
    ["horloge",  "⏰", "Horloge",          "Se lit comme une heure : hh mm ss",                  null,     x => +x.s.slice(0, 2) < 24 && x.d[2] < 6 && x.d[4] < 6],
    ["date",     "🗓️", "Calendrier",       "Se lit comme une date : jj mm aa",                   null,     x => { const j = +x.s.slice(0, 2), m = +x.s.slice(2, 4); return m >= 1 && m <= 12 && j >= 1 && j <= JOURS_MOIS[m - 1]; }],
    ["tetebeche","🙃", "Tête-bêche",       "Se lit pareil à l'envers (écran retourné)",          null,     x => x.d.every((c, i) => c in RETOURNE && RETOURNE[c] === x.d[5 - i])],
    /* dépend du jour : rareté fixe (100 nombres sur 1 000 000) */
    ["jourj",    "📆", "Pile le jour",     "Finit par la date du jour (jj mm)",                  null,     (x, c) => !!c && x.s.slice(2) === c.jjmm]
  ].map(([id, emoji, nom, desc, groupe, test]) => ({id, emoji, nom, desc, groupe, test}));

  /* badges d'un nombre ; c = {jjmm: "1011"} pour le badge du jour */
  function badges(n, c){
    const x = infos(n);
    return BADGES.filter(b => b.test(x, c));
  }

  const api = {MAX, BADGES, badges, infos};
  if(typeof module !== "undefined" && module.exports) module.exports = api;
  else racine.ChanceBadges = api;
})(typeof window !== "undefined" ? window : globalThis);
