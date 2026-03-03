import { motion } from "framer-motion";
import { Mic, BookOpen, MessageCircle, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { scenarios, sections } from "@/data/scenarios";
import ScenarioCard from "@/components/ScenarioCard";
import heroImage from "@/assets/hero-dutch.jpg";

const Index = () => {
  const navigate = useNavigate();

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

        <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary">
              🇳🇱 Learn Dutch A1–A2
            </span>
            <h1 className="font-display text-5xl font-black leading-tight tracking-tight text-foreground md:text-6xl">
              Praat maar!
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
              Learn Dutch through real-life conversations. Speak, listen, and get instant feedback in everyday situations.
            </p>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            {[
              { icon: Mic, label: "Speak Dutch" },
              { icon: MessageCircle, label: "Real conversations" },
              { icon: BookOpen, label: "Grammar tips" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-card"
              >
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">{label}</span>
              </div>
            ))}
            <button
              onClick={() => navigate("/progress")}
              className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-card hover:shadow-card-hover transition-shadow"
            >
              <BarChart3 className="h-4 w-4 text-secondary" />
              <span className="text-sm font-semibold text-foreground">My Progress</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Scenario Sections */}
      <div className="mx-auto max-w-5xl px-4 pb-20 space-y-16">
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
