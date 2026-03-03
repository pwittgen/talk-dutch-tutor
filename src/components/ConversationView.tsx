import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, RotateCcw, ArrowRight, Volume2, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type ConversationTurn } from "@/data/scenarios";

interface ConversationViewProps {
  turns: ConversationTurn[];
  scenarioEmoji: string;
  scenarioTitle: string;
  onComplete: () => void;
}

interface FeedbackState {
  correct: boolean;
  userAnswer: string;
  feedbackText: string;
  grammarTip?: string;
}

const ConversationView = ({ turns, scenarioEmoji, scenarioTitle, onComplete }: ConversationViewProps) => {
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [score, setScore] = useState(0);
  const recognitionRef = useRef<any>(null);

  const turn = turns[currentTurn];
  const progress = ((currentTurn) / turns.length) * 100;

  const checkAnswer = useCallback((answer: string) => {
    const normalized = answer.toLowerCase().replace(/[?.!,]/g, "").trim();
    const isCorrect = turn.expectedResponses.some((expected) => {
      const normalizedExpected = expected.toLowerCase().replace(/[?.!,]/g, "").trim();
      // Check for exact match or if the answer contains the expected response
      return normalized === normalizedExpected || 
             normalized.includes(normalizedExpected) ||
             normalizedExpected.includes(normalized);
    });

    if (isCorrect) {
      setScore((s) => s + 1);
    }

    setFeedback({
      correct: isCorrect,
      userAnswer: answer,
      feedbackText: isCorrect ? "Heel goed! 🎉 Great job!" : turn.feedbackOnWrong,
      grammarTip: isCorrect ? undefined : turn.grammarTip,
    });
  }, [turn]);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setShowTextInput(true);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "nl-NL";
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setIsListening(false);
      checkAnswer(result);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setShowTextInput(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [checkAnswer]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      checkAnswer(textInput.trim());
      setTextInput("");
    }
  };

  const handleNext = () => {
    setFeedback(null);
    if (currentTurn + 1 >= turns.length) {
      onComplete();
    } else {
      setCurrentTurn((t) => t + 1);
    }
  };

  const handleRetry = () => {
    setFeedback(null);
  };

  const speakDutch = useCallback(() => {
    const utterance = new SpeechSynthesisUtterance(turn.dutchText);
    utterance.lang = "nl-NL";
    utterance.rate = 0.85;
    speechSynthesis.speak(utterance);
  }, [turn]);

  return (
    <div className="flex min-h-[70vh] flex-col">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-display font-bold text-foreground">
            Turn {currentTurn + 1} of {turns.length}
          </span>
          <span className="font-semibold text-primary">
            Score: {score}/{turns.length}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-gradient-hero"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Speaker bubble */}
      <motion.div
        key={currentTurn}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-secondary text-2xl text-secondary-foreground">
            {scenarioEmoji}
          </div>
          <div className="flex-1">
            <div className="rounded-2xl rounded-tl-md bg-card p-5 shadow-card">
              <p className="font-display text-lg font-bold text-foreground">
                {turn.dutchText}
              </p>
              <button
                onClick={speakDutch}
                className="mt-2 flex items-center gap-1 text-sm font-medium text-secondary hover:text-secondary/80 transition-colors"
              >
                <Volume2 className="h-4 w-4" />
                Listen
              </button>
            </div>
            <p className="mt-3 rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground italic">
              💡 {turn.englishHint}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Response area */}
      <AnimatePresence mode="wait">
        {!feedback ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-auto space-y-4"
          >
            {/* Microphone button */}
            <div className="flex flex-col items-center gap-4">
              <motion.button
                onClick={isListening ? stopListening : startListening}
                whileTap={{ scale: 0.95 }}
                className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-colors ${
                  isListening
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-gradient-hero text-primary-foreground shadow-primary"
                }`}
              >
                {isListening && (
                  <span className="absolute inset-0 animate-pulse-ring rounded-full bg-destructive/30" />
                )}
                {isListening ? (
                  <MicOff className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </motion.button>
              <p className="text-sm font-medium text-muted-foreground">
                {isListening ? "Listening... speak Dutch!" : "Tap to speak your answer"}
              </p>
            </div>

            {/* Text input fallback */}
            <div className="flex items-center justify-center">
              {!showTextInput ? (
                <button
                  onClick={() => setShowTextInput(true)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Keyboard className="h-4 w-4" />
                  Type instead
                </button>
              ) : (
                <div className="flex w-full max-w-md gap-2">
                  <Input
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type your Dutch answer..."
                    onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
                    className="flex-1 rounded-xl border-border bg-card"
                  />
                  <Button onClick={handleTextSubmit} className="rounded-xl bg-gradient-hero text-primary-foreground shadow-primary">
                    Send
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-auto"
          >
            {/* User's answer */}
            <div className="mb-4 flex justify-end">
              <div className={`rounded-2xl rounded-br-md px-5 py-3 ${
                feedback.correct ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              }`}>
                <p className="text-sm font-medium">You said:</p>
                <p className="font-display text-lg font-bold">{feedback.userAnswer}</p>
              </div>
            </div>

            {/* Feedback card */}
            <div className={`rounded-2xl p-5 ${
              feedback.correct
                ? "bg-success/10 border border-success/20"
                : "bg-destructive/10 border border-destructive/20"
            }`}>
              <p className={`font-display text-lg font-bold ${
                feedback.correct ? "text-success" : "text-destructive"
              }`}>
                {feedback.feedbackText}
              </p>
              {feedback.grammarTip && (
                <div className="mt-3 rounded-xl bg-card p-4">
                  <p className="text-sm font-semibold text-secondary">📚 Grammar Tip</p>
                  <p className="mt-1 text-sm text-foreground">{feedback.grammarTip}</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex justify-center gap-3">
              {!feedback.correct && (
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="gap-2 rounded-xl"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try Again
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="gap-2 rounded-xl bg-gradient-hero text-primary-foreground shadow-primary"
              >
                {currentTurn + 1 >= turns.length ? "Finish!" : "Next"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConversationView;
