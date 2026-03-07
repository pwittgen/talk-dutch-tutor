import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { type DbVocabTheme } from "@/hooks/useVocabThemes";

interface VocabCategoryCardProps {
  category: DbVocabTheme;
  index: number;
}

const VocabCategoryCard = ({ category, index }: VocabCategoryCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/learn/${category.id}`)}
      className="group flex flex-col items-start overflow-hidden rounded bg-card border border-border text-left shadow-card transition-shadow hover:shadow-card-hover"
    >
      {/* Solid-color emoji banner */}
      <div className="w-full h-20 flex items-center justify-center text-4xl bg-muted">
        {category.emoji}
      </div>

      <div className="p-5 w-full flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-foreground leading-snug">
            {category.name}
          </h3>
          <span className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground font-sans mt-1 shrink-0">
            {category.word_count || 0} words
          </span>
        </div>
        <p className="text-sm text-secondary italic font-sans">{category.dutch_name}</p>
        <p className="text-sm text-muted-foreground leading-relaxed font-sans">{category.description}</p>
        <div className="mt-3 flex gap-2">
          <span className="text-[10px] tracking-wider uppercase text-primary border border-primary/40 px-2.5 py-1 font-sans">
            Flashcards
          </span>
          <span className="text-[10px] tracking-wider uppercase text-secondary border border-secondary/40 px-2.5 py-1 font-sans">
            Match Game
          </span>
        </div>
      </div>
    </motion.button>
  );
};

export default VocabCategoryCard;
