

## Add Spreadsheet Import to Admin Vocab Page

### What gets built

A CSV/Excel upload button on the Admin Vocab page that lets you bulk-import words into a theme from a spreadsheet.

### How it works

1. **Upload UI**: An "Import Words" button appears next to "Add Word" when viewing a theme's word list. Clicking it opens a file picker accepting `.csv` and `.xlsx` files.

2. **Expected spreadsheet format** (columns):
   - Column A: Dutch word
   - Column B: English translation
   - Column C: Example sentence (optional)
   - Column D: Part of speech (optional)

3. **Preview & Confirm**: After selecting a file, a preview table shows the parsed rows so you can verify before importing. A "Confirm Import" button inserts all rows into the selected theme.

4. **Implementation**:
   - Use the `xlsx` npm package (SheetJS) to parse both CSV and Excel files client-side
   - Map columns to the `vocab_words` table fields (`dutch`, `english`, `example_sentence`, `part_of_speech`)
   - Batch insert via Supabase `.insert()` with the selected `theme_id`
   - Show a success toast with the count of imported words

### Files changed
- `src/pages/AdminVocabPage.tsx` — add import button + preview modal in the word list section
- New dependency: `xlsx` (SheetJS) for spreadsheet parsing

### No database changes needed
The existing `vocab_words` table and RLS policies already support admin inserts.

