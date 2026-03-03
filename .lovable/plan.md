

## Speed Up Speech Loading

There are two main strategies to make speech load faster:

### 1. Switch to ElevenLabs Turbo Model
The current edge function uses `eleven_multilingual_v2` which is high-quality but slower. ElevenLabs offers `eleven_turbo_v2_5` — a low-latency model that still supports multilingual (including Dutch) and is significantly faster to generate.

**Change in `supabase/functions/elevenlabs-tts/index.ts`:**
- Replace `model_id: "eleven_multilingual_v2"` with `model_id: "eleven_turbo_v2_5"`

### 2. Use Streaming Instead of Buffered Response
Currently the edge function waits for the entire audio file to be generated before returning it. By using ElevenLabs' streaming endpoint (`/stream`), audio chunks are sent as they're generated. The client can start playing almost immediately.

**Edge function changes:**
- Change URL from `/text-to-speech/{voiceId}` to `/text-to-speech/{voiceId}/stream`
- Pass through `response.body` (a ReadableStream) directly instead of buffering the whole `arrayBuffer()`
- Add `Transfer-Encoding: chunked` header

**Client-side changes in `ConversationView.tsx`:**
- Remove `oncanplaythrough` wait — instead, set the `src` to a blob URL created from the streamed response and let the browser start playing as soon as enough data arrives
- Use `canplay` event instead of `canplaythrough` for faster start

### 3. Preload Next Turn's Audio
When the current turn is playing, preload the next turn's audio in the background so it's ready instantly.

**Client-side changes:**
- Add a `preloadedAudioRef` that fetches the next turn's audio after the current turn starts
- On turn advance, use the preloaded audio instead of fetching fresh

### Summary of Changes
| File | Change |
|------|--------|
| `supabase/functions/elevenlabs-tts/index.ts` | Switch to turbo model + streaming endpoint |
| `src/components/ConversationView.tsx` | Stream-compatible playback, preload next turn's audio |

This combination should reduce time-to-first-audio from several seconds to under 1 second for most utterances.

