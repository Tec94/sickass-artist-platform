import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Lock, Map, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference'
import {
  OUTER_GROUNDS_PATHS,
  OUTER_GROUNDS_REGION_ORDER,
  OUTER_GROUNDS_SCENE,
  type CastleArrowDirection,
  type CastlePoint,
  type CastleRegionId,
  type OuterGroundRegionConfig,
} from '../features/castleNavigation/sceneConfig'
import '../styles/castle-landing.css'

type OuterGroundRegion = { id: CastleRegionId } & OuterGroundRegionConfig

const arrowIconByDirection: Record<CastleArrowDirection, typeof ArrowLeft> = {
  up: ArrowUp,
  right: ArrowRight,
  down: ArrowDown,
  left: ArrowLeft,
}

const directionalRegionByKey: Partial<Record<string, CastleRegionId>> = {
  ArrowLeft: 'store',
  ArrowRight: 'community',
  ArrowUp: 'ranking',
  ArrowDown: 'events',
  Home: 'campaign',
}

const percentStyle = (
  point: CastlePoint,
  width: number,
  height: number,
  extra?: CSSProperties,
): CSSProperties => ({
  left: `${(point.x / width) * 100}%`,
  top: `${(point.y / height) * 100}%`,
  ...extra,
})

const getRegionAccentRgb = (hex: string) => {
  const normalized = hex.replace('#', '')
  const chunk = normalized.length === 3
    ? normalized
        .split('')
        .map((value) => value + value)
        .join('')
    : normalized

  const value = Number.parseInt(chunk, 16)
  const r = (value >> 16) & 255
  const g = (value >> 8) & 255
  const b = value & 255
  return `${r} ${g} ${b}`
}

const getReturnToHref = (route: string) => `/sign-in?returnTo=${encodeURIComponent(route)}`
const getSignUpHref = (route: string) => `/sign-up?returnTo=${encodeURIComponent(route)}`

const OUTER_GROUND_REGIONS: OuterGroundRegion[] = OUTER_GROUNDS_REGION_ORDER.map((id) => ({
  id,
  ...OUTER_GROUNDS_PATHS[id],
}))

