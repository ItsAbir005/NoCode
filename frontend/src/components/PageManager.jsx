// frontend/src/components/PageManager.jsx
import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, FileText, Home, Settings as SettingsIcon } from 'lucide-react';

export function PageManager({ project, pages = [], onPagesUpdate, currentPageId, onPageChange }) {
  // Removed local pages state to rely on props
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const handleAddPage = () => {
    const newPage = {
      id: `page-${Date.now()}`,
      name: 'New Page',
      path: `/page-${pages.length + 1}`,
      components: []
    };
    const updated = [...pages, newPage];
    onPagesUpdate(updated);
    onPageChange(newPage.id);
  };

  const handleDeletePage = (pageId) => {
    if (pages.length === 1) {
      alert('Cannot delete the last page');
      return;
    }
    if (confirm('Are you sure you want to delete this page?')) {
      const updated = pages.filter(p => p.id !== pageId);
      onPagesUpdate(updated);
      if (currentPageId === pageId) {
        onPageChange(updated[0].id);
      }
    }
  };

  const handleStartEdit = (page) => {
    setEditingId(page.id);
    setEditName(page.name);
  };

  const handleSaveEdit = (pageId) => {
    const updated = pages.map(p =>
      p.id === pageId ? { ...p, name: editName } : p
    );
    onPagesUpdate(updated);
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const getIcon = (page) => {
    if (!page.path) return FileText;
    if (page.path === '/') return Home;
    if (page.path.includes('settings')) return SettingsIcon;
    return FileText;
  };

  return (
    <div className="border-b border-gray-200 p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Pages
        </h3>
        <button
          onClick={handleAddPage}
          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          title="Add new page"
        >
          <Plus className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto">
        {pages.map((page) => {
          const Icon = getIcon(page);
          const isActive = currentPageId === page.id;
          const isEditing = editingId === page.id;

          return (
            <div
              key={page.id}
              className={`flex items-center gap-2 px-2 py-2 rounded text-sm ${isActive
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />

              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(page.id);
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(page.id)}
                    className="p-1 hover:bg-green-100 rounded"
                  >
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 hover:bg-red-100 rounded"
                  >
                    <X className="w-3.5 h-3.5 text-red-600" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onPageChange(page.id)}
                    className="flex-1 text-left"
                  >
                    <span className="font-medium">{page.name}</span>
                    <span className="text-xs text-gray-500 ml-2">{page.path}</span>
                  </button>
                  <button
                    onClick={() => handleStartEdit(page)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {pages.length > 1 && (
                    <button
                      onClick={() => handleDeletePage(page.id)}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          {pages.length} page{pages.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}