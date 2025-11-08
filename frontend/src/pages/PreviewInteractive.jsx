import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/client';

export default function PreviewInteractive() {
  const { projectId } = useParams();
  const [canvas, setCanvas] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [componentStates, setComponentStates] = useState({});

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    const [canvasRes, workflowsRes] = await Promise.all([
      api.get(`/canvas/${projectId}`),
      api.get(`/projects/${projectId}/workflows`)
    ]);
    
    setCanvas(canvasRes.data.canvas);
    setWorkflows(workflowsRes.data);

    // Initialize component visibility
    const initialStates = {};
    canvasRes.data.canvas?.layout?.nodes?.forEach(node => {
      initialStates[node.id] = { visible: true, value: '' };
    });
    setComponentStates(initialStates);
  };

  const handleEvent = (componentId, eventType) => {
    // Find workflows triggered by this event
    const triggeredWorkflows = workflows.filter(
      w => w.trigger.componentId === componentId && w.trigger.event === eventType
    );

    // Execute each workflow's actions
    triggeredWorkflows.forEach(workflow => {
      workflow.actions.forEach(action => {
        executeAction(action);
      });
    });
  };

  const executeAction = (action) => {
    switch (action.type) {
      case 'toggle_visibility':
        setComponentStates(prev => ({
          ...prev,
          [action.targetId]: {
            ...prev[action.targetId],
            visible: action.visible
          }
        }));
        break;

      case 'set_value':
        setComponentStates(prev => ({
          ...prev,
          [action.targetId]: {
            ...prev[action.targetId],
            value: action.value
          }
        }));
        break;

      case 'navigate':
        window.location.href = action.url;
        break;

      case 'api_call':
        // Call API (implement based on your needs)
        console.log('API Call:', action);
        break;

      default:
        console.warn('Unknown action type:', action.type);
    }
  };

  const renderComponent = (node) => {
    const state = componentStates[node.id] || { visible: true };
    
    if (!state.visible) return null;

    const { type, props } = node.data;
    
    switch(type) {
      case 'Button':
        return (
          <button 
            onClick={() => handleEvent(node.id, 'click')}
            className="px-6 py-3 rounded-lg font-semibold transition hover:shadow-lg"
            style={{ backgroundColor: props.color }}
          >
            {props.text}
          </button>
        );
        
      case 'Input':
        return (
          <div className="mb-4">
            {props.label && (
              <label className="block text-sm font-medium mb-2">{props.label}</label>
            )}
            <input 
              type={props.type}
              placeholder={props.placeholder}
              value={state.value || ''}
              onChange={(e) => {
                setComponentStates(prev => ({
                  ...prev,
                  [node.id]: { ...prev[node.id], value: e.target.value }
                }));
                handleEvent(node.id, 'change');
              }}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
        
      case 'Text':
        return (
          <p style={{ 
            fontSize: props.fontSize + 'px', 
            color: props.color 
          }}>
            {props.content}
          </p>
        );
        
      default:
        return <div className="p-4 border rounded">{type}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Interactive Preview</h1>
        
        {canvas?.layout?.nodes?.map(node => (
          <div key={node.id} className="mb-6">
            {renderComponent(node)}
          </div>
        ))}
      </div>
    </div>
  );
}