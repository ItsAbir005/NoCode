import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Loader2, Wand2, Lightbulb, Zap } from "lucide-react";

const quickPrompts = [
  "Create a login form with email and password",
  "Add a navigation bar with logo and menu",
  "Create a card layout for displaying products",
  "Build a contact form with validation",
  "Add a hero section with title and CTA button",
  "Create a dashboard sidebar",
];

export function AIChatPanel({ isOpen, onClose, onComponentsGenerated, existingComponents }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const API_URL = 'http://localhost:8000';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    setMessage("");
    setError(null);
    
    // Add user message
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/ai/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: userMessage,
          existingComponents: existingComponents || []
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate components');
      }

      const data = await response.json();
      
      if (data.success && data.components && data.components.length > 0) {
        // Add success message
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `✨ Created ${data.components.length} component${data.components.length > 1 ? 's' : ''} for you! Check your canvas.`,
          components: data.components
        }]);
        
        // Notify parent to add components
        if (onComponentsGenerated) {
          onComponentsGenerated(data.components);
        }
      } else {
        throw new Error('No components were generated');
      }
    } catch (err) {
      console.error('AI error:', err);
      setError(err.message);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `❌ Sorry, I couldn't generate components: ${err.message}. Please try rephrasing your request.`,
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    setMessage(prompt);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-[420px] h-[600px] bg-white border border-gray-200 rounded-xl shadow-2xl flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-semibold text-sm text-gray-900">AI Assistant</span>
            <p className="text-xs text-gray-600">Powered by Gemini</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wand2 className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              What would you like to build?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Describe your UI and I'll create it for you
            </p>
            
            {/* Quick Actions */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Try these examples:
              </p>
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="w-full text-left px-4 py-3 text-sm bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-lg transition-all group"
                >
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 group-hover:text-indigo-700">
                      {prompt}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : msg.isError
                      ? "bg-red-50 text-red-900 border border-red-200"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {msg.content}
                  {msg.components && msg.components.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs opacity-75 mb-1">Generated:</p>
                      <div className="flex flex-wrap gap-1">
                        {msg.components.map((comp, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-white bg-opacity-20 rounded text-xs"
                          >
                            {comp.type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-2xl flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span className="text-sm text-gray-600">Generating components...</span>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-sm text-red-800">
          <div className="flex items-center gap-2">
            <span className="font-medium">Error:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build..."
            disabled={loading}
            className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || loading}
            className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span className="font-medium">Generate</span>
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

export default AIChatPanel;