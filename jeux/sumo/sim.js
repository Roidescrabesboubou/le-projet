/* ============================================================
   SUMO : règles et physique, partagées entre le navigateur
   (solo, à deux, ancien mode en ligne par le relais) et le serveur
   Cloudflare (serveur/), qui fait tourner les parties en ligne.
   → globalThis.SumoSim
   Effets (son, secousse, étincelles) : objet fx facultatif passé à maj().
   ============================================================ */
(function(){
  const W = 500, CX = 250, CY = 250, R0 = 215, RMIN = 95, RAYON = 22, ACC = 560, VMAX = 270, DASH = 520, DASH_CD = 2;
  const COULS = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ec4899"];
  const AVS = ["🔴", "🔵", "🟢", "🟠", "🟣", "🩷"];
  const rien = {son(){}, choc(){}};

  function nouvelle(joueurs, cible){
    const S = {ph: "compte", t: 0, tp: 0, R: R0, p: joueurs.map((j, i) => ({id: j.id, nom: j.nom, av: j.av || AVS[i], coul: COULS[i % 6], bot: j.bot || 0, pts: 0, x: CX, y: CY, vx: 0, vy: 0, ax: 0, ay: 0, vivant: true, chute: 0, geant: 0, cd: 0, dashT: 0, veut: false, ia: {t: 0, cible: null}})),
         manche: 1, cible: cible || 3, bonus: null, bonusCd: 6, msg: "", gagnant: null};
    placer(S);
    return S;
  }
  function placer(S){
    const n = S.p.length;
    S.p.forEach((p, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; Object.assign(p, {x: CX + Math.cos(a) * 125, y: CY + Math.sin(a) * 125, vx: 0, vy: 0, vivant: true, chute: 0, geant: 0, cd: .5, dashT: 0, veut: false}); });
    S.R = R0; S.t = 0; S.tp = 0; S.ph = "compte"; S.bonus = null; S.bonusCd = 6; S.gagnant = null;
  }
  const rayon = p => RAYON * (p.geant > 0 ? 1.45 : 1);
  const masse = p => (p.geant > 0 ? 2.2 : 1) * (p.dashT > 0 ? 1.8 : 1);

  // mouvement d'un lutteur selon sa commande (ax, ay) : même calcul pour l'hôte et pour la prédiction de l'invité
  function bouger(p, ax, ay, dt){
    const n = Math.hypot(ax, ay); if(n > 1){ ax /= n; ay /= n; }
    p.vx += ax * ACC * dt; p.vy += ay * ACC * dt;
    const v = Math.hypot(p.vx, p.vy), vm = p.dashT > 0 ? VMAX + DASH : VMAX;
    if(v > vm){ p.vx *= vm / v; p.vy *= vm / v; }
    const fr = Math.pow(.18, dt); p.vx *= fr; p.vy *= fr;
  }
  function elan(p, ax, ay){
    let dx = ax, dy = ay;
    if(!dx && !dy){ const v = Math.hypot(p.vx, p.vy) || 1; dx = p.vx / v; dy = p.vy / v; }
    const d = Math.hypot(dx, dy) || 1;
    p.vx += dx / d * DASH; p.vy += dy / d * DASH; p.cd = DASH_CD; p.dashT = .35;
  }

  function maj(S, dt, fx){
    fx = fx || rien;
    S.tp += dt;
    if(S.ph === "compte"){ if(S.tp > 2.4){ S.ph = "jeu"; S.tp = 0; } return; }
    if(S.ph === "pointe"){
      animerChutes(S, dt);
      if(S.tp > 2.6){ if(S.p.some(p => p.pts >= S.cible)){ S.ph = "fin"; S.tp = 0; } else { S.manche++; placer(S); } }
      return;
    }
    if(S.ph === "fin"){ animerChutes(S, dt); return; }
    S.t += dt;
    if(S.t > 15) S.R = Math.max(RMIN, S.R - 7 * dt);
    if(!S.bonus){ S.bonusCd -= dt; if(S.bonusCd <= 0){ const a = Math.random() * 6.28, d = Math.random() * (S.R - 50); S.bonus = {x: CX + Math.cos(a) * d, y: CY + Math.sin(a) * d}; } }
    for(const p of S.p){
      if(!p.vivant) continue;
      if(p.bot) cerveau(S, p, dt);
      p.cd -= dt; p.dashT -= dt; if(p.geant > 0) p.geant -= dt;
      let ax = p.ax, ay = p.ay; const n = Math.hypot(ax, ay); if(n > 1){ ax /= n; ay /= n; }
      if(p.veut){ p.veut = false; if(p.cd <= 0){ elan(p, ax, ay); fx.son(220, .15, "sawtooth", .05); } }
      bouger(p, ax, ay, dt);
      p.x += p.vx * dt; p.y += p.vy * dt;
      if(S.bonus && Math.hypot(p.x - S.bonus.x, p.y - S.bonus.y) < rayon(p) + 12){ p.geant = 5; S.bonus = null; S.bonusCd = 8 + Math.random() * 5; fx.son(900, .2, "triangle", .05); }
    }
    // chocs
    const vs = S.p.filter(p => p.vivant);
    for(let i = 0; i < vs.length; i++) for(let k = i + 1; k < vs.length; k++){
      const a = vs[i], b = vs[k], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), r = rayon(a) + rayon(b);
      if(d >= r || d === 0) continue;
      const nx = dx / d, ny = dy / d, ma = masse(a), mb = masse(b);
      const recul = (r - d) / (ma + mb);
      a.x -= nx * recul * mb; a.y -= ny * recul * mb; b.x += nx * recul * ma; b.y += ny * recul * ma;
      const vr = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
      if(vr < 0){
        const j = -(1 + .95) * vr / (1 / ma + 1 / mb);
        a.vx -= j * nx / ma; a.vy -= j * ny / ma; b.vx += j * nx / mb; b.vy += j * ny / mb;
        if(-vr > 120) fx.choc(-vr, (a.x + b.x) / 2, (a.y + b.y) / 2);
      }
    }
    // sorties
    for(const p of vs) if(Math.hypot(p.x - CX, p.y - CY) > S.R + rayon(p) * .35){ p.vivant = false; p.chute = 1; fx.son(300, .5, "sine", .06, 0, -250); }
    animerChutes(S, dt);
    const restants = S.p.filter(p => p.vivant);
    if(restants.length <= 1){
      S.ph = "pointe"; S.tp = 0;
      const g = restants[0];
      if(g){ g.pts++; S.gagnant = g.id; S.msg = `${g.av} ${g.nom} gagne la manche !`; } else { S.gagnant = null; S.msg = "Égalité, tout le monde est tombé !"; }
    }
  }
  function animerChutes(S, dt){ for(const p of S.p) if(!p.vivant && p.chute > 0){ p.chute -= dt * 1.4; p.x += p.vx * dt * .5; p.y += p.vy * dt * .5; } }

  /* ---------- Ordi ---------- */
  const NIV = {facile: {acc: .65, reac: .55, dash: .25}, moyen: {acc: .85, reac: .3, dash: .55}, difficile: {acc: 1, reac: .12, dash: .9}};
  function cerveau(S, p, dt){
    const n = NIV[["", "facile", "moyen", "difficile"][p.bot]] || NIV.moyen;
    p.ia.t -= dt;
    if(p.ia.t > 0) return;
    p.ia.t = n.reac * (.6 + Math.random() * .8);
    const dc = Math.hypot(p.x - CX, p.y - CY);
    const autres = S.p.filter(o => o !== p && o.vivant);
    let tx, ty;
    if(dc > S.R - 55){ tx = CX; ty = CY; }            // trop près du bord : on revient
    else if(S.bonus && Math.hypot(S.bonus.x - p.x, S.bonus.y - p.y) < 140){ tx = S.bonus.x; ty = S.bonus.y; }
    else{
      const c = autres.sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
      if(!c){ p.ax = p.ay = 0; return; }
      // se placer entre le centre et la cible, puis pousser vers l'extérieur
      const ox = c.x - CX, oy = c.y - CY, od = Math.hypot(ox, oy) || 1;
      const px = c.x - ox / od * 34, py = c.y - oy / od * 34;
      const dCible = Math.hypot(c.x - p.x, c.y - p.y);
      if(Math.hypot(px - p.x, py - p.y) < 30 || dCible < 60){ tx = c.x + ox / od * 40; ty = c.y + oy / od * 40; if(dCible < 95 && Math.random() < n.dash) p.veut = true; }
      else { tx = px; ty = py; }
    }
    const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy) || 1;
    p.ax = dx / d * n.acc; p.ay = dy / d * n.acc;
  }

  /* ---------- Réseau : état compact envoyé ~20-30 fois par seconde ---------- */
  const r1 = x => Math.round(x * 10) / 10;
  function etat(S, pid, meta){
    const m = {t: "s", pid, ph: S.ph, tp: r1(S.tp), R: r1(S.R), m: S.manche, msg: S.msg, b: S.bonus ? [r1(S.bonus.x), r1(S.bonus.y)] : 0,
      p: S.p.map(p => [r1(p.x), r1(p.y), r1(p.vx), r1(p.vy), p.vivant ? 1 : 0, r1(p.chute), p.geant > 0 ? 1 : 0, p.dashT > 0 ? 1 : 0, r1(Math.max(0, p.cd)), p.pts])};
    if(meta){ m.j = S.p.map(p => [p.id, p.nom, p.av, p.coul]); m.c = S.cible; }
    return m;
  }
  // commande d'un joueur distant (« in ») appliquée par celui qui fait tourner la partie
  function entree(S, p, m){
    p.ax = Math.max(-1, Math.min(1, +m.ax || 0)); p.ay = Math.max(-1, Math.min(1, +m.ay || 0));
    if(+m.d > (p.dSeq || 0)){ p.dSeq = +m.d; if(S.ph === "jeu") p.veut = true; }
  }

  globalThis.SumoSim = {W, CX, CY, R0, RMIN, RAYON, ACC, VMAX, DASH, DASH_CD, COULS, AVS,
    nouvelle, placer, rayon, masse, bouger, elan, maj, etat, entree, r1};
})();
