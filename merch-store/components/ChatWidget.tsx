import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot } from 'lucide-react';
import { generateFanResponse } from '../services/geminiService';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: 'Hey fan. I\'m EchoBot. Ask me about tour dates, sizing, or the new album.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const response = await generateFanResponse(userMsg);
    
    setMessages(prev => [...prev, { role: 'bot', text: response }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-neutral-900 border border-red-600 text-red-500 hover:bg-red-600 hover:text-white p-4 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_20px_rgba(220,38,38,0.6)] transition-all flex items-center gap-2 group"
        >
          <Bot className="h-6 w-6" />
          <span className="text-xs font-bold uppercase hidden md:inline tracking-widest">Fan Assist</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-[#0a0a0a] rounded-lg shadow-2xl w-80 sm:w-96 flex flex-col h-[500px] border border-red-900/50 animate-fade-in-up ring-1 ring-red-900/20">
          <div className="bg-gradient-to-r from-neutral-900 to-black p-4 rounded-t-lg flex justify-between items-center border-b border-red-900/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>
              <h3 className="font-bold uppercase tracking-wide text-sm text-gray-200">EchoBot <span className="text-xs text-red-500 font-mono">v2.1</span></h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-red-500 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/50 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-3 text-sm font-mono ${
                    msg.role === 'user' 
                      ? 'bg-red-900/20 border border-red-900 text-red-100 rounded-t-lg rounded-bl-lg' 
                      : 'bg-neutral-900 border border-neutral-800 text-gray-300 rounded-t-lg rounded-br-lg shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-t-lg rounded-br-lg text-xs text-red-500 italic font-mono flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-500 rounded-full animate-bounce"></span>
                  <span className="w-1 h-1 bg-red-500 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1 h-1 bg-red-500 rounded-full animate-bounce delay-150"></span>
                  Processing
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-neutral-900 border-t border-neutral-800 rounded-b-lg">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Message..."
                className="flex-1 bg-black border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none placeholder:text-gray-700 font-mono"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="bg-red-600 text-white p-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};