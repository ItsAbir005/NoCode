const JSZip = require('jszip');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// Utility function to generate React component code based on node type and properties
const generateComponentCode = (node) => {
  const { type, props } = node.data;

  switch (type) {
    case 'Button':
      return `<button
  onClick={() => handleButtonClick('${node.id}')}
  className="px-6 py-3 rounded-lg font-semibold transition hover:shadow-lg"
  style={{ backgroundColor: '${props.color || '#3B82F6'}', color: 'white' }}
>
  ${props.text || 'Button'}
</button>`;

    case 'Input':
      return `<div className="mb-4">
  ${props.label ? `<label className="block text-sm font-medium text-gray-700 mb-2">\n    ${props.label}\n  </label>` : ''}
  <input
    type="${props.type || 'text'}"
    placeholder="${props.placeholder || ''}"
    value={values.${node.id} || ''}
    onChange={(e) => handleInputChange('${node.id}', e.target.value)}
    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
  />
</div>`;

    case 'Text':
      return `<p style={{ fontSize: '${props.fontSize || 16}px', color: '${props.color || '#000000'}' }}>
  ${props.content || 'Text'}
</p>`;

    case 'Image':
      return `<img
  src="${props.url || 'https://via.placeholder.com/150'}"
  alt="${props.alt || 'Image'}"
  className="max-w-full h-auto rounded-lg"
/>`;

    case 'Form':
      return `<form onSubmit={handleSubmit} className="border rounded-lg p-6 bg-white">
  <h3 className="text-xl font-bold mb-4">${props.title || 'Form'}</h3>
  {/* Form fields will be rendered here */}
  <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600">
    Submit
  </button>
</form>`;

    default:
      return `<div className="p-4 border rounded">{/* ${type} Component */}</div>`;
  }
};
// Utility function to generate workflow handler code based on workflow definitions
const generateWorkflowCode = (workflows, nodes) => {
  const handlers = workflows.map(workflow => {
    const actionCode = workflow.actions.map(action => {
      switch(action.type) {
        case 'toggle_visibility':
          return `    setComponentStates(prev => ({
      ...prev,
      '${action.targetId}': { ...prev['${action.targetId}'], visible: ${action.visible} }
    }));`;
        
        case 'api_call':
          return `    try {
      const response = await fetch('${action.url}', {
        method: '${action.method || 'GET'}',
        headers: { 'Content-Type': 'application/json' },
        ${action.body ? `body: JSON.stringify(${action.body})` : ''}
      });
      const data = await response.json();
      console.log('API Response:', data);
    } catch (error) {
      console.error('API Error:', error);
    }`;

        case 'show_toast':
          return `    showToast('${action.message}', '${action.toastType || 'success'}');`;

        default:
          return `    // ${action.type}`;
      }
    }).join('\n');

    return `  // Workflow: ${workflow.name}
  if (componentId === '${workflow.trigger.componentId}' && eventType === '${workflow.trigger.event}') {
${actionCode}
  }`;
  }).join('\n\n');

  return handlers;
};
