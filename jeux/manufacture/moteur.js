/* ============================================================
   MANUFACTURE : règles du jeu (aucun dessin ici)
   L'état G est du JSON pur : il se sauvegarde et s'envoie en ligne.
   RegleM.creer(joueurs, graine) → G
   RegleM.agir(G, j, action)     → "" si c'est bon, sinon la raison du refus
   RegleM.coupBot(G, j)          → l'action que jouerait un bot
   ============================================================ */
window.RegleM = (function(){
  const COUL = ["b", "s", "f"];
  const NOMS = {
    b: ["Bûche", "Planche", "Charpente"],
    s: ["Sable", "Verre", "Vitrail"],
    f: ["Minerai", "Lingot", "Engrenage"]
  };
  const CAP = [3, 3, 3, 3, 3, 3, 1, 1, 1];
  const BUT = 20, JETONS_DEPART = 3, ENERGIE_DEPART = 2, ENERGIE_MIN = -3, MANCHES_MAX = 40;
  const DIRS = [[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]];

  const CONSO = {ext: 1, m1: 1, m2: 2, m3: 3, auto: 4, centrale: -4, tapis: 0};
  const COUT_MACHINE = {
    1: c => ({[c+"1"]: 2}),
    2: c => ({[c+"1"]: 3, [autre(c)+"1"]: 1}),
    3: c => ({[c+"2"]: 2, [autre(c)+"1"]: 2})
  };
  const COUT_AUTO = {b2: 1, s2: 1, f2: 1};
  const COUT_CENTRALE = {b1: 1, s1: 1, f1: 1};
  const autre = c => COUL[(COUL.indexOf(c) + 1) % 3];

  /* ---------- Améliorations : payées avec les cubes de l'usine ---------- */
  const AMELIOS = [
    {id:"tapis",   col:"u", cout:{b1:2}, nom:"Tapis renforcés",   txt:"+1 tapis à chaque pose", e:{tapis:1}},
    {id:"courroie",col:"u", cout:{f1:2}, nom:"Courroies rapides", txt:"+1 vitesse sur toutes les lignes", e:{vitesse:1}},
    {id:"chaudiere",col:"u",cout:{s1:2}, nom:"Chaudière isolée",  txt:"+1 vapeur", e:{energie:1}},
    {id:"scies",   col:"u", cout:{b2:2}, nom:"Scies mécaniques",  txt:"+1 bûche à chaque récolte", e:{extr:{b:1}}},
    {id:"dragues", col:"u", cout:{s2:2}, nom:"Dragues",           txt:"+1 sable à chaque récolte", e:{extr:{s:1}}},
    {id:"foreuses",col:"u", cout:{f2:2}, nom:"Foreuses",          txt:"+1 minerai à chaque récolte", e:{extr:{f:1}}},
    {id:"transmission",col:"u",cout:{b3:1},nom:"Transmission",    txt:"+1 vitesse sur toutes les lignes", e:{vitesse:1}},
    {id:"turbine", col:"u", cout:{s3:1}, nom:"Grande turbine",    txt:"+3 vapeur", e:{energie:3}},
    {id:"presse",  col:"u", cout:{f3:1}, nom:"Presse à vapeur",   txt:"+1 sur chaque ligne à chaque récolte", e:{extr:{b:1,s:1,f:1}}},
    {id:"bottes",  col:"c", cout:{b2:1}, nom:"Bottes ferrées",    txt:"+2 de marche · +1 jeton d'action", e:{depl:2,jeton:1}},
    {id:"grue",    col:"c", cout:{s2:1}, nom:"Grue mobile",       txt:"+1 de portée pour bâtir · +1 jeton d'action", e:{portee:1,jeton:1}},
    {id:"apprentis",col:"c",cout:{f2:1}, nom:"Apprentis",         txt:"L'atelier agit deux fois · +1 jeton d'action", e:{atelier:1,jeton:1}},
    {id:"passerelle",col:"c",cout:{b3:1},nom:"Passerelles",       txt:"Marcher sur l'eau, sans risque au marais · +1 jeton", e:{passe:1,jeton:1}},
    {id:"pilotis", col:"c", cout:{s3:1}, nom:"Pilotis",           txt:"Bâtir sur l'eau et au marais · +1 prestige", e:{pilotis:1,prestige:1}},
    {id:"bureau",  col:"c", cout:{f3:1}, nom:"Bureau d'études",   txt:"Les plans coûtent 1 cube de moins · +1 prestige", e:{remise:1,prestige:1}}
  ];

  /* ---------- Plans : posés sans case, effet permanent ou points de fin ---------- */
  const PLANS = [
    {id:"serre",   t:1, cout:{b1:2},       nom:"Serre à tourbe",  txt:"+1 tourbe à chaque production", e:{tourbe:1}},
    {id:"eolienne",t:1, cout:{b1:1,f1:1},  nom:"Éolienne",        txt:"+1 vapeur", e:{energie:1}},
    {id:"charrette",t:1,cout:{b1:2},       nom:"Charrette",       txt:"+1 de marche", e:{depl:1}},
    {id:"scierie", t:1, cout:{b1:2,f1:1},  nom:"Scierie à eau",   txt:"+1 bûche à chaque récolte", e:{extr:{b:1}}},
    {id:"tamis",   t:1, cout:{s1:2,b1:1},  nom:"Grand tamis",     txt:"+1 sable à chaque récolte", e:{extr:{s:1}}},
    {id:"treuil",  t:1, cout:{f1:2,s1:1},  nom:"Treuil de mine",  txt:"+1 minerai à chaque récolte", e:{extr:{f:1}}},
    {id:"guichet", t:1, cout:{s1:2},       nom:"Guichet de troc", txt:"Tes échanges se font à 1 contre 1", e:{troc:1}},
    {id:"carnet",  t:1, cout:{s1:1,f1:1},  nom:"Carnet de route", txt:"Fin : +1 prestige par ruine explorée, 3 au plus", e:{fin:"ruines"}},
    {id:"turbo",   t:2, cout:{f2:2},       nom:"Courroies graissées",txt:"+1 vitesse sur toutes les lignes", e:{vitesse:1}},
    {id:"barrage", t:2, cout:{b2:1,s2:1},  nom:"Petit barrage",   txt:"+2 vapeur", e:{energie:2}},
    {id:"contremaitre",t:2,cout:{b2:1,f2:1},nom:"Contremaître",   txt:"+1 jeton d'action", e:{jeton:1}},
    {id:"tourbiere",t:2,cout:{b2:1,s1:1},  nom:"Tourbière drainée",txt:"+2 tourbes à chaque production", e:{tourbe:2}},
    {id:"guilde",  t:2, cout:{s2:2},       nom:"Guilde des verriers",txt:"Fin : +1 prestige par 2 contrats", e:{fin:"contrats"}},
    {id:"cartes",  t:2, cout:{s2:1,f1:2},  nom:"Cabinet des cartes",txt:"Fin : +1 prestige par 2 bâtiments hors tapis, 5 au plus", e:{fin:"batiments"}},
    {id:"pneu",    t:3, cout:{f3:1,b2:1},  nom:"Réseau pneumatique",txt:"+1 vitesse · +1 prestige", e:{vitesse:1,prestige:1}},
    {id:"dynamo",  t:3, cout:{s3:1,f2:1},  nom:"Dynamo géante",   txt:"+4 vapeur", e:{energie:4}},
    {id:"directeur",t:3,cout:{b3:1,s2:1},  nom:"Directeur",       txt:"+1 jeton d'action · +1 prestige", e:{jeton:1,prestige:1}},
    {id:"palais",  t:3, cout:{b3:1,s3:1},  nom:"Palais de verre", txt:"Fin : +5 prestige", e:{fin:"palais"}},
    {id:"musee",   t:3, cout:{f3:1,s3:1},  nom:"Musée des machines",txt:"Fin : +1 prestige par machine, 6 au plus", e:{fin:"machines"}},
    {id:"vitrines",t:3, cout:{b3:1,f3:1},  nom:"Grande vitrine",  txt:"Chaque automate exposé rapporte 2 prestige au lieu de 1", e:{vitrine:1}}
  ];

  /* ---------- Contrats publics : I, puis II, puis III ---------- */
  const CONTRATS = [
    {t:1, nom:"Bancs du square",    cout:{b1:3},             p:1, av:1},
    {t:1, nom:"Sablier de la gare", cout:{s1:3},             p:1, av:1},
    {t:1, nom:"Fers à cheval",      cout:{f1:3},             p:1, av:1},
    {t:1, nom:"Halle du marché",    cout:{b1:2,s1:2},        p:2, av:1},
    {t:1, nom:"Pont de bois",       cout:{b1:2,f1:2},        p:2, av:1},
    {t:1, nom:"Serres municipales", cout:{s1:2,f1:2},        p:2, av:1},
    {t:1, nom:"Kiosque à musique",  cout:{b1:2,s1:2,f1:2},   p:3, av:1},
    {t:1, nom:"Lampadaires",        cout:{s1:1,f1:4},        p:3, av:1},
    {t:2, nom:"Parquet du théâtre", cout:{b2:3},             p:3, av:1},
    {t:2, nom:"Verrière du lycée",  cout:{s2:3},             p:3, av:1},
    {t:2, nom:"Rails du tramway",   cout:{f2:3},             p:3, av:1},
    {t:2, nom:"Wagon-salon",        cout:{b2:2,f2:2},        p:4, av:2},
    {t:2, nom:"Phare du port",      cout:{s2:2,f2:2},        p:4, av:2},
    {t:2, nom:"Orangerie",          cout:{b2:2,s2:2},        p:4, av:2},
    {t:2, nom:"Horloge de l'hôtel de ville",cout:{b2:1,s2:1,f2:2}, p:4, av:2},
    {t:3, nom:"Charpente du beffroi",cout:{b3:2,f2:1},       p:5, av:2},
    {t:3, nom:"Rosace de la cathédrale",cout:{s3:2,b2:1},    p:5, av:2},
    {t:3, nom:"Grand carillon",     cout:{f3:2,s2:1},        p:5, av:2},
    {t:3, nom:"Pavillon de l'Expo", cout:{b3:1,s3:1,f3:1},   p:6, av:3},
    {t:3, nom:"Automate du maire",  cout:{a:1,f2:1},         p:6, av:3},
    {t:3, nom:"Dirigeable",         cout:{a:1,b3:1,s2:1},    p:7, av:3}
  ];

  /* ---------- Trouvailles des ruines : à jouer pendant son tour ---------- */
  const TROUVAILLES = [
    {id:"cafe",    nb:3, nom:"Café très fort",   txt:"+1 action ce tour"},
    {id:"caisse",  nb:3, nom:"Caisse oubliée",   txt:"+1 bûche, +1 sable, +1 minerai"},
    {id:"charbon", nb:2, nom:"Meule de tourbe",  txt:"+3 tourbes"},
    {id:"zele",    nb:3, nom:"Apprenti zélé",    txt:"Toutes tes lignes avancent d'un cran"},
    {id:"gazette", nb:2, nom:"Article flatteur", txt:"+1 prestige"},
    {id:"chien",   nb:2, nom:"Chien des marais", txt:"Permanent : +1 tourbe à chaque production"}
  ];

  /* La piste de l'Exposition : bonus aux cases atteintes, fin à la dernière */
  const PISTE = 14;
  const BONUS_PISTE = {2:{tourbe:2}, 4:{plans:2}, 5:{tourbe:2}, 7:{prestige:1}, 8:{plans:3}, 10:{prestige:1}, 12:{prestige:2}};

  /* ---------- Hasard rejouable (la graine vit dans G) ---------- */
  function alea(G){
    G.graine = (G.graine + 0x6D2B79F5) | 0;
    let t = Math.imul(G.graine ^ (G.graine >>> 15), 1 | G.graine);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function melanger(G, l){
    for(let i = l.length - 1; i > 0; i--){ const k = Math.floor(alea(G) * (i + 1)); [l[i], l[k]] = [l[k], l[i]]; }
    return l;
  }

  /* ---------- Hexagones ---------- */
  const ID = (q, r) => q + "," + r;
  const QR = id => id.split(",").map(Number);
  const voisins = id => { const [q, r] = QR(id); return DIRS.map(d => ID(q + d[0], r + d[1])); };
  const distance = (a, b) => { const [q1, r1] = QR(a), [q2, r2] = QR(b); return (Math.abs(q1-q2) + Math.abs(r1-r2) + Math.abs(q1+r1-q2-r2)) / 2; };
  const tourner = (q, r) => [-r, q + r];

  /* Un seul sixième de carte est tiré au sort puis tourné : tout le monde a les mêmes chances */
  function genererCarte(G, n){
    const R = n <= 2 ? 5 : 6, depart = ID(R - 1, 0);
    const part = [];
    for(let q = 1; q <= R; q++) for(let r = 0; q + r <= R; r++) part.push(ID(q, r));
    const type = {};
    const pres = (a, b) => melanger(G, part.filter(c => !type[c] && distance(c, depart) >= a && distance(c, depart) <= b));
    type[depart] = {k:"p"};
    voisins(depart).forEach(c => { if(part.includes(c)) type[c] = {k:"p"}; });
    const poser = (k, n, a, b) => { const c = pres(a, b)[0]; if(c) type[c] = {k, n}; };
    for(const c of melanger(G, [...COUL])) poser(c, 1, 2, 3);
    poser("g", 0, 2, 4);
    poser("t", 0, 2, 3);
    poser("?", 0, 2, 4);
    const reste = R === 5
      ? [["b",2],["s",2],["f",2],["e",0],["m",0]]
      : [["b",1],["s",1],["f",1],["b",2],["s",2],["f",2],["g",0],["?",0],["e",0],["e",0],["m",0]];
    for(const [k, nb] of melanger(G, reste)) poser(k, nb, 2, 99);

    G.R = R; G.carte = {};
    const places = {1:[0], 2:[0,3], 3:[0,2,4], 4:[0,1,3,4]}[n];
    const coins = [];
    for(const c of part){
      let [q, r] = QR(c);
      for(let k = 0; k < 6; k++){
        const t = type[c] || {k:"p"};
        G.carte[ID(q, r)] = {k: t.k, n: t.n || 0};
        if(c === depart) coins[k] = ID(q, r);
        [q, r] = tourner(q, r);
      }
    }
    G.carte[ID(0, 0)] = {k:"?", n:0};
    return places.map(p => coins[p]);
  }

  function peuplerCarte(G){
    const ruines = Object.keys(G.carte).filter(c => G.carte[c].k === "?");
    const contenus = melanger(G, ["caisse","tourbe","cristal","energie","prestige","bete","caisse","tourbe","cristal","energie","prestige","bete","caisse","tourbe","energie","prestige","caisse","tourbe","cristal","energie"]);
    ruines.forEach((c, i) => { G.carte[c].ruine = contenus[i % contenus.length]; });
    for(const c of Object.keys(G.carte)){
      const h = G.carte[c];
      if((COUL.includes(h.k) && h.n === 2) || (h.k === "g" && distance(c, ID(0,0)) < G.R - 2)){
        if(G.qgs.some(q => distance(q, c) <= 3)) continue;
        h.bete = ["ronce","sanglier","essaim"][Math.floor(alea(G) * 3)];
      }
    }
  }

  /* ---------- Création ---------- */
  function creer(joueurs, graine){
    const G = {
      graine: (graine == null ? Math.floor(Math.random() * 2147483647) : graine) | 0,
      manche: 1, tour: 0, premier: 0, fini: false, log: [], piste: 0, batiments: {}, scores: null, fin: null,
      contrats: [], plans: {1:[], 2:[], 3:[]}
    };
    const n = joueurs.length;
    G.qgs = genererCarte(G, n);
    peuplerCarte(G);
    G.joueurs = joueurs.map((j, i) => ({
      id: j.id == null ? i : j.id, nom: j.nom, avatar: j.avatar || "", bot: !!j.bot, niveau: j.niveau || 2,
      pos: G.qgs[i], prestige: 0, tourbe: 2, jetons: 0, dette: 0, reserve: {b:0, s:0, f:0},
      u: {b:[3,0,0,0,0,0,0,0,0], s:[2,0,0,0,0,0,0,0,0], f:[1,0,0,0,0,0,0,0,0]}, auto: [0,0,0], vitrine: 0, attente: 0,
      machines: {}, vannes: {}, am: [], plans: [], main: [], perm: 0, cristaux: 0, ruines: 0, betes: 0, contrats: 0, cafe: 0
    }));
    G.joueurs.forEach((p, i) => { G.batiments[p.pos] = {j: i, b: "qg"}; });
    G.pioche = {
      contrats: [3, 2, 1].flatMap(t => melanger(G, CONTRATS.map((c, i) => ({c, i})).filter(x => x.c.t === t).map(x => x.i))),
      plans: {1: melanger(G, PLANS.filter(p => p.t === 1).map(p => p.id)), 2: melanger(G, PLANS.filter(p => p.t === 2).map(p => p.id)), 3: melanger(G, PLANS.filter(p => p.t === 3).map(p => p.id))},
      trouvailles: melanger(G, TROUVAILLES.flatMap(t => Array(t.nb).fill(t.id)))
    };
    for(let i = 0; i < 4; i++) G.contrats.push(G.pioche.contrats.pop());
    revelerPlans(G, 1);
    G.joueurs[0].jetons = jetonsDe(G.joueurs[0]);
    note(G, `Manche 1 : à ${G.joueurs[0].nom} de jouer.`);
    return G;
  }
  function revelerPlans(G, t){
    while(G.plans[t].length < 4 && G.pioche.plans[t].length) G.plans[t].push(G.pioche.plans[t].pop());
  }
  function note(G, texte){ G.log.push(texte); if(G.log.length > 60) G.log.shift(); }

  /* ---------- Valeurs dérivées ---------- */
  const amelio = id => AMELIOS.find(a => a.id === id);
  const plan = id => PLANS.find(a => a.id === id);
  const effets = p => [...p.am.map(id => amelio(id).e), ...p.plans.map(id => plan(id).e)];
  const somme = (p, k) => effets(p).reduce((s, e) => s + (e[k] || 0), 0);
  const jetonsDe = p => Math.max(1, JETONS_DEPART + somme(p, "jeton"));
  const vitesseDe = p => 1 + somme(p, "vitesse");
  const marcheDe = p => 2 + somme(p, "depl");
  const porteeDe = p => 1 + somme(p, "portee");
  const a = (p, k) => somme(p, k) > 0;
  const batimentsDe = (G, j) => Object.keys(G.batiments).filter(c => G.batiments[c].j === j);

  function energieDe(G, j){
    const p = G.joueurs[j];
    let e = ENERGIE_DEPART + somme(p, "energie") + p.cristaux * 2;
    for(const c of batimentsDe(G, j)){
      const b = G.batiments[c];
      if(b.b === "ext") e -= CONSO.ext;
      if(b.b === "centrale") e -= CONSO.centrale;
      if(b.b === "machine") e -= CONSO["m" + b.tier];
      if(b.b === "auto") e -= CONSO.auto;
    }
    return e;
  }
  /* Groupes de bâtiments non reliés au QG : les dépôts */
  function depots(G, j){
    const miens = new Set(batimentsDe(G, j)), vus = new Set(), groupes = [];
    const qg = G.qgs[j];
    for(const depart of [qg, ...miens]){
      if(vus.has(depart)) continue;
      const g = [], pile = [depart];
      vus.add(depart);
      while(pile.length){
        const c = pile.pop(); g.push(c);
        for(const v of voisins(c)) if(miens.has(v) && !vus.has(v)){ vus.add(v); pile.push(v); }
      }
      if(depart !== qg) groupes.push(g);
    }
    return groupes;
  }
  function recolteDe(G, j, c, eteints){
    const p = G.joueurs[j];
    let n = 0;
    for(const id of batimentsDe(G, j)){
      const b = G.batiments[id];
      if(b.b === "ext" && G.carte[id].k === c && !(eteints && eteints.has(id))) n += G.carte[id].n;
    }
    if(!n) return 0;
    return n + effets(p).reduce((s, e) => s + ((e.extr && e.extr[c]) || 0), 0);
  }

  /* ---------- Cubes ---------- */
  function stock(p, cle){
    if(cle === "a") return p.auto[0] + p.auto[1] + p.auto[2];
    const c = cle[0], t = +cle[1], l = p.u[c];
    let n = l[(t-1)*3] + l[(t-1)*3+1] + l[(t-1)*3+2];
    if(t === 1) n += p.reserve[c];
    return n;
  }
  const peutPayer = (p, cout) => Object.keys(cout).every(k => stock(p, k) >= cout[k]);
  function payer(p, cout){
    for(const k of Object.keys(cout)){
      let n = cout[k];
      if(k === "a"){ for(let i = 0; i < 3 && n; i++){ const x = Math.min(n, p.auto[i]); p.auto[i] -= x; n -= x; } continue; }
      const c = k[0], t = +k[1], l = p.u[c];
      if(t === 1){ const x = Math.min(n, p.reserve[c]); p.reserve[c] -= x; n -= x; }
      for(let i = (t-1)*3; i < t*3 && n; i++){ const x = Math.min(n, l[i]); l[i] -= x; n -= x; }
    }
  }
  function ajouter(p, c, n){
    const l = p.u[c];
    const x = Math.min(n, CAP[0] - l[0]);
    l[0] += x; p.reserve[c] += n - x;
  }
  const estActive = (p, c, t, off) => !!p.machines[c + t] && !(off && off.has(c + t));
  /* Une étape de tapis pour toute l'usine : droite d'abord, pour qu'un cube ne bouge qu'une fois */
  function etape(p, off, force){
    const autoOn = !!p.machines.auto && !(off && off.has("auto"));
    if(autoOn){
      p.attente += p.auto[2]; p.vitrine += p.auto[2]; p.auto[2] = 0;
      for(let i = 1; i >= 0; i--){ const x = Math.min(p.auto[i], 3 - p.auto[i+1]); p.auto[i] -= x; p.auto[i+1] += x; }
      if(COUL.every(c => p.u[c][8] > 0) && COUL.every(c => estActive(p, c, 3, off)) && p.auto[0] < 3 && !COUL.some(c => p.vannes[c+3])){
        COUL.forEach(c => p.u[c][8]--); p.auto[0]++;
      }
    }
    for(const c of COUL) etapeLigne(p, c, off, force);
  }
  function etapeLigne(p, c, off, force){
    const l = p.u[c];
    const on = t => (force && force.t === t) || estActive(p, c, t, off);
    for(let i = 7; i >= 0; i--){
      if(!l[i]) continue;
      const t = Math.floor(i / 3) + 1, passe = i % 3 === 2;
      if(!on(t)) continue;
      if(!passe){ const x = Math.min(l[i], CAP[i+1] - l[i+1]); l[i] -= x; l[i+1] += x; continue; }
      if(p.vannes[c + t] || !on(t + 1)) continue;
      if(i === 2){ const x = Math.min(l[2], CAP[3] - l[3]); l[2] -= x; l[3] += x; }
      else while(l[5] >= 2 && l[6] < CAP[6]){ l[5] -= 2; l[6]++; }
    }
  }

  /* ---------- Portées ---------- */
  function atteignables(G, j){
    const p = G.joueurs[j], max = marcheDe(p), passe = a(p, "passe");
    const dist = {[p.pos]: {pas: 0, risque: 0}}, file = [p.pos];
    while(file.length){
      file.sort((x, y) => dist[x].risque - dist[y].risque || dist[x].pas - dist[y].pas);
      const c = file.shift(), d = dist[c];
      if(d.pas >= max) continue;
      for(const v of voisins(c)){
        const h = G.carte[v];
        if(!h || (h.k === "e" && !passe)) continue;
        const risque = d.risque + (h.k === "m" && !passe ? 1 : 0), pas = d.pas + 1;
        const o = dist[v];
        if(!o || risque < o.risque || (risque === o.risque && pas < o.pas)){ dist[v] = {pas, risque}; file.push(v); }
      }
    }
    delete dist[p.pos];
    for(const q of G.joueurs) if(dist[q.pos]) delete dist[q.pos];
    return dist;
  }
  function peineArrivee(G, c){
    const h = G.carte[c];
    let n = h.bete === "sanglier" || h.bete === "essaim" ? 1 : 0;
    if(!n && voisins(c).some(v => G.carte[v] && G.carte[v].bete === "essaim")) n = 1;
    return n;
  }
  /* Raison pour laquelle on ne peut pas bâtir ici ("" = possible) */
  function refusCase(G, j, c, b){
    const p = G.joueurs[j], h = G.carte[c];
    if(!h) return "Hors de la carte.";
    if(distance(p.pos, c) > porteeDe(p)) return "Trop loin de ton pion.";
    if(G.batiments[c]) return "Cette case est déjà occupée.";
    if(h.bete) return "Une bête occupe cette case.";
    if(h.k === "?") return "Explore d'abord cette ruine.";
    if(voisins(c).some(v => G.carte[v] && G.carte[v].bete === "ronce")) return "Des ronces envahissent les cases voisines.";
    if((h.k === "e" || h.k === "m") && !a(p, "pilotis")) return "Il faut des pilotis pour bâtir ici.";
    if(b === "ext" && !COUL.includes(h.k)) return "Un extracteur se pose sur un gisement.";
    if(b === "centrale" && h.k !== "g") return "Une centrale se pose sur une source de vapeur.";
    return "";
  }
  function coutBatiment(b, coul, tier, c, G){
    if(b === "ext") return {[(c ? G.carte[c].k : coul) + "1"]: 2};
    if(b === "centrale") return COUT_CENTRALE;
    if(b === "tapis") return {b1: 1};
    if(b === "machine") return COUT_MACHINE[tier](coul);
    if(b === "auto") return COUT_AUTO;
    return {};
  }
  const consoDe = (b, tier) => b === "machine" ? CONSO["m" + tier] : CONSO[b] || 0;

  /* ---------- Gains ---------- */
  function gagnerPrestige(G, j, n){ G.joueurs[j].prestige += n; }
  function piocherTrouvaille(G, p){
    if(!G.pioche.trouvailles.length) return;
    p.main.push(G.pioche.trouvailles.pop());
  }
  function explorer(G, j, c){
    const p = G.joueurs[j], h = G.carte[c], quoi = h.ruine;
    p.ruines++; h.k = "p"; delete h.ruine;
    let txt = "";
    if(quoi === "caisse"){ for(const k of COUL) ajouter(p, k, 1); txt = "une caisse (+1 de chaque)"; }
    if(quoi === "tourbe"){ p.tourbe += 2; txt = "2 tourbes"; }
    if(quoi === "cristal"){
      if(p.cristaux < 2){ p.cristaux++; txt = "un cristal de chaleur (+2 vapeur)"; }
      else { p.tourbe += 2; txt = "un cristal de trop, revendu 2 tourbes"; }
    }
    if(quoi === "energie"){ p.tourbe += 1; p.jetons += 1; txt = "un vieux poêle (+1 tourbe, +1 action)"; }
    if(quoi === "prestige"){ gagnerPrestige(G, j, 1); txt = "un trésor (+1 prestige)"; }
    if(quoi === "bete"){ p.dette += 1; h.bete = "sanglier"; txt = "un sanglier furieux (-1 action)"; }
    piocherTrouvaille(G, p);
    note(G, `${p.nom} explore une ruine : ${txt}, et une trouvaille.`);
  }
  function avancerPiste(G, j, n){
    const p = G.joueurs[j];
    for(let i = 0; i < n && G.piste < PISTE; i++){
      G.piste++;
      const b = BONUS_PISTE[G.piste];
      if(!b) continue;
      if(b.tourbe){ p.tourbe += b.tourbe; note(G, `Exposition, case ${G.piste} : ${p.nom} gagne ${b.tourbe} tourbes.`); }
      if(b.prestige){ gagnerPrestige(G, j, b.prestige); note(G, `Exposition, case ${G.piste} : ${p.nom} gagne ${b.prestige} prestige.`); }
      if(b.plans){ revelerPlans(G, b.plans); note(G, `Exposition, case ${G.piste} : les plans de niveau ${b.plans} sont disponibles pour tous !`); }
    }
  }
  const plansOuverts = G => [1, ...(G.piste >= 4 ? [2] : []), ...(G.piste >= 8 ? [3] : [])];

  function depenser(G, j, n){
    const p = G.joueurs[j];
    if(p.jetons >= n) p.jetons -= n;
    else { p.dette += n - p.jetons; p.jetons = 0; }
  }

  /* ---------- Actions ---------- */
  function agir(G, j, A){
    if(G.fini) return "La partie est finie.";
    if(j !== G.tour) return "Ce n'est pas ton tour.";
    const p = G.joueurs[j];
    const f = {marcher, batir, plan: acheterPlan, atelier, contrat, amelio: acheterAmelio, echange, carte: jouerCarte, vanne, fin: finTour}[A.t];
    if(!f) return "Action inconnue.";
    const refus = f(G, j, p, A);
    return refus || "";
  }
  function marcher(G, j, p, A){
    if(p.jetons < 1) return "Plus d'action.";
    const d = atteignables(G, j)[A.c];
    if(!d) return "Tu ne peux pas aller là.";
    const h = G.carte[A.c];
    const chasse = A.chasser && h.bete && p.jetons >= 2;
    depenser(G, j, 1);
    if(chasse) depenser(G, j, 1);
    p.pos = A.c;
    if(d.risque) { depenser(G, j, d.risque); note(G, `${p.nom} traverse le marais : -${d.risque} action.`); }
    if(chasse){
      note(G, `${p.nom} chasse ${nomBete(h.bete)} et récupère une tourbe.`);
      h.bete = null; p.betes++; p.tourbe++;
    }
    if(!chasse && peineArrivee(G, A.c)){ depenser(G, j, 1); note(G, `${p.nom} est attaqué par une bête : -1 action.`); }
    if(h.k === "?") explorer(G, j, A.c);
    else if(!G.batiments[A.c] && !h.bete){
      if(COUL.includes(h.k)) ajouter(p, h.k, h.n);
      if(h.k === "t") p.tourbe += 1;
    }
    return "";
  }
  const nomBete = b => ({ronce: "les ronces", sanglier: "le sanglier", essaim: "l'essaim"}[b] || "la bête");

  function batir(G, j, p, A){
    if(p.jetons < 1) return "Plus d'action.";
    const b = A.b;
    if(b === "tapis"){
      const max = 2 + somme(p, "tapis"), cases = A.cases || [];
      if(!cases.length || cases.length > max) return `Pose de 1 à ${max} tapis.`;
      if(new Set(cases).size !== cases.length) return "Choisis des cases différentes.";
      for(let i = 0; i < cases.length; i++){
        const r = refusCaseTapis(G, j, cases[i], i ? cases[i-1] : null);
        if(r) return r;
      }
      const cout = {b1: 1};
      if(!peutPayer(p, cout)) return "Il te faut 1 bûche.";
      payer(p, cout);
      for(const c of cases) G.batiments[c] = {j, b: "tapis"};
      depenser(G, j, 1);
      note(G, `${p.nom} pose ${cases.length} tapis.`);
      return "";
    }
    if(b === "machine" || b === "auto"){
      const cle = b === "auto" ? "auto" : A.coul + A.tier;
      if(p.machines[cle]) return "Cette machine est déjà construite.";
    }
    const r = refusCase(G, j, A.c, b);
    if(r) return r;
    const cout = coutBatiment(b, A.coul, A.tier, A.c, G);
    if(!peutPayer(p, cout)) return "Il te manque des ressources.";
    const conso = consoDe(b, A.tier);
    if(conso > 0 && energieDe(G, j) - conso < ENERGIE_MIN) return `Pas assez de vapeur : ton usine descendrait sous ${ENERGIE_MIN}.`;
    payer(p, cout);
    G.batiments[A.c] = b === "machine" ? {j, b, coul: A.coul, tier: A.tier} : {j, b};
    if(b === "machine") p.machines[A.coul + A.tier] = true;
    if(b === "auto") p.machines.auto = true;
    depenser(G, j, 1);
    note(G, `${p.nom} construit ${nomBatiment(G.batiments[A.c], G.carte[A.c])}.`);
    return "";
  }
  function refusCaseTapis(G, j, c, avant){
    const p = G.joueurs[j];
    const h = G.carte[c];
    if(!h) return "Hors de la carte.";
    if(avant ? distance(avant, c) !== 1 : distance(p.pos, c) > porteeDe(p)) return avant ? "Les tapis doivent se suivre." : "Trop loin de ton pion.";
    if(G.batiments[c]) return "Cette case est déjà occupée.";
    if(h.bete) return "Une bête occupe cette case.";
    if(h.k === "?") return "Explore d'abord cette ruine.";
    if(voisins(c).some(v => G.carte[v] && G.carte[v].bete === "ronce")) return "Des ronces envahissent les cases voisines.";
    if((h.k === "e" || h.k === "m") && !a(p, "pilotis")) return "Il faut des pilotis pour bâtir ici.";
    return "";
  }
  function nomBatiment(b, h){
    if(b.b === "qg") return "le comptoir";
    if(b.b === "tapis") return "un tapis";
    if(b.b === "centrale") return "une centrale";
    if(b.b === "auto") return "l'assembleur d'automates";
    if(b.b === "ext") return "un extracteur de " + NOMS[h.k][0].toLowerCase();
    return "la machine « " + NOMS[b.coul][b.tier-1] + " »";
  }
  function coutPlan(p, x){
    const c = {...x.cout};
    if(a(p, "remise")){ const k = Object.keys(c).find(k => k !== "a" && +k[1] === 1) || Object.keys(c)[0]; if(c[k] > 1) c[k]--; else if(Object.keys(c).length > 1) delete c[k]; }
    return c;
  }
  function acheterPlan(G, j, p, A){
    if(p.jetons < 1) return "Plus d'action.";
    const x = plan(A.id);
    if(!x || !plansOuverts(G).includes(x.t) || !G.plans[x.t].includes(A.id)) return "Ce plan n'est pas disponible.";
    const cout = coutPlan(p, x);
    if(!peutPayer(p, cout)) return "Il te manque des ressources.";
    payer(p, cout);
    G.plans[x.t].splice(G.plans[x.t].indexOf(A.id), 1);
    revelerPlans(G, x.t);
    p.plans.push(A.id);
    if(x.e.prestige) gagnerPrestige(G, j, x.e.prestige);
    if(x.e.jeton) p.jetons += x.e.jeton;
    depenser(G, j, 1);
    note(G, `${p.nom} réalise le plan « ${x.nom} ».`);
    return "";
  }
  function atelier(G, j, p, A){
    if(p.jetons < 1) return "Plus d'action.";
    const n = 1 + somme(p, "atelier");
    if(A.m === "pousser"){
      const t = A.tier;
      if(![1,2,3].includes(t) || !COUL.includes(A.coul)) return "Choisis une machine.";
      let bouge = false;
      const avant = JSON.stringify(p.u[A.coul]);
      for(let k = 0; k < vitesseDe(p) * n; k++) poussee(p, A.coul, t);
      bouge = avant !== JSON.stringify(p.u[A.coul]);
      if(!bouge) return "Rien à pousser ici.";
      depenser(G, j, 1);
      return "";
    }
    if(A.m === "raffiner"){
      let fait = 0;
      for(let k = 0; k < n; k++) if(raffiner(p, A.coul, A.tier)) fait++;
      if(!fait) return A.tier === 2 ? "Il te faut 1 " + NOMS[A.coul][0].toLowerCase() + " et de la place." : "Il te faut 2 " + NOMS[A.coul][1].toLowerCase() + "s et de la place.";
      depenser(G, j, 1);
      note(G, `${p.nom} raffine à l'atelier : ${fait} ${NOMS[A.coul][A.tier-1].toLowerCase()}.`);
      return "";
    }
    return "Action inconnue.";
  }
  function poussee(p, c, t){
    const l = p.u[c], d = (t-1)*3;
    for(let i = d + 1; i >= d; i--){ const x = Math.min(l[i], CAP[i+1] - l[i+1]); l[i] -= x; l[i+1] += x; }
  }
  function raffiner(p, c, t){
    const l = p.u[c];
    if(t === 2){
      if(l[3] >= CAP[3] || stock(p, c + "1") < 1) return false;
      payer(p, {[c+"1"]: 1}); l[3]++;
      return true;
    }
    if(t === 3){
      if(l[6] >= CAP[6] || stock(p, c + "2") < 2) return false;
      payer(p, {[c+"2"]: 2}); l[6]++;
      return true;
    }
    return false;
  }
  function contrat(G, j, p, A){
    const pos = G.contrats.indexOf(A.i);
    if(pos < 0) return "Ce contrat n'est plus disponible.";
    const x = CONTRATS[A.i];
    if(!peutPayer(p, x.cout)) return "Il te manque des ressources.";
    payer(p, x.cout);
    gagnerPrestige(G, j, x.p);
    p.contrats++;
    note(G, `${p.nom} honore « ${x.nom} » : +${x.p} prestige.`);
    G.contrats.splice(pos, 1);
    if(G.pioche.contrats.length) G.contrats.push(G.pioche.contrats.pop());
    avancerPiste(G, j, x.av);
    return "";
  }
  function acheterAmelio(G, j, p, A){
    const x = amelio(A.id);
    if(!x || p.am.includes(A.id)) return "Amélioration indisponible.";
    if(!peutPayer(p, x.cout)) return "Il te manque des ressources.";
    payer(p, x.cout);
    p.am.push(A.id);
    if(x.e.prestige) gagnerPrestige(G, j, x.e.prestige);
    if(x.e.jeton) p.jetons += x.e.jeton;
    note(G, `${p.nom} obtient « ${x.nom} ».`);
    return "";
  }
  function echange(G, j, p, A){
    const tarif = a(p, "troc") ? 1 : 2;
    const de = A.de || [];
    if(de.length !== tarif) return `Il faut ${tarif} ressource${tarif > 1 ? "s" : ""} pour échanger.`;
    const besoin = {b:0, s:0, f:0, t:0};
    for(const k of de) besoin[k]++;
    if(besoin.t > p.tourbe || COUL.some(c => besoin[c] > stock(p, c + "1"))) return "Il te manque des ressources.";
    if(![...COUL, "t"].includes(A.vers)) return "Échange impossible.";
    p.tourbe -= besoin.t;
    for(const c of COUL) if(besoin[c]) payer(p, {[c+"1"]: besoin[c]});
    if(A.vers === "t") p.tourbe++; else ajouter(p, A.vers, 1);
    return "";
  }
  function jouerCarte(G, j, p, A){
    const pos = p.main.indexOf(A.id);
    if(pos < 0) return "Tu n'as pas cette carte.";
    p.main.splice(pos, 1);
    if(A.id === "cafe") p.jetons += 1;
    if(A.id === "caisse") for(const c of COUL) ajouter(p, c, 1);
    if(A.id === "charbon") p.tourbe += 3;
    if(A.id === "zele") for(const c of COUL) for(let t = 3; t >= 1; t--) if(p.machines[c+t]) poussee(p, c, t);
    if(A.id === "gazette") gagnerPrestige(G, j, 1);
    if(A.id === "chien") p.perm++;
    note(G, `${p.nom} joue « ${TROUVAILLES.find(t => t.id === A.id).nom} ».`);
    return "";
  }
  function vanne(G, j, p, A){
    if(!COUL.includes(A.coul) || ![1,2,3].includes(A.tier)) return "Vanne inconnue.";
    const k = A.coul + A.tier;
    if(p.vannes[k]) delete p.vannes[k]; else p.vannes[k] = true;
    return "";
  }
  function finTour(G, j, p){
    p.jetons = 0;
    const n = G.joueurs.length;
    const suivant = (G.tour + 1) % n;
    if(suivant === G.premier){ production(G); return ""; }
    G.tour = suivant;
    preparerTour(G);
    return "";
  }
  function preparerTour(G){
    const p = G.joueurs[G.tour];
    p.jetons = Math.max(0, jetonsDe(p) - p.dette);
    p.dette = 0;
    if(p.jetons === 0) { note(G, `${p.nom} a perdu tout son tour.`); }
  }

  /* ---------- Production : vapeur → tapis → récolte → prestige ---------- */
  function production(G){
    note(G, `— Production de la manche ${G.manche} —`);
    G.joueurs.forEach((p, j) => {
      p.tourbe += somme(p, "tourbe") + p.perm;
      const eteints = new Set(), off = new Set();
      // dépôts isolés : 1 tourbe chacun, sinon leurs extracteurs s'arrêtent
      for(const g of depots(G, j)){
        const ext = g.filter(c => G.batiments[c].b === "ext");
        if(!ext.length) continue;
        if(p.tourbe > 0) p.tourbe--;
        else { ext.forEach(c => eteints.add(c)); note(G, `${p.nom} : un dépôt isolé s'arrête, faute de tourbe.`); }
      }
      // vapeur manquante : 1 tourbe par point, sinon on éteint les plus gourmandes
      let e = energieDe(G, j);
      if(e < 0){
        const paye = Math.min(p.tourbe, -e);
        p.tourbe -= paye;
        let manque = -e - paye;
        const liste = batimentsDe(G, j).map(c => G.batiments[c]).filter(b => b.b === "machine" || b.b === "auto").sort((x, y) => (y.tier || 4) - (x.tier || 4));
        for(const b of liste){
          if(manque <= 0) break;
          off.add(b.b === "auto" ? "auto" : b.coul + b.tier);
          manque -= b.b === "auto" ? CONSO.auto : CONSO["m" + b.tier];
        }
        if(off.size) note(G, `${p.nom} manque de vapeur : ${off.size} machine${off.size > 1 ? "s" : ""} à l'arrêt.`);
      }
      // la soupape : un gros excédent de vapeur se vend
      if(e >= 8){ gagnerPrestige(G, j, 1); note(G, `${p.nom} vend son excédent de vapeur : +1 prestige.`); }
      // tapis
      for(let k = 0; k < vitesseDe(p); k++) etape(p, off);
      // récolte
      for(const c of COUL){
        const l = p.u[c];
        const x = Math.min(p.reserve[c], CAP[0] - l[0]);
        l[0] += x; p.reserve[c] -= x;
        l[0] = Math.min(CAP[0], l[0] + recolteDe(G, j, c, eteints));
      }
      // vitrine : chaque automate arrivé au bout rapporte du prestige
      if(p.attente){
        const gain = p.attente * (a(p, "vitrine") ? 2 : 1);
        gagnerPrestige(G, j, gain);
        note(G, `${p.nom} expose ${p.attente > 1 ? p.attente + " automates" : "un automate"} : +${gain} prestige.`);
        p.attente = 0;
      }
      // plein régime : tous les derniers segments remplis
      if(COUL.every(c => [2,5,8].every(i => p.u[c][i] >= CAP[i]))){ gagnerPrestige(G, j, 1); note(G, `${p.nom} tourne à plein régime : +1 prestige.`); }
    });
    if(G.joueurs.some(p => p.prestige >= BUT) || G.piste >= PISTE || G.manche >= MANCHES_MAX){ terminer(G); return; }
    G.manche++;
    G.premier = (G.premier + 1) % G.joueurs.length;
    G.tour = G.premier;
    preparerTour(G);
    note(G, `Manche ${G.manche} : à ${G.joueurs[G.tour].nom} de jouer.`);
  }

  /* ---------- Fin de partie ---------- */
  function pointsFin(G, j){
    const p = G.joueurs[j], d = {};
    for(const id of p.plans){
      const f = plan(id).e.fin;
      if(!f) continue;
      let n = 0;
      if(f === "ruines") n = Math.min(3, p.ruines);
      if(f === "contrats") n = Math.floor(p.contrats / 2);
      if(f === "palais") n = 5;
      if(f === "batiments") n = Math.min(5, Math.floor(batimentsDe(G, j).filter(c => G.batiments[c].b !== "tapis").length / 2));
      if(f === "machines") n = Math.min(6, Object.keys(p.machines).length);
      d[plan(id).nom] = n;
    }
    return d;
  }
  function terminer(G){
    G.fini = true;
    const n = G.joueurs.length;
    const maj = (titre, val) => {
      if(n < 2) return;
      const max = Math.max(...G.joueurs.map(val));
      if(max <= 0) return;
      G.joueurs.forEach((p, j) => { if(val(p, j) === max){ p.bonus = p.bonus || []; p.bonus.push(titre); } });
    };
    maj("Grand explorateur", p => p.ruines);
    maj("Maître de la vapeur", (p, j) => energieDe(G, G.joueurs.indexOf(p)));
    maj("Fournisseur officiel", p => p.contrats);
    G.scores = G.joueurs.map((p, j) => {
      const fin = pointsFin(G, j), f = Object.values(fin).reduce((s, x) => s + x, 0), maj = (p.bonus || []).length;
      return {j, base: p.prestige, fin, maj, majs: p.bonus || [], total: p.prestige + f + maj};
    }).sort((x, y) => y.total - x.total);
    const top = G.scores[0].total;
    G.gagnants = G.scores.filter(s => s.total === top).map(s => s.j);
    note(G, "La partie est finie !");
  }

  /* ---------- Bot : suit des priorités simples, en passant par agir() ---------- */
  function coupBot(G, j){
    const p = G.joueurs[j];
    const paye = c => peutPayer(p, c);
    // actions gratuites d'abord
    const c = G.contrats.filter(i => paye(CONTRATS[i].cout)).sort((x, y) => CONTRATS[y].p - CONTRATS[x].p);
    const carte = p.main[0];
    if(carte) return {t:"carte", id:carte};
    // le bot ne vide pas son usine tant qu'elle n'a pas de quoi bâtir ses premières machines
    const lancee = COUL.every(k => p.machines[k+1]) && recolteTotale(G, j) >= 3;
    if(c.length && (lancee || CONTRATS[c[0]].p >= 3)) return {t:"contrat", i:c[0]};
    const am = AMELIOS.filter(x => !p.am.includes(x.id) && paye(x.cout));
    const ordre = ["courroie","bottes","apprentis","chaudiere","transmission","turbine","grue","presse","foreuses","scies","dragues","passerelle","tapis","pilotis","bureau"];
    am.sort((x, y) => ordre.indexOf(x.id) - ordre.indexOf(y.id));
    if(am.length && lancee) return {t:"amelio", id:am[0].id};
    if(p.jetons <= (p.niveau === 1 ? 1 : 0)) return {t:"fin"};

    const objectifs = quoiBatir(G, j);
    for(const o of objectifs){
      const coup = versObjectif(G, j, o);
      if(coup) return coup;
    }
    // rien de payable : un contrat ou une amélioration peut relancer l'usine
    if(c.length) return {t:"contrat", i:c[0]};
    if(am.length) return {t:"amelio", id:am[0].id};
    // sinon on va chercher ce qui manque au premier objectif
    for(const o of objectifs){
      const cout = o.b === "plan" || o.b === "lien" ? {b1:1} : o.b === "ext" ? {[o.coul+"1"]: 2} : coutBatiment(o.b, o.coul, o.tier);
      const coup = ressourcesManquantes(G, j, cout);
      if(coup) return coup;
    }
    return raffinageUtile(G, j) || {t:"fin"};
  }
  const recolteTotale = (G, j) => COUL.reduce((s, c) => s + recolteDe(G, j, c), 0);

  function quoiBatir(G, j){
    const p = G.joueurs[j], l = [], e = energieDe(G, j);
    const ordre = COUL; // ordre fixe : suivre le stock ferait hésiter le bot entre deux gisements
    for(const c of ordre) if(recolteDe(G, j, c) === 0) l.push({b:"ext", coul:c});
    for(const g of depots(G, j)) if(g.some(c => G.batiments[c].b === "ext")) l.push({b:"lien", g});
    if(e <= -1) l.push({b:"centrale"});
    for(const c of COUL) if(!p.machines[c+1]) l.push({b:"machine", coul:c, tier:1});
    for(const x of plansOuverts(G).flatMap(t => G.plans[t])){
      const pl = plan(x);
      if((pl.e.energie || pl.e.jeton || pl.e.vitesse || pl.e.extr) && peutPayer(p, coutPlan(p, pl))) l.push({b:"plan", id:x});
    }
    if(e <= 0) l.push({b:"centrale"});
    for(const c of ordre) if(recolteDe(G, j, c) < 2) l.push({b:"ext", coul:c});
    for(const c of COUL) if(!p.machines[c+2]) l.push({b:"machine", coul:c, tier:2});
    if(e <= 2) l.push({b:"centrale"});
    for(const c of COUL) if(!p.machines[c+3]) l.push({b:"machine", coul:c, tier:3});
    if(!p.machines.auto && COUL.every(c => p.machines[c+3])) l.push({b:"auto"});
    for(const x of plansOuverts(G).flatMap(t => G.plans[t])) if(peutPayer(p, coutPlan(p, plan(x)))) l.push({b:"plan", id:x});
    return l;
  }
  function versObjectif(G, j, o){
    const p = G.joueurs[j];
    if(o.b === "plan") return {t:"plan", id:o.id};
    if(o.b === "lien") return versLien(G, j, o.g);
    const conso = consoDe(o.b, o.tier);
    if(conso > 0 && energieDe(G, j) - conso < ENERGIE_MIN) return null;
    const cout = o.b === "ext" ? {[o.coul+"1"]: 2} : coutBatiment(o.b, o.coul, o.tier);
    if(!peutPayer(p, cout)) return null;
    // cases où ce bâtiment peut aller
    const ok = c => {
      const h = G.carte[c];
      if(G.batiments[c] || h.k === "?" || h.k === "e" || h.k === "m") return false;
      if(o.b === "ext") return h.k === o.coul;
      if(o.b === "centrale") return h.k === "g";
      return h.k === "p";
    };
    const miens = batimentsDe(G, j);
    const score = c => {
      const prox = o.b === "machine" || o.b === "auto" ? Math.min(...miens.map(m => distance(m, c))) : 0;
      return distance(p.pos, c) + distance(G.qgs[j], c) * .5 + prox * 2 - (G.carte[c].n || 0) + (obstacle(G, c) ? 100 : 0);
    };
    const pied = aPied(G, j, p.pos);
    const cases = Object.keys(G.carte).filter(c => ok(c) && pied[c] != null).sort((x, y) => score(x) - score(y));
    if(!cases.length) return null;
    const cible = cases[0], gene = obstacle(G, cible);
    if(gene){
      if(atteignables(G, j)[gene] && p.jetons >= 2) return {t:"marcher", c:gene, chasser:true};
      return p.jetons >= 2 ? versCase(G, j, gene) : null;
    }
    if(distance(p.pos, cible) <= porteeDe(p)){
      const A = {t:"batir", b:o.b, c:cible, coul:o.coul, tier:o.tier};
      return refusCase(G, j, cible, o.b) ? null : A;
    }
    return versCase(G, j, cible);
  }
  /* Distance à pied (l'eau bloque), pour ne pas tourner en rond autour d'un lac */
  function aPied(G, j, de){
    const passe = a(G.joueurs[j], "passe"), d = {[de]: 0}, file = [de];
    while(file.length){
      const c = file.shift();
      for(const v of voisins(c)){
        const h = G.carte[v];
        if(!h || v in d || (h.k === "e" && !passe)) continue;
        d[v] = d[c] + 1; file.push(v);
      }
    }
    return d;
  }
  const obstacle = (G, c) => G.carte[c].bete ? c : voisins(c).find(v => G.carte[v] && G.carte[v].bete === "ronce");
  function versCase(G, j, cible){
    const r = atteignables(G, j), loin = aPied(G, j, cible);
    let mieux = null, m = loin[G.joueurs[j].pos] == null ? 1e9 : loin[G.joueurs[j].pos] * 3;
    for(const c of Object.keys(r)){
      if(loin[c] == null) continue;
      const s = loin[c] * 3 + r[c].risque * 6 + peineArrivee(G, c) * 6 + (G.carte[c].k === "?" ? -2 : 0);
      if(s < m){ m = s; mieux = c; }
    }
    return mieux ? {t:"marcher", c:mieux} : null;
  }
  function versLien(G, j, g){
    const p = G.joueurs[j], reseau = depotsPrincipal(G, j);
    if(!peutPayer(p, {b1:1})) return null;
    let meilleur = null, m = 1e9;
    for(const a0 of g) for(const b0 of reseau){ const d = distance(a0, b0); if(d < m){ m = d; meilleur = [a0, b0]; } }
    if(!meilleur) return null;
    const route = cheminLibre(G, j, meilleur[1], meilleur[0]);
    if(!route || !route.length) return null;
    const max = 2 + somme(p, "tapis");
    if(distance(p.pos, route[0]) > porteeDe(p)) return versCase(G, j, route[0]);
    return {t:"batir", b:"tapis", cases: route.slice(0, max)};
  }
  function depotsPrincipal(G, j){
    const isoles = new Set(depots(G, j).flat());
    return batimentsDe(G, j).filter(c => !isoles.has(c));
  }
  function cheminLibre(G, j, de, vers){
    const prev = {[de]: null}, file = [de];
    while(file.length){
      const c = file.shift();
      for(const v of voisins(c)){
        if(v in prev || !G.carte[v]) continue;
        if(v === vers){ const l = []; let k = c; while(k !== de && k){ l.unshift(k); k = prev[k]; } return l; }
        if(refusCaseTapis2(G, j, v)) continue;
        prev[v] = c; file.push(v);
      }
    }
    return null;
  }
  function refusCaseTapis2(G, j, c){
    const h = G.carte[c];
    return G.batiments[c] || h.bete || h.k === "?" || ((h.k === "e" || h.k === "m") && !a(G.joueurs[j], "pilotis")) || voisins(c).some(v => G.carte[v] && G.carte[v].bete === "ronce");
  }
  function ressourcesManquantes(G, j, cout){
    const p = G.joueurs[j];
    if(cout){
      for(const k of Object.keys(cout)){
        if(stock(p, k) >= cout[k]) continue;
        const c = k[0], t = k[1];
        if(t === "2" && stock(p, c+"1") >= 1 && p.u[c][3] < CAP[3]) return {t:"atelier", m:"raffiner", coul:c, tier:2};
        if(t === "3" && stock(p, c+"2") >= 2 && p.u[c][6] < CAP[6]) return {t:"atelier", m:"raffiner", coul:c, tier:3};
        if(t === "1"){
          // n'échange que du vrai surplus, sinon il tourne en rond
          const tarif = a(p, "troc") ? 1 : 2, de = [];
          for(const o of COUL) if(o !== c && stock(p, o+"1") >= 3 + tarif && recolteDe(G, j, o) > 0) while(de.length < tarif) de.push(o);
          while(de.length < tarif && p.tourbe - de.filter(x => x === "t").length >= 4) de.push("t");
          if(de.length === tarif) return {t:"echange", de, vers:c};
        }
        // aller chercher à pied
        if(t === "1"){
          const cases = Object.keys(G.carte).filter(x => G.carte[x].k === c && !G.batiments[x] && !G.carte[x].bete && x !== p.pos).sort((x, y) => distance(p.pos, x) - distance(p.pos, y));
          if(cases.length) return versCase(G, j, cases[0]);
        }
        return raffinageUtile(G, j);
      }
    }
    return null;
  }
  function raffinageUtile(G, j){
    const p = G.joueurs[j];
    for(const c of COUL){
      if(stock(p, c+"2") >= 2 && p.u[c][6] < CAP[6]) return {t:"atelier", m:"raffiner", coul:c, tier:3};
    }
    for(const c of [...COUL].sort((x, y) => stock(p, x+"2") - stock(p, y+"2"))){
      if(stock(p, c+"1") >= 1 && p.u[c][3] < CAP[3]) return {t:"atelier", m:"raffiner", coul:c, tier:2};
    }
    return null;
  }

  return {
    creer, agir, coupBot, atteignables, refusCase, refusCaseTapis, energieDe, depots, recolteDe, stock, peutPayer, coutBatiment, consoDe, coutPlan,
    jetonsDe, vitesseDe, marcheDe, porteeDe, plansOuverts, peineArrivee, pointsFin, distance, voisins, QR, ID,
    COUL, NOMS, CAP, BUT, PISTE, BONUS_PISTE, AMELIOS, PLANS, CONTRATS, TROUVAILLES, ENERGIE_MIN, COUT_AUTO
  };
})();
