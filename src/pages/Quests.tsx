import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { QuestList } from '../components/QuestCard'
import { useTranslation } from '../hooks/useTranslation'

export const Quests = () => {
  const { user, isSignedIn, isLoading } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">{t('profile.loading')}</div>
  }

  if (!isSignedIn || !user) {
    return (
      <div className="p-8 text-center bg-black/50 rounded-2xl border border-gray-800">
        <p className="text-gray-400 mb-6">{t('profile.signInPrompt')}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors"
        >
          {t('profile.backToHome')}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight">
            {t('profile.activeQuests')}
          </h1>
          <p className="text-zinc-500 text-sm">Track progress and claim rewards.</p>
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="text-xs text-zinc-500 hover:text-white uppercase tracking-wider"
        >
          {t('profile.backToHome')}
        </button>
      </div>

      <QuestList userId={user._id} />
    </div>
  )
}
