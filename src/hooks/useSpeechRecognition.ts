import { useRef, useState, useCallback, useEffect } from "react";
import { logSpeechEvent } from "@/lib/speechDebugLog";

interface UseSpeechRecognitionOptions {
  /** Scenario name for debug logging */
  scenario: string;
  /** Language for recognition */
  lang?: string;
  /** Called when a final transcript is ready */
  onTranscript: (transcript: string) => void;
  /** Called when speech recognition is not available or permission denied */
  onFallbackToText: () => void;
  /** "auto" = stop after autoStopSeconds, "manual" = user clicks stop */
  mode: "auto" | "manual";
  /** Seconds before auto-stop (only used in auto mode) */
  autoStopSeconds: number;
}

const isSafariBrowser = () => /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isMobileDevice = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

/**
 * Robust speech recognition hook that handles:
 * - Safari's auto-stop behavior (restarts automatically)
 * - Mobile Chrome permission quirks
 * - Accumulates transcript across restarts
 * - Auto-stop timer for "auto" mode
 * - Manual stop for "manual" mode
 * - Graceful fallback to text input
 */
export function useSpeechRecognition({
  scenario,
  lang = "nl-NL",
  onTranscript,
  onFallbackToText,
  mode,
  autoStopSeconds,
}: UseSpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");

  // Refs to survive across closures
  const recognitionRef = useRef<any>(null);
  const accumulatedTranscriptRef = useRef("");
  const isStoppingRef = useRef(false);
  const hasSubmittedRef = useRef(false);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restartCountRef = useRef(0);
  const lastActivityRef = useRef(0);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSafari = isSafariBrowser();
  const isMobile = isMobileDevice();

  // Stable refs for callbacks
  const onTranscriptRef = useRef(onTranscript);
  const onFallbackRef = useRef(onFallbackToText);
  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);
  useEffect(() => { onFallbackRef.current = onFallbackToText; }, [onFallbackToText]);

  const cleanup = useCallback(() => {
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    try { recognitionRef.current?.abort(); } catch {}
    recognitionRef.current = null;
    setIsListening(false);
    setInterimText("");
  }, []);

  const submitFinal = useCallback(() => {
    if (hasSubmittedRef.current) return;
    const transcript = accumulatedTranscriptRef.current.trim();
    if (!transcript) {
      logSpeechEvent(scenario, "submit-empty", { message: "No transcript accumulated" });
      cleanup();
      return;
    }
    hasSubmittedRef.current = true;
    logSpeechEvent(scenario, "submit-final", { transcript, restarts: restartCountRef.current });
    cleanup();
    onTranscriptRef.current(transcript);
  }, [scenario, cleanup]);

  const startListening = useCallback(() => {
    // Pre-flight checks
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      logSpeechEvent(scenario, "api-unavailable", { userAgent: navigator.userAgent });
      onFallbackRef.current();
      return;
    }

    // Reset state
    accumulatedTranscriptRef.current = "";
    isStoppingRef.current = false;
    hasSubmittedRef.current = false;
    restartCountRef.current = 0;
    lastActivityRef.current = Date.now();
    setInterimText("");

    logSpeechEvent(scenario, "start-requested", {
      mode, autoStopSeconds, isSafari, isMobile,
    });

    const createAndStart = () => {
      // Don't restart if user already stopped or submitted
      if (isStoppingRef.current || hasSubmittedRef.current) return;

      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      // Safari: continuous=true causes issues. Chrome: works fine.
      recognition.continuous = !isSafari;

      recognition.onresult = (event: any) => {
        lastActivityRef.current = Date.now();
        let sessionFinal = "";
        let interim = "";

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            sessionFinal += result[0].transcript + " ";
          } else {
            interim = result[0].transcript;
          }
        }

        if (sessionFinal.trim()) {
          // Append final results to accumulated transcript
          accumulatedTranscriptRef.current += sessionFinal;
          logSpeechEvent(scenario, "result-final", {
            chunk: sessionFinal.trim(),
            accumulated: accumulatedTranscriptRef.current.trim(),
          });
        }

        // Show interim text for UI feedback
        const display = (accumulatedTranscriptRef.current + interim).trim();
        setInterimText(display);

        // In auto mode on non-Safari, submit after first final result + small delay
        if (mode === "auto" && sessionFinal.trim() && !isSafari) {
          // Reset silence timer — submit after 1.5s of no new results
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            submitFinal();
          }, 1500);
        }
      };

      recognition.onerror = (event: any) => {
        const error = event.error;
        logSpeechEvent(scenario, "recognition-error", { error, restarts: restartCountRef.current });

        if (error === "not-allowed" || error === "service-not-allowed") {
          logSpeechEvent(scenario, "permission-denied", { error });
          cleanup();
          onFallbackRef.current();
          return;
        }

        if (error === "no-speech") {
          // Browser timed out waiting for speech — this is normal
          // onend will fire next and handle restart
          return;
        }

        if (error === "aborted") {
          // Usually means we called .stop() or .abort() — normal flow
          return;
        }

        // Unknown error — try to submit what we have
        logSpeechEvent(scenario, "unknown-error-submitting", { error });
        submitFinal();
      };

      recognition.onend = () => {
        logSpeechEvent(scenario, "session-ended", {
          isStoppingManually: isStoppingRef.current,
          hasSubmitted: hasSubmittedRef.current,
          accumulated: accumulatedTranscriptRef.current.trim(),
          restarts: restartCountRef.current,
        });

        if (hasSubmittedRef.current) return;

        // If user requested stop, submit what we have
        if (isStoppingRef.current) {
          // Short delay to catch any late onresult events
          setTimeout(() => submitFinal(), 200);
          return;
        }

        // Browser auto-stopped (Safari does this often, Chrome after no-speech)
        // Restart if we haven't exceeded max restarts
        const maxRestarts = isSafari ? 15 : 5;
        if (restartCountRef.current < maxRestarts) {
          restartCountRef.current++;
          logSpeechEvent(scenario, "auto-restart", {
            attempt: restartCountRef.current,
            maxRestarts,
            accumulated: accumulatedTranscriptRef.current.trim(),
          });
          // Small delay before restart to avoid rapid-fire
          setTimeout(() => createAndStart(), isSafari ? 100 : 50);
        } else {
          logSpeechEvent(scenario, "max-restarts-reached", { maxRestarts });
          submitFinal();
        }
      };

      recognitionRef.current = recognition;

      try {
        recognition.start();
        logSpeechEvent(scenario, "session-started", { restart: restartCountRef.current });
      } catch (err: any) {
        logSpeechEvent(scenario, "start-exception", {
          error: err?.message || String(err),
          restart: restartCountRef.current,
        });
        // If first start fails, fall back to text
        if (restartCountRef.current === 0) {
          cleanup();
          onFallbackRef.current();
        }
      }
    };

    // Start the first recognition session
    createAndStart();
    setIsListening(true);

    // Auto-stop timer (only in auto mode)
    if (mode === "auto") {
      autoStopTimerRef.current = setTimeout(() => {
        logSpeechEvent(scenario, "auto-stop-timer-fired", {
          seconds: autoStopSeconds,
          accumulated: accumulatedTranscriptRef.current.trim(),
        });
        isStoppingRef.current = true;
        try { recognitionRef.current?.stop(); } catch {}
        // Force submit after grace period
        setTimeout(() => {
          if (!hasSubmittedRef.current) {
            submitFinal();
          }
        }, 800);
      }, autoStopSeconds * 1000);
    }
  }, [scenario, lang, mode, autoStopSeconds, isSafari, isMobile, cleanup, submitFinal]);

  const stopListening = useCallback(() => {
    logSpeechEvent(scenario, "stop-requested", {
      accumulated: accumulatedTranscriptRef.current.trim(),
    });
    isStoppingRef.current = true;
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    try { recognitionRef.current?.stop(); } catch {}
    // Force submit after short delay (onend should handle it, this is a safety net)
    setTimeout(() => {
      if (!hasSubmittedRef.current) {
        submitFinal();
      }
    }, 600);
  }, [scenario, submitFinal]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isStoppingRef.current = true;
      cleanup();
    };
  }, [cleanup]);

  return {
    isListening,
    interimText,
    startListening,
    stopListening,
  };
}
