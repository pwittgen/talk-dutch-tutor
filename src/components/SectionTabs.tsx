import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export type SectionId = "practice" | "learn" | "exam";

interface SectionTabsProps {
  activeSection: SectionId;
  onSectionChange: (section: SectionId) => void;
}

const tabs: { id: SectionId; label: string; emoji: string; subtitle: string }[] = [
  { id: "practice", label: "Practice", emoji: "💬", subtitle: "Conversations" },
  { id: "learn", label: "Learn", emoji: "📖", subtitle: "Vocabulary" },
  { id: "exam", label: "Exam Prep", emoji: "🎓", subtitle: "Speaking Test" },
];

const SectionTabs = ({ activeSection, onSectionChange }: SectionTabsProps) => {
  const navigate = useNavigate();

  const handleTabClick = (tabId: SectionId) => {
    if (tabId === "exam") {
      navigate("/exam-hub");
    } else {
      onSectionChange(tabId);
    }
  };

  return (
    <div className="flex gap-1 rounded-2xl bg-muted p-1.5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={`relative flex-1 rounded-xl px-3 py-2.5 text-center transition-colors ${
            activeSection === tab.id
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground/70"
          }`}
        >
          {activeSection === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-xl bg-card shadow-card"
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
            />
          )}
          <span className="relative z-10 flex flex-col items-center gap-0.5">
            <span className="text-base">{tab.emoji}</span>
            <span className="text-xs font-bold leading-tight">{tab.label}</span>
            <span className="text-[10px] font-medium leading-tight opacity-70">{tab.subtitle}</span>
          </span>
        </button>
      ))}
    </div>
  );
};

export default SectionTabs;
