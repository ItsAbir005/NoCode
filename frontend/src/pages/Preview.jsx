// frontend/src/pages/Preview.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/client';

// Simple icons
const Eye = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const ArrowLeft = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

export default function Preview() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);
  const [canvas, setCanvas] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [componentStates, setComponentStates] = useState({});
  const [viewMode, setViewMode] = useState('desktop');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      const [canvasRes, workflowsRes] = await Promise.all([
        api.get(`/canvas/${projectId}`),
        api.get(`/projects/${projectId}/workflows`)
      ]);

      setCanvas(canvasRes.data.canvas);
      setWorkflows(workflowsRes.data);

      // Initialize component states (all visible by default)
      const initialStates = {};
      canvasRes.data.canvas?.layout?.nodes?.forEach(node => {
        initialStates[node.id] = {
          visible: true,
          value: '',
          disabled: false
        };
      });
      setComponentStates(initialStates);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load preview data:', error);
      alert('Failed to load preview');
      setLoading(false);
    }
  };

  const handleEvent = async (componentId, eventType) => {
    console.log('🎯 Event triggered:', componentId, eventType);

    const triggeredWorkflows = workflows.filter(
      w => w.trigger.componentId === componentId && w.trigger.event === eventType
    );

    console.log('⚡ Triggered workflows:', triggeredWorkflows.length);

    for (const workflow of triggeredWorkflows) {
      console.log('🔄 Executing workflow:', workflow.name);

      for (let i = 0; i < workflow.actions.length; i++) {
        const action = workflow.actions[i];

        // Execute action and check if we should continue
        const shouldContinue = await executeAction(action);

        // If validation failed or condition not met, stop workflow
        if (shouldContinue === false) {
          console.log('🛑 Workflow stopped at action', i + 1);
          break;
        }
      }
    }
  };

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const executeAction = async (action, skipCondition = false) => {
    console.log('✨ Executing action:', action.type);

    // Handle conditional logic
    if (action.type === 'conditional' && !skipCondition) {
      const componentState = componentStates[action.conditionComponent];
      const value = componentState?.value || '';
      let conditionMet = false;

      switch (action.operator) {
        case 'equals':
          conditionMet = value === action.compareValue;
          break;
        case 'notEquals':
          conditionMet = value !== action.compareValue;
          break;
        case 'contains':
          conditionMet = value.includes(action.compareValue);
          break;
        case 'isEmpty':
          conditionMet = value.trim() === '';
          break;
        case 'isNotEmpty':
          conditionMet = value.trim() !== '';
          break;
      }

      console.log('🔍 Condition check:', conditionMet);
      return conditionMet; // Return whether condition was met
    }

    switch (action.type) {
      case 'toggle_visibility':
        setComponentStates(prev => ({
          ...prev,
          [action.targetId]: {
            ...prev[action.targetId],
            visible: action.visible
          }
        }));
        console.log('👁️ Visibility:', action.targetId, '→', action.visible);
        break;

      case 'set_value':
        setComponentStates(prev => ({
          ...prev,
          [action.targetId]: {
            ...prev[action.targetId],
            value: action.value
          }
        }));
        console.log('📝 Set value:', action.targetId, '→', action.value);
        break;

      case 'api_call':
        try {
          console.log('🌐 API Call:', action.method, action.url);
          const options = {
            method: action.method || 'GET',
            headers: { 'Content-Type': 'application/json' }
          };

          if (action.body && (action.method === 'POST' || action.method === 'PUT')) {
            options.body = action.body;
          }

          const response = await fetch(action.url, options);
          const data = await response.json();

          console.log('✅ API Response:', data);

          // Save response to component if specified
          if (action.saveToComponent) {
            setComponentStates(prev => ({
              ...prev,
              [action.saveToComponent]: {
                ...prev[action.saveToComponent],
                value: JSON.stringify(data, null, 2)
              }
            }));
          }

          showToast('API call successful!', 'success');
        } catch (error) {
          console.error('❌ API Error:', error);
          showToast('API call failed: ' + error.message, 'error');
        }
        break;

      case 'validate_input':
        const inputState = componentStates[action.targetId];
        const inputValue = inputState?.value || '';
        let isValid = true;
        let errorMsg = action.errorMessage || 'Validation failed';

        switch (action.validationType) {
          case 'required':
            isValid = inputValue.trim() !== '';
            break;
          case 'email':
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue);
            errorMsg = action.errorMessage || 'Invalid email format';
            break;
          case 'minLength':
            isValid = inputValue.length >= (action.minLength || 1);
            errorMsg = action.errorMessage || `Minimum ${action.minLength} characters required`;
            break;
          case 'number':
            isValid = /^\d+$/.test(inputValue);
            errorMsg = action.errorMessage || 'Only numbers allowed';
            break;
          case 'regex':
            isValid = new RegExp(action.pattern).test(inputValue);
            break;
        }

        if (!isValid) {
          showToast(errorMsg, 'error');
          return false; // Stop workflow execution
        } else {
          showToast('Validation passed!', 'success');
        }
        break;

      case 'navigate':
        window.location.href = action.url;
        break;

      case 'alert':
        alert(action.message || 'Alert!');
        break;

      case 'show_toast':
        showToast(action.message, action.toastType || 'success');
        break;

      case 'save_storage':
        const saveValue = componentStates[action.sourceComponent]?.value || '';
        localStorage.setItem(action.storageKey, saveValue);
        console.log('💾 Saved to storage:', action.storageKey, '→', saveValue);
        showToast('Data saved!', 'success');
        break;

      case 'load_storage':
        const loadedValue = localStorage.getItem(action.storageKey) || '';
        setComponentStates(prev => ({
          ...prev,
          [action.targetComponent]: {
            ...prev[action.targetComponent],
            value: loadedValue
          }
        }));
        console.log('📂 Loaded from storage:', action.storageKey, '→', loadedValue);
        showToast('Data loaded!', 'info');
        break;

      case 'delay':
        console.log('⏱️ Waiting', action.delay, 'ms...');
        await new Promise(resolve => setTimeout(resolve, action.delay || 1000));
        break;

      default:
        console.warn('Unknown action:', action.type);
    }

    return true; // Continue workflow
  };

  const getViewportWidth = () => {
    switch (viewMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
      default: return '100%';
    }
  };

  const renderComponent = (node) => {
    const state = componentStates[node.id] || { visible: true, value: '' };

    // If component is hidden, don't render it
    if (!state.visible) {
      console.log('🚫 Component hidden:', node.id);
      return null;
    }

    const { type, props } = node.data;

    switch (type) {
      case 'Button':
        return (
          <button
            onClick={() => handleEvent(node.id, 'click')}
            className="px-6 py-3 rounded-lg font-semibold transition hover:shadow-lg hover:scale-105 active:scale-95"
            style={{
              backgroundColor: props.color || '#3B82F6',
              color: 'white',
              fontSize: props.size === 'large' ? '18px' : props.size === 'small' ? '14px' : '16px'
            }}
          >
            {props.text || 'Button'}
          </button>
        );

      case 'Input':
        return (
          <div className="mb-4">
            {props.label && (
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {props.label}
              </label>
            )}
            <input
              type={props.type || 'text'}
              placeholder={props.placeholder || 'Enter text...'}
              value={state.value || ''}
              onChange={(e) => {
                setComponentStates(prev => ({
                  ...prev,
                  [node.id]: { ...prev[node.id], value: e.target.value }
                }));
                handleEvent(node.id, 'change');
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        );

      case 'Text':
        return (
          <p style={{
            fontSize: (props.fontSize || '16') + 'px',
            color: props.color || '#000000',
            fontWeight: props.bold ? 'bold' : 'normal'
          }}>
            {props.content || 'Sample text'}
          </p>
        );

      case 'Image':
        return (
          <img
            src={props.url || 'https://via.placeholder.com/150'}
            alt={props.alt || 'Image'}
            className="max-w-full h-auto rounded-lg shadow-md"
          />
        );

      case 'Form':
        return (
          <div className="border-2 border-gray-300 rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              {props.title || 'Form'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleEvent(node.id, 'submit');
            }}>
              {props.fields?.map((field, idx) => (
                <div key={idx} className="mb-3">
                  <input
                    type="text"
                    placeholder={field}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              ))}
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              >
                Submit
              </button>
            </form>
          </div>
        );

      case 'Container':
        return (
          <div
            className="border-2 border-dashed border-gray-400 rounded-lg p-6"
            style={{
              width: props.width || '100%',
              minHeight: props.height || '100px',
              backgroundColor: props.background || '#F3F4F6'
            }}
          >
            <p className="text-gray-500 text-center">Container</p>
          </div>
        );

      default:
        return (
          <div className="p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
            <p className="text-gray-700">{type} Component</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toolbar */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/canvas/${projectId}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Editor
            </button>
            <div className="border-l pl-4">
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Eye className="w-6 h-6 text-blue-500" />
                Interactive Preview
              </h1>
              <p className="text-xs text-gray-500">
                {workflows.length} workflow{workflows.length !== 1 ? 's' : ''} active
              </p>
            </div>
          </div>

          {/* View Mode Selector */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('mobile')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${viewMode === 'mobile'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
                }`}
            >
              📱 Mobile
            </button>
            <button
              onClick={() => setViewMode('tablet')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${viewMode === 'tablet'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
                }`}
            >
              📱 Tablet
            </button>
            <button
              onClick={() => setViewMode('desktop')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${viewMode === 'desktop'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
                }`}
            >
              💻 Desktop
            </button>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex justify-center p-8">
        <div
          className="bg-white rounded-xl shadow-2xl p-8 transition-all duration-300"
          style={{
            width: getViewportWidth(),
            minHeight: '600px'
          }}
        >
          {canvas?.layout?.nodes?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No components on canvas yet</p>
              <p className="text-gray-400 text-sm">Go back to editor and add some components</p>
            </div>
          ) : (
            <div className="space-y-6">
              {canvas?.layout?.nodes?.map(node => (
                <div
                  key={node.id}
                  className="transition-all duration-300"
                >
                  {renderComponent(node)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-xs">
          <p className="font-bold mb-2">🐛 Debug Info</p>
          <p>Components: {canvas?.layout?.nodes?.length || 0}</p>
          <p>Workflows: {workflows.length}</p>
          <p>Hidden components: {Object.values(componentStates).filter(s => !s.visible).length}</p>
        </div>
      )}
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-6 py-4 rounded-lg shadow-lg text-white font-semibold animate-slide-in ${toast.type === 'success' ? 'bg-green-500' :
                toast.type === 'error' ? 'bg-red-500' :
                  toast.type === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
              }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>

  );
}