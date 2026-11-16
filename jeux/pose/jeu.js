/* pose : le jeu (chargé seul par index.html, ou avec les autres dans La Soirée) */
(function(){
const {melanger, podium} = Soiree;
const esc = Base.esc;
const PREPA = 5;   // compte à rebours avant la photo

const ENTETE = {
  titre: "Recrée la pose",
  emoji: "📸",
  aide: `<p>Un défi s'affiche : « Une photo de classe où personne ne regarde l'objectif », « Des pirates qui aperçoivent la terre »…</p>
    <ul><li>Mettez-vous en place, un joueur prend la photo (compte à rebours de ${PREPA} s).</li>
    <li>L'IA note la photo sur 10 avec un commentaire.</li>
    <li>En groupe : sous 5, tout le monde boit. En équipes : l'équipe la moins bien notée boit.</li>
    <li>📷 La photo est envoyée à l'IA (Gemini ou Claude, avec ta clé des Réglages) pour être notée. Elle n'est gardée nulle part ailleurs.</li></ul>`
};

const DEFIS = [
  "Une pochette d'album de boys band des années 90",
  "Une photo de classe où personne ne regarde l'objectif",
  "Des pirates qui aperçoivent enfin la terre",
  "Tout le monde a peur d'une araignée invisible",
  "Une photo de famille du XIXᵉ siècle, très sérieuse",
  "Une équipe de super-héros qui vient de perdre",
  "Le moment où on apprend qu'il n'y a plus de pizza",
  "Des statues de musée",
  "Le but de la victoire en finale de Coupe du monde",
  "Une attaque de zombies",
  "Un podium olympique (avec un mauvais perdant)",
  "Des espions en pleine mission secrète",
  "Une pub pour un parfum hors de prix",
  "Un groupe de touristes complètement perdus",
  "La classe quand le prof annonce une interro surprise",
  "Une émission de cuisine qui tourne mal",
  "Un défilé de mode haute couture",
  "Une équipe de bobsleigh dans le virage",
  "Un clip de rap très sérieux",
  "Une scène de film d'action au ralenti",
  "Le jury d'un télé-crochet qui vient d'entendre la pire chanson",
  "Des manchots sur la banquise",
  "Des astronautes en apesanteur",
  "Un groupe de rock en plein solo de guitare",
  "Une photo de mariage gênante",
  "Des chats qui voient un concombre",
  "La pause café d'une entreprise très stressée",
  "Des aventuriers qui découvrent un trésor",
  "Un tableau célèbre (au choix, l'IA doit deviner lequel)",
  "Le réveil le lendemain d'une grosse soirée"
];

function equipes(J){
  const l = melanger(J.map(j => j.id));
  return [l.filter((_, i) => i % 2 === 0), l.filter((_, i) => i % 2 === 1)];
}
function suivant(G){
  G.phase = "defi"; G.res = null;
  if(!G.pioche.length) G.pioche = melanger(DEFIS.slice());
  G.defi = G.pioche.pop(); G.graine = Math.floor(Math.random() * 1e6);
}

/* photo : video + compte à rebours, ou fichier ; renvoie {mime, data, url} réduite à 768 px */
function reduire(src, w, h, miroir){
  const k = Math.min(1, 768 / Math.max(w, h)), cv = document.createElement("canvas");
  cv.width = Math.round(w * k); cv.height = Math.round(h * k);
  const x = cv.getContext("2d");
  if(miroir){ x.translate(cv.width, 0); x.scale(-1, 1); }
  x.drawImage(src, 0, 0, cv.width, cv.height);
  const url = cv.toDataURL("image/jpeg", .82);
  return {mime: "image/jpeg", data: url.split(",")[1], url};
}

async function noter(defi, photo){
  const t = await IA.appeler({
    system: "Tu es le juge d'un jeu de soirée entre amis, drôle et bienveillant. Des joueurs essaient de reproduire une scène en photo. " +
      "Tu notes de 0 à 10 la ressemblance avec la scène demandée, l'effort et l'originalité. Sois généreux avec les vrais efforts, sévère si on ne voit pas de mise en scène. " +
      "Commentaire en français, 2 phrases maximum, drôle, en parlant au groupe (vous). Jamais de remarque sur le physique des gens. " +
      "Réponds seulement en JSON : {\"note\": entier de 0 à 10, \"commentaire\": \"…\"}",
    messages: [{role: "user", content: `Scène à reproduire : « ${defi} ». Voici leur photo.`}],
    image: {mime: photo.mime, data: photo.data}, json: true, max: 300
  });
  const j = IA.json(t) || {};
  const note = Math.max(0, Math.min(10, Math.round(+j.note)));
  if(!isFinite(note)) throw new Error("Réponse de l'IA illisible");
  return {note, com: String(j.commentaire || "").slice(0, 300)};
}

function photographier(zone, V, envoyer){
  zone.innerHTML = `<div class="cam"><video muted playsinline></video><img hidden alt="Votre photo"><div class="chrono" id="ch"></div></div>
    <div class="so-actions" id="act">
      <button class="btn so-gros" id="ouvrir">📷 Ouvrir la caméra</button>
      <label class="btn ghost" style="cursor:pointer">🖼️ Choisir une photo<input type="file" accept="image/*" hidden id="fic"></label>
    </div>
    <p class="vie">📷 La photo part seulement chez l'IA (Gemini ou Claude) pour être notée, puis elle est oubliée.</p>`;
  const video = zone.querySelector("video"), img = zone.querySelector("img"), ch = zone.querySelector("#ch"), act = zone.querySelector("#act");
  let arretCam = null, avant = false, photo = null, minut = null;
  const arret = () => { clearInterval(minut); if(arretCam){ arretCam(); arretCam = null; } };
  function montrer(p){
    photo = p; arret(); video.hidden = true; img.hidden = false; img.src = p.url;
    act.innerHTML = `<button class="btn so-gros" id="env">🤖 Faire noter</button><button class="btn ghost" id="refaire">🔁 Refaire</button>`;
    act.querySelector("#refaire").onclick = () => { photo = null; img.hidden = true; video.hidden = false; act.innerHTML = ""; boutonsCam(); };
    act.querySelector("#env").onclick = async () => {
      act.innerHTML = `<p class="so-attente">🤖 L'IA regarde votre photo…</p>`;
      try{ const r = await noter(V.defi, photo); envoyer({t: "note", note: r.note, com: r.com}); }
      catch(e){ act.innerHTML = `<p class="so-attente">❌ ${esc(e.message)}</p><button class="btn" id="re">Réessayer</button>`; act.querySelector("#re").onclick = () => montrer(photo); }
    };
  }
  async function ouvrir(){
    Apero.audio();
    if(arretCam) arretCam();
    try{ arretCam = await Apero.camera(video, avant); video.classList.toggle("miroir", avant); }
    catch(e){ Base.toast("Caméra indisponible : choisis une photo"); return; }
    act.innerHTML = `<button class="btn so-gros" id="clic">📸 Photo dans ${PREPA} s</button><button class="btn ghost" id="tourner">🔄 Retourner</button>`;
    act.querySelector("#tourner").onclick = () => { avant = !avant; ouvrir(); };
    act.querySelector("#clic").onclick = () => {
      act.innerHTML = ""; let n = PREPA; ch.textContent = n; Apero.son(520, 80);
      minut = setInterval(() => {
        n--;
        if(n > 0){ ch.textContent = n; Apero.son(520, 80); return; }
        clearInterval(minut); ch.textContent = ""; Apero.son(1200, 60, "square");
        montrer(reduire(video, video.videoWidth, video.videoHeight, avant));
      }, 1000);
    };
  }
  function boutonsCam(){
    act.innerHTML = `<button class="btn so-gros" id="ouvrir">📷 Ouvrir la caméra</button>
      <label class="btn ghost" style="cursor:pointer">🖼️ Choisir une photo<input type="file" accept="image/*" hidden id="fic"></label>`;
    lier();
  }
  function lier(){
    act.querySelector("#ouvrir").onclick = ouvrir;
    act.querySelector("#fic").onchange = e => {
      const f = e.target.files[0]; if(!f) return;
      const im = new Image();
      im.onload = () => { montrer(reduire(im, im.naturalWidth, im.naturalHeight, false)); URL.revokeObjectURL(im.src); };
      im.src = URL.createObjectURL(f);
    };
  }
  lier();
  return arret;
}

Apero.jeu({
  entete: ENTETE,
  jeu: "pose", titre: "Recrée la pose", emoji: "📸", min: 2, max: 16, multi: false,
  hero: {texte: "Un défi, une photo, et l'IA vous note sur 10. Mauvaise note ? Tout le monde boit !"},
  reglages: [
    {k: "mode", titre: "Mode", options: [["groupe", "👥 Tous ensemble"], ["equipes", "⚔️ Deux équipes"]], def: "groupe"},
    {k: "nb", titre: "Nombre de défis", options: [[3, "3"], [5, "5"], [8, "8"]], def: 5}
  ],
  nouvelle(joueurs, R){
    const G = {R, J: joueurs.map(j => ({...j})), pioche: melanger(DEFIS.slice()), m: 0, eq: R.mode === "equipes" ? equipes(joueurs) : null, tour: 0, sc: [0, 0], hist: []};
    suivant(G); return G;
  },
  action(G, id, a){
    if(a.t === "autre" && G.phase === "defi"){ suivant(G); return true; }
    if(a.t === "note" && G.phase === "defi"){
      const note = Math.max(0, Math.min(10, Math.round(+a.note || 0)));
      G.res = {note, com: String(a.com || "").slice(0, 300)};
      if(G.eq) G.sc[G.tour] += note;
      G.hist.push({d: G.defi, note, e: G.eq ? G.tour : null});
      G.phase = "res"; return true;
    }
    if(a.t === "suite" && G.phase === "res"){
      if(G.eq && G.tour === 0){ G.tour = 1; suivant(G); return true; }   // l'équipe 2 joue son défi de la manche
      G.m++; G.tour = 0;
      if(G.m >= G.R.nb){ G.phase = "fin"; return true; }
      suivant(G); return true;
    }
    return false;
  },
  depart(){},
  publique(G){ return {phase: G.phase, m: G.m, nb: G.R.nb, defi: G.defi, res: G.res, eq: G.eq, tour: G.tour, sc: G.sc, hist: G.hist, J: G.J, graine: G.graine, R: G.R}; },
  rendre(box, ctx){
    const {V} = ctx, R = V.R;
    const noms = ids => ids.map(id => (V.J.find(j => j.id === id) || {}).nom).filter(Boolean).map(esc).join(", ");
    const haut = `<div class="so-haut"><span>Défi ${Math.min(V.m + 1, V.nb)} / ${V.nb}</span><span>${V.eq ? `🔴 ${V.sc[0]} – ${V.sc[1]} 🔵` : "📸"}</span></div>`;
    const qui = V.eq ? `<p class="equipe">${V.tour ? "🔵" : "🔴"} Équipe ${V.tour + 1} : ${noms(V.eq[V.tour])}</p>` : "";
    if(V.phase === "defi"){
      Apero.phase(box, V._id + ":defi:" + V.m + ":" + V.tour + ":" + V.defi, () => {
        box.innerHTML = `<section class="b-carte">${haut}${qui}<div class="defi">${esc(V.defi)}</div>
          <div class="so-actions" style="margin-top:4px"><button class="btn ghost petit" id="autre">🎲 Autre défi</button></div><div id="zone"></div></section>`;
        box.querySelector("#autre").onclick = () => ctx.envoyer({t: "autre"});
        if(!IA.disponible()) box.querySelector("#zone").innerHTML = `<p class="so-attente">🔑 Il faut une clé IA (Gemini ou Claude) dans les <a href="../../reglages/">⚙️ Réglages</a>.</p>`;
        else return photographier(box.querySelector("#zone"), V, ctx.envoyer);
      });
      return;
    }
    if(V.phase === "res"){
      Apero.phase(box, V._id + ":res:" + V.m + ":" + V.tour, () => {
        const n = V.res.note;
        let peine = "";
        if(!V.eq){
          peine = n < 5 ? `<div class="ap-peine">${Apero.boit(R, "Tout le monde", n < 3 ? 3 : 2, V.graine)}</div>`
            : n < 8 ? `<div class="ap-peine">${Apero.boit(R, "Le photographe", 1, V.graine)}</div>`
            : `<p class="ap-pas">🏆 Magnifique ! Le photographe distribue 3 gorgées.</p>`;
        }else if(V.tour === 1){
          const [a, b] = V.hist.slice(-2).map(h => h.note);
          peine = a === b ? `<div class="ap-peine">🤝 Égalité ${a} à ${b} : tout le monde trinque !</div>`
            : `<div class="ap-peine">${Apero.boit(R, "L'équipe " + (a < b ? "🔴 1" : "🔵 2"), Math.min(4, Math.abs(a - b)), V.graine)}</div>`;
        }
        box.innerHTML = `<section class="b-carte ap-carte">${haut}${qui}<div class="defi" style="font-size:1.1rem">${esc(V.defi)}</div>
          <p class="note">${n}<small> / 10</small></p><p class="com">🤖 ${esc(V.res.com)}</p>${peine}
          <div class="so-actions"><button class="btn so-gros" data-a="suite">${V.eq && V.tour === 0 ? "🔵 Au tour de l'équipe 2" : V.m + 1 >= V.nb ? "🏁 Bilan" : "Défi suivant ➜"}</button></div></section>`;
        box.querySelector("[data-a]").onclick = () => ctx.envoyer({t: "suite"});
      });
      return;
    }
    Apero.phase(box, V._id + ":fin", () => {
      const moy = V.hist.length ? (V.hist.reduce((s, h) => s + h.note, 0) / V.hist.length).toFixed(1) : 0;
      box.innerHTML = `<section class="b-carte"><h2 style="text-align:center;margin:0">🏁 Bilan</h2>
        ${V.eq ? `<p class="ap-gros" style="text-align:center">🔴 ${V.sc[0]} – ${V.sc[1]} 🔵</p><p style="text-align:center;font-weight:800">${V.sc[0] === V.sc[1] ? "Égalité parfaite !" : `Victoire de l'équipe ${V.sc[0] > V.sc[1] ? "🔴 1" : "🔵 2"} !`}</p>`
          : `<p class="ap-gros" style="text-align:center">Moyenne du groupe : ${moy} / 10</p>`}
        <ol class="ap-res">${V.hist.map(h => `<li><span class="n">${h.e != null ? (h.e ? "🔵 " : "🔴 ") : ""}${esc(h.d)}</span><b>${h.note}/10</b></li>`).join("")}</ol>${ctx.finHtml()}</section>`;
    });
  }
});
})();
