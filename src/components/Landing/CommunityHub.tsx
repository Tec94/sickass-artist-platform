import React from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export const CommunityHub: React.FC = () => {
  const animate = useScrollAnimation();

  return (
    <section className="hub-section">
      <div className="hub-container">
        <header className="hub-header">
          <div className="title-group">
            <h2 ref={animate} data-animate className="hub-title">The Hub</h2>
            <p ref={animate} data-animate className="hub-subtitle">Connect with the collective.</p>
          </div>
          <div ref={animate} data-animate className="online-status">
            <span className="dot"></span> 1,240 Online
          </div>
        </header>

        <div className="hub-grid">
          {/* Channels Sidebar */}
          <div ref={animate} data-animate className="hub-card channels-card">
            <div className="card-header">
              <span className="label">CHANNELS</span>
            </div>
            <ul className="channel-list">
              <li className="active"><span className="hash">#</span> general</li>
              <li><span className="hash">#</span> theory-crafting</li>
              <li><iconify-icon icon="solar:volume-loud-linear"></iconify-icon> listening-party</li>
            </ul>
          </div>

          {/* Chat Main */}
          <div ref={animate} data-animate className="hub-card chat-card">
            <div className="chat-messages">
              <div className="message">
                <div className="avatar"></div>
                <div className="message-content">
                  <div className="user-meta">alex_99 <span className="time">10:42 AM</span></div>
                  <p>The scarlet motif in the new video is haunting.</p>
                </div>
              </div>
              
              <div className="divider">
                <span>NEW MESSAGES</span>
              </div>

              <div className="message highlight">
                <div className="avatar mod">M</div>
                <div className="message-content">
                  <div className="user-meta">Mod_Bot <span className="time">Just now</span></div>
                  <p>The virtual queue for the hoodie is live. <a href="#">Click here.</a></p>
                </div>
              </div>
            </div>
            <div className="chat-input-area">
              <div className="chat-input">
                <span>Message #general</span>
                <iconify-icon icon="solar:send-linear"></iconify-icon>
              </div>
            </div>
          </div>

          {/* Trending Sidebar */}
          <div ref={animate} data-animate className="hub-card trending-card">
            <div className="card-header">
              <span className="label">Trending</span>
              <a href="#" className="view-all">View All</a>
            </div>
            <div className="trending-list">
              <div className="trending-item">
                <div className="votes">
                  <iconify-icon icon="solar:alt-arrow-up-linear"></iconify-icon>
                  <span>428</span>
                </div>
                <div className="item-info">
                  <p className="item-title">Hidden lyrics in "Velvet"</p>
                  <div className="item-meta">User88 • <span className="hot-tag">Hot</span></div>
                </div>
              </div>
              <div className="trending-item">
                <div className="votes">
                  <iconify-icon icon="solar:alt-arrow-up-linear"></iconify-icon>
                  <span>156</span>
                </div>
                <div className="item-info">
                  <p className="item-title">Fan Art Competition: Week 4</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hub-section {
          padding: 100px 20px;
          background: #000;
        }

        .hub-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .hub-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
        }

        .hub-title {
          font-size: 48px;
          margin: 0;
          line-height: 1;
        }

        .hub-subtitle {
          color: var(--color-text-dim);
          margin: 8px 0 0 0;
        }

        .online-status {
          background: rgba(255,0,0,0.1);
          border: 1px solid rgba(255,0,0,0.2);
          color: var(--color-primary);
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .online-status .dot {
          width: 6px;
          height: 6px;
          background: var(--color-primary);
          border-radius: 50%;
        }

        .hub-grid {
          display: grid;
          grid-template-columns: 240px 1fr 340px;
          gap: 20px;
          height: 500px;
        }

        .hub-card {
          background: var(--color-card-bg);
          border: 1px solid var(--color-card-border);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .card-header {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .label {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--color-primary);
        }

        .view-all {
          font-size: 12px;
          color: var(--color-primary);
          text-decoration: none;
        }

        /* Channels */
        .channel-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .channel-list li {
          padding: 12px 20px;
          color: var(--color-text-dim);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .channel-list li.active {
          background: rgba(255,0,0,0.05);
          color: white;
          border-right: 2px solid var(--color-primary);
        }

        .channel-list li .hash { color: #444; }

        /* Chat */
        .chat-card {
          flex: 1;
        }

        .chat-messages {
          flex: 1;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          overflow-y: auto;
        }

        .message {
          display: flex;
          gap: 16px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          background: #222;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .avatar.mod {
          background: var(--color-red-dim);
          border: 1px solid var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary);
          font-weight: bold;
        }

        .user-meta {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .user-meta .time {
          font-size: 11px;
          color: #444;
          font-weight: normal;
          margin-left: 8px;
        }

        .message p {
          margin: 0;
          font-size: 14px;
          color: #bbb;
        }

        .message.highlight p {
          color: var(--color-primary);
        }

        .message.highlight a {
          color: var(--color-primary);
          font-weight: bold;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 10px 0;
        }

        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #222;
        }

        .divider span {
          font-size: 10px;
          font-weight: bold;
          color: var(--color-primary);
        }

        .chat-input-area {
          padding: 20px;
          border-top: 1px solid var(--color-card-border);
        }

        .chat-input {
          background: #000;
          border: 1px solid #1a1a1a;
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #444;
          font-size: 14px;
        }

        /* Trending */
        .trending-list {
          padding: 0 20px 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .trending-item {
          display: flex;
          gap: 16px;
        }

        .votes {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #444;
          font-size: 12px;
          gap: 4px;
        }

        .item-title {
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 4px 0;
        }

        .item-meta {
          font-size: 12px;
          color: #555;
        }

        .hot-tag {
          background: var(--color-primary);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
        }

        @media (max-width: 1100px) {
          .hub-grid {
            grid-template-columns: 1fr;
            height: auto;
          }
          .channels-card { display: none; }
        }
      `}</style>
    </section>
  );
};
