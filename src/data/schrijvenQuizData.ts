// Schrijven (Writing) A2 exam practice data
// Based on actual DUO A2 inburgering exam format:
// 4 questions per exam, mixing: email, form, free writing (wijkkrant), note/message

export type SchrijvenQuestionType = "email" | "form" | "freewriting" | "note";

export interface SchrijvenFormField {
  label: string;
  type: "text" | "radio" | "textarea";
  options?: string[];
  key: string;
}

export interface SchrijvenQuestion {
  id: string;
  type: SchrijvenQuestionType;
  title: string;
  situation: string;
  bulletPoints: string[];
  instruction: string;
  // Email-specific
  emailTo?: string;
  emailSubject?: string;
  emailGreeting?: string;
  emailClosing?: string;
  // Form-specific
  formTitle?: string;
  formFields?: SchrijvenFormField[];
  formTextareaLabel?: string;
  // Free writing
  freewritingPrompt?: string;
  // Topics for feedback
  topics: string[];
}

export interface SchrijvenExam {
  id: string;
  title: string;
  questions: SchrijvenQuestion[];
}

// All available questions pooled from the 3 practice exams + additional generated ones
const allQuestions: SchrijvenQuestion[] = [
  // === FROM EXAM 1 ===
  {
    id: "e1q1",
    type: "email",
    title: "Afspraak verzetten",
    situation: "U volgt een opleiding. U hebt morgen een afspraak met Amber, een andere student. U kunt niet en wilt een andere afspraak maken. U schrijft daarom een e-mail aan Amber.",
    bulletPoints: [
      "Schrijf dat u de afspraak wilt verzetten.",
      "Schrijf waarom u dat wilt. Bedenk zelf waarom.",
      "Stel een nieuwe datum voor."
    ],
    instruction: "Schrijf de e-mail. Schrijf in hele zinnen.",
    emailTo: "amberdegroot@mail.nl",
    emailSubject: "Afspraak",
    emailGreeting: "Beste Amber,",
    emailClosing: "Vriendelijke groet,",
    topics: ["email", "afspraak", "reden geven"]
  },
  {
    id: "e1q2",
    type: "freewriting",
    title: "Feest",
    situation: "U krijgt elke week een wijkkrant. Iedereen uit de buurt mag iets voor deze krant schrijven.",
    bulletPoints: [
      "Waarom viert u het feest?",
      "Wie komen er op het feest?",
      "Wat doet u op het feest?"
    ],
    instruction: "Schrijf over een feest dat u elk jaar viert. Schrijf minimaal drie zinnen op.",
    freewritingPrompt: "Dit is mijn tekst over het feest dat ik elk jaar vier:",
    topics: ["vrij schrijven", "beschrijven", "feest"]
  },
  {
    id: "e1q3",
    type: "form",
    title: "Inschrijven sportschool",
    situation: "U wilt graag sporten. U gaat naar een sportschool in uw buurt. U moet een formulier invullen. Sommige gegevens moet u zelf bedenken.",
    bulletPoints: [],
    instruction: "Vul het formulier in.",
    formTitle: "Inschrijfformulier Sportclub SPRINT",
    formFields: [
      { label: "Voor- en achternaam", type: "text", key: "name" },
      { label: "Adres", type: "text", key: "address" },
      { label: "Postcode", type: "text", key: "postcode" },
      { label: "Woonplaats", type: "text", key: "city" },
      { label: "Telefoonnummer", type: "text", key: "phone" },
      { label: "Geslacht", type: "radio", options: ["man", "vrouw"], key: "gender" },
      { label: "Geboortedatum", type: "text", key: "dob" },
      { label: "Welke groepsles wilt u nu gaan doen?", type: "radio", options: ["Fitness", "Yoga", "Hardlopen"], key: "class" },
      { label: "Hoe vaak wilt u komen?", type: "radio", options: ["1x per week", "2x per week", "meer dan 2x per week"], key: "frequency" },
      { label: "Waarom kiest u voor deze groepsles?", type: "textarea", key: "reason" },
      { label: "Hoe is uw gezondheid?", type: "textarea", key: "health" }
    ],
    topics: ["formulier", "persoonlijke gegevens"]
  },
  {
    id: "e1q4",
    type: "email",
    title: "Dienst ruilen",
    situation: "U moet zondag werken maar u wilt graag vrij. U schrijft daarom een e-mail aan uw collega Farida. U vraagt of zij met u wil ruilen.",
    bulletPoints: [
      "Schrijf op waarom u mailt.",
      "Schrijf waarom u wilt ruilen. Bedenk het zelf.",
      "Schrijf op welke dag u wel kunt werken."
    ],
    instruction: "Schrijf de e-mail. Schrijf in hele zinnen.",
    emailTo: "farida@hmail.com",
    emailSubject: "Dienst ruilen",
    emailGreeting: "Hallo Farida,",
    emailClosing: "Groetjes,",
    topics: ["email", "werk", "verzoek"]
  },
  // === FROM EXAM 2 ===
  {
    id: "e2q1",
    type: "freewriting",
    title: "Mooiste kleren",
    situation: "U krijgt elke week een wijkkrant. Iedereen uit de buurt mag iets voor deze krant schrijven.",
    bulletPoints: [
      "Wat draagt u het liefst?",
      "Hoe zien de kleren eruit?",
      "Wanneer draagt u deze kleren?"
    ],
    instruction: "Schrijf over de kleren die u het liefst draagt. Schrijf minimaal drie zinnen op.",
    freewritingPrompt: "Dit is mijn tekst over de kleren die ik het liefst draag:",
    topics: ["vrij schrijven", "beschrijven", "kleding"]
  },
  {
    id: "e2q2",
    type: "email",
    title: "Boek lenen",
    situation: "Voor uw opleiding Techniek heeft u snel het boek 'Natuurkunde 1' nodig. In de bibliotheek is het boek niet. Een medestudente heeft het boek. U wilt het boek van haar lenen. U schrijft haar een e-mail.",
    bulletPoints: [
      "U schrijft welk boek u wilt lenen.",
      "U schrijft waarom u het boek van haar wilt lenen.",
      "U schrijft wanneer ze het boek terugkrijgt. Bedenk zelf wanneer."
    ],
    instruction: "Schrijf de e-mail. Schrijf in hele zinnen.",
    emailTo: "wilma@email.nl",
    emailSubject: "Boek lenen",
    emailGreeting: "Beste Wilma,",
    emailClosing: "Groetjes,",
    topics: ["email", "verzoek", "opleiding"]
  },
  {
    id: "e2q3",
    type: "form",
    title: "Ingebroken",
    situation: "Er is ingebroken in uw huis. Dieven hebben spullen meegenomen en er is schade. U vult een schadeformulier in van uw verzekering.",
    bulletPoints: [
      "Vul het formulier in. Bedenk zelf de gegevens.",
      "Schrijf op wanneer er is ingebroken.",
      "Schrijf drie dingen op die zijn gebeurd."
    ],
    instruction: "Vul het formulier in.",
    formTitle: "Schadeformulier inboedelverzekering",
    formFields: [
      { label: "Achternaam", type: "text", key: "lastname" },
      { label: "Voorletters", type: "text", key: "initials" },
      { label: "Adres", type: "text", key: "address" },
      { label: "Telefoonnummer", type: "text", key: "phone" },
      { label: "E-mail", type: "text", key: "email" },
      { label: "Datum van de schade", type: "text", key: "date" },
      { label: "Omschrijving gestolen spullen en schade (3 dingen)", type: "textarea", key: "description" }
    ],
    topics: ["formulier", "schade melden", "beschrijven"]
  },
  {
    id: "e2q4",
    type: "email",
    title: "Vrije dag aanvragen",
    situation: "U wilt volgende week een dag vrij vragen. U schrijft een e-mail aan uw chef, meneer Jansen.",
    bulletPoints: [
      "U schrijft wanneer u vrij wilt hebben. Bedenk zelf een dag en datum.",
      "U schrijft waarom u vrij wilt hebben. Bedenk zelf waarom."
    ],
    instruction: "Schrijf de e-mail. Schrijf in hele zinnen.",
    emailTo: "jjansen@werk.nl",
    emailSubject: "Vrij",
    emailGreeting: "Beste meneer Jansen,",
    emailClosing: "Vriendelijke groet,",
    topics: ["email", "werk", "verlof aanvragen"]
  },
  // === FROM EXAM 3 ===
  {
    id: "e3q1",
    type: "email",
    title: "E-mail aan docent",
    situation: "U doet een computercursus. Morgen moet u een toets maken, maar u kunt niet naar school komen. U schrijft een e-mail aan uw docent.",
    bulletPoints: [
      "Schrijf waarom u de e-mail stuurt.",
      "Schrijf waarom u niet kunt komen. Bedenk het zelf.",
      "Bied uw excuses aan.",
      "Vraag wanneer u de toets kunt maken."
    ],
    instruction: "Schrijf de e-mail. Schrijf in hele zinnen.",
    emailTo: "mijndocent@mail.nl",
    emailSubject: "De toets morgen",
    emailGreeting: "Beste meneer Bakker,",
    emailClosing: "Groeten,",
    topics: ["email", "excuses", "opleiding"]
  },
  {
    id: "e3q2",
    type: "form",
    title: "Problemen in de straat",
    situation: "In de straat waar u woont zijn twee problemen. U meldt de problemen bij de gemeente. Vul het formulier van de gemeente in. Sommige gegevens moet u zelf bedenken.",
    bulletPoints: [
      "Vul uw persoonlijke gegevens in.",
      "Schrijf in welke straat de problemen zijn.",
      "Schrijf wat de problemen zijn."
    ],
    instruction: "Vul het formulier in.",
    formTitle: "Meldingsformulier gemeente",
    formFields: [
      { label: "Voor- en achternaam", type: "text", key: "name" },
      { label: "Adres", type: "text", key: "address" },
      { label: "Postcode", type: "text", key: "postcode" },
      { label: "Woonplaats", type: "text", key: "city" },
      { label: "Telefoonnummer", type: "text", key: "phone" },
      { label: "E-mail", type: "text", key: "email" },
      { label: "In welke straat zijn er problemen?", type: "text", key: "street" },
      { label: "Wat zijn de problemen? (beschrijf twee problemen)", type: "textarea", key: "problems" }
    ],
    topics: ["formulier", "probleem melden", "gemeente"]
  },
  {
    id: "e3q3",
    type: "freewriting",
    title: "Weekend",
    situation: "U krijgt elke week een wijkkrant. Iedereen uit de buurt mag iets voor deze krant schrijven.",
    bulletPoints: [
      "Wat doet u graag in het weekend?",
      "Met wie doet u dat?",
      "Waar doet u dat?"
    ],
    instruction: "Schrijf over uw weekend. Schrijf minimaal drie zinnen op.",
    freewritingPrompt: "Dit is mijn tekst over mijn weekend:",
    topics: ["vrij schrijven", "beschrijven", "vrije tijd"]
  },
  {
    id: "e3q4",
    type: "note",
    title: "Bericht collega",
    situation: "U werkt in een kledingzaak. Straks komt uw collega Fariha. Zij moet een paar dingen doen.",
    bulletPoints: [
      "Schrijf een briefje voor Fariha.",
      "Vertel wat zij moet doen.",
      "Schrijf drie dingen op."
    ],
    instruction: "Schrijf in hele zinnen.",
    emailGreeting: "Hallo Fariha,",
    emailClosing: "Alvast bedankt!\nGroeten,",
    topics: ["briefje", "instructies geven", "werk"]
  },
  // === ADDITIONAL GENERATED QUESTIONS ===
  {
    id: "g1",
    type: "email",
    title: "Pakketje ophalen",
    situation: "U hebt een pakketje besteld bij een webwinkel. Het pakketje is bij uw buurman afgeleverd, maar u bent de hele week overdag niet thuis. U schrijft een e-mail aan uw buurman.",
    bulletPoints: [
      "Schrijf waarom u mailt.",
      "Schrijf wanneer u het pakketje kunt ophalen. Bedenk het zelf.",
      "Bedank uw buurman."
    ],
    instruction: "Schrijf de e-mail. Schrijf in hele zinnen.",
    emailTo: "buurman.devries@mail.nl",
    emailSubject: "Pakketje",
    emailGreeting: "Beste meneer De Vries,",
    emailClosing: "Met vriendelijke groet,",
    topics: ["email", "verzoek", "buren"]
  },
  {
    id: "g2",
    type: "freewriting",
    title: "Lekker eten",
    situation: "U krijgt elke week een wijkkrant. Iedereen uit de buurt mag iets voor deze krant schrijven.",
    bulletPoints: [
      "Wat is uw lievelingseten?",
      "Wanneer eet u dit?",
      "Wie kookt het?"
    ],
    instruction: "Schrijf over uw lievelingseten. Schrijf minimaal drie zinnen op.",
    freewritingPrompt: "Dit is mijn tekst over mijn lievelingseten:",
    topics: ["vrij schrijven", "beschrijven", "eten"]
  },
  {
    id: "g3",
    type: "form",
    title: "Aanmelden cursus Nederlands",
    situation: "U wilt een cursus Nederlands volgen bij het buurthuis. U moet een formulier invullen. Sommige gegevens moet u zelf bedenken.",
    bulletPoints: [],
    instruction: "Vul het formulier in.",
    formTitle: "Aanmeldformulier Cursus Nederlands",
    formFields: [
      { label: "Voor- en achternaam", type: "text", key: "name" },
      { label: "Adres", type: "text", key: "address" },
      { label: "Postcode en woonplaats", type: "text", key: "postcode_city" },
      { label: "Telefoonnummer", type: "text", key: "phone" },
      { label: "E-mail", type: "text", key: "email" },
      { label: "Geboortedatum", type: "text", key: "dob" },
      { label: "Welk niveau heeft u?", type: "radio", options: ["Beginner", "A1", "A2"], key: "level" },
      { label: "Welke dagen kunt u?", type: "radio", options: ["Maandag", "Woensdag", "Zaterdag"], key: "day" },
      { label: "Waarom wilt u deze cursus volgen?", type: "textarea", key: "reason" }
    ],
    topics: ["formulier", "persoonlijke gegevens", "opleiding"]
  },
  {
    id: "g4",
    type: "note",
    title: "Briefje voor huisgenoot",
    situation: "U woont samen met een huisgenoot. U gaat vanavond weg en u hebt boodschappen gedaan. U schrijft een briefje voor uw huisgenoot.",
    bulletPoints: [
      "Schrijf dat u boodschappen hebt gedaan.",
      "Schrijf wat u hebt gekocht (drie dingen).",
      "Schrijf waar de boodschappen staan."
    ],
    instruction: "Schrijf in hele zinnen.",
    emailGreeting: "Hoi Lisa,",
    emailClosing: "Groetjes,",
    topics: ["briefje", "informatie geven", "boodschappen"]
  },
  {
    id: "g5",
    type: "email",
    title: "Klacht over bestelling",
    situation: "U hebt online kleren besteld. De kleren zijn te klein en hebben een andere kleur dan op de foto. U schrijft een e-mail aan de klantenservice.",
    bulletPoints: [
      "Schrijf wat u hebt besteld.",
      "Schrijf wat er mis is.",
      "Schrijf wat u wilt (geld terug of omruilen)."
    ],
    instruction: "Schrijf de e-mail. Schrijf in hele zinnen.",
    emailTo: "klantenservice@modeshop.nl",
    emailSubject: "Klacht bestelling",
    emailGreeting: "Geachte mevrouw/meneer,",
    emailClosing: "Met vriendelijke groet,",
    topics: ["email", "klacht", "bestelling"]
  },
  {
    id: "g6",
    type: "freewriting",
    title: "Mijn buurt",
    situation: "U krijgt elke week een wijkkrant. Iedereen uit de buurt mag iets voor deze krant schrijven.",
    bulletPoints: [
      "Waar woont u?",
      "Wat vindt u leuk aan uw buurt?",
      "Wat kan beter in uw buurt?"
    ],
    instruction: "Schrijf over uw buurt. Schrijf minimaal drie zinnen op.",
    freewritingPrompt: "Dit is mijn tekst over mijn buurt:",
    topics: ["vrij schrijven", "mening geven", "wonen"]
  },
  {
    id: "g7",
    type: "form",
    title: "Kind aanmelden op school",
    situation: "Uw kind gaat naar een nieuwe school. U moet een formulier invullen. Sommige gegevens moet u zelf bedenken.",
    bulletPoints: [],
    instruction: "Vul het formulier in.",
    formTitle: "Aanmeldformulier basisschool De Regenboog",
    formFields: [
      { label: "Naam van het kind", type: "text", key: "child_name" },
      { label: "Geboortedatum kind", type: "text", key: "child_dob" },
      { label: "Naam ouder/verzorger", type: "text", key: "parent_name" },
      { label: "Adres", type: "text", key: "address" },
      { label: "Telefoonnummer", type: "text", key: "phone" },
      { label: "E-mail", type: "text", key: "email" },
      { label: "In welke groep moet uw kind?", type: "radio", options: ["Groep 1", "Groep 2", "Groep 3"], key: "group" },
      { label: "Heeft uw kind allergieën? Zo ja, welke?", type: "textarea", key: "allergies" }
    ],
    topics: ["formulier", "persoonlijke gegevens", "kinderen"]
  },
  {
    id: "g8",
    type: "email",
    title: "Ziek melden",
    situation: "U bent ziek en kunt vandaag niet naar uw werk komen. U schrijft een e-mail aan uw leidinggevende, mevrouw Van der Berg.",
    bulletPoints: [
      "Schrijf dat u ziek bent.",
      "Schrijf wat u hebt. Bedenk het zelf.",
      "Schrijf wanneer u denkt weer te komen."
    ],
    instruction: "Schrijf de e-mail. Schrijf in hele zinnen.",
    emailTo: "m.vanderberg@bedrijf.nl",
    emailSubject: "Ziekmelding",
    emailGreeting: "Beste mevrouw Van der Berg,",
    emailClosing: "Met vriendelijke groet,",
    topics: ["email", "werk", "ziekmelding"]
  },
  {
    id: "g9",
    type: "note",
    title: "Bericht voor monteur",
    situation: "Er komt een monteur om de wasmachine te repareren, maar u bent niet thuis. Uw buurvrouw laat de monteur binnen. U schrijft een briefje voor de monteur.",
    bulletPoints: [
      "Schrijf wat het probleem is met de wasmachine.",
      "Schrijf waar de wasmachine staat.",
      "Schrijf hoe de monteur u kan bereiken."
    ],
    instruction: "Schrijf in hele zinnen.",
    emailGreeting: "Beste monteur,",
    emailClosing: "Alvast bedankt,",
    topics: ["briefje", "probleem beschrijven", "instructies"]
  },
  {
    id: "g10",
    type: "freewriting",
    title: "Hobby",
    situation: "U krijgt elke week een wijkkrant. Iedereen uit de buurt mag iets voor deze krant schrijven.",
    bulletPoints: [
      "Wat is uw hobby?",
      "Hoe vaak doet u dat?",
      "Waarom vindt u het leuk?"
    ],
    instruction: "Schrijf over uw hobby. Schrijf minimaal drie zinnen op.",
    freewritingPrompt: "Dit is mijn tekst over mijn hobby:",
    topics: ["vrij schrijven", "beschrijven", "vrije tijd"]
  },
];

