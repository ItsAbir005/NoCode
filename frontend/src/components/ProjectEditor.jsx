import { useState, useEffect, useRef } from 'react';

// Component Library with more comprehensive options
const componentLibrary = [
  // Basic Components
  { id: 'button', name: 'Button', icon: '🔘', category: 'basic', 
    defaultProps: { text: 'Click me', variant: 'primary', size: 'md' } },
  { id: 'text', name: 'Text', icon: '📝', category: 'basic', 
    defaultProps: { content: 'Text content', size: 'base' } },
  { id: 'heading', name: 'Heading', icon: '🔤', category: 'basic', 
    defaultProps: { content: 'Heading', level: 1 } },
  { id: 'image', name: 'Image', icon: '🖼️', category: 'basic', 
    defaultProps: { src: '', alt: 'Image', width: '200px' } },
  { id: 'link', name: 'Link', icon: '🔗', category: 'basic', 
    defaultProps: { text: 'Link', href: '#' } },
  { id: 'divider', name: 'Divider', icon: '➖', category: 'basic', 
    defaultProps: { color: '#e5e7eb' } },
  
  // Form Components
  { id: 'input', name: 'Input', icon: '📥', category: 'form', 
    defaultProps: { placeholder: 'Enter text', type: 'text', label: 'Input' } },
  { id: 'textarea', name: 'Textarea', icon: '📄', category: 'form', 
    defaultProps: { placeholder: 'Enter text', rows: 4, label: 'Textarea' } },
  { id: 'select', name: 'Select', icon: '🔽', category: 'form', 
    defaultProps: { options: ['Option 1', 'Option 2'], label: 'Select' } },
  { id: 'checkbox', name: 'Checkbox', icon: '☑️', category: 'form', 
    defaultProps: { label: 'Checkbox', checked: false } },
  { id: 'radio', name: 'Radio', icon: '🔘', category: 'form', 
    defaultProps: { options: ['Option 1', 'Option 2'], label: 'Radio' } },
  { id: 'form', name: 'Form', icon: '📋', category: 'form', 
    defaultProps: { submitText: 'Submit' } },
  
  // Layout Components
  { id: 'container', name: 'Container', icon: '📦', category: 'layout', 
    defaultProps: { padding: '24px', backgroundColor: 'transparent' } },
  { id: 'grid', name: 'Grid', icon: '⊞', category: 'layout', 
    defaultProps: { columns: 2, gap: '16px' } },
  { id: 'flexbox', name: 'Flexbox', icon: '↔️', category: 'layout', 
    defaultProps: { direction: 'row', gap: '16px' } },
  { id: 'card', name: 'Card', icon: '🃏', category: 'layout', 
    defaultProps: { title: 'Card Title', content: 'Card content' } },
  { id: 'spacer', name: 'Spacer', icon: '⬜', category: 'layout', 
    defaultProps: { height: '20px' } },
  
  // Data Components
  { id: 'table', name: 'Table', icon: '📊', category: 'data', 
    defaultProps: { columns: ['Col 1', 'Col 2', 'Col 3'] } },
  { id: 'list', name: 'List', icon: '📃', category: 'data', 
    defaultProps: { items: ['Item 1', 'Item 2', 'Item 3'] } },
  { id: 'badge', name: 'Badge', icon: '🏷️', category: 'data', 
    defaultProps: { text: 'Badge', color: 'blue' } },
  { id: 'alert', name: 'Alert', icon: '⚠️', category: 'data', 
    defaultProps: { title: 'Alert', message: 'Message', type: 'info' } },
];

// Left sidebar tabs
const leftTabs = [
  { id: 'components', name: 'Components', icon: '🧩' },
  { id: 'pages', name: 'Pages', icon: '📄' },
  { id: 'database', name: 'Database', icon: '🗄️' },
  { id: 'api', name: 'API', icon: '🔌' },
  { id: 'workflows', name: 'Workflows', icon: '⚡' },
];

