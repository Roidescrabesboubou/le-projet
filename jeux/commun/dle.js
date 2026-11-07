/* ============================================================
   MOTEUR DES JEUX « -DLE » À TABLEAU  →  Dle.lancer(config)
   Utilisé par loldle, onepiecedle, pokedle, anidle.
   À inclure après garde.js, base.js, classement.js, series.js
   (+ dle.css après base.css).

   config :
     slug, titre, emoji            "loldle", "LoL-dle", "⚔️"
     quoi                          "champion" (sert aux textes : « Champion du jour »…)
     liste                         [{name, ...}]  (cles: noms normalisés acceptés, facultatif)
     graine, debut                 tirage du jour (ne pas changer : ça change la réponse du jour)
     jour(c)                       facultatif : qui peut être la réponse du jour
     question, intro               titre et texte du panneau
     colonnes  [{t, k, fmt(v,c), cmp(g,a) → "ok"|"mid"|"no", num, v(c)}]
               tableau → comparaison partielle ; num → flèches ↑ ↓ (v = valeur comparée)
     indice2   [libellé, a => texte]   2e indice (le 1er est la première lettre)
     indice1   idem, facultatif
     legende, aide (des <li>), exemple, aideFin
     avatar(c) → [couleur, texte]  facultatif (sinon initiales)
     sous(c)                       petit texte sous le nom (facultatif)
     plus(n, libres, deja)         suggestions en plus des noms (facultatif)
     filtre {champ, valeurs, texte, min}   choix en partie libre (ex. générations)
   ============================================================ */
