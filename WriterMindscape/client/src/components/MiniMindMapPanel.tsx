import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Network, 
  User, 
  MapPin, 
  Clock, 
  BookOpen, 
  Lightbulb,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import type { Document } from "@shared/schema";

interface MiniMindMapPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  document?: Document;
  side: "left" | "right";
  onOpenMindMap?: () => void;
}

interface StoryElement {
  id: string;
  type: "character" | "location" | "plot" | "theme" | "conflict";
  title: string;
  description: string;
  connections: string[];
  color: string;
}

export default function MiniMindMapPanel({ isOpen, onToggle, document, side, onOpenMindMap }: MiniMindMapPanelProps) {
  // Extract story elements from document content (simplified analysis)
  const getStoryElements = (): StoryElement[] => {
    if (!document?.content) return [];
    
    const content = document.content.toLowerCase();
    const elements: StoryElement[] = [];
    
    // Detect characters (simple heuristic - proper nouns that appear multiple times)
    const words = document.content.split(/\s+/);
    const properNouns = words.filter(word => /^[A-Z][a-z]+$/.test(word));
    const characterCounts = properNouns.reduce((acc, name) => {
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(characterCounts)
      .filter(([_, count]) => count > 1)
      .slice(0, 3)
      .forEach(([name, count], index) => {
        elements.push({
          id: `char-${index}`,
          type: "character",
          title: name,
          description: `Mentioned ${count} times`,
          connections: [],
          color: "#6366f1"
        });
      });
    
    // Detect common plot elements
    const plotKeywords = {
      "journey": "Quest/Journey",
      "discovery": "Discovery",
      "secret": "Mystery/Secret",
      "conflict": "Conflict",
      "mystery": "Mystery",
      "love": "Romance",
      "betrayal": "Betrayal",
      "revenge": "Revenge"
    };
    
    Object.entries(plotKeywords).forEach(([keyword, plotType], index) => {
      if (content.includes(keyword)) {
        elements.push({
          id: `plot-${index}`,
          type: "plot",
          title: plotType,
          description: `Key story element`,
          connections: [],
          color: "#f59e0b"
        });
      }
    });
    
    // Detect locations (words after "in", "at", "to")
    const locationRegex = /(?:in|at|to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g;
    const locations = new Set<string>();
    let match;
    while ((match = locationRegex.exec(document.content)) !== null && locations.size < 3) {
      locations.add(match[1]);
    }
    
    Array.from(locations).forEach((location, index) => {
      elements.push({
        id: `loc-${index}`,
        type: "location",
        title: location,
        description: "Story location",
        connections: [],
        color: "#10b981"
      });
    });
    
    return elements.slice(0, 8); // Limit to 8 elements for mini view
  };

  const storyElements = getStoryElements();

  const getIconForType = (type: StoryElement["type"]) => {
    switch (type) {
      case "character": return User;
      case "location": return MapPin;
      case "plot": return BookOpen;
      case "theme": return Lightbulb;
      case "conflict": return Network;
      default: return BookOpen;
    }
  };

  const getColorForType = (type: StoryElement["type"]) => {
    switch (type) {
      case "character": return "bg-blue-100 text-blue-700 border-blue-200";
      case "location": return "bg-green-100 text-green-700 border-green-200";
      case "plot": return "bg-amber-100 text-amber-700 border-amber-200";
      case "theme": return "bg-purple-100 text-purple-700 border-purple-200";
      case "conflict": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`panel-toggle ${side} ${isOpen ? 'collapsed' : ''}`}
        title={`${isOpen ? 'Hide' : 'Show'} Story Map`}
      >
        {isOpen ? 
          (side === "left" ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />) : 
          <Network className="h-5 w-5" />
        }
      </button>

      {/* Slide-out Panel */}
      <div className={`
        fixed top-0 ${side === 'left' ? 'left-0' : 'right-0'} h-full w-80
        transform transition-transform duration-300 ease-in-out z-30
        ${isOpen ? 'translate-x-0' : (side === 'left' ? '-translate-x-full' : 'translate-x-full')}
      `}>
        <div 
          className="h-full overflow-y-auto p-4"
          style={{ 
            background: 'var(--bg-panel)', 
            borderRight: side === 'left' ? '1px solid var(--border-color)' : 'none',
            borderLeft: side === 'right' ? '1px solid var(--border-color)' : 'none'
          }}
        >
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Story Map
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Key elements from your story
            </p>
          </div>

          <Separator className="my-4" />

          {storyElements.length > 0 ? (
            <div className="space-y-4">
              {/* Characters */}
              {storyElements.filter(el => el.type === "character").length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center" style={{ color: 'var(--text-secondary)' }}>
                    <User className="h-4 w-4 mr-2" />
                    Characters
                  </h4>
                  <div className="space-y-2">
                    {storyElements.filter(el => el.type === "character").map((element) => {
                      const Icon = getIconForType(element.type);
                      return (
                        <div 
                          key={element.id}
                          className={`p-2 rounded-lg border ${getColorForType(element.type)}`}
                        >
                          <div className="flex items-center space-x-2">
                            <Icon className="h-4 w-4" />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{element.title}</div>
                              <div className="text-xs opacity-75">{element.description}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Locations */}
              {storyElements.filter(el => el.type === "location").length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center" style={{ color: 'var(--text-secondary)' }}>
                    <MapPin className="h-4 w-4 mr-2" />
                    Locations
                  </h4>
                  <div className="space-y-2">
                    {storyElements.filter(el => el.type === "location").map((element) => {
                      const Icon = getIconForType(element.type);
                      return (
                        <div 
                          key={element.id}
                          className={`p-2 rounded-lg border ${getColorForType(element.type)}`}
                        >
                          <div className="flex items-center space-x-2">
                            <Icon className="h-4 w-4" />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{element.title}</div>
                              <div className="text-xs opacity-75">{element.description}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Plot Elements */}
              {storyElements.filter(el => el.type === "plot").length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center" style={{ color: 'var(--text-secondary)' }}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Plot Elements
                  </h4>
                  <div className="space-y-2">
                    {storyElements.filter(el => el.type === "plot").map((element) => {
                      const Icon = getIconForType(element.type);
                      return (
                        <div 
                          key={element.id}
                          className={`p-2 rounded-lg border ${getColorForType(element.type)}`}
                        >
                          <div className="flex items-center space-x-2">
                            <Icon className="h-4 w-4" />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{element.title}</div>
                              <div className="text-xs opacity-75">{element.description}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <Separator className="my-4" />

              <div className="text-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    onOpenMindMap?.();
                    onToggle(); // Close the panel after opening mind map
                  }}
                >
                  <Network className="h-3 w-3 mr-2" />
                  Open Full Mind Map
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Network className="h-12 w-12 mx-auto mb-4 opacity-30" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Start writing to see story elements appear here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-25"
          onClick={onToggle}
        />
      )}
    </>
  );
}