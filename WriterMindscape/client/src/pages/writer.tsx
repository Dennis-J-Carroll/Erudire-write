import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import WritingEditor from "@/components/WritingEditor";
import MindMapView from "@/components/MindMapView";
import DictionaryPanel from "@/components/DictionaryPanel";
import SettingsPanel, { WritingSettings, defaultSettings } from "@/components/SettingsPanel";

import StatusBar from "@/components/StatusBar";
import FlowSuggestion from "@/components/FlowSuggestion";
import MiniMindMapPanel from "@/components/MiniMindMapPanel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Share, 
  Save, 
  Settings, 
  RotateCcw,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Menu,
  Type,
  Network
} from "lucide-react";
import type { Document } from "@shared/schema";
import { getWordCount, getCharacterCount, calculateReadingTime } from "@/lib/utils";

export default function WriterPage() {
  const [match, params] = useRoute("/document/:id");
  const documentId = params?.id ? parseInt(params.id) : null;
  
  const [currentView, setCurrentView] = useState<"editor" | "mindmap">("editor");
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");
  const [isFileMenuCollapsed, setIsFileMenuCollapsed] = useState(false);
  const [isFormattingMenuCollapsed, setIsFormattingMenuCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toolbarLocked, setToolbarLocked] = useState(false);
  const [settings, setSettings] = useState<WritingSettings>(() => {
    const saved = localStorage.getItem('writingSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  
  // FlowWriter-inspired state
  const [flowSuggestionVisible, setFlowSuggestionVisible] = useState(false);
  const [currentFlowSuggestion, setCurrentFlowSuggestion] = useState("");
  const [flowStatus, setFlowStatus] = useState("Ready to write");
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const [storyMapOpen, setStoryMapOpen] = useState(false);

  // Flow suggestions from FlowWriter
  const flowSuggestions = [
    "Consider exploring how the character's emotions manifest physically in this moment...",
    "What scent fills the air? Old paper, dust, or something more mysterious?",
    "This might be the perfect moment to reveal a hidden character trait...",
    "Show the character's emotion through their actions rather than words...",
    "Perhaps add some internal dialogue to reveal their thoughts?",
    "What shadows are playing across the scene? How does light affect the mood?",
    "What's the worst thing that could happen right now?",
    "Consider a flashback or memory triggered by this discovery...",
    "What detail could you add that will be important later?",
    "How does this moment change everything for your character?",
    "What is your character really afraid of in this moment?",
    "Add a sensory detail that makes this scene unforgettable..."
  ];
  
  const { data: document, isLoading } = useQuery<Document>({
    queryKey: documentId ? ["/api/documents", documentId] : ["/api/documents/1"],
    enabled: true,
  });

  // Calculate document statistics
  const content = document?.content || "";
  const wordCount = getWordCount(content);
  const characterCount = getCharacterCount(content);
  const readingTime = calculateReadingTime(wordCount);

  const handleWordSelect = (word: string) => {
    setSelectedWord(word);
    setIsDictionaryOpen(true);
  };

  const handleSettingsChange = (newSettings: WritingSettings) => {
    setSettings(newSettings);
    localStorage.setItem('writingSettings', JSON.stringify(newSettings));
  };

  const handleToolbarLockToggle = () => {
    setToolbarLocked(!toolbarLocked);
  };

  const handleFormattingToggleDoubleClick = () => {
    handleToolbarLockToggle();
  };

  // FlowWriter-inspired functionality
  const resetInactivityTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    
    setFlowStatus("Writing in flow");
    setFlowSuggestionVisible(false);
    
    const timer = setTimeout(() => {
      showFlowSuggestion();
      setFlowStatus("Pondering...");
    }, 35000); // Show suggestion after 35 seconds of inactivity
    
    setInactivityTimer(timer);
  };

  const showFlowSuggestion = () => {
    const randomSuggestion = flowSuggestions[Math.floor(Math.random() * flowSuggestions.length)];
    setCurrentFlowSuggestion(randomSuggestion);
    setFlowSuggestionVisible(true);
  };

  const dismissFlowSuggestion = () => {
    setFlowSuggestionVisible(false);
    resetInactivityTimer();
  };

  const handleContentChange = () => {
    setLastSaved(new Date());
    resetInactivityTimer();
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, [inactivityTimer]);

  // Initialize timer
  useEffect(() => {
    resetInactivityTimer();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-secondary">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Story Map Panel */}
      <MiniMindMapPanel 
        isOpen={storyMapOpen}
        onToggle={() => setStoryMapOpen(!storyMapOpen)}
        document={document}
        side="right"
        onOpenMindMap={() => setCurrentView("mindmap")}
      />

      {/* Left Panel Toggle Button */}
      <button
        onClick={() => setIsFileMenuCollapsed(!isFileMenuCollapsed)}
        className={`panel-toggle left ${isFileMenuCollapsed ? 'collapsed' : ''}`}
        title={`${isFileMenuCollapsed ? 'Show' : 'Hide'} Document Outline`}
      >
        {isFileMenuCollapsed ? <ChevronRight className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
      </button>

      {/* Top Navigation */}
      <nav style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }} className="shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Erudire</h1>
            <div className="hidden md:flex items-center space-x-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <Button variant="ghost" size="sm" className="px-3 py-1">
                <FileText className="h-4 w-4 mr-2" />
                {document?.title || "Untitled Document"}
              </Button>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <span>
                Last saved {document?.updatedAt ? new Date(document.updatedAt).toLocaleTimeString() : "Never"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Toggle */}
            <div className="flex rounded-lg p-1" style={{ background: 'var(--bg-secondary)' }}>
              <Button
                variant={currentView === "editor" ? "default" : "ghost"}
                size="sm"
                className="px-3 py-1 text-sm"
                onClick={() => setCurrentView("editor")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Write
              </Button>
              <Button
                variant={currentView === "mindmap" ? "default" : "ghost"}
                size="sm"
                className="px-3 py-1 text-sm"
                onClick={() => setCurrentView("mindmap")}
              >
                <Share className="h-4 w-4 mr-2" />
                Mind Map
              </Button>
            </div>
            
            {/* Panel Controls */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                title="Toggle Document Outline"
                onClick={() => setIsFileMenuCollapsed(!isFileMenuCollapsed)}
                className={isFileMenuCollapsed ? "opacity-50" : ""}
              >
                <FileText className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                title="Toggle Story Map"
                onClick={() => setStoryMapOpen(!storyMapOpen)}
                className={storyMapOpen ? "bg-accent/20" : ""}
              >
                <Network className="h-4 w-4" />
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            {/* User Actions */}
            <Button variant="ghost" size="sm" title="Settings" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              style={{ background: 'var(--accent-primary)', color: 'white' }}
              className="hover:opacity-90"
              onClick={handleContentChange}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden" style={{ paddingBottom: '60px' }}>
        {currentView === "editor" ? (
          <div className="relative flex-1">
            <WritingEditor 
              document={document}
              onWordSelect={handleWordSelect}
              isFileMenuCollapsed={isFileMenuCollapsed}
              isFormattingMenuCollapsed={isFormattingMenuCollapsed}
              settings={settings}
              onToggleFormattingMenu={() => setIsFormattingMenuCollapsed(!isFormattingMenuCollapsed)}
              onLockToolbar={handleToolbarLockToggle}
            />
            
            {/* Flow Suggestion */}
            <FlowSuggestion
              isVisible={flowSuggestionVisible}
              onDismiss={dismissFlowSuggestion}
              suggestion={currentFlowSuggestion}
              position={{ top: 200, left: 100 }}
            />
          </div>
        ) : (
          <MindMapView />
        )}
      </div>

      {/* Dictionary Panel */}
      <DictionaryPanel
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
        selectedWord={selectedWord}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />

      {/* Status Bar */}
      <StatusBar
        wordCount={wordCount}
        characterCount={characterCount}
        readingTime={readingTime}
        lastSaved={lastSaved}
        flowStatus={flowStatus}
      />
    </div>
  );
}
