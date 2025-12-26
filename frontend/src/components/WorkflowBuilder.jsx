import { useState } from 'react';
import { Plus, Trash2, Play, Zap, MousePointer, Save } from 'lucide-react';

export function WorkflowBuilder({ workflows, onWorkflowsChange, components }) {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    trigger: { type: 'click', componentId: '' },
    actions: []
  });

  const triggerTypes = [
    { value: 'click', label: 'On Click', icon: MousePointer },
    { value: 'submit', label: 'On Submit', icon: Save },
    { value: 'load', label: 'On Page Load', icon: Play }
  ];

  const actionTypes = [
    { value: 'show', label: 'Show Component' },
    { value: 'hide', label: 'Hide Component' },
    { value: 'navigate', label: 'Navigate To' },
    { value: 'setValue', label: 'Set Value' },
    { value: 'alert', label: 'Show Alert' }
  ];

  const handleCreateWorkflow = () => {
    const workflow = {
      id: `workflow-${Date.now()}`,
      ...newWorkflow
    };
    
    onWorkflowsChange([...workflows, workflow]);
    setNewWorkflow({
      name: '',
      description: '',
      trigger: { type: 'click', componentId: '' },
      actions: []
    });
    setShowCreateModal(false);
  };

  const handleDeleteWorkflow = (workflowId) => {
    if (confirm('Delete this workflow?')) {
      onWorkflowsChange(workflows.filter(w => w.id !== workflowId));
      if (selectedWorkflow?.id === workflowId) {
        setSelectedWorkflow(null);
      }
    }
  };

  const addAction = () => {
    setNewWorkflow(prev => ({
      ...prev,
      actions: [...prev.actions, { type: 'show', target: '', params: {} }]
    }));
  };

  const updateAction = (index, updates) => {
    setNewWorkflow(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => 
        i === index ? { ...action, ...updates } : action
      )
    }));
  };

  const removeAction = (index) => {
    setNewWorkflow(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Workflows</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Workflow
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Create automated workflows triggered by user interactions
        </p>
      </div>

      {/* Workflow List */}
      <div className="flex-1 overflow-y-auto p-4">
        {workflows.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No workflows yet</h3>
            <p className="text-sm text-gray-500 mb-4">Create your first automation</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
            >
              Create Workflow
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {workflows.map(workflow => (
              <div
                key={workflow.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedWorkflow?.id === workflow.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedWorkflow(workflow)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{workflow.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{workflow.description}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteWorkflow(workflow.id);
                    }}
                    className="p-1 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {workflow.trigger.type}
                  </span>
                  <span className="text-gray-500">→</span>
                  <span className="text-gray-600">
                    {workflow.actions.length} action{workflow.actions.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Create Workflow</h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workflow Name
                </label>
                <input
                  type="text"
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Submit Contact Form"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                  placeholder="What does this workflow do?"
                />
              </div>

              {/* Trigger */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Trigger</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trigger Type
                    </label>
                    <select
                      value={newWorkflow.trigger.type}
                      onChange={(e) => setNewWorkflow(prev => ({
                        ...prev,
                        trigger: { ...prev.trigger, type: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {triggerTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {newWorkflow.trigger.type !== 'load' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Component
                      </label>
                      <select
                        value={newWorkflow.trigger.componentId}
                        onChange={(e) => setNewWorkflow(prev => ({
                          ...prev,
                          trigger: { ...prev.trigger, componentId: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select component...</option>
                        {components.map(comp => (
                          <option key={comp.id} value={comp.id}>
                            {comp.type} - {comp.id}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Actions</h4>
                  <button
                    onClick={addAction}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Action
                  </button>
                </div>

                <div className="space-y-3">
                  {newWorkflow.actions.map((action, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Action {index + 1}
                        </span>
                        <button
                          onClick={() => removeAction(index)}
                          className="p-1 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <select
                          value={action.type}
                          onChange={(e) => updateAction(index, { type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          {actionTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>

                        {action.type !== 'alert' && action.type !== 'navigate' && (
                          <select
                            value={action.target}
                            onChange={(e) => updateAction(index, { target: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="">Select target...</option>
                            {components.map(comp => (
                              <option key={comp.id} value={comp.id}>
                                {comp.type} - {comp.id}
                              </option>
                            ))}
                          </select>
                        )}

                        {action.type === 'navigate' && (
                          <input
                            type="text"
                            placeholder="Enter path (e.g., /home)"
                            value={action.params.path || ''}
                            onChange={(e) => updateAction(index, {
                              params: { ...action.params, path: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        )}

                        {action.type === 'alert' && (
                          <input
                            type="text"
                            placeholder="Alert message"
                            value={action.params.message || ''}
                            onChange={(e) => updateAction(index, {
                              params: { ...action.params, message: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        )}
                      </div>
                    </div>
                  ))}

                  {newWorkflow.actions.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No actions yet. Add your first action.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewWorkflow({
                    name: '',
                    description: '',
                    trigger: { type: 'click', componentId: '' },
                    actions: []
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkflow}
                disabled={!newWorkflow.name || !newWorkflow.trigger.componentId}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Create Workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}