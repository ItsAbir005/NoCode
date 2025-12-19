import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectStateManager from '../utils/projectStateManager';

export function useProjectEditor(projectId) {
  const [project, setProject] = useState(null);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedComponent, setSelectedComponent] = useState(null);

  const stateManager = useRef(null);
  const navigate = useNavigate();

  // Initialize state manager
  useEffect(() => {
    stateManager.current = new ProjectStateManager(projectId);
    loadProject();

    return () => {
      if (stateManager.current) {
        stateManager.current.cleanup();
      }
    };
  }, [projectId]);

  // Load project
  const loadProject = async () => {
    setLoading(true);
    const result = await stateManager.current.loadProject();

    if (result.success) {
      setProject(result.data);

      // Parse components
      let loadedComponents = [];
      if (result.data.pages) {
        try {
          loadedComponents = typeof result.data.pages === 'string'
            ? JSON.parse(result.data.pages)
            : result.data.pages;
        } catch (e) {
          console.error('Error parsing components:', e);
        }
      }

      setComponents(Array.isArray(loadedComponents) ? loadedComponents : []);
      setHistory([loadedComponents]);
      setHistoryIndex(0);
      setSaveStatus('saved');
    } else {
      alert('Failed to load project');
      navigate('/dashboard');
    }

    setLoading(false);
  };

  // Save project
  const saveProject = useCallback(async (data) => {
    setSaveStatus('saving');

    const saveData = {
      pages: JSON.stringify(data.components || components),
      components: JSON.stringify(data.components || components),
      ...data
    };

    const result = await stateManager.current.saveProject(saveData);

    if (result.success) {
      setSaveStatus('saved');
      if (result.data) {
        setProject(prev => ({ ...prev, ...result.data }));
      }
      return true;
    } else {
      setSaveStatus('error');
      return false;
    }
  }, [components]);

  // Update components with auto-save
  const updateComponents = useCallback((newComponents) => {
    setComponents(newComponents);
    setSaveStatus('unsaved');

    // Add to history
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newComponents);
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));

    // Trigger auto-save with status callback
    stateManager.current.autoSave(
      { components: newComponents },
      2000,
      (status) => setSaveStatus(status)
    );
  }, [historyIndex]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setComponents(history[newIndex]);
      setSaveStatus('unsaved');
    }
  }, [historyIndex, history]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setComponents(history[newIndex]);
      setSaveStatus('unsaved');
    }
  }, [historyIndex, history]);

  // Manual save
  const manualSave = useCallback(async () => {
    return await saveProject({ components });
  }, [components, saveProject]);

  // Update project metadata
  const updateProjectMetadata = useCallback(async (updates) => {
    const result = await saveProject(updates);
    if (result) {
      setProject(prev => ({ ...prev, ...updates }));
    }
    return result;
  }, [saveProject]);

  // Start periodic save
  useEffect(() => {
    if (stateManager.current && !loading) {
      stateManager.current.startPeriodicSave(
        () => ({ components }),
        30000 // 30 seconds
      );
    }
  }, [components, loading]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (saveStatus === 'unsaved') {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus]);

  return {
    // State
    project,
    components,
    loading,
    saveStatus,
    selectedComponent,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    lastSaved: stateManager.current?.getLastSaveFormatted(),

    // Actions
    updateComponents,
    setSelectedComponent,
    undo,
    redo,
    manualSave,
    updateProjectMetadata,
    reloadProject: loadProject,
  };
}
