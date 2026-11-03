/* ============================================================
   CLASSEMENT PARTAGÉ (commun à tous les joueurs)
   Les scores sont stockés dans une Realtime Database Firebase (gratuite).
   Colle ci-dessous l'URL de ta base, par exemple :
   "https://salle-de-jeux-default-rtdb.europe-west1.firebasedatabase.app"
   Tant que l'URL est vide, chaque jeu utilise seulement le classement
   de l'appareil (comme avant).
   Les règles de sécurité à coller dans Firebase sont dans firebase-regles.json.

   Deux classements en ligne par jeu :
   - « Depuis toujours » : le top 10 de tous les temps ;
   - « Cette semaine »   : le top 10 depuis lundi 0 h (heure de Paris),
     remis à zéro chaque lundi.
   ============================================================ */
const CLASSEMENT_URL = "https://salle-de-jeux-249d2-default-rtdb.europe-west1.firebasedatabase.app";

(function(){
  const BASE = CLASSEMENT_URL.trim().replace(/\/+$/,"");
  const enLigne = /^https:\/\/[^/]+$/.test(BASE);
  let portee = enLigne ? "web" : "local";

  const css = document.createElement("style");
  css.textContent = `.cl-scope{display:flex;gap:6px;margin-bottom:10px;width:100%}
.cl-scope button{flex:1;border:1px solid var(--line);background:var(--bg);color:var(--text);border-radius:10px;padding:6px 4px;font-weight:700;font-size:.82rem;cursor:pointer;white-space:nowrap}
.cl-scope button.on{background:var(--text);color:var(--bg);border-color:var(--text)}
.overlay .cl-scope button{background:transparent;color:#fff;border-color:rgba(255,255,255,.45)}
.overlay .cl-scope button.on{background:#fff;color:#22192b;border-color:#fff}
.cl-note{font-size:.8rem;opacity:.75;margin:4px 0 0;text-align:center}
.cl-titre{font-weight:800;font-size:.85rem;margin:2px 0;opacity:.9}
.cl-semaine{font-size:.85rem;margin:6px 0 0;text-align:center;font-weight:700}`;
  document.head.appendChild(css);

  function fetchT(url, opts){
    const c = new AbortController(), t = setTimeout(()=>c.abort(), 8000);
    return fetch(url, {...opts, signal:c.signal}).finally(()=>clearTimeout(t));
  }
  const el = (tag, txt, cls) => { const e = document.createElement(tag); if(txt) e.textContent = txt; if(cls) e.className = cls; return e; };
  const meilleur = (a, b, champ, asc) => asc ? a[champ] < b[champ] : a[champ] > b[champ];
  const trier = (l, champ, asc) => l.sort((a, b) => asc ? a[champ] - b[champ] : b[champ] - a[champ]);
  const propre = (j, champ) => Object.entries(j || {}).map(([id, e]) => ({...e, id}))
    .filter(e => e && typeof e.n === "string" && typeof e[champ] === "number");

  /* Lundi 0 h, heure de Paris, de la semaine en cours (en millisecondes) */
  function debutSemaine(maintenant){
    const now = maintenant ?? Date.now();
    const parties = t => {
      const p = {};
      new Intl.DateTimeFormat("en-GB", {timeZone:"Europe/Paris", year:"numeric", month:"2-digit", day:"2-digit",
        hour:"2-digit", minute:"2-digit", second:"2-digit", hourCycle:"h23"}).formatToParts(new Date(t))
        .forEach(x => p[x.type] = +x.value);
      return p;
    };
    const decalage = t => { const p = parties(t); return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(t / 1000) * 1000; };
    const p = parties(now);
    const jour = (new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay() + 6) % 7; // 0 = lundi
    const lundiUTC = Date.UTC(p.year, p.month - 1, p.day - jour);
    let t = lundiUTC - decalage(now);
    t = lundiUTC - decalage(t);          // corrige un éventuel changement d'heure dans la semaine
    return t;
  }

  /* Top 10 mondial d'un jeu (asc = le plus petit gagne, ex. un temps) */
  async function top(cle, champ, asc){
    const q = `orderBy=${encodeURIComponent('"'+champ+'"')}&${asc ? "limitToFirst" : "limitToLast"}=10`;
    const r = await fetchT(`${BASE}/scores/${cle}.json?${q}`);
    if(!r.ok) throw new Error("HTTP " + r.status);
    return trier(propre(await r.json(), champ), champ, asc).slice(0, 10);
  }
  /* Top 10 de la semaine : tous les scores envoyés depuis lundi, triés ici */
  async function topSemaine(cle, champ, asc){
    const q = `orderBy=${encodeURIComponent('"d"')}&startAt=${debutSemaine()}&limitToLast=1000`;
    const r = await fetchT(`${BASE}/scores/${cle}.json?${q}`);
    if(!r.ok) throw new Error("HTTP " + r.status);
    return trier(propre(await r.json(), champ), champ, asc).slice(0, 10);
  }
  async function ajouter(cle, entree){
    const r = await fetchT(`${BASE}/scores/${cle}.json`, {method:"POST", body:JSON.stringify({...entree, d:{".sv":"timestamp"}})});
    if(!r.ok) throw new Error("HTTP " + r.status);
    return (await r.json()).name;
  }
  const qualifie = (l, champ, asc, v) => l.length < 10 || meilleur({[champ]:v}, l[l.length-1], champ, asc);

  function lirePseudo(){ try{ return JSON.parse(localStorage.getItem("salle_pseudo")) || ""; }catch(e){ return ""; } }
  function ecrirePseudo(n){ try{ localStorage.setItem("salle_pseudo", JSON.stringify(n)); }catch(e){} }

  const ONGLETS = [["semaine","📅 Semaine"],["web","🌍 Toujours"],["local","📱 Appareil"]];
  const TITRES = {semaine:"📅 Top de la semaine (remis à zéro lundi)", web:"🌍 Top de tous les joueurs, depuis toujours", local:"📱 Classement sur cet appareil"};

  /* Tableau consultable (bouton 🏆) : onglets Semaine / Toujours / Appareil.
     Avec bascule:false (aperçu), affiche le top « toujours » + le record de la semaine. */
  async function tableau(zone, o){
    const jeton = zone._cl = (zone._cl || 0) + 1;
    zone.innerHTML = "";
    const max = o.max || 10;
    const box = el("div");

    if(!enLigne){ zone.appendChild(box); o.rendu(box, o.liste().slice(0, max), -1); return; }

    if(o.bascule === false){
      zone.appendChild(box);
      const ligne = el("p", "", "cl-semaine");
      box.appendChild(el("p", "Chargement…", "cl-note"));
      const [a, s] = await Promise.allSettled([top(o.cle, o.champ, o.asc), topSemaine(o.cle, o.champ, o.asc)]);
      if(zone._cl !== jeton) return;
      box.innerHTML = "";
      if(a.status === "fulfilled") o.rendu(box, a.value.slice(0, max), -1);
      else { o.rendu(box, o.liste().slice(0, max), -1); box.appendChild(el("p", "Classement mondial indisponible : scores de cet appareil.", "cl-note")); }
      if(s.status === "fulfilled" && s.value.length){
        const b = el("div"); o.rendu(b, s.value.slice(0, 1), -1);
        const li = b.querySelector("li"), v = li && li.children.length > 1 ? li.lastElementChild : null;
        ligne.textContent = `📅 Record de la semaine : ${s.value[0].n}` + (v ? ` · ${v.textContent}` : "");
        zone.appendChild(ligne);
      }else if(s.status === "fulfilled"){
        ligne.textContent = "📅 Record de la semaine : personne encore, à toi de jouer !";
        zone.appendChild(ligne);
      }
      return;
    }

    const s = el("div", "", "cl-scope");
    ONGLETS.forEach(([k, t]) => {
      const b = el("button", t); if(k === portee) b.className = "on";
      b.onclick = () => { portee = k; tableau(zone, o); };
      s.appendChild(b);
    });
    zone.append(s, el("p", TITRES[portee], "cl-titre"), box);
    if(portee === "local"){ o.rendu(box, o.liste().slice(0, max), -1); return; }
    box.appendChild(el("p", "Chargement…", "cl-note"));
    try{
      const l = await (portee === "semaine" ? topSemaine : top)(o.cle, o.champ, o.asc);
      if(zone._cl !== jeton) return;
      o.rendu(box, l.slice(0, max), -1);
      if(portee === "semaine" && !l.length){ box.innerHTML = ""; box.appendChild(el("p", "Personne n'a encore joué cette semaine. À toi de prendre la tête !", "cl-note")); }
    }catch(e){
      if(zone._cl !== jeton) return;
      box.innerHTML = "";
      box.appendChild(el("p", portee === "semaine"
        ? "Classement de la semaine indisponible pour le moment."
        : "Classement mondial indisponible pour le moment (connexion ?).", "cl-note"));
    }
  }

  /* Fin de partie : demande le prénom si le score entre dans un top 10
     (de la semaine, de tous les temps ou de l'appareil), l'enregistre
     et affiche les classements. */
  async function finDePartie(o){
    const z = o.zone, v = o.entree[o.champ];
    z.innerHTML = "";
    const loc = v > 0 && o.local.qualifie(v);
    let web = null, sem = null, erreur = false, okWeb = false, okSem = false;
    async function charger(){
      const [a, s] = await Promise.allSettled([top(o.cle, o.champ, o.asc), topSemaine(o.cle, o.champ, o.asc)]);
      web = a.status === "fulfilled" ? a.value : null;
      sem = s.status === "fulfilled" ? s.value : null;
    }
    if(enLigne){
      const att = el("p", "Chargement du classement…", "cl-note"); z.appendChild(att);
      await charger();
      erreur = !web && !sem;
      okWeb = v > 0 && !!web && qualifie(web, o.champ, o.asc, v);
      okSem = v > 0 && !!sem && qualifie(sem, o.champ, o.asc, v);
      att.remove();
    }
    let onglet = okWeb || !sem ? "web" : "semaine";
    const montrer = (idWeb, idxLocal, envoiRate) => {
      z.innerHTML = "";
      if(web || sem){
        const s = el("div", "", "cl-scope"), b = el("div"); b.style.width = "100%";
        const dessiner = () => {
          [...s.children].forEach(x => x.classList.toggle("on", x.dataset.k === onglet));
          b.innerHTML = "";
          const l = onglet === "semaine" ? sem : web;
          if(!l){ b.appendChild(el("p", "Indisponible pour le moment.", "cl-note")); return; }
          if(!l.length){ b.appendChild(el("p", "Personne n'a encore joué cette semaine.", "cl-note")); return; }
          o.rendu(b, l, idWeb ? l.findIndex(e => e.id === idWeb) : -1);
        };
        [["semaine","📅 Cette semaine"],["web","🌍 Depuis toujours"]].forEach(([k, t]) => {
          const x = el("button", t); x.dataset.k = k; x.onclick = () => { onglet = k; dessiner(); }; s.appendChild(x);
        });
        z.append(s, b); dessiner();
      }else{
        z.appendChild(el("p", "📱 Classement sur cet appareil", "cl-titre"));
        const b = el("div"); b.style.width = "100%"; z.appendChild(b);
        o.rendu(b, o.local.liste(), idxLocal ?? -1);
      }
      if(erreur) z.appendChild(el("p", "Classement mondial indisponible pour le moment : ton score est gardé sur cet appareil.", "cl-note"));
      if(envoiRate) z.appendChild(el("p", "L'envoi au classement mondial a échoué : ton score est gardé sur cet appareil.", "cl-note"));
      if(o.apres) o.apres();
    };
    if(!loc && !okWeb && !okSem){ montrer(); return; }

    const p = el("p", okWeb ? "🌍 Tu entres dans le top 10 de tous les joueurs ! Ton prénom :"
      : okSem ? "📅 Tu entres dans le top 10 de la semaine ! Ton prénom :"
      : "🎉 Nouveau record sur cet appareil ! Ton prénom :");
    const row = el("div", "", "namerow");
    const inp = el("input"); inp.maxLength = 16; inp.value = lirePseudo(); inp.placeholder = "Prénom";
    const ok = el("button", "OK", "btn");
    let fait = false;
    const save = async () => {
      if(fait) return; fait = true; ok.disabled = true;
      const n = (inp.value.trim() || "Anonyme").slice(0, 16); ecrirePseudo(n);
      const e = {...o.entree, n};
      const idx = loc ? o.local.ajouter({...e, d:Date.now()}) : -1;
      if(okWeb || okSem){
        try{ const id = await ajouter(o.cle, e); await charger(); montrer(id, idx); }
        catch(err){ web = sem = null; montrer(null, idx, true); }
      }else montrer(null, idx);
    };
    ok.onclick = save;
    inp.onkeydown = ev => { ev.stopPropagation(); if(ev.key === "Enter") save(); };
    row.append(inp, ok); z.append(p, row);
    setTimeout(() => inp.focus(), 50);
  }

  window.Classement = { enLigne, top, topSemaine, debutSemaine, ajouter, qualifie, tableau, finDePartie };
})();
