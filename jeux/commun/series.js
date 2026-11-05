/* ============================================================
   SÉRIES DE JOURS CONSÉCUTIFS (jeux « -dle » : défi du jour)
   - Chaque appareil a un identifiant de joueur anonyme + un prénom
     (le même prénom que pour les autres classements du site).
   - Après chaque défi du jour, la série du joueur est envoyée dans la
     base Firebase (même base que classement.js) : series/<jeu>/<id>.
   - Le classement montre les séries en cours et les meilleures séries.
   Une série est « en cours » si le joueur a gagné hier ou aujourd'hui.
   Les règles de sécurité correspondantes sont dans firebase-regles.json.
   Utilisation dans un jeu :
     <script src="../commun/classement.js"></script>
     <script src="../commun/series.js"></script>
     Series.envoyer("wordle", stats, jour)   // après un défi du jour
     Series.panneau(zone, "wordle", stats, jour)  // dans la fenêtre de fin
   ============================================================ */
(function(){
  const URL_BASE = (typeof CLASSEMENT_URL === "string" ? CLASSEMENT_URL : "").trim().replace(/\/+$/,"");
  const enLigne = /^https:\/\/[^/]+$/.test(URL_BASE);

  const css = document.createElement("style");
  css.textContent = `.sr{margin-top:16px;border-top:1px solid var(--line);padding-top:14px;text-align:left}
.sr h3{font-family:Fredoka,sans-serif;margin:0 0 8px;font-size:1.05rem;text-align:center}
.sr-tabs{display:flex;gap:6px;margin-bottom:8px}
.sr-tabs button{flex:1;border:1px solid var(--line);background:var(--bg);color:var(--text);border-radius:10px;padding:6px;font-weight:700;font-size:.82rem;cursor:pointer}
.sr-tabs button.on{background:var(--text);color:var(--bg);border-color:var(--text)}
.sr ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px}
.sr li{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:10px;background:var(--soft);font-weight:700;font-size:.9rem}
.sr li.moi{outline:2px solid var(--ok,#3aa76d)}
.sr li .r{width:22px;text-align:center;color:var(--muted)}
.sr li .n{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sr li .v{font-family:Fredoka,sans-serif;white-space:nowrap}
.sr .note{font-size:.8rem;color:var(--muted);text-align:center;margin:6px 0 0}
.sr .moiligne{font-size:.85rem;text-align:center;margin-top:8px;font-weight:700}
.sr .pseudo{display:flex;gap:6px;margin-top:8px}
.sr .pseudo input{flex:1;min-width:0;font:inherit;padding:8px 10px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--text)}
.sr .pseudo button{border:0;border-radius:10px;padding:8px 14px;font-weight:800;background:var(--text);color:var(--bg);cursor:pointer}`;
  document.head.appendChild(css);

  const lire = (k, d) => { try{ const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); }catch(e){ return d; } };
  const ecrire = (k, v) => { try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} };
  const el = (tag, txt, cls) => { const e = document.createElement(tag); if(txt != null) e.textContent = txt; if(cls) e.className = cls; return e; };

  /* Identifiant anonyme et stable de ce joueur (sur cet appareil) */
  function idJoueur(){
    let id = lire("salle_joueur_id", "");
    if(!/^[a-z0-9]{20}$/.test(id)){
      const a = new Uint8Array(20); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach((_, i) => a[i] = Math.random() * 256);
      id = [...a].map(x => "abcdefghijklmnopqrstuvwxyz0123456789"[x % 36]).join("");
      ecrire("salle_joueur_id", id);
    }
    return id;
  }
  const pseudo = () => lire("salle_pseudo", "") || "";

  /* Série réellement en cours (0 si un jour a été sauté depuis la dernière victoire) */
  function courante(s, jour){
    if(!s || !s.streak) return 0;
    const dernier = s.lastWin != null ? s.lastWin : s.last;
    return dernier != null && dernier >= jour - 1 ? s.streak : 0;
  }

  function fetchT(url, opts){
    const c = new AbortController(), t = setTimeout(() => c.abort(), 8000);
    return fetch(url, {...opts, signal:c.signal}).finally(() => clearTimeout(t));
  }

  /* Envoie la série du joueur (seulement le jour même du défi joué) */
  async function envoyer(jeu, s, jour){
    if(!enLigne || !s || s.last !== jour) return false;
    const n = pseudo().trim().slice(0, 16);
    if(!n) return false;
    const st = Math.max(0, Math.min(s.streak || 0, jour + 1));
    const corps = { n, s: st, b: Math.max(st, Math.min(s.best || 0, jour + 1)), j: jour, d: {".sv":"timestamp"} };
    try{
      const r = await fetchT(`${URL_BASE}/series/${jeu}/${idJoueur()}.json`, {method:"PUT", body:JSON.stringify(corps)});
      return r.ok;
    }catch(e){ return false; }
  }

  async function charger(jeu, champ){
    const q = `orderBy=${encodeURIComponent('"'+champ+'"')}&limitToLast=${champ === "s" ? 50 : 10}`;
    const r = await fetchT(`${URL_BASE}/series/${jeu}.json?${q}`);
    if(!r.ok) throw new Error("HTTP " + r.status);
    return Object.entries((await r.json()) || {}).map(([id, e]) => ({...e, id}))
      .filter(e => e && typeof e.n === "string" && typeof e.s === "number" && typeof e.b === "number" && typeof e.j === "number");
  }

  /* Panneau « 🔥 Séries » à placer dans la fenêtre de fin / statistiques */
  function panneau(zone, jeu, s, jour){
    zone.innerHTML = "";
    const box = el("div", null, "sr"); zone.appendChild(box);
    box.appendChild(el("h3", "🔥 Séries de jours consécutifs"));
    if(!enLigne){ box.appendChild(el("p", "Classement en ligne non configuré.", "note")); return; }

    let onglet = "s";
    const tabs = el("div", null, "sr-tabs");
    const liste = el("div");
    [["s", "En cours"], ["b", "Records"]].forEach(([k, t]) => {
      const b = el("button", t); if(k === onglet) b.className = "on";
      b.onclick = () => { onglet = k; [...tabs.children].forEach(x => x.className = x === b ? "on" : ""); afficher(); };
      tabs.appendChild(b);
    });
    box.append(tabs, liste);
    const moi = el("p", null, "moiligne"); box.appendChild(moi);
    const zonePseudo = el("div"); box.appendChild(zonePseudo);

    const maSerie = courante(s, jour), monRecord = (s && s.best) || 0;
    moi.textContent = `Toi : 🔥 ${maSerie} jour${maSerie > 1 ? "s" : ""} en cours · record ${monRecord}`;

    let jeton = 0;
    async function afficher(){
      const j = ++jeton;
      liste.innerHTML = ""; liste.appendChild(el("p", "Chargement…", "note"));
      try{
        let l = await charger(jeu, onglet);
        if(j !== jeton) return;
        if(onglet === "s") l = l.filter(e => e.s > 0 && e.j >= jour - 1).sort((a, b) => b.s - a.s || b.j - a.j);
        else l = l.filter(e => e.b > 0).sort((a, b) => b.b - a.b);
        l = l.slice(0, 10);
        liste.innerHTML = "";
        if(!l.length){ liste.appendChild(el("p", onglet === "s" ? "Aucune série en cours pour l'instant. Sois le premier !" : "Aucun record pour l'instant.", "note")); return; }
        const ol = el("ol"), me = idJoueur();
        l.forEach((e, i) => {
          const li = el("li", null, e.id === me ? "moi" : "");
          const v = onglet === "s" ? e.s : e.b;
          li.append(el("span", ["🥇","🥈","🥉"][i] || String(i + 1), "r"), el("span", e.n, "n"), el("span", `🔥 ${v} j`, "v"));
          ol.appendChild(li);
        });
        liste.appendChild(ol);
      }catch(e){
        if(j !== jeton) return;
        liste.innerHTML = ""; liste.appendChild(el("p", "Classement indisponible pour le moment (connexion ?).", "note"));
      }
    }

    function formPseudo(){
      zonePseudo.innerHTML = "";
      const p = pseudo();
      const row = el("div", null, "pseudo");
      const inp = el("input"); inp.maxLength = 16; inp.placeholder = "Ton prénom"; inp.value = p;
      const ok = el("button", p ? "Modifier" : "OK");
      const valider = async () => {
        const n = inp.value.trim().slice(0, 16); if(!n) return inp.focus();
        ecrire("salle_pseudo", n); ok.disabled = true;
        await envoyer(jeu, s, jour);
        ok.disabled = false; formPseudo(); afficher();
      };
      ok.onclick = valider;
      inp.onkeydown = e => { e.stopPropagation(); if(e.key === "Enter") valider(); };
      row.append(inp, ok);
      if(!p) zonePseudo.appendChild(el("p", "Indique ton prénom pour apparaître dans le classement des séries :", "note"));
      zonePseudo.appendChild(row);
      if(p && s && s.last !== jour) zonePseudo.appendChild(el("p", "Joue le défi du jour pour mettre ta série à jour.", "note"));
    }
    formPseudo();
    // Joueur déjà nommé qui a joué aujourd'hui : on (re)synchronise avant d'afficher
    if(pseudo() && s && s.last === jour) envoyer(jeu, s, jour).finally(afficher);
    else afficher();
  }

  /* ---------- Résultats du jour (anonymes) : moyenne des joueurs ----------
     resultats/<jeu>/<id> = { j: jour, e: nombre de coups (ou d'erreurs), g: gagné }
     Une seule entrée par joueur et par jour (écrasée le lendemain). */
  async function envoyerResultat(jeu, jour, e, g){
    if(!enLigne) return;
    const cle = "salle_res_" + jeu;
    if(lire(cle, null) === jour) return;
    // temps passé depuis la 1re ouverture du jeu aujourd'hui (noté par medailles.js), pour la modération
    const t0 = +lire("salle_vu_" + jeu + "_" + new Intl.DateTimeFormat("en-CA", {timeZone:"Europe/Paris", year:"numeric", month:"2-digit", day:"2-digit"}).format(new Date()), 0);
    const t = t0 ? Math.max(0, Math.min(86400, Math.round((Date.now() - t0) / 1000))) : null;
    try{
      const corps = {j:jour, e:Math.max(0, Math.min(500, e|0)), g:!!g, d:{".sv":"timestamp"}};
      const url = `${URL_BASE}/resultats/${jeu}/${idJoueur()}.json`;
      let r = await fetchT(url, {method:"PUT", body:JSON.stringify(t != null ? {...corps, t} : corps)});
      if(!r.ok && t != null) r = await fetchT(url, {method:"PUT", body:JSON.stringify(corps)});   // anciennes règles sans « t »
      if(r.ok || r.status === 401) ecrire(cle, jour); // 401 = déjà envoyé aujourd'hui
    }catch(err){}
  }

  /* o = { moi: {e, g} si la partie du jour est finie, sinon null,
           unite: "coup" | "erreur", gagnantsSeulement: true/false,
           reussite: afficher le % de réussite } */
  async function aujourdhui(zone, jeu, jour, o){
    if(o.moi) (window.__medailles = window.__medailles || []).push([jeu, o.moi.e, o.moi.g]);   /* médailles 🏅 du défi du jour */
    zone.innerHTML = "";
    if(!enLigne) return;
    const box = el("div", null, "sr aj"); zone.appendChild(box);
    box.appendChild(el("h3", "📊 Les joueurs aujourd'hui"));
    const ligne = el("p", "Chargement…", "note"); box.appendChild(ligne);
    if(o.moi) await envoyerResultat(jeu, jour, o.moi.e, o.moi.g);
    try{
      const r = await fetchT(`${URL_BASE}/resultats/${jeu}.json?orderBy=${encodeURIComponent('"j"')}&equalTo=${jour}`);
      if(!r.ok) throw new Error("HTTP " + r.status);
      const l = Object.values((await r.json()) || {}).filter(x => x && x.j === jour && typeof x.e === "number");
      box.innerHTML = ""; box.appendChild(el("h3", "📊 Les joueurs aujourd'hui"));
      if(!l.length){ box.appendChild(el("p", "Personne n'a encore terminé le défi du jour. Sois le premier !", "note")); return; }
      const base = o.gagnantsSeulement ? l.filter(x => x.g) : l;
      const moy = base.length ? base.reduce((a, x) => a + x.e, 0) / base.length : null;
      const u = (n, v) => `${n} ${o.unite}${v >= 2 ? "s" : ""}`;
      const fmt = v => v.toLocaleString("fr-FR", {maximumFractionDigits:1, minimumFractionDigits:1});
      const grille = el("div", null, "aj-grid");
      const tuile = (v, t) => { const d = el("div"); d.append(el("b", v), el("small", t)); grille.appendChild(d); };
      tuile(moy == null ? "–" : fmt(moy), `${o.unite}s en moyenne${o.gagnantsSeulement ? " (gagnants)" : ""}`);
      tuile(String(l.length), `joueur${l.length > 1 ? "s" : ""}`);
      if(o.reussite) tuile(Math.round(l.filter(x => x.g).length / l.length * 100) + " %", "de réussite");
      box.appendChild(grille);
      if(o.moi && moy != null && (o.moi.g || !o.gagnantsSeulement)){
        const diff = o.moi.e - moy;
        const txt = Math.abs(diff) < 0.05 ? "pile dans la moyenne 😉" : diff < 0 ? "mieux que la moyenne 🎉" : "un peu au-dessus de la moyenne";
        box.appendChild(el("p", `Toi : ${u(o.moi.e, o.moi.e)}, ${txt}`, "moiligne"));
      }
    }catch(err){
      ligne.textContent = "Statistiques du jour indisponibles pour le moment (connexion ?).";
    }
  }

  const css2 = document.createElement("style");
  css2.textContent = `.aj-grid{display:flex;gap:6px}
.aj-grid div{flex:1;background:var(--soft);border-radius:12px;padding:8px 4px;text-align:center}
.aj-grid b{display:block;font-family:Fredoka,sans-serif;font-size:1.4rem}
.aj-grid small{color:var(--muted);font-size:.72rem}`;
  document.head.appendChild(css2);

  window.Series = { enLigne, envoyer, panneau, courante, idJoueur, aujourdhui };
})();
