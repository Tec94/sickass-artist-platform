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
          <iconify-icon icon="solar:info-circle-linear" width="20" height="20"></iconify-icon>
        </button>
      </div>
    </div>
  )
}