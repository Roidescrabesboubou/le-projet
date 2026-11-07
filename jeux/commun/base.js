/* ============================================================
   OUTILS COMMUNS À TOUS LES JEUX  →  window.Base
   À inclure dans chaque nouveau jeu (après garde.js) :
     <script src="../commun/base.js"></script>

   Base.entete({titre, emoji, aide})  en-tête 🏠 / titre / ❓ / ⚙️
   Base.aide(html)                    ouvre la fenêtre des règles
   Base.fenetre(titre, contenu)       fenêtre simple (contenu = texte, HTML ou élément)
   Base.toast(texte)                  petit message qui disparaît
   Base.stock(prefixe)                {lire(cle, defaut), ecrire(cle, valeur)} en JSON
   Base.joueur.pseudo() / .changerPseudo(n) / .avatar() / .changerAvatar(a)
     → le même pseudo et le même avatar pour tout le site
       (le pseudo du compte s'il est connecté, sinon celui des Réglages)
   Base.record(slug, valeur, {mieux:"haut"|"bas", texte})
     → mémorise le record du joueur ; il s'affiche sur la carte de l'accueil
   Défis du jour : Base.jour(Date.UTC(...)) n° du jour (heure de Paris),
     Base.avantMinuit() « hh:mm:ss », Base.dateDuJour(), Base.rng(graine),
     Base.melanger(tableau, rng), Base.partager(texte)
   ============================================================ */
