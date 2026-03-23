import { useEffect, useState } from 'react'

type PrototypeSafeImageKind = 'social' | 'portrait' | 'release'

interface PrototypeSafeImageProps {
  src?: string | null
  alt: string
  className?: string
  kind?: PrototypeSafeImageKind
  title?: string
  description?: string
  loading?: 'eager' | 'lazy'
}

const kindConfig: Record<
  PrototypeSafeImageKind,
  { eyebrow: string; tone: string; title: string; description: string }
> = {
  social: {
    eyebrow: 'Signal frame',
    tone: 'from-[#C36B42]/18 via-[#C36B42]/8 to-[#F4EFE6]',
    title: 'Social image unavailable',
    description: 'The campaign signal is still visible through the synced caption and post metadata.',
  },
  portrait: {
    eyebrow: 'Profile frame',
    tone: 'from-[#3C2A21]/12 via-[#3C2A21]/5 to-[#F4EFE6]',
    title: 'Portrait unavailable',
    description: 'The page keeps the member or artist context visible even when the image cannot load.',
  },
  release: {
    eyebrow: 'Release artwork',
    tone: 'from-[#8E7D72]/18 via-[#8E7D72]/8 to-[#F4EFE6]',
    title: 'Artwork unavailable',
    description: 'The release module stays readable using the synced text payload.',
  },
}

const joinClasses = (...values: Array<string | null | undefined | false>) =>
  values.filter(Boolean).join(' ')

export default function PrototypeSafeImage({
  src,
  alt,
  className,
  kind = 'social',
  title,
  description,
  loading = 'lazy',
}: PrototypeSafeImageProps) {
  const [failed, setFailed] = useState(!src)

  useEffect(() => {
    setFailed(!src)
  }, [src])

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={className}
        onError={() => setFailed(true)}
      />
    )
  }

  const fallback = kindConfig[kind]

  return (
    <div
      role="img"
      aria-label={alt}
      className={joinClasses(
        'flex h-full w-full flex-col justify-end overflow-hidden bg-gradient-to-br p-4 text-[#3C2A21]',
        fallback.tone,
        className,
      )}
    >
      <div className="border border-[#3C2A21]/12 bg-[#FCFBF9]/88 p-4 backdrop-blur-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
          {fallback.eyebrow}
        </p>
        <p className="mt-2 font-['Cormorant_Garamond'] text-2xl leading-none">
          {title || fallback.title}
        </p>
        <p className="mt-3 text-sm leading-6 text-[#3C2A21]/78">
          {description || fallback.description}
        </p>
      </div>
    </div>
  )
}
