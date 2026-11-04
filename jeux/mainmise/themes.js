/* ============================================================
   MAINMISE : LES THÈMES (une ville = un plateau + des cartes)
   Pour ajouter une version : copie le bloc « neon » sous un autre
   nom et change les textes, les couleurs et les prix. Le menu propose
   le choix du thème dès qu'il y en a plus d'un, le moteur ne change pas.
   Le nombre de cases doit être un multiple de 4 (cases 0, n, 2n et 3n
   = les quatre coins).

   Types de cases :
     depart · cellule (simple visite) · marche (ramasse la cagnotte)
     rafle (envoie en cellule) · taxe{montant} · carte{pioche}
     quartier{groupe,prix,loyers:[nu,1,2,3,4 niveaux]}
     ligne{prix} (loyer doublé par ligne possédée)
     service{prix} (loyer = dés × 4, ou × 10 avec tous les services)
   Cartes (f = effet) :
     gain{n} · perte{n} · aller{c} · recule{n} · cellule · passe
     collecte{n} (chaque joueur te verse n) · entretien{n} (n par niveau)
     ligne (va à la prochaine ligne)
   ============================================================ */
(function(){
  const Q = (nom, ico, groupe, prix, loyers) => ({type: "quartier", nom, ico, groupe, prix, loyers});
  const L = nom => ({type: "ligne", nom, ico: "🚄", prix: 200});
  const S = (nom, ico) => ({type: "service", nom, ico, prix: 150});
  const C = pioche => ({type: "carte", pioche});
  const X = (nom, ico, montant) => ({type: "taxe", nom, ico, montant});

  window.MAINMISE_THEMES = {
    neon: {
      nom: "Cité Néon",
      emoji: "🌆",
      monnaie: "₡",
      couleurs: {
        "--bg": "#0b0a1a", "--card": "#15132b", "--text": "#eef0ff", "--muted": "#9a9cc4", "--line": "#2d2a55", "--soft": "#211e40",
        "--accent": "#ff2e93", "--accent2": "#19e3ff", "--plateau": "#100e24",
        "--fond1": "rgba(255,46,147,.16)", "--fond2": "rgba(25,227,255,.13)"
      },
      pions: ["#19e3ff", "#ff2e93", "#ffd23f", "#6dff8e", "#b388ff", "#ff8a3d"],
      regles: {depart: 2000, salaire: 250, amende: 60},
      niveaux: ["Néons", "Bar clandestin", "Club", "Tour"],
      bots: ["Zéro-Un", "Mama Ohm", "Krypto", "Vesper", "Nox"],
      groupes: {
        a: {nom: "Bas-fonds",     couleur: "#a0673f", up: 60},
        b: {nom: "Ruelles",       couleur: "#19e3ff", up: 100},
        c: {nom: "Quartier rose", couleur: "#ff5fb4", up: 120},
        d: {nom: "Enclave sodium", couleur: "#ff9838", up: 160},
        e: {nom: "Haute plaza",   couleur: "#a97bff", up: 180},
        f: {nom: "Sommets",       couleur: "#ffd23f", up: 220}
      },
      pioches: {
        signal: {
          nom: "Signal", ico: "📡",
          cartes: [
            {t: "Une faille dans un distributeur crache des crédits.", f: "gain", n: 120},
            {t: "Ton vieux logiciel espion rapporte enfin un dividende.", f: "gain", n: 60},
            {t: "Un drone-livreur s'écrase devant toi : colis revendu.", f: "gain", n: 90},
            {t: "Ton implant plante. Mise à jour d'urgence.", f: "perte", n: 80},
            {t: "Amende automatique : tu as traversé hors du passage holo.", f: "perte", n: 40},
            {t: "Quelqu'un clone ton badge et vide ta note de nouilles.", f: "perte", n: 30},
            {t: "Coordonnées anonymes : rendez-vous au Hub Central.", f: "aller", c: 0},
            {t: "Un informateur t'attend sur la Plaza Chrome.", f: "aller", c: 22},
            {t: "Fausse piste ! Recule de 3 cases.", f: "recule", n: 3},
            {t: "Un pass de transit tombe du ciel : prends la prochaine ligne.", f: "ligne"},
            {t: "Ton visage matche un avis de recherche. Direction le Bloc 9.", f: "cellule"},
            {t: "Tu trouves un code d'accès : garde-le pour sortir du Bloc 9.", f: "passe"}
          ]
        },
        contrat: {
          nom: "Contrat", ico: "📝",
          cartes: [
            {t: "Convoi escorté sans casse : prime versée.", f: "gain", n: 150},
            {t: "Ton client paie en retard, mais il paie.", f: "gain", n: 75},
            {t: "Tu gagnes le tournoi d'arcade clandestin.", f: "gain", n: 100},
            {t: "C'est ton anniversaire de sortie de cellule : chaque joueur te verse 25.", f: "collecte", n: 25},
            {t: "Tu rackettes gentiment la table : chaque joueur te verse 40.", f: "collecte", n: 40},
            {t: "Inspection sanitaire de tes établissements : 25 par niveau construit.", f: "entretien", n: 25},
            {t: "Générateurs à remplacer : 40 par niveau construit.", f: "entretien", n: 40},
            {t: "Mission ratée : tu rembourses l'avance.", f: "perte", n: 100},
            {t: "Frais de planque pour le mois.", f: "perte", n: 50},
            {t: "Livraison urgente au Sommet Helios.", f: "aller", c: 31},
            {t: "Rendez-vous discret au Marché noir.", f: "aller", c: 16},
            {t: "Un juge te doit un service : garde ce passe-droit pour sortir du Bloc 9.", f: "passe"}
          ]
        }
      },
      cases: [
        {type: "depart", nom: "Hub Central", ico: "🛰️"},
        Q("Les Cuves", "🛢️", "a", 80, [6, 30, 90, 240, 400]),
        C("contrat"),
        Q("Quai Rouille", "⚓", "a", 100, [8, 40, 110, 280, 450]),
        X("Taxe d'implant", "💉", 150),
        L("Ligne Sud"),
        Q("Marché Cathode", "📺", "b", 140, [12, 60, 170, 450, 650]),
        Q("Ruelle Pixel", "👾", "b", 140, [12, 60, 170, 450, 650]),

        {type: "cellule", nom: "Bloc 9", ico: "🔒"},
        Q("Passage 404", "🚧", "b", 160, [14, 70, 190, 500, 700]),
        S("Centrale Fusion", "⚡"),
        Q("Néo-Bazar", "🏮", "c", 200, [18, 90, 250, 650, 850]),
        Q("Allée Karaoké", "🎤", "c", 200, [18, 90, 250, 650, 850]),
        L("Ligne Ouest"),
        C("signal"),
        Q("Rue des Greffes", "🔧", "c", 220, [20, 100, 280, 700, 900]),

        {type: "marche", nom: "Marché noir", ico: "💰"},
        Q("Tours Sodium", "🏭", "d", 260, [24, 120, 340, 800, 1000]),
        C("contrat"),
        Q("Arcade Ozone", "🕹️", "d", 260, [24, 120, 340, 800, 1000]),
        Q("Hôtel Capsule", "🛏️", "d", 280, [26, 130, 370, 850, 1050]),
        L("Ligne Nord"),
        Q("Plaza Chrome", "💎", "e", 320, [30, 150, 420, 950, 1150]),
        Q("Galerie Holo", "🖼️", "e", 320, [30, 150, 420, 950, 1150]),

        {type: "rafle", nom: "Rafle", ico: "🚨"},
        Q("Jardins Suspendus", "🌿", "e", 340, [32, 160, 450, 1000, 1200]),
        S("Ferme de Données", "💾"),
        C("signal"),
        L("Ligne Est"),
        Q("Spire Zénith", "🗼", "f", 400, [40, 200, 560, 1200, 1500]),
        X("Amende de couvre-feu", "🌙", 100),
        Q("Sommet Helios", "☀️", "f", 450, [55, 250, 700, 1500, 1900])
      ]
    }
  };
})();
