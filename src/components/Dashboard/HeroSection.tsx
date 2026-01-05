import { User, Star, MessageCircle, Share2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const HeroSection = () => {
  const navigate = useNavigate()

  const handleProfileClick = (): void => {
    navigate('/profile')
  }

  const handleSocialClick = (platform: string): void => {
    console.log(`Open ${platform}`)
  }

  return (
    <div className="hero-section">
      <div className="hero-content">
        {/* User Avatar & Info */}
        <div className="hero-user">
          <div className="avatar-container">
            <div className="user-avatar-placeholder" onClick={handleProfileClick}>
              <User size={32} />
            </div>
            
            {/* Status indicators */}
            <div className="status-indicators">
              <div className="status-dot online" title="Online"></div>
              <div className="status-dot verified" title="Verified">
                <Star size={12} />
              </div>
            </div>
          </div>

          <div className="user-info">
            <h1 className="user-name">
              Welcome to the Community
            </h1>
            <p className="user-subtitle">
              Discover the latest content, events, and connect with fellow fans
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="hero-actions">
          <div className="action-buttons">
            <button 
              className="action-btn primary"
              onClick={() => navigate('/3')}
            >
              <Star size={16} />
              Explore Gallery
            </button>
            <button 
              className="action-btn secondary"
              onClick={() => navigate('/1')}
            >
              <MessageCircle size={16} />
              View Events
            </button>
            <button className="action-btn tertiary" onClick={handleProfileClick}>
              <User size={16} />
              Sign In
            </button>
          </div>
        </div>

        {/* Social Links */}
        <div className="hero-social">
          <span className="social-label">Follow us:</span>
          <div className="social-links">
            <button 
              className="social-link"
              onClick={() => handleSocialClick('twitter')}
              title="Twitter"
            >
              <Share2 size={16} />
            </button>
            <button 
              className="social-link"
              onClick={() => handleSocialClick('instagram')}
              title="Instagram"
            >
              <Share2 size={16} />
            </button>
            <button 
              className="social-link"
              onClick={() => handleSocialClick('discord')}
              title="Discord"
            >
              <MessageCircle size={16} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .hero-section {
          background: linear-gradient(135deg, #1a0000 0%, #000000 100%);
          border-radius: 12px;
          padding: 60px 40px;
          margin-bottom: 32px;
          position: relative;
          overflow: hidden;
          border: 1px solid var(--color-card-border);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(255, 0, 0, 0.05) 0%, transparent 100%);
          pointer-events: none;
        }

        .hero-section .hero-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 32px;
          align-items: center;
          text-align: center;
        }

        .hero-section .hero-user {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .hero-section .avatar-container {
          position: relative;
          display: inline-block;
        }

        .hero-section .user-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 4px solid var(--color-card-border);
          object-fit: cover;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .hero-section .user-avatar:hover {
          transform: scale(1.05);
          border-color: var(--color-primary);
        }

        .hero-section .user-avatar-placeholder {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 4px solid var(--color-card-border);
          background: rgba(255, 0, 0, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .hero-section .user-avatar-placeholder:hover {
          background: rgba(255, 0, 0, 0.1);
          transform: scale(1.05);
          border-color: var(--color-primary);
        }

        .hero-section .status-indicators {
          position: absolute;
          bottom: 8px;
          right: 8px;
          display: flex;
          gap: 4px;
        }

        .hero-section .status-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-section .status-dot.online {
          background: #10B981;
        }

        .hero-section .status-dot.verified {
          background: var(--color-primary);
          color: white;
        }

        .hero-section .user-info {
          max-width: 600px;
        }

        .hero-section .user-name {
          font-size: 3rem;
          font-weight: 900;
          color: white;
          margin: 0 0 12px 0;
          text-transform: uppercase;
          letter-spacing: -1px;
          line-height: 0.9;
        }

        .hero-section .user-subtitle {
          font-size: 1.125rem;
          color: var(--color-text-dim);
          margin: 0;
          line-height: 1.6;
        }

        .hero-section .hero-actions {
          width: 100%;
          max-width: 500px;
        }

        .hero-section .action-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .hero-section .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 4px;
          border: 1px solid var(--color-card-border);
          background: rgba(255, 255, 255, 0.03);
          color: white;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .hero-section .action-btn:hover {
          background: rgba(255, 0, 0, 0.1);
          border-color: var(--color-primary);
          transform: translateY(-2px);
        }

        .hero-section .action-btn.primary {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }

        .hero-section .action-btn.primary:hover {
          background: #cc0000;
          box-shadow: 0 8px 20px rgba(255, 0, 0, 0.3);
        }

        .hero-section .hero-social {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .hero-section .social-label {
          color: var(--color-text-dim);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .hero-section .social-links {
          display: flex;
          gap: 8px;
        }

        .hero-section .social-link {
          width: 36px;
          height: 36px;
          border-radius: 4px;
          border: 1px solid var(--color-card-border);
          background: rgba(255, 255, 255, 0.03);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .hero-section .social-link:hover {
          background: rgba(255, 0, 0, 0.1);
          border-color: var(--color-primary);
          transform: translateY(-2px);
        }

        /* Mobile optimizations */
        @media (max-width: 767px) {
          .hero-section {
            padding: 40px 20px;
            margin-bottom: 24px;
            border-radius: 8px;
          }

          .hero-section .user-name {
            font-size: 2rem;
          }

          .hero-section .user-subtitle {
            font-size: 1rem;
          }

          .hero-section .action-buttons {
            flex-direction: column;
          }

          .hero-section .action-btn {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}