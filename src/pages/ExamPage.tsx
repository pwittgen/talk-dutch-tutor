import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Star, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { examQuestions } from "@/data/examQuestions";
import ExamSimulation, { type ExamResult } from "@/components/ExamSimulation";

const ExamPage = () => {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [results, setResults] = useState<ExamResult[] | null>(null);

  const handleComplete = (examResults: ExamResult[]) => {
    setResults(examResults);
  };

  const averageStars = results
    ? results.reduce((sum, r) => sum + (r.starRating || 0), 0) / results.length
    : 0;

  if (results) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
            <button
              onClick={() => navigate("/")}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-bold text-foreground">Exam Results</h1>
          </div>
        </div>

        <div className="mx-auto max-w-2xl px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="font-display text-3xl font-black text-foreground">Exam Complete!</h2>
            <div className="flex items-center justify-center gap-1 mt-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${
                    i < Math.round(averageStars)
                      ? "fill-primary text-primary"
                      : "text-muted"
                  }`}
                />
              ))}
              <span className="ml-2 text-lg font-bold text-foreground">
                {averageStars.toFixed(1)} / 5
              </span>
            </div>
            <p className="mt-2 text-muted-foreground">
              You answered {results.length} of {examQuestions.length} questions
            </p>
          </motion.div>

          <div className="space-y-3">
            {results.map((result, i) => {
              const q = examQuestions.find(eq => eq.id === result.questionId);
              return (
                <div key={i} className="rounded-xl bg-card border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-muted-foreground">Q{i + 1}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className={`h-3.5 w-3.5 ${
                            j < (result.starRating || 0)
                              ? "fill-primary text-primary"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-foreground font-medium">{q?.dutchQuestion}</p>
                  <p className="text-xs text-muted-foreground mt-1">Your answer: {result.userAnswer}</p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 mt-8">
            <Button
              onClick={() => { setResults(null); setStarted(true); }}
              className="rounded-xl bg-gradient-delft text-secondary-foreground gap-2"
            >
              <RotateCcw className="h-4 w-4" /> Try Again
            </Button>
            <Button onClick={() => navigate("/")} variant="outline" className="rounded-xl">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
            <button
              onClick={() => navigate("/")}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-bold text-foreground">🎓 Speaking Exam Practice</h1>
          </div>
        </div>

        <div className="mx-auto max-w-2xl px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="text-6xl mb-2">🎓</div>
            <h2 className="font-display text-3xl font-black text-foreground">
              Inburgering Speaking Exam
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Practice the real exam format: 12 photo-based questions. Look at each photo, 
              listen to the question, and answer in Dutch. No dialogue — just like the real test.
            </p>

            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto text-center">
              <div className="rounded-xl bg-card border border-border p-4">
                <p className="font-display text-2xl font-black text-primary">12</p>
                <p className="text-xs text-muted-foreground font-medium">Questions</p>
              </div>
              <div className="rounded-xl bg-card border border-border p-4">
                <p className="font-display text-2xl font-black text-secondary">📸</p>
                <p className="text-xs text-muted-foreground font-medium">Photo-based</p>
              </div>
              <div className="rounded-xl bg-card border border-border p-4">
                <p className="font-display text-2xl font-black text-accent">🗣️</p>
                <p className="text-xs text-muted-foreground font-medium">Speaking</p>
              </div>
            </div>

            <div className="rounded-xl bg-muted/50 p-4 max-w-md mx-auto text-left">
              <p className="text-sm font-bold text-foreground mb-2">Exam tips:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Describe what you see in the photo</li>
                <li>• Use complete sentences</li>
                <li>• Share your opinion when asked</li>
                <li>• Speak clearly and at a normal pace</li>
              </ul>
            </div>

            <Button
              onClick={() => setStarted(true)}
              className="rounded-2xl h-14 px-10 text-lg font-bold bg-gradient-delft text-secondary-foreground shadow-card"
            >
              Start Exam Practice
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => { setStarted(false); }}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-bold text-foreground">
            🎓 Speaking Exam
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <ExamSimulation questions={examQuestions} onComplete={handleComplete} />
      </div>
    </div>
  );
};

export default ExamPage;
