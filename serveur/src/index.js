/* Point d'entrée : /s/<jeu>/<CODE> (WebSocket) → Durable Object de la salle.
   Seuls le site et les tests en local peuvent ouvrir une salle (protège le quota gratuit). */
import {Salle} from "./salle.js";
import {JEUX} from "./jeux/index.js";
export {Salle};

const ORIGINES = ["https://roidescrabesboubou.github.io"];
const origineOk = o => !o || ORIGINES.includes(o) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o);

export default {
  async fetch(req, env){
    const u = new URL(req.url);
    if(u.pathname === "/") return new Response("Salle de jeux : serveur en ligne ✔", {headers: {"content-type": "text/plain; charset=utf-8", "access-control-allow-origin": "*"}});
    const m = u.pathname.match(/^\/s\/([a-z0-9]{1,20})\/([A-Z]{4}9)$/);
    if(!m || !JEUX[m[1]]) return new Response("Salle inconnue", {status: 404});
    if(req.headers.get("Upgrade") !== "websocket") return new Response("WebSocket attendu", {status: 426});
    if(!origineOk(req.headers.get("Origin"))) return new Response("Origine refusée", {status: 403});
    const id = env.SALLES.idFromName(m[1] + "/" + m[2]);
    return env.SALLES.get(id).fetch(req);
  }
};
