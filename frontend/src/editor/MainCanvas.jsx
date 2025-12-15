import { useEffect, useRef, useState, useCallback } from "react";
import { MousePointer2, ZoomIn, ZoomOut, Trash2 } from "lucide-react";

export function MainCanvas({ onSelectionChange }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(100);
  const [components, setComponents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const handleZoom = (direction) => {
    const newZoom = direction === "in" ? Math.min(zoom + 10, 200) : Math.max(zoom - 10, 50);
    setZoom(newZoom);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    setComponents(components.filter(c => c.id !== selectedId));
    setSelectedId(null);
    onSelectionChange?.(null);
  };

  const createComponent = useCallback((type, x, y) => {
    const defaults = {
      Button: { width: 120, height: 40, color: "#3b82f6", text: "Button" },
      Text: { width: 200, height: 30, text: "Text Block" },
      Input: { width: 200, height: 40, placeholder: "Enter text..." },
      Container: { width: 300, height: 200, border: "2px dashed #9ca3af" },
      Image: { width: 200, height: 150, bg: "#e5e7eb" },
      Checkbox: { width: 20, height: 20 },
      Radio: { width: 20, height: 20 },
      "File Upload": { width: 200, height: 80, border: "2px dashed #9ca3af" },
      Table: { width: 400, height: 200, border: "1px solid #e5e7eb" },
      Chart: { width: 350, height: 250, bg: "#f0fdf4", border: "2px solid #22c55e" },
      Card: { width: 280, height: 180, bg: "#ffffff", border: "1px solid #e5e7eb" },
      List: { width: 250, height: 300, bg: "#ffffff", border: "1px solid #e5e7eb" },
      Divider: { width: 200, height: 2, bg: "#d1d5db" },
    };

    return {
      id: `${type.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      type,
      x,
      y,
      ...defaults[type]
    };
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const type = e.dataTransfer.getData("componentType");
    if (!type) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (zoom / 100);
    const y = (e.clientY - rect.top) / (zoom / 100);

    const newComponent = createComponent(type, x, y);
    setComponents([...components, newComponent]);
    setSelectedId(newComponent.id);
    onSelectionChange?.(newComponent);
  }, [components, zoom, createComponent, onSelectionChange]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleComponentClick = (component) => {
    setSelectedId(component.id);
    onSelectionChange?.(component);
  };

  const renderComponent = (component) => {
    const isSelected = selectedId === component.id;
    const style = {
      position: "absolute",
      left: component.x,
      top: component.y,
      width: component.width,
      height: component.height,
      border: isSelected ? "2px solid #3b82f6" : component.border || "none",
      cursor: "move",
      backgroundColor: component.bg,
    };

    switch (component.type) {
      case "Button":
        return (
          <button
            key={component.id}
            onClick={() => handleComponentClick(component)}
            style={{ ...style, backgroundColor: component.color, color: "white", borderRadius: "6px", border: isSelected ? "2px solid #3b82f6" : "none" }}
          >
            {component.text}
          </button>
        );
      case "Text":
        return (
          <div
            key={component.id}
            onClick={() => handleComponentClick(component)}
            style={{ ...style, fontSize: "16px" }}
          >
            {component.text}
          </div>
        );
      case "Input":
        return (
          <input
            key={component.id}
            onClick={() => handleComponentClick(component)}
            placeholder={component.placeholder}
            style={{ ...style, padding: "8px", border: isSelected ? "2px solid #3b82f6" : "1px solid #d1d5db", borderRadius: "6px" }}
          />
        );
      case "Container":
        return (
          <div
            key={component.id}
            onClick={() => handleComponentClick(component)}
            style={{ ...style, backgroundColor: "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}
          >
            Container
          </div>
        );
      case "Image":
        return (
          <div
            key={component.id}
            onClick={() => handleComponentClick(component)}
            style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px" }}
          >
            <span className="text-gray-500">Image</span>
          </div>
        );
      case "Divider":
        return (
          <div
            key={component.id}
            onClick={() => handleComponentClick(component)}
            style={style}
          />
        );
      default:
        return (
          <div
            key={component.id}
            onClick={() => handleComponentClick(component)}
            style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}
          >
            {component.type}
          </div>
        );
    }
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="h-10 border-b border-gray-200 bg-white flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Zoom: {zoom}%</span>
          <div className="flex items-center gap-1">
            <button onClick={() => handleZoom("out")} className="p-1 hover:bg-gray-100 rounded">
              <ZoomOut className="w-4 h-4" />
            </button>
            <button onClick={() => handleZoom("in")} className="p-1 hover:bg-gray-100 rounded">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
          <div className="w-px h-4 bg-gray-300" />
          <span className="text-xs text-gray-600">1024 × 600</span>
          <div className="w-px h-4 bg-gray-300" />
          <span className="text-xs text-gray-600">{components.length} components</span>
        </div>
        <button onClick={handleDelete} className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm flex items-center gap-1">
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-8"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div
          ref={canvasRef}
          className="mx-auto bg-white rounded-lg shadow-lg border border-gray-200 relative"
          style={{
            width: 1024,
            height: 600,
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left',
          }}
        >
          {components.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <MousePointer2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-700">Start building</h3>
              <p className="text-sm">Drag components from the left panel to get started</p>
            </div>
          ) : (
            components.map(renderComponent)
          )}
        </div>
      </div>
    </div>
  );
}