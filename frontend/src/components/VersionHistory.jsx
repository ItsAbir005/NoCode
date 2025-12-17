import { Clock, RotateCcw } from 'lucide-react';

export function VersionHistory({ history, currentIndex, onRestore }) {
  if (history.length === 0) return null;

  return (
    <div className="p-4 border-t border-gray-200">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Version History
      </h3>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {history.slice().reverse().map((version, index) => {
          const actualIndex = history.length - 1 - index;
          const isCurrent = actualIndex === currentIndex;
          
          return (
            <div
              key={actualIndex}
              className={`p-2 rounded text-sm ${
                isCurrent 
                  ? 'bg-indigo-50 border border-indigo-200' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">
                    Version {actualIndex + 1}
                  </span>
                  {isCurrent && (
                    <span className="ml-2 text-xs text-indigo-600">(Current)</span>
                  )}
                  <p className="text-xs text-gray-600 mt-0.5">
                    {version.length} components
                  </p>
                </div>
                
                {!isCurrent && (
                  <button
                    onClick={() => onRestore(actualIndex)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Restore this version"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}