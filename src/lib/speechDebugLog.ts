export interface SpeechLogEntry {
  id: string;
  timestamp: string;
  scenario: string;
  event: string;
  details: Record<string, any>;
}

const STORAGE_KEY = "speech_debug_logs";
const MAX_ENTRIES = 200;

export function getSpeechLogs(): SpeechLogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function clearSpeechLogs() {
  localStorage.removeItem(STORAGE_KEY);
}

export function logSpeechEvent(scenario: string, event: string, details: Record<string, any> = {}) {
  const entry: SpeechLogEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    scenario,
    event,
    details: {
      ...details,
      userAgent: navigator.userAgent,
      isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
    },
  };
  console.log(`[SpeechLog] ${event}`, details);
  const logs = getSpeechLogs();
  logs.unshift(entry);
  if (logs.length > MAX_ENTRIES) logs.length = MAX_ENTRIES;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}
