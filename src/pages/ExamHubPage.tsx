import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mic, BookOpen, Headphones, PenLine, Lock } from "lucide-react";
import LezenQuiz from "@/components/LezenQuiz";

type ExamSection = "hub" | "lezen";

const examCategories = [
  {
    id: "lezen" as const,
    title: "Lezen",
    dutchTitle: "Leesvaardigheid",
    emoji: "📖",
    icon: BookOpen,
    description: "Lees teksten en beantwoord meerkeuzevragen",
    available: true,
    stats: { questions: 25, texts: 13 },
  },
  {
    id: "spreken" as const,
    title: "Spreken",
    dutchTitle: "Spreekvaardigheid",
    emoji: "🗣️",
    icon: Mic,
    description: "Beantwoord vragen over plaatjes en video's",
    available: true,
    route: "/exam",
    stats: { questions: 16, time: "35 min" },
  },
  {
    id: "luisteren" as const,
    title: "Luisteren",
    dutchTitle: "Luistervaardigheid",
    emoji: "👂",
    icon: Headphones,
    description: "Luister naar gesprekken en beantwoord vragen",
    available: false,
    stats: { questions: 25 },
  },
  {
    id: "schrijven" as const,
    title: "Schrijven",
    dutchTitle: "Schrijfvaardigheid",
    emoji: "✍️",
    icon: PenLine,
    description: "Schrijf korte teksten en berichten",
    available: false,
    stats: { questions: 4 },
  },
];

const ExamHubPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<ExamSection>("hub");

  if (activeSection === "lezen") {
    return <LezenQuiz onBack={() => setActiveSection("hub")} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate("/")}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-bold text-foreground">🎓 A2 Examen Oefenen</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-5xl mb-3">🎓</div>
          <h2 className="font-display text-2xl font-black text-foreground">
            Inburgering A2 Examen
          </h2>
          <p className="mt-2 text-muted-foreground text-sm max-w-md mx-auto">
            Oefen alle onderdelen van het inburgeringsexamen. Kies een categorie om te beginnen.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          {examCategories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => {
                  if (!cat.available) return;
                  if (cat.route) {
                    navigate(cat.route);
                  } else {
                    setActiveSection(cat.id as ExamSection);
                  }
                }}
                disabled={!cat.available}
                className={`relative text-left rounded-2xl border-2 p-6 transition-all ${
                  cat.available
                    ? "border-border bg-card shadow-card hover:shadow-card-hover hover:border-primary/30 cursor-pointer"
                    : "border-border/50 bg-muted/30 opacity-60 cursor-not-allowed"
                }`}
              >
                {!cat.available && (
                  <div className="absolute top-3 right-3">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                    {cat.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg font-bold text-foreground">{cat.title}</h3>
                    <p className="text-xs text-secondary font-medium italic">{cat.dutchTitle}</p>
                    <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>
                    <div className="flex gap-3 mt-3">
                      {"questions" in cat.stats && (
                        <span className="text-xs font-bold text-primary">
                          {cat.stats.questions} vragen
                        </span>
                      )}
                      {"texts" in cat.stats && (
                        <span className="text-xs text-muted-foreground">
                          {cat.stats.texts} teksten
                        </span>
                      )}
                      {"time" in cat.stats && (
                        <span className="text-xs text-muted-foreground">
                          {cat.stats.time}
                        </span>
                      )}
                    </div>
                    {!cat.available && (
                      <span className="text-xs text-muted-foreground mt-2 inline-block">
                        Binnenkort beschikbaar
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExamHubPage;
