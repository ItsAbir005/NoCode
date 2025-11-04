import { useState, useEffect } from 'react';

export default function PropertiesPanel({ node, onUpdateProps, onClose }) {
  const [props, setProps] = useState(node.data.props || {});

  useEffect(() => {
    setProps(node.data.props || {});
  }, [node]);

  const handlePropChange = (key, value) => {
    const newProps = { ...props, [key]: value };
    setProps(newProps);
    onUpdateProps(node.id, newProps);
  };

  const renderPropInput = (key, value) => {
    const inputType = typeof value === 'number' ? 'number' : 'text';

    if (key === 'color') {
      return (
        <input
          type="color"
          value={value}
          onChange={(e) => handlePropChange(key, e.target.value)}
          className="w-full h-10 border border-gray-300 rounded cursor-pointer"
        />
      );
    }

    if (key === 'size') {
      return (
        <select
          value={value}
          onChange={(e) => handlePropChange(key, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      );
    }

    return (
      <input
        type={inputType}
        value={value}
        onChange={(e) => handlePropChange(key, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    );
  };

  return (
    <div className="w-80 bg-white border-l shadow-sm overflow-y-auto">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-bold text-lg text-gray-800">Properties</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 font-bold text-xl"
        >
          ×
        </button>
      </div>

      <div className="p-4 border-b bg-blue-50">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">
            {node.data.label.split(' ')[0]}
          </span>
          <p className="font-semibold text-gray-800">{node.data.type}</p>
        </div>
        <p className="text-xs text-gray-600">ID: {node.id}</p>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h4 className="font-semibold text-sm text-gray-700 mb-3">Component Properties</h4>
          {Object.entries(props).map(([key, value]) => (
            <div key={key} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              {renderPropInput(key, value)}
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold text-sm text-gray-700 mb-3">Position</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">X</label>
              <input
                type="number"
                value={Math.round(node.position.x)}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Y</label>
              <input
                type="number"
                value={Math.round(node.position.y)}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold text-sm text-gray-700 mb-2">Actions</h4>
          <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition mb-2">
            Duplicate Component
          </button>
          <button className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition">
            Add Event Handler
          </button>
        </div>
      </div>

      <div className="p-4 border-t bg-gray-50">
        <p className="text-xs text-gray-600">
          💡 Tip: Click components on canvas to edit properties
        </p>
      </div>
    </div>
  );
}