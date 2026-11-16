/* silence : le jeu (chargé seul par index.html, ou avec les autres dans La Soirée) */
(function(){
const {podium} = Soiree;
const esc = Base.esc;

const ENTETE = {
  titre: "Le Silence",
  emoji: "🤫",
  aide: `<p>Posez le téléphone au milieu de la table : il écoute la pièce.</p>
    <ul><li>À chaque manche, un <b>clown</b> est tiré au sort : il a le droit de tout faire <b>sans bruit</b> pour faire craquer les autres (grimaces, mimes…).</li>
    <li>Au premier bruit qui dépasse la ligne, l'alarme sonne : <b>celui qui a craqué boit</b>, et le clown gagne.</li>
    <li>Si personne ne craque jusqu'à la fin du chrono, <b>le clown boit</b>.</li></ul>`
};

const SENS = {faible: [5, .22], moyen: [3, .1], forte: [2, .045]};
const jDe = (G, id) => G.J.find(j => j.id === id);
function manche(G){
  G.phase = "pret";
  let c; do{ c = Math.floor(Math.random() * G.J.length); }while(G.J.length > 1 && c === G.clown);
  G.clown = c; G.graine = Math.floor(Math.random() * 1e6);
}

function ecouter(zone, V, envoyer){
  const clown = V.J[V.clown];
  zone.innerHTML = `<p class="consigne">${esc(clown.av)} <b>${esc(clown.nom)}</b> est le clown : fais craquer les autres sans un bruit !</p>
    <p class="chrono" id="ch">${V.duree}</p>
    <div class="vu"><i id="vu"></i><b id="ligne" style="left:80%"></b></div>
    <p class="ap-pas" id="info">Calibrage du silence… chut !</p>`;
  const ch = zone.querySelector("#ch"), vu = zone.querySelector("#vu"), ligne = zone.querySelector("#ligne"), info = zone.querySelector("#info");
  let mic = null, tic = null, fini = false;
  const arret = () => { fini = true; clearInterval(tic); if(mic) mic.arret(); };
  (async () => {
    try{ mic = await Apero.micro(); }catch(e){
      info.innerHTML = "🎤 Micro indisponible : jouez à l'oreille ! Touchez « Quelqu'un a craqué » si vous entendez un bruit.";
    }
    Apero.eveil();
    const [f, d] = SENS[V.sens] || SENS.moyen;
    let fond = null, mesures = [], seuil = .5, au = 0, debut = 0;
    const echelle = 1.6;   // la jauge va jusqu'à seuil × 1,6
    const btn = Base.el("button", "😂 Quelqu'un a craqué !", "btn ghost"); btn.style.marginTop = "10px";
    btn.onclick = () => { if(!fini){ arret(); envoyer({t: "bruit"}); } };
    zone.appendChild(Base.el("div", null, "so-actions")).appendChild(btn);
    tic = setInterval(() => {
      if(fini) return;
      const n = mic ? mic.niveau() : 0;
      if(mic && fond == null){
        mesures.push(n);
        if(mesures.length >= 30){
          fond = mesures.reduce((a, b) => a + b, 0) / mesures.length;
          seuil = Math.max(fond * f, fond + d);
          ligne.style.left = (100 / echelle) + "%";
          debut = performance.now(); info.textContent = "🤫 Silence…"; Apero.son(880, 150, "sine", .15);
        }
        return;
      }
      if(!debut){ debut = performance.now(); if(mic) info.textContent = "🤫 Silence…"; }
      vu.style.width = Math.min(100, n / seuil * 100 / echelle) + "%";
      if(mic && n > seuil){ au += 50; if(au >= 200){ arret(); Apero.boum(700); Apero.vibrer([200, 80, 200]); envoyer({t: "bruit"}); return; } }
      else au = 0;
      const reste = V.duree - (performance.now() - debut) / 1000;
      ch.textContent = Math.max(0, Math.ceil(reste));
      if(reste <= 0){ arret(); Apero.son(660, 500); envoyer({t: "tenu"}); }
    }, 50);
  })();
  return arret;
}

Apero.jeu({
  entete: ENTETE,
  jeu: "silence", titre: "Le Silence", emoji: "🤫", min: 2, max: 16, multi: false,
  hero: {texte: "Le téléphone écoute la pièce. Un clown tente de vous faire craquer sans bruit : le premier qui rit boit !"},
  reglages: [
    {k: "duree", titre: "Durée d'une manche", options: [[30, "30 s"], [60, "1 min"], [90, "1 min 30"]], def: 60},
    {k: "sens", titre: "Sensibilité", options: [["faible", "🔈 On peut chuchoter"], ["moyen", "🔉 Normal"], ["forte", "🔇 Silence absolu"]], def: "moyen"}
  ],
  nouvelle(joueurs, R){ const G = {R, J: joueurs.map(j => ({...j, pts: 0})), m: 0, clown: -1}; manche(G); return G; },
  action(G, id, a){
    if(a.t === "go" && G.phase === "pret"){ G.phase = "jeu"; return true; }
    if(a.t === "bruit" && G.phase === "jeu"){ G.phase = "bruit"; G.J[G.clown].pts++; return true; }
    if(a.t === "tenu" && G.phase === "jeu"){ G.phase = "tenu"; return true; }
    if(a.t === "suite" && (G.phase === "bruit" || G.phase === "tenu")){ G.m++; manche(G); return true; }
    if(a.t === "finir"){ G.phase = "fin"; return true; }
    return false;
  },
  depart(){},
  publique(G){ return {phase: G.phase, m: G.m, J: G.J, clown: G.clown, duree: G.R.duree, sens: G.R.sens, graine: G.graine, R: G.R}; },
  rendre(box, ctx){
    const {V} = ctx, R = V.R, clown = V.J[V.clown] || V.J[0];
    const haut = `<div class="so-haut"><span>Manche ${V.m + 1}</span><span>🤫</span></div>`;
    if(V.phase === "pret"){
      Apero.phase(box, V._id + ":pret:" + V.m, () => {
        box.innerHTML = `<section class="b-carte ap-carte">${haut}<div class="clown">🤡</div>
          <p class="ap-gros">${esc(clown.av)} ${esc(clown.nom)} est le clown</p>
          <p class="muted">Posez le téléphone au milieu de la table. ${esc(clown.nom)} a ${V.duree} secondes pour vous faire faire du bruit, sans en faire du tout.</p>
          <div class="so-actions"><button class="btn so-gros" data-a="go">🤫 C'est parti</button></div>
          <div class="so-actions"><button class="btn ghost petit" data-a="finir">🏁 Finir la partie</button></div></section>`;
      });
    }else if(V.phase === "jeu"){
      Apero.phase(box, V._id + ":jeu:" + V.m, () => {
        box.innerHTML = `<section class="b-carte">${haut}<div id="zone"></div></section>`;
        return ecouter(box.querySelector("#zone"), V, ctx.envoyer);
      });
    }else if(V.phase === "bruit"){
      Apero.phase(box, V._id + ":bruit:" + V.m, () => {
        box.innerHTML = `<section class="b-carte">${haut}<div class="alerte"><h2>🚨 BRUIT !</h2><p style="margin:6px 0 0;font-weight:800">Quelqu'un a craqué…</p></div>
          <div class="ap-peine" style="margin-top:12px">${Apero.boit(R, "Qui a craqué", 2, V.graine)}</div>
          <p class="ap-pas">🤡 Bravo ${esc(clown.nom)}, tu distribues 1 gorgée en plus.</p>
          <div class="so-actions"><button class="btn so-gros" data-a="suite">Manche suivante ➜</button><button class="btn ghost" data-a="finir">🏁 Finir</button></div></section>`;
      });
    }else if(V.phase === "tenu"){
      Apero.phase(box, V._id + ":tenu:" + V.m, () => {
        box.innerHTML = `<section class="b-carte ap-carte">${haut}<p class="ap-enorme">😶</p><p class="ap-gros">Personne n'a craqué !</p>
          <div class="ap-peine">${Apero.boit(R, clown.nom, 2, V.graine)}</div>
          <div class="so-actions"><button class="btn so-gros" data-a="suite">Manche suivante ➜</button><button class="btn ghost" data-a="finir">🏁 Finir</button></div></section>`;
      });
    }else{
      Apero.phase(box, V._id + ":fin", () => {
        box.innerHTML = `<section class="b-carte"><h2 style="text-align:center;margin:0">🏁 Les meilleurs clowns</h2>${podium(V.J, null, {unite: "🤡"})}${ctx.finHtml()}</section>`;
      });
    }
    box.querySelectorAll("[data-a]").forEach(b => b.onclick = () => ctx.envoyer({t: b.dataset.a}));
  }
});
})();
