interface ChannelHeaderProps {
  name: string
  description: string
}

export function ChannelHeader({ name, description }: ChannelHeaderProps) {
  return (
    <div className="p-4 border-b border-[#1a1a1a] bg-[#111]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-lg"># {name}</h2>
          {description && (
            <p className="text-[#808080] text-sm mt-1">{description}</p>
          )}
        </div>

        {/* Info icon - could show channel details in future */}
        <button className="text-[#808080] hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>
  )
}