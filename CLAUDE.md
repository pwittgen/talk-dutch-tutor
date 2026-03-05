# CLAUDE.md — Talk Dutch Tutor

AI assistant guide for the **Talk Dutch Tutor** codebase. Read this before making changes.

---

## Project Overview

A React/TypeScript web app for learning Dutch through interactive conversation practice, vocabulary games, and exam simulation. Targets A1–A2 learners preparing for the Dutch civic integration (*inburgering*) exam.

**Stack:** Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui + Supabase

---

## Development Commands

```bash
npm run dev          # Start dev server on localhost:8080
npm run build        # Production build
npm run build:dev    # Dev-mode build (unminified, for debugging)
npm run lint         # ESLint
npm run test         # Run tests once (Vitest)
npm run test:watch   # Run tests in watch mode
npm run preview      # Preview production build locally
```

> The dev server binds to `::` (IPv6) on port 8080.

---

## Repository Structure

```
src/
├── assets/scenarios/      # 12 scenario images (jpg)
├── components/
│   ├── ui/                # shadcn/ui primitives (65+ components — do not modify directly)
│   ├── ConversationView.tsx   # Core conversation practice component
│   ├── ExamSimulation.tsx     # Exam practice component
│   ├── FlashcardDeck.tsx      # Vocabulary flashcard component
│   ├── MatchingGame.tsx        # Vocabulary matching game
│   ├── ScenarioCard.tsx        # Scenario card display
│   ├── VocabCategoryCard.tsx   # Vocabulary category card
│   └── SectionTabs.tsx         # Practice / Learn / Exam tabs
├── data/
│   ├── scenarios.ts       # Scenario definitions and ConversationTurn types
│   ├── vocabData.ts        # Vocabulary themes and words
│   └── examQuestions.ts    # Exam question data
├── hooks/
│   ├── MicContext.tsx         # Global microphone stream context (keep mic hot)
│   ├── useSpeechRecognition.ts  # Robust speech recognition with Safari/iOS fixes
│   ├── useAuth.tsx            # Authentication context (Supabase auth + admin role)
│   ├── useProgress.ts         # Progress tracking
│   ├── useRecordingSettings.ts # Recording mode preferences
│   ├── useVocabThemes.ts      # Vocabulary themes from Supabase
│   └── use-mobile.tsx         # Mobile device detection
├── integrations/supabase/
│   ├── client.ts              # Supabase client init
│   └── types.ts               # Auto-generated DB types (do not edit manually)
├── lib/
│   ├── utils.ts               # classname merging utility (cn)
│   └── speechDebugLog.ts      # Speech recognition debug logging
├── pages/
│   ├── Index.tsx              # Home page
│   ├── ScenarioPage.tsx       # Individual scenario practice
│   ├── LearnCategoryPage.tsx  # Vocabulary learning
│   ├── ExamPage.tsx           # Exam simulation
│   ├── ProgressPage.tsx       # User progress dashboard
│   ├── SettingsPage.tsx       # Settings and preferences
│   ├── AuthPage.tsx           # Login/signup
│   ├── AdminExamPage.tsx      # Admin: exam management
│   ├── AdminVocabPage.tsx     # Admin: vocabulary management
│   └── DebugLogsPage.tsx      # Speech debug log viewer
├── App.tsx                    # Root component: providers + router
└── main.tsx                   # React entry point

supabase/
├── functions/
│   ├── evaluate-dutch/        # AI evaluation of Dutch answers (Gemini via Lovable gateway)
│   ├── elevenlabs-tts/        # ElevenLabs text-to-speech
│   ├── generate-turn/         # Dynamic conversation turn generation
│   └── generate-exam-image/   # Exam image generation
└── migrations/                # Database migrations
```

---

## Key Architecture Patterns

### Routing (`src/App.tsx`)

Providers wrap the app in this order: `QueryClientProvider` → `AuthProvider` → `MicProvider` → `TooltipProvider`.

