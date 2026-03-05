import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Pencil, Trash2, ChevronRight, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import type { DbVocabTheme, DbVocabWord } from "@/hooks/useVocabThemes";

const AdminVocabPage = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [editingTheme, setEditingTheme] = useState<Partial<DbVocabTheme> | null>(null);
  const [editingWord, setEditingWord] = useState<Partial<DbVocabWord> | null>(null);

  const { data: themes = [], isLoading: themesLoading } = useQuery({
    queryKey: ["admin-themes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vocab_themes").select("*").order("sort_order");
      if (error) throw error;
      return data as DbVocabTheme[];
    },
  });

  const { data: words = [], isLoading: wordsLoading } = useQuery({
    queryKey: ["admin-words", selectedTheme],
    queryFn: async () => {
      if (!selectedTheme) return [];
      const { data, error } = await supabase.from("vocab_words").select("*").eq("theme_id", selectedTheme).order("sort_order");
      if (error) throw error;
      return data as DbVocabWord[];
    },
    enabled: !!selectedTheme,
  });

  const saveTheme = useMutation({
    mutationFn: async (theme: Partial<DbVocabTheme>) => {
      if (theme.id) {
        const { error } = await supabase.from("vocab_themes").update({
          name: theme.name, dutch_name: theme.dutch_name, description: theme.description,
          emoji: theme.emoji, cefr_level: theme.cefr_level, color: theme.color,
          sort_order: theme.sort_order,
        }).eq("id", theme.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("vocab_themes").insert({
          name: theme.name || "", dutch_name: theme.dutch_name || "", description: theme.description || "",
          emoji: theme.emoji || "📚", cefr_level: theme.cefr_level || "A1", color: theme.color || "blue",
          sort_order: theme.sort_order || themes.length,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-themes"] });
      queryClient.invalidateQueries({ queryKey: ["vocab-themes"] });
      setEditingTheme(null);
      toast({ title: "Theme saved" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteTheme = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vocab_themes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-themes"] });
      queryClient.invalidateQueries({ queryKey: ["vocab-themes"] });
      if (selectedTheme) setSelectedTheme(null);
      toast({ title: "Theme deleted" });
    },
  });

  const saveWord = useMutation({
    mutationFn: async (word: Partial<DbVocabWord>) => {
      if (word.id) {
        const { error } = await supabase.from("vocab_words").update({
          dutch: word.dutch, english: word.english, example_sentence: word.example_sentence,
          part_of_speech: word.part_of_speech, sort_order: word.sort_order,
        }).eq("id", word.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("vocab_words").insert({
          theme_id: selectedTheme!, dutch: word.dutch || "", english: word.english || "",
          example_sentence: word.example_sentence || null, part_of_speech: word.part_of_speech || null,
          sort_order: word.sort_order || words.length,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-words", selectedTheme] });
      queryClient.invalidateQueries({ queryKey: ["vocab-words"] });
      queryClient.invalidateQueries({ queryKey: ["vocab-themes"] });
      setEditingWord(null);
      toast({ title: "Word saved" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteWord = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vocab_words").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-words", selectedTheme] });
      queryClient.invalidateQueries({ queryKey: ["vocab-words"] });
      queryClient.invalidateQueries({ queryKey: ["vocab-themes"] });
      toast({ title: "Word deleted" });
    },
  });

  if (authLoading) return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!isAdmin) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">Admin access required</p>
        <Button variant="outline" onClick={() => navigate("/")}>Back to Home</Button>
      </div>
    </div>
  );

  const currentTheme = themes.find((t) => t.id === selectedTheme);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => selectedTheme ? setSelectedTheme(null) : navigate("/")}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-bold text-foreground">
            {selectedTheme ? `${currentTheme?.emoji} ${currentTheme?.name} — Words` : "📚 Manage Vocabulary"}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
        {!selectedTheme ? (
          <>
            {/* Theme list */}
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-foreground">Themes</h2>
              <Button size="sm" onClick={() => setEditingTheme({ name: "", dutch_name: "", description: "", emoji: "📚", cefr_level: "A1", color: "blue", sort_order: themes.length })}>
                <Plus className="h-4 w-4 mr-1" /> Add Theme
              </Button>
            </div>

            {editingTheme && !editingTheme.id && (
              <ThemeForm theme={editingTheme} onChange={setEditingTheme} onSave={() => saveTheme.mutate(editingTheme)} onCancel={() => setEditingTheme(null)} saving={saveTheme.isPending} />
            )}

            {themesLoading ? <p className="text-muted-foreground">Loading...</p> : themes.map((theme) => (
              editingTheme?.id === theme.id ? (
                <ThemeForm key={theme.id} theme={editingTheme} onChange={setEditingTheme} onSave={() => saveTheme.mutate(editingTheme)} onCancel={() => setEditingTheme(null)} saving={saveTheme.isPending} />
              ) : (
                <motion.div key={theme.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-3 rounded-xl bg-card border border-border p-4 shadow-card"
                >
                  <span className="text-2xl">{theme.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-foreground">{theme.name}</p>
                    <p className="text-sm text-muted-foreground">{theme.dutch_name} · {theme.cefr_level}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setEditingTheme({ ...theme })}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete theme and all words?")) deleteTheme.mutate(theme.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setSelectedTheme(theme.id)}><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                </motion.div>
              )
            ))}
          </>
        ) : (
          <>
            {/* Word list */}
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-foreground">Words ({words.length})</h2>
              <Button size="sm" onClick={() => setEditingWord({ dutch: "", english: "", example_sentence: "", part_of_speech: "", sort_order: words.length })}>
                <Plus className="h-4 w-4 mr-1" /> Add Word
              </Button>
            </div>

            {editingWord && !editingWord.id && (
              <WordForm word={editingWord} onChange={setEditingWord} onSave={() => saveWord.mutate(editingWord)} onCancel={() => setEditingWord(null)} saving={saveWord.isPending} />
            )}

            {wordsLoading ? <p className="text-muted-foreground">Loading...</p> : words.map((word) => (
              editingWord?.id === word.id ? (
                <WordForm key={word.id} word={editingWord} onChange={setEditingWord} onSave={() => saveWord.mutate(editingWord)} onCancel={() => setEditingWord(null)} saving={saveWord.isPending} />
              ) : (
                <motion.div key={word.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-3 rounded-xl bg-card border border-border p-4 shadow-card"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-foreground">{word.dutch}</p>
                    <p className="text-sm text-muted-foreground">{word.english}</p>
                    {word.example_sentence && <p className="text-xs text-muted-foreground italic mt-1">{word.example_sentence}</p>}
                  </div>
                  {word.part_of_speech && <span className="text-xs bg-muted rounded-full px-2 py-0.5 text-muted-foreground">{word.part_of_speech}</span>}
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setEditingWord({ ...word })}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete word?")) deleteWord.mutate(word.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </motion.div>
              )
            ))}
          </>
        )}
      </div>
    </div>
  );
};

// --- Sub-components ---

const ThemeForm = ({ theme, onChange, onSave, onCancel, saving }: {
  theme: Partial<DbVocabTheme>; onChange: (t: Partial<DbVocabTheme>) => void;
  onSave: () => void; onCancel: () => void; saving: boolean;
}) => (
  <div className="rounded-xl bg-card border border-border p-4 shadow-card space-y-3">
    <div className="grid grid-cols-2 gap-3">
      <Input placeholder="Name (English)" value={theme.name || ""} onChange={(e) => onChange({ ...theme, name: e.target.value })} />
      <Input placeholder="Dutch Name" value={theme.dutch_name || ""} onChange={(e) => onChange({ ...theme, dutch_name: e.target.value })} />
    </div>
    <Input placeholder="Description" value={theme.description || ""} onChange={(e) => onChange({ ...theme, description: e.target.value })} />
    <div className="grid grid-cols-3 gap-3">
      <Input placeholder="Emoji" value={theme.emoji || ""} onChange={(e) => onChange({ ...theme, emoji: e.target.value })} />
      <Input placeholder="CEFR (A1, A2...)" value={theme.cefr_level || ""} onChange={(e) => onChange({ ...theme, cefr_level: e.target.value })} />
      <Input placeholder="Color (orange, blue, teal)" value={theme.color || ""} onChange={(e) => onChange({ ...theme, color: e.target.value })} />
    </div>
    <div className="flex gap-2 justify-end">
      <Button variant="ghost" size="sm" onClick={onCancel}><X className="h-4 w-4 mr-1" /> Cancel</Button>
      <Button size="sm" onClick={onSave} disabled={saving}><Save className="h-4 w-4 mr-1" /> Save</Button>
    </div>
  </div>
);

const WordForm = ({ word, onChange, onSave, onCancel, saving }: {
  word: Partial<DbVocabWord>; onChange: (w: Partial<DbVocabWord>) => void;
  onSave: () => void; onCancel: () => void; saving: boolean;
}) => (
  <div className="rounded-xl bg-card border border-border p-4 shadow-card space-y-3">
    <div className="grid grid-cols-2 gap-3">
      <Input placeholder="Dutch" value={word.dutch || ""} onChange={(e) => onChange({ ...word, dutch: e.target.value })} />
      <Input placeholder="English" value={word.english || ""} onChange={(e) => onChange({ ...word, english: e.target.value })} />
    </div>
    <Input placeholder="Example sentence (optional)" value={word.example_sentence || ""} onChange={(e) => onChange({ ...word, example_sentence: e.target.value })} />
    <Input placeholder="Part of speech (optional)" value={word.part_of_speech || ""} onChange={(e) => onChange({ ...word, part_of_speech: e.target.value })} />
    <div className="flex gap-2 justify-end">
      <Button variant="ghost" size="sm" onClick={onCancel}><X className="h-4 w-4 mr-1" /> Cancel</Button>
      <Button size="sm" onClick={onSave} disabled={saving}><Save className="h-4 w-4 mr-1" /> Save</Button>
    </div>
  </div>
);

export default AdminVocabPage;
