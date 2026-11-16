/* mainstable : le jeu (chargé seul par index.html, ou avec les autres dans La Soirée) */
(function(){
const {melanger, podium, pastilles} = Soiree;
const esc = Base.esc;
const DUREE = 15;

const ENTETE = {
  titre: "Main stable",
  emoji: "✋",
  aide: `<p>Un verre plein est posé sur ton téléphone. Tiens-le <b>à plat dans ta main</b> pendant ${DUREE} secondes en relevant le défi (boire, fermer les yeux, tenir sur un pied…).</p>
    <ul><li>Chaque tremblement et chaque inclinaison renverse un peu de liquide.</li>
    <li>Celui à qui il reste le moins <b>boit</b>, le meilleur <b>distribue 2 gorgées</b>.</li>
    <li>Sans accéléromètre (ordinateur) : garde le doigt posé sur l'écran sans bouger.</li></ul>`
};

const DEFIS = [
  "Tiens-le à plat au creux de la main, bras tendu",
  "Pendant que tu bois une gorgée de l'autre main",
  "Les yeux fermés",
  "Debout sur un pied",
  "En récitant l'alphabet à voix haute",
  "Pendant que ton voisin te raconte une blague",
  "En faisant un tour sur toi-même, lentement",
  "Bras levé au-dessus de la tête",
  "En t'asseyant puis en te relevant",
  "En chantant un refrain",
  "Sur le dos de la main",
  "En regardant un autre joueur dans les yeux sans rire"
];

const presents = G => G.J.filter(j => !j.parti);
const jDe = (G, id) => G.J.find(j => j.id === id);

function manche(G){ G.phase = "jeu"; G.sc = {}; G.defi = G.D[G.m % G.D.length]; G.graine = Math.floor(Math.random() * 1e6); }
function fini(G){ return presents(G).every(j => G.sc[j.id] != null); }
function cloturer(G){
  G.phase = "res";
  presents(G).forEach(j => { j.tot += G.sc[j.id] || 0; });
}

/* ---------- La mesure (sur le téléphone du joueur) ---------- */
function mesurer(zone, fin){
  zone.innerHTML = `<p class="defi" id="msDefi"></p>
    <div class="verre-zone"><div class="verre"><div class="eau" id="msEau"></div><div class="gouttes" id="msG"></div></div></div>
    <p class="pct" id="msPct">100 %</p><p class="ap-pas" id="msInfo">Prépare-toi…</p>
    <div class="ap-actions so-actions"><button class="btn so-gros" id="msGo">✋ Je suis prêt</button></div>`;
  const eau = zone.querySelector("#msEau"), pct = zone.querySelector("#msPct"), info = zone.querySelector("#msInfo");
  let arrets = [], fait = false;
  const stop = () => { arrets.forEach(f => f()); arrets = []; };
  zone.querySelector("#msGo").onclick = async () => {
    const b = zone.querySelector("#msGo"); b.disabled = true; b.textContent = "…";
    const capteur = await Apero.mouvement();
    Apero.eveil();
    b.parentNode.remove();
    let reste = 100, inclin = 0, debut = 0, dernier = 0, doigt = false, px = null, py = null;
    if(!capteur){
      const d = Base.el("div", "👆 Pose le doigt ici et ne bouge plus", "doigt ap-zone");
      zone.appendChild(d);
      d.onpointerdown = e => { doigt = true; px = e.clientX; py = e.clientY; d.classList.add("on"); d.setPointerCapture(e.pointerId); };
      d.onpointermove = e => { if(!doigt || !debut) return; reste -= Math.hypot(e.clientX - px, e.clientY - py) * .25; px = e.clientX; py = e.clientY; };
      const lache = () => { if(doigt && debut){ reste = Math.min(reste, reste * .3); } doigt = false; d.classList.remove("on"); };
      d.onpointerup = lache; d.onpointercancel = lache;
    }else{
      arrets.push(Apero.surMouvement(m => {
        if(!debut) return;
        const now = m.t, dt = dernier ? Math.min(.1, (now - dernier) / 1000) : 0; dernier = now;
        const tilt = Math.hypot(m.x, m.y);           // 0 quand le téléphone est à plat
        inclin = Math.max(-20, Math.min(20, m.x * 3));
        reste -= (Math.max(0, m.a - .35) * 11 + Math.max(0, tilt - 2.2) * 4) * dt;
      }));
    }
    // compte à rebours puis 15 s
    let c = 3;
    info.textContent = capteur ? "Téléphone à plat dans ta main…" : "Pose le doigt…";
    const t0 = setInterval(() => {
      if(c > 0){ pct.textContent = c; Apero.son(520, 90); c--; return; }
      clearInterval(t0);
      if(!capteur && !doigt){ reste = 0; }
      debut = performance.now(); Apero.son(880, 200); Apero.vibrer(80);
      const tic = setInterval(() => boucle(), 50);
      arrets.push(() => clearInterval(tic));
      const boucle = () => {
        if(fait){ clearInterval(tic); return; }
        const t = (performance.now() - debut) / 1000;
        reste = Math.max(0, reste);
        eau.style.height = (reste * .85) + "%";
        eau.style.transform = `rotate(${inclin}deg)`;
        pct.textContent = Math.round(reste) + " %";
        info.textContent = `⏱ ${Math.max(0, DUREE - t).toFixed(1)} s`;
        if(t >= DUREE || reste <= 0){
          fait = true; stop(); Apero.son(reste > 0 ? 660 : 160, 300, reste > 0 ? "sine" : "sawtooth");
          info.textContent = reste > 0 ? "Bien tenu !" : "💦 Tout renversé !";
          fin(Math.round(reste));
        }
      };
    }, 800);
    arrets.push(() => clearInterval(t0));
  };
  return () => { fait = true; stop(); };
}

Apero.jeu({
  entete: ENTETE,
  jeu: "mainstable", titre: "Main stable", emoji: "✋", min: 2, max: 12,
  hero: {
    texte: "Un verre virtuel posé sur ton téléphone : tiens-le parfaitement immobile pendant un défi. Le plus tremblant boit !",
    etapes: ["1 · Téléphone à plat", "2 · Relève le défi", "3 · Ne renverse rien"]
  },
  reglages: [{k: "nb", titre: "Nombre de manches", options: [[3, "3"], [5, "5"], [8, "8"]], def: 3}],
  nouvelle(joueurs, R){
    const G = {R, J: joueurs.map(j => ({...j, tot: 0})), D: melanger(DEFIS), m: 0, hote: joueurs[0].id};
    manche(G); return G;
  },
  attendus(G){ return G.phase === "jeu" ? presents(G).filter(j => G.sc[j.id] == null).map(j => j.id) : []; },
  action(G, id, a){
    const j = jDe(G, id); if(!j) return false;
    if(a.t === "score" && G.phase === "jeu" && G.sc[id] == null){
      G.sc[id] = Math.max(0, Math.min(100, Math.round(+a.v || 0)));
      if(fini(G)) cloturer(G);
      return true;
    }
    if(a.t === "suite" && G.phase === "res" && (id === G.hote || G._local)){
      G.m++;
      if(G.m >= G.R.nb) G.phase = "fin"; else manche(G);
      return true;
    }
    return false;
  },
  depart(G, id){ const j = jDe(G, id); if(j) j.parti = true; if(G.phase === "jeu" && presents(G).length && fini(G)) cloturer(G); },
  arrivee(G, j){ if(!jDe(G, j.id)) G.J.push({...j, tot: 0}); },
  publique(G){ return {phase: G.phase, m: G.m, nb: G.R.nb, defi: G.defi, J: G.J, sc: G.sc, graine: G.graine, R: G.R, hote: G.hote}; },
  rendre(box, ctx){
    const {V, moi} = ctx, R = V.R;
    const haut = `<div class="so-haut"><span>Manche ${Math.min(V.m + 1, V.nb)} / ${V.nb}</span><span>✋</span></div>`;
    if(V.phase === "jeu"){
      const fait = V.sc[moi] != null;
      if(!fait){
        Apero.phase(box, V._id + ":jeu:" + V.m + ":" + moi, () => {
          box.innerHTML = `<section class="b-carte">${haut}<div id="msZone"></div></section>`;
          const zone = box.querySelector("#msZone");
          const arret = mesurer(zone, v => setTimeout(() => ctx.envoyer({t: "score", v}), ctx.local ? 1200 : 0));
          zone.querySelector("#msDefi").textContent = V.defi;
          return arret;
        });
        return;
      }
      // a fini, attend les autres (plusieurs téléphones)
      Apero.phase(box, V._id + ":att:" + V.m + ":" + Object.keys(V.sc).length, () => {
        box.innerHTML = `<section class="b-carte ap-carte">${haut}<p class="ap-enorme">${V.sc[moi]} %</p>
          <p class="so-attente">⏳ On attend les autres…</p>${pastilles(V.J, Object.keys(V.sc))}</section>`;
      });
      return;
    }
    if(V.phase === "res"){
      Apero.phase(box, V._id + ":res:" + V.m, () => {
        const l = V.J.filter(j => V.sc[j.id] != null).sort((a, b) => V.sc[b.id] - V.sc[a.id]);
        const min = Math.min(...l.map(j => V.sc[j.id])), max = Math.max(...l.map(j => V.sc[j.id]));
        const pires = l.filter(j => V.sc[j.id] === min), meilleurs = l.filter(j => V.sc[j.id] === max);
        box.innerHTML = `<section class="b-carte">${haut}<p class="defi">${esc(V.defi)}</p>
          <ol class="ap-res">${l.map(j => `<li class="${V.sc[j.id] === min ? "pire" : V.sc[j.id] === max ? "top" : ""} ${j.id === moi && !ctx.local ? "moi" : ""}"><span class="av">${esc(j.av)}</span><span class="n">${esc(j.nom)}</span><b>${V.sc[j.id]} %</b></li>`).join("")}</ol>
          ${min === max ? `<div class="ap-peine">🤝 Égalité parfaite : tout le monde trinque !</div>` :
            pires.map((j, i) => `<div class="ap-peine">${Apero.boit(R, j.nom, min < 30 ? 3 : 2, V.graine + i)}</div>`).join("") +
            `<p class="ap-pas">🏆 ${meilleurs.map(j => esc(j.nom)).join(" et ")} distribue${meilleurs.length > 1 ? "nt" : ""} 2 gorgées</p>`}
          ${ctx.hote ? `<div class="so-actions"><button class="btn so-gros" data-a="suite">${V.m + 1 >= V.nb ? "🏁 Bilan" : "Manche suivante ➜"}</button></div>` : `<p class="so-attente">⏳ L'hôte lance la suite…</p>`}
        </section>`;
        box.querySelector("[data-a]") && (box.querySelector("[data-a]").onclick = () => ctx.envoyer({t: "suite"}));
      });
      return;
    }
    Apero.phase(box, V._id + ":fin", () => {
      box.innerHTML = `<section class="b-carte"><h2 style="text-align:center;margin:0">🏁 La main la plus sûre</h2>
        ${podium(V.J.map(j => ({...j, pts: j.tot})), moi, {unite: "%"})}${ctx.finHtml()}</section>`;
    });
  }
});
})();
