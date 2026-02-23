import { Link } from 'react-router-dom'
import { motion, useMotionTemplate, useTransform, type MotionValue } from 'framer-motion'
import type { HeroTimeline } from './heroTimeline'
import type { DashboardVisualVariant } from './dashboardVisualVariants'

export type HeroNarrativeCopy = {
  reducedEyebrow: string
  reducedTitle: string
  reducedBody: string
  signalStatusFallback: string
  beat1Title: string
  beat1Body: string
  beat2Label: string
  beat2Title: string
  beat2Body: string
  beat3Label: string
  beat3Title: string
  beat3Body: string
  beat4Title: string
  beat4Body: string
  handoffCue: string
  ctaSignedIn: string
  ctaSignedOut: string
}

type HeroCopyBeatsProps = {
  progress: MotionValue<number>
  reducedMotion: boolean
  crest: string
  copy: HeroNarrativeCopy
  ctaLabel: string
  ctaHref: string
  timeline: HeroTimeline
  onPrimaryCta?: () => void
  visualVariant?: DashboardVisualVariant
}

const OVERLAP_FADE_FACTOR = 1.15

export const applyBeatOverlapFade = (
  beat3OpacityRaw: number,
  beat4Opacity: number,
  overlapFadeFactor = OVERLAP_FADE_FACTOR,
): number => {
  const suppression = Math.min(Math.max(beat4Opacity * overlapFadeFactor, 0), 1)
  return Math.max(0, beat3OpacityRaw * (1 - suppression))
}

