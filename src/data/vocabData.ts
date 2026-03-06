export interface VocabWord {
  dutch: string;
  english: string;
  example?: string;
  exampleTranslation?: string;
  audio?: string;
}

export interface VocabCategory {
  id: string;
  title: string;
  dutchTitle: string;
  emoji: string;
  description: string;
  color: "orange" | "blue" | "teal";
  words: VocabWord[];
}

export const vocabCategories: VocabCategory[] = [
  {
    id: "gezondheid",
    title: "Health & Body",
    dutchTitle: "Gezondheid",
    emoji: "🏥",
    description: "Medical terms, body parts, and visiting the doctor",
    color: "teal",
    words: [
      { dutch: "de dokter", english: "the doctor", example: "Ik ga naar de dokter." },
      { dutch: "de apotheek", english: "the pharmacy", example: "De apotheek is om de hoek." },
      { dutch: "het recept", english: "the prescription", example: "Ik heb een recept nodig." },
      { dutch: "ziek", english: "sick", example: "Ik ben ziek." },
      { dutch: "pijn", english: "pain", example: "Ik heb pijn in mijn hoofd." },
      { dutch: "het hoofd", english: "the head", example: "Mijn hoofd doet pijn." },
      { dutch: "de buik", english: "the stomach", example: "Ik heb buikpijn." },
      { dutch: "koorts", english: "fever", example: "Ik heb koorts." },
      { dutch: "de afspraak", english: "the appointment", example: "Ik wil een afspraak maken." },
      { dutch: "het ziekenhuis", english: "the hospital", example: "Hij ligt in het ziekenhuis." },
      { dutch: "de tandarts", english: "the dentist", example: "Ik moet naar de tandarts." },
      { dutch: "de verzekering", english: "the insurance", example: "Heb je een verzekering?" },
    ],
  },
  {
    id: "werk",
    title: "Work & Jobs",
    dutchTitle: "Werk",
    emoji: "💼",
    description: "Workplace vocabulary and job-related terms",
    color: "blue",
    words: [
      { dutch: "het werk", english: "the work/job", example: "Ik ga naar het werk." },
      { dutch: "de baas", english: "the boss", example: "Mijn baas is aardig." },
      { dutch: "het salaris", english: "the salary", example: "Het salaris is goed." },
      { dutch: "solliciteren", english: "to apply for a job", example: "Ik wil solliciteren." },
      { dutch: "het contract", english: "the contract", example: "Ik heb een contract getekend." },
      { dutch: "de collega", english: "the colleague", example: "Mijn collega helpt mij." },
      { dutch: "het kantoor", english: "the office", example: "Het kantoor is groot." },
      { dutch: "de vergadering", english: "the meeting", example: "De vergadering is om tien uur." },
      { dutch: "vakantie", english: "vacation", example: "Ik heb vakantie." },
      { dutch: "de werkgever", english: "the employer", example: "De werkgever betaalt het salaris." },
      { dutch: "parttime", english: "part-time", example: "Ik werk parttime." },
      { dutch: "fulltime", english: "full-time", example: "Zij werkt fulltime." },
    ],
  },
  {
    id: "wonen",
    title: "Housing",
    dutchTitle: "Wonen",
    emoji: "🏠",
    description: "Renting, furniture, and household vocabulary",
    color: "orange",
    words: [
      { dutch: "het huis", english: "the house", example: "Het huis is groot." },
      { dutch: "de huur", english: "the rent", example: "De huur is duur." },
      { dutch: "de keuken", english: "the kitchen", example: "De keuken is schoon." },
      { dutch: "de slaapkamer", english: "the bedroom", example: "De slaapkamer is boven." },
      { dutch: "de badkamer", english: "the bathroom", example: "De badkamer is klein." },
      { dutch: "de woonkamer", english: "the living room", example: "We zitten in de woonkamer." },
      { dutch: "de buren", english: "the neighbors", example: "De buren zijn aardig." },
      { dutch: "de sleutel", english: "the key", example: "Waar is de sleutel?" },
      { dutch: "de verhuurder", english: "the landlord", example: "De verhuurder woont hier niet." },
      { dutch: "het contract", english: "the lease", example: "Het contract is voor een jaar." },
      { dutch: "de verhuizing", english: "the move", example: "De verhuizing is morgen." },
      { dutch: "de meubels", english: "the furniture", example: "De meubels zijn nieuw." },
    ],
  },
  {
    id: "overheid",
    title: "Government & Documents",
    dutchTitle: "Overheid",
    emoji: "🏛️",
    description: "Official documents, gemeente, and civic procedures",
    color: "blue",
    words: [
      { dutch: "de gemeente", english: "the municipality", example: "Ik ga naar de gemeente." },
      { dutch: "het paspoort", english: "the passport", example: "Mijn paspoort is verlopen." },
      { dutch: "de identiteitskaart", english: "the ID card", example: "Mag ik uw identiteitskaart?" },
      { dutch: "het formulier", english: "the form", example: "Vul dit formulier in." },
      { dutch: "de handtekening", english: "the signature", example: "Zet hier uw handtekening." },
      { dutch: "de verblijfsvergunning", english: "the residence permit", example: "Ik heb een verblijfsvergunning." },
      { dutch: "de belasting", english: "the tax", example: "Ik moet belasting betalen." },
      { dutch: "het burgerservicenummer", english: "the BSN number", example: "Wat is uw BSN?" },
      { dutch: "inschrijven", english: "to register", example: "Ik wil mij inschrijven." },
      { dutch: "de afspraak", english: "the appointment", example: "Ik heb een afspraak bij de gemeente." },
      { dutch: "de toeslag", english: "the allowance/benefit", example: "Ik krijg huurtoeslag." },
      { dutch: "DigiD", english: "digital ID", example: "Je hebt DigiD nodig." },
    ],
  },
  {
    id: "onderwijs",
    title: "Education",
    dutchTitle: "Onderwijs",
    emoji: "📚",
    description: "School, learning, and education system vocabulary",
    color: "teal",
    words: [
      { dutch: "de school", english: "the school", example: "De kinderen gaan naar school." },
      { dutch: "de leraar", english: "the teacher (m)", example: "De leraar is streng." },
      { dutch: "de juf", english: "the teacher (f)", example: "De juf is lief." },
      { dutch: "het huiswerk", english: "the homework", example: "Heb je je huiswerk gemaakt?" },
      { dutch: "de les", english: "the lesson", example: "De les begint om negen uur." },
      { dutch: "de opleiding", english: "the education/training", example: "Welke opleiding heb je?" },
      { dutch: "het diploma", english: "the diploma", example: "Ik heb mijn diploma gehaald." },
      { dutch: "de cursus", english: "the course", example: "Ik volg een cursus Nederlands." },
      { dutch: "het examen", english: "the exam", example: "Het examen is volgende week." },
      { dutch: "de cijfer", english: "the grade", example: "Ik heb een goed cijfer." },
      { dutch: "studeren", english: "to study", example: "Ik studeer aan de universiteit." },
      { dutch: "leren", english: "to learn", example: "Ik leer Nederlands." },
    ],
  },
  {
    id: "vervoer",
    title: "Transport",
    dutchTitle: "Vervoer",
    emoji: "🚲",
    description: "Getting around: bikes, buses, trains, and more",
    color: "orange",
    words: [
      { dutch: "de fiets", english: "the bicycle", example: "Ik ga met de fiets." },
      { dutch: "de bus", english: "the bus", example: "De bus komt om drie uur." },
      { dutch: "de trein", english: "the train", example: "De trein is te laat." },
      { dutch: "de tram", english: "the tram", example: "Neem de tram naar het centrum." },
      { dutch: "het station", english: "the station", example: "Het station is dichtbij." },
      { dutch: "de halte", english: "the stop", example: "De volgende halte is Centraal." },
      { dutch: "de OV-chipkaart", english: "the transit card", example: "Heb je je OV-chipkaart?" },
      { dutch: "het perron", english: "the platform", example: "De trein vertrekt van perron 3." },
      { dutch: "de vertraging", english: "the delay", example: "Er is een vertraging." },
      { dutch: "de enkele reis", english: "the one-way ticket", example: "Een enkele reis naar Utrecht." },
      { dutch: "het retour", english: "the return ticket", example: "Een retour naar Den Haag." },
      { dutch: "overstappen", english: "to transfer", example: "U moet overstappen in Leiden." },
    ],
  },
];
