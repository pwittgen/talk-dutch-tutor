

## Analysis

The current `useSpeechRecognition` hook calls `recognition.start()` immediately on button press. On mobile Safari/Chrome, the browser may still be initializing the audio pipeline, leading to silent failures or empty transcripts.

A "readiness gate" — pre-warming the microphone with `getUserMedia` before starting speech recognition — would solve this without a visible waiting period. The user taps the mic, we grab the audio stream (which also triggers the permission prompt if needed), and only then start recognition. This adds ~200-500ms but the user sees the button go into "listening" state, so it feels instant.

## Plan

### 1. Add microphone pre-warming to `useSpeechRecognition.ts`

In `startListening`, before calling `createAndStart()`:

- Call `navigator.mediaDevices.getUserMedia({ audio: true })` to acquire the mic stream
- Store the stream in a new `micStreamRef`
- Only call `createAndStart()` after the stream is acquired
- If `getUserMedia` fails (permission denied, no mic), call `onFallbackToText` immediately
- In `cleanup()`, stop all tracks on `micStreamRef.current` to release the mic hardware

### 2. Delay auto-stop timer until first speech detected

- Add a `hasReceivedSpeechRef` flag, set to `true` on first `onresult`
- Start the auto-stop timer only after first `onresult`, not at the beginning
- Add a separate 8-second "no speech at all" timeout that triggers text input fallback if nothing is detected

### 3. Show a brief "Preparing mic..." state

- Add a `isPreparing` state to the hook return value (true between button press and mic acquired)
- In `ConversationView.tsx` and `ExamSimulation.tsx`, show a subtle loading indicator on the mic button during this brief phase

