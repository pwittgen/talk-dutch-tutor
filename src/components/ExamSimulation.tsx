import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, ArrowRight, Camera, Loader2, Star, BookOpen, ChevronDown, Keyboard, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type ExamQuestion } from "@/data/examQuestions";
import { supabase } from "@/integrations/supabase/client";

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
  const [results, setResults] = useState<ExamResult[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ text: string; stars: number; correctedDutch?: string } | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [showHints, setShowHints] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
  const [loadingImage, setLoadingImage] = useState<number | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recognitionRef = useRef<any>(null);
  const manualTranscriptRef = useRef("");
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // Recording duration timer
  useEffect(() => {
    if (isListening) {
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setRecordingDuration(0);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isListening]);

  // Generate image for current question
  const generateImage = useCallback(async (q: ExamQuestion) => {
    if (generatedImages[q.id]) return;
    setLoadingImage(q.id);
    try {
      const response = await supabase.functions.invoke("generate-exam-image", {
        body: { prompt: q.imagePrompt, questionId: q.id },
      });
      if (response.data?.imageUrl) {
        setGeneratedImages(prev => ({ ...prev, [q.id]: response.data.imageUrl }));
      }
    } catch (e) {
      console.error("Failed to generate image:", e);
    } finally {
      setLoadingImage(null);
    }
  }, [generatedImages]);

  // Generate image on mount
  useState(() => {
    generateImage(question);
  });

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
          scenarioContext: `Inburgering A2 Spreken Exam - Question ${currentIndex + 1} of ${questions.length}. Situation: ${question.situationEnglish}`,
          imageDescription: question.placeholderDescription,
          openEnded: true,
          sampleAnswer: question.sampleAnswer,
          examMode: true,
        },
      });
      if (error) throw error;

      const stars = data.starRating || 3;
      const correctedDutch = data.correctedDutch;
      setFeedback({ text: data.feedback, stars, correctedDutch });
      setResults(prev => [...prev, { questionId: question.id, userAnswer: answer, feedback: data.feedback, starRating: stars }]);
    } catch (e) {
      console.error("Evaluation failed:", e);
      setFeedback({ text: "Good attempt! Keep practicing with short, simple sentences.", stars: 3 });
      setResults(prev => [...prev, { questionId: question.id, userAnswer: answer }]);
    } finally {
      setIsEvaluating(false);
    }
  }, [question, currentIndex, questions.length]);

  // Manual-only recording: user starts and stops
  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setShowTextInput(true);
      return;
    }

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const recognition = new SpeechRecognition();
    recognition.lang = "nl-NL";
    recognition.interimResults = true;
    recognition.continuous = !isSafari;
    manualTranscriptRef.current = "";

    let hasSubmitted = false;

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interimTranscript = event.results[i][0].transcript;
        }
      }
      manualTranscriptRef.current = (finalTranscript.trim() || interimTranscript.trim());
    };

    recognition.onend = () => {
      setTimeout(() => {
        if (hasSubmitted) return;
        if (manualTranscriptRef.current) {
          hasSubmitted = true;
          setIsListening(false);
          evaluateAnswer(manualTranscriptRef.current);
        } else {
          setIsListening(false);
        }
      }, 300);
    };

    recognition.onerror = () => {
      setShowTextInput(true);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);

    // NO auto-stop timer — user must manually stop recording
  }, [evaluateAnswer]);

  const stopListening = () => {
    try { recognitionRef.current?.stop(); } catch {}
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      evaluateAnswer(textInput.trim());
      setTextInput("");
    }
  };

  const handleNext = () => {
    setFeedback(null);
    setCurrentAnswer("");
    setShowHints(false);
    setShowTextInput(false);
    if (currentIndex + 1 >= questions.length) {
      onComplete(results);
    } else {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      generateImage(questions[nextIdx]);
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-muted-foreground">
          {currentIndex + 1}/{questions.length}
        </span>
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full bg-gradient-delft rounded-full"
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Photo */}
      <div className="rounded-2xl overflow-hidden bg-muted aspect-[4/3] flex items-center justify-center border border-border">
        {generatedImages[question.id] ? (
          <img
            src={generatedImages[question.id]}
            alt={question.placeholderDescription}
            className="w-full h-full object-cover"
          />
        ) : loadingImage === question.id ? (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm font-medium">Generating exam photo...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground p-6 text-center">
            <Camera className="h-10 w-10" />
            <p className="text-sm font-medium">{question.placeholderDescription}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => generateImage(question)}
              className="rounded-xl"
            >
              Generate Photo
            </Button>
          </div>
        )}
      </div>

      {/* Situation + Question */}
      <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
        {/* Situation context */}
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground italic">{question.situationDutch}</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">{question.situationEnglish}</p>
          </div>
        </div>

        {/* The question */}
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
                title="Listen to question"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{question.question}</p>
          </div>
        </div>

        {/* Hints */}
        <button
          onClick={() => setShowHints(!showHints)}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary"
        >
          <BookOpen className="h-3.5 w-3.5" />
          {showHints ? "Hide tips" : "Show tips"}
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
                <p className="text-xs font-bold text-muted-foreground">💡 Keep it short and simple:</p>
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
      {!feedback ? (
        <div className="flex flex-col items-center gap-4">
          {isEvaluating ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Evaluating your answer...</span>
            </div>
          ) : (
            <>
              {/* Recording indicator */}
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
                  <span className="text-sm font-bold text-destructive">
                    Recording {formatDuration(recordingDuration)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Tap stop when finished
                  </span>
                </motion.div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={isListening ? stopListening : startListening}
                  className={`rounded-2xl h-14 px-8 gap-2 text-base font-bold ${
                    isListening
                      ? "bg-destructive text-destructive-foreground animate-pulse"
                      : "bg-gradient-hero text-primary-foreground shadow-primary"
                  }`}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  {isListening ? "Stop Recording" : "Start Recording"}
                </Button>
                {!isListening && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowTextInput(!showTextInput)}
                    className="rounded-2xl h-14 w-14"
                    title="Type instead"
                  >
                    <Keyboard className="h-5 w-5" />
                  </Button>
                )}
              </div>

              {!isListening && (
                <p className="text-xs text-muted-foreground text-center max-w-xs">
                  Press <strong>Start Recording</strong>, speak your answer, then press <strong>Stop Recording</strong> when you're done.
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
                    placeholder="Type your answer in Dutch..."
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
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card border border-border p-5 space-y-3"
        >
          <div className="flex items-center gap-1 mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < feedback.stars
                    ? "fill-primary text-primary"
                    : "text-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-foreground">{feedback.text}</p>

          {/* User's answer */}
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Your answer:</p>
            <p className="text-sm font-semibold text-foreground">{currentAnswer}</p>
          </div>

          {/* Improved version based on user's answer */}
          {feedback.correctedDutch && (
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
              <p className="text-xs font-medium text-primary mb-1">✨ Improved version:</p>
              <p className="text-sm font-semibold text-foreground">{feedback.correctedDutch}</p>
            </div>
          )}

          {/* Sample answer */}
          <div className="rounded-xl bg-success/5 border border-success/20 p-3">
            <p className="text-xs font-medium text-success mb-1">📝 Example short answer:</p>
            <p className="text-sm font-semibold text-foreground">{question.sampleAnswer}</p>
          </div>

          <Button onClick={handleNext} className="w-full rounded-xl gap-2 bg-gradient-delft text-secondary-foreground">
            {currentIndex + 1 >= questions.length ? "See Results" : "Next Question"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default ExamSimulation;
