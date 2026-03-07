import { motion } from "framer-motion";

export type SectionId = "practice" | "learn" | "exam";

interface SectionTabsProps {
  activeSection: SectionId;
  onSectionChange: (section: SectionId) => void;
}

const tabs: { id: SectionId; label: string; subtitle: string }[] = [
  { id: "practice", label: "Practice", subtitle: "Conversations" },
  { id: "learn", label: "Learn", subtitle: "Vocabulary" },
  { id: "exam", label: "Exam Prep", subtitle: "A2 Examen" },
];

const SectionTabs = ({ activeSection, onSectionChange }: SectionTabsProps) => {
  return (
    <div className="flex border-b border-sand gap-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSectionChange(tab.id)}
          className={`relative pb-4 text-left transition-colors ${
            activeSection === tab.id
              ? "text-ink"
              : "text-warm-grey hover:text-ink/70"
          }`}
        >
          <span className="font-mono block text-xs font-bold tracking-wider uppercase">
            {tab.label}
          </span>
          <span className="font-mono block text-[10px] text-warm-grey tracking-widest uppercase mt-0.5">
            {tab.subtitle}
          </span>
          {activeSection === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-rust"
              transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            />
          )}
        </button>
      ))}
    </div>
  );
};

export default SectionTabs;
