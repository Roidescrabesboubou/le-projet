/* ============================================================
   PERSONNAGES – Anidle

   ŒUVRES : Titre|Format|Année|Autres titres (facultatif, pour la recherche)
   - Format : Shōnen, Seinen, Light novel, Webtoon, Anime original, Jeu vidéo
   - Année : première publication dans ce format (LN : le 1er tome, pas la version web)

   PERSONNAGES : Nom|Alias|Genre|Espèces|Cheveux|Pouvoirs|Rôles|Œuvre|Jour
   - Alias : autres noms acceptés dans la recherche (séparés par des virgules)
   - Genre : H, F ou A (autre / non défini)
   - Plusieurs valeurs : séparées par des virgules
   - Œuvre : écrite exactement comme dans la liste des œuvres
   - Jour : 1 = peut être le personnage du jour (les plus connus), vide sinon

   Espèces : Humain, Démon, Esprit (shinigami, yōkai, fléaux, fantômes), Dieu, Animal,
     Machine, Extraterrestre, Mort-vivant, Monstre (goules, kaiju, homoncules…), Elfe,
     Fée, Géant, Nain
   Cheveux : couleur dominante (ou pelage) : Noir, Brun, Blond, Orange, Rouge, Rose,
     Violet, Bleu, Vert, Gris, Blanc (dont argenté), Chauve (aucun cheveu)
   Pouvoirs (3 au maximum, les plus marquants) :
     Aucun, Combat (arts martiaux, force physique), Arme (épée, arme à feu, etc.),
     Énergie (ki, chakra, nen, haki, reiatsu, énergie occulte, cosmos),
     Pouvoir spécial (fruit du démon, alter, Geass, Sharingan, technique innée…),
     Magie (dont l'alchimie), Technologie (mecha, cyberware, inventions),
     Transformation, Intellect, Sport
   Rôles : Protagoniste, Allié, Antagoniste, Rival, Mentor
   ============================================================ */
window.ANI_OEUVRES = `
One Piece|Shōnen|1997
Naruto|Shōnen|1999|Shippuden
Dragon Ball|Shōnen|1984|DBZ,Dragon Ball Z,DBS,Dragon Ball Super
Bleach|Shōnen|2001
My Hero Academia|Shōnen|2014|MHA,BNHA,Boku no Hero Academia
Demon Slayer|Shōnen|2016|Kimetsu no Yaiba,KNY
Jujutsu Kaisen|Shōnen|2018|JJK
L'Attaque des Titans|Shōnen|2009|SNK,AOT,Shingeki no Kyojin,Attack on Titan
Hunter x Hunter|Shōnen|1998|HXH
Fullmetal Alchemist|Shōnen|2001|FMA,FMAB,Brotherhood
Death Note|Shōnen|2003
One Punch Man|Seinen|2012|OPM
Fairy Tail|Shōnen|2006
Chainsaw Man|Shōnen|2018
Spy x Family|Shōnen|2019
Tokyo Ghoul|Seinen|2011
Black Clover|Shōnen|2015
Pokémon|Jeu vidéo|1996
Dr. Stone|Shōnen|2017
Mob Psycho 100|Shōnen|2012
Code Geass|Anime original|2006
Neon Genesis Evangelion|Anime original|1995|NGE,Eva
Gintama|Shōnen|2003
Blue Lock|Shōnen|2018
Solo Leveling|Webtoon|2018
Frieren|Shōnen|2020|Sousou no Frieren
Seven Deadly Sins|Shōnen|2012|7DS,Nanatsu no Taizai
Dandadan|Shōnen|2021
Kaiju No. 8|Shōnen|2020
Sakamoto Days|Shōnen|2020
Cyberpunk Edgerunners|Anime original|2022
Hell's Paradise|Shōnen|2018
Mashle|Shōnen|2020
Tokyo Revengers|Shōnen|2017
Les Carnets de l'apothicaire|Light novel|2014|Apothecary Diaries,Kusuriya
Fire Force|Shōnen|2015
Assassination Classroom|Shōnen|2012
Vinland Saga|Seinen|2005
Re:Zero|Light novel|2014
Sword Art Online|Light novel|2009|SAO
Konosuba|Light novel|2013
Moi, quand je me réincarne en Slime|Light novel|2014|Tensura,That Time I Got Reincarnated as a Slime
Overlord|Light novel|2012
The Rising of the Shield Hero|Light novel|2013|Tate no Yuusha
Mushoku Tensei|Light novel|2014|Jobless Reincarnation
The Eminence in Shadow|Light novel|2018
Classroom of the Elite|Light novel|2015|COTE
Berserk|Seinen|1989
Steins;Gate|Jeu vidéo|2009
Kill la Kill|Anime original|2013
Violet Evergarden|Light novel|2015
Beastars|Shōnen|2016
Kaguya-sama|Seinen|2015|Love is War
Oshi no Ko|Seinen|2020
Toradora!|Light novel|2006
Bloom Into You|Shōnen|2015
Blue Box|Shōnen|2021
Horimiya|Shōnen|2011
My Dress-Up Darling|Seinen|2018
The Quintessential Quintuplets|Shōnen|2017|Quintuplées,Gotoubun
The Dangers in My Heart|Shōnen|2018
Komi cherche ses mots|Shōnen|2016|Komi Can't Communicate
Rent-a-Girlfriend|Shōnen|2017
Saint Seiya|Shōnen|1986
Yu Yu Hakusho|Shōnen|1990
Yu-Gi-Oh!|Shōnen|1996
Inuyasha|Shōnen|1996
Cowboy Bebop|Anime original|1998
Slam Dunk|Shōnen|1990
Highschool DxD|Light novel|2008|DxD
High School of the Dead|Shōnen|2006|HOTD
To Love-Ru|Shōnen|2006|To Love Ru
Delicious in Dungeon|Seinen|2014|Gloutons et Dragons,Dungeon Meshi
Wind Breaker|Shōnen|2021
Lycoris Recoil|Anime original|2022
`;

