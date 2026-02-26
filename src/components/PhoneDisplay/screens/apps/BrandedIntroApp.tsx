import AppScaffold from './AppScaffold'
import { usePhoneOverlay } from '../../PhoneOverlayProvider'

export default function BrandedIntroApp() {
  const { content, locale } = usePhoneOverlay()

  return (
    <AppScaffold title={content.artistName} subtitle={locale === 'es' ? 'Surface cinematica' : 'Cinematic surface'}>
      <div className="flex h-full flex-col gap-4">
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-[#081226] p-4 shadow-[inset_0_0_40px_rgba(59,130,246,0.18)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.25),transparent_55%),radial-gradient(circle_at_85%_80%,rgba(147,51,234,0.2),transparent_55%)]" />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.3em] text-blue-200/70">ROA</div>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">{locale === 'es' ? 'Intro Visual' : 'Visual Intro'}</h3>
            <p className="mt-2 text-xs leading-5 text-blue-100/80">
              {locale === 'es'
                ? 'Modulo inspirado en las transiciones cinematograficas del demo. Ideal para un teaser, artifact o reveal dentro del telefono.'
                : 'Module inspired by the demo cinematic transitions. Ideal for a teaser, artifact, or reveal inside the phone.'}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="h-20 rounded-xl border border-blue-200/10 bg-blue-500/10" />
              <div className="h-20 rounded-xl border border-blue-200/10 bg-blue-500/10" />
              <div className="h-20 rounded-xl border border-blue-200/10 bg-blue-500/10" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300">
            {locale === 'es' ? 'Uso previsto' : 'Intended use'}
          </h4>
          <ul className="mt-2 space-y-2 text-xs text-zinc-200">
            <li>{locale === 'es' ? 'Teaser de album o single' : 'Album or single teaser'}</li>
            <li>{locale === 'es' ? 'Reveal de merch / tickets' : 'Merch / ticket reveal'}</li>
            <li>{locale === 'es' ? 'Asset interactivo de campaña' : 'Interactive campaign asset'}</li>
          </ul>
        </div>
      </div>
    </AppScaffold>
  )
}