export const HeroCopyBeats = ({
  progress,
  reducedMotion,
  crest,
  copy,
  ctaLabel,
  ctaHref,
  timeline,
  onPrimaryCta,
  visualVariant,
}: HeroCopyBeatsProps) => {
  const beat2Opacity = useTransform(progress, timeline.beat2Opacity, [0, 1, 1, 0])
  const beat2X = useTransform(progress, timeline.beat2X, [-40, 0])
  const beat2Scale = useTransform(progress, timeline.beat2Opacity, [0.985, 1, 1, 0.992])
  const beat2Blur = useTransform(progress, timeline.beat2Opacity, [2.6, 0, 0, 2.1])
  const beat2Filter = useMotionTemplate`blur(${beat2Blur}px)`

  const beat3OpacityRaw = useTransform(progress, timeline.beat3Opacity, [0, 1, 1, 0])
  const beat4Opacity = useTransform(progress, timeline.beat4Opacity, [0, 1, 1])
  const beat3Opacity = useTransform([beat3OpacityRaw, beat4Opacity], ([beat3Raw, beat4]) =>
    applyBeatOverlapFade(beat3Raw as number, beat4 as number),
  )
  const beat3X = useTransform(progress, timeline.beat3X, [40, 0])
  const beat3Scale = useTransform(progress, timeline.beat3Opacity, [0.985, 1, 1, 0.992])
  const beat3Blur = useTransform(progress, timeline.beat3Opacity, [2.6, 0, 0, 2.1])
  const beat3Filter = useMotionTemplate`blur(${beat3Blur}px)`

  const beat4Scale = useTransform(progress, timeline.beat4Scale, [0.96, 1])
  const handoffOpacity = useTransform(progress, timeline.handoffOpacity, [0, 1])

  if (reducedMotion) {
    return (
      <div
        className="dashboard-hero-copy dashboard-hero-copy--reduced pointer-events-none absolute inset-0 z-[60] flex items-center justify-center px-6 text-center"
        data-dashboard-variant={visualVariant || 'forum-ops'}
      >
        <div className="max-w-3xl space-y-6">
          <p className="text-[11px] uppercase tracking-[0.35em] text-[#9aa7b5]">{copy.reducedEyebrow}</p>
          <h1 className="font-display text-4xl md:text-7xl text-[#e8e1d5] uppercase tracking-[0.08em]">{copy.reducedTitle}</h1>
          <p className="text-base md:text-lg text-[#9aa7b5]">{copy.reducedBody}</p>
          <div className="pointer-events-auto flex justify-center">
            <Link
              to={ctaHref}
              onClick={onPrimaryCta}
              className="dashboard-hero-primary-cta inline-flex items-center gap-3 rounded-full border border-[#A62B3A]/80 bg-[#A62B3A]/25 px-7 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#e8e1d5] transition hover:bg-[#A62B3A]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8e1d5]"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="dashboard-hero-copy pointer-events-none absolute inset-0 z-[60]"
      data-dashboard-variant={visualVariant || 'forum-ops'}
    >
      <motion.div
        style={{ opacity: beat2Opacity, x: beat2X, scale: beat2Scale, filter: beat2Filter }}
        className="absolute inset-0 flex items-center justify-start px-[8%] md:px-[12%]"
      >
        <div className="hero-glass-card max-w-xl space-y-4 rounded-2xl p-6 md:p-7">
          <p className="text-[10px] uppercase tracking-[0.32em] text-[#A62B3A]">{copy.beat2Label}</p>
          <h2 className="font-display text-3xl md:text-5xl text-[#e8e1d5] uppercase">{copy.beat2Title}</h2>
          <p className="hero-glass-card__body text-sm md:text-lg">{copy.beat2Body}</p>
          <div className="h-px w-28 bg-gradient-to-r from-[#A62B3A] to-transparent" />
        </div>
      </motion.div>

      <motion.div
        style={{ opacity: beat3Opacity, x: beat3X, scale: beat3Scale, filter: beat3Filter }}
        className="absolute inset-0 flex items-center justify-end px-[8%] text-right md:px-[12%]"
      >
        <div className="hero-glass-card max-w-xl space-y-4 rounded-2xl p-6 md:p-7">
          <p className="text-[10px] uppercase tracking-[0.32em] text-[#8ea0b3]">{copy.beat3Label}</p>
          <h2 className="font-display text-3xl md:text-5xl text-[#e8e1d5] uppercase">{copy.beat3Title}</h2>
          <p className="hero-glass-card__body text-sm md:text-lg">{copy.beat3Body}</p>
          <div className="ml-auto h-px w-28 bg-gradient-to-l from-[#8ea0b3] to-transparent" />
        </div>
      </motion.div>

      <motion.div style={{ opacity: beat4Opacity, scale: beat4Scale }} className="absolute inset-0 flex items-center justify-center px-6 text-center">
        <div className="dashboard-hero-final-shell space-y-6 rounded-2xl border border-[#2a3541]/60 bg-[#04070b]/40 px-7 py-7 backdrop-blur-sm md:px-10 md:py-10">
          <div className="mx-auto h-24 w-24 overflow-hidden md:h-32 md:w-32">
            <img src={crest} alt="Wolf Crest" className="h-full w-full scale-[1.45] object-contain opacity-95 animate-aura-glow" loading="eager" />
          </div>
          <h2 className="font-display text-4xl md:text-7xl text-[#e8e1d5] uppercase tracking-[0.08em] [text-shadow:0_4px_30px_rgba(0,0,0,0.55)]">
            {copy.beat4Title}
          </h2>
          <p className="mx-auto max-w-2xl text-base md:text-lg text-[#9aa7b5]">{copy.beat4Body}</p>
          <div className="pointer-events-auto flex justify-center">
            <Link
              to={ctaHref}
              onClick={onPrimaryCta}
              className="dashboard-hero-primary-cta inline-flex items-center gap-3 rounded-full border border-[#A62B3A]/80 bg-[#A62B3A]/25 px-7 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#e8e1d5] transition hover:bg-[#A62B3A]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8e1d5]"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </motion.div>

      <motion.div
        data-testid="hero-handoff-cue"
        style={{ opacity: handoffOpacity }}
        className="pointer-events-none absolute inset-x-0 bottom-16 z-[65] flex justify-center px-4"
      >
        <div className="dashboard-hero-handoff rounded-full border border-[#2A3541]/80 bg-[#04070B]/75 px-5 py-2 text-[10px] uppercase tracking-[0.24em] text-[#9AA7B5] backdrop-blur-sm">
          {copy.handoffCue}
        </div>
      </motion.div>
    </div>
  )
}
