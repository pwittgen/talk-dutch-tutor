
-- Enum for opgave type
CREATE TYPE public.opgave_type AS ENUM ('video', '1-photo', '2-photos', '3-photos');
CREATE TYPE public.question_category AS ENUM ('beschrijven', 'mening', 'situatie');

-- Speaking question templates
CREATE TABLE public.speaking_question_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opgave INTEGER NOT NULL CHECK (opgave BETWEEN 1 AND 4),
  question_number INTEGER NOT NULL CHECK (question_number BETWEEN 1 AND 16),
  opgave_type opgave_type NOT NULL,
  situation_dutch TEXT NOT NULL,
  situation_english TEXT NOT NULL,
  dutch_question TEXT NOT NULL,
  english_question TEXT NOT NULL,
  hints TEXT[] NOT NULL DEFAULT '{}',
  sample_answer TEXT NOT NULL DEFAULT '',
  keywords TEXT[] NOT NULL DEFAULT '{}',
  category question_category NOT NULL DEFAULT 'beschrijven',
  video_description TEXT,
  media_urls TEXT[] NOT NULL DEFAULT '{}',
  placeholder_descriptions TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Exam sessions
CREATE TABLE public.speaking_exam_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_key TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  question_ids UUID[] NOT NULL DEFAULT '{}',
  results JSONB NOT NULL DEFAULT '[]',
  total_score NUMERIC(3,1),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Storage bucket for exam media
INSERT INTO storage.buckets (id, name, public) VALUES ('exam-media', 'exam-media', true);

-- RLS policies - templates are publicly readable
ALTER TABLE public.speaking_question_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Templates are publicly readable" ON public.speaking_question_templates FOR SELECT USING (true);
CREATE POLICY "Templates are publicly insertable" ON public.speaking_question_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Templates are publicly updatable" ON public.speaking_question_templates FOR UPDATE USING (true);
CREATE POLICY "Templates are publicly deletable" ON public.speaking_question_templates FOR DELETE USING (true);

ALTER TABLE public.speaking_exam_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sessions are publicly readable" ON public.speaking_exam_sessions FOR SELECT USING (true);
CREATE POLICY "Sessions are publicly insertable" ON public.speaking_exam_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Sessions are publicly updatable" ON public.speaking_exam_sessions FOR UPDATE USING (true);

-- Storage policies for exam media
CREATE POLICY "Exam media is publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'exam-media');
CREATE POLICY "Exam media is publicly uploadable" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'exam-media');
CREATE POLICY "Exam media is publicly updatable" ON storage.objects FOR UPDATE USING (bucket_id = 'exam-media');
CREATE POLICY "Exam media is publicly deletable" ON storage.objects FOR DELETE USING (bucket_id = 'exam-media');

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_speaking_question_templates_updated_at
  BEFORE UPDATE ON public.speaking_question_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
