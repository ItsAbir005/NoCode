import { Play, Upload, Bot, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface TopBarProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onPreview: () => void;
  onPublish: () => void;
  onToggleAI: () => void;
  isAIOpen: boolean;
}

export function TopBar({
  projectName,
  onProjectNameChange,
  onPreview,
  onPublish,
  onToggleAI,
  isAIOpen,
}: TopBarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(projectName);

  const handleSave = () => {
    onProjectNameChange(tempName);
    setIsEditing(false);
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">NC</span>
        </div>
        
        {isEditing ? (
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="bg-muted px-2 py-1 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 hover:bg-muted px-2 py-1 rounded transition-colors"
          >
            <span className="font-medium text-foreground">{projectName}</span>
            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPreview}>
          <Play className="w-4 h-4 mr-1.5" />
          Preview
        </Button>
        <Button size="sm" onClick={onPublish}>
          <Upload className="w-4 h-4 mr-1.5" />
          Publish
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          variant={isAIOpen ? "secondary" : "ghost"}
          size="sm"
          onClick={onToggleAI}
        >
          <Bot className="w-4 h-4 mr-1.5" />
          AI Assistant
        </Button>
      </div>
    </header>
  );
}
