import { useMemo } from 'react'
import { useQuery } from 'convex/react'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  Circle, 
  Flame, 
  RadioTower, 
  ChevronDown, 
  TrendingUp,
  Landmark,
  History,
  PenTool
} from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import PrototypeSafeImage from '../../components/Media/PrototypeSafeImage'
import SharedNavbar from '../../components/Navigation/SharedNavbar'
import { useArtistContent } from '../../features/artistContent'
import './RankingsV2.css'

const formatCompact = (value: number | null | undefined) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '--'
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

const formatPoints = (value: number | null | undefined) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '--'
  return new Intl.NumberFormat('en-US').format(value)
}

const initialsFromName = (value: string) =>
  value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

const tierLabel = (tier: string) => {
  switch (tier) {
    case 'platinum':
      return 'Apex'
    case 'gold':
      return 'Gold'
    case 'silver':
      return 'Silver'
    default:
      return 'Bronze'
  }
}

const trimCopy = (value: string, maxLength = 132) =>
  value.length > maxLength ? `${value.slice(0, maxLength - 1).trimEnd()}…` : value

export default function Rankings() {
  const { content, isLoading: isArtistLoading } = useArtistContent()
  const leaderboard = useQuery(api.points.getFanLeaderboard, { limit: 12 })

  const entries = leaderboard?.entries ?? []
  const podium = entries.slice(0, 3)
  const remainder = entries.slice(3)
  const currentUserEntry = leaderboard?.currentUserEntry ?? null
  const recentPost = content.instagram.posts[0] ?? null

  const artistSnapshot = useMemo(
    () => [
      {
        label: 'Active Peers',
        value: formatCompact(content.spotify.monthlyListeners),
      },
      {
        label: 'Citations',
        value: content.instagram.followersLabel || '--',
      },
      {
        label: 'Top track',
        value: content.spotify.topTrack?.name || 'Waiting for sync',
      },
      {
        label: 'Latest drop',
        value: content.spotify.latestRelease?.name || 'Pending',
      },
    ],
    [content],
  )

  // Sort podium for display: 2, 1, 3
  const displayPodium = useMemo(() => {
    if (podium.length === 0) return []
    if (podium.length === 1) return [podium[0]]
    if (podium.length === 2) return [podium[1], podium[0]]
    return [podium[1], podium[0], podium[2]]
  }, [podium])

  return (
    <div className="rankings-v2-container flex h-full min-h-0 flex-col overflow-x-hidden">
      <div className="halftone-overlay" />
      <SharedNavbar />

      <main className="max-w-[1920px] mx-auto flex min-h-[calc(100dvh-72px)] w-full">
        {/* Content Area */}
        <div className="flex-1 p-8 md:p-12 border-r border-structural overflow-y-auto custom-scrollbar">
          <header className="mb-12">
            <div className="flex justify-between items-end mb-4">
              <span className="font-mono text-[10px] uppercase tracking-tighter opacity-40">
                Collection: Pack_Rankings_2024
              </span>
              <span className="font-mono text-[10px] uppercase tracking-tighter opacity-40">
                Log No. 882-C
              </span>
            </div>
            <h2 className="text-6xl md:text-8xl editorial-title mb-6 leading-tight text-[#1C1B1A]">
              Pack Rankings
            </h2>
            <div className="h-px w-full bg-[#1C1B1A]/20 mb-6" />
            <p className="max-w-2xl text-sm leading-relaxed opacity-70">
              A comprehensive ledger of the archive's most influential contributors and their sonic artifacts. 
              Updated every lunar cycle to reflect shifting hierarchies within the collective.
            </p>
          </header>

          {/* Spotlight Podium */}
          <section className="grid grid-cols-1 md:grid-cols-3 items-end gap-8 mb-16 relative bg-[#FAF7F2]/50 p-8 border border-black/5">
            {displayPodium.map((entry, idx) => {
              const isFirst = entry?.rank === 1
              
              return (
                <div 
                  key={entry?.userId || `empty-${idx}`}
                  className={`rank-podium flex flex-col items-center ${isFirst ? 'scale-110 z-10' : 'justify-end pb-8'}`}
                >
                  <div className={`relative mb-6 ${isFirst ? 'terracotta-glow p-1.5 bg-white border-2' : 'p-1 bg-white border'} border-black/10`}>
                    {isFirst && <div className="absolute inset-0 bg-[#98A8CA]/10 blur-2xl -z-10" />}
                    
                    {entry?.avatar ? (
                      <img 
                        src={entry.avatar} 
                        alt={entry.displayName} 
                        className={`object-cover grayscale ${isFirst ? 'w-48 h-48' : 'w-32 h-32'}`} 
                      />
                    ) : (
                      <div className={`flex items-center justify-center bg-[#F4F0EB] font-serif text-2xl grayscale ${isFirst ? 'w-48 h-48' : 'w-32 h-32'}`}>
                        {entry ? initialsFromName(entry.displayName) : '--'}
                      </div>
                    )}

                    {isFirst && (
                       <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#C36B42] text-white px-3 py-1 text-[8px] font-bold uppercase tracking-widest whitespace-nowrap">
                        Elite Standing
                      </div>
                    )}
                    
                    <span className={`absolute -bottom-3 ${idx === 0 && !isFirst ? '-left-3' : '-right-3'} w-10 h-10 ${isFirst ? 'bg-[#98A8CA]' : 'bg-black'} text-white flex items-center justify-center font-mono text-xs z-20`}>
                      {entry ? String(entry.rank).padStart(2, '0') : '--'}
                    </span>
                  </div>
                  
                  <div className="text-center">
                    <h3 className={`font-editorial italic ${isFirst ? 'text-3xl' : 'text-2xl'} mb-1`}>
                      {entry?.displayName || 'Awaiting Entry'}
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                      {entry ? tierLabel(entry.fanTier) : 'Unranked'}
                    </p>
                  </div>
                </div>
              )
            })}
          </section>

          {/* Dual Leaderboards */}
          <section className="border-t border-structural pt-12">
            <div className="flex gap-12 mb-10">
              <button className="text-[11px] font-bold uppercase tracking-widest border-b-2 border-[#C36B42] pb-2 text-[#1C1B1A]">
                Member Standings
              </button>
              <button className="text-[11px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity pb-2">
                Song Championship
              </button>
            </div>

            <div className="space-y-px bg-black/5 border border-black/5 overflow-hidden">
              {remainder.map((entry) => (
                <div 
                  key={entry.userId}
                  className="flex items-center justify-between p-6 bg-white/40 border-b border-black/5 last:border-b-0 hover:bg-white/80 transition-colors group"
                >
                  <div className="flex items-center gap-12">
                    <span className="font-mono text-xs opacity-40 w-8">
                      {String(entry.rank).padStart(3, '0')}
                    </span>
                    <div className="flex items-center gap-5">
                      <div className="w-10 h-10 border border-black/10 overflow-hidden bg-white">
                        {entry.avatar ? (
                          <img 
                            src={entry.avatar} 
                            alt={entry.displayName} 
                            className="w-full h-full object-cover grayscale" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold bg-[#F4F0EB]">
                            {initialsFromName(entry.displayName)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#1C1B1A]">{entry.displayName}</h4>
                        <span className="text-[9px] px-1.5 py-0.5 bg-[#C36B42]/10 text-[#C36B42] font-bold uppercase tracking-wider">
                          {tierLabel(entry.fanTier)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-16">
                    <div className="hidden md:flex items-end gap-1 h-8 opacity-40">
                      <div className="w-1 bg-[#C36B42] h-1/2"></div>
                      <div className="w-1 bg-[#C36B42] h-full"></div>
                      <div className="w-1 bg-[#C36B42] h-3/4"></div>
                      <div className="w-1 bg-[#C36B42] h-1/2"></div>
                    </div>
                    <span className="font-mono text-sm font-bold text-[#1C1B1A]">
                      {formatPoints(entry.totalPoints)} 
                      <span className="text-[10px] opacity-40 ml-1 font-normal">PTS</span>
                    </span>
                  </div>
                </div>
              ))}

              {remainder.length === 0 && (
                <div className="p-12 text-center text-sm opacity-40 border border-dashed border-black/10 italic bg-white/20">
                  No further entries logged for this cycle.
                </div>
              )}
            </div>

            <div className="mt-12 flex justify-center">
              <button className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 hover:opacity-100 transition-all group">
                <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
                Load Remaining Archives
              </button>
            </div>
          </section>
        </div>

        {/* Sidebar Pulse */}
        <aside className="w-96 hidden xl:flex flex-col bg-[#FAF7F2]/80 border-l border-structural pt-12">
          <div className="px-8 mb-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-px h-6 bg-[#C36B42]"></div>
              <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#1C1B1A]">
                Sidebar_Pulse
              </h3>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-tighter opacity-40">
              Live_Data_Stream: Active
            </span>
          </div>

          <div className="px-8 pb-12 flex-1 custom-scrollbar overflow-y-auto">
            {/* New Archive Entry (Latest Release) */}
            <div className="bg-[#1C1B1A] text-[#F4F0EB] p-8 mb-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Landmark size={80} strokeWidth={1} />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-widest mb-6 block opacity-70">
                New Archive Entry
              </span>
              
              <div className="aspect-square bg-white/5 mb-6 relative overflow-hidden group">
                {content.spotify.latestRelease?.imageUrl ? (
                  <img 
                    src={content.spotify.latestRelease.imageUrl} 
                    alt="Latest Drop" 
                    className="w-full h-full object-cover opacity-60 grayscale group-hover:scale-105 transition-transform duration-700" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#2A2A28]">
                    <Flame size={48} className="opacity-20" />
                  </div>
                )}
                <div className="absolute inset-0 border border-white/10 m-3"></div>
              </div>
              
              <h4 className="text-3xl font-editorial italic mb-2 leading-tight">
                {content.spotify.latestRelease?.name || 'Echoes of Vellum'}
              </h4>
              <p className="font-mono text-[9px] uppercase tracking-widest opacity-60 mb-8">
                Collection: {content.spotify.latestRelease?.type || 'Sonic_Artifact'}
              </p>
              
              <Link 
                to="/campaign" 
                className="w-full bg-[#F4F0EB] text-[#1C1B1A] py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-center block transition-colors hover:bg-white"
              >
                Access Manuscript
              </Link>
            </div>

            {/* Audience Metrics */}
            <div className="mb-12">
              <h5 className="text-[10px] font-bold uppercase tracking-widest opacity-30 mb-6 pb-2 border-b border-black/5">
                Audience Metrics
              </h5>
              <div className="grid grid-cols-2 gap-px bg-black/5 border border-black/5 overflow-hidden">
                {artistSnapshot.map((item) => (
                  <div key={item.label} className="bg-[#FAF7F2] p-4">
                    <span className="block text-[10px] uppercase tracking-tighter opacity-40 mb-1">
                      {item.label}
                    </span>
                    <span className="block text-xl font-bold tracking-tighter text-[#1C1B1A]">
                      {item.value}
                    </span>
                  </div>
                ))}
                <div className="bg-[#FAF7F2] p-4">
                  <span className="block text-[10px] uppercase tracking-tighter opacity-40 mb-1">
                    Reliability
                  </span>
                  <span className="block text-xl font-bold tracking-tighter text-[#C36B42]">
                    99.1
                  </span>
                </div>
              </div>
            </div>

            {/* Quote Box (Instagram) */}
            {recentPost && (
              <div className="relative pt-8 pb-4 border-t border-black/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 grayscale rounded-sm overflow-hidden border border-black/10">
                    <PrototypeSafeImage 
                      src={recentPost.thumbnailUrl} 
                      kind="social" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span className="font-mono text-[10px] font-bold tracking-tighter opacity-60">
                    @{content.instagram.username || 'archivist'}
                  </span>
                </div>
                <blockquote className="text-xs italic leading-relaxed opacity-70 mb-6 font-serif">
                  "{trimCopy(recentPost.caption || recentPost.description || 'The archive breathes through our interaction.', 180)}"
                </blockquote>
                <div className="flex justify-between items-center opacity-40 font-mono text-[9px]">
                  <span>RECORDED: {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase()}</span>
                  <div className="flex gap-2">
                    <Link to="/ranking-submission" className="hover:text-[#C36B42] transition-colors">
                      <History size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <footer className="p-8 border-t border-structural bg-[#FAF7F2]">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 border border-black flex items-center justify-center font-editorial text-xl italic font-bold">A</div>
                <div>
                    <h5 className="text-[11px] font-bold mb-0.5 text-[#1C1B1A]">The Archive Index</h5>
                    <p className="font-mono text-[8px] uppercase opacity-40 tracking-widest">Protocol Version 01.2024</p>
                </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center font-mono text-[9px] uppercase tracking-widest opacity-40">
                <span>Access Status</span>
                <span className="text-[#C36B42] font-bold">Authenticated</span>
              </div>
              <div className="bg-[#1C1B1A] text-[#F4F0EB] px-3 py-2 text-[10px] font-mono text-center">
                ID: 882-C-MANIFEST-01
              </div>
            </div>
          </footer>
        </aside>
      </main>
    </div>
  )
}
