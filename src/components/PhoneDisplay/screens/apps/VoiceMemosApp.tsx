import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePhoneOverlay } from '../../PhoneOverlayProvider'

const MOCK_MEMOS = [
  { id: 'vm1', title: 'New Track Idea', date: 'Yesterday', duration: '0:45', file: '/data/demo-voice-1.mp3' },
  { id: 'vm2', title: 'Chorus Melody - Acoustic', date: 'Tuesday', duration: '1:12', file: '/data/demo-voice-2.mp3' },
  { id: 'vm3', title: 'Beat rough cut', date: 'Sunday', duration: '2:30', file: '' },
  { id: 'vm4', title: 'Intro vocals', date: 'Last week', duration: '0:15', file: '' },
]

export default function VoiceMemosApp() {
  const { locale, popRoute } = usePhoneOverlay()
  const [activeMemo, setActiveMemo] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  // Simulation: Progress bar increments if playing
  useEffect(() => {
    let interval: number
    if (isPlaying) {
      interval = window.setInterval(() => {
        setProgress(p => (p >= 100 ? 0 : p + 2))
      }, 500)
    }
    return () => window.clearInterval(interval)
  }, [isPlaying])

  // Reset when changing memo
  useEffect(() => {
    setIsPlaying(false)
    setProgress(0)
  }, [activeMemo])

  return (
    <div className="flex h-full flex-col bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-2">
         <button className="text-blue-500 font-medium text-lg flex items-center -ml-1">
            <iconify-icon icon="solar:alt-arrow-left-linear" width="22" />
         </button>
         <button className="text-blue-500 font-medium text-base">Edit</button>
      </div>
      
      <div className="px-4 pb-2 border-b border-white/10">
        <h1 className="text-3xl font-bold tracking-tight">All Recordings</h1>
        
        <div className="mt-3 relative">
          <iconify-icon icon="solar:magnifier-linear" width="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full bg-[#1c1c1e] rounded-xl py-1.5 pl-9 pr-4 text-sm outline-none placeholder:text-zinc-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full">
        {MOCK_MEMOS.map((memo, index) => {
          const isActive = activeMemo === memo.id
          
          return (
            <div key={memo.id} className="w-full relative px-4 ml-0">
               {/* Note: In real iOS UI, this dividing line sits below each item, inset from the left */}
               <div className="flex flex-col py-3 border-b border-white/10 min-h-[64px] cursor-pointer" onClick={() => setActiveMemo(isActive ? null : memo.id)}>
                 <div className="flex justify-between items-center w-full">
                   <span className={`text-base font-semibold ${isActive ? '' : 'text-white'}`}>{memo.title}</span>
                   <span className="text-sm text-zinc-500">{memo.date}</span>
                 </div>
                 
                 <AnimatePresence initial={false}>
                   {isActive ? (
                     <motion.div 
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: 'auto', opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       className="overflow-hidden flex flex-col pt-3 pb-1"
                       onClick={(e) => e.stopPropagation()}
                     >
                       {/* Mock Waveform Track */}
                       <div className="w-full h-12 flex items-center gap-0.5 opacity-60">
                         {Array.from({ length: 40 }).map((_, i) => (
                           <div 
                             key={i} 
                             className="w-1 bg-red-500 rounded-full" 
                             style={{ 
                               height: `${Math.max(10, Math.random() * 100)}%`,
                               opacity: (i / 40) * 100 < progress ? 1 : 0.3
                             }} 
                           />
                         ))}
                       </div>
                       
                       <div className="flex justify-between items-center mt-2 text-xs text-zinc-400 font-medium">
                         <span>0:00</span>
                         <span>-{memo.duration}</span>
                       </div>

                       {/* Playback Controls */}
                       <div className="flex items-center justify-center gap-6 mt-4 mb-2">
                         <button className="text-white hover:opacity-70 active:scale-95 transition-all">
                           <iconify-icon icon="solar:rewind-15-seconds-back-linear" width="24" />
                         </button>
                         <button 
                           className="flex h-12 w-12 items-center justify-center text-black bg-white rounded-full active:bg-zinc-300 transition-colors"
                           onClick={() => setIsPlaying(!isPlaying)}
                         >
                           {isPlaying ? (
                             <iconify-icon icon="solar:pause-bold" width="24" />
                           ) : (
                             <iconify-icon icon="solar:play-bold" width="24" class="ml-1" />
                           )}
                         </button>
                         <button className="text-white hover:opacity-70 active:scale-95 transition-all">
                           <iconify-icon icon="solar:forward-15-seconds-linear" width="24" />
                         </button>
                       </div>
                     </motion.div>
                   ) : (
                     <span className="text-sm text-zinc-500 mt-0.5">{memo.duration}</span>
                   )}
                 </AnimatePresence>
               </div>
            </div>
          )
        })}
      </div>

      {/* Record button footer */}
      <div className="h-28 flex items-center justify-center border-t border-white/10 bg-[#1c1c1e]/80 backdrop-blur pb-6">
        <div className="h-[68px] w-[68px] rounded-full border-[3px] border-white/20 p-1 flex items-center justify-center">
           <div className="bg-red-500 h-full w-full rounded-full active:scale-90 transition-transform cursor-pointer" />
        </div>
      </div>
    </div>
  )
}
