import { motion } from "framer-motion";
import { Mic, BookOpen, MessageCircle } from "lucide-react";
import { scenarios } from "@/data/scenarios";
import ScenarioCard from "@/components/ScenarioCard";
import heroImage from "@/assets/hero-dutch.jpg";

const Index = () => {
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
          </motion.div>
        </div>
      </section>

      {/* Scenarios Grid */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-black text-foreground">
            Choose a Scenario
          </h2>
          <p className="mt-1 text-muted-foreground">
            Pick an everyday situation and start practicing Dutch
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario, i) => (
            <ScenarioCard key={scenario.id} scenario={scenario} index={i} />
          ))}
        </div>
      </section>

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