const EnhancedProjectEditor = () => {
  const [leftTab, setLeftTab] = useState('components');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [draggedComponent, setDraggedComponent] = useState(null);
  const [hoveredComponent, setHoveredComponent] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [previewMode, setPreviewMode] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [pages, setPages] = useState([
    { id: 'page-1', name: 'Home', path: '/' },
    { id: 'page-2', name: 'About', path: '/about' }
  ]);
  const [selectedPage, setSelectedPage] = useState(pages[0]);
  const canvasRef = useRef(null);

  // Filter components
  const filteredComponents = componentLibrary.filter(comp => {
    const categoryMatch = selectedCategory === 'all' || comp.category === selectedCategory;
    const searchMatch = comp.name.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

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
  };

  const handleComponentClick = (component, e) => {
    e.stopPropagation();
    setSelectedComponent(component);
  };

  const updateComponentProps = (componentId, newProps) => {
    setComponents(components.map(comp => 
      comp.id === componentId ? { ...comp, props: { ...comp.props, ...newProps } } : comp
    ));
  };

  const deleteComponent = (componentId) => {
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
  };

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

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-900">Project Editor</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="px-2 py-1 text-sm hover:bg-white rounded transition-colors"
            >
              −
            </button>
            <span className="px-3 text-sm font-medium">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              className="px-2 py-1 text-sm hover:bg-white rounded transition-colors"
            >
              +
            </button>
          </div>
          
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              showGrid ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Grid
          </button>
          
          <button 
            onClick={() => setPreviewMode(!previewMode)}
            className="px-4 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            {previewMode ? 'Edit' : 'Preview'}
          </button>
          
          <button className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
            Publish
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Multi-purpose Panel */}
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            {leftTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setLeftTab(tab.id)}
                className={`flex-1 px-3 py-3 text-xs font-medium transition-colors ${
                  leftTab === tab.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                title={tab.name}
              >
                <span className="text-base">{tab.icon}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {leftTab === 'components' && (
              <div className="flex flex-col h-full">
                {/* Search */}
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search components..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                    <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex gap-1 p-3 border-b border-gray-200 overflow-x-auto">
                  {['all', 'basic', 'form', 'layout', 'data'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Component List */}
                <div className="flex-1 p-3">
                  <div className="space-y-1.5">
                    {filteredComponents.map(component => (
                      <div
                        key={component.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, component)}
                        className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-indigo-50 rounded-lg cursor-move transition-all group border border-transparent hover:border-indigo-200"
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform">{component.icon}</span>
                        <span className="text-sm font-medium text-gray-900">{component.name}</span>
                      </div>
                    ))}
                  </div>
                  
                  {filteredComponents.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-sm text-gray-500">No components found</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {leftTab === 'pages' && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">Pages</h3>
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-2">
                  {pages.map(page => (
                    <div
                      key={page.id}
                      onClick={() => setSelectedPage(page)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedPage?.id === page.id
                          ? 'bg-indigo-50 border-2 border-indigo-200'
                          : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{page.name}</p>
                          <p className="text-xs text-gray-500">{page.path}</p>
                        </div>
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {leftTab === 'database' && (
              <div className="p-4 text-center">
                <div className="py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                  <p className="mt-4 text-sm font-medium text-gray-900">Database Schema</p>
                  <p className="mt-1 text-xs text-gray-500">Define your data models</p>
                  <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                    Create Table
                  </button>
                </div>
              </div>
            )}

            {leftTab === 'api' && (
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">API Settings</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Base URL</p>
                    <input 
                      type="text" 
                      placeholder="https://api.example.com"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Endpoints</p>
                    <button className="w-full px-3 py-2 bg-white border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                      + Add Endpoint
                    </button>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Authentication</p>
                    <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                      <option>None</option>
                      <option>API Key</option>
                      <option>Bearer Token</option>
                      <option>OAuth 2.0</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {leftTab === 'workflows' && (
              <div className="p-4 text-center">
                <div className="py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="mt-4 text-sm font-medium text-gray-900">Workflows</p>
                  <p className="mt-1 text-xs text-gray-500">Automate your processes</p>
                  <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                    Create Workflow
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="p-8">
            <div 
              ref={canvasRef}
              className="bg-white rounded-2xl shadow-2xl relative min-h-[900px] border border-gray-200"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top left',
                backgroundImage: showGrid 
                  ? 'linear-gradient(to right, #f3f4f6 1px, transparent 1px), linear-gradient(to bottom, #f3f4f6 1px, transparent 1px)' 
                  : 'none',
                backgroundSize: showGrid ? '24px 24px' : 'auto'
              }}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => setSelectedComponent(null)}
            >
              {components.length === 0 && !previewMode && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-4">
                      <svg className="w-10 h-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Start Building</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Drag and drop components from the left panel to start designing your application
                    </p>
                  </div>
                </div>
              )}

              <div className="relative">
                {components.map(renderComponent)}
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Properties Panel */}
        <aside className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-bold text-gray-900">Properties</h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            {!selectedComponent ? (
              <div className="flex items-center justify-center h-full px-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">No Selection</p>
                  <p className="text-xs text-gray-500">Select a component to edit properties</p>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-6">
                {/* Component Info */}
                <div className="pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-xl">
                      {selectedComponent.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{selectedComponent.name}</h4>
                      <p className="text-xs text-gray-500">ID: {selectedComponent.id.slice(-8)}</p>
                    </div>
                  </div>
                </div>

                {/* Position Controls */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Position</h5>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-3 gap-2">
                      <div></div>
                      <button 
                        onClick={() => moveComponent(selectedComponent.id, 'up')}
                        className="p-2 bg-white border-2 border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all active:scale-95"
                      >
                        <svg className="w-4 h-4 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <div></div>
                      <button 
                        onClick={() => moveComponent(selectedComponent.id, 'left')}
                        className="p-2 bg-white border-2 border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all active:scale-95"
                      >
                        <svg className="w-4 h-4 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div className="flex items-center justify-center">
                        <div className="text-xs font-semibold text-gray-500">Move</div>
                      </div>
                      <button 
                        onClick={() => moveComponent(selectedComponent.id, 'right')}
                        className="p-2 bg-white border-2 border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all active:scale-95"
                      >
                        <svg className="w-4 h-4 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <div></div>
                      <button 
                        onClick={() => moveComponent(selectedComponent.id, 'down')}
                        className="p-2 bg-white border-2 border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all active:scale-95"
                      >
                        <svg className="w-4 h-4 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">X:</span>
                        <span className="ml-1 font-semibold text-gray-900">{Math.round(selectedComponent.position.x)}px</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Y:</span>
                        <span className="ml-1 font-semibold text-gray-900">{Math.round(selectedComponent.position.y)}px</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Properties */}
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Properties</h5>
                  {Object.entries(selectedComponent.props).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      </label>
                      {typeof value === 'boolean' ? (
                        <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => updateComponentProps(selectedComponent.id, { [key]: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700 font-medium">
                            {value ? 'Enabled' : 'Disabled'}
                          </span>
                        </label>
                      ) : Array.isArray(value) ? (
                        <textarea
                          value={value.join('\n')}
                          onChange={(e) => updateComponentProps(selectedComponent.id, { [key]: e.target.value.split('\n') })}
                          rows={3}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                          placeholder="One item per line"
                        />
                      ) : (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateComponentProps(selectedComponent.id, { [key]: e.target.value })}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="pt-6 border-t border-gray-200 space-y-2">
                  <button
                    onClick={() => duplicateComponent(selectedComponent)}
                    className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Duplicate
                  </button>
                  <button
                    onClick={() => deleteComponent(selectedComponent.id)}
                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EnhancedProjectEditor;