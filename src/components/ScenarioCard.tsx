import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { type Scenario } from "@/data/scenarios";

interface ScenarioCardProps {
  scenario: Scenario;
  index: number;
}

const colorMap = {
  orange: "bg-gradient-hero",
  blue: "bg-gradient-delft",
  teal: "bg-gradient-success",
};

const difficultyLabel = {
  beginner: "A1",
  easy: "A1-A2",
  medium: "A2",
};

const ScenarioCard = ({ scenario, index }: ScenarioCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/scenario/${scenario.id}`)}
      className="group relative flex flex-col items-start overflow-hidden rounded-2xl bg-card text-left shadow-card transition-shadow hover:shadow-card-hover"
    >
      {/* Scenario image */}
      <div className="relative w-full h-32 overflow-hidden">
        <img
          src={scenario.scenarioImage}
          alt={scenario.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 flex h-10 w-10 items-center justify-center rounded-xl bg-card/90 text-xl backdrop-blur-sm">
          {scenario.emoji}
        </div>
      </div>

      <div className="p-5">

      {/* Difficulty badge */}
      <span
        className={`mb-2 inline-block rounded-full px-3 py-0.5 text-xs font-bold text-primary-foreground ${colorMap[scenario.color]}`}
      >
        {difficultyLabel[scenario.difficulty]}
      </span>

      <h3 className="font-display text-lg font-bold text-foreground">
        {scenario.title}
      </h3>
      <p className="text-sm font-medium text-secondary italic">
        {scenario.dutchTitle}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {scenario.description}
      </p>

      {/* Arrow indicator */}
      <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Start practice →
      </div>
      </div>
    </motion.button>
  );
};

export default ScenarioCard;
