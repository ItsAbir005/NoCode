import { useState } from "react";
import { X, Send, Sparkles } from "lucide-react";

const quickPrompts = [
  "Connect inputs to submit button",
  "Show success message after submit",
  "Add validation for email",
  "Make this responsive",
];

export default function AIChatPanel({ isOpen, onClose }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages([...messages, { role: "user", content: message }]);
    setMessage("");
    
    // TODO: Connect to AI backend
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I understand you want to make changes. This feature will be connected to an AI backend soon!",
        },
      ]);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-[380px] h-[500px] bg-white border border-gray-200 rounded-xl shadow-2xl flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 bg-gray-50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="font-medium text-sm">AI Assistant</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="w-10 h-10 mx-auto mb-3 text-indigo-300" />
            <h3 className="font-medium text-gray-900 mb-1">
              What do you want to build?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Ask me to help with your project
            </p>
            <div className="space-y-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setMessage(prompt)}
                  className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                msg.role === "user"
                  ? "ml-auto bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {msg.content}
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask AI to help..."
            className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export { AIChatPanel };