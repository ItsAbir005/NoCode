// frontend/src/utils/componentRenderer.jsx
import React from 'react';
export const ComponentRenderer = ({ component, isSelected, onSelect, onUpdate, isPreview }) => {
  const baseClasses = isPreview 
    ? '' 
    : `relative border-2 ${isSelected ? 'border-indigo-600 bg-indigo-50' : 'border-dashed border-gray-300'} rounded-lg p-4 cursor-pointer hover:border-indigo-400 transition-all group`;

  const commonProps = {
    onClick: (e) => {
      if (!isPreview) {
        e.stopPropagation();
        onSelect(component);
      }
    },
    className: baseClasses,
    style: component.style || {}
  };

  // Render delete button for non-preview mode
  const DeleteButton = () => !isPreview && isSelected && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (window.confirm('Delete this component?')) {
          onUpdate('delete', component.id);
        }
      }}
      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );

  switch (component.type) {
    case 'button':
      return (
        <div {...commonProps}>
          <DeleteButton />
          <button
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              component.props.variant === 'primary'
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : component.props.variant === 'secondary'
                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            style={component.props.customStyle || {}}
          >
            {component.props.text || 'Button'}
          </button>
        </div>
      );

    case 'text':
      const TextTag = component.props.tag || 'p';
      return (
        <div {...commonProps}>
          <DeleteButton />
          <TextTag
            className={`text-${component.props.size || 'base'} ${component.props.bold ? 'font-bold' : ''} ${component.props.italic ? 'italic' : ''}`}
            style={{ color: component.props.color || '#000' }}
          >
            {component.props.content || 'Text content'}
          </TextTag>
        </div>
      );

    case 'heading':
      const HeadingTag = `h${component.props.level || 1}`;
      return (
        <div {...commonProps}>
          <DeleteButton />
          <HeadingTag className={`text-${component.props.size || '2xl'} font-bold`}>
            {component.props.content || 'Heading'}
          </HeadingTag>
        </div>
      );

    case 'input':
      return (
        <div {...commonProps}>
          <DeleteButton />
          <div className="space-y-2">
            {component.props.label && (
              <label className="block text-sm font-medium text-gray-700">
                {component.props.label}
              </label>
            )}
            <input
              type={component.props.type || 'text'}
              placeholder={component.props.placeholder || 'Enter text'}
              required={component.props.required}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>
        </div>
      );

    case 'textarea':
      return (
        <div {...commonProps}>
          <DeleteButton />
          <div className="space-y-2">
            {component.props.label && (
              <label className="block text-sm font-medium text-gray-700">
                {component.props.label}
              </label>
            )}
            <textarea
              placeholder={component.props.placeholder || 'Enter text'}
              rows={component.props.rows || 4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>
        </div>
      );

    case 'form':
      return (
        <div {...commonProps}>
          <DeleteButton />
          <form className="space-y-4 border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center text-sm text-gray-500">
              Form Container - Add inputs inside
            </div>
          </form>
        </div>
      );

    case 'image':
      return (
        <div {...commonProps}>
          <DeleteButton />
          {component.props.src ? (
            <img
              src={component.props.src}
              alt={component.props.alt || 'Image'}
              className="w-full h-auto rounded-lg"
              style={{ maxWidth: component.props.width || '100%' }}
            />
          ) : (
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">No image selected</p>
            </div>
          )}
        </div>
      );

    case 'container':
      return (
        <div {...commonProps}>
          <DeleteButton />
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 min-h-[100px]"
            style={{
              padding: component.props.padding || '24px',
              backgroundColor: component.props.backgroundColor || 'transparent'
            }}
          >
            <div className="text-center text-sm text-gray-500">
              Container - Drop components here
            </div>
          </div>
        </div>
      );

    case 'grid':
      const columns = component.props.columns || 2;
      return (
        <div {...commonProps}>
          <DeleteButton />
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: component.props.gap || '16px'
            }}
          >
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[100px]">
                <div className="text-center text-sm text-gray-500">Column {i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'card':
      return (
        <div {...commonProps}>
          <DeleteButton />
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-2">{component.props.title || 'Card Title'}</h3>
            <p className="text-gray-600">{component.props.content || 'Card content goes here'}</p>
          </div>
        </div>
      );

    case 'divider':
      return (
        <div {...commonProps}>
          <DeleteButton />
          <hr className={`border-t-2 ${component.props.style === 'dashed' ? 'border-dashed' : ''}`} style={{ borderColor: component.props.color || '#e5e7eb' }} />
        </div>
      );

    case 'spacer':
      return (
        <div {...commonProps}>
          <DeleteButton />
          <div style={{ height: component.props.height || '20px' }} className="bg-gray-100 rounded">
            <div className="text-center text-xs text-gray-400 pt-1">Spacer</div>
          </div>
        </div>
      );

    case 'icon':
      return (
        <div {...commonProps}>
          <DeleteButton />
          <div className="inline-flex items-center justify-center">
            <svg className={`h-${component.props.size || 6} w-${component.props.size || 6}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: component.props.color || '#000' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      );

    case 'list':
      return (
        <div {...commonProps}>
          <DeleteButton />
          <ul className={`${component.props.ordered ? 'list-decimal' : 'list-disc'} list-inside space-y-2`}>
            {(component.props.items || ['Item 1', 'Item 2', 'Item 3']).map((item, i) => (
              <li key={i} className="text-gray-700">{item}</li>
            ))}
          </ul>
        </div>
      );

    case 'table':
      return (
        <div {...commonProps}>
          <DeleteButton />
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {(component.props.columns || ['Column 1', 'Column 2', 'Column 3']).map((col, i) => (
                    <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  {(component.props.columns || ['Column 1', 'Column 2', 'Column 3']).map((_, i) => (
                    <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Data {i + 1}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'navbar':
      return (
        <div {...commonProps}>
          <DeleteButton />
          <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="text-xl font-bold text-gray-900">{component.props.brand || 'Brand'}</div>
              <div className="flex gap-6">
                {(component.props.links || ['Home', 'About', 'Contact']).map((link, i) => (
                  <a key={i} href="#" className="text-gray-600 hover:text-gray-900">{link}</a>
                ))}
              </div>
            </div>
          </nav>
        </div>
      );

    case 'footer':
      return (
        <div {...commonProps}>
          <DeleteButton />
          <footer className="bg-gray-800 text-white py-8">
            <div className="text-center">
              <p className="text-sm">{component.props.content || '© 2024 Your Company. All rights reserved.'}</p>
            </div>
          </footer>
        </div>
      );

    default:
      return (
        <div {...commonProps}>
          <DeleteButton />
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📦</div>
            <div className="text-sm font-medium text-gray-900">{component.name}</div>
            <div className="text-xs text-gray-500 mt-1">Type: {component.type}</div>
          </div>
        </div>
      );
  }
};

export default ComponentRenderer;