import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, BookOpen, MessageCircle, BarChart3, Settings, LogIn, LogOut, Shield } from "lucide-react";
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
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Dutch canal scene with windmill and tulips"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 pb-8 pt-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary">
              🇳🇱 Learn Dutch A1–A2
            </span>
            <h1 className="font-display text-4xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
              Praat maar!
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-base text-muted-foreground">
              Learn Dutch through real-life conversations, vocabulary games, and exam practice.
            </p>
          </motion.div>

          {/* Utility links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-5 flex flex-wrap items-center justify-center gap-2"
          >
            {user ? (
              <>
                <button
                  onClick={() => navigate("/progress")}
                  className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-card hover:shadow-card-hover transition-shadow"
                >
                  <BarChart3 className="h-4 w-4 text-secondary" />
                  <span className="text-sm font-semibold text-foreground">My Progress</span>
                </button>
                {isAdmin && (
                  <button
                    onClick={() => navigate("/admin/vocab")}
                    className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-card hover:shadow-card-hover transition-shadow"
                  >
                    <Shield className="h-4 w-4 text-accent" />
                    <span className="text-sm font-semibold text-foreground">Admin</span>
                  </button>
                )}
                <button
                  onClick={() => navigate("/settings")}
                  className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-card hover:shadow-card-hover transition-shadow"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">Settings</span>
                </button>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-card hover:shadow-card-hover transition-shadow"
                >
                  <LogOut className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">Log Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <LogIn className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Log In</span>
              </button>
            )}
          </motion.div>

          {/* Section Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-6 mx-auto max-w-md"
          >
            <SectionTabs activeSection={activeSection} onSectionChange={setActiveSection} />
          </motion.div>
        </div>
      </section>

      {/* Content based on active section */}
      <div className="mx-auto max-w-5xl px-4 pb-20 pt-8">
        {activeSection === "practice" && (
          <motion.div
            key="practice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-16"
          >
            {sections.map((section) => {
              const sectionScenarios = scenarios.filter((s) => s.section === section.id);
              if (sectionScenarios.length === 0) return null;
              return (
                <section key={section.id}>
                  <div className="mb-6">
                    <h2 className="font-display text-2xl font-black text-foreground flex items-center gap-2">
                      <span>{section.emoji}</span> {section.title}
                    </h2>
                    <p className="mt-0.5 text-sm font-medium text-secondary italic">{section.dutchTitle}</p>
                    <p className="mt-1 text-muted-foreground">{section.description}</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-8 text-center">
              <h2 className="font-display text-2xl font-black text-foreground">
                📖 Build Your Vocabulary
              </h2>
              <p className="mt-1 text-muted-foreground">
                Master essential inburgering vocabulary through flashcards and matching games
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vocabThemes.map((theme, i) => (
                <VocabCategoryCard key={theme.id} category={theme} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {activeSection === "exam" && (
          <motion.div
            key="exam"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="mb-8">
              <h2 className="font-display text-2xl font-black text-foreground">
                🎓 Inburgering A2 Examen
              </h2>
              <p className="mt-1 text-muted-foreground">
                Oefen alle onderdelen van het inburgeringsexamen
              </p>
            </div>

            <div className="rounded-2xl bg-card border border-border p-8 shadow-card space-y-6">
              <div className="text-5xl">📝</div>
              <h3 className="font-display text-xl font-bold text-foreground">
                4 Examencategorieën
              </h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Oefen Lezen, Spreken, Luisteren en Schrijven — net als bij het echte DUO A2 examen.
              </p>
              
              <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xl">📖</p>
                  <p className="text-xs text-muted-foreground font-bold">Lezen</p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xl">🗣️</p>
                  <p className="text-xs text-muted-foreground font-bold">Spreken</p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xl">👂</p>
                  <p className="text-xs text-muted-foreground font-bold">Luisteren</p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xl">✍️</p>
                  <p className="text-xs text-muted-foreground font-bold">Schrijven</p>
                </div>
              </div>

              <button
                onClick={() => navigate("/exam-hub")}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-delft px-8 py-4 text-lg font-bold text-secondary-foreground shadow-card hover:shadow-card-hover transition-shadow"
              >
                Start Examen Oefenen
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center">
        <p className="text-sm text-muted-foreground">
          🌷 Made with liefde for Dutch learners
        </p>
      </footer>
    </div>
  );
};

export default Index;
