export interface LezenQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  topic?: string; // used for improvement suggestions
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
        topic: "leesstrategie",
      },
      {
        id: "tips-2",
        question: "Wanneer kan je volgens de tekst het beste leren?",
        options: ["'s ochtends", "'s middags", "'s avonds", "Dat moet je zelf bepalen"],
        correctIndex: 3,
        topic: "detailvragen",
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
        topic: "samenvatten",
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
        topic: "hoofdgedachte",
      },
      {
        id: "hardloop-2",
        question: "Gaston woont in de Flamingostraat. Wanneer moet hij zijn auto weghalen op zaterdag 13 juni?",
        options: ["Voor 10.00 uur", "Voor 11.00 uur", "Voor 16.00 uur", "Voor 17.00 uur"],
        correctIndex: 0,
        topic: "detailvragen",
      },
      {
        id: "hardloop-3",
        question: "Waar zijn de start en de finish van de hardloopwedstrijd?",
        options: ["In de Dorpsstraat", "Op het Dorpsplein", "In de Flamingostraat", "Op de Bergsebaan"],
        correctIndex: 1,
        topic: "detailvragen",
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
        topic: "tabellen-en-schema",
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
        topic: "detailvragen",
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
        topic: "conclusies-trekken",
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
        topic: "detailvragen",
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
        topic: "detailvragen",
      },
      {
        id: "kano-3",
        question: "Hoe laat eindigt het programma?",
        options: ["Om half 8", "Om half 9", "Om half 11", "Om half 12"],
        correctIndex: 1,
        topic: "detailvragen",
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
        topic: "detailvragen",
      },
      {
        id: "tas-2",
        question: "Wat zit er NIET in de tas van Suzanne?",
        options: ["Een laptop", "Een boek", "Een bril", "Een telefoon"],
        correctIndex: 3,
        topic: "detailvragen",
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
        topic: "conclusies-trekken",
      },
      {
        id: "sport-2",
        question: "De kinderen van Halima doen 's middags mee met de sportdag. Welke sport gaan ze doen?",
        options: ["Tennis", "Basketbal", "Voetbal", "Volleybal"],
        correctIndex: 3,
        topic: "detailvragen",
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
        topic: "detailvragen",
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
        topic: "detailvragen",
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
        topic: "conclusies-trekken",
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
        topic: "conclusies-trekken",
      },
      {
        id: "ehbo-2",
        question: "Aylin wil leren reanimeren. In hoeveel bijeenkomsten leert zij dat?",
        options: ["Eén bijeenkomst", "Vier bijeenkomsten", "Zes bijeenkomsten"],
        correctIndex: 0,
        topic: "detailvragen",
      },
      {
        id: "ehbo-3",
        question: "Ronald wil zoveel mogelijk verschillende dingen leren over EHBO. Welke cursus kan hij het beste kiezen?",
        options: ["Cursus EHBO I", "Cursus EHBO II", "Cursus EHBO III"],
        correctIndex: 0,
        topic: "conclusies-trekken",
      },
    ],
  },
  // ===== NEW PRACTICE TEXTS =====
  {
    id: "huisarts",
    title: "Afspraak bij de huisarts",
    situation: "Op de website van een huisartsenpraktijk staat informatie voor patiënten.",
    text: `Huisartsenpraktijk De Linde

Welkom bij onze praktijk! Hier vindt u belangrijke informatie.

Openingstijden:
Maandag t/m vrijdag: 8.00 – 17.00 uur
Zaterdag en zondag: gesloten

Een afspraak maken
U kunt een afspraak maken via onze website of door te bellen. Bellen kan tussen 8.00 en 10.00 uur 's ochtends. Buiten deze tijden kunt u alleen via de website een afspraak maken. Een afspraak duurt 10 minuten. Hebt u meer tijd nodig? Vraag dan een dubbele afspraak.

Spoedgevallen
Hebt u dringend hulp nodig? Bel dan het spoednummer: 030-1234567. Dit nummer is 24 uur per dag bereikbaar. Ga bij levensbedreigende situaties altijd naar de Eerste Hulp of bel 112.

Herhaalrecepten
Hebt u een nieuw recept nodig voor medicijnen die u al gebruikt? U kunt een herhaalrecept aanvragen via de website of via de apotheek. U kunt het recept na twee werkdagen ophalen bij uw apotheek.

Verhuizing
Gaat u verhuizen? Als u binnen ons werkgebied blijft, hoeft u niets te doen. Verhuist u naar een ander gebied? Dan moet u een nieuwe huisarts zoeken.`,
    questions: [
      {
        id: "huisarts-1",
        question: "Amir wil vanmiddag om 14.00 uur een afspraak maken bij de huisarts. Hoe kan hij dat doen?",
        options: [
          "Door te bellen",
          "Door naar de praktijk te gaan",
          "Via de website",
          "Door een e-mail te sturen",
        ],
        correctIndex: 2,
        topic: "detailvragen",
      },
      {
        id: "huisarts-2",
        question: "Wanneer kan Amir zijn herhaalrecept ophalen?",
        options: [
          "Dezelfde dag",
          "De volgende dag",
          "Na twee werkdagen",
          "Na een week",
        ],
        correctIndex: 2,
        topic: "detailvragen",
      },
    ],
  },
  {
    id: "fietsreparatie",
    title: "Fietsenmaker Van Dijk",
    situation: "In de buurt van Ahmed hangt een flyer van een fietsenmaker.",
    text: `Fietsenmaker Van Dijk – Uw fiets in goede handen!

Hebt u een lekke band? Of werken uw remmen niet goed? Breng uw fiets naar ons! Wij repareren alle soorten fietsen: gewone fietsen, elektrische fietsen en bakfietsen.

Openingstijden:
Maandag t/m zaterdag: 9.00 – 18.00 uur
Donderdag: 9.00 – 21.00 uur (koopavond)
Zondag: gesloten

Kleine reparaties (bijvoorbeeld een lekke band of kapot licht) doen wij terwijl u wacht. U hoeft geen afspraak te maken. Voor grote reparaties moet u uw fiets bij ons achterlaten. U kunt uw fiets de volgende dag ophalen.

Prijzen:
Band plakken: € 12,50
Nieuwe band: € 25,- (inclusief montage)
Remmen afstellen: € 15,-
Grote beurt: € 49,95

Heeft u een elektrische fiets? Wij kunnen ook de accu controleren. Dit kost € 20,-.

Adres: Kerkstraat 12, Utrecht
Telefoon: 030-9876543

Tip: Breng uw fiets in de winter voor een grote beurt. Dan is het minder druk en kunt u sneller terecht!`,
    questions: [
      {
        id: "fiets-1",
        question: "Ahmed heeft op woensdag een lekke band. Wat moet hij doen?",
        options: [
          "Een afspraak maken",
          "De fiets achterlaten tot de volgende dag",
          "Naar de fietsenmaker gaan en wachten",
          "Bellen voor een afspraak",
        ],
        correctIndex: 2,
        topic: "detailvragen",
      },
      {
        id: "fiets-2",
        question: "Hoeveel moet Ahmed betalen als hij zijn band wil laten plakken?",
        options: ["€ 12,50", "€ 15,-", "€ 25,-", "€ 49,95"],
        correctIndex: 0,
        topic: "tabellen-en-schema",
      },
    ],
  },
  {
    id: "bibliotheek",
    title: "Bibliotheek Centrum",
    situation: "Maria wil lid worden van de bibliotheek. Ze leest de informatie op de website.",
    text: `Bibliotheek Centrum – Word lid!

Bij de Bibliotheek Centrum kunt u boeken, tijdschriften en dvd's lenen. U kunt ook gratis gebruikmaken van de computers en het wifi.

Lid worden
U kunt lid worden in de bibliotheek of via onze website. Neem uw identiteitsbewijs mee. Een jaarabonnement kost € 42,- voor volwassenen. Kinderen tot 18 jaar zijn gratis lid.

Boeken lenen
U mag maximaal 10 boeken tegelijk lenen. U kunt de boeken 3 weken houden. Daarna kunt u de boeken nog één keer verlengen via de website. Bent u te laat met terugbrengen? Dan betaalt u € 0,30 per boek per dag.

Activiteiten
Elke woensdag is er een voorleesuurtje voor kinderen van 4 tot 8 jaar. Op donderdag is er een taalcafé voor mensen die Nederlands willen oefenen. Dit is gratis voor iedereen.

Openingstijden:
Maandag: gesloten
Dinsdag t/m vrijdag: 10.00 – 20.00 uur
Zaterdag: 10.00 – 17.00 uur
Zondag: gesloten`,
    questions: [
      {
        id: "bib-1",
        question: "Maria heeft twee kinderen van 6 en 10 jaar. Hoeveel betaalt ze voor een jaarabonnement voor het hele gezin?",
        options: ["€ 42,-", "€ 84,-", "€ 126,-", "Gratis"],
        correctIndex: 0,
        topic: "conclusies-trekken",
      },
      {
        id: "bib-2",
        question: "Maria wil Nederlands oefenen bij de bibliotheek. Wanneer kan ze dat doen?",
        options: ["Op woensdag", "Op donderdag", "Op zaterdag", "Elke dag"],
        correctIndex: 1,
        topic: "detailvragen",
      },
    ],
  },
  {
    id: "zwembad",
    title: "Zwembad De Waterpret",
    situation: "In het gemeentehuis ligt een folder over het zwembad.",
    text: `Zwembad De Waterpret

Ons zwembad is er voor iedereen! Of u nu wilt zwemmen voor uw gezondheid, voor de lol, of om te leren zwemmen – bij ons bent u welkom.

Openingstijden:
Maandag t/m vrijdag: 7.00 – 21.00 uur
Zaterdag en zondag: 9.00 – 18.00 uur

Prijzen:
Volwassenen: € 5,50 per keer
Kinderen (4-12 jaar): € 3,50 per keer
10-rittenkaart volwassenen: € 44,- (u bespaart € 11,-)
10-rittenkaart kinderen: € 28,- (u bespaart € 7,-)

Zwemlessen
Wij geven zwemlessen aan kinderen vanaf 5 jaar. De lessen zijn op woensdag en zaterdag. Een cursus van 20 lessen kost € 150,-. Aanmelden kan bij de receptie of via de website.

Regels:
- U moet een badmuts dragen
- Kinderen onder 6 jaar moeten een volwassene meenemen
- Eten en drinken zijn niet toegestaan bij het zwembad
- Na het zwemmen moet u douchen

Wij hebben ook een sauna. De sauna is alleen voor volwassenen (18+). Toegang tot de sauna kost € 12,50.`,
    questions: [
      {
        id: "zwembad-1",
        question: "Fatma koopt een 10-rittenkaart voor haar dochter van 8 jaar. Hoeveel betaalt ze per keer?",
        options: ["€ 2,80", "€ 3,50", "€ 4,40", "€ 5,50"],
        correctIndex: 0,
        topic: "tabellen-en-schema",
      },
      {
        id: "zwembad-2",
        question: "De zoon van Fatma is 4 jaar. Mag hij alleen naar het zwembad?",
        options: [
          "Ja, als hij kan zwemmen",
          "Ja, als hij een badmuts draagt",
          "Nee, hij moet een volwassene meenemen",
          "Nee, hij is te jong voor het zwembad",
        ],
        correctIndex: 2,
        topic: "conclusies-trekken",
      },
    ],
  },
  {
    id: "cursus-computer",
    title: "Computercursus voor beginners",
    situation: "Bij het buurtcentrum hangt een poster over een computercursus.",
    text: `Computercursus voor beginners

Kunt u niet goed overweg met de computer? Geen probleem! Bij Buurtcentrum De Hoek kunt u een computercursus voor beginners volgen.

Wat leert u?
- De computer aanzetten en uitzetten
- Werken met internet en e-mail
- Documenten maken en opslaan
- Veilig internetten

De cursus is in het Nederlands. U hoeft geen ervaring met computers te hebben.

Wanneer?
De cursus begint op maandag 3 maart en duurt 8 weken. Elke maandag van 10.00 tot 12.00 uur.

Kosten?
De cursus kost € 40,-. Bent u ouder dan 65 jaar? Dan is de cursus gratis. Studenten betalen € 20,-.

Aanmelden
U kunt zich aanmelden bij de receptie van het buurtcentrum. Aanmelden via internet of telefoon is niet mogelijk. Neem uw identiteitsbewijs mee. Er is plaats voor maximaal 12 deelnemers. Vol is vol!

Adres: Pleinstraat 8, Amsterdam
Vragen? Kom langs bij de receptie.`,
    questions: [
      {
        id: "comp-1",
        question: "Karima is 70 jaar oud en wil de computercursus volgen. Hoeveel betaalt zij?",
        options: ["€ 40,-", "€ 20,-", "Niets, het is gratis", "€ 10,-"],
        correctIndex: 2,
        topic: "detailvragen",
      },
      {
        id: "comp-2",
        question: "Hoe kan Karima zich aanmelden voor de cursus?",
        options: [
          "Via internet",
          "Door te bellen",
          "Door langs te gaan bij de receptie",
          "Door een e-mail te sturen",
        ],
        correctIndex: 2,
        topic: "detailvragen",
      },
    ],
  },
];

