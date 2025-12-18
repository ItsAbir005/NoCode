import { useState, useEffect } from 'react';
import { X, Maximize2, Minimize2, Monitor, Smartphone, Tablet } from 'lucide-react';

export function PreviewMode({ components, projectName, onClose }) {
  const [viewport, setViewport] = useState('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const viewportSizes = {
    desktop: { width: '100%', height: '100%', icon: Monitor },
    tablet: { width: '768px', height: '1024px', icon: Tablet },
    mobile: { width: '375px', height: '667px', icon: Smartphone },
  };

  useEffect(() => {
    // Prevent scrolling on body when preview is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const renderComponent = (component) => {
    const style = {
      position: 'absolute',
      left: component.x,
      top: component.y,
      width: component.width,
      height: component.height,
    };

    switch (component.type) {
      case 'Button':
        return (
          <button
            key={component.id}
            style={{
              ...style,
              backgroundColor: component.color,
              color: component.textColor,
              borderRadius: '6px',
              border: 'none',
              fontSize: component.fontSize,
              fontWeight: 500,
              cursor: 'pointer',
            }}
            onClick={() => alert(`Button "${component.text}" clicked!`)}
          >
            {component.text}
          </button>
        );

      case 'Text':
        return (
          <div
            key={component.id}
            style={{
              ...style,
              fontSize: component.fontSize,
              color: component.color,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {component.text}
          </div>
        );

      case 'Input':
        return (
          <input
            key={component.id}
            placeholder={component.placeholder}
            style={{
              ...style,
              padding: '8px',
              border: `1px solid ${component.borderColor}`,
              borderRadius: '6px',
              backgroundColor: component.backgroundColor,
              fontSize: 14,
            }}
          />
        );

      case 'Container':
        return (
          <div
            key={component.id}
            style={{
              ...style,
              backgroundColor: component.backgroundColor,
              border: component.border,
              borderRadius: component.borderRadius || 0,
            }}
          />
        );

      case 'Image':
        return (
          <div
            key={component.id}
            style={{
              ...style,
              backgroundColor: component.bg,
              backgroundImage: component.src ? `url(${component.src})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '4px',
            }}
          />
        );

      case 'Checkbox':
        return (
          <input
            key={component.id}
            type="checkbox"
            defaultChecked={component.checked}
            style={{
              ...style,
              cursor: 'pointer',
            }}
          />
        );

      case 'Radio':
        return (
          <input
            key={component.id}
            type="radio"
            defaultChecked={component.checked}
            style={{
              ...style,
              cursor: 'pointer',
            }}
          />
        );

      case 'Divider':
        return (
          <div
            key={component.id}
            style={{
              ...style,
              backgroundColor: component.bg,
            }}
          />
        );

      case 'Card':
        return (
          <div
            key={component.id}
            style={{
              ...style,
              backgroundColor: component.bg,
              border: component.border,
              borderRadius: component.borderRadius || 8,
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              Card Title
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Card content goes here
            </div>
          </div>
        );

      case 'Table':
        return (
          <div
            key={component.id}
            style={{
              ...style,
              backgroundColor: component.backgroundColor,
              border: component.border,
              overflow: 'auto',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Email</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map(i => (
                  <tr key={i}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>User {i}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>user{i}@example.com</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>Active</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'List':
        return (
          <div
            key={component.id}
            style={{
              ...style,
              backgroundColor: component.bg,
              border: component.border,
              overflow: 'auto',
              padding: '8px',
            }}
          >
            {['Item 1', 'Item 2', 'Item 3', 'Item 4'].map((item, i) => (
              <div
                key={i}
                style={{
                  padding: '12px',
                  borderBottom: i < 3 ? '1px solid #e5e7eb' : 'none',
                  fontSize: '14px',
                }}
              >
                {item}
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div
            key={component.id}
            style={{
              ...style,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              border: component.border,
              backgroundColor: component.bg || component.backgroundColor,
              borderRadius: component.borderRadius || 0,
            }}
          >
            {component.type}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="h-14 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h2 className="text-white font-semibold">{projectName} - Preview</h2>
          
          {/* Viewport Selector */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            {Object.entries(viewportSizes).map(([key, { icon: Icon }]) => (
              <button
                key={key}
                onClick={() => setViewport(key)}
                className={`px-3 py-1.5 rounded flex items-center gap-2 transition-colors ${
                  viewport === key
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm capitalize">{key}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFullscreen}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div
          className="bg-white shadow-2xl transition-all duration-300 ease-in-out"
          style={{
            width: viewportSizes[viewport].width,
            height: viewportSizes[viewport].height,
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        >
          <div
            className="relative w-full h-full overflow-auto"
            style={{
              width: viewport === 'desktop' ? '1024px' : viewportSizes[viewport].width,
              height: viewport === 'desktop' ? '600px' : viewportSizes[viewport].height,
              margin: '0 auto',
            }}
          >
            {components.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No components to preview</p>
                </div>
              </div>
            ) : (
              components.map(renderComponent)
            )}
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="h-10 bg-gray-900 border-t border-gray-700 flex items-center justify-between px-4 text-sm text-gray-400">
        <span>{components.length} components</span>
        <span>
          {viewportSizes[viewport].width} × {viewportSizes[viewport].height}
        </span>
      </div>
    </div>
  );
}