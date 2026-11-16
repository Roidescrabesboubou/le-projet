/* souffleur : le jeu (chargé seul par index.html, ou avec les autres dans La Soirée) */
(function(){
const {podium} = Soiree;
const esc = Base.esc;
const MINI = 6;   // chaque joueur doit gonfler d'au moins 6 % avant de passer

const ENTETE = {
  titre: "Le Souffleur",
  emoji: "🎈",
  aide: `<p>Un ballon passe de main en main. Chacun à son tour <b>souffle dans le micro</b> pour le gonfler, d'au moins ${MINI} %, puis peut passer le téléphone… ou continuer.</p>
    <ul><li>Il éclate à une taille secrète, différente à chaque ballon.</li>
    <li>Celui qui le fait éclater <b>boit</b> (plus le ballon était gros, plus il boit).</li>
    <li>Sans micro : maintiens le bouton « Souffler ».</li></ul>`
};

const COUL = ["#e8590c", "#d6336c", "#2b8fd6", "#2f9e44", "#7048e8", "#f59f00"];
const jDe = (G, id) => G.J.find(j => j.id === id);
function ballon(G){ G.phase = "jeu"; G.taille = 0; G.debutTour = 0; G.limite = 30 + Math.random() * 68; G.coul = COUL[G.b % COUL.length]; G.graine = Math.floor(Math.random() * 1e6); }

/* le joueur dont c'est le tour souffle (sur l'écran commun) */
function souffler(zone, V, envoyer){
  const j = V.J[V.cur];
  zone.innerHTML = `<p class="tour">${esc(j.av)} C'est à <b>${esc(j.nom)}</b> de souffler</p>
    <div class="scene"><div class="ballon" id="bl"></div><div class="ficelle"></div></div>
    <div class="mini"><span id="pc">${Math.round(V.taille)} %</span><span>· minimum +${MINI} %</span></div>
    <div class="micro"><i id="mi"></i></div>
    <div class="so-actions" id="act"><button class="btn so-gros" id="go">🎤 Souffler dans le micro</button></div>`;
  const bl = zone.querySelector("#bl"), pc = zone.querySelector("#pc"), mi = zone.querySelector("#mi"), act = zone.querySelector("#act");
  bl.style.setProperty("--bc", V.coul);
  let taille = V.taille, depart = V.taille, mic = null, tic = null, appui = false, fini = false;
  const dessiner = () => { const w = 60 + taille * 2.3; bl.style.width = w + "px"; bl.style.height = w * 1.18 + "px"; pc.textContent = Math.round(taille) + " %"; };
  dessiner();
  const arret = () => { fini = true; clearInterval(tic); if(mic) mic.arret(); };
  async function lancer(){
    try{ mic = await Apero.micro(); }catch(e){ mic = null; }
    act.innerHTML = "";
    if(!mic){
      const s = Base.el("div", "💨 Maintiens pour souffler", "souffle ap-zone"); act.appendChild(s);
      s.onpointerdown = e => { e.preventDefault(); appui = true; s.classList.add("on"); };
      const lache = () => { appui = false; s.classList.remove("on"); };
      s.onpointerup = lache; s.onpointerleave = lache; s.onpointercancel = lache;
    }
    const passe = Base.el("button", "✋ Je passe", "btn ghost so-gros"); passe.disabled = true;
    passe.onclick = () => { arret(); envoyer({t: "passe", v: taille}); };
    act.appendChild(passe);
    let fond = null, mesures = [];
    tic = setInterval(() => {
      if(fini) return;
      let force = 0;
      if(mic){
        const n = mic.niveau(); mi.style.width = Math.min(100, n * 100) + "%";
        if(fond == null){ mesures.push(n); if(mesures.length >= 10) fond = mesures.reduce((a, b) => a + b, 0) / mesures.length; return; }
        force = Math.max(0, n - Math.max(.12, fond * 2.5)) * 3;
      }else force = appui ? .55 : 0;
      if(force > 0){
        taille += Math.min(1.2, force) * .9;
        if(Math.random() < .3) Apero.son(180 + taille * 4, 40, "triangle", .05);
        dessiner();
        if(taille - depart >= MINI) passe.disabled = false;
        if(taille >= V.limite){ arret(); Apero.boum(500); Apero.vibrer([100, 50, 200]); envoyer({t: "boum", v: taille}); }
      }
    }, 50);
  }
  zone.querySelector("#go").onclick = lancer;
  return arret;
}

Apero.jeu({
  entete: ENTETE,
  bilan(G){ return G.phase === "boum" && G.J[G.perdant] ? [["b" + G.b, G.J[G.perdant].id, G.n]] : []; },
  jeu: "souffleur", titre: "Le Souffleur", emoji: "🎈", min: 2, max: 12, multi: false,
  hero: {texte: "Un ballon qui passe de main en main : souffle dans le micro pour le gonfler, et prie pour qu'il n'éclate pas sur toi !"},
  reglages: [{k: "nb", titre: "Nombre de ballons", options: [[3, "3"], [5, "5"], [8, "8"]], def: 5}],
  nouvelle(joueurs, R){ const G = {R, J: joueurs.map(j => ({...j, pts: 0})), b: 0, cur: Math.floor(Math.random() * joueurs.length)}; ballon(G); return G; },
  action(G, id, a){
    if(a.t === "passe" && G.phase === "jeu"){ G.taille = Math.max(G.taille, Math.min(G.limite - .1, +a.v || 0)); G.cur = (G.cur + 1) % G.J.length; return true; }
    if(a.t === "boum" && G.phase === "jeu"){
      const j = G.J[G.cur]; G.n = Math.max(1, Math.min(4, Math.round(G.limite / 25)));
      j.pts += G.n; G.perdant = G.cur; G.phase = "boum"; return true;
    }
    if(a.t === "suite" && G.phase === "boum"){
      G.b++;
      if(G.b >= G.R.nb){ G.phase = "fin"; return true; }
      G.cur = (G.perdant + 1) % G.J.length; ballon(G); return true;
    }
    return false;
  },
  depart(){},
  publique(G){ return {phase: G.phase, b: G.b, nb: G.R.nb, J: G.J, cur: G.cur, taille: G.taille, limite: G.limite, coul: G.coul, perdant: G.perdant, n: G.n, graine: G.graine, R: G.R}; },
  rendre(box, ctx){
    const {V} = ctx, R = V.R;
    const haut = `<div class="so-haut"><span>Ballon ${Math.min(V.b + 1, V.nb)} / ${V.nb}</span><span>🎈</span></div>`;
    if(V.phase === "jeu"){
      Apero.phase(box, V._id + ":jeu:" + V.b + ":" + V.cur + ":" + V.taille, () => {
        box.innerHTML = `<section class="b-carte">${haut}<div id="zone"></div></section>`;
        return souffler(box.querySelector("#zone"), V, ctx.envoyer);
      });
      return;
    }
    if(V.phase === "boum"){
      Apero.phase(box, V._id + ":boum:" + V.b, () => {
        const j = V.J[V.perdant];
        box.innerHTML = `<section class="b-carte ap-carte">${haut}<div class="boum">💥</div>
          <p class="ap-gros">Le ballon a éclaté à ${Math.round(V.limite)} % !</p>
          <div class="ap-peine">${Apero.boit(R, j.nom, V.n, V.graine)}</div>
          <div class="so-actions"><button class="btn so-gros" data-a="suite">${V.b + 1 >= V.nb ? "🏁 Bilan" : "🎈 Ballon suivant"}</button></div></section>`;
        box.querySelector("[data-a]").onclick = () => ctx.envoyer({t: "suite"});
      });
      return;
    }
    Apero.phase(box, V._id + ":fin", () => {
      box.innerHTML = `<section class="b-carte"><h2 style="text-align:center;margin:0">🏁 Les poumons les plus malchanceux</h2>${podium(V.J, null, {unite: R.boisson === "soft" ? "pts" : "🍺"})}${ctx.finHtml()}</section>`;
    });
  }
});
})();
