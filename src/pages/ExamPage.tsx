import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Star, RotateCcw, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { examQuestions, type ExamQuestion } from "@/data/examQuestions";
import ExamSimulation, { type ExamResult } from "@/components/ExamSimulation";

// Pick one of 4 variation sets (A=1-16, B=17-32, C=33-48, D=49-64) at random.
// Within each set there are exactly 4 questions per opgave → 16 total.
const pickSessionQuestions = (): ExamQuestion[] => {
  const setIndex = Math.floor(Math.random() * 4); // 0–3
  const startId = setIndex * 16 + 1;              // 1 | 17 | 33 | 49
  return examQuestions
    .filter((q) => q.id >= startId && q.id < startId + 16)
    .map((q) => {
      // For video questions, use the thumbnail prompt as a regular photo
      // so ExamSimulation can treat every question type uniformly.
      if (q.opgaveType === "video" && q.videoThumbnailPrompt) {
        return {
          ...q,
          imagePrompts: [q.videoThumbnailPrompt],
          placeholderDescriptions: ["Scèneafbeelding"],
        };
      }
      return q;
    });
};

const opgaveDetails = [
  {
    label: "Opgave 1 — Plaatje beschrijven",
    description: "U ziet een foto van een situatie. Beschrijf wat u ziet in 1–2 zinnen.",
    questions: 4,
    tip: "Gebruik: 'Ik zie...' of 'Op de foto zie ik...'",
  },
  {
    label: "Opgave 2 — Situatievraag bij 1 foto",
    description: "U ziet één foto. Er is een situatie en een vraag. Geef antwoord op de vraag.",
    questions: 4,
    tip: "Beschrijf kort de foto en geef dan antwoord.",
  },
  {
    label: "Opgave 3 — Keuze bij 2 foto's",
    description: "U ziet twee foto's. Kies één en leg uit waarom u dat kiest.",
    questions: 4,
    tip: "Zeg: 'Ik kies plaatje 1/2 omdat...'",
  },
  {
    label: "Opgave 4 — Vertel over 3 foto's",
    description: "U ziet drie foto's. Vertel iets over álle drie en geef uw mening.",
    questions: 4,
    tip: "Begin met 'Op plaatje 1 zie ik...' voor elk plaatje.",
  },
];

const ExamPage = () => {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [results, setResults] = useState<ExamResult[] | null>(null);

  // Questions are fixed for the session — memoised so they don't reshuffle on re-render
  const sessionQuestions = useMemo(() => pickSessionQuestions(), []);

  const handleComplete = (examResults: ExamResult[]) => setResults(examResults);

  const averageStars = results
    ? results.reduce((sum, r) => sum + (r.starRating ?? 0), 0) / results.length
    : 0;

  const answeredCount = results?.filter((r) => r.userAnswer !== "(not answered)").length ?? 0;

  // ── Results screen ──────────────────────────────────────────────────────────
  if (results) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-bold text-foreground">Resultaten</h1>
          </div>
        </div>

        <div className="mx-auto max-w-2xl px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Trophy className="h-14 w-14 text-primary mx-auto mb-4" />
            <h2 className="font-display text-3xl font-black text-foreground">Oefenexamen klaar!</h2>
            <div className="flex items-center justify-center gap-1 mt-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${i < Math.round(averageStars) ? "fill-primary text-primary" : "text-muted"}`}
                />
              ))}
              <span className="ml-2 text-lg font-bold text-foreground">{averageStars.toFixed(1)} / 5</span>
            </div>
            <p className="mt-2 text-muted-foreground">
              {answeredCount} van {sessionQuestions.length} vragen beantwoord
            </p>
          </motion.div>

          <div className="space-y-3">
            {results.map((result, i) => {
              const q = sessionQuestions.find((eq) => eq.id === result.questionId);
              return (
                <div key={i} className="rounded-xl bg-card border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-muted-foreground">
                      Opgave {q?.opgave} — Vraag {i + 1}
                    </span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className={`h-3.5 w-3.5 ${j < (result.starRating ?? 0) ? "fill-primary text-primary" : "text-muted"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-foreground font-medium">{q?.dutchQuestion}</p>
                  <p className="text-xs text-muted-foreground mt-1">Uw antwoord: {result.userAnswer}</p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 mt-8">
            <Button
              onClick={() => { setResults(null); setStarted(true); }}
              className="rounded-xl bg-gradient-delft text-secondary-foreground gap-2"
            >
              <RotateCcw className="h-4 w-4" /> Opnieuw proberen
            </Button>
            <Button onClick={() => navigate(-1)} variant="outline" className="rounded-xl">
              Terug naar examenoverzicht
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Active exam ─────────────────────────────────────────────────────────────
  if (started) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
            <button
              onClick={() => setStarted(false)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-bold text-foreground">🎓 A2 Spreken Oefenexamen</h1>
          </div>
        </div>
        <div className="mx-auto max-w-2xl px-4 py-6">
          <ExamSimulation questions={sessionQuestions} onComplete={handleComplete} />
        </div>
      </div>
    );
  }

  // ── Detail / start screen ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-bold text-foreground">🗣️ Spreken</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-8">
            <h2 className="font-display text-3xl font-black text-foreground">A2 Spreken Oefenexamen</h2>
            <p className="mt-2 text-muted-foreground leading-relaxed">
              Oefen het DUO A2 Spreekvaardigheidsexamen. Alle antwoorden zijn gesproken — net als bij het echte examen.
            </p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: "🗂️", value: "16", label: "Vragen" },
              { icon: "📋", value: "4", label: "Onderdelen" },
              { icon: "⏱️", value: "±35 min", label: "Duur" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-card border border-border p-4 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <p className="font-display text-lg font-black text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Opgave breakdown */}
          <div className="space-y-3 mb-8">
            <h3 className="font-display text-base font-bold text-foreground">Inhoud per onderdeel</h3>
            {opgaveDetails.map((o, i) => (
              <div key={i} className="rounded-xl bg-card border border-border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-display text-sm font-black text-primary">{o.label}</p>
                    <p className="text-sm text-muted-foreground mt-1">{o.description}</p>
                    <p className="text-xs text-foreground/60 mt-1.5 italic">💡 {o.tip}</p>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {o.questions}×
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Passing requirements */}
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <h3 className="font-display text-sm font-black text-primary">Slagingsnorm</h3>
            </div>
            <ul className="text-sm text-foreground space-y-1.5">
              <li className="flex items-start gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                Antwoord in begrijpelijk Nederlands — fouten zijn toegestaan
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                Beantwoord minstens 10 van de 16 vragen voldoende
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                Elke opgave telt mee — zorg voor antwoorden in alle 4 onderdelen
              </li>
            </ul>
          </div>

          {/* Tips */}
          <div className="rounded-xl bg-muted/50 p-4 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-display text-sm font-bold text-foreground">Tips voor het examen</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>• Geef korte antwoorden — 1 à 2 zinnen is genoeg</li>
              <li>• Beantwoord de vraag direct; u hoeft niet alles te beschrijven</li>
              <li>• Gebruik simpele woorden die u zeker kent</li>
              <li>• U kunt heen en weer navigeren tussen vragen</li>
              <li>• Geen antwoord? Zeg iets simpels — leeg laten kost meer punten</li>
            </ul>
          </div>

          <Button
            onClick={() => setStarted(true)}
            className="w-full rounded-2xl h-14 text-lg font-bold bg-gradient-delft text-secondary-foreground shadow-card"
          >
            Start oefenexamen
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ExamPage;
