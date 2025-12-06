// frontend/src/components/editor/APIPanel.jsx

const APIPanel = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-bold text-gray-900 mb-1">API Configuration</h3>
        <p className="text-xs text-gray-500">Connect external services and APIs</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Base URL */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Base URL
            </label>
            <input 
              type="text" 
              placeholder="https://api.example.com"
              className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            <p className="mt-2 text-xs text-gray-500">The root URL for your API endpoints</p>
          </div>

          {/* Endpoints */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">
              Endpoints
            </label>
            <button className="w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors font-medium">
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Endpoint
              </div>
            </button>
          </div>

          {/* Authentication */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Authentication
            </label>
            <select className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white">
              <option>None</option>
              <option>API Key</option>
              <option>Bearer Token</option>
              <option>OAuth 2.0</option>
              <option>Basic Auth</option>
            </select>
            <p className="mt-2 text-xs text-gray-500">Choose how to authenticate with the API</p>
          </div>

          {/* Headers */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">
              Custom Headers
            </label>
            <button className="w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors font-medium">
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Header
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIPanel;