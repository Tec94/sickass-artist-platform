import { useMemo, useState } from 'react'
import AppScaffold from './AppScaffold'
import { usePhoneOverlay } from '../../PhoneOverlayProvider'

type PhoneTab = 'recents' | 'contacts' | 'keypad' | 'voicemail'

const formatDial = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

export default function PhoneApp() {
  const { content, locale, setSheet } = usePhoneOverlay()
  const [tab, setTab] = useState<PhoneTab>('recents')
  const [dialRaw, setDialRaw] = useState('')
  const [selectedVoicemail, setSelectedVoicemail] = useState<string | null>(null)

  const contacts = useMemo(
    () =>
      content.collaborators.slice(0, 6).map((collab, index) => ({
        id: collab.id,
        name: collab.name,
        number: `+1 (787) 55${index + 10}-${index + 30}${index + 40}`,
      })),
    [content.collaborators],
  )

  const recents = useMemo(
    () =>
      contacts.slice(0, 4).map((contact, index) => ({
        ...contact,
        type: index % 2 === 0 ? 'outgoing' : 'missed',
        time: ['09:35', '11:10', '19:00', '23:00'][index] || '12:00',
      })),
    [contacts],
  )

  const voicemails = useMemo(
    () =>
      content.messagesSeed.slice(0, 4).map((message, index) => ({
        id: `vm-${index}`,
        from: index === 0 ? 'ROA Updates' : contacts[index % Math.max(1, contacts.length)]?.name || 'Contact',
        transcriptEs: message.textEs,
        transcriptEn: message.textEn,
        duration: `0:${20 + index * 7}`,
      })),
    [contacts, content.messagesSeed],
  )

  const activeVoicemail = voicemails.find((item) => item.id === selectedVoicemail) || null

  const tabLabels: Record<PhoneTab, string> = {
    recents: locale === 'es' ? 'Recientes' : 'Recents',
    contacts: locale === 'es' ? 'Contactos' : 'Contacts',
    keypad: locale === 'es' ? 'Teclado' : 'Keypad',
    voicemail: 'Voicemail',
  }

  return (
    <AppScaffold title={locale === 'es' ? 'Telefono' : 'Phone'} subtitle={tabLabels[tab]}>
      <div className="flex h-full flex-col gap-3">
        <div className="grid grid-cols-4 gap-1 rounded-2xl border border-white/10 bg-black/20 p-1">
          {(Object.keys(tabLabels) as PhoneTab[]).map((tabKey) => (
            <button
              key={tabKey}
              type="button"
              className={`rounded-xl px-2 py-2 text-[10px] ${tab === tabKey ? 'bg-white text-black' : 'text-zinc-300'}`}
              onClick={() => {
                setTab(tabKey)
                setSelectedVoicemail(null)
              }}
            >
              {tabLabels[tabKey]}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          {tab === 'recents' && (
            <div className="space-y-2">
              {recents.map((item) => (
                <button key={item.id} type="button" className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[#0e131a]/70 p-3 text-left" onClick={() => setSheet({ id: `call-${item.id}`, title: item.name, subtitle: item.number, actions: [{ id: 'close', label: locale === 'es' ? 'Cerrar' : 'Close' }] })}>
                  <div className="min-w-0">
                    <div className="truncate text-xs text-white">{item.name}</div>
                    <div className={`text-[11px] ${item.type === 'missed' ? 'text-red-300' : 'text-zinc-400'}`}>{item.type === 'missed' ? (locale === 'es' ? 'Perdida' : 'Missed') : locale === 'es' ? 'Saliente' : 'Outgoing'} • {item.time}</div>
                  </div>
                  <iconify-icon icon="solar:phone-calling-rounded-linear" width="16" height="16" class="text-zinc-500" />
                </button>
              ))}
            </div>
          )}

          {tab === 'contacts' && (
            <div className="space-y-2">
              {contacts.map((contact) => (
                <button key={contact.id} type="button" className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[#0e131a]/70 p-3 text-left" onClick={() => setSheet({ id: `contact-${contact.id}`, title: contact.name, subtitle: contact.number, actions: [{ id: 'call', label: locale === 'es' ? 'Llamar (simulado)' : 'Call (simulated)', tone: 'accent' }, { id: 'close', label: locale === 'es' ? 'Cerrar' : 'Close' }] })}>
                  <div>
                    <div className="text-xs text-white">{contact.name}</div>
                    <div className="text-[11px] text-zinc-400">{contact.number}</div>
                  </div>
                  <iconify-icon icon="solar:info-circle-linear" width="16" height="16" class="text-zinc-500" />
                </button>
              ))}
            </div>
          )}

          {tab === 'keypad' && (
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-4 text-center">
                <div className="text-xs text-zinc-400">{locale === 'es' ? 'Numero' : 'Number'}</div>
                <div className="mt-1 text-2xl tracking-wide text-white">{formatDial(dialRaw) || '0'}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['1','2','3','4','5','6','7','8','9','*','0','#'].map((key) => (
                  <button key={key} type="button" className="rounded-2xl border border-white/10 bg-white/5 py-3 text-sm text-white" onClick={() => setDialRaw((current) => (current.length >= 12 ? current : `${current}${key}`))}>
                    {key}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" className="rounded-xl border border-white/10 bg-white/5 py-2 text-xs text-white" onClick={() => setDialRaw((current) => current.slice(0, -1))}>
                  {locale === 'es' ? 'Borrar' : 'Delete'}
                </button>
                <button type="button" className="rounded-xl border border-green-900/60 bg-green-950/30 py-2 text-xs text-green-100" onClick={() => setSheet({ id: 'call-sim', title: formatDial(dialRaw) || '0', subtitle: locale === 'es' ? 'Llamada simulada' : 'Simulated call', actions: [{ id: 'close', label: locale === 'es' ? 'Cerrar' : 'Close' }] })}>
                  {locale === 'es' ? 'Llamar' : 'Call'}
                </button>
              </div>
            </div>
          )}

          {tab === 'voicemail' && (
            <div className="space-y-2">
              {activeVoicemail ? (
                <div className="space-y-3">
                  <button type="button" className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white" onClick={() => setSelectedVoicemail(null)}>
                    <iconify-icon icon="solar:alt-arrow-left-linear" width="14" height="14" />
                    {locale === 'es' ? 'Volver' : 'Back'}
                  </button>
                  <div className="rounded-2xl border border-white/10 bg-[#0e131a]/70 p-3">
                    <div className="text-xs font-semibold text-white">{activeVoicemail.from}</div>
                    <div className="mt-1 text-[11px] text-zinc-400">{activeVoicemail.duration}</div>
                    <div className="mt-3 h-8 rounded-xl border border-white/5 bg-black/30 p-2">
                      <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-sky-500/70 to-blue-400/70" />
                    </div>
                    <p className="mt-3 text-xs leading-5 text-zinc-200">{locale === 'es' ? activeVoicemail.transcriptEs : activeVoicemail.transcriptEn}</p>
                  </div>
                </div>
              ) : (
                voicemails.map((item) => (
                  <button key={item.id} type="button" className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[#0e131a]/70 p-3 text-left" onClick={() => setSelectedVoicemail(item.id)}>
                    <div className="min-w-0">
                      <div className="truncate text-xs text-white">{item.from}</div>
                      <div className="truncate text-[11px] text-zinc-400">{locale === 'es' ? item.transcriptEs : item.transcriptEn}</div>
                    </div>
                    <span className="text-[11px] text-zinc-500">{item.duration}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </AppScaffold>
  )
}

