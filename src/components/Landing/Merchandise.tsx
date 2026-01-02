import React from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { FlashlightEffect } from '../Effects/FlashlightEffect';

export const Merchandise: React.FC = () => {
  const animate = useScrollAnimation();

  return (
    <section className="merch-section">
      <div className="merch-container">
        {/* Queue Progress Card */}
        <div ref={animate} data-animate className="queue-card">
          <div className="queue-info">
            <div className="queue-icon">
              <iconify-icon icon="solar:ticket-bold"></iconify-icon>
            </div>
            <div className="queue-text">
              <div className="queue-title">Limited Drop: "Scarlet Edition"</div>
              <div className="queue-status">Virtual queue is currently active.</div>
            </div>
          </div>
          <div className="queue-progress">
            <div className="progress-labels">
              <span>Your Position</span>
              <span>#428</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
        </div>

        <header className="merch-header">
          <h2 ref={animate} data-animate className="merch-title">Merchandise</h2>
          <div ref={animate} data-animate className="merch-filters">
            <button className="active">All</button>
            <button>Apparel</button>
            <button>Digital</button>
          </div>
        </header>

        <div className="merch-grid">
          <FlashlightEffect className="merch-item" ref={animate as any} data-animate>
            <div className="item-image placeholder new">
              <div className="badge">NEW</div>
              <iconify-icon icon="solar:t-shirt-bold-duotone"></iconify-icon>
            </div>
            <div className="item-details">
              <div className="item-name">Heavy Tee</div>
              <div className="item-price">$45</div>
              <div className="item-desc">Acid Wash Red</div>
            </div>
          </FlashlightEffect>

          <FlashlightEffect className="merch-item" ref={animate as any} data-animate>
            <div className="item-image placeholder">
              <iconify-icon icon="solar:vinyl-bold-duotone"></iconify-icon>
            </div>
            <div className="item-details">
              <div className="item-name">Limited Vinyl</div>
              <div className="item-price">$120</div>
              <div className="item-desc">Ruby Red Edition (1/500)</div>
            </div>
          </FlashlightEffect>

          <FlashlightEffect className="merch-item" ref={animate as any} data-animate>
            <div className="item-image placeholder">
              <iconify-icon icon="solar:t-shirt-bold-duotone"></iconify-icon>
            </div>
            <div className="item-details">
              <div className="item-name">Tour Hoodie</div>
              <div className="item-price">$85</div>
              <div className="item-desc">Velvet Patchwork</div>
            </div>
          </FlashlightEffect>

          <FlashlightEffect className="merch-item" ref={animate as any} data-animate>
            <div className="item-image placeholder digital">
              <div className="badge secondary">DIGITAL</div>
              <iconify-icon icon="solar:music-note-bold-duotone"></iconify-icon>
            </div>
            <div className="item-details">
              <div className="item-name">Stems: "Scarlet"</div>
              <div className="item-price">$15</div>
              <div className="item-desc">WAV + Project</div>
            </div>
          </FlashlightEffect>
        </div>
      </div>

      <style>{`
        .merch-section {
          padding: 100px 20px;
          background: #000;
        }

        .merch-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .queue-card {
          background: var(--color-card-bg);
          border: 1px solid var(--color-card-border);
          border-radius: 12px;
          padding: 24px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 80px;
          gap: 40px;
        }

        .queue-info {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .queue-icon {
          width: 48px;
          height: 48px;
          background: #111;
          border: 1px solid var(--color-red-dim);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary);
          font-size: 24px;
        }

        .queue-title {
          font-weight: 700;
          font-size: 16px;
        }

        .queue-status {
          font-size: 14px;
          color: var(--color-primary);
          margin-top: 4px;
        }

        .queue-progress {
          flex: 1;
          max-width: 400px;
        }

        .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--color-text-dim);
        }

        .progress-bar {
          height: 4px;
          background: #111;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          width: 75%;
          background: var(--color-primary);
          box-shadow: 0 0 10px var(--color-primary);
        }

        .merch-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }

        .merch-title {
          font-size: 40px;
          margin: 0;
        }

        .merch-filters {
          display: flex;
          gap: 12px;
        }

        .merch-filters button {
          background: #111;
          border: 1px solid var(--color-card-border);
          color: var(--color-text-dim);
          padding: 8px 20px;
          border-radius: 100px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: var(--transition-standard);
        }

        .merch-filters button.active {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }

        .merch-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .merch-item {
          display: flex;
          flex-direction: column;
          gap: 20px;
          cursor: pointer;
          padding: 0;
          border: none;
        }

        .item-image {
          aspect-ratio: 1;
          background: #0A0A0A;
          border: 1px solid var(--color-card-border);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 64px;
          color: #222;
          position: relative;
          transition: var(--transition-standard);
        }

        .merch-item:hover .item-image {
          border-color: rgba(255,0,0,0.3);
        }

        .badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: var(--color-primary);
          color: white;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 900;
        }

        .badge.secondary {
          background: white;
          color: black;
          left: auto;
          right: 12px;
          top: auto;
          bottom: 12px;
        }

        .item-details {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 4px;
        }

        .item-name {
          font-weight: 700;
          font-size: 16px;
        }

        .item-price {
          font-weight: 700;
          font-size: 16px;
        }

        .item-desc {
          grid-column: 1 / -1;
          font-size: 13px;
          color: var(--color-text-dim);
        }

        @media (max-width: 1000px) {
          .merch-grid { grid-template-columns: repeat(2, 1fr); }
          .queue-card { flex-direction: column; text-align: center; }
          .queue-progress { max-width: 100%; width: 100%; }
        }
      `}</style>
    </section>
  );
};
