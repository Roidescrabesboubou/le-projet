/* ============================================================
   ROCADE : règles du jeu, sans aucun dessin
   Les cases sont numérotées y*L+x. Le réseau est un graphe :
   liens : case → Map(voisine → "r" route | "a" autoroute).
   Les stocks ne sont jamais débités : on recompte ce que le réseau
   utilise et on compare au total, donc effacer rend tout seul.
   ============================================================ */
(function(){
  const L = 44, H = 30;
  const HERBE = 0, EAU = 1, MONT = 2, PARC = 3;
  const SEMAINE = 60, PORTEE_SPAN = 6, LONG_AUTOROUTE = 18;
  const V = 3.2, V_AUTOROUTE = 2.4, ECART = .62, ZONE_VERROU = .42, GARE = 1.1, PERDU = 3, COINCE = 10;
  const ALERTE = 7, DANGER = 45, RETOMBE = 15;
  const NB_COULEURS = 6, DEST_NOUVELLE_COULEUR = [0,1,3,5,8,12];
  const CARTES = [
    {id:"routes", titre:"Routes", emoji:"🛣️", texte:"30 cases de route en plus."},
    {id:"ponts", titre:"Ponts", emoji:"🌉", texte:"2 ponts pour franchir l'eau."},
    {id:"tunnels", titre:"Tunnels", emoji:"🚇", texte:"2 tunnels pour passer sous les reliefs."},
    {id:"ronds", titre:"Ronds-points", emoji:"⭕", texte:"2 ronds-points : un carrefour bien plus fluide."},
    {id:"feux", titre:"Feux tricolores", emoji:"🚦", texte:"2 feux : chaque axe passe à son tour, par deux."},
    {id:"autoroutes", titre:"Autoroute", emoji:"🛤️", texte:"Une voie rapide entre deux routes, par-dessus tout le reste."}
  ];

  function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  const X = c => c%L, Y = c => c/L|0, id = (x,y) => y*L+x;
  const dehorsCarte = (x,y) => x<0||y<0||x>=L||y>=H;
  const DIRS = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  const longueur = (a,b) => Math.hypot(X(a)-X(b),Y(a)-Y(b));

  /* Terrain d'une ville, utilisé aussi pour l'aperçu du menu */
  function terrain(ville){
    const sol = new Uint8Array(L*H).fill(ville.fond==="eau"?EAU:HERBE);
    const TYPES = {eau:EAU,mont:MONT,parc:PARC,herbe:HERBE};
    for(const d of ville.decor){
      const pts = d.pts.length>1?d.pts:[d.pts[0],d.pts[0]];
      for(let i=0;i+1<pts.length;i++){
        const [x1,y1] = pts[i], [x2,y2] = pts[i+1], n = Math.max(1,Math.ceil(Math.hypot(x2-x1,y2-y1)*2));
        for(let s=0;s<=n;s++){
          const px = x1+(x2-x1)*s/n, py = y1+(y2-y1)*s/n, m = Math.ceil(d.w);
          for(let y=Math.floor(py)-m;y<=Math.ceil(py)+m;y++) for(let x=Math.floor(px)-m;x<=Math.ceil(px)+m;x++)
            if(!dehorsCarte(x,y)&&Math.hypot(x-px,y-py)<=d.w) sol[id(x,y)] = TYPES[d.t];
        }
      }
    }
    return sol;
  }

  function creer(ville, seed){
    const r = rng(seed), sol = terrain(ville);
    const [cx,cy] = ville.centre;
    const J = {
      L, H, ville, sol, liens:new Map(), batiments:new Map(), empreinte:new Map(), maisons:[], dests:[], voitures:[],
      jonctions:new Map(), occupes:new Map(),
      total:{routes:ville.routes, ponts:ville.ponts, tunnels:ville.tunnels, ronds:0, feux:0, autoroutes:0},
      utilise:{routes:0, ponts:0, tunnels:0, ronds:0, feux:0, autoroutes:0},
      zone:{x1:Math.max(0,cx-9), y1:Math.max(0,cy-6), x2:Math.min(L-1,cx+8), y2:Math.min(H-1,cy+5)},
      score:0, temps:0, semaine:1, couleurs:0, nbDests:0, prochaineDest:50/ville.rythme, prochaineMaison:22,
      prochaineSemaine:SEMAINE, choix:null, fini:false, perdant:null, sale:true, dernierEnvoi:0, centres:[]
    };
    const dansZone = c => {const x = X(c), y = Y(c), z = J.zone; return x>=z.x1&&x<=z.x2&&y>=z.y1&&y<=z.y2};

    /* ---------- Bâtiments ---------- */
    function libre(c){
      return !dehorsCarte(X(c),Y(c))&&sol[c]===HERBE&&!J.liens.has(c)&&!J.empreinte.has(c)&&dansZone(c);
    }
    /* Un bâtiment doit garder au moins une case accessible autour de lui */
    function accessible(c, cases){
      return DIRS.slice(0,4).some(([dx,dy])=>{
        const x = X(c)+dx, y = Y(c)+dy;
        if(dehorsCarte(x,y)) return false;
        const v = id(x,y);
        return !cases.includes(v)&&dansZone(v)&&!J.empreinte.has(v)&&sol[v]!==EAU&&sol[v]!==MONT;
      });
    }
    /* Cherche une place près de "autour", en s'écartant peu à peu */
    function chercher(autour, taille){
      for(let essai=0;essai<500;essai++){
        const rayon = 3+essai/30;
        const x = Math.round(autour[0]+(r()*2-1)*rayon), y = Math.round(autour[1]+(r()*2-1)*rayon);
        if(dehorsCarte(x,y)||dehorsCarte(x+taille-1,y+taille-1)) continue;
        const cases = [];
        for(let j=0;j<taille;j++) for(let i=0;i<taille;i++) cases.push(id(x+i,y+j));
        if(!cases.every(libre)) continue;
        if(cases.some(c=>[...J.empreinte.keys()].some(e=>Math.hypot(X(e)-X(c),Y(e)-Y(c))<2.1))) continue;
        const noeud = cases[r()*cases.length|0];
        if(!cases.some(c=>accessible(c,cases))) continue;
        return {cases,noeud};
      }
      return null;
    }
    function ajouterMaison(couleur){
      const p = chercher(J.centres[couleur],1);
      if(!p) return null;
      const m = {type:"maison", couleur, c:p.noeud, cases:p.cases, voitures:2, dehors:0, ne:J.temps};
      J.batiments.set(m.c,m); p.cases.forEach(c=>J.empreinte.set(c,m)); J.maisons.push(m);
      return m;
    }
    function ajouterDest(couleur){
      const p = chercher(J.centres[couleur],2);
      if(!p) return null;
      const d = {type:"dest", couleur, c:p.noeud, cases:p.cases, pins:0, reserves:0, danger:0, places:3, prochain:6+r()*5, ne:J.temps};
      J.batiments.set(d.c,d); p.cases.forEach(c=>J.empreinte.set(c,d)); J.dests.push(d);
      J.nbDests++;
      return d;
    }
    /* Une nouvelle couleur s'installe loin des quartiers existants */
    function nouveauCentre(){
      let top = null, score = -1;
      const z = J.zone;
      for(let i=0;i<30;i++){
        const x = z.x1+2+r()*(z.x2-z.x1-4), y = z.y1+2+r()*(z.y2-z.y1-4);
        if(sol[id(x|0,y|0)]!==HERBE) continue;
        const d = J.centres.length?Math.min(...J.centres.map(c=>Math.hypot(c[0]-x,c[1]-y))):1;
        if(d>score){score = d;top = [x,y]}
      }
      return top||[ville.centre[0],ville.centre[1]];
    }
    function besoinCouleur(){
      let top = 0, pire = -1;
      for(let k=0;k<J.couleurs;k++){
        const d = J.dests.filter(x=>x.couleur===k).length, m = J.maisons.filter(x=>x.couleur===k).length;
        const b = (d+1)/(m+1);
        if(b>pire){pire = b;top = k}
      }
      return top;
    }
    function nouvelleDest(){
      let couleur;
      if(J.couleurs<NB_COULEURS&&J.nbDests>=DEST_NOUVELLE_COULEUR[J.couleurs]){
        couleur = J.couleurs++;
        J.centres[couleur] = nouveauCentre();
      }else couleur = r()*J.couleurs|0;
      if(ajouterDest(couleur)){ ajouterMaison(couleur); ajouterMaison(couleur); }
    }
    nouvelleDest();

    /* ---------- Réseau ---------- */
    function compter(){
      const u = {routes:0,ponts:0,tunnels:0,ronds:0,feux:0,autoroutes:0,spanMax:0};
      const vus = new Set();
      for(const [c,l] of J.liens){
        for(const [v,t] of l) if(t==="a"&&c<v) u.autoroutes++;
        if(J.batiments.has(c)||![...l.values()].includes("r")) continue;
        if(sol[c]===EAU||sol[c]===MONT){
          if(vus.has(c)) continue;
          // un pont ou un tunnel : un seul tronçon d'un seul tenant
          const f = [c]; vus.add(c);
          for(let i=0;i<f.length;i++) for(const [v,t] of J.liens.get(f[i])){
            if(t==="r"&&sol[v]===sol[c]&&!vus.has(v)){vus.add(v);f.push(v)}
          }
          if(sol[c]===EAU) u.ponts++; else u.tunnels++;
          u.spanMax = Math.max(u.spanMax,f.length);
        }else u.routes++;
      }
      for(const t of J.jonctions.values()) u[t==="rond"?"ronds":"feux"]++;
      return u;
    }
    function depasse(u){
      if(u.spanMax>PORTEE_SPAN) return "Ce pont ou ce tunnel serait trop long.";
      for(const [k,nom] of [["routes","Plus de routes"],["ponts","Plus de ponts"],["tunnels","Plus de tunnels"],["autoroutes","Plus d'autoroutes"]])
        if(u[k]>J.total[k]) return nom+" !";
      return null;
    }
    function croise(a,b){
      const dx = X(b)-X(a), dy = Y(b)-Y(a);
      if(!dx||!dy) return false;
      const c1 = id(X(a)+dx,Y(a)), c2 = id(X(a),Y(a)+dy), l = J.liens.get(c1);
      return !!(l&&l.get(c2)==="r");
    }
    function poser(a,b,t){
      if(!J.liens.has(a)) J.liens.set(a,new Map());
      if(!J.liens.has(b)) J.liens.set(b,new Map());
      J.liens.get(a).set(b,t); J.liens.get(b).set(a,t);
    }
    function retirer(a,b){
      const la = J.liens.get(a), lb = J.liens.get(b);
      if(la){la.delete(b);if(!la.size){J.liens.delete(a);J.jonctions.delete(a)}}
      if(lb){lb.delete(a);if(!lb.size){J.liens.delete(b);J.jonctions.delete(b)}}
    }
    /* Vrai si c'est posé, sinon le texte qui explique le refus (ou "" si rien à dire) */
    function relier(a,b){
      const ea = J.empreinte.get(a), eb = J.empreinte.get(b);
      if(a===b||(ea&&eb)) return "";
      // un bâtiment se branche par n'importe quel côté, sur son point d'entrée
      const pres = (c,e) => e.cases.some(k=>Math.max(Math.abs(X(k)-X(c)),Math.abs(Y(k)-Y(c)))===1);
      if(ea?!pres(b,ea):eb?!pres(a,eb):Math.max(Math.abs(X(a)-X(b)),Math.abs(Y(a)-Y(b)))!==1) return "";
      const A = ea?ea.c:a, B = eb?eb.c:b;
      if(J.liens.get(A)&&J.liens.get(A).has(B)) return true;
      if(!dansZone(a)||!dansZone(b)) return "";
      if(!ea&&!eb&&croise(a,b)) return "";
      // une seule route par destination : c'est ce qui crée les files d'attente
      const dest = [ea,eb].find(e=>e&&e.type==="dest");
      if(dest&&J.liens.has(dest.c)) return "Cette destination a déjà sa route : branche-toi dessus.";
      poser(A,B,"r");
      const u = compter(), refus = depasse(u);
      if(refus){retirer(A,B);return refus}
      J.utilise = u; J.sale = true;
      return true;
    }
    function autoroute(a,b){
      if(a===b||J.liens.get(a)&&J.liens.get(a).has(b)) return "";
      if(!dansZone(a)||!dansZone(b)) return "";
      if(!J.liens.has(a)||!J.liens.has(b)||J.batiments.has(a)||J.batiments.has(b)) return "Une autoroute relie deux routes existantes.";
      if(longueur(a,b)>LONG_AUTOROUTE) return "Cette autoroute serait trop longue.";
      if(longueur(a,b)<2) return "";
      poser(a,b,"a");
      const u = compter(), refus = depasse(u);
      if(refus){retirer(a,b);return refus}
      J.utilise = u; J.sale = true;
      return true;
    }
    function jonction(c,t){
      if(!J.liens.has(c)||J.batiments.has(c)) return "Pose-le sur une route.";
      if(J.jonctions.get(c)===t){J.jonctions.delete(c);J.utilise = compter();J.sale = true;return true}
      const k = t==="rond"?"ronds":"feux";
      if(J.utilise[k]>=J.total[k]&&J.jonctions.get(c)!==t) return t==="rond"?"Plus de ronds-points !":"Plus de feux !";
      J.jonctions.set(c,t);
      J.utilise = compter(); J.sale = true;
      return true;
    }
    function effacer(c){
      const e = J.empreinte.get(c);
      if(e) c = e.c;
      const l = J.liens.get(c);
      if(!l) return false;
      for(const v of [...l.keys()]) retirer(c,v);
      J.jonctions.delete(c);
      J.utilise = compter(); J.sale = true;
      return true;
    }
    function routesPretes(){
      for(const seg of ville.routesPretes||[]){
        const [[x1,y1],[x2,y2]] = seg, n = Math.max(Math.abs(x2-x1),Math.abs(y2-y1));
        let a = id(x1,y1);
        for(let s=1;s<=n;s++){
          const b = id(x1+Math.round((x2-x1)*s/n),y1+Math.round((y2-y1)*s/n));
          if(!J.empreinte.has(a)&&!J.empreinte.has(b)) poser(a,b,"r");
          a = b;
        }
      }
      const u = compter();
      J.total.routes += u.routes; J.utilise = u;
    }
    routesPretes();

    /* ---------- Trajets ---------- */
    const estJonction = c => !J.batiments.has(c)&&(J.jonctions.has(c)||(J.liens.get(c)&&J.liens.get(c).size>=3));
    /* Dijkstra depuis "de" : on ne traverse jamais un bâtiment.
       Les carrefours et les routes chargées comptent comme du temps perdu. */
    function plusCourt(de, arret){
      const dist = new Map([[de,0]]), avant = new Map(), tas = [[0,de]];
      const pousser = e => {let i = tas.push(e)-1;while(i){const p = (i-1)>>1;if(tas[p][0]<=tas[i][0])break;[tas[p],tas[i]]=[tas[i],tas[p]];i = p}};
      const sortir = () => {const h = tas[0],f = tas.pop();if(tas.length){tas[0]=f;let i = 0;for(;;){let m = i,a = 2*i+1,b = a+1;if(a<tas.length&&tas[a][0]<tas[m][0])m = a;if(b<tas.length&&tas[b][0]<tas[m][0])m = b;if(m===i)break;[tas[m],tas[i]]=[tas[i],tas[m]];i = m}}return h};
      while(tas.length){
        const [d,c] = sortir();
        if(d>dist.get(c)) continue;
        if(c!==de&&J.batiments.has(c)){ if(arret&&arret(c)) return {dist,avant,fin:c}; continue; }
        const l = J.liens.get(c);
        if(!l) continue;
        for(const [v,t] of l){
          let k = longueur(c,v)/(t==="a"?V_AUTOROUTE:1);
          if(estJonction(v)) k += J.jonctions.has(v)?.3:.9;
          k += (J.trafic.get(c*10000+v)||0)*.5;
          const nd = d+k;
          if(nd<(dist.has(v)?dist.get(v):Infinity)){dist.set(v,nd);avant.set(v,c);pousser([nd,v])}
        }
      }
      return {dist,avant,fin:-1};
    }
    function suivre(res, de, vers){
      if(de===vers) return [de];
      if(!res.dist.has(vers)) return null;
      const p = [vers]; let k = vers;
      while(k!==de){k = res.avant.get(k);p.push(k)}
      return p.reverse();
    }
    function trajet(de, vers){ return suivre(plusCourt(de,c=>c===vers),de,vers); }
    function envoyer(){
      for(const d of J.dests){
        let n = d.pins-d.reserves;
        if(n<=0||!J.liens.has(d.c)) continue;
        for(;n>0;n--){
          // on part de la destination : la première maison libre trouvée est la plus proche
          const res = plusCourt(d.c,c=>{const m = J.batiments.get(c);return m.type==="maison"&&m.couleur===d.couleur&&m.voitures-m.dehors>0});
          if(res.fin<0) break;
          const m = J.batiments.get(res.fin), p = suivre(res,d.c,res.fin).reverse();
          d.reserves++; m.dehors++;
          J.voitures.push({maison:m, dest:d, chemin:p, i:0, t:0, etat:"aller", tient:[], perdu:0, coince:0, attente:0});
        }
      }
    }
    function lacher(v, noeud){
      const s = J.occupes.get(noeud);
      if(s) s.delete(v);
      v.tient = v.tient.filter(x=>x.noeud!==noeud);
    }
    function rentrer(v){
      if(v.etat==="aller") v.dest.reserves--;
      for(const x of [...v.tient]) lacher(v,x.noeud);
      v.maison.dehors--;
      J.voitures.splice(J.voitures.indexOf(v),1);
    }
    function rerouter(){
      for(const v of [...J.voitures]){
        if(v.etat==="gare") continue;
        const cible = v.etat==="retour"?v.maison.c:v.dest.c;
        const de = v.chemin[v.i], vers = v.chemin[v.i+1];
        const encore = vers!=null&&J.liens.get(de)&&J.liens.get(de).has(vers);
        const depart = encore?vers:de;
        const p = J.liens.has(depart)?trajet(depart,cible):null;
        if(!p){v.chemin = [de];v.i = 0;v.t = 0;v.perdu = v.perdu||.001;continue}
        v.perdu = 0;
        for(const x of [...v.tient]) if(!(J.batiments.has(x.noeud)&&x.noeud===cible)) lacher(v,x.noeud);
        if(encore){v.chemin = [de,...p];v.i = 0}
        else{v.chemin = p;v.i = 0;v.t = 0}
      }
    }

    /* ---------- Circulation ---------- */
    const CAPACITE = {carrefour:1, feu:2, rond:4};
    function typeJonction(c){ return J.jonctions.get(c)==="rond"?"rond":J.jonctions.get(c)==="feu"?"feu":"carrefour"; }
    const phaseFeu = c => Math.floor((J.temps+(c%7)*.37)/3)%2;
    const axe = (a,b) => Math.abs(X(a)-X(b))>=Math.abs(Y(a)-Y(b))?0:1;
    function peutEntrer(v, noeud, depuis){
      const s = J.occupes.get(noeud), n = s?s.size:0;
      const b = J.batiments.get(noeud);
      if(b) return b.type==="dest"?n<b.places:true;
      const t = typeJonction(noeud);
      if(t==="feu"&&phaseFeu(noeud)!==axe(depuis,noeud)) return false;
      return n<CAPACITE[t];
    }
    function bloque(v, seg, lon){
      const de = v.chemin[v.i], vers = v.chemin[v.i+1];
      const devant = seg.get(de*10000+vers);
      if(devant) for(const o of devant){
        if(o!==v&&o.t>v.t&&(o.t-v.t)*lon<ECART) return true;
      }
      const apres = v.chemin[v.i+2];
      if(apres!=null&&!J.batiments.has(vers)){
        const suite = seg.get(vers*10000+apres);
        if(suite) for(const o of suite){
          if((1-v.t)*lon+o.t*longueur(vers,apres)<ECART) return true;
        }
      }
      return false;
    }
    function rouler(v, dt, seg){
      if(v.etat==="gare"){
        v.attente -= dt;
        if(v.attente>0) return;
        const p = trajet(v.dest.c,v.maison.c);
        v.etat = "retour"; v.chemin = p||[v.dest.c]; v.i = 0; v.t = 0; v.perdu = p?0:.001;
        v.tient.forEach(x=>{if(x.noeud===v.dest.c)x.sortie = 0});
        return;
      }
      if(v.perdu){
        v.perdu += dt;
        if(v.perdu>PERDU) rentrer(v);
        else{
          const cible = v.etat==="retour"?v.maison.c:v.dest.c, de = v.chemin[v.i];
          const p = J.liens.has(de)?trajet(de,cible):null;
          if(p){v.chemin = p;v.i = 0;v.t = 0;v.perdu = 0}
        }
        return;
      }
      if(v.i>=v.chemin.length-1){ arriver(v); return; }
      const de = v.chemin[v.i], vers = v.chemin[v.i+1], lon = longueur(de,vers);
      const type = J.liens.get(de)&&J.liens.get(de).get(vers);
      // on libère les carrefours déjà franchis
      for(const x of [...v.tient]) if(v.i>x.sortie||(v.i===x.sortie&&v.t*lon>ZONE_VERROU)) lacher(v,x.noeud);
      let stop = bloque(v,seg,lon);
      const veutVerrou = (estJonction(vers)||J.batiments.get(vers)&&J.batiments.get(vers).type==="dest")&&!v.tient.some(x=>x.noeud===vers);
      if(veutVerrou&&(1-v.t)*lon<ZONE_VERROU+.1){
        if(peutEntrer(v,vers,de)){
          if(!J.occupes.has(vers)) J.occupes.set(vers,new Set());
          J.occupes.get(vers).add(v);
          v.tient.push({noeud:vers, sortie:J.batiments.has(vers)?Infinity:v.i+1});
        }else stop = true;
      }
      if(stop&&v.coince<COINCE){v.coince += dt;return}
      if(!stop) v.coince = 0;
      else{ v.coince = COINCE-.8; }
      v.t += (type==="a"?V*V_AUTOROUTE:V)*dt/lon;
      if(v.t>=1){v.t = 0;v.i++}
    }
    function arriver(v){
      if(v.etat==="aller"){
        v.dest.pins--; v.dest.reserves--;
        J.score++;
        v.etat = "gare"; v.attente = GARE;
      }else{
        for(const x of [...v.tient]) lacher(v,x.noeud);
        v.maison.dehors--;
        J.voitures.splice(J.voitures.indexOf(v),1);
      }
    }

    /* ---------- Semaines ---------- */
    function grandir(){
      const z = J.zone;
      z.x1 = Math.max(0,z.x1-2); z.x2 = Math.min(L-1,z.x2+2);
      z.y1 = Math.max(0,z.y1-1); z.y2 = Math.min(H-1,z.y2+1);
    }
    function semaineSuivante(){
      J.semaine++;
      J.total.routes += 14;
      if(J.semaine%3===0) J.total.ponts++;
      grandir();
      const lot = [...CARTES].sort(()=>r()-.5);
      J.choix = lot.slice(0,2);
    }
    function choisir(id){
      if(id==="routes") J.total.routes += 30;
      else if(id==="autoroutes") J.total.autoroutes += 1;
      else J.total[id] += 2;
      J.choix = null;
    }

    /* ---------- Avancée du temps ---------- */
    J.trafic = new Map();
    function avance(dt){
      if(J.fini||J.choix) return;
      J.temps += dt;
      const seg = new Map();
      for(const v of J.voitures){
        const de = v.chemin[v.i], vers = v.chemin[v.i+1];
        if(vers==null) continue;
        const k = de*10000+vers;
        if(!seg.has(k)) seg.set(k,[]);
        seg.get(k).push(v);
      }
      J.trafic = new Map([...seg].map(([k,l])=>[k,l.length]));
      if(J.sale){rerouter();J.sale = false}
      const rythme = ville.rythme;
      for(const d of J.dests){
        d.prochain -= dt;
        if(d.prochain<=0){
          d.pins++;
          // la demande monte sans arrêt : c'est elle qui finit par saturer le réseau
          const pause = Math.max(1.7,15-J.temps/50)/rythme;
          d.prochain = pause*(.7+r()*.6);
        }
        if(d.pins>=ALERTE) d.danger = Math.min(1,d.danger+dt/DANGER);
        else d.danger = Math.max(0,d.danger-dt/RETOMBE);
        if(d.danger>=1&&!J.fini){J.fini = true;J.perdant = d}
      }
      if(J.temps-J.dernierEnvoi>.33){envoyer();J.dernierEnvoi = J.temps}
      for(const v of [...J.voitures]) rouler(v,dt,seg);
      if(J.temps>=J.prochaineDest){
        nouvelleDest();
        J.prochaineDest = J.temps+Math.max(32,75-J.temps/10)/rythme;
      }
      if(J.temps>=J.prochaineMaison){
        ajouterMaison(besoinCouleur());
        J.prochaineMaison = J.temps+Math.max(14,30-J.temps/30)/rythme;
      }
      if(J.temps>=J.prochaineSemaine){
        J.prochaineSemaine += SEMAINE;
        semaineSuivante();
      }
    }

    return Object.assign(J,{relier,autoroute,jonction,effacer,avance,choisir,estJonction,typeJonction,phaseFeu,axe,dansZone,trajet,HERBE,EAU,MONT,PARC,ALERTE,V,DIRS});
  }

  window.RocadeMoteur = {creer, terrain, L, H, id, X, Y};
})();