window.ANI_PERSOS = `
Monkey D. Luffy|Luffy|H|Humain|Noir|Pouvoir spécial,Combat,Énergie|Protagoniste|One Piece|1
Roronoa Zoro|Zoro|H|Humain|Vert|Arme,Énergie|Allié|One Piece|1
Nami||F|Humain|Orange|Arme|Allié|One Piece|1
Sanji||H|Humain|Blond|Combat,Énergie|Allié|One Piece|1
Usopp||H|Humain|Noir|Arme|Allié|One Piece|
Tony Tony Chopper|Chopper|H|Animal|Brun|Pouvoir spécial,Transformation|Allié|One Piece|1
Nico Robin|Robin|F|Humain|Noir|Pouvoir spécial|Allié|One Piece|
Portgas D. Ace|Ace|H|Humain|Noir|Pouvoir spécial,Énergie|Allié|One Piece|1
Shanks|Le Roux|H|Humain|Rouge|Arme,Énergie|Mentor|One Piece|1
Trafalgar Law|Law|H|Humain|Noir|Pouvoir spécial,Arme|Allié|One Piece|
Naruto Uzumaki|Naruto|H|Humain|Blond|Énergie,Combat|Protagoniste|Naruto|1
Sasuke Uchiha|Sasuke|H|Humain|Noir|Énergie,Pouvoir spécial,Arme|Rival,Allié|Naruto|1
Sakura Haruno|Sakura|F|Humain|Rose|Énergie,Combat|Allié|Naruto|1
Kakashi Hatake|Kakashi|H|Humain|Blanc|Énergie,Pouvoir spécial|Mentor|Naruto|1
Itachi Uchiha|Itachi|H|Humain|Noir|Énergie,Pouvoir spécial|Antagoniste,Allié|Naruto|1
Gaara||H|Humain|Rouge|Énergie|Rival,Allié|Naruto|
Hinata Hyuga|Hinata|F|Humain|Bleu|Énergie,Pouvoir spécial|Allié|Naruto|
Jiraiya||H|Humain|Blanc|Énergie|Mentor|Naruto|
Madara Uchiha|Madara|H|Humain|Noir|Énergie,Pouvoir spécial|Antagoniste|Naruto|1
Orochimaru||H|Humain|Noir|Énergie|Antagoniste|Naruto|
Son Goku|Goku,Sangoku,Kakarot|H|Extraterrestre|Noir|Combat,Énergie,Transformation|Protagoniste|Dragon Ball|1
Vegeta|Végéta|H|Extraterrestre|Noir|Combat,Énergie,Transformation|Rival,Allié|Dragon Ball|1
Son Gohan|Gohan,Sangohan|H|Extraterrestre,Humain|Noir|Combat,Énergie,Transformation|Allié|Dragon Ball|1
Piccolo|Petit-Cœur|H|Extraterrestre|Chauve|Combat,Énergie|Mentor,Allié|Dragon Ball|1
Freezer|Frieza,Freeza|H|Extraterrestre|Chauve|Énergie,Transformation|Antagoniste|Dragon Ball|1
Krilin|Krillin|H|Humain|Chauve|Combat,Énergie|Allié|Dragon Ball|
Bulma||F|Humain|Bleu|Technologie,Intellect|Allié|Dragon Ball|1
Cell||H|Machine|Chauve|Énergie,Transformation|Antagoniste|Dragon Ball|
Trunks||H|Extraterrestre,Humain|Violet|Arme,Énergie,Transformation|Allié|Dragon Ball|
Majin Buu|Boo,Buu|A|Monstre|Chauve|Énergie,Transformation|Antagoniste,Allié|Dragon Ball|
Ichigo Kurosaki|Ichigo|H|Humain,Esprit|Orange|Arme,Énergie,Transformation|Protagoniste|Bleach|1
Rukia Kuchiki|Rukia|F|Esprit|Noir|Arme,Énergie|Allié|Bleach|1
Sosuke Aizen|Aizen|H|Esprit|Brun|Arme,Énergie,Intellect|Antagoniste|Bleach|1
Byakuya Kuchiki|Byakuya|H|Esprit|Noir|Arme,Énergie|Rival,Allié|Bleach|
Kenpachi Zaraki|Kenpachi|H|Esprit|Noir|Arme,Combat|Allié|Bleach|
Kisuke Urahara|Urahara|H|Esprit|Blond|Arme,Intellect,Technologie|Mentor|Bleach|
Orihime Inoue|Orihime|F|Humain|Orange|Pouvoir spécial|Allié|Bleach|
Toshiro Hitsugaya|Hitsugaya,Toshiro|H|Esprit|Blanc|Arme,Énergie|Allié|Bleach|
Izuku Midoriya|Deku,Izuku|H|Humain|Vert|Pouvoir spécial,Combat|Protagoniste|My Hero Academia|1
Katsuki Bakugo|Bakugo,Kacchan|H|Humain|Blond|Pouvoir spécial|Rival,Allié|My Hero Academia|1
All Might|Toshinori Yagi|H|Humain|Blond|Pouvoir spécial,Combat|Mentor|My Hero Academia|1
Shoto Todoroki|Todoroki,Shoto|H|Humain|Blanc,Rouge|Pouvoir spécial|Allié|My Hero Academia|1
Ochaco Uraraka|Uraraka,Ochaco|F|Humain|Brun|Pouvoir spécial|Allié|My Hero Academia|
Tomura Shigaraki|Shigaraki|H|Humain|Gris|Pouvoir spécial|Antagoniste|My Hero Academia|
Endeavor|Enji Todoroki|H|Humain|Rouge|Pouvoir spécial|Allié|My Hero Academia|
Himiko Toga|Toga|F|Humain|Blond|Pouvoir spécial,Transformation,Arme|Antagoniste|My Hero Academia|
Tanjiro Kamado|Tanjiro|H|Humain|Noir,Rouge|Arme,Combat|Protagoniste|Demon Slayer|1
Nezuko Kamado|Nezuko|F|Démon|Noir,Orange|Pouvoir spécial,Transformation|Allié|Demon Slayer|1
Zenitsu Agatsuma|Zenitsu|H|Humain|Blond|Arme,Combat|Allié|Demon Slayer|1
Inosuke Hashibira|Inosuke|H|Humain|Noir,Bleu|Arme,Combat|Allié|Demon Slayer|1
Kyojuro Rengoku|Rengoku|H|Humain|Blond,Rouge|Arme,Combat|Mentor|Demon Slayer|1
Giyu Tomioka|Giyu,Tomioka|H|Humain|Noir|Arme,Combat|Mentor,Allié|Demon Slayer|
Muzan Kibutsuji|Muzan|H|Démon|Noir|Pouvoir spécial,Transformation|Antagoniste|Demon Slayer|1
Shinobu Kocho|Shinobu|F|Humain|Noir,Violet|Arme,Intellect|Allié|Demon Slayer|
Yuji Itadori|Itadori,Yuji|H|Humain|Rose|Combat,Énergie|Protagoniste|Jujutsu Kaisen|1
Megumi Fushiguro|Megumi|H|Humain|Noir|Énergie,Pouvoir spécial|Allié|Jujutsu Kaisen|1
Nobara Kugisaki|Nobara|F|Humain|Orange|Énergie,Pouvoir spécial,Arme|Allié|Jujutsu Kaisen|1
Satoru Gojo|Gojo,Satoru|H|Humain|Blanc|Énergie,Pouvoir spécial|Mentor|Jujutsu Kaisen|1
Ryomen Sukuna|Sukuna|H|Esprit|Rose|Énergie,Pouvoir spécial|Antagoniste|Jujutsu Kaisen|1
Maki Zenin|Maki|F|Humain|Vert|Arme,Combat|Allié|Jujutsu Kaisen|
Toji Fushiguro|Toji|H|Humain|Noir|Arme,Combat|Antagoniste|Jujutsu Kaisen|
Suguru Geto|Geto|H|Humain|Noir|Énergie,Pouvoir spécial|Antagoniste|Jujutsu Kaisen|
Eren Jäger|Eren,Eren Yeager|H|Humain|Brun|Transformation,Arme|Protagoniste,Antagoniste|L'Attaque des Titans|1
Mikasa Ackerman|Mikasa|F|Humain|Noir|Arme,Combat|Allié|L'Attaque des Titans|1
Armin Arlert|Armin|H|Humain|Blond|Intellect,Transformation|Allié|L'Attaque des Titans|1
Livaï Ackerman|Levi,Livai|H|Humain|Noir|Arme,Combat|Mentor,Allié|L'Attaque des Titans|1
Erwin Smith|Erwin|H|Humain|Blond|Intellect,Arme|Mentor|L'Attaque des Titans|
Hansi Zoë|Hange,Hansi|A|Humain|Brun|Intellect,Technologie,Arme|Allié|L'Attaque des Titans|
Reiner Braun|Reiner|H|Humain|Blond|Transformation|Antagoniste|L'Attaque des Titans|
Annie Leonhart|Annie|F|Humain|Blond|Transformation,Combat|Antagoniste|L'Attaque des Titans|
Gon Freecss|Gon|H|Humain|Noir,Vert|Énergie,Combat|Protagoniste|Hunter x Hunter|1
Killua Zoldyck|Killua|H|Humain|Blanc|Énergie,Combat|Allié|Hunter x Hunter|1
Kurapika||H|Humain|Blond|Énergie,Pouvoir spécial|Allié|Hunter x Hunter|1
Leorio Paladiknight|Leorio|H|Humain|Noir|Énergie|Allié|Hunter x Hunter|
Hisoka Morow|Hisoka|H|Humain|Rouge|Énergie,Arme|Antagoniste,Rival|Hunter x Hunter|1
Chrollo Lucilfer|Chrollo|H|Humain|Noir|Énergie,Pouvoir spécial|Antagoniste|Hunter x Hunter|
Isaac Netero|Netero|H|Humain|Blanc|Énergie,Combat|Mentor|Hunter x Hunter|
Meruem||H|Monstre|Chauve|Énergie,Intellect|Antagoniste|Hunter x Hunter|
Edward Elric|Ed,Edward|H|Humain|Blond|Magie,Combat|Protagoniste|Fullmetal Alchemist|1
Alphonse Elric|Al,Alphonse|H|Humain|Blond|Magie,Combat|Allié|Fullmetal Alchemist|1
Roy Mustang|Mustang,Roy|H|Humain|Noir|Magie|Allié|Fullmetal Alchemist|1
Winry Rockbell|Winry|F|Humain|Blond|Technologie|Allié|Fullmetal Alchemist|
Riza Hawkeye|Riza,Hawkeye|F|Humain|Blond|Arme|Allié|Fullmetal Alchemist|
Scar||H|Humain|Blanc|Magie,Combat|Antagoniste,Allié|Fullmetal Alchemist|
Envy||A|Monstre|Vert|Transformation|Antagoniste|Fullmetal Alchemist|
Light Yagami|Light,Kira|H|Humain|Brun|Intellect|Protagoniste,Antagoniste|Death Note|1
L|L Lawliet,Ryuzaki|H|Humain|Noir|Intellect|Rival|Death Note|1
Ryuk||H|Esprit|Noir|Pouvoir spécial|Allié|Death Note|1
Misa Amane|Misa|F|Humain|Blond|Pouvoir spécial|Allié|Death Note|
Near|Nate River|H|Humain|Blanc|Intellect|Rival|Death Note|
Saitama|One Punch Man|H|Humain|Chauve|Combat|Protagoniste|One Punch Man|1
Genos||H|Machine|Blond|Technologie,Combat|Allié|One Punch Man|1
Garou||H|Humain,Monstre|Gris|Combat|Antagoniste,Rival|One Punch Man|
Tatsumaki|Tornade|F|Humain|Vert|Pouvoir spécial|Allié|One Punch Man|
King (One Punch Man)|King|H|Humain|Blond|Aucun|Allié|One Punch Man|
Natsu Dragneel|Natsu|H|Humain|Rose|Magie,Combat|Protagoniste|Fairy Tail|1
Lucy Heartfilia|Lucy|F|Humain|Blond|Magie|Allié|Fairy Tail|1
Erza Scarlet|Erza|F|Humain|Rouge|Magie,Arme|Allié|Fairy Tail|1
Grey Fullbuster|Grey,Gray|H|Humain|Noir|Magie|Allié|Fairy Tail|
Happy||H|Animal|Bleu|Magie|Allié|Fairy Tail|
Gajeel Redfox|Gajeel|H|Humain|Noir|Magie,Combat|Rival,Allié|Fairy Tail|
Denji|Chainsaw Man|H|Humain,Démon|Blond|Transformation|Protagoniste|Chainsaw Man|1
Power||F|Démon|Blond|Pouvoir spécial,Arme|Allié|Chainsaw Man|1
Makima||F|Démon|Rouge|Pouvoir spécial|Antagoniste|Chainsaw Man|1
Aki Hayakawa|Aki|H|Humain|Noir|Arme,Pouvoir spécial|Allié|Chainsaw Man|1
Reze||F|Démon|Violet|Transformation,Pouvoir spécial|Antagoniste|Chainsaw Man|
Pochita||A|Démon|Orange|Pouvoir spécial|Allié|Chainsaw Man|
Loid Forger|Loid,Twilight|H|Humain|Blond|Intellect,Arme,Combat|Protagoniste|Spy x Family|1
Anya Forger|Anya|F|Humain|Rose|Pouvoir spécial|Protagoniste|Spy x Family|1
Yor Forger|Yor,Princesse Ortie|F|Humain|Noir|Arme,Combat|Protagoniste|Spy x Family|1
Bond Forger|Bond|H|Animal|Blanc|Pouvoir spécial|Allié|Spy x Family|
Damian Desmond|Damian|H|Humain|Noir|Aucun|Rival|Spy x Family|
Ken Kaneki|Kaneki|H|Humain,Monstre|Blanc,Noir|Pouvoir spécial|Protagoniste|Tokyo Ghoul|1
Touka Kirishima|Touka|F|Monstre|Violet|Pouvoir spécial|Allié|Tokyo Ghoul|1
Rize Kamishiro|Rize|F|Monstre|Violet|Pouvoir spécial|Antagoniste|Tokyo Ghoul|
Juzo Suzuya|Juzo,Rei Suzuya|H|Humain|Blanc|Arme|Allié|Tokyo Ghoul|
Shu Tsukiyama|Tsukiyama|H|Monstre|Violet|Pouvoir spécial|Antagoniste,Allié|Tokyo Ghoul|
Asta||H|Humain|Gris|Arme,Combat|Protagoniste|Black Clover|1
Yuno|Yuno Grinberryall|H|Humain|Noir|Magie|Rival|Black Clover|1
Noelle Silva|Noelle|F|Humain|Blanc|Magie|Allié|Black Clover|
Yami Sukehiro|Yami|H|Humain|Noir|Magie,Arme|Mentor|Black Clover|
Julius Novachrono|Julius|H|Humain|Blond|Magie|Mentor|Black Clover|
Sacha|Ash,Sacha Ketchum,Ash Ketchum|H|Humain|Noir|Aucun|Protagoniste|Pokémon|1
Pikachu||H|Animal|Blond|Pouvoir spécial|Allié|Pokémon|1
Ondine|Misty|F|Humain|Orange|Aucun|Allié|Pokémon|
Pierre|Brock|H|Humain|Brun|Aucun|Allié|Pokémon|
Mewtwo||A|Animal|Blanc|Pouvoir spécial|Antagoniste|Pokémon|
Senku Ishigami|Senku|H|Humain|Blanc,Vert|Intellect,Technologie|Protagoniste|Dr. Stone|1
Chrome||H|Humain|Brun|Intellect,Technologie|Allié|Dr. Stone|
Tsukasa Shishio|Tsukasa|H|Humain|Brun|Combat|Antagoniste,Rival|Dr. Stone|
Kohaku||F|Humain|Blond|Arme,Combat|Allié|Dr. Stone|
Shigeo Kageyama|Mob,Shigeo|H|Humain|Noir|Pouvoir spécial|Protagoniste|Mob Psycho 100|1
Arataka Reigen|Reigen|H|Humain|Brun|Intellect|Mentor|Mob Psycho 100|1
Dimple|Ekubo|H|Esprit|Chauve|Pouvoir spécial|Allié|Mob Psycho 100|
Teruki Hanazawa|Teru|H|Humain|Blond|Pouvoir spécial|Rival,Allié|Mob Psycho 100|
Lelouch Lamperouge|Lelouch,Zero,Lelouch vi Britannia|H|Humain|Noir|Pouvoir spécial,Intellect|Protagoniste|Code Geass|1
Suzaku Kururugi|Suzaku|H|Humain|Brun|Technologie,Combat|Rival|Code Geass|1
C.C.|CC|F|Humain|Vert|Pouvoir spécial|Allié|Code Geass|1
Kallen Kozuki|Kallen|F|Humain|Rouge|Technologie|Allié|Code Geass|
Nunnally Lamperouge|Nunnally|F|Humain|Brun|Aucun|Allié|Code Geass|
Shinji Ikari|Shinji|H|Humain|Brun|Technologie|Protagoniste|Neon Genesis Evangelion|1
Asuka Langley Soryu|Asuka|F|Humain|Orange|Technologie|Allié,Rival|Neon Genesis Evangelion|1
Rei Ayanami|Rei|F|Humain|Bleu|Technologie|Allié|Neon Genesis Evangelion|1
Misato Katsuragi|Misato|F|Humain|Violet|Arme,Intellect|Mentor|Neon Genesis Evangelion|
Gendo Ikari|Gendo|H|Humain|Brun|Intellect|Antagoniste|Neon Genesis Evangelion|
Gintoki Sakata|Gintoki,Gin|H|Humain|Blanc|Arme,Combat|Protagoniste|Gintama|1
Kagura||F|Extraterrestre|Orange|Combat,Arme|Allié|Gintama|1
Shinpachi Shimura|Shinpachi|H|Humain|Noir|Arme|Allié|Gintama|
Toshiro Hijikata|Hijikata|H|Humain|Noir|Arme|Allié,Rival|Gintama|
Sogo Okita|Okita,Sogo|H|Humain|Brun|Arme|Allié|Gintama|
Yoichi Isagi|Isagi|H|Humain|Noir|Sport,Intellect|Protagoniste|Blue Lock|1
Meguru Bachira|Bachira|H|Humain|Noir,Blond|Sport|Allié|Blue Lock|
Seishiro Nagi|Nagi|H|Humain|Blanc|Sport|Allié,Rival|Blue Lock|
Rin Itoshi|Rin|H|Humain|Noir|Sport|Rival|Blue Lock|1
Shoei Barou|Barou|H|Humain|Noir|Sport|Rival|Blue Lock|
Hyoma Chigiri|Chigiri|H|Humain|Rouge|Sport|Allié|Blue Lock|
Sung Jin-woo|Jinwoo,Jin-woo,Sung Jinwoo|H|Humain|Noir|Pouvoir spécial,Arme|Protagoniste|Solo Leveling|1
Cha Hae-in|Hae-in|F|Humain|Blond|Arme|Allié|Solo Leveling|
Yoo Jin-ho|Jinho|H|Humain|Blond|Arme|Allié|Solo Leveling|
Beru||H|Mort-vivant,Monstre|Chauve|Combat|Allié|Solo Leveling|
Igris||H|Mort-vivant|Rouge|Arme|Allié|Solo Leveling|
Frieren||F|Elfe|Blanc|Magie|Protagoniste|Frieren|1
Fern||F|Humain|Violet|Magie|Allié|Frieren|1
Stark||H|Humain|Rouge|Arme|Allié|Frieren|1
Himmel||H|Humain|Bleu|Arme|Allié|Frieren|1
Eisen||H|Nain|Gris|Arme,Combat|Mentor|Frieren|
Aura|Aura l'Exécutrice|F|Démon|Rose|Magie|Antagoniste|Frieren|
Meliodas||H|Démon|Blond|Arme,Combat,Pouvoir spécial|Protagoniste|Seven Deadly Sins|1
Elizabeth Liones|Elizabeth|F|Humain,Dieu|Blanc|Magie|Allié|Seven Deadly Sins|1
Ban||H|Humain|Blanc|Combat,Pouvoir spécial|Allié|Seven Deadly Sins|1
King (Seven Deadly Sins)|King,Harlequin|H|Fée|Brun|Arme,Pouvoir spécial|Allié|Seven Deadly Sins|
Diane||F|Géant|Brun|Pouvoir spécial,Combat|Allié|Seven Deadly Sins|
Gowther||H|Machine|Rose|Pouvoir spécial,Arme|Allié|Seven Deadly Sins|
Merlin||F|Humain|Noir|Magie|Allié|Seven Deadly Sins|
Escanor||H|Humain|Blond|Pouvoir spécial,Arme|Allié|Seven Deadly Sins|1
Momo Ayase|Momo|F|Humain|Brun|Pouvoir spécial|Protagoniste|Dandadan|1
Ken Takakura|Okarun|H|Humain|Noir|Transformation|Protagoniste|Dandadan|1
Mémé Turbo|Turbo Granny,Turbo Baba|F|Esprit|Blanc|Pouvoir spécial|Antagoniste,Allié|Dandadan|
Aira Shiratori|Aira|F|Humain|Blond|Pouvoir spécial,Transformation|Allié|Dandadan|
Jin Enjoji|Jiji|H|Humain|Noir|Pouvoir spécial|Allié|Dandadan|
Kafka Hibino|Kafka,Kaiju n°8|H|Humain,Monstre|Noir|Transformation,Combat|Protagoniste|Kaiju No. 8|1
Mina Ashiro|Mina|F|Humain|Noir|Arme|Allié|Kaiju No. 8|
Reno Ichikawa|Reno|H|Humain|Blanc|Arme|Allié|Kaiju No. 8|
Kikoru Shinomiya|Kikoru|F|Humain|Blond|Arme|Allié|Kaiju No. 8|
Taro Sakamoto|Sakamoto|H|Humain|Blond|Arme,Combat|Protagoniste|Sakamoto Days|1
Shin Asakura|Shin|H|Humain|Blond|Pouvoir spécial|Allié|Sakamoto Days|
Nagumo||H|Humain|Noir|Arme|Allié|Sakamoto Days|
David Martinez|David|H|Humain|Noir|Technologie,Combat|Protagoniste|Cyberpunk Edgerunners|1
Lucy|Lucyna Kushinada|F|Humain|Blanc|Technologie|Allié|Cyberpunk Edgerunners|1
Rebecca||F|Humain|Vert|Arme,Technologie|Allié|Cyberpunk Edgerunners|
Adam Smasher|Smasher|H|Machine|Chauve|Technologie|Antagoniste|Cyberpunk Edgerunners|
Gabimaru||H|Humain|Noir|Combat,Énergie|Protagoniste|Hell's Paradise|1
Sagiri Yamada Asaemon|Sagiri|F|Humain|Blond|Arme|Allié|Hell's Paradise|
Mash Burnedead|Mash|H|Humain|Noir|Combat|Protagoniste|Mashle|1
Takemichi Hanagaki|Takemichi|H|Humain|Blond|Aucun|Protagoniste|Tokyo Revengers|1
Manjiro Sano|Mikey,Manjiro|H|Humain|Blond|Combat|Allié|Tokyo Revengers|1
Ken Ryuguji|Draken|H|Humain|Blond|Combat|Allié|Tokyo Revengers|1
Keisuke Baji|Baji|H|Humain|Noir|Combat|Allié|Tokyo Revengers|
Maomao|Mao Mao|F|Humain|Vert|Intellect|Protagoniste|Les Carnets de l'apothicaire|1
Jinshi||H|Humain|Violet|Intellect|Protagoniste|Les Carnets de l'apothicaire|1
Shinra Kusakabe|Shinra|H|Humain|Noir|Pouvoir spécial|Protagoniste|Fire Force|1
Arthur Boyle|Arthur|H|Humain|Blond|Pouvoir spécial,Arme|Allié|Fire Force|
Koro-sensei|Koro sensei|H|Monstre|Chauve|Pouvoir spécial|Mentor|Assassination Classroom|1
Nagisa Shiota|Nagisa|H|Humain|Bleu|Arme|Protagoniste|Assassination Classroom|1
Karma Akabane|Karma|H|Humain|Rouge|Intellect,Combat|Allié|Assassination Classroom|
Thorfinn|Thorfinn Karlsefni|H|Humain|Blond|Arme,Combat|Protagoniste|Vinland Saga|1
Askeladd||H|Humain|Blond|Arme,Intellect|Antagoniste,Mentor|Vinland Saga|1
Canute||H|Humain|Blond|Intellect|Allié,Antagoniste|Vinland Saga|
Natsuki Subaru|Subaru|H|Humain|Noir|Pouvoir spécial|Protagoniste|Re:Zero|1
Emilia||F|Elfe,Humain|Blanc|Magie|Allié|Re:Zero|1
Rem||F|Démon|Bleu|Magie,Arme|Allié|Re:Zero|1
Ram||F|Démon|Rose|Magie|Allié|Re:Zero|
Kirito|Kazuto Kirigaya|H|Humain|Noir|Arme|Protagoniste|Sword Art Online|1
Asuna|Asuna Yuuki|F|Humain|Orange|Arme|Allié|Sword Art Online|1
Sinon|Shino Asada|F|Humain|Bleu|Arme|Allié|Sword Art Online|
Klein||H|Humain|Rouge|Arme|Allié|Sword Art Online|
Kazuma Sato|Kazuma|H|Humain|Brun|Arme,Intellect|Protagoniste|Konosuba|1
Aqua||F|Dieu|Bleu|Magie|Allié|Konosuba|1
Megumin||F|Humain|Brun|Magie|Allié|Konosuba|1
Darkness|Lalatina|F|Humain|Blond|Arme|Allié|Konosuba|
Rimuru Tempest|Rimuru|A|Monstre|Bleu|Magie,Pouvoir spécial,Transformation|Protagoniste|Moi, quand je me réincarne en Slime|1
Milim Nava|Milim|F|Démon|Rose|Magie,Combat|Allié|Moi, quand je me réincarne en Slime|
Benimaru||H|Démon|Rouge|Arme,Magie|Allié|Moi, quand je me réincarne en Slime|
Ainz Ooal Gown|Ainz,Momonga|H|Mort-vivant|Chauve|Magie|Protagoniste|Overlord|1
Albedo||F|Démon|Noir|Arme|Allié|Overlord|1
Shalltear Bloodfallen|Shalltear|F|Mort-vivant|Blanc|Arme,Magie|Allié|Overlord|
Naofumi Iwatani|Naofumi|H|Humain|Noir|Arme,Magie|Protagoniste|The Rising of the Shield Hero|1
Raphtalia||F|Humain,Animal|Brun|Arme|Allié|The Rising of the Shield Hero|1
Filo||F|Animal|Blond|Transformation,Combat|Allié|The Rising of the Shield Hero|
Rudeus Greyrat|Rudeus|H|Humain|Brun|Magie|Protagoniste|Mushoku Tensei|1
Roxy Migurdia|Roxy|F|Démon|Bleu|Magie|Mentor|Mushoku Tensei|
Eris Boreas Greyrat|Eris|F|Humain|Rouge|Arme|Allié|Mushoku Tensei|
Cid Kagenou|Cid,Shadow|H|Humain|Noir|Arme,Magie|Protagoniste|The Eminence in Shadow|1
Alpha||F|Elfe|Blond|Arme,Magie|Allié|The Eminence in Shadow|
Beta||F|Elfe|Blanc|Arme,Magie|Allié|The Eminence in Shadow|
Kiyotaka Ayanokoji|Ayanokoji,Kiyotaka|H|Humain|Brun|Intellect,Combat|Protagoniste|Classroom of the Elite|1
Suzune Horikita|Horikita,Suzune|F|Humain|Noir|Intellect|Allié|Classroom of the Elite|
Kikyo Kushida|Kushida|F|Humain|Brun|Intellect|Antagoniste|Classroom of the Elite|
Guts||H|Humain|Noir|Arme,Combat|Protagoniste|Berserk|1
Griffith|Femto|H|Humain|Blanc|Arme,Intellect|Antagoniste|Berserk|1
Casca||F|Humain|Noir|Arme|Allié|Berserk|
Rintaro Okabe|Okabe,Hououin Kyouma|H|Humain|Noir|Pouvoir spécial,Technologie|Protagoniste|Steins;Gate|1
Kurisu Makise|Kurisu|F|Humain|Rouge|Intellect,Technologie|Allié|Steins;Gate|1
Mayuri Shiina|Mayuri|F|Humain|Noir|Aucun|Allié|Steins;Gate|
Ryuko Matoi|Ryuko|F|Humain|Noir,Rouge|Arme,Transformation|Protagoniste|Kill la Kill|1
Satsuki Kiryuin|Satsuki|F|Humain|Noir|Arme,Transformation|Rival|Kill la Kill|1
Mako Mankanshoku|Mako|F|Humain|Brun|Aucun|Allié|Kill la Kill|
Violet Evergarden|Violet|F|Humain|Blond|Technologie,Combat|Protagoniste|Violet Evergarden|1
Gilbert Bougainvillea|Gilbert|H|Humain|Noir|Aucun|Mentor|Violet Evergarden|
Legoshi|Legosi|H|Animal|Gris|Combat|Protagoniste|Beastars|1
Haru||F|Animal|Blanc|Aucun|Allié|Beastars|
Kaguya Shinomiya|Kaguya|F|Humain|Noir|Intellect|Protagoniste|Kaguya-sama|1
Miyuki Shirogane|Miyuki,Shirogane|H|Humain|Blond|Intellect|Protagoniste|Kaguya-sama|1
Chika Fujiwara|Chika|F|Humain|Rose|Aucun|Allié|Kaguya-sama|
Aquamarine Hoshino|Aqua Hoshino,Aquamarine|H|Humain|Blond|Intellect|Protagoniste|Oshi no Ko|1
Ai Hoshino|Ai|F|Humain|Violet|Aucun|Allié|Oshi no Ko|1
Ruby Hoshino|Ruby|F|Humain|Blond|Aucun|Protagoniste|Oshi no Ko|1
Kana Arima|Kana|F|Humain|Rouge|Aucun|Allié|Oshi no Ko|
Ryuji Takasu|Ryuji|H|Humain|Bleu|Aucun|Protagoniste|Toradora!|1
Taiga Aisaka|Taiga|F|Humain|Brun|Aucun|Protagoniste|Toradora!|1
Minori Kushieda|Minori|F|Humain|Orange|Sport|Allié|Toradora!|
Yuu Koito|Yuu|F|Humain|Brun|Aucun|Protagoniste|Bloom Into You|
Touko Nanami|Touko|F|Humain|Noir|Intellect|Protagoniste|Bloom Into You|
Taiki Inomata|Taiki|H|Humain|Noir|Sport|Protagoniste|Blue Box|
Chinatsu Kano|Chinatsu|F|Humain|Noir|Sport|Protagoniste|Blue Box|
Kyoko Hori|Hori|F|Humain|Brun|Aucun|Protagoniste|Horimiya|
Izumi Miyamura|Miyamura|H|Humain|Noir|Aucun|Protagoniste|Horimiya|
Marin Kitagawa|Marin|F|Humain|Blond,Rose|Aucun|Protagoniste|My Dress-Up Darling|1
Wakana Gojo|Wakana|H|Humain|Noir|Aucun|Protagoniste|My Dress-Up Darling|
Ichika Nakano|Ichika|F|Humain|Rose|Aucun|Protagoniste|The Quintessential Quintuplets|
Nino Nakano|Nino|F|Humain|Rose|Aucun|Protagoniste|The Quintessential Quintuplets|
Miku Nakano|Miku|F|Humain|Brun|Aucun|Protagoniste|The Quintessential Quintuplets|1
Yotsuba Nakano|Yotsuba|F|Humain|Orange|Sport|Protagoniste|The Quintessential Quintuplets|
Itsuki Nakano|Itsuki|F|Humain|Rouge|Aucun|Protagoniste|The Quintessential Quintuplets|
Kyotaro Ichikawa|Kyotaro|H|Humain|Noir|Aucun|Protagoniste|The Dangers in My Heart|
Anna Yamada|Anna|F|Humain|Brun|Aucun|Protagoniste|The Dangers in My Heart|
Shoko Komi|Komi|F|Humain|Noir|Aucun|Protagoniste|Komi cherche ses mots|1
Hitohito Tadano|Tadano|H|Humain|Noir|Aucun|Protagoniste|Komi cherche ses mots|
Kazuya Kinoshita|Kazuya|H|Humain|Noir|Aucun|Protagoniste|Rent-a-Girlfriend|
Chizuru Mizuhara|Chizuru|F|Humain|Brun|Aucun|Protagoniste|Rent-a-Girlfriend|
Seiya|Seiya de Pégase|H|Humain|Brun|Combat,Énergie|Protagoniste|Saint Seiya|1
Shiryu|Shiryu du Dragon|H|Humain|Noir|Combat,Énergie|Allié|Saint Seiya|
Shun|Shun d'Andromède|H|Humain|Vert|Combat,Énergie,Arme|Allié|Saint Seiya|
Yusuke Urameshi|Yusuke|H|Humain|Noir|Énergie,Combat|Protagoniste|Yu Yu Hakusho|1
Kurama||H|Démon|Rouge|Énergie,Pouvoir spécial|Allié|Yu Yu Hakusho|
Hiei||H|Démon|Noir|Arme,Énergie|Allié|Yu Yu Hakusho|
Yugi Muto|Yugi|H|Humain|Noir,Rouge,Blond|Intellect,Pouvoir spécial|Protagoniste|Yu-Gi-Oh!|1
Seto Kaiba|Kaiba|H|Humain|Brun|Intellect,Technologie|Rival|Yu-Gi-Oh!|1
Joey Wheeler|Joey,Jono|H|Humain|Blond|Aucun|Allié|Yu-Gi-Oh!|
Inuyasha||H|Démon,Humain|Blanc|Arme|Protagoniste|Inuyasha|1
Kagome Higurashi|Kagome|F|Humain|Noir|Arme,Pouvoir spécial|Protagoniste|Inuyasha|1
Sesshomaru||H|Démon|Blanc|Arme|Rival|Inuyasha|
Spike Spiegel|Spike|H|Humain|Vert|Arme,Combat|Protagoniste|Cowboy Bebop|1
Faye Valentine|Faye|F|Humain|Violet|Arme|Allié|Cowboy Bebop|
Jet Black|Jet|H|Humain|Chauve|Arme|Allié|Cowboy Bebop|
Hanamichi Sakuragi|Sakuragi,Hanamichi|H|Humain|Rouge|Sport|Protagoniste|Slam Dunk|1
Kaede Rukawa|Rukawa,Kaede|H|Humain|Noir|Sport|Rival|Slam Dunk|
Issei Hyodo|Issei|H|Démon|Brun|Pouvoir spécial,Transformation|Protagoniste|Highschool DxD|1
Rias Gremory|Rias|F|Démon|Rouge|Magie|Allié|Highschool DxD|1
Akeno Himejima|Akeno|F|Démon|Noir|Magie|Allié|Highschool DxD|
Asia Argento|Asia|F|Démon|Blond|Pouvoir spécial|Allié|Highschool DxD|
Koneko Toujou|Koneko|F|Démon|Blanc|Combat|Allié|Highschool DxD|
Takashi Komuro|Takashi|H|Humain|Brun|Arme|Protagoniste|High School of the Dead|1
Rei Miyamoto||F|Humain|Orange|Arme|Allié|High School of the Dead|
Saeko Busujima|Saeko|F|Humain|Violet|Arme|Allié|High School of the Dead|1
Saya Takagi|Saya|F|Humain|Rose|Intellect|Allié|High School of the Dead|
Kohta Hirano|Kohta|H|Humain|Noir|Arme|Allié|High School of the Dead|
Shizuka Marikawa|Shizuka|F|Humain|Blond|Aucun|Allié|High School of the Dead|
Rito Yuki|Rito|H|Humain|Orange|Aucun|Protagoniste|To Love-Ru|1
Lala Satalin Deviluke|Lala|F|Extraterrestre|Rose|Technologie,Intellect|Protagoniste|To Love-Ru|1
Golden Darkness|Yami,Konjiki no Yami|F|Extraterrestre|Blond|Transformation|Rival,Allié|To Love-Ru|1
Haruna Sairenji|Haruna|F|Humain|Bleu|Aucun|Allié|To Love-Ru|
Momo Belia Deviluke|Momo Deviluke|F|Extraterrestre|Rose|Pouvoir spécial|Allié|To Love-Ru|
Laios Touden|Laios|H|Humain|Blond|Arme|Protagoniste|Delicious in Dungeon|1
Marcille Donato|Marcille|F|Elfe|Blond|Magie|Allié|Delicious in Dungeon|1
Senshi||H|Nain|Brun|Arme|Allié|Delicious in Dungeon|1
Izutsumi||F|Humain,Animal|Noir|Arme,Combat|Allié|Delicious in Dungeon|
Haruka Sakura|Sakura Haruka|H|Humain|Noir,Blanc|Combat|Protagoniste|Wind Breaker|1
Hajime Umemiya|Umemiya|H|Humain|Blanc|Combat|Mentor|Wind Breaker|
Hayato Suo|Suo|H|Humain|Rouge|Combat,Intellect|Allié|Wind Breaker|
Akihiko Nirei|Nirei|H|Humain|Blond|Intellect|Allié|Wind Breaker|
Chisato Nishikigi|Chisato|F|Humain|Blond|Arme|Protagoniste|Lycoris Recoil|1
Takina Inoue|Takina|F|Humain|Noir|Arme|Protagoniste|Lycoris Recoil|1
Kento Nanami|Nanami|H|Humain|Blond|Énergie,Arme|Mentor,Allié|Jujutsu Kaisen|
Yuta Okkotsu|Yuta|H|Humain|Noir|Énergie,Arme|Allié|Jujutsu Kaisen|1
Akaza||H|Démon|Rose|Combat|Antagoniste|Demon Slayer|1
`;
