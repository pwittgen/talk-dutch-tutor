import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, FileSpreadsheet, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ParsedWord {
  dutch: string;
  english: string;
  example_sentence: string;
  part_of_speech: string;
}

interface VocabImportDialogProps {
  themeId: string;
  themeName: string;
  existingWordCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VocabImportDialog = ({
  themeId,
  themeName,
  existingWordCount,
  open,
  onOpenChange,
}: VocabImportDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedWord[]>([]);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });

      // Skip header row if first cell looks like a header
      const startIdx =
        json.length > 0 &&
        typeof json[0][0] === "string" &&
        json[0][0].toLowerCase().includes("dutch")
          ? 1
          : 0;

      const parsed: ParsedWord[] = [];
      for (let i = startIdx; i < json.length; i++) {
        const row = json[i];
        if (!row || !row[0] || !row[1]) continue; // need at least dutch + english
        parsed.push({
          dutch: String(row[0]).trim(),
          english: String(row[1]).trim(),
          example_sentence: row[2] ? String(row[2]).trim() : "",
          part_of_speech: row[3] ? String(row[3]).trim() : "",
        });
      }
      setRows(parsed);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (rows.length === 0) return;
    setImporting(true);
    try {
      const insertData = rows.map((r, i) => ({
        theme_id: themeId,
        dutch: r.dutch,
        english: r.english,
        example_sentence: r.example_sentence || null,
        part_of_speech: r.part_of_speech || null,
        sort_order: existingWordCount + i,
      }));

      const { error } = await supabase.from("vocab_words").insert(insertData);
      if (error) throw error;

      toast({ title: `${rows.length} words imported!` });
      queryClient.invalidateQueries({ queryKey: ["admin-words"] });
      queryClient.invalidateQueries({ queryKey: ["vocab-words"] });
      queryClient.invalidateQueries({ queryKey: ["vocab-themes"] });
      setRows([]);
      setFileName("");
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Import failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setRows([]);
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" /> Import Words to{" "}
            {themeName}
          </DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file. Columns: Dutch, English, Example
            sentence (optional), Part of speech (optional).
          </DialogDescription>
        </DialogHeader>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFile}
              className="hidden"
            />
            <Button
              variant="outline"
              size="lg"
              onClick={() => fileRef.current?.click()}
              className="gap-2"
            >
              <Upload className="h-5 w-5" /> Choose File
            </Button>
            <p className="text-sm text-muted-foreground">
              Accepts .csv, .xlsx, .xls
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                📄 {fileName} — {rows.length} words found
              </p>
              <Button variant="ghost" size="sm" onClick={reset}>
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            </div>

            <div className="overflow-auto flex-1 border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Dutch</TableHead>
                    <TableHead>English</TableHead>
                    <TableHead>Example</TableHead>
                    <TableHead>POS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground">
                        {i + 1}
                      </TableCell>
                      <TableCell className="font-medium">{r.dutch}</TableCell>
                      <TableCell>{r.english}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {r.example_sentence}
                      </TableCell>
                      <TableCell className="text-xs">
                        {r.part_of_speech}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={importing}>
                <Check className="h-4 w-4 mr-1" />{" "}
                {importing
                  ? "Importing..."
                  : `Import ${rows.length} Words`}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VocabImportDialog;
