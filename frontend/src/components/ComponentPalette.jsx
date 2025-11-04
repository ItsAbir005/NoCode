import { useState } from 'react';

export default function ComponentPalette({ onAddComponent }) {
  const [searchTerm, setSearchTerm] = useState('');

  const components = [
    { type: 'Button', icon: '🔘', description: 'Clickable button', category: 'Basic' },
    { type: 'Input', icon: '📝', description: 'Text input field', category: 'Basic' },
    { type: 'Text', icon: '📄', description: 'Text content', category: 'Basic' },
    { type: 'Image', icon: '🖼️', description: 'Image element', category: 'Media' },
    { type: 'Form', icon: '📋', description: 'Form container', category: 'Layout' },
    { type: 'Container', icon: '📦', description: 'Layout container', category: 'Layout' },
    { type: 'Table', icon: '📊', description: 'Data table', category: 'Data' },
    { type: 'Chart', icon: '📈', description: 'Chart/Graph', category: 'Data' },
  ];

  const filteredComponents = components.filter(comp =>
    comp.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-64 bg-white border-r shadow-sm overflow-y-auto">
      <div className="p-4 border-b">
        <h3 className="font-bold text-lg text-gray-800 mb-3">Components</h3>
        <input
          type="text"
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="p-4 space-y-2">
        {filteredComponents.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No components found</p>
        ) : (
          filteredComponents.map((component) => (
            <button
              key={component.type}
              onClick={() => onAddComponent(component.type)}
              className="w-full text-left p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{component.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 group-hover:text-blue-600">
                    {component.type}
                  </p>
                  <p className="text-xs text-gray-500">{component.description}</p>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {component.category}
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="p-4 border-t bg-gray-50">
        <p className="text-xs text-gray-600 text-center">
          💡 Tip: Click to add components to canvas
        </p>
      </div>
    </div>
  );
}