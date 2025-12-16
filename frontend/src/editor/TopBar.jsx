import { Play, Upload, Bot, Edit2 } from "lucide-react";
import { useState } from "react";

export function TopBar({
  projectName,
  onProjectNameChange,
  onPreview,
  onPublish,
  onToggleAI,
  isAIOpen,
  saveStatus,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(projectName);

  const handleSave = () => {
    onProjectNameChange(tempName);
    setIsEditing(false);
  };

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">NC</span>
        </div>
        
        {isEditing ? (
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="bg-gray-100 px-2 py-1 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
          >
            <span className="font-medium text-gray-900">{projectName}</span>
            <Edit2 className="w-3.5 h-3.5 text-gray-600" />
          </button>
        )}

        {saveStatus && (
          <>
            <div className="w-px h-6 bg-gray-300" />
            {saveStatus}
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPreview}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Preview
        </button>
        <button
          onClick={onPublish}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Publish
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          onClick={onToggleAI}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
            isAIOpen ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Bot className="w-4 h-4" />
          AI Assistant
        </button>
      </div>
    </header>
  );
}

export default TopBar;