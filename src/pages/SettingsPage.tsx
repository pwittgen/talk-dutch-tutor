import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mic, Settings } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useRecordingSettings } from "@/hooks/useRecordingSettings";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useRecordingSettings();

  const isManual = settings.mode === "manual";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <Settings className="h-5 w-5" /> Settings
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
        {/* Voice Recording Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Mic className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground">Voice Recording</h2>
          </div>

          <div className="rounded-2xl bg-card p-6 shadow-card space-y-6">
            {/* Mode Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="recording-mode" className="text-base font-semibold text-foreground">
                  Manual stop recording
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {isManual
                    ? "Tap once to start, tap again to stop"
                    : "Recording stops automatically after a set time"}
                </p>
              </div>
              <Switch
                id="recording-mode"
                checked={isManual}
                onCheckedChange={(checked) =>
                  updateSettings({ mode: checked ? "manual" : "auto" })
                }
              />
            </div>

            {/* Auto-stop slider - only shown in auto mode */}
            {!isManual && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold text-foreground">
                    Auto-stop after
                  </Label>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                    {settings.autoStopSeconds}s
                  </span>
                </div>
                <Slider
                  value={[settings.autoStopSeconds]}
                  onValueChange={(v) => updateSettings({ autoStopSeconds: v[0] })}
                  min={3}
                  max={15}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>3 seconds</span>
                  <span>15 seconds</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default SettingsPage;
