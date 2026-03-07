import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { type Scenario } from "@/data/scenarios";

interface ScenarioCardProps {
  scenario: Scenario;
  index: number;
}

const difficultyLabel = {
  beginner: "A1",
  easy: "A1–A2",
  medium: "A2",
};

const ScenarioCard = ({ scenario, index }: ScenarioCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/scenario/${scenario.id}`)}
      className="group flex flex-col items-start overflow-hidden rounded bg-card border border-border text-left shadow-card transition-shadow hover:shadow-card-hover"
    >
      {/* Scenario image */}
      <div className="relative w-full h-36 overflow-hidden bg-muted">
        <img
          src={scenario.scenarioImage}
          alt={scenario.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="p-5 flex flex-col gap-1.5 w-full">
        {/* Level label */}
        <span className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground font-sans">
          {scenario.emoji} {difficultyLabel[scenario.difficulty]}
        </span>

        <h3 className="font-display text-lg font-semibold text-foreground leading-snug">
          {scenario.title}
        </h3>
        <p className="text-sm text-secondary italic font-sans">
          {scenario.dutchTitle}
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed font-sans">
          {scenario.description}
        </p>

        {/* CTA */}
        <div className="mt-3 text-sm font-medium text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100 font-sans">
          Begin →
        </div>
      </div>
    </motion.button>
  );
};

export default ScenarioCard;
