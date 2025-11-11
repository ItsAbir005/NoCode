import { useState, useEffect } from 'react';
import api from '../api/client';

// Simple icon components (no external dependencies)
const X = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const Plus = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const Trash = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const Zap = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

export default function WorkflowEditor({ projectId, nodes, onClose }) {
  const [workflows, setWorkflows] = useState([]);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWorkflows();
  }, [projectId]);

  const loadWorkflows = async () => {
    try {
      const { data } = await api.get(`/projects/${projectId}/workflows`);
      setWorkflows(data);
    } catch (error) {
      console.error('Failed to load workflows', error);
    }
  };

  const createWorkflow = () => {
    setEditingWorkflow({
      name: 'New Workflow',
      trigger: { componentId: '', event: 'click' },
      actions: []
    });
  };

  const saveWorkflow = async () => {
    if (!editingWorkflow.trigger.componentId) {
      alert('Please select a trigger component');
      return;
    }
    if (editingWorkflow.actions.length === 0) {
      alert('Please add at least one action');
      return;
    }

    setLoading(true);
    try {
      if (editingWorkflow.id) {
        await api.put(`/workflows/${editingWorkflow.id}`, editingWorkflow);
      } else {
        await api.post(`/projects/${projectId}/workflow`, editingWorkflow);
      }
      loadWorkflows();
      setEditingWorkflow(null);
      alert('Workflow saved successfully! ✅');
    } catch (error) {
      alert('Failed to save workflow: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkflow = async (id) => {
    if (!confirm('Delete this workflow?')) return;
    try {
      await api.delete(`/workflows/${id}`);
      loadWorkflows();
    } catch (error) {
      alert('Failed to delete workflow');
    }
  };

  const addAction = () => {
    setEditingWorkflow({
      ...editingWorkflow,
      actions: [
        ...editingWorkflow.actions,
        { type: 'toggle_visibility', targetId: '', visible: true }
      ]
    });
  };

  const updateAction = (index, field, value) => {
    const newActions = [...editingWorkflow.actions];
    newActions[index][field] = value;
    setEditingWorkflow({ ...editingWorkflow, actions: newActions });
  };

  const removeAction = (index) => {
    const newActions = editingWorkflow.actions.filter((_, i) => i !== index);
    setEditingWorkflow({ ...editingWorkflow, actions: newActions });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="w-7 h-7" />
              Workflow Editor
            </h2>
            <p className="text-sm opacity-90">Add interactivity to your components</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {!editingWorkflow ? (
            <>
              {/* Workflow List */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Workflows ({workflows.length})
                </h3>
                <button
                  onClick={createWorkflow}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg transition"
                >
                  <Plus className="w-5 h-5" />
                  Create Workflow
                </button>
              </div>

              {workflows.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No workflows yet</p>
                  <p className="text-gray-500 text-sm mb-4">Create workflows to add interactivity</p>
                  <button
                    onClick={createWorkflow}
                    className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600"
                  >
                    Create Your First Workflow
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {workflows.map(workflow => (
                    <div key={workflow.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-400 transition">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-lg text-gray-800">{workflow.name}</h4>
                          <p className="text-sm text-gray-600">
                            When <span className="font-semibold text-purple-600">{workflow.trigger?.componentId || 'component'}</span> is <span className="font-semibold">{workflow.trigger?.event || 'triggered'}</span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingWorkflow(workflow)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteWorkflow(workflow.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-700 font-semibold mb-1">Actions ({workflow.actions?.length || 0}):</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {workflow.actions?.map((action, idx) => (
                            <li key={idx}>
                              • {action.type.replace(/_/g, ' ')} → {action.targetId || 'target'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Edit Workflow */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Workflow Name
                  </label>
                  <input
                    type="text"
                    value={editingWorkflow.name}
                    onChange={(e) => setEditingWorkflow({ ...editingWorkflow, name: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="e.g., Show Form on Button Click"
                  />
                </div>

                {/* Trigger */}
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                  <h4 className="font-bold text-lg text-gray-800 mb-4">🎯 Trigger (When?)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Component *
                      </label>
                      <select
                        value={editingWorkflow.trigger.componentId}
                        onChange={(e) => setEditingWorkflow({
                          ...editingWorkflow,
                          trigger: { ...editingWorkflow.trigger, componentId: e.target.value }
                        })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Select component...</option>
                        {nodes.map(node => (
                          <option key={node.id} value={node.id}>
                            {node.data.label} ({node.id})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Event
                      </label>
                      <select
                        value={editingWorkflow.trigger.event}
                        onChange={(e) => setEditingWorkflow({
                          ...editingWorkflow,
                          trigger: { ...editingWorkflow.trigger, event: e.target.value }
                        })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      >
                        <option value="click">Click</option>
                        <option value="submit">Submit (forms)</option>
                        <option value="change">Change (inputs)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-lg text-gray-800">⚡ Actions (What happens?)</h4>
                    <button
                      onClick={addAction}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm font-semibold flex items-center gap-1 hover:bg-green-600 transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add Action
                    </button>
                  </div>

                  {editingWorkflow.actions.length === 0 ? (
                    <p className="text-gray-600 text-sm">No actions yet. Click "Add Action" above.</p>
                  ) : (
                    <div className="space-y-4">
                      {editingWorkflow.actions.map((action, idx) => (
                        <div key={idx} className="bg-white border-2 border-gray-300 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <p className="font-semibold text-gray-800">Action {idx + 1}</p>
                            <button
                              onClick={() => removeAction(idx)}
                              className="text-red-500 hover:text-red-700 transition"
                            >
                              <Trash className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Action Type
                              </label>
                              <select
                                value={action.type}
                                onChange={(e) => updateAction(idx, 'type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-green-500 focus:outline-none"
                              >
                                <option value="toggle_visibility">Show/Hide Component</option>
                                <option value="set_value">Set Component Value</option>
                                <option value="navigate">Navigate to Page</option>
                                <option value="alert">Show Alert</option>
                                <option value="api_call">Call API</option>
                                <option value="validate_input">Validate Input</option>
                                <option value="conditional">Conditional (If/Else)</option>
                                <option value="show_toast">Show Toast Notification</option>
                                <option value="save_storage">Save to Local Storage</option>
                                <option value="load_storage">Load from Local Storage</option>
                                <option value="delay">Delay (Wait)</option>
                              </select>
                            </div>

                            {action.type === 'set_value' && (
                              <>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Target Component *
                                  </label>
                                  <select
                                    value={action.targetId}
                                    onChange={(e) => updateAction(idx, 'targetId', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="">Select component...</option>
                                    {nodes.map(node => (
                                      <option key={node.id} value={node.id}>
                                        {node.data.label} ({node.id})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    New Value
                                  </label>
                                  <input
                                    type="text"
                                    value={action.value || ''}
                                    onChange={(e) => updateAction(idx, 'value', e.target.value)}
                                    placeholder="Value to set"
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                              </>
                            )}

                            {action.type === 'api_call' && (
                              <>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Method
                                  </label>
                                  <select
                                    value={action.method || 'GET'}
                                    onChange={(e) => updateAction(idx, 'method', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="GET">GET</option>
                                    <option value="POST">POST</option>
                                    <option value="PUT">PUT</option>
                                    <option value="DELETE">DELETE</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    URL *
                                  </label>
                                  <input
                                    type="text"
                                    value={action.url || ''}
                                    onChange={(e) => updateAction(idx, 'url', e.target.value)}
                                    placeholder="https://api.example.com/data"
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Body (JSON for POST/PUT)
                                  </label>
                                  <textarea
                                    value={action.body || ''}
                                    onChange={(e) => updateAction(idx, 'body', e.target.value)}
                                    placeholder='{"key": "value"}'
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                    rows={3}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Save Response To Component (optional)
                                  </label>
                                  <select
                                    value={action.saveToComponent || ''}
                                    onChange={(e) => updateAction(idx, 'saveToComponent', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="">Don't save</option>
                                    {nodes.filter(n => n.data.type === 'Text').map(node => (
                                      <option key={node.id} value={node.id}>
                                        {node.data.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </>
                            )}

                            {action.type === 'validate_input' && (
                              <>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Input Component *
                                  </label>
                                  <select
                                    value={action.targetId}
                                    onChange={(e) => updateAction(idx, 'targetId', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="">Select input...</option>
                                    {nodes.filter(n => n.data.type === 'Input').map(node => (
                                      <option key={node.id} value={node.id}>
                                        {node.data.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Validation Type
                                  </label>
                                  <select
                                    value={action.validationType || 'required'}
                                    onChange={(e) => updateAction(idx, 'validationType', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="required">Required (not empty)</option>
                                    <option value="email">Valid Email</option>
                                    <option value="minLength">Minimum Length</option>
                                    <option value="maxLength">Maximum Length</option>
                                    <option value="number">Numbers Only</option>
                                    <option value="regex">Custom Regex</option>
                                  </select>
                                </div>
                                {action.validationType === 'minLength' && (
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                      Minimum Length
                                    </label>
                                    <input
                                      type="number"
                                      value={action.minLength || 1}
                                      onChange={(e) => updateAction(idx, 'minLength', parseInt(e.target.value))}
                                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                    />
                                  </div>
                                )}
                                {action.validationType === 'regex' && (
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                      Regex Pattern
                                    </label>
                                    <input
                                      type="text"
                                      value={action.pattern || ''}
                                      onChange={(e) => updateAction(idx, 'pattern', e.target.value)}
                                      placeholder="^[A-Za-z]+$"
                                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                    />
                                  </div>
                                )}
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Error Message
                                  </label>
                                  <input
                                    type="text"
                                    value={action.errorMessage || ''}
                                    onChange={(e) => updateAction(idx, 'errorMessage', e.target.value)}
                                    placeholder="This field is required"
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                              </>
                            )}

                            {action.type === 'conditional' && (
                              <>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Condition Component
                                  </label>
                                  <select
                                    value={action.conditionComponent || ''}
                                    onChange={(e) => updateAction(idx, 'conditionComponent', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="">Select component...</option>
                                    {nodes.map(node => (
                                      <option key={node.id} value={node.id}>
                                        {node.data.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Operator
                                  </label>
                                  <select
                                    value={action.operator || 'equals'}
                                    onChange={(e) => updateAction(idx, 'operator', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="equals">Equals (==)</option>
                                    <option value="notEquals">Not Equals (!=)</option>
                                    <option value="contains">Contains</option>
                                    <option value="isEmpty">Is Empty</option>
                                    <option value="isNotEmpty">Is Not Empty</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Compare Value
                                  </label>
                                  <input
                                    type="text"
                                    value={action.compareValue || ''}
                                    onChange={(e) => updateAction(idx, 'compareValue', e.target.value)}
                                    placeholder="Value to compare"
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                                <div className="col-span-2 bg-yellow-50 border border-yellow-300 rounded p-2">
                                  <p className="text-xs text-yellow-800">
                                    ℹ️ If condition is true, next action runs. Otherwise, it's skipped.
                                  </p>
                                </div>
                              </>
                            )}

                            {action.type === 'show_toast' && (
                              <>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Toast Type
                                  </label>
                                  <select
                                    value={action.toastType || 'success'}
                                    onChange={(e) => updateAction(idx, 'toastType', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="success">Success (Green)</option>
                                    <option value="error">Error (Red)</option>
                                    <option value="info">Info (Blue)</option>
                                    <option value="warning">Warning (Yellow)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Message *
                                  </label>
                                  <input
                                    type="text"
                                    value={action.message || ''}
                                    onChange={(e) => updateAction(idx, 'message', e.target.value)}
                                    placeholder="Operation successful!"
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                              </>
                            )}

                            {action.type === 'save_storage' && (
                              <>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Key Name *
                                  </label>
                                  <input
                                    type="text"
                                    value={action.storageKey || ''}
                                    onChange={(e) => updateAction(idx, 'storageKey', e.target.value)}
                                    placeholder="userData"
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Value from Component
                                  </label>
                                  <select
                                    value={action.sourceComponent || ''}
                                    onChange={(e) => updateAction(idx, 'sourceComponent', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="">Select component...</option>
                                    {nodes.map(node => (
                                      <option key={node.id} value={node.id}>
                                        {node.data.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </>
                            )}

                            {action.type === 'load_storage' && (
                              <>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Key Name *
                                  </label>
                                  <input
                                    type="text"
                                    value={action.storageKey || ''}
                                    onChange={(e) => updateAction(idx, 'storageKey', e.target.value)}
                                    placeholder="userData"
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Load Into Component
                                  </label>
                                  <select
                                    value={action.targetComponent || ''}
                                    onChange={(e) => updateAction(idx, 'targetComponent', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="">Select component...</option>
                                    {nodes.map(node => (
                                      <option key={node.id} value={node.id}>
                                        {node.data.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </>
                            )}

                            {action.type === 'delay' && (
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  Delay (milliseconds)
                                </label>
                                <input
                                  type="number"
                                  value={action.delay || 1000}
                                  onChange={(e) => updateAction(idx, 'delay', parseInt(e.target.value))}
                                  placeholder="1000"
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                />
                                <p className="text-xs text-gray-500 mt-1">1000ms = 1 second</p>
                              </div>
                            )}

                            {action.type === 'toggle_visibility' && (
                              <>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Target Component *
                                  </label>
                                  <select
                                    value={action.targetId}
                                    onChange={(e) => updateAction(idx, 'targetId', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-green-500 focus:outline-none"
                                  >
                                    <option value="">Select component...</option>
                                    {nodes.map(node => (
                                      <option key={node.id} value={node.id}>
                                        {node.data.label} ({node.id})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Action
                                  </label>
                                  <select
                                    value={action.visible}
                                    onChange={(e) => updateAction(idx, 'visible', e.target.value === 'true')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-green-500 focus:outline-none"
                                  >
                                    <option value="true">Show Component</option>
                                    <option value="false">Hide Component</option>
                                  </select>
                                </div>
                              </>
                            )}

                            {action.type === 'navigate' && (
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  URL or Path
                                </label>
                                <input
                                  type="text"
                                  value={action.url || ''}
                                  onChange={(e) => updateAction(idx, 'url', e.target.value)}
                                  placeholder="/dashboard or https://example.com"
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-green-500 focus:outline-none"
                                />
                              </div>
                            )}

                            {action.type === 'alert' && (
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  Alert Message
                                </label>
                                <input
                                  type="text"
                                  value={action.message || ''}
                                  onChange={(e) => updateAction(idx, 'message', e.target.value)}
                                  placeholder="Hello, World!"
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-green-500 focus:outline-none"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditingWorkflow(null)}
                    className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveWorkflow}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Workflow'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}