-- exam_question_images
-- Persistent cache for AI-generated exam images.
-- Each row maps one (question_id, image_slot) pair to a stored image URL.
-- Status lifecycle:  pending → cached → approved | rejected
--
-- question_id  : matches ExamQuestion.id from examQuestions.ts (integer key)
-- image_slot   : 0-based index within the question (0 = first/only photo,
--                1 = second photo for 2-photo questions, etc.)
-- status       : 'pending'  — row reserved, generation not yet done
--                'cached'   — URL stored, image available (used as default)
--                'approved' — manually approved by admin (preferred variant)
--                'rejected' — generation failed or image unsuitable; will retry

CREATE TABLE IF NOT EXISTS exam_question_images (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id   INTEGER     NOT NULL,
  image_slot    INTEGER     NOT NULL DEFAULT 0,
  prompt        TEXT        NOT NULL,
  storage_path  TEXT,                          -- path inside exam-media bucket (optional)
  image_url     TEXT,                          -- publicly-accessible URL
  status        TEXT        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'cached', 'approved', 'rejected')),
  created_at    TIMESTAMPTZ DEFAULT NOW()      NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW()      NOT NULL,

  UNIQUE (question_id, image_slot)
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_exam_image_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER exam_question_images_updated_at
  BEFORE UPDATE ON exam_question_images
  FOR EACH ROW EXECUTE FUNCTION update_exam_image_updated_at();

-- Indexes for the two most common access patterns
CREATE INDEX IF NOT EXISTS idx_exam_images_question_slot
  ON exam_question_images (question_id, image_slot);

CREATE INDEX IF NOT EXISTS idx_exam_images_status
  ON exam_question_images (status);

-- RLS: publicly readable (exam images are not secret); only service-role can write
ALTER TABLE exam_question_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exam_images_public_read"
  ON exam_question_images FOR SELECT
  USING (true);

CREATE POLICY "exam_images_service_write"
  ON exam_question_images FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant usage to the anon key so the client can read cached URLs
GRANT SELECT ON exam_question_images TO anon;
GRANT SELECT ON exam_question_images TO authenticated;
-- Edge functions run as service_role so they can INSERT/UPDATE
GRANT ALL ON exam_question_images TO service_role;
