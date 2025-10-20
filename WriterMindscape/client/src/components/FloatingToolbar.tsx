import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Bold, 
  Italic, 
  Underline, 
  Eye, 
  Calculator,
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Lock,
  Unlock
} from "lucide-react";

interface FloatingToolbarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLockToggle?: () => void;
}

export default function FloatingToolbar({ isCollapsed, onToggleCollapse, onLockToggle }: FloatingToolbarProps) {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isLocked, setIsLocked] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const formatText = (command: string) => {
    document.execCommand(command, false);
  };

  const toggleFocusMode = () => {
    setIsFocusMode(!isFocusMode);
    // TODO: Implement focus mode styling
  };

  const resetPosition = () => {
    setPosition({ x: 0, y: 20 });
  };

  const toggleLock = () => {
    setIsLocked(!isLocked);
    onLockToggle?.();
  };

  // Load saved position and lock state from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('floatingToolbarPosition');
    const savedLockState = localStorage.getItem('floatingToolbarLocked');
    
    if (savedPosition) {
      const parsed = JSON.parse(savedPosition);
      setPosition(parsed);
    }
    
    if (savedLockState) {
      setIsLocked(JSON.parse(savedLockState));
    }
  }, []);

  // Save position and lock state to localStorage when they change
  useEffect(() => {
    localStorage.setItem('floatingToolbarPosition', JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    localStorage.setItem('floatingToolbarLocked', JSON.stringify(isLocked));
  }, [isLocked]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!toolbarRef.current || isLocked) return;
    
    const rect = toolbarRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep toolbar within viewport bounds
    const maxX = window.innerWidth - 400; // Approximate toolbar width
    const maxY = window.innerHeight - 60;  // Approximate toolbar height
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <div className={`fixed z-30 transform transition-all duration-300 ${
      isCollapsed ? 'translate-x-full' : 'translate-x-0'
    }`}
    style={{
      left: isCollapsed ? 'auto' : `${position.x}px`,
      top: isCollapsed ? '20px' : `${position.y}px`,
      right: isCollapsed ? '0px' : 'auto',
    }}>
      {/* Collapse Toggle Button */}
      {isCollapsed && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onToggleCollapse}
          className="absolute left-0 top-0 transform -translate-x-full rounded-r-none bg-white shadow-lg border border-subtle p-2 h-10 w-8"
          title="Show Formatting Tools"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      
      <div 
        ref={toolbarRef}
        className={`flex items-center space-x-1 bg-white shadow-lg rounded-lg p-2 border border-subtle floating-toolbar ${
          isCollapsed ? 'mr-4' : ''
        } ${isDragging ? 'cursor-grabbing' : 'cursor-auto'}`}
      >
        {/* Drag Handle / Lock Button */}
        <div
          onMouseDown={handleMouseDown}
          className={`p-1 rounded transition-colors ${
            isLocked 
              ? 'cursor-not-allowed bg-red-50 hover:bg-red-100' 
              : 'cursor-grab hover:cursor-grabbing hover:bg-gray-100'
          }`}
          title={isLocked ? "Toolbar is locked" : "Drag to move toolbar"}
        >
          <GripVertical className={`h-4 w-4 ${isLocked ? 'text-red-400' : 'text-gray-400'}`} />
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLock}
          className="p-2 h-auto"
          title={isLocked ? "Unlock toolbar" : "Lock toolbar position"}
        >
          {isLocked ? <Lock className="h-4 w-4 text-red-500" /> : <Unlock className="h-4 w-4" />}
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        {/* Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="p-2 h-auto"
          title="Hide Formatting Tools"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        <Button
          variant="ghost"
          size="sm"
          className="p-2 h-auto"
          onClick={() => formatText('bold')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="p-2 h-auto"
          onClick={() => formatText('italic')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="p-2 h-auto"
          onClick={() => formatText('underline')}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        <Button
          variant="ghost"
          size="sm"
          className="p-2 h-auto"
          onClick={() => formatText('justifyLeft')}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="p-2 h-auto"
          onClick={() => formatText('justifyCenter')}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="p-2 h-auto"
          onClick={() => formatText('justifyRight')}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        <Button
          variant="ghost"
          size="sm"
          className="p-2 h-auto"
          onClick={toggleFocusMode}
          title="Focus Mode"
        >
          <Eye className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="p-2 h-auto"
          onClick={resetPosition}
          title="Reset Position"
        >
          <Calculator className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
