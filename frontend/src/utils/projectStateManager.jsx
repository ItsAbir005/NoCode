class ProjectStateManager {
  constructor(projectId, apiUrl = 'http://localhost:8000') {
    this.projectId = projectId;
    this.apiUrl = apiUrl;
    this.saveTimeout = null;
    this.saveInterval = null;
    this.lastSaveTime = null;
    this.isDirty = false;
  }

  // Save project state
  async saveProject(data) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.apiUrl}/projects/${this.projectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to save project');
      }

      const result = await response.json();
      this.lastSaveTime = new Date();
      this.isDirty = false;
      return { success: true, data: result.project };
    } catch (error) {
      console.error('Save error:', error);
      return { success: false, error: error.message };
    }
  }

  // Load project state
  async loadProject() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.apiUrl}/projects/${this.projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load project');
      }

      const result = await response.json();
      return { success: true, data: result.project };
    } catch (error) {
      console.error('Load error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Auto-save with debounce
  autoSave(data, delay = 2000, onStatusChange) {
    this.isDirty = true;
    
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(async () => {
      if (onStatusChange) onStatusChange('saving');
      const result = await this.saveProject(data);
      if (result.success) {
        console.log('Auto-saved at', new Date().toLocaleTimeString());
        if (onStatusChange) onStatusChange('saved');
      } else {
        if (onStatusChange) onStatusChange('error');
      }
    }, delay);
  }

  // Start periodic auto-save (every 30 seconds)
  startPeriodicSave(getData, interval = 30000) {
    this.stopPeriodicSave(); // Clear existing interval

    this.saveInterval = setInterval(async () => {
      if (this.isDirty) {
        const data = getData();
        await this.saveProject(data);
      }
    }, interval);
  }

  // Stop periodic auto-save
  stopPeriodicSave() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
  }

  // Cleanup
  cleanup() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.stopPeriodicSave();
  }

  // Get last save time formatted
  getLastSaveFormatted() {
    if (!this.lastSaveTime) return 'Never';

    const now = new Date();
    const diff = Math.floor((now - this.lastSaveTime) / 1000);

    if (diff < 10) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return this.lastSaveTime.toLocaleTimeString();
  }
}

export default ProjectStateManager;
