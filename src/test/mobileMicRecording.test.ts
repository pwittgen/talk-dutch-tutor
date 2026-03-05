/**
 * Mobile microphone recording tests — iOS Safari & Android Chrome
 *
 * These tests simulate the two critical mobile browser environments and verify
 * that the "Random Encounter" mic path behaves correctly:
 *
 * iOS Safari requirement: recognition.start() MUST be called synchronously from
 * a user-gesture callback. Any await before it silently breaks mic capture.
 *
 * Max 5 test attempts. A change is only suggested if a test actually fails.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// ── Mocks ─────────────────────────────────────────────────────────────────────
vi.mock("@/lib/speechDebugLog", () => ({ logSpeechEvent: vi.fn() }));
vi.mock("@/hooks/MicContext", () => ({ useMic: vi.fn() }));

import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useMic } from "@/hooks/MicContext";

// ── User-agent strings ────────────────────────────────────────────────────────
const IOS_SAFARI_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) " +
  "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1";

const ANDROID_CHROME_UA =
  "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36";

// ── Helpers ───────────────────────────────────────────────────────────────────
let _originalUA: string;

function setUA(ua: string) {
  Object.defineProperty(navigator, "userAgent", { value: ua, configurable: true });
}

/**
 * Installs a mock SpeechRecognition class on the window and returns
 * the constructor spy so tests can inspect instances.
 */
function installMockRecognition() {
  const startSpy = vi.fn();
  const abortSpy = vi.fn();
  const stopSpy = vi.fn();
  let lastInstance: any = null;

  class MockSpeechRecognition {
    lang = "";
    interimResults = false;
    maxAlternatives = 1;
    continuous = false;
    onresult: any = null;
    onerror: any = null;
    onend: any = null;
    start = startSpy;
    abort = abortSpy;
    stop = stopSpy;
    constructor() {
      // Capture so tests can inspect properties set by the hook after construction
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      lastInstance = this;
    }
  }

  (window as any).SpeechRecognition = undefined;
  (window as any).webkitSpeechRecognition = MockSpeechRecognition;

  return { startSpy, abortSpy, stopSpy, getInstance: () => lastInstance };
}

/**
 * Provides a MicContext mock. Returns helpers for assertions.
 */
function setupMicContext(isMicReady: boolean) {
  const ensureMicStream = vi.fn().mockResolvedValue(true);
  const releaseMic = vi.fn();
  const checkMicHealth = vi.fn().mockReturnValue(isMicReady);

  (useMic as ReturnType<typeof vi.fn>).mockReturnValue({
    isMicReady,
    ensureMicStream,
    releaseMic,
    checkMicHealth,
  });

  return { ensureMicStream, releaseMic, checkMicHealth };
}

/** Render the hook with the same settings used in Random Encounter */
function renderSpeechHook() {
  return renderHook(() =>
    useSpeechRecognition({
      scenario: "random-encounter",
      onTranscript: vi.fn(),
      onFallbackToText: vi.fn(),
      mode: "auto",
      autoStopSeconds: 5,
    })
  );
}

// ── Setup / Teardown ──────────────────────────────────────────────────────────
beforeEach(() => {
  _originalUA = navigator.userAgent;
});

afterEach(() => {
  Object.defineProperty(navigator, "userAgent", {
    value: _originalUA,
    configurable: true,
  });
  delete (window as any).SpeechRecognition;
  delete (window as any).webkitSpeechRecognition;
  vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Attempt 1 — iOS Safari: sync start when mic permission already granted", () => {
  it("calls recognition.start() synchronously (before startListening returns)", () => {
    setUA(IOS_SAFARI_UA);
    const { startSpy } = installMockRecognition();
    const { ensureMicStream } = setupMicContext(true); // mic already acquired

    const { result } = renderSpeechHook();

    const callOrder: string[] = [];
    startSpy.mockImplementation(() => callOrder.push("recognition.start"));

    act(() => {
      result.current.startListening();
      callOrder.push("after-startListening");
    });

    // KEY ASSERTION: recognition.start() must precede the line after startListening()
    // If it comes after, the call is async — iOS gesture context would be lost.
    expect(callOrder).toEqual(["recognition.start", "after-startListening"]);

    // Must NOT touch getUserMedia again (would be async and lose gesture context)
    expect(ensureMicStream).not.toHaveBeenCalled();
  });
});

describe("Attempt 2 — iOS Safari: async getUserMedia path on very first tap", () => {
  it("calls ensureMicStream (async) when mic not yet granted; start is deferred", () => {
    setUA(IOS_SAFARI_UA);
    const { startSpy } = installMockRecognition();
    const { ensureMicStream } = setupMicContext(false); // first time

    const { result } = renderSpeechHook();

    const callOrder: string[] = [];
    startSpy.mockImplementation(() => callOrder.push("recognition.start"));

    act(() => {
      result.current.startListening();
      callOrder.push("after-startListening");
    });

    // recognition.start() must NOT have been called synchronously — it is
    // deferred until after the getUserMedia permission prompt resolves.
    // (This is accepted behaviour for the very first tap.)
    expect(callOrder).toEqual(["after-startListening"]);

    // ensureMicStream MUST have been called to acquire mic permission
    expect(ensureMicStream).toHaveBeenCalledTimes(1);
  });
});

describe("Attempt 3 — iOS Safari: recognition.continuous is false", () => {
  it("sets continuous=false on the SpeechRecognition instance (Safari requirement)", () => {
    setUA(IOS_SAFARI_UA);
    const { getInstance } = installMockRecognition();
    setupMicContext(true);

    const { result } = renderSpeechHook();
    act(() => { result.current.startListening(); });

    const instance = getInstance();
    expect(instance).not.toBeNull();
    // Safari does not support continuous=true — the hook must set it to false
    expect(instance.continuous).toBe(false);
  });
});

describe("Attempt 4 — Android Chrome: sync start when mic permission already granted", () => {
  it("calls recognition.start() synchronously on Android Chrome too", () => {
    setUA(ANDROID_CHROME_UA);
    const { startSpy } = installMockRecognition();
    const { ensureMicStream } = setupMicContext(true);

    const { result } = renderSpeechHook();

    const callOrder: string[] = [];
    startSpy.mockImplementation(() => callOrder.push("recognition.start"));

    act(() => {
      result.current.startListening();
      callOrder.push("after-startListening");
    });

    expect(callOrder).toEqual(["recognition.start", "after-startListening"]);
    expect(ensureMicStream).not.toHaveBeenCalled();
  });
});

describe("Attempt 5 — Android Chrome: recognition.continuous is true", () => {
  it("sets continuous=true on the SpeechRecognition instance (Chrome supports it)", () => {
    setUA(ANDROID_CHROME_UA);
    const { getInstance } = installMockRecognition();
    setupMicContext(true);

    const { result } = renderSpeechHook();
    act(() => { result.current.startListening(); });

    const instance = getInstance();
    expect(instance).not.toBeNull();
    // Chrome supports continuous recognition — the hook should enable it
    expect(instance.continuous).toBe(true);
  });
});
