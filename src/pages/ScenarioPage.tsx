import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Volume2, VolumeX, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scenarios } from "@/data/scenarios";
import ConversationView from "@/components/ConversationView";
import { useProgress, useMutePreference } from "@/hooks/useProgress";

const ScenarioPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(false);
  const { recordCompletion } = useProgress();
  const { muted, toggleMute } = useMutePreference();

  const scenario = scenarios.find((s) => s.id === id);

  if (!scenario) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-sans text-warm-grey">Scenario not found</p>
      </div>
    );
  }

  const handleComplete = () => {
    recordCompletion(scenario.id);
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded bg-rust shadow-primary">
            <Trophy className="h-10 w-10 text-off-white" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl font-black text-ink mb-2">
            Geweldig!
          </h1>
          <p className="font-sans text-lg text-warm-grey mb-1">
            You completed <strong className="text-ink">{scenario.title}</strong>.
          </p>
          <p className="font-sans text-sm text-warm-grey mb-8">
            Keep practicing to improve your Dutch conversation skills.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setCompleted(false)}
              className="w-full bg-rust text-off-white font-sans font-medium py-3 rounded text-sm hover:bg-ink transition-colors"
            >
              Practice again
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full border border-sand text-ink font-sans font-medium py-3 rounded text-sm hover:bg-light-grey transition-colors"
            >
              Back to scenarios
            </button>
            <button
              onClick={() => navigate("/progress")}
              className="w-full text-warm-grey font-sans text-sm py-3 hover:text-ink transition-colors"
            >
              View my progress
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-sand bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate("/")}
            className="flex h-10 w-10 items-center justify-center rounded text-warm-grey hover:bg-light-grey hover:text-ink transition-colors"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-lg font-bold text-ink">
              {scenario.emoji} {scenario.title}
            </h1>
            <p className="font-sans text-sm text-gold italic">{scenario.dutchTitle}</p>
          </div>
          <button
            onClick={() => navigate("/settings")}
            className="flex h-10 w-10 items-center justify-center rounded text-warm-grey hover:bg-light-grey hover:text-ink transition-colors"
            title="Settings"
          >
            <Settings className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button
            onClick={toggleMute}
            className="flex h-10 w-10 items-center justify-center rounded text-warm-grey hover:bg-light-grey hover:text-ink transition-colors"
            title={muted ? "Unmute auto-play" : "Mute auto-play"}
          >
            {muted ? <VolumeX className="h-5 w-5" strokeWidth={1.5} /> : <Volume2 className="h-5 w-5" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Conversation */}
      <div className="mx-auto max-w-2xl px-4 py-8">
        <ConversationView
          turns={scenario.conversations}
          scenarioEmoji={scenario.emoji}
          scenarioTitle={scenario.title}
          openEnded={scenario.openEnded}
          muted={muted}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
};

export default ScenarioPage;
