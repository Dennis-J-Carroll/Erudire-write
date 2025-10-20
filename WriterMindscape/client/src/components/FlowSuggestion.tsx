import { useState, useEffect, useRef } from "react";
import { X, Lightbulb, GripVertical } from "lucide-react";

interface FlowSuggestionProps {
  isVisible: boolean;
  onDismiss: () => void;
  suggestion: string;
  position?: { top: number; left: number };
}

export default function FlowSuggestion({ 
  isVisible, 
  onDismiss, 
  suggestion,
  position = { top: 100, left: 100 }
}: FlowSuggestionProps) {
  const [show, setShow] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(position);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShow(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible]);

  useEffect(() => {
    setCurrentPosition(position);
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start dragging if clicking on the dismiss button
    if ((e.target as Element).closest('button')) {
      return;
    }
    
    setIsDragging(true);
    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setCurrentPosition({
          top: e.clientY - dragOffset.y,
          left: e.clientX - dragOffset.x
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (!isVisible && !show) return null;

  return (
    <div 
      ref={elementRef}
      className={`flow-suggestion ${show ? 'show' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        top: `${currentPosition.top}px`,
        left: `${currentPosition.left}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-start gap-2">
        <div className="flex items-center">
          <Lightbulb className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
        </div>
        <div className="flex-1">
          <p className="text-sm">{suggestion}</p>
          <p className="text-xs text-muted-foreground mt-1">Drag anywhere to move • Click X to dismiss</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}