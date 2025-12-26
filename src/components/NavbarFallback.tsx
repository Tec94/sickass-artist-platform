import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useGear } from '../contexts/GearContext'
import { GearName } from '../contexts/GearContext'

export const NavbarFallback = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { setCurrentGear } = useGear()

  const gears: GearName[] = ['R', 'N', '1', '2', '3', '4', '5']

  const handleGearClick = (gear: GearName) => {
    setCurrentGear(gear)
    setIsMobileMenuOpen(false)
  }

  const getGearLabel = (gear: GearName): string => {
    const labels: Record<GearName, string> = {
      R: 'Reverse',
      N: 'Neutral',
      '1': 'First',
      '2': 'Second',
      '3': 'Third',
      '4': 'Fourth',
      '5': 'Fifth',
    }
    return labels[gear]
  }

  return (
    <nav className="navbar-fallback" role="navigation" aria-label="Main navigation">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            SICKASS ARTIST PLATFORM
          </Link>
        </div>

        <button
          className="mobile-menu-button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
          type="button"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>

        <ul className={`navbar-menu ${isMobileMenuOpen ? 'menu-open' : ''}`} id="mobile-menu">
          {gears.map((gear) => (
            <li key={gear} className="navbar-item">
              <Link
                to={`/${gear}`}
                className={`navbar-link ${location.pathname === `/${gear}` ? 'link-active' : ''}`}
                onClick={() => handleGearClick(gear)}
                aria-label={getGearLabel(gear)}
              >
                <span className="gear-indicator">{gear}</span>
                <span className="gear-label">{getGearLabel(gear)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        .navbar-fallback {
          background: linear-gradient(135deg, #0A0E27, #1C1F2E);
          border-bottom: 2px solid #8B0FFF;
          padding: 16px 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }

        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
        }

        .navbar-brand .brand-link {
          color: #00D9FF;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 18px;
          font-weight: bold;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 2px;
          transition: all 0.2s ease;
        }

        .navbar-brand .brand-link:hover {
          color: #FF006E;
          text-shadow: 0 0 10px rgba(255, 0, 110, 0.6);
        }

        .mobile-menu-button {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 5px;
        }

        .hamburger-line {
          width: 24px;
          height: 3px;
          background: #00D9FF;
          transition: all 0.3s ease;
        }

        .mobile-menu-button:hover .hamburger-line {
          background: #FF006E;
        }

        .navbar-menu {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 8px;
        }

        .navbar-item {
          margin: 0;
        }

        .navbar-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          color: #E0E0E0;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .navbar-link:hover {
          background: rgba(0, 217, 255, 0.15);
          color: #00D9FF;
        }

        .navbar-link.link-active {
          background: rgba(255, 0, 110, 0.2);
          color: #FF006E;
          border: 1px solid #FF006E;
          box-shadow: 0 0 15px rgba(255, 0, 110, 0.4);
        }

        .gear-indicator {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 217, 255, 0.2);
          border: 1px solid #00D9FF;
          border-radius: 50%;
          font-weight: bold;
          font-size: 14px;
        }

        .navbar-link.link-active .gear-indicator {
          background: rgba(255, 0, 110, 0.3);
          border-color: #FF006E;
        }

        .gear-label {
          font-size: 14px;
          text-transform: uppercase;
        }

        @media (max-width: 767px) {
          .mobile-menu-button {
            display: flex;
          }

          .navbar-menu {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            flex-direction: column;
            background: rgba(10, 14, 39, 0.98);
            padding: 16px;
            gap: 4px;
            border-top: 1px solid #8B0FFF;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
            transform: translateY(-10px);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 100;
          }

          .navbar-menu.menu-open {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
          }

          .navbar-link {
            padding: 12px 16px;
          }

          .gear-label {
            display: inline;
          }
        }

        @media (min-width: 768px) {
          .gear-label {
            display: none;
          }
        }
      `}</style>
    </nav>
  )
}