(function(){
  const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const pluriel = n => `${n} essai${n > 1 ? "s" : ""}`;
  const maj = s => s[0].toUpperCase() + s.slice(1);
  function cmpSet(a, b){ const A = new Set(a), inter = b.filter(x => A.has(x)).length; return inter === a.length && inter === b.length ? "ok" : inter ? "mid" : "no"; }
  function couleur(name){ let h = 0; for(const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360; return `hsl(${h} 55% 45%)`; }
  function initiales(name){ const p = name.replace(/[^A-Za-zÀ-ÿ ]/g, "").split(" ").filter(Boolean); return (p.length > 1 ? p[0][0] + p[1][0] : name.slice(0, 2)).toUpperCase(); }

  function lancer(C){
    const $ = id => document.getElementById(id);
    const store = Base.stock(C.slug + "_");
    const LISTE = C.liste, BY = {};
    LISTE.forEach(c => { BY[c.name] = c; if(!c.cles) c.cles = [norm(c.name)]; });
    const Quoi = maj(C.quoi), defStats = () => ({played:0, wins:0, streak:0, best:0, total:0, lastWin:null, last:null});

    /* ---------- Réponse du jour ---------- */
    const DEBUT = C.debut || Date.UTC(2026, 10, 1);
    const parisDay = () => Base.jour(DEBUT);
    const ORDER = Base.melanger(LISTE.filter(C.jour || (() => true)).map(c => c.name).sort(), Base.rng(C.graine));
    const dailyName = d => ORDER[((d % ORDER.length) + ORDER.length) % ORDER.length];

    /* ---------- Comparaison ---------- */
    function compare(g, a){
      return C.colonnes.map(col => {
        if(col.cmp) return [col.cmp(g, a), ""];
        const vg = col.v ? col.v(g) : g[col.k], va = col.v ? col.v(a) : a[col.k];
        if(Array.isArray(vg)) return [cmpSet(vg, va), ""];
        if(col.num) return vg === va ? ["ok", ""] : ["no", vg < va ? "↑" : "↓"];
        return [vg === va ? "ok" : "no", ""];
      });
    }
    const texte = (col, c) => col.fmt ? col.fmt(c[col.k], c) : Array.isArray(c[col.k]) ? c[col.k].join(", ") : String(c[col.k]);
    const avatar = name => { const c = BY[name], [coul, t] = C.avatar ? C.avatar(c) : [couleur(name), initiales(name)]; return `<span class="av" style="--c:${coul}">${esc(t)}</span>`; };
    const nomHTML = c => C.sous ? `<span>${esc(c.name)}<small>${esc(C.sous(c))}</small></span>` : esc(c.name);

    /* ---------- Page ---------- */
    const bStats = Base.el("button", "📊", "b-ico"); bStats.title = "Statistiques";
    Base.entete({titre: C.titre, emoji: C.emoji, boutons: [bStats], aide:
      `<p>Trouve le ${C.quoi} mystère. Essais illimités : chaque proposition te révèle ses points communs avec la réponse.</p>
      <ul>
        <li><span class="sq" style="background:var(--ok)"></span> la caractéristique est <b>exactement</b> la même ;</li>
        <li><span class="sq" style="background:var(--mid)"></span> <b>en partie</b> correcte (${C.exemple || "ex : une valeur en commun sur deux"}) ;</li>
        <li><span class="sq" style="background:var(--no)"></span> <b>aucun</b> point commun ;</li>
        ${C.aide || ""}
      </ul>
      <p>Des indices se débloquent après <b>5</b> et <b>9</b> essais.</p>
      <p>${C.aideFin || `📅 Le <b>${C.quoi} du jour</b> change automatiquement à minuit, le même pour tout le monde. ♾️ La <b>partie libre</b> tire un ${C.quoi} au hasard, sans limite.`}</p>`});
    const main = document.createElement("main");
    main.innerHTML = `
      <div class="modes"><button id="mDaily" class="on">📅 ${Quoi} du jour</button><button id="mFree">♾️ Partie libre</button></div>
      <div class="gens" id="gens" hidden></div>
      <div class="sub" id="sub"></div>
      <div class="panel">
        <h2>${C.question}</h2><p>${C.intro}</p>
        <div class="search" id="search">
          <input id="inp" placeholder="Nom du ${C.quoi}…" autocomplete="off" spellcheck="false">
          <button id="bGo">Valider</button><div id="sugg" hidden></div>
        </div>
        <div class="hints"><button id="h1" disabled></button><button id="h2" disabled></button></div>
        <div class="count" id="count"></div>
      </div>
      <div class="tablewrap"><table id="tbl" hidden>
        <thead><tr><th>${Quoi}</th>${C.colonnes.map(c => `<th>${c.t}</th>`).join("")}</tr></thead><tbody id="rows"></tbody>
      </table></div>
      <div class="legend" id="legend" hidden>
        <span><i style="background:var(--ok)"></i>Correct</span><span><i style="background:var(--mid)"></i>Partiellement correct</span>
        <span><i style="background:var(--no)"></i>Incorrect</span><span>${C.legende}</span>
      </div>`;
    const fin = document.createElement("div");
    fin.className = "modal hidden"; fin.id = "mdEnd";
    fin.innerHTML = `<div class="box">
      <button class="close" data-close>✕</button>
      <h2 id="endTitle"></h2><div class="found" id="found"></div><div class="stats" id="endStats"></div>
      <div class="actions"><button class="btn" id="bShare">📋 Partager</button><button class="btn ghost" id="bAgain">♾️ Partie libre</button></div>
      <div class="next" id="nextBox">Prochain ${C.quoi} dans<b id="countdown">--:--:--</b></div>
      <div id="ajZone"></div><div id="srZone"></div></div>`;
    document.body.append(main, fin);

    /* ---------- État ---------- */
    let mode = "daily", answer = null, guesses = [], over = false, selIdx = 0, shown = {h1:false, h2:false};

    function rowHTML(name, isNew){
      const g = BY[name], r = compare(g, answer);
      return `<tr class="${isNew ? "new" : ""}"><td class="name" style="--i:0">${avatar(name)}${esc(name)}</td>` +
        C.colonnes.map((col, i) => `<td class="${r[i][0]}" style="--i:${i + 1}">${esc(texte(col, g))}${r[i][1] ? `<span class="arr">${r[i][1]}</span>` : ""}</td>`).join("") + "</tr>";
    }
    function draw(newest){
      $("rows").innerHTML = [...guesses].reverse().map((n, i) => rowHTML(n, newest && i === 0)).join("");
      $("tbl").hidden = $("legend").hidden = !guesses.length;
      $("count").textContent = guesses.length ? pluriel(guesses.length) : "";
      $("inp").disabled = $("bGo").disabled = over;
      $("inp").placeholder = over ? "Trouvé ! Reviens demain ou lance une partie libre" : `Nom du ${C.quoi}…`;
      updateHints();
    }
    const INDICES = [["h1", 5, ...(C.indice1 || ["🔤 Première lettre", a => `🔤 Commence par « ${a.name[0]} »`])], ["h2", 9, ...C.indice2]];
    function updateHints(){
      for(const [id, n, label, reveal] of INDICES){
        const b = $(id), left = n - guesses.length;
        if(shown[id] || over && guesses.length >= n){ b.textContent = reveal(answer); b.disabled = true; b.className = "shown"; }
        else if(left > 0){ b.textContent = `${label} (dans ${left})`; b.disabled = true; b.className = ""; }
        else{ b.textContent = label + " — voir"; b.disabled = over; b.className = ""; }
      }
    }
    ["h1", "h2"].forEach(id => $(id).onclick = () => { shown[id] = true; save(); updateHints(); });

    /* ---------- Saisie / suggestions ---------- */
    const parNom = (c, n) => c.cles.some(k => k.includes(n));
    function matches(q){
      const n = norm(q); if(!n) return [];
      const libres = LISTE.filter(c => !guesses.includes(c.name));
      const debut = libres.filter(c => c.cles.some(k => k.startsWith(n)));
      const noms = debut.concat(libres.filter(c => !debut.includes(c) && parNom(c, n))).slice(0, 8);
      return C.plus ? noms.concat(C.plus(n, libres, noms)) : noms;
    }
    function renderSugg(){
      const list = matches($("inp").value), box = $("sugg");
      if(!list.length || over){ box.hidden = true; return; }
      selIdx = Math.min(selIdx, list.length - 1);
      box.innerHTML = list.map((c, i) => `<div data-n="${esc(c.name)}" class="${i === selIdx ? "sel" : ""}">${avatar(c.name)}${nomHTML(c)}</div>`).join("");
      box.hidden = false;
      box.querySelectorAll(":scope>div").forEach(d => d.onmousedown = e => { e.preventDefault(); guess(d.dataset.n); });
      const sel = box.querySelector(".sel"); if(sel) sel.scrollIntoView({block: "nearest"});
    }
    /* Si le 1er résultat ne vient pas du nom (ex. titre d'une œuvre), rien n'est présélectionné */
    $("inp").addEventListener("input", () => { const v = $("inp").value, l = matches(v); selIdx = l.length && !parNom(l[0], norm(v)) ? -1 : 0; renderSugg(); });
    $("inp").addEventListener("blur", () => setTimeout(() => $("sugg").hidden = true, 100));
    $("inp").addEventListener("focus", renderSugg);
    $("inp").addEventListener("keydown", e => {
      if(e.key === "ArrowDown"){ e.preventDefault(); selIdx = Math.min(selIdx + 1, matches($("inp").value).length - 1); renderSugg(); }
      else if(e.key === "ArrowUp"){ e.preventDefault(); selIdx = Math.max(selIdx - 1, 0); renderSugg(); }
      else if(e.key === "Enter"){ e.preventDefault(); submit(); }
      else if(e.key === "Escape") $("sugg").hidden = true;
    });
    $("bGo").onclick = submit;
    function submit(){
      const v = $("inp").value, list = matches(v), n = norm(v);
      const exact = LISTE.find(c => c.cles.includes(n));
      const pick = exact && !guesses.includes(exact.name) && selIdx <= 0 ? exact : list[selIdx];
      if(!pick){
        Base.toast(exact && guesses.includes(exact.name) ? "Déjà proposé !" : list.length ? `Choisis un ${C.quoi} dans la liste` : `${Quoi} inconnu`);
        const s = $("search"); s.classList.remove("shake"); void s.offsetWidth; s.classList.add("shake");
        return;
      }
      guess(pick.name);
    }
    function guess(name){
      if(over || guesses.includes(name)) return;
      guesses.push(name); $("inp").value = ""; $("sugg").hidden = true; selIdx = 0;
      if(name === answer.name){ over = true; recordStats(); }
      save(); draw(true);
      if(over) setTimeout(showEnd, 1500); else $("inp").focus();
    }

    /* ---------- Sauvegarde & stats ---------- */
    function save(){
      if(mode === "daily") store.ecrire("daily", {day: parisDay(), guesses, shown});
      else store.ecrire("free", {answer: answer.name, guesses, over, shown});
    }
    function recordStats(){
      const key = mode === "daily" ? "statsDaily" : "statsFree", s = store.lire(key, defStats());
      if(mode === "daily"){ const d = parisDay(); if(s.last === d) return; s.streak = s.lastWin === d - 1 ? s.streak + 1 : 1; s.lastWin = d; s.last = d; }
      else s.streak++;
      s.played++; s.wins++; s.total += guesses.length; s.best = Math.max(s.best, s.streak);
      store.ecrire(key, s);
      if(mode === "daily") Series.envoyer(C.slug, s, parisDay());
    }

    /* ---------- Modes ---------- */
    function startDaily(){
      mode = "daily"; const d = parisDay(); answer = BY[dailyName(d)];
      const sv = store.lire("daily", null), ok = sv && sv.day === d;
      guesses = ok ? sv.guesses.filter(n => BY[n]) : []; shown = ok && sv.shown ? sv.shown : {h1:false, h2:false};
      over = guesses.includes(answer.name);
      $("sub").textContent = `${Quoi} n°${d + 1} · ${Base.dateDuJour()}`;
      setBtns(); draw(false);
    }
    function startFree(fresh){
      mode = "free"; const sv = store.lire("free", null);
      if(!fresh && sv && BY[sv.answer] && !sv.over){ answer = BY[sv.answer]; guesses = sv.guesses.filter(n => BY[n]); shown = sv.shown || {h1:false, h2:false}; }
      else{
        const pool = F ? LISTE.filter(c => choix.includes(c[F.champ])) : LISTE;
        let c; do{ c = pool[Math.floor(Math.random() * pool.length)]; }while(answer && c.name === answer.name && pool.length > 1);
        answer = c; guesses = []; shown = {h1:false, h2:false};
      }
      over = false; save();
      $("sub").textContent = `Partie libre · un ${C.quoi} au hasard à chaque partie`;
      setBtns(); draw(false); $("inp").focus();
    }
    /* filtre facultatif de la partie libre (ex. générations de Pokémon) */
    const F = C.filtre;
    let choix = F ? store.lire(F.champ + "s", F.valeurs) : [];
    function drawFiltre(){
      const z = $("gens"); z.hidden = !F || mode !== "free"; if(z.hidden) return;
      z.innerHTML = `<span>${F.texte}</span>`;
      F.valeurs.forEach(v => {
        const b = Base.el("button", v, choix.includes(v) ? "on" : "");
        b.onclick = () => {
          if(choix.includes(v)){ if(choix.length === 1) return Base.toast(F.min); choix = choix.filter(x => x !== v); }
          else choix = [...choix, v].sort((a, b) => a - b);
          store.ecrire(F.champ + "s", choix); drawFiltre();
        };
        z.appendChild(b);
      });
    }
    function setBtns(){ drawFiltre(); $("mDaily").className = mode === "daily" ? "on" : ""; $("mFree").className = mode === "free" ? "on" : ""; }
    $("mDaily").onclick = () => { closeAll(); startDaily(); };
    $("mFree").onclick = () => { closeAll(); startFree(false); };

    /* ---------- Fin / stats ---------- */
    function showEnd(){
      const daily = mode === "daily", s = store.lire(daily ? "statsDaily" : "statsFree", defStats()), jour = parisDay();
      if(daily){
        s.streak = Series.courante(s, jour);
        Series.panneau($("srZone"), C.slug, store.lire("statsDaily", null), jour);
        Series.aujourdhui($("ajZone"), C.slug, jour, {moi: over ? {e: guesses.length, g: true} : null, unite: "coup", gagnantsSeulement: false, reussite: false});
      }else $("srZone").innerHTML = $("ajZone").innerHTML = "";
      $("endTitle").textContent = over ? `🎉 Trouvé en ${pluriel(guesses.length)} !` : (daily ? "Statistiques du jour" : "Statistiques (partie libre)");
      $("found").innerHTML = over ? avatar(answer.name) + (C.sous ? `<div><b>${esc(answer.name)}</b><small>${esc(C.sous(answer))}</small></div>` : `<b>${esc(answer.name)}</b>`) : "";
      const avg = s.wins ? (s.total / s.wins).toFixed(1) : "–";
      $("endStats").innerHTML = [[s.wins, "Trouvés"], [avg, "Essais moy."], [s.streak, "Série"], [s.best, "Meilleure série"]].map(([v, l]) => `<div><b>${v}</b><small>${l}</small></div>`).join("");
      $("bShare").style.display = over ? "" : "none";
      $("bAgain").textContent = daily ? "♾️ Partie libre" : `🔁 Nouveau ${C.quoi}`;
      $("nextBox").style.display = daily ? "" : "none";
      fin.classList.remove("hidden");
    }
    $("bAgain").onclick = () => { closeAll(); startFree(true); };
    $("bShare").onclick = async () => {
      const em = {ok:"🟩", mid:"🟧", no:"🟥"};
      const head = mode === "daily" ? `${C.titre} n°${parisDay() + 1}` : `${C.titre} (partie libre)`;
      const lines = guesses.slice(-6).map(n => compare(BY[n], answer).map(([c, d]) => d ? (d === "↑" ? "⬆️" : "⬇️") : em[c]).join(""));
      const txt = `${head} — trouvé en ${pluriel(guesses.length)}\n${guesses.length > 6 ? "…\n" : ""}${lines.join("\n")}\n\n${location.href.split("#")[0]}`;
      Base.partager(txt);
    };
    function tick(){
      $("countdown").textContent = Base.avantMinuit();
      if(mode === "daily" && answer && answer.name !== dailyName(parisDay())){ closeAll(); startDaily(); Base.toast(`Nouveau ${C.quoi} du jour !`); }
    }
    setInterval(tick, 1000);

    function closeAll(){ fin.classList.add("hidden"); }
    fin.addEventListener("click", e => { if(e.target === fin || e.target.hasAttribute("data-close")) closeAll(); });
    document.addEventListener("keydown", e => { if(e.key === "Escape") closeAll(); });
    bStats.onclick = showEnd;

    startDaily(); tick();
    return {reponse: () => answer && answer.name, jour: () => dailyName(parisDay())};
  }

  window.Dle = {lancer, norm, esc};
})();
