import { useState } from 'react';
import api from '../api/client';

export default function AIChat({ projectId, currentLayout, onLayoutGenerated, onLayoutImproved }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('generate'); // 'generate' or 'improve'

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/generate-layout', {
        description: prompt,
        projectId,
      });
      
      onLayoutGenerated(data.layout);
      setPrompt('');
    } catch (err) {
      setError(err.response?.data?.error || 'AI generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!prompt.trim()) return;

    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/improve-layout', {
        currentLayout,
        improvement: prompt,
      });
      
      onLayoutImproved(data.layout);
      setPrompt('');
    } catch (err) {
      setError(err.response?.data?.error || 'AI improvement failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'generate') {
      handleGenerate();
    } else {
      handleImprove();
    }
  };

  const examplePrompts = [
    "Create a login form with email and password",
    "Build a dashboard with user stats and charts",
    "Design a contact form with name, email, and message",
    "Create a product card with image, title, and price",
    "Build a user profile page",
  ];

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-5 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">✨</span>
        <div>
          <h3 className="font-bold text-lg text-gray-800">AI Assistant</h3>
          <p className="text-xs text-gray-600">Describe what you want to build</p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('generate')}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition ${
            mode === 'generate'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          🎨 Generate
        </button>
        <button
          onClick={() => setMode('improve')}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition ${
            mode === 'improve'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          disabled={!currentLayout?.nodes?.length}
        >
          ✏️ Improve
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg mb-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            mode === 'generate'
              ? "E.g., Create a login form with email and password fields..."
              : "E.g., Make the buttons bigger and change colors to blue..."
          }
          className="w-full p-3 border-2 border-purple-300 rounded-lg mb-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          rows={4}
        />

        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⚡</span>
              Generating with AI...
            </span>
          ) : (
            `✨ ${mode === 'generate' ? 'Generate Layout' : 'Improve Layout'}`
          )}
        </button>
      </form>

      {/* Example Prompts */}
      {mode === 'generate' && (
        <div className="mt-4 pt-4 border-t border-purple-200">
          <p className="text-xs font-semibold text-gray-700 mb-2">💡 Try these examples:</p>
          <div className="space-y-2">
            {examplePrompts.slice(0, 3).map((example, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(example)}
                className="w-full text-left text-xs bg-white hover:bg-purple-50 text-gray-700 px-3 py-2 rounded-lg border border-purple-200 transition"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-purple-200">
        <p className="text-xs text-gray-600 text-center">
          🤖 Powered by GPT-4 • Natural language understanding
        </p>
      </div>
    </div>
  );
}