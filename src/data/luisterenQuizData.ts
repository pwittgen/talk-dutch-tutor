export interface LuisterenQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  topic?: string;
}

export interface LuisterenFragment {
  id: string;
  title: string;
  situation: string; // description for the situation image
  /** The Dutch text that will be read aloud via TTS */
  spokenText: string;
  questions: LuisterenQuestion[];
}

export const luisterenFragments: LuisterenFragment[] = [
  // ===== FRAGMENT 1: Bij de bakker =====
  {
    id: "bakker",
    title: "Bij de bakker",
    situation: "Je bent bij de bakker. Je hoort een gesprek tussen een klant en de bakker.",
    spokenText:
      "Goedemorgen! Wat kan ik voor u doen? Ik wil graag twee bruine broodjes en een wit brood. Natuurlijk. Wilt u er nog iets bij? Ja, hebt u ook appelgebak? Ja, dat hebben we. Hoeveel stukken wilt u? Drie stukken alstublieft. Dat is dan vijf euro tachtig. Alstublieft. Dank u wel. Fijne dag nog!",
    questions: [
      {
        id: "bakker-1",
        question: "Hoeveel bruine broodjes bestelt de klant?",
        options: ["Eén", "Twee", "Drie", "Vier"],
        correctIndex: 1,
        topic: "aantallen",
      },
      {
        id: "bakker-2",
        question: "Wat bestelt de klant naast het brood?",
        options: ["Koekjes", "Appelgebak", "Taart", "Croissants"],
        correctIndex: 1,
        topic: "detailvragen",
      },
    ],
  },
  // ===== FRAGMENT 2: Bij de dokter =====
  {
    id: "dokter",
    title: "Bij de dokter",
    situation: "Je bent bij de huisarts. Je hoort een gesprek tussen de dokter en een patiënt.",
    spokenText:
      "Goedemiddag meneer Jansen. Wat kan ik voor u doen? Goedemiddag dokter. Ik heb al drie dagen hoofdpijn en ik ben erg moe. Hebt u ook koorts? Ja, gisteravond had ik achtendertig graden. Ik denk dat u griep hebt. U moet veel rusten en veel water drinken. Ik schrijf een recept voor paracetamol. U kunt dat ophalen bij de apotheek. Moet ik terugkomen? Als u over een week niet beter bent, kom dan terug.",
    questions: [
      {
        id: "dokter-1",
        question: "Hoe lang heeft meneer Jansen al hoofdpijn?",
        options: ["Eén dag", "Twee dagen", "Drie dagen", "Een week"],
        correctIndex: 2,
        topic: "detailvragen",
      },
      {
        id: "dokter-2",
        question: "Wat denkt de dokter dat meneer Jansen heeft?",
        options: ["Een verkoudheid", "Griep", "Allergie", "Buikgriep"],
        correctIndex: 1,
        topic: "hoofdgedachte",
      },
    ],
  },
  // ===== FRAGMENT 3: Op het station =====
  {
    id: "station",
    title: "Op het station",
    situation: "Je staat op het station. Je hoort een omroepbericht.",
    spokenText:
      "Dames en heren, de intercity naar Amsterdam Centraal van kwart over drie heeft een vertraging van twintig minuten. De trein vertrekt nu om vijf voor half vier van spoor zeven. Reizigers naar Schiphol kunnen overstappen in Amsterdam Zuid. Wij bieden onze excuses aan voor het ongemak.",
    questions: [
      {
        id: "station-1",
        question: "Hoeveel minuten vertraging heeft de trein?",
        options: ["Tien minuten", "Vijftien minuten", "Twintig minuten", "Dertig minuten"],
        correctIndex: 2,
        topic: "aantallen",
      },
      {
        id: "station-2",
        question: "Waar moeten reizigers naar Schiphol overstappen?",
        options: ["Amsterdam Centraal", "Amsterdam Zuid", "Utrecht", "Den Haag"],
        correctIndex: 1,
        topic: "detailvragen",
      },
    ],
  },
  // ===== FRAGMENT 4: Voicemail =====
  {
    id: "voicemail",
    title: "Voicemail van de tandarts",
    situation: "Je luistert naar een voicemail op je telefoon.",
    spokenText:
      "Goedemorgen, u spreekt met de praktijk van tandarts De Wit. U hebt een afspraak op donderdag drieëntwintig maart om half tien. Helaas moet de tandarts die dag naar een congres. Wij willen uw afspraak verplaatsen naar vrijdag vierentwintig maart om elf uur. Belt u ons terug om te bevestigen? Ons nummer is nul drie nul, vier vijf zes zeven acht negen nul. U kunt bellen tussen negen en vijf. Dank u wel.",
    questions: [
      {
        id: "voicemail-1",
        question: "Waarom wordt de afspraak verplaatst?",
        options: [
          "De tandarts is ziek",
          "De tandarts gaat naar een congres",
          "De praktijk is gesloten",
          "Er is een noodgeval",
        ],
        correctIndex: 1,
        topic: "detailvragen",
      },
      {
        id: "voicemail-2",
        question: "Wanneer is de nieuwe afspraak?",
        options: [
          "Donderdag om half tien",
          "Vrijdag om half tien",
          "Vrijdag om elf uur",
          "Maandag om elf uur",
        ],
        correctIndex: 2,
        topic: "detailvragen",
      },
    ],
  },
  // ===== FRAGMENT 5: In de supermarkt =====
  {
    id: "supermarkt-luisteren",
    title: "In de supermarkt",
    situation: "Je bent in de supermarkt. Je hoort een omroepbericht.",
    spokenText:
      "Beste klanten, welkom bij Albert Heijn. Vandaag hebben wij speciale aanbiedingen. Alle kaas is vandaag twintig procent goedkoper. Bij de bakkerij kunt u twee croissants kopen voor de prijs van één. De aanbieding geldt tot sluitingstijd om negen uur vanavond. Wij wensen u prettig winkelen.",
    questions: [
      {
        id: "super-1",
        question: "Hoeveel korting is er op kaas?",
        options: ["Tien procent", "Vijftien procent", "Twintig procent", "Vijftig procent"],
        correctIndex: 2,
        topic: "aantallen",
      },
      {
        id: "super-2",
        question: "Tot hoe laat geldt de aanbieding?",
        options: ["Zes uur", "Zeven uur", "Acht uur", "Negen uur"],
        correctIndex: 3,
        topic: "detailvragen",
      },
    ],
  },
  // ===== FRAGMENT 6: Telefoongesprek met school =====
  {
    id: "school-telefoon",
    title: "Telefoongesprek met school",
    situation: "Je belt naar de school van je kind. Je hoort een gesprek.",
    spokenText:
      "Basisschool De Regenboog, goedemorgen. Goedemorgen, u spreekt met mevrouw Ahmadi. Mijn zoon Youssef is vandaag ziek. Hij heeft buikpijn en koorts. Oh, wat vervelend. In welke groep zit Youssef? In groep vijf, bij juf Marieke. Oké, ik geef het door aan juf Marieke. Heeft Youssef huiswerk dat hij moet inleveren? Ja, hij heeft een werkblad voor rekenen. Dat kan hij inleveren als hij weer beter is. Goed, dank u wel. Ik hoop dat hij snel beter wordt. Dank u, tot ziens.",
    questions: [
      {
        id: "school-1",
        question: "Waarom belt mevrouw Ahmadi naar school?",
        options: [
          "Ze wil een afspraak maken",
          "Ze wil haar zoon ziekmelden",
          "Ze wil het huiswerk ophalen",
          "Ze wil met de juf praten",
        ],
        correctIndex: 1,
        topic: "hoofdgedachte",
      },
      {
        id: "school-2",
        question: "In welke groep zit Youssef?",
        options: ["Groep drie", "Groep vier", "Groep vijf", "Groep zes"],
        correctIndex: 2,
        topic: "detailvragen",
      },
    ],
  },
  // ===== FRAGMENT 7: Bij de kapper =====
  {
    id: "kapper",
    title: "Bij de kapper",
    situation: "Je zit bij de kapper. Je hoort een gesprek.",
    spokenText:
      "Goedemiddag! Hebt u een afspraak? Ja, ik heb een afspraak om twee uur. Op naam van Fatima El Amrani. Ah ja, ik zie het. Ga zitten. Wat wilt u vandaag? Ik wil mijn haar korter laten knippen. En kunt u ook mijn pony bijknippen? Natuurlijk. Wilt u er een beetje af of veel? Een beetje, het mag niet te kort worden. Oké, en wilt u uw haar ook verven? Nee, alleen knippen alstublieft. Goed, dan begin ik. Dat wordt zesentwintig euro.",
    questions: [
      {
        id: "kapper-1",
        question: "Wat wil Fatima bij de kapper laten doen?",
        options: [
          "Haar haar verven",
          "Haar haar knippen en pony bijknippen",
          "Een permanent",
          "Alleen haar pony knippen",
        ],
        correctIndex: 1,
        topic: "detailvragen",
      },
    ],
  },
  // ===== FRAGMENT 8: Buurthuisactiviteiten =====
  {
    id: "buurthuis",
    title: "Activiteiten in het buurthuis",
    situation: "Je bent in het buurthuis. Iemand vertelt over de activiteiten.",
    spokenText:
      "Welkom in buurthuis De Buurt. Wij hebben veel leuke activiteiten. Op maandag is er een taalles Nederlands, van tien tot twaalf. Op dinsdag hebben we een kookcursus. We koken gerechten uit verschillende landen. Op woensdag is er een sportles in de gymzaal, dat is gratis. En op vrijdag is er een koffieochtend waar u andere mensen uit de buurt kunt ontmoeten. Alle activiteiten zijn gratis, behalve de kookcursus. Die kost vijf euro per keer voor de ingrediënten.",
    questions: [
      {
        id: "buurthuis-1",
        question: "Welke activiteit is niet gratis?",
        options: ["Taalles", "Kookcursus", "Sportles", "Koffieochtend"],
        correctIndex: 1,
        topic: "detailvragen",
      },
      {
        id: "buurthuis-2",
        question: "Wanneer is de sportles?",
        options: ["Maandag", "Dinsdag", "Woensdag", "Vrijdag"],
        correctIndex: 2,
        topic: "detailvragen",
      },
    ],
  },
  // ===== FRAGMENT 9: Weer-bericht =====
  {
    id: "weerbericht",
    title: "Het weerbericht",
    situation: "Je luistert naar het weerbericht op de radio.",
    spokenText:
      "En dan nu het weerbericht voor morgen, woensdag twaalf april. In de ochtend is het bewolkt met temperaturen rond de tien graden. In de middag komt de zon tevoorschijn en wordt het vijftien graden. Er staat een matige wind uit het westen. In de avond is er kans op regen, vooral in het noorden van het land. Neem dus een paraplu mee als u 's avonds naar buiten gaat. Donderdag wordt het weer droog en zonnig.",
    questions: [
      {
        id: "weer-1",
        question: "Hoe warm wordt het morgen in de middag?",
        options: ["Tien graden", "Twaalf graden", "Vijftien graden", "Twintig graden"],
        correctIndex: 2,
        topic: "aantallen",
      },
      {
        id: "weer-2",
        question: "Wanneer is er kans op regen?",
        options: ["In de ochtend", "In de middag", "In de avond", "De hele dag"],
        correctIndex: 2,
        topic: "detailvragen",
      },
    ],
  },
  // ===== FRAGMENT 10: Verhuizen =====
  {
    id: "verhuizen",
    title: "Gesprek over verhuizen",
    situation: "Twee buren praten met elkaar in het trappenhuis.",
    spokenText:
      "Hoi Maria, ik wilde je laten weten dat wij gaan verhuizen. Oh, wat jammer! Wanneer gaan jullie weg? Over drie weken, op de eerste juni. We hebben een groter huis gevonden in Almere. Dat is fijn, gefeliciteerd. Hoeveel kamers heeft het nieuwe huis? Het heeft vier slaapkamers en een grote tuin. Dat is perfect voor de kinderen. Ja, onze kinderen zijn erg blij. Ze krijgen allebei een eigen kamer. Ik ga jullie missen. We houden contact! Ik stuur je ons nieuwe adres.",
    questions: [
      {
        id: "verhuis-1",
        question: "Wanneer gaat de buurvrouw verhuizen?",
        options: ["Volgende week", "Over twee weken", "Over drie weken", "Over een maand"],
        correctIndex: 2,
        topic: "detailvragen",
      },
      {
        id: "verhuis-2",
        question: "Waarom verhuizen ze?",
        options: [
          "Ze hebben een groter huis gevonden",
          "Ze gaan in een ander land wonen",
          "Het huis is te duur",
          "Ze willen dichter bij het werk wonen",
        ],
        correctIndex: 0,
        topic: "hoofdgedachte",
      },
    ],
  },
  // ===== FRAGMENT 11: Verjaardag =====
  {
    id: "verjaardag",
    title: "Uitnodiging voor een verjaardag",
    situation: "Je krijgt een telefoontje van een vriendin.",
    spokenText:
      "Hallo, met Sanne. Hoi Sanne, hoe gaat het? Goed hoor! Ik bel omdat ik zaterdag jarig ben. Ik geef een feestje bij mij thuis. Heb je zin om te komen? Ja leuk! Hoe laat begint het? Om acht uur 's avonds. We gaan taart eten en daarna lekker dansen. Moet ik iets meenemen? Nee hoor, alles is geregeld. Maar als je wilt, kun je iets te drinken meenemen. Gezellig! Wat is je adres ook alweer? Prinsengracht honderdvijftig in Amsterdam. Tot zaterdag! Tot zaterdag, dag!",
    questions: [
      {
        id: "verjaardag-1",
        question: "Wanneer is het feestje?",
        options: ["Vrijdag", "Zaterdag", "Zondag", "Vandaag"],
        correctIndex: 1,
        topic: "detailvragen",
      },
      {
        id: "verjaardag-2",
        question: "Wat vraagt Sanne of de vriendin kan meenemen?",
        options: ["Taart", "Eten", "Iets te drinken", "Muziek"],
        correctIndex: 2,
        topic: "detailvragen",
      },
    ],
  },
  // ===== FRAGMENT 12: Werk zoeken =====
  {
    id: "werk-zoeken",
    title: "Gesprek bij het uitzendbureau",
    situation: "Je bent bij het uitzendbureau. Je hoort een gesprek.",
    spokenText:
      "Goedemorgen, waarmee kan ik u helpen? Goedemorgen, ik zoek werk. Ik ben twee maanden geleden naar Nederland gekomen. Oké. Wat voor werk zoekt u? Ik heb in mijn land als kok gewerkt. Ik zoek werk in een restaurant of een keuken. Hebt u een diploma? Nee, maar ik heb acht jaar ervaring. Ik begrijp het. Wij hebben nu een vacature voor een hulpkok in een restaurant in het centrum. Het is vier dagen per week, van elf uur 's ochtends tot acht uur 's avonds. Dat klinkt goed! Wanneer kan ik beginnen? U moet eerst een gesprek hebben met de manager. Ik maak een afspraak voor u.",
    questions: [
      {
        id: "werk-1",
        question: "Hoe lang woont de persoon in Nederland?",
        options: ["Twee weken", "Twee maanden", "Twee jaar", "Zes maanden"],
        correctIndex: 1,
        topic: "detailvragen",
      },
      {
        id: "werk-2",
        question: "Hoeveel dagen per week is het werk?",
        options: ["Drie dagen", "Vier dagen", "Vijf dagen", "Zes dagen"],
        correctIndex: 1,
        topic: "aantallen",
      },
    ],
  },
  // ===== FRAGMENT 13: Boodschappen doen =====
  {
    id: "boodschappen",
    title: "Boodschappenlijstje",
    situation: "Een man en vrouw bespreken wat ze moeten kopen.",
    spokenText:
      "Schat, ik ga zo naar de supermarkt. Wat hebben we nodig? We hebben melk nodig en eieren. En koop ook brood, we hebben bijna geen brood meer. Hoeveel eieren? Een doosje van tien. En neem ook wat kaas mee, jonge kaas. Oké, melk, eieren, brood en jonge kaas. Nog iets? Ja, we hebben vanavond gasten. Kun je ook wijn kopen? Rode of witte wijn? Doe maar rode wijn. En neem ook wat druiven mee voor bij de kaas. Goed, ik ga nu. Tot straks!",
    questions: [
      {
        id: "boodschap-1",
        question: "Hoeveel eieren moeten ze kopen?",
        options: ["Zes", "Acht", "Tien", "Twaalf"],
        correctIndex: 2,
        topic: "aantallen",
      },
      {
        id: "boodschap-2",
        question: "Waarom moeten ze wijn kopen?",
        options: [
          "Omdat het weekend is",
          "Omdat ze gasten hebben vanavond",
          "Omdat de wijn op is",
          "Omdat het de verjaardag is",
        ],
        correctIndex: 1,
        topic: "conclusies-trekken",
      },
    ],
  },
  // ===== FRAGMENT 14: Op het gemeentehuis =====
  {
    id: "gemeentehuis",
    title: "Op het gemeentehuis",
    situation: "Je bent op het gemeentehuis. Je hoort een gesprek bij de balie.",
    spokenText:
      "Goedemorgen. Ik wil mij graag inschrijven op mijn nieuwe adres. Hebt u een afspraak? Ja, om half elf, op naam van Karim Benmoussa. Ja, ik zie het. Hebt u uw identiteitsbewijs bij u? Ja, hier is mijn paspoort. En hebt u ook een huurcontract of koopcontract van uw nieuwe woning? Ja, ik heb het huurcontract meegenomen. Prima. Ik ga uw gegevens nu invoeren. Uw nieuwe adres is Hoofdstraat tweeëntwintig in Utrecht, klopt dat? Ja, dat klopt. Goed, u ontvangt binnen vijf werkdagen een bevestiging per post op uw nieuwe adres.",
    questions: [
      {
        id: "gemeente-1",
        question: "Waarom is Karim op het gemeentehuis?",
        options: [
          "Om een paspoort aan te vragen",
          "Om zich in te schrijven op een nieuw adres",
          "Om een rijbewijs op te halen",
          "Om te trouwen",
        ],
        correctIndex: 1,
        topic: "hoofdgedachte",
      },
      {
        id: "gemeente-2",
        question: "Wanneer ontvangt Karim de bevestiging?",
        options: [
          "Vandaag nog",
          "Morgen",
          "Binnen vijf werkdagen",
          "Over twee weken",
        ],
        correctIndex: 2,
        topic: "detailvragen",
      },
    ],
  },
];

