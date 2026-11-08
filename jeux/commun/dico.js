/* ============================================================
   DICTIONNAIRE COMMUN : les mots et leurs définitions
   Utilisé par le Mot du jour, les Mots croisés et les Mots fléchés.

   Une ligne par mot : MOT|Définition|Autre définition…
   - en majuscules, sans accent ni tiret (É → E, Ç → C) ;
   - la définition ne doit pas contenir le mot ;
   - une définition de 30 caractères au plus peut aller dans les Mots fléchés.
   Ajouter ou retirer un mot change les grilles à venir, et aussi
   celle du jour pour qui ne l'a pas encore commencée.
   (Le mot du jour du Wordle, lui, ne change pas : il a sa propre liste.)

   Dico.liste({min, max, defMax, graine})  → [{mot, def, defs}]
       min/max : longueur du mot ; defMax : garde les définitions courtes ;
       graine : choisit une des définitions (toujours la même pour une graine).
   Dico.existe("chien")  → true      Dico.def("chien") → "Il aboie"
   ============================================================ */
(function(){
  const norm = s => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().replace(/[^A-Z]/g,"");
  const mots = [], index = new Map();

  function ajouter(texte){
    for(const ligne of texte.trim().split("\n")){
      const [m,...defs] = ligne.split("|"), mot = norm(m);
      if(!mot) continue;
      const deja = index.get(mot);
      if(deja){ for(const d of defs) if(!deja.defs.includes(d)) deja.defs.push(d); continue; }
      const e = {mot, defs:defs.map(d=>d.trim()).filter(Boolean)};
      index.set(mot,e); mots.push(e);
    }
  }
  const hache = s => { let h = 2166136261; for(let i=0;i<s.length;i++) h = Math.imul(h^s.charCodeAt(i),16777619); return h>>>0; };

  function liste(o={}){
    const min = o.min||2, max = o.max||99, out = [];
    for(const e of mots){
      if(e.mot.length<min||e.mot.length>max) continue;
      const defs = o.defMax ? e.defs.filter(d=>d.length<=o.defMax) : e.defs;
      if(!defs.length) continue;
      const def = o.graine==null ? defs[0] : defs[hache(e.mot+":"+o.graine)%defs.length];
      out.push({mot:e.mot, def, defs});
    }
    return out;
  }

  window.Dico = {
    ajouter, liste, norm,
    existe: m => index.has(norm(m)),
    def: m => { const e = index.get(norm(m)); return e ? e.defs[0] : null; },
    defs: m => { const e = index.get(norm(m)); return e ? [...e.defs] : []; },
    get taille(){ return mots.length; }
  };

ajouter(`
AH|Cri d'étonnement
AI|Paresseux d'Amérique
AS|Champion
BD|Astérix ou Tintin
BU|Avalé
CA|Cela, en bref
CE|Pronom démonstratif
DE|Cube à six faces
DJ|Il mixe en soirée
DO|Première note
DU|Article contracté
EN|Préposition de lieu
ET|Mot de liaison
EX|Ancien amoureux
FA|Note avant sol
GO|Jeu de pions japonais
IF|Conifère
IL|Pronom masculin
KO|Hors de combat
LA|Note du diapason
LE|Article masculin
LU|Parcouru des yeux
MA|À moi, au féminin
ME|Pronom personnel
MI|Note après ré
NE|Venu au monde
NI|Conjonction négative
NO|Théâtre japonais
NU|Sans vêtement
OH|Cri de surprise
OK|D'accord
ON|Pronom indéfini
OR|Métal précieux
OS|Pièce du squelette
OU|Conjonction de choix
PC|Ordinateur
PI|Vaut environ 3,14
QI|Mesure d'intelligence
RA|Dieu solaire égyptien
RE|Note après do
RU|Petit ruisseau
SA|À lui, au féminin
SE|Pronom réfléchi
SI|Note avant do
SU|Appris
TA|À toi, au féminin
TE|Pronom personnel
TU|Pronom familier
TV|Petit écran
UN|Premier nombre
US|Coutumes
UT|Ancien nom du do
VO|Version originale
VU|Aperçu
WC|Petit coin
AIL|Condiment en gousses
AMI|Copain fidèle
ANE|Cousin du cheval, à longues oreilles
ARC|Il tire des flèches
BAC|Examen de fin de lycée
BAL|Soirée dansante
BOL|Récipient du petit déjeuner
BUS|Transport en commun sur roues
CLE|Elle ouvre la serrure
COL|Passage en montagne
COQ|Il chante au lever du jour
DOS|Il supporte le sac
DUO|Formation de deux musiciens
EAU|H2O
ETE|Saison la plus chaude
FIL|Il passe dans le chas de l'aiguille
GEL|Il givre les vitres en hiver
ILE|Terre entourée d'eau
JUS|Boisson pressée
LAC|Grande étendue d'eau douce
LIT|Meuble où l'on dort
LOI|Votée par le Parlement
MER|La Méditerranée, par exemple
MUR|Paroi de maison
NEZ|Il est au milieu du visage
NID|Maison de l'oiseau
OIE|Volatile du Capitole
OURS|Grand mammifère qui hiberne
PAIN|Vendu à la boulangerie
PIE|Oiseau noir et blanc réputé voleur
RAT|Rongeur des égouts
RIZ|Céréale des sushis
ROI|Il porte la couronne
SEL|Il relève les plats
SKI|Sport de glisse d'hiver
SOL|Note après fa
THE|Boisson chaude en sachet
TOIT|Il couvre la maison
VIN|Bordeaux ou bourgogne
ZOO|On y voit des animaux sauvages
ACTE|Partie d'une pièce de théâtre
AIDE|Coup de main
AILE|Elle permet à l'oiseau de voler
AMER|Goût du café sans sucre
ANGE|Être céleste
ARME|L'épée en est une
ARTS|Peinture et sculpture en font partie
AVION|Il décolle de la piste
BAIN|Moment dans la baignoire
BANC|Siège de jardin public
BARBE|Poils du menton
BEBE|Tout-petit
BLEU|Couleur du ciel
BOIS|Matière de l'arbre
BOUE|Mélange de terre et d'eau
BRAS|Il va de l'épaule à la main
CAFE|Noir ou crème, au comptoir
CAGE|Prison de l'oiseau
CARTE|On la lit pour trouver son chemin
CHAT|Il miaule
CHEF|Il dirige l'équipe ou la cuisine
CIEL|Domaine des nuages
CINE|Salle de projection, familièrement
COEUR|Organe qui bat
CORDE|Elle sert à grimper
CRAIE|Elle écrit sur le tableau noir
DENT|Le dentiste la soigne
DOUX|Contraire de rude
DUNE|Colline de sable
ECOLE|Lieu où l'on apprend
EPEE|Arme de mousquetaire
ETOILE|Elle brille la nuit
FEMME|Adulte de sexe féminin
FETE|Occasion de célébrer
FEUX|Ils règlent la circulation
FILM|On le regarde au cinéma
FLEUR|La rose en est une
FOIN|Herbe séchée pour le bétail
FOOT|Sport du ballon rond, en bref
FORT|Puissant
GARE|Les trains s'y arrêtent
GANT|Il habille la main
GLACE|Dessert froid
GOLF|Sport du club et de la petite balle
GRIS|Couleur de la souris
GUIDE|Il fait visiter
HIVER|Saison de la neige
IDEE|Elle germe dans la tête
JAUNE|Couleur du citron
JEAN|Pantalon de toile bleue
JOUE|Partie du visage qu'on embrasse
JOUR|Il fait suite à la nuit
JUGE|Il rend la sentence au tribunal
JUPE|Vêtement féminin sans jambes
LAIT|La vache en donne
LAMPE|Elle éclaire le bureau
LION|Roi des animaux
LIVRE|On le lit, page après page
LUNE|Satellite de la Terre
MAIN|Elle a cinq doigts
MARS|Planète rouge
MENU|Liste de plats au restaurant
MIEL|Produit par les abeilles
MODE|Tendance vestimentaire
MOTO|Deux-roues puissant
NEIGE|Elle tombe blanche en hiver|Flocons blancs
NOIR|Couleur du charbon
NOTE|Elle figure au bulletin
NUIT|Période sans soleil
OEUF|La poule le pond
OMBRE|On s'y abrite du soleil
ONCLE|Frère du père ou de la mère
ONDE|Elle se propage dans l'eau
ORAGE|Tonnerre et éclairs
OUTIL|Le marteau en est un
PAGE|Feuille de livre
PAPA|Le père, pour l'enfant
PARC|Espace vert de la ville
PEAU|Enveloppe du corps
PERE|Parent masculin
PIED|Il est au bout de la jambe
PLUIE|Elle mouille sans parapluie
PNEU|Il entoure la roue
POIRE|Fruit à pépins
POMME|Fruit de Newton
PONT|Il enjambe la rivière
PORT|Abri pour les bateaux
POTE|Copain, familièrement
PRIX|Ce que coûte une chose
PULL|Tricot pour l'hiver
QUAI|Bord de la voie ferrée
QUIZ|Jeu de questions
RADIO|Elle diffuse la musique et les infos
RAME|Elle fait avancer la barque
REVE|Il survient pendant le sommeil
RIRE|Réaction à une bonne blague
ROBE|Vêtement de mariée
ROCK|Musique d'Elvis
ROSE|Fleur à épines
ROUE|Pièce ronde du vélo
RUBAN|Bande de tissu décorative
RUSE|Habileté à tromper
SABLE|Il couvre la plage
SAPIN|Arbre de Noël
SIEGE|On s'y assoit
SINGE|Primate qui grimpe aux arbres
SOIF|Envie de boire
SOIR|Fin de journée
SOUPE|Potage
STYLO|Il écrit à l'encre
SUCRE|Il adoucit le café
TABLE|Meuble à quatre pieds
TAPIS|Il couvre le sol du salon
TIGRE|Grand félin rayé
TOUR|Eiffel en a construit une
TRAIN|Il roule sur des rails
VACHE|Elle broute et donne du lait
VELO|Deux-roues à pédales
VENT|Le mistral en est un
VERT|Couleur de l'herbe
VILLE|Paris ou Marseille
VOIX|Elle sert à chanter
YEUX|Organes de la vue
ZEBRE|Équidé rayé d'Afrique|Cheval rayé
ABEILLE|Elle butine et fait du miel
ACTEUR|Il joue dans un film|Il joue un rôle
AFRIQUE|Continent du Sahara
AGENDA|Carnet de rendez-vous
AIGLE|Grand rapace
ALBUM|Recueil de photos ou de chansons|Recueil de photos
ALGUE|Plante marine
AMOUR|Sentiment de Roméo pour Juliette
ANANAS|Fruit tropical à couronne|Fruit tropical couronné
ANIMAL|Le chien ou le chat
ANNEAU|Bijou rond qu'on passe au doigt
ARAIGNEE|Elle tisse sa toile
ARBITRE|Il siffle les fautes
ARBRE|Le chêne en est un
ARGENT|Monnaie ou métal précieux
ARMOIRE|Meuble où ranger les vêtements|Meuble à vêtements
ARTISTE|Peintre ou musicien
ASTRE|Le Soleil ou la Lune
ATELIER|Lieu de travail de l'artisan
ATOME|Plus petite partie d'un élément
AUTOMNE|Saison où tombent les feuilles|Saison des feuilles mortes
AVOCAT|Il défend au tribunal|Défenseur au tribunal
BAGUE|Bijou de doigt
BALEINE|Le plus gros mammifère marin|Géant des mers
BALLON|Rond et gonflé
BANANE|Fruit jaune qu'on épluche|Fruit jaune courbé
BANQUE|On y dépose son argent
BATEAU|Il flotte sur l'eau|Il flotte
BATTERIE|Instrument à baguettes
BIJOU|Collier ou bracelet
BILLET|Ticket de train ou de concert
BISCUIT|Gâteau sec
BLAGUE|Histoire drôle
BOUCHE|Elle sert à manger et à parler
BOUGIE|Elle fond sur le gâteau d'anniversaire|Elle s'allume sur le gâteau
BRIQUE|Elle sert à monter un mur
BROSSE|Elle démêle les cheveux|Pour les cheveux ou les dents
BUREAU|Table de travail
CADEAU|Présent offert à Noël|Présent
CAHIER|Feuilles reliées de l'écolier|Il a des pages lignées
CAMION|Poids lourd
CANARD|Il cancane sur la mare|Il fait coin-coin
CAROTTE|Légume orange
CARTON|Il sert aux déménagements
CASQUE|Il protège la tête
CASTOR|Rongeur bâtisseur de barrages
CHAISE|Siège à dossier
CHAMEAU|Il a deux bosses
CHAMPION|Vainqueur de la compétition|Vainqueur
CHANSON|Paroles et musique|Air chanté
CHAPEAU|Il coiffe la tête|Couvre-chef
CHATEAU|Demeure du roi|Demeure du seigneur
CHEMIN|Petite route de campagne
CHEVAL|Le jockey le monte|Monture
CHEVEU|Il pousse sur le crâne
CHIEN|Meilleur ami de l'homme
CITRON|Agrume acide|Agrume jaune
CLOCHE|Elle sonne à l'église
CLOWN|Il amuse au cirque
COFFRE|Il renferme un trésor
COLLIER|Bijou porté autour du cou|Bijou du cou
COMETE|Astre à longue queue
CONCERT|Spectacle de musique|Spectacle musical
COUSIN|Enfant de l'oncle
COUTEAU|Il tranche à table|Il coupe la viande
CRABE|Il marche de côté
CRAYON|Il se taille|Il écrit à la mine
CUISINE|Pièce où l'on prépare les repas|Pièce des repas
CUIVRE|Métal des fils électriques
DANSE|La valse ou le tango
DAUPHIN|Mammifère marin très intelligent|Mammifère marin joueur
DESERT|Le Sahara, par exemple|Étendue de sable
DESSIN|Œuvre au crayon|Croquis
DIAMANT|La pierre la plus dure|Pierre précieuse
DOCTEUR|Il soigne les malades|Médecin
DRAGON|Monstre qui crache du feu|Bête qui crache le feu
DRAPEAU|Bleu, blanc, rouge pour la France|Emblème d'un pays
ECHELLE|Elle sert à monter sur le toit|Elle a des barreaux
ECLAIR|Lueur d'orage ou pâtisserie
ECRAN|Partie de l'ordinateur qu'on regarde
ECUREUIL|Petit rongeur à queue touffue|Rongeur roux des arbres
EGLISE|Lieu de culte chrétien
ELEPHANT|Il a une trompe|Pachyderme à trompe
ENFANT|Petit garçon ou petite fille
ENIGME|Devinette difficile
EPICE|Le curry ou le poivre
EPONGE|Elle absorbe l'eau
EQUIPE|Groupe de joueurs
ESCALIER|Marches à monter|Suite de marches
ESPOIR|Attente confiante
ETAGE|Niveau d'un immeuble
EUROPE|Continent de la France
EXAMEN|Épreuve de contrôle
FALAISE|Côte abrupte
FARINE|Poudre de blé
FENETRE|Ouverture vitrée
FERME|Exploitation agricole
FLECHE|Le projectile de l'arc
FLEUVE|La Loire ou le Rhône
FLUTE|Instrument à vent
FOLIE|Perte de la raison
FOOTBALL|Sport de Zidane|Sport du ballon rond
FORET|Grand ensemble d'arbres|Grand bois
FOUDRE|Elle frappe pendant l'orage
FOURMI|Petit insecte très travailleur|Insecte travailleur
FRAISE|Fruit rouge de printemps|Fruit rouge du printemps
FRERE|Garçon de la même famille
FROMAGE|Le camembert en est un|Camembert ou comté
FRUIT|La pomme ou la pêche
FUSEE|Elle décolle vers l'espace
GALAXIE|La Voie lactée en est une
GARAGE|Abri de la voiture
GATEAU|Dessert d'anniversaire|Pâtisserie d'anniversaire
GENOU|Articulation de la jambe
GIRAFE|Animal au très long cou
GLOBE|Sphère représentant la Terre
GORILLE|Grand singe
GRAINE|Elle germe en terre
GUITARE|Instrument à six cordes
HAMSTER|Petit rongeur de compagnie|Petit rongeur domestique
HERISSON|Petit mammifère à piquants|Petit animal à piquants
HEROS|Personnage principal et courageux
HIBOU|Rapace nocturne
HISTOIRE|Récit ou matière scolaire|Récit du passé
HOMARD|Crustacé à grosses pinces
HORLOGE|Elle donne l'heure
HOTEL|On y loge en voyage
HUILE|Corps gras pour la salade
HUITRE|Coquillage qui peut donner une perle
IMAGE|Illustration
IMPOT|Il est payé à l'État
INDICE|Il aide à résoudre l'énigme
INSECTE|Il a six pattes
JARDIN|On y fait pousser les légumes|Potager ou parterre
JOUEUR|Participant à une partie
JOURNAL|Il donne les nouvelles|Quotidien
JUMEAU|Frère né le même jour|Né le même jour que son frère
KANGOUROU|Il porte son petit dans sa poche|Marsupial sauteur
KIWI|Fruit vert à peau velue
LAPIN|Il aime les carottes|Rongeur aux longues oreilles
LEGUME|Le poireau ou le chou
LETTRE|A, B ou C|Missive
LICORNE|Cheval à corne imaginaire|Cheval à une corne
LIMACE|Elle laisse une trace gluante
LOTERIE|Jeu de hasard à tickets
LUMIERE|Celle du jour éclaire
MAISON|Habitation
MAITRE|Il enseigne en primaire
MANGUE|Fruit tropical à gros noyau
MANTEAU|Vêtement chaud d'hiver|Vêtement d'hiver
MARIAGE|Union célébrée à la mairie|Union devant le maire
MARTEAU|Il enfonce les clous
MEDECIN|Il rédige les ordonnances|Docteur
MENSONGE|Contraire de la vérité|Contre-vérité
METEO|Elle annonce le temps
METRO|Train souterrain urbain
MIROIR|Il renvoie notre image|Il reflète
MONDE|La Terre et ses habitants
MONTAGNE|Le mont Blanc en est une|Sommet
MONTRE|Elle se porte au poignet
MOUCHE|Insecte qui agace
MOUTON|Il donne de la laine
MUSEE|Le Louvre en est un
MUSIQUE|Art de Mozart|Art des sons
NAGEUR|Il fait des longueurs à la piscine
NATURE|Forêts, rivières et prairies
NAVIRE|Grand bateau
NOISETTE|Fruit sec que l'écureuil adore
NUAGE|Masse blanche dans le ciel|Il cache le soleil
OCEAN|L'Atlantique, par exemple
ORANGE|Agrume ou couleur|Agrume
ORCHESTRE|Ensemble de musiciens
OREILLE|Organe de l'ouïe
OREILLER|Coussin du lit
ORTEIL|Doigt de pied
OTARIE|Mammifère marin de cirque
PALMIER|Arbre des pays chauds
PANIER|Le basketteur y marque ses points
PAPIER|On écrit dessus
PAPILLON|Il sort de sa chrysalide|Insecte aux ailes colorées
PARAPLUIE|Abri portatif pour les averses|Il protège de la pluie
PARFUM|Senteur en flacon|Senteur
PAROLE|Faculté de s'exprimer
PASSEPORT|Il faut l'avoir pour voyager
PATATE|Pomme de terre, familièrement
PECHEUR|Il lance sa ligne
PEINTRE|Monet ou Picasso
PELOUSE|Herbe bien tondue|Gazon
PERROQUET|Oiseau qui parle
PHARE|Il guide les bateaux la nuit
PHOTO|Image prise par un appareil
PIANO|Instrument à touches noires et blanches
PIERRE|Caillou
PILOTE|Il conduit l'avion
PINGOUIN|Oiseau noir et blanc des pôles|Oiseau noir et blanc
PIRATE|Il navigue sous pavillon noir|Bandit des mers
PISCINE|Bassin où l'on nage|Bassin de natation
PIZZA|Spécialité de Naples
PLAGE|Bord de mer sableux
PLANETE|La Terre ou Jupiter|La Terre en est une
PLANTE|Végétal
POESIE|Art des vers
POISSON|Il respire par ses branchies|Il vit dans l'eau
POIVRE|Épice noire
POMPIER|Il éteint les incendies|Il éteint le feu
POULE|Elle pond et caquette
POUSSIN|Petit de la poule
PRINCE|Fils du roi
PRINTEMPS|Saison du retour des fleurs|Saison des fleurs
PRISON|Lieu de détention
PUZZLE|Jeu de pièces à assembler
PYRAMIDE|Tombeau de pharaon
QUESTION|Elle attend une réponse|Interrogation
RACINE|Partie souterraine de la plante
RAISIN|Fruit de la vigne
RECETTE|Instructions du cuisinier|Mode de préparation d'un plat
REINE|Épouse du roi
REQUIN|Terreur des mers|Squale
RIVIERE|Cours d'eau
ROBOT|Machine automatisée
ROCHER|Gros bloc de pierre
ROMAN|Long récit de fiction
RUGBY|Sport au ballon ovale
SALADE|Laitue assaisonnée
SAVON|Il lave les mains
SCIENCE|La physique ou la chimie
SEMAINE|Sept jours
SERPENT|Reptile sans pattes
SERVIETTE|Elle sèche après le bain|Elle essuie
SOLEIL|Étoile de notre système
SORCIERE|Elle vole sur un balai
SOURIS|Le chat la chasse
SPECTACLE|Représentation sur scène|Représentation
STADE|Terrain de grands matchs
STATUE|Sculpture sur une place|Sculpture
TABLEAU|Œuvre accrochée au musée|Peinture encadrée
TAMBOUR|Instrument à percussion|Instrument à peau tendue
TELEPHONE|Il sonne quand on nous appelle|Appareil pour appeler
TEMPETE|Vent très violent|Orage violent
TERRE|Troisième planète du Soleil
THEATRE|Art de Molière|Lieu des pièces jouées
TICKET|Titre de transport
TIROIR|Partie coulissante d'un meuble|Il se glisse dans la commode
TOMATE|Fruit rouge du ketchup|Fruit rouge de la ratatouille
TONNERRE|Bruit de l'orage
TORTUE|Reptile à carapace
TRESOR|Le pirate l'enterre|Butin enfoui
TROTTOIR|Bord de rue pour les piétons|Bord de la rue
TULIPE|Fleur emblème des Pays-Bas
USINE|Lieu de fabrication
VACANCES|Congés d'été|Congés
VAGUE|Elle déferle sur la plage
VALISE|Bagage de voyage
VAMPIRE|Dracula en est un|Il boit le sang
VIOLON|Instrument à archet
VISAGE|Face de la tête
VOISIN|Il habite à côté
VOITURE|Automobile
VOLCAN|Il entre en éruption
VOYAGE|Déplacement lointain
WAGON|Voiture de train
YAOURT|Laitage en pot
ACHAT|Emplette
ACIDE|Comme le citron
ACIER|Fer allié au carbone
ACTIF|Qui ne reste pas inerte
ADIEU|Au revoir pour toujours
AGACE|Énervé, au féminin
AIDER|Prêter main-forte
AIGUE|Pointue, au féminin
AINSI|De cette façon
ALIBI|Il disculpe le suspect
ALLEE|Chemin bordé d'arbres
ALPHA|Première lettre grecque
AMANT|Amoureux en secret
AMERE|Comme la chicorée
ANCRE|Elle retient le navire
ANGLE|Coin
ANNEE|Douze mois
APPAT|Il attire le poisson
APPEL|Coup de fil
APPUI|Soutien
ARCHE|Celle de Noé
ARENE|Lieu des corridas
ARMEE|Troupes d'un pays
ARRET|Station de bus
ASILE|Refuge
ATOUT|Carte maîtresse
AUCUN|Pas un seul
AUDIO|Relatif au son
AUTEL|Table du prêtre
AUTRE|Différent
AVANT|Le contraire d'après
AVEUX|Confessions du suspect
AVIDE|Qui en veut toujours plus
AVRIL|Mois du poisson
AZOTE|Gaz majoritaire de l'air
BACHE|Toile imperméable
BACON|Lard fumé
BADGE|Insigne épinglé
BALAI|Il fait le ménage
BALLE|Projectile de tennis
BANAL|Très ordinaire
BANDE|Groupe de copains
BARBU|Qui ne se rase pas
BARGE|Bateau à fond plat
BARIL|Fût de pétrole
BARON|Noble au-dessous du comte
BARRE|Tige rigide
BATON|Bout de bois
BATTE|Arme du joueur de base-ball
BAZAR|Grand désordre
BEAUX|Jolis
BELLE|Jolie
BENNE|Caisse de camion
BETON|Matériau de construction
BETTE|Légume à côtes
BIBLE|Livre saint
BICHE|Femelle du cerf
BIDON|Récipient à essence
BIERE|Boisson houblonnée
BILAN|Résultat des comptes
BILLE|Petite boule de verre
BINGO|Loto américain
BISON|Bœuf des Plaines
BISOU|Petit baiser
BLAME|Réprimande
BLANC|Couleur de la neige
BLEUE|Comme le ciel
BLOND|Couleur des blés
BOCAL|Pot en verre
BOEUF|Il tire la charrue
BOIRE|Se désaltérer
BOITE|Carton
BOMBE|Engin explosif
BONDE|Trou d'évacuation
BONNE|Pas mauvaise
BONTE|Gentillesse
BOSSE|Bleu sur le front
BOTTE|Chaussure haute
BOULE|Sphère
BRAVE|Courageux
BRAVO|Applaudissement
BREVE|Courte
BRISE|Vent léger
BRUIT|Vacarme
BRUME|Brouillard léger
BRUNE|Bière foncée
BRUTE|Personne violente
BULLE|Elle monte dans le soda
BUTIN|Fruit du pillage
CABLE|Gros fil
CABOT|Petit chien
CACHE|Planque
CADET|Plus jeune enfant
CADRE|Il entoure le tableau
CALIN|Câlinerie
CALME|Tranquille
CANAL|Voie d'eau artificielle
CANNE|Aide à la marche
CANON|Pièce d'artillerie
CANOT|Petite embarcation
CAPOT|Il couvre le moteur
CARGO|Navire de marchandises
CARPE|Poisson d'étang
CARRE|Quatre côtés égaux
CASSE|Dégâts
CAUSE|Raison
CEDER|Lâcher prise
CELLE|Pronom démonstratif féminin
CELUI|Pronom démonstratif
CERNE|Marque sous l'œil
CHAIR|Muscle
CHAMP|Terre cultivée
CHANT|Mélodie vocale
CHAUD|Brûlant
CHENE|Arbre à glands
CHERE|Coûteuse
CHERI|Mot doux
CHIOT|Jeune chien
CHOIX|Décision
CHOSE|Objet quelconque
CHOUX|Légumes de Bruxelles
CHUTE|Dégringolade
CIBLE|Visée par l'archer
CIEUX|Firmament, au pluriel
CIVIL|Pas militaire
CLAIR|Lumineux
CLONE|Copie conforme
CLOSE|Fermée
COLLE|Elle fixe
COLON|Habitant d'une colonie
COMTE|Noble titré
CONGE|Vacances
CONNU|Célèbre
CONTE|Histoire pour enfants
COPIE|Reproduction
COQUE|Coquille d'œuf
CORNE|Pointe sur la tête du taureau
COTON|Fibre blanche
COUDE|Milieu du bras
COUPE|Trophée
COURT|Pas long
CRANE|Boîte osseuse
CREME|Haut du lait
CRETE|Elle orne la tête du coq
CREUX|Vide à l'intérieur
CRIME|Meurtre
CRISE|Moment difficile
CROIX|Signe en X
CRUEL|Sans pitié
CUITE|Ivresse
CULOT|Toupet
CULTE|Adoration
CURRY|Épice indienne
CYCLE|Suite qui recommence
CYGNE|Oiseau au long cou
DAGUE|Poignard
DALLE|Plaque de sol
DEBAT|Discussion
DEBUT|Commencement
DECOR|Toile de fond
DEGRE|Unité de température
DELAI|Temps accordé
DELIT|Infraction
DELTA|Embouchure ramifiée
DEMIE|Moitié
DEMON|Diable
DENSE|Épais
DEPIT|Contrariété
DEPOT|Entrepôt
DERBY|Match entre voisins
DESIR|Envie
DETTE|Somme due
DEUIL|Peine après un décès
DEVIN|Il prédit l'avenir
DIEUX|Habitants de l'Olympe
DIGNE|Qui mérite
DINDE|Volaille de Noël
DINER|Repas du soir
DINGO|Chien sauvage d'Australie
DISCO|Musique des années 70
DIVAN|Canapé
DIVIN|Délicieux
DOIGT|Il porte la bague
DOREE|Couleur de l'or
DOUCE|Pas rugueuse
DOUTE|Incertitude
DOUZE|Une douzaine
DOYEN|Le plus âgé
DRAIN|Tuyau d'évacuation
DRAME|Tragédie
DROIT|Pas tordu
DROLE|Amusant
DUREE|Laps de temps
DURER|Se prolonger
ECART|Distance
ECHEC|Revers
ECLAT|Fragment
ECRIT|Épreuve sur papier
EFFET|Conséquence
EGALE|De même valeur
EGARD|Considération
EGAUX|Pareils
EGOUT|Canalisation des eaux sales
ELEVE|Écolier
ELIRE|Choisir par vote
ELITE|Les meilleurs
ELOGE|Compliment
ENCRE|Remplit le stylo
ENFER|Domaine du diable
ENFIN|Finalement
ENGIN|Machine
ENJEU|Ce qu'on risque
ENNUI|Lassitude
ENTRE|Au milieu de
ENVIE|Désir
ENVOI|Expédition
EPAVE|Navire coulé
EPINE|Piquant de la rose
EPOUX|Mari
ESSAI|Tentative
ETANG|Petit lac
ETAPE|Partie du parcours
ETUDE|Apprentissage
EVIER|Bac de cuisine
EXACT|Juste
EXTRA|Formidable
FACON|Manière
FARCE|Blague
FATAL|Inévitable
FAUTE|Erreur
FERRY|Bateau qui transporte les voitures
FIBRE|Filament
FICHE|Carte de renseignements
FIERE|Orgueilleuse
FILET|Il attrape les poissons
FILLE|Enfant féminin
FINAL|Dernier
FINIR|Terminer
FIOLE|Petite bouteille
FIRME|Entreprise
FLANC|Côté du corps
FLASH|Éclair photo
FLEAU|Calamité
FLIRT|Amourette
FOIRE|Grand marché
FONDU|Liquéfié
FORCE|Puissance
FORGE|Atelier du forgeron
FORME|Silhouette
FORTE|Robuste
FORUM|Lieu de discussion
FOSSE|Trou creusé
FOUET|Il bat les œufs
FOULE|Multitude
FOYER|Domicile
FRANC|Sincère
FREIN|Il arrête la voiture
FRIGO|Réfrigérateur
FROID|Glacial
FUGUE|Escapade d'ado
FUITE|Évasion
FUMEE|Elle sort de la cheminée
FURIE|Colère violente
FUSIL|Arme d'épaule
FUTEE|Maligne
FUTUR|Avenir
GAFFE|Bévue
GALOP|Allure rapide du cheval
GAMME|Do ré mi fa sol la si
GARDE|Surveillance
GARER|Stationner
GAZON|Herbe tondue
GEANT|Très grand
GELEE|Confiture transparente
GENIE|Grand talent
GENRE|Sorte
GESTE|Mouvement
GIFLE|Claque
GILET|Veste sans manches
GLAND|Fruit du chêne
GOLFE|Grande baie
GOMME|Elle efface
GORGE|Gosier
GRACE|Élégance
GRADE|Rang militaire
GRAIN|Petite graine
GRAND|De haute taille
GRAVE|Sérieux
GREVE|Arrêt de travail
GRILL|Barbecue
GRISE|Couleur de la souris
GUISE|À sa manière
HABIT|Vêtement
HACHE|Outil du bûcheron
HAINE|Aversion
HALTE|Pause
HAUTE|Élevée
HERBE|Pelouse
HEURE|Soixante minutes
HOBBY|Passe-temps
HOMME|Être humain
HONTE|Gêne
HYMNE|Chant national
IDEAL|Parfait
IDOLE|Star adulée
INDEX|Doigt pointé
ISSUE|Sortie
JAMBE|Membre inférieur
JAVEL|Eau désinfectante
JEUDI|Jour avant vendredi
JEUNE|Pas vieux
JOINT|Raccord étanche
JOKER|Carte qui remplace les autres
JOLIE|Belle
JOUER|S'amuser
JOUET|Objet pour enfant
JUSTE|Équitable
KARMA|Destin bouddhique
LABEL|Marque de qualité
LAINE|Toison du mouton
LARGE|Vaste
LARME|Goutte de chagrin
LASER|Rayon lumineux
LATIN|Langue des Romains
LECON|Cours
LEGAL|Permis par la loi
LEGER|Pas lourd
LENTE|Pas rapide
LEVRE|Bord de la bouche
LIBRE|Pas prisonnier
LIEUX|Endroits
LIGNE|Trait
LIGUE|Championnat
LINGE|Lessive
LISSE|Sans aspérités
LISTE|Énumération
LITRE|Mille millilitres
LOCAL|Du coin
LOGER|Héberger
LOUPE|Elle grossit
LOURD|Pesant
LOYAL|Fidèle
LOYER|Prix de la location
LUEUR|Faible lumière
LUNDI|Premier jour de la semaine
LUTIN|Petit farfadet
LUTTE|Combat
LYCEE|École avant le bac
MAGIE|Sorcellerie
MAIRE|Élu de la commune
MAJOR|Premier de promo
MALIN|Rusé
MALLE|Grand coffre
MAMAN|Mère
MAMIE|Grand-mère
MANIE|Habitude bizarre
MARDI|Jour du gras
MAREE|Elle monte et descend
MARGE|Espace blanc de la page
MARIN|Matelot
MATCH|Rencontre sportive
MATIN|Début de journée
MECHE|Elle brûle dans la bougie
MELON|Fruit d'été
MERLE|Oiseau noir
MESSE|Office catholique
METAL|Fer ou cuivre
METRE|Cent centimètres
MEUTE|Bande de loups
MICRO|Il amplifie la voix
MIEUX|Plus bien
MILLE|Dix fois cent
MINCE|Fin
MOINE|Religieux
MOLLE|Pas dure
MOMIE|Corps embaumé
MORAL|État d'esprit
MORSE|Code de points et traits
MORTE|Sans vie
MOTEL|Hôtel de bord de route
MOTIF|Raison
MOULE|Coquillage
MOYEN|Méthode
MYTHE|Légende
NAGER|Faire la brasse
NAIVE|Crédule
NAVAL|Maritime
NEANT|Rien
NETTE|Propre
NEUVE|Jamais servie
NEVEU|Fils du frère
NIECE|Fille de la sœur
NOBLE|Aristocrate
NOEUD|Lien serré
NOIRE|Couleur de l'ébène
NONNE|Religieuse
NORME|Règle
NOYAU|Cœur de la cerise
NUIRE|Faire du tort
NUQUE|Arrière du cou
OBJET|Chose
ODEUR|Parfum
OFFRE|Proposition
OLIVE|Fruit de l'olivier
ONGLE|Il pousse au bout du doigt
OPERA|Spectacle chanté
ORDRE|Commandement
ORGUE|Instrument d'église
OTAGE|Prisonnier du ravisseur
OUBLI|Trou de mémoire
OUEST|Côté du couchant
OUTRE|Sac en peau
PACTE|Accord
PAIRE|Deux
PANDA|Mangeur de bambou
PANNE|Défaillance
PAROI|Mur
PARTI|Formation politique
PATTE|Membre d'animal
PAUME|Creux de la main
PAUSE|Interruption
PEAUX|Épidermes
PECHE|Fruit à noyau
PEINE|Chagrin
PEINT|Recouvert de couleur
PELLE|Outil pour creuser
PENAL|Code des crimes
PENTE|Descente
PEPIN|Graine de pomme
PERDU|Égaré
PERIL|Danger
PERLE|Bijou de l'huître
PERTE|Disparition
PESER|Mettre sur la balance
PETIT|Minuscule
PHASE|Étape
PIECE|Monnaie
PIEGE|Traquenard
PIEUX|Dévot
PINCE|Arme du crabe
PIQUE|Couleur de cartes
PISTE|Trace
PITIE|Compassion
PLACE|Square
PLAIE|Blessure
PLANE|Vol de l'aigle
PLATE|Sans relief
PLEIN|Rempli
PLOMB|Métal lourd
PLUME|Elle couvre l'oiseau
POCHE|Sac cousu au vêtement
POELE|Ustensile de cuisine
POEME|Vers en strophes
POETE|Il écrit des vers
POILU|Soldat de 14-18
POING|Main fermée
POINT|Signe de fin de phrase
POKER|Jeu de cartes et de bluff
POLIE|Bien élevée
POMPE|Elle gonfle les pneus
PONEY|Petit cheval
PORTE|Entrée
POSTE|Emploi
POUCE|Gros doigt
PRIER|Implorer
PRIME|Bonus
PRISE|Fiche électrique
PROIE|Victime du prédateur
PROMO|Réduction
PUREE|Plat de pommes de terre
PURGE|Nettoyage
QUANT|… à moi, pour ma part
QUART|Un sur quatre
QUASI|Presque
QUETE|Recherche
QUEUE|File d'attente
RADAR|Il flashe
RAIDE|Rigide
RAMPE|Garde-corps
RANCH|Ferme du cow-boy
RANGE|Ordonné
RATON|Petit rat, ou laveur d'Amérique
RAVIE|Enchantée
RAVIN|Gorge profonde
RAYON|Demi-diamètre
RECIT|Narration
RECUL|Mouvement en arrière
REGLE|Elle trace des traits droits
REGNE|Durée d'un roi
REJET|Refus
RENDU|Restitué
REPIT|Pause bienvenue
RESTE|Ce qui demeure
RETRO|D'autrefois
REVER|Songer
REVUE|Magazine
RIANT|Joyeux
RICHE|Fortuné
RISEE|Objet de moqueries
RIVAL|Concurrent
ROCHE|Pierre
RODEO|Jeu du cow-boy
RONDE|Tournée du veilleur
ROUGE|Couleur de la tomate
ROUTE|Chaussée
ROYAL|Digne d'un roi
RUCHE|Maison des abeilles
RUINE|Décombres
SABRE|Épée courbe
SACRE|Couronnement
SAINE|En bonne santé
SAINT|Canonisé
SALLE|Pièce
SALON|Pièce de réception
SALSA|Danse latine
SALUT|Bonjour
SANTE|À la tienne !
SAUCE|Accompagne les pâtes
SAUNA|Bain de vapeur
SCEAU|Cachet
SCENE|Plateau de théâtre
SCORE|Résultat
SCOUT|Il campe en uniforme
SECTE|Groupe fanatique
SEIZE|Quinze plus un
SELLE|Siège du cavalier
SENAT|Assemblée du Luxembourg
SENTE|Petit sentier
SERIE|Feuilleton
SERRE|Abri vitré pour plantes
SERUM|Antidote
SERVE|Paysanne médiévale
SEUIL|Pas de la porte
SIEUR|Monsieur, jadis
SIGNE|Geste
SIROP|Boisson sucrée
SOBRE|Qui ne boit pas
SOEUR|Frangine
SOLDE|Rabais
SOMME|Total
SONAR|Radar sous-marin
SONDE|Instrument de mesure
SONGE|Rêve
SORTE|Espèce
SOSIE|Double
SOUCI|Inquiétude
SOURD|Qui n'entend pas
SOUTE|Cale de l'avion
SPORT|Activité physique
STAGE|Formation en entreprise
STEAK|Bifteck
STOCK|Réserve
STYLE|Manière d'écrire
SUEDE|Pays de Stockholm
SUEUR|Transpiration
SUITE|Continuation
SUIVI|Accompagnement
SUJET|Thème
SUPER|Génial
SUSHI|Bouchée japonaise
TABAC|Plante à fumer
TACHE|Salissure
TALON|Arrière du pied
TANGO|Danse argentine
TANTE|Sœur du père
TARIF|Prix
TARTE|Pâtisserie aux fruits
TAUPE|Elle creuse des galeries
TEINT|Couleur du visage
TEMPE|Côté du front
TENTE|Abri de camping
TENUE|Uniforme
TERME|Fin
TETUE|Entêtée
TEXTE|Écrit
THEME|Sujet
THESE|Doctorat
TISSU|Étoffe
TITAN|Géant mythologique
TITRE|Nom d'un livre
TOAST|Pain grillé
TOILE|Tableau
TONNE|Mille kilos
TORSE|Buste
TOTAL|Somme
TRACE|Empreinte
TRAME|Intrigue
TREVE|Cessez-le-feu
TRIBU|Clan
TRONC|Corps de l'arbre
TRONE|Siège du roi
TUYAU|Conduit
TYRAN|Despote
UNION|Mariage
UNITE|Un
USAGE|Utilisation
UTILE|Pratique
VALET|Carte entre le dix et la dame
VALSE|Danse viennoise
VALVE|Soupape
VASTE|Immense
VEINE|Chance
VENIN|Poison du serpent
VENTE|Commerce
VENUE|Arrivée
VERRE|On y boit
VERTE|Couleur de l'herbe
VERTU|Qualité morale
VESTE|Veston
VEUVE|Elle a perdu son mari
VIDEO|Film numérique
VIDER|Évacuer
VIEIL|Âgé
VIEUX|Âgé
VILLA|Belle maison
VINGT|Deux dizaines
VIOLE|Instrument ancien à cordes
VITAL|Indispensable
VITRE|Carreau
VIVRE|Exister
VOCAL|De la voix
VOEUX|Souhaits du Nouvel An
VOGUE|Mode
VOILE|Elle pousse le bateau
VOIRE|Et même
VOYOU|Petit délinquant
VRAIE|Exacte
YACHT|Bateau de luxe
ABRICOT|Fruit orange à noyau
ACCIDENT|Collision
ADRESSE|Habileté ou domicile
AFFICHE|Placard publicitaire
AIGUILLE|Elle coud
ALLUMETTE|Elle s'enflamme quand on la frotte
AMBULANCE|Véhicule des urgences
AMPOULE|Elle éclaire
ANCETRE|Aïeul
ANGLAIS|Langue de Shakespeare
ANNIVERSAIRE|Jour des bougies
ANORAK|Veste de ski
APPETIT|Envie de manger
ARROSOIR|Pour les plantes du jardin
ARTICLE|Texte de journal
ASCENSEUR|Il monte les étages
ASPIRINE|Contre le mal de tête
ASSIETTE|On y mange
ASTRONAUTE|Voyageur de l'espace
ATHLETE|Sportif de stade
AUBERGE|Hôtellerie de campagne
AVENTURE|Péripétie
BAGARRE|Rixe
BAGUETTE|Pain long
BAIGNOIRE|Pour prendre un bain
BALANCE|Elle pèse
BALCON|Terrasse en hauteur
BANQUET|Grand festin
BARQUE|Petit bateau à rames
BASSINE|Grand récipient rond
BEIGNET|Pâtisserie frite
BERCEAU|Lit de bébé
BIBERON|Bouteille de bébé
BIJOUTIER|Vendeur de bagues
BLESSURE|Plaie
BONHEUR|Joie de vivre
BOUCHER|Il vend la viande
BOUCHON|Il ferme la bouteille
BOULANGER|Il fait le pain
BOUQUET|Gerbe de fleurs
BOUSSOLE|Elle indique le nord
BOUTEILLE|Flacon
BRACELET|Bijou du poignet
BROCOLI|Chou vert en bouquet
BROUETTE|Chariot à une roue
BROUILLARD|Purée de pois
CABANE|Petite maison de bois
CACAHUETE|Arachide
CAISSE|Là où l'on paie
CAMPAGNE|Le contraire de la ville
CANAPE|Sofa
CAPITAINE|Chef du navire
CARTABLE|Sac d'écolier
CASSEROLE|Ustensile à manche
CATHEDRALE|Grande église
CEINTURE|Elle tient le pantalon
CERCLE|Rond
CERISE|Petit fruit rouge
CERVEAU|Siège de la pensée
CHANCE|Bonne fortune
CHARBON|Combustible noir
CHAUSSETTE|Elle se met avant la chaussure
CHEMINEE|Conduit de fumée
CHEMISE|Elle a un col et des boutons
CHENILLE|Future papillon
CHEVEUX|Chevelure
CHOCOLAT|Douceur au cacao
CINEMA|Septième art
CISEAUX|Ils coupent le papier
CITROUILLE|Courge d'Halloween
CLAVIER|Ensemble de touches
CLOCHER|Tour de l'église
COCHON|Il vit dans la porcherie
COLLINE|Petite montagne
COMEDIE|Pièce drôle
COMPTOIR|Zinc du café
CONCOURS|Compétition
CONFITURE|Fruits cuits au sucre
COPAIN|Ami
COQUILLAGE|Il vit dans une coquille
COSTUME|Complet veston
COUSSIN|Petit oreiller
COUVERCLE|Il ferme la casserole
CRAVATE|Elle se noue au cou
CREPE|Spécialité bretonne
CROCODILE|Reptile à grandes mâchoires
CUISINIER|Chef aux fourneaux
CURIEUX|Il veut tout savoir
DANSEUR|Il fait des pas en rythme
DENTISTE|Il soigne les caries
DESSERT|Fin du repas
DICTIONNAIRE|Recueil de mots
DIMANCHE|Dernier jour de la semaine
DINOSAURE|Reptile disparu
DOUCHE|Jet d'eau pour se laver
ECHARPE|Elle protège le cou du froid
ENVELOPPE|Elle contient la lettre
EPICERIE|Petit commerce de quartier
ESCARGOT|Il porte sa maison
ESPRIT|Intelligence
FACTEUR|Il distribue le courrier
FAMILLE|Parents et enfants
FANTOME|Revenant
FAUTEUIL|Siège à accoudoirs
FERMIER|Exploitant agricole
FESTIVAL|Série de spectacles
FICELLE|Petite corde
FLAMME|Langue de feu
FONTAINE|Source aménagée
FOURCHETTE|Elle pique les aliments
FRAMBOISE|Petit fruit rouge velouté
GALETTE|Gâteau des rois
GLACIER|Fleuve de glace
GOURMAND|Amateur de bonnes choses
GRENIER|Pièce sous le toit
GRENOUILLE|Elle coasse
HARICOT|Légume vert ou blanc
HELICOPTERE|Appareil à hélice horizontale
HOPITAL|On y soigne les malades
LAMPADAIRE|Éclairage de rue
LANGUE|Organe du goût
LEOPARD|Félin tacheté
LIBELLULE|Insecte aux ailes transparentes
LIBRAIRIE|Boutique de livres
LUNETTES|Elles corrigent la vue
MACHINE|Appareil
MAGASIN|Boutique
MAILLOT|Tenue de bain
MARCHAND|Commerçant
MARMOTTE|Elle dort tout l'hiver
MEDAILLE|Récompense en métal
MOUCHOIR|Pour le nez qui coule
MOUSTIQUE|Il pique la nuit
MYSTERE|Énigme
OISEAU|Il a des plumes
OMBRELLE|Petit parasol
ORDINATEUR|Machine à calculer et écrire
PAILLE|Pour boire le soda
PATISSIER|Il fait les gâteaux
PHARMACIE|On y achète des médicaments
PINCEAU|Outil du peintre
PRINCESSE|Fille du roi
PROFESSEUR|Enseignant
PROMENADE|Balade
RESTAURANT|On y mange en payant
REVEIL|Il sonne le matin
ROBINET|Il fait couler l'eau
SANDWICH|Casse-croûte
SAUCISSE|Charcuterie à griller
SAUTERELLE|Insecte sauteur
SCORPION|Arachnide à dard
SOLDAT|Militaire
SOURIRE|Expression de joie
SQUELETTE|Ensemble des os
TOBOGGAN|Glissade du parc
TRACTEUR|Engin agricole
TROMPETTE|Cuivre à pistons
UNIVERS|Cosmos
VAISSELLE|Assiettes et couverts
VENDREDI|Jour avant samedi
VILLAGE|Petite commune
VIOLETTE|Petite fleur mauve
VOLEUR|Cambrioleur
`);
})();
