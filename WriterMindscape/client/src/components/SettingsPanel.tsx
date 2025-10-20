import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { X, Settings, Brain, Type, Save } from "lucide-react";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: WritingSettings;
  onSettingsChange: (settings: WritingSettings) => void;
}

export interface WritingSettings {
  aiAssistanceDelay: number; // seconds
  aiAssistanceEnabled: boolean;
  autoSaveDelay: number; // seconds
  fontSize: number; // px
  lineHeight: number; // rem
  fontFamily: string;
  theme: 'light' | 'dark';
  spellCheckEnabled: boolean;
  wordCountUpdateFrequency: number; // ms
}

export const defaultSettings: WritingSettings = {
  aiAssistanceDelay: 30,
  aiAssistanceEnabled: true,
  autoSaveDelay: 2,
  fontSize: 18,
  lineHeight: 2,
  fontFamily: 'Georgia',
  theme: 'light',
  spellCheckEnabled: true,
  wordCountUpdateFrequency: 500,
};

export default function SettingsPanel({ isOpen, onClose, settings, onSettingsChange }: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<WritingSettings>(settings);

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(defaultSettings);
  };

  const updateSetting = <K extends keyof WritingSettings>(key: K, value: WritingSettings[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Settings Panel sliding from bottom */}
      <div
        className={`fixed left-0 right-0 bottom-0 shadow-xl border-t transform transition-transform duration-300 z-50 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ 
          height: '70vh',
          background: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          maxHeight: '600px'
        }}
      >
        <div className="p-4 border-b border-subtle">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              <Settings className="h-5 w-5 mr-2" />
              Writing Settings
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      
      <div className="p-4 space-y-6 overflow-y-auto h-full pb-20">
        {/* AI Assistance Settings */}
        <div>
          <h4 className="text-sm font-semibold text-primary mb-3 flex items-center">
            <Brain className="h-4 w-4 mr-2" />
            AI Writing Assistance
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="ai-enabled" className="text-sm">Enable AI Assistance</Label>
              <Switch
                id="ai-enabled"
                checked={localSettings.aiAssistanceEnabled}
                onCheckedChange={(checked) => updateSetting('aiAssistanceEnabled', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">AI Suggestion Delay: {localSettings.aiAssistanceDelay}s</Label>
              <Slider
                value={[localSettings.aiAssistanceDelay]}
                onValueChange={([value]) => updateSetting('aiAssistanceDelay', value)}
                min={5}
                max={120}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-secondary">
                <span>5s (Fast)</span>
                <span>120s (Slow)</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Typography Settings */}
        <div>
          <h4 className="text-sm font-semibold text-primary mb-3 flex items-center">
            <Type className="h-4 w-4 mr-2" />
            Typography
          </h4>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Font Family</Label>
              <Select value={localSettings.fontFamily} onValueChange={(value) => updateSetting('fontFamily', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Georgia">Georgia (Serif)</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman (Serif)</SelectItem>
                  <SelectItem value="Inter">Inter (Sans-serif)</SelectItem>
                  <SelectItem value="Arial">Arial (Sans-serif)</SelectItem>
                  <SelectItem value="JetBrains Mono">JetBrains Mono (Monospace)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Font Size: {localSettings.fontSize}px</Label>
              <Slider
                value={[localSettings.fontSize]}
                onValueChange={([value]) => updateSetting('fontSize', value)}
                min={14}
                max={24}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Line Height: {localSettings.lineHeight}rem</Label>
              <Slider
                value={[localSettings.lineHeight]}
                onValueChange={([value]) => updateSetting('lineHeight', value)}
                min={1.2}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Editor Settings */}
        <div>
          <h4 className="text-sm font-semibold text-primary mb-3">Editor Preferences</h4>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Auto-save Delay: {localSettings.autoSaveDelay}s</Label>
              <Slider
                value={[localSettings.autoSaveDelay]}
                onValueChange={([value]) => updateSetting('autoSaveDelay', value)}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="spell-check" className="text-sm">Spell Check</Label>
              <Switch
                id="spell-check"
                checked={localSettings.spellCheckEnabled}
                onCheckedChange={(checked) => updateSetting('spellCheckEnabled', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Theme Settings */}
        <div>
          <h4 className="text-sm font-semibold text-primary mb-3">Appearance</h4>
          
          <div className="space-y-2">
            <Label className="text-sm">Theme</Label>
            <Select value={localSettings.theme} onValueChange={(value: 'light' | 'dark') => updateSetting('theme', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-subtle">
        <div className="flex space-x-2">
          <Button onClick={handleSave} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>
      </div>
    </>
  );
}