// Helper to get exactly 24 questions for the exam simulation
export function getLuisterenExamQuestions(): {
  fragment: LuisterenFragment;
  question: LuisterenQuestion;
  globalIndex: number;
}[] {
  const allQuestions: {
    fragment: LuisterenFragment;
    question: LuisterenQuestion;
    globalIndex: number;
  }[] = [];
  let idx = 0;
  for (const fragment of luisterenFragments) {
    for (const question of fragment.questions) {
      allQuestions.push({ fragment, question, globalIndex: idx });
      idx++;
    }
  }
  // Shuffle and return first 24
  const shuffled = allQuestions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 24).map((q, i) => ({ ...q, globalIndex: i }));
}

// Topic-based improvement suggestions for listening
export const luisterenTopicSuggestions: Record<string, { title: string; tip: string }> = {
  detailvragen: {
    title: "Detailvragen (Detail Questions)",
    tip: "Luister goed naar specifieke informatie zoals namen, tijden en plaatsen. Probeer mee te schrijven als je luistert. Bij het echte examen mag je aantekeningen maken.",
  },
  hoofdgedachte: {
    title: "Hoofdgedachte (Main Idea)",
    tip: "Probeer te begrijpen waar het gesprek over gaat. Vraag jezelf af: 'Wat is het belangrijkste onderwerp?' Luister naar de eerste en laatste zinnen — daar zit vaak de kern.",
  },
  aantallen: {
    title: "Aantallen & Getallen (Numbers & Quantities)",
    tip: "Oefen met het herkennen van Nederlandse getallen. Let op woorden als 'hoeveel', 'procent', 'euro', en tijdsaanduidingen. Schrijf getallen direct op als je ze hoort.",
  },
  "conclusies-trekken": {
    title: "Conclusies Trekken (Drawing Conclusions)",
    tip: "Soms wordt het antwoord niet letterlijk gezegd. Luister naar de context en combineer informatie uit het hele gesprek om tot het juiste antwoord te komen.",
  },
};
