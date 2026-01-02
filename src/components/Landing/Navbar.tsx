import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="nav-left">
          <div className="logo-box">
            <iconify-icon icon="simple-icons:adobe" width="24" height="24"></iconify-icon>
          </div>
          <div className="brand-logo">
            <iconify-icon icon="simple-icons:beats" width="96" height="36"></iconify-icon>
          </div>
        </div>

        <div className="nav-center">
          <a href="#community">Community</a>
          <a href="#store">Store</a>
          <a href="#gallery">Gallery</a>
          <a href="#tour">Tour</a>
        </div>

        <div className="nav-right">
          <button className="nav-icon-btn"><iconify-icon icon="solar:magnifer-linear"></iconify-icon></button>
          <button className="nav-icon-btn"><iconify-icon icon="solar:bag-3-linear"></iconify-icon><span className="badge">1</span></button>
          <div className="user-avatar">JD</div>
        </div>
      </div>

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          z-index: 1000;
          display: flex;
          align-items: center;
        }

        .navbar-container {
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          padding: 0 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .logo-box {
          width: 32px;
          height: 32px;
          background: #111;
          border: 1px solid #222;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-logo {
          color: white;
          display: flex;
          align-items: center;
        }

        .nav-center {
          display: flex;
          gap: 32px;
        }

        .nav-center a {
          color: var(--color-text-dim);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: var(--transition-standard);
        }

        .nav-center a:hover {
          color: white;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .nav-icon-btn {
          background: transparent;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-icon-btn .badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--color-primary);
          width: 14px;
          height: 14px;
          border-radius: 50%;
          font-size: 9px;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          background: #222;
          border: 1px solid #333;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: #888;
        }

        @media (max-width: 800px) {
          .nav-center { display: none; }
          .navbar-container { padding: 0 20px; }
        }
      `}</style>
    </nav>
  );
};
