import { useState } from 'react'
import AppScaffold from './AppScaffold'
import { usePhoneOverlay } from '../../PhoneOverlayProvider'

export default function NotesApp() {
  const { content, locale } = usePhoneOverlay()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedNote = content.notesSeed.find((note) => note.id === selectedId) || null

  return (
    <AppScaffold title={locale === 'es' ? 'Notas' : 'Notes'} subtitle={selectedNote ? selectedNote.updatedAtLabel : `${content.notesSeed.length} notes`}>
      {selectedNote ? (
        <div className="space-y-3">
          <button type="button" className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white" onClick={() => setSelectedId(null)}>
            <iconify-icon icon="solar:alt-arrow-left-linear" width="14" height="14" />
            {locale === 'es' ? 'Volver' : 'Back'}
          </button>
          <div className="rounded-2xl border border-[#6b5c1a]/40 bg-[#1a170d]/60 p-3">
            <h3 className="text-sm font-semibold text-[#ffe082]">{selectedNote.title}</h3>
            <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-zinc-100">
              {locale === 'es' ? selectedNote.bodyEs : selectedNote.bodyEn}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {content.notesSeed.map((note) => (
            <button
              key={note.id}
              type="button"
              className="w-full rounded-2xl border border-white/10 bg-[#11151c]/70 p-3 text-left hover:bg-[#151c25]"
              onClick={() => setSelectedId(note.id)}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="min-w-0 truncate text-xs font-semibold text-[#ffe082]">{note.title}</h3>
                <span className="shrink-0 text-[10px] text-zinc-500">{note.updatedAtLabel}</span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-300">
                {(locale === 'es' ? note.bodyEs : note.bodyEn).slice(0, 120)}
              </p>
            </button>
          ))}
        </div>
      )}
    </AppScaffold>
  )
}

