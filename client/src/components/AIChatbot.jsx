import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, MessageSquare, Bot, User } from 'lucide-react';
import { aiService } from '../services/api';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hi there! 🌾 I am your AI Farming Assistant. Ask me anything about crop advice, fertilizer suggestions, weather planning, or market prices!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiService.chatBot(userMessage.text);
      const botMessage = {
        id: messages.length + 2,
        sender: 'bot',
        text: response.data.response,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage = {
        id: messages.length + 2,
        sender: 'bot',
        text: 'Sorry, I am having trouble connecting to the agricultural database. Please check your network.',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Toggle button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-4 shadow-lg hover:scale-105 transition-all cursor-pointer"
          title="Chat with AI Farming Assistant"
        >
          <Sparkles className="w-6 h-6" />
        </button>
      )}

      {/* Chat Drawer */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] bg-white rounded-2xl border border-emerald-100 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-emerald-800 text-white px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 p-1.5 rounded-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold leading-tight">AI Farming Assistant</h4>
                <span className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  Active Agronomy Expert
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-emerald-200 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-emerald-50/10">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div className={`p-1.5 rounded-full h-8 w-8 flex items-center justify-center shrink-0 ${
                  msg.sender === 'user' ? 'bg-emerald-100' : 'bg-emerald-800'
                }`}>
                  {msg.sender === 'user' ? (
                    <User className="w-4 h-4 text-emerald-950" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                
                <div className={`p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-white border border-emerald-50 text-emerald-950 rounded-tl-none'
                }`}>
                  {msg.text}
                  <span className={`block text-[9px] mt-1 text-right ${
                    msg.sender === 'user' ? 'text-emerald-200' : 'text-emerald-500'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-2 max-w-[85%]">
                <div className="bg-emerald-800 p-1.5 rounded-full h-8 w-8 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="p-3 bg-white border border-emerald-50 text-emerald-950 rounded-2xl rounded-tl-none shadow-xs text-xs flex items-center gap-1.5">
                  <span>AI is thinking</span>
                  <span className="flex gap-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce delay-75" />
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce delay-150" />
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-emerald-50 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none text-emerald-950"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl p-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChatbot;
