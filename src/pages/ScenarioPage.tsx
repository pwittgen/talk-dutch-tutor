import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scenarios } from "@/data/scenarios";
import ConversationView from "@/components/ConversationView";

const ScenarioPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(false);

  const scenario = scenarios.find((s) => s.id === id);

  if (!scenario) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Scenario not found</p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-hero shadow-primary">
            <Trophy className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-black text-foreground">
            Geweldig! 🎉
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            You completed <strong>{scenario.title}</strong>!
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep practicing to improve your Dutch conversation skills.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Button
              onClick={() => {
                setCompleted(false);
              }}
              className="rounded-xl bg-gradient-hero text-primary-foreground shadow-primary"
            >
              Practice Again
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="rounded-xl"
            >
              Back to Scenarios
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

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
              {scenario.emoji} {scenario.title}
            </h1>
            <p className="text-sm text-secondary font-medium italic">{scenario.dutchTitle}</p>
          </div>
        </div>
      </div>

      {/* Conversation */}
      <div className="mx-auto max-w-2xl px-4 py-8">
        <ConversationView
          turns={scenario.conversations}
          scenarioEmoji={scenario.emoji}
          scenarioTitle={scenario.title}
          openEnded={scenario.openEnded}
          onComplete={() => setCompleted(true)}
        />
      </div>
    </div>
  );
};

export default ScenarioPage;
