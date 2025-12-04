import { useState, useEffect } from 'react';

const ProjectEditor = ({ projectId }) => {
  const [project, setProject] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('components'); // components, pages, database, api, workflows
  const [rightTab, setRightTab] = useState('properties'); // properties, styles, events, bindings
  const [draggedComponent, setDraggedComponent] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [previewMode, setPreviewMode] = useState(false);
  const API_URL = 'http://localhost:8000';

  // Component Library
  const componentLibrary = [
    { id: 'button', name: 'Button', icon: '🔘', category: 'basic', defaultProps: { text: 'Click me', variant: 'primary' } },
    { id: 'text', name: 'Text', icon: '📝', category: 'basic', defaultProps: { content: 'Text content', size: 'md' } },
    { id: 'input', name: 'Input', icon: '📥', category: 'form', defaultProps: { placeholder: 'Enter text', type: 'text' } },
    { id: 'form', name: 'Form', icon: '📋', category: 'form', defaultProps: { method: 'POST' } },
    { id: 'image', name: 'Image', icon: '🖼️', category: 'media', defaultProps: { src: '', alt: 'Image' } },
    { id: 'container', name: 'Container', icon: '📦', category: 'layout', defaultProps: { padding: '20px' } },
    { id: 'grid', name: 'Grid', icon: '⊞', category: 'layout', defaultProps: { columns: 2, gap: '16px' } },
    { id: 'table', name: 'Table', icon: '📊', category: 'data', defaultProps: { columns: [] } },
    { id: 'list', name: 'List', icon: '📃', category: 'data', defaultProps: { items: [] } },
  ];

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch project');

      const data = await response.json();
      setProject(data.project);
      
      // Select first page if available
      if (data.project.pages && data.project.pages.length > 0) {
        setSelectedPage(data.project.pages[0]);
      } else {
        // Create default page if none exists
        const defaultPage = {
          id: `page-${Date.now()}`,
          name: 'Home',
          slug: '/',
          components: []
        };
        setProject(prev => ({ ...prev, pages: [defaultPage] }));
        setSelectedPage(defaultPage);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProject = async (updatedProject = project) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/projects/${projectId}/pages`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pages: updatedProject.pages })
      });

      if (!response.ok) throw new Error('Failed to save project');
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

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
    if (!draggedComponent || !selectedPage) return;

    const newComponent = {
      id: `${draggedComponent.id}-${Date.now()}`,
      type: draggedComponent.id,
      name: draggedComponent.name,
      props: { ...draggedComponent.defaultProps },
      style: {},
      position: {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY
      }
    };

    const updatedPages = project.pages.map(page => {
      if (page.id === selectedPage.id) {
        return {
          ...page,
          components: [...(page.components || []), newComponent]
        };
      }
      return page;
    });

    const updatedProject = { ...project, pages: updatedPages };
    setProject(updatedProject);
    setSelectedPage(updatedPages.find(p => p.id === selectedPage.id));
    saveProject(updatedProject);
    setDraggedComponent(null);
  };

  const handleComponentClick = (component) => {
    setSelectedComponent(component);
  };

  const updateComponentProps = (componentId, newProps) => {
    const updatedPages = project.pages.map(page => {
      if (page.id === selectedPage.id) {
        return {
          ...page,
          components: page.components.map(comp => 
            comp.id === componentId ? { ...comp, props: { ...comp.props, ...newProps } } : comp
          )
        };
      }
      return page;
    });

    const updatedProject = { ...project, pages: updatedPages };
    setProject(updatedProject);
    setSelectedPage(updatedPages.find(p => p.id === selectedPage.id));
    saveProject(updatedProject);
  };

  const deleteComponent = (componentId) => {
    const updatedPages = project.pages.map(page => {
      if (page.id === selectedPage.id) {
        return {
          ...page,
          components: page.components.filter(comp => comp.id !== componentId)
        };
      }
      return page;
    });

    const updatedProject = { ...project, pages: updatedPages };
    setProject(updatedProject);
    setSelectedPage(updatedPages.find(p => p.id === selectedPage.id));
    setSelectedComponent(null);
    saveProject(updatedProject);
  };

  const addNewPage = () => {
    const newPage = {
      id: `page-${Date.now()}`,
      name: `Page ${project.pages.length + 1}`,
      slug: `/page-${project.pages.length + 1}`,
      components: []
    };

    const updatedProject = { ...project, pages: [...project.pages, newPage] };
    setProject(updatedProject);
    setSelectedPage(newPage);
    saveProject(updatedProject);
  };

  const renderComponent = (component) => {
    const isSelected = selectedComponent?.id === component.id;
    const baseClasses = `relative border-2 ${isSelected ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'} rounded p-4 cursor-pointer hover:border-indigo-400 transition-colors`;

    switch (component.type) {
      case 'button':
        return (
          <div className={baseClasses} onClick={() => handleComponentClick(component)}>
            <button className={`px-4 py-2 rounded ${component.props.variant === 'primary' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
              {component.props.text}
            </button>
          </div>
        );
      case 'text':
        return (
          <div className={baseClasses} onClick={() => handleComponentClick(component)}>
            <p className={`text-${component.props.size}`}>{component.props.content}</p>
          </div>
        );
      case 'input':
        return (
          <div className={baseClasses} onClick={() => handleComponentClick(component)}>
            <input type={component.props.type} placeholder={component.props.placeholder} className="w-full px-3 py-2 border border-gray-300 rounded" />
          </div>
        );
      case 'container':
        return (
          <div className={baseClasses} style={{ padding: component.props.padding }} onClick={() => handleComponentClick(component)}>
            <div className="text-gray-500 text-sm">Container</div>
          </div>
        );
      default:
        return (
          <div className={baseClasses} onClick={() => handleComponentClick(component)}>
            <div className="text-gray-500">{component.name}</div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()} className="text-gray-600 hover:text-gray-900">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{project?.name || 'Untitled Project'}</h1>
            <p className="text-xs text-gray-500">Last saved: just now</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors">
            <svg className="h-5 w-5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Undo
          </button>
          <button className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors">
            <svg className="h-5 w-5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6-6m6 6l-6 6" />
            </svg>
            Redo
          </button>
          <button 
            onClick={() => setPreviewMode(!previewMode)}
            className="px-4 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            <svg className="h-5 w-5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {previewMode ? 'Edit' : 'Preview'}
          </button>
          <button className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
            <svg className="h-5 w-5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Publish
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {['components', 'pages', 'database', 'api', 'workflows'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-3 py-2 text-xs font-medium ${
                  activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'components' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Basic Components</h3>
                {componentLibrary.filter(c => c.category === 'basic').map(component => (
                  <div
                    key={component.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, component)}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-2xl">{component.icon}</span>
                    <span className="text-sm font-medium text-gray-900">{component.name}</span>
                  </div>
                ))}

                <h3 className="text-sm font-semibold text-gray-900 mb-3 mt-6">Form Components</h3>
                {componentLibrary.filter(c => c.category === 'form').map(component => (
                  <div
                    key={component.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, component)}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-2xl">{component.icon}</span>
                    <span className="text-sm font-medium text-gray-900">{component.name}</span>
                  </div>
                ))}

                <h3 className="text-sm font-semibold text-gray-900 mb-3 mt-6">Layout Components</h3>
                {componentLibrary.filter(c => c.category === 'layout').map(component => (
                  <div
                    key={component.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, component)}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-2xl">{component.icon}</span>
                    <span className="text-sm font-medium text-gray-900">{component.name}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'pages' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Pages</h3>
                  <button onClick={addNewPage} className="text-indigo-600 hover:text-indigo-700">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                {project?.pages?.map(page => (
                  <div
                    key={page.id}
                    onClick={() => setSelectedPage(page)}
                    className={`p-3 rounded-lg cursor-pointer ${
                      selectedPage?.id === page.id ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{page.name}</p>
                        <p className="text-xs text-gray-500">{page.slug}</p>
                      </div>
                      <span className="text-xs text-gray-500">{page.components?.length || 0} components</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'database' && (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">Database schema builder coming soon</p>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">API integrations coming soon</p>
              </div>
            )}

            {activeTab === 'workflows' && (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">Workflow builder coming soon</p>
              </div>
            )}
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 bg-gray-100 overflow-auto">
          <div className="p-8">
            <div 
              className="bg-white rounded-lg shadow-lg min-h-[600px] p-8"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {!selectedPage?.components?.length ? (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <div className="text-center">
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Start building your page</h3>
                    <p className="mt-2 text-sm text-gray-500">Drag components from the left sidebar to add them to your page</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedPage.components.map(component => (
                    <div key={component.id}>
                      {renderComponent(component)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {['properties', 'styles', 'events', 'bindings'].map(tab => (
              <button
                key={tab}
                onClick={() => setRightTab(tab)}
                className={`flex-1 px-3 py-2 text-xs font-medium ${
                  rightTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {!selectedComponent ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <p className="mt-4 text-sm text-gray-500">Select a component to edit its properties</p>
              </div>
            ) : (
              <>
                {rightTab === 'properties' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">{selectedComponent.name}</h3>
                      <p className="text-xs text-gray-500 mb-4">ID: {selectedComponent.id}</p>
                    </div>

                    {Object.entries(selectedComponent.props).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateComponentProps(selectedComponent.id, { [key]: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        />
                      </div>
                    ))}

                    <button
                      onClick={() => deleteComponent(selectedComponent.id)}
                      className="w-full mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete Component
                    </button>
                  </div>
                )}

                {rightTab === 'styles' && (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">Style editor coming soon</p>
                  </div>
                )}

                {rightTab === 'events' && (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">Event handlers coming soon</p>
                  </div>
                )}

                {rightTab === 'bindings' && (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">Data bindings coming soon</p>
                  </div>
                )}
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ProjectEditor;