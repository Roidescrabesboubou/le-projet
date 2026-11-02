/* ============================================================
   L'IMPOSTEUR — paires de mots proches, par thème
   Chaque paire : [mot A, mot B]. Au début de la manche, le jeu
   tire au hasard lequel est le mot des civils et lequel est
   celui de l'imposteur.
   Pour ajouter un thème : une nouvelle clé "emoji Nom": [...]
   ============================================================ */
window.IMPOSTEUR_MOTS = {
  "🍕 Nourriture": [
    ["Pizza","Tarte flambée"],["Croissant","Pain au chocolat"],["Crêpe","Gaufre"],["Burger","Sandwich"],
    ["Sushi","Maki"],["Frites","Chips"],["Pâtes","Riz"],["Glace","Sorbet"],["Fromage","Yaourt"],
    ["Ketchup","Mayonnaise"],["Pomme","Poire"],["Orange","Mandarine"],["Fraise","Framboise"],
    ["Citron","Pamplemousse"],["Raclette","Fondue"],["Couscous","Tajine"],["Soupe","Velouté"],
    ["Tacos","Kebab"],["Ramen","Pho"],["Macaron","Meringue"],["Beurre","Margarine"],["Miel","Confiture"],
    ["Muffin","Cupcake"],["Popcorn","Barbe à papa"],["Omelette","Œuf au plat"],["Saucisson","Jambon"],
    ["Brioche","Pain de mie"],["Nutella","Pâte à tartiner"],["Lasagnes","Gratin"],["Cookie","Brownie"],
    ["Pastèque","Melon"],["Cerise","Raisin"],["Carotte","Radis"],["Tomate","Poivron"]
  ],
  "🥤 Boissons": [
    ["Café","Thé"],["Chocolat chaud","Café au lait"],["Jus d'orange","Jus de pomme"],["Coca","Ice Tea"],
    ["Limonade","Eau gazeuse"],["Milkshake","Smoothie"],["Lait","Lait d'amande"],["Sirop","Jus de fruit"],
    ["Bubble tea","Thé glacé"],["Eau","Eau pétillante"],["Soda","Boisson énergisante"],["Cappuccino","Expresso"]
  ],
  "🐾 Animaux": [
    ["Chat","Lynx"],["Chien","Loup"],["Lion","Tigre"],["Dauphin","Requin"],["Baleine","Orque"],
    ["Abeille","Guêpe"],["Papillon","Libellule"],["Cheval","Âne"],["Vache","Chèvre"],["Mouton","Lama"],
    ["Lapin","Lièvre"],["Hibou","Chouette"],["Corbeau","Pie"],["Pingouin","Manchot"],["Grenouille","Crapaud"],
    ["Serpent","Lézard"],["Crocodile","Alligator"],["Souris","Rat"],["Hamster","Cochon d'Inde"],
    ["Singe","Gorille"],["Panda","Koala"],["Escargot","Limace"],["Araignée","Scorpion"],["Poule","Canard"],
    ["Aigle","Faucon"],["Zèbre","Girafe"],["Hérisson","Porc-épic"],["Fourmi","Termite"],["Phoque","Otarie"],
    ["Renard","Raton laveur"],["Perroquet","Toucan"],["Méduse","Pieuvre"]
  ],
  "🏠 Objets": [
    ["Stylo","Crayon"],["Fourchette","Cuillère"],["Brosse à dents","Dentifrice"],["Oreiller","Couette"],
    ["Montre","Réveil"],["Lunettes","Lentilles"],["Téléphone","Tablette"],["Clé","Cadenas"],
    ["Parapluie","Imperméable"],["Bougie","Lampe"],["Ciseaux","Cutter"],["Savon","Gel douche"],
    ["Miroir","Fenêtre"],["Chaise","Tabouret"],["Canapé","Fauteuil"],["Tasse","Verre"],["Casserole","Poêle"],
    ["Frigo","Congélateur"],["Télécommande","Manette"],["Sac à dos","Valise"],["Livre","Magazine"],
    ["Agrafeuse","Trombone"],["Ampoule","Lampe torche"],["Serviette","Peignoir"],["Balai","Aspirateur"],
    ["Gomme","Blanco"],["Écouteurs","Casque"],["Clavier","Souris d'ordinateur"],["Ordinateur","Console"],
    ["Tapis","Paillasson"],["Coussin","Doudou"],["Enceinte","Radio"]
  ],
  "📍 Lieux": [
    ["Plage","Piscine"],["Montagne","Colline"],["Cinéma","Théâtre"],["Collège","Lycée"],["Hôpital","Pharmacie"],
    ["Supermarché","Marché"],["Restaurant","Cantine"],["Boulangerie","Pâtisserie"],["Bibliothèque","Librairie"],
    ["Musée","Château"],["Gare","Aéroport"],["Parc","Jardin"],["Forêt","Jungle"],["Désert","Savane"],
    ["Hôtel","Camping"],["Stade","Gymnase"],["Église","Cathédrale"],["Prison","Commissariat"],["Zoo","Aquarium"],
    ["Boîte de nuit","Bar"],["Banque","Poste"],["Paris","Londres"],["Lac","Rivière"],["Grotte","Tunnel"],
    ["Parc d'attractions","Fête foraine"],["Ferme","Ranch"],["Salle de bain","Cuisine"],["Grenier","Cave"]
  ],
  "👷 Métiers": [
    ["Pompier","Policier"],["Médecin","Infirmier"],["Boulanger","Pâtissier"],["Professeur","Directeur"],
    ["Pilote","Hôtesse de l'air"],["Cuisinier","Serveur"],["Avocat","Juge"],["Plombier","Électricien"],
    ["Dentiste","Orthodontiste"],["Vétérinaire","Soigneur animalier"],["Chanteur","Rappeur"],["Acteur","Mannequin"],
    ["Journaliste","Présentateur TV"],["Facteur","Livreur"],["Coiffeur","Barbier"],["Architecte","Maçon"],
    ["Astronaute","Pilote de chasse"],["Agriculteur","Jardinier"],["Youtubeur","Streamer"],["Magicien","Clown"],
    ["Détective","Espion"],["Chirurgien","Boucher"],["Caissier","Vendeur"],["Footballeur","Arbitre"]
  ],
  "⚽ Sports & loisirs": [
    ["Football","Rugby"],["Tennis","Badminton"],["Basket","Handball"],["Ski","Snowboard"],["Natation","Plongée"],
    ["Vélo","Trottinette"],["Judo","Karaté"],["Boxe","Catch"],["Golf","Mini-golf"],["Échecs","Dames"],
    ["Bowling","Pétanque"],["Surf","Skate"],["Marathon","Sprint"],["Danse","Gymnastique"],["Yoga","Méditation"],
    ["Escalade","Randonnée"],["Ping-pong","Baby-foot"],["Équitation","Rodéo"],["Karaoké","Concert"],
    ["Pêche","Chasse"],["Puzzle","Lego"],["Monopoly","Uno"],["Cache-cache","Chat perché"],["Volley","Water-polo"],
    ["Patin à glace","Roller"],["Fléchettes","Tir à l'arc"]
  ],
  "🚗 Transports": [
    ["Voiture","Moto"],["Bus","Tramway"],["Train","Métro"],["Avion","Hélicoptère"],["Bateau","Sous-marin"],
    ["Taxi","Limousine"],["Fusée","Satellite"],["Camion","Tracteur"],["Ambulance","Camion de pompiers"],
    ["Montgolfière","Parachute"],["Kayak","Pédalo"],["Téléphérique","Télésiège"],["Scooter","Vélo électrique"],
    ["Paquebot","Voilier"],["TGV","Avion de ligne"],["Calèche","Charrette"]
  ],
  "👕 Vêtements & mode": [
    ["Pull","Sweat"],["Jean","Jogging"],["Baskets","Bottes"],["Casquette","Bonnet"],["Écharpe","Cravate"],
    ["Robe","Jupe"],["Chemise","T-shirt"],["Lunettes de soleil","Masque de ski"],["Manteau","Doudoune"],
    ["Short","Maillot de bain"],["Chaussettes","Collants"],["Pyjama","Chemise de nuit"],["Gants","Moufles"],
    ["Collier","Bracelet"],["Bague","Boucles d'oreilles"],["Ceinture","Bretelles"],["Sac à main","Pochette"],
    ["Tongs","Sandales"],["Parfum","Déodorant"],["Rouge à lèvres","Vernis à ongles"],["Chapeau","Béret"]
  ],
  "🌦️ Nature & météo": [
    ["Soleil","Lune"],["Pluie","Neige"],["Orage","Tempête"],["Arc-en-ciel","Aurore boréale"],["Volcan","Geyser"],
    ["Étoile","Planète"],["Rose","Tulipe"],["Arbre","Buisson"],["Sapin","Palmier"],["Océan","Mer"],
    ["Cascade","Fontaine"],["Nuage","Brouillard"],["Feu de camp","Barbecue"],["Été","Printemps"],["Hiver","Automne"],
    ["Tremblement de terre","Tsunami"],["Sable","Gravier"],["Diamant","Cristal"],["Or","Argent"],["Tornade","Ouragan"],
    ["Coquillage","Galet"],["Champignon","Mousse"]
  ],
  "🐉 Fantastique": [
    ["Dragon","Licorne"],["Fée","Sirène"],["Fantôme","Zombie"],["Vampire","Loup-garou"],["Sorcière","Magicien"],
    ["Chevalier","Viking"],["Pirate","Corsaire"],["Robot","Extraterrestre"],["Superman","Batman"],
    ["Père Noël","Lapin de Pâques"],["Baguette magique","Balai volant"],["Trésor","Coffre-fort"],
    ["Ninja","Samouraï"],["Elfe","Lutin"],["Géant","Ogre"],["Momie","Squelette"]
  ],
  "🎮 Jeux vidéo & animés": [
    ["Pokémon","Digimon"],["Naruto","Sasuke"],["Goku","Vegeta"],["Luffy","Zoro"],["Mario","Luigi"],
    ["Minecraft","Roblox"],["Fortnite","Apex Legends"],["Pikachu","Évoli"],["Manga","Comics"],
    ["PlayStation","Xbox"],["Sonic","Pac-Man"],["Tetris","Candy Crush"],["Dragon Ball","One Piece"],
    ["Demon Slayer","Jujutsu Kaisen"],["Kamehameha","Rasengan"],["Animé","Dessin animé"],["Cosplay","Déguisement"],
    ["Manette","Joystick"],["Boss final","Mini-boss"],["Switch","Game Boy"]
  ],
  "🎉 Vie quotidienne": [
    ["Anniversaire","Mariage"],["Noël","Nouvel An"],["Halloween","Carnaval"],["Pique-nique","Goûter"],
    ["Concert","Festival"],["Soirée pyjama","Colonie de vacances"],["Examen","Interro"],
    ["Rendez-vous","Entretien d'embauche"],["Déménagement","Voyage"],["Douche","Bain"],["Sieste","Grasse matinée"],
    ["Selfie","Photo de classe"],["Lessive","Vaisselle"],["Lundi","Vendredi"],["Petit-déjeuner","Brunch"],
    ["Message","Appel"],["Bisou","Câlin"],["Dispute","Rupture"],["Cadeau","Surprise"],["Vacances","Week-end"]
  ]
};
