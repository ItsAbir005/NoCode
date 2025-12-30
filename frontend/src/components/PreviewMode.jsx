import { useState, useEffect } from 'react';
import { X, Maximize2, Minimize2, Monitor, Smartphone, Tablet } from 'lucide-react';

export function PreviewMode({ components, projectName, workflows = [], pages = [], onClose }) {
  const [viewport, setViewport] = useState('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [componentStates, setComponentStates] = useState({});

  const viewportSizes = {
    desktop: { width: '100%', height: '100%', icon: Monitor },
    tablet: { width: '768px', height: '1024px', icon: Tablet },
    mobile: { width: '375px', height: '667px', icon: Smartphone },
  };

  useEffect(() => {
    // Prevent scrolling on body when preview is open
    document.body.style.overflow = 'hidden';
    
    // Initialize component states
    const initialStates = {};
    components.forEach(comp => {
      initialStates[comp.id] = {
        visible: true,
        value: '',
        checked: comp.checked || false
      };
    });
    setComponentStates(initialStates);

    // Execute 'load' workflows
    executeWorkflowsByTrigger('load');

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const executeWorkflow = (workflow) => {
    console.log('Executing workflow:', workflow.name);
    
    if (!workflow.actions || workflow.actions.length === 0) {
      console.log('No actions in workflow');
      return;
    }

    workflow.actions.forEach((action, index) => {
      setTimeout(() => {
        executeAction(action);
      }, index * 100); // Stagger actions by 100ms
    });
  };

  const executeAction = (action) => {
    console.log('Executing action:', action);

    switch (action.type) {
      case 'show':
        if (action.target) {
          setComponentStates(prev => ({
            ...prev,
            [action.target]: { ...prev[action.target], visible: true }
          }));
        }
        break;

      case 'hide':
        if (action.target) {
          setComponentStates(prev => ({
            ...prev,
            [action.target]: { ...prev[action.target], visible: false }
          }));
        }
        break;

      case 'setValue':
        if (action.target && action.params?.value !== undefined) {
          setComponentStates(prev => ({
            ...prev,
            [action.target]: { ...prev[action.target], value: action.params.value }
          }));
        }
        break;

      case 'navigate':
        if (action.params?.path) {
          alert(`Navigation to: ${action.params.path}`);
        }
        break;

      case 'alert':
        if (action.params?.message) {
          alert(action.params.message);
        }
        break;

      case 'validate':
        if (action.target) {
          const component = components.find(c => c.id === action.target);
          const state = componentStates[action.target];
          if (component && state) {
            if (!state.value || state.value.trim() === '') {
              alert(`Validation failed: ${component.placeholder || 'Field'} is required`);
            } else {
              alert('Validation passed!');
            }
          }
        }
        break;

      default:
        console.log('Unknown action type:', action.type);
    }
  };

  const executeWorkflowsByTrigger = (triggerType, componentId = null) => {
    const matchingWorkflows = workflows.filter(workflow => {
      if (workflow.trigger.type !== triggerType) return false;
      if (triggerType === 'load') return true;
      return workflow.trigger.componentId === componentId;
    });

    matchingWorkflows.forEach(workflow => {
      executeWorkflow(workflow);
    });
  };

  const handleComponentClick = (componentId) => {
    executeWorkflowsByTrigger('click', componentId);
  };

  const handleComponentSubmit = (componentId) => {
    executeWorkflowsByTrigger('submit', componentId);
  };

  const renderComponent = (component) => {
    const state = componentStates[component.id];
    if (!state || !state.visible) return null;

    const style = {
      position: 'absolute',
      left: component.x,
      top: component.y,
      width: component.width,
      height: component.height,
    };

    switch (component.type) {
      case 'Button':
        return (
          <button
            key={component.id}
            style={{
              ...style,
              backgroundColor: component.color,
              color: component.textColor,
              borderRadius: '6px',
              border: 'none',
              fontSize: component.fontSize,
              fontWeight: 500,
              cursor: 'pointer',
            }}
            onClick={() => {
              handleComponentClick(component.id);
              alert(`Button "${component.text}" clicked!`);
            }}
          >
            {component.text}
          </button>
        );

      case 'Text':
        return (
          <div
            key={component.id}
            style={{
              ...style,
              fontSize: component.fontSize,
              color: component.color,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {component.text}
          </div>
        );

      case 'Input':
        return (
          <input
            key={component.id}
            placeholder={component.placeholder}
            value={state.value}
            onChange={(e) => {
              setComponentStates(prev => ({
                ...prev,
                [component.id]: { ...prev[component.id], value: e.target.value }
              }));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleComponentSubmit(component.id);
              }
            }}
            style={{
              ...style,
              padding: '8px',
              border: `1px solid ${component.borderColor}`,
              borderRadius: '6px',
              backgroundColor: component.backgroundColor,
              fontSize: 14,
            }}
          />
        );

      case 'Container':
        return (
          <div
            key={component.id}
            style={{
              ...style,
              backgroundColor: component.backgroundColor,
              border: component.border,
              borderRadius: component.borderRadius || 0,
            }}
          />
        );

      case 'Image':
        return (
          <div
            key={component.id}
            style={{
              ...style,
              backgroundColor: component.bg,
              backgroundImage: component.src ? `url(${component.src})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '4px',
            }}
          />
        );

      case 'Checkbox':
        return (
          <input
            key={component.id}
            type="checkbox"
            checked={state.checked}
            onChange={(e) => {
              setComponentStates(prev => ({
                ...prev,
                [component.id]: { ...prev[component.id], checked: e.target.checked }
              }));
              handleComponentClick(component.id);
            }}
            style={{
              ...style,
              cursor: 'pointer',
            }}
          />
        );

      case 'Radio':
        return (
          <input
            key={component.id}
            type="radio"
            checked={state.checked}
            onChange={(e) => {
              setComponentStates(prev => ({
                ...prev,
                [component.id]: { ...prev[component.id], checked: e.target.checked }
              }));
              handleComponentClick(component.id);
            }}
            style={{
              ...style,
              cursor: 'pointer',
            }}
          />
        );

      case 'Divider':
        return (
          <div
            key={component.id}
            style={{
              ...style,
              backgroundColor: component.bg,
            }}
          />
        );

      case 'Card':
        return (
          <div
            key={component.id}
            style={{
              ...style,
              backgroundColor: component.bg,
              border: component.border,
              borderRadius: component.borderRadius || 8,
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              {component.title || 'Card Title'}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              {component.content || 'Card content goes here'}
            </div>
          </div>
        );

      case 'Table':
        return (
          <div
            key={component.id}
            style={{
              ...style,
              backgroundColor: component.backgroundColor,
              border: component.border,
              overflow: 'auto',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Email</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map(i => (
                  <tr key={i}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>User {i}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>user{i}@example.com</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>Active</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'List':
        return (
          <div
            key={component.id}
            style={{
              ...style,
              backgroundColor: component.bg,
              border: component.border,
              overflow: 'auto',
              padding: '8px',
            }}
          >
            {['Item 1', 'Item 2', 'Item 3', 'Item 4'].map((item, i) => (
              <div
                key={i}
                style={{
                  padding: '12px',
                  borderBottom: i < 3 ? '1px solid #e5e7eb' : 'none',
                  fontSize: '14px',
                }}
              >
                {item}
              </div>
            ))}
          </div>
        );

      case 'Alert':
        return (
          <div
            key={component.id}
            style={{
              ...style,
              backgroundColor: component.backgroundColor,
              border: component.border,
              borderRadius: component.borderRadius || 8,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              fontSize: '14px',
            }}
          >
            {component.text}
          </div>
        );

      case 'Navbar':
        return (
          <div
            key={component.id}
            style={{
              ...style,
              backgroundColor: component.backgroundColor,
              color: component.color,
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              fontSize: '16px',
              fontWeight: 600,
            }}
          >
            Navigation Bar
          </div>
        );

      default:
        return (
          <div
            key={component.id}
            style={{
              ...style,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              border: component.border,
              backgroundColor: component.bg || component.backgroundColor,
              borderRadius: component.borderRadius || 0,
            }}
          >
            {component.type}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="h-14 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h2 className="text-white font-semibold">{projectName} - Preview</h2>
          
          {/* Workflow Indicator */}
          {workflows && workflows.length > 0 && (
            <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              {workflows.length} workflow{workflows.length !== 1 ? 's' : ''} active
            </span>
          )}
          
          {/* Viewport Selector */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            {Object.entries(viewportSizes).map(([key, { icon: Icon }]) => (
              <button
                key={key}
                onClick={() => setViewport(key)}
                className={`px-3 py-1.5 rounded flex items-center gap-2 transition-colors ${
                  viewport === key
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm capitalize">{key}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFullscreen}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div
          className="bg-white shadow-2xl transition-all duration-300 ease-in-out"
          style={{
            width: viewportSizes[viewport].width,
            height: viewportSizes[viewport].height,
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        >
          <div
            className="relative w-full h-full overflow-auto"
            style={{
              width: viewport === 'desktop' ? '1024px' : viewportSizes[viewport].width,
              height: viewport === 'desktop' ? '600px' : viewportSizes[viewport].height,
              margin: '0 auto',
            }}
          >
            {components.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No components to preview</p>
                </div>
              </div>
            ) : (
              components.map(renderComponent)
            )}
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="h-10 bg-gray-900 border-t border-gray-700 flex items-center justify-between px-4 text-sm text-gray-400">
        <span>{components.length} components • {workflows?.length || 0} workflows</span>
        <span>
          {viewportSizes[viewport].width} × {viewportSizes[viewport].height}
        </span>
      </div>
    </div>
  );
}