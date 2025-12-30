// frontend/src/components/ProjectEditor.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectEditor } from '../hooks/useProjectEditor';
import { TopBar } from '../editor/TopBar';
import { LeftSidebar } from '../editor/LeftSidebar';
import { MainCanvas } from '../editor/MainCanvas';
import { RightSidebar } from '../editor/RightSidebar';
import { AIChatPanel } from '../editor/AIChatPanel';
import { PreviewMode } from './PreviewMode';
import { PageManager } from './PageManager';
import { WorkflowBuilder } from './WorkflowBuilder';
import { Cloud, CloudOff, AlertCircle, Loader2, Layout, Workflow, Layers } from 'lucide-react';

const ProjectEditor = ({ projectId }) => {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [leftSidebarTab, setLeftSidebarTab] = useState('components'); // 'components' or 'workflows'
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
    switchPage,
    currentPageId,
    pages,
  } = useProjectEditor(projectId);

  // Workflow state
  const [workflows, setWorkflows] = useState([]);

  // Load workflows from project
  useEffect(() => {
    if (project?.workflows) {
      try {
        const parsedWorkflows = typeof project.workflows === 'string' 
          ? JSON.parse(project.workflows) 
          : project.workflows;
        setWorkflows(Array.isArray(parsedWorkflows) ? parsedWorkflows : []);
      } catch (e) {
        console.error('Error parsing workflows:', e);
        setWorkflows([]);
      }
    }
  }, [project]);

  // Save workflows
  const handleWorkflowsChange = async (newWorkflows) => {
    setWorkflows(newWorkflows);
    await updateProjectMetadata({ workflows: JSON.stringify(newWorkflows) });
  };

  const handleProjectNameChange = async (newName) => {
    await updateProjectMetadata({ name: newName });
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handlePublish = async () => {
    await manualSave();

    const success = await updateProjectMetadata({
      status: 'active'
    });

    if (success) {
      alert('Project published successfully!');
    } else {
      alert('Failed to publish project');
    }
  };

  const handleComponentsGenerated = async (newComponents) => {
    console.log('AI generated components:', newComponents);
    const merged = [...components, ...newComponents];
    console.log('Merged components:', merged);
    updateComponents(merged);
    
    setTimeout(async () => {
      console.log('Force saving after AI generation...');
      const saved = await manualSave();

      if (saved) {
        alert(`✨ Added ${newComponents.length} component${newComponents.length > 1 ? 's' : ''} to canvas and saved!`);
      } else {
        alert(`⚠️ Components added but save failed. Please try saving manually.`);
      }
    }, 500);
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
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        manualSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPreview]);

  // Handle resize
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const newWidth = Math.max(240, Math.min(500, e.clientX));
      setLeftSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

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
        {/* Left Sidebar with Tabs */}
        <div 
          className="border-r border-gray-200 bg-white flex flex-col relative"
          style={{ width: `${leftSidebarWidth}px` }}
        >
          {/* Tabs */}
          <div className="border-b border-gray-200 flex">
            <button
              onClick={() => setLeftSidebarTab('components')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                leftSidebarTab === 'components'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Layers className="w-4 h-4" />
              Components
            </button>
            <button
              onClick={() => setLeftSidebarTab('workflows')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                leftSidebarTab === 'workflows'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Workflow className="w-4 h-4" />
              Workflows
              {workflows.length > 0 && (
                <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-xs rounded-full">
                  {workflows.length}
                </span>
              )}
            </button>
          </div>

          {/* Page Manager (always visible at top) */}
          <PageManager
            project={project}
            pages={pages}
            onPagesUpdate={async (newPages) => {
              await updateProjectMetadata({ pages: JSON.stringify(newPages) });
            }}
            currentPageId={currentPageId}
            onPageChange={switchPage}
          />
          
          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {leftSidebarTab === 'components' ? (
              <LeftSidebar />
            ) : (
              <WorkflowBuilder
                workflows={workflows}
                onWorkflowsChange={handleWorkflowsChange}
                components={components}
              />
            )}
          </div>
          
          {/* Resize Handle */}
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-indigo-500 bg-gray-300 transition-colors"
            onMouseDown={() => setIsResizing(true)}
            style={{ 
              width: '4px',
              zIndex: 10
            }}
          />
        </div>

        {/* Main Canvas */}
        <div className="flex-1">
          <MainCanvas
            initialComponents={components}
            onComponentsChange={updateComponents}
            selectedComponent={selectedComponent}
            onSelectionChange={setSelectedComponent}
          />
        </div>

        {/* Right Sidebar */}
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

      {/* AI Chat Panel */}
      <AIChatPanel
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        existingComponents={components}
        onComponentsGenerated={handleComponentsGenerated}
      />

      {/* Preview Modal */}
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