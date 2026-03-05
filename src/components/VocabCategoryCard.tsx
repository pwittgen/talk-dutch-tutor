import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { type DbVocabTheme } from "@/hooks/useVocabThemes";

interface VocabCategoryCardProps {
  category: DbVocabTheme;
  index: number;
}

const colorMap: Record<string, string> = {
  orange: "bg-gradient-hero",
  blue: "bg-gradient-delft",
  teal: "bg-gradient-success",
};

const VocabCategoryCard = ({ category, index }: VocabCategoryCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/learn/${category.id}`)}
      className="group relative flex flex-col items-start overflow-hidden rounded-2xl bg-card text-left shadow-card transition-shadow hover:shadow-card-hover"
    >
      <div className={`w-full h-24 flex items-center justify-center text-5xl ${colorMap[category.color] || colorMap.blue}`}>
        {category.emoji}
      </div>
      <div className="p-5 w-full">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display text-lg font-bold text-foreground">
            {category.name}
          </h3>
          <span className="text-xs font-bold text-muted-foreground bg-muted rounded-full px-2 py-0.5">
            {category.word_count || 0} words
          </span>
        </div>
        <p className="text-sm font-medium text-secondary italic">{category.dutch_name}</p>
        <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
        <div className="mt-3 flex gap-2">
          <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-1">
            Flashcards
          </span>
          <span className="text-xs font-semibold text-secondary bg-secondary/10 rounded-full px-2.5 py-1">
            Match Game
          </span>
        </div>
      </div>
    </motion.button>
  );
};

export default VocabCategoryCard;
