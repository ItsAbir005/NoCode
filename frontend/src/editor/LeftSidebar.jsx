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
  Layout,
  Navigation,
  AlertCircle,
  Menu,
  Search,
  Bell,
  User,
  Settings,
  Calendar,
  Clock,
  MapPin,
  Star,
  Heart,
  ShoppingCart,
  Phone,
  Mail,
  Globe,
} from "lucide-react";

const componentSections = [
  {
    title: "Basic Elements",
    items: [
      { name: "Button", icon: Square, category: "basic" },
      { name: "Text", icon: Type, category: "basic" },
      { name: "Image", icon: Image, category: "basic" },
      { name: "Container", icon: Box, category: "basic" },
      { name: "Divider", icon: Minus, category: "basic" },
    ],
  },
  {
    title: "Form Components",
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
      { name: "Sidebar", icon: Layout, category: "navigation" },
      { name: "Breadcrumbs", icon: Navigation, category: "navigation" },
      { name: "Tabs", icon: Menu, category: "navigation" },
      { name: "Pagination", icon: Menu, category: "navigation" },
    ],
  },
  {
    title: "Data Display",
    items: [
      { name: "Table", icon: Table, category: "data" },
      { name: "Chart", icon: BarChart3, category: "data" },
      { name: "Card", icon: CreditCard, category: "data" },
      { name: "List", icon: List, category: "data" },
      { name: "Badge", icon: Circle, category: "data" },
      { name: "Avatar", icon: User, category: "data" },
    ],
  },
  {
    title: "Feedback",
    items: [
      { name: "Alert", icon: AlertCircle, category: "feedback" },
      { name: "Modal", icon: Square, category: "feedback" },
      { name: "Toast", icon: Bell, category: "feedback" },
      { name: "Progress Bar", icon: Minus, category: "feedback" },
      { name: "Spinner", icon: Circle, category: "feedback" },
    ],
  },
  {
    title: "Icons & Media",
    items: [
      { name: "Icon Button", icon: Star, category: "media" },
      { name: "Video Player", icon: Square, category: "media" },
      { name: "Audio Player", icon: Square, category: "media" },
    ],
  },
];

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
    e.dataTransfer.setData("componentCategory", item.category);
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
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Components
        </h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
          <div className="p-4 text-center text-sm text-gray-500">
            No components found
          </div>
        )}
      </div>
    </div>
  );
}