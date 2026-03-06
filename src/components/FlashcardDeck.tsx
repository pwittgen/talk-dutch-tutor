import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, ArrowLeft, ArrowRight, Volume2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type VocabWord } from "@/data/vocabData";

interface FlashcardDeckProps {
  words: VocabWord[];
  onComplete: () => void;
}

const FlashcardDeck = ({ words, onComplete }: FlashcardDeckProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [direction, setDirection] = useState(0);

  const word = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  const handleFlip = () => setFlipped(!flipped);

  const handleNext = useCallback((isKnown: boolean) => {
    if (isKnown) {
      setKnown(prev => new Set(prev).add(currentIndex));
    }
    setFlipped(false);
    setDirection(1);
    if (currentIndex + 1 >= words.length) {
      onComplete();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, words.length, onComplete]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setFlipped(false);
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const speakWord = useCallback(() => {
    const utterance = new SpeechSynthesisUtterance(word.dutch);
    utterance.lang = "nl-NL";
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  }, [word]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Progress */}
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
          <span>{currentIndex + 1} / {words.length}</span>
          <span className="text-success font-semibold">{known.size} known ✓</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full bg-gradient-hero rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Card */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          initial={{ opacity: 0, x: direction * 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -100 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md"
        >
          <button
            onClick={handleFlip}
            className="w-full min-h-[280px] rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-shadow p-8 flex flex-col items-center justify-center text-center cursor-pointer border border-border"
          >
            <motion.div
              initial={false}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.4 }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative w-full"
            >
              {!flipped ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-3 font-medium">Dutch 🇳🇱</p>
                  <h2 className="font-display text-3xl font-black text-foreground mb-4">{word.dutch}</h2>
                  <button
                    onClick={(e) => { e.stopPropagation(); speakWord(); }}
                    className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Volume2 className="h-5 w-5" />
                  </button>
                  <p className="mt-4 text-sm text-muted-foreground">Tap to reveal</p>
                </div>
              ) : (
                <div style={{ transform: "rotateY(180deg)" }}>
                  <p className="text-sm text-muted-foreground mb-3 font-medium">English 🇬🇧</p>
                  <h2 className="font-display text-3xl font-black text-foreground mb-2">{word.english}</h2>
                  <p className="text-lg font-semibold text-secondary italic">{word.dutch}</p>
                  {word.example && (
                    <div className="mt-4 rounded-xl bg-muted/50 p-3">
                      <p className="text-sm text-muted-foreground font-medium">Example:</p>
                      <p className="text-sm font-semibold text-foreground mt-1">{word.example}</p>
                      {word.exampleTranslation && (
                        <p className="text-xs text-muted-foreground mt-1 italic">{word.exampleTranslation}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => handleNext(false)}
          variant="outline"
          className="rounded-xl gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          <X className="h-4 w-4" /> Still learning
        </Button>
        <Button
          onClick={() => handleNext(true)}
          className="rounded-xl gap-2 bg-gradient-success text-success-foreground"
        >
          <Check className="h-4 w-4" /> I know this
        </Button>
      </div>
    </div>
  );
};

export default FlashcardDeck;
