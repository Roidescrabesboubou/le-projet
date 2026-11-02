/* ============================================================
   CLASSEMENT PARTAGÉ (commun à tous les joueurs)
   Les scores sont stockés dans une Realtime Database Firebase (gratuite).
   Colle ci-dessous l'URL de ta base, par exemple :
   "https://salle-de-jeux-default-rtdb.europe-west1.firebasedatabase.app"
   Tant que l'URL est vide, chaque jeu utilise seulement le classement
   de l'appareil (comme avant).
   Les règles de sécurité à coller dans Firebase sont dans firebase-regles.json.
   ============================================================ */
const CLASSEMENT_URL = "";

(function(){
  const BASE = CLASSEMENT_URL.trim().replace(/\/+$/,"");
  const enLigne = /^https:\/\/[^/]+$/.test(BASE);
  let portee = enLigne ? "web" : "local";

  const css = document.createElement("style");
  css.textContent = `.cl-scope{display:flex;gap:6px;margin-bottom:10px;width:100%}
.cl-scope button{flex:1;border:1px solid var(--line);background:var(--bg);color:var(--text);border-radius:10px;padding:6px;font-weight:700;font-size:.85rem;cursor:pointer}
.cl-scope button.on{background:var(--text);color:var(--bg);border-color:var(--text)}
.cl-note{font-size:.8rem;opacity:.75;margin:4px 0 0;text-align:center}
.cl-titre{font-weight:800;font-size:.85rem;margin:2px 0;opacity:.9}`;
  document.head.appendChild(css);

  function fetchT(url, opts){
    const c = new AbortController(), t = setTimeout(()=>c.abort(), 8000);
    return fetch(url, {...opts, signal:c.signal}).finally(()=>clearTimeout(t));
  }
  const el = (tag, txt, cls) => { const e = document.createElement(tag); if(txt) e.textContent = txt; if(cls) e.className = cls; return e; };
  const meilleur = (a, b, champ, asc) => asc ? a[champ] < b[champ] : a[champ] > b[champ];

  /* Top 10 mondial d'un jeu (asc = le plus petit gagne, ex. un temps) */
  async function top(cle, champ, asc){
    const q = `orderBy=${encodeURIComponent('"'+champ+'"')}&${asc ? "limitToFirst" : "limitToLast"}=10`;
    const r = await fetchT(`${BASE}/scores/${cle}.json?${q}`);
    if(!r.ok) throw new Error("HTTP " + r.status);
    const j = (await r.json()) || {};
    const l = Object.entries(j).map(([id, e]) => ({...e, id}))
      .filter(e => e && typeof e.n === "string" && typeof e[champ] === "number");
    l.sort((a, b) => asc ? a[champ] - b[champ] : b[champ] - a[champ]);
    return l.slice(0, 10);
  }
  async function ajouter(cle, entree){
    const r = await fetchT(`${BASE}/scores/${cle}.json`, {method:"POST", body:JSON.stringify({...entree, d:{".sv":"timestamp"}})});
    if(!r.ok) throw new Error("HTTP " + r.status);
    return (await r.json()).name;
  }
  const qualifie = (l, champ, asc, v) => l.length < 10 || meilleur({[champ]:v}, l[l.length-1], champ, asc);

  function lirePseudo(){ try{ return JSON.parse(localStorage.getItem("salle_pseudo")) || ""; }catch(e){ return ""; } }
  function ecrirePseudo(n){ try{ localStorage.setItem("salle_pseudo", JSON.stringify(n)); }catch(e){} }

  /* Tableau consultable (bouton 🏆) : bascule Tous les joueurs / Cet appareil */
  async function tableau(zone, o){
    const jeton = zone._cl = (zone._cl || 0) + 1;
    zone.innerHTML = "";
    if(enLigne && o.bascule !== false){
      const s = el("div", "", "cl-scope");
      [["web","🌍 Tous les joueurs"],["local","📱 Cet appareil"]].forEach(([k, t]) => {
        const b = el("button", t); if(k === portee) b.className = "on";
        b.onclick = () => { portee = k; tableau(zone, o); };
        s.appendChild(b);
      });
      zone.appendChild(s);
    }
    const box = el("div"); zone.appendChild(box);
    const max = o.max || 10;
    if(!enLigne || portee === "local"){ o.rendu(box, o.liste().slice(0, max), -1); return; }
    box.appendChild(el("p", "Chargement…", "cl-note"));
    try{
      const l = await top(o.cle, o.champ, o.asc);
      if(zone._cl !== jeton) return;
      o.rendu(box, l.slice(0, max), -1);
    }catch(e){
      if(zone._cl !== jeton) return;
      box.innerHTML = "";
      box.appendChild(el("p", "Classement mondial indisponible pour le moment (connexion ?).", "cl-note"));
    }
  }

  /* Fin de partie : demande le prénom si le score entre dans un top 10
     (mondial ou de l'appareil), l'enregistre et affiche le classement. */
  async function finDePartie(o){
    const z = o.zone, v = o.entree[o.champ];
    z.innerHTML = "";
    const loc = v > 0 && o.local.qualifie(v);
    let web = null, webOK = false, erreur = false;
    if(enLigne){
      const att = el("p", "Chargement du classement…", "cl-note"); z.appendChild(att);
      try{ web = await top(o.cle, o.champ, o.asc); webOK = v > 0 && qualifie(web, o.champ, o.asc, v); }
      catch(e){ erreur = true; }
      att.remove();
    }
    const montrer = (idWeb, idxLocal, envoiRate) => {
      z.innerHTML = "";
      if(web){
        z.appendChild(el("p", "🌍 Classement de tous les joueurs", "cl-titre"));
        const b = el("div"); b.style.width = "100%"; z.appendChild(b);
        o.rendu(b, web, idWeb ? web.findIndex(e => e.id === idWeb) : -1);
      }else{
        z.appendChild(el("p", "📱 Classement sur cet appareil", "cl-titre"));
        const b = el("div"); b.style.width = "100%"; z.appendChild(b);
        o.rendu(b, o.local.liste(), idxLocal ?? -1);
      }
      if(erreur) z.appendChild(el("p", "Classement mondial indisponible pour le moment : ton score est gardé sur cet appareil.", "cl-note"));
      if(envoiRate) z.appendChild(el("p", "L'envoi au classement mondial a échoué : ton score est gardé sur cet appareil.", "cl-note"));
      if(o.apres) o.apres();
    };
    if(!loc && !webOK){ montrer(); return; }

    const p = el("p", webOK ? "🌍 Tu entres dans le top 10 de tous les joueurs ! Ton prénom :" : "🎉 Nouveau record sur cet appareil ! Ton prénom :");
    const row = el("div", "", "namerow");
    const inp = el("input"); inp.maxLength = 16; inp.value = lirePseudo(); inp.placeholder = "Prénom";
    const ok = el("button", "OK", "btn");
    let fait = false;
    const save = async () => {
      if(fait) return; fait = true; ok.disabled = true;
      const n = (inp.value.trim() || "Anonyme").slice(0, 16); ecrirePseudo(n);
      const e = {...o.entree, n};
      const idx = loc ? o.local.ajouter({...e, d:Date.now()}) : -1;
      if(webOK){
        try{ const id = await ajouter(o.cle, e); web = await top(o.cle, o.champ, o.asc); montrer(id, idx); }
        catch(err){ web = null; montrer(null, idx, true); }
      }else montrer(null, idx);
    };
    ok.onclick = save;
    inp.onkeydown = ev => { ev.stopPropagation(); if(ev.key === "Enter") save(); };
    row.append(inp, ok); z.append(p, row);
    setTimeout(() => inp.focus(), 50);
  }

  window.Classement = { enLigne, top, ajouter, tableau, finDePartie };
})();