// Helper to get exactly 25 questions for the exam simulation
export function getExamQuestions(): { text: LezenText; question: LezenQuestion; globalIndex: number }[] {
  const allQuestions: { text: LezenText; question: LezenQuestion; globalIndex: number }[] = [];
  let idx = 0;
  for (const text of lezenTexts) {
    for (const question of text.questions) {
      allQuestions.push({ text, question, globalIndex: idx });
      idx++;
    }
  }
  // Return first 25 questions
  return allQuestions.slice(0, 25);
}

// Topic-based improvement suggestions
export const topicSuggestions: Record<string, { title: string; tip: string }> = {
  "detailvragen": {
    title: "Detailvragen (Detail Questions)",
    tip: "Lees de tekst zorgvuldig en zoek naar specifieke informatie zoals tijden, namen en plaatsen. Onderstreep de kernwoorden in de vraag en zoek die terug in de tekst.",
  },
  "hoofdgedachte": {
    title: "Hoofdgedachte (Main Idea)",
    tip: "Lees eerst de hele tekst door voordat je de vraag beantwoordt. Vraag jezelf af: 'Waar gaat deze tekst over?' en 'Wat is het belangrijkste doel van de schrijver?'",
  },
  "conclusies-trekken": {
    title: "Conclusies Trekken (Drawing Conclusions)",
    tip: "Soms staat het antwoord niet letterlijk in de tekst. Combineer informatie uit verschillende delen van de tekst om tot het juiste antwoord te komen.",
  },
  "samenvatten": {
    title: "Samenvatten (Summarizing)",
    tip: "Oefen met het in je eigen woorden navertellen van een tekst. Focus op de belangrijkste punten, niet op details.",
  },
  "tabellen-en-schema": {
    title: "Tabellen & Schema's (Tables & Charts)",
    tip: "Lees de kolom- en rijkoppen van tabellen goed. Let op voorwaarden (gewicht, verdieping, leeftijd) die bepalen welk tarief geldt.",
  },
  "leesstrategie": {
    title: "Leesstrategie (Reading Strategy)",
    tip: "Begin altijd met het lezen van de situatie en de vragen voordat je de tekst leest. Zo weet je waar je op moet letten.",
  },
};
