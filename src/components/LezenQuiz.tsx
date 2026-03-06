import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, X, BookOpen, RotateCcw, Trophy, Clock, AlertTriangle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getExamQuestions, topicSuggestions, type LezenQuestion, type LezenText } from "@/data/lezenQuizData";

interface QuizAnswer {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
  topic?: string;
}

const TOTAL_QUESTIONS = 25;
const PASS_THRESHOLD = 18;
const EXAM_DURATION_SECONDS = 65 * 60; // 65 minutes

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const LezenQuiz = ({ onBack }: { onBack: () => void }) => {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const examQuestions = useRef(getExamQuestions()).current;
  const current = examQuestions[currentIndex];

  // Timer
  useEffect(() => {
    if (!started || quizComplete) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setQuizComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, quizComplete]);

  const handleSelect = useCallback((optionIndex: number) => {
    if (showResult) return;
    setSelectedOption(optionIndex);
  }, [showResult]);

  const handleCheck = useCallback(() => {
    if (selectedOption === null) return;
    const correct = selectedOption === current.question.correctIndex;
    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== current.question.id);
      return [...filtered, { questionId: current.question.id, selectedIndex: selectedOption, correct, topic: current.question.topic }];
    });
    setShowResult(true);
  }, [selectedOption, current]);

  const handleNext = useCallback(() => {
    setSelectedOption(null);
    setShowResult(false);
    if (currentIndex < examQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setQuizComplete(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [currentIndex, examQuestions.length]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedOption(null);
    setShowResult(false);
    setQuizComplete(false);
    setTimeLeft(EXAM_DURATION_SECONDS);
    setStarted(false);
  }, []);

  const isTimeWarning = timeLeft < 300 && timeLeft > 0; // < 5 min

  // Start screen
  if (!started) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
            <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-bold text-foreground">📖 Lezen — A2 Examen</h1>
          </div>
        </div>
        <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="text-6xl">📖</div>
            <h2 className="font-display text-3xl font-black text-foreground">Lezen Examen</h2>
            <p className="text-muted-foreground">
              Je krijgt {TOTAL_QUESTIONS} vragen over verschillende teksten. Je hebt <strong>65 minuten</strong> om alle vragen te beantwoorden. Je hebt minimaal <strong>{PASS_THRESHOLD} goede antwoorden</strong> nodig om te slagen.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
              <div className="rounded-xl bg-card border border-border p-4">
                <p className="text-2xl font-black text-primary">{TOTAL_QUESTIONS}</p>
                <p className="text-xs text-muted-foreground font-medium">Vragen</p>
              </div>
              <div className="rounded-xl bg-card border border-border p-4">
                <p className="text-2xl font-black text-primary">65</p>
                <p className="text-xs text-muted-foreground font-medium">Minuten</p>
              </div>
              <div className="rounded-xl bg-card border border-border p-4">
                <p className="text-2xl font-black text-primary">{PASS_THRESHOLD}</p>
                <p className="text-xs text-muted-foreground font-medium">Nodig</p>
              </div>
            </div>
            <Button
              onClick={() => setStarted(true)}
              className="rounded-2xl bg-gradient-delft text-secondary-foreground px-10 py-6 text-lg font-bold"
            >
              Start Examen
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Results screen
  if (quizComplete) {
    const correctCount = answers.filter((a) => a.correct).length;
    const passed = correctCount >= PASS_THRESHOLD;
    const wrongAnswers = answers.filter((a) => !a.correct);
    const wrongTopics = [...new Set(wrongAnswers.map((a) => a.topic).filter(Boolean))] as string[];

    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
            <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-bold text-foreground">📖 Lezen — Resultaten</h1>
          </div>
        </div>
        <div className="mx-auto max-w-2xl px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="text-center space-y-4">
              {passed ? (
                <Trophy className="h-16 w-16 text-primary mx-auto" />
              ) : (
                <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
              )}
              <h2 className="font-display text-3xl font-black text-foreground">
                {passed ? "Geslaagd! 🎉" : "Helaas niet geslaagd"}
              </h2>
              <div className={`text-5xl font-black ${passed ? "text-primary" : "text-destructive"}`}>
                {correctCount}/{TOTAL_QUESTIONS}
              </div>
              <p className="text-muted-foreground">
                {passed
                  ? `Je hebt ${correctCount} vragen goed beantwoord. Uitstekend werk!`
                  : `Je hebt ${correctCount} vragen goed beantwoord. Je hebt ${PASS_THRESHOLD} nodig om te slagen.`}
              </p>
              <p className="text-sm text-muted-foreground">
                Tijd gebruikt: {formatTime(EXAM_DURATION_SECONDS - timeLeft)}
              </p>
            </div>

            {/* Improvement suggestions */}
            {wrongTopics.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg font-bold text-foreground">Verbeterpunten</h3>
                </div>
                <div className="space-y-3">
                  {wrongTopics.map((topic) => {
                    const suggestion = topicSuggestions[topic];
                    if (!suggestion) return null;
                    const count = wrongAnswers.filter((a) => a.topic === topic).length;
                    return (
                      <div key={topic} className="rounded-xl bg-card border border-border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-sm text-foreground">{suggestion.title}</h4>
                          <span className="text-xs font-bold text-destructive bg-destructive/10 rounded-full px-2 py-0.5">
                            {count} fout
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{suggestion.tip}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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

  // Quiz screen — text left, questions right
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-sm font-bold text-foreground">📖 Lezen</h1>
            <p className="text-xs text-muted-foreground">Vraag {currentIndex + 1} van {TOTAL_QUESTIONS}</p>
          </div>
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ${
            isTimeWarning ? "bg-destructive/10 text-destructive animate-pulse" : "bg-muted text-foreground"
          }`}>
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={false}
            animate={{ width: `${((currentIndex + (showResult ? 1 : 0)) / TOTAL_QUESTIONS) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left — Text */}
          <motion.div
            key={current.text.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:w-1/2 rounded-2xl bg-card border border-border p-5 shadow-card lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto"
          >
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                {current.text.title}
              </span>
            </div>
            <p className="text-xs text-muted-foreground italic mb-3">{current.text.situation}</p>
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
              {current.text.text}
            </div>
          </motion.div>

          {/* Right — Question */}
          <div className="lg:w-1/2">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.question.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="font-display text-base font-bold text-foreground">
                  {current.question.question}
                </h3>

                <div className="space-y-2">
                  {current.question.options.map((option, i) => {
                    const isSelected = selectedOption === i;
                    const isCorrect = i === current.question.correctIndex;
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
                      {currentIndex < examQuestions.length - 1 ? (
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
      </div>
    </div>
  );
};

export default LezenQuiz;
