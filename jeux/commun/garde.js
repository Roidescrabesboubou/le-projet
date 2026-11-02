/* ============================================================
   GARDE DES JEUX CACHÉS
   À inclure dans chaque jeu : <script src="../commun/garde.js"></script>
   Si l'admin a caché le jeu (ou l'a mis en « bientôt »), un
   visiteur qui arrive par l'adresse directe voit un message au
   lieu du jeu. Les admins connectés peuvent toujours y jouer.
   ============================================================ */
(function(){
  const m = location.pathname.match(/\/jeux\/([^/]+)\//);
  if(!m) return;
  const slug = decodeURIComponent(m[1]);
  const base = (document.currentScript && document.currentScript.src || "").replace(/garde\.js.*$/, "");

  function charger(nom){
    return new Promise(ok => {
      if(nom === "catalogue.js" && window.SALLE_CATALOGUE) return ok();
      if(nom === "compte.js" && window.Compte) return ok();
      const s = document.createElement("script");
      s.src = base + nom; s.onload = ok; s.onerror = ok;
      document.head.appendChild(s);
    });
  }

  function bloquer(etat){
    const f = document.createElement("div");
    f.style.cssText = "position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(15,10,22,.92);color:#f3ecf6;font-family:system-ui,sans-serif;text-align:center";
    const b = document.createElement("div");
    b.style.cssText = "max-width:380px";
    const t = document.createElement("div");
    t.style.cssText = "font-size:3rem;margin-bottom:10px";
    t.textContent = etat === "bientot" ? "🛠️" : "🙈";
    const p = document.createElement("p");
    p.style.cssText = "font-size:1.1rem;font-weight:700;margin:0 0 18px";
    p.textContent = etat === "bientot" ? "Ce jeu arrive bientôt, encore un peu de patience !" : "Ce jeu n'est pas disponible pour le moment.";
    const a = document.createElement("a");
    a.href = base.replace(/jeux\/commun\/$/, "");
    a.textContent = "← Retour à la salle de jeux";
    a.style.cssText = "display:inline-block;background:#e86a92;color:#fff;text-decoration:none;font-weight:700;padding:10px 18px;border-radius:12px";
    b.append(t, p, a); f.appendChild(b);
    document.body.appendChild(f);
    document.documentElement.style.overflow = "hidden";
  }

  function bandeauAdmin(){
    const d = document.createElement("div");
    d.textContent = "🙈 Jeu caché aux visiteurs — tu le vois car tu es admin";
    d.style.cssText = "position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:99999;background:#22192b;color:#fff;font:600 .8rem system-ui,sans-serif;padding:6px 12px;border-radius:999px;opacity:.85;pointer-events:none";
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 6000);
  }

  (async () => {
    await charger("catalogue.js");
    await charger("compte.js");
    if(!window.Compte) return;
    const jeu = (window.SALLE_CATALOGUE || []).find(j => j.slug === slug) || {slug, etat: "dispo"};
    const {etat} = Compte.etatDe(jeu, await Compte.reglages());
    if(etat === "dispo") return;
    const s = Compte.session();
    if(s && s.admin){ bandeauAdmin(); return; }
    bloquer(etat);
  })();
})();
