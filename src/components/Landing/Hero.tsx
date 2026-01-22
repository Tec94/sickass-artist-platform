import React from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export const Hero: React.FC = () => {
  const animate = useScrollAnimation();

  return (
    <section className="hero-section">
      <div className="hero-overlay"></div>
      <div className="hero-container">
        <div className="hero-content">
          <div ref={animate} data-animate className="live-badge">
            <span className="dot"></span> LIVE: LA MANADA STUDIO SESSIONS
          </div>
          
          <h1 ref={animate} data-animate className="hero-title">
            <span className="text-white">ROA</span> <span className="text-primary">WOLF</span><br />
            <span className="dim">JOIN THE PACK.</span>
          </h1>
          
          <p ref={animate} data-animate className="hero-description">
            Exclusive access to unreleased tracks, behind-the-scenes studio footage, and the official La Manada community.
          </p>
          
          <div ref={animate} data-animate className="hero-actions">
            <button className="btn-primary border-beam">JOIN THE INNER CIRCLE</button>
            <button className="btn-secondary">LATEST DROPS <iconify-icon icon="solar:arrow-right-linear"></iconify-icon></button>
          </div>
        </div>
        
        <div ref={animate} data-animate className="hero-mockup">
          <div className="phone-frame">
            <div className="phone-screen">
              {/* Phone Content Simulation */}
              <div className="phone-header">
                <span className="live-label">LA MANADA</span>
                <iconify-icon icon="solar:menu-dots-bold-duotone"></iconify-icon>
              </div>
              <div className="chat-bubbles">
                <div className="bubble">Did you hear that new snippet? 🐺</div>
                <div className="bubble">Need that merch drop ASAP</div>
                <div className="bubble highlight">ROA just joined the chat</div>
                <div className="bubble sent">New album is heavy...</div>
              </div>
              <div className="music-player">
                <div className="player-icon">
                  <iconify-icon icon="solar:music-note-bold"></iconify-icon>
                </div>
                <div className="player-info">
                  <div className="track-name">SIN TI (Demo)</div>
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
          position: relative;
          background-image: url('/images/roa-profile.jpg');
          background-size: cover;
          background-position: center;
          background-attachment: fixed; /* Parallax feel */
          overflow: hidden;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            rgba(0,0,0,0.9) 0%,
            rgba(0,0,0,0.8) 40%,
            rgba(0,0,0,0.4) 100%
          );
          z-index: 1;
        }

        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 60px;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(220, 38, 38, 0.15); /* Primary Red tint */
          border: 1px solid rgba(220, 38, 38, 0.3);
          color: var(--color-primary);
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-bottom: 24px;
          backdrop-filter: blur(4px);
        }

        .live-badge .dot {
          width: 8px;
          height: 8px;
          background: var(--color-primary);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--color-primary);
          animation: pulse 2s infinite;
        }

        .hero-title {
          font-size: clamp(48px, 8vw, 84px);
          line-height: 0.95;
          font-weight: 800;
          margin: 0 0 32px 0;
          text-transform: uppercase;
          letter-spacing: -1px;
        }

        .hero-title .text-white { color: white; }
        .hero-title .text-primary { color: var(--color-primary); }

        .hero-title .dim {
          color: rgba(255, 255, 255, 0.6);
          font-weight: 400;
          font-size: 0.6em;
          display: block;
          margin-top: 10px;
        }

        .hero-description {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.8);
          max-width: 500px;
          line-height: 1.6;
          margin-bottom: 48px;
          font-weight: 300;
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
          border-radius: 4px; /* Sharper corners for urban feel */
          font-size: 16px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(220, 38, 38, 0.4);
        }
        
        .btn-primary:hover {
          background: var(--color-primary-hover, #b91c1c);
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(220, 38, 38, 0.6);
        }

        .btn-secondary {
          background: rgba(255,255,255,0.05);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          padding: 16px 32px;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s ease;
          backdrop-filter: blur(4px);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: white;
        }

        /* Mockup */
        .hero-mockup {
          perspective: 1000px;
        }

        .phone-frame {
          width: 300px;
          height: 600px;
          background: #000;
          border: 6px solid #222;
          border-radius: 40px;
          position: relative;
          margin: 0 auto;
          box-shadow: 
            0 50px 100px rgba(0,0,0,0.8), 
            0 0 40px rgba(220, 38, 38, 0.2); /* Red subtle glow */
          transform: rotateY(-10deg) rotateX(5deg);
        }

        .phone-screen {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 30px 20px;
          gap: 20px;
          background: linear-gradient(to bottom, #111, #000);
          border-radius: 34px;
          overflow: hidden;
        }

        .phone-header {
          display: flex;
          justify-content: space-between;
          color: var(--color-primary);
          font-weight: 800;
          letter-spacing: 1px;
        }

        .chat-bubbles {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          justify-content: center;
        }

        .bubble {
          background: #222;
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 13px;
          color: #ccc;
          max-width: 85%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .bubble.highlight {
          border: 1px solid rgba(220, 38, 38, 0.4);
          background: rgba(220, 38, 38, 0.1);
          color: #fff;
        }

        .bubble.sent {
          align-self: flex-end;
          background: #333;
          color: white;
          border-radius: 16px 16px 0 16px;
        }

        .music-player {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 16px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          backdrop-filter: blur(10px);
        }

        .player-icon {
          width: 40px;
          height: 40px;
          background: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 20px;
          color: white;
          box-shadow: 0 4px 10px rgba(220, 38, 38, 0.4);
        }

        .player-info {
          flex: 1;
        }

        .track-name { font-size: 13px; font-weight: bold; color: white; margin-bottom: 2px; }
        .track-time { font-size: 10px; color: #777; }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(220, 38, 38, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }

        @media (max-width: 900px) {
          .hero-container {
            grid-template-columns: 1fr;
            text-align: center;
            padding-top: 40px;
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
            margin-top: 60px;
            transform: scale(0.9);
          }
          .hero-actions {
             flex-direction: column;
             width: 100%;
          }
          .btn-primary, .btn-secondary {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
};
