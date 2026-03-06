

## Repurpose "Part of Speech" as "English Translation" (of example sentence)

The `part_of_speech` database column will be reused to store the English translation of the example sentence. No DB migration needed — just relabel it in the UI.

### Changes

**1. Admin Word Form (`src/pages/AdminVocabPage.tsx`)**
- Line 220: Change badge display from `part_of_speech` label (no visual change needed, just context)
- Line 276: Change placeholder from "Part of speech (optional)" to "English translation of example (optional)"

**2. Import Dialog (`src/components/VocabImportDialog.tsx`)**
- Line 139: Update description text — column D is now "English translation of example"
- Line 184: Change table header from "POS" to "Translation"

**3. Flashcard Back (`src/components/FlashcardDeck.tsx`)**
- Map `part_of_speech` from DB into a new field (e.g. `exampleTranslation`) in `LearnCategoryPage.tsx`
- On the back of the flashcard, below the example sentence, display the English translation if available

**4. LearnCategoryPage (`src/pages/LearnCategoryPage.tsx`)**
- Update the `VocabWord` mapping to pass `part_of_speech` as `exampleTranslation`

**5. VocabWord type (`src/data/vocabData.ts`)**
- Add optional `exampleTranslation?: string` field to the `VocabWord` interface

### Files touched
- `src/data/vocabData.ts` — add `exampleTranslation` to interface
- `src/pages/LearnCategoryPage.tsx` — map `part_of_speech` → `exampleTranslation`
- `src/components/FlashcardDeck.tsx` — show translation on card back
- `src/pages/AdminVocabPage.tsx` — relabel placeholder
- `src/components/VocabImportDialog.tsx` — relabel column header and description

