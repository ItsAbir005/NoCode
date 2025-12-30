// frontend/src/editor/LeftSidebar.jsx
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
  GripVertical,
  Navigation,
  AlertCircle,
  Menu,
  Search,
  Calendar,
} from "lucide-react";

const componentSections = [
  {
    title: "Basic",
    items: [
      { name: "Button", icon: Square, category: "basic" },
      { name: "Text", icon: Type, category: "basic" },
      { name: "Image", icon: Image, category: "basic" },
      { name: "Container", icon: Box, category: "basic" },
      { name: "Divider", icon: Minus, category: "basic" },
    ],
  },
  {
    title: "Forms",
    items: [
      { name: "Input", icon: FormInput, category: "form" },
      { name: "Checkbox", icon: CheckSquare, category: "form" },
      { name: "Radio", icon: Circle, category: "form" },
      { name: "File Upload", icon: Upload, category: "form" },
      { name: "Textarea", icon: FileText, category: "form" },
      { name: "Select", icon: Menu, category: "form" },
      { name: "Date Picker", icon: Calendar, category: "form" },
    ],
  },
  {
    title: "Navigation",
    items: [
      { name: "Navbar", icon: Navigation, category: "navigation" },
      { name: "Sidebar", icon: Menu, category: "navigation" },
      { name: "Breadcrumbs", icon: Navigation, category: "navigation" },
      { name: "Tabs", icon: Menu, category: "navigation" },
    ],
  },
  {
    title: "Data",
    items: [
      { name: "Table", icon: Table, category: "data" },
      { name: "Chart", icon: BarChart3, category: "data" },
      { name: "Card", icon: CreditCard, category: "data" },
      { name: "List", icon: List, category: "data" },
    ],
  },
  {
    title: "Feedback",
    items: [
      { name: "Alert", icon: AlertCircle, category: "feedback" },
      { name: "Modal", icon: Square, category: "feedback" },
    ],
  },
];

function CollapsibleSection({ title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
        {title}
      </button>
      {isOpen && <div className="pb-1">{children}</div>}
    </div>
  );
}

function DraggableComponentItem({ item }) {
  const Icon = item.icon;

  const handleDragStart = (e) => {
    e.dataTransfer.setData("componentType", item.name);
    e.dataTransfer.setData("componentCategory", item.category);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 mx-2 rounded text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-grab active:cursor-grabbing transition-colors group"
      draggable
      onDragStart={handleDragStart}
    >
      <GripVertical className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Icon className="w-3.5 h-3.5" />
      <span className="flex-1 font-medium">{item.name}</span>
    </div>
  );
}

export function LeftSidebar() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSections = componentSections.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(section => section.items.length > 0);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-3 border-b border-gray-200">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredSections.map((section) => (
          <CollapsibleSection key={section.title} title={section.title}>
            {section.items.map((item) => (
              <DraggableComponentItem key={item.name} item={item} />
            ))}
          </CollapsibleSection>
        ))}

        {filteredSections.length === 0 && (
          <div className="p-4 text-center text-xs text-gray-500">
            No components found
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600 text-center">
          Drag components to canvas
        </p>
      </div>
    </div>
  );
}