import { useRef, useState, useCallback, useEffect } from "react";
import { logSpeechEvent } from "@/lib/speechDebugLog";
import { useMic } from "./MicContext";

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
 * - Global MicContext for persistent mic stream across turns
 * - Synchronous start on subsequent turns (preserves iOS gesture context)
 * - No destructive track refreshing
 * - Fixed permission-denied restart loop
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

  // Consume global mic state
  const { isMicReady, checkMicHealth, ensureMicStream } = useMic();

  const recognitionRef = useRef<any>(null);
  const accumulatedTranscriptRef = useRef("");
  const isStoppingRef = useRef(false);
  const hasSubmittedRef = useRef(false);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noSpeechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restartCountRef = useRef(0);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasReceivedSpeechRef = useRef(false);
  // Session generation counter — prevents stale onend handlers from restarting
  // a recognition instance that belongs to a previous session.
  const sessionIdRef = useRef(0);

  const isSafari = isSafariBrowser();
  const isMobile = isMobileDevice();

  // Stable refs for callbacks
  const onTranscriptRef = useRef(onTranscript);
  const onFallbackRef = useRef(onFallbackToText);
  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);
  useEffect(() => { onFallbackRef.current = onFallbackToText; }, [onFallbackToText]);

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

  const startListening = useCallback(() => {
    // Pre-flight checks
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      logSpeechEvent(scenario, "api-unavailable", { userAgent: navigator.userAgent });
      onFallbackRef.current();
      return;
    }

    // Clean up any zombie recognition from a previous session before starting fresh.
    // This prevents two SpeechRecognition instances fighting for the mic.
    try { recognitionRef.current?.abort(); } catch {}
    recognitionRef.current = null;

    // Bump session generation — stale onend handlers from the previous session
    // will see a mismatched ID and exit without restarting.
    sessionIdRef.current++;
    const currentSessionId = sessionIdRef.current;

    // Reset state
    accumulatedTranscriptRef.current = "";
    isStoppingRef.current = false;
    hasSubmittedRef.current = false;
    hasReceivedSpeechRef.current = false;
    restartCountRef.current = 0;
    setInterimText("");

    logSpeechEvent(scenario, "start-requested", {
      mode, autoStopSeconds, isSafari, isMobile, isMicReady,
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
          // FIX: Set isStoppingRef to prevent onend from triggering restart loop
          isStoppingRef.current = true;
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
          sessionId: currentSessionId,
          currentSessionId: sessionIdRef.current,
        });

        // Guard: if a newer session has started, this onend is stale — bail out.
        if (currentSessionId !== sessionIdRef.current) return;

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

    // ===== CONTEXT-AWARE START LOGIC =====
    // Verify stream health before using the sync path — tracks may have died
    // (OS reclaimed mic, tab was backgrounded on mobile, etc.)
    const micActuallyHealthy = isMicReady && checkMicHealth();

    if (micActuallyHealthy) {
      // Mic is already hot from context — start SYNCHRONOUSLY to preserve iOS user gesture
      logSpeechEvent(scenario, "sync-start", { reason: "global-mic-ready" });
      setIsListening(true);
      createAndStart();
      startNoSpeechTimer();
      // NOTE: Do NOT call ensureMicStream() concurrently here.
      // On iOS, calling getUserMedia while SpeechRecognition is already active can conflict
      // with the microphone hardware and cause recognition to silently stop capturing audio.
    } else if (isMicReady) {
      // Mic permission was previously granted but the MediaStream tracks died
      // (common on iOS when TTS audio reclaims the audio session between turns).
      // Since permission is already granted, start recognition SYNCHRONOUSLY to
      // preserve iOS gesture context — SpeechRecognition will re-acquire the mic internally.
      // Re-acquire the MicContext stream in the background to restore health state.
      logSpeechEvent(scenario, "sync-start", { reason: "mic-permission-granted-stream-dead" });
      setIsListening(true);
      createAndStart();
      startNoSpeechTimer();
      ensureMicStream().catch(() => {});
    } else {
      // First time — must await getUserMedia (permission dialog may appear)
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
  }, [scenario, lang, mode, autoStopSeconds, isSafari, isMobile, cleanupSession, submitFinal, ensureMicStream, isMicReady, checkMicHealth]);

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

  // Cleanup on unmount — only clean up recognition session, NOT the mic stream
  useEffect(() => {
    return () => {
      isStoppingRef.current = true;
      cleanupSession();
      // NOTE: We do NOT call releaseMic() here — the mic stays hot in MicContext
    };
  }, [cleanupSession]);

  return {
    isListening,
    isPreparing,
    interimText,
    startListening,
    stopListening,
    cancelListening,
  };
}
