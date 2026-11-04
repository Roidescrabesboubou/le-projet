/* ============================================================
   JETONS DE CASINO  →  window.Jetons
   Règle commune aux jeux de casino (Blackjack, Roulette…) :
     - 1 000 jetons offerts à la toute première visite du jeu ;
     - ensuite, si le joueur tombe sous 50 jetons (0 compris),
       il reçoit 500 jetons le lendemain (une fois par jour au plus).
     Il n'y a aucun autre moyen d'en gagner que de jouer.

   Le portefeuille du jeu doit avoir :
     s = solde · j = dernier jour de don (-1 = jamais)
     b = jour où le solde est passé sous le seuil (-1 = pas sous le seuil)
   Jetons.examiner(porte, enJeu)  → met à jour porte.b et renvoie :
       {type:"bienvenue"|"recharge", n}  un don à verser maintenant
       {type:"attente", n}               sous le seuil, recharge demain
       null                              rien à faire
     enJeu = jetons encore en jeu (mises pas réglées), comptés dans le solde.
   Jetons.verser(porte, don)      → ajoute le don et note le jour
   Jetons.avantDemain()           → « 3 h 05 » avant minuit
   Jetons.regle()                 → phrase pour l'aide du jeu
   ============================================================ */
(function(){
  const BIENVENUE = 1000, RECHARGE = 500, SEUIL = 50;
  const fmt = n => Number(n || 0).toLocaleString("fr-FR");
  const jour = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);

  function examiner(porte, enJeu){
    const J = jour();
    if(!(porte.j >= 0)) return {type: "bienvenue", n: BIENVENUE};
    if(porte.s + (enJeu || 0) >= SEUIL){ porte.b = -1; return null; }
    if(porte.b === undefined || porte.b === null) porte.b = porte.j;   // ancien portefeuille : on part du dernier don
    if(!(porte.b >= 0)) porte.b = J;                                   // vient de passer sous le seuil
    if(enJeu) return null;                                             // on attend la fin des mises en cours
    if(J > porte.b && porte.j < J) return {type: "recharge", n: RECHARGE};
    return {type: "attente", n: RECHARGE};
  }
  function verser(porte, don){
    if(!don || !don.n || don.type === "attente") return false;
    porte.s += don.n; porte.j = jour(); porte.b = -1;
    return true;
  }
  function avantDemain(){
    const d = new Date(), m = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    const s = Math.max(0, Math.floor((m - d) / 1000));
    const h = Math.floor(s / 3600), mn = Math.floor(s % 3600 / 60);
    return h ? `${h} h ${String(mn).padStart(2, "0")}` : `${mn} min ${String(s % 60).padStart(2, "0")} s`;
  }
  const regle = () => `Tu reçois <b>${fmt(BIENVENUE)} jetons à ta première visite</b>. Si tu tombes sous ${fmt(SEUIL)} jetons, tu en reçois <b>${fmt(RECHARGE)} le lendemain</b>. Il n'y a <b>aucun autre moyen</b> d'en gagner que de jouer !`;

  window.Jetons = {BIENVENUE, RECHARGE, SEUIL, jour, examiner, verser, avantDemain, regle, fmt};
})();
