
interface MerchNavbarProps {
  cartCount: number
  onOpenCart: () => void
  onGoHome: () => void
}

export const MerchNavbar = ({ cartCount, onOpenCart, onGoHome }: MerchNavbarProps) => {
  return (
    <nav className="merch-navbar">
      {/* Top Banner - Redesigned to match reference */}
      <div className="merch-banner">
        <div className="banner-container">
          FREE SHIPPING ON ORDERS OVER $50
        </div>
      </div>
      
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Left: Navigation Links */}
          <div className="navbar-left">
            <button className="mobile-menu-btn">
              <iconify-icon icon="solar:hamburger-menu-linear" width="24" height="24"></iconify-icon>
            </button>
            <div className="desktop-links">
              {['SHOP ALL', 'MUSIC', 'MERCH'].map((item) => (
                <button 
                  key={item}
                  onClick={item === 'SHOP ALL' ? onGoHome : undefined}
                  className="nav-link"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Center: Logo */}
          <div className="navbar-center" onClick={onGoHome}>
            <h1 className="logo-text">ROA OLVES</h1>
          </div>

          {/* Right: Icons */}
          <div className="navbar-right">
            <div className="search-box">
              <iconify-icon icon="solar:magnifer-linear" width="18" height="18" class="search-icon"></iconify-icon>
              <input 
                type="text" 
                placeholder="Search..." 
                className="search-input"
              />
            </div>
            
            <button className="icon-btn">
              <iconify-icon icon="solar:heart-linear" width="24" height="24"></iconify-icon>
            </button>

            <button onClick={onOpenCart} className="icon-btn cart-btn">
              <iconify-icon icon="solar:bag-3-linear" width="24" height="24"></iconify-icon>
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .merch-navbar {
          position: sticky;
          top: 0;
          width: 100%;
          background: #050505;
          border-bottom: 1px solid #1a1a1a;
          z-index: 30;
        }

        .merch-banner {
          background: #dc2626;
          color: white;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-weight: 500;
          font-family: var(--font-store, ui-monospace, monospace);
          height: 34px;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .banner-container {
          width: 100%;
          padding: 0 75px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 1px;
        }

        .navbar-container {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          padding: 0 75px;
        }

        .navbar-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 72px; /* Increased by 40% from 52px approx */
          position: relative;
        }

        .navbar-left, .navbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mobile-menu-btn {
          padding: 8px;
          color: #737373;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        @media (min-width: 768px) {
          .mobile-menu-btn { display: none; }
        }

        .desktop-links {
          display: none;
        }

        @media (min-width: 768px) {
          .desktop-links {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }

        .nav-link {
          padding: 8px 16px;
          color: #737373;
          background: transparent;
          border: none;
          font-family: var(--font-store, ui-monospace, monospace);
          font-size: 14px; /* Increased by 40% from 10px */
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: color 0.2s;
        }

        .nav-link:hover {
          color: white;
        }

        .navbar-center {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          cursor: pointer;
        }

        .logo-text {
          font-family: var(--font-store, ui-monospace, monospace);
          font-size: 24px; /* Increased by 40% from 16px approx */
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: white;
          margin: 0;
          transition: all 0.2s;
        }

        .navbar-center:hover .logo-text {
          color: #dc2626;
          text-shadow: 0 0 15px rgba(220, 38, 38, 0.4);
        }

        .search-box {
          display: none;
          position: relative;
          align-items: center;
        }

        @media (min-width: 768px) {
          .search-box { display: flex; }
        }

        .search-icon {
          position: absolute;
          left: 10px;
          color: #525252;
          pointer-events: none;
        }

        .search-input {
          padding: 8px 12px 8px 36px;
          font-size: 13px;
          background: #111;
          border: 1px solid #262626;
          color: #a3a3a3;
          width: 140px;
          transition: all 0.2s;
          font-family: var(--font-store, ui-monospace, monospace);
        }

        .search-input::placeholder {
          color: #525252;
        }

        .search-input:focus {
          outline: none;
          border-color: #404040;
          color: white;
          width: 180px;
        }

        .icon-btn {
          padding: 8px;
          color: #737373;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-btn:hover {
          color: white;
        }

        .cart-btn {
          position: relative;
        }

        .cart-badge {
          position: absolute;
          top: 0;
          right: 0;
          background: #dc2626;
          color: white;
          font-size: 10px;
          font-weight: 700;
          min-width: 16px;
          height: 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-store, ui-monospace, monospace);
        }
      `}</style>
    </nav>
  )
}
