import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { useTranslation } from '../hooks/useTranslation'

export function ProfileEdit() {
  const { user, isSignedIn, isLoading, signOut } = useAuth()
  const { language, setLanguage, t } = useTranslation()
  const navigate = useNavigate()
  const updateUserMutation = useMutation(api.users.update)
  const generateAvatarUploadUrl = useMutation(api.users.generateAvatarUploadUrl)
  const setAvatarFromStorageId = useMutation(api.users.setAvatarFromStorageId)
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
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState('')

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

  const handleAvatarFile = async (file: File | null) => {
    setAvatarError('')
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file.')
      return
    }
    // Keep it reasonable for uploads.
    if (file.size > 6 * 1024 * 1024) {
      setAvatarError('Image is too large (max 6MB).')
      return
    }

    setIsUploadingAvatar(true)
    try {
      const uploadUrl = await generateAvatarUploadUrl({})
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      if (!res.ok) {
        throw new Error(`Upload failed (${res.status})`)
      }
      const json = (await res.json()) as { storageId?: string }
      if (!json.storageId) {
        throw new Error('Upload did not return a storageId')
      }

      await setAvatarFromStorageId({ storageId: json.storageId as Id<'_storage'> })
      // Navigate back to profile to see the updated avatar.
      // (Convex will also update the reactive query, but this is a nice UX.)
    } catch (e) {
      console.error(e)
      setAvatarError('Failed to upload avatar. Please try again.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  return (
    <div className="profile-edit-layout app-surface-page">
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
          {/* Avatar Upload */}
          <div className="field-group">
            <label className="field-label">Profile picture</label>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-zinc-500 font-bold">
                    {(user.displayName || user.username || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1 flex items-center gap-3">
                <label className="px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-xs font-bold text-white cursor-pointer hover:border-red-600/60 transition">
                  {isUploadingAvatar ? 'Uploading…' : 'Upload image'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploadingAvatar}
                    onChange={(e) => handleAvatarFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                <span className="text-[11px] text-zinc-500">PNG/JPG/WebP up to 6MB</span>
              </div>
            </div>
            {avatarError && <div className="text-red-400 text-xs mt-2 font-semibold">{avatarError}</div>}
          </div>

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
            <button
              type="button"
              onClick={() => signOut()}
              className="cancel-btn signout-btn"
            >
              {t('common.signOut') || 'Sign out'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .profile-edit-layout {
          max-width: 750px;
          margin: 0 auto;
          padding: 24px 20px;
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-edit-container {
          background: rgba(10, 10, 10, 0.4);
          backdrop-filter: blur(20px);
          border: 1px solid var(--color-card-border);
          border-radius: 20px;
          padding: 28px;
          width: 100%;
        }

        .form-title {
          font-size: 20px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: white;
          margin: 0 0 20px 0;
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

        .edit-form { display: flex; flex-direction: column; gap: 16px; }

        .field-group { display: flex; flex-direction: column; gap: 6px; }

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
          border-radius: 10px;
          padding: 10px 14px;
          color: white;
          font-size: 13px;
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

        textarea { height: 70px; resize: none; }

        .language-selector {
          display: flex;
          gap: 10px;
          margin-top: 4px;
        }

        .lang-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--color-card-border);
          border-radius: 10px;
          padding: 10px;
          color: var(--color-text-dim);
          font-size: 12px;
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

        .socials-meta { margin-top: 10px; }

        .meta-title {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--color-text-dim);
          margin-bottom: 10px;
        }

        .social-inputs { display: flex; flex-direction: column; gap: 8px; }

        .social-input-group {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--color-card-border);
          border-radius: 12px;
          overflow: hidden;
        }

        .platform-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.2);
          color: var(--color-primary);
          font-size: 16px;
        }

        .social-input-group input { border: none; background: transparent; }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        .save-btn {
          flex: 2;
          background: var(--color-primary);
          color: white;
          border: none;
          padding: 10px;
          border-radius: 10px;
          font-size: 11px;
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
          padding: 10px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
        }

        .cancel-btn:hover { color: white; border-color: white; }
        .signout-btn {
          border-color: rgba(220, 38, 38, 0.5);
          color: white;
        }
        .signout-btn:hover {
          border-color: rgba(220, 38, 38, 0.9);
        }
      `}</style>
    </div>
  )
}
