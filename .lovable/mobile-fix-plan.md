# Mobile TTS & Recording Fix Plan

## Root Causes

### TTS — Audio playback blocked on mobile
`speakDutch()` fetches TTS audio via async `fetchTtsBlob()`, then calls `audio.play()`.
On mobile Safari and Chrome, `play()` after an async gap loses gesture context and is silently blocked.

The Audio pre-activation trick (create element + call `play()` synchronously from gesture)
only exists for open-ended scenarios in `handleNext()`. Missing for:
- Regular (non-open-ended) turn transitions when preloaded audio isn't ready
- "Listen" button taps
- "Listen to ideal response" taps on feedback

### Recording — Stale `onend` race condition
When `cancelListening()` aborts recognition and `startListening()` begins a new session,
the old recognition's `onend` fires after the new session's ref resets. The stale handler
calls `createAndStart()`, creating a conflicting duplicate SpeechRecognition instance.

### Recording — Dead mic stream with stale `isMicReady`
If MediaStream tracks die (OS reclaims mic, tab backgrounding), `isMicReady` state remains
`true`. The sync start path is taken without reacquiring the mic, and
`SpeechRecognition.start()` fails silently or captures nothing.

---

## Action Plan

### Fix 1: Pre-activate Audio in `speakDutch()` for all async paths
**File:** `src/components/ConversationView.tsx`

In `speakDutch()`, when entering the async `fetchTtsBlob()` path and no pre-activated
Audio element exists, create and activate one immediately. Since `speakDutch()` is called
from click handlers (gesture context alive), the activation succeeds.

This covers: regular turn transitions, "Listen" button, "Listen to ideal response".

### Fix 2: Session generation counter in `useSpeechRecognition`
**File:** `src/hooks/useSpeechRecognition.ts`

Add a `sessionIdRef` counter. Increment on each `startListening()` call. Capture the
current value in `createAndStart()`. In `onend`, check if the session ID still matches
before restarting. Stale sessions exit immediately.

### Fix 3: Clean up existing recognition at start of `startListening()`
**File:** `src/hooks/useSpeechRecognition.ts`

Before resetting state in `startListening()`, abort any existing `recognitionRef.current`.
This ensures no zombie recognition instances linger from a previous session.

### Fix 4: Verify mic stream health before sync start
**File:** `src/hooks/useSpeechRecognition.ts`
**File:** `src/hooks/MicContext.tsx`

Add a `checkMicHealth()` method to MicContext that checks if tracks are alive without
requesting new ones. In `startListening()`, when `isMicReady` is true, also call
`checkMicHealth()`. If the stream is dead, fall through to the async path instead.

---

## Test Plan

### Prerequisites
- Test on physical iPhone (Safari + Chrome) and Android phone (Chrome)
- Use a scenario with at least 3 turns
- Test with both regular and open-ended (Random Encounter) scenarios
- Test with both "auto" and "manual" recording modes

### Test Matrix

| # | Test Case | Steps | Expected Result | Platforms |
|---|-----------|-------|-----------------|-----------|
| T1 | TTS plays on first turn load | Open any scenario. Wait for first turn. | Dutch question audio plays (may not work on iOS first load - accepted). | All |
| T2 | TTS plays on "Listen" button tap | Tap the "Listen" button on the Dutch prompt. | Audio plays immediately. No silent failure. | iOS Safari, iOS Chrome, Android Chrome |
| T3 | TTS plays on turn transition (regular) | Complete a turn, tap "Next". | Next turn's Dutch question plays immediately. | iOS Safari, iOS Chrome, Android Chrome |
| T4 | TTS plays on turn transition (open-ended) | Open Random Encounter. Complete a turn, tap "Next". Wait for AI generation. | Dutch question plays after generation completes. | iOS Safari, iOS Chrome, Android Chrome |
| T5 | TTS plays for "ideal response" | Get feedback on a turn. Tap "Listen" next to the ideal response. | Corrected Dutch audio plays. | iOS Safari, iOS Chrome, Android Chrome |
| T6 | TTS fallback works | Disconnect from internet. Tap "Listen". | Browser speech synthesis plays Dutch. | All |
| T7 | Recording starts on first tap | Tap mic button for the first time. Grant permission if prompted. | Mic indicator shows active. Interim text appears when speaking. | iOS Safari, iOS Chrome, Android Chrome |
| T8 | Recording captures speech | Tap mic, speak a Dutch phrase, stop recording. | Transcript is captured and submitted for evaluation. | iOS Safari, iOS Chrome, Android Chrome |
| T9 | Recording works across multiple turns | Complete turn 1 with speech, go to turn 2, record again. | Each turn captures speech correctly. No silent failures. | iOS Safari, iOS Chrome, Android Chrome |
| T10 | Recording works after cancel+restart | Start recording, tap "Next" (cancels). On new turn, tap mic again. | New recording works, no conflict from cancelled session. | iOS Safari, iOS Chrome, Android Chrome |
| T11 | Recording auto-stop (auto mode) | In auto mode, tap mic, speak, then stop speaking. | Recording auto-stops after configured seconds, transcript submitted. | iOS Safari, iOS Chrome, Android Chrome |
| T12 | Recording manual stop | In manual mode, tap mic, speak, tap mic again to stop. | Recording stops and transcript is submitted. | iOS Safari, iOS Chrome, Android Chrome |
| T13 | No-speech fallback | Tap mic, don't speak for 8+ seconds. | Falls back to text input. | All |
| T14 | App backgrounding recovery | Start a scenario. Background the app for 30s. Return. Tap mic/Listen. | Both TTS and recording work after returning. | iOS Safari, Android Chrome |
| T15 | Rapid tap resilience | Quickly tap mic button 3-4 times in succession. | No crash. Settles into either listening or stopped state. | All |
| T16 | Muted mode respected | Enable mute. Advance turns. Tap Listen. | No audio plays. No errors in console. | All |

### Regression Checks
- [ ] Desktop Chrome: TTS and recording still work
- [ ] Desktop Safari: TTS and recording still work
- [ ] Text input fallback: "Type instead" still works on all platforms
- [ ] Speed slider: TTS speed adjustment still works
- [ ] Preloaded audio: Next turn audio still preloads in background
- [ ] Open-ended AI generation: Random Encounter still generates turns
- [ ] Exam mode: Exam simulation still works (does not use ConversationView)