(function(){
  const src = (document.currentScript && document.currentScript.src) || "";
  const RACINE = src.replace(/jeux\/commun\/base\.js.*$/, "");
  const AVATARS = ["😀","😎","🤓","🥳","😺","🐶","🦊","🐼","🐸","🐵","🦄","🐙","🐧","🐯","🐨","👻","🤖","👽","🎃","🌟"];

  function stock(prefixe){
    const p = prefixe || "";
    return {
      lire(k, d){ try{ const v = localStorage.getItem(p + k); return v === null ? d : JSON.parse(v); }catch(e){ return d; } },
      ecrire(k, v){ try{ localStorage.setItem(p + k, JSON.stringify(v)); }catch(e){} },
      effacer(k){ try{ localStorage.removeItem(p + k); }catch(e){} }
    };
  }
  const S = stock("");

  const el = (tag, txt, cls) => { const e = document.createElement(tag); if(txt != null) e.textContent = txt; if(cls) e.className = cls; return e; };

  /* ---------- Joueur ---------- */
  const joueur = {
    pseudo(){
      const s = window.Compte && Compte.session && Compte.session();
      return (s && s.pseudo) || S.lire("salle_pseudo", "") || "";
    },
    changerPseudo(n){ S.ecrire("salle_pseudo", String(n || "").trim().slice(0, 16)); },
    avatar(){ return S.lire("salle_avatar", "") || AVATARS[0]; },
    changerAvatar(a){ S.ecrire("salle_avatar", a); },
    AVATARS
  };

  /* ---------- Records (affichés sur l'accueil) ---------- */
  function record(slug, valeur, o){
    o = o || {};
    const tous = S.lire("salle_records", {});
    const ancien = tous[slug];
    const mieux = o.mieux === "bas" ? (a, b) => a < b : (a, b) => a > b;
    if(ancien && typeof ancien.v === "number" && !mieux(valeur, ancien.v)) return false;
    tous[slug] = {v: valeur, texte: o.texte || String(valeur), d: Date.now()};
    S.ecrire("salle_records", tous);
    return true;
  }
  const records = () => S.lire("salle_records", {});

  /* ---------- Fenêtres ---------- */
  function fenetre(titre, contenu, o){
    o = o || {};
    const d = el("dialog", null, "b-fen");
    const x = el("button", "×", "b-x"); x.setAttribute("aria-label", "Fermer");
    x.onclick = () => d.close();
    d.appendChild(x);
    if(titre) d.appendChild(el("h2", titre));
    const corps = el("div");
    if(contenu instanceof Node) corps.appendChild(contenu);
    else if(o.html) corps.innerHTML = contenu;
    else corps.textContent = contenu || "";
    d.appendChild(corps);
    const ok = el("button", o.bouton || "C'est parti !", "btn");
    ok.style.marginTop = "14px"; ok.onclick = () => d.close();
    d.appendChild(ok);
    d.addEventListener("close", () => { d.remove(); if(o.fermeture) o.fermeture(); });
    d.addEventListener("click", e => { if(e.target === d) d.close(); });
    document.body.appendChild(d);
    d.showModal();
    return d;
  }

  let texteAide = "";
  function aide(html){ return fenetre("❓ Comment jouer", html || texteAide, {html: true}); }

  function toast(t, ms){
    document.querySelectorAll(".b-toast").forEach(n => n.remove());
    const n = el("div", t, "b-toast"); document.body.appendChild(n);
    setTimeout(() => n.remove(), ms || 2500);
  }

  /* ---------- En-tête ---------- */
  function entete(o){
    o = o || {};
    const slug = (location.pathname.match(/\/jeux\/([^/]+)\//) || [])[1] || "";
    const h = el("header", null, "b-entete");
    const g = el("div", null, "b-gauche");
    const maison = el("a", "🏠", "b-ico"); maison.href = RACINE || "../../"; maison.title = "Retour à l'accueil";
    g.appendChild(maison);
    const t = el("h1", (o.emoji ? o.emoji + " " : "") + (o.titre || document.title));
    const dr = el("div", null, "b-droite");
    (o.boutons || []).forEach(b => dr.appendChild(b));
    if(o.aide){
      texteAide = o.aide;
      const q = el("button", "❓", "b-ico"); q.title = "Comment jouer"; q.onclick = () => aide();
      dr.appendChild(q);
      if(slug && !S.lire("salle_aide_vue_" + slug, false)){
        S.ecrire("salle_aide_vue_" + slug, true);
        setTimeout(() => aide(), 300);
      }
    }
    const r = el("a", "⚙️", "b-ico"); r.href = (RACINE || "../../") + "reglages/"; r.title = "Réglages (pseudo, clés IA…)";
    dr.appendChild(r);
    h.append(g, t, dr);
    document.body.insertBefore(h, document.body.firstChild);
    return h;
  }

  /* ---------- Défis du jour (heure de Paris) ---------- */
  const PARIS = {timeZone: "Europe/Paris"};
  /* n° du jour depuis `debut` (Date.UTC), qui change à minuit à Paris */
  function jour(debut){
    const [y, m, d] = new Intl.DateTimeFormat("en-CA", {...PARIS, year:"numeric", month:"2-digit", day:"2-digit"}).format(new Date()).split("-").map(Number);
    return Math.floor((Date.UTC(y, m - 1, d) - debut) / 864e5);
  }
  /* temps restant avant minuit à Paris, « hh:mm:ss » */
  function avantMinuit(){
    const p = new Intl.DateTimeFormat("fr-FR", {...PARIS, hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false}).format(new Date()).split(":").map(Number);
    let r = 86400 - (p[0] * 3600 + p[1] * 60 + p[2]); if(r >= 86400) r = 0;
    const f = n => String(n).padStart(2, "0");
    return `${f(Math.floor(r / 3600))}:${f(Math.floor(r / 60) % 60)}:${f(r % 60)}`;
  }
  const dateDuJour = () => new Date().toLocaleDateString("fr-FR", {...PARIS, weekday:"long", day:"numeric", month:"long"});
  /* hasard reproductible (mulberry32) : même graine → même suite */
  function rng(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function melanger(a, r){ r = r || Math.random; a = [...a]; for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  /* copie le résultat (ou le partage sur téléphone) */
  async function partager(txt){
    try{ await navigator.clipboard.writeText(txt); toast("Résultat copié !"); }
    catch(e){ if(navigator.share) navigator.share({text: txt}).catch(() => {}); else toast("Copie impossible"); }
  }

  window.Base = {RACINE, stock, joueur, record, records, fenetre, aide, toast, entete, el, jour, avantMinuit, dateDuJour, rng, melanger, partager};
})();