Routes:
- `/` — Home
- `/auth` — Login/signup
- `/scenario/:id` — Conversation practice
- `/learn/:categoryId` — Vocabulary learning
- `/exam` — Exam simulation
- `/progress`, `/settings` — User pages
- `/admin/exam`, `/admin/vocab` — Admin-only pages
- `/debug-logs` — Speech debug viewer

### Path Aliases

Use `@/` for all internal imports. It resolves to `src/`. Never use relative paths like `../../`.

```ts
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
```

### Supabase Integration

- Client is a singleton at `src/integrations/supabase/client.ts`
- Edge Functions are called with `supabase.functions.invoke("function-name", { body: {...} })`
- All edge functions live under `supabase/functions/` and run on Deno
- `verify_jwt` is disabled on all edge functions (public access)
- `supabase/types.ts` is auto-generated — do not edit by hand

### AI/LLM Integration

Edge functions call the **Lovable AI gateway** (`https://ai.gateway.lovable.dev/v1/chat/completions`) using `LOVABLE_API_KEY`. The model used is `google/gemini-3-flash-preview`.

- `evaluate-dutch`: Evaluates student's Dutch answer with structured JSON output (grade, feedback, correctedDutch, etc.)
- `generate-turn`: Dynamically generates the next conversation turn based on history
- `evaluate-dutch` supports two special modes: `openEnded` (any valid response) and `examMode` (A2 inburgering exam rules)

### TTS (Text-to-Speech)

Primary: ElevenLabs via `elevenlabs-tts` edge function (returns audio blob).
Fallback: Browser `SpeechSynthesisUtterance` with Dutch voice (`nl-NL`).

**Critical Safari/iOS constraint:** `audio.play()` must be called synchronously from a user gesture. Never call `speakDutch()` from inside `useEffect` or after `await` on turn transitions — it will be silently blocked by the browser. Instead, call `speakDutch()` directly in click handlers.

### Speech Recognition (`src/hooks/useSpeechRecognition.ts`)

Uses `window.SpeechRecognition` / `window.webkitSpeechRecognition`. Key behaviors:

- **Global MicContext:** Mic stream is kept alive across conversation turns to preserve iOS gesture context. Never stop the mic stream between turns.
- **Synchronous start on subsequent turns:** If `isMicReady` is true (mic already acquired), `recognition.start()` is called synchronously in the click handler (not after `await`). This is critical for iOS Safari.
- **First call:** Must `await getUserMedia` (mic permission) then start — user expects a brief delay here.
- **Auto-stop:** Timer starts only *after first speech is detected*, not immediately.
- **Safari:** Sets `recognition.continuous = false` and allows up to 15 restarts (vs 5 for Chrome).
- **`cancelListening()`:** Stops recording *without submitting* (used when advancing turns).
- **`stopListening()`:** Stops recording and submits accumulated transcript.
- Debug events are logged via `logSpeechEvent()` — viewable at `/debug-logs`.

---

## Data Models

### Scenario / ConversationTurn (`src/data/scenarios.ts`)

```ts
interface ConversationTurn {
  speaker: "dutch";
  dutchText: string;         // Dutch text spoken by the tutor
  englishHint: string;       // Translation hint for the student
  imageUrl?: string;         // Optional image for visual context
  imageDescription?: string; // Alt text / image prompt for student
  feedbackOnWrong: string;   // Static fallback feedback
  grammarTip?: string;       // Grammar tip shown on error
  expectedResponses: string[]; // Valid responses (for fallback matching)
}

interface Scenario {
  id: string;
  title: string;             // English title
  dutchTitle: string;        // Dutch title
  emoji: string;
  difficulty: "beginner" | "easy" | "medium";
  section: "beginner" | "casual" | "inburgering";
  openEnded?: boolean;       // If true, generate turns dynamically via AI
  conversations: ConversationTurn[];
}
```

Sections: **beginner** (first steps) → **casual** (everyday NL situations) → **inburgering** (A2 exam prep).

### AI Evaluation Response

