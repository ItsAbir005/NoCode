
// frontend/src/components/editor/WorkflowsPanel.jsx
import { useState, useMemo, useRef, useEffect } from 'react';

const WorkflowsPanel = ({
  workflows = [],
  selectedWorkflow,
  components = [],
  onWorkflowCreate,
  onWorkflowUpdate,
  onWorkflowDelete,
  onWorkflowSelect,
  onAttachToComponent
}) => {
  // State management
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    trigger: { type: 'click', componentId: '' },
    actions: []
  });
  const [newAction, setNewAction] = useState({ type: '', config: {} });

  // Node-based workflow states
  const [selectedNode, setSelectedNode] = useState(null);
  const [draggingNode, setDraggingNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [tempConnection, setTempConnection] = useState(null);
  const canvasRef = useRef(null);

  const safeWorkflows = useMemo(() => {
    if (!workflows) return [];
    if (Array.isArray(workflows)) return workflows;
    return [];
  }, [workflows]);

  const triggerTypes = [
    { id: 'click', name: 'On Click', icon: '🖱️' },
    { id: 'submit', name: 'On Submit', icon: '✅' },
    { id: 'change', name: 'On Change', icon: '🔄' },
    { id: 'load', name: 'On Page Load', icon: '⚡' },
    { id: 'hover', name: 'On Hover', icon: '👆' },
  ];

  const actionTypes = [
    {
      id: 'navigate',
      name: 'Navigate to Page',
      icon: '🔗',
      config: { url: '' }
    },
    {
      id: 'show_hide',
      name: 'Show/Hide Component',
      icon: '👁️',
      config: { componentId: '', action: 'show' }
    },
    {
      id: 'api_call',
      name: 'Call API',
      icon: '🌐',
      config: { endpoint: '', method: 'GET', body: '' }
    },
    {
      id: 'set_value',
      name: 'Set Component Value',
      icon: '📝',
      config: { componentId: '', value: '' }
    },
    {
      id: 'show_message',
      name: 'Show Message',
      icon: '💬',
      config: { message: '', type: 'info' }
    },
    {
      id: 'validate',
      name: 'Validate Form',
      icon: '✓',
      config: { componentIds: [] }
    },
    {
      id: 'get_input_value',
      name: 'Get Input Value',
      icon: '📥',
      config: { componentId: '', variableName: '' }
    }
  ];

  // Initialize trigger node when workflow is selected
  useEffect(() => {
    if (selectedWorkflow && (!selectedWorkflow.nodes || selectedWorkflow.nodes.length === 0)) {
      const triggerNode = {
        id: 'trigger-node',
        type: 'trigger',
        position: { x: 50, y: 50 },
        data: selectedWorkflow.trigger
      };

      onWorkflowUpdate(selectedWorkflow.id, {
        nodes: [triggerNode],
        connections: []
      });
    }
  }, [selectedWorkflow]);

  // Helper functions
  const getComponentName = (componentId) => {
    const component = components.find(c => c.id === componentId);
    return component ? `${component.name} (${component.id.slice(-6)})` : 'Unknown Component';
  };

  // Node dragging handlers
  const handleNodeMouseDown = (e, node) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - node.position.x,
      y: e.clientY - rect.top - node.position.y
    });
    setDraggingNode(node);
  };

  const handleCanvasMouseMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();

    // Handle node dragging
    if (draggingNode) {
      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top - dragOffset.y;

      const updatedNodes = selectedWorkflow.nodes.map(n =>
        n.id === draggingNode.id ? { ...n, position: { x, y } } : n
      );

      onWorkflowUpdate(selectedWorkflow.id, { nodes: updatedNodes });
    }

    // Handle connection drawing
    if (connectingFrom) {
      setTempConnection({
        x1: connectingFrom.x,
        y1: connectingFrom.y,
        x2: e.clientX - rect.left,
        y2: e.clientY - rect.top
      });
    }
  };

  const handleCanvasMouseUp = (e) => {
    if (connectingFrom) {
      const nodes = selectedWorkflow.nodes || [];
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const target = nodes.find(n => {
        if (n.type === 'trigger' || n.id === connectingFrom.nodeId) return false;
        return (
          mouseX >= n.position.x - 10 &&
          mouseX <= n.position.x + 10 &&
          mouseY >= n.position.y + 30 &&
          mouseY <= n.position.y + 50
        );
      });

      if (target) {
        const newConnection = { from: connectingFrom.nodeId, to: target.id };
        const connections = selectedWorkflow.connections || [];
        onWorkflowUpdate(selectedWorkflow.id, {
          connections: [...connections, newConnection]
        });
      }
    }

    setDraggingNode(null);
    setConnectingFrom(null);
    setTempConnection(null);
  };

  const handleConnectionStart = (e, node) => {
    e.stopPropagation();
    setConnectingFrom({
      nodeId: node.id,
      x: node.position.x + 180,
      y: node.position.y + 40
    });
  };

  const handleCreateWorkflow = () => {
    if (!newWorkflow.name.trim()) {
      alert('Workflow name is required');
      return;
    }
    onWorkflowCreate(newWorkflow);
    setNewWorkflow({ name: '', trigger: { type: 'click', componentId: '' }, actions: [] });
    setShowCreateModal(false);
  };

  const handleUpdateActionConfig = (actionId, config) => {
    const updatedWorkflow = {
      ...selectedWorkflow,
      actions: selectedWorkflow.actions.map(a =>
        a.id === actionId ? { ...a, config: { ...a.config, ...config } } : a
      )
    };
    onWorkflowUpdate(selectedWorkflow.id, updatedWorkflow);
  };

  const renderActionConfig = (action) => {
    switch (action.type) {
      case 'navigate':
        return (
          <input
            type="text"
            placeholder="/about"
            value={action.config.url || ''}
            onChange={(e) => handleUpdateActionConfig(action.id, { url: e.target.value })}
            className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        );

      case 'show_hide':
        return (
          <div className="space-y-2">
            <select
              value={action.config.componentId || ''}
              onChange={(e) => handleUpdateActionConfig(action.id, { componentId: e.target.value })}
              className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Component</option>
              {components.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.id.slice(-6)})</option>
              ))}
            </select>
            <select
              value={action.config.action || 'show'}
              onChange={(e) => handleUpdateActionConfig(action.id, { action: e.target.value })}
              className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="show">Show</option>
              <option value="hide">Hide</option>
              <option value="toggle">Toggle</option>
            </select>
          </div>
        );

      case 'api_call':
        return (
          <div className="space-y-2">
            <select
              value={action.config.method || 'GET'}
              onChange={(e) => handleUpdateActionConfig(action.id, { method: e.target.value })}
              className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
            <input
              type="text"
              placeholder="https://api.example.com/endpoint"
              value={action.config.endpoint || ''}
              onChange={(e) => handleUpdateActionConfig(action.id, { endpoint: e.target.value })}
              className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            {(action.config.method === 'POST' || action.config.method === 'PUT') && (
              <textarea
                placeholder='{"key": "value"}'
                value={action.config.body || ''}
                onChange={(e) => handleUpdateActionConfig(action.id, { body: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
              />
            )}
          </div>
        );

      case 'set_value':
        return (
          <div className="space-y-2">
            <select
              value={action.config.componentId || ''}
              onChange={(e) => handleUpdateActionConfig(action.id, { componentId: e.target.value })}
              className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Component</option>
              {components.filter(c => ['input', 'textarea', 'select'].includes(c.type)).map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.id.slice(-6)})</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="New value"
              value={action.config.value || ''}
              onChange={(e) => handleUpdateActionConfig(action.id, { value: e.target.value })}
              className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        );

      case 'show_message':
        return (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Your message here"
              value={action.config.message || ''}
              onChange={(e) => handleUpdateActionConfig(action.id, { message: e.target.value })}
              className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <select
              value={action.config.type || 'info'}
              onChange={(e) => handleUpdateActionConfig(action.id, { type: e.target.value })}
              className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        );

      default:
        return <p className="text-xs text-gray-500">No configuration needed</p>;
    }
  };

  // Sub-components
  const WorkflowNode = ({ node, isSelected, onMouseDown, onConnectionStart, onSelect }) => {
    const actionType = actionTypes.find(a => a.id === node.data?.type);

    return (
      <div
        style={{
          position: 'absolute',
          left: node.position.x,
          top: node.position.y,
        }}
        className={`bg-white rounded-lg shadow-lg border-2 p-3 cursor-move min-w-[180px] ${isSelected ? 'border-purple-500' : 'border-gray-300'
          }`}
        onMouseDown={(e) => onMouseDown(e, node)}
        onClick={() => onSelect(node)}
      >
        {/* Input connection point */}
        {node.type !== 'trigger' && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-purple-600 rounded-full border-2 border-white cursor-pointer hover:scale-125 transition-transform" />
        )}

        {/* Node content */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{node.type === 'trigger' ? '⚡' : actionType?.icon}</span>
          <span className="font-semibold text-sm text-gray-900">
            {node.type === 'trigger' ? 'Trigger' : actionType?.name}
          </span>
        </div>

        {node.type === 'trigger' && (
          <div className="text-xs text-gray-600">
            {triggerTypes.find(t => t.id === node.data?.type)?.name}
          </div>
        )}

        {/* Output connection point */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-purple-600 rounded-full border-2 border-white cursor-pointer hover:scale-125 transition-transform"
          onMouseDown={(e) => {
            e.stopPropagation();
            onConnectionStart(e, node);
          }}
        />
      </div>
    );
  };

  const ConnectionLine = ({ from, to, connections, nodes }) => {
    return (
      <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
        {connections.map((conn, i) => {
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);
          if (!fromNode || !toNode) return null;

          const x1 = fromNode.position.x + 180;
          const y1 = fromNode.position.y + 40;
          const x2 = toNode.position.x;
          const y2 = toNode.position.y + 40;

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#9333ea"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
          );
        })}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#9333ea" />
          </marker>
        </defs>
      </svg>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">Workflows</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="Create Workflow"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-500">Automate tasks and interactions</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!selectedWorkflow ? (
          // Workflow List
          <div className="p-4">
            {safeWorkflows.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-2">No Workflows Yet</h4>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  Create workflows to automate your app's behavior
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors shadow-sm hover:shadow-md"
                >
                  Create Workflow
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {safeWorkflows.map(workflow => (
                  <div
                    key={workflow.id}
                    onClick={() => onWorkflowSelect(workflow)}
                    className="group p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-sm cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-sm font-bold text-gray-900">{workflow.name}</h4>
                          {workflow.enabled === false && (
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs font-medium">
                              Disabled
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium">
                              {triggerTypes.find(t => t.id === workflow.trigger.type)?.name}
                            </span>
                            {workflow.trigger.componentId && (
                              <>
                                <span>on</span>
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded font-medium">
                                  {getComponentName(workflow.trigger.componentId)}
                                </span>
                              </>
                            )}
                          </div>

                          <div className="text-xs text-gray-500">
                            {workflow.actions?.length || 0} action{workflow.actions?.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onWorkflowUpdate(workflow.id, { enabled: workflow.enabled === false ? true : false });
                          }}
                          className={`p-1.5 rounded transition-all ${workflow.enabled === false
                              ? 'hover:bg-green-100 text-gray-400'
                              : 'hover:bg-gray-100 text-green-600'
                            }`}
                          title={workflow.enabled === false ? 'Enable' : 'Disable'}
                        >
                          {workflow.enabled === false ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onWorkflowDelete(workflow.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                          title="Delete"
                        >
                          <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Workflow Editor - Canvas Version
          <div className="flex flex-col h-full">
            {/* Back Button */}
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={() => {
                  onWorkflowSelect(null);
                  setSelectedNode(null);
                }}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-3"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Workflows
              </button>
              <h3 className="text-lg font-bold text-gray-900">{selectedWorkflow.name}</h3>
            </div>

            {/* Canvas */}
            <div
              ref={canvasRef}
              className="flex-1 relative bg-gray-50 overflow-auto"
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              style={{
                backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            >
              {/* Connection Lines */}
              <ConnectionLine
                connections={selectedWorkflow.connections || []}
                nodes={selectedWorkflow.nodes || []}
              />

              {/* Temporary connection line */}
              {tempConnection && (
                <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                  <line
                    x1={tempConnection.x1}
                    y1={tempConnection.y1}
                    x2={tempConnection.x2}
                    y2={tempConnection.y2}
                    stroke="#9333ea"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                </svg>
              )}

              {/* Nodes */}
              {(selectedWorkflow.nodes || []).map(node => (
                <WorkflowNode
                  key={node.id}
                  node={node}
                  isSelected={selectedNode?.id === node.id}
                  onMouseDown={handleNodeMouseDown}
                  onConnectionStart={handleConnectionStart}
                  onSelect={setSelectedNode}
                />
              ))}

              {/* Empty state */}
              {(!selectedWorkflow.nodes || selectedWorkflow.nodes.length <= 1) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-gray-400 mb-2">Add action nodes to build your workflow</p>
                    <p className="text-sm text-gray-400">Connect them by dragging from ● to ●</p>
                  </div>
                </div>
              )}
            </div>

            {/* Add Action Button */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowActionModal(true)}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
              >
                + Add Action Node
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create Workflow</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Workflow Name</label>
                <input
                  type="text"
                  placeholder="e.g., Submit Contact Form"
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trigger Type</label>
                <select
                  value={newWorkflow.trigger.type}
                  onChange={(e) => setNewWorkflow({
                    ...newWorkflow,
                    trigger: { ...newWorkflow.trigger, type: e.target.value }
                  })}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {triggerTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewWorkflow({ name: '', trigger: { type: 'click', componentId: '' }, actions: [] });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkflow}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Action Node</h3>

            <div className="space-y-3">
              {actionTypes.map(action => (
                <button
                  key={action.id}
                  onClick={() => {
                    // Create new node
                    const newNode = {
                      id: `node-${Date.now()}`,
                      type: 'action',
                      position: {
                        x: 200 + (selectedWorkflow.nodes?.length || 0) * 200,
                        y: 150
                      },
                      data: { type: action.id, name: action.name, config: action.config }
                    };

                    onWorkflowUpdate(selectedWorkflow.id, {
                      nodes: [...(selectedWorkflow.nodes || []), newNode],
                      connections: selectedWorkflow.connections || []
                    });

                    setShowActionModal(false);
                  }}
                  className="w-full p-4 text-left border-2 rounded-lg border-gray-200 hover:border-purple-300 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{action.icon}</span>
                    <div className="font-semibold text-gray-900 text-sm">{action.name}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowActionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default WorkflowsPanel;