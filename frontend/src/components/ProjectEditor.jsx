import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../editor/TopBar';
import { LeftSidebar } from '../editor/LeftSidebar';
import { MainCanvas } from '../editor/MainCanvas';
import { RightSidebar } from '../editor/RightSidebar';
import { AIChatPanel } from '../editor/AIChatPanel';
import { Cloud, CloudOff, AlertCircle } from 'lucide-react';

const ProjectEditor = ({ projectId }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); 
  const [lastSaved, setLastSaved] = useState(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [components, setComponents] = useState([]);
  const saveTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const API_URL = 'http://localhost:8000';

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  // Auto-save on components change
  useEffect(() => {
    if (!project || components.length === 0) return;
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Mark as unsaved
    setSaveStatus('unsaved');

    // Save after 2 seconds of no changes
    saveTimeoutRef.current = setTimeout(() => {
      handleAutoSave();
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [components]);

  // Periodic auto-save every 30 seconds
  useEffect(() => {
    if (!project) return;

    const interval = setInterval(() => {
      if (saveStatus === 'unsaved') {
        handleAutoSave();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [project, saveStatus]);

  // Save before leaving
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (saveStatus === 'unsaved') {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus]);

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
      
      // Load saved components
      if (data.project.pages && typeof data.project.pages === 'string') {
        try {
          const savedComponents = JSON.parse(data.project.pages);
          if (Array.isArray(savedComponents)) {
            setComponents(savedComponents);
          }
        } catch (e) {
          console.error('Error parsing saved components:', e);
        }
      } else if (Array.isArray(data.project.pages)) {
        setComponents(data.project.pages);
      }

      setLastSaved(new Date(data.project.updatedAt));
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error fetching project:', error);
      alert('Failed to load project');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSave = useCallback(async () => {
    if (!project || saving) return;

    setSaving(true);
    setSaveStatus('saving');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pages: JSON.stringify(components),
          components: JSON.stringify(components)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save project');
      }

      const data = await response.json();
      setLastSaved(new Date());
      setSaveStatus('saved');
      setProject(prev => ({ ...prev, updatedAt: data.project.updatedAt }));
    } catch (error) {
      console.error('Error saving project:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  }, [project, projectId, components, saving]);

  const handleManualSave = async () => {
    await handleAutoSave();
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
    // Save before preview
    handleManualSave().then(() => {
      alert('Preview mode coming soon!');
    });
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
          pages: JSON.stringify(components),
          components: JSON.stringify(components)
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

  // Expose components update function
  const handleComponentsChange = useCallback((newComponents) => {
    setComponents(newComponents);
  }, []);

  useEffect(() => {
    window.__onComponentsChange = handleComponentsChange;
  }, [handleComponentsChange]);

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    
    const now = new Date();
    const diff = Math.floor((now - lastSaved) / 1000); // seconds
    
    if (diff < 10) return 'just now';
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    
    return lastSaved.toLocaleTimeString();
  };

  const SaveStatusIndicator = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="flex items-center gap-2 text-xs text-blue-600">
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent" />
            Saving...
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center gap-2 text-xs text-green-600">
            <Cloud className="w-3.5 h-3.5" />
            Saved {formatLastSaved()}
          </div>
        );
      case 'unsaved':
        return (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <CloudOff className="w-3.5 h-3.5" />
            Unsaved changes
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-xs text-red-600 cursor-pointer" onClick={handleManualSave}>
            <AlertCircle className="w-3.5 h-3.5" />
            Save failed - Click to retry
          </div>
        );
      default:
        return null;
    }
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
        saveStatus={<SaveStatusIndicator />}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-white">
          <LeftSidebar />
        </div>

        {/* Main Canvas */}
        <div className="flex-1">
          <MainCanvas 
            onSelectionChange={handleSelectionChange}
            initialComponents={components}
            onComponentsChange={handleComponentsChange}
          />
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