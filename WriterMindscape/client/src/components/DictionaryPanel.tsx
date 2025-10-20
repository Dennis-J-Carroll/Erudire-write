import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DictionaryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWord: string;
}

interface WordDefinition {
  word: string;
  pronunciation: string;
  definition: string;
  synonyms: string[];
  example: string;
}

export default function DictionaryPanel({ isOpen, onClose, selectedWord }: DictionaryPanelProps) {
  const [searchWord, setSearchWord] = useState("");
  const [definition, setDefinition] = useState<WordDefinition | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('dictionarySearchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const lastSelectedWord = useRef<string>("");
  const { toast } = useToast();

  const lookupWord = useMutation({
    mutationFn: async (word: string) => {
      const response = await apiRequest("POST", "/api/dictionary/lookup", { word });
      return response.json();
    },
    onSuccess: (data: WordDefinition) => {
      setDefinition(data);
      // Add to search history
      setSearchHistory(prev => {
        const newHistory = [data.word, ...prev.filter(w => w !== data.word)].slice(0, 10);
        localStorage.setItem('dictionarySearchHistory', JSON.stringify(newHistory));
        return newHistory;
      });
    },
    onError: () => {
      toast({
        title: "Dictionary Lookup Failed",
        description: "Could not find definition for this word.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (selectedWord && isOpen && selectedWord !== lastSelectedWord.current) {
      lastSelectedWord.current = selectedWord;
      setSearchWord(selectedWord);
      lookupWord.mutate(selectedWord);
    }
  }, [selectedWord, isOpen]);

  const handleSearch = () => {
    if (searchWord.trim()) {
      lookupWord.mutate(searchWord.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div 
      className={`fixed right-0 top-0 h-full w-80 bg-white shadow-xl border-l border-subtle transform transition-transform duration-300 z-20 dictionary-panel ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-4 border-b border-subtle">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-primary flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Dictionary & Thesaurus
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-4 flex space-x-2">
          <Input
            type="text"
            placeholder="Search word..."
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={lookupWord.isPending}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        {lookupWord.isPending && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-secondary">Looking up definition...</p>
          </div>
        )}
        
        {definition && !lookupWord.isPending && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-primary mb-2 text-lg">{definition.word}</h4>
              {definition.pronunciation && (
                <div className="text-sm text-secondary mb-2">{definition.pronunciation}</div>
              )}
              <div className="text-sm mb-3 leading-relaxed">{definition.definition}</div>
              
              {definition.synonyms && definition.synonyms.length > 0 && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-primary mb-1">Synonyms:</div>
                  <div className="flex flex-wrap gap-1">
                    {definition.synonyms.map((synonym, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="px-2 py-1 h-auto text-xs hover:bg-accent hover:text-white"
                        onClick={() => {
                          setSearchWord(synonym);
                          lookupWord.mutate(synonym);
                        }}
                      >
                        {synonym}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {definition.example && (
                <div>
                  <div className="text-sm font-medium text-primary mb-1">Example:</div>
                  <div className="text-sm italic text-secondary bg-muted p-2 rounded">
                    "{definition.example}"
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!definition && !lookupWord.isPending && (
          <div className="space-y-6">
            <div className="text-center py-8 text-secondary">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Double-click on any word in your document to look it up, or search above.</p>
              <p className="text-xs mt-2">Right-click on words for quick dictionary access.</p>
            </div>
            
            {searchHistory.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-primary mb-2">Recent Searches</h4>
                <div className="flex flex-wrap gap-1">
                  {searchHistory.slice(0, 6).map((historyWord, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="px-2 py-1 h-auto text-xs hover:bg-accent hover:text-white"
                      onClick={() => {
                        setSearchWord(historyWord);
                        lookupWord.mutate(historyWord);
                      }}
                    >
                      {historyWord}
                    </Button>
                  ))}
                </div>
                {searchHistory.length > 6 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-xs"
                    onClick={() => {
                      localStorage.removeItem('dictionarySearchHistory');
                      setSearchHistory([]);
                    }}
                  >
                    Clear history
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
