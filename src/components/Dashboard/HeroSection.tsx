import { useNavigate } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import { trackCTA } from '../../utils/analytics'
import { useTranslation } from '../../hooks/useTranslation'

export const HeroSection = () => {
  const navigate = useNavigate()
  const { isSignedIn, userProfile, isLoading } = useUser()
  const { t } = useTranslation()

  const handleProfileClick = (): void => {
    trackCTA('sign_in', 'hero_section')
    if (isSignedIn) {
      navigate('/profile')
    } else {
      navigate('/sign-in')
    }
  }

  const handleSocialClick = (platform: string): void => {
    console.log(`Open ${platform}`)
  }

  // Get display name with fallback
  const displayName = userProfile?.displayName || userProfile?.username || 'Guest'

  return (
    <div className="hero-section">
      {/* Texture Overlays */}
      <div className="grain-overlay"></div>
      
      {/* SVG Grain Filter */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="grainy">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.25" />
          </feComponentTransfer>
        </filter>
      </svg>

      <div className="hero-content">
        {/* User Avatar & Info */}
        <div className="hero-user">
          <div className="avatar-container">
            {/* 3D Wave Ripple Layers */}
            <div className="wave-ripple wave-1"></div>
            <div className="wave-ripple wave-2"></div>
            <div className="wave-ripple wave-3"></div>
            
            {isSignedIn && userProfile?.avatar ? (
              <img 
                src={userProfile.avatar} 
                alt={displayName}
                className="user-avatar"
                onClick={handleProfileClick}
              />
            ) : (
              <div className="user-avatar-placeholder" onClick={handleProfileClick}>
                <iconify-icon icon="solar:user-linear" width="32" height="32"></iconify-icon>
              </div>
            )}
          </div>

          <div className="user-info">
            <h1 className="user-name">
              {isSignedIn ? t('dashboard.welcome').replace('{name}', displayName) : t('dashboard.welcomeGuest')}
            </h1>
            <p className="user-subtitle">
              {isSignedIn 
                ? t('dashboard.exploreSubtitleSigned')
                : t('dashboard.exploreSubtitleGuest')}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="hero-actions">
          <div className="action-buttons">
            <button 
              className="action-btn primary"
              onClick={() => {
                trackCTA('explore_gallery', 'hero_section')
                navigate('/gallery')
              }}
            >
              <iconify-icon icon="solar:star-linear" width="16" height="16"></iconify-icon>
              {t('dashboard.exploreGallery')}
            </button>
            <button 
              className="action-btn secondary"
              onClick={() => {
                trackCTA('view_events', 'hero_section')
                navigate('/events')
              }}
            >
              <iconify-icon icon="solar:calendar-linear" width="16" height="16"></iconify-icon>
              {t('dashboard.viewEvents')}
            </button>
            {!isSignedIn && !isLoading && (
              <button className="action-btn tertiary" onClick={handleProfileClick}>
                <iconify-icon icon="solar:user-linear" width="16" height="16"></iconify-icon>
                {t('common.signIn')}
              </button>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div className="hero-social">
          <span className="social-label">{t('dashboard.followUs')}</span>
          <div className="social-links">
            <button 
              className="social-link"
              onClick={() => handleSocialClick('twitter')}
              title="Twitter"
            >
              <iconify-icon icon="simple-icons:x" width="18" height="18"></iconify-icon>
            </button>
            <button 
              className="social-link"
              onClick={() => handleSocialClick('instagram')}
              title="Instagram"
              style={{ marginLeft: '12px' }}
            >
              <iconify-icon icon="simple-icons:instagram" width="18" height="18"></iconify-icon>
            </button>
            <button 
              className="social-link"
              onClick={() => handleSocialClick('discord')}
              title="Discord"
              style={{ marginLeft: '12px' }}
            >
              <iconify-icon icon="simple-icons:discord" width="18" height="18"></iconify-icon>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .hero-section {
          background: #050505;
          border-radius: 12px;
          padding: 100px 40px;
          margin-bottom: 32px;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 0, 0, 0.08);
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.9);
          max-width: 1400px;
          margin-left: auto;
          margin-right: auto;
        }

        /* Grain Overlay */
        .grain-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 2;
          filter: url(#grainy);
          opacity: 0.3;
          mix-blend-mode: soft-light;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(139, 0, 0, 0.1) 0%, transparent 70%);
          pointer-events: none;
          z-index: 1;
        }

        /* 3D Wave Ripple with Physical Volume */
        .wave-ripple {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120px;
          height: 120px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          /* The "Hump" of the wave using radial gradients */
          background: radial-gradient(
            circle, 
            transparent 35%, 
            rgba(0, 0, 0, 0.5) 42%,       /* Trough shadow */
            rgba(196, 30, 58, 0.25) 48%,   /* Ascent slope */
            rgba(255, 255, 255, 0.4) 50%,  /* Crest highlight */
            rgba(196, 30, 58, 0.25) 52%,   /* Descent slope */
            rgba(0, 0, 0, 0.4) 58%,       /* Trailing shadow */
            transparent 65%
          );
          filter: drop-shadow(0 0 20px rgba(0, 0, 0, 0.8));
          will-change: transform, opacity;
        }

        .wave-1 { animation: wave-expand 6s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite; }
        .wave-2 { animation: wave-expand 6s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite 2s; }
        .wave-3 { animation: wave-expand 6s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite 4s; }

        @keyframes wave-expand {
          0% {
            transform: translate(-50%, -50%) scale(0.9);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(8);
            opacity: 0;
          }
        }

        .hero-section .hero-content {
          position: relative;
          z-index: 5;
          display: flex;
          flex-direction: column;
          gap: 48px;
          align-items: center;
          text-align: center;
        }

        .hero-section .hero-user {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
        }

        .hero-section .avatar-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 160px;
          height: 160px;
        }

        .hero-section .user-avatar {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          border: 1px solid rgba(255, 0, 0, 0.2);
          box-shadow: 
            0 0 0 8px rgba(0, 0, 0, 0.3),
            0 0 40px rgba(196, 30, 58, 0.4);
          object-fit: cover;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          z-index: 10;
        }

        .hero-section .user-avatar:hover {
          transform: scale(1.08) translateY(-5px);
          box-shadow: 
            0 0 0 12px rgba(196, 30, 58, 0.1),
            0 20px 60px rgba(196, 30, 58, 0.6);
        }

        .hero-section .user-avatar-placeholder {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          border: 4px solid #1a1a1a;
          background: #080808;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          cursor: pointer;
          z-index: 10;
        }

        .hero-section .user-info {
          max-width: 800px;
        }

        .hero-section .user-name {
          font-size: 5rem;
          font-weight: 950;
          color: white;
          margin: 0 0 20px 0;
          text-transform: uppercase;
          letter-spacing: -4px;
          line-height: 1.1;
          background: linear-gradient(180deg, #FFFFFF 30%, #444444 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));
        }

        .hero-section .user-subtitle {
          font-size: 1.35rem;
          color: #777;
          margin: 0;
          line-height: 1.5;
          max-width: 550px;
          margin: 0 auto;
          font-weight: 400;
          letter-spacing: -0.2px;
        }

        .hero-section .action-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
        }

        .hero-section .action-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 32px;
          border-radius: 4px;
          border: 1px solid #1a1a1a;
          background: rgba(10, 10, 10, 0.8);
          color: #aaa;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-size: 0.7rem;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          backdrop-filter: blur(5px);
        }

        .hero-section .action-btn:hover {
          background: #111;
          color: white;
          border-color: #333;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .hero-section .action-btn.primary {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }

        .hero-section .action-btn.primary:hover {
          background: #FF1A1A;
          box-shadow: 0 15px 35px rgba(255, 0, 0, 0.3);
        }

        .hero-section .hero-social {
          margin-top: 20px;
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .hero-section .social-links {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .hero-section .social-label {
          color: #333;
          font-size: 0.65rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 3px;
        }

        /* Mobile optimizations */
        @media (max-width: 767px) {
          .hero-section {
            padding: 80px 20px;
          }

          .hero-section .user-name {
            font-size: 3rem;
            letter-spacing: -2px;
          }

          .hero-section .user-subtitle {
            font-size: 1.1rem;
          }

          .hero-section .action-buttons {
            flex-direction: column;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}