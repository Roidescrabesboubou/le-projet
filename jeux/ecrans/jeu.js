/* ecrans : le jeu (chargé seul par index.html, ou avec les autres dans La Soirée) */
(function(){
const {hasard} = Soiree;
const esc = Base.esc;
const LUM = ["#ffd43b", "#69db7c", "#74c0fc", "#ff8787", "#da77f2", "#ffa94d", "#63e6be", "#f783ac"];

const ENTETE = {
  titre: "Roulette des écrans",
  emoji: "🎰",
  aide: `<p>Posez tous vos téléphones en cercle sur la table, écran vers le haut, chacun devant sa place.</p>
    <ul><li>L'hôte range les joueurs dans l'ordre de la table.</li>
    <li>À chaque lancer, une lumière fait le tour des écrans, ralentit… et s'arrête sur un téléphone.</li>
    <li>Son propriétaire subit le sort affiché : boire, distribuer, inventer une règle…</li></ul>`
};

const presents = G => G.J.filter(j => !j.parti);
const jDe = (G, id) => G.J.find(j => j.id === id);
const SORTS = ["boit2", "boit1", "boit3", "donne3", "voisins", "regle", "duo", "tous"];
function texteSort(R, s, nom, graine){
  const n = esc(nom);
  switch(s){
    case "boit1": return Apero.boit(R, nom, 1, graine);
    case "boit2": return Apero.boit(R, nom, 2, graine);
    case "boit3": return Apero.boit(R, nom, 3, graine);
    case "donne3": return `🎯 <b>${n}</b> distribue 3 ${R.boisson === "soft" ? "gages" : "gorgées"} comme bon lui semble`;
    case "voisins": return `👯 <b>${n}</b> et ses deux voisins ${R.boisson === "soft" ? "font un gage ensemble" : "boivent une gorgée"}`;
    case "regle": return `📜 <b>${n}</b> invente une règle qui tient jusqu'au prochain lancer`;
    case "duo": return `🥂 <b>${n}</b> choisit un partenaire : ${R.boisson === "soft" ? "gage à deux" : "vous trinquez et buvez tous les deux"}`;
    case "tous": return `🎉 <b>${n}</b> lève son verre : tout le monde boit !`;
  }
  return "";
}
/* instants (ms après t0) où la lumière change d'écran : de plus en plus lent */
function horaires(N){
  const t = [0];
  for(let k = 1; k <= N; k++) t.push(t[k - 1] + 65 + 560 * Math.pow(k / N, 3));
  return t;
}

function roulette(el, V, moi, maintenant, R){
  const n = V.ordre.length, mon = V.ordre.indexOf(moi), sp = V.spin;
  const T = horaires(sp.N), cible = V.ordre[sp.N % n];
  const j = jDe(V, cible) || {nom: "?", av: "?"};
  const lum = LUM[(mon < 0 ? 0 : mon) % LUM.length];
  el.style.setProperty("--lum", lum);
  const msg = el.querySelector(".msg");
  let dernier = -1, fini = false;
  const tic = setInterval(() => {
    const t = maintenant() - sp.t0;
    if(t < 0){ msg.textContent = "🎰 Ça tourne…"; return; }
    let k = 0; while(k < sp.N && T[k + 1] <= t) k++;
    if(k !== dernier){
      dernier = k;
      const moiAllume = k % n === mon;
      el.classList.toggle("allume", moiAllume && k < sp.N);
      if(moiAllume && k < sp.N){ Apero.son(500 + mon * 60, 50, "square", .12); }
    }
    if(k >= sp.N && t >= T[sp.N] + 250 && !fini){
      fini = true; clearInterval(tic);
      el.classList.remove("allume");
      if(cible === moi){ el.classList.add("gagne"); Apero.boum(600); Apero.vibrer([300, 100, 300]); msg.innerHTML = "👉 C'est toi !<br>" + texteSort(R, sp.sort, j.nom, sp.graine); }
      else msg.innerHTML = `👉 ${esc(j.av)} ${esc(j.nom)}<br>` + texteSort(R, sp.sort, j.nom, sp.graine);
    }
  }, 25);
  return () => clearInterval(tic);
}

Apero.jeu({
  entete: ENTETE,
  bilan(G){
    const sp = G.spin, n = G.ordre.length;
    if(!sp || !n || Date.now() < sp.t0 + horaires(sp.N)[sp.N] + 300) return [];
    const i = sp.N % n, c = G.ordre[i], k = "s" + sp.k + ":";
    if(/^boit[123]$/.test(sp.sort)) return [[k + c, c, +sp.sort.slice(4)]];
    if(sp.sort === "voisins") return [...new Set([G.ordre[(i + n - 1) % n], c, G.ordre[(i + 1) % n]])].map(id => [k + id, id, 1]);
    if(sp.sort === "tous") return G.ordre.map(id => [k + id, id, 1]);
    return [];
  },
  jeu: "ecrans", titre: "Roulette des écrans", emoji: "🎰", min: 2, max: 12, local: false,
  hero: {
    texte: "Tous les téléphones en cercle sur la table : une lumière passe d'écran en écran, ralentit… et tombe sur quelqu'un.",
    etapes: ["1 · Téléphones en cercle", "2 · Ça tourne", "3 · Le sort tombe"]
  },
  nouvelle(joueurs, R){ return {R, J: joueurs.map(j => ({...j})), ordre: joueurs.map(j => j.id), phase: "placer", spin: null, nb: 0, hote: joueurs[0].id}; },
  action(G, id, a){
    if(id !== G.hote) return false;
    if(a.t === "monter" || a.t === "descendre"){
      const i = G.ordre.indexOf(a.j), k = a.t === "monter" ? i - 1 : i + 1;
      if(i < 0 || k < 0 || k >= G.ordre.length) return false;
      [G.ordre[i], G.ordre[k]] = [G.ordre[k], G.ordre[i]]; return true;
    }
    if(a.t === "placer"){ G.phase = "placer"; G.spin = null; return true; }
    if(a.t === "pret" && G.phase === "placer"){ G.phase = "jeu"; return true; }
    if(a.t === "lancer" && G.phase === "jeu" && G.ordre.length){
      const n = G.ordre.length, tours = 2 + Math.floor(Math.random() * 2);
      G.nb++;
      G.spin = {k: G.nb, t0: Date.now() + 900, N: tours * n + Math.floor(Math.random() * n), sort: hasard(SORTS), graine: Math.floor(Math.random() * 1e6)};
      return true;
    }
    return false;
  },
  depart(G, id){ const j = jDe(G, id); if(j) j.parti = true; G.ordre = G.ordre.filter(x => x !== id); if(G.phase === "jeu") G.spin = null; },
  arrivee(G, j){ if(!jDe(G, j.id)){ G.J.push({...j}); G.ordre.push(j.id); } },
  publique(G){ return {phase: G.phase, J: G.J, ordre: G.ordre, spin: G.spin, R: G.R, hote: G.hote}; },
  rendre(box, ctx){
    const {V, moi} = ctx, R = V.R;
    if(V.phase === "placer"){
      if(box._stop){ box._stop(); box._stop = null; }
      box._phase = null; box.innerHTML = "";
      const mon = V.ordre.indexOf(moi);
      box.innerHTML = `<section class="b-carte">
        <h2 style="text-align:center;margin:0">🎰 Placez vos téléphones</h2>
        <p class="muted" style="text-align:center">Écran vers le haut devant chaque place, en cercle. ${ctx.hote ? "Range les joueurs dans l'ordre de la table (sens des aiguilles d'une montre)." : "L'hôte range les joueurs dans l'ordre de la table."}</p>
        ${mon >= 0 ? `<p class="ap-gros" style="text-align:center">Tu es le n° ${mon + 1}</p>` : ""}
        <ol class="ordre">${V.ordre.map((id, i) => { const j = jDe(V, id) || {}; return `<li><span class="r">${i + 1}</span><span class="av">${esc(j.av)}</span><span class="n">${esc(j.nom)}${id === moi ? " (toi)" : ""}</span>
          ${ctx.hote ? `<button data-a="monter" data-j="${esc(id)}" ${i ? "" : "disabled"}>↑</button><button data-a="descendre" data-j="${esc(id)}" ${i < V.ordre.length - 1 ? "" : "disabled"}>↓</button>` : ""}</li>`; }).join("")}</ol>
        ${ctx.hote ? `<div class="so-actions"><button class="btn so-gros" data-a="pret">✅ C'est rangé</button></div>` : `<p class="so-attente">⏳ L'hôte range la table…</p>`}
        <p class="so-note">💡 Montez le son et désactivez la mise en veille.</p></section>`;
      box.querySelectorAll("[data-a]").forEach(b => b.onclick = () => { Apero.audio(); Apero.eveil(); ctx.envoyer({t: b.dataset.a, j: b.dataset.j}); });
      return;
    }
    const sp = V.spin, cle = V._id + ":jeu:" + (sp ? sp.k : 0) + ":" + V.ordre.join(",");
    Apero.phase(box, cle, () => {
      const mon = V.ordre.indexOf(moi), j = jDe(V, moi) || {av: "📱", nom: ""};
      box.innerHTML = `<div class="plein" id="pl"><div class="av">${esc(j.av)}</div><div class="nom">${mon >= 0 ? "n° " + (mon + 1) : ""} ${esc(j.nom)}</div>
        <div class="msg">${sp ? "" : ctx.hote ? "Touche « Lancer » quand tout le monde est prêt" : "⏳ L'hôte va lancer…"}</div>
        <div class="bas">${Apero.sonActif() ? "" : `<button class="btn ghost petit" data-a="son">🔊 Activer le son</button>`}${ctx.hote ? `<button class="btn so-gros" data-a="lancer">🎰 Lancer</button><button class="btn ghost petit" data-a="placer">↕️ Ordre</button>` : ""}</div></div>`;
      box.querySelectorAll("[data-a]").forEach(b => b.onclick = () => { Apero.audio(); Apero.eveil(); if(b.dataset.a === "son"){ b.remove(); Apero.son(660, 120); } else ctx.envoyer({t: b.dataset.a}); });
      Apero.eveil();
      if(sp) return roulette(box.querySelector("#pl"), V, moi, ctx.maintenant, R);
    });
  }
});
})();
