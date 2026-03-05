export interface LezenQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface LezenText {
  id: string;
  title: string;
  situation: string;
  text: string;
  questions: LezenQuestion[];
}

export const lezenTexts: LezenText[] = [
  {
    id: "tips-leren",
    title: "Tips om goed te leren",
    situation: "In een opleidingsgids staan tips om te leren.",
    text: `Tips om goed te leren

Iedereen leert op zijn eigen manier. Toch geven we u een paar tips om beter te kunnen leren.

Begin met het maken van een planning: wat gaat u wanneer doen?
Elke dag een beetje leren is beter dan alles op één dag leren.
Lees op verschillende dagen dezelfde bladzijdes een paar keer opnieuw. U onthoudt de informatie dan beter.

Zoek uit wanneer u het beste kan leren: 's morgens, 's middags of 's avonds.

Leer niet langer dan een half uur. Neem daarna een pauze of ga even iets heel anders doen.

Leer in een rustige omgeving. Denk niet teveel aan andere dingen.

Lees eerst een stuk tekst. Denk daarna even na over de inhoud.
Lees dan een nieuw stuk tekst en denk weer na over die inhoud. Ga zo verder tot het einde van de tekst.

Leg aan iemand anders uit wat u hebt gelezen. Als u dat kunt, weet u zeker dat u het hebt begrepen.
U onthoudt informatie beter als u het aan iemand hebt verteld.`,
    questions: [
      {
        id: "tips-1",
        question: "Jamie heeft volgende week een belangrijk examen. Wat moet hij volgens de tekst het eerste doen?",
        options: ["Een rustige plek zoeken", "Een planning maken", "Nadenken over de inhoud"],
        correctIndex: 1,
      },
      {
        id: "tips-2",
        question: "Wanneer kan je volgens de tekst het beste leren?",
        options: ["'s ochtends", "'s middags", "'s avonds", "Dat moet je zelf bepalen"],
        correctIndex: 3,
      },
      {
        id: "tips-3",
        question: "Noa weet niet hoe hij het beste kan leren. Welk advies kan je hem geven?",
        options: [
          "Leer eerst de hele tekst en lees daarna elk stukje opnieuw",
          "Leer met andere mensen en lees elke dag samen hetzelfde stuk tekst",
          "Leer lang achter elkaar door en lees elk stuk tekst twee keer",
          "Leer elke dag een beetje en vertel aan iemand wat je hebt gelezen",
        ],
        correctIndex: 3,
      },
    ],
  },
  {
    id: "hardloopwedstrijd",
    title: "Jaarlijkse hardloopwedstrijd",
    situation: "Alle bewoners van een dorp krijgen een brief.",
    text: `Aan de bewoners van het dorp

Onderwerp: Jaarlijkse hardloopwedstrijd

Wij willen u met deze brief informatie geven over de jaarlijkse hardloopwedstrijd in ons dorp. Ook willen wij u vertellen wat er die dag anders is voor het verkeer. We willen dat alles zo goed mogelijk gaat en we hopen dat u weinig last hebt van de wedstrijd.

Ongeveer 500 hardlopers doen mee aan de hardloopwedstrijd. De start en de finish zijn op het Dorpsplein. U kunt naar de hardlopers komen kijken, als u daar zin in heeft.

Datum: zaterdag 13 juni
Tijd: van 11.00 uur tot 16.00 uur
Route: Dorpsplein – Dorpsstraat – Bergsebaan – Flamingostraat – Dorpsplein

We willen dat alles veilig is voor de hardlopers, het verkeer en het publiek. Daarom sluiten wij een aantal straten en wegen af. Op de route mogen tot 17.00 uur geen auto's staan. Wij vragen u daarom uw auto vóór zaterdagmorgen 13 juni 10.00 uur weg te halen. Auto's die er daarna nog staan zal de politie wegslepen.

Wij bieden u onze excuses aan voor de overlast en wij danken u voor uw medewerking.

Met vriendelijke groet,

Piet Jansen
Organisator hardloopwedstrijd`,
    questions: [
      {
        id: "hardloop-1",
        question: "Waarom krijgen de dorpsbewoners deze brief van Piet Jansen?",
        options: [
          "Hij wil ze informatie geven over alles rondom de hardloopwedstrijd.",
          "Hij wil ze uitnodigen om mee te doen aan de hardloopwedstrijd.",
          "Hij wil ze oproepen met z'n allen naar de hardlopers te komen kijken.",
        ],
        correctIndex: 0,
      },
      {
        id: "hardloop-2",
        question: "Gaston woont in de Flamingostraat. Wanneer moet hij zijn auto weghalen op zaterdag 13 juni?",
        options: ["Voor 10.00 uur", "Voor 11.00 uur", "Voor 16.00 uur", "Voor 17.00 uur"],
        correctIndex: 0,
      },
      {
        id: "hardloop-3",
        question: "Waar zijn de start en de finish van de hardloopwedstrijd?",
        options: ["In de Dorpsstraat", "Op het Dorpsplein", "In de Flamingostraat", "Op de Bergsebaan"],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "meubelwinkel",
    title: "Verzamel- en transportservice",
    situation: "In een meubelwinkel ligt een folder met informatie over de transportservice.",
    text: `Verzamel- en transportservice

Hebt u meubels gezien die u wilt kopen? En wilt u dat wij deze meubels bij u thuisbezorgen? Dan kunt u gebruikmaken van onze transportservice.

Hoe werkt het? U maakt een lijstje met de meubels, op internet of in onze winkel. Wij verzamelen deze meubels en bezorgen alles bij u thuis. Dit alles voor een klein bedrag.

De prijzen voor het bezorgen ziet u hieronder.

Tarieven:
Hoeveel weegt uw bestelling?
0-199 kg: Begane grond € 54,- | Verdieping € 64,-
200 kg of meer: Begane grond € 104,- | Verdieping € 144,-

Deze prijzen zijn geldig voor één adres. Wilt u de meubels op meer adressen laten bezorgen? Ga dan voor meer informatie naar de informatiebalie in onze winkel.

Bezorging:
De levertijd van de meubels is ten minste twee weken.
U kunt op onze website zien op welke dagen wij meubels thuisbezorgen.
Wilt u weten hoe laat wij de meubels bezorgen? Bel dan naar onze klantenservice.
Dit kan alleen op de dag van de bezorging, vanaf 8 uur 's ochtends.
Woont u op de vijfde verdieping of hoger? Wij bezorgen alleen als er een lift is.`,
    questions: [
      {
        id: "meubel-1",
        question: "Modibo woont in een flat, op de tweede verdieping. Hij heeft een tafel van 20 kilo gekocht. Wat moet hij betalen voor bezorging?",
        options: ["€ 54,-", "€ 64,-", "€ 104,-", "€ 144,-"],
        correctIndex: 1,
      },
      {
        id: "meubel-2",
        question: "Hoe kan Modibo weten hoe laat de meubels bezorgd worden?",
        options: [
          "Door op de website te kijken",
          "Door naar de winkel te gaan",
          "Door te bellen op de dag van bezorging",
          "Door een e-mail te sturen",
        ],
        correctIndex: 2,
      },
      {
        id: "meubel-3",
        question: "Fatima woont op de zesde verdieping zonder lift. Wat betekent dat voor haar bezorging?",
        options: [
          "Ze betaalt € 144,-",
          "De winkel bezorgt niet bij haar",
          "Ze moet extra betalen voor de trap",
          "Ze moet de meubels zelf ophalen",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "kanovaren",
    title: "Bedrijfsuitje kanovaren",
    situation: "Sabrina krijgt een brief van haar werk.",
    text: `Beste collega,

Op vrijdag 9 mei gaan we met het bedrijf kanovaren!

Jan van 'Botenverhuur de Rijnstroom' wacht op ons om half 11 in Utrecht.
Adres: Rhijnauwen 2. Om half 12 is er lunch met een kop koffie of thee. Om half 8 eten we een pannenkoek bij het pannenkoekenhuis. Je hoeft zelf dus geen eten mee te nemen. Het programma eindigt om half 9.

Wat moet je meenemen? We raden aan om extra kleding mee te nemen, voor als je kleding nat wordt op de boot. Wij zullen handdoeken meenemen. Je hoeft geen zwemkleding mee te nemen, het water is nog te koud om in te zwemmen.

Laat je weten of je erbij kunt zijn? Je kunt je tot 2 mei bij Ingmar aanmelden. Als je nog vragen hebt, kun je bellen met Charlotte, tel. 030 - 2521312.

Wij hopen op een gezellige dag!

Namens de feestcommissie,
Henk de Groot`,
    questions: [
      {
        id: "kano-1",
        question: "Sabrina wil weten of haar man ook mee mag. Aan wie moet ze dat vragen?",
        options: ["Aan Jan", "Aan Ingmar", "Aan Charlotte", "Aan Henk"],
        correctIndex: 2,
      },
      {
        id: "kano-2",
        question: "Wat moet Sabrina meenemen naar het bedrijfsuitje?",
        options: [
          "Eten en drinken",
          "Zwemkleding",
          "Extra kleding",
          "Handdoeken",
        ],
        correctIndex: 2,
      },
      {
        id: "kano-3",
        question: "Hoe laat eindigt het programma?",
        options: ["Om half 8", "Om half 9", "Om half 11", "Om half 12"],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "tas-vergeten",
    title: "Tas vergeten",
    situation: "Jasper ontvangt een e-mail van zijn collega.",
    text: `Aan: j.degraaf@werk.nl
Onderwerp: Tas vergeten

Hoi Jasper,

Ik zit nu in de trein van mijn werk naar huis en merk dat ik mijn tas ben vergeten! Hij staat nog op mijn bureau. Wil jij hem misschien ophalen en naar de portier brengen? Dan haal ik mijn tas daar morgen op.

Het is een gele rugtas met een rits. In de tas zit mijn laptop. Er zitten ook een boek en een bril in de tas. Gelukkig heb ik mijn telefoon en portemonnee wel bij me!

Wil je me een bericht sturen als je de tas gevonden hebt?

Alvast bedankt!

Groetjes,
Suzanne`,
    questions: [
      {
        id: "tas-1",
        question: "Waar is de tas van Suzanne?",
        options: ["In de trein", "Op haar bureau", "Bij de portier", "Thuis"],
        correctIndex: 1,
      },
      {
        id: "tas-2",
        question: "Wat zit er NIET in de tas van Suzanne?",
        options: ["Een laptop", "Een boek", "Een bril", "Een telefoon"],
        correctIndex: 3,
      },
      {
        id: "tas-3",
        question: "Wat moet Jasper doen met de tas?",
        options: [
          "De tas naar Suzanne brengen",
          "De tas naar de portier brengen",
          "De tas in de trein brengen",
          "De tas naar haar huis brengen",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "sportdag",
    title: "Sportdag buurtvereniging",
    situation: "Halima krijgt een brief van de buurtvereniging.",
    text: `Beste buurtbewoners,

Op 9 juli is onze sportdag in het Sportpark in Amsterdam. Wilt u om 9 uur op het veld zijn? Dan kunnen we op tijd beginnen.

We beginnen om half 10 met een tennistoernooi. U kunt 's ochtends ook kiezen voor basketbal. Daarna hebben we lunchpauze. U moet zelf uw brood meenemen, wij zorgen voor koffie en thee. Na de pauze is er een voetbaltoernooi. Voor de kinderen is er dan een volleybalwedstrijd. Om half 7 is de sportdag afgelopen. We gaan dan barbecueën. Als u geen vlees eet, wilt u dit dan doorgeven aan Marie? Zij doet samen met Mo de boodschappen.

Let op! Wij kunnen de kleedkamers van het Sportpark niet gebruiken. De kleedkamers worden verbouwd. U moet dus thuis uw sportkleren aantrekken.

De sportdag (met barbecue en drankjes) kost € 15,- per persoon. Kinderen betalen € 8,50. U moet betalen als u zich aanmeldt. U kunt zich aanmelden tot 25 juni bij Jan (Vissersplein 45A).
Vorig jaar was de barbecue alleen voor de deelnemers van de sportdag. Dit jaar is dat anders: ook mensen die niet meedoen mogen mee barbecueën. Zij betalen dan € 10,-. Als u niet meedoet aan de sportdag, kunt u zich tot 1 juli voor de barbecue aanmelden bij Mo (Abrahamslaan 2).

Wij hopen op een zonnige sportdag!

Met vriendelijke groeten,
Jan, Marie, Bas en Mo`,
    questions: [
      {
        id: "sport-1",
        question: "Vandaag is de sportdag. Halima doet mee. Wat moet ze meenemen?",
        options: [
          "Sportkleren en brood",
          "Alleen brood",
          "Sportkleren, brood en koffie",
          "Alleen sportkleren",
        ],
        correctIndex: 1,
      },
      {
        id: "sport-2",
        question: "De kinderen van Halima doen 's middags mee met de sportdag. Welke sport gaan ze doen?",
        options: ["Tennis", "Basketbal", "Voetbal", "Volleybal"],
        correctIndex: 3,
      },
      {
        id: "sport-3",
        question: "De man van Halima kan niet meedoen met de sportdag. Hij wil wel mee barbecueën. Wat moet hij doen?",
        options: [
          "Zich aanmelden bij Jan voor 25 juni",
          "Zich aanmelden bij Mo voor 1 juli",
          "Zich aanmelden bij Marie",
          "€ 15,- betalen bij Jan",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "bruiloft",
    title: "Bruiloft Nadia en Richard",
    situation: "Michael werkt op een kantoor. Zijn collega Nadia gaat trouwen met Richard. Michael krijgt een e-mail van de feestcommissie.",
    text: `Bruiloft Nadia en Richard

Beste collega's,

Volgende week vrijdag is de bruiloft van Nadia en Richard! Daarom hebben we een feestcommissie opgericht. De feestcommissie bestaat uit William, David en Elise. We hebben alle drie een taak, zodat we er een leuke dag van kunnen maken!

Wij willen een bus huren om samen met collega's naar de bruiloft te gaan. Wil je mee met de bus? Geef je dan op bij David.

We willen met de collega's een cadeau geven aan het bruidspaar. Als je wilt, kun je ook meedoen. Je kunt geld aan William geven. We weten nog niet precies wat we gaan geven. Op het bureau van Elise ligt een lijstje met cadeaus. Kruis op het lijstje aan wat je het leukste cadeau vindt: een cadeaubon of een weekendje weg. We gaan het cadeau geven dat het meest gekozen is door jullie.

Nadia is deze week nog gewoon aan het werk. Ons cadeau moet natuurlijk wel een verrassing blijven. Let er dus op dat je niets zegt tegen Nadia!

Groeten, de feestcommissie
David, William en Elise`,
    questions: [
      {
        id: "bruiloft-1",
        question: "Michael wil met de bus mee naar de bruiloft. Bij wie moet hij zich opgeven?",
        options: ["Bij William", "Bij David", "Bij Elise", "Bij Nadia"],
        correctIndex: 1,
      },
      {
        id: "bruiloft-2",
        question: "Welk cadeau gaan de collega's samen geven aan Nadia en Richard?",
        options: [
          "Een cadeaubon",
          "Een weekendje weg",
          "Dat weten ze nog niet",
          "Bloemen",
        ],
        correctIndex: 2,
      },
      {
        id: "bruiloft-3",
        question: "Waarom stuurt de feestcommissie deze e-mail vooral?",
        options: [
          "Om collega's uit te nodigen voor de bruiloft",
          "Om collega's te vragen mee te doen met het cadeau en de bus",
          "Om iedereen te vertellen dat Nadia gaat trouwen",
          "Om geld in te zamelen voor een feest",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "ehbo",
    title: "EHBO-cursussen",
    situation: "Op internet staat een folder met informatie over EHBO-cursussen.",
    text: `EHBO De Groene Cirkel

EHBO betekent: Eerste Hulp Bij Ongelukken. Als EHBO'er kunt u helpen als er een ongeluk gebeurt. Bijvoorbeeld als uw buurjongen valt en zijn arm breekt. Of als iemand zich snijdt bij het eten maken. U kunt bij ons verschillende EHBO-cursussen volgen. U haalt uw diploma bij ons altijd in korte tijd. U kunt kiezen uit:

Cursus EHBO I
Dit is de algemene cursus 'EHBO'. U leert om te helpen bij allerlei ongelukken. Bijvoorbeeld als iemand z'n been breekt. Maar u leert ook wat u moet doen bij andere problemen, zoals een bloedneus of brandwond.
De cursus bestaat uit zes bijeenkomsten. U krijgt er een online cursusboek bij. Aan het einde van de cursus doet u examen in de praktijk.
Kosten voor de cursus: € 124,50

Cursus EHBO II
Dit is de cursus 'Reanimeren'. Deze cursus kan u helpen om levens te redden! U leert mensen met een hartstilstand of ademstilstand te helpen. U weet na de cursus precies wat u dan moet doen.
De cursus bestaat uit één bijeenkomst van drie uur. U krijgt de gids 'Reanimatie' mee naar huis.
Kosten voor de cursus: € 72,50

Cursus EHBO III
Dit is de cursus 'EHBO voor ouders'. Deze cursus is zeer geschikt voor ouders en verzorgers. Is een kind bijvoorbeeld gewond of ziek? Of moet een kind ineens erg hoesten? Deze cursus leert u hoe u dan kunt helpen. De cursus is ook erg handig als u in het onderwijs werkt.
De cursus bestaat uit vier bijeenkomsten. U krijgt het cursusboek bij de eerste bijeenkomst.
Kosten voor de cursus: € 105,-`,
    questions: [
      {
        id: "ehbo-1",
        question: "Myra geeft les op een basisschool. Ze wil een EHBO-cursus volgen die past bij haar werk. Welke cursus is het meest geschikt voor Myra?",
        options: ["Cursus EHBO I", "Cursus EHBO II", "Cursus EHBO III"],
        correctIndex: 2,
      },
      {
        id: "ehbo-2",
        question: "Aylin wil leren reanimeren. In hoeveel bijeenkomsten leert zij dat?",
        options: ["Eén bijeenkomst", "Vier bijeenkomsten", "Zes bijeenkomsten"],
        correctIndex: 0,
      },
      {
        id: "ehbo-3",
        question: "Ronald wil zoveel mogelijk verschillende dingen leren over EHBO. Welke cursus kan hij het beste kiezen?",
        options: ["Cursus EHBO I", "Cursus EHBO II", "Cursus EHBO III"],
        correctIndex: 0,
      },
    ],
  },
];
