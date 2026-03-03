import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Star, RotateCcw, Target, Flame, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/useProgress";
import { scenarios } from "@/data/scenarios";

const motivationalTips = [
  { emoji: "🌟", text: "Consistency beats perfection — even 10 minutes a day makes a huge difference!" },
  { emoji: "🗣️", text: "Don't be afraid to make mistakes. Every error is a step toward fluency!" },
  { emoji: "🎧", text: "Listen to Dutch podcasts or music during your commute for passive learning." },
  { emoji: "📝", text: "Write down 3 new Dutch words every day and use them in sentences." },
  { emoji: "🤝", text: "Find a taalmaatje (language buddy) to practice with in real life!" },
  { emoji: "📺", text: "Watch Dutch TV shows with Dutch subtitles — try 'Heel Holland Bakt'!" },
  { emoji: "💪", text: "The inburgering exam is achievable — thousands pass it every year. You can too!" },
  { emoji: "🧠", text: "Repeat exercises you found difficult. Repetition is the mother of all learning." },
];

const ProgressPage = () => {
  const navigate = useNavigate();
  const { progress } = useProgress();

  const completedScenarios = Object.entries(progress.scenarios).filter(
    ([, p]) => p.completedCount > 0
  );

  const mostRepeated = [...completedScenarios]
    .sort(([, a], [, b]) => b.completedCount - a.completedCount)
    .slice(0, 5);

  const uniqueCompleted = completedScenarios.length;
  const totalExercises = scenarios.length;

  // Pick 2 random tips
  const tipIndices = [
    Math.floor(Math.random() * motivationalTips.length),
    Math.floor(Math.random() * motivationalTips.length),
  ];
  // Ensure different
  if (tipIndices[0] === tipIndices[1]) tipIndices[1] = (tipIndices[1] + 1) % motivationalTips.length;
  const tips = tipIndices.map((i) => motivationalTips[i]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate("/")}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">
              📊 My Progress
            </h1>
            <p className="text-sm text-secondary font-medium italic">Mijn voortgang</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-card p-4 text-center shadow-card"
          >
            <Trophy className="mx-auto h-8 w-8 text-primary mb-1" />
            <p className="font-display text-2xl font-black text-foreground">{progress.totalCompleted}</p>
            <p className="text-xs text-muted-foreground">Total completions</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-card p-4 text-center shadow-card"
          >
            <Target className="mx-auto h-8 w-8 text-secondary mb-1" />
            <p className="font-display text-2xl font-black text-foreground">{uniqueCompleted}/{totalExercises}</p>
            <p className="text-xs text-muted-foreground">Scenarios tried</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-card p-4 text-center shadow-card"
          >
            <Flame className="mx-auto h-8 w-8 text-accent mb-1" />
            <p className="font-display text-2xl font-black text-foreground">
              {mostRepeated.length > 0 ? mostRepeated[0][1].completedCount : 0}
            </p>
            <p className="text-xs text-muted-foreground">Most repeats</p>
          </motion.div>
        </div>

        {/* Most repeated */}
        {mostRepeated.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-primary" />
              Most Practiced
            </h2>
            <div className="space-y-2">
              {mostRepeated.map(([id, p], i) => {
                const scenario = scenarios.find((s) => s.id === id);
                if (!scenario) return null;
                return (
                  <button
                    key={id}
                    onClick={() => navigate(`/scenario/${id}`)}
                    className="flex w-full items-center gap-3 rounded-xl bg-card p-3 shadow-card hover:shadow-card-hover transition-shadow text-left"
                  >
                    <span className="text-2xl">{scenario.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-foreground text-sm">{scenario.title}</p>
                      <p className="text-xs text-muted-foreground italic">{scenario.dutchTitle}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold text-primary">
                      <RotateCcw className="h-3 w-3" />
                      {p.completedCount}x
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* All scenarios progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Star className="h-5 w-5 text-secondary" />
            All Exercises
          </h2>
          <div className="space-y-2">
            {scenarios.map((scenario) => {
              const sp = progress.scenarios[scenario.id];
              const count = sp?.completedCount || 0;
              return (
                <button
                  key={scenario.id}
                  onClick={() => navigate(`/scenario/${scenario.id}`)}
                  className="flex w-full items-center gap-3 rounded-xl bg-card p-3 shadow-card hover:shadow-card-hover transition-shadow text-left"
                >
                  <span className="text-xl">{scenario.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-foreground text-sm">{scenario.title}</p>
                  </div>
                  {count > 0 ? (
                    <span className="rounded-full bg-gradient-success px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
                      ✓ {count}x
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      Not started
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Motivational tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Heart className="h-5 w-5 text-destructive" />
            Tips & Motivation
          </h2>
          <div className="space-y-3">
            {tips.map((tip, i) => (
              <div key={i} className="rounded-xl bg-card p-4 shadow-card border border-border">
                <p className="text-foreground">
                  <span className="text-lg mr-2">{tip.emoji}</span>
                  {tip.text}
                </p>
              </div>
            ))}
            <div className="rounded-xl bg-gradient-hero p-4 shadow-primary">
              <p className="font-display font-bold text-primary-foreground text-center">
                🌷 Je kunt het! — You can do it! 🌷
              </p>
              <p className="text-primary-foreground/90 text-sm text-center mt-1">
                Every conversation you practice brings you closer to speaking Dutch with confidence.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressPage;
