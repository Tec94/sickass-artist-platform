import type { ReactNode } from 'react'

type PhoneFrameProps = {
  children: ReactNode
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="phone-frame-shell relative h-full w-full overflow-hidden rounded-[50px] border border-white/15 bg-[#070B10] shadow-[0_26px_80px_rgba(0,0,0,0.6)] ring-1 ring-black/50">
      <div className="absolute inset-[3px] overflow-hidden rounded-[46px] bg-[#080C11]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.14),transparent_55%),radial-gradient(circle_at_75%_80%,rgba(239,68,68,0.12),transparent_50%)]" />
        {children}
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-[50px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]" />
    </div>
  )
}

