import type { PhoneAppId } from './phoneTypes'

export type PhoneIconSpec = { kind: 'solar'; icon: string } | { kind: 'asset'; src: string }

type PhoneIconRegistryProps = {
  icon: PhoneIconSpec
  label?: string
  className?: string
  size?: number
}

export function PhoneIconRegistry({ icon, label, className, size = 22 }: PhoneIconRegistryProps) {
  if (icon.kind === 'asset') {
    return <img src={icon.src} alt={label || ''} width={size} height={size} className={className} />
  }

  return (
    <iconify-icon
      icon={icon.icon}
      width={size}
      height={size}
      class={className}
      aria-label={label}
      role={label ? 'img' : undefined}
    />
  )
}

export const defaultPhoneAppIcons: Record<PhoneAppId, PhoneIconSpec> = {
  music: { kind: 'asset', src: '/phone-icons/spotify-icon.svg' },
  gallery: { kind: 'asset', src: '/phone-icons/photos-icon.svg' },
  notes: { kind: 'asset', src: '/phone-icons/notes-icon.svg' },
  messages: { kind: 'asset', src: '/phone-icons/message-icon.svg' },
  calendar: { kind: 'asset', src: '/phone-icons/calendar-icon.svg' },
  maps: { kind: 'asset', src: '/phone-icons/maps-icon.svg' },
  phone: { kind: 'asset', src: '/phone-icons/phone-icon.svg' },
  cards: { kind: 'asset', src: '/phone-icons/wallet-icon.svg' },
  calculator: { kind: 'asset', src: '/phone-icons/calculator-icon.svg' },
  clock: { kind: 'asset', src: '/phone-icons/clock-icon.svg' },
  camera: { kind: 'asset', src: '/phone-icons/camera-icon.svg' },
  voiceTranslate: { kind: 'asset', src: '/phone-icons/google-translate-icon.svg' },
  brandedIntro: { kind: 'solar', icon: 'solar:star-bold-duotone' },
  voiceMemos: { kind: 'asset', src: '/phone-icons/voice-memos-icon.svg' },
  instagram: { kind: 'asset', src: '/phone-icons/instagram-icon.svg' },
}

