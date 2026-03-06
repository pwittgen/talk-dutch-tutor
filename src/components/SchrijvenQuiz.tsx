import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, PenLine, RotateCcw, Trophy, Clock, AlertTriangle, Lightbulb, CheckCircle2, XCircle, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { getSchrijvenExam, topicFeedback, type SchrijvenQuestion } from "@/data/schrijvenQuizData";

const EXAM_DURATION_SECONDS = 30 * 60; // 30 minutes for schrijven

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

interface QuestionAnswer {
  questionTitle: string;
  questionType: string;
  situation: string;
  bulletPoints: string[];
  userAnswer: string;
  topics: string[];
}

interface QuestionFeedbackItem {
  questionNumber: number;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  correctedVersion: string;
}

interface EvalResult {
  questionFeedback: QuestionFeedbackItem[];
  totalScore: number;
  passed: boolean;
  overallFeedback: string;
  topStrengths: string[];
  topImprovements: string[];
}

const SchrijvenQuiz = ({ onBack }: { onBack: () => void }) => {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS);
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const examQuestions = useRef(getSchrijvenExam()).current;

  // Per-question answer state
  const [formAnswers, setFormAnswers] = useState<Record<number, Record<string, string>>>({});
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});

  const current = examQuestions[currentIndex];

  // Timer
  useEffect(() => {
    if (!started || quizComplete) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmitAll();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, quizComplete]);

  const getAnswerText = useCallback((idx: number): string => {
    const q = examQuestions[idx];
    if (q.type === "form") {
      const fa = formAnswers[idx] || {};
      return Object.entries(fa).map(([k, v]) => `${k}: ${v}`).join("\n");
    }
    return textAnswers[idx] || "";
  }, [formAnswers, textAnswers, examQuestions]);

  const handleSubmitAll = useCallback(async () => {
    setQuizComplete(true);
    if (timerRef.current) clearInterval(timerRef.current);
    setEvaluating(true);
    setEvalError(null);

    const answers: QuestionAnswer[] = examQuestions.map((q, i) => ({
      questionTitle: q.title,
      questionType: q.type,
      situation: q.situation,
      bulletPoints: q.bulletPoints,
      userAnswer: getAnswerText(i),
      topics: q.topics,
    }));

    try {
      const { data, error } = await supabase.functions.invoke("evaluate-schrijven", {
        body: { answers },
      });
      if (error) throw error;
      setEvalResult(data as EvalResult);
    } catch (e: any) {
      console.error("Evaluation error:", e);
      setEvalError("Could not evaluate your answers. Please try again.");
    } finally {
      setEvaluating(false);
    }
  }, [examQuestions, getAnswerText]);

  const handleNext = useCallback(() => {
    if (currentIndex < examQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, examQuestions.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setQuizComplete(false);
    setEvalResult(null);
    setEvalError(null);
    setFormAnswers({});
    setTextAnswers({});
    setTimeLeft(EXAM_DURATION_SECONDS);
    setStarted(false);
  }, []);

  const updateFormField = (key: string, value: string) => {
    setFormAnswers(prev => ({
      ...prev,
      [currentIndex]: { ...(prev[currentIndex] || {}), [key]: value }
    }));
  };

  const updateTextAnswer = (value: string) => {
    setTextAnswers(prev => ({ ...prev, [currentIndex]: value }));
  };

  // Start screen
  if (!started) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
            <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-bold text-foreground">✍️ Schrijven — A2 Examen</h1>
          </div>
        </div>
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-6xl mb-4">✍️</div>
            <h2 className="font-display text-2xl font-black text-foreground mb-3">Schrijfvaardigheid</h2>
            <p className="text-muted-foreground mb-6">Oefen het schrijven onderdeel van het A2 inburgeringsexamen. U krijgt 4 schrijfopdrachten.</p>
            <div className="bg-card border border-border rounded-2xl p-6 text-left space-y-3 mb-8">
              <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-primary" /><span className="text-sm text-foreground">30 minuten</span></div>
              <div className="flex items-center gap-3"><PenLine className="h-5 w-5 text-primary" /><span className="text-sm text-foreground">4 schrijfopdrachten</span></div>
              <div className="flex items-center gap-3"><Trophy className="h-5 w-5 text-primary" /><span className="text-sm text-foreground">8 van 12 punten nodig om te slagen</span></div>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8">
              <div className="flex items-start gap-2"><AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" /><p className="text-sm text-amber-700 dark:text-amber-300">Schrijf altijd in <strong>hele zinnen</strong>. Lees de opdracht goed en beantwoord alle vragen.</p></div>
            </div>
            <Button onClick={() => setStarted(true)} size="lg" className="gap-2 text-base font-bold px-8"><PenLine className="h-5 w-5" />Start examen</Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Results screen
  if (quizComplete) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
            <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-bold text-foreground">✍️ Resultaat</h1>
          </div>
        </div>
        <div className="mx-auto max-w-2xl px-4 py-8">
          {evaluating ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg font-bold text-foreground">Uw antwoorden worden beoordeeld...</p>
              <p className="text-sm text-muted-foreground mt-2">Dit kan even duren</p>
            </motion.div>
          ) : evalError ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-lg font-bold text-foreground mb-2">{evalError}</p>
              <div className="flex gap-3 justify-center mt-6">
                <Button variant="outline" onClick={onBack}>Terug</Button>
                <Button onClick={handleRestart}>Opnieuw</Button>
              </div>
            </motion.div>
          ) : evalResult ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Score summary */}
              <div className={`rounded-2xl border-2 p-6 text-center ${evalResult.passed ? "border-green-500/30 bg-green-500/5" : "border-destructive/30 bg-destructive/5"}`}>
                <div className="text-5xl mb-3">{evalResult.passed ? "🎉" : "📝"}</div>
                <h2 className="font-display text-2xl font-black text-foreground">
                  {evalResult.passed ? "Geslaagd!" : "Nog niet geslaagd"}
                </h2>
                <div className="flex items-center justify-center gap-1 mt-3">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`h-6 w-6 ${s <= Math.round(evalResult.totalScore / 2.4) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
                <p className="text-3xl font-black text-foreground mt-2">{evalResult.totalScore} / 12</p>
                <p className="text-sm text-muted-foreground mt-1">U heeft {evalResult.passed ? "≥" : "<"} 8 punten nodig</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Tijd gebruikt: {formatTime(EXAM_DURATION_SECONDS - timeLeft)}
                  </span>
                </div>
              </div>

              {/* Overall feedback */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-display font-bold text-foreground mb-2">Algemene beoordeling</h3>
                <p className="text-sm text-muted-foreground">{evalResult.overallFeedback}</p>
                {evalResult.topStrengths.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-bold text-green-600 dark:text-green-400 mb-1">✅ Sterke punten:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {evalResult.topStrengths.map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                  </div>
                )}
                {evalResult.topImprovements.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mb-1">💡 Aandachtspunten:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {evalResult.topImprovements.map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* Per-question feedback */}
              {evalResult.questionFeedback.map((qf, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-bold text-foreground">
                      Vraag {qf.questionNumber}: {examQuestions[i]?.title}
                    </h3>
                    <span className={`text-sm font-bold px-2 py-1 rounded-lg ${
                      qf.score >= 3 ? "bg-green-500/10 text-green-600" :
                      qf.score >= 2 ? "bg-amber-500/10 text-amber-600" :
                      "bg-destructive/10 text-destructive"
                    }`}>{qf.score}/3</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{qf.feedback}</p>
                  {qf.strengths.length > 0 && (
                    <div className="mb-2">
                      {qf.strengths.map((s, j) => (
                        <span key={j} className="inline-flex items-center gap-1 text-xs bg-green-500/10 text-green-600 dark:text-green-400 rounded-full px-2 py-0.5 mr-1 mb-1">
                          <CheckCircle2 className="h-3 w-3" />{s}
                        </span>
                      ))}
                    </div>
                  )}
                  {qf.improvements.length > 0 && (
                    <div className="mb-3">
                      {qf.improvements.map((s, j) => (
                        <span key={j} className="inline-flex items-center gap-1 text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full px-2 py-0.5 mr-1 mb-1">
                          <Lightbulb className="h-3 w-3" />{s}
                        </span>
                      ))}
                    </div>
                  )}
                  {qf.correctedVersion && (
                    <div className="bg-muted/50 rounded-lg p-3 mt-2">
                      <p className="text-xs font-bold text-muted-foreground mb-1">Verbeterde versie:</p>
                      <p className="text-sm text-foreground italic">{qf.correctedVersion}</p>
                    </div>
                  )}
                </div>
              ))}

              <div className="flex gap-3 justify-center pt-4">
                <Button variant="outline" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" />Terug naar hub</Button>
                <Button onClick={handleRestart} className="gap-2"><RotateCcw className="h-4 w-4" />Opnieuw proberen</Button>
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>
    );
  }

  // Exam in progress
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-bold text-foreground">Vraag {currentIndex + 1} / {examQuestions.length}</span>
          </div>
          <div className={`flex items-center gap-2 font-mono text-sm font-bold ${timeLeft < 300 ? "text-destructive" : "text-foreground"}`}>
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((currentIndex + 1) / examQuestions.length) * 100}%` }} />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div key={currentIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: situation */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">
                    {current.type === "email" ? "📧" : current.type === "form" ? "📋" : current.type === "freewriting" ? "📝" : "📬"}
                  </span>
                  <h2 className="font-display text-lg font-bold text-foreground">{current.title}</h2>
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-4">{current.situation}</p>
                {current.bulletPoints.length > 0 && (
                  <ul className="space-y-2 mb-4">
                    {current.bulletPoints.map((bp, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="text-primary font-bold mt-0.5">•</span>
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-sm font-medium text-primary italic">{current.instruction}</p>
              </div>

              {/* Right: answer area */}
              <div className="bg-card border border-border rounded-2xl p-6">
                {current.type === "form" ? (
                  <div className="space-y-4">
                    {current.formTitle && (
                      <h3 className="font-display font-bold text-foreground text-sm border-b border-border pb-2 mb-3">{current.formTitle}</h3>
                    )}
                    {current.formFields?.map((field) => (
                      <div key={field.key}>
                        <Label className="text-xs font-medium text-muted-foreground mb-1 block">{field.label}</Label>
                        {field.type === "text" && (
                          <Input
                            value={(formAnswers[currentIndex] || {})[field.key] || ""}
                            onChange={(e) => updateFormField(field.key, e.target.value)}
                            className="text-sm"
                          />
                        )}
                        {field.type === "radio" && field.options && (
                          <RadioGroup
                            value={(formAnswers[currentIndex] || {})[field.key] || ""}
                            onValueChange={(v) => updateFormField(field.key, v)}
                            className="flex flex-wrap gap-3 mt-1"
                          >
                            {field.options.map((opt) => (
                              <div key={opt} className="flex items-center gap-1.5">
                                <RadioGroupItem value={opt} id={`${field.key}-${opt}`} />
                                <Label htmlFor={`${field.key}-${opt}`} className="text-sm cursor-pointer">{opt}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}
                        {field.type === "textarea" && (
                          <Textarea
                            value={(formAnswers[currentIndex] || {})[field.key] || ""}
                            onChange={(e) => updateFormField(field.key, e.target.value)}
                            rows={3}
                            className="text-sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    {/* Email header */}
                    {current.type === "email" && (
                      <div className="border border-border rounded-lg p-3 mb-4 bg-muted/30 text-sm space-y-1">
                        {current.emailTo && <p><span className="text-muted-foreground">Aan:</span> <span className="text-foreground">{current.emailTo}</span></p>}
                        {current.emailSubject && <p><span className="text-muted-foreground">Onderwerp:</span> <span className="text-foreground">{current.emailSubject}</span></p>}
                      </div>
                    )}
                    {current.emailGreeting && (
                      <p className="text-sm text-foreground mb-2">{current.emailGreeting}</p>
                    )}
                    {current.freewritingPrompt && (
                      <p className="text-sm text-muted-foreground italic mb-2">{current.freewritingPrompt}</p>
                    )}
                    <Textarea
                      value={textAnswers[currentIndex] || ""}
                      onChange={(e) => updateTextAnswer(e.target.value)}
                      rows={8}
                      placeholder="Schrijf hier uw antwoord..."
                      className="text-sm"
                    />
                    {current.emailClosing && (
                      <p className="text-sm text-foreground mt-2 whitespace-pre-line">{current.emailClosing}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button variant="outline" onClick={handlePrev} disabled={currentIndex === 0} className="gap-2">
                <ArrowLeft className="h-4 w-4" />Vorige
              </Button>
              {currentIndex < examQuestions.length - 1 ? (
                <Button onClick={handleNext} className="gap-2">
                  Volgende<ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmitAll} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle2 className="h-4 w-4" />Inleveren
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SchrijvenQuiz;
