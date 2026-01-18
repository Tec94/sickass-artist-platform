import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { useTranslation } from '../hooks/useTranslation'

export function ProfileEdit() {
  const { user, isSignedIn, isLoading } = useAuth()
  const { language, setLanguage, t } = useTranslation()
  const navigate = useNavigate()
  const updateUserMutation = useMutation(api.users.update)
  const animate = useScrollAnimation()

  const [formData, setFormData] = useState({
    username: user?.username || '',
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    location: user?.location || '',
    socials: {
      twitter: user?.socials?.twitter || '',
      instagram: user?.socials?.instagram || '',
      tiktok: user?.socials?.tiktok || '',
    },
    language: language === 'en' ? 'English' : 'Spanish',
  })

  // Sync formData language if global preference changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      language: language === 'en' ? 'English' : 'Spanish'
    }))
  }, [language])

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  if (isLoading) {
    return <div className="loading-container">{t('common.loading')}</div>
  }

  if (!isSignedIn || !user) {
    return (
      <div className="error-view">
        <p>{t('profile.edit.restricted')}</p>
        <button onClick={() => navigate('/')} className="back-btn-v2">{t('profile.edit.returnHome')}</button>
      </div>
    )
  }

  const handleChange = (field: string, value: string) => {
    if (field === 'language') {
      setLanguage(value === 'English' ? 'en' : 'es')
      // formData will be updated by useEffect
      return
    }

    if (field.startsWith('socials.')) {
      const socialKey = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        socials: {
          ...prev.socials,
          [socialKey as keyof typeof prev.socials]: value,
        },
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      await updateUserMutation({
        userId: user._id,
        updates: {
          displayName: formData.displayName,
          bio: formData.bio,
          location: formData.location,
          socials: formData.socials,
        },
      })
      navigate('/profile')
    } catch (err) {
      setError(t('profile.edit.errorSync'))
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="profile-edit-layout">
      <div ref={animate} data-animate className="profile-edit-container">
        <header className="profile-edit-header">
           <h1 className="form-title">{t('profile.edit.modifyIdentity')}</h1>
        </header>

        {error && (
          <div className="error-banner">
            <iconify-icon icon="solar:danger-triangle-linear"></iconify-icon>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="field-group">
            <label className="field-label">{t('profile.edit.displayName')}</label>
            <div className="input-wrapper">
              <iconify-icon icon="solar:user-id-linear"></iconify-icon>
              <input
                type="text"
                value={formData.displayName}
                onChange={e => handleChange('displayName', e.target.value)}
                maxLength={50}
                placeholder={t('profile.edit.identityPlaceholder')}
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">{t('profile.edit.bioLabel')}</label>
            <textarea
              value={formData.bio}
              onChange={e => handleChange('bio', e.target.value)}
              maxLength={500}
              placeholder={t('profile.edit.bioPlaceholder')}
            />
          </div>

          <div className="field-group">
            <label className="field-label">{t('profile.edit.territory')}</label>
            <div className="input-wrapper">
              <iconify-icon icon="solar:map-point-linear"></iconify-icon>
              <input
                type="text"
                value={formData.location}
                onChange={e => handleChange('location', e.target.value)}
                maxLength={50}
                placeholder={t('profile.edit.territoryPlaceholder')}
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">{t('profile.edit.protocol')}</label>
            <div className="language-selector">
              {['English', 'Spanish'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleChange('language', lang)}
                  className={`lang-btn ${formData.language === lang ? 'active' : ''}`}
                >
                  <iconify-icon icon={lang === 'English' ? 'twemoji:flag-united-states' : 'twemoji:flag-spain'}></iconify-icon>
                  <span>{lang === 'English' ? t('common.english') : t('common.spanish')}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="socials-meta">
            <h3 className="meta-title">{t('profile.edit.nexusLinks')}</h3>
            <div className="social-inputs">
              {(['twitter', 'instagram', 'tiktok'] as const).map(platform => (
                <div key={platform} className="social-input-group">
                  <div className="platform-icon">
                    <iconify-icon icon={`simple-icons:${platform}`}></iconify-icon>
                  </div>
                  <input
                    type="text"
                    value={formData.socials[platform]}
                    onChange={e => handleChange(`socials.${platform}`, e.target.value)}
                    placeholder={`@${platform}_handle`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={isSaving} className="save-btn border-beam">
              <span>{isSaving ? t('profile.edit.syncing') : t('profile.edit.confirmSync')}</span>
            </button>
            <button type="button" onClick={() => navigate('/profile')} className="cancel-btn">
              {t('profile.edit.cancel')}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .profile-edit-layout {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .profile-edit-container {
          background: rgba(10, 10, 10, 0.4);
          backdrop-filter: blur(20px);
          border: 1px solid var(--color-card-border);
          border-radius: 24px;
          padding: 40px;
        }

        .form-title {
          font-size: 24px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: white;
          margin: 0 0 32px 0;
        }

        .error-banner {
          background: rgba(255, 0, 0, 0.1);
          border: 1px solid var(--color-primary);
          color: white;
          padding: 12px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          font-size: 13px;
          font-weight: 700;
        }

        .edit-form { display: flex; flex-direction: column; gap: 24px; }

        .field-group { display: flex; flex-direction: column; gap: 8px; }

        .field-label {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--color-text-dim);
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-wrapper iconify-icon {
          position: absolute;
          left: 16px;
          font-size: 20px;
          color: var(--color-primary);
        }

        input, textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--color-card-border);
          border-radius: 12px;
          padding: 12px 16px;
          color: white;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.3s ease;
        }

        .input-wrapper input { padding-left: 48px; }

        input:focus, textarea:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--color-primary);
          box-shadow: 0 0 20px rgba(255, 0, 0, 0.1);
        }

        textarea { height: 120px; resize: none; }

        .language-selector {
          display: flex;
          gap: 12px;
          margin-top: 4px;
        }

        .lang-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--color-card-border);
          border-radius: 12px;
          padding: 12px;
          color: var(--color-text-dim);
          font-size: 13px;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .lang-btn iconify-icon {
          font-size: 18px;
          filter: grayscale(1);
          transition: all 0.3s ease;
        }

        .lang-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .lang-btn.active {
          background: rgba(255, 0, 0, 0.1);
          border-color: var(--color-primary);
          color: white;
          box-shadow: 0 0 20px rgba(255, 0, 0, 0.1);
        }

        .lang-btn.active iconify-icon {
          filter: grayscale(0);
          transform: scale(1.1);
        }

        .socials-meta { margin-top: 16px; }

        .meta-title {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--color-text-dim);
          margin-bottom: 16px;
        }

        .social-inputs { display: flex; flex-direction: column; gap: 12px; }

        .social-input-group {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--color-card-border);
          border-radius: 12px;
          overflow: hidden;
        }

        .platform-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.2);
          color: var(--color-primary);
          font-size: 18px;
        }

        .social-input-group input { border: none; background: transparent; }

        .form-actions {
          display: flex;
          gap: 16px;
          margin-top: 24px;
        }

        .save-btn {
          flex: 2;
          background: var(--color-primary);
          color: white;
          border: none;
          padding: 14px;
          border-radius: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
        }

        .cancel-btn {
          flex: 1;
          background: transparent;
          border: 1px solid var(--color-card-border);
          color: var(--color-text-dim);
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .cancel-btn:hover { color: white; border-color: white; }
      `}</style>
    </div>
  )
}
