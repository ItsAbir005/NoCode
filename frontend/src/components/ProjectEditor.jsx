import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectEditor } from '../hooks/useProjectEditor';
import { TopBar } from '../editor/TopBar';
import { LeftSidebar } from '../editor/LeftSidebar';
import { MainCanvas } from '../editor/MainCanvas';
import { RightSidebar } from '../editor/RightSidebar';
import { AIChatPanel } from '../editor/AIChatPanel';
import { PreviewMode } from './PreviewMode';
import { Cloud, CloudOff, AlertCircle, Loader2 } from 'lucide-react';

const ProjectEditor = ({ projectId }) => {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();
  const {
    project,
    components,
    loading,
    saveStatus,
    selectedComponent,
    canUndo,
    canRedo,
    lastSaved,
    updateComponents,
    setSelectedComponent,
    undo,
    redo,
    manualSave,
    updateProjectMetadata,
  } = useProjectEditor(projectId);

  const handleProjectNameChange = async (newName) => {
    await updateProjectMetadata({ name: newName });
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handlePublish = async () => {
    const success = await updateProjectMetadata({
      status: 'active',
      components
    });

    if (success) {
      alert('Project published successfully!');
    } else {
      alert('Failed to publish project');
    }
  };

  // FIXED: Handle AI component generation
  const handleComponentsGenerated = (newComponents) => {
    console.log('AI generated components:', newComponents);
    
    // Merge with existing components
    const merged = [...components, ...newComponents];
    console.log('Merged components:', merged);
    
    // Update via the hook which handles saving
    updateComponents(merged);
    
    // Show success message
    setTimeout(() => {
      alert(`✨ Added ${newComponents.length} component${newComponents.length > 1 ? 's' : ''} to canvas!`);
    }, 100);
  };

  const SaveStatusIndicator = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="flex items-center gap-2 text-xs text-blue-600">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Saving...
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center gap-2 text-xs text-green-600">
            <Cloud className="w-3.5 h-3.5" />
            Saved {lastSaved}
          </div>
        );
      case 'unsaved':
        return (
          <div className="flex items-center gap-2 text-xs text-amber-600">
            <CloudOff className="w-3.5 h-3.5" />
            Unsaved changes
          </div>
        );
      case 'error':
        return (
          <button
            onClick={manualSave}
            className="flex items-center gap-2 text-xs text-red-600 hover:text-red-700 transition-colors"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Save failed - Click to retry
          </button>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handlePreview();
      }
      if (e.key === 'Escape' && showPreview) {
        setShowPreview(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPreview]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading project...</p>
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
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r border-gray-200 bg-white">
          <LeftSidebar />
        </div>

        <div className="flex-1">
          <MainCanvas
            initialComponents={components}
            onComponentsChange={updateComponents}
            selectedComponent={selectedComponent}
            onSelectionChange={setSelectedComponent}
          />
        </div>

        <div className="w-80 border-l border-gray-200 bg-white">
          <RightSidebar
            selectedComponent={selectedComponent}
            onUpdateComponent={(id, updates) => {
              const updated = components.map(c =>
                c.id === id ? { ...c, ...updates } : c
              );
              updateComponents(updated);
            }}
          />
        </div>
      </div>

      <AIChatPanel
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        existingComponents={components}
        onComponentsGenerated={handleComponentsGenerated}
      />

      {showPreview && (
        <PreviewMode
          components={components}
          projectName={project.name}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default ProjectEditor;