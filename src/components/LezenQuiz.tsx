import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, X, BookOpen, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lezenTexts, type LezenQuestion } from "@/data/lezenQuizData";

interface QuizAnswer {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
}

const LezenQuiz = ({ onBack }: { onBack: () => void }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  const currentText = lezenTexts[currentTextIndex];
  const currentQuestion = currentText.questions[currentQuestionIndex];
  const totalQuestions = lezenTexts.reduce((sum, t) => sum + t.questions.length, 0);
  const globalQuestionIndex = lezenTexts.slice(0, currentTextIndex).reduce((sum, t) => sum + t.questions.length, 0) + currentQuestionIndex;

  const existingAnswer = answers.find(a => a.questionId === currentQuestion.id);

  const handleSelect = useCallback((optionIndex: number) => {
    if (showResult) return;
    setSelectedOption(optionIndex);
  }, [showResult]);

  const handleCheck = useCallback(() => {
    if (selectedOption === null) return;
    const correct = selectedOption === currentQuestion.correctIndex;
    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== currentQuestion.id);
      return [...filtered, { questionId: currentQuestion.id, selectedIndex: selectedOption, correct }];
    });
    setShowResult(true);
  }, [selectedOption, currentQuestion]);

  const handleNext = useCallback(() => {
    setSelectedOption(null);
    setShowResult(false);

    if (currentQuestionIndex < currentText.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentTextIndex < lezenTexts.length - 1) {
      setCurrentTextIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      setQuizComplete(true);
    }
  }, [currentQuestionIndex, currentText.questions.length, currentTextIndex]);

  const handleRestart = useCallback(() => {
    setCurrentTextIndex(0);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedOption(null);
    setShowResult(false);
    setQuizComplete(false);
  }, []);

  if (quizComplete) {
    const correctCount = answers.filter(a => a.correct).length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
            <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-bold text-foreground">📖 Lezen — Resultaten</h1>
          </div>
        </div>
        <div className="mx-auto max-w-2xl px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
            <Trophy className="h-16 w-16 text-primary mx-auto" />
            <h2 className="font-display text-3xl font-black text-foreground">Quiz klaar!</h2>
            <div className="text-5xl font-black text-primary">{percentage}%</div>
            <p className="text-muted-foreground">{correctCount} van {totalQuestions} vragen goed beantwoord</p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <Button onClick={handleRestart} className="rounded-xl bg-gradient-delft text-secondary-foreground gap-2">
                <RotateCcw className="h-4 w-4" /> Opnieuw proberen
              </Button>
              <Button onClick={onBack} variant="outline" className="rounded-xl">Terug</Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-sm font-bold text-foreground">📖 Lezen</h1>
            <p className="text-xs text-muted-foreground">Vraag {globalQuestionIndex + 1} van {totalQuestions}</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={false}
            animate={{ width: `${((globalQuestionIndex + (showResult ? 1 : 0)) / totalQuestions) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        {/* Text card */}
        <motion.div
          key={currentText.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card border border-border p-5 shadow-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Tekst {currentTextIndex + 1} van {lezenTexts.length}
            </span>
          </div>
          <p className="text-xs text-muted-foreground italic mb-3">{currentText.situation}</p>
          <div className="text-sm text-foreground leading-relaxed whitespace-pre-line max-h-64 overflow-y-auto pr-2">
            {currentText.text}
          </div>
        </motion.div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h3 className="font-display text-base font-bold text-foreground">
              {currentQuestion.question}
            </h3>

            <div className="space-y-2">
              {currentQuestion.options.map((option, i) => {
                const isSelected = selectedOption === i;
                const isCorrect = i === currentQuestion.correctIndex;
                let borderClass = "border-border";
                let bgClass = "bg-card";

                if (showResult) {
                  if (isCorrect) {
                    borderClass = "border-green-500";
                    bgClass = "bg-green-500/10";
                  } else if (isSelected && !isCorrect) {
                    borderClass = "border-destructive";
                    bgClass = "bg-destructive/10";
                  }
                } else if (isSelected) {
                  borderClass = "border-primary";
                  bgClass = "bg-primary/5";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={showResult}
                    className={`w-full text-left rounded-xl border-2 ${borderClass} ${bgClass} p-4 transition-all ${
                      !showResult ? "hover:border-primary/50 cursor-pointer" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-bold text-foreground">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm text-foreground">{option}</span>
                      {showResult && isCorrect && <Check className="h-5 w-5 text-green-500 ml-auto shrink-0" />}
                      {showResult && isSelected && !isCorrect && <X className="h-5 w-5 text-destructive ml-auto shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2">
              {!showResult ? (
                <Button
                  onClick={handleCheck}
                  disabled={selectedOption === null}
                  className="flex-1 rounded-xl bg-gradient-delft text-secondary-foreground"
                >
                  Controleer antwoord
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="flex-1 rounded-xl bg-gradient-delft text-secondary-foreground gap-2"
                >
                  {globalQuestionIndex < totalQuestions - 1 ? (
                    <>Volgende <ArrowRight className="h-4 w-4" /></>
                  ) : (
                    "Bekijk resultaten"
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LezenQuiz;
