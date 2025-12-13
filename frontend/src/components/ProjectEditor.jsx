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
  const [allPageComponents, setAllPageComponents] = useState({});
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [draggedComponent, setDraggedComponent] = useState(null);
  const [hoveredComponent, setHoveredComponent] = useState(null);
  // Canvas dragging state (for arranging components)
  const [isDraggingOnCanvas, setIsDraggingOnCanvas] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggedCanvasComponent, setDraggedCanvasComponent] = useState(null);
  // View controls
  const [zoom, setZoom] = useState(100);
  const [previewMode, setPreviewMode] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  // Pages state
  const [pages, setPages] = useState([
    { id: 'page-1', name: 'Home', path: '/' },
  ]);
  const [selectedPage, setSelectedPage] = useState(pages[0]);

  // Workflows state
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  const canvasRef = useRef(null);
  const isLoadingPageRef = useRef(false);

  useEffect(() => {
    if (selectedPage) {
      isLoadingPageRef.current = true;
      setComponents(allPageComponents[selectedPage.id] || []);
      setSelectedComponent(null);
      Promise.resolve().then(() => {
        isLoadingPageRef.current = false;
      });
    }
  }, [selectedPage]);

  useEffect(() => {
    if (selectedPage && !isLoadingPageRef.current) {
      setAllPageComponents(prev => ({
        ...prev,
        [selectedPage.id]: components
      }));
    }
  }, [components, selectedPage]);

  // Load project data
  useEffect(() => {
    fetchProject();
  }, [projectId]);
  useEffect(() => {
    if (selectedPage && previewMode) {
      const pageLoadWorkflows = workflows.filter(
        w => w.trigger?.type === 'load' && w.enabled !== false
      );
      pageLoadWorkflows.forEach(workflow => {
        setTimeout(() => {
          executeWorkflow(workflow.id, null, 'load');
        }, 100);
      });
    }
  }, [selectedPage, previewMode, workflows]);

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

      if (data.project.pages && Array.isArray(data.project.pages) && data.project.pages.length > 0) {
        setPages(data.project.pages);
        const initialPage = data.project.pages[0];
        setSelectedPage(initialPage);
        if (data.project.components) {
          setAllPageComponents(data.project.components);
          if (data.project.components[initialPage.id]) {
            setComponents(data.project.components[initialPage.id]);
          }
        }
      }
      if (data.project.workflows) {
        setWorkflows(data.project.workflows);
      } else {
        setWorkflows([]);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      alert('Failed to load project');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
  if (!loading && project) {
    const autoSaveTimer = setTimeout(() => {
      saveProject();
    }, 2000);

    return () => clearTimeout(autoSaveTimer);
  }
}, [components.length, pages.length, workflows.length, selectedPage?.id]);

  // Save project data
  const saveProject = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const updatedComponents = {
        ...allPageComponents,
        [selectedPage.id]: components
      };

      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pages: pages,
          components: updatedComponents, // Send all pages
          workflows: workflows
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save project');
      }

      // Update local state
      setAllPageComponents(updatedComponents);

      setTimeout(() => setSaving(false), 1000);
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project: ' + error.message);
      setSaving(false);
    }
  };

  // Drag from Components Panel
  const handleDragStart = (e, component) => {
    setDraggedComponent(component);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', JSON.stringify(component));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedComponent && !e.dataTransfer.getData('text/plain')) return;

    let componentToDrop = draggedComponent;
    if (!componentToDrop) {
      try {
        componentToDrop = JSON.parse(e.dataTransfer.getData('text/plain'));
      } catch (err) {
        console.error('Failed to parse dragged component', err);
        return;
      }
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (zoom / 100);
    const y = (e.clientY - rect.top) / (zoom / 100);

    const newComponent = {
      id: `${componentToDrop.id}-${Date.now()}`,
      type: componentToDrop.id,
      name: componentToDrop.name,
      props: { ...componentToDrop.defaultProps },
      position: { x, y },
      style: {},
    };

    setComponents([...components, newComponent]);
    setDraggedComponent(null);
    setSelectedComponent(newComponent);
  };

  const handleCanvasComponentMouseDown = (e, component) => {
    if (previewMode) return;
    e.stopPropagation();

    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = (e.clientX - rect.left) / (zoom / 100) - component.position.x;
    const offsetY = (e.clientY - rect.top) / (zoom / 100) - component.position.y;

    setDragOffset({ x: offsetX, y: offsetY });
    setDraggedCanvasComponent(component);
    setIsDraggingOnCanvas(true);
    setSelectedComponent(component);
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDraggingOnCanvas || !draggedCanvasComponent) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (zoom / 100) - dragOffset.x;
    const y = (e.clientY - rect.top) / (zoom / 100) - dragOffset.y;

    const snapToGrid = (value) => showGrid ? Math.round(value / 20) * 20 : value;

    const newX = Math.max(0, snapToGrid(x));
    const newY = Math.max(0, snapToGrid(y));

    setComponents(prevComponents => prevComponents.map(comp =>
      comp.id === draggedCanvasComponent.id
        ? { ...comp, position: { x: newX, y: newY } }
        : comp
    ));

    setSelectedComponent(prev => ({
      ...prev,
      position: { x: newX, y: newY }
    }));
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingOnCanvas(false);
    setDraggedCanvasComponent(null);
  };

  useEffect(() => {
    if (isDraggingOnCanvas) {
      document.addEventListener('mousemove', handleCanvasMouseMove);
      document.addEventListener('mouseup', handleCanvasMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleCanvasMouseMove);
        document.removeEventListener('mouseup', handleCanvasMouseUp);
      };
    }
  }, [isDraggingOnCanvas, draggedCanvasComponent, dragOffset, zoom, showGrid, components]);

  // Component Handlers
  const handleComponentClick = (component, e) => {
    e.stopPropagation();
    if (!isDraggingOnCanvas) {
      setSelectedComponent(component);
    }
  };

  const updateComponentProps = (componentId, newProps) => {
    setComponents(prevComponents => prevComponents.map(comp =>
      comp.id === componentId
        ? { ...comp, props: { ...comp.props, ...newProps } }
        : comp
    ));
    if (selectedComponent?.id === componentId) {
      setSelectedComponent(prev => ({
        ...prev,
        props: { ...prev.props, ...newProps }
      }));
    }
  };

  const deleteComponent = (componentId) => {
    if (!confirm('Delete this component?')) return;
    setComponents(prevComponents =>
      prevComponents.filter(comp => comp.id !== componentId)
    );
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
    const newAllPageComponents = { ...allPageComponents };
    delete newAllPageComponents[pageId];
    setAllPageComponents(newAllPageComponents);

    if (selectedPage?.id === pageId) {
      setSelectedPage(newPages[0]);
    }
  };

  const handlePageSelect = (page) => {
    setSelectedPage(page);
    setComponents(project?.components?.[page.id] || []);
    setSelectedComponent(null);
  };

  // Workflow Handlers
  const handleWorkflowCreate = (workflow) => {
    const newWorkflow = {
      id: `workflow-${Date.now()}`,
      name: workflow.name,
      trigger: workflow.trigger,
      actions: workflow.actions || [],
      enabled: true,
      createdAt: new Date().toISOString()
    };
    setWorkflows(prevWorkflows => {
      const workflowsArray = Array.isArray(prevWorkflows) ? prevWorkflows : [];
      return [...workflowsArray, newWorkflow];
    });
    setSelectedWorkflow(newWorkflow);
  };

  const handleWorkflowUpdate = (workflowId, updates) => {
    setWorkflows(prevWorkflows => prevWorkflows.map(w =>
      w.id === workflowId ? { ...w, ...updates } : w
    ));
    if (selectedWorkflow?.id === workflowId) {
      setSelectedWorkflow(prev => ({ ...prev, ...updates }));
    }
  };

  const handleWorkflowDelete = (workflowId) => {
    if (!confirm('Delete this workflow?')) return;
    setWorkflows(prevWorkflows => prevWorkflows.filter(w => w.id !== workflowId));
    if (selectedWorkflow?.id === workflowId) {
      setSelectedWorkflow(null);
    }
  };

  const handleWorkflowSelect = (workflow) => {
    setSelectedWorkflow(workflow);
  };

  const attachWorkflowToComponent = (componentId, workflowId, eventType) => {
  };
  const executeWorkflow = async (workflowId, componentId, eventType) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    console.log(`Executing workflow: ${workflow.name}`);
    if (workflow.nodes && workflow.connections) {
      await executeNodeWorkflow(workflow, componentId);
    }
    else if (workflow.actions) {
      for (const action of workflow.actions) {
        try {
          await executeAction(action, componentId);
        } catch (error) {
          console.error(`Error executing action ${action.name}:`, error);
          alert(`Workflow error: ${error.message}`);
          break;
        }
      }
    }
  };
  const executeNodeWorkflow = async (workflow, componentId) => {
    const { nodes, connections } = workflow;
    const triggerNode = nodes.find(n => n.type === 'trigger');
    if (!triggerNode) return;
    const executionOrder = [];
    let currentNodeId = triggerNode.id;
    const visited = new Set();

    while (currentNodeId && !visited.has(currentNodeId)) {
      visited.add(currentNodeId);
      const node = nodes.find(n => n.id === currentNodeId);

      if (node && node.type === 'action') {
        executionOrder.push(node);
      }
      const nextConnection = connections.find(c => c.from === currentNodeId);
      currentNodeId = nextConnection?.to;
    }
    for (const node of executionOrder) {
      try {
        await executeAction(node.data, componentId);
      } catch (error) {
        console.error(`Error executing node ${node.id}:`, error);
        alert(`Workflow error: ${error.message}`);
        break;
      }
    }
  };

  const executeAction = async (action, triggerComponentId) => {
    console.log(`Executing action: ${action.name}`, action);

    switch (action.type) {
      case 'navigate':
        if (action.config.url) {
          const page = pages.find(p => p.path === action.config.url);
          if (page) {
            setSelectedPage(page);
            alert(`Navigating to: ${action.config.url}`);
          } else {
            alert(`Page not found: ${action.config.url}`);
          }
        }
        break;

      case 'show_hide':
        if (action.config.componentId) {
          setComponents(prevComponents => prevComponents.map(comp => {
            if (comp.id === action.config.componentId) {
              const currentDisplay = comp.style?.display || 'block';
              let newDisplay;

              if (action.config.action === 'show') {
                newDisplay = 'block';
              } else if (action.config.action === 'hide') {
                newDisplay = 'none';
              } else { // toggle
                newDisplay = currentDisplay === 'none' ? 'block' : 'none';
              }

              return {
                ...comp,
                style: { ...comp.style, display: newDisplay }
              };
            }
            return comp;
          }));
        }
        break;

      case 'api_call':
        if (action.config.endpoint) {
          try {
            const options = {
              method: action.config.method || 'GET',
              headers: {
                'Content-Type': 'application/json',
              }
            };

            if (action.config.body && (action.config.method === 'POST' || action.config.method === 'PUT')) {
              options.body = action.config.body;
            }

            const response = await fetch(action.config.endpoint, options);
            const data = await response.json();

            console.log('API Response:', data);
            alert(`API call successful: ${action.config.method} ${action.config.endpoint}`);
          } catch (error) {
            console.error('API call failed:', error);
            alert(`API call failed: ${error.message}`);
          }
        }
        break;

      case 'set_value':
        if (action.config.componentId && action.config.value !== undefined) {
          setComponents(prevComponents => prevComponents.map(comp => {
            if (comp.id === action.config.componentId) {
              return {
                ...comp,
                props: {
                  ...comp.props,
                  value: action.config.value,
                  content: action.config.value
                }
              };
            }
            return comp;
          }));
        }
        break;

      case 'show_message':
        if (action.config.message) {
          const messageType = action.config.type || 'info';
          const emoji = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
          }[messageType];

          alert(`${emoji} ${action.config.message}`);
        }
        break;

      case 'validate':
        const componentIds = action.config.componentIds || [];
        let isValid = true;
        let invalidComponents = [];

        for (const compId of componentIds) {
          const comp = components.find(c => c.id === compId);
          if (comp && ['input', 'textarea'].includes(comp.type)) {
            const value = comp.props.value || '';
            if (!value.trim()) {
              isValid = false;
              invalidComponents.push(comp.name);
            }
          }
        }

        if (!isValid) {
          throw new Error(`Validation failed: ${invalidComponents.join(', ')} are required`);
        }
        break;

      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  };

  const getComponentEventHandlers = (component) => {
    if (previewMode) {
      const componentWorkflows = workflows.filter(w =>
        w.trigger?.componentId === component.id && w.enabled !== false
      );

      const handlers = {};

      componentWorkflows.forEach(workflow => {
        const eventName = {
          'click': 'onClick',
          'submit': 'onSubmit',
          'change': 'onChange',
          'hover': 'onMouseEnter',
          'load': null
        }[workflow.trigger.type];

        if (eventName) {
          handlers[eventName] = (e) => {
            e.preventDefault();
            e.stopPropagation();
            executeWorkflow(workflow.id, component.id, workflow.trigger.type);
          };
        }
      });

      return handlers;
    }
    return {};
  };

  // Component Renderer
  const renderComponent = (component) => {
    const isSelected = selectedComponent?.id === component.id;
    const isHovered = hoveredComponent?.id === component.id;
    const isBeingDragged = draggedCanvasComponent?.id === component.id;
    const attachedWorkflows = Array.isArray(workflows)
      ? workflows.filter(w => w.trigger?.componentId === component.id)
      : [];

    const componentStyle = {
      left: `${component.position.x}px`,
      top: `${component.position.y}px`,
      ...component.style,
      cursor: previewMode ? 'default' : 'move',
      opacity: isBeingDragged ? 0.5 : 1,
      display: component.style?.display || 'block'
    };

    // Get event handlers for workflows
    const eventHandlers = getComponentEventHandlers(component);

    let content;
    const p = component.props;

    switch (component.type) {
      case 'button':
        content = (
          <button
            className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-sm ${p.variant === 'primary' ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20' :
              p.variant === 'secondary' ? 'bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300' :
                'bg-transparent border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'
              }`}
            {...eventHandlers}
          >
            {p.text}
          </button>
        );
        break;

      case 'text':
        content = (
          <p
            className={`text-${p.size || 'base'} text-gray-700 leading-relaxed`}
            {...eventHandlers}
          >
            {p.content || p.value}
          </p>
        );
        break;

      case 'heading':
        const HeadingTag = `h${p.level || 1}`;
        content = (
          <HeadingTag
            className="text-3xl font-bold text-gray-900 tracking-tight"
            {...eventHandlers}
          >
            {p.content}
          </HeadingTag>
        );
        break;

      case 'input':
        content = (
          <div className="space-y-2 w-full max-w-md">
            {p.label && <label className="block text-sm font-semibold text-gray-700">{p.label}</label>}
            <input
              type={p.type || 'text'}
              placeholder={p.placeholder}
              value={p.value || ''}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
              {...eventHandlers}
              readOnly={!previewMode}
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
              value={p.value || ''}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none"
              {...eventHandlers}
              readOnly={!previewMode}
            />
          </div>
        );
        break;

      case 'card':
        content = (
          <div
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 w-80 hover:shadow-xl transition-shadow"
            {...eventHandlers}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">{p.title}</h3>
            <p className="text-gray-600 leading-relaxed">{p.content}</p>
          </div>
        );
        break;

      case 'image':
        content = p.src ? (
          <img
            src={p.src}
            alt={p.alt}
            style={{ width: p.width }}
            className="rounded-xl shadow-md"
            {...eventHandlers}
          />
        ) : (
          <div
            className="w-64 h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300"
            {...eventHandlers}
          >
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
            {...eventHandlers}
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
            <select
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-white"
              {...eventHandlers}
              disabled={!previewMode}
            >
              <option>Select an option</option>
              {(p.options || []).map((opt, i) => <option key={i}>{opt}</option>)}
            </select>
          </div>
        );
        break;

      default:
        content = (
          <div
            className="p-6 bg-white rounded-xl border-2 border-gray-200"
            {...eventHandlers}
          >
            <div className="text-4xl mb-2">{component.name.charAt(0)}</div>
            <p className="text-sm font-semibold text-gray-900">{component.name}</p>
          </div>
        );
    }

    const wrapperClasses = `absolute transition-all select-none ${isSelected && !previewMode ? 'ring-2 ring-indigo-500 ring-offset-2 rounded-xl' : ''
      } ${isHovered && !previewMode && !isSelected ? 'ring-2 ring-indigo-300 ring-offset-2 rounded-xl' : ''}`;

    return (
      <div
        key={component.id}
        className={wrapperClasses}
        style={componentStyle}
        onClick={(e) => handleComponentClick(component, e)}
        onMouseDown={(e) => handleCanvasComponentMouseDown(e, component)}
        onMouseEnter={() => !previewMode && setHoveredComponent(component)}
        onMouseLeave={() => setHoveredComponent(null)}
      >
        {!previewMode && isSelected && (
          <div className="absolute -top-10 left-0 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 shadow-lg z-10">
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

        {!previewMode && attachedWorkflows.length > 0 && (
          <div className="absolute -top-2 -right-2 bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg" title={`${attachedWorkflows.length} workflow(s) attached`}>
            {attachedWorkflows.length}
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
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showGrid ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Grid
          </button>

          {/* Preview Toggle */}
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${previewMode ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {previewMode ? 'Edit' : 'Preview'}
          </button>
          {previewMode && (
            <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Preview Mode - Workflows Active
            </div>
          )}

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
            {leftTab === 'workflows' && (
              <WorkflowsPanel
                workflows={workflows}
                selectedWorkflow={selectedWorkflow}
                components={components}
                onWorkflowCreate={handleWorkflowCreate}
                onWorkflowUpdate={handleWorkflowUpdate}
                onWorkflowDelete={handleWorkflowDelete}
                onWorkflowSelect={handleWorkflowSelect}
                onAttachToComponent={attachWorkflowToComponent}
              />
            )}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7h-6V5zM4 12h6v7a1 1 0 01-1 1H5a1 1 0 01-1-1v-7zm10-7h4a1 1 0 011 1v7h-6V5a1 1 0 011-1zm0 7h6v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
                  </svg>
                  <p className="mt-4 text-gray-400">Drag components here to get started</p>
                </div>
              </div>
            )}
            {components.map(component => renderComponent(component))}
          </div>
        </div>
        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200">
          <PropertiesPanel
            component={selectedComponent}
            onUpdateProps={updateComponentProps}
            onDelete={deleteComponent}
            onDuplicate={duplicateComponent}
            onMove={moveComponent}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;