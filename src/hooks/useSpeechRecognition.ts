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
 * Robust speech recognition hook with:
 * - getUserMedia pre-warming (fixes mobile Safari/Chrome)
 * - Delayed auto-stop (waits for first speech before starting timer)
 * - No-speech timeout fallback
 * - Safari auto-restart handling
 * - Accumulated transcript across restarts
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
  const [isPreparing, setIsPreparing] = useState(false);
  const [interimText, setInterimText] = useState("");

  const recognitionRef = useRef<any>(null);
  const accumulatedTranscriptRef = useRef("");
  const isStoppingRef = useRef(false);
  const hasSubmittedRef = useRef(false);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noSpeechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restartCountRef = useRef(0);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const hasReceivedSpeechRef = useRef(false);

  const isSafari = isSafariBrowser();
  const isMobile = isMobileDevice();

  // Stable refs for callbacks
  const onTranscriptRef = useRef(onTranscript);
  const onFallbackRef = useRef(onFallbackToText);
  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);
  useEffect(() => { onFallbackRef.current = onFallbackToText; }, [onFallbackToText]);

  const releaseMic = useCallback(() => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (noSpeechTimerRef.current) {
      clearTimeout(noSpeechTimerRef.current);
      noSpeechTimerRef.current = null;
    }
    try { recognitionRef.current?.abort(); } catch {}
    recognitionRef.current = null;
    releaseMic();
    setIsListening(false);
    setIsPreparing(false);
    setInterimText("");
  }, [releaseMic]);

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
    hasReceivedSpeechRef.current = false;
    restartCountRef.current = 0;
    setInterimText("");
    setIsPreparing(true);

    logSpeechEvent(scenario, "start-requested", {
      mode, autoStopSeconds, isSafari, isMobile,
    });

    const createAndStart = () => {
      if (isStoppingRef.current || hasSubmittedRef.current) return;

      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = !isSafari;

      recognition.onresult = (event: any) => {
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

        // First speech received — start auto-stop timer now
        if (!hasReceivedSpeechRef.current && (sessionFinal.trim() || interim.trim())) {
          hasReceivedSpeechRef.current = true;
          logSpeechEvent(scenario, "first-speech-detected", { interim: interim.trim(), final: sessionFinal.trim() });

          // Cancel the no-speech timeout
          if (noSpeechTimerRef.current) {
            clearTimeout(noSpeechTimerRef.current);
            noSpeechTimerRef.current = null;
          }

          // Start auto-stop timer NOW (only in auto mode)
          if (mode === "auto") {
            autoStopTimerRef.current = setTimeout(() => {
              logSpeechEvent(scenario, "auto-stop-timer-fired", {
                seconds: autoStopSeconds,
                accumulated: accumulatedTranscriptRef.current.trim(),
              });
              isStoppingRef.current = true;
              try { recognitionRef.current?.stop(); } catch {}
              setTimeout(() => {
                if (!hasSubmittedRef.current) submitFinal();
              }, 800);
            }, autoStopSeconds * 1000);
          }
        }

        if (sessionFinal.trim()) {
          accumulatedTranscriptRef.current += sessionFinal;
          logSpeechEvent(scenario, "result-final", {
            chunk: sessionFinal.trim(),
            accumulated: accumulatedTranscriptRef.current.trim(),
          });
        }

        const display = (accumulatedTranscriptRef.current + interim).trim();
        setInterimText(display);

        // In auto mode, reset silence sub-timer on each result
        if (mode === "auto" && sessionFinal.trim() && !isSafari) {
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

        if (error === "no-speech" || error === "aborted") return;

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

        if (isStoppingRef.current) {
          setTimeout(() => submitFinal(), 200);
          return;
        }

        const maxRestarts = isSafari ? 15 : 5;
        if (restartCountRef.current < maxRestarts) {
          restartCountRef.current++;
          logSpeechEvent(scenario, "auto-restart", {
            attempt: restartCountRef.current,
            maxRestarts,
            accumulated: accumulatedTranscriptRef.current.trim(),
          });
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
        if (restartCountRef.current === 0) {
          cleanup();
          onFallbackRef.current();
        }
      }
    };

    // ===== STEP 1: Pre-warm microphone with getUserMedia =====
    // This must happen in the same user-gesture call stack
    const warmupMic = async () => {
      try {
        logSpeechEvent(scenario, "mic-warmup-start", {});
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        logSpeechEvent(scenario, "mic-warmup-success", {});

        // Mic is ready — now start speech recognition
        setIsPreparing(false);
        setIsListening(true);
        createAndStart();

        // ===== STEP 2: No-speech timeout =====
        // If nothing is detected within 8 seconds, fall back to text input
        noSpeechTimerRef.current = setTimeout(() => {
          if (!hasReceivedSpeechRef.current && !hasSubmittedRef.current && !isStoppingRef.current) {
            logSpeechEvent(scenario, "no-speech-timeout", { seconds: 8 });
            cleanup();
            onFallbackRef.current();
          }
        }, 8000);
      } catch (err: any) {
        logSpeechEvent(scenario, "mic-warmup-failed", { error: err?.message || String(err) });
        setIsPreparing(false);
        cleanup();
        onFallbackRef.current();
      }
    };

    warmupMic();
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
    if (noSpeechTimerRef.current) {
      clearTimeout(noSpeechTimerRef.current);
      noSpeechTimerRef.current = null;
    }
    try { recognitionRef.current?.stop(); } catch {}
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
    isPreparing,
    interimText,
    startListening,
    stopListening,
  };
}
