import { Heart, Eye, Calendar, User, Tag, Share2, Download } from 'lucide-react'
import type { GalleryContentItem } from '../../types/gallery'

interface LightboxMetadataProps {
  item: GalleryContentItem
}

export const LightboxMetadata = ({ item }: LightboxMetadataProps) => {
  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(timestamp))
  }
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = item.imageUrl
    link.download = item.title || 'image'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.description,
          url: window.location.href,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div className="p-6 space-y-6 text-white">
      <div>
        <h2 className="text-xl font-bold mb-2">{item.title}</h2>
        <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
      </div>

      <div className="flex items-center gap-3 py-4 border-y border-gray-800">
        <img
          src={item.creator.avatar}
          alt={item.creator.displayName}
          className="w-10 h-10 rounded-full object-cover border border-gray-700"
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{item.creator.displayName}</span>
            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
              {item.creator.fanTier}
            </span>
          </div>
          <span className="text-gray-500 text-xs">@{item.creator.username}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Heart className={`w-4 h-4 ${item.isLiked ? 'text-red-500 fill-red-500' : ''}`} />
          <span className="text-sm">{item.likeCount} likes</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Eye className="w-4 h-4" />
          <span className="text-sm">{item.viewCount} views</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{formatDate(item.createdAt)}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <User className="w-4 h-4" />
          <span className="text-sm uppercase tracking-tight">{item.type}</span>
        </div>
      </div>

      {item.tags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Tag className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {item.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs hover:bg-gray-700 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  )
}
