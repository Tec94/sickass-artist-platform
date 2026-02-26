import { useEffect, useState } from 'react'
import AppScaffold from './AppScaffold'
import { usePhoneOverlay } from '../../PhoneOverlayProvider'

type Phase = 'idle' | 'listening' | 'result'

export default function VoiceTranslateApp() {
  const { locale } = usePhoneOverlay()
  const [phase, setPhase] = useState<Phase>('idle')
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    if (phase !== 'listening') return
    const pulseInterval = window.setInterval(() => setPulse((value) => (value + 1) % 6), 180)
    const resultTimer = window.setTimeout(() => setPhase('result'), 1800)
    return () => {
      window.clearInterval(pulseInterval)
      window.clearTimeout(resultTimer)
    }
  }, [phase])

  const content = {
    es: {
      title: 'Voz / Traduccion',
      subtitle: 'Utilidad simulada',
      prompt: 'Toca el microfono para iniciar una demo.',
      listening: 'Escuchando...',
      source: 'Yo creo que ya es hora. Tamos ready PR?',
      translated: 'I think it is time. We ready PR?',
    },
    en: {
      title: 'Voice / Translate',
      subtitle: 'Simulated utility',
      prompt: 'Tap the mic to start a demo.',
      listening: 'Listening...',
      source: 'Yo creo que ya es hora. Tamos ready PR?',
      translated: 'I think it is time. We ready PR?',
    },
  }[locale]

  return (
    <AppScaffold title={content.title} subtitle={content.subtitle}>
      <div className="flex h-full flex-col items-center justify-center">
        <button
          type="button"
          className={`relative mb-4 flex h-20 w-20 items-center justify-center rounded-full border ${
            phase === 'listening' ? 'border-sky-400/60 bg-sky-500/20' : 'border-white/10 bg-white/5'
          }`}
          onClick={() => setPhase((current) => (current === 'listening' ? 'result' : 'listening'))}
        >
          {phase === 'listening' && (
            <span className="absolute inset-0 rounded-full bg-sky-400/20" style={{ transform: `scale(${1 + pulse * 0.08})` }} />
          )}
          <iconify-icon icon="solar:microphone-3-bold-duotone" width="28" height="28" class="relative z-[1] text-white" />
        </button>
        <p className="text-center text-xs text-zinc-400">{phase === 'listening' ? content.listening : content.prompt}</p>
        {phase === 'result' ? (
          <div className="mt-4 w-full rounded-2xl border border-white/10 bg-[#0e131a]/70 p-3">
            <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">{locale === 'es' ? 'Original' : 'Source'}</div>
            <p className="mt-1 text-xs text-white">{content.source}</p>
            <div className="mt-3 text-[10px] uppercase tracking-[0.16em] text-zinc-500">{locale === 'es' ? 'Traduccion' : 'Translation'}</div>
            <p className="mt-1 text-xs text-sky-100">{content.translated}</p>
          </div>
        ) : null}
      </div>
    </AppScaffold>
  )
}

