// frontend/src/components/ProjectEditor.jsx - Part 1
import { useState, useRef } from 'react';

// Import all sidebar panel components
import LeftSidebarTabs from './editor/LeftSidebarTabs';
import ComponentsPanel from './editor/ComponentsPanel';
import PagesPanel from './editor/PagesPanel';
import DatabasePanel from './editor/DatabasePanel';
import APIPanel from './editor/APIPanel';
import WorkflowsPanel from './editor/WorkflowsPanel';
import PropertiesPanel from './editor/PropertiesPanel';

const ProjectEditor = ({ projectId }) => {
  // Left sidebar state
  const [leftTab, setLeftTab] = useState('components');

  // Canvas state
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [draggedComponent, setDraggedComponent] = useState(null);
  const [hoveredComponent, setHoveredComponent] = useState(null);

  // View controls
  const [zoom, setZoom] = useState(100);
  const [previewMode, setPreviewMode] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  // Pages state
  const [pages, setPages] = useState([
    { id: 'page-1', name: 'Home', path: '/' },
    { id: 'page-2', name: 'About', path: '/about' }
  ]);
  const [selectedPage, setSelectedPage] = useState(pages[0]);

  const canvasRef = useRef(null);

  // Drag and Drop Handlers
  const handleDragStart = (e, component) => {
    setDraggedComponent(component);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedComponent) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newComponent = {
      id: `${draggedComponent.id}-${Date.now()}`,
      type: draggedComponent.id,
      name: draggedComponent.name,
      props: { ...draggedComponent.defaultProps },
      position: { x, y },
      style: {}
    };

    setComponents([...components, newComponent]);
    setDraggedComponent(null);
    setSelectedComponent(newComponent);
  };
  //Component Handlers
  const handleComponentClick = (component, e) => {
    e.stopPropagation();
    setSelectedComponent(component);
  };

  const updateComponentProps = (componentId, newProps) => {
    setComponents(components.map(comp =>
      comp.id === componentId
        ? { ...comp, props: { ...comp.props, ...newProps } }
        : comp
    ));
    // Update selected component if it's the one being modified
    if (selectedComponent?.id === componentId) {
      setSelectedComponent({
        ...selectedComponent,
        props: { ...selectedComponent.props, ...newProps }
      });
    }
  };

  const deleteComponent = (componentId) => {
    if (!confirm('Delete this component?')) return;
    setComponents(components.filter(comp => comp.id !== componentId));
    setSelectedComponent(null);
  };

  const duplicateComponent = (component) => {
    const newComponent = {
      ...component,
      id: `${component.type}-${Date.now()}`,
      position: {
        x: component.position.x + 20,
        y: component.position.y + 20
      }
    };
    setComponents([...components, newComponent]);
    setSelectedComponent(newComponent);
  };

  const moveComponent = (componentId, direction) => {
    const step = 10;
    setComponents(components.map(comp => {
      if (comp.id === componentId) {
        const newPos = { ...comp.position };
        switch (direction) {
          case 'up': newPos.y -= step; break;
          case 'down': newPos.y += step; break;
          case 'left': newPos.x -= step; break;
          case 'right': newPos.x += step; break;
        }
        return { ...comp, position: newPos };
      }
      return comp;
    }));
    // Update selected component position
    if (selectedComponent?.id === componentId) {
      const comp = components.find(c => c.id === componentId);
      if (comp) {
        const newPos = { ...comp.position };
        switch (direction) {
          case 'up': newPos.y -= step; break;
          case 'down': newPos.y += step; break;
          case 'left': newPos.x -= step; break;
          case 'right': newPos.x += step; break;
        }
        setSelectedComponent({ ...selectedComponent, position: newPos });
      }
    }
  };
  //Pagwe Handlers
  const handlePageCreate = (newPage) => {
    const page = {
      id: `page-${Date.now()}`,
      name: newPage.name,
      path: newPage.path
    };
    setPages([...pages, page]);
    setSelectedPage(page);
  };

  const handlePageDelete = (pageId) => {
    if (pages.length <= 1) {
      alert('Cannot delete the last page');
      return;
    }
    const newPages = pages.filter(p => p.id !== pageId);
    setPages(newPages);
    if (selectedPage?.id === pageId) {
      setSelectedPage(newPages[0]);
    }
  };
  // frontend/src/components/ProjectEditor.jsx - Part 3 (Component Renderer)

  // This goes inside the ProjectEditor component

  const renderComponent = (component) => {
    const isSelected = selectedComponent?.id === component.id;
    const isHovered = hoveredComponent?.id === component.id;

    const componentStyle = {
      left: `${component.position.x}px`,
      top: `${component.position.y}px`,
      ...component.style
    };

    let content;
    const p = component.props;

    switch (component.type) {
      case 'button':
        content = (
          <button className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-sm ${p.variant === 'primary' ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20' :
              p.variant === 'secondary' ? 'bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300' :
                'bg-transparent border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'
            }`}>
            {p.text}
          </button>
        );
        break;

      case 'text':
        content = <p className={`text-${p.size || 'base'} text-gray-700 leading-relaxed`}>{p.content}</p>;
        break;

      case 'heading':
        const HeadingTag = `h${p.level || 1}`;
        content = <HeadingTag className="text-3xl font-bold text-gray-900 tracking-tight">{p.content}</HeadingTag>;
        break;

      case 'input':
        content = (
          <div className="space-y-2 w-full max-w-md">
            {p.label && <label className="block text-sm font-semibold text-gray-700">{p.label}</label>}
            <input
              type={p.type || 'text'}
              placeholder={p.placeholder}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
            />
          </div>
        );
        break;

      case 'textarea':
        content = (
          <div className="space-y-2 w-full max-w-md">
            {p.label && <label className="block text-sm font-semibold text-gray-700">{p.label}</label>}
            <textarea
              placeholder={p.placeholder}
              rows={p.rows || 4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none"
            />
          </div>
        );
        break;

      case 'card':
        content = (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 w-80 hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{p.title}</h3>
            <p className="text-gray-600 leading-relaxed">{p.content}</p>
          </div>
        );
        break;

      case 'image':
        content = p.src ? (
          <img src={p.src} alt={p.alt} style={{ width: p.width }} className="rounded-xl shadow-md" />
        ) : (
          <div className="w-64 h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-500 mt-2">No image</p>
            </div>
          </div>
        );
        break;

      case 'container':
        content = (
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl min-h-[120px] min-w-[300px] bg-gray-50/50"
            style={{ padding: p.padding, backgroundColor: p.backgroundColor }}
          >
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-400 text-sm font-medium">Drop components here</span>
            </div>
          </div>
        );
        break;

      case 'select':
        content = (
          <div className="space-y-2 w-full max-w-md">
            {p.label && <label className="block text-sm font-semibold text-gray-700">{p.label}</label>}
            <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-white">
              <option>Select an option</option>
              {(p.options || []).map((opt, i) => <option key={i}>{opt}</option>)}
            </select>
          </div>
        );
        break;

      default:
        content = (
          <div className="p-6 bg-white rounded-xl border-2 border-gray-200">
            <div className="text-4xl mb-2">{component.name.charAt(0)}</div>
            <p className="text-sm font-semibold text-gray-900">{component.name}</p>
          </div>
        );
    }

    const wrapperClasses = `absolute transition-all ${!previewMode ? 'cursor-move' : ''} ${isSelected && !previewMode ? 'ring-2 ring-indigo-500 ring-offset-2 rounded-xl' : ''
      } ${isHovered && !previewMode && !isSelected ? 'ring-2 ring-indigo-300 ring-offset-2 rounded-xl' : ''}`;

    return (
      <div
        key={component.id}
        className={wrapperClasses}
        style={componentStyle}
        onClick={(e) => handleComponentClick(component, e)}
        onMouseEnter={() => !previewMode && setHoveredComponent(component)}
        onMouseLeave={() => setHoveredComponent(null)}
      >
        {!previewMode && isSelected && (
          <div className="absolute -top-10 left-0 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 shadow-lg">
            <span>{component.name}</span>
            <div className="flex gap-1 ml-2 border-l border-indigo-400 pl-2">
              <button
                onClick={(e) => { e.stopPropagation(); duplicateComponent(component); }}
                className="hover:bg-indigo-700 px-1.5 rounded transition-colors"
                title="Duplicate"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteComponent(component.id); }}
                className="hover:bg-red-600 px-1.5 rounded transition-colors"
                title="Delete"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        )}
        {content}
      </div>
    );
  };
}