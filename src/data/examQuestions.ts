export type OpgaveType = "video" | "1-photo" | "2-photos" | "3-photos";

export interface ExamQuestion {
  id: number;
  opgave: 1 | 2 | 3 | 4;
  opgaveType: OpgaveType;
  imagePrompts: string[];
  placeholderDescriptions: string[];
  situationDutch: string;
  situationEnglish: string;
  dutchQuestion: string;
  question: string;
  hints: string[];
  sampleAnswer: string;
  keywords: string[];
  category: "beschrijven" | "mening" | "situatie";
  videoDescription?: string;
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
    id: 1, opgave: 1, opgaveType: "video", imagePrompts: [], placeholderDescriptions: [],
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
    id: 2, opgave: 1, opgaveType: "video", imagePrompts: [], placeholderDescriptions: [],
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
    id: 3, opgave: 1, opgaveType: "video", imagePrompts: [], placeholderDescriptions: [],
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
    id: 4, opgave: 1, opgaveType: "video", imagePrompts: [], placeholderDescriptions: [],
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

  // === OPGAVE 2: 1 photo, two-part question (4 questions) ===
  {
    id: 5, opgave: 2, opgaveType: "1-photo",
    imagePrompts: ["A realistic photo of a Dutch supermarket interior, someone pushing a shopping cart past shelves of bread and cheese"],
    placeholderDescriptions: ["Iemand in de supermarkt met een winkelwagen"],
    situationDutch: "U bent in de supermarkt. U wilt boodschappen doen.",
    situationEnglish: "You are in the supermarket. You want to do groceries.",
    dutchQuestion: "Kijk naar het plaatje. Wat ziet u? En wat koopt u in de supermarkt?",
    question: "Look at the picture. What do you see? And what do you buy in the supermarket?",
    hints: ["Beschrijf het plaatje", "Noem 2-3 producten", "Gebruik: Ik zie... Ik koop..."],
    sampleAnswer: "Ik zie een supermarkt. Ik koop brood en kaas.",
    keywords: ["koop", "brood", "kaas", "supermarkt", "zie"],
    category: "situatie",
  },
  {
    id: 6, opgave: 2, opgaveType: "1-photo",
    imagePrompts: ["A realistic photo of a Dutch doctor's waiting room with patients sitting in chairs and a reception desk"],
    placeholderDescriptions: ["De wachtkamer van een huisarts"],
    situationDutch: "U bent ziek. U gaat naar de huisarts.",
    situationEnglish: "You are sick. You go to the doctor.",
    dutchQuestion: "Kijk naar het plaatje. Wat ziet u? En wat zegt u tegen de dokter?",
    question: "Look at the picture. What do you see? And what do you say to the doctor?",
    hints: ["Beschrijf het plaatje", "Zeg wat er is", "Gebruik: Ik zie... Ik zeg..."],
    sampleAnswer: "Ik zie een wachtkamer. Ik zeg: ik ben ziek, ik heb hoofdpijn.",
    keywords: ["wachtkamer", "ziek", "dokter", "hoofdpijn"],
    category: "situatie",
  },
  {
    id: 7, opgave: 2, opgaveType: "1-photo",
    imagePrompts: ["A realistic photo of a Dutch primary school classroom with children at desks and a teacher at the whiteboard"],
    placeholderDescriptions: ["Een Nederlandse basisschool klas"],
    situationDutch: "Uw kind gaat naar school. U praat met de juf.",
    situationEnglish: "Your child goes to school. You talk with the teacher.",
    dutchQuestion: "Kijk naar het plaatje. Wat ziet u? En wat vindt u van de school?",
    question: "Look at the picture. What do you see? And what do you think of the school?",
    hints: ["Beschrijf het plaatje", "Geef uw mening", "Gebruik: Ik zie... Ik vind..."],
    sampleAnswer: "Ik zie een klas met kinderen. Ik vind de school goed.",
    keywords: ["school", "klas", "kinderen", "goed"],
    category: "mening",
  },
  {
    id: 8, opgave: 2, opgaveType: "1-photo",
    imagePrompts: ["A realistic photo of a Dutch train station platform with a yellow NS train and passengers waiting"],
    placeholderDescriptions: ["Een Nederlands treinstation met een NS trein"],
    situationDutch: "U wilt met de trein reizen. U bent op het station.",
    situationEnglish: "You want to travel by train. You are at the station.",
    dutchQuestion: "Kijk naar het plaatje. Wat ziet u? En hoe reist u naar uw werk?",
    question: "Look at the picture. What do you see? And how do you travel to work?",
    hints: ["Beschrijf het plaatje", "Noem uw vervoer", "Gebruik: Ik zie... Ik ga met..."],
    sampleAnswer: "Ik zie een treinstation. Ik ga met de trein naar mijn werk.",
    keywords: ["trein", "station", "werk", "reis"],
    category: "beschrijven",
  },

