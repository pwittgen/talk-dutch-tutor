import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, RotateCcw, ArrowRight, Volume2, VolumeX, Keyboard, Loader2, BookOpen, MessageSquare, Sparkles, Play, Star, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { type ConversationTurn } from "@/data/scenarios";
import { supabase } from "@/integrations/supabase/client";
import { useRecordingSettings } from "@/hooks/useRecordingSettings";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface ConversationViewProps {
  turns: ConversationTurn[];
  scenarioEmoji: string;
  scenarioTitle: string;
  openEnded?: boolean;
  muted: boolean;
  onComplete: () => void;
}

interface AIFeedback {
  grade: "perfect" | "good" | "needs_improvement" | "incorrect";
  feedback: string;
  correctedDutch: string;
  grammarNotes: string[];
  pronunciationTips?: string[];
  vocabularyNotes?: string[];
  cefrLevel?: string;
  starRating?: number;
}

interface FeedbackState {
  userAnswer: string;
  aiFeedback: AIFeedback;
}

const gradeConfig = {
  perfect: { emoji: "🎉", label: "Perfect!", color: "text-success", bg: "bg-success/10 border-success/20" },
  good: { emoji: "👍", label: "Good job!", color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  needs_improvement: { emoji: "💪", label: "Almost there!", color: "text-warning", bg: "bg-amber-500/10 border-amber-500/20" },
  incorrect: { emoji: "🔄", label: "Let's try again", color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
};

const ConversationView = ({ turns, scenarioEmoji, scenarioTitle, openEnded, muted, onComplete }: ConversationViewProps) => {
  const [currentTurn, setCurrentTurn] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [score, setScore] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState(0.7);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [dynamicTurns, setDynamicTurns] = useState<ConversationTurn[]>([...turns]);
  const [conversationHistory, setConversationHistory] = useState<Array<{ dutch: string; studentResponse?: string }>>([]);
  const [isGeneratingTurn, setIsGeneratingTurn] = useState(false);
  const { settings: recordingSettings } = useRecordingSettings();

  const activeTurns = openEnded ? dynamicTurns : turns;
  const turn = activeTurns[currentTurn];
  const progress = ((currentTurn) / activeTurns.length) * 100;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  // Track whether TTS has been initiated for the current turn.
  // Prevents mic from enabling before TTS has had a chance to start playing.
  const ttsInitiatedRef = useRef(false);
  const ttsHasPlayedRef = useRef(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const preloadedAudioRef = useRef<{ text: string; blobUrl: string } | null>(null);
  // Holds an Audio element activated synchronously from a gesture, for use after an async gap
  const pendingActivatedAudioRef = useRef<HTMLAudioElement | null>(null);
  // AbortController for the current in-flight TTS fetch — cancelled when recording starts
  const ttsFetchControllerRef = useRef<AbortController | null>(null);

  const fetchTtsBlob = useCallback(async (text: string, signal?: AbortSignal): Promise<string> => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text, speed: speechRate }),
        signal,
      }
    );
    if (!response.ok) throw new Error(`TTS failed: ${response.status}`);
    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  }, [speechRate]);

  const preloadNextTurn = useCallback(async () => {
    const nextIdx = currentTurn + 1;
    if (nextIdx >= activeTurns.length) return;
    const nextText = activeTurns[nextIdx]?.dutchText;
    if (!nextText || preloadedAudioRef.current?.text === nextText) return;
    try {
      const blobUrl = await fetchTtsBlob(nextText);
      preloadedAudioRef.current = { text: nextText, blobUrl };
    } catch {
      // Preload failure is non-critical
    }
  }, [currentTurn, activeTurns, fetchTtsBlob]);

  const speakDutch = useCallback((text?: string) => {
    if (muted) return;
    ttsInitiatedRef.current = true;
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    const spokenText = text || turn.dutchText;
    setIsSpeaking(true);

    const fallbackToSpeechSynthesis = () => {
      setIsSpeaking(false);
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = "nl-NL";
      utterance.rate = speechRate;
      utterance.pitch = 1.0;
      const voices = speechSynthesis.getVoices();
      const dutchVoice =
        voices.find((v) => v.lang.startsWith("nl") && v.name.toLowerCase().includes("female")) ||
        voices.find((v) => v.lang.startsWith("nl"));
      if (dutchVoice) utterance.voice = dutchVoice;
      speechSynthesis.speak(utterance);
    };

    const playAudioUrl = (audioUrl: string, preActivated?: HTMLAudioElement) => {
      // If a pre-activated element is supplied (iOS gesture unlock trick), reuse it.
      // Otherwise create a fresh Audio — src is set immediately so play() is synchronous.
      const audio = preActivated ?? new Audio(audioUrl);
      if (preActivated) preActivated.src = audioUrl;
      currentAudioRef.current = audio;
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
        preloadNextTurn();
      };
      // play() called synchronously — critical for iOS Safari gesture context preservation
      audio.play().catch((e) => {
        console.error("ElevenLabs TTS failed, falling back to browser speech:", e);
        currentAudioRef.current = null;
        fallbackToSpeechSynthesis();
      });
    };

    // Use preloaded audio if available — play synchronously (critical for iOS Safari)
    if (preloadedAudioRef.current?.text === spokenText) {
      const { blobUrl } = preloadedAudioRef.current;
      preloadedAudioRef.current = null;
      pendingActivatedAudioRef.current = null; // discard stale activation if any
      playAudioUrl(blobUrl);
      return;
    }

    // Consume any pre-activated element (created synchronously in handleNext before an await)
    let activatedAudio = pendingActivatedAudioRef.current ?? undefined;
    pendingActivatedAudioRef.current = null;

    // If no pre-activated element exists and we're about to enter the async path,
    // create one NOW — we're still inside a user gesture so the activation succeeds.
    // This covers: regular turn transitions (no preloaded audio), "Listen" button,
    // "Listen to ideal response" — all called synchronously from click handlers.
    if (!activatedAudio) {
      const audio = new Audio();
      audio.play().catch(() => {}); // Fails (no src) but activates the element
      activatedAudio = audio;
    }

    // Not preloaded — fetch async then play.
    // Using the pre-activated element lets iOS WebKit honour the original gesture context.
    // Track the fetch so stopCurrentAudio() can abort it if recording starts first.
    const controller = new AbortController();
    ttsFetchControllerRef.current = controller;
    fetchTtsBlob(spokenText, controller.signal)
      .then((audioUrl) => {
        ttsFetchControllerRef.current = null;
        playAudioUrl(audioUrl, activatedAudio);
      })
      .catch((e) => {
        ttsFetchControllerRef.current = null;
        if (e?.name === "AbortError") return; // recording started first — expected
        console.error("ElevenLabs TTS failed, falling back to browser speech:", e);
        fallbackToSpeechSynthesis();
      });
  }, [turn, speechRate, muted, fetchTtsBlob, preloadNextTurn]);

  // Auto-play dialogue only on initial mount (first turn)
  const hasPlayedInitialRef = useRef(false);
  useEffect(() => {
    if (!muted && turn && !hasPlayedInitialRef.current) {
      hasPlayedInitialRef.current = true;
      const timeout = setTimeout(() => speakDutch(), 600);
      return () => clearTimeout(timeout);
    }
  }, [muted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Enable mic only after TTS finishes (+ 400ms for OS audio session release).
  // When muted there is no TTS, so enable mic after a short delay instead.
  useEffect(() => {
    if (muted) {
      const t = setTimeout(() => setMicEnabled(true), 200);
      return () => clearTimeout(t);
    }
    if (isSpeaking) {
      setMicEnabled(false);
      return;
    }
    const t = setTimeout(() => setMicEnabled(true), 400);
    return () => clearTimeout(t);
  }, [isSpeaking, muted]);

  // Reset mic gate when advancing to a new turn
  useEffect(() => {
    setMicEnabled(false);
  }, [currentTurn]);

  const evaluateWithAI = useCallback(async (answer: string) => {
    setIsEvaluating(true);
    try {
      const { data, error } = await supabase.functions.invoke("evaluate-dutch", {
        body: {
          userAnswer: answer,
          dutchPrompt: turn.dutchText,
          englishHint: turn.englishHint,
          scenarioContext: `${scenarioTitle} - Turn ${currentTurn + 1} of ${activeTurns.length}`,
          imageDescription: turn.imageDescription || null,
          openEnded: openEnded || false,
        },
      });

      if (error) throw error;

      const aiFeedback = data as AIFeedback;
      
      if (aiFeedback.grade === "perfect" || aiFeedback.grade === "good") {
        setScore((s) => s + 1);
      }

      // Track conversation history for open-ended scenarios
      if (openEnded) {
        setConversationHistory(prev => {
          const updated = [...prev];
          // Update the last entry with the student's response
          if (updated.length > 0) {
            updated[updated.length - 1] = { ...updated[updated.length - 1], studentResponse: answer };
          }
          return updated;
        });
      }

      setFeedback({ userAnswer: answer, aiFeedback });
      setShowAnalysis(false);
    } catch (e) {
      console.error("AI evaluation failed, using fallback:", e);
      const normalized = answer.toLowerCase().replace(/[?.!,]/g, "").trim();
      const isCorrect = turn.expectedResponses.some((expected) => {
        const ne = expected.toLowerCase().replace(/[?.!,]/g, "").trim();
        return normalized === ne || normalized.includes(ne) || ne.includes(normalized);
      });
      if (isCorrect) setScore((s) => s + 1);
      setFeedback({
        userAnswer: answer,
        aiFeedback: {
          grade: isCorrect ? "good" : "incorrect",
          feedback: isCorrect ? "Heel goed! Great job!" : turn.feedbackOnWrong,
          correctedDutch: turn.expectedResponses[0] || answer,
          grammarNotes: turn.grammarTip ? [turn.grammarTip] : [],
        },
      });
      setShowAnalysis(false);
    } finally {
      setIsEvaluating(false);
    }
  }, [turn, scenarioTitle, currentTurn, activeTurns.length, openEnded]);

  const { isListening, isPreparing, interimText, startListening, stopListening, cancelListening } = useSpeechRecognition({
    scenario: scenarioTitle,
    lang: "nl-NL",
    onTranscript: evaluateWithAI,
    onFallbackToText: () => setShowTextInput(true),
    mode: recordingSettings.mode,
    autoStopSeconds: recordingSettings.autoStopSeconds,
  });

  /**
   * Stop any active TTS audio and browser speech synthesis.
   *
   * Critical for mobile: must fully release the audio session before
   * SpeechRecognition starts. `.pause()` alone keeps iOS/Android in
   * "playback" audio-session mode, blocking recognition. Setting
   * `audio.src = ""` forces an immediate session release.
   *
   * Also aborts any in-flight TTS fetch to prevent TTS from starting
   * to play after recognition has already begun (race condition on slow networks).
   */
  const stopCurrentAudio = useCallback(() => {
    // Abort any in-flight TTS fetch so it can't start playing after recording begins
    if (ttsFetchControllerRef.current) {
      ttsFetchControllerRef.current.abort();
      ttsFetchControllerRef.current = null;
    }
    if (currentAudioRef.current) {
      const audio = currentAudioRef.current;
      currentAudioRef.current = null; // null first so onended can't re-enter
      audio.onended = null;           // remove handler — no cleanup needed mid-session
      audio.pause();
      audio.src = "";                 // KEY: forces iOS/Android to release the audio session
      setIsSpeaking(false);
    }
    try { speechSynthesis.cancel(); } catch {}
  }, []);

  /**
   * Mic button click handler.
   * Stops active TTS before starting recording — critical on mobile because
   * having an Audio element playing while SpeechRecognition starts causes an
   * audio-session conflict that silently prevents mic capture on Android and iOS.
   */
  const handleMicClick = useCallback(() => {
    if (isPreparing) return;
    if (isListening) {
      stopListening();
    } else {
      stopCurrentAudio();
      startListening();
    }
  }, [isPreparing, isListening, stopListening, stopCurrentAudio, startListening]);

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      evaluateWithAI(textInput.trim());
      setTextInput("");
    }
  };

  const generateNextTurn = useCallback(async (history: Array<{ dutch: string; studentResponse?: string }>, nextTurnNumber: number): Promise<ConversationTurn | null> => {
    setIsGeneratingTurn(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-turn", {
        body: {
          conversationHistory: history,
          turnNumber: nextTurnNumber,
          totalTurns: activeTurns.length,
          scenarioContext: scenarioTitle,
        },
      });

      if (error) throw error;

      const newTurn: ConversationTurn = {
        speaker: "dutch",
        dutchText: data.dutchText,
        englishHint: data.englishHint,
        expectedResponses: [],
        feedbackOnWrong: "Try to respond naturally in Dutch!",
        grammarTip: data.grammarTip,
      };

      setDynamicTurns(prev => {
        const updated = [...prev];
        updated[nextTurnNumber - 1] = newTurn;
        return updated;
      });

      return newTurn;
    } catch (e) {
      console.error("Failed to generate next turn:", e);
      return null;
    } finally {
      setIsGeneratingTurn(false);
    }
  }, [activeTurns.length, scenarioTitle]);

  // Track conversation history when a new turn starts
  useEffect(() => {
    if (openEnded && turn) {
      setConversationHistory(prev => {
        // Only add if this turn's dutch text isn't already tracked
        if (prev.length === currentTurn) {
          return [...prev, { dutch: turn.dutchText }];
        }
        return prev;
      });
    }
  }, [currentTurn, turn, openEnded]);

  const handleNext = async () => {
    cancelListening(); // Stop any active recording without submitting
    setFeedback(null);
    setShowAnalysis(false);
    setShowTextInput(false);
    if (currentTurn + 1 >= activeTurns.length) {
      onComplete();
    } else {
      const nextTurnIdx = currentTurn + 1;
      let nextTurn: ConversationTurn | null | undefined = null;

      // For open-ended, generate the next turn dynamically based on conversation.
      // Pre-activate an Audio element synchronously HERE (gesture context is still live)
      // so that the subsequent async play() call succeeds on iOS WebKit browsers.
      if (openEnded && nextTurnIdx >= 1) {
        if (!muted) {
          const audio = new Audio();
          // play() will fail (no src) but activates the element in iOS gesture context
          audio.play().catch(() => {});
          pendingActivatedAudioRef.current = audio;
        }
        nextTurn = await generateNextTurn(conversationHistory, nextTurnIdx + 1);
      }

      // Fall back to static turn if generation failed or not open-ended
      if (!nextTurn) {
        nextTurn = turns[nextTurnIdx];
      }

      setCurrentTurn(nextTurnIdx);
      // Play TTS directly from gesture context (critical for mobile Safari)
      if (nextTurn && !muted) {
        speakDutch(nextTurn.dutchText);
      }
    }
  };

  const handleRetry = () => {
    setFeedback(null);
    setShowAnalysis(false);
    setRecordedAudioUrl(null);
    setShowTextInput(false);
  };

  const playRecording = useCallback(() => {
    if (recordedAudioUrl) {
      const audio = new Audio(recordedAudioUrl);
      audio.play();
    }
  }, [recordedAudioUrl]);

  const isWrong = feedback && (feedback.aiFeedback.grade === "incorrect" || feedback.aiFeedback.grade === "needs_improvement");

  return (
    <div className="flex min-h-[70vh] flex-col">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-display font-bold text-foreground">
            Turn {currentTurn + 1} of {activeTurns.length}
          </span>
          <span className="font-semibold text-primary">
            Score: {score}/{activeTurns.length}
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

      {/* Image for this turn */}
      {turn.imageUrl && (
        <motion.div
          key={`img-${currentTurn}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 overflow-hidden rounded-2xl border border-border shadow-card"
        >
          <img
            src={turn.imageUrl}
            alt={turn.imageDescription || "Scene image"}
            className="w-full h-48 object-cover"
          />
          {turn.imageDescription && (
            <div className="bg-card px-4 py-2 text-xs text-muted-foreground italic">
              📷 Describe what you see and use it in your answer
            </div>
          )}
        </motion.div>
      )}

      {/* Loading state for generating next turn */}
      {isGeneratingTurn ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 flex items-center gap-3 py-8 justify-center"
        >
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Generating next question...</p>
        </motion.div>
      ) : (
      /* Speaker bubble */
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
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={() => speakDutch()}
                  disabled={isSpeaking}
                  className="flex items-center gap-1 text-sm font-medium text-secondary hover:text-secondary/80 transition-colors disabled:opacity-50"
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : isSpeaking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                  {muted ? "Muted" : isSpeaking ? "Playing..." : "Listen"}
                </button>
              </div>
              {/* Speed control */}
              <div className="mt-3 flex items-center gap-3">
                <span className="text-xs text-muted-foreground whitespace-nowrap">🐢 Slow</span>
                <Slider
                  value={[speechRate]}
                  onValueChange={(v) => setSpeechRate(v[0])}
                  min={0.5}
                  max={1.3}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">Fast 🐇</span>
                <span className="text-xs font-mono text-muted-foreground w-8">{speechRate.toFixed(1)}x</span>
              </div>
            </div>
            <p className="mt-3 rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground italic">
              💡 {turn.englishHint}
            </p>
          </div>
        </div>
      </motion.div>
      )}

      {/* Response area */}
      <AnimatePresence mode="wait">
        {isEvaluating ? (
          <motion.div
            key="evaluating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-auto flex flex-col items-center gap-3 py-8"
          >
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">
              Evaluating your Dutch... 🇳🇱
            </p>
          </motion.div>
        ) : !feedback ? (
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
                onClick={handleMicClick}
                whileTap={{ scale: 0.95 }}
                disabled={!micEnabled || isPreparing}
                className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-200 ${
                  !micEnabled
                    ? "bg-muted text-muted-foreground opacity-40"
                    : isPreparing
                    ? "bg-muted text-muted-foreground"
                    : isListening
                    ? "bg-destructive text-destructive-foreground scale-110"
                    : "bg-gradient-hero text-primary-foreground shadow-primary"
                }`}
                style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
              >
                {isListening && (
                  <>
                    <span className="absolute inset-0 rounded-full bg-destructive/30 animate-ping" />
                    <span className="absolute inset-[-4px] rounded-full border-2 border-destructive/50 animate-pulse" />
                  </>
                )}
                {isPreparing ? (
                  <Loader2 className="h-8 w-8 animate-spin relative z-10" />
                ) : isListening ? (
                  <MicOff className="h-8 w-8 relative z-10" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </motion.button>
              <p className="text-sm font-medium text-muted-foreground">
                {isPreparing
                  ? "Preparing mic..."
                  : isListening
                  ? recordingSettings.mode === "manual"
                    ? "Recording... tap to stop"
                    : "Listening..."
                  : !micEnabled
                  ? "Playing..."
                  : "Tap to speak your answer"
                }
              </p>
              {isListening && interimText && (
                <p className="text-xs text-muted-foreground/70 italic max-w-xs text-center truncate">
                  "{interimText}"
                </p>
              )}
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
            className="mt-auto space-y-4"
          >
            {/* User's answer */}
            <div className="flex justify-end">
              <div className={`rounded-2xl rounded-br-md px-5 py-3 ${
                gradeConfig[feedback.aiFeedback.grade].bg
              } border`}>
                <p className="text-sm font-medium text-muted-foreground">You said:</p>
                <p className="font-display text-lg font-bold text-foreground">{feedback.userAnswer}</p>
                {recordedAudioUrl && (
                  <button
                    onClick={playRecording}
                    className="mt-2 flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    <Play className="h-4 w-4" />
                    Play my recording
                  </button>
                )}
              </div>
            </div>

            {/* AI Feedback card */}
            <div className={`rounded-2xl p-5 border ${gradeConfig[feedback.aiFeedback.grade].bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <p className={`font-display text-lg font-bold ${gradeConfig[feedback.aiFeedback.grade].color}`}>
                  {gradeConfig[feedback.aiFeedback.grade].emoji} {gradeConfig[feedback.aiFeedback.grade].label}
                </p>
                {/* CEFR Level Badge */}
                {feedback.aiFeedback.cefrLevel && (
                  <span className="ml-auto rounded-full bg-secondary/20 px-3 py-0.5 text-xs font-bold text-secondary">
                    {feedback.aiFeedback.cefrLevel}
                  </span>
                )}
              </div>

              {/* Star Rating */}
              {feedback.aiFeedback.starRating && (
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-5 w-5 ${
                        s <= (feedback.aiFeedback.starRating || 0)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-sm text-muted-foreground">
                    {feedback.aiFeedback.starRating}/5
                  </span>
                </div>
              )}

              <p className="text-foreground">{feedback.aiFeedback.feedback}</p>

              {/* Corrected Dutch */}
              <div className="mt-3 rounded-xl bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-secondary">
                    <MessageSquare className="inline h-4 w-4 mr-1" />
                    Ideal response
                  </p>
                  <button
                    onClick={() => speakDutch(feedback.aiFeedback.correctedDutch)}
                    className="flex items-center gap-1 text-xs font-medium text-secondary hover:text-secondary/80 transition-colors"
                  >
                    <Volume2 className="h-3 w-3" />
                    Listen
                  </button>
                </div>
                <p className="mt-1 font-display font-bold text-foreground">
                  {feedback.aiFeedback.correctedDutch}
                </p>
              </div>

              {/* Collapsible analysis - hidden by default for wrong answers */}
              {isWrong && !showAnalysis ? (
                <button
                  onClick={() => setShowAnalysis(true)}
                  className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl bg-card p-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronDown className="h-4 w-4" />
                  Show detailed analysis
                </button>
              ) : null}

              {/* Analysis content - always show for correct answers, toggle for wrong */}
              {(!isWrong || showAnalysis) && (
                <>
                  {/* Grammar Notes */}
                  {feedback.aiFeedback.grammarNotes.length > 0 && (
                    <div className="mt-3 rounded-xl bg-card p-4">
                      <p className="text-sm font-semibold text-secondary">
                        <BookOpen className="inline h-4 w-4 mr-1" />
                        Grammar Notes
                      </p>
                      <ul className="mt-1 space-y-1">
                        {feedback.aiFeedback.grammarNotes.map((note, i) => (
                          <li key={i} className="text-sm text-foreground">• {note}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Pronunciation Tips */}
                  {feedback.aiFeedback.pronunciationTips && feedback.aiFeedback.pronunciationTips.length > 0 && (
                    <div className="mt-3 rounded-xl bg-card p-4">
                      <p className="text-sm font-semibold text-primary">
                        🗣️ Pronunciation Tips
                      </p>
                      <ul className="mt-1 space-y-1">
                        {feedback.aiFeedback.pronunciationTips.map((tip, i) => (
                          <li key={i} className="text-sm text-foreground">• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Vocabulary Notes */}
                  {feedback.aiFeedback.vocabularyNotes && feedback.aiFeedback.vocabularyNotes.length > 0 && (
                    <div className="mt-3 rounded-xl bg-card p-4">
                      <p className="text-sm font-semibold text-accent">
                        📖 Vocabulary
                      </p>
                      <ul className="mt-1 space-y-1">
                        {feedback.aiFeedback.vocabularyNotes.map((note, i) => (
                          <li key={i} className="text-sm text-foreground">• {note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-3 pt-2">
              {isWrong && (
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
                {isGeneratingTurn ? "Loading..." : currentTurn + 1 >= activeTurns.length ? "Finish!" : "Next"}
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
