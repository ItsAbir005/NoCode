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
  const [currentPageId, setCurrentPageId] = useState('home');
  const [pages, setPages] = useState([]);
  const stateManager = useRef(null);
  const navigate = useNavigate();
  const isSwitchingPage = useRef(false);

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
      let loadedPages = [];
      try {
        // Handle both string and array formats for pages
        if (result.data.pages) {
          loadedPages = typeof result.data.pages === 'string'
            ? JSON.parse(result.data.pages)
            : result.data.pages;
        }

        // Ensure loadedPages is an array
        if (!Array.isArray(loadedPages) || loadedPages.length === 0) {
          loadedPages = [{ id: 'home', name: 'Home', path: '/', components: [] }];
        }

        // Sanitize pages: ensure every page has a path
        loadedPages = loadedPages.map((page, index) => ({
          ...page,
          path: page.path || (page.id === 'home' ? '/' : `/page-${index + 1}`),
          components: page.components || []
        }));
      } catch (e) {
        console.error('Error parsing pages:', e);
        loadedPages = [{ id: 'home', name: 'Home', path: '/', components: [] }];
      }

      // Update project with parsed pages to ensure views get array
      setProject({ ...result.data, pages: loadedPages });
      setPages(loadedPages);

      // Initialize state from first page
      const firstPage = loadedPages[0];
      setCurrentPageId(firstPage.id);
      setComponents(firstPage.components || []);

      setHistory([firstPage.components || []]);
      setHistoryIndex(0);
      setSaveStatus('saved');
    } else {
      alert('Failed to load project');
      navigate('/dashboard');
    }

    setLoading(false);
  };

  // Switch to a different page
  const switchPage = useCallback((pageId) => {
    console.log('🔄 Switching to page:', pageId);
    isSwitchingPage.current = true;

    // 1. Save current page components before switching
    setPages(prevPages => {
      const updatedPages = prevPages.map(page =>
        page.id === currentPageId
          ? { ...page, components: components }
          : page
      );

      // 2. Find new page
      const newPage = updatedPages.find(p => p.id === pageId);
      if (!newPage) {
        console.error(`❌ Page not found: ${pageId}`);
        isSwitchingPage.current = false;
        return prevPages;
      }

      console.log('✅ Found new page:', newPage.name, 'with', newPage.components?.length || 0, 'components');

      // 3. Update current page ID
      setCurrentPageId(pageId);

      // 4. Update components for the new page
      setComponents(newPage.components || []);

      // 5. Reset history for the new page
      setHistory([newPage.components || []]);
      setHistoryIndex(0);
      setSaveStatus('saved');
      setSelectedComponent(null);

      // 6. Save to backend
      setTimeout(() => {
        saveProject({
          pages: JSON.stringify(updatedPages),
          components: JSON.stringify(newPage.components || [])
        });
        isSwitchingPage.current = false;
      }, 100);

      return updatedPages;
    });
  }, [currentPageId, components]);

  // Save project
  const saveProject = useCallback(async (data) => {
    setSaveStatus('saving');

    // Get latest state
    const currentComponents = data.components || components;
    let finalPages = pages;

    // Check if we are updating the pages structure directly
    if (data.pages) {
      try {
        finalPages = typeof data.pages === 'string'
          ? JSON.parse(data.pages)
          : data.pages;
      } catch (e) {
        console.error("Error parsing provided pages:", e);
      }
    } else if (!isSwitchingPage.current) {
      // Only update current page components if not switching
      finalPages = pages.map(p =>
        p.id === currentPageId ? { ...p, components: currentComponents } : p
      );
    }

    const saveData = {
      ...data,
      pages: JSON.stringify(finalPages),
      components: JSON.stringify(currentComponents)
    };

    const result = await stateManager.current.saveProject(saveData);

    if (result.success) {
      setSaveStatus('saved');
      if (result.data) {
        setProject(prev => ({
          ...prev,
          ...result.data,
          pages: finalPages
        }));

        // If we updated pages structure from outside (e.g. PageManager), sync local state
        if (data.pages) {
          setPages(finalPages);
        }
      }
      return true;
    } else {
      setSaveStatus('error');
      return false;
    }
  }, [components, pages, currentPageId]);

  // Update components with auto-save
  const updateComponents = useCallback((newComponents) => {
    if (isSwitchingPage.current) {
      console.log('⏭️ Ignoring component update during page switch');
      return;
    }

    console.log('📝 Updating components:', newComponents.length);
    setComponents(newComponents);
    setSaveStatus('unsaved');
    
    setHistory(prev => {
      const nextIndex = historyIndex + 1;
      const newHistory = prev.slice(0, nextIndex);
      newHistory.push(newComponents);
      return newHistory.slice(-50);
    });

    setHistoryIndex(prev => Math.min(prev + 1, 49));

    // Update pages state
    setPages(prevPages => 
      prevPages.map(p =>
        p.id === currentPageId ? { ...p, components: newComponents } : p
      )
    );

    // Format data for save
    const saveData = {
      components: JSON.stringify(newComponents)
    };

    stateManager.current.autoSave(
      saveData,
      2000,
      (status) => setSaveStatus(status)
    );
  }, [historyIndex, currentPageId]);

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
    if (stateManager.current && !loading && !isSwitchingPage.current) {
      stateManager.current.startPeriodicSave(
        () => {
          const updatedPages = pages.map(p =>
            p.id === currentPageId ? { ...p, components: components } : p
          );
          return {
            pages: JSON.stringify(updatedPages),
            components: JSON.stringify(components)
          };
        },
        30000 // 30 seconds
      );
    }
  }, [components, loading, pages, currentPageId]);

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
    pages,
    components,
    loading,
    saveStatus,
    selectedComponent,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    lastSaved: stateManager.current?.getLastSaveFormatted(),
    currentPageId,

    // Actions
    updateComponents,
    setSelectedComponent,
    switchPage,
    undo,
    redo,
    manualSave,
    updateProjectMetadata,
    reloadProject: loadProject,
  };
}
export default useProjectEditor;