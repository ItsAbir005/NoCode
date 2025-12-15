import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas as FabricCanvas, Rect, FabricText, Circle, Line, FabricObject } from "fabric";
import { MousePointer2, ZoomIn, ZoomOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CanvasComponent {
  id: string;
  type: string;
  fabricObject: FabricObject;
}

interface MainCanvasProps {
  onSelectionChange?: (component: CanvasComponent | null) => void;
}

export function MainCanvas({ onSelectionChange }: MainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [zoom, setZoom] = useState(100);
  const [componentCount, setComponentCount] = useState(0);
  const componentsRef = useRef<CanvasComponent[]>([]);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 1024,
      height: 600,
      backgroundColor: "#ffffff",
      selection: true,
    });

    canvas.on("selection:created", (e) => {
      const selected = e.selected?.[0];
      if (selected) {
        const comp = componentsRef.current.find((c) => c.fabricObject === selected);
        onSelectionChange?.(comp || null);
      }
    });

    canvas.on("selection:updated", (e) => {
      const selected = e.selected?.[0];
      if (selected) {
        const comp = componentsRef.current.find((c) => c.fabricObject === selected);
        onSelectionChange?.(comp || null);
      }
    });

    canvas.on("selection:cleared", () => {
      onSelectionChange?.(null);
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [onSelectionChange]);

  // Handle zoom
  const handleZoom = (direction: "in" | "out") => {
    if (!fabricCanvas) return;
    const newZoom = direction === "in" ? Math.min(zoom + 10, 200) : Math.max(zoom - 10, 50);
    setZoom(newZoom);
    fabricCanvas.setZoom(newZoom / 100);
    fabricCanvas.renderAll();
  };

  // Delete selected
  const handleDelete = () => {
    if (!fabricCanvas) return;
    const active = fabricCanvas.getActiveObjects();
    if (active.length === 0) {
      toast.error("No component selected");
      return;
    }
    active.forEach((obj) => {
      fabricCanvas.remove(obj);
      componentsRef.current = componentsRef.current.filter((c) => c.fabricObject !== obj);
    });
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
    setComponentCount(componentsRef.current.length);
    onSelectionChange?.(null);
    toast.success("Component deleted");
  };

  // Create component based on type
  const createComponent = useCallback(
    (type: string, left: number, top: number): FabricObject | null => {
      switch (type) {
        case "Button":
          return new Rect({
            left,
            top,
            width: 120,
            height: 40,
            fill: "#3b82f6",
            rx: 8,
            ry: 8,
          });
        case "Text":
          return new FabricText("Text Block", {
            left,
            top,
            fontSize: 16,
            fill: "#1f2937",
            fontFamily: "sans-serif",
          });
        case "Image":
          return new Rect({
            left,
            top,
            width: 200,
            height: 150,
            fill: "#e5e7eb",
            rx: 4,
            ry: 4,
            stroke: "#d1d5db",
            strokeWidth: 1,
          });
        case "Container":
          return new Rect({
            left,
            top,
            width: 300,
            height: 200,
            fill: "transparent",
            stroke: "#9ca3af",
            strokeWidth: 2,
            strokeDashArray: [5, 5],
            rx: 8,
            ry: 8,
          });
        case "Divider":
          return new Line([left, top, left + 200, top], {
            stroke: "#d1d5db",
            strokeWidth: 2,
          });
        case "Input":
          return new Rect({
            left,
            top,
            width: 200,
            height: 40,
            fill: "#f9fafb",
            stroke: "#d1d5db",
            strokeWidth: 1,
            rx: 6,
            ry: 6,
          });
        case "Dropdown":
          return new Rect({
            left,
            top,
            width: 200,
            height: 40,
            fill: "#ffffff",
            stroke: "#d1d5db",
            strokeWidth: 1,
            rx: 6,
            ry: 6,
          });
        case "Checkbox":
          return new Rect({
            left,
            top,
            width: 20,
            height: 20,
            fill: "#ffffff",
            stroke: "#d1d5db",
            strokeWidth: 2,
            rx: 4,
            ry: 4,
          });
        case "Radio":
          return new Circle({
            left,
            top,
            radius: 10,
            fill: "#ffffff",
            stroke: "#d1d5db",
            strokeWidth: 2,
          });
        case "File Upload":
          return new Rect({
            left,
            top,
            width: 200,
            height: 80,
            fill: "#f3f4f6",
            stroke: "#9ca3af",
            strokeWidth: 2,
            strokeDashArray: [8, 4],
            rx: 8,
            ry: 8,
          });
        case "Table":
          return new Rect({
            left,
            top,
            width: 400,
            height: 200,
            fill: "#ffffff",
            stroke: "#e5e7eb",
            strokeWidth: 1,
          });
        case "Chart":
          return new Rect({
            left,
            top,
            width: 350,
            height: 250,
            fill: "#f0fdf4",
            stroke: "#22c55e",
            strokeWidth: 2,
            rx: 8,
            ry: 8,
          });
        case "Card":
          return new Rect({
            left,
            top,
            width: 280,
            height: 180,
            fill: "#ffffff",
            stroke: "#e5e7eb",
            strokeWidth: 1,
            rx: 12,
            ry: 12,
          });
        case "List":
          return new Rect({
            left,
            top,
            width: 250,
            height: 300,
            fill: "#ffffff",
            stroke: "#e5e7eb",
            strokeWidth: 1,
            rx: 4,
            ry: 4,
          });
        default:
          return new Rect({
            left,
            top,
            width: 100,
            height: 100,
            fill: "#e5e7eb",
          });
      }
    },
    []
  );

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!fabricCanvas || !containerRef.current) return;

      const componentType = e.dataTransfer.getData("componentType");
      if (!componentType) return;

      const canvasRect = containerRef.current.getBoundingClientRect();
      const left = (e.clientX - canvasRect.left - 32) / (zoom / 100);
      const top = (e.clientY - canvasRect.top - 32) / (zoom / 100);

      const obj = createComponent(componentType, left, top);
      if (obj) {
        const id = `${componentType.toLowerCase()}-${Date.now()}`;
        const component: CanvasComponent = {
          id,
          type: componentType,
          fabricObject: obj,
        };
        componentsRef.current.push(component);
        fabricCanvas.add(obj);
        fabricCanvas.setActiveObject(obj);
        fabricCanvas.renderAll();
        setComponentCount(componentsRef.current.length);
        onSelectionChange?.(component);
        toast.success(`Added ${componentType}`);
      }
    },
    [fabricCanvas, createComponent, zoom, onSelectionChange]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  return (
    <div className="h-full bg-muted/30 flex flex-col">
      {/* Canvas toolbar */}
      <div className="h-10 border-b border-border bg-card flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Zoom: {zoom}%</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleZoom("out")}>
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleZoom("in")}>
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="w-px h-4 bg-border" />
          <span className="text-xs text-muted-foreground">1024 × 600</span>
          <div className="w-px h-4 bg-border" />
          <span className="text-xs text-muted-foreground">{componentCount} components</span>
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-destructive hover:text-destructive" onClick={handleDelete}>
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          Delete
        </Button>
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-8"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="mx-auto bg-background rounded-lg shadow-lg border border-border relative inline-block">
          <canvas ref={canvasRef} />

          {/* Empty state overlay */}
          {componentCount === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground pointer-events-none">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <MousePointer2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">Start building</h3>
              <p className="text-sm">Drag components from the left panel to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
