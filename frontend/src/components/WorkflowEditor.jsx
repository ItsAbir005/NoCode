import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Zap } from 'lucide-react';
import api from '../api/client';

export default function WorkflowEditor({ projectId, nodes, onClose }) {
  const [workflows, setWorkflows] = useState([]);
  const [editingWorkflow, setEditingWorkflow] = useState(null);

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
    try {
      if (editingWorkflow.id) {
        await api.put(`/workflows/${editingWorkflow.id}`, editingWorkflow);
      } else {
        await api.post(`/projects/${projectId}/workflow`, editingWorkflow);
      }
      loadWorkflows();
      setEditingWorkflow(null);
    } catch (error) {
      alert('Failed to save workflow');
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
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg">
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
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Create Workflow
                </button>
              </div>

              {workflows.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No workflows yet</p>
                  <p className="text-gray-500 text-sm">Create workflows to add interactivity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {workflows.map(workflow => (
                    <div key={workflow.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-400 transition">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-lg text-gray-800">{workflow.name}</h4>
                          <p className="text-sm text-gray-600">
                            When <span className="font-semibold text-purple-600">{workflow.trigger?.componentId}</span> is <span className="font-semibold">{workflow.trigger?.event}</span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingWorkflow(workflow)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteWorkflow(workflow.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-700 font-semibold mb-1">Actions:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {workflow.actions?.map((action, idx) => (
                            <li key={idx}>• {action.type} → {action.targetId}</li>
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
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500"
                    placeholder="e.g., Show Form on Button Click"
                  />
                </div>

                {/* Trigger */}
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                  <h4 className="font-bold text-lg text-gray-800 mb-4">🎯 Trigger (When?)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Component
                      </label>
                      <select
                        value={editingWorkflow.trigger.componentId}
                        onChange={(e) => setEditingWorkflow({
                          ...editingWorkflow,
                          trigger: { ...editingWorkflow.trigger, componentId: e.target.value }
                        })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
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
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Event
                      </label>
                      <select
                        value={editingWorkflow.trigger.event}
                        onChange={(e) => setEditingWorkflow({
                          ...editingWorkflow,
                          trigger: { ...editingWorkflow.trigger, event: e.target.value }
                        })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
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
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm font-semibold flex items-center gap-1"
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
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Action Type
                              </label>
                              <select
                                value={action.type}
                                onChange={(e) => updateAction(idx, 'type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                              >
                                <option value="toggle_visibility">Show/Hide Component</option>
                                <option value="navigate">Navigate to Page</option>
                                <option value="api_call">Call API</option>
                                <option value="set_value">Set Component Value</option>
                              </select>
                            </div>

                            {action.type === 'toggle_visibility' && (
                              <>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Target Component
                                  </label>
                                  <select
                                    value={action.targetId}
                                    onChange={(e) => updateAction(idx, 'targetId', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="">Select...</option>
                                    {nodes.map(node => (
                                      <option key={node.id} value={node.id}>
                                        {node.data.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Visibility
                                  </label>
                                  <select
                                    value={action.visible}
                                    onChange={(e) => updateAction(idx, 'visible', e.target.value === 'true')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="true">Show</option>
                                    <option value="false">Hide</option>
                                  </select>
                                </div>
                              </>
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
                    className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveWorkflow}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg"
                  >
                    Save Workflow
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