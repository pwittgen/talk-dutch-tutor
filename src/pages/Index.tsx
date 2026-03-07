import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Settings, LogIn, LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { scenarios, sections } from "@/data/scenarios";
import { useVocabThemes } from "@/hooks/useVocabThemes";
import ScenarioCard from "@/components/ScenarioCard";
import VocabCategoryCard from "@/components/VocabCategoryCard";
import SectionTabs, { type SectionId } from "@/components/SectionTabs";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-dutch.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionId>("practice");
  const { data: vocabThemes = [] } = useVocabThemes();
  const { user, isAdmin, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <span className="font-display text-xl font-semibold text-foreground tracking-tight">
            Talk Dutch
          </span>
          <nav className="flex items-center gap-6">
            {user ? (
              <>
                <button
                  onClick={() => navigate("/progress")}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors tracking-wide"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Progress
                </button>
                {isAdmin && (
                  <button
                    onClick={() => navigate("/admin/vocab")}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors tracking-wide"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Admin
                  </button>
                )}
                <button
                  onClick={() => navigate("/settings")}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors tracking-wide"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </button>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors tracking-wide"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="flex items-center gap-1.5 text-sm font-medium text-primary-foreground bg-primary px-4 py-2 rounded hover:opacity-90 transition-opacity"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign in
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero — editorial two-column spread */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs tracking-[0.18em] uppercase text-muted-foreground mb-6 block font-sans">
              Dutch A1–A2 · Inburgering
            </span>
            <h1 className="font-display text-5xl lg:text-6xl font-semibold text-foreground leading-[1.1] tracking-tight mb-6">
              Praat maar.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-sm">
              A quiet space to practice Dutch, guided by AI. Conversations,
              vocabulary, and exam preparation for the <em>inburgering</em>.
            </p>
            {!user && (
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Start practicing
              </button>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <img
              src={heroImage}
              alt="Dutch canal scene with windmill and tulips"
              className="w-full aspect-[4/3] object-cover rounded"
            />
          </motion.div>
        </div>
      </section>

      {/* Tabs + content */}
      <div className="mx-auto max-w-6xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <SectionTabs activeSection={activeSection} onSectionChange={setActiveSection} />
        </motion.div>

        <div className="mt-12">
          {activeSection === "practice" && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-20"
            >
              {sections.map((section) => {
                const sectionScenarios = scenarios.filter((s) => s.section === section.id);
                if (sectionScenarios.length === 0) return null;
                return (
                  <section key={section.id}>
                    <div className="mb-8 pb-4 border-b border-border">
                      <span className="text-xs tracking-[0.18em] uppercase text-muted-foreground mb-2 block font-sans">
                        {section.emoji} {section.dutchTitle}
                      </span>
                      <h2 className="font-display text-2xl font-semibold text-foreground">
                        {section.title}
                      </h2>
                      <p className="mt-2 text-muted-foreground text-sm leading-relaxed max-w-lg">
                        {section.description}
                      </p>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {sectionScenarios.map((scenario, i) => (
                        <ScenarioCard key={scenario.id} scenario={scenario} index={i} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </motion.div>
          )}

          {activeSection === "learn" && (
            <motion.div
              key="learn"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-8 pb-4 border-b border-border">
                <span className="text-xs tracking-[0.18em] uppercase text-muted-foreground mb-2 block font-sans">
                  Vocabulary
                </span>
                <h2 className="font-display text-2xl font-semibold text-foreground">
                  Build Your Vocabulary
                </h2>
                <p className="mt-2 text-muted-foreground text-sm leading-relaxed max-w-lg">
                  Master essential <em>inburgering</em> vocabulary through flashcards and matching games.
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {vocabThemes.map((theme, i) => (
                  <VocabCategoryCard key={theme.id} category={theme} index={i} />
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === "exam" && (
            <motion.div
              key="exam"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
            >
              <div className="mb-8 pb-4 border-b border-border">
                <span className="text-xs tracking-[0.18em] uppercase text-muted-foreground mb-2 block font-sans">
                  Exam Preparation
                </span>
                <h2 className="font-display text-2xl font-semibold text-foreground">
                  Inburgering A2 Examen
                </h2>
                <p className="mt-2 text-muted-foreground text-sm leading-relaxed max-w-lg">
                  Practice all sections of the Dutch civic integration exam.
                </p>
              </div>

              <div className="border border-border p-8 rounded space-y-8">
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { emoji: "📖", label: "Lezen" },
                    { emoji: "🗣️", label: "Spreken" },
                    { emoji: "👂", label: "Luisteren" },
                    { emoji: "✍️", label: "Schrijven" },
                  ].map(({ emoji, label }) => (
                    <div key={label} className="flex flex-col items-center gap-2 p-4 bg-muted rounded">
                      <span className="text-2xl">{emoji}</span>
                      <span className="text-xs tracking-wider uppercase text-muted-foreground font-sans font-medium">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    4 exam categories
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    Practice Lezen, Spreken, Luisteren en Schrijven — following the DUO A2 format.
                  </p>
                  <button
                    onClick={() => navigate("/exam-hub")}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Start exam practice
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
          <span className="font-display text-sm font-medium text-foreground">Talk Dutch</span>
          <p className="text-sm text-muted-foreground">
            Made with care for Dutch learners.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
