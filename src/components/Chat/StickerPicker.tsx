import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { ChatSticker, ChatStickerPack } from '../../types/chat'

const RECENTS_KEY = 'chat_recent_stickers'
const MAX_RECENTS = 24

interface StickerPickerProps {
  packs: ChatStickerPack[]
  onSelect: (sticker: ChatSticker) => void
  onClose: () => void
  currentUserId?: string
  onUploadSticker?: (file: File) => Promise<void>
  isUploading?: boolean
}

function loadRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENTS) : []
  } catch {
    return []
  }
}

function saveRecents(recents: string[]) {
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(recents.slice(0, MAX_RECENTS)))
  } catch {
    // Ignore storage failures; recents are a best-effort enhancement.
  }
}

export function StickerPicker({
  packs,
  onSelect,
  onClose,
  currentUserId,
  onUploadSticker,
  isUploading = false,
}: StickerPickerProps) {
  const [activeTab, setActiveTab] = useState<string>('recent')
  const [search, setSearch] = useState('')
  const [recents, setRecents] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setRecents(loadRecents())
  }, [])

  const stickerMap = useMemo(() => {
    const map = new Map<string, ChatSticker>()
    for (const pack of packs) {
      for (const sticker of pack.stickers) {
        map.set(String(sticker._id), sticker)
      }
    }
    return map
  }, [packs])

  const recentStickers = useMemo(
    () => recents.map((id) => stickerMap.get(id)).filter((sticker): sticker is ChatSticker => !!sticker),
    [recents, stickerMap]
  )

  const allStickers = useMemo(() => Array.from(stickerMap.values()), [stickerMap])
  const searchTerm = search.trim().toLowerCase()
  const userPack = useMemo(
    () => packs.find((pack) => currentUserId && String(pack.createdBy) === String(currentUserId)) ?? null,
    [packs, currentUserId]
  )

  const visibleStickers = useMemo(() => {
    const base =
      activeTab === 'recent'
        ? recentStickers
        : activeTab === 'my'
          ? userPack?.stickers ?? []
          : packs.find((pack) => String(pack._id) === activeTab)?.stickers ?? allStickers

    if (!searchTerm) return base
    return base.filter(
      (sticker) =>
        sticker.name.toLowerCase().includes(searchTerm) ||
        sticker.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
    )
  }, [activeTab, recentStickers, packs, allStickers, searchTerm])

  const handleSelect = (sticker: ChatSticker) => {
    const stickerId = String(sticker._id)
    const nextRecents = [stickerId, ...recents.filter((id) => id !== stickerId)].slice(0, MAX_RECENTS)
    setRecents(nextRecents)
    saveRecents(nextRecents)
    onSelect(sticker)
    onClose()
  }

  const tabs = useMemo(() => {
    const packTabs = packs
      .filter((pack) => !userPack || String(pack._id) !== String(userPack._id))
      .map((pack) => ({ id: String(pack._id), label: pack.name }))
    const userTab = currentUserId ? [{ id: 'my', label: 'My Stickers' }] : []
    return [{ id: 'recent', label: 'Recent' }, ...userTab, ...packTabs]
  }, [packs, currentUserId, userPack])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.98 }}
      transition={{ duration: 0.16 }}
      className="w-[320px] max-w-[90vw] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
    >
      <div className="p-3 border-b border-zinc-800 flex items-center gap-2">
        <div className="flex-1 relative">
          <iconify-icon
            icon="solar:magnifer-linear"
            width="16"
            height="16"
            class="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500"
          ></iconify-icon>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search stickers"
            className="w-full pl-8 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-600"
          />
        </div>
        {onUploadSticker && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-zinc-400 hover:text-white transition disabled:opacity-50"
            title="Upload sticker"
            disabled={isUploading}
          >
            <iconify-icon
              icon={isUploading ? 'solar:spinner-linear' : 'solar:add-circle-bold'}
              width="20"
              height="20"
              className={isUploading ? 'animate-spin' : undefined}
            ></iconify-icon>
          </button>
        )}
        <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition">
          <iconify-icon icon="solar:close-circle-linear" width="20" height="20"></iconify-icon>
        </button>
      </div>

      {onUploadSticker && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) {
              void onUploadSticker(file)
            }
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
          }}
        />
      )}

      <div className="px-2 pt-2">
        {isUploading && (
          <div className="mb-2 flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <iconify-icon icon="solar:spinner-linear" width="14" height="14" className="animate-spin"></iconify-icon>
            Uploading sticker...
          </div>
        )}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 max-h-80 overflow-y-auto">
        {visibleStickers.length === 0 ? (
          <div className="text-center text-zinc-500 text-sm py-10">
            {activeTab === 'my' ? 'Upload your first sticker' : 'No stickers found'}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {visibleStickers.map((sticker) => (
              <button
                key={sticker._id}
                onClick={() => handleSelect(sticker)}
                className="aspect-square bg-zinc-800 border border-zinc-700 rounded-lg p-2 hover:border-red-600/60 hover:bg-zinc-800 transition flex items-center justify-center"
                title={sticker.name}
              >
                <img src={sticker.imageUrl} alt={sticker.name} className="w-full h-full object-contain" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
