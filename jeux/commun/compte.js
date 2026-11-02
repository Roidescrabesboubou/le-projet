/* ============================================================
   COMPTES JOUEURS (Firebase Authentication, sans bibliothèque)

   Pour activer les comptes :
   1. Console Firebase → Authentication → « Commencer » →
      Sign-in method → active « E-mail/Mot de passe ».
   2. Console Firebase → Paramètres du projet (⚙️) → Général →
      « Clé API Web » : colle-la dans apiKey ci-dessous.
      (Cette clé est faite pour être publique, pas de souci à la
      mettre sur GitHub : ce sont les règles qui protègent la base.)
   3. Realtime Database → Règles : colle firebase-regles.json.
   4. Crée ton compte sur le site puis va sur /admin/ et clique
      « Devenir administrateur » (possible seulement tant qu'il
      n'y a encore aucun admin).
   ============================================================ */
const FIREBASE = {
  apiKey: "",
  databaseURL: "https://salle-de-jeux-249d2-default-rtdb.europe-west1.firebasedatabase.app"
};

(function(){
  const KEY = FIREBASE.apiKey.trim();
  const DB = FIREBASE.databaseURL.trim().replace(/\/+$/, "");
  const SKEY = "salle_compte";
  const src = (document.currentScript && document.currentScript.src) || "";
  const RACINE = src.replace(/jeux\/commun\/compte\.js.*$/, "");
  const ecouteurs = [];

  /* ---------- outils ---------- */
  function fetchT(url, opts){
    const c = new AbortController(), t = setTimeout(() => c.abort(), 10000);
    return fetch(url, {...opts, signal: c.signal}).finally(() => clearTimeout(t));
  }
  const lire = () => { try{ return JSON.parse(localStorage.getItem(SKEY)) || null; }catch(e){ return null; } };
  const ecrire = s => { try{ s ? localStorage.setItem(SKEY, JSON.stringify(s)) : localStorage.removeItem(SKEY); }catch(e){} };
  let session = lire();

  function notifier(){
    if(session && session.pseudo){ try{ localStorage.setItem("salle_pseudo", JSON.stringify(session.pseudo)); }catch(e){} }
    ecouteurs.forEach(f => { try{ f(session); }catch(e){} });
    document.querySelectorAll(".cp-zone").forEach(dessinerBouton);
  }
  const cleDePseudo = p => p.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9_-]/g, "");

  const MESSAGES = {
    EMAIL_EXISTS: "Un compte existe déjà avec cet e-mail.",
    EMAIL_NOT_FOUND: "E-mail ou mot de passe incorrect.",
    INVALID_PASSWORD: "E-mail ou mot de passe incorrect.",
    INVALID_LOGIN_CREDENTIALS: "E-mail ou mot de passe incorrect.",
    INVALID_EMAIL: "Cet e-mail n'est pas valide.",
    MISSING_PASSWORD: "Entre un mot de passe.",
    WEAK_PASSWORD: "Mot de passe trop faible (6 caractères minimum).",
    USER_DISABLED: "Ce compte a été désactivé.",
    TOO_MANY_ATTEMPTS_TRY_LATER: "Trop de tentatives. Réessaie dans quelques minutes.",
    OPERATION_NOT_ALLOWED: "La connexion par e-mail n'est pas activée dans Firebase (Authentication → Sign-in method).",
    CONFIGURATION_NOT_FOUND: "Firebase Authentication n'est pas encore activé sur ce projet.",
    TOKEN_EXPIRED: "Session expirée, reconnecte-toi.",
    INVALID_REFRESH_TOKEN: "Session expirée, reconnecte-toi."
  };
  function erreur(code){
    const c = String(code || "").split(" ")[0].split(":")[0];
    return new Error(MESSAGES[c] || ("Erreur : " + (code || "inconnue")));
  }

  async function auth(action, corps){
    if(!KEY) throw new Error("Les comptes ne sont pas encore configurés sur ce site.");
    const r = await fetchT(`https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${encodeURIComponent(KEY)}`, {
      method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(corps)
    });
    const j = await r.json().catch(() => ({}));
    if(!r.ok) throw erreur(j.error && j.error.message);
    return j;
  }

  /* Jeton valide (rafraîchi automatiquement) */
  async function jeton(){
    if(!session) throw new Error("Pas connecté.");
    if(session.exp - Date.now() > 60000) return session.id;
    const r = await fetchT(`https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(KEY)}`, {
      method: "POST", headers: {"Content-Type": "application/x-www-form-urlencoded"},
      body: "grant_type=refresh_token&refresh_token=" + encodeURIComponent(session.refresh)
    });
    const j = await r.json().catch(() => ({}));
    if(!r.ok){
      const code = j.error && j.error.message;
      if(/TOKEN|USER_NOT_FOUND|USER_DISABLED/.test(code || "")){ session = null; ecrire(null); notifier(); }
      throw erreur(code);
    }
    session.id = j.id_token; session.refresh = j.refresh_token;
    session.exp = Date.now() + (parseInt(j.expires_in) || 3600) * 1000;
    ecrire(session);
    return session.id;
  }

  /* Accès à la base (avec le jeton si connecté) */
  async function db(chemin, opts = {}){
    let url = `${DB}/${chemin.replace(/^\/+/, "")}.json`;
    const q = [];
    if(opts.auth !== false && session && KEY) q.push("auth=" + encodeURIComponent(await jeton()));
    if(opts.query) q.push(opts.query);
    if(q.length) url += "?" + q.join("&");
    const r = await fetchT(url, {method: opts.method || "GET", body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined});
    const j = await r.json().catch(() => null);
    if(!r.ok){
      if(r.status === 401 || r.status === 403) throw new Error("Accès refusé par la base (règles Firebase à jour ?).");
      throw new Error((j && j.error) || ("HTTP " + r.status));
    }
    return j;
  }

  function ouvrirSession(j, pseudo){
    session = {uid: j.localId, email: j.email, pseudo: pseudo || "", admin: false,
      id: j.idToken, refresh: j.refreshToken, exp: Date.now() + (parseInt(j.expiresIn) || 3600) * 1000};
    ecrire(session);
  }

  /* Recharge pseudo + statut admin depuis la base */
  async function actualiser(){
    if(!session) return session;
    try{
      const [profil, admin] = await Promise.all([
        db(`comptes/${session.uid}`).catch(() => null),
        db(`admins/${session.uid}`).catch(() => null)
      ]);
      if(!session) return null;
      if(profil && profil.pseudo) session.pseudo = profil.pseudo;
      session.admin = admin === true;
      ecrire(session);
    }catch(e){}
    notifier();
    return session;
  }

  async function inscrire(email, mdp, pseudo){
    pseudo = String(pseudo || "").trim().replace(/\s+/g, " ");
    const cle = cleDePseudo(pseudo);
    if(pseudo.length < 2 || pseudo.length > 16) throw new Error("Le pseudo doit faire entre 2 et 16 caractères.");
    if(cle.length < 2) throw new Error("Le pseudo doit contenir au moins 2 lettres ou chiffres.");
    const pris = await db(`pseudos/${cle}`, {auth: false}).catch(() => null);
    if(pris) throw new Error("Ce pseudo est déjà pris.");
    const j = await auth("signUp", {email, password: mdp, returnSecureToken: true});
    ouvrirSession(j, pseudo);
    try{
      await db("", {method: "PATCH", body: {
        [`comptes/${j.localId}`]: {pseudo, cree: {".sv": "timestamp"}},
        [`pseudos/${cle}`]: j.localId
      }});
    }catch(e){
      /* pseudo réservé entre-temps ou règles absentes : on annule le compte */
      try{ await auth("delete", {idToken: j.idToken}); }catch(_){}
      session = null; ecrire(null); notifier();
      throw new Error(/refusé/.test(e.message) ? "Impossible d'enregistrer le profil (pseudo déjà pris, ou règles Firebase pas encore mises à jour)." : e.message);
    }
    await actualiser();
    return session;
  }

  async function connecter(email, mdp){
    const j = await auth("signInWithPassword", {email, password: mdp, returnSecureToken: true});
    ouvrirSession(j, "");
    await actualiser();
    return session;
  }

  function deconnecter(){ session = null; ecrire(null); notifier(); }

  async function motDePasseOublie(email){
    await auth("sendOobCode", {requestType: "PASSWORD_RESET", email});
  }

  /* Réglages du site (jeux cachés, badges, annonce) : lecture publique */
  let cacheReglages = null;
  function reglages(){
    if(!cacheReglages){
      cacheReglages = fetchT(`${DB}/reglages.json`).then(r => r.ok ? r.json() : null).then(j => j || {}).catch(() => ({}));
    }
    return cacheReglages;
  }
  /* Fusionne le catalogue et les réglages admin */
  function etatDe(jeu, regl){
    const o = (regl && regl.jeux && regl.jeux[jeu.slug]) || {};
    return {
      etat: ["dispo", "bientot", "cache"].includes(o.etat) ? o.etat : (jeu.etat || "dispo"),
      badge: typeof o.badge === "string" ? o.badge : (jeu.badge || "")
    };
  }

  /* ---------- interface : bouton + fenêtre ---------- */
  const css = document.createElement("style");
  css.textContent = `
.cp-zone{display:inline-flex;position:relative;font-family:inherit}
.cp-btn{font:inherit;font-weight:700;cursor:pointer;border:1px solid var(--line,#ddd);background:var(--card,#fff);color:var(--text,#222);border-radius:999px;padding:7px 14px;display:inline-flex;gap:6px;align-items:center}
.cp-btn:disabled{opacity:.55;cursor:default}
.cp-menu{position:absolute;right:0;top:calc(100% + 6px);min-width:200px;background:var(--card,#fff);color:var(--text,#222);border:1px solid var(--line,#ddd);border-radius:14px;box-shadow:0 12px 30px rgba(0,0,0,.18);padding:6px;z-index:1000}
.cp-menu small{display:block;padding:6px 10px;color:var(--muted,#777);word-break:break-all}
.cp-menu a,.cp-menu button{display:block;width:100%;text-align:left;font:inherit;background:none;border:0;color:inherit;padding:8px 10px;border-radius:9px;cursor:pointer;text-decoration:none}
.cp-menu a:hover,.cp-menu button:hover{background:var(--bg,#f4f4f4)}
.cp-fond{position:fixed;inset:0;background:rgba(10,6,15,.55);display:flex;align-items:center;justify-content:center;padding:16px;z-index:2000}
.cp-boite{width:100%;max-width:380px;background:var(--card,#fff);color:var(--text,#222);border:1px solid var(--line,#ddd);border-radius:20px;padding:22px;box-shadow:0 20px 50px rgba(0,0,0,.3)}
.cp-onglets{display:flex;gap:6px;margin-bottom:16px}
.cp-onglets button{flex:1;font:inherit;font-weight:700;cursor:pointer;border:1px solid var(--line,#ddd);background:var(--bg,#f6f6f6);color:inherit;border-radius:10px;padding:8px}
.cp-onglets button.on{background:var(--text,#222);color:var(--bg,#fff);border-color:var(--text,#222)}
.cp-boite label{display:block;font-size:.85rem;color:var(--muted,#777);margin:10px 0 4px}
.cp-boite input{width:100%;box-sizing:border-box;font:inherit;padding:10px 12px;border-radius:10px;border:1px solid var(--line,#ddd);background:var(--bg,#fafafa);color:inherit}
.cp-ok{width:100%;margin-top:16px;font:inherit;font-weight:700;cursor:pointer;border:0;border-radius:12px;padding:11px;background:var(--accent,#e86a92);color:#fff}
.cp-ok:disabled{opacity:.6;cursor:default}
.cp-lien{background:none;border:0;color:var(--muted,#777);font:inherit;font-size:.85rem;cursor:pointer;text-decoration:underline;padding:0;margin-top:10px}
.cp-msg{font-size:.88rem;margin:12px 0 0;min-height:1.2em}
.cp-msg.err{color:#d64545}.cp-msg.ok{color:#2fa35a}
.cp-x{float:right;background:none;border:0;font-size:1.3rem;cursor:pointer;color:var(--muted,#777);line-height:1}`;
  document.head.appendChild(css);

  const el = (tag, txt, cls) => { const e = document.createElement(tag); if(txt) e.textContent = txt; if(cls) e.className = cls; return e; };

  function dessinerBouton(zone){
    zone.innerHTML = "";
    const b = el("button", "", "cp-btn");
    if(!KEY){
      b.textContent = "👤 Comptes bientôt"; b.disabled = true;
      b.title = "Les comptes ne sont pas encore activés sur ce site.";
      zone.appendChild(b); return;
    }
    if(!session){
      b.textContent = "👤 Se connecter";
      b.onclick = () => ouvrir("connexion");
      zone.appendChild(b); return;
    }
    b.textContent = "👤 " + (session.pseudo || "Mon compte") + (session.admin ? " ⭐" : "") + " ▾";
    let menu = null;
    const fermer = ev => { if(menu && !zone.contains(ev.target)){ menu.remove(); menu = null; document.removeEventListener("click", fermer); } };
    b.onclick = () => {
      if(menu){ menu.remove(); menu = null; return; }
      menu = el("div", "", "cp-menu");
      menu.appendChild(el("small", session.email || ""));
      if(session.admin){ const a = el("a", "⭐ Panel admin"); a.href = RACINE + "admin/"; menu.appendChild(a); }
      const d = el("button", "🚪 Se déconnecter"); d.onclick = () => { deconnecter(); };
      menu.appendChild(d);
      zone.appendChild(menu);
      setTimeout(() => document.addEventListener("click", fermer), 0);
    };
    zone.appendChild(b);
  }

  function bouton(conteneur){
    const z = el("div", "", "cp-zone");
    conteneur.appendChild(z);
    dessinerBouton(z);
    return z;
  }

  function ouvrir(onglet){
    if(!KEY) return;
    document.querySelectorAll(".cp-fond").forEach(f => f.remove());
    const fond = el("div", "", "cp-fond");
    const boite = el("div", "", "cp-boite");
    fond.appendChild(boite); document.body.appendChild(fond);
    const fermer = () => { fond.remove(); document.removeEventListener("keydown", echap); };
    const echap = e => { if(e.key === "Escape") fermer(); };
    document.addEventListener("keydown", echap);
    fond.addEventListener("mousedown", e => { if(e.target === fond) fermer(); });

    function vue(mode){
      boite.innerHTML = "";
      const x = el("button", "×", "cp-x"); x.onclick = fermer; x.setAttribute("aria-label", "Fermer");
      boite.appendChild(x);
      const ong = el("div", "", "cp-onglets");
      [["connexion", "Connexion"], ["inscription", "Créer un compte"]].forEach(([k, t]) => {
        const o = el("button", t); if(k === mode || (mode === "oubli" && k === "connexion")) o.className = "on";
        o.onclick = () => vue(k); ong.appendChild(o);
      });
      boite.appendChild(ong);
      const form = el("form"); boite.appendChild(form);
      const champ = (lab, type, ac) => {
        form.appendChild(el("label", lab));
        const i = el("input"); i.type = type; i.autocomplete = ac; i.required = true;
        form.appendChild(i); return i;
      };
      let pseudo = null;
      if(mode === "inscription"){ pseudo = champ("Pseudo (affiché dans les classements)", "text", "nickname"); pseudo.maxLength = 16; }
      const email = champ("E-mail", "email", "email");
      const mdp = mode === "oubli" ? null : champ("Mot de passe", "password", mode === "inscription" ? "new-password" : "current-password");
      if(mdp && mode === "inscription") mdp.minLength = 6;
      const ok = el("button", mode === "connexion" ? "Se connecter" : mode === "inscription" ? "Créer mon compte" : "Recevoir un lien", "cp-ok");
      ok.type = "submit"; form.appendChild(ok);
      const msg = el("p", "", "cp-msg"); form.appendChild(msg);
      if(mode === "connexion"){
        const l = el("button", "Mot de passe oublié ?", "cp-lien"); l.type = "button";
        l.onclick = () => vue("oubli"); boite.appendChild(l);
      }
      if(mode === "oubli") msg.textContent = "Entre ton e-mail : tu recevras un lien pour choisir un nouveau mot de passe.";
      form.onsubmit = async e => {
        e.preventDefault();
        ok.disabled = true; msg.className = "cp-msg"; msg.textContent = "Patiente…";
        try{
          if(mode === "connexion") await connecter(email.value.trim(), mdp.value);
          else if(mode === "inscription") await inscrire(email.value.trim(), mdp.value, pseudo.value);
          else{ await motDePasseOublie(email.value.trim()); msg.className = "cp-msg ok"; msg.textContent = "✅ E-mail envoyé ! Regarde aussi dans les spams."; ok.disabled = false; return; }
          msg.className = "cp-msg ok"; msg.textContent = "✅ Bienvenue " + (session.pseudo || "") + " !";
          setTimeout(fermer, 700);
        }catch(err){
          msg.className = "cp-msg err"; msg.textContent = err.message; ok.disabled = false;
        }
      };
      setTimeout(() => (pseudo || email).focus(), 30);
    }
    vue(onglet || "connexion");
  }

  window.Compte = {
    pret: !!KEY, DB, RACINE,
    session: () => session,
    jeton, db, actualiser, inscrire, connecter, deconnecter, motDePasseOublie,
    reglages, etatDe, cleDePseudo, bouton, ouvrir,
    surChangement: f => { ecouteurs.push(f); }
  };

  if(session && KEY) actualiser();
  else if(session && !KEY){ session = null; ecrire(null); }
})();
