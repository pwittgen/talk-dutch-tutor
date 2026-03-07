import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, ArrowRight, ArrowLeft, Camera, Loader2,
  Star, BookOpen, ChevronDown, Keyboard, Volume2, Clock,
  Film, Play, Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type ExamQuestion, opgaveDescriptions } from "@/data/examQuestions";
import { supabase } from "@/integrations/supabase/client";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface ExamSimulationProps {
  questions: ExamQuestion[];
  onComplete: (results: ExamResult[]) => void;
}

export interface ExamResult {
  questionId: number;
  userAnswer: string;
  feedback?: string;
  starRating?: number;
}

const ExamSimulation = ({ questions, onComplete }: ExamSimulationProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Record<number, ExamResult>>({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ text: string; stars: number; correctedDutch?: string } | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [showHints, setShowHints] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  const [examElapsed, setExamElapsed] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  const examTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Refs to track in-flight requests and generated images without stale closures
  const inFlightRef = useRef<Set<string>>(new Set());
  const generatedRef = useRef<Record<string, string>>({});

  const question = questions[currentIndex];
  const currentOpgave = question.opgave;
  const opgaveInfo = opgaveDescriptions[currentOpgave];

  // Exam elapsed timer
  useEffect(() => {
    examTimerRef.current = setInterval(() => setExamElapsed(prev => prev + 1), 1000);
    return () => { if (examTimerRef.current) clearInterval(examTimerRef.current); };
  }, []);

  const imageKey = (qId: number, idx: number) => `${qId}-${idx}`;
  const videoThumbKey = (qId: number) => `${qId}-video-thumb`;

  // Concurrent-safe image generator — uses refs to avoid stale closures
  const generateImageForKey = useCallback(async (key: string, prompt: string) => {
    if (generatedRef.current[key] || inFlightRef.current.has(key)) return;
    inFlightRef.current.add(key);
    setLoadingImages(prev => ({ ...prev, [key]: true }));
    try {
      const response = await supabase.functions.invoke("generate-exam-image", {
        body: { prompt, questionId: parseInt(key.split("-")[0]) },
      });
      if (!response.error && response.data?.imageUrl) {
        generatedRef.current[key] = response.data.imageUrl;
        setGeneratedImages(prev => ({ ...prev, [key]: response.data.imageUrl }));
      }
    } catch (e) {
      console.warn("Image generation failed:", e);
    } finally {
      inFlightRef.current.delete(key);
      setLoadingImages(prev => { const n = { ...prev }; delete n[key]; return n; });
    }
  }, []);

  // Kick off image generation for a given question (photos + video thumbnail)
  const generateForQuestion = useCallback((q: ExamQuestion) => {
    q.imagePrompts.forEach((prompt, i) => generateImageForKey(imageKey(q.id, i), prompt));
    if (q.opgaveType === "video" && q.videoThumbnailPrompt) {
      generateImageForKey(videoThumbKey(q.id), q.videoThumbnailPrompt);
    }
  }, [generateImageForKey]);

  // Auto-generate current question's images and pre-fetch next question
  useEffect(() => {
    generateForQuestion(question);
    const next = questions[currentIndex + 1];
    if (next) generateForQuestion(next);
  }, [question.id, generateForQuestion]);

  // Reset video state when question changes
  useEffect(() => {
    speechSynthesis.cancel();
    if (videoTimerRef.current) clearInterval(videoTimerRef.current);
    setIsVideoPlaying(false);
    setVideoProgress(0);
  }, [question.id]);

  // Video player: narrate the scene description via speech synthesis
  const handleVideoPlay = useCallback(() => {
    if (isVideoPlaying) {
      speechSynthesis.cancel();
      if (videoTimerRef.current) clearInterval(videoTimerRef.current);
      setIsVideoPlaying(false);
      setVideoProgress(0);
      return;
    }
    const text = question.videoDescription ?? "";
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "nl-NL";
    utterance.rate = 0.85;

    // Rough duration estimate: ~75 ms per character at 0.85x speed
    const durationMs = Math.max(text.length * 75, 4000);
    const startTime = Date.now();

    setIsVideoPlaying(true);
    setVideoProgress(0);

    videoTimerRef.current = setInterval(() => {
      const pct = Math.min(((Date.now() - startTime) / durationMs) * 100, 99);
      setVideoProgress(pct);
    }, 100);

    utterance.onend = () => {
      if (videoTimerRef.current) clearInterval(videoTimerRef.current);
      setVideoProgress(100);
      setTimeout(() => { setIsVideoPlaying(false); setVideoProgress(0); }, 800);
    };

    speechSynthesis.speak(utterance);
  }, [isVideoPlaying, question.videoDescription]);

  const speakDutch = useCallback((text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "nl-NL";
    utterance.rate = 0.85;
    speechSynthesis.speak(utterance);
  }, []);

  const evaluateAnswer = useCallback(async (answer: string) => {
    setIsEvaluating(true);
    setCurrentAnswer(answer);
    try {
      const { data, error } = await supabase.functions.invoke("evaluate-dutch", {
        body: {
          userAnswer: answer,
          dutchPrompt: question.dutchQuestion,
          englishHint: question.question,
          scenarioContext: `Inburgering A2 Spreken Oefenexamen - ${opgaveInfo.title}, Vraag ${currentIndex + 1} van ${questions.length}. Situatie: ${question.situationEnglish}`,
          imageDescription: question.placeholderDescriptions.join("; "),
          openEnded: true,
          sampleAnswer: question.sampleAnswer,
          examMode: true,
        },
      });
      if (error) throw error;
      const stars = data.starRating || 3;
      setFeedback({ text: data.feedback, stars, correctedDutch: data.correctedDutch });
      setResults(prev => ({
        ...prev,
        [question.id]: { questionId: question.id, userAnswer: answer, feedback: data.feedback, starRating: stars },
      }));
    } catch (e) {
      console.error("Evaluation failed:", e);
      setFeedback({ text: "Good attempt! Keep practicing with short, simple sentences.", stars: 3 });
      setResults(prev => ({
        ...prev,
        [question.id]: { questionId: question.id, userAnswer: answer },
      }));
    } finally {
      setIsEvaluating(false);
    }
  }, [question, currentIndex, questions.length, opgaveInfo]);

  const { isListening, isPreparing, interimText: examInterimText, startListening, stopListening } = useSpeechRecognition({
    scenario: `Exam Q${currentIndex + 1}`,
    lang: "nl-NL",
    onTranscript: evaluateAnswer,
    onFallbackToText: useCallback(() => setShowTextInput(true), []),
    mode: "manual",
    autoStopSeconds: 30,
  });

  const handleTextSubmit = () => {
    if (textInput.trim()) { evaluateAnswer(textInput.trim()); setTextInput(""); }
  };

  const navigateTo = (index: number) => {
    if (index < 0 || index >= questions.length) return;
    setFeedback(null);
    setCurrentAnswer("");
    setShowHints(false);
    setShowTextInput(false);
    setCurrentIndex(index);
  };

  const handleFinish = () => {
    const allResults = questions.map(q => results[q.id] || { questionId: q.id, userAnswer: "(not answered)" });
    onComplete(allResults);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isNewOpgave = currentIndex === 0 || questions[currentIndex - 1].opgave !== currentOpgave;
  const answeredCurrent = !!results[question.id];

  // ── Video player ────────────────────────────────────────────────────────────
  const renderVideo = () => {
    const key = videoThumbKey(question.id);
    const thumbUrl = generatedImages[key];
    const isLoading = loadingImages[key];

    return (
      <div className="rounded-2xl overflow-hidden border border-border relative aspect-video bg-slate-900 select-none">
        {/* Thumbnail */}
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt="Video preview"
            className={`w-full h-full object-cover transition-opacity duration-500 ${isVideoPlaying ? "opacity-50" : "opacity-85"}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2 text-white/40">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-xs font-medium">Filmpje laden…</p>
              </div>
            ) : (
              <Film className="h-16 w-16 text-white/15" />
            )}
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

        {/* Subtitles shown while playing */}
        <AnimatePresence>
          {isVideoPlaying && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="absolute bottom-14 left-4 right-4"
            >
              <div className="rounded-lg bg-black/80 px-3 py-2 text-center">
                <p className="text-white text-sm leading-snug">{question.videoDescription}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        {videoProgress > 0 && (
          <div className="absolute bottom-10 left-4 right-4 h-0.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              style={{ width: `${videoProgress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
        )}

        {/* Controls bar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2.5">
          <span className="text-white/50 text-xs font-medium flex items-center gap-1.5">
            <Film className="h-3.5 w-3.5" /> Filmpje — Opgave 1
          </span>
          <button
            onClick={handleVideoPlay}
            className="flex items-center gap-1.5 bg-white/90 hover:bg-white active:scale-95 text-black px-4 py-1.5 rounded-full text-sm font-bold transition-all"
          >
            {isVideoPlaying
              ? <><Pause className="h-3.5 w-3.5" /> Stop</>
              : <><Play className="h-3.5 w-3.5" /> Bekijk de video</>
            }
          </button>
        </div>
      </div>
    );
  };

  // ── Photo(s) ────────────────────────────────────────────────────────────────
  const renderPhotos = () => {
    const count = question.imagePrompts.length;
    const gridClass =
      count === 1 ? "" :
      count === 2 ? "grid grid-cols-2 gap-3" :
      "grid grid-cols-3 gap-2";

    return (
      <div className={gridClass}>
        {question.imagePrompts.map((_, i) => {
          const key = imageKey(question.id, i);
          const imgUrl = generatedImages[key];
          const isLoading = loadingImages[key];
          return (
            <div
              key={i}
              className="rounded-2xl overflow-hidden bg-muted aspect-[4/3] flex items-center justify-center border border-border relative"
            >
              {count > 1 && (
                <span className="absolute top-2 left-2 bg-foreground/80 text-background text-xs font-bold px-2 py-0.5 rounded-md z-10">
                  {i + 1}
                </span>
              )}
              {imgUrl ? (
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={imgUrl}
                  alt={question.placeholderDescriptions[i]}
                  className="w-full h-full object-cover"
                />
              ) : isLoading ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <p className="text-xs font-medium">Foto laden…</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground p-4 text-center">
                  <Camera className="h-8 w-8 opacity-40" />
                  <p className="text-xs font-medium">{question.placeholderDescriptions[i]}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      {/* Top bar: timer + progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-mono font-bold">{formatTime(examElapsed)}</span>
        </div>
        <span className="text-sm font-bold text-muted-foreground">
          Vraag {currentIndex + 1} van {questions.length}
        </span>
      </div>

      {/* Question navigation dots */}
      <div className="flex items-center gap-1 justify-center flex-wrap">
        {questions.map((q, i) => {
          const isAnswered = !!results[q.id];
          const isCurrent = i === currentIndex;
          const showSep = i > 0 && questions[i - 1].opgave !== q.opgave;
          return (
            <div key={q.id} className="flex items-center">
              {showSep && <div className="w-px h-5 bg-border mx-1" />}
              <button
                onClick={() => navigateTo(i)}
                className={`h-7 w-7 rounded-full text-xs font-bold transition-all ${
                  isCurrent
                    ? "bg-primary text-primary-foreground scale-110"
                    : isAnswered
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {i + 1}
              </button>
            </div>
          );
        })}
      </div>

      {/* Opgave header (shown once per section) */}
      {isNewOpgave && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-primary/5 border border-primary/20 p-4"
        >
          <p className="font-display text-sm font-black text-primary">{opgaveInfo.title}</p>
          <p className="text-sm text-foreground mt-1">{opgaveInfo.instruction}</p>
        </motion.div>
      )}

      {/* Visual content: video player or photo(s) */}
      {question.opgaveType === "video" ? renderVideo() : renderPhotos()}

      {/* Situation + Question card */}
      <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
        <div>
          <p className="text-sm text-muted-foreground italic">{question.situationDutch}</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">{question.situationEnglish}</p>
        </div>

        <div className="flex items-start gap-3 pt-2 border-t border-border">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary text-sm font-bold">
            {currentIndex + 1}
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-display text-lg font-bold text-foreground">{question.dutchQuestion}</p>
              <button
                onClick={() => speakDutch(question.dutchQuestion)}
                className="shrink-0 text-primary hover:text-primary/80 transition-colors"
                title="Luister naar de vraag"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{question.question}</p>
          </div>
        </div>

        {/* Hints toggle */}
        <button
          onClick={() => setShowHints(!showHints)}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary"
        >
          <BookOpen className="h-3.5 w-3.5" />
          {showHints ? "Tips verbergen" : "Tips bekijken"}
          <ChevronDown className={`h-3 w-3 transition-transform ${showHints ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {showHints && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl bg-muted/50 p-3 space-y-1.5">
                <p className="text-xs font-bold text-muted-foreground">💡 Kort en simpel:</p>
                {question.hints.map((hint, i) => (
                  <p key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/50 shrink-0" />
                    {hint}
                  </p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Answer area */}
      {!feedback && !answeredCurrent ? (
        <div className="flex flex-col items-center gap-4">
          {isEvaluating ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Antwoord beoordelen…</span>
            </div>
          ) : (
            <>
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-2"
                >
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
                  </span>
                  <span className="text-sm font-bold text-destructive">Opname…</span>
                  {examInterimText && (
                    <span className="text-xs text-muted-foreground italic truncate max-w-[200px]">
                      "{examInterimText}"
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">Druk op stop als u klaar bent</span>
                </motion.div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={isPreparing ? undefined : isListening ? stopListening : startListening}
                  disabled={isPreparing}
                  className={`rounded-2xl h-14 px-8 gap-2 text-base font-bold ${
                    isPreparing
                      ? "bg-muted text-muted-foreground"
                      : isListening
                      ? "bg-destructive text-destructive-foreground animate-pulse"
                      : "bg-gradient-hero text-primary-foreground shadow-primary"
                  }`}
                >
                  {isPreparing
                    ? <><Loader2 className="h-5 w-5 animate-spin" /> Mic voorbereiden…</>
                    : isListening
                    ? <><MicOff className="h-5 w-5" /> Stop opname</>
                    : <><Mic className="h-5 w-5" /> Start opname</>
                  }
                </Button>
                {!isListening && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowTextInput(!showTextInput)}
                    className="rounded-2xl h-14 w-14"
                    title="Typ uw antwoord"
                  >
                    <Keyboard className="h-5 w-5" />
                  </Button>
                )}
              </div>

              {!isListening && (
                <p className="text-xs text-muted-foreground text-center max-w-xs">
                  Druk op <strong>Start opname</strong>, spreek uw antwoord in, en druk op{" "}
                  <strong>Stop opname</strong> als u klaar bent.
                </p>
              )}

              {showTextInput && !isListening && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex w-full max-w-md gap-2"
                >
                  <Input
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
                    placeholder="Typ uw antwoord in het Nederlands…"
                    className="rounded-xl"
                  />
                  <Button onClick={handleTextSubmit} className="rounded-xl">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </div>
      ) : (feedback || answeredCurrent) ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card border border-border p-5 space-y-3"
        >
          {feedback && (
            <>
              <div className="flex items-center gap-1 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < feedback.stars ? "fill-primary text-primary" : "text-muted"}`}
                  />
                ))}
              </div>
              <p className="text-sm text-foreground">{feedback.text}</p>
            </>
          )}

          {(currentAnswer || results[question.id]?.userAnswer) && (
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Uw antwoord:</p>
              <p className="text-sm font-semibold text-foreground">
                {currentAnswer || results[question.id]?.userAnswer}
              </p>
            </div>
          )}

          {feedback?.correctedDutch && (
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
              <p className="text-xs font-medium text-primary mb-1">✨ Verbeterde versie:</p>
              <p className="text-sm font-semibold text-foreground">{feedback.correctedDutch}</p>
            </div>
          )}

          <div className="rounded-xl bg-success/5 border border-success/20 p-3">
            <p className="text-xs font-medium text-success mb-1">📝 Voorbeeldantwoord:</p>
            <p className="text-sm font-semibold text-foreground">{question.sampleAnswer}</p>
          </div>
        </motion.div>
      ) : null}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          onClick={() => navigateTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="rounded-xl gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Vorige
        </Button>

        {currentIndex + 1 < questions.length ? (
          <Button
            onClick={() => navigateTo(currentIndex + 1)}
            className="rounded-xl gap-2 bg-gradient-delft text-secondary-foreground"
          >
            Volgende <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleFinish}
            className="rounded-xl gap-2 bg-gradient-delft text-secondary-foreground"
          >
            Resultaten bekijken <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExamSimulation;
