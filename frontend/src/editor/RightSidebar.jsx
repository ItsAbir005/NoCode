import { Sparkles, Settings2, Palette, Type as TypeIcon, Maximize2 } from "lucide-react";
import { useState, useEffect } from "react";

export function RightSidebar({ selectedComponent }) {
  const [activeTab, setActiveTab] = useState("properties");
  const [localComponent, setLocalComponent] = useState(null);

  useEffect(() => {
    setLocalComponent(selectedComponent);
  }, [selectedComponent]);

  const updateProperty = (property, value) => {
    if (!localComponent) return;
    
    const updated = { ...localComponent, [property]: value };
    setLocalComponent(updated);
    
    // Update the component in the canvas
    if (window.__updateComponent) {
      window.__updateComponent(localComponent.id, { [property]: value });
    }
  };

  const PropertyInput = ({ label, property, type = "text", min, max, step = 1, options }) => {
    if (!localComponent) return null;
    const value = localComponent[property] ?? "";

    if (type === "select") {
      return (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
          <select
            value={value}
            onChange={(e) => updateProperty(property, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );
    }

    if (type === "color") {
      return (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={value}
              onChange={(e) => updateProperty(property, e.target.value)}
              className="h-10 w-14 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => updateProperty(property, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
            />
          </div>
        </div>
      );
    }

    if (type === "number") {
      return (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => updateProperty(property, parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      );
    }

    if (type === "textarea") {
      return (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
          <textarea
            value={value}
            onChange={(e) => updateProperty(property, e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
        </div>
      );
    }

    return (
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <input
          type={type}
          value={value}
          onChange={(e) => updateProperty(property, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
    );
  };

  const renderProperties = () => {
    if (!localComponent) {
      return (
        <div className="text-center py-8">
          <Settings2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-600">Select a component to view properties</p>
        </div>
      );
    }

    const commonProps = (
      <>
        <div className="mb-4 pb-4 border-b border-gray-200">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Maximize2 className="w-3.5 h-3.5" />
            Layout
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <PropertyInput label="X Position" property="x" type="number" min={0} step={1} />
            <PropertyInput label="Y Position" property="y" type="number" min={0} step={1} />
            <PropertyInput label="Width" property="width" type="number" min={20} step={1} />
            <PropertyInput label="Height" property="height" type="number" min={20} step={1} />
          </div>
        </div>
      </>
    );

    switch (localComponent.type) {
      case "Button":
        return (
          <>
            {commonProps}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <TypeIcon className="w-3.5 h-3.5" />
                Content
              </h4>
              <PropertyInput label="Button Text" property="text" />
              <PropertyInput label="Font Size" property="fontSize" type="number" min={8} max={72} />
            </div>
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5" />
                Style
              </h4>
              <PropertyInput label="Background Color" property="color" type="color" />
              <PropertyInput label="Text Color" property="textColor" type="color" />
            </div>
          </>
        );

      case "Text":
        return (
          <>
            {commonProps}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <TypeIcon className="w-3.5 h-3.5" />
                Content
              </h4>
              <PropertyInput label="Text" property="text" type="textarea" />
              <PropertyInput label="Font Size" property="fontSize" type="number" min={8} max={72} />
            </div>
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5" />
                Style
              </h4>
              <PropertyInput label="Text Color" property="color" type="color" />
            </div>
          </>
        );

      case "Input":
        return (
          <>
            {commonProps}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <TypeIcon className="w-3.5 h-3.5" />
                Content
              </h4>
              <PropertyInput label="Placeholder" property="placeholder" />
            </div>
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5" />
                Style
              </h4>
              <PropertyInput label="Background Color" property="backgroundColor" type="color" />
              <PropertyInput label="Border Color" property="borderColor" type="color" />
            </div>
          </>
        );

      case "Container":
        return (
          <>
            {commonProps}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5" />
                Style
              </h4>
              <PropertyInput label="Background Color" property="backgroundColor" type="color" />
              <PropertyInput 
                label="Border Style" 
                property="border" 
                type="select"
                options={[
                  { value: "2px dashed #9ca3af", label: "Dashed" },
                  { value: "2px solid #9ca3af", label: "Solid" },
                  { value: "none", label: "None" }
                ]}
              />
              <PropertyInput label="Border Radius" property="borderRadius" type="number" min={0} max={50} />
            </div>
          </>
        );

      case "Image":
        return (
          <>
            {commonProps}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <TypeIcon className="w-3.5 h-3.5" />
                Content
              </h4>
              <PropertyInput label="Image URL" property="src" />
            </div>
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5" />
                Style
              </h4>
              <PropertyInput label="Background Color" property="bg" type="color" />
            </div>
          </>
        );

      case "Divider":
        return (
          <>
            {commonProps}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5" />
                Style
              </h4>
              <PropertyInput label="Color" property="bg" type="color" />
            </div>
          </>
        );

      default:
        return (
          <>
            {commonProps}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5" />
                Style
              </h4>
              {localComponent.bg !== undefined && (
                <PropertyInput label="Background Color" property="bg" type="color" />
              )}
              {localComponent.backgroundColor !== undefined && (
                <PropertyInput label="Background Color" property="backgroundColor" type="color" />
              )}
              {localComponent.border !== undefined && (
                <PropertyInput label="Border" property="border" />
              )}
              {localComponent.borderRadius !== undefined && (
                <PropertyInput label="Border Radius" property="borderRadius" type="number" min={0} max={50} />
              )}
            </div>
          </>
        );
    }
  };

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
          <div>
            {localComponent && (
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">{localComponent.type}</h3>
                  <span className="text-xs text-gray-500 font-mono">#{localComponent.id.slice(0, 8)}</span>
                </div>
              </div>
            )}
            {renderProperties()}
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Quick Actions</h4>
            <div className="space-y-2">
              {[
                "Add a form with validation",
                "Create a navigation menu",
                "Add a data table",
                "Set up page routing",
                "Connect to an API",
                "Add animations"
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  className="w-full text-left px-3 py-2.5 text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-sm font-medium text-indigo-900 mb-1">Pro Tip</h5>
                  <p className="text-xs text-indigo-700">
                    Select a component and use the Properties panel to customize its appearance and behavior in real-time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}