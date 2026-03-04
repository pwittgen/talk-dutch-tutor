import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSpeechLogs, clearSpeechLogs, type SpeechLogEntry } from "@/lib/speechDebugLog";

const DebugLogsPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<SpeechLogEntry[]>([]);
  const [filter, setFilter] = useState("");

  const refresh = () => setLogs(getSpeechLogs());

  useEffect(() => { refresh(); }, []);

  const filtered = filter
    ? logs.filter(l => l.event.toLowerCase().includes(filter.toLowerCase()) || l.scenario.toLowerCase().includes(filter.toLowerCase()))
    : logs;

  const eventColor = (event: string) => {
    if (event.includes("error") || event.includes("fail")) return "text-red-500";
    if (event.includes("start")) return "text-green-500";
    if (event.includes("submit") || event.includes("result")) return "text-blue-500";
    if (event.includes("end") || event.includes("stop")) return "text-amber-500";
    return "text-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-bold text-foreground flex-1">🐛 Speech Debug Logs</h1>
          <Button variant="outline" size="sm" onClick={refresh}><RefreshCw className="h-4 w-4 mr-1" /> Refresh</Button>
          <Button variant="destructive" size="sm" onClick={() => { clearSpeechLogs(); refresh(); }}><Trash2 className="h-4 w-4 mr-1" /> Clear</Button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-4">
        <input
          placeholder="Filter by event or scenario..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm"
        />

        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No logs yet. Go practice a scenario and tap the record button!</p>
        ) : (
          <div className="space-y-2">
            {filtered.map(log => (
              <div key={log.id} className="border border-border rounded-lg p-3 bg-card text-sm">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className={`font-mono font-bold ${eventColor(log.event)}`}>{log.event}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mb-1">Scenario: {log.scenario}</div>
                <pre className="text-xs bg-muted/50 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugLogsPage;
