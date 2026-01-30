import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SpotifyMetadata {
  artist: string
  album: string
  previewUrl?: string
  url: string
  hasPreview: boolean
  popularity: number
}

interface GalleryItemBase {
  _id: string
  id: string
  thumbnail: string
  title: string
  createdAt: number
}

type SpotifyGalleryItem = GalleryItemBase & {
  type: 'spotify'
  metadata: SpotifyMetadata
}

type GalleryItem = SpotifyGalleryItem

export const SocialGallery = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)

  const galleryItems = useQuery(api.socialGallery.getSocialGalleryItems, {
    source: 'spotify',
    limit: 50,
  })

  const searchResults = useQuery(
    api.socialGallery.searchSocialGallery,
    searchQuery ? { query: searchQuery, limit: 50 } : 'skip'
  )

  const items = searchQuery ? searchResults : galleryItems?.items

  // Spotify Embed URL (General Profile)
  const SPOTIFY_EMBED_URL = "https://open.spotify.com/embed/artist/4cYbf45YbZptNISnhay0xH?utm_source=generator&theme=0"

  if (!items) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
         <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full border-2 border-red-600 border-t-transparent animate-spin"></div>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Loading Territory...</p>
         </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
      {/* Spotify Featured Section */}
      <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm p-1">
        <iframe 
          style={{ borderRadius: '12px' }} 
          src={SPOTIFY_EMBED_URL} 
          width="100%" 
          height="352" 
          frameBorder="0" 
          allowFullScreen 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy"
          className="bg-zinc-950"
        ></iframe>
      </div>

      {/* Controls */}
      <div className="w-full flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <iconify-icon icon="solar:magnifer-linear" class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-lg"></iconify-icon>
          <input
            type="text"
            placeholder="SEARCH THE GALLERIES..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 text-white border border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition font-medium text-sm placeholder:text-zinc-600 uppercase tracking-wide"
          />
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white">
          <iconify-icon icon="mdi:spotify" width="16"></iconify-icon>
          Spotify albums
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-24 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
            <iconify-icon icon="solar:sad-square-linear" width="48" class="mb-4 opacity-50"></iconify-icon>
            <p className="uppercase tracking-widest font-bold">No items found</p>
          </div>
        ) : (
          items.map((item: GalleryItem) => (
            <GalleryItemCard
              key={item._id}
              item={item}
              onSelect={setSelectedItem}
            />
          ))
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <GalleryLightbox
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

interface GalleryItemCardProps {
  item: GalleryItem
  onSelect: (item: GalleryItem) => void
}

const GalleryItemCard = ({ item, onSelect }: GalleryItemCardProps) => {
  return (
    <motion.div
      onClick={() => onSelect(item)}
      className="relative group cursor-pointer overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-600/50 transition-all duration-300 shadow-lg hover:shadow-red-900/10"
      whileHover={{ y: -5 }}
      layout
    >
      {/* Aspect Ratio Container */}
      <div className="aspect-[4/5] overflow-hidden relative">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = 'https://placehold.co/600x600/18181b/3f3f46?text=No+Signal'
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Type Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md border border-white/10 bg-[#1DB954]">
            <iconify-icon icon="mdi:spotify" width="12"></iconify-icon>
            spotify
          </span>
        </div>

        {/* Hover Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 mb-2 drop-shadow-lg">{item.title}</h3>
          
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
            <span className="text-[#1DB954]">●</span>
            <span>{item.metadata.artist}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface GalleryLightboxProps {
  item: GalleryItem
  onClose: () => void
}

const GalleryLightbox = ({ item, onClose }: GalleryLightboxProps) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-black border border-zinc-800 w-full max-w-5xl h-[85vh] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
           onClick={onClose}
           className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition border border-white/10"
        >
          <iconify-icon icon="solar:close-circle-bold" width="24"></iconify-icon>
        </button>

        {/* Content Split */}
        <SpotifyLightboxContent item={item} />
      </motion.div>
    </motion.div>
  )
}

const SpotifyLightboxContent = ({ item }: { item: SpotifyGalleryItem }) => {
   const [copied, setCopied] = useState(false)
   // Convert Spotify Album URL to Embed URL
   // Example: https://open.spotify.com/album/7F1YcZQm1HvLwPFNEpdRpR -> https://open.spotify.com/embed/album/7F1YcZQm1HvLwPFNEpdRpR
   const embedUrl = item.metadata.url.replace('/album/', '/embed/album/') + '?utm_source=generator&theme=0'

   const handleShare = () => {
      navigator.clipboard.writeText(item.metadata.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
   }

   return (
      <div className="w-full h-full bg-black flex flex-col md:flex-row relative overflow-hidden">
         {/* Background Blur Art */}
         <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
            <img src={item.thumbnail} className="w-full h-full object-cover blur-[120px] scale-150" alt="" />
         </div>

          {/* Left Side: Large Album Art (Desktop) */}
          <div className="hidden md:flex w-2/5 flex-col items-center justify-start p-8 z-10 gap-6 pt-12">
             <motion.div 
                className="relative aspect-square w-full max-w-md rounded-2xl shadow-2xl shadow-black/80 overflow-hidden border border-white/10"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
             >
                <img src={item.thumbnail} className="w-full h-full object-cover" alt={item.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                   <h2 className="text-3xl font-black text-white leading-none uppercase tracking-tighter mb-2">{item.title}</h2>
                   <p className="text-lg text-zinc-300 font-bold">{item.metadata.artist}</p>
                </div>
             </motion.div>

             {/* Metadata on Left (Desktop) - Vertical List */}
             <div className="w-full max-w-md bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm space-y-5">
                {/* Released */}
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3 text-zinc-500">
                      <iconify-icon icon="solar:calendar-date-linear" width="16"></iconify-icon>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Released</span>
                   </div>
                   <span className="text-sm font-bold text-white">
                      {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                   </span>
                </div>

                {/* Streams */}
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3 text-zinc-500">
                      <iconify-icon icon="solar:play-circle-linear" width="16"></iconify-icon>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Total Streams</span>
                   </div>
                   <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-black text-white">{(item.metadata.popularity * 12450).toLocaleString()}</span>
                      <span className="text-[9px] font-bold text-zinc-600 uppercase">Plays</span>
                   </div>
                </div>

                {/* Popularity */}
                <div className="flex items-center justify-between gap-8">
                   <div className="flex items-center gap-3 text-zinc-500">
                      <iconify-icon icon="solar:chart-square-linear" width="16"></iconify-icon>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Popularity</span>
                   </div>
                   <div className="flex-1 flex items-center gap-3 justify-end">
                      <div className="w-24 h-1 bg-zinc-800 rounded-full overflow-hidden">
                         <div 
                            className="h-full bg-red-600 rounded-full" 
                            style={{ width: `${item.metadata.popularity}%` }}
                         ></div>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-400">{item.metadata.popularity}%</span>
                   </div>
                </div>

                {/* Rank */}
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3 text-zinc-500">
                      <iconify-icon icon="solar:fire-linear" width="16"></iconify-icon>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Connect Rank</span>
                   </div>
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-lg">
                      <span className="relative flex h-1.5 w-1.5">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
                      </span>
                      <span className="text-[9px] font-black text-white uppercase tracking-widest">Trending</span>
                   </div>
                </div>
             </div>
          </div>

         {/* Right Side / Mobile Main: Spotify Embed */}
         <div className="flex-1 flex flex-col z-10 h-full">
            {/* Header for Mobile */}
            <div className="md:hidden p-6 pb-0">
                <h2 className="text-2xl font-black text-white leading-none uppercase tracking-tighter mb-1">{item.title}</h2>
                <p className="text-sm text-zinc-400 font-bold">{item.metadata.artist}</p>
            </div>

            <div className="flex-1 p-4 md:p-8 flex flex-col">
               <motion.div 
                  className="flex-1 bg-zinc-950/80 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl flex flex-col"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
               >
                  {/* Custom Embed Layout */}
                  <div className="flex-1 w-full h-full relative group">
                     <iframe
                        title={`Spotify: ${item.title}`}
                        src={embedUrl}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="w-full h-full"
                     ></iframe>
                     
                     {/* Custom Overlay for extra polish if needed, but Spotify iframe is pretty clean */}
                  </div>
               </motion.div>

               {/* Footer Actions */}
                <motion.div 
                   className="mt-6 flex items-center justify-between gap-4"
                   initial={{ y: 10, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: 0.4 }}
                >
                   <div className="flex gap-4">
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Source</span>
                         <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1DB954]/10 border border-[#1DB954]/20 rounded-full">
                            <iconify-icon icon="mdi:spotify" class="text-[#1DB954] text-sm"></iconify-icon>
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Spotify Official</span>
                         </div>
                      </div>
                   </div>

                  <div className="flex gap-3">
                     <button 
                        onClick={handleShare}
                        className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-all active:scale-90 relative ${
                           copied 
                           ? 'bg-[#1DB954]/20 border-[#1DB954] text-[#1DB954]' 
                           : 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-700'
                        }`}
                        title="Copy content link"
                     >
                        {copied ? (
                           <iconify-icon icon="solar:check-read-linear" width="20" height="20"></iconify-icon>
                        ) : (
                           <iconify-icon icon="solar:share-linear" width="20" height="20"></iconify-icon>
                        )}
                        
                        {/* Floating "Copied" text */}
                        {copied && (
                           <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: -40 }}
                              className="absolute left-1/2 -translate-x-1/2 bg-[#1DB954] text-black text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest whitespace-nowrap pointer-events-none"
                           >
                              Link Copied
                           </motion.div>
                        )}
                     </button>
                     <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all active:scale-90">
                        <iconify-icon icon="solar:heart-linear" width="20" height="20"></iconify-icon>
                     </button>
                  </div>
               </motion.div>
            </div>
         </div>
      </div>
   )
}