export const LandingPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isSignedIn } = useAuth()
  const { prefersReducedMotion } = useReducedMotionPreference()

  const [hoveredRegionId, setHoveredRegionId] = useState<CastleRegionId | null>(null)
  const [focusedRegionId, setFocusedRegionId] = useState<CastleRegionId | null>(null)
  const [activeRegionId, setActiveRegionId] = useState<CastleRegionId | null>(null)
  const [authPromptRegionId, setAuthPromptRegionId] = useState<CastleRegionId | null>(null)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [isCoarsePointer, setIsCoarsePointer] = useState(false)

  const scene = OUTER_GROUNDS_SCENE
  const regions = OUTER_GROUND_REGIONS

  const debugRegions = useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    return searchParams.get('debugRegions') === '1'
  }, [location.search])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return

    const mediaQuery = window.matchMedia('(hover: none), (pointer: coarse)')
    const updatePointerMode = () => setIsCoarsePointer(mediaQuery.matches)

    updatePointerMode()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updatePointerMode)
      return () => mediaQuery.removeEventListener('change', updatePointerMode)
    }

    mediaQuery.addListener(updatePointerMode)
    return () => mediaQuery.removeListener(updatePointerMode)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (isSignedIn) {
      setAuthPromptRegionId(null)
    }
  }, [isSignedIn])

  useEffect(() => {
    if (!isMapOpen && !authPromptRegionId) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setIsMapOpen(false)
      setAuthPromptRegionId(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [authPromptRegionId, isMapOpen])

  const visibleRegionId = authPromptRegionId ?? focusedRegionId ?? hoveredRegionId ?? activeRegionId
  const promptRegion = useMemo(
    () => regions.find((region) => region.id === authPromptRegionId) ?? null,
    [authPromptRegionId, regions],
  )

  const handleRegionIntent = (region: OuterGroundRegion) => {
    setActiveRegionId(region.id)
    setIsMapOpen(false)

    const isLocked = region.authRequired && !isSignedIn
    if (isLocked) {
      setAuthPromptRegionId(region.id)
      return
    }

    setAuthPromptRegionId(null)
    navigate(region.route, {
      state: {
        fromScene: '/',
      },
    })
  }

  const handleRegionPointerEnter = (regionId: CastleRegionId) => {
    setHoveredRegionId(regionId)
    if (!isCoarsePointer) {
      setActiveRegionId(regionId)
      setAuthPromptRegionId(null)
    }
  }

  const handleRegionPointerLeave = () => {
    setHoveredRegionId(null)
    if (!focusedRegionId && !authPromptRegionId && !isCoarsePointer) {
      setActiveRegionId(null)
    }
  }

  const handleRegionAction = (region: OuterGroundRegion) => {
    if (isCoarsePointer && activeRegionId !== region.id) {
      setActiveRegionId(region.id)
      setAuthPromptRegionId(null)
      return
    }

    handleRegionIntent(region)
  }

  const handleSceneKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      setAuthPromptRegionId(null)
      setIsMapOpen(false)
      setActiveRegionId(null)
      return
    }

    const targetRegionId = directionalRegionByKey[event.key]
    if (!targetRegionId) return

    event.preventDefault()
    setActiveRegionId(targetRegionId)
    setAuthPromptRegionId(null)
  }

  const handlePathKeyDown = (event: ReactKeyboardEvent<SVGPathElement>, region: OuterGroundRegion) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleRegionAction(region)
    }
  }

  return (
    <main className="castle-landing" onKeyDown={handleSceneKeyDown} data-debug={debugRegions ? 'true' : 'false'}>
      <section className="castle-landing__stage">
        <div className="castle-landing__scene-wrap">
          <div
            className="castle-landing__scene"
            onClick={(event: ReactPointerEvent<HTMLDivElement>) => {
              if (event.target !== event.currentTarget) return
              setAuthPromptRegionId(null)
              setIsMapOpen(false)
              setHoveredRegionId(null)
              setActiveRegionId(null)
            }}
          >
            <img
              className="castle-landing__scene-image"
              src={scene.image}
              alt="Outer grounds of the ROA castle with five navigable estate zones."
            />
            <div className="castle-landing__vignette" aria-hidden="true" />
            <div className="castle-landing__grain" aria-hidden="true" />
            <div className="castle-landing__moon-haze" aria-hidden="true" />

            <div className="castle-landing__scene-controls">
              <button
                type="button"
                className="castle-landing__map-button"
                onClick={() => setIsMapOpen((current) => !current)}
                aria-expanded={isMapOpen}
                aria-controls="castle-estate-map"
              >
                <Map size={17} />
                <span>Explore the estate</span>
              </button>
              {isCoarsePointer && <p className="castle-landing__mobile-hint">{scene.mobileHint}</p>}
            </div>

            <svg
              className="castle-landing__scene-overlay"
              viewBox={`0 0 ${scene.width} ${scene.height}`}
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <defs>
                <filter id="castle-region-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="22" result="blurred" />
                  <feMerge>
                    <feMergeNode in="blurred" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {regions.map((region) => (
                  <clipPath id={`castle-clip-${region.id}`} key={`clip-${region.id}`}>
                    <path d={region.d} />
                  </clipPath>
                ))}

                {regions.map((region) => (
                  <linearGradient
                    id={`castle-tint-${region.id}`}
                    key={`tint-${region.id}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor={region.hoverAccent} stopOpacity="0.38" />
                    <stop offset="54%" stopColor={region.hoverAccent} stopOpacity="0.12" />
                    <stop offset="100%" stopColor={region.hoverAccent} stopOpacity="0.02" />
                  </linearGradient>
                ))}

                <linearGradient id="castle-sheen-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="47%" stopColor="#ffffff" stopOpacity="0.03" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="0.7" />
                  <stop offset="53%" stopColor="#ffffff" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>

              {regions.map((region) => {
                const isLocked = region.authRequired && !isSignedIn
                const isActive = visibleRegionId === region.id
                const accentRgb = getRegionAccentRgb(region.hoverAccent)
                const fillOpacity = isActive ? (isLocked ? 0.12 : 0.16) : debugRegions ? 0.16 : 0
                const strokeOpacity = isActive ? (isLocked ? 0.58 : 0.82) : debugRegions ? 0.42 : 0.08
                const strokeWidth = isActive ? 12 : debugRegions ? 8 : 5

                return (
                  <g key={region.id}>
                    {isActive && (
                      <g clipPath={`url(#castle-clip-${region.id})`} filter="url(#castle-region-glow)">
                        <rect
                          width={scene.width}
                          height={scene.height}
                          fill={`url(#castle-tint-${region.id})`}
                          opacity={isLocked ? 0.48 : 0.76}
                        />
                        {!prefersReducedMotion && (
                          <rect
                            className="castle-landing__sheen"
                            x={-scene.width * 0.65}
                            y={0}
                            width={scene.width * 0.55}
                            height={scene.height}
                            fill="url(#castle-sheen-gradient)"
                          />
                        )}
                      </g>
                    )}

                    <path
                      d={region.d}
                      className="castle-landing__outline"
                      fill={fillOpacity ? `rgb(${accentRgb} / ${fillOpacity})` : 'transparent'}
                      stroke={`rgb(${accentRgb} / ${strokeOpacity})`}
                      strokeWidth={strokeWidth}
                      strokeLinejoin="round"
                      data-debug={debugRegions ? 'true' : 'false'}
                    />

                    <path
                      d={region.d}
                      tabIndex={0}
                      role="button"
                      aria-label={`${region.label}. ${isLocked ? 'Members only.' : 'Public access.'} ${region.preview}`}
                      className="castle-landing__hit-region"
                      fill="rgb(255 255 255 / 0.001)"
                      stroke="transparent"
                      strokeWidth={debugRegions ? 24 : 36}
                      onPointerEnter={() => handleRegionPointerEnter(region.id)}
                      onPointerLeave={handleRegionPointerLeave}
                      onClick={() => handleRegionAction(region)}
                      onFocus={() => {
                        setFocusedRegionId(region.id)
                        setActiveRegionId(region.id)
                      }}
                      onBlur={() => {
                        setFocusedRegionId(null)
                        if (!hoveredRegionId && !authPromptRegionId) {
                          setActiveRegionId(null)
                        }
                      }}
                      onKeyDown={(event) => handlePathKeyDown(event, region)}
                    />
                  </g>
                )
              })}
            </svg>

            {regions.map((region) => {
              const ArrowIcon = arrowIconByDirection[region.arrowDirection]
              const isLocked = region.authRequired && !isSignedIn
              const isActive = visibleRegionId === region.id

              return (
                <div key={`${region.id}-markers`} aria-hidden="true">
                  <div
                    className="castle-landing__arrow"
                    data-active={isActive ? 'true' : 'false'}
                    data-locked={isLocked ? 'true' : 'false'}
                    style={
                      {
                        ...percentStyle(region.arrowAnchor, scene.width, scene.height),
                        ['--castle-accent' as string]: region.hoverAccent,
                      } as CSSProperties
                    }
                  >
                    <ArrowIcon size={isActive ? 24 : 20} />
                  </div>

                  <div
                    className="castle-landing__label"
                    data-active={isActive ? 'true' : 'false'}
                    data-locked={isLocked ? 'true' : 'false'}
                    style={
                      {
                        ...percentStyle(region.labelAnchor, scene.width, scene.height),
                        ['--castle-accent' as string]: region.hoverAccent,
                      } as CSSProperties
                    }
                  >
                    <span className="castle-landing__label-direction">{region.locationLabel}</span>
                    <strong>{region.label}</strong>
                    <span>{isLocked ? 'Members only' : region.subtitle}</span>
                    {isLocked && <Lock size={14} />}
                  </div>
                </div>
              )
            })}

            {authPromptRegionId && promptRegion && (
              <div
                className="castle-landing__auth-popover"
                role="dialog"
                aria-modal="false"
                aria-labelledby="castle-auth-popover-title"
                style={percentStyle(promptRegion.labelAnchor, scene.width, scene.height)}
                data-direction={promptRegion.popoverDirection ?? 'center'}
              >
                <button
                  type="button"
                  className="castle-landing__auth-close"
                  onClick={() => setAuthPromptRegionId(null)}
                  aria-label="Close community prompt"
                >
                  <X size={16} />
                </button>
                <p className="castle-landing__auth-eyebrow">Threshold Locked</p>
                <h2 id="castle-auth-popover-title">
                  {promptRegion.authPromptTitle ?? 'Members only'}
                </h2>
                <p>
                  {promptRegion.authPromptDescription ??
                    'Sign in to continue into this wing.'}
                </p>
                <div className="castle-landing__auth-actions">
                  <a href={getReturnToHref(promptRegion.route)}>
                    Sign in
                  </a>
                  <a
                    href={getSignUpHref(promptRegion.route)}
                    className="castle-landing__secondary-action"
                  >
                    Create account
                  </a>
                  <button type="button" onClick={() => setAuthPromptRegionId(null)}>
                    Not now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <aside
        id="castle-estate-map"
        className="castle-landing__map"
        data-open={isMapOpen ? 'true' : 'false'}
        aria-hidden={isMapOpen ? 'false' : 'true'}
      >
        <div className="castle-landing__map-header">
          <div>
            <p className="castle-landing__map-eyebrow">Fallback Navigation</p>
            <h2>Estate map</h2>
          </div>
          <button type="button" onClick={() => setIsMapOpen(false)} aria-label="Close estate map">
            <X size={18} />
          </button>
        </div>

        <div className="castle-landing__map-list">
          {regions.map((region) => {
            const isLocked = region.authRequired && !isSignedIn
            return (
              <button
                key={region.id}
                type="button"
                className="castle-landing__map-item"
                onClick={() => handleRegionIntent(region)}
              >
                <div>
                  <p>{region.label}</p>
                  <span>{region.preview}</span>
                </div>
                <strong data-locked={isLocked ? 'true' : 'false'}>
                  {isLocked ? 'Locked' : 'Open'}
                </strong>
              </button>
            )
          })}
        </div>
      </aside>
    </main>
  )
}
