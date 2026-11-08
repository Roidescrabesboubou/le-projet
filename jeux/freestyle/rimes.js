/* Freestyle — familles de rimes (même son final).
   Deux lignes qui se suivent prennent deux mots de la même famille.
   Un mot = un seul mot (pas d'espace ni de tiret) pour que le juge
   au micro puisse le reconnaître. */
window.RIMES = [
  ["maison","saison","raison","horizon","poison","frisson","garçon","leçon","chanson","glaçon","poisson","prison","million","avion","camion","champion","passion","mission","question","crayon","ballon","bouton","dragon","démon"],
  ["café","été","liberté","vérité","fierté","beauté","clé","danger","rocher","papier","métier","côté","santé","passé","entrée","quartier","escalier","guerrier","sorcier","fusée"],
  ["avenir","désir","plaisir","sourire","empire","souvenir","partir","saphir","vampire","délire","navire","martyr","rire","pire","dire"],
  ["cœur","bonheur","peur","douleur","couleur","honneur","moteur","chaleur","valeur","rumeur","sueur","heure","fleur","vainqueur","docteur","rappeur","danseur","menteur"],
  ["chance","danse","silence","enfance","France","vacances","confiance","distance","puissance","vengeance","science","absence","patience","ambiance","balance","urgence"],
  ["ville","tranquille","fragile","facile","difficile","île","style","missile","mobile","huile","fil","exil","asile","crocodile","reptile"],
  ["star","guitare","bizarre","retard","regard","phare","cauchemar","bar","radar","placard","billard","brouillard","dollar","jaguar","hasard","foulard","canard","renard"],
  ["espoir","histoire","mémoire","victoire","miroir","trottoir","couloir","devoir","pouvoir","savoir","soir","noir","gloire","territoire","armoire","boire","croire"],
  ["demain","chemin","matin","destin","jardin","lapin","requin","refrain","train","pain","main","copain","voisin","cousin","festin","marin","sapin","parrain"],
  ["lumière","frontière","guerre","terre","mystère","colère","galère","frère","mère","verre","hiver","désert","univers","enfer","éclair","mer","fer","vipère"],
  ["bateau","cadeau","château","couteau","gâteau","oiseau","chapeau","rideau","studio","micro","piano","tempo","vélo","stylo","zéro","héros","métro","radio","bravo","tableau"],
  ["vie","envie","ami","nuit","pluie","folie","magie","génie","souci","paradis","survie","minuit","bougie","mairie","pari","parti","colibri","incendie"],
  ["voyage","nuage","courage","visage","image","plage","orage","rivage","sauvage","message","page","cage","mirage","barrage","fromage","garage","étage"],
  ["fou","loup","genou","bijou","caillou","hibou","kangourou","tabou","partout","debout","joue","roue","boue","bambou","matou","clou"],
  ["jeu","feu","bleu","dieu","adieu","milieu","cheveu","neveu","lieu","vœu","peu","heureux","nerveux","sérieux","joyeux","curieux","précieux","yeux"],
  ["planète","tête","fête","tempête","conquête","baguette","chouette","trompette","lunette","cassette","trottinette","recette","raquette","manette","silhouette","bête"],
  ["aventure","nature","voiture","armure","blessure","signature","culture","ceinture","peinture","murmure","futur","mur","dur","pur","sûr","azur","parure"],
  ["argent","vent","temps","moment","serpent","talent","instant","géant","océan","enfant","parent","élan","volcan","ruban","roman","printemps","diamant","aimant"],
  ["salade","balade","camarade","parade","grenade","limonade","malade","façade","escalade","sérénade","pommade","tornade","cascade","embuscade"],
  ["bulle","pendule","crépuscule","libellule","capsule","formule","virgule","cellule","majuscule","ridicule","véhicule","bascule","particule"],
  ["rose","chose","pause","cause","dose","prose","virtuose","métamorphose","explose","pose","overdose","ose"],
  ["bataille","médaille","paille","taille","canaille","muraille","écaille","ferraille","faille","pagaille","volaille","limaille"],
  ["soleil","réveil","sommeil","conseil","abeille","bouteille","oreille","merveille","pareil","orteil","appareil","vermeil","groseille","corbeille"],
  ["musique","magique","physique","panique","électrique","fantastique","Afrique","Amérique","pratique","tactique","classique","unique","logique","boutique","brique"],
  ["artiste","piste","triste","liste","touriste","dentiste","cycliste","existe","insiste","pianiste","alpiniste","complotiste"],
  ["vitesse","jeunesse","promesse","tendresse","sagesse","adresse","faiblesse","richesse","paresse","ivresse","princesse","caresse","tristesse","messe"],
  ["reine","chaîne","haine","peine","semaine","fontaine","baleine","capitaine","graine","arène","scène","migraine","laine","sirène","antenne"],
  ["route","doute","goutte","écoute","déroute","croûte","soute","autoroute","banqueroute","joute","toute"],
  ["fort","mort","port","sort","effort","trésor","corps","décor","record","accord","dehors","alors","castor","encore","or","nord","bord"],
  ["grenouille","citrouille","fripouille","nouille","rouille","andouille","patrouille","chatouille","bredouille","trouille","dépouille"],
  ["sac","lac","bac","hamac","tabac","flaque","plaque","attaque","baraque","opaque","arnaque","claque","craque","matraque"],
  ["problème","poème","système","extrême","thème","même","crème","baptême","emblème","blême","bohème","chrysanthème"],
  ["bouche","mouche","douche","louche","cartouche","farouche","babouche","touche","souche","escarmouche"],
  ["bombe","tombe","colombe","catacombe","trombe","hécatombe","surplombe","retombe"],
  ["cuisine","machine","piscine","colline","usine","voisine","copine","racine","vitamine","routine","tartine","sardine","cantine","origine","vitrine"],
  ["ciel","miel","essentiel","logiciel","officiel","artificiel","potentiel","sel","appel","rebelle","hôtel","modèle","échelle","nouvelle","étincelle"],
  ["flamme","âme","drame","larme","calme","charme","alarme","arme","programme","madame","lame","gramme","vacarme"],
  ["chocolat","pizza","cinéma","nirvana","opéra","samba","tombola","panda","koala","cobra","boa","karma","drama","éclat","combat","climat","chat","soldat"]
];

/* Thèmes pour s'inspirer (optionnel). */
window.THEMES = [
  "ta ville","l'école","ton meilleur pote","les vacances","la nourriture","le foot","les jeux vidéo",
  "l'argent","l'amour","la nuit","ton enfance","le futur","la famille","les réseaux sociaux",
  "un super-héros","l'espace","la mer","le lundi matin","ta chambre","la musique","un dragon",
  "le métro","la pluie","les vacances ratées","ton premier concert","un voyage dans le temps"
];
