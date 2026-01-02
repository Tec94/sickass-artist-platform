import React from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export const Hero: React.FC = () => {
  const animate = useScrollAnimation();

  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <div ref={animate} data-animate className="live-badge">
            <span className="dot"></span> Live Session: Tokyo Backstage
          </div>
          
          <h1 ref={animate} data-animate className="hero-title">
            Bleed the sound.<br />
            <span className="dim">Join the Collective.</span>
          </h1>
          
          <p ref={animate} data-animate className="hero-description">
            Access exclusive WIPs, join the inner circle discord, browse infinite fan galleries, and secure limited edition drops.
          </p>
          
          <div ref={animate} data-animate className="hero-actions">
            <button className="btn-primary border-beam">Join Access Pass</button>
            <button className="btn-secondary">View Schedule <iconify-icon icon="solar:arrow-right-linear"></iconify-icon></button>
          </div>
        </div>
        
        <div ref={animate} data-animate className="hero-mockup">
          <div className="phone-frame">
            <div className="phone-screen">
              {/* Phone Content Simulation */}
              <div className="phone-header">
                <span className="live-label">LIVE</span>
                <iconify-icon icon="solar:menu-dots-bold-duotone"></iconify-icon>
              </div>
              <div className="chat-bubbles">
                <div className="bubble">Where is the hidden track?</div>
                <div className="bubble">That bass drop was insane</div>
                <div className="bubble highlight">New demo just uploaded 🔥</div>
                <div className="bubble sent">Listening now...</div>
              </div>
              <div className="music-player">
                <div className="player-icon">
                  <iconify-icon icon="solar:music-note-bold"></iconify-icon>
                </div>
                <div className="player-info">
                  <div className="track-name">Velvet Underground (...)</div>
                  <div className="track-time">0:42 / 2:15</div>
                </div>
                <div className="player-toggle">
                  <iconify-icon icon="solar:pause-bold"></iconify-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-section {
          padding: 80px 20px;
          min-height: 90vh;
          display: flex;
          align-items: center;
          background: radial-gradient(circle at 20% 30%, rgba(255, 0, 0, 0.05), transparent 50%);
        }

        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 0, 0, 0.1);
          border: 1px solid rgba(255, 0, 0, 0.2);
          color: var(--color-primary);
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 14px;
          margin-bottom: 24px;
        }

        .live-badge .dot {
          width: 8px;
          height: 8px;
          background: var(--color-primary);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--color-primary);
        }

        .hero-title {
          font-size: clamp(48px, 8vw, 84px);
          line-height: 1;
          font-weight: 700;
          margin: 0 0 32px 0;
          letter-spacing: -2px;
        }

        .hero-title .dim {
          color: var(--color-text-dim);
        }

        .hero-description {
          font-size: 18px;
          color: var(--color-text-dim);
          max-width: 500px;
          line-height: 1.5;
          margin-bottom: 48px;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
        }

        .btn-primary {
          background: var(--color-primary);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-standard);
        }

        .btn-secondary {
          background: transparent;
          color: white;
          border: 1px solid var(--color-card-border);
          padding: 16px 32px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: var(--transition-standard);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: white;
        }

        /* Mockup */
        .hero-mockup {
          perspective: 1000px;
        }

        .phone-frame {
          width: 320px;
          height: 640px;
          background: #000;
          border: 8px solid #1a1a1a;
          border-radius: 40px;
          position: relative;
          margin: 0 auto;
          box-shadow: 0 50px 100px rgba(0,0,0,0.5), 0 0 20px rgba(255,0,0,0.1);
          transform: rotateY(-10deg) rotateX(5deg);
        }

        .phone-screen {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 40px 20px;
          gap: 20px;
        }

        .phone-header {
          display: flex;
          justify-content: space-between;
          color: var(--color-primary);
          font-weight: bold;
        }

        .chat-bubbles {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .bubble {
          background: #1a1a1a;
          padding: 10px 16px;
          border-radius: 12px;
          font-size: 12px;
          color: #888;
          max-width: 80%;
        }

        .bubble.highlight {
          border: 1px solid var(--color-red-dim);
          background: rgba(255,0,0,0.05);
          color: #eee;
        }

        .bubble.sent {
          align-self: flex-end;
          background: white;
          color: black;
          border-radius: 12px 12px 0 12px;
        }

        .music-player {
          background: #111;
          border: 1px solid #222;
          padding: 12px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .player-icon {
          width: 36px;
          height: 36px;
          background: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 20px;
        }

        .player-info {
          flex: 1;
        }

        .track-name { font-size: 12px; font-weight: bold; }
        .track-time { font-size: 10px; color: #555; }

        @media (max-width: 900px) {
          .hero-container {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .hero-content {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .hero-description {
            margin-left: auto;
            margin-right: auto;
          }
          .hero-mockup {
            margin-top: 40px;
          }
        }
      `}</style>
    </section>
  );
};
