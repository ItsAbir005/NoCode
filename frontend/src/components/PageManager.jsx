// frontend/src/components/PageManager.jsx
import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, FileText, Home, Settings as SettingsIcon } from 'lucide-react';

export function PageManager({ project, pages = [], onPagesUpdate, currentPageId, onPageChange }) {
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
    // Automatically switch to the new page
    setTimeout(() => onPageChange(newPage.id), 100);
  };

  const handleDeletePage = (e, pageId) => {
    e.stopPropagation();
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

  const handleStartEdit = (e, page) => {
    e.stopPropagation();
    setEditingId(page.id);
    setEditName(page.name);
  };

  const handleSaveEdit = (e, pageId) => {
    e.stopPropagation();
    const updated = pages.map(p =>
      p.id === pageId ? { ...p, name: editName } : p
    );
    onPagesUpdate(updated);
    setEditingId(null);
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditName('');
  };

  const handlePageClick = (pageId) => {
    if (editingId === null) {
      onPageChange(pageId);
    }
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
          className="p-1.5 hover:bg-indigo-50 hover:text-indigo-600 rounded transition-colors"
          title="Add new page"
        >
          <Plus className="w-4 h-4" />
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
              className={`flex items-center gap-2 px-2 py-2 rounded text-sm group transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 border border-transparent hover:border-gray-200'
              } ${!isEditing ? 'cursor-pointer' : ''}`}
              onClick={() => handlePageClick(page.id)}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />

              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(e, page.id);
                      if (e.key === 'Escape') handleCancelEdit(e);
                    }}
                    className="flex-1 px-2 py-1 text-sm border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => handleSaveEdit(e, page.id)}
                    className="p-1 hover:bg-green-100 rounded transition-colors"
                    title="Save"
                  >
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  </button>
                  <button
                    onClick={(e) => handleCancelEdit(e)}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5 text-red-600" />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium block truncate ${isActive ? 'text-indigo-700' : 'text-gray-900'}`}>
                        {page.name}
                      </span>
                      {isActive && (
                        <span className="flex-shrink-0 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 block truncate">{page.path}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleStartEdit(e, page)}
                      className="p-1 hover:bg-indigo-100 rounded transition-colors"
                      title="Rename page"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                    {pages.length > 1 && (
                      <button
                        onClick={(e) => handleDeletePage(e, page.id)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                        title="Delete page"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{pages.length} page{pages.length !== 1 ? 's' : ''}</span>
          {currentPageId && (
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 font-medium">Active</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}