// Shuffle helper
function shuffleArray<T>(array: T[]): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Get a random exam of 4 questions, one from each type, to replicate the real exam structure.
 */
export function getSchrijvenExam(): SchrijvenQuestion[] {
  const emails = shuffleArray(allQuestions.filter(q => q.type === "email"));
  const forms = shuffleArray(allQuestions.filter(q => q.type === "form"));
  const freewritings = shuffleArray(allQuestions.filter(q => q.type === "freewriting"));
  const notes = shuffleArray(allQuestions.filter(q => q.type === "note"));

  const selected: SchrijvenQuestion[] = [];
  
  // Pick one of each type if available, pad with emails if needed
  if (freewritings.length > 0) selected.push(freewritings[0]);
  if (forms.length > 0) selected.push(forms[0]);
  if (emails.length > 0) selected.push(emails[0]);
  if (notes.length > 0) selected.push(notes[0]);
  else if (emails.length > 1) selected.push(emails[1]);

  // Ensure exactly 4
  while (selected.length < 4 && emails.length > selected.filter(q => q.type === "email").length) {
    const unused = emails.find(e => !selected.includes(e));
    if (unused) selected.push(unused);
    else break;
  }

  return shuffleArray(selected).slice(0, 4);
}

export const topicFeedback: Record<string, string> = {
  "email": "Oefen met het schrijven van e-mails: begin met een begroeting, leg de reden uit, en eindig met een afsluiting.",
  "formulier": "Oefen met het invullen van formulieren: let op persoonlijke gegevens en schrijf korte zinnen bij open vragen.",
  "vrij schrijven": "Oefen met vrij schrijven: gebruik eenvoudige zinnen en beantwoord alle vragen uit de opdracht.",
  "briefje": "Oefen met korte berichten schrijven: gebruik duidelijke instructies in hele zinnen.",
  "verzoek": "Oefen met het doen van verzoeken in het Nederlands: wees beleefd en duidelijk.",
  "klacht": "Oefen met het schrijven van klachten: beschrijf het probleem en schrijf wat u wilt.",
  "beschrijven": "Oefen met beschrijven: gebruik bijvoeglijke naamwoorden en geef details.",
  "werk": "Oefen met zakelijke communicatie: wees formeel en duidelijk.",
  "excuses": "Oefen met excuses aanbieden: 'het spijt mij', 'excuses voor...'",
  "reden geven": "Oefen met het geven van redenen: gebruik 'omdat', 'want', 'daarom'.",
  "mening geven": "Oefen met uw mening geven: 'ik vind...', 'volgens mij...'",
  "probleem melden": "Oefen met problemen beschrijven: wat is er mis en wat moet er gebeuren?",
  "persoonlijke gegevens": "Let goed op dat u alle gevraagde gegevens correct invult.",
  "informatie geven": "Oefen met duidelijke informatie geven in korte zinnen.",
};
