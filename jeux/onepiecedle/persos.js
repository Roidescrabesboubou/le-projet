/* ============================================================
   PERSONNAGES – One Piece-dle
   Format : Nom|Genre|Affiliation(s)|Fruit|Haki|Prime (berrys)|Taille (cm)|Origine|Premier arc
   - Genre : H ou F
   - Plusieurs valeurs : séparées par des virgules
   - Fruit : Paramecia, Zoan, Logia ou Aucun
   - Haki : Observation, Armement, Rois ou Aucun
   - Prime : 0 = aucune prime connue
   - Premier arc : doit être écrit exactement comme dans la liste ARCS
   ============================================================ */
window.ARCS = ["Romance Dawn","Orange Town","Village de Sirop","Baratie","Arlong Park","Loguetown","Reverse Mountain","Whisky Peak","Little Garden","Royaume de Drum","Alabasta","Jaya","Skypiea","Long Ring Long Land","Water Seven","Enies Lobby","Après Enies Lobby","Thriller Bark","Archipel Sabaody","Amazon Lily","Impel Down","Marineford","Après-guerre","Île des Hommes-Poissons","Punk Hazard","Dressrosa","Zou","Whole Cake Island","Rêverie","Wano","Egghead"];

window.PERSOS = `
Monkey D. Luffy|H|Chapeau de paille|Zoan|Observation,Armement,Rois|3000000000|174|East Blue|Romance Dawn
Roronoa Zoro|H|Chapeau de paille|Aucun|Observation,Armement,Rois|1111000000|181|East Blue|Romance Dawn
Nami|F|Chapeau de paille|Aucun|Aucun|366000000|170|East Blue|Orange Town
Usopp|H|Chapeau de paille|Aucun|Observation|500000000|174|East Blue|Village de Sirop
Sanji|H|Chapeau de paille|Aucun|Observation,Armement|1032000000|180|North Blue|Baratie
Tony Tony Chopper|H|Chapeau de paille|Zoan|Aucun|1000|90|Grand Line|Royaume de Drum
Nico Robin|F|Chapeau de paille|Paramecia|Aucun|930000000|188|West Blue|Whisky Peak
Franky|H|Chapeau de paille|Aucun|Aucun|394000000|240|South Blue|Water Seven
Brook|H|Chapeau de paille|Paramecia|Aucun|383000000|277|West Blue|Thriller Bark
Jinbe|H|Chapeau de paille|Aucun|Observation,Armement|1100000000|301|Grand Line|Impel Down
Shanks|H|Pirates du Roux|Aucun|Observation,Armement,Rois|4048900000|199|West Blue|Romance Dawn
Gol D. Roger|H|Pirates de Roger|Aucun|Observation,Armement,Rois|5564800000|274|East Blue|Romance Dawn
Silvers Rayleigh|H|Pirates de Roger|Aucun|Observation,Armement,Rois|0|188|Inconnue|Archipel Sabaody
Baggy|H|Cross Guild|Paramecia|Aucun|3189000000|192|Inconnue|Orange Town
Dracule Mihawk|H|Cross Guild|Aucun|Observation,Armement|3590000000|198|Inconnue|Baratie
Crocodile|H|Cross Guild|Logia|Observation,Armement|1965000000|253|Inconnue|Alabasta
Koby|H|Marine|Aucun|Observation,Armement|0|167|East Blue|Romance Dawn
Monkey D. Garp|H|Marine|Aucun|Observation,Armement|0|287|East Blue|Après Enies Lobby
Smoker|H|Marine|Logia|Observation,Armement|0|209|Inconnue|Loguetown
Tashigi|F|Marine|Aucun|Aucun|0|170|Inconnue|Loguetown
Sengoku|H|Marine|Zoan|Observation,Armement|0|278|Inconnue|Jaya
Akainu|H|Marine|Logia|Observation,Armement|0|306|Inconnue|Enies Lobby
Kizaru|H|Marine|Logia|Observation,Armement|0|302|Inconnue|Archipel Sabaody
Fujitora|H|Marine|Paramecia|Observation,Armement|0|270|Inconnue|Dressrosa
Aokiji|H|Pirates de Barbe Noire|Logia|Observation,Armement|0|298|Inconnue|Long Ring Long Land
Marshall D. Teach|H|Pirates de Barbe Noire|Logia,Paramecia|Observation,Armement|3996000000|344|Inconnue|Jaya
Edward Newgate|H|Pirates de Barbe Blanche|Paramecia|Observation,Armement,Rois|5046000000|666|Nouveau Monde|Après Enies Lobby
Portgas D. Ace|H|Pirates de Barbe Blanche|Logia|Observation,Armement,Rois|550000000|185|South Blue|Alabasta
Marco|H|Pirates de Barbe Blanche|Zoan|Observation,Armement|1374000000|203|Nouveau Monde|Après Enies Lobby
Sabo|H|Révolutionnaires|Logia|Observation,Armement|602000000|187|East Blue|Après-guerre
Bartholomew Kuma|H|Révolutionnaires|Paramecia|Aucun|296000000|689|South Blue|Jaya
Trafalgar Law|H|Pirates du Heart|Paramecia|Observation,Armement|3000000000|191|North Blue|Archipel Sabaody
Eustass Kid|H|Pirates de Kid|Paramecia|Observation,Armement,Rois|3000000000|205|South Blue|Archipel Sabaody
Killer|H|Pirates de Kid|Aucun|Observation,Armement|200000000|195|South Blue|Archipel Sabaody
Jewelry Bonney|F|Pirates de Bonney|Paramecia|Aucun|320000000|174|South Blue|Archipel Sabaody
Boa Hancock|F|Pirates Kuja|Paramecia|Observation,Armement,Rois|1659000000|191|Calm Belt|Amazon Lily
Donquixote Doflamingo|H|Pirates Donquixote|Paramecia|Observation,Armement,Rois|340000000|305|Red Line|Jaya
Kaido|H|Pirates aux Cent Bêtes|Zoan|Observation,Armement,Rois|4611100000|710|Grand Line|Dressrosa
King|H|Pirates aux Cent Bêtes|Zoan|Observation,Armement|1390000000|615|Inconnue|Wano
Queen|H|Pirates aux Cent Bêtes|Zoan|Observation,Armement|1320000000|602|Inconnue|Wano
Yamato|F|Wano|Zoan|Observation,Armement,Rois|0|263|Nouveau Monde|Wano
Charlotte Linlin|F|Pirates de Big Mom|Paramecia|Observation,Armement,Rois|4388000000|880|Inconnue|Île des Hommes-Poissons
Charlotte Katakuri|H|Pirates de Big Mom|Paramecia|Observation,Armement,Rois|1057000000|509|Nouveau Monde|Whole Cake Island
Charlotte Pudding|F|Pirates de Big Mom|Paramecia|Aucun|0|169|Nouveau Monde|Whole Cake Island
Rob Lucci|H|Gouvernement mondial|Zoan|Observation,Armement|0|212|Inconnue|Water Seven
Kaku|H|Gouvernement mondial|Zoan|Aucun|0|191|Inconnue|Water Seven
Kalifa|F|Gouvernement mondial|Paramecia|Aucun|0|185|Inconnue|Water Seven
Nefertari Vivi|F|Royaume d'Alabasta|Aucun|Aucun|0|169|Grand Line|Whisky Peak
Bon Clay|H|Baroque Works|Paramecia|Aucun|32000000|208|Inconnue|Alabasta
Enel|H|Skypiea|Logia|Observation|0|266|Ciel|Skypiea
Gecko Moria|H|Pirates de Thriller Bark|Paramecia|Aucun|320000000|692|Inconnue|Thriller Bark
Perona|F|Pirates de Thriller Bark|Paramecia|Aucun|0|160|Inconnue|Thriller Bark
Arlong|H|Pirates d'Arlong|Aucun|Aucun|20000000|263|Grand Line|Arlong Park
Kuro|H|Pirates du Chat noir|Aucun|Aucun|16000000|212|Inconnue|Village de Sirop
Don Krieg|H|Pirates de Krieg|Aucun|Aucun|17000000|244|East Blue|Baratie
Shirahoshi|F|Royaume Ryugu|Aucun|Aucun|0|1100|Grand Line|Île des Hommes-Poissons
Caesar Clown|H|Aucune|Logia|Aucun|300000000|302|Inconnue|Punk Hazard
Bartolomeo|H|Pirates de Barto|Paramecia|Aucun|200000000|189|East Blue|Dressrosa
Carrot|F|Minks|Aucun|Aucun|0|160|Nouveau Monde|Zou
`.trim().split("\n").map(l=>{
  const [nom,g,aff,fruit,haki,prime,taille,origine,arc]=l.split("|");
  const L=s=>s.split(",").map(x=>x.trim());
  return {name:nom,genre:g==="H"?"Homme":"Femme",affiliation:L(aff),fruit:L(fruit),haki:L(haki),prime:+prime,taille:+taille,origine,arc,arcN:ARCS.indexOf(arc)};
});
