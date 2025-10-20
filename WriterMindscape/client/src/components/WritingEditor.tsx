import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import DocumentSidebar from "./DocumentSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lightbulb, X, BookOpen, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Document } from "@shared/schema";
import type { WritingSettings } from "./SettingsPanel";

interface WritingEditorProps {
  document?: Document;
  onWordSelect: (word: string) => void;
  isFileMenuCollapsed: boolean;
  isFormattingMenuCollapsed: boolean;
  settings: WritingSettings;
  onToggleFormattingMenu: () => void;
  onLockToolbar?: () => void;
}

interface AiSuggestion {
  suggestion: string;
  type: 'continuation' | 'outline_snippet' | 'creative_prompt';
  confidence: number;
}

export default function WritingEditor({ document, onWordSelect, isFileMenuCollapsed, isFormattingMenuCollapsed, settings, onToggleFormattingMenu, onLockToolbar }: WritingEditorProps) {
  const [title, setTitle] = useState(document?.title || "");
  const [content, setContent] = useState(document?.content || "");
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedText, setSelectedText] = useState("");
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, word: string} | null>(null);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [focusMode, setFocusMode] = useState(false);

  // Text formatting functions
  const formatText = useCallback((command: string) => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    if (selectedText) {
      let formattedText = selectedText;
      
      switch (command) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `*${selectedText}*`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        default:
          return;
      }
      
      const newContent = content.substring(0, start) + formattedText + content.substring(end);
      setContent(newContent);
      handleContentChange(newContent);
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
      }, 0);
    }
  }, [content]);

  const toggleFocusMode = useCallback(() => {
    setFocusMode(prev => !prev);
  }, []);

  // Update local state when document changes
  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContent(document.content);
    }
  }, [document]);

  // Auto-save mutation
  const saveDocument = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      if (document?.id) {
        return apiRequest("PATCH", `/api/documents/${document.id}`, data);
      } else {
        return apiRequest("POST", "/api/documents", {
          ...data,
          outline: "",
          tags: [],
          folderId: null,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save document. Please try again.",
        variant: "destructive",
      });
    },
  });

  // AI assistance mutation
  const getAiAssistance = useMutation({
    mutationFn: async (data: {
      content: string;
      outline?: string;
      pausePosition: number;
    }) => {
      const response = await apiRequest("POST", "/api/ai/writing-assistance", data);
      return response.json();
    },
    onSuccess: (data: AiSuggestion) => {
      setAiSuggestion(data);
      setShowSuggestion(true);
    },
    onError: () => {
      toast({
        title: "AI Assistance Unavailable",
        description: "Could not generate writing suggestions at this time.",
        variant: "destructive",
      });
    },
  });

  // Handle content changes and typing detection
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setShowSuggestion(false);

    // Clear existing timer
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    // Auto-save after 2 seconds of inactivity
    const saveTimer = setTimeout(() => {
      if (newContent !== document?.content || title !== document?.title) {
        saveDocument.mutate({ title, content: newContent });
      }
    }, settings.autoSaveDelay * 1000);

    // AI assistance after configurable delay
    if (settings.aiAssistanceEnabled) {
      typingTimerRef.current = setTimeout(() => {
        if (newContent.length > 50) { // Only suggest if there's substantial content
          const textarea = editorRef.current;
          const position = textarea ? textarea.selectionStart : newContent.length;

          getAiAssistance.mutate({
            content: newContent,
            outline: document?.outline ?? undefined,
            pausePosition: position,
          });
        }
      }, settings.aiAssistanceDelay * 1000);
    }

    return () => {
      clearTimeout(saveTimer);
    };
  }, [document, title, saveDocument, getAiAssistance]);

  // Handle text selection for highlighting
  const handleTextSelection = () => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start !== end) {
      const selected = content.substring(start, end).trim();
      setSelectedText(selected);
    } else {
      setSelectedText("");
      setContextMenu(null);
    }
  };

  // Handle right-click context menu for dictionary
  const handleContextMenu = (event: React.MouseEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    const textarea = event.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    let wordToLookup = "";
    
    if (start !== end) {
      // Use selected text
      wordToLookup = content.substring(start, end).trim().replace(/[^\w\s]/g, '');
    } else {
      // Find word at cursor position
      const words = content.split(/\s+/);
      let currentPos = 0;
      for (const word of words) {
        const wordEnd = currentPos + word.length;
        if (start >= currentPos && start <= wordEnd) {
          wordToLookup = word.replace(/[^\w]/g, '');
          break;
        }
        currentPos = wordEnd + 1;
      }
    }
    
    if (wordToLookup) {
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        word: wordToLookup
      });
    }
  };

  // Handle double-click for word selection
  const handleDoubleClick = (event: React.MouseEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selectedText = content.substring(start, end);
      const word = selectedText.trim().replace(/[^\w]/g, '');
      if (word) {
        onWordSelect(word);
      }
    } else {
      // If no selection, select word at cursor position
      const words = content.split(/\s+/);
      let currentPos = 0;
      for (const word of words) {
        const wordEnd = currentPos + word.length;
        if (start >= currentPos && start <= wordEnd) {
          const cleanWord = word.replace(/[^\w]/g, '');
          if (cleanWord) {
            onWordSelect(cleanWord);
          }
          break;
        }
        currentPos = wordEnd + 1; // +1 for space
      }
    }
  };

  // Close context menu when clicking elsewhere
  const handleClick = () => {
    setContextMenu(null);
  };

  // Calculate reading time and word count
  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed

  // Focus Mode - Show only content and Erudire exit button
  if (focusMode) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
        {/* Erudire Exit Button */}
        <div className="absolute top-6 left-6 z-60">
          <Button
            variant="ghost"
            onClick={toggleFocusMode}
            className="text-xl font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-transparent p-2"
          >
            Erudire
          </Button>
        </div>

        {/* Centered Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-4xl">
            <textarea
              ref={editorRef}
              className="w-full min-h-[70vh] text-gray-800 dark:text-gray-200 outline-none resize-none border-none bg-transparent text-xl leading-relaxed"
              style={{ 
                fontFamily: settings.fontFamily,
                fontSize: `${Math.max(settings.fontSize, 18)}px`,
                lineHeight: `${Math.max(settings.lineHeight, 1.8)}rem`,
              }}
              value={content}
              onChange={(e) => {
                handleContentChange(e.target.value);
              }}
              onSelect={handleTextSelection}
              onDoubleClick={handleDoubleClick}
              onContextMenu={handleContextMenu}
              onClick={handleClick}
              placeholder="Start writing your story..."
              spellCheck={settings.spellCheckEnabled}
              autoFocus
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex">
      {/* File Menu - Collapsible Document Sidebar */}
      <div className={`transition-all duration-300 ease-in-out ${
        isFileMenuCollapsed ? 'w-0 overflow-hidden' : 'w-64'
      }`}>
        <DocumentSidebar 
          document={document}
          wordCount={wordCount}
          characterCount={content.length}
          readingTime={readingTime}
          onFormat={formatText}
          onToggleFocus={toggleFocusMode}
        />
      </div>

      <div className="flex-1 flex flex-col relative">

        <div className={`flex-1 p-8 overflow-y-auto transition-all duration-300 ${
          isFileMenuCollapsed && isFormattingMenuCollapsed ? 'px-16' : ''
        }`}>
          <div className="max-w-4xl mx-auto">
            {/* Clean Writing Mode Indicator */}
            {isFileMenuCollapsed && isFormattingMenuCollapsed && (
              <div className="fixed top-4 left-4 bg-accent/10 border border-accent/20 rounded-lg px-3 py-1 text-xs text-accent font-medium z-30">
                Clean Writing Mode
              </div>
            )}
            {/* Document Title */}
            <Input
              type="text"
              placeholder="Untitled Document"
              className="w-full text-3xl font-bold border-none shadow-none bg-transparent mb-8 placeholder:text-gray-400 px-0 focus-visible:ring-0"
              style={{ fontFamily: 'Georgia, serif' }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                if (title !== document?.title) {
                  saveDocument.mutate({ title, content });
                }
              }}
            />

            {/* Editor Content */}
            <div className="relative">
              {/* AI Assistance Snippet - Responsive design */}
            {showSuggestion && aiSuggestion && !(isFileMenuCollapsed && isFormattingMenuCollapsed) && (
              <div className="fixed top-1/2 left-4 transform -translate-y-1/2 bg-white/95 backdrop-blur-sm border border-accent/30 rounded-lg p-4 shadow-lg max-w-xs z-40 ai-suggestion-float">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-accent font-medium mb-2">
                      Writing Suggestion
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      {aiSuggestion.suggestion}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto"
                    onClick={() => setShowSuggestion(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Compact AI Suggestion - Mobile/small screens */}
            {showSuggestion && aiSuggestion && !(isFileMenuCollapsed && isFormattingMenuCollapsed) && (
              <div className="md:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  className="fixed bottom-20 right-4 bg-white/95 backdrop-blur-sm border-accent/30 shadow-lg z-40 p-2"
                  onClick={() => {
                    // Toggle expanded view on mobile
                    const expandedView = window.document.getElementById('mobile-suggestion-expanded');
                    if (expandedView) {
                      expandedView.classList.toggle('hidden');
                    }
                  }}
                >
                  <Lightbulb className="h-4 w-4 text-accent" />
                </Button>

                <div 
                  id="mobile-suggestion-expanded"
                  className="hidden fixed inset-x-4 bottom-32 bg-white/95 backdrop-blur-sm border border-accent/30 rounded-lg p-4 shadow-lg z-40"
                >
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs text-accent font-medium mb-2">
                        Writing Suggestion
                      </div>
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {aiSuggestion.suggestion}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-auto"
                      onClick={() => setShowSuggestion(false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

              <textarea
                ref={editorRef}
                className={`writing-content outline-none min-h-96 text-text-main transition-all duration-300 w-full resize-none border-none bg-transparent ${
                  isFileMenuCollapsed && isFormattingMenuCollapsed ? 'text-xl leading-loose' : ''
                }`}
                style={{ 
                  fontFamily: settings.fontFamily,
                  fontSize: `${settings.fontSize}px`,
                  lineHeight: `${settings.lineHeight}rem`,
                }}
                value={content}
                onChange={(e) => {
                  handleContentChange(e.target.value);
                }}
                onSelect={handleTextSelection}
                onDoubleClick={handleDoubleClick}
                onContextMenu={handleContextMenu}
                onClick={handleClick}
                placeholder="Start writing your story..."
                spellCheck={settings.spellCheckEnabled}
              />

              {/* Floating Dictionary Access Button */}
              {selectedText && !contextMenu && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="fixed bottom-4 right-4 bg-white shadow-lg border border-accent/30 z-40"
                  onClick={() => {
                    onWordSelect(selectedText);
                    setSelectedText("");
                  }}
                  title="Look up selected text in dictionary"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Define "{selectedText.length > 15 ? selectedText.substring(0, 15) + '...' : selectedText}"
                </Button>
              )}

              {/* Context Menu for Dictionary Lookup */}
              {contextMenu && (
                <div
                  className="fixed bg-white shadow-lg border border-subtle rounded-lg py-2 z-40"
                  style={{
                    left: `${contextMenu.x}px`,
                    top: `${contextMenu.y}px`,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center"
                    onClick={() => {
                      onWordSelect(contextMenu.word);
                      setContextMenu(null);
                    }}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Look up "{contextMenu.word}"
                  </button>
                  
                  {selectedText && selectedText.split(' ').length > 1 && (
                    <button
                      className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center border-t border-subtle"
                      onClick={() => {
                        onWordSelect(selectedText);
                        setContextMenu(null);
                      }}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Look up "{selectedText.length > 20 ? selectedText.substring(0, 20) + '...' : selectedText}"
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}