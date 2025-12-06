// frontend/src/components/editor/WorkflowsPanel.jsx

const WorkflowsPanel = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-bold text-gray-900 mb-1">Workflows</h3>
        <p className="text-xs text-gray-500">Automate tasks and business logic</p>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h4 className="text-base font-bold text-gray-900 mb-2">Automation Workflows</h4>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Create automated workflows to connect your components, APIs, and database
          </p>
          <button className="px-6 py-3 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors shadow-sm hover:shadow-md">
            Create Workflow
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowsPanel;