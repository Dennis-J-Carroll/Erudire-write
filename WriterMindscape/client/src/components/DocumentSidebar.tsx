import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SpellCheck, BookOpen, List, BarChart3, Sun, Moon, Coffee, Palette, Type } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import SimpleToolbarControls from "@/components/SimpleToolbarControls";
import type { Document } from "@shared/schema";

interface DocumentSidebarProps {
  document?: Document;
  wordCount: number;
  characterCount: number;
  readingTime: number;
  onFormat?: (command: string) => void;
  onToggleFocus?: () => void;
}

export default function DocumentSidebar({ 
  document, 
  wordCount, 
  characterCount, 
  readingTime,
  onFormat,
  onToggleFocus
}: DocumentSidebarProps) {
  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });
  const { theme, setTheme } = useTheme();

  const currentDocumentIndex = documents.findIndex(doc => doc.id === document?.id);
  const otherDocuments = documents.filter(doc => doc.id !== document?.id);

  const themes = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "beige", icon: Coffee, label: "Beige" },
  ] as const;

  return (
    <div className="w-64 bg-white border-r border-subtle p-4 flex-shrink-0">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-primary mb-3 flex items-center">
          <List className="h-4 w-4 mr-2" />
          Document Outline
        </h3>
        <div className="space-y-2 text-sm">
          {document?.outline ? (
            <div className="p-2 rounded hover:bg-subtle cursor-pointer">
              <div className="font-medium">Current Section</div>
              <div className="text-secondary text-xs line-clamp-2">
                {document.outline}
              </div>
            </div>
          ) : (
            <div className="p-2 rounded text-secondary text-xs">
              No outline available. Add an outline to see structure here.
            </div>
          )}
          
          {otherDocuments.slice(0, 3).map((doc) => (
            <div key={doc.id} className="p-2 rounded hover:bg-subtle cursor-pointer">
              <div className="font-medium text-sm">{doc.title}</div>
              <div className="text-secondary text-xs">{doc.wordCount} words</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-primary mb-3 flex items-center">
          <BarChart3 className="h-4 w-4 mr-2" />
          Writing Stats
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-secondary">Words:</span>
            <span className="font-medium">{wordCount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary">Characters:</span>
            <span className="font-medium">{characterCount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary">Reading time:</span>
            <span className="font-medium">{readingTime} min</span>
          </div>
          {document?.tags && document.tags.length > 0 && (
            <div>
              <span className="text-secondary text-xs">Tags:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {document.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-accent/10 text-accent px-2 py-1 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Separator className="my-4" />

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-primary mb-3 flex items-center">
          <Palette className="h-4 w-4 mr-2" />
          Theme
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {themes.map(({ value, icon: Icon, label }) => (
            <Button
              key={value}
              variant={theme === value ? "default" : "outline"}
              size="sm"
              className="flex flex-col items-center p-2 h-auto"
              onClick={() => setTheme(value)}
              title={label}
            >
              <Icon className="h-4 w-4 mb-1" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-primary mb-3 flex items-center">
          <Type className="h-4 w-4 mr-2" />
          Formatting
        </h3>
        {onFormat && onToggleFocus ? (
          <SimpleToolbarControls 
            onFormat={onFormat}
            onToggleFocus={onToggleFocus}
          />
        ) : (
          <div className="text-xs text-muted-foreground">
            Formatting controls available when editing
          </div>
        )}
      </div>

      <Separator className="my-4" />

      <div>
        <h3 className="text-sm font-semibold text-primary mb-3">Quick Tools</h3>
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sm h-auto p-2"
            onClick={() => {
              // TODO: Implement spell check
              console.log("Spell check clicked");
            }}
          >
            <SpellCheck className="h-4 w-4 mr-2 text-secondary" />
            Spell Check
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sm h-auto p-2"
          >
            <BookOpen className="h-4 w-4 mr-2 text-secondary" />
            Dictionary
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sm h-auto p-2"
          >
            <List className="h-4 w-4 mr-2 text-secondary" />
            Thesaurus
          </Button>
        </div>
      </div>
    </div>
  );
}
