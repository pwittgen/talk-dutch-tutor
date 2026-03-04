import { useState, useCallback } from "react";

export interface RecordingSettings {
  mode: "auto" | "manual";
  autoStopSeconds: number;
}

const STORAGE_KEY = "praat-maar-recording-settings";

const defaultSettings: RecordingSettings = {
  mode: "auto",
  autoStopSeconds: 5,
};

function loadSettings(): RecordingSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {}
  return defaultSettings;
}

export function useRecordingSettings() {
  const [settings, setSettingsState] = useState<RecordingSettings>(loadSettings);

  const updateSettings = useCallback((partial: Partial<RecordingSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { settings, updateSettings };
}
