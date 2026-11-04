/* ============================================================
   SHIKAKU : création des grilles à partir d'une graine
   1. découpe la grille en rectangles au hasard ;
   2. place un nombre dans chaque rectangle ;
   3. tente de résoudre par simple logique. Là où ça bloque, on
      déplace les nombres concernés et on recommence.
   Une grille résolue par logique a une seule solution, et on
   peut la finir sans jamais deviner.
   ============================================================ */
(function(){
  const AIRE_MAX = {5:8, 7:12, 9:12, 11:16, 15:18, 20:20, 25:20};
  const REPARATIONS = 300, PATIENCE = 60;

  function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

  function decouper(n, r){
    const pris = new Uint8Array(n*n), rects = [], max = AIRE_MAX[n];
    for(let y=0;y<n;y++) for(let x=0;x<n;x++){
      if(pris[y*n+x]) continue;
      const options = [];
      for(let h=1;y+h<=n;h++){
        for(let w=1;x+w<=n&&w*h<=max;w++){
          let libre = true;
          for(let j=0;j<h&&libre;j++) if(pris[(y+j)*n+x+w-1]) libre = false;
          if(!libre) break;
          // les grands rectangles sont plus souvent choisis, les cases seules restent rares
          if(w*h>1) for(let p=0;p<w*h;p++) options.push([w,h]);
        }
      }
      const [w,h] = options.length ? options[r()*options.length|0] : [1,1];
      for(let j=0;j<h;j++) for(let i=0;i<w;i++) pris[(y+j)*n+x+i] = 1;
      rects.push({x,y,w,h});
    }
    return rects;
  }

  /* Toutes les places possibles de chaque nombre, sans toucher un autre nombre */
  function placesDe(n, indices){
    const estIndice = new Uint8Array(n*n);
    indices.forEach(c => estIndice[c.y*n+c.x] = 1);
    return indices.map(c => {
      const liste = [];
      for(let h=1;h<=c.a&&h<=n;h++){
        if(c.a%h) continue;
        const w = c.a/h; if(w>n) continue;
        for(let y=Math.max(0,c.y-h+1);y<=c.y&&y+h<=n;y++) for(let x=Math.max(0,c.x-w+1);x<=c.x&&x+w<=n;x++){
          const cs = []; let ok = true;
          for(let j=0;j<h&&ok;j++) for(let i=0;i<w;i++){
            const k = (y+j)*n+x+i;
            if(estIndice[k]&&!(x+i===c.x&&y+j===c.y)){ok=false;break}
            cs.push(k);
          }
          if(ok) liste.push(cs);
        }
      }
      return liste;
    });
  }

  /* Résolution par logique seule. Renvoie les nombres dont le rectangle reste indécis.
     - une case présente dans toutes les places d'un nombre lui appartient ;
     - une case qu'un seul nombre peut atteindre lui appartient. */
  function bloques(n, indices){
    const places = placesDe(n, indices), proprio = new Int16Array(n*n).fill(-1);
    const marque = new Int32Array(n*n).fill(-1), compte = new Int32Array(n*n);
    const atteint = new Int32Array(n*n), dernier = new Int32Array(n*n);
    indices.forEach((c,i) => proprio[c.y*n+c.x] = i);
    let change = true;
    while(change){
      change = false;
      atteint.fill(0);
      for(let i=0;i<places.length;i++){
        const avant = places[i].length;
        let attribuees = 0;
        for(let k=0;k<n*n;k++) if(proprio[k]===i) attribuees++;
        places[i] = places[i].filter(cs => {
          let miens = 0;
          for(const k of cs){ if(proprio[k]===i) miens++; else if(proprio[k]>=0) return false; }
          return miens===attribuees;
        });
        if(places[i].length!==avant) change = true;
        compte.fill(0);
        for(const cs of places[i]) for(const k of cs){
          if(marque[k]!==i){marque[k]=i;atteint[k]++;dernier[k]=i}
          compte[k]++;
        }
        for(const cs of places[i].slice(0,1)) for(const k of cs)
          if(compte[k]===places[i].length&&proprio[k]!==i){proprio[k]=i;change=true}
      }
      for(let k=0;k<n*n;k++) if(proprio[k]<0&&atteint[k]===1){proprio[k]=dernier[k];change=true}
      marque.fill(-1);
    }
    const reste = [];
    places.forEach((p,i) => { if(p.length!==1) reste.push(i); });
    return reste;
  }

  const placer = (q, r) => ({x:q.x+(r()*q.w|0), y:q.y+(r()*q.h|0), a:q.w*q.h});

  function generer(n, seed){
    const r = rng(seed);
    for(;;){
      const rects = decouper(n, r);
      let indices = rects.map(q => placer(q, r));
      let reste = bloques(n, indices), calme = 0;
      for(let e=0;reste.length&&e<REPARATIONS&&calme<PATIENCE;e++){
        const essai = indices.slice();
        reste.forEach(i => essai[i] = placer(rects[i], r));
        const apres = bloques(n, essai);
        if(apres.length<reste.length) calme = 0; else calme++;
        if(apres.length<=reste.length){indices = essai; reste = apres}
      }
      if(!reste.length) return {n, indices, solution:rects};
    }
  }

  window.ShikakuGen = {generer, bloques, TAILLES:[5,7,9,11,15,20,25]};
})();
