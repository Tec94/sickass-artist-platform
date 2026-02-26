import { useMemo, useState } from 'react'
import AppScaffold from './AppScaffold'
import { usePhoneOverlay } from '../../PhoneOverlayProvider'

type Thread = {
  id: string
  name: string
  previewEs: string
  previewEn: string
  unread?: boolean
  messages: Array<{ id: string; from: 'me' | 'them'; textEs: string; textEn: string; time: string }>
}

export default function MessagesApp() {
  const { content, locale } = usePhoneOverlay()
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)

  const threads = useMemo<Thread[]>(() => {
    const roaMessages: Thread['messages'] = content.messagesSeed.map((msg) => ({
      id: msg.id,
      from: msg.direction === 'outgoing' ? ('me' as const) : ('them' as const),
      textEs: msg.textEs,
      textEn: msg.textEn,
      time: msg.timestampLabel,
    }))

    const collaboratorThreads = content.collaborators.slice(0, 3).map((collab, index) => ({
      id: `collab-${collab.id}`,
      name: collab.name,
      previewEs: `Coordinar visual ${index + 1} para proximo release`,
      previewEn: `Coordinate visual ${index + 1} for next release`,
      unread: index === 0,
      messages: [
        { id: `c-${index}-1`, from: 'them' as const, textEs: 'Tengo updates del arte.', textEn: 'I have art updates.', time: '09:10' },
        { id: `c-${index}-2`, from: 'me' as const, textEs: 'Envialos por aca.', textEn: 'Send them here.', time: '09:13' },
      ],
    }))

    return [
      {
        id: 'roa-updates',
        name: 'ROA Updates',
        previewEs: content.messagesSeed[0]?.textEs || 'Actualizacion del equipo',
        previewEn: content.messagesSeed[0]?.textEn || 'Team update',
        unread: true,
        messages: roaMessages,
      },
      ...collaboratorThreads,
      {
        id: 'fan-broadcast',
        name: 'Fan Broadcast',
        previewEs: 'Listo el teaser del proximo drop',
        previewEn: 'Next drop teaser is ready',
        messages: [
          { id: 'f-1', from: 'them', textEs: 'Subimos teaser esta noche?', textEn: 'Posting teaser tonight?', time: '18:02' },
          { id: 'f-2', from: 'me', textEs: 'Si, con CTA a eventos.', textEn: 'Yes, with events CTA.', time: '18:05' },
        ],
      },
    ]
  }, [content.collaborators, content.messagesSeed])

  const activeThread = threads.find((thread) => thread.id === activeThreadId) || null

  return (
    <AppScaffold title={locale === 'es' ? 'Mensajes' : 'Messages'} subtitle={activeThread ? activeThread.name : `${threads.length} threads`}>
      {activeThread ? (
        <div className="flex h-full flex-col">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white" onClick={() => setActiveThreadId(null)}>
              <iconify-icon icon="solar:alt-arrow-left-linear" width="14" height="14" /> {locale === 'es' ? 'Lista' : 'List'}
            </button>
            <div className="text-[11px] text-zinc-400">{activeThread.name}</div>
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-auto rounded-2xl border border-white/10 bg-[#0d1117]/80 p-3">
            {activeThread.messages.map((message) => {
              const mine = message.from === 'me'
              return (
                <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${mine ? 'bg-[#1d4ed8] text-white' : 'bg-zinc-800 text-zinc-100'}`}>
                    <p>{locale === 'es' ? message.textEs : message.textEn}</p>
                    <div className={`mt-1 text-[10px] ${mine ? 'text-blue-100/75' : 'text-zinc-400'}`}>{message.time}</div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-[11px] text-zinc-400">
            {locale === 'es' ? 'Mensaje (decorativo en V1)' : 'Message (decorative in V1)'}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map((thread) => (
            <button
              key={thread.id}
              type="button"
              className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-[#0f141b]/70 p-3 text-left hover:bg-[#141b24]"
              onClick={() => setActiveThreadId(thread.id)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white">
                <iconify-icon icon="solar:user-circle-bold-duotone" width="20" height="20" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-semibold text-white">{thread.name}</span>
                  {thread.unread ? <span className="h-2 w-2 rounded-full bg-sky-400" /> : null}
                </div>
                <p className="mt-1 truncate text-[11px] text-zinc-400">{locale === 'es' ? thread.previewEs : thread.previewEn}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </AppScaffold>
  )
}
