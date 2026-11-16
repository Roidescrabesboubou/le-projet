/* contrat : le jeu (chargé seul par index.html, ou avec les autres dans La Soirée) */
(function(){
const {melanger, hasard, podium} = Soiree;
const esc = Base.esc;
const ATTENTE_ACCUSATION = 120000;   // une accusation toutes les 2 minutes

const ENTETE = {
  titre: "Le Contrat",
  emoji: "🗡️",
  aide: `<p>Un jeu qui dure toute la soirée. Chacun reçoit en secret <b>une cible</b> et <b>une mission</b> : « fais-lui dire le mot ananas », « fais-lui trinquer avec toi »…</p>
    <ul><li>Mission réussie ? Touche <b>« Contrat rempli »</b> : ta cible confirme sur son téléphone, elle <b>boit</b>, tu marques un point et tu reçois un nouveau contrat.</li>
    <li>Mission impossible ? Change-la contre une gorgée.</li>
    <li>Tu crois savoir qui te vise ? <b>Accuse-le</b> : si c'est vrai, il boit 2 gorgées et perd son contrat ; sinon, tu bois.</li>
    <li>Garde ton téléphone pour toi : le contrat ne s'affiche que si tu restes appuyé dessus.</li></ul>`
};

const presents = G => G.J.filter(j => !j.parti);
const jDe = (G, id) => G.J.find(j => j.id === id);
const nom = (G, id) => (jDe(G, id) || {nom: "?"}).nom;
function mission(G){ if(!G.pioche.length) G.pioche = melanger(window.CONTRAT_MISSIONS.slice()); return G.pioche.pop(); }
function nouveauContrat(G, id, evite){
  const l = presents(G).filter(j => j.id !== id && j.id !== evite);
  const cibles = l.length ? l : presents(G).filter(j => j.id !== id);
  if(!cibles.length){ delete G.C[id]; return; }
  G.C[id] = {cible: hasard(cibles).id, m: mission(G), n: (G.C[id] ? G.C[id].n : 0) + 1};
}
function noter(G, t){ G.log.unshift({t, h: Date.now()}); G.log = G.log.slice(0, 25); }

Apero.jeu({
  entete: ENTETE,
  jeu: "contrat", titre: "Le Contrat", emoji: "🗡️", min: 3, max: 16, local: false,
  hero: {
    texte: "Chacun reçoit en secret une cible et une mission à lui faire faire sans se faire griller. Ça dure toute la soirée !",
    etapes: ["1 · Lis ton contrat en secret", "2 · Piège ta cible", "3 · Méfie-toi de tout le monde"]
  },
  nouvelle(joueurs, R){
    const G = {R, J: joueurs.map(j => ({...j, pts: 0, bu: 0})), C: {}, V: {}, acc: {}, log: [], pioche: melanger(window.CONTRAT_MISSIONS.slice()), phase: "jeu", hote: joueurs[0].id};
    // cibles en chaîne : chacun vise le suivant d'un cercle mélangé (personne n'est visé deux fois au départ)
    const ordre = melanger(joueurs.map(j => j.id));
    ordre.forEach((id, i) => { G.C[id] = {cible: ordre[(i + 1) % ordre.length], m: mission(G), n: 1}; });
    noter(G, "🗡️ Les contrats sont distribués. Bonne chance…");
    return G;
  },
  action(G, id, a){
    const j = jDe(G, id); if(!j || G.phase !== "jeu") { if(a.t === "finir" && id === G.hote){ G.phase = "fin"; return true; } return false; }
    const c = G.C[id];
    if(a.t === "fait" && c && !G.V[c.cible]){
      G.V[c.cible] = {tueur: id, m: c.m, n: c.n}; return true;
    }
    if(a.t === "confirme" && G.V[id]){
      const v = G.V[id]; delete G.V[id];
      const t = jDe(G, v.tueur); if(!t) return true;
      const cc = G.C[v.tueur];
      if(a.oui){
        if(!cc || cc.cible !== id || cc.n !== v.n) return true;   // contrat changé entre-temps
        t.pts++; j.bu += 2;
        noter(G, `💀 ${t.nom} a eu ${j.nom} : « ${v.m} »`);
        nouveauContrat(G, v.tueur, id);
      }else noter(G, `⚖️ ${j.nom} conteste le contrat de ${t.nom}. À la table de trancher !`);
      return true;
    }
    if(a.t === "changer" && c){
      c.m = mission(G); c.n++; j.bu++;
      noter(G, `🔄 ${j.nom} a changé de mission (1 gorgée)`);
      return true;
    }
    if(a.t === "accuse" && jDe(G, a.c) && a.c !== id){
      if(G.acc[id] && Date.now() - G.acc[id] < ATTENTE_ACCUSATION) return false;
      G.acc[id] = Date.now();
      const s = jDe(G, a.c), cs = G.C[a.c];
      if(cs && cs.cible === id){
        s.bu += 2; j.pts++;
        noter(G, `🕵️ ${j.nom} a démasqué ${s.nom} ! ${s.nom} boit 2 gorgées et reçoit un nouveau contrat`);
        delete G.V[id];
        nouveauContrat(G, a.c, id);
      }else{
        j.bu++;
        noter(G, `❌ ${j.nom} a accusé ${s.nom} à tort (1 gorgée)`);
      }
      return true;
    }
    if(a.t === "finir" && id === G.hote){ G.phase = "fin"; return true; }
    return false;
  },
  depart(G, id){
    const j = jDe(G, id); if(!j) return;
    j.parti = true; delete G.C[id]; delete G.V[id];
    for(const [k, v] of Object.entries(G.V)) if(v.tueur === id) delete G.V[k];
    // ceux qui le visaient reçoivent une nouvelle cible
    for(const [k, c] of Object.entries(G.C)) if(c.cible === id) nouveauContrat(G, k, id);
    noter(G, `🚪 ${j.nom} a quitté la partie`);
  },
  arrivee(G, j){
    if(jDe(G, j.id)) return;
    G.J.push({...j, pts: 0, bu: 0}); nouveauContrat(G, j.id);
    noter(G, `👋 ${j.nom} rejoint la partie`);
  },
  publique(G){ return {phase: G.phase, J: G.J, log: G.log.slice(0, 12), R: G.R, hote: G.hote}; },
  privee(G, id){
    const c = G.C[id], v = G.V[id];
    const mien = c && Object.entries(G.V).find(([k, x]) => x.tueur === id);
    return {
      c: c ? {cible: nom(G, c.cible), av: (jDe(G, c.cible) || {}).av, m: c.m, n: c.n} : null,
      v: v ? {tueur: nom(G, v.tueur), m: v.m} : null,
      enVal: mien ? nom(G, mien[0]) : null,
      acc: G.acc[id] || 0
    };
  },
  rendre(box, ctx){
    const {V, P, moi} = ctx, R = V.R;
    if(V.phase === "fin"){
      box.innerHTML = `<section class="b-carte"><h2 style="text-align:center;margin:0">🏁 Le meilleur tueur à gages</h2>${podium(V.J, moi, {unite: "💀"})}
        <p class="so-note">${V.J.map(j => `${esc(j.nom)} : ${j.bu} ${R.boisson === "soft" ? "gage" : "gorgée"}${j.bu > 1 ? "s" : ""}`).join(" · ")}</p>${ctx.finHtml()}</section>`;
      return;
    }
    const p = P || {};
    const accOk = ctx.maintenant() - (p.acc || 0) >= ATTENTE_ACCUSATION;
    clearTimeout(box._acc);
    if(!accOk) box._acc = setTimeout(() => { const b = box.querySelector('[data-a="accuser"]'); if(b) b.disabled = false; }, ATTENTE_ACCUSATION - (ctx.maintenant() - p.acc) + 200);
    box.innerHTML = `
      ${p.v ? `<section class="valider"><p>🗡️ ${esc(p.v.tueur)} dit t'avoir eu :</p><p style="font-size:1.15rem">« ${esc(p.v.m)} »</p><p>C'est vrai ?</p>
        <div class="so-actions"><button class="btn so-gros" data-a="oui">😩 Oui, je me suis fait avoir</button><button class="btn ghost" data-a="non">🙅 Non, c'est faux</button></div></section>` : ""}
      <section class="b-carte">
        ${p.c ? `<div class="dossier" id="dos"><div class="cache">🔒 Reste appuyé pour lire ton contrat</div>
          <div class="vu"><small>TA CIBLE</small><div class="cible">${esc(p.c.av || "")} ${esc(p.c.cible)}</div><small>TA MISSION</small><div class="mission">${esc(p.c.m)}</div></div></div>` :
          `<p class="so-attente">Pas de contrat pour l'instant…</p>`}
        ${p.enVal ? `<p class="so-attente">⏳ ${esc(p.enVal)} doit confirmer sur son téléphone…</p>` : ""}
        <div class="boutons">
          <button class="btn plein" data-a="fait" ${!p.c || p.enVal ? "disabled" : ""}>✅ Contrat rempli !</button>
          <button class="btn ghost" data-a="changer" ${p.c ? "" : "disabled"}>🔄 Changer (1 ${R.boisson === "soft" ? "gage" : "🍺"})</button>
          <button class="btn ghost" data-a="accuser" ${accOk ? "" : "disabled"}>🕵️ J'accuse…</button>
        </div>
        <div id="acc" hidden><p class="so-note">Qui te vise ? Si tu as raison il boit 2, sinon tu bois 1.</p>
          <div class="so-choix">${V.J.filter(j => !j.parti && j.id !== moi).map(j => `<button data-c="${esc(j.id)}"><span class="av">${esc(j.av)}</span>${esc(j.nom)}</button>`).join("")}</div></div>
      </section>
      <section class="b-carte"><h3 style="margin:0">🏆 Score</h3>${podium(V.J, moi, {unite: "💀"})}
        <h3 style="margin:14px 0 0">📰 Journal</h3><ul class="journal">${V.log.map(l => `<li>${esc(l.t)}</li>`).join("")}</ul>
        ${ctx.hote ? `<div class="so-actions"><button class="btn ghost petit" data-a="finir">🏁 Finir la partie</button></div>` : ""}</section>`;
    const dos = box.querySelector("#dos");
    if(dos){
      const ouvrir = e => { e.preventDefault(); dos.classList.add("ouvert"); }, fermer = () => dos.classList.remove("ouvert");
      dos.onpointerdown = ouvrir; dos.onpointerup = fermer; dos.onpointerleave = fermer; dos.onpointercancel = fermer;
      dos.oncontextmenu = e => e.preventDefault();
    }
    box.querySelectorAll("[data-a]").forEach(b => b.onclick = () => {
      const a = b.dataset.a;
      if(a === "oui" || a === "non") return ctx.envoyer({t: "confirme", oui: a === "oui"});
      if(a === "accuser"){ box.querySelector("#acc").hidden = !box.querySelector("#acc").hidden; return; }
      if(a === "changer" && !confirm("Changer de mission contre 1 gorgée ?")) return;
      if(a === "finir" && !confirm("Finir la partie pour tout le monde ?")) return;
      ctx.envoyer({t: a});
    });
    box.querySelectorAll("[data-c]").forEach(b => b.onclick = () => {
      if(confirm(`Accuser ${b.textContent.trim()} ?`)) ctx.envoyer({t: "accuse", c: b.dataset.c});
    });
  }
});
})();
