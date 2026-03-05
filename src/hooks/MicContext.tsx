import React, { createContext, useContext, useRef, useCallback, useState, useEffect, ReactNode } from 'react';
import { logSpeechEvent } from "@/lib/speechDebugLog";

interface MicContextType {
  isMicReady: boolean;
  ensureMicStream: () => Promise<boolean>;
  releaseMic: () => void;
}

const MicContext = createContext<MicContextType | null>(null);

export function MicProvider({ children, globalScenario = "app-global" }: { children: ReactNode; globalScenario?: string }) {
  const [isMicReady, setIsMicReady] = useState(false);
  const micStreamRef = useRef<MediaStream | null>(null);

  const ensureMicStream = useCallback(async (): Promise<boolean> => {
    // Check if we already have a healthy, live stream
    if (micStreamRef.current) {
      const tracks = micStreamRef.current.getTracks();
      if (tracks.length > 0 && tracks.every(t => t.readyState === "live")) {
        logSpeechEvent(globalScenario, "global-mic-reused", {});
        return true;
      }
      // Clean up dead tracks before requesting new ones
      tracks.forEach(t => t.stop());
      micStreamRef.current = null;
    }

    // Request hardware access
    try {
      logSpeechEvent(globalScenario, "global-mic-warmup-start", {});
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setIsMicReady(true);
      logSpeechEvent(globalScenario, "global-mic-warmup-success", {});
      return true;
    } catch (err: any) {
      logSpeechEvent(globalScenario, "global-mic-warmup-failed", { error: err?.message || String(err) });
      setIsMicReady(false);
      return false;
    }
  }, [globalScenario]);

  const releaseMic = useCallback(() => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
      setIsMicReady(false);
      logSpeechEvent(globalScenario, "global-mic-released", {});
    }
  }, [globalScenario]);

  // Release when the entire app unmounts
  useEffect(() => {
    return () => releaseMic();
  }, [releaseMic]);

  return (
    <MicContext.Provider value={{ isMicReady, ensureMicStream, releaseMic }}>
      {children}
    </MicContext.Provider>
  );
}

export const useMic = () => {
  const context = useContext(MicContext);
  if (!context) throw new Error("useMic must be used within a MicProvider");
  return context;
};
