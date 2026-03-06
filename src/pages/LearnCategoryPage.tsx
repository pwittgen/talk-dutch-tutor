import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Puzzle, Trophy } from "lucide-react";
import { useVocabThemes, useVocabWords } from "@/hooks/useVocabThemes";
import FlashcardDeck from "@/components/FlashcardDeck";
import MatchingGame from "@/components/MatchingGame";
import { Button } from "@/components/ui/button";
import type { VocabWord } from "@/data/vocabData";

type Mode = "choose" | "flashcards" | "matching" | "complete";

const LearnCategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("choose");

  const { data: themes = [] } = useVocabThemes();
  const { data: dbWords = [], isLoading } = useVocabWords(categoryId);
  const category = themes.find((t) => t.id === categoryId);

  // Map DB words to VocabWord format for existing components
  const words: VocabWord[] = dbWords.map((w) => ({
    dutch: w.dutch,
    english: w.english,
    example: w.example_sentence || undefined,
    exampleTranslation: w.part_of_speech || undefined,
  }));

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }

  if (!category) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Category not found</p>
      </div>
    );
  }

  if (mode === "complete") {
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
            Goed gedaan! 🎉
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            You completed <strong>{category.name}</strong>!
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Button onClick={() => setMode("choose")} className="rounded-xl bg-gradient-hero text-primary-foreground shadow-primary">
              Try Another Activity
            </Button>
            <Button onClick={() => navigate("/")} variant="outline" className="rounded-xl">
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => mode === "choose" ? navigate("/") : setMode("choose")}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-lg font-bold text-foreground">
              {category.emoji} {category.name}
            </h1>
            <p className="text-sm text-secondary font-medium italic">{category.dutch_name}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8">
        {mode === "choose" ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <p className="text-muted-foreground text-center mb-6">
              Choose how you want to learn these {words.length} words:
            </p>
            <button onClick={() => setMode("flashcards")}
              className="w-full rounded-2xl bg-card border border-border p-6 text-left shadow-card hover:shadow-card-hover transition-shadow flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Flashcards</h3>
                <p className="text-sm text-muted-foreground">Flip cards to learn Dutch ↔ English translations</p>
              </div>
            </button>
            <button onClick={() => setMode("matching")}
              className="w-full rounded-2xl bg-card border border-border p-6 text-left shadow-card hover:shadow-card-hover transition-shadow flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/10">
                <Puzzle className="h-7 w-7 text-secondary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Matching Game</h3>
                <p className="text-sm text-muted-foreground">Match Dutch words with their English meanings</p>
              </div>
            </button>
          </motion.div>
        ) : mode === "flashcards" ? (
          <FlashcardDeck words={words} onComplete={() => setMode("complete")} />
        ) : mode === "matching" ? (
          <MatchingGame words={words} onComplete={() => setMode("complete")} />
        ) : null}
      </div>
    </div>
  );
};

export default LearnCategoryPage;
