import { motion, useTransform, type MotionValue } from 'framer-motion'
import type { DashboardHeroAssets } from './HeroAssetManifest'
import { heroMotionProfile } from './heroMotionProfile'

type HeroLightRaysProps = {
  assets: Pick<DashboardHeroAssets, 'spotlight'>
  progress: MotionValue<number>
  beamOpacity: MotionValue<number> | number
  beamScale: MotionValue<number> | number
  reducedMotion: boolean
  safeguardMode?: boolean
}

export const HeroLightRays = ({
  assets,
  progress,
  beamOpacity,
  beamScale,
  reducedMotion,
  safeguardMode = false,
}: HeroLightRaysProps) => {
  const beamY = useTransform(
    progress,
    [0, 0.45, 1],
    reducedMotion ? [0, 0, 0] : safeguardMode ? heroMotionProfile.beamYSafeguard : heroMotionProfile.beamY,
  )
  const beamX = useTransform(progress, [0, 1], reducedMotion ? [0, 0] : safeguardMode ? [-10, 6] : [-14, 10])
  const beamRotate = useTransform(progress, [0, 0.7, 1], reducedMotion ? [0, 0, 0] : safeguardMode ? [-0.8, 0.3, 0.8] : [-1.8, 0.6, 1.7])

  const hazeOpacity = useTransform(
    progress,
    [0, 0.22, 0.58, 0.82, 1],
    reducedMotion ? [0.28, 0.28, 0.28, 0.28, 0.28] : safeguardMode ? [0.2, 0.26, 0.34, 0.28, 0.24] : [0.24, 0.34, 0.48, 0.38, 0.3],
  )

  return (
    <>
      <motion.div
        className="pointer-events-none absolute inset-0 z-30"
        style={{
          opacity: beamOpacity,
          scale: beamScale,
          x: beamX,
          y: beamY,
          rotate: beamRotate,
          transformOrigin: '50% 0%',
          backgroundImage: `url(${assets.spotlight})`,
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '108% auto',
          mixBlendMode: 'screen',
        }}
      />

      <motion.div
        className="pointer-events-none absolute inset-0 z-40"
        style={{
          backgroundImage:
            'radial-gradient(145% 115% at 50% 48%, rgba(4, 7, 11, 0) 44%, rgba(4, 7, 11, 0.42) 70%, rgba(2, 4, 7, 0.84) 100%), linear-gradient(180deg, rgba(2, 4, 8, 0.12) 0%, rgba(2, 4, 8, 0.38) 68%, rgba(2, 4, 8, 0.56) 100%)',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          opacity: hazeOpacity,
        }}
      />
    </>
  )
}
