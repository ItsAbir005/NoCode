import { useState, useEffect } from 'react';
import { X, Maximize2, Minimize2, Monitor, Smartphone, Tablet, AlertCircle, CheckCircle } from 'lucide-react';

export function PreviewMode({ components, projectName, workflows = [], pages = [], onClose }) {
  const [viewport, setViewport] = useState('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [componentStates, setComponentStates] = useState({});
  const [currentPage, setCurrentPage] = useState(pages[0]?.id || 'home');
  const [formData, setFormData] = useState({});
  const [notifications, setNotifications] = useState([]);

  const viewportSizes = {
    desktop: { width: '100%', height: '100%', icon: Monitor },
    tablet: { width: '768px', height: '1024px', icon: Tablet },
    mobile: { width: '375px', height: '667px', icon: Smartphone },
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const initialStates = {};
    components.forEach(comp => {
      initialStates[comp.id] = {
        visible: true,
        value: '',
        checked: comp.checked || false,
        disabled: false,
        loading: false,
        error: null
      };
    });
    setComponentStates(initialStates);

    executeWorkflowsByTrigger('load');

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const handleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const executeWorkflow = (workflow, eventData = {}) => {
    console.log('🔥 Executing workflow:', workflow.name, 'with data:', eventData);
    
    if (!workflow.actions || workflow.actions.length === 0) {
      console.log('No actions in workflow');
      return;
    }

    workflow.actions.forEach((action, index) => {
      setTimeout(() => {
        executeAction(action, eventData);
      }, index * 100);
    });
  };

  const executeAction = (action, eventData = {}) => {
    console.log('⚡ Executing action:', action.type, action);

    switch (action.type) {
      case 'show':
        if (action.target) {
          setComponentStates(prev => ({
            ...prev,
            [action.target]: { ...prev[action.target], visible: true }
          }));
          showNotification(`Showing component`, 'success');
        }
        break;

      case 'hide':
        if (action.target) {
          setComponentStates(prev => ({
            ...prev,
            [action.target]: { ...prev[action.target], visible: false }
          }));
          showNotification(`Hiding component`, 'success');
        }
        break;

      case 'setValue':
        if (action.target && action.params?.value !== undefined) {
          setComponentStates(prev => ({
            ...prev,
            [action.target]: { ...prev[action.target], value: action.params.value }
          }));
          setFormData(prev => ({
            ...prev,
            [action.target]: action.params.value
          }));
          showNotification(`Value updated`, 'success');
        }
        break;

      case 'navigate':
        if (action.params?.path) {
          const targetPage = pages.find(p => p.path === action.params.path);
          if (targetPage) {
            setCurrentPage(targetPage.id);
            showNotification(`Navigated to ${targetPage.name}`, 'success');
          } else {
            showNotification(`Navigation: ${action.params.path}`, 'info');
          }
        }
        break;

      case 'alert':
        if (action.params?.message) {
          showNotification(action.params.message, 'info');
        }
        break;

      case 'validate':
        if (action.target) {
          const component = components.find(c => c.id === action.target);
          const state = componentStates[action.target];
          if (component && state) {
            const value = state.value || formData[action.target];
            if (!value || value.trim() === '') {
              setComponentStates(prev => ({
                ...prev,
                [action.target]: { 
                  ...prev[action.target], 
                  error: `${component.placeholder || 'Field'} is required` 
                }
              }));
              showNotification(`Validation failed: ${component.placeholder || 'Field'} is required`, 'error');
            } else {
              setComponentStates(prev => ({
                ...prev,
                [action.target]: { ...prev[action.target], error: null }
              }));
              showNotification(`Validation passed!`, 'success');
            }
          }
        }
        break;

      case 'submitForm':
        // Validate all form fields first
        let hasErrors = false;
        const formComponents = components.filter(c => c.type === 'Input');
        
        formComponents.forEach(comp => {
          const value = componentStates[comp.id]?.value || formData[comp.id];
          if (!value || value.trim() === '') {
            hasErrors = true;
            setComponentStates(prev => ({
              ...prev,
              [comp.id]: { 
                ...prev[comp.id], 
                error: `${comp.placeholder || 'Field'} is required` 
              }
            }));
          }
        });

        if (!hasErrors) {
          showNotification('Form submitted successfully! ✓', 'success');
          console.log('Form data:', formData);
          
          // Reset form
          setFormData({});
          const resetStates = {};
          formComponents.forEach(comp => {
            resetStates[comp.id] = { ...componentStates[comp.id], value: '', error: null };
          });
          setComponentStates(prev => ({ ...prev, ...resetStates }));
        } else {
          showNotification('Please fill all required fields', 'error');
        }
        break;

      case 'clearForm':
        setFormData({});
        const clearedStates = {};
        components.filter(c => c.type === 'Input').forEach(comp => {
          clearedStates[comp.id] = { ...componentStates[comp.id], value: '', error: null };
        });
        setComponentStates(prev => ({ ...prev, ...clearedStates }));
        showNotification('Form cleared', 'info');
        break;

      case 'toggleComponent':
        if (action.target) {
          setComponentStates(prev => ({
            ...prev,
            [action.target]: { 
              ...prev[action.target], 
              visible: !prev[action.target]?.visible 
            }
          }));
        }
        break;

      case 'setLoading':
        if (action.target) {
          setComponentStates(prev => ({
            ...prev,
            [action.target]: { 
              ...prev[action.target], 
              loading: action.params?.loading ?? true 
            }
          }));
        }
        break;

      case 'disable':
        if (action.target) {
          setComponentStates(prev => ({
            ...prev,
            [action.target]: { ...prev[action.target], disabled: true }
          }));
        }
        break;

      case 'enable':
        if (action.target) {
          setComponentStates(prev => ({
            ...prev,
            [action.target]: { ...prev[action.target], disabled: false }
          }));
        }
        break;

      default:
        console.log('Unknown action type:', action.type);
    }
  };

  const executeWorkflowsByTrigger = (triggerType, componentId = null, eventData = {}) => {
    const matchingWorkflows = workflows.filter(workflow => {
      if (workflow.trigger.type !== triggerType) return false;
      if (triggerType === 'load') return true;
      return workflow.trigger.componentId === componentId;
    });

    console.log(`🔍 Found ${matchingWorkflows.length} workflows for trigger:`, triggerType, componentId);
    matchingWorkflows.forEach(workflow => {
      executeWorkflow(workflow, eventData);
    });
  };

  const handleComponentClick = (component) => {
    console.log('👆 Component clicked:', component.id, component.type);
    executeWorkflowsByTrigger('click', component.id, { component });
  };

  const handleComponentSubmit = (component) => {
    console.log('📤 Form submitted:', component.id);
    executeWorkflowsByTrigger('submit', component.id, { formData });
  };

  const handleInputChange = (componentId, value) => {
    setComponentStates(prev => ({
      ...prev,
      [componentId]: { ...prev[componentId], value, error: null }
    }));
    setFormData(prev => ({
      ...prev,
      [componentId]: value
    }));
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

    const hasError = state.error;
    const isLoading = state.loading;
    const isDisabled = state.disabled;

    switch (component.type) {
      case 'Button':
        return (
          <button
            key={component.id}
            style={{
              ...style,
              backgroundColor: isLoading ? '#9ca3af' : component.color,
              color: component.textColor,
              borderRadius: '6px',
              border: 'none',
              fontSize: component.fontSize,
              fontWeight: 500,
              cursor: isDisabled || isLoading ? 'not-allowed' : 'pointer',
              opacity: isDisabled ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onClick={() => !isDisabled && !isLoading && handleComponentClick(component)}
            disabled={isDisabled || isLoading}
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            )}
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
            {state.value || component.text}
          </div>
        );

      case 'Input':
        return (
          <div key={component.id} style={style}>
            <input
              placeholder={component.placeholder}
              value={state.value}
              onChange={(e) => handleInputChange(component.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleComponentSubmit(component);
                }
              }}
              disabled={isDisabled}
              style={{
                width: '100%',
                height: '100%',
                padding: '8px',
                border: hasError ? '2px solid #ef4444' : `1px solid ${component.borderColor}`,
                borderRadius: '6px',
                backgroundColor: component.backgroundColor,
                fontSize: 14,
                outline: 'none',
              }}
            />
            {hasError && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                fontSize: '12px',
                color: '#ef4444'
              }}>
                {state.error}
              </div>
            )}
          </div>
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
          <div key={component.id} style={style} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={state.checked}
              onChange={(e) => {
                setComponentStates(prev => ({
                  ...prev,
                  [component.id]: { ...prev[component.id], checked: e.target.checked }
                }));
                handleComponentClick(component);
              }}
              disabled={isDisabled}
              style={{
                width: '20px',
                height: '20px',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
              }}
            />
            {component.label && (
              <span style={{ fontSize: '14px', color: '#374151' }}>{component.label}</span>
            )}
          </div>
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
              handleComponentClick(component);
            }}
            disabled={isDisabled}
            style={{
              ...style,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
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
            onClick={() => handleComponentClick(component)}
          >
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              {component.title || 'Card Title'}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              {component.content || 'Card content goes here'}
            </div>
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
            onClick={() => handleComponentClick(component)}
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
          <h2 className="text-white font-semibold">{projectName} - Live Preview</h2>
          
          {workflows && workflows.length > 0 && (
            <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              {workflows.length} workflow{workflows.length !== 1 ? 's' : ''} active
            </span>
          )}
          
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

      {/* Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right duration-300 ${
              notif.type === 'error' ? 'bg-red-600 text-white' :
              notif.type === 'success' ? 'bg-green-600 text-white' :
              'bg-blue-600 text-white'
            }`}
          >
            {notif.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notif.type === 'error' && <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{notif.message}</span>
          </div>
        ))}
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
        <span>{components.length} components • {workflows?.length || 0} workflows • {Object.keys(formData).length} form fields</span>
        <span>
          {viewportSizes[viewport].width} × {viewportSizes[viewport].height}
        </span>
      </div>
    </div>
  );
}