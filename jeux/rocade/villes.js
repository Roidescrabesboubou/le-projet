/* ============================================================
   ROCADE : les villes
   Carte de 44×30 cases, dessinée d'après la géographie réelle.
   decor : tracés appliqués dans l'ordre, chacun avec sa largeur
     eau, mont (tunnel obligatoire), parc (route permise, pas de
     bâtiment), herbe (pour recreuser une île).
   route : routes déjà là au début de la partie.
   rythme : plus il est haut, plus la ville est exigeante.
   ============================================================ */
window.ROCADE_VILLES = [
  {
    id:"paris", nom:"Paris", emoji:"🥖", etoiles:1, centre:[23,14], rythme:.95,
    routes:40, ponts:3, tunnels:1, sol:"#e6e2d0", parc:"#c3d6a0", eau:"#8fc1d9", mont:"#b9ab94",
    decor:[
      {t:"parc",pts:[[4,12],[5,14]],w:4},
      {t:"parc",pts:[[40,24],[41,25]],w:3.5},
      {t:"parc",pts:[[22,20]],w:1.5},
      {t:"eau",pts:[[44,23],[34,20],[27,16],[21,12],[14,13],[9,17],[7,23],[3,26],[0,27]],w:1.1},
      {t:"herbe",pts:[[23,14],[25,15]],w:.6},
      {t:"mont",pts:[[23,4],[25,4]],w:2},
      {t:"mont",pts:[[36,7]],w:2}
    ],
    noms:[{x:30,y:18,t:"Seine"},{x:24,y:1,t:"Montmartre"},{x:5,y:8,t:"Bois de Boulogne"},{x:40,y:28,t:"Bois de Vincennes"}]
  },
  {
    id:"lasvegas", nom:"Las Vegas", emoji:"🎰", etoiles:2, centre:[22,15], rythme:1,
    routes:30, ponts:0, tunnels:2, sol:"#ecd9b0", parc:"#d9c78f", eau:"#7fbcd2", mont:"#b98f66",
    decor:[
      {t:"mont",pts:[[0,0],[2,10],[1,20],[3,30]],w:4},
      {t:"mont",pts:[[44,2],[42,12],[43,20]],w:3.5},
      {t:"eau",pts:[[44,27],[39,28]],w:2.5},
      {t:"mont",pts:[[12,7]],w:.7},{t:"mont",pts:[[32,10]],w:.7},{t:"mont",pts:[[14,20]],w:.9},
      {t:"mont",pts:[[31,22]],w:.8},{t:"mont",pts:[[28,5]],w:.7},{t:"mont",pts:[[10,14]],w:.7},
      {t:"mont",pts:[[36,17]],w:.9},{t:"mont",pts:[[17,26]],w:.7},{t:"mont",pts:[[27,26]],w:.7}
    ],
    routesPretes:[[[22,5],[22,25]]],
    noms:[{x:23,y:3,t:"The Strip"},{x:7,y:4,t:"Red Rock"},{x:37,y:25,t:"Lake Mead"}]
  },
  {
    id:"londres", nom:"Londres", emoji:"☂️", etoiles:2, centre:[22,14], rythme:1.05,
    routes:38, ponts:4, tunnels:1, sol:"#dfe2d8", parc:"#b4cf9c", eau:"#86aec9", mont:"#a8a596",
    decor:[
      {t:"parc",pts:[[15,8],[18,9]],w:2.2},
      {t:"parc",pts:[[21,3]],w:2},
      {t:"parc",pts:[[36,25]],w:2.2},
      {t:"mont",pts:[[14,1]],w:2.2},
      {t:"eau",pts:[[0,17],[8,20],[13,15],[18,17],[22,13],[27,15],[30,20],[34,19],[37,21],[44,18]],w:1}
    ],
    noms:[{x:24,y:12,t:"Tamise"},{x:16,y:6,t:"Hyde Park"},{x:33,y:12,t:"La City"},{x:36,y:28,t:"Greenwich"}]
  },
  {
    id:"newyork", nom:"New York", emoji:"🗽", etoiles:3, centre:[26,14], rythme:1.1,
    routes:34, ponts:5, tunnels:3, sol:"#e2e0da", parc:"#b5cf9a", eau:"#84b3cf", mont:"#a9a598",
    decor:[
      {t:"eau",pts:[[27,0],[23,10],[19,20],[15,26],[11,30]],w:1.3},
      {t:"eau",pts:[[36,0],[33,8],[29,16],[25,23],[20,28],[17,30]],w:1.1},
      {t:"eau",pts:[[14,29],[18,28]],w:3.5},
      {t:"eau",pts:[[27,3],[35,2]],w:.8},
      {t:"parc",pts:[[29,8],[26,13]],w:1.2}
    ],
    noms:[{x:24,y:20,t:"Manhattan"},{x:29,y:6,t:"Central Park"},{x:36,y:22,t:"Brooklyn"},{x:8,y:12,t:"New Jersey"},{x:40,y:8,t:"Queens"}]
  },
  {
    id:"tokyo", nom:"Tokyo", emoji:"🗼", etoiles:3, centre:[20,13], rythme:1.25,
    routes:42, ponts:4, tunnels:2, sol:"#e8e4dc", parc:"#bcd3a4", eau:"#8abbd6", mont:"#a8ab97",
    decor:[
      {t:"eau",pts:[[44,18],[38,22],[32,30]],w:6},
      {t:"eau",pts:[[29,0],[27,9],[30,18]],w:1},
      {t:"eau",pts:[[38,0],[36,9],[38,17]],w:1},
      {t:"mont",pts:[[0,9],[2,16]],w:3.5},
      {t:"parc",pts:[[14,12]],w:2},
      {t:"parc",pts:[[24,7]],w:1.5}
    ],
    noms:[{x:37,y:26,t:"Baie de Tokyo"},{x:28,y:4,t:"Sumida"},{x:14,y:9,t:"Shinjuku"},{x:4,y:20,t:"Mont Takao"},{x:23,y:18,t:"Shibuya"}]
  },
  {
    id:"venise", nom:"Venise", emoji:"🛶", etoiles:4, centre:[20,14], rythme:1, fond:"eau",
    routes:30, ponts:9, tunnels:0, sol:"#ecdcc4", parc:"#c8d3a0", eau:"#79b5c4", mont:"#b4a48a",
    decor:[
      {t:"herbe",pts:[[6,10],[17,8],[31,11]],w:7},
      {t:"herbe",pts:[[9,21],[26,21]],w:3.5},
      {t:"herbe",pts:[[10,27.5],[30,27.5]],w:1.2},
      {t:"herbe",pts:[[36,3],[42,1]],w:2},
      {t:"herbe",pts:[[41,6],[42,28]],w:1},
      {t:"eau",pts:[[32,3],[23,7],[27,13],[18,17],[7,15]],w:1},
      {t:"eau",pts:[[13,0],[14,10]],w:.6},
      {t:"parc",pts:[[29,8]],w:1.5}
    ],
    noms:[{x:24,y:4,t:"Grand Canal"},{x:17,y:12,t:"San Marco"},{x:18,y:26,t:"Giudecca"},{x:38,y:5,t:"Murano"},{x:39,y:18,t:"Lido"}]
  }
];
