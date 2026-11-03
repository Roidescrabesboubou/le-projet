/* ============================================================
   PERSONNAGES – La Grande Enchère
   Format : "Nom|Puissance"
   - Puissance de 1 à 100, à l'échelle de SON univers : c'est elle qui
     décide de l'équipe la plus forte à la fin d'une manche.
     Deux univers ne se comparent pas entre eux (on ne les mélange pas).
   - Ces notes sont un avis assumé : à corriger librement ici.
   - Il faut au moins 16 personnages par univers (le maximum du réglage).
   ============================================================ */
window.ENCHERES_UNIVERS = [
  {id: "onepiece", nom: "One Piece", emoji: "🏴‍☠️", persos: [
    "Monkey D. Luffy|95","Roronoa Zoro|90","Sanji|87","Nami|30","Usopp|42","Tony Tony Chopper|50","Nico Robin|58","Franky|62","Brook|60","Jinbe|78",
    "Portgas D. Ace|80","Sabo|84","Shanks|97","Barbe Blanche|98","Barbe Noire|94","Kaido|99","Big Mom|96","Trafalgar Law|83","Eustass Kid|82","Dragon|93",
    "Gol D. Roger|100","Rayleigh|92","Mihawk|95","Crocodile|72","Doflamingo|80","Boa Hancock|76","Akainu|93","Aokiji|91","Kizaru|91","Garp|92",
    "Smoker|55","Tashigi|28","Vivi|12","Baggy|35","Arlong|25","Rob Lucci|75","Katakuri|86","Yamato|85","Kuma|74",
    "Coby|45","Perona|40","Enel|70","Marco|88","Ivankov|65"
  ]},
  {id: "naruto", nom: "Naruto", emoji: "🍥", persos: [
    "Naruto Uzumaki|96","Sasuke Uchiha|95","Sakura Haruno|62","Kakashi Hatake|80","Itachi Uchiha|85","Madara Uchiha|99","Obito Uchiha|90","Hashirama Senju|98","Tobirama Senju|84","Minato Namikaze|88",
    "Jiraiya|78","Tsunade|76","Orochimaru|79","Pain|87","Konan|60","Gaara|72","Rock Lee|65","Might Guy|86","Neji Hyuga|58","Hinata Hyuga|45",
    "Shikamaru Nara|48","Ino Yamanaka|30","Choji Akimichi|40","Kiba Inuzuka|35","Shino Aburame|36","Tenten|25","Temari|44","Kankuro|42","Deidara|68","Sasori|64",
    "Kisame Hoshigaki|74","Hidan|50","Kakuzu|62","Zabuza Momochi|46","Haku|38","Kabuto Yakushi|70","Killer Bee|77","Le Raikage (A)|75","Iruka Umino|15","Konohamaru|20",
    "Kaguya Otsutsuki|100","Yamato|55","Asuma Sarutobi|52","Kurenai Yuhi|33"
  ]},
  {id: "dragonball", nom: "Dragon Ball", emoji: "🐉", persos: [
    "Son Goku|98","Vegeta|95","Son Gohan|90","Piccolo|78","Krilin|40","Trunks|76","Son Goten|62","Yamcha|18","Ten Shin Han|30","Chaozu|10",
    "Maître Roshi|25","Bulma|2","Chichi|8","Videl|12","Hercule|4","Oolong|1","Freezer|92","Cell|85","Majin Buu|88",
    "Broly|96","Beerus|100","Whis|100","Hit|91","Jiren|99","C-17|74","C-18|70","C-16|60","Raditz|20",
    "Nappa|24","Ginyu|35","Zarbon|28","Dabra|50","Babidi|15","Gotenks|84","Vegetto|99","Bardock|38","Goku Black|93","Zamasu|82",
    "Kaio Shin|45","Tao Pai Pai|14","Mr. Popo|22"
  ]},
  {id: "jjk", nom: "Jujutsu Kaisen", emoji: "🩸", persos: [
    "Satoru Gojo|99","Ryomen Sukuna|100","Yuji Itadori|80","Megumi Fushiguro|72","Nobara Kugisaki|55","Maki Zenin|82","Toge Inumaki|50","Panda|46","Yuta Okkotsu|94","Kento Nanami|68",
    "Suguru Geto|85","Kenjaku|88","Mahito|75","Jogo|79","Hanami|70","Dagon|66","Choso|69","Toji Fushiguro|90","Aoi Todo|74","Kasumi Miwa|20",
    "Mai Zenin|25","Noritoshi Kamo|48","Mechamaru|44","Momo Nishimiya|22","Yoshinobu Gakuganji|40","Masamichi Yaga|42","Shoko Ieiri|18","Kiyotaka Ijichi|5","Mei Mei|58","Naoya Zenin|67",
    "Naobito Zenin|64","Hiromi Higuruma|71","Hajime Kashimo|83","Hakari Kinji|81","Kirara Hoshi|35","Uraume|73","Yuki Tsukumo|91","Junpei Yoshino|12","Atsuya Kusakabe|52","Takuma Ino|30"
  ]},
  {id: "mha", nom: "My Hero Academia", emoji: "🦸", persos: [
    "Izuku Midoriya|92","Katsuki Bakugo|85","Shoto Todoroki|84","Ochaco Uraraka|50","Tenya Iida|52","Eijiro Kirishima|54","Momo Yaoyorozu|48","Tsuyu Asui|42","Denki Kaminari|45","Kyoka Jiro|32",
    "Fumikage Tokoyami|53","Mina Ashido|34","Minoru Mineta|12","Hanta Sero|30","All Might|96","Endeavor|90","Hawks|82","Best Jeanist|65","Mirko|78","Aizawa|60",
    "Present Mic|35","Midnight|38","Thirteen|36","Gran Torino|62","Mirio Togata|80","Tamaki Amajiki|64","Nejire Hado|63","All For One|99","Tomura Shigaraki|97","Dabi|83",
    "Himiko Toga|55","Twice|58","Stain|61","Overhaul|72","Gigantomachia|86","Hitoshi Shinso|40","Star and Stripe|91","Lady Nagant|70","Kurogiri|56","Spinner|28"
  ]},
  {id: "demonslayer", nom: "Demon Slayer", emoji: "🗡️", persos: [
    "Tanjiro Kamado|85","Nezuko Kamado|70","Zenitsu Agatsuma|68","Inosuke Hashibira|66","Kanao Tsuyuri|64","Genya Shinazugawa|60","Giyu Tomioka|84","Shinobu Kocho|62","Kyojuro Rengoku|82","Tengen Uzui|80",
    "Mitsuri Kanroji|79","Muichiro Tokito|83","Obanai Iguro|78","Sanemi Shinazugawa|86","Gyomei Himejima|90","Yoriichi Tsugikuni|100","Muzan Kibutsuji|98","Kokushibo|95","Doma|89","Akaza|88",
    "Hantengu|76","Gyokko|72","Daki|58","Gyutaro|74","Kaigaku|56","Enmu|48","Rui|44","Sakonji Urokodaki|52","Jigoro Kuwajima|55","Tamayo|25",
    "Yushiro|18","Aoi Kanzaki|10","Sumi, Kiyo et Naho|3","Murata|15","Sabito|50","Makomo|35","Kagaya Ubuyashiki|5"
  ]},
  {id: "bleach", nom: "Bleach", emoji: "⚔️", persos: [
    "Ichigo Kurosaki|95","Rukia Kuchiki|60","Orihime Inoue|48","Uryu Ishida|72","Chad (Sado)|58","Renji Abarai|70","Byakuya Kuchiki|82","Kenpachi Zaraki|90","Toshiro Hitsugaya|76","Yoruichi Shihoin|84",
    "Kisuke Urahara|88","Genryusai Yamamoto|96","Sosuke Aizen|98","Gin Ichimaru|80","Kaname Tosen|65","Shunsui Kyoraku|86","Jushiro Ukitake|78","Soi Fon|68","Mayuri Kurotsuchi|71","Retsu Unohana|87",
    "Ikkaku Madarame|45","Yumichika Ayasegawa|38","Rangiku Matsumoto|44","Momo Hinamori|35","Izuru Kira|42","Grimmjow|74","Ulquiorra|85","Coyote Starrk|83","Baraggan|81","Nelliel|73",
    "Kon|3","Isshin Kurosaki|79","Yhwach|100","Jugram Haschwalth|89","Tatsuki Arisawa|8","Ryuken Ishida|55","Shinji Hirako|69","Nnoitra|67","Szayelaporro|52"
  ]},
  {id: "hxh", nom: "Hunter x Hunter", emoji: "🎣", persos: [
    "Gon Freecss|78","Killua Zoldyck|82","Kurapika|76","Leorio Paradinight|30","Hisoka|88","Chrollo Lucilfer|90","Feitan|72","Phinks|70","Nobunaga|60","Machi|64",
    "Shizuku|52","Pakunoda|45","Uvogin|74","Franklin|62","Illumi Zoldyck|80","Silva Zoldyck|91","Zeno Zoldyck|92","Isaac Netero|97","Meruem|100","Neferpitou|89",
    "Shaiapouf|85","Menthuthuyoupi|87","Knuckle|58","Shoot|56","Morel|68","Knov|66","Biscuit Krueger|79","Wing|50","Ging Freecss|94","Tonpa|5",
    "Kastro|48","Razor|69","Komugi|2","Zushi|25","Palm|42","Alluka Zoldyck|75","Kite|71"
  ]},
  {id: "snk", nom: "L'Attaque des Titans", emoji: "🧱", persos: [
    "Eren Jaeger|95","Mikasa Ackerman|88","Armin Arlert|70","Levi Ackerman|94","Erwin Smith|62","Hange Zoe|55","Jean Kirstein|50","Connie Springer|38","Sasha Braus|40","Historia Reiss|15",
    "Ymir|60","Reiner Braun|82","Bertolt Hoover|80","Annie Leonhart|78","Zeke Jaeger|86","Pieck Finger|65","Porco Galliard|68","Marcel Galliard|45","Kenny Ackerman|72","Rod Reiss|58",
    "Grisha Jaeger|76","Eren Kruger|74","Ymir Fritz|100","Falco Grice|42","Gabi Braun|44","Miche Zacharias|56","Petra Ral|35","Dot Pixis|20","Keith Shadis|25","Moblit Berner|18",
    "Theo Magath|30","Yelena|33","Onyankopon|12","Floch Forster|28","Nile Dawk|16","Hannes|10"
  ]}
];
