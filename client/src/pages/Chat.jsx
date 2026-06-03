import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, Bot } from 'lucide-react';
import { chatService } from '../services/api';

const Chat = () => {
  const current_user = JSON.parse(localStorage.getItem('user') || '{}');
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (activeContact) {
      fetchHistory(activeContact.id);
    }
  }, [activeContact]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchContacts = async () => {
    try {
      const res = await chatService.getContacts();
      setContacts(res.data);
      // Automatically select first contact if it exists
      if (res.data.length > 0) {
        setActiveContact(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async (contactId) => {
    try {
      const res = await chatService.getChatHistory(contactId);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeContact || loading) return;

    setLoading(true);
    try {
      const res = await chatService.sendMessage({
        receiver_id: activeContact.id,
        message: input,
      });
      setMessages((prev) => [...prev, res.data]);
      setInput('');
    } catch (err) {
      console.error(err);
      alert('Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 h-[80vh] flex flex-col">
      <div className="flex-1 bg-white border border-emerald-50 rounded-3xl overflow-hidden shadow-sm grid grid-cols-12 h-full">
        {/* Left Side: Contacts List (Col 4) */}
        <div className="col-span-4 border-r border-emerald-50 flex flex-col h-full bg-emerald-50/5">
          <div className="p-4 border-b border-emerald-50">
            <h3 className="font-extrabold text-sm text-emerald-950 flex items-center gap-1.5">
              <MessageSquare className="w-4.5 h-4.5 text-emerald-700" />
              Direct Contacts
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-emerald-50/50">
            {contacts.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveContact(c)}
                className={`w-full p-4 text-left flex items-center gap-3 transition-colors cursor-pointer ${
                  activeContact?.id === c.id ? 'bg-emerald-50/60' : 'hover:bg-emerald-50/10'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-xs text-emerald-950 truncate capitalize">{c.name}</h4>
                  <span className="text-[10px] text-emerald-600 block capitalize font-medium">{c.role}</span>
                </div>
              </button>
            ))}
            {contacts.length === 0 && (
              <div className="p-6 text-center text-xs text-emerald-900/60 leading-relaxed font-light">
                No active conversations yet. Add crops to cart or buy listings to message producers.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Message Thread (Col 8) */}
        <div className="col-span-8 flex flex-col h-full">
          {activeContact ? (
            <>
              {/* Chat Thread Header */}
              <div className="px-6 py-3 border-b border-emerald-50 flex items-center gap-3 bg-emerald-50/5">
                <div className="w-9 h-9 rounded-full bg-emerald-800 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-emerald-950 capitalize">{activeContact.name}</h4>
                  <span className="text-[9px] text-emerald-600 font-semibold uppercase">{activeContact.role}</span>
                </div>
              </div>

              {/* Feed Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-emerald-50/5">
                {messages.map((msg) => {
                  const isMe = msg.sender_id === current_user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 max-w-[70%] ${
                        isMe ? 'ml-auto flex-row-reverse' : ''
                      }`}
                    >
                      <div className={`p-1 rounded-full w-7 h-7 flex items-center justify-center shrink-0 ${
                        isMe ? 'bg-emerald-100' : 'bg-emerald-800'
                      }`}>
                        <User className={`w-3.5 h-3.5 ${isMe ? 'text-emerald-950' : 'text-white'}`} />
                      </div>
                      
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        isMe 
                          ? 'bg-emerald-600 text-white rounded-tr-none' 
                          : 'bg-white border border-emerald-50 text-emerald-950 rounded-tl-none'
                      }`}>
                        <p>{msg.message}</p>
                        <span className={`block text-[9px] mt-1 text-right ${
                          isMe ? 'text-emerald-200' : 'text-emerald-500'
                        }`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSend} className="p-4 border-t border-emerald-50 bg-white flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2.5 text-xs text-emerald-950 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3">
              <MessageSquare className="w-12 h-12 text-emerald-200" />
              <h4 className="font-bold text-sm text-emerald-950">Select a Contact</h4>
              <p className="text-xs text-emerald-900/60 max-w-xs leading-relaxed">
                Choose a conversation from the direct contact sidebar to start messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