```ts
interface AIFeedback {
  grade: "perfect" | "good" | "needs_improvement" | "incorrect";
  feedback: string;          // English encouragement (1-2 sentences)
  correctedDutch: string;    // Short improved version of student's answer
  grammarNotes: string[];    // Max 2 grammar tips
  pronunciationTips?: string[];
  vocabularyNotes?: string[];
  cefrLevel?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  starRating?: number;       // 1-5
}
```

---

## Styling Conventions

- **Tailwind CSS** — use utility classes exclusively; no custom CSS except `index.css`.
- **shadcn/ui** — use components from `@/components/ui/`. Do not modify these.
- **Custom design tokens** defined in `tailwind.config.ts` (CSS variables):
  - `bg-gradient-hero` — primary gradient (orange/coral)
  - `shadow-primary`, `shadow-card` — elevation utilities
  - `text-success`, `text-warning`, `text-destructive` — semantic status colors
- **Framer Motion** — used for page/element transitions via `<motion.div>` and `<AnimatePresence>`.
- **Dark mode** — enabled via Tailwind's `class` strategy.
- Path alias `@/` applies to all imports.

---

## Environment Variables

Required in `.env` (prefix with `VITE_` for client-side exposure):

```
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon key>
VITE_SUPABASE_PROJECT_ID=<project-id>
```

Supabase Edge Functions use server-side secrets (not in `.env`):
- `LOVABLE_API_KEY` — for AI gateway calls (set in Supabase dashboard)
- `ELEVENLABS_API_KEY` — for TTS (set in Supabase dashboard)

---

## Testing

- Framework: **Vitest** with jsdom environment
- Setup: `src/test/setup.ts` (polyfills `window.matchMedia`)
- File pattern: `src/**/*.{test,spec}.{ts,tsx}`

```bash
npm run test         # Single run
npm run test:watch   # Watch mode
```

There is minimal test coverage currently. When adding tests, use `@testing-library/react` and `@testing-library/jest-dom` matchers.

---

## Known Issues / Active Work

See `.lovable/plan.md` for detailed analysis. Key issues:

1. **Safari speech recognition (iOS):** `recognition.start()` must be called synchronously from a user gesture. Any `await` before it (e.g., waiting for `getUserMedia`) loses gesture context and silently fails.

2. **Safari TTS auto-play:** `audio.play()` is blocked if called from `useEffect` or after `await` on turn transitions. Must be called directly in click handlers.

The `MicContext` + synchronous start design in `useSpeechRecognition.ts` is the current fix for issue #1. For issue #2, `speakDutch()` is called directly inside `handleNext()` after setting the next turn index.

---

## Conventions and Rules

- **Imports:** Always use `@/` alias, never relative paths.
- **shadcn/ui:** Never modify files in `src/components/ui/` directly; use the shadcn CLI.
- **Supabase types:** Never manually edit `src/integrations/supabase/types.ts`.
- **TTS on mobile:** Never call `speakDutch()` from inside `useEffect` or after any `await` — always call it synchronously from a user event handler.
- **Mic stream:** Never stop the mic stream between turns. Use `cancelListening()` to cancel recognition without releasing the hardware stream.
- **Edge Functions:** Written in Deno TypeScript. Import from `https://deno.land/std@...`. No npm packages.
- **AI evaluations:** Use structured tool calls (not raw text) from the AI gateway for reliable JSON parsing.
- **No unused vars:** ESLint is configured with `@typescript-eslint/no-unused-vars` off, but keep code clean.
- **TypeScript:** Strict mode is relaxed (`noImplicitAny` and `strictNullChecks` are off in tsconfig). Still type everything explicitly where possible.
- **Framer Motion:** Wrap conditional renders with `<AnimatePresence mode="wait">` when using exit animations.

---

## Deployment

The app is deployed via the **Lovable** platform. No GitHub Actions or Dockerfiles. To deploy:

1. Push changes to the project repo.
2. Publish via the Lovable dashboard UI.

Edge functions are deployed to the Supabase project (`esodrceqheivcpafastv`).
