

## Analysis

Two issues found in the logs and code:

### Issue 1: Speech Recognition loses gesture context
In `startListening`, the `warmupAndStart` async function does `await ensureMicStream()` before calling `createAndStart()`. On mobile Safari, after an `await`, the user gesture context is lost. This means `recognition.start()` runs outside a trusted gesture, causing Safari to silently fail to capture audio. This explains why the mic "starts" (green indicators) but captures nothing (`submit-empty`).

### Issue 2: TTS not playing on next turn
The auto-play effect (line 149) fires `speakDutch()` inside a `setTimeout` within `useEffect`. This is not a user gesture context, so Safari blocks audio playback on turn transitions.

## Plan

### 1. Fix gesture context in `useSpeechRecognition.ts`

Restructure `startListening` so that `recognition.start()` is called **synchronously** from the click handler, not after an `await`:

- Track whether mic permission has been acquired at least once (`micAcquiredRef`)
- On first call: `await getUserMedia` then `createAndStart()` (user expects a brief delay)
- On subsequent calls: call `createAndStart()` **immediately** (synchronously), and refresh the `getUserMedia` stream in the background (fire-and-forget) — this preserves the gesture context chain
- This ensures Safari's audio pipeline is activated by the trusted gesture

### 2. Fix TTS playback on turn change in `ConversationView.tsx`

- In `handleNext`, call `speakDutch()` directly after setting the next turn (within the click handler's gesture context), instead of relying on the `useEffect` + `setTimeout`
- Keep the `useEffect` only for the initial mount/first turn
- This ensures Safari allows audio playback since it's triggered from a user gesture

### 3. Clean up cancel flow

- Ensure `cancelListening` resets all refs properly so the next `startListening` works cleanly

