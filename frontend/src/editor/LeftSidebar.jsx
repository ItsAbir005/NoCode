import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Square,
  Type,
  Image,
  Box,
  Minus,
  FormInput,
  CheckSquare,
  Circle,
  Upload,
  Table,
  BarChart3,
  CreditCard,
  List,
  FileText,
  Workflow,
  GripVertical,
} from "lucide-react";

const componentSections = [
  {
    title: "Basic Elements",
    items: [
      { name: "Button", icon: Square },
      { name: "Text", icon: Type },
      { name: "Image", icon: Image },
      { name: "Container", icon: Box },
      { name: "Divider", icon: Minus },
    ],
  },
  {
    title: "Form Components",
    items: [
      { name: "Input", icon: FormInput },
      { name: "Checkbox", icon: CheckSquare },
      { name: "Radio", icon: Circle },
      { name: "File Upload", icon: Upload },
    ],
  },
  {
    title: "Data Components",
    items: [
      { name: "Table", icon: Table },
      { name: "Chart", icon: BarChart3 },
      { name: "Card", icon: CreditCard },
      { name: "List", icon: List },
    ],
  },
];

const pages = ["Home", "Dashboard", "Settings"];

function CollapsibleSection({ title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        {title}
      </button>
      {isOpen && <div className="pb-2">{children}</div>}
    </div>
  );
}

function DraggableComponentItem({ item }) {
  const Icon = item.icon;

  const handleDragStart = (e) => {
    e.dataTransfer.setData("componentType", item.name);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 mx-2 rounded-md text-sm text-gray-900 hover:bg-gray-100 cursor-grab active:cursor-grabbing transition-colors group"
      draggable
      onDragStart={handleDragStart}
    >
      <GripVertical className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Icon className="w-4 h-4 text-gray-600" />
      <span className="flex-1">{item.name}</span>
    </div>
  );
}

export function LeftSidebar() {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-3 border-b border-gray-200">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Components
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {componentSections.map((section) => (
          <CollapsibleSection key={section.title} title={section.title}>
            {section.items.map((item) => (
              <DraggableComponentItem key={item.name} item={item} />
            ))}
          </CollapsibleSection>
        ))}

        <CollapsibleSection title="Pages" defaultOpen={false}>
          <div className="px-2">
            {pages.map((page) => (
              <div
                key={page}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                  page === "Home"
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-900 hover:bg-gray-100"
                }`}
              >
                <FileText className="w-4 h-4" />
                {page}
              </div>
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Workflows" defaultOpen={false}>
          <div className="px-4 py-2 text-sm text-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <Workflow className="w-4 h-4" />
              No workflows yet
            </div>
            <p className="text-xs">Create automation flows for your app</p>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
