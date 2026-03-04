import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Trophy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type VocabWord } from "@/data/vocabData";

interface MatchingGameProps {
  words: VocabWord[];
  onComplete: () => void;
}

interface GameCard {
  id: string;
  text: string;
  pairId: number;
  type: "dutch" | "english";
}

const MatchingGame = ({ words, onComplete }: MatchingGameProps) => {
  const gameWords = useMemo(() => words.slice(0, 6), [words]);
  
  const [cards, setCards] = useState<GameCard[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const shuffleCards = useCallback(() => {
    const gameCards: GameCard[] = [];
    gameWords.forEach((word, i) => {
      gameCards.push({ id: `d-${i}`, text: word.dutch, pairId: i, type: "dutch" });
      gameCards.push({ id: `e-${i}`, text: word.english, pairId: i, type: "english" });
    });
    // Shuffle
    for (let i = gameCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
    }
    setCards(gameCards);
    setSelected(null);
    setMatched(new Set());
    setWrong([]);
    setScore(0);
    setAttempts(0);
  }, [gameWords]);

  useEffect(() => { shuffleCards(); }, [shuffleCards]);

  const handleSelect = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card || matched.has(card.pairId)) return;

    if (!selected) {
      setSelected(cardId);
      return;
    }

    const firstCard = cards.find(c => c.id === selected);
    if (!firstCard || firstCard.id === cardId) {
      setSelected(null);
      return;
    }

    // Must select one dutch and one english
    if (firstCard.type === card.type) {
      setSelected(cardId);
      return;
    }

    setAttempts(prev => prev + 1);

    if (firstCard.pairId === card.pairId) {
      // Match!
      const newMatched = new Set(matched);
      newMatched.add(card.pairId);
      setMatched(newMatched);
      setScore(prev => prev + 1);
      setSelected(null);
      if (newMatched.size === gameWords.length) {
        setTimeout(() => onComplete(), 800);
      }
    } else {
      // Wrong
      setWrong([selected, cardId]);
      setTimeout(() => {
        setWrong([]);
        setSelected(null);
      }, 600);
    }
  };

  const isComplete = matched.size === gameWords.length;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-4 text-sm">
        <span className="font-semibold text-foreground">
          Matched: <span className="text-success">{score}/{gameWords.length}</span>
        </span>
        <span className="text-muted-foreground">
          Attempts: {attempts}
        </span>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Match each Dutch word with its English translation
      </p>

      <div className="grid grid-cols-3 gap-2 w-full max-w-lg">
        {/* Dutch column */}
        <div className="col-span-3 grid grid-cols-2 gap-2">
          {cards.map((card) => {
            const isMatched = matched.has(card.pairId);
            const isSelected = selected === card.id;
            const isWrong = wrong.includes(card.id);

            return (
              <motion.button
                key={card.id}
                onClick={() => handleSelect(card.id)}
                disabled={isMatched}
                animate={{
                  scale: isWrong ? [1, 0.95, 1] : 1,
                  opacity: isMatched ? 0.5 : 1,
                }}
                className={`rounded-xl p-3 text-sm font-semibold text-center transition-colors border-2 ${
                  isMatched
                    ? "bg-success/10 border-success/30 text-success"
                    : isSelected
                    ? "bg-primary/10 border-primary text-primary"
                    : isWrong
                    ? "bg-destructive/10 border-destructive text-destructive"
                    : card.type === "dutch"
                    ? "bg-card border-border hover:border-primary/50 text-foreground"
                    : "bg-muted/50 border-border hover:border-secondary/50 text-foreground"
                }`}
              >
                <span className="text-[10px] font-medium text-muted-foreground block mb-0.5">
                  {card.type === "dutch" ? "🇳🇱" : "🇬🇧"}
                </span>
                {card.text}
              </motion.button>
            );
          })}
        </div>
      </div>

      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Trophy className="h-10 w-10 text-primary mx-auto mb-2" />
          <p className="font-display text-xl font-bold text-foreground">Geweldig! 🎉</p>
          <p className="text-sm text-muted-foreground">
            Completed in {attempts} attempts
          </p>
        </motion.div>
      )}

      <Button onClick={shuffleCards} variant="outline" className="rounded-xl gap-2">
        <Shuffle className="h-4 w-4" /> Shuffle & Restart
      </Button>
    </div>
  );
};

export default MatchingGame;
