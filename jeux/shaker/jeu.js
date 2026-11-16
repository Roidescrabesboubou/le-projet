/* shaker : le jeu (chargé seul par index.html, ou avec les autres dans La Soirée) */
(function(){
const {podium, pastilles} = Soiree;
const esc = Base.esc;
const DUREE = 10;

const ENTETE = {
  titre: "Shaker",
  emoji: "🍸",
  aide: `<p>Secoue ton téléphone comme un shaker à cocktail pendant ${DUREE} secondes : plus tu secoues fort et vite, plus ta jauge monte.</p>
    <ul><li>Le plus faible <b>boit</b>, le plus fort <b>distribue 3 gorgées</b>.</li>
    <li>⚠️ Tiens ton téléphone bien serré (et loin des verres) !</li>
    <li>Sans accéléromètre (ordinateur) : tape le plus vite possible sur la zone.</li></ul>`
};

const presents = G => G.J.filter(j => !j.parti);
const jDe = (G, id) => G.J.find(j => j.id === id);
function manche(G){ G.phase = "jeu"; G.sc = {}; G.graine = Math.floor(Math.random() * 1e6); }
const fini = G => presents(G).every(j => G.sc[j.id] != null);
function cloturer(G){ G.phase = "res"; presents(G).forEach(j => { j.tot += G.sc[j.id] || 0; }); }

function secouer(zone, fin){
  zone.innerHTML = `<div class="shaker" id="shk">🍸</div><p class="score" id="shS">0</p>
    <div class="ap-jauge"><i id="shJ"></i></div><p class="ap-pas" id="shI">Tiens bien ton téléphone !</p>
    <div class="so-actions"><button class="btn so-gros" id="shGo">🍸 Je suis prêt</button></div>
    <p class="attention">⚠️ Serre-le fort, loin des verres et des têtes.</p>`;
  const shk = zone.querySelector("#shk"), S = zone.querySelector("#shS"), J = zone.querySelector("#shJ"), I = zone.querySelector("#shI");
  let arrets = [], fini = false;
  const stop = () => { arrets.forEach(f => f()); arrets = []; };
  zone.querySelector("#shGo").onclick = async () => {
    const b = zone.querySelector("#shGo"); b.disabled = true; b.textContent = "…";
    const capteur = await Apero.mouvement();
    Apero.eveil(); b.parentNode.remove();
    let score = 0, debut = 0, dernier = 0;
    if(capteur){
      arrets.push(Apero.surMouvement(m => {
        if(!debut || fini) return;
        const dt = dernier ? Math.min(.1, (m.t - dernier) / 1000) : 0; dernier = m.t;
        score += Math.max(0, Math.min(60, m.a) - 3) * dt * 10;
        shk.style.transform = `rotate(${Math.max(-30, Math.min(30, m.x * 3))}deg) scale(${1 + Math.min(.4, m.a / 80)})`;
      }));
    }else{
      const t = Base.el("div", "👆 Tape ici, vite !", "tape ap-zone");
      zone.insertBefore(t, zone.querySelector(".attention"));
      t.onpointerdown = e => { e.preventDefault(); if(!debut || fini) return; score += 12; shk.style.transform = `rotate(${Math.random() * 40 - 20}deg)`; };
    }
    let c = 3;
    const t0 = setInterval(() => {
      if(c > 0){ S.textContent = c; Apero.son(520, 90); c--; return; }
      clearInterval(t0);
      debut = performance.now(); Apero.son(880, 200); Apero.vibrer(80); I.textContent = "SECOUE !";
      const tic = setInterval(() => {
        const t = (performance.now() - debut) / 1000;
        S.textContent = Math.round(score);
        J.style.width = Math.min(100, score / 15) + "%";
        I.textContent = `⏱ ${Math.max(0, DUREE - t).toFixed(1)} s`;
        if(t >= DUREE){
          clearInterval(tic); fini = true; stop(); shk.style.transform = "";
          Apero.son(660, 300); I.textContent = "Stop !"; fin(Math.round(score));
        }
      }, 50);
      arrets.push(() => clearInterval(tic));
    }, 800);
    arrets.push(() => clearInterval(t0));
  };
  return () => { fini = true; stop(); };
}

Apero.jeu({
  entete: ENTETE,
  bilan(G){
    if(G.phase !== "res") return [];
    const l = G.J.filter(j => G.sc[j.id] != null), v = l.map(j => G.sc[j.id]), min = Math.min(...v);
    if(!l.length || min === Math.max(...v)) return [];
    return l.filter(j => G.sc[j.id] === min).map(j => ["m" + G.m + ":" + j.id, j.id, 2]);
  },
  jeu: "shaker", titre: "Shaker", emoji: "🍸", min: 2, max: 12,
  hero: {
    texte: "Secoue ton téléphone comme un shaker pendant 10 secondes. Le plus mou boit, le plus fort distribue !",
    etapes: ["1 · Serre ton téléphone", "2 · Secoue !", "3 · Le plus mou boit"]
  },
  reglages: [{k: "nb", titre: "Nombre de manches", options: [[1, "1"], [3, "3"], [5, "5"]], def: 3}],
  nouvelle(joueurs, R){ const G = {R, J: joueurs.map(j => ({...j, tot: 0})), m: 0, hote: joueurs[0].id}; manche(G); return G; },
  attendus(G){ return G.phase === "jeu" ? presents(G).filter(j => G.sc[j.id] == null).map(j => j.id) : []; },
  action(G, id, a){
    if(!jDe(G, id)) return false;
    if(a.t === "score" && G.phase === "jeu" && G.sc[id] == null){
      G.sc[id] = Math.max(0, Math.min(99999, Math.round(+a.v || 0)));
      if(fini(G)) cloturer(G);
      return true;
    }
    if(a.t === "suite" && G.phase === "res" && (id === G.hote || G._local)){
      G.m++; if(G.m >= G.R.nb) G.phase = "fin"; else manche(G);
      return true;
    }
    return false;
  },
  depart(G, id){ const j = jDe(G, id); if(j) j.parti = true; if(G.phase === "jeu" && presents(G).length && fini(G)) cloturer(G); },
  arrivee(G, j){ if(!jDe(G, j.id)) G.J.push({...j, tot: 0}); },
  publique(G){ return {phase: G.phase, m: G.m, nb: G.R.nb, J: G.J, sc: G.sc, graine: G.graine, R: G.R}; },
  rendre(box, ctx){
    const {V, moi} = ctx, R = V.R;
    const haut = `<div class="so-haut"><span>Manche ${Math.min(V.m + 1, V.nb)} / ${V.nb}</span><span>🍸</span></div>`;
    if(V.phase === "jeu"){
      if(V.sc[moi] == null){
        Apero.phase(box, V._id + ":jeu:" + V.m + ":" + moi, () => {
          box.innerHTML = `<section class="b-carte">${haut}<div id="zone"></div></section>`;
          return secouer(box.querySelector("#zone"), v => setTimeout(() => ctx.envoyer({t: "score", v}), ctx.local ? 1200 : 0));
        });
      }else Apero.phase(box, V._id + ":att:" + V.m + ":" + Object.keys(V.sc).length, () => {
        box.innerHTML = `<section class="b-carte ap-carte">${haut}<p class="ap-enorme">${V.sc[moi]}</p><p class="so-attente">⏳ On attend les autres…</p>${pastilles(V.J, Object.keys(V.sc))}</section>`;
      });
      return;
    }
    if(V.phase === "res"){
      Apero.phase(box, V._id + ":res:" + V.m, () => {
        const l = V.J.filter(j => V.sc[j.id] != null).sort((a, b) => V.sc[b.id] - V.sc[a.id]);
        const min = Math.min(...l.map(j => V.sc[j.id])), max = Math.max(...l.map(j => V.sc[j.id]));
        box.innerHTML = `<section class="b-carte">${haut}
          <ol class="ap-res">${l.map(j => `<li class="${V.sc[j.id] === max ? "top" : V.sc[j.id] === min ? "pire" : ""} ${j.id === moi && !ctx.local ? "moi" : ""}"><span class="av">${esc(j.av)}</span><span class="n">${esc(j.nom)}</span><b>${V.sc[j.id]}</b></li>`).join("")}</ol>
          ${min === max ? `<div class="ap-peine">🤝 Égalité : tout le monde trinque !</div>` :
            l.filter(j => V.sc[j.id] === min).map((j, i) => `<div class="ap-peine">${Apero.boit(R, j.nom, 2, V.graine + i)}</div>`).join("") +
            `<p class="ap-pas">💪 ${l.filter(j => V.sc[j.id] === max).map(j => esc(j.nom)).join(" et ")} distribue 3 gorgées</p>`}
          ${ctx.hote ? `<div class="so-actions"><button class="btn so-gros" data-a="suite">${V.m + 1 >= V.nb ? "🏁 Bilan" : "Manche suivante ➜"}</button></div>` : `<p class="so-attente">⏳ L'hôte lance la suite…</p>`}</section>`;
        const b = box.querySelector("[data-a]"); if(b) b.onclick = () => ctx.envoyer({t: "suite"});
      });
      return;
    }
    Apero.phase(box, V._id + ":fin", () => {
      box.innerHTML = `<section class="b-carte"><h2 style="text-align:center;margin:0">🏁 Le meilleur barman</h2>${podium(V.J.map(j => ({...j, pts: j.tot})), moi, {unite: "pts"})}${ctx.finHtml()}</section>`;
    });
  }
});
})();
