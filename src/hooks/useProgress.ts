import { useState, useCallback, useEffect } from "react";

export interface ScenarioProgress {
  completedCount: number;
  lastCompletedAt: string | null;
}

export interface ProgressData {
  scenarios: Record<string, ScenarioProgress>;
  totalCompleted: number;
}

const STORAGE_KEY = "praat-maar-progress";

function loadProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { scenarios: {}, totalCompleted: 0 };
}

function saveProgress(data: ProgressData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressData>(loadProgress);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const recordCompletion = useCallback((scenarioId: string) => {
    setProgress((prev) => {
      const existing = prev.scenarios[scenarioId] || { completedCount: 0, lastCompletedAt: null };
      return {
        ...prev,
        totalCompleted: prev.totalCompleted + 1,
        scenarios: {
          ...prev.scenarios,
          [scenarioId]: {
            completedCount: existing.completedCount + 1,
            lastCompletedAt: new Date().toISOString(),
          },
        },
      };
    });
  }, []);

  return { progress, recordCompletion };
}

const MUTE_KEY = "praat-maar-muted";

export function useMutePreference() {
  const [muted, setMuted] = useState(() => {
    try { return localStorage.getItem(MUTE_KEY) === "true"; } catch { return false; }
  });

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem(MUTE_KEY, String(next));
      return next;
    });
  }, []);

  return { muted, toggleMute };
}
