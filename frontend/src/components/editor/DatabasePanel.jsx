// frontend/src/components/editor/DatabasePanel.jsx

const DatabasePanel = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-bold text-gray-900 mb-1">Database</h3>
        <p className="text-xs text-gray-500">Define your data models and schemas</p>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          </div>
          <h4 className="text-base font-bold text-gray-900 mb-2">Database Schema</h4>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Create tables, define fields, and set up relationships for your data
          </p>
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors shadow-sm hover:shadow-md">
            Create Table
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatabasePanel;