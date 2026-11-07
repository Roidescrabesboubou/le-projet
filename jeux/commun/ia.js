/* ============================================================
   IA COMMUNE  →  window.IA
   Les clés API sont saisies une seule fois (page ⚙️ Réglages ou
   réglages des Quintuplées) et servent à tous les jeux avec IA.
   Elles restent dans ce navigateur (jamais envoyées sur GitHub).
   À inclure dans un jeu IA (marqué ia: true dans le catalogue) :
     <script src="../commun/ia.js"></script>

   IA.disponible()                 → true si au moins une clé est enregistrée
   await IA.appeler({system, messages:[{role:"user",content:"…"}], json:true})
     → texte de la réponse. Essaie l'IA principale, puis la secours,
       puis toutes les autres IA qui ont une clé.
   IA.json(texte)                  → objet extrait d'une réponse JSON (ou null)
   IA.FOURNISSEURS / IA.config() / IA.enregistrer(cfg)  (page Réglages)
   ============================================================ */
(function(){
  const FOURNISSEURS = {
    gemini:{short:"Gemini",label:"Google Gemini (gratuit, limité)",model:"gemini-3.8-flash",help:"Clé gratuite : aistudio.google.com → « Get API key ». Le palier gratuit est limité en requêtes par jour."},
    anthropic:{short:"Claude",label:"Anthropic Claude (payant)",model:"claude-haiku-5-5",url:"https://api.anthropic.com/v1/messages",help:"Clé : platform.claude.com → API keys. Crédits payants, séparés de l'abonnement Claude. Haiku 5.5 est le modèle le moins cher."},
    groq:{short:"Groq",label:"Groq (gratuit, très rapide)",model:"llama-3.3-70b-versatile",url:"https://api.groq.com/openai/v1/chat/completions",help:"Clé gratuite : console.groq.com → API Keys."},
    mistral:{short:"Mistral",label:"Mistral (palier gratuit)",model:"mistral-small-latest",url:"https://api.mistral.ai/v1/chat/completions",help:"Clé : console.mistral.ai (palier gratuit « Experiment »)."},
    openrouter:{short:"OpenRouter",label:"OpenRouter (modèles :free)",model:"openrouter/free",url:"https://openrouter.ai/api/v1/chat/completions",help:"Clé : openrouter.ai/keys. Utilise un modèle se terminant par :free."}
  };
  const CLE = "cfg2";   // même emplacement que Les Quintuplées

  function config(){
    const c = {keys: {}, models: {}, active: "gemini", primary: "gemini", fallback: "groq"};
    try{
      const sv = JSON.parse(localStorage.getItem(CLE) || "null");
      if(sv){
        Object.assign(c.keys, sv.keys || {}); Object.assign(c.models, sv.models || {});
        for(const k of ["active", "primary"]) if(FOURNISSEURS[sv[k]]) c[k] = sv[k];
        if(sv.fallback === "" || FOURNISSEURS[sv.fallback]) c.fallback = sv.fallback;
      }
    }catch(e){}
    return c;
  }
  function enregistrer(c){
    try{ localStorage.setItem(CLE, JSON.stringify({keys: c.keys, models: c.models, active: c.active, primary: c.primary, fallback: c.fallback})); }catch(e){}
  }
  const utilisable = (c, p) => !!(p && FOURNISSEURS[p] && c.keys[p]);
  const modele = (c, p) => c.models[p] || FOURNISSEURS[p].model;

  function ordre(c){
    const o = [];
    // principale, secours, puis les IA gratuites, Claude (payant) en tout dernier
    [c.primary, c.fallback, "gemini", "groq", "mistral", "openrouter", "anthropic"].forEach(p => { if(utilisable(c, p) && !o.includes(p)) o.push(p); });
    return o;
  }
  const disponible = () => ordre(config()).length > 0;

  function fetchT(url, opts, ms){
    const a = new AbortController(), t = setTimeout(() => a.abort(), ms || 45000);
    return fetch(url, {...opts, signal: a.signal}).finally(() => clearTimeout(t));
  }
  function erreur(r, j){ const e = new Error((j && j.error && (j.error.message || j.error.type)) || ("HTTP " + r.status)); e.status = r.status; return e; }
  function normaliser(msgs){
    const out = [];
    for(const m of msgs || []){
      const role = m.role === "assistant" ? "assistant" : "user", c = String(m.content || "");
      if(out.length && out[out.length - 1].role === role) out[out.length - 1].content += "\n\n" + c;
      else out.push({role, content: c});
    }
    while(out.length && out[0].role !== "user") out.shift();
    return out;
  }

  async function brut(c, p, o){
    const model = modele(c, p), key = c.keys[p], msgs = normaliser(o.messages), json = o.json !== false, max = o.max || 1400;
    const system = o.system || "";
    if(p === "gemini"){
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
      const gc = {temperature: o.temperature != null ? o.temperature : (json ? 1 : 0.3)}; if(json) gc.responseMimeType = "application/json";
      const r = await fetchT(url, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({
        systemInstruction: {parts: [{text: system}]},
        contents: msgs.map(h => ({role: h.role === "user" ? "user" : "model", parts: [{text: h.content}]})),
        generationConfig: gc})});
      const j = await r.json().catch(() => ({}));
      if(!r.ok) throw erreur(r, j);
      return ((((j.candidates || [])[0] || {}).content || {}).parts || []).map(x => x.text).join("");
    }
    if(p === "anthropic"){
      const r = await fetchT(FOURNISSEURS.anthropic.url, {method: "POST", headers: {"Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true"},
        body: JSON.stringify({model, max_tokens: max, system, messages: msgs})});
      const j = await r.json().catch(() => ({}));
      if(!r.ok) throw erreur(r, j);
      return (j.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    }
    const body = {model, temperature: o.temperature != null ? o.temperature : (json ? 1 : 0.3), messages: [{role: "system", content: system}, ...msgs]};
    if(json && p !== "openrouter") body.response_format = {type: "json_object"};
    const r = await fetchT(FOURNISSEURS[p].url, {method: "POST", headers: {"Content-Type": "application/json", "Authorization": "Bearer " + key}, body: JSON.stringify(body)});
    const j = await r.json().catch(() => ({}));
    if(!r.ok) throw erreur(r, j);
    return (((j.choices || [])[0] || {}).message || {}).content || "";
  }

  async function appeler(o){
    const c = config(), liste = o.fournisseur ? [o.fournisseur] : ordre(c);
    if(!liste.length) throw new Error("Aucune clé IA enregistrée : ajoute-en une dans ⚙️ Réglages.");
    const errs = [];
    for(const p of liste){
      try{ const t = await brut(c, p, o); if(t && t.trim()) return t; errs.push(FOURNISSEURS[p].short + " : réponse vide"); }
      catch(e){ errs.push(FOURNISSEURS[p].short + " : " + (e.name === "AbortError" ? "délai dépassé" : String(e.message || e).slice(0, 90))); }
    }
    throw new Error("Aucune IA n'a répondu (" + errs.join(" · ") + ")");
  }

  function json(t){
    try{ return JSON.parse(t); }catch(e){}
    const m = String(t || "").match(/\{[\s\S]*\}/);
    if(m) try{ return JSON.parse(m[0]); }catch(e){}
    return null;
  }

  window.IA = {FOURNISSEURS, config, enregistrer, ordre, disponible, appeler, json, modele: p => modele(config(), p), tester: (p, cfg) => brut(cfg || config(), p, {system: "Réponds seulement OK.", messages: [{role: "user", content: "Test"}], json: false, max: 20})};
})();
