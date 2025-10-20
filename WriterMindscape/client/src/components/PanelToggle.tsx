import { FileText, Palette, ChevronLeft, ChevronRight } from "lucide-react";

interface PanelToggleProps {
  side: "left" | "right";
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function PanelToggle({ side, isCollapsed, onToggle }: PanelToggleProps) {
  const Icon = side === "left" ? FileText : Palette;
  const ChevronIcon = side === "left" 
    ? (isCollapsed ? ChevronRight : ChevronLeft)
    : (isCollapsed ? ChevronLeft : ChevronRight);

  return (
    <button
      onClick={onToggle}
      className={`panel-toggle ${side} ${isCollapsed ? 'collapsed' : ''}`}
      title={`${isCollapsed ? 'Show' : 'Hide'} ${side === 'left' ? 'File Panel' : 'Format Panel'}`}
    >
      {isCollapsed ? <ChevronIcon className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
    </button>
  );
}