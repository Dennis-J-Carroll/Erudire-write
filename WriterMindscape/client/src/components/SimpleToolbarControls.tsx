import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Eye,
  Type
} from "lucide-react";

interface SimpleToolbarControlsProps {
  onFormat: (command: string) => void;
  onToggleFocus: () => void;
}

export default function SimpleToolbarControls({ onFormat, onToggleFocus }: SimpleToolbarControlsProps) {
  return (
    <div className="space-y-4">
      {/* Text Formatting */}
      <div>
        <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Text Style
        </h4>
        <div className="grid grid-cols-3 gap-1">
          <Button
            variant="outline"
            size="sm"
            className="p-2 h-8"
            onClick={() => onFormat('bold')}
            title="Bold"
          >
            <Bold className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="p-2 h-8"
            onClick={() => onFormat('italic')}
            title="Italic"
          >
            <Italic className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="p-2 h-8"
            onClick={() => onFormat('underline')}
            title="Underline"
          >
            <Underline className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Text Alignment */}
      <div>
        <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Alignment
        </h4>
        <div className="grid grid-cols-3 gap-1">
          <Button
            variant="outline"
            size="sm"
            className="p-2 h-8"
            onClick={() => onFormat('justifyLeft')}
            title="Align Left"
          >
            <AlignLeft className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="p-2 h-8"
            onClick={() => onFormat('justifyCenter')}
            title="Center"
          >
            <AlignCenter className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="p-2 h-8"
            onClick={() => onFormat('justifyRight')}
            title="Align Right"
          >
            <AlignRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Writing Mode */}
      <div>
        <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Writing Mode
        </h4>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-sm h-8"
          onClick={onToggleFocus}
        >
          <Eye className="h-3 w-3 mr-2" />
          Focus Mode
        </Button>
      </div>
    </div>
  );
}