/* ============================================================
   CARTES À JOUER  →  window.Cartes
   Partagé par le Poker et le Blackjack (et les futurs jeux de cartes).
   À inclure après base.js :
     <script src="../commun/cartes.js"></script>

   Une carte = 2 caractères : rang + couleur
     rangs   : 2 3 4 5 6 7 8 9 T J Q K A   (T = 10)
     couleurs: s ♠ pique · h ♥ cœur · d ♦ carreau · c ♣ trèfle
   Cartes.paquet(n)        → n jeux de 52 cartes (non mélangés)
   Cartes.melanger(liste)  → mélange sur place (aléatoire sûr) et renvoie la liste
   Cartes.element(c, o)    → <div> d'une carte ; c = null → dos de carte
                             o = {petite:true} pour une version réduite
   Cartes.nom(c)           → « Roi de cœur »
   Taille : variable CSS --cw sur un parent (largeur d'une carte).
   ============================================================ */
(function(){
  const RANGS = "23456789TJQKA", COULEURS = "shdc";
  const SYM = {s: "♠", h: "♥", d: "♦", c: "♣"};
  const AFF = {T: "10", J: "V", Q: "D", K: "R"};
  const NOMS_R = {"2":"Deux","3":"Trois","4":"Quatre","5":"Cinq","6":"Six","7":"Sept","8":"Huit","9":"Neuf",T:"Dix",J:"Valet",Q:"Dame",K:"Roi",A:"As"};
  const NOMS_C = {s: "pique", h: "cœur", d: "carreau", c: "trèfle"};

  function paquet(n){
    const p = [];
    for(let k = 0; k < (n || 1); k++) for(const c of COULEURS) for(const r of RANGS) p.push(r + c);
    return p;
  }
  function hasard(max){
    try{ const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % max; }
    catch(e){ return Math.floor(Math.random() * max); }
  }
  function melanger(l){
    for(let i = l.length - 1; i > 0; i--){ const j = hasard(i + 1); [l[i], l[j]] = [l[j], l[i]]; }
    return l;
  }
  const rouge = c => c && (c[1] === "h" || c[1] === "d");
  const nom = c => c ? NOMS_R[c[0]] + " de " + NOMS_C[c[1]] : "Carte cachée";

  function element(c, o){
    o = o || {};
    const d = document.createElement("div");
    d.className = "carte" + (c ? (rouge(c) ? " rouge" : "") : " dos") + (o.petite ? " petite" : "") + (o.anim ? " arrive" : "");
    d.setAttribute("aria-label", nom(c));
    if(c){
      const r = AFF[c[0]] || String(c[0]).replace(/[&<>"']/g, ""), s = SYM[c[1]] || "";   // carte venue du réseau : rien d'autre que du texte
      d.innerHTML = `<span class="ci">${r}<br>${s}</span><span class="cc">${s}</span><span class="ci bas">${r}<br>${s}</span>`;
    }
    return d;
  }

  const css = document.createElement("style");
  css.textContent = `
.carte{--w:var(--cw,56px);position:relative;flex:none;width:var(--w);height:calc(var(--w)*1.4);border-radius:calc(var(--w)*.12);
  background:#fffdf8;color:#1f1b24;border:1px solid rgba(0,0,0,.18);box-shadow:0 2px 6px rgba(0,0,0,.22);
  font-family:Fredoka,Nunito,sans-serif;font-weight:700;user-select:none;overflow:hidden}
.carte.rouge{color:#cf2f45}
.carte .ci{position:absolute;top:4%;left:7%;font-size:calc(var(--w)*.24);line-height:.95;text-align:center}
.carte .ci.bas{top:auto;left:auto;bottom:4%;right:7%;transform:rotate(180deg)}
.carte .cc{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:calc(var(--w)*.52)}
.carte.petite .ci.bas{display:none}
.carte.petite .cc{font-size:calc(var(--w)*.46);top:62%}
.carte.petite .ci{font-size:calc(var(--w)*.3)}
.carte.dos{background:#7b2335;border:2px solid #fffdf8;
  background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.14) 0 4px,transparent 4px 9px),repeating-linear-gradient(-45deg,rgba(255,255,255,.14) 0 4px,transparent 4px 9px)}
.carte.vide{background:rgba(255,255,255,.08);border:2px dashed rgba(255,255,255,.3);box-shadow:none}
.carte.arrive{animation:carteArrive .35s ease-out}
.carte.gagne{outline:3px solid #f2c14e;outline-offset:1px}
.carte.terne{filter:brightness(.6)}
@keyframes carteArrive{from{transform:translateY(-24px) rotate(-6deg);opacity:0}to{transform:none;opacity:1}}`;
  document.head.appendChild(css);

  window.Cartes = {RANGS, COULEURS, SYM, paquet, melanger, hasard, element, nom, rouge};
})();
