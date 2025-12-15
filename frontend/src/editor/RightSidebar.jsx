import { Sparkles, Settings2 } from "lucide-react";
import { useState } from "react";

export function RightSidebar({ selectedComponent }) {
  const [activeTab, setActiveTab] = useState("properties");

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab("properties")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "properties"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Settings2 className="w-4 h-4" />
            Properties
          </button>
          <button
            onClick={() => setActiveTab("suggestions")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "suggestions"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Tips
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === "properties" ? (
          selectedComponent ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <input
                  type="text"
                  value={selectedComponent.type}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position X</label>
                <input
                  type="number"
                  value={Math.round(selectedComponent.x)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position Y</label>
                <input
                  type="number"
                  value={Math.round(selectedComponent.y)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                <input
                  type="number"
                  value={selectedComponent.width}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                <input
                  type="number"
                  value={selectedComponent.height}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  readOnly
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Settings2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-600">Select a component to view properties</p>
            </div>
          )
        ) : (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Quick Actions</h4>
            <div className="space-y-2">
              {["Add a form with validation", "Create a navigation menu", "Add a data table", "Set up page routing"].map((suggestion) => (
                <button
                  key={suggestion}
                  className="w-full text-left px-3 py-2.5 text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}