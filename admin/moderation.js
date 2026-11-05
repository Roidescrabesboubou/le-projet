/* ============================================================
   MODÉRATION (panel admin) → window.Moderation(conteneur)
   Repère les résultats suspects et permet de les supprimer,
   de remettre un joueur à zéro ou de le bannir.
   - 🏅 Médailles : total du classement ≠ médailles réelles,
     médaille qui ne correspond pas au résultat, défi écrit un
     autre jour, défi bouclé en quelques secondes, trop de parfaits.
   - 📅 Défis du jour : résultats envoyés aujourd'hui (temps, coups).
   - 🏆 Records : tops des jeux, valeurs hors norme.
   - ⛔ Bannis : comptes et appareils bloqués.
   Les règles Firebase autorisent ces actions aux seuls admins.
   ============================================================ */
(function(){
  const START = Date.UTC(2026, 10, 1);
  const ADM_CSS = document.createElement("style");
  ADM_CSS.textContent = `
.mo-ong{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 12px}
.mo-ong button{background:var(--bg);color:var(--text);border:1px solid var(--line)}
.mo-ong button.on{background:var(--text);color:var(--bg)}
.mo-l{border:1px solid var(--line);border-radius:14px;padding:10px 12px;margin-bottom:8px;background:var(--bg)}
.mo-l.sus{border-color:#d64545;box-shadow:inset 3px 0 0 #d64545}
.mo-t{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}
.mo-t b{font-size:1rem}
.mo-act{display:flex;gap:6px;flex-wrap:wrap}
.mo-f{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.mo-f span{font-size:.8rem;font-weight:700;border-radius:999px;padding:2px 9px;background:#fde3e3;color:#9b1c1c}
.mo-f span.ok{background:#e1f4e7;color:#1d6b3a}
.mo-det{margin-top:8px;font-size:.85rem;overflow-x:auto}
.mo-det td,.mo-det th{padding:4px 6px}
.mo-det tr.sus td{color:#c03030;font-weight:700}
.mo-mut{color:var(--muted);font-size:.85rem}
.mo-filtre{display:flex;gap:10px;align-items:center;margin-bottom:10px;font-size:.9rem;color:var(--muted)}
@media (prefers-color-scheme:dark){.mo-f span{background:#4a1f24;color:#ffb4b4}.mo-f span.ok{background:#1f3d2a;color:#9be0b2}}`;
  document.head.appendChild(ADM_CSS);

  const el = (tag, txt, cls) => { const e = document.createElement(tag); if(txt != null) e.textContent = txt; if(cls) e.className = cls; return e; };
  const db = (c, o) => Compte.db(c, o);
  const SV = {".sv": "timestamp"};
  const dateParis = ts => new Intl.DateTimeFormat("en-CA", {timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit"}).format(new Date(ts));
  const jourDe = ts => { const [y, m, d] = dateParis(ts).split("-").map(Number); return Math.floor((Date.UTC(y, m - 1, d) - START) / 864e5); };
  const jourAuj = () => jourDe(Date.now());
  const dateDuJour = j => new Date(START + j * 864e5 + 12 * 36e5).toLocaleDateString("fr-FR", {weekday: "short", day: "numeric", month: "short"});
  const heure = ts => ts ? new Date(ts).toLocaleString("fr-FR", {day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"}) : "—";
  const duree = s => s == null ? "—" : s < 60 ? s + " s" : s < 3600 ? Math.floor(s / 60) + " min " + (s % 60) + " s" : Math.floor(s / 3600) + " h " + Math.floor(s % 3600 / 60) + " min";
  const toast = (t, err) => { const x = document.getElementById("toast"); if(!x) return alert(t); x.textContent = t; x.className = "toast on" + (err ? " err" : ""); clearTimeout(toast.t); toast.t = setTimeout(() => x.className = "toast", 2400); };

  /* Même barème que jeux/commun/medailles.js */
  const lin = (e, a, b) => Math.max(0, Math.min(1, (b - e) / (b - a)));
  const Q = {wordle: e => lin(e, 1, 6), loldle: e => lin(e, 1, 12), anidle: e => lin(e, 1, 12), onepiecedle: e => lin(e, 1, 12), pokedle: e => lin(e, 1, 12),
             paysdle: e => lin(e, 1, 8), connexions: e => lin(e, 0, 4), sudoku: e => lin(e, 0, 5), motscroises: e => lin(e, 0, 5), motsfleches: e => lin(e, 0, 5), shikaku: e => lin(e, 0, 5)};
  const gain = (slug, e, g) => slug === "coupdefeu" ? (g ? 10 : 2 + Math.floor((Math.max(1, e) - 1) * 5 / 8)) : Q[slug] ? (g ? 5 + Math.round(5 * Q[slug](e)) : 2) : null;
  /* Temps minimum crédible pour finir un défi (secondes) */
  const TMIN = {wordle: 20, loldle: 15, anidle: 15, onepiecedle: 15, pokedle: 15, paysdle: 15, connexions: 40, sudoku: 120, motscroises: 90, motsfleches: 90, shikaku: 30, coupdefeu: 300};
  const DLE = ["wordle", "loldle", "anidle", "onepiecedle", "pokedle", "paysdle", "connexions", "sudoku"];
  const titre = slug => { const g = (window.SALLE_CATALOGUE || []).find(x => x.slug === slug); return g ? (g.emoji ? g.emoji + " " : "") + g.title : slug; };

  function bouton(txt, cls, fn, confirmer){
    const b = el("button", txt, "mini " + (cls || ""));
    b.onclick = async () => {
      if(confirmer && !confirm(confirmer)) return;
      b.disabled = true;
      try{ await fn(b); }catch(e){ toast(e.message, true); }
      b.disabled = false;
    };
    return b;
  }
  const drapeaux = (liste, okTxt) => {
    const f = el("div", null, "mo-f");
    if(!liste.length && okTxt) f.appendChild(el("span", okTxt, "ok"));
    liste.forEach(t => f.appendChild(el("span", t)));
    return f;
  };

  window.Moderation = function(racine){
    racine.innerHTML = "";
    racine.appendChild(el("h2", "🛡️ Modération"));
    racine.appendChild(el("p", "Les résultats qui ont l'air truqués sont marqués en rouge. Rien n'est supprimé sans ton clic. Un joueur banni ne peut plus rien envoyer (un appareil banni peut contourner en effaçant ses données : préfère bannir le compte).", "hint"));
    const ong = el("div", null, "mo-ong"), zone = el("div");
    racine.append(ong, zone);
    const ONGLETS = [["med", "🏅 Médailles", medailles], ["jour", "📅 Défis du jour", defisDuJour], ["rec", "🏆 Records", records], ["ban", "⛔ Bannis", bannis]];
    let courant = "med";
    const ouvrir = k => {
      courant = k;
      ong.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.k === k));
      zone.innerHTML = ""; zone.appendChild(el("p", "Chargement…", "hint"));
      const f = ONGLETS.find(o => o[0] === k)[2];
      f(zone).catch(e => { zone.innerHTML = ""; zone.appendChild(el("p", "Impossible de charger : " + e.message + " (règles Firebase publiées ?)", "hint")); });
    };
    ONGLETS.forEach(([k, t]) => { const b = el("button", t, "mini"); b.dataset.k = k; b.onclick = () => ouvrir(k); ong.appendChild(b); });
    ouvrir(courant);
  };

  /* ---------------- 🏅 Médailles ---------------- */
  async function medailles(zone){
    const [cl, med, comptes, ban] = await Promise.all([
      db("medailles_classement").then(x => x || {}), db("medailles").then(x => x || {}),
      db("comptes").then(x => x || {}).catch(() => ({})), db("bannis").then(x => x || {}).catch(() => ({}))]);
    const uids = [...new Set([...Object.keys(cl), ...Object.keys(med)])];
    const J = jourAuj();
    const lignes = uids.map(uid => {
      const c = cl[uid] || {}, jours = med[uid] || {};
      const pseudo = c.n || (comptes[uid] && comptes[uid].pseudo) || uid.slice(0, 8);
      let total = 0, parfaits = 0, defis = 0;
      const details = [];
      for(const [j, entree] of Object.entries(jours)){
        const slugs = Object.keys(entree).filter(k => k[0] !== "_");
        for(const [k, v] of Object.entries(entree)){
          if(k[0] === "_"){ total += +v || 0; continue; }
          total += +v.m || 0; defis++;
          const pb = [];
          const attendu = gain(k, v.e, v.g);
          if(attendu != null && attendu !== v.m) pb.push(`médaille ${v.m} au lieu de ${attendu}`);
          if(v.d && jourDe(v.d) !== +j) pb.push(`écrit le ${dateParis(v.d)} pour le jour ${dateDuJour(+j)}`);
          if(+j > J) pb.push("jour dans le futur");
          if(v.t != null && v.t < (TMIN[k] || 15)) pb.push(`fini en ${duree(v.t)}`);
          if(v.g && Q[k] && Q[k](v.e) === 1) parfaits++;
          details.push({j: +j, k, v, pb});
        }
        if(entree._tous && slugs.length < 6){ details.push({j: +j, k: "_tous", v: {m: entree._tous}, pb: ["bonus sans les défis faits"]}); }
      }
      const flags = [];
      details.forEach(d => d.pb.forEach(p => flags.push(`${dateDuJour(d.j)} · ${d.k} : ${p}`)));
      if(c.t != null && c.t > total) flags.unshift(`classement ${c.t} 🏅 > médailles réelles ${total} 🏅`);
      if(defis >= 6 && parfaits / defis > 0.6) flags.unshift(`${parfaits} défis parfaits sur ${defis}`);
      return {uid, pseudo, c, total, defis, flags, details, banni: !!ban[uid]};
    }).sort((a, b) => b.flags.length - a.flags.length || (b.c.t || 0) - (a.c.t || 0));

    zone.innerHTML = "";
    const filtre = el("label", null, "mo-filtre"); const cb = el("input"); cb.type = "checkbox";
    filtre.append(cb, " Seulement les suspects");
    zone.appendChild(filtre);
    zone.appendChild(el("p", `${lignes.length} joueur${lignes.length > 1 ? "s" : ""} avec des médailles · ${lignes.filter(l => l.flags.length).length} à vérifier.`, "mo-mut"));
    const liste = el("div"); zone.appendChild(liste);
    const dessiner = () => {
      liste.innerHTML = "";
      lignes.filter(l => !cb.checked || l.flags.length).forEach(l => {
        const b = el("div", null, "mo-l" + (l.flags.length ? " sus" : ""));
        const t = el("div", null, "mo-t");
        t.appendChild(el("b", `${l.pseudo}${l.banni ? " ⛔" : ""} — ${l.c.t != null ? l.c.t : "?"} 🏅 au classement · ${l.total} 🏅 réels · ${l.defis} défis`));
        const act = el("div", null, "mo-act");
        const det = el("div", null, "mo-det"); det.hidden = true;
        act.appendChild(bouton("Détail", "ghost", async () => { det.hidden = !det.hidden; if(!det.hidden && !det.firstChild) det.appendChild(tableMedailles(l)); }));
        act.appendChild(bouton("↺ Remettre à zéro", "ghost", async () => {
          await db(`medailles_raz/${l.uid}`, {method: "PUT", body: SV});
          await db(`medailles/${l.uid}`, {method: "DELETE"});
          await db(`medailles_classement/${l.uid}`, {method: "DELETE"});
          toast(`Médailles de ${l.pseudo} remises à zéro`); medailles(zone);
        }, `Effacer toutes les médailles de ${l.pseudo} (en ligne et sur ses appareils) ?`));
        act.appendChild(boutonBan("bannis", l.uid, l.pseudo, l.banni, () => medailles(zone)));
        t.appendChild(act);
        b.append(t, drapeaux(l.flags.slice(0, 8).concat(l.flags.length > 8 ? [`+ ${l.flags.length - 8} autres`] : []), "rien à signaler"), det);
        liste.appendChild(b);
      });
      if(!liste.firstChild) liste.appendChild(el("p", "Rien à afficher.", "mo-mut"));
    };
    cb.onchange = dessiner; dessiner();
  }
  function tableMedailles(l){
    const t = el("table");
    t.innerHTML = "<thead><tr><th>Jour</th><th>Défi</th><th>Résultat</th><th>🏅</th><th>Temps</th><th>Écrit</th><th></th></tr></thead>";
    const tb = el("tbody"); t.appendChild(tb);
    l.details.sort((a, b) => b.j - a.j).forEach(d => {
      const tr = el("tr", null, d.pb.length ? "sus" : "");
      const res = d.k === "_tous" ? "bonus" : `${d.v.e} · ${d.v.g ? "réussi" : "raté"}`;
      [dateDuJour(d.j), d.k === "_tous" ? "🎯 bonus" : titre(d.k), res, String(d.v.m), duree(d.v.t), heure(d.v.d)].forEach(x => tr.appendChild(el("td", x)));
      const td = el("td");
      td.appendChild(bouton("🗑️", "ghost", async (b) => { await db(`medailles/${l.uid}/${d.j}/${d.k}`, {method: "DELETE"}); b.closest("tr").remove(); toast("Médaille supprimée (le classement se recalcule à sa prochaine visite)"); }, "Supprimer cette médaille ?"));
      tr.appendChild(td); tb.appendChild(tr);
      if(d.pb.length){ const tr2 = el("tr", null, "sus"); const c = el("td", "⚠️ " + d.pb.join(" · ")); c.colSpan = 7; tr2.appendChild(c); tb.appendChild(tr2); }
    });
    return t;
  }
  function boutonBan(chemin, id, nom, estBanni, apres){
    return bouton(estBanni ? "✅ Débannir" : "⛔ Bannir", estBanni ? "" : "ghost", async () => {
      await db(`${chemin}/${id}`, estBanni ? {method: "DELETE"} : {method: "PUT", body: true});
      toast(estBanni ? `${nom} débanni` : `${nom} banni : il ne peut plus rien envoyer`);
      if(apres) apres();
    }, estBanni ? null : `Bannir ${nom} ? Il ne pourra plus envoyer de score, de médaille ni de résultat.`);
  }

  /* ---------------- 📅 Défis du jour ---------------- */
  async function defisDuJour(zone){
    const auj = dateParis(Date.now());
    const [banId, ...par] = await Promise.all([db("bannis_id").then(x => x || {}).catch(() => ({})),
      ...DLE.map(jeu => Promise.all([db(`resultats/${jeu}`, {auth: false}).catch(() => null), db(`series/${jeu}`, {auth: false}).catch(() => null)]))]);
    zone.innerHTML = "";
    zone.appendChild(el("p", "Résultats envoyés aujourd'hui (anonymes : chaque appareil a un identifiant). Le temps est compté depuis la 1re ouverture du jeu dans la journée.", "mo-mut"));
    let n = 0;
    DLE.forEach((jeu, i) => {
      const [res, ser] = par[i];
      const l = Object.entries(res || {}).map(([id, v]) => ({id, ...v})).filter(x => x.d && dateParis(x.d) === auj);
      if(!l.length) return;
      const box = el("div", null, "mo-l");
      box.appendChild(el("b", `${titre(jeu)} — ${l.length} joueur${l.length > 1 ? "s" : ""}`));
      const t = el("table", null, "mo-det"); const tb = el("tbody");
      t.innerHTML = "<thead><tr><th>Joueur</th><th>Résultat</th><th>Temps</th><th>Envoyé</th><th></th></tr></thead>"; t.appendChild(tb);
      l.sort((a, b) => (a.t == null ? 1e9 : a.t) - (b.t == null ? 1e9 : b.t)).forEach(x => {
        const pb = [];
        if(x.t != null && x.t < (TMIN[jeu] || 15)) pb.push(`fini en ${duree(x.t)}`);
        if(x.g && jeu !== "connexions" && jeu !== "sudoku" && x.e === 1) pb.push("trouvé du 1er coup");
        const nom = (ser && ser[x.id] && ser[x.id].n) || "anonyme";
        const tr = el("tr", null, pb.length ? "sus" : "");
        [`${nom} · ${x.id.slice(0, 6)}${banId[x.id] ? " ⛔" : ""}`, `${x.e} · ${x.g ? "réussi" : "raté"}${pb.length ? " ⚠️ " + pb.join(", ") : ""}`, duree(x.t), heure(x.d)].forEach(v => tr.appendChild(el("td", v)));
        const td = el("td"); td.style.whiteSpace = "nowrap";
        td.append(bouton("🗑️", "ghost", async b => { await db(`resultats/${jeu}/${x.id}`, {method: "DELETE"}); b.closest("tr").remove(); toast("Résultat supprimé"); }, "Supprimer ce résultat ?"),
                  boutonBan("bannis_id", x.id, nom + " (appareil)", !!banId[x.id], () => defisDuJour(zone)));
        tr.appendChild(td); tb.appendChild(tr); n++;
      });
      box.appendChild(t); zone.appendChild(box);
    });
    if(!n) zone.appendChild(el("p", "Aucun résultat aujourd'hui pour l'instant.", "mo-mut"));
  }

  /* ---------------- 🏆 Records ---------------- */
  const SCORES = [
    ["blocs", "s", "pts"], ["labyrinthe", "s", "pts"], ["blindtest", "s", "pts"], ["geoguessr", "s", "pts"], ["defense", "s", "pts"],
    ["demineur_facile", "t", "ms"], ["demineur_moyen", "t", "ms"], ["demineur_expert", "t", "ms"], ["coupdefeu", "k", "k"], ["coupdefeu_plat", "s", "pts"]];
  const TMIN_DEM = {demineur_facile: 3000, demineur_moyen: 15000, demineur_expert: 40000};
  async function records(zone){
    const [banId, ban, ...par] = await Promise.all([db("bannis_id").then(x => x || {}).catch(() => ({})), db("bannis").then(x => x || {}).catch(() => ({})),
      ...SCORES.map(([jeu, ch]) => db(`scores/${jeu}`, {auth: false, query: `orderBy=${encodeURIComponent(`"${ch}"`)}&${ch === "t" ? "limitToFirst" : "limitToLast"}=15`}).catch(() => null)),
      db(`cdf_jour/${jourAuj()}/premier`, {auth: false}).catch(() => null), db(`cdf_jour/${jourAuj()}/meilleur`, {auth: false}).catch(() => null),
      db("blackjack", {auth: false, query: `orderBy=${encodeURIComponent('"s"')}&limitToLast=10`}).catch(() => null),
      db("roulette", {auth: false, query: `orderBy=${encodeURIComponent('"s"')}&limitToLast=10`}).catch(() => null)]);
    zone.innerHTML = "";
    zone.appendChild(el("p", "Les meilleurs scores de chaque classement. ⚠️ = très loin devant les autres ou impossible à faire aussi vite.", "mo-mut"));
    const fmt = (v, u) => u === "ms" ? (v / 1000).toLocaleString("fr-FR", {maximumFractionDigits: 1}) + " s" : u === "k" ? `journée ${Math.floor(v / 1e9)} · ${Math.floor(v % 1e9).toLocaleString("fr-FR")}` : Math.floor(v).toLocaleString("fr-FR");
    const bloc = (titreBloc, l, ch, u, chemin, idBan) => {
      if(!l.length) return;
      const box = el("div", null, "mo-l"); box.appendChild(el("b", titreBloc));
      const t = el("table", null, "mo-det"); const tb = el("tbody"); t.appendChild(tb);
      const bas = u === "ms";
      l.sort((a, b) => bas ? a[ch] - b[ch] : b[ch] - a[ch]);
      l.forEach((x, i) => {
        const pb = [];
        const suivant = l[i + 1];
        if(!bas && suivant && suivant[ch] > 0 && u !== "k" && x[ch] > suivant[ch] * 3 && i === 0) pb.push("×" + Math.round(x[ch] / suivant[ch]) + " le 2e");
        if(u === "k" && suivant && Math.floor(x[ch] / 1e9) >= Math.floor(suivant[ch] / 1e9) + 6 && i === 0) pb.push("loin devant");
        if(bas && TMIN_DEM[chemin.split("/")[1]] && x[ch] < TMIN_DEM[chemin.split("/")[1]]) pb.push("trop rapide");
        const tr = el("tr", null, pb.length ? "sus" : "");
        const banni = idBan ? (idBan === "uid" ? ban[x.id] : banId[x.id]) : false;
        [`${i + 1}. ${x.n || "?"}${banni ? " ⛔" : ""}`, fmt(x[ch], u) + (pb.length ? " ⚠️ " + pb.join(", ") : ""), heure(x.d)].forEach(v => tr.appendChild(el("td", v)));
        const td = el("td"); td.style.whiteSpace = "nowrap";
        td.appendChild(bouton("🗑️", "ghost", async b => { await db(`${chemin}/${x.id}`, {method: "DELETE"}); b.closest("tr").remove(); toast("Score supprimé"); }, `Supprimer le score de ${x.n || "?"} ?`));
        if(idBan) td.appendChild(boutonBan(idBan === "uid" ? "bannis" : "bannis_id", x.id, x.n || "?", !!banni, () => records(zone)));
        tr.appendChild(td); tb.appendChild(tr);
      });
      box.appendChild(t); zone.appendChild(box);
    };
    const liste = o => Object.entries(o || {}).map(([id, v]) => ({id, ...v}));
    SCORES.forEach(([jeu, ch, u], i) => bloc(`${titre(jeu.replace(/_.*$/, ""))}${jeu.includes("_") ? " · " + jeu.split("_")[1] : ""}`, liste(par[i]).filter(x => typeof x[ch] === "number"), ch, u, `scores/${jeu}`, null));
    const k = SCORES.length;
    bloc(`${titre("coupdefeu")} · partie du jour (1er essai)`, liste(par[k]), "k", "k", `cdf_jour/${jourAuj()}/premier`, "id");
    bloc(`${titre("coupdefeu")} · partie du jour (meilleur essai)`, liste(par[k + 1]), "k", "k", `cdf_jour/${jourAuj()}/meilleur`, "id");
    bloc(`${titre("blackjack")} · jetons`, liste(par[k + 2]), "s", "pts", "blackjack", "uid");
    bloc(`${titre("roulette")} · jetons`, liste(par[k + 3]), "s", "pts", "roulette", "uid");
    if(!zone.querySelector(".mo-l")) zone.appendChild(el("p", "Aucun score pour l'instant.", "mo-mut"));
  }

  /* ---------------- ⛔ Bannis ---------------- */
  async function bannis(zone){
    const [ban, banId, comptes] = await Promise.all([db("bannis").then(x => x || {}), db("bannis_id").then(x => x || {}), db("comptes").then(x => x || {}).catch(() => ({}))]);
    zone.innerHTML = "";
    const ids = Object.keys(ban).filter(k => ban[k]), app = Object.keys(banId).filter(k => banId[k]);
    if(!ids.length && !app.length){ zone.appendChild(el("p", "Personne n'est banni.", "mo-mut")); return; }
    const ligne = (txt, chemin, id) => {
      const b = el("div", null, "mo-l"); const t = el("div", null, "mo-t");
      t.append(el("b", txt), boutonBan(chemin, id, txt, true, () => bannis(zone)));
      b.appendChild(t); zone.appendChild(b);
    };
    ids.forEach(uid => ligne(`👤 ${(comptes[uid] && comptes[uid].pseudo) || uid.slice(0, 8)}`, "bannis", uid));
    app.forEach(id => ligne(`📱 appareil ${id.slice(0, 6)}…`, "bannis_id", id));
  }
})();
