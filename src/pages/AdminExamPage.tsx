import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Plus, Pencil, Trash2, Eye, Upload, Save, X,
  Film, Image, Images, LayoutGrid, Loader2, Tag,
  CheckCircle2, XCircle, RefreshCw, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { examQuestions } from "@/data/examQuestions";

// ── Interfaces ────────────────────────────────────────────────────────────────

interface QuestionTemplate {
  id: string;
  opgave: number;
  question_number: number;
  opgave_type: string;
  situation_dutch: string;
  situation_english: string;
  dutch_question: string;
  english_question: string;
  hints: string[];
  sample_answer: string;
  keywords: string[];
  category: string;
  video_description: string | null;
  media_urls: string[];
  placeholder_descriptions: string[];
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ImageRecord {
  id: string;
  question_id: number;
  image_slot: number;
  prompt: string;
  image_url: string | null;
  storage_path: string | null;
  status: "pending" | "cached" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const OPGAVE_CONFIG: Record<number, { label: string; type: string; icon: any; mediaCount: number }> = {
  1: { label: "Opgave 1 — Video", type: "video", icon: Film, mediaCount: 0 },
  2: { label: "Opgave 2 — 1 plaatje", type: "1-photo", icon: Image, mediaCount: 1 },
  3: { label: "Opgave 3 — 2 plaatjes", type: "2-photos", icon: Images, mediaCount: 2 },
  4: { label: "Opgave 4 — 3 plaatjes", type: "3-photos", icon: LayoutGrid, mediaCount: 3 },
};

const emptyTemplate = (): Partial<QuestionTemplate> => ({
  opgave: 1,
  question_number: 1,
  opgave_type: "video",
  situation_dutch: "",
  situation_english: "",
  dutch_question: "",
  english_question: "",
  hints: [""],
  sample_answer: "",
  keywords: [""],
  category: "beschrijven",
  video_description: "",
  media_urls: [],
  placeholder_descriptions: [],
  tags: [],
  is_active: true,
});

// All image slots derived from the 64 static exam questions (112 total slots)
const ALL_IMAGE_SLOTS = examQuestions.flatMap((q) => {
  if (q.opgaveType === "video") {
    const prompt = q.videoThumbnailPrompt || `Situatie: ${q.situationDutch}`;
    return [{ questionId: q.id, slot: 0, prompt, opgave: q.opgave }];
  }
  return q.imagePrompts.map((prompt, slot) => ({
    questionId: q.id, slot, prompt, opgave: q.opgave,
  }));
});

const STATUS_CONFIG = {
  pending:  { label: "Pending",  className: "bg-muted text-muted-foreground" },
  cached:   { label: "Cached",   className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  approved: { label: "Approved", className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" },
} as const;

// ── Component ─────────────────────────────────────────────────────────────────

const AdminExamPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"vragen" | "afbeeldingen">("vragen");

  // ── Questions tab state ───────────────────────────────────────────────────
  const [templates, setTemplates] = useState<QuestionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<Partial<QuestionTemplate> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<QuestionTemplate | null>(null);
  const [filterOpgave, setFilterOpgave] = useState<string>("all");
  const [uploadingMedia, setUploadingMedia] = useState<number | null>(null);
  const [tagInput, setTagInput] = useState("");

  // ── Images tab state ──────────────────────────────────────────────────────
  const [imageRecords, setImageRecords] = useState<ImageRecord[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [generatingSlots, setGeneratingSlots] = useState<Set<string>>(new Set());
  const [filterImageOpgave, setFilterImageOpgave] = useState<string>("all");
  const [filterImageStatus, setFilterImageStatus] = useState<string>("all");

  // ── Questions tab: data fetching ──────────────────────────────────────────

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("speaking_question_templates")
      .select("*")
      .order("question_number", { ascending: true });
    if (error) {
      toast({ title: "Error loading templates", description: error.message, variant: "destructive" });
    } else {
      setTemplates((data as any[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  // ── Images tab: data fetching ─────────────────────────────────────────────

  const fetchImageRecords = useCallback(async () => {
    setImagesLoading(true);
    const { data, error } = await (supabase as any)
      .from("exam_question_images")
      .select("*")
      .order("question_id", { ascending: true })
      .order("image_slot", { ascending: true });
    if (error) {
      toast({ title: "Error loading images", description: error.message, variant: "destructive" });
    } else {
      setImageRecords((data as ImageRecord[]) || []);
    }
    setImagesLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === "afbeeldingen") fetchImageRecords();
  }, [activeTab, fetchImageRecords]);

  // ── Images tab: derived state ─────────────────────────────────────────────

  const imageRecordMap = useMemo(
    () => new Map(imageRecords.map((r) => [`${r.question_id}_${r.image_slot}`, r])),
    [imageRecords],
  );

  const displaySlots = useMemo(() => {
    return ALL_IMAGE_SLOTS.filter((s) => {
      if (filterImageOpgave !== "all" && s.opgave !== Number(filterImageOpgave)) return false;
      if (filterImageStatus !== "all") {
        const record = imageRecordMap.get(`${s.questionId}_${s.slot}`);
        const status = record?.status ?? "pending";
        if (status !== filterImageStatus) return false;
      }
      return true;
    });
  }, [filterImageOpgave, filterImageStatus, imageRecordMap]);

  const imageStats = useMemo(() => {
    const counts = { pending: 0, cached: 0, approved: 0, rejected: 0 };
    ALL_IMAGE_SLOTS.forEach((s) => {
      const record = imageRecordMap.get(`${s.questionId}_${s.slot}`);
      const status = (record?.status ?? "pending") as keyof typeof counts;
      counts[status]++;
    });
    return counts;
  }, [imageRecordMap]);

  // ── Images tab: actions ───────────────────────────────────────────────────

  const handleApprove = async (questionId: number, slot: number) => {
    const { error } = await (supabase as any)
      .from("exam_question_images")
      .update({ status: "approved" })
      .eq("question_id", questionId)
      .eq("image_slot", slot);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setImageRecords((prev) =>
        prev.map((r) =>
          r.question_id === questionId && r.image_slot === slot
            ? { ...r, status: "approved" }
            : r,
        ),
      );
    }
  };

  const handleReject = async (questionId: number, slot: number) => {
    const { error } = await (supabase as any)
      .from("exam_question_images")
      .update({ status: "rejected" })
      .eq("question_id", questionId)
      .eq("image_slot", slot);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setImageRecords((prev) =>
        prev.map((r) =>
          r.question_id === questionId && r.image_slot === slot
            ? { ...r, status: "rejected" }
            : r,
        ),
      );
    }
  };

  const handleRegenerate = async (questionId: number, slot: number, prompt: string) => {
    const key = `${questionId}_${slot}`;
    setGeneratingSlots((prev) => new Set([...prev, key]));
    try {
      const { data, error } = await supabase.functions.invoke("generate-exam-image", {
        body: { prompt, questionId },
      });
      if (error || !data?.imageUrl) throw new Error(error?.message ?? "No image generated");
      const { error: upsertError } = await supabase.from("exam_question_images").upsert(
        { question_id: questionId, image_slot: slot, prompt, image_url: data.imageUrl, status: "cached" },
        { onConflict: "question_id,image_slot" },
      );
      if (upsertError) throw upsertError;
      toast({ title: `Afbeelding gegenereerd voor Q${questionId} slot ${slot}` });
      await fetchImageRecords();
    } catch (e: any) {
      toast({ title: "Generatie mislukt", description: e.message, variant: "destructive" });
    } finally {
      setGeneratingSlots((prev) => { const s = new Set(prev); s.delete(key); return s; });
    }
  };

  const handleBatchGenerate = async () => {
    const slotsToGenerate = ALL_IMAGE_SLOTS.filter((s) => {
      const record = imageRecordMap.get(`${s.questionId}_${s.slot}`);
      return !record || record.status === "rejected";
    });

    if (slotsToGenerate.length === 0) {
      toast({ title: "Alle afbeeldingen zijn al gegenereerd!" });
      return;
    }

    setGeneratingAll(true);
    let generated = 0;
    let failed = 0;

    for (let i = 0; i < slotsToGenerate.length; i++) {
      const s = slotsToGenerate[i];
      try {
        const { data, error } = await supabase.functions.invoke("generate-exam-image", {
          body: { prompt: s.prompt, questionId: s.questionId },
        });
        if (error || !data?.imageUrl) throw new Error("Generation failed");
        await supabase.from("exam_question_images").upsert(
          { question_id: s.questionId, image_slot: s.slot, prompt: s.prompt, image_url: data.imageUrl, status: "cached" },
          { onConflict: "question_id,image_slot" },
        );
        generated++;
      } catch {
        await supabase.from("exam_question_images").upsert(
          { question_id: s.questionId, image_slot: s.slot, prompt: s.prompt, status: "rejected" },
          { onConflict: "question_id,image_slot" },
        );
        failed++;
      }
      // Refresh every 5 images and add a small delay to respect rate limits
      if ((i + 1) % 5 === 0) {
        await fetchImageRecords();
        toast({ title: `Voortgang: ${i + 1}/${slotsToGenerate.length}` });
      }
      if (i < slotsToGenerate.length - 1) {
        await new Promise((r) => setTimeout(r, 800));
      }
    }

    await fetchImageRecords();
    setGeneratingAll(false);
    toast({ title: `Klaar! ${generated} gegenereerd, ${failed} mislukt` });
  };

  // ── Questions tab: handlers ───────────────────────────────────────────────

  const handleOpgaveChange = (opgave: number) => {
    const config = OPGAVE_CONFIG[opgave];
    setEditingTemplate((prev) => ({
      ...prev!,
      opgave,
      opgave_type: config.type,
      media_urls: Array(config.mediaCount).fill(""),
      placeholder_descriptions: Array(config.mediaCount).fill(""),
      video_description: opgave === 1 ? (prev?.video_description || "") : null,
    }));
  };

  const handleMediaUpload = async (file: File, index: number) => {
    setUploadingMedia(index);
    const ext = file.name.split(".").pop();
    const path = `questions/${Date.now()}-${index}.${ext}`;
    const { error } = await supabase.storage.from("exam-media").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploadingMedia(null);
      return;
    }
    const { data: urlData } = supabase.storage.from("exam-media").getPublicUrl(path);
    setEditingTemplate((prev) => {
      const urls = [...(prev!.media_urls || [])];
      urls[index] = urlData.publicUrl;
      return { ...prev!, media_urls: urls };
    });
    setUploadingMedia(null);
    toast({ title: "Uploaded!" });
  };

  const handleSave = async () => {
    if (!editingTemplate) return;
    setSaving(true);

    const payload = {
      opgave: editingTemplate.opgave,
      question_number: editingTemplate.question_number,
      opgave_type: editingTemplate.opgave_type,
      situation_dutch: editingTemplate.situation_dutch,
      situation_english: editingTemplate.situation_english,
      dutch_question: editingTemplate.dutch_question,
      english_question: editingTemplate.english_question,
      hints: (editingTemplate.hints || []).filter((h) => h.trim()),
      sample_answer: editingTemplate.sample_answer,
      keywords: (editingTemplate.keywords || []).filter((k) => k.trim()),
      category: editingTemplate.category,
      video_description: editingTemplate.video_description || null,
      media_urls: (editingTemplate.media_urls || []).filter((u) => u),
      placeholder_descriptions: editingTemplate.placeholder_descriptions || [],
      tags: editingTemplate.tags || [],
      is_active: editingTemplate.is_active ?? true,
    };

    let error;
    if (isNew) {
      ({ error } = await supabase.from("speaking_question_templates").insert(payload as any));
    } else {
      ({ error } = await supabase
        .from("speaking_question_templates")
        .update(payload as any)
        .eq("id", editingTemplate.id!));
    }

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: isNew ? "Question created" : "Question updated" });
      setEditingTemplate(null);
      fetchTemplates();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question template?")) return;
    const { error } = await supabase.from("speaking_question_templates").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted" });
      fetchTemplates();
    }
  };

  const addTag = () => {
    if (tagInput.trim() && editingTemplate) {
      setEditingTemplate({ ...editingTemplate, tags: [...(editingTemplate.tags || []), tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    if (!editingTemplate) return;
    setEditingTemplate({ ...editingTemplate, tags: (editingTemplate.tags || []).filter((_, i) => i !== index) });
  };

  const filtered = filterOpgave === "all"
    ? templates
    : templates.filter((t) => t.opgave === Number(filterOpgave));

  const opgaveIcon = (opgave: number) => {
    const Icon = OPGAVE_CONFIG[opgave]?.icon || Image;
    return <Icon className="h-4 w-4" />;
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate("/")}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-bold text-foreground">
              Admin — Spreken Examen
            </h1>
          </div>
          {/* Tabs */}
          <div className="flex gap-1">
            {(["vragen", "afbeeldingen"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab === "vragen" ? "📋 Vragen" : "🖼️ Afbeeldingen"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── VRAGEN TAB ──────────────────────────────────────────────────────── */}
      {activeTab === "vragen" && (
        <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Select value={filterOpgave} onValueChange={setFilterOpgave}>
                <SelectTrigger className="w-[180px] rounded-xl">
                  <SelectValue placeholder="Filter by opgave" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All opgaven</SelectItem>
                  <SelectItem value="1">Opgave 1 — Video</SelectItem>
                  <SelectItem value="2">Opgave 2 — 1 photo</SelectItem>
                  <SelectItem value="3">Opgave 3 — 2 photos</SelectItem>
                  <SelectItem value="4">Opgave 4 — 3 photos</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">{filtered.length} questions</span>
            </div>
            <Button
              onClick={() => { setEditingTemplate(emptyTemplate()); setIsNew(true); }}
              className="rounded-xl gap-2 bg-gradient-hero text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> Add Question
            </Button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg font-bold">No questions yet</p>
              <p className="text-sm mt-1">Click "Add Question" to create your first template.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="w-32">Opgave</TableHead>
                    <TableHead>Dutch Question</TableHead>
                    <TableHead className="w-24">Category</TableHead>
                    <TableHead className="w-20">Tags</TableHead>
                    <TableHead className="w-20">Active</TableHead>
                    <TableHead className="w-32 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono font-bold text-sm">{t.question_number}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          {opgaveIcon(t.opgave)}
                          <span className="font-medium">{OPGAVE_CONFIG[t.opgave]?.label.split(" — ")[1]}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm max-w-[300px] truncate">{t.dutch_question}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="rounded-lg text-xs">{t.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {t.tags.length > 0 && (
                          <span className="text-xs text-muted-foreground">{t.tags.length} tags</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-block h-2 w-2 rounded-full ${t.is_active ? "bg-success" : "bg-muted-foreground"}`} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => setPreviewTemplate(t)}
                            className="h-8 w-8 rounded-lg"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => { setEditingTemplate(t); setIsNew(false); }}
                            className="h-8 w-8 rounded-lg"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => handleDelete(t.id)}
                            className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* ── AFBEELDINGEN TAB ────────────────────────────────────────────────── */}
      {activeTab === "afbeeldingen" && (
        <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
          {/* Stats strip */}
          <div className="grid grid-cols-4 gap-3">
            {(["pending", "cached", "approved", "rejected"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterImageStatus(filterImageStatus === s ? "all" : s)}
                className={`rounded-xl border p-3 text-center transition-all ${
                  filterImageStatus === s
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <p className="text-2xl font-black font-display text-foreground">{imageStats[s]}</p>
                <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-1 ${STATUS_CONFIG[s].className}`}>
                  {STATUS_CONFIG[s].label}
                </span>
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Select value={filterImageOpgave} onValueChange={setFilterImageOpgave}>
                <SelectTrigger className="w-[180px] rounded-xl">
                  <SelectValue placeholder="Filter by opgave" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All opgaven</SelectItem>
                  <SelectItem value="1">Opgave 1</SelectItem>
                  <SelectItem value="2">Opgave 2</SelectItem>
                  <SelectItem value="3">Opgave 3</SelectItem>
                  <SelectItem value="4">Opgave 4</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterImageStatus} onValueChange={setFilterImageStatus}>
                <SelectTrigger className="w-[160px] rounded-xl">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cached">Cached</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">{displaySlots.length} slots</span>
            </div>

            <Button
              onClick={handleBatchGenerate}
              disabled={generatingAll}
              className="rounded-xl gap-2 bg-gradient-hero text-primary-foreground"
            >
              {generatingAll
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Bezig...</>
                : <><Zap className="h-4 w-4" /> Genereer ontbrekende</>
              }
            </Button>
          </div>

          {/* Images table */}
          {imagesLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : displaySlots.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg font-bold">Geen slots gevonden</p>
              <p className="text-sm mt-1">Pas de filters aan of klik op "Genereer ontbrekende".</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Q#</TableHead>
                    <TableHead className="w-20">Opgave</TableHead>
                    <TableHead className="w-12">Slot</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-20">Preview</TableHead>
                    <TableHead>Prompt</TableHead>
                    <TableHead className="w-36 text-right">Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displaySlots.map((s) => {
                    const key = `${s.questionId}_${s.slot}`;
                    const record = imageRecordMap.get(key);
                    const status = record?.status ?? "pending";
                    const isGenerating = generatingSlots.has(key) || (generatingAll && status !== "cached" && status !== "approved");

                    return (
                      <TableRow key={key}>
                        <TableCell className="font-mono font-bold text-sm">{s.questionId}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-lg text-xs">O{s.opgave}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{s.slot}</TableCell>
                        <TableCell>
                          {isGenerating ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
                              <Loader2 className="h-3 w-3 animate-spin" /> Bezig
                            </span>
                          ) : (
                            <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.className}`}>
                              {STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record?.image_url ? (
                            <img
                              src={record.image_url}
                              alt={`Q${s.questionId} slot ${s.slot}`}
                              className="h-10 w-14 object-cover rounded-lg border border-border"
                            />
                          ) : (
                            <div className="h-10 w-14 rounded-lg border border-border bg-muted flex items-center justify-center">
                              <Image className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[280px] truncate" title={s.prompt}>
                          {s.prompt}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {status === "cached" && (
                              <Button
                                variant="ghost" size="icon"
                                onClick={() => handleApprove(s.questionId, s.slot)}
                                className="h-7 w-7 rounded-lg text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Goedkeuren"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            {(status === "cached" || status === "approved") && (
                              <Button
                                variant="ghost" size="icon"
                                onClick={() => handleReject(s.questionId, s.slot)}
                                className="h-7 w-7 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Afwijzen"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost" size="icon"
                              onClick={() => handleRegenerate(s.questionId, s.slot, s.prompt)}
                              disabled={isGenerating}
                              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                              title="Opnieuw genereren"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* ── Edit/Create Dialog ───────────────────────────────────────────────── */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => { if (!open) setEditingTemplate(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {isNew ? "New Question Template" : "Edit Question Template"}
            </DialogTitle>
          </DialogHeader>

          {editingTemplate && (
            <div className="space-y-5 pt-2">
              {/* Opgave & Number */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Opgave</Label>
                  <Select
                    value={String(editingTemplate.opgave)}
                    onValueChange={(v) => handleOpgaveChange(Number(v))}
                  >
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((n) => (
                        <SelectItem key={n} value={String(n)}>{OPGAVE_CONFIG[n].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Question Number (1–16)</Label>
                  <Input
                    type="number" min={1} max={16}
                    value={editingTemplate.question_number}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, question_number: Number(e.target.value) })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={editingTemplate.category}
                  onValueChange={(v) => setEditingTemplate({ ...editingTemplate, category: v })}
                >
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beschrijven">Beschrijven</SelectItem>
                    <SelectItem value="mening">Mening</SelectItem>
                    <SelectItem value="situatie">Situatie</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Situation */}
              <div className="space-y-2">
                <Label>Situation (Dutch)</Label>
                <Textarea
                  value={editingTemplate.situation_dutch}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, situation_dutch: e.target.value })}
                  className="rounded-xl" rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Situation (English)</Label>
                <Textarea
                  value={editingTemplate.situation_english}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, situation_english: e.target.value })}
                  className="rounded-xl" rows={2}
                />
              </div>

              {/* Question */}
              <div className="space-y-2">
                <Label>Dutch Question</Label>
                <Textarea
                  value={editingTemplate.dutch_question}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, dutch_question: e.target.value })}
                  placeholder="e.g. Kijk naar de plaatjes. Wat eet u liever? Vertel ook waarom."
                  className="rounded-xl" rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>English Question</Label>
                <Textarea
                  value={editingTemplate.english_question}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, english_question: e.target.value })}
                  className="rounded-xl" rows={2}
                />
              </div>

              {/* Video description (opgave 1 only) */}
              {editingTemplate.opgave === 1 && (
                <div className="space-y-2">
                  <Label>Video Description (Dutch)</Label>
                  <Textarea
                    value={editingTemplate.video_description || ""}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, video_description: e.target.value })}
                    placeholder="Describe what happens in the video..."
                    className="rounded-xl" rows={3}
                  />
                </div>
              )}

              {/* Media upload (opgave 2–4) */}
              {editingTemplate.opgave !== 1 && (
                <div className="space-y-3">
                  <Label>Photos ({OPGAVE_CONFIG[editingTemplate.opgave!].mediaCount} required)</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {Array.from({ length: OPGAVE_CONFIG[editingTemplate.opgave!].mediaCount }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="aspect-[4/3] rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden relative">
                          {editingTemplate.media_urls?.[i] ? (
                            <img
                              src={editingTemplate.media_urls[i]}
                              alt={`Photo ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : uploadingMedia === i ? (
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          ) : (
                            <label className="flex flex-col items-center gap-1 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                              <Upload className="h-5 w-5" />
                              <span className="text-xs font-medium">Upload {i + 1}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleMediaUpload(e.target.files[0], i)}
                              />
                            </label>
                          )}
                          {editingTemplate.media_urls?.[i] && (
                            <label className="absolute inset-0 flex items-center justify-center bg-foreground/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                              <Upload className="h-5 w-5 text-background" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleMediaUpload(e.target.files[0], i)}
                              />
                            </label>
                          )}
                        </div>
                        <Input
                          value={editingTemplate.placeholder_descriptions?.[i] || ""}
                          onChange={(e) => {
                            const descs = [...(editingTemplate.placeholder_descriptions || [])];
                            descs[i] = e.target.value;
                            setEditingTemplate({ ...editingTemplate, placeholder_descriptions: descs });
                          }}
                          placeholder={`Description ${i + 1}`}
                          className="rounded-xl text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hints */}
              <div className="space-y-2">
                <Label>Hints</Label>
                {(editingTemplate.hints || [""]).map((hint, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={hint}
                      onChange={(e) => {
                        const h = [...(editingTemplate.hints || [])];
                        h[i] = e.target.value;
                        setEditingTemplate({ ...editingTemplate, hints: h });
                      }}
                      placeholder="e.g. Gebruik: Ik vind..."
                      className="rounded-xl text-sm"
                    />
                    {i === (editingTemplate.hints || []).length - 1 && (
                      <Button
                        variant="outline" size="icon"
                        onClick={() => setEditingTemplate({ ...editingTemplate, hints: [...(editingTemplate.hints || []), ""] })}
                        className="rounded-xl shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Sample Answer */}
              <div className="space-y-2">
                <Label>Sample Answer</Label>
                <Textarea
                  value={editingTemplate.sample_answer}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, sample_answer: e.target.value })}
                  placeholder="Short A2-level answer, 1-2 sentences"
                  className="rounded-xl" rows={2}
                />
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <Label>Keywords (comma-separated)</Label>
                <Input
                  value={(editingTemplate.keywords || []).join(", ")}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    keywords: e.target.value.split(",").map((k) => k.trim()),
                  })}
                  placeholder="e.g. kopen, markt, vers"
                  className="rounded-xl"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(editingTemplate.tags || []).map((tag, i) => (
                    <Badge key={i} variant="secondary" className="rounded-lg gap-1">
                      {tag}
                      <button onClick={() => removeTag(i)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="Add a tag..."
                    className="rounded-xl text-sm"
                  />
                  <Button variant="outline" onClick={addTag} className="rounded-xl">
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={editingTemplate.is_active ?? true}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, is_active: e.target.checked })}
                  className="h-4 w-4 rounded"
                />
                <Label>Active (visible in exams)</Label>
              </div>

              {/* Save */}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setEditingTemplate(null)} className="rounded-xl">
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl gap-2 bg-gradient-hero text-primary-foreground"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isNew ? "Create" : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Preview Dialog ───────────────────────────────────────────────────── */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => { if (!open) setPreviewTemplate(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              Preview — Vraag {previewTemplate?.question_number}
            </DialogTitle>
          </DialogHeader>

          {previewTemplate && (
            <div className="space-y-4 pt-2">
              {/* Opgave header */}
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
                <p className="font-display text-sm font-black text-primary">
                  {OPGAVE_CONFIG[previewTemplate.opgave]?.label}
                </p>
                <p className="text-xs text-foreground mt-1">
                  {previewTemplate.opgave === 1
                    ? "U ziet een filmpje. Daarna hoort u een vraag. Geef antwoord op de vraag."
                    : previewTemplate.opgave === 2
                    ? "U ziet een plaatje. U hoort een situatie en een vraag. Geef antwoord op de vraag."
                    : previewTemplate.opgave === 3
                    ? "U ziet twee plaatjes. U hoort een situatie en een vraag. Geef antwoord op de vraag."
                    : "U ziet drie plaatjes. U hoort een situatie en een vraag. Geef antwoord op de vraag. Vertel ook waarom."}
                </p>
              </div>

              {/* Media */}
              {previewTemplate.opgave === 1 ? (
                <div className="rounded-xl bg-muted aspect-video flex items-center justify-center border border-border">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground p-4 text-center">
                    <Film className="h-10 w-10" />
                    <p className="text-sm font-bold">Filmpje</p>
                    <p className="text-xs">{previewTemplate.video_description}</p>
                  </div>
                </div>
              ) : (
                <div className={`grid gap-2 ${
                  previewTemplate.media_urls.length === 1 ? "" :
                  previewTemplate.media_urls.length === 2 ? "grid-cols-2" : "grid-cols-3"
                }`}>
                  {previewTemplate.media_urls.map((url, i) => (
                    <div key={i} className="aspect-[4/3] rounded-xl border border-border overflow-hidden bg-muted relative">
                      {previewTemplate.media_urls.length > 1 && (
                        <span className="absolute top-1.5 left-1.5 bg-foreground/80 text-background text-xs font-bold px-1.5 py-0.5 rounded-md z-10">
                          {i + 1}
                        </span>
                      )}
                      {url ? (
                        <img src={url} alt={previewTemplate.placeholder_descriptions[i]} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                          No image
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Situation & Question */}
              <div className="rounded-xl bg-card border border-border p-4 space-y-3">
                <p className="text-sm text-muted-foreground italic">{previewTemplate.situation_dutch}</p>
                <p className="text-xs text-muted-foreground/70">{previewTemplate.situation_english}</p>
                <div className="pt-2 border-t border-border">
                  <p className="font-display text-base font-bold text-foreground">{previewTemplate.dutch_question}</p>
                  <p className="text-sm text-muted-foreground mt-1">{previewTemplate.english_question}</p>
                </div>
              </div>

              {/* Sample answer */}
              <div className="rounded-xl bg-success/5 border border-success/20 p-3">
                <p className="text-xs font-medium text-success mb-1">📝 Voorbeeldantwoord:</p>
                <p className="text-sm font-semibold text-foreground">{previewTemplate.sample_answer}</p>
              </div>

              {/* Tags */}
              {previewTemplate.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {previewTemplate.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="rounded-lg text-xs">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminExamPage;
