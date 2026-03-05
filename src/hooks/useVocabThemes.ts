import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DbVocabWord {
  id: string;
  theme_id: string;
  dutch: string;
  english: string;
  example_sentence: string | null;
  audio_url: string | null;
  part_of_speech: string | null;
  sort_order: number;
}

export interface DbVocabTheme {
  id: string;
  name: string;
  dutch_name: string;
  description: string;
  emoji: string;
  cefr_level: string;
  color: string;
  sort_order: number;
  word_count?: number;
}

export const useVocabThemes = () =>
  useQuery({
    queryKey: ["vocab-themes"],
    queryFn: async () => {
      const { data: themes, error } = await supabase
        .from("vocab_themes")
        .select("*")
        .order("sort_order");
      if (error) throw error;

      // Get word counts
      const { data: words } = await supabase
        .from("vocab_words")
        .select("theme_id");

      const counts: Record<string, number> = {};
      words?.forEach((w: any) => {
        counts[w.theme_id] = (counts[w.theme_id] || 0) + 1;
      });

      return (themes as DbVocabTheme[]).map((t) => ({
        ...t,
        word_count: counts[t.id] || 0,
      }));
    },
  });

export const useVocabWords = (themeId: string | undefined) =>
  useQuery({
    queryKey: ["vocab-words", themeId],
    queryFn: async () => {
      if (!themeId) return [];
      const { data, error } = await supabase
        .from("vocab_words")
        .select("*")
        .eq("theme_id", themeId)
        .order("sort_order");
      if (error) throw error;
      return data as DbVocabWord[];
    },
    enabled: !!themeId,
  });
