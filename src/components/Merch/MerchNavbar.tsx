import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface MerchNavbarProps {
  cartCount: number
  onOpenCart: () => void
  onGoHome: () => void
}

export const MerchNavbar = ({ cartCount, onOpenCart, onGoHome }: MerchNavbarProps) => {
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()

  return (
    <nav className="merch-navbar">
      {/* Top Banner */}
      <div className="merch-banner">
        Transmission: Free Shipping on all Vinyl Bundles over $50
      </div>
      
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Left: Mobile Menu & Search */}
          <div className="navbar-left">
            <button className="mobile-menu-btn">
              <iconify-icon icon="solar:hamburger-menu-linear" width="20" height="20"></iconify-icon>
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
            <div className="logo-wrapper">
              <h1 className="logo-text">
                NEON ECHO
              </h1>
              <div className="logo-underline"></div>
            </div>
          </div>

          {/* Right: Icons */}
          <div className="navbar-right">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="SEARCH_DB..." 
                className="search-input"
              />
              <iconify-icon icon="solar:magnifer-linear" width="12" height="12" class="search-icon"></iconify-icon>
            </div>
            
            <button className="icon-btn wishlist-icon">
              <iconify-icon icon="solar:heart-linear" width="20" height="20"></iconify-icon>
            </button>

            <button onClick={onOpenCart} className="icon-btn cart-icon">
              <iconify-icon icon="solar:bag-3-linear" width="20" height="20"></iconify-icon>
              {cartCount > 0 && (
                <span className="cart-badge">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .merch-navbar {
          position: sticky;
          top: 0;
          z-index: 40;
          width: 100%;
          background: rgba(5, 5, 5, 0.95);
          backdrop-filter: blur(4px);
          border-bottom: 1px solid #1a1a1a;
        }

        .merch-banner {
          background: rgba(127, 29, 29, 0.2);
          color: #ef4444;
          border-bottom: 1px solid rgba(127, 29, 29, 0.3);
          font-size: 10px;
          text-align: center;
          padding: 0.5rem 0;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-weight: 700;
        }

        .navbar-container {
          max-width: 80rem;
          margin: 0 auto;
          padding: 0 1rem;
        }

        @media (min-width: 640px) {
          .merch-banner { font-size: 12px; }
          .navbar-container { padding: 0 1.5rem; }
        }

        @media (min-width: 1024px) {
          .navbar-container { padding: 0 2rem; }
        }

        .navbar-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 5rem;
        }

        .navbar-left, .navbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .mobile-menu-btn {
          padding: 0.5rem;
          margin-left: -0.5rem;
          color: #9ca3af;
          background: transparent;
          border: none;
          cursor: pointer;
          border-radius: 0.375rem;
        }

        .mobile-menu-btn:hover {
          color: white;
          background: #1a1a1a;
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
            gap: 0.25rem;
          }
        }

        .nav-link {
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          color: #9ca3af;
          background: transparent;
          border: none;
          font-family: monospace;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-link:hover {
          color: white;
          background: #1a1a1a;
        }

        .navbar-center {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .logo-wrapper {
          position: relative;
        }

        .logo-text {
          font-size: 1.875rem;
          font-weight: 700;
          letter-spacing: -0.05em;
          text-transform: uppercase;
          color: white;
          margin: 0;
          transition: color 0.3s;
        }

        .navbar-center:hover .logo-text {
          color: #ef4444;
          text-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
        }

        .logo-underline {
          position: absolute;
          bottom: -0.25rem;
          left: 0;
          width: 100%;
          height: 1px;
          background: #dc2626;
          transform: scaleX(0);
          transition: transform 0.3s;
        }

        .navbar-center:hover .logo-underline {
          transform: scaleX(1);
        }

        .search-box {
          display: none;
          position: relative;
        }

        @media (min-width: 768px) {
          .search-box { display: block; }
        }

        .search-input {
          padding-left: 2rem;
          padding-right: 0.75rem;
          padding-top: 0.375rem;
          padding-bottom: 0.375rem;
          font-size: 12px;
          background: #111;
          border: 1px solid #1a1a1a;
          border-radius: 0.25rem;
          color: #d1d5db;
          width: 8rem;
          transition: all 0.2s;
          font-family: monospace;
        }

        .search-input:focus {
          outline: none;
          border-color: #dc2626;
          color: white;
          width: 12rem;
        }

        .search-icon {
          position: absolute;
          left: 0.625rem;
          top: 0.625rem;
          color: #4b5563;
          pointer-events: none;
        }

        .search-input:focus ~ .search-icon {
          color: #ef4444;
        }

        .icon-btn {
          padding: 0.5rem;
          color: #9ca3af;
          background: transparent;
          border: none;
          border-radius: 0.25rem;
          position: relative;
          cursor: pointer;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-btn:hover {
          color: white;
          background: #111;
        }

        .wishlist-icon:hover {
          color: #ef4444;
        }

        .cart-icon:hover svg {
          color: #ef4444;
        }

        .cart-badge {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          background: #dc2626;
          color: white;
          font-size: 9px;
          font-weight: 700;
          height: 0.875rem;
          width: 0.875rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 8px rgba(220, 38, 38, 0.8);
        }
      `}</style>
    </nav>
  )
}
