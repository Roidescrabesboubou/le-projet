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
  const triangles = new Set(), factos = new Set();
  for(let k = 0; k * (k + 1) / 2 < MAX; k++) triangles.add(k * (k + 1) / 2);
  for(let k = 1, f = 1; f < MAX; k++, f *= k) factos.add(f);
  function narcissique(n){
    const t = String(n), p = t.length;
    return n > 9 && [...t].reduce((a, c) => a + Math.pow(+c, p), 0) === n;
  }
  const contient = (...motifs) => Object.assign(x => motifs.some(m => x.s.includes(m)), {motifs});
  /* nombre de fois qu'un motif apparaît (en comptant les chevauchements : 6969 → deux fois 69) */
  function fois(s, m){ let k = 0; for(let i = s.indexOf(m); i >= 0; i = s.indexOf(m, i + 1)) k++; return k; }
  const CULTES = new Set([69, 67, 420, 1337, 404, 418, 7, 101, 300, 9000, 9001, 360, 1789, 1998, 2018, 1515, 51, 3615, 2012, 1984,
    2001, 1969, 2000, 2026, 2048, 21, 993, 1111, 1234, 365, 42, 666, 777, 1729, 6174, 314159, 127001]);
  /* plus petit facteur premier et somme des diviseurs (crible) */
  const ppf = new Int32Array(MAX), sigma = new Float64Array(MAX);
  for(let i = 2; i < MAX; i++) if(!ppf[i]) for(let j = i; j < MAX; j += i) if(!ppf[j]) ppf[j] = i;
  for(let d = 1; d < MAX; d++) for(let j = d; j < MAX; j += d) sigma[j] += d;
  const sommeChiffres = n => { let s = 0; for(; n; n = Math.floor(n / 10)) s += n % 10; return s; };
  function smith(n){
    if(n < 4 || !compose[n]) return false;
    let s = 0, m = n;
    while(m > 1){ const f = ppf[m]; s += sommeChiffres(f); m /= f; }
    return s === sommeChiffres(n);
  }
  function heureux(n){
    for(let i = 0; i < 30 && n !== 1; i++){ let s = 0; for(; n; n = Math.floor(n / 10)) s += (n % 10) * (n % 10); n = s; if(n === 4 || n === 0) return false; }
    return n === 1;
  }
  function syracuse(n){ if(n < 1) return 0; let k = 0; while(n !== 1){ n = n % 2 ? 3 * n + 1 : n / 2; k++; } return k; }
  const MOTS_HEXA = ["bad", "fab", "ace", "bed", "cab", "dad", "fed", "add", "bee", "dab", "fad", "cafe", "beef", "face", "dead", "fade", "c0de"];
  const estPal = t => t === [...t].reverse().join("");
  function palMax(s){ for(let L = 6; L >= 3; L--) for(let i = 0; i + L <= 6; i++) if(estPal(s.slice(i, i + L))) return L; return 0; }
  function montagne(d, sens){
    for(let p = 1; p <= 4; p++){
      let ok = true;
      for(let i = 1; i <= p && ok; i++) if((d[i] - d[i - 1]) * sens <= 0) ok = false;
      for(let i = p + 1; i < 6 && ok; i++) if((d[i] - d[i - 1]) * sens >= 0) ok = false;
      if(ok) return true;
    }
    return false;
  }
  /* répartition des chiffres façon main de poker : "21111" = une paire… */
  const main = x => { if(x._main) return x._main; const c = {}; x.d.forEach(v => c[v] = (c[v] || 0) + 1); return (x._main = Object.values(c).sort((a, b) => b - a).join("")); };
  const voisins = x => { let k = 0; for(let i = 1; i < 6; i++) if(Math.abs(x.d[i] - x.d[i - 1]) === 1) k++; return k; };
  const JOURS_MOIS =[31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
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
    ["miroir",   "🪞", "Miroir",           "Se lit pareil dans les deux sens",                   "pal",     x => x.s === [...x.s].reverse().join("")],
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
    ["sept",     "🍀", "777 chanceux",      "Contient 777",                                       null,     contient("777")],
    ["diable",   "😈", "Diablotin",        "Contient 666",                                       null,     contient("666")],
    ["reponse",  "🌌", "La grande réponse","Contient 42",                                        null,     contient("42")],
    ["pi",       "🥧", "Pi",               "Commence par 314",                                   null,     x => x.s.startsWith("314")],
    ["horloge",  "⏰", "Horloge",          "Se lit comme une heure : hh mm ss",                  null,     x => +x.s.slice(0, 2) < 24 && x.d[2] < 6 && x.d[4] < 6],
    ["date",     "🗓️", "Calendrier",       "Se lit comme une date : jj mm aa",                   null,     x => { const j = +x.s.slice(0, 2), m = +x.s.slice(2, 4); return m >= 1 && m <= 12 && j >= 1 && j <= JOURS_MOIS[m - 1]; }],
    ["tetebeche","🙃", "Tête-bêche",       "Se lit pareil à l'envers (écran retourné)",          null,     x => x.d.every((c, i) => c in RETOURNE && RETOURNE[c] === x.d[5 - i])],
    /* encore des maths */
    ["triangle", "🔺", "Triangulaire",     "1, 3, 6, 10, 15… (on empile des billes en triangle)", null,   x => triangles.has(x.n)],
    ["parfait",  "✨", "Nombre parfait",   "Égal à la somme de ses diviseurs (6, 28, 496, 8 128)", null,  x => [6, 28, 496, 8128].includes(x.n)],
    ["facto",    "❗", "Factorielle",      "1, 2, 6, 24, 120, 720, 5 040…",                      null,     x => factos.has(x.n)],
    ["narciss",  "🌸", "Narcissique",      "Égal à la somme de ses chiffres à la puissance du nombre de chiffres (ex. 153)", null, x => narcissique(x.n)],
    ["jumprem",  "👬", "Premiers jumeaux", "Premier, et son voisin à 2 près aussi",              null,     x => !compose[x.n] && (!compose[x.n - 2] || (x.n + 2 < MAX && !compose[x.n + 2]))],
    ["emirp",    "🔙", "Premier à l'envers","Premier, et encore premier lu à l'envers",          null,     x => { if(compose[x.n]) return false; const r = +String(x.n).split("").reverse().join(""); return r !== x.n && !compose[r]; }],
    ["parite",   "☯️", "Pair, impair",     "Les chiffres alternent pair et impair",              null,     x => x.d.every((c, i) => i === 0 || c % 2 !== x.d[i - 1] % 2)],
    ["paires3",  "👫", "Trois paires",     "Trois doublés à la suite (ex. 335 577)",             null,     x => x.d[0] === x.d[1] && x.d[2] === x.d[3] && x.d[4] === x.d[5] && x.d[1] !== x.d[2] && x.d[3] !== x.d[4]],
    ["intrus",   "🕵️", "L'intrus",         "Cinq chiffres pareils et un seul différent",         null,     x => x.distincts === 2 && x.d.some(c => x.d.filter(e => e === c).length === 5)],
    ["kaprekar", "🌀", "Kaprekar",         "Contient 6174, le nombre magique de Kaprekar",       null,     contient("6174")],
    ["orr",      "🐌", "Nombre d'or",      "Commence par 1618 (1,618…)",                         null,     x => x.s.startsWith("1618")],
    ["euler",    "📐", "Constante e",      "Commence par 2718 (2,718…)",                         null,     x => x.s.startsWith("2718")],
    ["pifull",   "🍰", "Pi parfait",       "Exactement 314159",                                  null,     x => x.n === 314159],
    ["taxi",     "🚕", "Taxi de Ramanujan","Contient 1729",                                      null,     contient("1729")],

    /* petits bonus : courants, ils rapportent peu mais souvent */
    ["mpaire",   "👥", "Une paire",        "Un chiffre apparaît deux fois (même séparé)",        "main",   x => main(x) === "21111"],
    ["m2paires", "🎴", "Deux paires",      "Deux chiffres apparaissent deux fois chacun",        "main",   x => main(x) === "2211"],
    ["m3paires", "🧦", "Trois fois deux",  "Trois chiffres apparaissent deux fois chacun",       "main",   x => main(x) === "222"],
    ["mbrelan",  "🍒", "Trois pareils",    "Un chiffre apparaît trois fois (même séparé)",       "main",   x => main(x) === "3111"],
    ["mfull",    "🏠", "Full",             "Trois pareils + deux pareils (comme au poker)",      "main",   x => main(x) === "321"],
    ["m2brelan", "🍇", "Double brelan",    "Deux chiffres apparaissent trois fois chacun",       "main",   x => main(x) === "33"],
    ["mcarre",   "🍀", "Quatre pareils",   "Un chiffre apparaît quatre fois",                    "main",   x => main(x) === "411"],
    ["mcarrep",  "🎁", "Quatre + deux",    "Quatre pareils et deux autres pareils",              "main",   x => main(x) === "42"],
    ["vois1",    "🤝", "Voisins",          "Deux chiffres qui se suivent côte à côte (ex. 89 ou 43)", "vois", x => voisins(x) === 1],
    ["vois2",    "🏘️", "Bons voisins",     "Deux enchaînements de chiffres qui se suivent",      "vois",   x => voisins(x) === 2],
    ["vois3",    "🏙️", "Tout le quartier", "Trois enchaînements ou plus de chiffres qui se suivent", "vois", x => voisins(x) >= 3],
    ["dix",      "🔟", "Font dix",         "Deux chiffres côte à côte qui font 10 (ex. 37, 82, 55)", null,  x => x.d.some((c, i) => i && c + x.d[i - 1] === 10)],
    ["saut",     "🪂", "Grand saut",       "Un 0 et un 9 côte à côte",                           null,     x => /09|90/.test(x.s)],
    ["extremes", "↔️", "Du 0 au 9",        "Contient au moins un 0 et un 9",                     null,     x => x.s.includes("0") && x.s.includes("9")],
    ["pal3",     "🔍", "Petit miroir",     "Trois chiffres qui se lisent dans les deux sens (ex. 474)", "pal", x => palMax(x.s) === 3],
    ["pal4",     "🔎", "Miroir moyen",     "Quatre chiffres qui se lisent dans les deux sens (ex. 2552)", "pal", x => palMax(x.s) === 4],
    ["pal5",     "🪟", "Grand miroir",     "Cinq chiffres qui se lisent dans les deux sens (ex. 38183)", "pal", x => palMax(x.s) === 5],
    ["refrain",  "🎶", "Refrain",          "Deux mêmes chiffres qui reviennent (ex. 12 … 12)",   null,     x => { for(let i = 0; i < 5; i++) for(let j = i + 2; j < 5; j++) if(x.s.substr(i, 2) === x.s.substr(j, 2)) return true; return false; }],
    ["boucle",   "➰", "La boucle",        "Finit par le même chiffre qu'au début",              "bout",   x => x.d[0] === x.d[5] && x.d[1] !== x.d[4]],
    ["serre",    "📚", "Serre-livres",     "Les 2 premiers chiffres reviennent à la fin, à l'envers (ex. 12 … 21)", "bout", x => x.d[0] === x.d[5] && x.d[1] === x.d[4]],
    ["finhaut",  "↗️", "Final en hausse",  "Les 3 derniers chiffres montent",                    null,     x => x.d[3] < x.d[4] && x.d[4] < x.d[5]],
    ["finbas",   "↘️", "Final en baisse",  "Les 3 derniers chiffres descendent",                 null,     x => x.d[3] > x.d[4] && x.d[4] > x.d[5]],
    ["montagne", "⛰️", "Montagne",         "Ça monte jusqu'à un sommet, puis ça redescend",      null,     x => montagne(x.d, 1)],
    ["vallee",   "🏞️", "Vallée",           "Ça descend jusqu'à un creux, puis ça remonte",       null,     x => montagne(x.d, -1)],
    ["petits",   "🐣", "Petits chiffres",  "Que des chiffres de 0 à 4",                          null,     x => x.d.every(c => c <= 4)],
    ["grands",   "🦒", "Grands chiffres",  "Que des chiffres de 5 à 9",                          null,     x => x.d.every(c => c >= 5)],
    ["boucles",  "⭕", "Tout en rondeurs", "Que des chiffres avec un rond : 0, 6, 8, 9",         null,     x => x.d.every(c => [0, 6, 8, 9].includes(c))],
    ["batons",   "✏️", "Sans aucun rond",  "Que des chiffres sans rond : 1, 2, 3, 5, 7",         null,     x => x.d.every(c => [1, 2, 3, 5, 7].includes(c))],
    ["hmiroir",  "🕰️", "Heure miroir",     "Commence par une heure miroir (ex. 14 h 41, 23 h 32)", "heure", x => { const h = x.s.slice(0, 2); return +h < 24 && h[1] + h[0] === x.s.slice(2, 4) && +x.s.slice(2, 4) < 60 && h[0] !== h[1]; }],
    ["hdouble",  "⏱️", "Heure double",     "Commence par une heure double (ex. 12 h 12, 21 h 21)", "heure", x => +x.s.slice(0, 2) < 24 && x.s.slice(0, 2) === x.s.slice(2, 4)],
    ["annee",    "📜", "Une année",        "Contient une année entre 1900 et 2099",              null,     x => /19\d\d|20\d\d/.test(x.s)],
    ["sprem",    "🔹", "Somme première",   "La somme des chiffres est un nombre premier",        null,     x => !compose[x.somme]],
    ["sculte",   "🎱", "Somme culte",      "La somme des chiffres fait 7, 13, 21 ou 42",         null,     x => [7, 13, 21, 42].includes(x.somme)],
    ["moyenne",  "➗", "Moyenne pile",     "La moyenne des chiffres tombe juste",                null,     x => x.somme % 6 === 0],
    ["sprod",    "🤝", "Somme = produit",  "La somme des chiffres est égale à leur produit",     null,     x => x.d.reduce((a, b) => a * b, 1) === x.somme],

    /* divisibilité et moitiés */
    ["mult3",    "3️⃣", "Multiple de 3",    "Divisible par 3",                                    "div3",   x => x.n % 3 === 0 && x.n % 9 !== 0],
    ["mult9",    "9️⃣", "Multiple de 9",    "Divisible par 9",                                    "div3",   x => x.n % 9 === 0],
    ["mult7",    "7️⃣", "Multiple de 7",    "Divisible par 7",                                    null,     x => x.n % 7 === 0],
    ["mult11",   "🎳", "Multiple de 11",   "Divisible par 11",                                   null,     x => x.n % 11 === 0],
    ["mult13",   "🐈‍⬛", "Multiple de 13", "Divisible par 13",                                   null,     x => x.n % 13 === 0],
    ["mult37",   "🎰", "Multiple de 37",   "Divisible par 37 (comme 111, 222, 333…)",            null,     x => x.n % 37 === 0],
    ["mprem",    "🧱", "Moitiés premières","Les deux moitiés (3 chiffres) sont des nombres premiers", null, x => !compose[+x.s.slice(0, 3)] && !compose[+x.s.slice(3)]],
    ["msuite",   "🚃", "Moitiés voisines", "La 2ᵉ moitié vaut la 1ʳᵉ plus ou moins 1 (ex. 341 342)", null, x => Math.abs(+x.s.slice(3) - +x.s.slice(0, 3)) === 1],
    ["mdouble",  "✖️", "Le double",        "La 2ᵉ moitié vaut le double de la 1ʳᵉ (ex. 123 246)", null,    x => +x.s.slice(0, 3) > 0 && +x.s.slice(3) === 2 * +x.s.slice(0, 3)],
    ["mcompl",   "🧷", "Complément à 9",   "Les deux moitiés font 999 ensemble (ex. 123 876)",   null,     x => +x.s.slice(0, 3) + +x.s.slice(3) === 999],

    /* tirés par les cheveux */
    ["abondant", "💰", "Abondant",         "Ses diviseurs (sans lui) font plus que lui",         null,     x => x.n > 0 && sigma[x.n] - x.n > x.n],
    ["heureux",  "😊", "Nombre heureux",   "Somme des carrés des chiffres, encore et encore… on tombe sur 1", null, x => heureux(x.n)],
    ["smith",    "🧑‍🔬", "Nombre de Smith","Ses chiffres font la même somme que ceux de ses facteurs premiers", null, x => smith(x.n)],
    ["syracuse", "✈️", "Long vol",         "Suite de Syracuse (÷2 si pair, ×3+1 sinon) : 200 étapes ou plus avant 1", null, x => syracuse(x.n) >= 200],
    ["automorph","🪆", "Automorphe",       "Son carré finit par lui-même (ex. 376² = 141 376)",  null,     x => x.n > 1 && (x.n * x.n) % Math.pow(10, String(x.n).length) === x.n],
    ["binpal",   "🔢", "Miroir binaire",   "Écrit en binaire (0 et 1), il se lit dans les deux sens", null, x => x.n > 0 && estPal(x.n.toString(2))],
    ["hexa",     "🔤", "Mot caché en hexa","Écrit en hexadécimal, il cache un mot anglais (CAFE, BEEF, BAD…)", null, x => { const h = x.n.toString(16); return MOTS_HEXA.some(m => h.includes(m)); }],

    /* pop culture */
    ["nice",     "😏", "Nice",             "Contient 69",                                        null,     contient("69")],
    ["sixseven", "🤷", "Six-seven",        "Contient 67",                                        null,     contient("67")],
    ["quatre20", "🍃", "4:20",             "Contient 420",                                       null,     contient("420")],
    ["leet",     "👾", "1337",             "Contient 1337 (leet, l'élite des hackers)",          null,     contient("1337")],
    ["introuv",  "🚫", "Page introuvable", "Contient 404",                                       null,     contient("404")],
    ["theiere",  "🫖", "Je suis une théière","Contient 418 (le code d'erreur le plus absurde du web)", null, contient("418")],
    ["agent",    "🍸", "Agent secret",     "Contient 007",                                       null,     contient("007")],
    ["dalmat",   "🐶", "Dalmatiens",       "Contient 101",                                       null,     contient("101")],
    ["sparte",   "🛡️", "Spartiates",       "Contient 300",                                       null,     contient("300")],
    ["over9000", "💥", "Plus de 9000 !",   "Contient 9000 ou 9001",              null,     contient("9000", "9001")],
    ["noscope",  "🔭", "360 no scope",     "Contient 360",                                       null,     contient("360")],
    ["revol",    "🇫🇷", "Révolution",      "Contient 1789",                                      null,     contient("1789")],
    ["etoile",   "⭐", "Champions du monde","Contient 1998 ou 2018",                             null,     contient("1998", "2018")],
    ["marignan", "⚔️", "Marignan",         "Contient 1515",                                      null,     contient("1515")],
    ["zone51",   "👽", "Zone 51",          "Contient 51",                                        null,     contient("51")],
    ["minitel",  "📟", "Minitel",          "Contient 3615",                                      null,     contient("3615")],
    ["findumonde","🌋", "Fin du monde",    "Contient 2012",                                      null,     contient("2012")],
    ["bigbro",   "👁️", "Big Brother",      "Contient 1984",                                      null,     contient("1984")],
    ["odyssee",  "🛰️", "Odyssée de l'espace","Contient 2001",                                    null,     contient("2001")],
    ["lune",     "🌕", "Un petit pas",     "Contient 1969 (l'homme sur la Lune)",                null,     contient("1969")],
    ["an2000",   "💾", "Bug de l'an 2000", "Contient 2000",                                      null,     contient("2000")],
    ["millesime","🥂", "Millésime",        "Contient 2026, l'année en cours",                    null,     contient("2026")],
    ["jeu2048",  "🧮", "2048",             "Contient 2048",                                      null,     contient("2048")],
    ["blackjack","🂡", "Blackjack",        "Contient 21",                                        null,     contient("21")],
    ["mille7",   "🩸", "1000 - 7",         "Contient 993",                                       null,     contient("993")],
    ["voeu",     "🌠", "11:11, fais un vœu","Contient 1111",                                     null,     contient("1111")],
    ["pin",      "🔓", "Code PIN nul",     "Contient 1234 ou 0000",                              null,     contient("1234", "0000")],
    ["unan",     "📅", "Une année",        "Contient 365",                                       null,     contient("365")],
    ["lost",     "🏝️", "Les nombres maudits","Contient 4815 ou 2342 (4 8 15 16 23 42)",          null,     contient("4815", "2342")],
    ["localhost","🏠", "Localhost",        "Exactement 127001 (127.0.0.1)",                      null,     x => x.n === 127001],
    ["pilepoil", "🎯", "Pile poil",        "Le nombre entier est un nombre culte : 69, 67, 420, 1337, 404, 007…", null, x => CULTES.has(x.n)],

    /* dépend du jour : rareté fixe (100 nombres sur 1 000 000) */
    ["jourj",    "📆", "Pile le jour",     "Finit par la date du jour (jj mm)",                  null,     (x, c) => !!c && x.s.slice(2) === c.jjmm]
  ].map(([id, emoji, nom, desc, groupe, test]) => ({id, emoji, nom, desc, groupe, test}));

  /* ---------- Références (pop culture + 42, 666, 777) : doubles, triples et combos ---------- */
  const REFS = ["reponse", "sept", "diable", "nice", "sixseven", "quatre20", "leet", "introuv", "theiere", "agent", "dalmat", "sparte",
    "over9000", "noscope", "revol", "etoile", "marignan", "zone51", "minitel", "findumonde", "bigbro", "odyssee", "lune", "an2000",
    "millesime", "jeu2048", "blackjack", "mille7", "voeu", "pin", "unan", "lost", "localhost"];
  const refs = REFS.map(id => BADGES.find(b => b.id === id));
  const nbRefs = x => x._refs != null ? x._refs : (x._refs = refs.filter(b => b.test(x)).length);
  const avant = BADGES.findIndex(b => b.id === "pilepoil");
  const ajouts = [];
  /* un motif court qui revient : « Double … » (2 fois), « Triple … » (3 fois ou plus) */
  refs.forEach(b => {
    const m = (b.test.motifs || []).filter(m => m.length <= 3);
    if(!m.length) return;
    const k = x => Math.max(...m.map(mm => fois(x.s, mm)));
    ajouts.push({id: b.id + "_x2", emoji: b.emoji.repeat(2), nom: "Double " + b.nom, desc: m.join(" ou ") + " deux fois", groupe: "rep_" + b.id, test: x => k(x) === 2, rep: true, motifs: m});
    /* trois fois : possible seulement pour 2 chiffres (696969) ou un chiffre répété (666 dans 66666) */
    if(m.some(mm => mm.length === 2 || new Set(mm).size === 1))
    ajouts.push({id: b.id + "_x3", emoji: b.emoji.repeat(3), nom: "Triple " + b.nom, desc: m.join(" ou ") + " trois fois ou plus", groupe: "rep_" + b.id, test: x => k(x) >= 3, rep: true, motifs: m});
  });
  /* plusieurs références différentes dans le même nombre */
  ajouts.push(
    {id: "combo2", emoji: "🔥", nom: "Combo", desc: "Deux références différentes dans le même nombre (ex. 69 et 67)", groupe: "combo", test: x => nbRefs(x) === 2},
    {id: "combo3", emoji: "🔥🔥", nom: "Gros combo", desc: "Trois références différentes dans le même nombre", groupe: "combo", test: x => nbRefs(x) === 3},
    {id: "combo4", emoji: "🌟", nom: "Combo de légende", desc: "Quatre références différentes ou plus dans le même nombre", groupe: "combo", test: x => nbRefs(x) >= 4});
  BADGES.splice(avant, 0, ...ajouts);

  /* ---------- Chiffres concernés par un badge (pour les surligner) ----------
     renvoie les positions (0 à 5) ; tout le nombre si le badge parle du nombre entier */
  const TOUT = [0, 1, 2, 3, 4, 5];
  const plage = (a, b) => { const r = []; for(let i = a; i < b; i++) r.push(i); return r; };
  function occurrences(s, motifs){
    const r = new Set();
    motifs.forEach(m => { for(let i = s.indexOf(m); i >= 0; i = s.indexOf(m, i + 1)) for(let k = 0; k < m.length; k++) r.add(i + k); });
    return [...r];
  }
  function series(x, min){
    const r = []; let debut = 0;
    for(let i = 1; i <= 6; i++) if(i === 6 || x.d[i] !== x.d[i - 1]){ if(i - debut >= min) r.push(...plage(debut, i)); debut = i; }
    return r;
  }
  function suitePlusLongue(x){
    let meilleur = [0, 1];
    for(const sens of [1, -1]){ let debut = 0;
      for(let i = 1; i <= 6; i++) if(i === 6 || x.d[i] - x.d[i - 1] !== sens){ if(i - debut > meilleur[1] - meilleur[0]) meilleur = [debut, i]; debut = i; } }
    return plage(meilleur[0], meilleur[1]);
  }
  const paires = (x, f) => { const r = new Set(); for(let i = 1; i < 6; i++) if(f(x.d[i - 1], x.d[i])){ r.add(i - 1); r.add(i); } return [...r]; };
  const chiffres = (x, f) => TOUT.filter(i => f(x.d[i]));
  function positions(id, n, c){
    const x = infos(n), b = BADGES.find(e => e.id === id);
    if(!b) return [];
    if(b.motifs) return occurrences(x.s, b.motifs);
    if(b.test.motifs) return occurrences(x.s, b.test.motifs);
    if(b.groupe === "combo") return occurrences(x.s, refs.filter(r => r.test(x)).flatMap(r => r.test.motifs || []));
    switch(id){
      case "double": case "brelan": case "carre4": case "quinte": return series(x, x.maxSerie);
      case "jumeaux": return series(x, 2);
      case "suite3": case "suite4": case "suite5": case "suite6": return suitePlusLongue(x);
      case "rond2": case "rond3": case "rond4": return plage(6 - x.zeros, 6);
      case "petit": case "miette": { let k = 0; while(k < 5 && x.d[k] === 0) k++; return plage(0, k); }
      case "haut": return [0, 1];
      case "sommet": return [0, 1, 2];
      case "pi": return [0, 1, 2];
      case "orr": case "euler": return [0, 1, 2, 3];
      case "hmiroir": case "hdouble": return [0, 1, 2, 3];
      case "jourj": return [2, 3, 4, 5];
      case "mpaire": case "m2paires": case "m3paires": case "mbrelan": case "mfull": case "m2brelan": case "mcarre": case "mcarrep": case "intrus":
        return chiffres(x, v => x.d.filter(e => e === v).length >= 2);
      case "vois1": case "vois2": case "vois3": return paires(x, (a, b) => Math.abs(a - b) === 1);
      case "dix": return paires(x, (a, b) => a + b === 10);
      case "saut": return paires(x, (a, b) => a + b === 9 && a * b === 0);
      case "extremes": return chiffres(x, v => v === 0 || v === 9);
      case "pal3": case "pal4": case "pal5": {
        const L = palMax(x.s);
        for(let i = 0; i + L <= 6; i++) if(estPal(x.s.slice(i, i + L))) return plage(i, i + L);
        return [];
      }
      case "refrain": {
        for(let i = 0; i < 5; i++) for(let j = i + 2; j < 5; j++) if(x.s.substr(i, 2) === x.s.substr(j, 2)) return [i, i + 1, j, j + 1];
        return [];
      }
      case "boucle": return [0, 5];
      case "serre": return [0, 1, 4, 5];
      case "finhaut": case "finbas": return [3, 4, 5];
      case "annee": { const m = x.s.match(/19\d\d|20\d\d/); return m ? plage(m.index, m.index + 4) : []; }
      default: return TOUT;
    }
  }

  /* badges d'un nombre ; c = {jjmm: "1011"} pour le badge du jour */
  function badges(n, c){
    const x = infos(n);
    return BADGES.filter(b => b.test(x, c));
  }

  const api = {MAX, BADGES, REFS, badges, infos, positions};
  if(typeof module !== "undefined" && module.exports) module.exports = api;
  else racine.ChanceBadges = api;
})(typeof window !== "undefined" ? window : globalThis);
