import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Settings, LogIn, LogOut, Shield, Mic, BookOpen, Headphones, PenLine, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { scenarios, sections } from "@/data/scenarios";
import { useVocabThemes } from "@/hooks/useVocabThemes";
import ScenarioCard from "@/components/ScenarioCard";
import VocabCategoryCard from "@/components/VocabCategoryCard";
import SectionTabs, { type SectionId } from "@/components/SectionTabs";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-dutch.jpg";
import PraatMaarLogo from "@/components/PraatMaarLogo";

const examCategories = [
  {
    id: "spreken",
    title: "Spreken",
    dutchTitle: "Spreekvaardigheid",
    emoji: "🗣️",
    icon: Mic,
    description: "Beantwoord vragen over plaatjes en situaties",
    detail: "16 vragen · 4 onderdelen · ±35 min",
    available: true,
    route: "/exam",
  },
  {
    id: "lezen",
    title: "Lezen",
    dutchTitle: "Leesvaardigheid",
    emoji: "📖",
    icon: BookOpen,
    description: "Lees korte teksten en beantwoord meerkeuzevragen",
    detail: "25 vragen · 13 teksten · ±45 min",
    available: true,
    hubSection: "lezen",
  },
  {
    id: "luisteren",
    title: "Luisteren",
    dutchTitle: "Luistervaardigheid",
    emoji: "👂",
    icon: Headphones,
    description: "Luister naar gesprekken en beantwoord vragen",
    detail: "24 vragen · ±45 min",
    available: true,
    hubSection: "luisteren",
  },
  {
    id: "schrijven",
    title: "Schrijven",
    dutchTitle: "Schrijfvaardigheid",
    emoji: "✍️",
    icon: PenLine,
    description: "Schrijf korte teksten en berichten in het Nederlands",
    detail: "4 opdrachten · ±30 min",
    available: true,
    hubSection: "schrijven",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionId>("practice");
  const { data: vocabThemes = [] } = useVocabThemes();
  const { user, isAdmin, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <header className="border-b border-sand bg-background sticky top-0 z-20">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <PraatMaarLogo maarSize="22px" />
          <nav className="flex items-center gap-6">
            {user ? (
              <>
                <button
                  onClick={() => navigate("/progress")}
                  className="flex items-center gap-1.5 font-mono text-xs tracking-wider uppercase text-warm-grey hover:text-ink transition-colors"
                >
                  <BarChart3 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Progress
                </button>
                {isAdmin && (
                  <button
                    onClick={() => navigate("/admin/vocab")}
                    className="flex items-center gap-1.5 font-mono text-xs tracking-wider uppercase text-warm-grey hover:text-ink transition-colors"
                  >
                    <Shield className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Admin
                  </button>
                )}
                <button
                  onClick={() => navigate("/settings")}
                  className="flex items-center gap-1.5 font-mono text-xs tracking-wider uppercase text-warm-grey hover:text-ink transition-colors"
                >
                  <Settings className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Settings
                </button>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1.5 font-mono text-xs tracking-wider uppercase text-warm-grey hover:text-ink transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="flex items-center gap-2 bg-rust text-off-white font-sans font-medium text-sm px-4 py-2 rounded hover:bg-ink transition-colors"
              >
                <LogIn className="h-3.5 w-3.5" strokeWidth={1.5} />
                Sign in
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero — editorial two-column spread */}
      <section className="border-b border-sand">
        <div className="mx-auto max-w-5xl px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="font-mono text-xs tracking-[0.18em] uppercase text-warm-grey mb-6 block">
              Dutch A1–A2 · Inburgering
            </span>
            <h1 className="font-display text-5xl lg:text-6xl font-black text-ink leading-[1.1] tracking-tight mb-6">
              Praat maar.
            </h1>
            <p className="font-sans text-lg text-warm-grey leading-relaxed mb-8 max-w-sm">
              A quiet space to practice Dutch, guided by AI. Conversations,
              vocabulary, and exam preparation for the <em>inburgering</em>.
            </p>
            {!user && (
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center gap-2 bg-rust text-off-white font-sans font-medium px-6 py-3 rounded text-sm hover:bg-ink transition-colors"
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
      <div className="mx-auto max-w-5xl px-6 py-16">
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
                    <div className="mb-8 pb-4 border-b border-sand">
                      <span className="font-mono text-xs tracking-[0.18em] uppercase text-warm-grey mb-2 block">
                        {section.emoji} {section.dutchTitle}
                      </span>
                      <h2 className="font-display text-2xl font-bold text-ink">
                        {section.title}
                      </h2>
                      <p className="mt-2 font-sans text-warm-grey text-sm leading-relaxed max-w-lg">
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
              <div className="mb-8 pb-4 border-b border-sand">
                <span className="font-mono text-xs tracking-[0.18em] uppercase text-warm-grey mb-2 block">
                  Vocabulary
                </span>
                <h2 className="font-display text-2xl font-bold text-ink">
                  Build your vocabulary
                </h2>
                <p className="mt-2 font-sans text-warm-grey text-sm leading-relaxed max-w-lg">
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
            >
              <div className="mb-8 pb-4 border-b border-sand">
                <span className="font-mono text-xs tracking-[0.18em] uppercase text-warm-grey mb-2 block">
                  Exam Preparation
                </span>
                <h2 className="font-display text-2xl font-bold text-ink">
                  Inburgering A2 examen
                </h2>
                <p className="mt-2 font-sans text-warm-grey text-sm leading-relaxed max-w-lg">
                  Oefen alle onderdelen van het DUO inburgeringsexamen. Kies een categorie om te beginnen.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {examCategories.map((cat, i) => {
                  const Icon = cat.icon;
                  return (
                    <motion.button
                      key={cat.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      onClick={() => {
                        if (!cat.available) return;
                        if (cat.route) {
                          navigate(cat.route);
                        } else if (cat.hubSection) {
                          navigate("/exam-hub", { state: { section: cat.hubSection } });
                        }
                      }}
                      disabled={!cat.available}
                      className={`relative text-left rounded border p-6 transition-all ${
                        cat.available
                          ? "border-sand bg-card hover:border-rust/40 cursor-pointer"
                          : "border-sand/50 bg-light-grey/30 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      {!cat.available && (
                        <Lock className="absolute top-4 right-4 h-4 w-4 text-warm-grey" strokeWidth={1.5} />
                      )}
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-light-grey text-xl">
                          {cat.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <h3 className="font-display text-base font-bold text-ink">{cat.title}</h3>
                            <span className="font-mono text-xs text-warm-grey">{cat.dutchTitle}</span>
                          </div>
                          <p className="font-sans text-sm text-warm-grey mt-1 leading-relaxed">{cat.description}</p>
                          <p className="font-mono text-xs text-rust font-bold mt-2">{cat.detail}</p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-sand/20 py-10 bg-ink text-cream">
        <div className="mx-auto max-w-5xl px-6 flex items-center justify-between">
          <PraatMaarLogo maarSize="16px" cursorColor="#B8895A" />
          <p className="font-sans text-sm" style={{ color: "#6B6560" }}>
            Made with care for Dutch learners.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
