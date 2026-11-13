/* Sumo sur le serveur : même physique que le navigateur (jeux/sumo/sim.js),
   30 pas par seconde, état envoyé à tous à chaque pas.
   Module de jeu = function(salle) → {max, message(m, j), depart(j), fin()}
   salle : joueurs (présents), chef(), diffuser(m), envoyer(id, m). */
import "../../../jeux/sumo/sim.js";
const Sim = globalThis.SumoSim;

export default function sumo(salle){
  let S = null, pid = 0, it = null, tPrec = 0, metaT = 0;
  const arreter = () => { if(it){ clearInterval(it); it = null; } };
  function pas(){
    const now = Date.now(), dt = Math.min(.1, (now - tPrec) / 1000); tPrec = now;
    const n = Math.max(1, Math.ceil(dt / .01));
    for(let i = 0; i < n; i++) Sim.maj(S, dt / n);
    const meta = now - metaT > 1000; if(meta) metaT = now;
    salle.diffuser(Sim.etat(S, pid, meta));
    if(S.ph === "fin" && S.tp > 2) arreter();       // fini : on attend « lancer » (revanche) ou « salon »
  }
  function lancer(){
    const l = salle.joueurs; if(l.length < 2) return;
    arreter(); pid++;
    S = Sim.nouvelle(l.map(j => ({id: j.id, nom: j.pseudo, av: j.avatar})), 3);
    tPrec = metaT = Date.now();
    salle.diffuser(Sim.etat(S, pid, true));
    it = setInterval(pas, 33);
  }
  return {
    max: 6,
    message(m, j){
      if(m.t === "in"){ if(S){ const p = S.p.find(x => x.id === j.id); if(p && p.vivant) Sim.entree(S, p, m); } return; }
      if(m.t === "etat?"){ salle.envoyer(j.id, S ? Sim.etat(S, pid, true) : {t: "salon"}); return; }
      if(j.id !== salle.chef()) return;               // la suite : réservé au chef de la salle
      if(m.t === "lancer") lancer();
      else if(m.t === "salon"){ arreter(); S = null; salle.diffuser({t: "salon"}); }
    },
    depart(j){ if(S){ const p = S.p.find(x => x.id === j.id); if(p && p.vivant){ p.vivant = false; p.chute = 1; } } },
    fin: arreter
  };
}
