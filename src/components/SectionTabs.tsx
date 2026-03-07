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
  const handleTabClick = (tabId: SectionId) => {
    onSectionChange(tabId);
  };

  return (
    <div className="flex border-b border-border gap-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={`relative pb-4 text-left transition-colors ${
            activeSection === tab.id
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground/70"
          }`}
        >
          <span className="block text-sm font-medium tracking-wide font-sans">
            {tab.label}
          </span>
          <span className="block text-xs text-muted-foreground tracking-wider uppercase font-sans mt-0.5">
            {tab.subtitle}
          </span>
          {activeSection === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            />
          )}
        </button>
      ))}
    </div>
  );
};

export default SectionTabs;
