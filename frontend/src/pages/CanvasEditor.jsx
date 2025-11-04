import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import api from '../api/client';
import ComponentPalette from '../components/ComponentPalette';
import PropertiesPanel from '../components/PropertiesPanel';

export default function CanvasEditor() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [project, setProject] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProject();
    loadCanvas();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const { data } = await api.get('/projects');
      const currentProject = data.find(p => p.id === parseInt(projectId));
      setProject(currentProject);
    } catch (error) {
      console.error('Failed to load project', error);
    }
  };

  const loadCanvas = async () => {
    try {
      const { data } = await api.get(`/canvas/${projectId}`);
      if (data.canvas?.layout) {
        setNodes(data.canvas.layout.nodes || []);
        setEdges(data.canvas.layout.edges || []);
      }
    } catch (error) {
      console.error('Failed to load canvas', error);
    }
  };

  const saveCanvas = async () => {
    setSaving(true);
    try {
      await api.post(`/canvas/${projectId}`, {
        layout: { nodes, edges }
      });
      alert('Canvas saved successfully! ✅');
    } catch (error) {
      alert('Failed to save canvas ❌');
    } finally {
      setSaving(false);
    }
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const addComponent = (type) => {
    const newNode = {
      id: `${type.toLowerCase()}_${Date.now()}`,
      type: 'default',
      data: {
        label: getComponentLabel(type),
        type: type,
        props: getDefaultProps(type),
      },
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
      style: getComponentStyle(type),
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const updateNodeProps = (nodeId, newProps) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, props: newProps } }
          : node
      )
    );
  };

  const deleteSelectedNode = () => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNode(null);
  };

  const getComponentLabel = (type) => {
    const labels = {
      Button: '🔘 Button',
      Input: '📝 Input Field',
      Text: '📄 Text',
      Image: '🖼️ Image',
      Form: '📋 Form',
      Container: '📦 Container',
      Table: '📊 Table',
      Chart: '📈 Chart',
    };
    return labels[type] || type;
  };

  const getDefaultProps = (type) => {
    const defaults = {
      Button: { text: 'Click Me', color: '#3B82F6', size: 'medium' },
      Input: { placeholder: 'Enter text...', type: 'text', label: 'Input' },
      Text: { content: 'Sample Text', fontSize: '16', color: '#000000' },
      Image: { url: 'https://via.placeholder.com/150', alt: 'Image' },
      Form: { title: 'Form', fields: [] },
      Container: { width: '100%', height: 'auto', background: '#F3F4F6' },
      Table: { rows: 3, columns: 3 },
      Chart: { type: 'bar', data: [] },
    };
    return defaults[type] || {};
  };

  const getComponentStyle = (type) => {
    const styles = {
      Button: { background: '#EFF6FF', border: '2px solid #3B82F6', borderRadius: '8px', padding: '12px' },
      Input: { background: '#F9FAFB', border: '2px solid #9CA3AF', borderRadius: '8px', padding: '12px' },
      Text: { background: '#FFFBEB', border: '2px solid #F59E0B', borderRadius: '8px', padding: '12px' },
      Image: { background: '#F0FDF4', border: '2px solid #10B981', borderRadius: '8px', padding: '12px' },
      Form: { background: '#FDF2F8', border: '2px solid #EC4899', borderRadius: '8px', padding: '12px' },
      Container: { background: '#F3F4F6', border: '2px solid #6B7280', borderRadius: '8px', padding: '12px' },
      Table: { background: '#EDE9FE', border: '2px solid #8B5CF6', borderRadius: '8px', padding: '12px' },
      Chart: { background: '#FEF2F2', border: '2px solid #EF4444', borderRadius: '8px', padding: '12px' },
    };
    return styles[type] || {};
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-800 font-semibold"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {project?.name || 'Canvas Editor'}
              </h1>
              <p className="text-sm text-gray-500">Drag components onto the canvas</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={saveCanvas}
              disabled={saving}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : '💾 Save Canvas'}
            </button>
            {selectedNode && (
              <button
                onClick={deleteSelectedNode}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                🗑️ Delete
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Component Palette - Left Sidebar */}
        <ComponentPalette onAddComponent={addComponent} />

        {/* Canvas Area */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
            className="bg-gray-100"
          >
            <Controls />
            <MiniMap 
              nodeColor={(node) => {
                if (node.id === selectedNode?.id) return '#EF4444';
                return '#3B82F6';
              }}
              className="bg-white border-2 border-gray-200 rounded-lg"
            />
            <Background variant="dots" gap={16} size={1} color="#9CA3AF" />
            
            <Panel position="top-center" className="bg-white px-4 py-2 rounded-lg shadow-md">
              <div className="text-sm font-semibold text-gray-700">
                Components: {nodes.length} | Connections: {edges.length}
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Properties Panel - Right Sidebar */}
        {selectedNode && (
          <PropertiesPanel
            node={selectedNode}
            onUpdateProps={updateNodeProps}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
}