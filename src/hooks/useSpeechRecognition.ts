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
 * - Persistent mic stream across turns (no re-prompt per turn)
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
  const hasReceivedSpeechRef = useRef(false);

  // Persistent mic stream — acquired once, kept alive across turns
  const micStreamRef = useRef<MediaStream | null>(null);
  const micAcquiredRef = useRef(false);

  const isSafari = isSafariBrowser();
  const isMobile = isMobileDevice();

  // Stable refs for callbacks
  const onTranscriptRef = useRef(onTranscript);
  const onFallbackRef = useRef(onFallbackToText);
  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);
  useEffect(() => { onFallbackRef.current = onFallbackToText; }, [onFallbackToText]);

  /** Release mic hardware — only called on unmount */
  const releaseMic = useCallback(() => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
      micAcquiredRef.current = false;
      logSpeechEvent(scenario, "mic-released", {});
    }
  }, [scenario]);

  /** Clean up recognition session (timers, recognition instance) but NOT the mic stream */
  const cleanupSession = useCallback(() => {
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
    setIsListening(false);
    setIsPreparing(false);
    setInterimText("");
  }, []);

  const submitFinal = useCallback(() => {
    if (hasSubmittedRef.current) return;
    const transcript = accumulatedTranscriptRef.current.trim();
    if (!transcript) {
      logSpeechEvent(scenario, "submit-empty", { message: "No transcript accumulated" });
      cleanupSession();
      return;
    }
    hasSubmittedRef.current = true;
    logSpeechEvent(scenario, "submit-final", { transcript, restarts: restartCountRef.current });
    cleanupSession();
    onTranscriptRef.current(transcript);
  }, [scenario, cleanupSession]);

  /** Acquire mic stream — on Safari mobile, always get a fresh stream to re-activate the audio pipeline */
  const ensureMicStream = useCallback(async (): Promise<boolean> => {
    // On Safari mobile, always refresh the stream to wake up the audio hardware
    // Permission is cached so this won't show a prompt after the first time
    const needsFreshStream = isSafari && isMobile;

    if (!needsFreshStream && micStreamRef.current) {
      const tracks = micStreamRef.current.getTracks();
      const allLive = tracks.length > 0 && tracks.every(t => t.readyState === "live");
      if (allLive) {
        logSpeechEvent(scenario, "mic-reused", {});
        return true; // Stream still good
      }
      // Stream died, clean up reference
      micStreamRef.current = null;
      micAcquiredRef.current = false;
    }

    // Release old stream before acquiring new one
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }

    try {
      logSpeechEvent(scenario, "mic-warmup-start", { fresh: needsFreshStream });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      micAcquiredRef.current = true;
      logSpeechEvent(scenario, "mic-warmup-success", {});
      return true;
    } catch (err: any) {
      logSpeechEvent(scenario, "mic-warmup-failed", { error: err?.message || String(err) });
      return false;
    }
  }, [scenario, isSafari, isMobile]);

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

    logSpeechEvent(scenario, "start-requested", {
      mode, autoStopSeconds, isSafari, isMobile, micAcquired: micAcquiredRef.current,
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
          cleanupSession();
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
          cleanupSession();
          onFallbackRef.current();
        }
      }
    };

    const startNoSpeechTimer = () => {
      noSpeechTimerRef.current = setTimeout(() => {
        if (!hasReceivedSpeechRef.current && !hasSubmittedRef.current && !isStoppingRef.current) {
          logSpeechEvent(scenario, "no-speech-timeout", { seconds: 8 });
          cleanupSession();
          onFallbackRef.current();
        }
      }, 8000);
    };

    // ===== KEY FIX: Preserve gesture context on subsequent calls =====
    if (micAcquiredRef.current) {
      // Mic permission already acquired — start recognition SYNCHRONOUSLY
      // to preserve the user gesture context (critical for mobile Safari)
      logSpeechEvent(scenario, "sync-start", { reason: "mic-already-acquired" });
      setIsListening(true);
      createAndStart();
      startNoSpeechTimer();

      // Refresh mic stream in background (fire-and-forget) for Safari
      if (isSafari && isMobile) {
        ensureMicStream().catch(() => {});
      }
    } else {
      // First time — must await getUserMedia (user expects brief delay)
      setIsPreparing(true);
      const warmupAndStart = async () => {
        const micReady = await ensureMicStream();
        if (!micReady) {
          setIsPreparing(false);
          cleanupSession();
          onFallbackRef.current();
          return;
        }
        setIsPreparing(false);
        setIsListening(true);
        createAndStart();
        startNoSpeechTimer();
      };
      warmupAndStart();
    }
  }, [scenario, lang, mode, autoStopSeconds, isSafari, isMobile, cleanupSession, submitFinal, ensureMicStream]);

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

  /** Cancel any active listening without submitting — used when advancing turns */
  const cancelListening = useCallback(() => {
    logSpeechEvent(scenario, "cancel-requested", {});
    isStoppingRef.current = true;
    hasSubmittedRef.current = true; // Prevent submitFinal from firing
    cleanupSession();
  }, [scenario, cleanupSession]);

  // Cleanup on unmount — this is where we release the mic
  useEffect(() => {
    return () => {
      isStoppingRef.current = true;
      cleanupSession();
      releaseMic();
    };
  }, [cleanupSession, releaseMic]);

  return {
    isListening,
    isPreparing,
    interimText,
    startListening,
    stopListening,
    cancelListening,
  };
}
