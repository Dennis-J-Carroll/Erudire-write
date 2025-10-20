import { useState, useEffect } from "react";
import { FileText, Clock, Save } from "lucide-react";

interface StatusBarProps {
  wordCount: number;
  characterCount: number;
  readingTime: number;
  lastSaved?: Date;
  flowStatus?: string;
}

export default function StatusBar({ 
  wordCount, 
  characterCount, 
  readingTime, 
  lastSaved,
  flowStatus = "Ready to write" 
}: StatusBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatLastSaved = (date?: Date) => {
    if (!date) return "Never";
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 30) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="status-bar">
      <div className="status-item">
        <FileText className="h-4 w-4" />
        <span>{wordCount} words • {characterCount} characters</span>
      </div>
      
      <div className="status-item">
        <Clock className="h-4 w-4" />
        <span>{readingTime} min read</span>
      </div>
      
      <div className="status-item">
        <span>{flowStatus}</span>
      </div>
      
      <div className="status-item">
        <Save className="h-4 w-4" />
        <span>Saved {formatLastSaved(lastSaved)}</span>
      </div>
      
      <div className="status-item">
        <span>{currentTime.toLocaleTimeString()}</span>
      </div>
    </div>
  );
}