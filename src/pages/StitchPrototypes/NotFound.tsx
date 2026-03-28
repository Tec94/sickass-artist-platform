import { Link, useLocation } from 'react-router-dom'
import { setNextTransition } from '../../components/Effects/PageTransition'
import SharedNavbar from '../../components/Navigation/SharedNavbar'

export default function NotFound() {
  const location = useLocation()

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F4EFE6] text-[#3C2A21] antialiased">
      <SharedNavbar />

      <main className="flex-1 min-h-0">
        <section className="relative h-full overflow-hidden">
          <img
            src="/dashboard/hero-bg-4k.webp"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_22%,rgba(244,239,230,0.14),transparent_28%),linear-gradient(116deg,rgba(21,22,27,0.72),rgba(26,30,38,0.5)_38%,rgba(37,41,49,0.16)_70%,rgba(244,239,230,0.2))]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(244,239,230,0.05),rgba(244,239,230,0.18))]" />

          <div className="relative flex h-full flex-col justify-center p-10">
            <div className="max-w-[760px] border border-[#FAF7F2]/16 bg-[#1C1B1A]/22 p-8 shadow-[0_24px_60px_rgba(14,15,19,0.22)] backdrop-blur-md">
              <p className="inline-flex items-center gap-3 border-b border-[#FAF7F2]/26 pb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#F4D7C6]">
                <span>404</span>
                <span className="h-px w-10 bg-[#F4D7C6]/40" />
                <span>Lost In The Estate</span>
              </p>
              <h1 className="mt-6 max-w-[9ch] font-serif text-[clamp(4.6rem,9vw,7.8rem)] leading-[0.9] text-[#FAF7F2]">
                Oopsss
              </h1>
              <p className="mt-6 max-w-[56ch] text-base leading-8 text-[#FAF7F2]/80">
                The route you requested does not exist, try again schmuck
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/journey"
                  onClick={() => setNextTransition('push')}
                  className="inline-flex items-center justify-center border border-[#FAF7F2] px-7 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#FAF7F2] transition-colors hover:bg-[#FAF7F2] hover:text-[#3C2A21]"
                >
                  Return To Journey
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setNextTransition('push')}
                  className="inline-flex items-center justify-center border border-[#FAF7F2]/35 bg-[#FAF7F2]/10 px-7 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#FAF7F2] transition-colors hover:border-[#FAF7F2] hover:bg-[#FAF7F2]/16"
                >
                  Open Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