  // === OPGAVE 3: 2 photos, candidate chooses one (4 questions) ===
  {
    id: 9, opgave: 3, opgaveType: "2-photos",
    imagePrompts: [
      "A realistic photo of a modern Dutch apartment building exterior with balconies",
      "A realistic photo of a traditional Dutch row house with a small front garden",
    ],
    placeholderDescriptions: ["Een modern appartement in de stad", "Een rijtjeshuis met een tuin"],
    situationDutch: "U zoekt een nieuw huis. U ziet twee soorten woningen.",
    situationEnglish: "You are looking for a new house. You see two types of homes.",
    dutchQuestion: "Kijk naar de plaatjes. Waar wilt u wonen? En waarom?",
    question: "Look at the pictures. Where do you want to live? And why?",
    hints: ["Kies plaatje 1 of 2", "Gebruik: Ik wil in... wonen", "Zeg waarom"],
    sampleAnswer: "Ik wil in het huis wonen. Het heeft een tuin. Dat is fijn voor mijn kinderen.",
    keywords: ["wonen", "huis", "appartement", "tuin"],
    category: "mening",
  },
  {
    id: 10, opgave: 3, opgaveType: "2-photos",
    imagePrompts: [
      "A realistic photo of a Dutch outdoor market with cheese, flowers and fish stalls",
      "A realistic photo inside a Dutch Albert Heijn supermarket with organized shelves",
    ],
    placeholderDescriptions: ["Een buitenmarkt met kraampjes", "Binnen in een supermarkt"],
    situationDutch: "U kunt boodschappen doen op de markt of in de supermarkt.",
    situationEnglish: "You can do shopping at the market or at the supermarket.",
    dutchQuestion: "Kijk naar de plaatjes. Waar koopt u liever uw eten? En waarom?",
    question: "Look at the pictures. Where do you prefer to buy food? And why?",
    hints: ["Kies de markt of de supermarkt", "Gebruik: Ik koop liever...", "Zeg waarom"],
    sampleAnswer: "Ik koop liever op de markt. Het eten is vers en lekker.",
    keywords: ["markt", "supermarkt", "kopen", "vers"],
    category: "mening",
  },
  {
    id: 11, opgave: 3, opgaveType: "2-photos",
    imagePrompts: [
      "A realistic photo of people jogging together in a Dutch park with green grass",
      "A realistic photo of a Dutch swimming pool interior with lanes and swimmers",
    ],
    placeholderDescriptions: ["Mensen die hardlopen in een park", "Een zwembad met zwemmers"],
    situationDutch: "U wilt meer bewegen. U kunt hardlopen of zwemmen.",
    situationEnglish: "You want to exercise more. You can run or swim.",
    dutchQuestion: "Kijk naar de plaatjes. Welke sport doet u liever? En waarom?",
    question: "Look at the pictures. Which sport do you prefer? And why?",
    hints: ["Kies een sport", "Gebruik: Ik... liever...", "Zeg waarom"],
    sampleAnswer: "Ik zwem liever. Ik vind zwemmen leuk en het is gezond.",
    keywords: ["hardlopen", "zwemmen", "sport", "liever"],
    category: "mening",
  },
  {
    id: 12, opgave: 3, opgaveType: "2-photos",
    imagePrompts: [
      "A realistic photo of a Dutch family eating breakfast together at home with toast and juice",
      "A realistic photo of a Dutch cafe terrace with people eating croissants and drinking coffee",
    ],
    placeholderDescriptions: ["Een gezin dat thuis ontbijt", "Mensen die ontbijten in een cafe"],
    situationDutch: "U kunt thuis ontbijten of in een cafe.",
    situationEnglish: "You can have breakfast at home or at a cafe.",
    dutchQuestion: "Kijk naar de plaatjes. Waar ontbijt u liever? En waarom?",
    question: "Look at the pictures. Where do you prefer to have breakfast? And why?",
    hints: ["Kies thuis of cafe", "Gebruik: Ik ontbijt liever...", "Zeg waarom"],
    sampleAnswer: "Ik ontbijt liever thuis. Het is goedkoper en rustig.",
    keywords: ["ontbijt", "thuis", "cafe", "eten"],
    category: "mening",
  },

