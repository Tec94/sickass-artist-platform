import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { motion, useMotionTemplate, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import {
  DASHBOARD_SCROLL_CONTAINER_SELECTOR,
} from '../../constants/dashboardFlags'
import type { DashboardHeroAssets } from './HeroAssetManifest'
import { HeroCopyBeats, type HeroNarrativeCopy } from './HeroCopyBeats'
import { HeroLightRays } from './HeroLightRays'
import {
  heroTimelineBaseline,
  heroTimelineHardened,
  type HeroTimeline,
} from './heroTimeline'
import { heroMotionProfile } from './heroMotionProfile'
import { getHeroScrollPhases, mapToNarrativeProgress } from './heroScrollPhases'

export type CinematicHeroVariant = 'baseline' | 'hardened'

export type CinematicHeroProps = {
  assets: DashboardHeroAssets
  onPrimaryCta?: () => void
  signalText?: string
  isSignedIn?: boolean
  variant?: CinematicHeroVariant
  copy?: Partial<HeroNarrativeCopy>
}

const DEFAULT_HERO_COPY: HeroNarrativeCopy = {
  reducedEyebrow: 'Moonlit Signal',
  reducedTitle: 'Enter The Moonlit Vault',
  reducedBody: 'A ceremonial chamber for the Wolfpack to gather, rank, and rise together.',
  signalStatusFallback: 'Moonlit Transmission Active',
  beat1Title: 'Moonlit Chatroom',
  beat1Body: "The vaulted chamber where the Wolfpack keeps the night's signal alive.",
  beat2Label: 'Act I',
  beat2Title: 'Steel In Moonlight.',
  beat2Body: 'Ceremonial drops and relic stories forged under quiet silver light.',
  beat3Label: 'Act II',
  beat3Title: 'One Pack. One Pulse.',
  beat3Body: 'Events, rankings, and voices aligned in a single noble rhythm.',
  beat4Title: 'Join The Chatroom',
  beat4Body: 'Enter the live vault for rankings, drops, and Wolfpack signals.',
  handoffCue: 'Continue To The Live Feed',
  ctaSignedIn: 'Open Chatroom',
  ctaSignedOut: 'Sign In to Enter Chatroom',
}

const getDepthMultiplier = (width: number): number => {
  if (width <= 520) return 0.55
  if (width <= 900) return 0.7
  if (width <= 1280) return 0.86
  return 1
}

const hasConstrainedMobileHints = (): boolean => {
  if (typeof navigator === 'undefined') return false

  const nav = navigator as Navigator & {
    connection?: {
      saveData?: boolean
      effectiveType?: string
    }
    deviceMemory?: number
  }

  const saveData = Boolean(nav.connection?.saveData)
  const network = nav.connection?.effectiveType
  const lowNetwork = network === 'slow-2g' || network === '2g'
  const lowMemory = typeof nav.deviceMemory === 'number' ? nav.deviceMemory <= 3 : false
  const lowCpu = typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency <= 4 : false

  return saveData || lowNetwork || (lowMemory && lowCpu)
}

const getTimeline = (variant: CinematicHeroVariant): HeroTimeline => {
  if (variant === 'hardened') return heroTimelineHardened
  return heroTimelineBaseline
}

export const CinematicHero = ({
  assets,
  onPrimaryCta,
  signalText,
  isSignedIn = false,
  variant = 'baseline',
  copy,
}: CinematicHeroProps) => {
  const sectionRef = useRef<HTMLElement>(null)
  const scrollContainerRef = useRef<HTMLElement | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth)
  const [constrainedMobileHints, setConstrainedMobileHints] = useState(false)

  useEffect(() => {
    scrollContainerRef.current = document.querySelector(DASHBOARD_SCROLL_CONTAINER_SELECTOR) as HTMLElement | null
    setConstrainedMobileHints(hasConstrainedMobileHints())

    const onResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    container: scrollContainerRef as RefObject<HTMLElement>,
    offset: ['start start', 'end end'],
  })

  const depth = useMemo(() => getDepthMultiplier(viewportWidth), [viewportWidth])
  const isReduced = Boolean(prefersReducedMotion)
  const safeguardMode = !isReduced && viewportWidth < 768 && constrainedMobileHints
  const scrollPhases = useMemo(() => getHeroScrollPhases(viewportWidth), [viewportWidth])
  const useSmoothedCopyProgress = !isReduced && !safeguardMode
  const smoothedProgress = useSpring(scrollYProgress, {
    stiffness: 92,
    damping: 26,
    mass: 0.78,
  })
  const copyProgressSource = useSmoothedCopyProgress ? smoothedProgress : scrollYProgress
  const copyProgressMapped = useTransform(copyProgressSource, (value) =>
    mapToNarrativeProgress(value, scrollPhases.narrativeProgressEnd),
  )
  const timeline = getTimeline(variant)
  const mergedCopy = { ...DEFAULT_HERO_COPY, ...(copy || {}) }

  const bgX = useTransform(scrollYProgress, [0, 1], isReduced ? [0, 0] : [-48 * depth, 30 * depth])
  const bgY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    isReduced
      ? [0, 0, 0]
      : [
          heroMotionProfile.backgroundY[0] * depth,
          heroMotionProfile.backgroundY[1] * depth,
          heroMotionProfile.backgroundY[2] * depth,
        ],
  )
  const bgScale = useTransform(scrollYProgress, [0, 0.56, 1], isReduced ? [1, 1, 1] : [1, 1.04, 1.02])
  const bgOpacity = useTransform(scrollYProgress, [0, 0.16, 0.82, 1], isReduced ? [1, 1, 1, 1] : [1, 1, 0.96, 0.92])
  const bgBlur = useTransform(scrollYProgress, [0, 0.55, 1], isReduced ? [0, 0, 0] : safeguardMode ? [0, 0.2, 1.2] : [0, 0.4, 2.6])
  const bgBrightness = useTransform(scrollYProgress, [0, 0.48, 1], isReduced ? [1, 1, 1] : [1, 1.04, 0.92])
  const bgSaturation = useTransform(scrollYProgress, [0, 0.4, 1], isReduced ? [1, 1, 1] : [1, 1.1, 0.92])
  const bgContrast = useTransform(scrollYProgress, [0, 0.38, 1], isReduced ? [1, 1, 1] : [1, 1.14, 1.04])
  const bgFilter = useMotionTemplate`brightness(${bgBrightness}) saturate(${bgSaturation}) contrast(${bgContrast}) blur(${bgBlur}px)`

  const midX = useTransform(scrollYProgress, [0, 1], isReduced ? [0, 0] : [42 * depth, -36 * depth])
  const midY = useTransform(
    scrollYProgress,
    [0, 0.48, 1],
    isReduced
      ? [0, 0, 0]
      : [
          heroMotionProfile.midgroundY[0] * depth,
          heroMotionProfile.midgroundY[1] * depth,
          heroMotionProfile.midgroundY[2] * depth,
        ],
  )
  const midScale = useTransform(scrollYProgress, [0, 0.52, 1], isReduced ? [1, 1, 1] : [1.52, 1.24, 1.05])
  const midOpacity = useTransform(
    scrollYProgress,
    [0, 0.1, 0.18, 0.36, 0.76, 1],
    isReduced ? [0.78, 0.78, 0.78, 0.78, 0.78, 0.78] : [0, 0, 0.34, 0.68, 0.84, 0.56],
  )
  const midBlur = useTransform(scrollYProgress, [0, 0.34, 0.7, 1], isReduced ? [0, 0, 0, 0] : safeguardMode ? [12, 5, 1, 5] : [22, 8, 2, 9])
  const midBrightness = useTransform(scrollYProgress, [0, 0.6, 1], isReduced ? [1, 1, 1] : [0.88, 1.1, 0.94])
  const midContrast = useTransform(scrollYProgress, [0, 0.55, 1], isReduced ? [1, 1, 1] : [0.94, 1.18, 1.05])
  const midFilter = useMotionTemplate`brightness(${midBrightness}) contrast(${midContrast}) blur(${midBlur}px)`

  const fgX = useTransform(scrollYProgress, [0, 1], isReduced ? [0, 0] : [-62 * depth, 26 * depth])
  const fgY = useTransform(
    scrollYProgress,
    [0, 0.45, 1],
    isReduced
      ? [0, 0, 0]
      : [
          heroMotionProfile.foregroundY[0] * depth,
          heroMotionProfile.foregroundY[1] * depth,
          heroMotionProfile.foregroundY[2] * depth,
        ],
  )
  const fgScale = useTransform(scrollYProgress, [0, 0.5, 1], isReduced ? [1, 1, 1] : [1.68, 1.3, 1.08])
  const fgOpacity = useTransform(
    scrollYProgress,
    [0, 0.12, 0.22, 0.42, 0.74, 1],
    isReduced ? [0.84, 0.84, 0.84, 0.84, 0.84, 0.84] : [0, 0, 0.36, 0.72, 0.9, 0.66],
  )
  const fgBlur = useTransform(scrollYProgress, [0, 0.4, 0.72, 1], isReduced ? [0, 0, 0, 0] : safeguardMode ? [11, 4, 1, 6] : [20, 7, 1, 11])
  const fgBrightness = useTransform(scrollYProgress, [0, 0.56, 1], isReduced ? [1, 1, 1] : [0.84, 1.04, 0.88])
  const fgContrast = useTransform(scrollYProgress, [0, 0.64, 1], isReduced ? [1, 1, 1] : [0.9, 1.2, 1.02])
  const fgFilter = useMotionTemplate`brightness(${fgBrightness}) contrast(${fgContrast}) blur(${fgBlur}px)`

  const storyTintOpacity = useTransform(
    scrollYProgress,
    [0, 0.1, 0.2, 0.5, 0.82, 1],
    isReduced ? [0.42, 0.42, 0.42, 0.42, 0.42, 0.42] : [0, 0.24, 0.4, 0.24, 0.34, 0.52],
  )
  const bottomFogY = useTransform(scrollYProgress, [0, 1], isReduced ? [0, 0] : [44, -84])
  const bottomFogOpacity = useTransform(
    scrollYProgress,
    [0, 0.32, 0.66, 1],
    isReduced ? [0.5, 0.5, 0.5, 0.5] : [0.58, 0.46, 0.36, 0.54],
  )
  const topMaskOpacity = useTransform(scrollYProgress, [0, 0.12, 0.5, 1], isReduced ? [0.3, 0.3, 0.3, 0.3] : [0.12, 0.28, 0.24, 0.38])
  const grainTargetOpacity = useTransform(
    scrollYProgress,
    [0, 0.6, 1],
    isReduced ? [0.12, 0.12, 0.12] : [0.17, 0.195, 0.235],
  )
  const grainRamp = useTransform(
    scrollYProgress,
    [0, 0.18, 0.45, 0.72, 1],
    isReduced ? [1, 1, 1, 1, 1] : [0, 0.25, 0.55, 0.82, 1],
  )
  const grainOpacity = useTransform(
    [grainTargetOpacity, grainRamp],
    ([targetOpacity, ramp]) => targetOpacity * ramp,
  )

  const beamOpacity = useTransform(
    scrollYProgress,
    [0, 0.08, 0.15, 0.52, 0.82, 1],
    isReduced
      ? [0.42, 0.42, 0.42, 0.42, 0.42, 0.42]
      : safeguardMode
        ? [0, 0.16, 0.5, 0.76, 0.7, 0.45]
        : [0, 0.18, 0.66, 0.98, 0.82, 0.5],
  )
  const beamScale = useTransform(scrollYProgress, [0, 0.6, 1], isReduced ? [1, 1, 1] : safeguardMode ? [1.06, 1.01, 0.99] : [1.12, 1.02, 0.98])

  const heroHeight = `${scrollPhases.totalHeightVh}vh`
  const ctaHref = isSignedIn ? '/chat' : '/sign-in?returnTo=%2Fchat'
  const ctaLabel = isSignedIn ? mergedCopy.ctaSignedIn : mergedCopy.ctaSignedOut

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: heroHeight }}
      aria-label="Cinematic dashboard hero"
      data-reduced-motion={isReduced ? 'true' : 'false'}
      data-dashboard-hero-root="true"
      data-dashboard-hero-variant={variant}
      data-mobile-safeguard={safeguardMode ? 'true' : 'false'}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-[#04070B]">
        <motion.div
          className="absolute inset-0 z-0 will-change-transform"
          style={{
            x: bgX,
            y: bgY,
            scale: bgScale,
            opacity: bgOpacity,
            filter: bgFilter,
            backgroundImage: `url(${assets.background})`,
            backgroundPosition: '50% 42%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        />

        <motion.div
          className="absolute inset-0 z-10 will-change-transform"
          style={{
            x: midX,
            y: midY,
            scale: midScale,
            opacity: midOpacity,
            filter: midFilter,
            backgroundImage: `url(${assets.midground})`,
            backgroundPosition: '50% 48%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            mixBlendMode: 'screen',
          }}
        />

        <motion.div
          className="absolute inset-0 z-20 will-change-transform"
          style={{
            x: fgX,
            y: fgY,
            scale: fgScale,
            opacity: fgOpacity,
            filter: fgFilter,
            backgroundImage: `url(${assets.foreground})`,
            backgroundPosition: '50% 56%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        />

        <motion.div
          className="pointer-events-none absolute inset-0 z-[22]"
          style={{
            opacity: grainOpacity,
            backgroundImage: `url(${assets.grain})`,
            backgroundPosition: 'center',
            backgroundRepeat: 'repeat',
            backgroundSize: 'cover',
            mixBlendMode: 'soft-light',
          }}
        />

        <motion.div
          className="pointer-events-none absolute inset-0 z-[24]"
          style={{
            opacity: storyTintOpacity,
            backgroundImage:
              'radial-gradient(125% 100% at 50% 42%, rgba(7, 20, 32, 0) 0%, rgba(7, 20, 32, 0.46) 66%, rgba(2, 8, 14, 0.72) 100%)',
          }}
        />

        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[26] h-[40vh]"
          style={{
            y: bottomFogY,
            opacity: bottomFogOpacity,
            background:
              'linear-gradient(180deg, rgba(7, 16, 25, 0) 0%, rgba(7, 16, 25, 0.44) 56%, rgba(3, 8, 13, 0.88) 100%)',
          }}
        />

        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 z-[27] h-[28vh]"
          style={{
            opacity: topMaskOpacity,
            background: 'linear-gradient(180deg, rgba(2, 5, 8, 0.74) 0%, rgba(2, 5, 8, 0.26) 65%, rgba(2, 5, 8, 0) 100%)',
          }}
        />

        <HeroLightRays
          assets={{ spotlight: assets.spotlight }}
          progress={scrollYProgress}
          beamOpacity={beamOpacity}
          beamScale={beamScale}
          reducedMotion={isReduced}
          safeguardMode={safeguardMode}
        />

        <HeroCopyBeats
          progress={copyProgressMapped}
          reducedMotion={isReduced}
          crest={assets.crest}
          signalText={signalText}
          copy={mergedCopy}
          ctaLabel={ctaLabel}
          ctaHref={ctaHref}
          timeline={timeline}
          onPrimaryCta={onPrimaryCta}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[70] h-52 bg-gradient-to-t from-[#04070B] via-[#04070B]/65 to-transparent" />
      </div>
    </section>
  )
}
