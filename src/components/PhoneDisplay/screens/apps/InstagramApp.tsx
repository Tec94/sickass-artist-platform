import { useMemo } from 'react'
import { usePhoneOverlay } from '../../PhoneOverlayProvider'

export default function InstagramApp() {
  const { content, setSheet } = usePhoneOverlay()
  
  const images = useMemo(() => {
    return content.photos
      .map((photo) => photo.thumbnailUrl)
      .filter((src): src is string => Boolean(src))
      .slice(0, 9)
  }, [content.photos])

  return (
    <div className="flex h-full flex-col bg-black text-white pb-2">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 pb-2 pt-14">
        <div className="flex items-center gap-1">
          <iconify-icon icon="solar:lock-password-unlocked-bold" width="12" />
          <h1 className="text-base font-bold tracking-tight">roapr__</h1>
          <iconify-icon icon="solar:alt-arrow-down-linear" width="16" />
        </div>
        <div className="flex items-center gap-4">
          <iconify-icon icon="solar:add-square-linear" width="24" />
          <iconify-icon icon="solar:hamburger-menu-linear" width="24" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Profile Info */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border border-white/10 ring-2 ring-black">
              <img src="/images/roa profile.jpg" alt="Profile" className="h-full w-full object-cover" />
              <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-blue-500">
                <iconify-icon icon="solar:add-bold" width="14" />
              </div>
            </div>
            
            <div className="flex flex-1 justify-around ml-4">
              <div className="flex flex-col items-center">
                <span className="text-base font-bold">14</span>
                <span className="text-[11px] text-zinc-300">posts</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-base font-bold">128k</span>
                <span className="text-[11px] text-zinc-300">followers</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-base font-bold">0</span>
                <span className="text-[11px] text-zinc-300">following</span>
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-0.5">
            <h2 className="text-sm font-semibold">ROA</h2>
            <p className="text-sm text-zinc-300">Artist</p>
            <p className="text-sm leading-snug">
              sickass artist platform<br/>
              linktr.ee/roapr__
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            <button className="flex-1 rounded-lg bg-white/10 py-1.5 text-sm font-semibold transition-colors active:bg-white/20">Edit profile</button>
            <button className="flex-1 rounded-lg bg-white/10 py-1.5 text-sm font-semibold transition-colors active:bg-white/20">Share profile</button>
            <button className="flex items-center justify-center rounded-lg bg-white/10 px-3 py-1.5 transition-colors active:bg-white/20">
              <iconify-icon icon="solar:user-plus-bold" width="16" />
            </button>
          </div>
        </div>

        {/* Story Highlights (Mock) */}
        <div className="mt-2 flex gap-4 overflow-x-auto px-4 py-2 no-scrollbar">
          {[1,2,3,4].map(i => (
            <div key={i} className="flex flex-col items-center gap-1 shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-zinc-900">
                <iconify-icon icon="solar:camera-linear" width="24" class="text-zinc-600" />
              </div>
              <span className="text-[10px]">Highlight {i}</span>
            </div>
          ))}
        </div>

        {/* Tab Group */}
        <div className="mt-2 grid grid-cols-2 border-b border-white/15">
          <div className="flex items-center justify-center border-b border-white py-3">
             <iconify-icon icon="solar:gallery-bold" width="22" />
          </div>
          <div className="flex items-center justify-center py-3 text-zinc-500">
             <iconify-icon icon="solar:video-frame-play-horizontal-linear" width="22" />
          </div>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-3 gap-0.5 mt-0.5">
          {images.length > 0 ? images.map((img, i) => (
             <div key={i} className="aspect-square bg-zinc-900 overflow-hidden relative cursor-pointer active:opacity-75 transition-opacity" onClick={() => setSheet({ id: `insta-${i}`, title: 'Post', subtitle: 'ROA', actions: [{ id: 'close', label: 'Close' }]})}>
               <img src={img} alt={`Post ${i}`} className="w-full h-full object-cover" />
             </div>
          )) : (
             <div className="col-span-3 py-10 text-center text-sm text-zinc-500">No posts yet</div>
          )}
        </div>
      </div>
      
      {/* Bottom Nav */}
      <div className="flex items-center justify-around border-t border-white/10 bg-black py-3 pb-8">
        <iconify-icon icon="solar:home-smile-linear" width="24" />
        <iconify-icon icon="solar:rounded-magnifier-linear" width="24" />
        <iconify-icon icon="solar:add-square-linear" width="24" />
        <iconify-icon icon="solar:video-frame-play-vertical-linear" width="24" />
        <div className="h-6 w-6 overflow-hidden rounded-full border border-white">
          <img src="/images/roa profile.jpg" alt="Profile" className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  )
}
