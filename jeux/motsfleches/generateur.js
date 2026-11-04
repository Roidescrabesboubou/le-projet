/* ============================================================
   MOTS FLÉCHÉS : création des grilles à partir d'une graine
   Les mots sont posés un à un en se croisant. Chaque mot reçoit
   une case définition juste avant sa première lettre : à gauche
   ou au-dessus, avec une flèche droite ou coudée. Une case porte
   au plus deux définitions.
   On garde la grille la mieux remplie parmi plusieurs essais.
   ============================================================ */
(function(){
  const ESSAIS = 20, CANDIDATS = 70, LONGUEUR_DEF = 30;

  function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  function melange(a,r){a=[...a];for(let i=a.length-1;i>0;i--){const j=r()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}

  function construire(L, H, dico, index, r){
    const n = L*H, lettres = new Array(n).fill(""), defs = new Uint8Array(n);
    const dans = {H:new Uint8Array(n), V:new Uint8Array(n)}, mots = [], places = new Set();
    const id = (x,y) => y*L+x, dedans = (x,y) => x>=0&&y>=0&&x<L&&y<H;
    const lettre = (x,y) => dedans(x,y)&&lettres[id(x,y)];
    const sensDe = {H:[1,0], V:[0,1]};

    /* Case définition d'un mot : on préfère une case encore vide */
    function caseDef(m){
      const gauche = {x:m.x-1, y:m.y, coude:m.d==="V"}, haut = {x:m.x, y:m.y-1, coude:m.d==="H"};
      const opts = (m.d==="H"?[gauche,haut]:[haut,gauche])
        .filter(c => dedans(c.x,c.y)&&!lettres[id(c.x,c.y)]&&defs[id(c.x,c.y)]<2);
      if(r()<.25) opts.reverse();
      return opts.find(c => !defs[id(c.x,c.y)])||opts[0]||null;
    }

    /* Pose le mot si la grille reste correcte. Toute suite d'au moins deux
       lettres créée au passage doit être elle-même un mot du dictionnaire. */
    function poser(w, x, y, d, premier){
      const [dx,dy] = sensDe[d], [px,py] = [dy,dx], autre = d==="H"?"V":"H";
      const X2 = x+dx*(w.mot.length-1), Y2 = y+dy*(w.mot.length-1);
      if(!dedans(x,y)||!dedans(X2,Y2)||lettre(x-dx,y-dy)||lettre(X2+dx,Y2+dy)) return null;
      const neufs = []; let croise = 0;
      for(let p=0;p<w.mot.length;p++){
        const k = id(x+dx*p,y+dy*p);
        if(defs[k]) return null;
        if(lettres[k]){ if(lettres[k]!==w.mot[p]||dans[d][k]) return null; croise++; }
        else neufs.push(p);
      }
      if(!neufs.length||(!croise&&!premier)) return null;
      const aPoser = [{mot:w.mot, def:w.def, x, y, d}];
      for(const p of neufs) lettres[id(x+dx*p,y+dy*p)] = w.mot[p];
      let ok = true;
      for(const p of neufs){
        let a = x+dx*p, b = y+dy*p;
        while(lettre(a-px,b-py)){a-=px;b-=py}
        let s = "", u = a, v = b, prolonge = false;
        while(lettre(u,v)){ s += lettres[id(u,v)]; if(dans[autre][id(u,v)]) prolonge = true; u+=px;v+=py }
        if(s.length<2) continue;
        const def = index.get(s);
        if(prolonge||!def||places.has(s)||aPoser.some(m=>m.mot===s)){ok=false;break}
        aPoser.push({mot:s, def, x:a, y:b, d:autre});
      }
      const posees = [];
      if(ok) for(const m of aPoser){
        const c = caseDef(m);
        if(!c){ok=false;break}
        m.cx = c.x; m.cy = c.y; m.coude = c.coude; defs[id(c.x,c.y)]++; posees.push(m);
      }
      if(!ok){
        for(const m of posees) defs[id(m.cx,m.cy)]--;
        for(const p of neufs) lettres[id(x+dx*p,y+dy*p)] = "";
        return null;
      }
      for(const m of aPoser){
        const [ax,ay] = sensDe[m.d];
        for(let p=0;p<m.mot.length;p++) dans[m.d][id(m.x+ax*p,m.y+ay*p)] = 1;
        places.add(m.mot); mots.push(m);
      }
      return aPoser;
    }
    function annuler(pose, avant){
      for(const m of pose) places.delete(m.mot);
      mots.length = avant.mots;
      lettres.splice(0, n, ...avant.lettres); defs.set(avant.defs); dans.H.set(avant.H); dans.V.set(avant.V);
    }
    const instantane = () => ({mots:mots.length, lettres:[...lettres], defs:defs.slice(), H:dans.H.slice(), V:dans.V.slice()});

    const longs = melange(dico.filter(w=>w.mot.length>=Math.min(L,H)-2&&w.mot.length<=Math.max(L,H)-1), r);
    poser(longs[0], 1, 1+(r()*(H-2)|0), "H", true);

    const liste = melange(dico, r);
    let i = 0, vides = 0;
    while(vides<liste.length){
      let top = null;
      for(let vus=0;vus<CANDIDATS;vus++,i=(i+1)%liste.length){
        const w = liste[i];
        if(places.has(w.mot)||(w.mot.length>2&&[...places].some(m=>m.length>2&&(m.includes(w.mot)||w.mot.includes(m))))) continue;
        for(let y=0;y<H;y++) for(let x=0;x<L;x++){
          const l = lettres[id(x,y)];
          if(!l) continue;
          for(const d of ["H","V"]){
            if(dans[d][id(x,y)]) continue;
            for(let p=0;p<w.mot.length;p++){
              if(w.mot[p]!==l) continue;
              const X = d==="H"?x-p:x, Y = d==="V"?y-p:y, av = instantane(), pose = poser(w,X,Y,d);
              if(!pose) continue;
              const pleines = lettres.filter(Boolean).length, score = pleines*2+(pose.length-1)*6+r()*3;
              annuler(pose, av);
              if(!top||score>top.score) top = {score,w,X,Y,d};
            }
          }
        }
      }
      if(top){poser(top.w,top.X,top.Y,top.d);vides=0}
      else vides += CANDIDATS;
    }
    const nbLettres = lettres.filter(Boolean).length;
    let nbVides = 0; for(let k=0;k<n;k++) if(!lettres[k]&&!defs[k]) nbVides++;
    return {L, H, lettres, mots, nbLettres, nbVides};
  }

  function generer(L, H, seed, mots, courts){
    const r = rng(seed);
    const dico = [...mots.filter(w=>w.def.length<=LONGUEUR_DEF&&w.mot.length<=Math.max(L,H)-1), ...courts];
    const index = new Map(dico.map(w=>[w.mot,w.def]));
    let top = null;
    for(let e=0;e<ESSAIS;e++){
      const g = construire(L,H,dico,index,r);
      g.score = g.nbLettres-g.nbVides*2;
      if(!top||g.score>top.score) top = g;
    }
    return top;
  }

  window.FlechesGen = {generer};
})();
