/* ============================================================
   SENTIERS : règles du jeu, sans aucun dessin
   Grille de L×H cases. Les cases sont numérotées y*L+x.
   - les arbres produisent des fruits d'une couleur ;
   - un animal d'un terrier de cette couleur vient les chercher
     par les sentiers tracés par le joueur ;
   - un arbre trop chargé se met à trembler, et s'il le reste
     trop longtemps la partie est finie.
   ============================================================ */
(function(){
  const L = 18, H = 12;
  const HERBE = 0, EAU = 1, ROCHER = 2;
  const SAISON = 60, ALERTE = 7, DANGER = 40, RETOMBE = 15;
  const VITESSE = 2.6, ECART = .42, CUEILLE = .7, REPOS = .5, PERDU = 3;
  const DEBUT_COULEURS = [0, 45, 150, 300, 480];
  const CARTES = [
    {id:"dalles", titre:"Sentiers", emoji:"🧱", texte:"20 dalles de sentier en plus."},
    {id:"ponts", titre:"Passerelles", emoji:"🌉", texte:"2 passerelles pour franchir l'eau."},
    {id:"bottes", titre:"Bottes", emoji:"🥾", texte:"Tous les animaux marchent 12 % plus vite."},
    {id:"terriers", titre:"Grand terrier", emoji:"🕳️", texte:"Un animal de plus dans chaque terrier."}
  ];

  function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  const X = c => c%L, Y = c => c/L|0;
  const voisins = c => {
    const v = [], x = X(c), y = Y(c);
    if(x>0) v.push(c-1); if(x<L-1) v.push(c+1);
    if(y>0) v.push(c-L); if(y<H-1) v.push(c+L);
    return v;
  };
  const distance = (a,b) => Math.abs(X(a)-X(b))+Math.abs(Y(a)-Y(b));

  function creer(seed){
    const r = rng(seed), sol = new Uint8Array(L*H);

    /* Une rivière traverse la carte de haut en bas, en serpentant */
    let rx = (r()<.5?5:12)+(r()*2|0);
    for(let y=0;y<H;y++){
      sol[y*L+rx] = EAU;
      if(y<H-1&&r()<.45){
        const nx = Math.min(L-3,Math.max(2,rx+(r()<.5?-1:1)));
        sol[y*L+nx] = EAU; rx = nx;
      }
    }
    for(let n=0;n<8;){
      const c = r()*L*H|0;
      if(!sol[c]){sol[c] = ROCHER;n++}
    }

    const J = {
      L, H, sol, liens:new Map(), batiments:new Map(), terriers:[], arbres:[], animaux:[],
      dalles:30, ponts:2, vitesse:VITESSE, capacite:2, score:0, temps:0, saison:1,
      couleurs:0, prochainTerrier:50, prochainArbre:30, prochaineSaison:SAISON,
      choix:null, fini:false, perdant:null, sale:false, decompte:0
    };
    const estChemin = c => J.liens.has(c);
    const animalLibre = t => t.animaux-t.dehors>0;

    /* ---------- Apparition des bâtiments ---------- */
    function placeLibre(portee){
      const centre = (H/2|0)*L+(L/2|0);
      for(let essai=0;essai<400;essai++){
        const c = r()*L*H|0;
        if(sol[c]||estChemin(c)||J.batiments.has(c)||distance(c,centre)>portee+essai/20) continue;
        if([...J.batiments.keys()].some(b=>distance(b,c)<3)) continue;
        if(!voisins(c).some(v=>!sol[v]&&!J.batiments.has(v))) continue;
        return c;
      }
      return -1;
    }
    const portee = () => 5+J.temps/25;
    function ajouterTerrier(couleur){
      const c = placeLibre(portee());
      if(c<0) return;
      const t = {type:"terrier", c, couleur, animaux:J.capacite, dehors:0, ne:J.temps};
      J.batiments.set(c,t); J.terriers.push(t);
    }
    function ajouterArbre(couleur){
      const c = placeLibre(portee());
      if(c<0) return;
      const a = {type:"arbre", c, couleur, fruits:0, reserves:0, danger:0, prochain:4+r()*6, ne:J.temps};
      J.batiments.set(c,a); J.arbres.push(a);
    }
    function nouvelleCouleur(){
      const n = J.couleurs++;
      ajouterArbre(n); ajouterTerrier(n);
      if(n===0) ajouterTerrier(n);
    }
    nouvelleCouleur();

    /* ---------- Tracé ---------- */
    /* Une case de sentier coûte une dalle, ou une passerelle sur l'eau */
    function payer(c){
      if(J.batiments.has(c)||estChemin(c)) return true;
      if(sol[c]===ROCHER) return false;
      if(sol[c]===EAU){ if(J.ponts<1) return false; J.ponts--; }
      else{ if(J.dalles<1) return false; J.dalles--; }
      return true;
    }
    function rembourser(c){ if(sol[c]===EAU) J.ponts++; else J.dalles++; }
    function relier(a,b){
      if(!voisins(a).includes(b)||(J.batiments.has(a)&&J.batiments.has(b))) return false;
      if(J.liens.get(a)&&J.liens.get(a).has(b)) return true;
      const aNeuf = !J.batiments.has(a)&&!estChemin(a);
      if(!payer(a)) return false;
      if(!payer(b)){ if(aNeuf) rembourser(a); return false; }
      if(!J.liens.has(a)) J.liens.set(a,new Set());
      if(!J.liens.has(b)) J.liens.set(b,new Set());
      J.liens.get(a).add(b); J.liens.get(b).add(a);
      J.sale = true;
      return true;
    }
    function effacer(c){
      const l = J.liens.get(c);
      if(!l) return false;
      for(const v of l){
        const lv = J.liens.get(v);
        lv.delete(c);
        if(!lv.size){ J.liens.delete(v); if(!J.batiments.has(v)) rembourser(v); }
      }
      J.liens.delete(c);
      if(!J.batiments.has(c)) rembourser(c);
      J.sale = true;
      return true;
    }

    /* ---------- Trajets ---------- */
    /* On ne traverse jamais un bâtiment : il ne sert que de départ ou d'arrivée */
    function chemin(de, vers){
      if(de===vers) return [de];
      const avant = new Map([[de,-1]]), file = [de];
      for(let i=0;i<file.length;i++){
        const c = file[i], l = J.liens.get(c);
        if(!l) continue;
        for(const v of l){
          if(avant.has(v)) continue;
          avant.set(v,c);
          if(v===vers){
            const p = [v]; let k = c;
            while(k!==-1){p.push(k);k = avant.get(k)}
            return p.reverse();
          }
          if(!J.batiments.has(v)) file.push(v);
        }
      }
      return null;
    }
    function envoyer(){
      for(const a of J.arbres){
        while(a.fruits-a.reserves>0){
          let top = null, p = null;
          for(const t of J.terriers){
            if(t.couleur!==a.couleur||!animalLibre(t)) continue;
            const q = chemin(t.c,a.c);
            if(q&&(!p||q.length<p.length)){top = t;p = q}
          }
          if(!top) break;
          a.reserves++; top.dehors++;
          J.animaux.push({terrier:top, arbre:a, chemin:p, i:0, t:0, etat:"aller", attente:0, perdu:0});
        }
      }
    }
    function rentrerDirect(n){
      if(n.etat==="aller") n.arbre.reserves--;
      n.terrier.dehors--;
      J.animaux.splice(J.animaux.indexOf(n),1);
    }
    /* Le réseau a changé : chacun recalcule sa route depuis sa position */
    function rerouter(){
      for(const n of [...J.animaux]){
        const dest = n.etat==="retour"?n.terrier.c:n.arbre.c;
        if(n.etat==="cueille") continue;
        const de = n.chemin[n.i], vers = n.chemin[n.i+1];
        const suite = vers!=null&&J.liens.get(de)&&J.liens.get(de).has(vers);
        const depart = suite?vers:de;
        const p = J.liens.has(depart)?chemin(depart,dest):null;
        if(!p){n.chemin = [de];n.i = 0;n.t = 0;n.perdu = n.perdu||.001;continue}
        n.perdu = 0;
        // on finit la case en cours avant de suivre le nouveau trajet
        if(suite){n.chemin = [de,...p];n.i = 0}
        else{n.chemin = p;n.i = 0;n.t = 0}
      }
    }

    /* ---------- Déplacements ---------- */
    function bloque(n){
      const de = n.chemin[n.i], vers = n.chemin[n.i+1];
      for(const o of J.animaux){
        if(o===n||o.etat==="cueille") continue;
        const ode = o.chemin[o.i], over = o.chemin[o.i+1];
        if(ode===de&&over===vers&&o.t>n.t&&o.t-n.t<ECART) return true;
        const apres = n.chemin[n.i+2];
        if(apres!=null&&ode===vers&&over===apres&&1-n.t+o.t<ECART) return true;
      }
      return false;
    }
    function avancer(n, dt){
      if(n.etat==="cueille"){
        n.attente -= dt;
        if(n.attente<=0){
          n.etat = "retour";
          const p = chemin(n.arbre.c,n.terrier.c);
          n.chemin = p||[n.arbre.c]; n.i = 0; n.t = 0;
          n.perdu = p?0:.001;
        }
        return;
      }
      if(n.perdu){
        n.perdu += dt;
        if(n.perdu>PERDU) rentrerDirect(n);
        else if(J.temps-J.decompte>.3) rerouterUn(n);
        return;
      }
      if(n.i>=n.chemin.length-1){ arrivee(n); return; }
      if(bloque(n)) return;
      n.t += J.vitesse*dt;
      if(n.t>=1){n.t = 0;n.i++}
    }
    function rerouterUn(n){
      const dest = n.etat==="retour"?n.terrier.c:n.arbre.c;
      const de = n.chemin[n.i], p = J.liens.has(de)?chemin(de,dest):null;
      if(p){n.chemin = p;n.i = 0;n.t = 0;n.perdu = 0}
    }
    function arrivee(n){
      if(n.etat==="aller"){
        n.arbre.fruits--; n.arbre.reserves--;
        n.etat = "cueille"; n.attente = CUEILLE;
      }else{
        J.score++;
        n.terrier.dehors--;
        J.animaux.splice(J.animaux.indexOf(n),1);
      }
    }

    /* ---------- Avancée du temps ---------- */
    function saisonSuivante(){
      J.saison++;
      J.dalles += 8;
      if(J.saison%2===0) J.ponts++;
      const melange = [...CARTES].sort(()=>r()-.5);
      J.choix = melange.slice(0,2);
    }
    function choisir(id){
      if(id==="dalles") J.dalles += 20;
      else if(id==="ponts") J.ponts += 2;
      else if(id==="bottes") J.vitesse *= 1.12;
      else if(id==="terriers"){J.capacite++;J.terriers.forEach(t=>t.animaux++)}
      J.choix = null;
    }
    function avance(dt){
      if(J.fini||J.choix) return;
      J.temps += dt;
      if(J.sale){rerouter();J.sale = false}
      for(const a of J.arbres){
        a.prochain -= dt;
        if(a.prochain<=0){
          a.fruits++;
          // la cadence monte avec le temps, jusqu'à saturer le réseau
          const pause = Math.max(1.2,16-J.temps/40);
          a.prochain = pause*(.7+r()*.6);
        }
        if(a.fruits>=ALERTE) a.danger = Math.min(1,a.danger+dt/DANGER);
        else a.danger = Math.max(0,a.danger-dt/RETOMBE);
        if(a.danger>=1&&!J.fini){J.fini = true;J.perdant = a}
      }
      if(J.temps-J.decompte>.3){envoyer();J.decompte = J.temps}
      for(const n of [...J.animaux]) avancer(n,dt);

      while(J.couleurs<DEBUT_COULEURS.length&&J.temps>=DEBUT_COULEURS[J.couleurs]) nouvelleCouleur();
      if(J.temps>=J.prochainArbre){
        ajouterArbre(r()*J.couleurs|0);
        J.prochainArbre = J.temps+Math.max(32,55-J.temps/20);
      }
      if(J.temps>=J.prochainTerrier){
        // le nouveau terrier va à la couleur la plus en retard
        let top = 0, pire = -1;
        for(let k=0;k<J.couleurs;k++){
          const f = J.arbres.filter(a=>a.couleur===k).length, t = J.terriers.filter(z=>z.couleur===k).length;
          const besoin = f/(t||.5);
          if(besoin>pire){pire = besoin;top = k}
        }
        ajouterTerrier(top);
        J.prochainTerrier = J.temps+Math.max(36,60-J.temps/20);
      }
      if(J.temps>=J.prochaineSaison){
        J.prochaineSaison += SAISON;
        saisonSuivante();
      }
    }

    return Object.assign(J,{relier,effacer,avance,choisir,chemin,voisins,ALERTE,HERBE,EAU,ROCHER});
  }

  window.SentiersMoteur = {creer, L, H};
})();
