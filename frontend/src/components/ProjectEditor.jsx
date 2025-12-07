// frontend/src/components/ProjectEditor.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import all sidebar panel components
import LeftSidebarTabs from './editor/LeftSidebarTabs';
import ComponentsPanel from './editor/ComponentsPanel';
import PagesPanel from './editor/PagesPanel';
import DatabasePanel from './editor/DatabasePanel';
import APIPanel from './editor/APIPanel';
import WorkflowsPanel from './editor/WorkflowsPanel';
import PropertiesPanel from './editor/PropertiesPanel';

const ProjectEditor = ({ projectId }) => {
  const navigate = useNavigate();
  const API_URL = 'http://localhost:8000';

  // Project state
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
  ]);
  const [selectedPage, setSelectedPage] = useState(pages[0]);

  const canvasRef = useRef(null);

  // Load project data
  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }

      const data = await response.json();
      setProject(data.project);
      
      // Load pages if they exist
      if (data.project.pages && Array.isArray(data.project.pages) && data.project.pages.length > 0) {
        setPages(data.project.pages);
        setSelectedPage(data.project.pages[0]);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      alert('Failed to load project');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const saveProject = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pages: pages,
          components: { [selectedPage.id]: components }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save project');
      }

      // Show success message briefly
      setTimeout(() => setSaving(false), 1000);
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project');
      setSaving(false);
    }
  };

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

  // Component Handlers
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

  // Page Handlers
  const handlePageCreate = (newPage) => {
    const page = {
      id: `page-${Date.now()}`,
      name: newPage.name,
      path: newPage.path
    };
    setPages([...pages, page]);
    setSelectedPage(page);
    setComponents([]);
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
      setComponents([]);
    }
  };

  const handlePageSelect = (page) => {
    setSelectedPage(page);
    setComponents([]);
    setSelectedComponent(null);
  };

  // Component Renderer
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
          <button className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-sm ${
            p.variant === 'primary' ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20' :
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

    const wrapperClasses = `absolute transition-all ${!previewMode ? 'cursor-move' : ''} ${
      isSelected && !previewMode ? 'ring-2 ring-indigo-500 ring-offset-2 rounded-xl' : ''
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to Dashboard"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{project?.name}</h1>
            <p className="text-xs text-gray-500">Editing: {selectedPage?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-1 hover:bg-gray-200 rounded">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="p-1 hover:bg-gray-200 rounded">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showGrid ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Grid
          </button>

          {/* Preview Toggle */}
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              previewMode ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {previewMode ? 'Edit' : 'Preview'}
          </button>

          {/* Save Button */}
          <button
            onClick={saveProject}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save
              </>
            )}
          </button>
        </div>
      </nav>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <LeftSidebarTabs activeTab={leftTab} onTabChange={setLeftTab} />
          
          <div className="flex-1 overflow-hidden">
            {leftTab === 'components' && <ComponentsPanel onDragStart={handleDragStart} />}
            {leftTab === 'pages' && (
              <PagesPanel
                pages={pages}
                selectedPage={selectedPage}
                onPageSelect={handlePageSelect}
                onPageCreate={handlePageCreate}
                onPageDelete={handlePageDelete}
              />
            )}
            {leftTab === 'database' && <DatabasePanel />}
            {leftTab === 'api' && <APIPanel />}
            {leftTab === 'workflows' && <WorkflowsPanel />}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          <div
            ref={canvasRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => setSelectedComponent(null)}
            className="bg-white rounded-xl shadow-lg min-h-[800px] relative"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
              backgroundImage: showGrid ? 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)' : 'none',
              backgroundSize: showGrid ? '20px 20px' : 'auto',
            }}
          >
            {components.length === 0 && !previewMode && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">Start Building</h3>
                  <p className="mt-2 text-sm text-gray-500">Drag components from the left panel onto the canvas</p>
                </div>
              </div>
            )}

            {components.map(renderComponent)}
          </div>
        </div>

        {/* Right Sidebar (Properties Panel) */}
        <div className="w-80 bg-white border-l border-gray-200">
          <PropertiesPanel
            selectedComponent={selectedComponent}
            onUpdateProps={updateComponentProps}
            onMove={moveComponent}
            onDuplicate={duplicateComponent}
            onDelete={deleteComponent}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;