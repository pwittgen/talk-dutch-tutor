
-- Profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- User roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Themes table
CREATE TABLE public.vocab_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  dutch_name TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  emoji TEXT NOT NULL DEFAULT '📚',
  cefr_level TEXT NOT NULL DEFAULT 'A1',
  color TEXT NOT NULL DEFAULT 'blue',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vocab_themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Themes readable by all" ON public.vocab_themes FOR SELECT USING (true);
CREATE POLICY "Admins can insert themes" ON public.vocab_themes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update themes" ON public.vocab_themes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete themes" ON public.vocab_themes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Words table
CREATE TABLE public.vocab_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES public.vocab_themes(id) ON DELETE CASCADE,
  dutch TEXT NOT NULL,
  english TEXT NOT NULL,
  example_sentence TEXT,
  audio_url TEXT,
  part_of_speech TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vocab_words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Words readable by all" ON public.vocab_words FOR SELECT USING (true);
CREATE POLICY "Admins can insert words" ON public.vocab_words FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update words" ON public.vocab_words FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete words" ON public.vocab_words FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Game sessions
CREATE TABLE public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  theme_id UUID NOT NULL REFERENCES public.vocab_themes(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  score INTEGER
);
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own sessions" ON public.game_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.game_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.game_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
