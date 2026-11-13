/* ============================================================
   UNE SALLE (Durable Object) : liste des joueurs, connexions WebSocket,
   ping, reconnexion, et le module du jeu qui fait tourner la partie.
   Messages du serveur réservés : _bienvenue, _refus, _liste, _pong ; puis ceux du jeu.
   Le premier de la liste est le chef (lance, revanche, salon).
   ============================================================ */
import {DurableObject} from "cloudflare:workers";
import {JEUX} from "./jeux/index.js";

const GRACE = 15000;      // une connexion coupée garde sa place 15 s (le temps de se reconnecter)
const net = (s, n) => String(s || "").replace(/[\u0000-\u001f]/g, "").slice(0, n);

export class Salle extends DurableObject {
  constructor(ctx, env){
    super(ctx, env);
    this.joueurs = [];          // {id, pseudo, avatar, absent}
    this.socks = new Map();     // id → WebSocket
    this.minuteurs = new Map(); // id → départ différé
    this.mod = null;
  }

  async fetch(req){
    const u = new URL(req.url);
    const jeu = u.pathname.split("/")[2];
    const id = net(u.searchParams.get("id"), 24), creer = u.searchParams.get("creer") === "1";
    const [client, ws] = Object.values(new WebSocketPair());
    ws.accept();
    const reponse = new Response(null, {status: 101, webSocket: client});
    const refus = t => { try{ ws.send(JSON.stringify({t: "_refus", pourquoi: t})); ws.close(1000, "refus"); }catch(e){} return reponse; };

    if(!id) return refus("Identifiant manquant.");
    let j = this.joueurs.find(x => x.id === id);
    if(!this.mod){
      if(!creer) return refus("Aucune salle avec ce code (ou elle est fermée).");
      this.mod = JEUX[jeu](this.api());
    }else if(creer && !j) return refus("Ce code est déjà pris, réessaie.");
    if(j){                                   // reconnexion
      clearTimeout(this.minuteurs.get(id)); this.minuteurs.delete(id);
      const vieux = this.socks.get(id); if(vieux && vieux !== ws) try{ vieux.close(1000, "remplacée"); }catch(e){}
      j.absent = false;
    }else{
      if(this.joueurs.length >= (this.mod.max || 8)) return refus("La salle est complète.");
      j = {id, pseudo: net(u.searchParams.get("pseudo"), 16) || "Joueur", avatar: net(u.searchParams.get("avatar"), 4) || "😀"};
      this.joueurs.push(j);
    }
    this.socks.set(id, ws);
    ws.addEventListener("message", e => this.recu(ws, id, e.data));
    ws.addEventListener("close", () => this.coupe(ws, id));
    ws.addEventListener("error", () => this.coupe(ws, id));
    this.envoyer(id, {t: "_bienvenue", a: id});
    this.liste();
    return reponse;
  }

  api(){
    const s = this;
    return {
      get joueurs(){ return s.joueurs.filter(j => !j.absent); },
      chef: () => s.joueurs[0] && s.joueurs[0].id,
      diffuser: m => s.diffuser(m),
      envoyer: (id, m) => s.envoyer(id, m)
    };
  }
  envoyer(id, m){ const ws = this.socks.get(id); if(ws) try{ ws.send(JSON.stringify(m)); }catch(e){} }
  diffuser(m){ const t = JSON.stringify(m); for(const ws of this.socks.values()) try{ ws.send(t); }catch(e){} }
  liste(){ this.diffuser({t: "_liste", joueurs: this.joueurs.map(({id, pseudo, avatar, absent}) => ({id, pseudo, avatar, absent: !!absent}))}); }

  recu(ws, id, data){
    if(this.socks.get(id) !== ws || typeof data !== "string" || data.length > 4000) return;
    let m; try{ m = JSON.parse(data); }catch(e){ return; }
    if(!m || typeof m !== "object" || typeof m.t !== "string") return;
    if(m.t === "_ping"){ this.envoyer(id, {t: "_pong", a: id, ts: m.ts}); return; }
    if(m.t === "_depart"){ this.partir(id); return; }
    if(m.t[0] === "_") return;
    const j = this.joueurs.find(x => x.id === id);
    if(j && this.mod) try{ this.mod.message(m, j); }catch(e){ console.log("message ignoré", e); }
  }
  coupe(ws, id){
    if(this.socks.get(id) !== ws) return;          // une ancienne connexion déjà remplacée
    this.socks.delete(id);
    const j = this.joueurs.find(x => x.id === id); if(!j) return;
    j.absent = true; this.liste();
    clearTimeout(this.minuteurs.get(id));
    this.minuteurs.set(id, setTimeout(() => this.partir(id), GRACE));
  }
  partir(id){
    clearTimeout(this.minuteurs.get(id)); this.minuteurs.delete(id);
    const ws = this.socks.get(id); this.socks.delete(id); if(ws) try{ ws.close(1000, "départ"); }catch(e){}
    const j = this.joueurs.find(x => x.id === id); if(!j) return;
    this.joueurs = this.joueurs.filter(x => x !== j);
    if(this.mod && this.mod.depart) try{ this.mod.depart(j); }catch(e){}
    if(!this.joueurs.length){ if(this.mod && this.mod.fin) this.mod.fin(); this.mod = null; return; }   // salle vide : fermée
    this.liste();
  }
}
