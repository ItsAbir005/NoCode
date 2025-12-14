// frontend/src/components/editor/PropertiesPanel.jsx

const PropertiesPanel = ({
  selectedComponent,
  onUpdateProps,
  onMove,
  onDuplicate,
  onDelete
}) => {
  if (!selectedComponent) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-bold text-gray-900">Properties</h3>
        </div>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">No Selection</p>
            <p className="text-xs text-gray-500">Select a component to edit its properties</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-bold text-gray-900">Properties</h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Component Info */}
          <div className="pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900 truncate">
                  {selectedComponent.name}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  ID: {selectedComponent.id.slice(-8)}
                </p>
              </div>
            </div>
          </div>

          {/* Position Controls */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              Position
            </h5>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-3 gap-2">
                <div></div>
                <button
                  onClick={() => onMove(selectedComponent.id, 'up')}
                  className="p-2 bg-white border-2 border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all active:scale-95"
                  title="Move Up"
                >
                  <svg className="w-4 h-4 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <div></div>

                <button
                  onClick={() => onMove(selectedComponent.id, 'left')}
                  className="p-2 bg-white border-2 border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all active:scale-95"
                  title="Move Left"
                >
                  <svg className="w-4 h-4 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex items-center justify-center">
                  <div className="text-xs font-semibold text-gray-500">Move</div>
                </div>

                <button
                  onClick={() => onMove(selectedComponent.id, 'right')}
                  className="p-2 bg-white border-2 border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all active:scale-95"
                  title="Move Right"
                >
                  <svg className="w-4 h-4 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div></div>
                <button
                  onClick={() => onMove(selectedComponent.id, 'down')}
                  className="p-2 bg-white border-2 border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all active:scale-95"
                  title="Move Down"
                >
                  <svg className="w-4 h-4 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">X:</span>
                  <span className="ml-1 font-semibold text-gray-900">
                    {Math.round(selectedComponent.position?.x || 0)}px
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Y:</span>
                  <span className="ml-1 font-semibold text-gray-900">
                    {Math.round(selectedComponent.position?.y || 0)}px
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Node Configuration - if a workflow node is selected */}
          {selectedNode && selectedNode.type === 'action' && (
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Action Configuration
              </h5>
              {renderActionConfig(selectedNode)}
            </div>
          )}

          {/* Properties */}
          {selectedComponent.props && Object.keys(selectedComponent.props).length > 0 && (
            <div className="space-y-4">
              <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Properties
              </h5>
              {Object.entries(selectedComponent.props).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  </label>
                  {renderPropertyInput(key, value, selectedComponent, onUpdateProps)}
                </div>
              ))}
            </div>
          )}
          {/* Workflows Section */}
          <div className="space-y-3 pt-6 border-t border-gray-200">
            <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              Workflows
            </h5>

            <button
              onClick={() => {
                const newWorkflow = {
                  name: `${selectedComponent.name} Action`,
                  trigger: {
                    type: 'click',
                    componentId: selectedComponent.id
                  },
                  actions: []
                };
                onWorkflowCreate?.(newWorkflow);
              }}
              className="w-full px-4 py-2 bg-purple-50 border-2 border-purple-200 text-purple-700 rounded-lg hover:bg-purple-100 text-sm font-semibold"
            >
              + Add Workflow
            </button>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-gray-200 space-y-2">
            <button
              onClick={() => onDuplicate(selectedComponent)}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Duplicate
            </button>
            <button
              onClick={() => onDelete(selectedComponent.id)}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const renderPropertyInput = (key, value, component, onUpdateProps) => {
  if (typeof value === 'boolean') {
    return (
      <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onUpdateProps(component.id, { [key]: e.target.checked })}
          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700 font-medium">
          {value ? 'Enabled' : 'Disabled'}
        </span>
      </label>
    );
  } else if (Array.isArray(value)) {
    return (
      <textarea
        value={value.join('\n')}
        onChange={(e) => onUpdateProps(component.id, { [key]: e.target.value.split('\n') })}
        rows={3}
        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
        placeholder="One item per line"
      />
    );
  } else {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onUpdateProps(component.id, { [key]: e.target.value })}
        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
      />
    );
  }
};

export default PropertiesPanel;