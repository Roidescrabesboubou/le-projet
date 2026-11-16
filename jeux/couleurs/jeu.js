/* couleurs : le jeu (chargé seul par index.html, ou avec les autres dans La Soirée) */
(function(){
const {melanger, hasard, podium, pastilles} = Soiree;
const esc = Base.esc;
const LIMITE = 60;   // secondes pour trouver

const ENTETE = {
  titre: "Chasse aux couleurs",
  emoji: "🎨",
  aide: `<p>Une couleur s'affiche : trouve un objet de cette couleur et <b>vise-le avec la caméra</b> (au centre du cadre).</p>
    <ul><li>Le téléphone reconnaît la couleur tout seul : il faut la garder dans le cadre une demi-seconde.</li>
    <li>Le plus lent (ou celui qui ne trouve pas en ${LIMITE} s) <b>boit</b>, le plus rapide distribue 2 gorgées.</li>
    <li>Aucune image ne quitte ton téléphone : seul ton temps est envoyé.</li></ul>`
};

/* couleurs reconnues (teinte en degrés) */
const COULEURS = {
  rouge: {nom: "ROUGE", c: "#e03131"}, orange: {nom: "ORANGE", c: "#f76707"}, jaune: {nom: "JAUNE", c: "#f2c200"},
  vert: {nom: "VERT", c: "#2f9e44"}, bleu: {nom: "BLEU", c: "#1971c2"}, violet: {nom: "VIOLET", c: "#7048e8"},
  rose: {nom: "ROSE", c: "#e64980"}, blanc: {nom: "BLANC", c: "#f1f3f5"}, noir: {nom: "NOIR", c: "#212529"}
};
function classer(r, g, b){
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), v = mx / 255, s = mx ? (mx - mn) / mx : 0;
  let h = 0;
  if(mx !== mn){
    if(mx === r) h = ((g - b) / (mx - mn)) % 6; else if(mx === g) h = (b - r) / (mx - mn) + 2; else h = (r - g) / (mx - mn) + 4;
    h *= 60; if(h < 0) h += 360;
  }
  if(v < .2) return "noir";
  if(s < .16 && v > .72) return "blanc";
  if(s < .3) return null;
  if((h >= 330 || h < 15) && s < .5 && v > .7) return "rose";
  if(h >= 345 || h < 14) return "rouge";
  if(h < 40) return "orange";
  if(h < 70) return "jaune";
  if(h < 170) return "vert";
  if(h < 255) return "bleu";
  if(h < 290) return "violet";
  return "rose";
}
/* part des pixels du centre de l'image qui ont la bonne couleur, et couleur la plus vue */
function analyser(src, w, h, cv, voulue){
  const W = 48, H = 36; cv.width = W; cv.height = H;
  const x = cv.getContext("2d", {willReadFrequently: true});
  x.drawImage(src, 0, 0, w, h, 0, 0, W, H);
  const d = x.getImageData(W * .35, H * .3, W * .3, H * .4).data;
  const cpt = {}; let n = 0;
  for(let i = 0; i < d.length; i += 4){ const k = classer(d[i], d[i + 1], d[i + 2]); n++; if(k) cpt[k] = (cpt[k] || 0) + 1; }
  const top = Object.keys(cpt).sort((a, b) => cpt[b] - cpt[a])[0];
  return {part: (cpt[voulue] || 0) / n, top};
}

const presents = G => G.J.filter(j => !j.parti);
const jDe = (G, id) => G.J.find(j => j.id === id);
const fini = G => presents(G).every(j => G.temps[j.id] != null);
function manche(G){
  G.phase = "jeu"; G.temps = {}; G.graine = Math.floor(Math.random() * 1e6);
  const dispo = Object.keys(COULEURS).filter(c => !G.deja.includes(c));
  if(!dispo.length) G.deja = [];
  {
    // une couleur par joueur (un seul téléphone : chacun la sienne, sinon il suffirait de suivre le précédent)
    G.coul = {}; const l = melanger(dispo.length ? dispo : Object.keys(COULEURS));
    G.J.forEach((j, i) => { G.coul[j.id] = l[i % l.length]; });
  }
  G.commune = hasard(dispo.length ? dispo : Object.keys(COULEURS)); G.deja.push(G.commune);
  G.t0 = Date.now() + 4000;
}
function cloturer(G){ G.phase = "res"; }

function chasser(zone, couleur, t0, maintenant, fin){
  const C = COULEURS[couleur];
  zone.innerHTML = `<div class="cible" style="background:${C.c};${couleur === "blanc" ? "color:#212529;text-shadow:none" : ""}" id="cb">Prêt ?</div>
    <p class="chrono" id="ch"></p>
    <div class="cam" id="cam" hidden><video muted playsinline></video><div class="vise" id="vs"></div><div class="prog" id="pg"></div></div>
    <p class="lu" id="lu"></p>
    <div class="so-actions" id="act"><button class="btn so-gros" id="ouvrir">📷 Ouvrir la caméra</button></div>
    <div class="so-actions"><label class="btn ghost petit" style="cursor:pointer">📸 Prendre une photo à la place<input type="file" accept="image/*" capture="environment" hidden id="photo"></label></div>`;
  const cb = zone.querySelector("#cb"), ch = zone.querySelector("#ch"), cam = zone.querySelector("#cam"), video = cam.querySelector("video"),
    vs = zone.querySelector("#vs"), pg = zone.querySelector("#pg"), lu = zone.querySelector("#lu");
  const cv = document.createElement("canvas");
  let arretCam = null, tic = null, fini = false, bon = 0;
  const arret = () => { fini = true; clearInterval(tic); if(arretCam) arretCam(); };
  const reussi = () => {
    if(fini) return;
    const s = Math.max(0, (maintenant() - t0) / 1000);
    arret(); Apero.son(880, 120); setTimeout(() => Apero.son(1320, 200), 120); Apero.vibrer(150);
    cb.textContent = "✅ Trouvé !"; ch.textContent = s.toFixed(1) + " s";
    fin(Math.round(s * 10) / 10);
  };
  const lire = (src, w, h) => {
    const r = analyser(src, w, h, cv, couleur);
    lu.innerHTML = r.top ? `<i style="background:${COULEURS[r.top].c}"></i>Je vois : ${COULEURS[r.top].nom.toLowerCase()}` : "Je vois : …";
    return r.part;
  };
  zone.querySelector("#ouvrir").onclick = async () => {
    Apero.audio(); Apero.eveil();
    try{ arretCam = await Apero.camera(video); cam.hidden = false; zone.querySelector("#act").remove(); }
    catch(e){ Base.toast("Caméra refusée : utilise « Prendre une photo »"); }
  };
  zone.querySelector("#photo").onchange = e => {
    const f = e.target.files[0]; if(!f || maintenant() < t0) return;
    const img = new Image();
    img.onload = () => { const p = lire(img, img.naturalWidth, img.naturalHeight); URL.revokeObjectURL(img.src); if(p >= .45) reussi(); else Base.toast(`Ce n'est pas du ${C.nom.toLowerCase()}, réessaie !`); };
    img.src = URL.createObjectURL(f); e.target.value = "";
  };
  let dernier = performance.now();
  tic = setInterval(() => {
    if(fini) return;
    const now = performance.now(), dt = now - dernier; dernier = now;
    const reste = (t0 - maintenant()) / 1000;
    if(reste > 0){ cb.textContent = "Dans " + Math.ceil(reste) + "…"; ch.textContent = ""; return; }
    cb.textContent = C.nom;
    const ecoule = -reste;
    ch.textContent = ecoule.toFixed(1) + " s";
    if(ecoule > LIMITE){ arret(); cb.textContent = "⌛ Temps écoulé"; fin(-1); return; }
    if(video.readyState >= 2 && video.videoWidth){
      const p = lire(video, video.videoWidth, video.videoHeight);
      if(p >= .5){ bon += dt; vs.classList.add("ok"); } else { bon = Math.max(0, bon - dt * 2); vs.classList.remove("ok"); }
      pg.style.width = Math.min(100, bon / 600 * 100) + "%";
      if(bon >= 600) reussi();
    }
  }, 100);
  return arret;
}

Apero.jeu({
  entete: ENTETE,
  jeu: "couleurs", titre: "Chasse aux couleurs", emoji: "🎨", min: 2, max: 12,
  hero: {
    texte: "Une couleur s'affiche : trouve vite un objet de cette couleur dans la pièce et vise-le avec la caméra. Le plus lent boit !",
    etapes: ["1 · Une couleur", "2 · Cours la trouver", "3 · Vise avec la caméra"]
  },
  reglages: [{k: "nb", titre: "Nombre de manches", options: [[3, "3"], [5, "5"], [8, "8"]], def: 5}],
  nouvelle(joueurs, R){ const G = {R, J: joueurs.map(j => ({...j, tot: 0, ok: 0})), m: 0, deja: [], hote: joueurs[0].id}; manche(G); return G; },
  attendus(G){ return G.phase === "jeu" ? presents(G).filter(j => G.temps[j.id] == null).map(j => j.id) : []; },
  action(G, id, a){
    const j = jDe(G, id); if(!j) return false;
    if(a.t === "temps" && G.phase === "jeu" && G.temps[id] == null){
      const s = +a.v; G.temps[id] = s >= 0 && s <= LIMITE + 1 ? s : -1;
      if(G.temps[id] >= 0){ j.tot += G.temps[id]; j.ok++; } else j.tot += LIMITE;
      if(fini(G)) cloturer(G);
      return true;
    }
    if(a.t === "delai" && id === G.hote && G.phase === "jeu" && Date.now() > G.t0 + (LIMITE + 3) * 1000){
      presents(G).forEach(x => { if(G.temps[x.id] == null){ G.temps[x.id] = -1; x.tot += LIMITE; } });
      cloturer(G); return true;
    }
    if(a.t === "suite" && G.phase === "res" && (id === G.hote || G._local)){
      G.m++; if(G.m >= G.R.nb) G.phase = "fin"; else manche(G);
      return true;
    }
    return false;
  },
  depart(G, id){ const j = jDe(G, id); if(j) j.parti = true; if(G.phase === "jeu" && presents(G).length && fini(G)) cloturer(G); },
  arrivee(G, j){ if(!jDe(G, j.id)) G.J.push({...j, tot: 0, ok: 0}); },
  publique(G){ return {phase: G.phase, m: G.m, nb: G.R.nb, J: G.J, temps: G.temps, t0: G.t0, coul: G.coul, commune: G.commune, local: !!G._local, graine: G.graine, R: G.R}; },
  rendre(box, ctx){
    const {V, moi} = ctx, R = V.R;
    const haut = `<div class="so-haut"><span>Manche ${Math.min(V.m + 1, V.nb)} / ${V.nb}</span><span>🎨</span></div>`;
    if(V.phase === "jeu"){
      if(ctx.hote && !ctx.local && !box._delai) box._delai = setTimeout(() => { box._delai = null; ctx.envoyer({t: "delai"}); }, Math.max(0, V.t0 - Date.now()) + (LIMITE + 3.5) * 1000);
      if(V.temps[moi] == null){
        // un seul téléphone : chacun sa couleur et son départ (bouton « Go »)
        if(ctx.local){
          Apero.phase(box, V._id + ":go:" + V.m + ":" + moi, () => {
            box.innerHTML = `<section class="b-carte ap-carte">${haut}<p class="ap-gros">Ta couleur va s'afficher</p><p class="muted">Ouvre la caméra pendant le compte à rebours, puis cours viser un objet de la bonne couleur !</p>
              <div class="so-actions"><button class="btn so-gros" id="go">🎨 Go !</button></div></section>`;
            box.querySelector("#go").onclick = () => {
              const t0 = Date.now() + 3000;
              Apero.phase(box, V._id + ":jeu:" + V.m + ":" + moi, () => {
                box.innerHTML = `<section class="b-carte">${haut}<div id="zone"></div></section>`;
                return chasser(box.querySelector("#zone"), V.coul[moi], t0, Date.now, s => setTimeout(() => ctx.envoyer({t: "temps", v: s}), 1500));
              });
            };
          });
        }else Apero.phase(box, V._id + ":jeu:" + V.m, () => {
          box.innerHTML = `<section class="b-carte">${haut}<div id="zone"></div><div id="qui"></div></section>`;
          return chasser(box.querySelector("#zone"), V.commune, V.t0, ctx.maintenant, s => ctx.envoyer({t: "temps", v: s}));
        });
        const q = box.querySelector("#qui"); if(q) q.innerHTML = pastilles(V.J, Object.keys(V.temps));
        return;
      }
      Apero.phase(box, V._id + ":att:" + V.m + ":" + Object.keys(V.temps).length, () => {
        box.innerHTML = `<section class="b-carte ap-carte">${haut}<p class="ap-enorme">${V.temps[moi] >= 0 ? V.temps[moi] + " s" : "⌛"}</p><p class="so-attente">⏳ On attend les autres…</p>${pastilles(V.J, Object.keys(V.temps))}</section>`;
      });
      return;
    }
    clearTimeout(box._delai); box._delai = null;
    if(V.phase === "res"){
      Apero.phase(box, V._id + ":res:" + V.m, () => {
        const val = j => V.temps[j.id] >= 0 ? V.temps[j.id] : 1e9;
        const l = V.J.filter(j => V.temps[j.id] != null).sort((a, b) => val(a) - val(b));
        const pire = Math.max(...l.map(val)), meilleur = Math.min(...l.map(val));
        const C = c => COULEURS[c] || {nom: "?", c: "#888"};
        box.innerHTML = `<section class="b-carte">${haut}
          ${V.local ? "" : `<div class="cible" style="background:${C(V.commune).c};font-size:1.6rem">${C(V.commune).nom}</div>`}
          <ol class="ap-res">${l.map(j => `<li class="${val(j) === meilleur && meilleur < 1e9 ? "top" : val(j) === pire ? "pire" : ""} ${j.id === moi && !ctx.local ? "moi" : ""}"><span class="av">${esc(j.av)}</span><span class="n">${esc(j.nom)}${V.local ? ` · <span style="color:${C(V.coul[j.id]).c}">${C(V.coul[j.id]).nom.toLowerCase()}</span>` : ""}</span><b>${V.temps[j.id] >= 0 ? V.temps[j.id] + " s" : "⌛"}</b></li>`).join("")}</ol>
          ${pire === meilleur ? `<div class="ap-peine">🤝 Égalité : tout le monde trinque !</div>` :
            l.filter(j => val(j) === pire).map((j, i) => `<div class="ap-peine">${Apero.boit(R, j.nom, pire >= 1e9 ? 3 : 2, V.graine + i)}</div>`).join("") +
            `<p class="ap-pas">⚡ ${l.filter(j => val(j) === meilleur).map(j => esc(j.nom)).join(" et ")} distribue 2 gorgées</p>`}
          ${ctx.hote ? `<div class="so-actions"><button class="btn so-gros" data-a="suite">${V.m + 1 >= V.nb ? "🏁 Bilan" : "Manche suivante ➜"}</button></div>` : `<p class="so-attente">⏳ L'hôte lance la suite…</p>`}</section>`;
        const b = box.querySelector("[data-a]"); if(b) b.onclick = () => ctx.envoyer({t: "suite"});
      });
      return;
    }
    Apero.phase(box, V._id + ":fin", () => {
      box.innerHTML = `<section class="b-carte"><h2 style="text-align:center;margin:0">🏁 L'œil le plus vif</h2>
        ${podium(V.J.map(j => ({...j, pts: j.ok})), moi, {unite: "✅"})}
        <p class="so-note">Couleurs trouvées (à égalité, voir les temps de chaque manche).</p>${ctx.finHtml()}</section>`;
    });
  }
});
})();
