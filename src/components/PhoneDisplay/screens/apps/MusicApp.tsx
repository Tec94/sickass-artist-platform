import { useMemo } from 'react'
import AppScaffold from './AppScaffold'
import { usePhoneOverlay } from '../../PhoneOverlayProvider'

const formatStreams = (value: number | null) => {
  if (typeof value !== 'number') return '--'
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return String(value)
}

export default function MusicApp() {
  const { content, locale, setSheet } = usePhoneOverlay()
  const headerTitle = locale === 'es' ? `Descubre ${content.artistName}` : `Discover ${content.artistName}`
  const subtitle =
    content.music.monthlyListeners && locale === 'es'
      ? `${formatStreams(content.music.monthlyListeners)} oyentes mensuales`
      : content.music.monthlyListeners
        ? `${formatStreams(content.music.monthlyListeners)} monthly listeners`
        : locale === 'es'
          ? 'Playlist y discografia'
          : 'Playlist and discography'

  const topRelease = useMemo(
    () => content.music.discography.find((item) => item.type.toLowerCase() === 'album') || content.music.discography[0],
    [content.music.discography],
  )

  return (
    <AppScaffold
      title={headerTitle}
      subtitle={subtitle}
      className="bg-gradient-to-b from-[#6d1026] via-[#2a0812] to-[#090b10]"
      toolbar={
        <button
          type="button"
          className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white"
          onClick={() =>
            setSheet({
              id: 'music-header-sheet',
              title: locale === 'es' ? 'Abrir artista en Spotify' : 'Open artist on Spotify',
              actions: [
                { id: 'artist', label: 'Spotify', tone: 'accent', href: 'https://open.spotify.com/artist/4cYbf45YbZptNISnhay0xH' },
                { id: 'close', label: locale === 'es' ? 'Cerrar' : 'Close' },
              ],
            })
          }
        >
          Spotify
        </button>
      }
    >
      <div className="space-y-4 pb-4">
        <section className="rounded-2xl border border-white/10 bg-black/20 p-3 backdrop-blur">
          <div className="flex gap-3">
            <div className="h-16 w-16 overflow-hidden rounded-xl border border-white/10 bg-black/40">
              <img src={content.profileImage || '/images/roa profile.jpg'} alt={content.artistName} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-rose-200/70">{locale === 'es' ? 'En foco' : 'Featured'}</p>
              <h3 className="truncate text-sm font-semibold text-white">{topRelease?.name || content.artistName}</h3>
              <p className="mt-1 text-[11px] text-zinc-300">{locale === 'es' ? 'Selecciona una pista o release' : 'Choose a track or release'}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/20 p-3 backdrop-blur">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
            {locale === 'es' ? 'Populares' : 'Top Tracks'}
          </h3>
          <div className="space-y-2">
            {content.music.popularTracks.map((track, index) => (
              <button
                key={track.id}
                type="button"
                className="flex w-full items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-2 py-2 text-left hover:bg-white/10"
                onClick={() =>
                  setSheet({
                    id: `track-${track.id}`,
                    title: track.name,
                    subtitle: `Streams ${formatStreams(track.streams)}`,
                    actions: [
                      { id: 'open', label: locale === 'es' ? 'Abrir en Spotify' : 'Open in Spotify', tone: 'accent', href: track.url },
                      {
                        id: 'copy',
                        label: locale === 'es' ? 'Copiar enlace' : 'Copy link',
                        onSelect: () => navigator.clipboard?.writeText(track.url).catch(() => undefined),
                      },
                      { id: 'close', label: locale === 'es' ? 'Cerrar' : 'Close' },
                    ],
                  })
                }
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-950/60 text-[10px] text-rose-200">{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-white">{track.name}</span>
                  <span className="block text-[10px] text-zinc-400">{formatStreams(track.streams)}</span>
                </span>
                <iconify-icon icon="solar:play-circle-bold-duotone" width="18" height="18" class="text-rose-200/90" />
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/20 p-3 backdrop-blur">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
            {locale === 'es' ? 'Discografia' : 'Discography'}
          </h3>
          <div className="space-y-1">
            {content.music.discography.slice(0, 14).map((release) => (
              <button
                key={release.id}
                type="button"
                className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-white/5"
                onClick={() =>
                  setSheet({
                    id: `release-${release.id}`,
                    title: release.name,
                    subtitle: `${release.type}${release.year ? ` - ${release.year}` : ''}`,
                    actions: [
                      { id: 'open', label: locale === 'es' ? 'Abrir release' : 'Open release', tone: 'accent', href: release.url },
                      { id: 'close', label: locale === 'es' ? 'Cerrar' : 'Close' },
                    ],
                  })
                }
              >
                <span className="min-w-0 pr-2">
                  <span className="block truncate text-xs text-zinc-100">{release.name}</span>
                  <span className="block text-[10px] text-zinc-400">{release.type}{release.year ? ` • ${release.year}` : ''}</span>
                </span>
                <iconify-icon icon="solar:alt-arrow-right-linear" width="16" height="16" class="text-zinc-500" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </AppScaffold>
  )
}

