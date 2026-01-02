import React from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export const WorkInProgress: React.FC = () => {
  const animate = useScrollAnimation();

  const tourDates = [
    { date: 'OCT 24', city: 'London, UK', venue: 'O2 Academy', status: 'Tickets' },
    { date: 'OCT 28', city: 'Paris, FR', venue: 'Élysée Montmartre', status: 'Sold Out' },
    { date: 'NOV 02', city: 'Tokyo, JP', venue: 'Zepp DiverCity', status: 'Tickets' },
  ];

  return (
    <section className="wip-section">
      <div className="wip-container">
        <div className="wip-content">
          <h2 ref={animate} data-animate className="section-title">Work In Progress</h2>
          <p ref={animate} data-animate className="section-subtitle">Snippets from the studio. Unmixed, unmastered, raw ideas.</p>
          
          <div ref={animate} data-animate className="player-card">
            <div className="player-header">
              <span className="label">LATEST UPLOAD</span>
              <span className="dot active"></span>
            </div>
            <div className="track-details">
              <h3 className="track-title">Demo_v4_synth_layer</h3>
              <p className="track-meta">Uploaded 2 hours ago • 2:14</p>
            </div>
            <div className="waveform">
              <div className="bars">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="bar" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
                ))}
              </div>
            </div>
            <div className="player-controls">
              <button className="play-btn">
                <iconify-icon icon="solar:play-bold"></iconify-icon>
              </button>
              <div className="progress-slider">
                <div className="slider-bg">
                  <div className="slider-fill" style={{ width: '40%' }}></div>
                </div>
                <span className="current-time">0:42</span>
              </div>
            </div>
          </div>
        </div>

        <div className="tour-content">
          <h2 ref={animate} data-animate className="section-title">Upcoming Tour</h2>
          <div className="tour-list">
            {tourDates.map((tour, index) => (
              <div key={index} ref={animate} data-animate className="tour-item">
                <div className="date">{tour.date}</div>
                <div className="city">{tour.city}</div>
                <div className="venue">{tour.venue}</div>
                <button className={`status-btn ${tour.status === 'Sold Out' ? 'sold-out' : ''}`}>
                  {tour.status}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .wip-section {
          padding: 100px 20px;
          background: #000;
        }

        .wip-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 100px;
        }

        .section-title {
          font-size: 40px;
          margin: 0 0 16px 0;
        }

        .section-subtitle {
          color: var(--color-text-dim);
          margin-bottom: 40px;
          font-size: 16px;
        }

        .player-card {
          background: linear-gradient(135deg, #0A0A0A 0%, #050505 100%);
          border: 1px solid var(--color-card-border);
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
        }

        .player-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .player-header .label {
          font-size: 11px;
          font-weight: 700;
          color: var(--color-text-dim);
          letter-spacing: 1px;
        }

        .dot.active {
          width: 8px;
          height: 8px;
          background: #FF0000;
          border-radius: 50%;
          box-shadow: 0 0 10px #FF0000;
        }

        .track-title {
          font-size: 24px;
          margin: 0 0 4px 0;
        }

        .track-meta {
          color: #444;
          font-size: 14px;
          margin-bottom: 32px;
        }

        .waveform {
          height: 60px;
          margin-bottom: 32px;
          display: flex;
          align-items: center;
        }

        .bars {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          height: 100%;
          width: 100%;
        }

        .bar {
          flex: 1;
          background: #222;
          border-radius: 2px;
        }

        .bar:nth-child(-n+10) {
          background: var(--color-primary);
        }

        .player-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .play-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: white;
          color: black;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          cursor: pointer;
        }

        .progress-slider {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .slider-bg {
          flex: 1;
          height: 4px;
          background: #222;
          border-radius: 2px;
          position: relative;
        }

        .slider-fill {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          background: var(--color-primary);
          border-radius: inherit;
        }

        .current-time {
          font-size: 11px;
          color: #444;
          font-family: monospace;
        }

        /* Tour List */
        .tour-list {
          display: flex;
          flex-direction: column;
        }

        .tour-item {
          display: grid;
          grid-template-columns: 100px 1.5fr 1.5fr 120px;
          align-items: center;
          padding: 24px 0;
          border-bottom: 1px solid #111;
        }

        .tour-item .date {
          color: var(--color-primary);
          font-weight: 700;
          font-size: 14px;
        }

        .tour-item .city {
          font-weight: 600;
          font-size: 16px;
        }

        .tour-item .venue {
          color: var(--color-text-dim);
          font-size: 14px;
        }

        .status-btn {
          background: #111;
          border: 1px solid var(--color-card-border);
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          text-align: center;
        }

        .status-btn.sold-out {
          border-color: transparent;
          color: #444;
          cursor: default;
        }

        @media (max-width: 900px) {
          .wip-container { grid-template-columns: 1fr; gap: 60px; }
          .tour-item { grid-template-columns: 80px 1fr auto; gap: 10px; }
          .tour-item .venue { display: none; }
        }
      `}</style>
    </section>
  );
};
