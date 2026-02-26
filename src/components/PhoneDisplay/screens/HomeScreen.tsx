import { PhoneIconRegistry } from '../PhoneIconRegistry'
import { PHONE_APP_DEFINITIONS } from '../PhoneAppRegistry'
import { usePhoneOverlay } from '../PhoneOverlayProvider'

const dockAppIds = ['phone', 'messages', 'gallery', 'music'] as const

export function HomeScreen() {
  const { content, locale, openApp, setLocale } = usePhoneOverlay()
  const wallpaper = content.wallpaperCandidates[0]?.src || '/images/roa profile.jpg'
  const primaryApps = PHONE_APP_DEFINITIONS.filter((app) => app.priority === 'primary')
  const secondaryApps = PHONE_APP_DEFINITIONS.filter((app) => app.priority === 'secondary')
  const gridApps = [...primaryApps, ...secondaryApps.slice(0, 4)]

  return (
    <div className="relative h-full w-full">
      <img src={wallpaper} alt="" className="absolute inset-0 h-full w-full object-cover blur-[2px] scale-105" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/45" />

      <div className="absolute inset-0 px-4 pt-20 pb-14">
        <div className="mb-3 flex items-center justify-end">
          <div className="rounded-full border border-white/10 bg-black/30 p-1 backdrop-blur">
            <button
              type="button"
              className={`rounded-full px-2 py-1 text-[10px] ${locale === 'es' ? 'bg-white text-black' : 'text-white/80'}`}
              onClick={() => setLocale('es')}
            >
              ES
            </button>
            <button
              type="button"
              className={`rounded-full px-2 py-1 text-[10px] ${locale === 'en' ? 'bg-white text-black' : 'text-white/80'}`}
              onClick={() => setLocale('en')}
            >
              EN
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-x-2 gap-y-4">
          {gridApps.map((app) => (
            <button
              key={app.id}
              type="button"
              className="group flex flex-col items-center gap-1 hover:scale-95 transition-transform duration-200"
              onClick={() => openApp(app.id)}
              title={locale === 'es' ? app.labelEs : app.labelEn}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.25)] overflow-hidden">
                <PhoneIconRegistry icon={app.icon} size={56} />
              </span>
              <span className="max-w-[70px] truncate text-center text-[10px] font-medium text-white/95">
                {locale === 'es' ? app.labelEs : app.labelEn}
              </span>
            </button>
          ))}
        </div>

        <div className="absolute inset-x-4 bottom-6 rounded-3xl border border-white/10 bg-black/30 p-2 backdrop-blur-xl">
          <div className="grid grid-cols-4 gap-2">
            {dockAppIds.map((appId) => {
              const app = PHONE_APP_DEFINITIONS.find((entry) => entry.id === appId)
              if (!app) return null
              return (
                <button key={app.id} type="button" className="flex items-center justify-center rounded-2xl py-2 hover:scale-95 transition-transform duration-200" onClick={() => openApp(app.id)}>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl overflow-hidden shadow-sm">
                    <PhoneIconRegistry icon={app.icon} size={44} />
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

