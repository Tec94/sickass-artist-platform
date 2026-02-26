import { useMemo, useState } from 'react'
import AppScaffold from './AppScaffold'
import { usePhoneOverlay } from '../../PhoneOverlayProvider'
import { PHONE_CARD_PASS_COLORS } from '../../content/phoneSeedContent'

type CardsTab = 'wallet' | 'passes'
type CardItem = { id: string; title: string; tint: string; subtitle?: string; description?: string }

export default function CardsApp() {
  const { content, locale, setModal } = usePhoneOverlay()
  const [tab, setTab] = useState<CardsTab>('wallet')

  const walletCards = useMemo<CardItem[]>(
    () => [
      { id: 'vip', title: `${content.artistName} VIP`, subtitle: locale === 'es' ? 'Pack Access' : 'Pack Access', tint: '#111827' },
      { id: 'event', title: locale === 'es' ? 'Ticket Evento' : 'Event Ticket', subtitle: 'Stage Call', tint: '#172554' },
      { id: 'merch', title: locale === 'es' ? 'Descuento Merch' : 'Merch Discount', subtitle: '10% OFF', tint: '#7c2d12' },
      { id: 'spotify', title: 'Spotify Milestone', subtitle: locale === 'es' ? 'Top tracks' : 'Top tracks', tint: '#052e16' },
    ],
    [content.artistName, locale],
  )

  const passCards = useMemo<CardItem[]>(
    () =>
      [
        { id: 'tour', title: locale === 'es' ? 'Tour Stop' : 'Tour Stop', description: 'San Juan' },
        { id: 'release', title: locale === 'es' ? 'Nuevo Release' : 'New Release', description: content.music.discography[0]?.name || 'Release' },
        { id: 'fan', title: locale === 'es' ? 'Fan Challenge' : 'Fan Challenge', description: 'Share your fit' },
        { id: 'drop', title: locale === 'es' ? 'Merch Drop' : 'Merch Drop', description: 'Limited window' },
      ].map((item, index) => ({ ...item, tint: PHONE_CARD_PASS_COLORS[index % PHONE_CARD_PASS_COLORS.length] })),
    [content.music.discography, locale],
  )

  const items: CardItem[] = tab === 'wallet' ? walletCards : passCards

  return (
    <AppScaffold title="Cards" subtitle={tab === 'wallet' ? (locale === 'es' ? 'Wallet' : 'Wallet') : (locale === 'es' ? 'Pases' : 'Passes')}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-black/20 p-1">
          <button type="button" className={`rounded-xl px-2 py-2 text-[11px] ${tab === 'wallet' ? 'bg-white text-black' : 'text-zinc-300'}`} onClick={() => setTab('wallet')}>
            Wallet
          </button>
          <button type="button" className={`rounded-xl px-2 py-2 text-[11px] ${tab === 'passes' ? 'bg-white text-black' : 'text-zinc-300'}`} onClick={() => setTab('passes')}>
            Passes
          </button>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="flex min-w-max snap-x gap-3">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className="phone-card-surface relative w-[250px] snap-center overflow-hidden rounded-3xl border border-white/10 p-4 text-left shadow-lg"
                style={{ background: `linear-gradient(155deg, ${item.tint}, #090b10)` }}
                onClick={() =>
                  setModal({
                    id: `card-detail-${item.id}`,
                    title: item.title,
                    body: (
                      <div className="space-y-2">
                        <p>{item.subtitle || item.description}</p>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-left text-[11px] text-zinc-300">
                          {locale === 'es'
                            ? 'Tarjeta simulada para experiencia interactiva. Codigo/QR decorativo en V1.'
                            : 'Simulated card for interactive experience. QR/barcode decorative in V1.'}
                        </div>
                      </div>
                    ),
                  })
                }
              >
                <div className="absolute right-4 top-4 text-white/80">
                  <iconify-icon icon={tab === 'wallet' ? 'solar:card-bold-duotone' : 'solar:ticket-bold-duotone'} width="22" height="22" />
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/60">{tab === 'wallet' ? 'ROA Wallet' : 'ROA Pass'}</div>
                <div className="mt-6 text-lg font-semibold text-white">{item.title}</div>
                <div className="mt-1 text-xs text-white/75">{item.subtitle || item.description}</div>
                <div className="mt-8 flex items-end justify-between">
                  <div className="text-[10px] text-white/65">{locale === 'es' ? 'Tap para expandir' : 'Tap to expand'}</div>
                  <div className="flex gap-1">
                    <span className="h-2 w-5 rounded-full bg-white/90" />
                    <span className="h-2 w-2 rounded-full bg-white/50" />
                    <span className="h-2 w-2 rounded-full bg-white/30" />
                  </div>
                </div>
                {tab === 'passes' ? <div className="mt-4 h-14 rounded-xl border border-white/10 bg-white/5" /> : null}
                {index === 0 ? <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.2),transparent_40%)]" /> : null}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300">{locale === 'es' ? 'Acciones' : 'Actions'}</h3>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button type="button" className="rounded-xl border border-white/10 bg-white/5 py-2 text-xs text-white">{locale === 'es' ? 'Agregar pass' : 'Add pass'}</button>
            <button type="button" className="rounded-xl border border-white/10 bg-white/5 py-2 text-xs text-white">{locale === 'es' ? 'Compartir' : 'Share'}</button>
          </div>
        </div>
      </div>
    </AppScaffold>
  )
}
