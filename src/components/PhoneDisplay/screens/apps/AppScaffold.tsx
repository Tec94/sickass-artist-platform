import type { ReactNode } from 'react'

type AppScaffoldProps = {
  title: string
  subtitle?: string
  toolbar?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export default function AppScaffold({ title, subtitle, toolbar, children, footer, className }: AppScaffoldProps) {
  return (
    <div className={`relative h-full w-full ${className || ''}`}>
      <div className="absolute inset-0 flex flex-col pt-20 pb-12">
        <div className="px-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-white">{title}</h2>
                {subtitle ? <p className="mt-0.5 truncate text-[11px] text-zinc-400">{subtitle}</p> : null}
              </div>
              {toolbar ? <div className="shrink-0">{toolbar}</div> : null}
            </div>
          </div>
        </div>
        <div className="mt-3 min-h-0 flex-1 overflow-auto px-4 pb-3">{children}</div>
        {footer ? <div className="px-4 pb-1">{footer}</div> : null}
      </div>
    </div>
  )
}