  // === OPGAVE 4: 3 photos, candidate says something about ALL three (4 questions) ===
  {
    id: 13, opgave: 4, opgaveType: "3-photos",
    imagePrompts: [
      "A realistic photo of a Dutch person riding a bicycle on a bike path",
      "A realistic photo of a Dutch bus at a bus stop with passengers boarding",
      "A realistic photo of a Dutch person driving a car on a highway",
    ],
    placeholderDescriptions: ["Iemand op de fiets", "Een bus bij een halte", "Iemand in een auto"],
    situationDutch: "U ziet drie manieren om te reizen.",
    situationEnglish: "You see three ways to travel.",
    dutchQuestion: "Kijk naar de plaatjes. Vertel iets over alle drie de plaatjes. Hoe reist u het liefst? Vertel ook waarom.",
    question: "Look at the pictures. Say something about all three pictures. How do you prefer to travel? Also tell why.",
    hints: ["Zeg iets over elk plaatje", "Kies uw favoriet", "Zeg waarom"],
    sampleAnswer: "Op plaatje 1 zie ik een fiets. Op plaatje 2 zie ik een bus. Op plaatje 3 zie ik een auto. Ik reis het liefst met de fiets. Dat is gezond en goedkoop.",
    keywords: ["fiets", "bus", "auto", "reis", "liefst"],
    category: "mening",
  },
  {
    id: 14, opgave: 4, opgaveType: "3-photos",
    imagePrompts: [
      "A realistic photo of a Dutch person cooking dinner in a modern kitchen",
      "A realistic photo of a Dutch family eating at a restaurant",
      "A realistic photo of Dutch takeaway food containers on a table",
    ],
    placeholderDescriptions: ["Iemand die kookt thuis", "Een gezin in een restaurant", "Afhaaleten op tafel"],
    situationDutch: "U ziet drie manieren om te eten.",
    situationEnglish: "You see three ways to eat.",
    dutchQuestion: "Kijk naar de plaatjes. Vertel iets over alle drie de plaatjes. Wat doet u het liefst? Vertel ook waarom.",
    question: "Look at the pictures. Say something about all three pictures. What do you prefer? Also tell why.",
    hints: ["Zeg iets over elk plaatje", "Kies uw favoriet", "Zeg waarom"],
    sampleAnswer: "Op plaatje 1 kookt iemand thuis. Op plaatje 2 eet een gezin in een restaurant. Op plaatje 3 is er afhaaleten. Ik kook het liefst thuis. Dat is gezond en goedkoop.",
    keywords: ["koken", "restaurant", "afhaal", "thuis", "liefst"],
    category: "mening",
  },
  {
    id: 15, opgave: 4, opgaveType: "3-photos",
    imagePrompts: [
      "A realistic photo of a Dutch person reading a book on a couch",
      "A realistic photo of Dutch people playing football in a park",
      "A realistic photo of a Dutch person watching TV on a sofa",
    ],
    placeholderDescriptions: ["Iemand die een boek leest", "Mensen die voetballen", "Iemand die TV kijkt"],
    situationDutch: "U ziet drie manieren om vrije tijd te besteden.",
    situationEnglish: "You see three ways to spend free time.",
    dutchQuestion: "Kijk naar de plaatjes. Vertel iets over alle drie de plaatjes. Wat doet u het liefst in uw vrije tijd? Vertel ook waarom.",
    question: "Look at the pictures. Say something about all three. What do you prefer in your free time? Tell why.",
    hints: ["Zeg iets over elk plaatje", "Kies uw favoriet", "Zeg waarom"],
    sampleAnswer: "Op plaatje 1 leest iemand een boek. Op plaatje 2 spelen mensen voetbal. Op plaatje 3 kijkt iemand TV. Ik voetbal het liefst. Dat is leuk en gezond.",
    keywords: ["lezen", "voetbal", "TV", "vrije tijd", "liefst"],
    category: "mening",
  },
  {
    id: 16, opgave: 4, opgaveType: "3-photos",
    imagePrompts: [
      "A realistic photo of a Dutch person studying at a library desk with books",
      "A realistic photo of a Dutch person working at an office desk with a computer",
      "A realistic photo of a Dutch person working in a shop helping a customer",
    ],
    placeholderDescriptions: ["Iemand die studeert in de bibliotheek", "Iemand die werkt op kantoor", "Iemand die werkt in een winkel"],
    situationDutch: "U ziet drie plaatsen waar mensen werken of studeren.",
    situationEnglish: "You see three places where people work or study.",
    dutchQuestion: "Kijk naar de plaatjes. Vertel iets over alle drie de plaatjes. Waar werkt of studeert u het liefst? Vertel ook waarom.",
    question: "Look at the pictures. Say something about all three. Where do you prefer to work or study? Tell why.",
    hints: ["Zeg iets over elk plaatje", "Kies uw favoriet", "Zeg waarom"],
    sampleAnswer: "Op plaatje 1 studeert iemand in de bibliotheek. Op plaatje 2 werkt iemand op kantoor. Op plaatje 3 werkt iemand in een winkel. Ik werk het liefst op kantoor. Het is rustig en ik kan goed werken.",
    keywords: ["studeren", "bibliotheek", "kantoor", "winkel", "liefst"],
    category: "mening",
  },
];
