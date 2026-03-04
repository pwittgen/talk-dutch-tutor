export type OpgaveType = "video" | "1-photo" | "2-photos" | "3-photos";

export interface ExamQuestion {
  id: number;
  opgave: 1 | 2 | 3 | 4;
  opgaveType: OpgaveType;
  imagePrompts: string[]; // 0 for video, 1 for 1-photo, 2 for 2-photos, 3 for 3-photos
  placeholderDescriptions: string[];
  situationDutch: string;
  situationEnglish: string;
  dutchQuestion: string;
  question: string;
  hints: string[];
  sampleAnswer: string;
  keywords: string[];
  category: "beschrijven" | "mening" | "situatie";
  videoDescription?: string; // For opgave 1 (video-based)
}

export const opgaveDescriptions: Record<number, { title: string; instruction: string; type: OpgaveType }> = {
  1: {
    title: "Opgave 1",
    instruction: "U ziet een filmpje. Daarna hoort u een vraag. Geef antwoord op de vraag.",
    type: "video",
  },
  2: {
    title: "Opgave 2",
    instruction: "U ziet een plaatje. U hoort een situatie en een vraag. Geef antwoord op de vraag.",
    type: "1-photo",
  },
  3: {
    title: "Opgave 3",
    instruction: "U ziet twee plaatjes. U hoort een situatie en een vraag. Geef antwoord op de vraag.",
    type: "2-photos",
  },
  4: {
    title: "Opgave 4",
    instruction: "U ziet drie plaatjes. U hoort een situatie en een vraag. Geef antwoord op de vraag. Vertel ook waarom.",
    type: "3-photos",
  },
};

