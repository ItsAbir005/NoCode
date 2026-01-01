import { useState } from 'react';
import { Plus, Trash2, Play, Zap, MousePointer, Save, Sparkles, Wand2, Loader2 } from 'lucide-react';
import { API_URL } from '../config/api';

export function WorkflowBuilder({ workflows, onWorkflowsChange, components }) {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
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
    { value: 'validate', label: 'Validate Input' },
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

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      alert('Please enter a workflow description');
      return;
    }

    setAiLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/ai/workflow/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          components: components
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate workflow');
      }

      const data = await response.json();
      
      if (data.success && data.workflow) {
        // Add the AI-generated workflow
        onWorkflowsChange([...workflows, data.workflow]);
        setShowAIModal(false);
        setAiPrompt('');
        alert(`✨ Created workflow: "${data.workflow.name}"`);
      } else {
        throw new Error('No workflow was generated');
      }
    } catch (error) {
      console.error('AI workflow generation error:', error);
      alert(`Failed to generate workflow: ${error.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGetSuggestions = async () => {
    if (components.length === 0) {
      alert('Add some components first to get workflow suggestions');
      return;
    }

    setAiLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/ai/workflow/suggest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          components: components
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get suggestions');
      }

      const data = await response.json();
      
      if (data.success && data.workflows && data.workflows.length > 0) {
        // Add all suggested workflows
        onWorkflowsChange([...workflows, ...data.workflows]);
        alert(`✨ Added ${data.workflows.length} suggested workflow${data.workflows.length > 1 ? 's' : ''}!`);
      } else {
        alert('No workflow suggestions available');
      }
    } catch (error) {
      console.error('Workflow suggestions error:', error);
      alert(`Failed to get suggestions: ${error.message}`);
    } finally {
      setAiLoading(false);
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

  const aiPromptExamples = [
    "When submit button is clicked, validate email input and show success message",
    "On page load, hide the error message container",
    "When login button is clicked, validate username and password fields",
    "Show loading spinner when submit button is clicked",
    "Navigate to dashboard when login is successful"
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Workflows</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAIModal(true)}
              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              AI Generate
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Create automated workflows or use AI to generate them
        </p>
      </div>

      {/* Workflow List */}
      <div className="flex-1 overflow-y-auto p-4">
        {workflows.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No workflows yet</h3>
            <p className="text-sm text-gray-500 mb-4">Create your first automation</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowAIModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                AI Generate
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
              >
                Create Manually
              </button>
            </div>
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

      {/* AI Generation Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Wand2 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">AI Workflow Generator</h3>
                  <p className="text-sm text-gray-600">Describe what you want to automate</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Prompt Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workflow Description
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="E.g., When submit button is clicked, validate all input fields and show a success message"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Quick Examples */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Quick Examples:
                </p>
                <div className="space-y-2">
                  {aiPromptExamples.map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setAiPrompt(example)}
                      className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-lg transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Get Suggestions Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleGetSuggestions}
                  disabled={aiLoading || components.length === 0}
                  className="w-full px-4 py-3 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Sparkles className="w-4 h-4" />
                  Get AI Suggestions for Current Components
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowAIModal(false);
                  setAiPrompt('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={aiLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAIGenerate}
                disabled={!aiPrompt.trim() || aiLoading}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generate Workflow
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Create Modal - Keep existing implementation */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          {/* ... existing manual create modal code ... */}
        </div>
      )}
    </div>
  );
}