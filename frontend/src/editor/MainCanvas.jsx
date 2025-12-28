import { useEffect, useRef, useState, useCallback } from "react";
import { MousePointer2, ZoomIn, ZoomOut, Trash2, Undo2, Redo2 } from "lucide-react";

export function MainCanvas({ onSelectionChange, initialComponents = [], onComponentsChange }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(100);
  const [components, setComponents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [dragging, setDragging] = useState(null);
  const [resizing, setResizing] = useState(null);
  const isInitialized = useRef(false);
  const prevInitialComponents = useRef([]);

  // Initialize components from props ONCE or when they actually change
  useEffect(() => {
    // Only update if initialComponents actually changed (deep comparison of length and IDs)
    const hasChanged = 
      initialComponents.length !== prevInitialComponents.current.length ||
      JSON.stringify(initialComponents.map(c => c.id)) !== JSON.stringify(prevInitialComponents.current.map(c => c.id));

    if (hasChanged && initialComponents.length > 0) {
      console.log('MainCanvas initializing with components:', initialComponents);
      setComponents(initialComponents);
      setHistory([initialComponents]);
      setHistoryIndex(0);
      prevInitialComponents.current = initialComponents;
      isInitialized.current = true;
    } else if (!isInitialized.current && initialComponents.length === 0) {
      // First mount with empty components
      setComponents([]);
      setHistory([[]]);
      setHistoryIndex(0);
      isInitialized.current = true;
    }
  }, [initialComponents]);

  const addToHistory = useCallback((newComponents) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newComponents);
      return newHistory.slice(-50);
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const prevComponents = history[newIndex];
      setComponents(prevComponents);
      if (onComponentsChange) onComponentsChange(prevComponents);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextComponents = history[newIndex];
      setComponents(nextComponents);
      if (onComponentsChange) onComponentsChange(nextComponents);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId && document.activeElement.tagName !== 'INPUT') {
          e.preventDefault();
          handleDelete();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, historyIndex, history]);

  const handleZoom = (direction) => {
    const newZoom = direction === "in" ? Math.min(zoom + 10, 200) : Math.max(zoom - 10, 50);
    setZoom(newZoom);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    const newComponents = components.filter(c => c.id !== selectedId);
    setComponents(newComponents);
    addToHistory(newComponents);
    setSelectedId(null);
    if (onSelectionChange) onSelectionChange(null);
    if (onComponentsChange) onComponentsChange(newComponents);
  };

  const createComponent = useCallback((type, x, y) => {
    const defaults = {
      Button: {
        width: 120, height: 40,
        color: "#3b82f6",
        text: "Button",
        textColor: "#ffffff",
        fontSize: 14
      },
      Text: {
        width: 200, height: 30,
        text: "Text Block",
        color: "#000000",
        fontSize: 16
      },
      Input: {
        width: 200, height: 40,
        placeholder: "Enter text...",
        borderColor: "#d1d5db",
        backgroundColor: "#ffffff"
      },
      Container: {
        width: 300, height: 200,
        border: "2px dashed #9ca3af",
        backgroundColor: "transparent"
      },
      Image: {
        width: 200, height: 150,
        bg: "#e5e7eb",
        src: ""
      },
      Checkbox: {
        width: 20, height: 20,
        checked: false
      },
      Radio: {
        width: 20, height: 20,
        checked: false
      },
      "File Upload": {
        width: 200, height: 80,
        border: "2px dashed #9ca3af",
        backgroundColor: "#f9fafb"
      },
      Divider: {
        width: 200, height: 2,
        bg: "#d1d5db"
      },
      Card: {
        width: 280, height: 180,
        bg: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 8
      },
      Table: {
        width: 400, height: 200,
        border: "1px solid #e5e7eb",
        backgroundColor: "#ffffff"
      },
      Alert: {
        width: 400, height: 60,
        backgroundColor: "#dbeafe",
        border: "1px solid #3b82f6",
        borderRadius: 8,
        text: "This is an alert message"
      },
      Navbar: {
        width: 1024, height: 60,
        backgroundColor: "#1f2937",
        color: "#ffffff"
      },
    };

    return {
      id: `${type.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
    setComponents(prev => {
      const newComponents = [...prev, newComponent];
      addToHistory(newComponents);
      if (onComponentsChange) onComponentsChange(newComponents);
      return newComponents;
    });
    
    setSelectedId(newComponent.id);
    if (onSelectionChange) onSelectionChange(newComponent);
  }, [zoom, createComponent, onSelectionChange, addToHistory, onComponentsChange]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleComponentMouseDown = (e, component) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    setSelectedId(component.id);
    if (onSelectionChange) onSelectionChange(component);

    const startX = e.clientX;
    const startY = e.clientY;
    const componentStartX = component.x;
    const componentStartY = component.y;

    setDragging({
      id: component.id,
      startX,
      startY,
      componentStartX,
      componentStartY
    });
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e) => {
      const deltaX = (e.clientX - dragging.startX) / (zoom / 100);
      const deltaY = (e.clientY - dragging.startY) / (zoom / 100);

      setComponents(prev =>
        prev.map(c =>
          c.id === dragging.id
            ? {
              ...c,
              x: Math.max(0, dragging.componentStartX + deltaX),
              y: Math.max(0, dragging.componentStartY + deltaY)
            }
            : c
        )
      );
    };

    const handleMouseUp = () => {
      setDragging(null);
      if (onComponentsChange) {
        onComponentsChange(components);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, zoom, onComponentsChange]);

  const handleResizeMouseDown = (e, component, direction) => {
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = component.width;
    const startHeight = component.height;
    const startPosX = component.x;
    const startPosY = component.y;

    setResizing({
      id: component.id,
      direction,
      startX,
      startY,
      startWidth,
      startHeight,
      startPosX,
      startPosY
    });
  };

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e) => {
      const deltaX = (e.clientX - resizing.startX) / (zoom / 100);
      const deltaY = (e.clientY - resizing.startY) / (zoom / 100);

      setComponents(prev =>
        prev.map(c => {
          if (c.id !== resizing.id) return c;

          const updates = {};

          switch (resizing.direction) {
            case 'nw':
              updates.width = Math.max(20, resizing.startWidth - deltaX);
              updates.height = Math.max(20, resizing.startHeight - deltaY);
              updates.x = resizing.startPosX + deltaX;
              updates.y = resizing.startPosY + deltaY;
              break;
            case 'n':
              updates.height = Math.max(20, resizing.startHeight - deltaY);
              updates.y = resizing.startPosY + deltaY;
              break;
            case 'ne':
              updates.width = Math.max(20, resizing.startWidth + deltaX);
              updates.height = Math.max(20, resizing.startHeight - deltaY);
              updates.y = resizing.startPosY + deltaY;
              break;
            case 'e':
              updates.width = Math.max(20, resizing.startWidth + deltaX);
              break;
            case 'se':
              updates.width = Math.max(20, resizing.startWidth + deltaX);
              updates.height = Math.max(20, resizing.startHeight + deltaY);
              break;
            case 's':
              updates.height = Math.max(20, resizing.startHeight + deltaY);
              break;
            case 'sw':
              updates.width = Math.max(20, resizing.startWidth - deltaX);
              updates.height = Math.max(20, resizing.startHeight + deltaY);
              updates.x = resizing.startPosX + deltaX;
              break;
            case 'w':
              updates.width = Math.max(20, resizing.startWidth - deltaX);
              updates.x = resizing.startPosX + deltaX;
              break;
          }

          return { ...c, ...updates };
        })
      );
    };

    const handleMouseUp = () => {
      setResizing(null);
      if (onComponentsChange) {
        onComponentsChange(components);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, zoom, onComponentsChange]);

  const updateComponent = useCallback((id, updates) => {
    setComponents(prev => {
      const newComponents = prev.map(c =>
        c.id === id ? { ...c, ...updates } : c
      );
      if (onComponentsChange) onComponentsChange(newComponents);
      
      const updated = newComponents.find(c => c.id === id);
      if (updated && onSelectionChange) {
        onSelectionChange(updated);
      }
      
      return newComponents;
    });
    addToHistory(components);
  }, [addToHistory, onSelectionChange, onComponentsChange]);

  useEffect(() => {
    window.__updateComponent = updateComponent;
    return () => {
      delete window.__updateComponent;
    };
  }, [updateComponent]);

  const renderResizeHandles = (component) => {
    if (selectedId !== component.id) return null;

    const handles = [
      { dir: 'nw', cursor: 'nw-resize', top: -4, left: -4 },
      { dir: 'n', cursor: 'n-resize', top: -4, left: '50%', transform: 'translateX(-50%)' },
      { dir: 'ne', cursor: 'ne-resize', top: -4, right: -4 },
      { dir: 'e', cursor: 'e-resize', top: '50%', right: -4, transform: 'translateY(-50%)' },
      { dir: 'se', cursor: 'se-resize', bottom: -4, right: -4 },
      { dir: 's', cursor: 's-resize', bottom: -4, left: '50%', transform: 'translateX(-50%)' },
      { dir: 'sw', cursor: 'sw-resize', bottom: -4, left: -4 },
      { dir: 'w', cursor: 'w-resize', top: '50%', left: -4, transform: 'translateY(-50%)' },
    ];

    return handles.map(handle => (
      <div
        key={handle.dir}
        onMouseDown={(e) => handleResizeMouseDown(e, component, handle.dir)}
        style={{
          position: 'absolute',
          width: 8,
          height: 8,
          backgroundColor: '#3b82f6',
          border: '1px solid white',
          borderRadius: '50%',
          cursor: handle.cursor,
          zIndex: 1000,
          ...Object.fromEntries(
            Object.entries(handle).filter(([key]) =>
              ['top', 'left', 'right', 'bottom', 'transform'].includes(key)
            )
          )
        }}
      />
    ));
  };

  const renderComponent = (component) => {
    const isSelected = selectedId === component.id;
    const baseStyle = {
      position: "absolute",
      left: component.x,
      top: component.y,
      width: component.width,
      height: component.height,
      cursor: dragging?.id === component.id ? 'grabbing' : 'grab',
      userSelect: 'none',
    };

    const wrapperStyle = {
      ...baseStyle,
      border: isSelected ? "2px solid #3b82f6" : "1px solid transparent",
      boxSizing: 'border-box',
    };

    let content;

    switch (component.type) {
      case "Button":
        content = (
          <button
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: component.color,
              color: component.textColor,
              borderRadius: "6px",
              border: "none",
              fontSize: component.fontSize,
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            {component.text}
          </button>
        );
        break;
      case "Text":
        content = (
          <div
            style={{
              width: '100%',
              height: '100%',
              fontSize: component.fontSize,
              color: component.color,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {component.text}
          </div>
        );
        break;
      case "Input":
        content = (
          <input
            placeholder={component.placeholder}
            style={{
              width: '100%',
              height: '100%',
              padding: "8px",
              border: `1px solid ${component.borderColor}`,
              borderRadius: "6px",
              backgroundColor: component.backgroundColor,
              fontSize: 14
            }}
          />
        );
        break;
      case "Container":
        content = (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: component.backgroundColor,
              border: component.border,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9ca3af",
              borderRadius: component.borderRadius || 0
            }}
          >
            Container
          </div>
        );
        break;
      case "Image":
        content = (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: component.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px"
            }}
          >
            <span style={{ color: '#6b7280' }}>Image</span>
          </div>
        );
        break;
      case "Divider":
        content = (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: component.bg
            }}
          />
        );
        break;
      default:
        content = (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
              border: component.border,
              backgroundColor: component.bg || component.backgroundColor,
              borderRadius: component.borderRadius || 0
            }}
          >
            {component.type}
          </div>
        );
    }

    return (
      <div
        key={component.id}
        style={wrapperStyle}
        onMouseDown={(e) => handleComponentMouseDown(e, component)}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedId(component.id);
          if (onSelectionChange) onSelectionChange(component);
        }}
      >
        {content}
        {renderResizeHandles(component)}
      </div>
    );
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="h-10 border-b border-gray-200 bg-white flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={historyIndex === 0}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
          <div className="w-px h-4 bg-gray-300" />
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
        <button
          onClick={handleDelete}
          disabled={!selectedId}
          className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-8"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => {
          setSelectedId(null);
          if (onSelectionChange) onSelectionChange(null);
        }}
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