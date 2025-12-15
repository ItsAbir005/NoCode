import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../editor/TopBar';
import { LeftSidebar } from '../editor/LeftSidebar';
import { MainCanvas } from '../editor/MainCanvas';
import { RightSidebar } from '../editor/RightSidebar';
import { AIChatPanel } from '../editor/AIChatPanel';

const ProjectEditor = ({ projectId }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const navigate = useNavigate();
  const API_URL = 'http://localhost:8000';

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }

      const data = await response.json();
      setProject(data.project);
    } catch (error) {
      console.error('Error fetching project:', error);
      alert('Failed to load project');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectNameChange = async (newName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newName })
      });

      if (!response.ok) {
        throw new Error('Failed to update project name');
      }

      setProject({ ...project, name: newName });
    } catch (error) {
      console.error('Error updating project name:', error);
      alert('Failed to update project name');
    }
  };

  const handlePreview = () => {
    alert('Preview mode coming soon!');
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: 'active',
          // Add any canvas state you want to save here
        })
      });

      if (!response.ok) {
        throw new Error('Failed to publish project');
      }

      alert('Project published successfully!');
    } catch (error) {
      console.error('Error publishing project:', error);
      alert('Failed to publish project');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectionChange = (component) => {
    setSelectedComponent(component);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <TopBar
        projectName={project.name}
        onProjectNameChange={handleProjectNameChange}
        onPreview={handlePreview}
        onPublish={handlePublish}
        onToggleAI={() => setIsAIOpen(!isAIOpen)}
        isAIOpen={isAIOpen}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-white">
          <LeftSidebar />
        </div>

        {/* Main Canvas */}
        <div className="flex-1">
          <MainCanvas onSelectionChange={handleSelectionChange} />
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l border-gray-200 bg-white">
          <RightSidebar selectedComponent={selectedComponent} />
        </div>
      </div>

      {/* AI Chat Panel */}
      <AIChatPanel isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
    </div>
  );
};

export default ProjectEditor;