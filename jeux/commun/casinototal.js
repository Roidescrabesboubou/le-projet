/* ============================================================
   CLASSEMENT DE TOUT LE CASINO  →  window.CasinoTotal
   Additionne, pour chaque compte, les jetons de tous les jeux
   de casino qui gardent un portefeuille en ligne :
     roulette/<uid>, blackjack/<uid>, casino/<jeu>/<uid>.
   (Le Poker garde ses jetons sur l'appareil : il ne compte pas.)
   À inclure après base.js.
     CasinoTotal.fenetre()        ouvre la fenêtre du classement
     CasinoTotal.bouton(el)       ajoute un bouton qui l'ouvre
     CasinoTotal.charger() → [{id, n, total, detail: {slug: jetons}}]
   ============================================================ */
(function(){
  const BASE = "https://salle-de-jeux-249d2-default-rtdb.europe-west1.firebasedatabase.app";
  const JEUX = [
    ["roulette", "roulette", "🎡"], ["blackjack", "blackjack", "🃏"],
    ["casino/crash", "crash", "🚀"], ["casino/roue", "roue", "💰"], ["casino/course", "course", "🏇"],
    ["casino/machine", "machine", "🎰"], ["casino/plinko", "plinko", "🔴"], ["casino/mines", "mines", "💣"], ["casino/grattage", "grattage", "🎟️"]
  ];
  const fmt = n => Number(Math.floor(n || 0)).toLocaleString("fr-FR");
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));
  let cache = null;

  async function charger(){
    if(cache && Date.now() - cache.t < 30000) return cache.l;
    const parts = await Promise.all(JEUX.map(([chemin]) => fetch(`${BASE}/${chemin}.json`).then(r => r.ok ? r.json() : null).catch(() => null)));
    const par = {};
    parts.forEach((d, i) => {
      const slug = JEUX[i][1];
      for(const [id, v] of Object.entries(d || {})){
        if(!v || typeof v.s !== "number" || !(v.s >= 0)) continue;
        const p = par[id] = par[id] || {id, n: v.n || "Joueur", total: 0, detail: {}, d: 0};
        p.total += v.s; p.detail[slug] = v.s;
        if((v.d || 0) > p.d){ p.d = v.d || 0; p.n = v.n || p.n; }   // le pseudo le plus récent
      }
    });
    const l = Object.values(par).sort((a, b) => b.total - a.total);
    cache = {t: Date.now(), l};
    return l;
  }
  function moi(){ try{ const s = window.Compte && Compte.session && Compte.session(); return s && s.uid; }catch(e){ return null; } }
  async function fenetre(){
    const corps = document.createElement("div");
    corps.innerHTML = `<p style="margin:0 0 8px;color:var(--muted)">Tous les jetons de chaque joueur additionnés : ${JEUX.map(j => j[2]).join(" ")}</p><p>Chargement…</p>`;
    Base.fenetre("🏆 Les plus riches du casino", corps, {bouton: "Fermer"});
    try{
      const l = await charger(), u = moi(), rang = l.findIndex(x => x.id === u);
      const ligne = (x, k) => `<li style="display:flex;flex-direction:column;gap:2px;background:${x.id === u ? "color-mix(in srgb,var(--accent) 18%,var(--card))" : "var(--soft)"};border-radius:12px;padding:7px 12px">
        <span style="display:flex;justify-content:space-between;gap:8px;font-weight:800"><span>${["🥇", "🥈", "🥉"][k] || (k + 1) + "."} ${esc(x.n)}</span><b>${fmt(x.total)}</b></span>
        <small style="color:var(--muted);font-weight:700">${JEUX.filter(j => x.detail[j[1]] > 0).map(j => `${j[2]} ${fmt(x.detail[j[1]])}`).join(" · ")}</small></li>`;
      corps.innerHTML = `<p style="margin:0 0 8px;color:var(--muted)">Tous les jetons de chaque joueur additionnés : ${JEUX.map(j => j[2]).join(" ")}</p>` + (l.length
        ? `<ol style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:5px">${l.slice(0, 20).map(ligne).join("")}</ol>` +
          (rang >= 20 ? `<p style="font-weight:800;margin:10px 0 0">Toi : ${rang + 1}e avec ${fmt(l[rang].total)} jetons</p>` : "")
        : `<p>Personne au classement pour l'instant.</p>`) +
        (u ? "" : `<p style="color:var(--muted);font-size:.85rem;margin:10px 0 0">Connecte-toi pour apparaître au classement : seuls les jetons gardés sur un compte comptent.</p>`);
    }catch(e){ corps.innerHTML = "<p>Classement indisponible pour l'instant.</p>"; }
  }
  function bouton(el, texte){
    const b = document.createElement("button"); b.type = "button"; b.className = "btn ghost petit";
    b.textContent = texte || "🏆 Classement de tout le casino"; b.onclick = fenetre;
    el.appendChild(b); return b;
  }
  window.CasinoTotal = {charger, fenetre, bouton, JEUX};
})();
