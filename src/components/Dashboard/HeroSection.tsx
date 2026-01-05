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
          background: linear-gradient(135deg, #8B0FFF 0%, #00D9FF 100%);
          border-radius: 20px;
          padding: 40px;
          margin-bottom: 32px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(139, 15, 255, 0.3);
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          pointer-events: none;
        }

        .hero-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 32px;
          align-items: center;
          text-align: center;
        }

        .hero-user {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .avatar-container {
          position: relative;
          display: inline-block;
        }

        .user-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 4px solid rgba(255, 255, 255, 0.2);
          object-fit: cover;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .user-avatar:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .user-avatar-placeholder {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 4px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .user-avatar-placeholder:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }

        .status-indicators {
          position: absolute;
          bottom: 8px;
          right: 8px;
          display: flex;
          gap: 4px;
        }

        .status-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .status-dot.online {
          background: #10B981;
        }

        .status-dot.verified {
          background: #8B0FFF;
          color: white;
        }

        .user-info {
          max-width: 600px;
        }

        .user-name {
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
          margin: 0 0 12px 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .user-subtitle {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          line-height: 1.6;
        }

        .hero-actions {
          width: 100%;
          max-width: 500px;
        }

        .cta-button {
          width: 100%;
          padding: 16px 32px;
          font-size: 1.125rem;
          font-weight: 600;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cta-button.primary {
          background: white;
          color: #8B0FFF;
        }

        .cta-button.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 10px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
        }

        .action-btn.primary {
          background: white;
          color: #8B0FFF;
          border-color: white;
        }

        .action-btn.primary:hover {
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .hero-social {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .social-label {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .social-links {
          display: flex;
          gap: 8px;
        }

        .social-link {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.1);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .social-link:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
        }

        /* Mobile optimizations */
        @media (max-width: 767px) {
          .hero-section {
            padding: 24px;
            margin-bottom: 24px;
            border-radius: 16px;
          }

          .hero-content {
            gap: 24px;
          }

          .user-avatar,
          .user-avatar-placeholder {
            width: 80px;
            height: 80px;
          }

          .user-name {
            font-size: 1.875rem;
          }

          .user-subtitle {
            font-size: 1rem;
          }

          .action-buttons {
            flex-direction: column;
          }

          .action-btn {
            justify-content: center;
          }

          .hero-social {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  )
}