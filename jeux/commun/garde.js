/* ============================================================
   GARDE DES JEUX
   À inclure dans chaque jeu : <script src="../commun/garde.js"></script>
   - Jeu caché ou « bientôt » (panel admin) : un visiteur qui
     arrive par l'adresse directe voit un message au lieu du jeu.
     Les admins connectés peuvent toujours y jouer.
   - Jeu IA (ia: true dans le catalogue) : réservé aux comptes
     autorisés dans le panel admin (et aux admins). Quelqu'un qui
     arrive avec un lien de salle (?salle=CODE) peut seulement
     rejoindre cette salle : la page reçoit la classe
     « invite-seul » pour masquer le reste.
   ============================================================ */
(function(){
  const m = location.pathname.match(/\/jeux\/([^/]+)\//);
  if(!m) return;
  const slug = decodeURIComponent(m[1]);
  const base = (document.currentScript && document.currentScript.src || "").replace(/garde\.js.*$/, "");
  const accueil = base.replace(/jeux\/commun\/$/, "");
  const salle = new URLSearchParams(location.search).get("salle");

  function charger(nom){
    return new Promise(ok => {
      if(nom === "catalogue.js" && window.SALLE_CATALOGUE) return ok();
      if(nom === "compte.js" && window.Compte) return ok();
      const s = document.createElement("script");
      s.src = base + nom; s.onload = ok; s.onerror = ok;
      document.head.appendChild(s);
    });
  }

  const BTN = "display:inline-block;margin:4px;border:0;cursor:pointer;font:700 1rem system-ui,sans-serif;text-decoration:none;padding:10px 18px;border-radius:12px;";
  let voile = null;
  function bloquer(icone, texte, note, actions){
    lever();
    voile = document.createElement("div");
    voile.style.cssText = "position:fixed;inset:0;z-index:99990;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(15,10,22,.94);color:#f3ecf6;font-family:system-ui,sans-serif;text-align:center";
    const b = document.createElement("div");
    b.style.cssText = "max-width:400px";
    const t = document.createElement("div");
    t.style.cssText = "font-size:3rem;margin-bottom:10px";
    t.textContent = icone;
    const p = document.createElement("p");
    p.style.cssText = "font-size:1.1rem;font-weight:700;margin:0 0 10px";
    p.textContent = texte;
    b.append(t, p);
    if(note){ const n = document.createElement("p"); n.style.cssText = "opacity:.75;margin:0 0 18px;font-size:.92rem"; n.textContent = note; b.appendChild(n); }
    (actions || []).forEach(x => b.appendChild(x));
    const a = document.createElement("a");
    a.href = accueil; a.textContent = "← Retour à la salle de jeux";
    a.style.cssText = BTN + "background:transparent;color:#f3ecf6;border:1px solid rgba(255,255,255,.3)";
    b.appendChild(a);
    voile.appendChild(b);
    document.body.appendChild(voile);
    document.documentElement.style.overflow = "hidden";
  }
  function lever(){
    if(voile){ voile.remove(); voile = null; document.documentElement.style.overflow = ""; }
  }

  function bandeau(texte){
    const d = document.createElement("div");
    d.textContent = texte;
    d.style.cssText = "position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:99999;background:#22192b;color:#fff;font:600 .8rem system-ui,sans-serif;padding:6px 12px;border-radius:999px;opacity:.88;pointer-events:none;max-width:92vw;text-align:center";
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 6000);
  }

  (async () => {
    await charger("catalogue.js");
    await charger("compte.js");
    if(!window.Compte) return;
    const jeu = (window.SALLE_CATALOGUE || []).find(j => j.slug === slug) || {slug, etat: "dispo"};
    const {etat} = Compte.etatDe(jeu, await Compte.reglages());

    /* 1. jeu caché / bientôt */
    if(etat !== "dispo"){
      const s = Compte.session();
      if(s && s.admin){ bandeau("🙈 Jeu caché aux visiteurs — tu le vois car tu es admin"); }
      else{
        bloquer(etat === "bientot" ? "🛠️" : "🙈",
          etat === "bientot" ? "Ce jeu arrive bientôt, encore un peu de patience !" : "Ce jeu n'est pas disponible pour le moment.");
        return;
      }
    }

    /* 2. jeu IA : réservé aux membres autorisés */
    if(!jeu.ia) return;
    let dernier = null;
    async function verifier(frais){
      let s = Compte.session();
      if(s && frais) s = await Compte.actualiser();
      const cle = s ? s.uid + ":" + s.ia : "";
      if(cle === dernier) return;
      dernier = cle;
      document.body.classList.remove("invite-seul");
      if(s && s.ia){ lever(); return; }
      if(salle){
        lever();
        document.body.classList.add("invite-seul");
        bandeau("🔗 Tu rejoins la salle " + salle.toUpperCase() + " sur invitation");
        return;
      }
      if(!Compte.pret){
        bloquer("🔒", "Ce jeu est réservé aux membres autorisés.", "Si un membre t'a envoyé un lien de salle, ouvre ce lien pour le rejoindre.");
        return;
      }
      if(!s){
        const b = document.createElement("button");
        b.textContent = "👤 Se connecter"; b.style.cssText = BTN + "background:#e86a92;color:#fff";
        b.onclick = () => Compte.ouvrir("connexion");
        bloquer("🔒", "Ce jeu utilise une IA : il est réservé aux membres autorisés.",
          "Connecte-toi si ton compte a accès. Si un membre t'a envoyé un lien de salle, ouvre ce lien pour le rejoindre sans compte.", [b]);
      }else{
        const b = document.createElement("button");
        b.textContent = "🚪 Changer de compte"; b.style.cssText = BTN + "background:#5b6bd0;color:#fff";
        b.onclick = () => { Compte.deconnecter(); Compte.ouvrir("connexion"); };
        bloquer("🔒", "Ton compte « " + (s.pseudo || "?") + " » n'a pas encore accès aux jeux IA.",
          "Demande à un admin de t'activer l'accès IA. En attendant, tu peux rejoindre une partie avec le lien de salle d'un membre.", [b]);
      }
    }
    /* surChangement est aussi appelé par actualiser() : jamais de rechargement ici (sinon boucle) */
    Compte.surChangement(() => { verifier(false); });
    verifier(true);
  })();
})();