export const examQuestions: ExamQuestion[] = [
  // === OPGAVE 1: Video-based (4 questions) ===
  {
    id: 1,
    opgave: 1,
    opgaveType: "video",
    imagePrompts: [],
    placeholderDescriptions: [],
    videoDescription: "Een man loopt in een winkelstraat. Hij gaat een schoenenwinkel binnen. Hij past schoenen en koopt ze.",
    situationDutch: "U ziet een filmpje over een man in een winkel.",
    situationEnglish: "You see a video about a man in a shop.",
    dutchQuestion: "Wat doet de man in het filmpje?",
    question: "What does the man do in the video?",
    hints: ["Beschrijf wat u ziet", "Gebruik: De man...", "Kort en simpel"],
    sampleAnswer: "De man koopt schoenen in een winkel.",
    keywords: ["man", "koopt", "schoenen", "winkel"],
    category: "beschrijven",
  },
  {
    id: 2,
    opgave: 1,
    opgaveType: "video",
    imagePrompts: [],
    placeholderDescriptions: [],
    videoDescription: "Een vrouw gaat naar de markt. Ze koopt groente en fruit. Ze betaalt met contant geld.",
    situationDutch: "U ziet een filmpje over een vrouw op de markt.",
    situationEnglish: "You see a video about a woman at the market.",
    dutchQuestion: "Wat koopt de vrouw op de markt?",
    question: "What does the woman buy at the market?",
    hints: ["Noem wat ze koopt", "Gebruik: De vrouw koopt...", "1-2 zinnen"],
    sampleAnswer: "De vrouw koopt groente en fruit op de markt.",
    keywords: ["vrouw", "koopt", "groente", "fruit", "markt"],
    category: "beschrijven",
  },
  {
    id: 3,
    opgave: 1,
    opgaveType: "video",
    imagePrompts: [],
    placeholderDescriptions: [],
    videoDescription: "Een gezin zit aan tafel. Ze eten pannenkoeken. De kinderen lachen.",
    situationDutch: "U ziet een filmpje over een gezin dat eet.",
    situationEnglish: "You see a video about a family eating.",
    dutchQuestion: "Wat eten ze? En hoe is de sfeer?",
    question: "What are they eating? And how is the atmosphere?",
    hints: ["Noem het eten", "Beschrijf de sfeer", "Gebruik: Ze eten..."],
    sampleAnswer: "Ze eten pannenkoeken. Het is gezellig.",
    keywords: ["eten", "pannenkoeken", "gezellig", "gezin"],
    category: "beschrijven",
  },
  {
    id: 4,
    opgave: 1,
    opgaveType: "video",
    imagePrompts: [],
    placeholderDescriptions: [],
    videoDescription: "Een man fietst naar zijn werk. Het regent. Hij draagt een regenjas.",
    situationDutch: "U ziet een filmpje over een man die naar zijn werk gaat.",
    situationEnglish: "You see a video about a man going to work.",
    dutchQuestion: "Hoe gaat de man naar zijn werk? En hoe is het weer?",
    question: "How does the man go to work? And how is the weather?",
    hints: ["Noem het vervoer", "Beschrijf het weer", "Kort antwoorden"],
    sampleAnswer: "De man fietst naar zijn werk. Het regent.",
    keywords: ["fietst", "werk", "regent", "weer"],
    category: "beschrijven",
  },

  // === OPGAVE 2: 1 photo (4 questions) ===
  {
    id: 5,
    opgave: 2,
    opgaveType: "1-photo",
    imagePrompts: ["A realistic photo of a Dutch supermarket interior, someone pushing a shopping cart past shelves of bread and cheese, Albert Heijn style lighting"],
    placeholderDescriptions: ["Iemand in de supermarkt met een winkelwagen"],
    situationDutch: "U bent in de supermarkt. U wilt boodschappen doen.",
    situationEnglish: "You are in the supermarket. You want to do groceries.",
    dutchQuestion: "Kijk naar het plaatje. Wat koopt u in de supermarkt?",
    question: "Look at the picture. What do you buy in the supermarket?",
    hints: ["Noem 2-3 producten", "Gebruik: Ik koop...", "Kort en simpel"],
    sampleAnswer: "Ik koop brood, kaas en melk.",
    keywords: ["koop", "brood", "kaas", "melk", "supermarkt"],
    category: "situatie",
  },
  {
    id: 6,
    opgave: 2,
    opgaveType: "1-photo",
    imagePrompts: ["A realistic photo of a Dutch doctor's waiting room, patients sitting in chairs, a reception desk with a woman behind it, posters on wall"],
    placeholderDescriptions: ["De wachtkamer van een huisarts"],
    situationDutch: "U bent ziek. U belt de huisarts voor een afspraak.",
    situationEnglish: "You are sick. You call the doctor for an appointment.",
    dutchQuestion: "Kijk naar het plaatje. Wat zegt u tegen de receptionist?",
    question: "Look at the picture. What do you say to the receptionist?",
    hints: ["Maak een afspraak", "Zeg wat er is", "Gebruik: Ik wil graag..."],
    sampleAnswer: "Goedemorgen. Ik wil graag een afspraak maken. Ik ben ziek.",
    keywords: ["afspraak", "maken", "ziek", "huisarts"],
    category: "situatie",
  },
  {
    id: 7,
    opgave: 2,
    opgaveType: "1-photo",
    imagePrompts: ["A realistic photo of a Dutch primary school classroom, children at desks with a teacher at the whiteboard, colorful decorations"],
    placeholderDescriptions: ["Een Nederlandse basisschool klas"],
    situationDutch: "Uw kind gaat naar school.",
    situationEnglish: "Your child goes to school.",
    dutchQuestion: "Kijk naar het plaatje. Wat vindt u van de school van uw kind?",
    question: "Look at the picture. What do you think of your child's school?",
    hints: ["Geef uw mening", "Gebruik: Ik vind...", "1-2 zinnen"],
    sampleAnswer: "Ik vind de school goed. De juf is aardig.",
    keywords: ["school", "goed", "juf", "kind"],
    category: "mening",
  },
  {
    id: 8,
    opgave: 2,
    opgaveType: "1-photo",
    imagePrompts: ["A realistic photo of a Dutch train station platform with a yellow NS train, passengers waiting on platform, departure board visible"],
    placeholderDescriptions: ["Een Nederlands treinstation met een NS trein"],
    situationDutch: "U wilt met de trein reizen.",
    situationEnglish: "You want to travel by train.",
    dutchQuestion: "Kijk naar het plaatje. Hoe reist u naar uw werk of school?",
    question: "Look at the picture. How do you travel to work or school?",
    hints: ["Noem uw vervoer", "Gebruik: Ik ga met...", "Kort antwoorden"],
    sampleAnswer: "Ik ga met de trein naar mijn werk.",
    keywords: ["trein", "fiets", "bus", "werk"],
    category: "beschrijven",
  },

  // === OPGAVE 3: 2 photos (4 questions) ===
  {
    id: 9,
    opgave: 3,
    opgaveType: "2-photos",
    imagePrompts: [
      "A realistic photo of a modern Dutch apartment building exterior, balconies with plants, brick facade, urban setting",
      "A realistic photo of a traditional Dutch row house with a small front garden, bikes parked outside, residential street",
    ],
    placeholderDescriptions: [
      "Een modern appartement in de stad",
      "Een rijtjeshuis met een tuin",
    ],
    situationDutch: "U zoekt een nieuw huis. U ziet twee soorten woningen.",
    situationEnglish: "You are looking for a new house. You see two types of homes.",
    dutchQuestion: "Kijk naar de plaatjes. Waar wilt u liever wonen? Vertel ook waarom.",
    question: "Look at the pictures. Where would you prefer to live? Also tell why.",
    hints: ["Kies een woning", "Gebruik: Ik wil liever...", "Zeg waarom"],
    sampleAnswer: "Ik wil liever in het huis wonen. Het heeft een tuin.",
    keywords: ["wonen", "huis", "appartement", "tuin"],
    category: "mening",
  },
  {
    id: 10,
    opgave: 3,
    opgaveType: "2-photos",
    imagePrompts: [
      "A realistic photo of a Dutch outdoor market with cheese, flowers and fish stalls, shoppers on a sunny day",
      "A realistic photo inside a Dutch Albert Heijn supermarket, bright lighting, organized shelves, shopping cart",
    ],
    placeholderDescriptions: [
      "Een buitenmarkt met kraampjes",
      "Binnen in een supermarkt",
    ],
    situationDutch: "U kunt boodschappen doen op de markt of in de supermarkt.",
    situationEnglish: "You can do shopping at the market or at the supermarket.",
    dutchQuestion: "Kijk naar de plaatjes. Waar koopt u liever uw eten? Vertel ook waarom.",
    question: "Look at the pictures. Where do you prefer to buy food? Also tell why.",
    hints: ["Kies markt of supermarkt", "Gebruik: Ik koop liever...", "Zeg waarom"],
    sampleAnswer: "Ik koop liever op de markt. Het eten is vers.",
    keywords: ["markt", "supermarkt", "kopen", "vers"],
    category: "mening",
  },
  {
    id: 11,
    opgave: 3,
    opgaveType: "2-photos",
    imagePrompts: [
      "A realistic photo of people jogging together in a Dutch park, green grass, trees, morning light",
      "A realistic photo of a Dutch swimming pool interior with lanes, people swimming, indoor pool",
    ],
    placeholderDescriptions: [
      "Mensen die hardlopen in een park",
      "Een zwembad met zwemmers",
    ],
    situationDutch: "U wilt meer bewegen. U kunt hardlopen of zwemmen.",
    situationEnglish: "You want to exercise more. You can run or swim.",
    dutchQuestion: "Kijk naar de plaatjes. Welke sport doet u liever? Vertel ook waarom.",
    question: "Look at the pictures. Which sport do you prefer? Also tell why.",
    hints: ["Kies een sport", "Gebruik: Ik... liever...", "Zeg waarom"],
    sampleAnswer: "Ik zwem liever. Ik vind zwemmen leuk.",
    keywords: ["hardlopen", "zwemmen", "sport", "liever"],
    category: "mening",
  },
  {
    id: 12,
    opgave: 3,
    opgaveType: "2-photos",
    imagePrompts: [
      "A realistic photo of a Dutch family eating breakfast together at home, toast, eggs, juice on table, cozy kitchen",
      "A realistic photo of a Dutch cafe terrace with people eating croissants and drinking coffee, outdoor seating",
    ],
    placeholderDescriptions: [
      "Een gezin dat thuis ontbijt",
      "Mensen die ontbijten in een cafe",
    ],
    situationDutch: "U kunt thuis ontbijten of in een cafe.",
    situationEnglish: "You can have breakfast at home or at a cafe.",
    dutchQuestion: "Kijk naar de plaatjes. Wat eet u liever voor ontbijt? Vertel ook waarom.",
    question: "Look at the pictures. What do you prefer to eat for breakfast? Also tell why.",
    hints: ["Kies thuis of cafe", "Gebruik: Ik ontbijt liever...", "Zeg waarom"],
    sampleAnswer: "Ik ontbijt liever thuis. Het is goedkoper.",
    keywords: ["ontbijt", "thuis", "cafe", "eten"],
    category: "mening",
  },
];
