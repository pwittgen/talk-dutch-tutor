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
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => navigate(`/learn/${category.id}`)}
      className="group flex flex-col items-start overflow-hidden rounded bg-card border border-sand text-left transition-all hover:border-rust/40"
    >
      {/* Solid-color emoji banner */}
      <div className="w-full h-20 flex items-center justify-center text-4xl bg-light-grey">
        {category.emoji}
      </div>

      <div className="p-5 w-full flex flex-col gap-1.5 border-l-4 border-l-transparent group-hover:border-l-rust transition-colors">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-bold text-ink leading-snug">
            {category.name}
          </h3>
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-warm-grey mt-1 shrink-0">
            {category.word_count || 0} words
          </span>
        </div>
        <p className="font-sans text-sm text-gold italic">{category.dutch_name}</p>
        <p className="font-sans text-sm text-warm-grey leading-relaxed">{category.description}</p>
        <div className="mt-3 flex gap-2">
          <span className="font-mono text-[10px] tracking-wider uppercase text-rust border border-rust/40 px-2.5 py-1">
            Flashcards
          </span>
          <span className="font-mono text-[10px] tracking-wider uppercase text-gold border border-gold/40 px-2.5 py-1">
            Match Game
          </span>
        </div>
      </div>
    </motion.button>
  );
};

export default VocabCategoryCard;
