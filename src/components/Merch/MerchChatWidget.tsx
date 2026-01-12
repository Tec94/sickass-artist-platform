import React, { useState, useEffect, useRef } from 'react';

export const MerchChatWidget: React.FC = () => {
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

    // Mock response - geminiService has been removed
    const mockResponses = [
      "Check out our latest drops in the store! 🔥",
      "Tour dates for Europe and North America coming soon!",
      "For sizing, we recommend going up one size for that baggy fit on hoodies.",
      "The new album 'Midnight Frequency' drops next month!",
      "Got questions about merch? I'm here to help!"
    ];
    const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    
    setMessages(prev => [...prev, { role: 'bot', text: response }]);
    setIsLoading(false);
  };

  return (
    <div className="merch-chat-widget">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="chat-toggle-btn"
        >
          <iconify-icon icon="solar:chat-round-dots-bold" width="24" height="24"></iconify-icon>
          <span className="btn-label">Fan Assist</span>
        </button>
      )}

      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="bot-info">
              <div className="bot-status"></div>
              <h3>EchoBot <span className="version">v2.1</span></h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="close-btn">
              <iconify-icon icon="solar:close-circle-linear" width="16" height="16"></iconify-icon>
            </button>
          </div>

          {/* Messages */}
          <div className="messages-container">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message-row ${msg.role === 'user' ? 'user' : 'bot'}`}>
                <div className={`message-bubble ${msg.role}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="loading-indicator">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
                Processing
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="input-area">
            <div className="input-wrapper">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Message..."
                disabled={isLoading}
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="send-btn"
              >
                <iconify-icon icon="solar:plain-2-bold" width="16" height="16"></iconify-icon>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .merch-chat-widget {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 40;
        }

        .chat-toggle-btn {
          background: #111;
          border: 1px solid #dc2626;
          color: #ef4444;
          padding: 1rem;
          border-radius: 9999px;
          box-shadow: 0 0 15px rgba(220, 38, 38, 0.3);
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .chat-toggle-btn:hover {
          background: #dc2626;
          color: white;
          box-shadow: 0 0 20px rgba(220, 38, 38, 0.6);
        }

        .btn-label {
          display: none;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        @media (min-width: 768px) {
          .btn-label { display: inline; }
        }

        .chat-window {
          background: #0a0a0a;
          border-radius: 0.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          width: 20rem;
          height: 500px;
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(127, 29, 29, 0.5);
          animation: fadeInUp 0.3s ease-out;
        }

        @media (min-width: 640px) {
          .chat-window { width: 24rem; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .chat-header {
          background: linear-gradient(to right, #171717, #000);
          padding: 1rem;
          border-radius: 0.5rem 0.5rem 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(127, 29, 29, 0.3);
        }

        .bot-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .bot-status {
          width: 0.5rem;
          height: 0.5rem;
          background: #dc2626;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(220, 38, 38, 0.8);
          animation: pulse 2s infinite;
        }

        .bot-info h3 {
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 14px;
          color: #e5e7eb;
          margin: 0;
        }

        .version {
          font-size: 10px;
          color: #ef4444;
          font-family: monospace;
        }

        .close-btn {
          color: #6b7280;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: #ef4444;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: rgba(0, 0, 0, 0.5);
        }

        .messages-container::-webkit-scrollbar {
          width: 6px;
        }
        
        .messages-container::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 3px;
        }

        .message-row {
          display: flex;
        }

        .message-row.user {
          justify-content: flex-end;
        }

        .message-row.bot {
          justify-content: flex-start;
        }

        .message-bubble {
          max-width: 85%;
          padding: 0.75rem;
          font-size: 14px;
          font-family: monospace;
          line-height: 1.5;
        }

        .message-bubble.user {
          background: rgba(127, 29, 29, 0.2);
          border: 1px solid #7f1d1d;
          color: #fee2e2;
          border-radius: 0.5rem 0.5rem 0 0.5rem;
        }

        .message-bubble.bot {
          background: #171717;
          border: 1px solid #262626;
          color: #d1d5db;
          border-radius: 0.5rem 0.5rem 0.5rem 0;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .loading-indicator {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: #171717;
          border: 1px solid #262626;
          border-radius: 0.5rem 0.5rem 0.5rem 0;
          font-size: 12px;
          color: #ef4444;
          font-style: italic;
          font-family: monospace;
          width: fit-content;
        }

        .dot {
          width: 4px;
          height: 4px;
          background: #ef4444;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        .input-area {
          padding: 1rem;
          background: #171717;
          border-top: 1px solid #262626;
          border-radius: 0 0 0.5rem 0.5rem;
        }

        .input-wrapper {
          display: flex;
          gap: 0.5rem;
        }

        .input-wrapper input {
          flex: 1;
          background: black;
          border: 1px solid #262626;
          border-radius: 0.25rem;
          padding: 0.5rem 0.75rem;
          font-size: 14px;
          color: white;
          font-family: monospace;
          outline: none;
        }

        .input-wrapper input:focus {
          border-color: #dc2626;
          box-shadow: 0 0 0 1px #dc2626;
        }

        .send-btn {
          background: #dc2626;
          color: white;
          padding: 0.5rem;
          border-radius: 0.25rem;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .send-btn:hover {
          background: #b91c1c;
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
