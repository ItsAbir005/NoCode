// frontend/src/pages/Preview.jsx
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/client';

export default function Preview() {
  const { projectId } = useParams();
  const [canvas, setCanvas] = useState(null);
  const [viewMode, setViewMode] = useState('desktop'); // desktop, tablet, mobile

  useEffect(() => {
    loadCanvas();
  }, [projectId]);

  const loadCanvas = async () => {
    const { data } = await api.get(`/canvas/${projectId}`);
    setCanvas(data.canvas);
  };

  const renderComponent = (node) => {
    const { type, props } = node.data;
    
    switch(type) {
      case 'Button':
        return (
          <button 
            className="px-6 py-3 rounded-lg font-semibold"
            style={{ 
              backgroundColor: props.color,
              fontSize: props.size === 'large' ? '18px' : props.size === 'small' ? '14px' : '16px'
            }}
          >
            {props.text}
          </button>
        );
        
      case 'Input':
        return (
          <div className="mb-4">
            {props.label && (
              <label className="block text-sm font-medium mb-2">{props.label}</label>
            )}
            <input 
              type={props.type}
              placeholder={props.placeholder}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );
        
      case 'Text':
        return (
          <p style={{ 
            fontSize: props.fontSize + 'px', 
            color: props.color 
          }}>
            {props.content}
          </p>
        );
        
      case 'Image':
        return (
          <img 
            src={props.url} 
            alt={props.alt}
            className="max-w-full h-auto rounded-lg"
          />
        );
        
      case 'Form':
        return (
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">{props.title}</h3>
            {/* Render form fields */}
          </div>
        );
        
      default:
        return <div className="p-4 border rounded">{type}</div>;
    }
  };

  const getViewportWidth = () => {
    switch(viewMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
      default: return '100%';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toolbar */}
      <div className="bg-white border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Preview Mode</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('mobile')}
            className={`px-4 py-2 rounded ${viewMode === 'mobile' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            📱 Mobile
          </button>
          <button
            onClick={() => setViewMode('tablet')}
            className={`px-4 py-2 rounded ${viewMode === 'tablet' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            📱 Tablet
          </button>
          <button
            onClick={() => setViewMode('desktop')}
            className={`px-4 py-2 rounded ${viewMode === 'desktop' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            💻 Desktop
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex justify-center p-8">
        <div 
          className="bg-white rounded-xl shadow-lg p-8 transition-all"
          style={{ width: getViewportWidth(), minHeight: '600px' }}
        >
          {canvas?.layout?.nodes?.map(node => (
            <div 
              key={node.id} 
              className="mb-6"
              style={{
                position: 'relative',
                left: `${node.position.x / 10}px`,
                top: `${node.position.y / 10}px`
              }}
            >
              {renderComponent(node)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}