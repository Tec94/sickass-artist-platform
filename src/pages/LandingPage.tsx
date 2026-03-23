import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Map, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { buildAuthEntryHref } from '../features/auth/authRouting'
import {
  OUTER_GROUNDS_PATHS,
  OUTER_GROUNDS_REGION_ORDER,
  OUTER_GROUNDS_SCENE,
  type CastleRegionId,
  type CastlePoint,
  type OuterGroundRegionConfig,
} from '../features/castleNavigation/sceneConfig'
import '../styles/castle-landing.css'

export type OuterGroundRegion = { id: CastleRegionId } & OuterGroundRegionConfig

type LandingPageProps = {
  fromScene?: string
  onVisibleRegionChange?: (region: OuterGroundRegion | null) => void
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

const OUTER_GROUND_REGIONS: OuterGroundRegion[] = OUTER_GROUNDS_REGION_ORDER.map((id) => ({
  id,
  ...OUTER_GROUNDS_PATHS[id],
}))

export const LandingPage = ({
  fromScene = '/',
  onVisibleRegionChange,
}: LandingPageProps = {}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isSignedIn } = useAuth()

  const sceneWrapRef = useRef<HTMLDivElement | null>(null)
  const markerRefs = useRef<Partial<Record<CastleRegionId, HTMLButtonElement | null>>>({})
  const dragStateRef = useRef<{
    hasMoved: boolean
    pointerId: number
    scrollLeft: number
    startX: number
  } | null>(null)
  const suppressMarkerClickRef = useRef(false)
  const hasCenteredCoarseSceneRef = useRef(false)
  const [hoveredRegionId, setHoveredRegionId] = useState<CastleRegionId | null>(null)
  const [focusedRegionId, setFocusedRegionId] = useState<CastleRegionId | null>(null)
  const [activeRegionId, setActiveRegionId] = useState<CastleRegionId | null>(null)
  const [authPromptRegionId, setAuthPromptRegionId] = useState<CastleRegionId | null>(null)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [isCoarsePointer, setIsCoarsePointer] = useState(false)
  const [isSceneDragging, setIsSceneDragging] = useState(false)

  const scene = OUTER_GROUNDS_SCENE
  const regions = OUTER_GROUND_REGIONS
  const journeyRegions = useMemo(
    () => [...regions].sort((left, right) => left.journeyOrder - right.journeyOrder),
    [regions],
  )
  const overlayRegions = useMemo(
    () => [...regions].sort((left, right) => left.hitPriority - right.hitPriority),
    [regions],
  )

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

  useEffect(() => {
    const sceneWrap = sceneWrapRef.current
    if (!sceneWrap) return

    if (!isCoarsePointer) {
      hasCenteredCoarseSceneRef.current = false
      suppressMarkerClickRef.current = false
      dragStateRef.current = null
      setIsSceneDragging(false)
      sceneWrap.scrollLeft = 0
      return
    }

    if (hasCenteredCoarseSceneRef.current) return

    const frame = window.requestAnimationFrame(() => {
      const maxScrollLeft = Math.max(0, sceneWrap.scrollWidth - sceneWrap.clientWidth)
      if (maxScrollLeft > 0) {
        sceneWrap.scrollLeft = Math.round(maxScrollLeft / 2)
      }
      hasCenteredCoarseSceneRef.current = true
    })

    return () => window.cancelAnimationFrame(frame)
  }, [isCoarsePointer])

  const visibleRegionId = authPromptRegionId ?? focusedRegionId ?? hoveredRegionId ?? activeRegionId
  const visibleRegion = useMemo(
    () => regions.find((region) => region.id === visibleRegionId) ?? null,
    [regions, visibleRegionId],
  )
  const promptRegion = useMemo(
    () => regions.find((region) => region.id === authPromptRegionId) ?? null,
    [authPromptRegionId, regions],
  )

  useEffect(() => {
    onVisibleRegionChange?.(visibleRegion)
  }, [onVisibleRegionChange, visibleRegion])

  const handleRegionIntent = (region: OuterGroundRegion) => {
    setActiveRegionId(region.id)
    setIsMapOpen(false)

    if (region.authRequired && !isSignedIn) {
      setAuthPromptRegionId(region.id)
      return
    }

    setAuthPromptRegionId(null)
    navigate(region.route, {
      state: {
        fromScene,
      },
    })
  }

  const handleRegionPointerEnter = (regionId: CastleRegionId) => {
    setHoveredRegionId(regionId)
    setActiveRegionId(regionId)
    setAuthPromptRegionId(null)
  }

  const handleRegionPointerLeave = () => {
    setHoveredRegionId(null)
    if (!focusedRegionId && !authPromptRegionId) {
      setActiveRegionId(null)
    }
  }

  const handleSceneKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      setAuthPromptRegionId(null)
      setIsMapOpen(false)
      setHoveredRegionId(null)
      setFocusedRegionId(null)
      setActiveRegionId(null)
      return
    }

    const targetRegionId = directionalRegionByKey[event.key]
    if (!targetRegionId) return

    event.preventDefault()
    setHoveredRegionId(null)
    setFocusedRegionId(targetRegionId)
    setActiveRegionId(targetRegionId)
    setAuthPromptRegionId(null)
    markerRefs.current[targetRegionId]?.focus()
  }

  const endSceneDrag = (pointerId?: number) => {
    const sceneWrap = sceneWrapRef.current
    const dragState = dragStateRef.current
    const didDrag = dragState?.hasMoved ?? false

    if (
      sceneWrap &&
      typeof pointerId === 'number' &&
      typeof sceneWrap.hasPointerCapture === 'function' &&
      sceneWrap.hasPointerCapture(pointerId)
    ) {
      sceneWrap.releasePointerCapture(pointerId)
    }

    dragStateRef.current = null
    setIsSceneDragging(false)

    if (!didDrag) {
      suppressMarkerClickRef.current = false
      return
    }

    window.setTimeout(() => {
      suppressMarkerClickRef.current = false
    }, 0)
  }

  return (
    <main
      className="castle-landing"
      data-debug={debugRegions ? 'true' : 'false'}
      style={{ ['--castle-stage-height' as string]: 'calc(100vh - 72px)' }}
    >
      <section className="castle-landing__stage">
        {isCoarsePointer ? (
          <button
            type="button"
            className="castle-landing__map-toggle"
            onClick={() => setIsMapOpen((current) => !current)}
            aria-expanded={isMapOpen}
            aria-controls="castle-estate-map"
            aria-label={isMapOpen ? 'Close estate list' : 'Open estate list'}
          >
            {isMapOpen ? <X size={18} /> : <Map size={18} />}
          </button>
        ) : null}

        <div
          ref={sceneWrapRef}
          className="castle-landing__scene-wrap"
          data-pan-enabled={isCoarsePointer ? 'true' : 'false'}
          data-dragging={isSceneDragging ? 'true' : 'false'}
          onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) => {
            if (!isCoarsePointer) return
            if (event.pointerType === 'mouse' && event.button !== 0) return

            const sceneWrap = sceneWrapRef.current
            const target = event.target as HTMLElement | null
            if (!sceneWrap || !target) return

            if (target.closest('[data-region-marker="true"], .castle-landing__auth-popover')) {
              return
            }

            if (sceneWrap.scrollWidth <= sceneWrap.clientWidth + 1) return

            setAuthPromptRegionId(null)
            setIsMapOpen(false)
            setHoveredRegionId(null)
            setFocusedRegionId(null)
            setActiveRegionId(null)
            suppressMarkerClickRef.current = false
            dragStateRef.current = {
              hasMoved: false,
              pointerId: event.pointerId,
              scrollLeft: sceneWrap.scrollLeft,
              startX: event.clientX,
            }
            setIsSceneDragging(true)
            sceneWrap.setPointerCapture?.(event.pointerId)
          }}
          onPointerMove={(event: ReactPointerEvent<HTMLDivElement>) => {
            const sceneWrap = sceneWrapRef.current
            const dragState = dragStateRef.current
            if (!sceneWrap || !dragState || dragState.pointerId !== event.pointerId) return

            const deltaX = event.clientX - dragState.startX

            if (!dragState.hasMoved && Math.abs(deltaX) >= 6) {
              dragState.hasMoved = true
              suppressMarkerClickRef.current = true
              setHoveredRegionId(null)
              setFocusedRegionId(null)
              setActiveRegionId(null)
              setAuthPromptRegionId(null)
            }

            if (!dragState.hasMoved && Math.abs(deltaX) < 2) return

            sceneWrap.scrollLeft = dragState.scrollLeft - deltaX
            event.preventDefault()
          }}
          onPointerUp={(event: ReactPointerEvent<HTMLDivElement>) => {
            endSceneDrag(event.pointerId)
          }}
          onPointerCancel={(event: ReactPointerEvent<HTMLDivElement>) => {
            endSceneDrag(event.pointerId)
          }}
        >
          <div className="castle-landing__scene">
            <img className="castle-landing__scene-image" src={scene.image} alt="" aria-hidden="true" />
            <div className="castle-landing__vignette" aria-hidden="true" />
            <div className="castle-landing__grain" aria-hidden="true" />
            <div className="castle-landing__moon-haze" aria-hidden="true" />

            <svg
              className="castle-landing__scene-overlay"
              viewBox={`0 0 ${scene.width} ${scene.height}`}
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              {debugRegions &&
                overlayRegions.map((region) => {
                  const isLocked = region.authRequired && !isSignedIn
                  const isActive = visibleRegionId === region.id
                  const debugAccessState = isLocked ? 'LOCKED' : region.debugAccessLabel
                  const debugLabel = `${region.debugLabel} · ID ${region.id} · ${debugAccessState} · P${region.hitPriority}`

                  return (
                    <g key={region.id}>
                      <path
                        d={region.d}
                        className="castle-landing__outline"
                        aria-hidden="true"
                        fill={isActive ? 'rgb(255 255 255 / 0.06)' : 'transparent'}
                        stroke={isLocked ? 'rgb(201 213 225 / 0.82)' : 'rgb(244 239 230 / 0.7)'}
                        strokeWidth={isActive ? 10 : 6}
                        strokeLinejoin="round"
                        data-region-id={region.id}
                        data-hit-priority={region.hitPriority}
                        data-debug="true"
                      />

                      <g
                        className="castle-landing__debug-layer"
                        data-debug-region={region.id}
                        data-debug-access={debugAccessState.toLowerCase()}
                        aria-hidden="true"
                      >
                        <g
                          className="castle-landing__debug-anchor"
                          transform={`translate(${region.labelAnchor.x} ${region.labelAnchor.y})`}
                          data-region-id={region.id}
                          data-debug-anchor="label"
                        >
                          <circle r="10" />
                          <path d="M -16 0 H 16 M 0 -16 V 16" />
                          <text x="18" y="-10">
                            LABEL
                          </text>
                        </g>

                        <g
                          className="castle-landing__debug-anchor castle-landing__debug-anchor--arrow"
                          transform={`translate(${region.arrowAnchor.x} ${region.arrowAnchor.y})`}
                          data-region-id={region.id}
                          data-debug-anchor="arrow"
                        >
                          <circle r="10" />
                          <path d="M -16 0 H 16 M 0 -16 V 16" />
                          <text x="18" y="-10">
                            ARROW
                          </text>
                        </g>

                        <text
                          className="castle-landing__debug-label"
                          x={region.labelAnchor.x + 18}
                          y={region.labelAnchor.y + 22}
                          data-region-id={region.id}
                        >
                          {debugLabel}
                        </text>
                      </g>
                    </g>
                  )
                })}
            </svg>

            <p id="castle-estate-description" className="sr-only">
              ROA estate navigation. Explore five estate regions: Campaign, Events, Store,
              Rankings, and Community.
            </p>

            <div
              className="castle-landing__scene-nav"
              role="navigation"
              aria-label="ROA estate navigation"
              aria-describedby="castle-estate-description"
              tabIndex={0}
              onKeyDown={handleSceneKeyDown}
            >
              {journeyRegions.map((region) => {
                const isLocked = region.authRequired && !isSignedIn
                const isActive = visibleRegionId === region.id
                const markerStyle = {
                  ...percentStyle(region.markerAnchor, scene.width, scene.height),
                  ['--castle-marker-chip-offset-x' as string]: `${region.markerLabelOffset?.x ?? 0}px`,
                  ['--castle-marker-chip-offset-y' as string]: `${region.markerLabelOffset?.y ?? 0}px`,
                } as CSSProperties

                return (
                  <button
                    key={region.id}
                    ref={(node) => {
                      markerRefs.current[region.id] = node
                    }}
                    type="button"
                    className="castle-landing__marker"
                    data-region-marker="true"
                    data-region-id={region.id}
                    data-active={isActive ? 'true' : 'false'}
                    data-locked={isLocked ? 'true' : 'false'}
                    style={markerStyle}
                    aria-label={`${region.journeyLabel}. ${isLocked ? 'Members only.' : 'Public access.'} ${region.preview}`}
                    aria-keyshortcuts="Enter Space"
                    onPointerEnter={() => handleRegionPointerEnter(region.id)}
                    onPointerLeave={handleRegionPointerLeave}
                    onFocus={() => {
                      setFocusedRegionId(region.id)
                      setActiveRegionId(region.id)
                      setAuthPromptRegionId(null)
                    }}
                    onBlur={() => {
                      setFocusedRegionId(null)
                      if (!hoveredRegionId && !authPromptRegionId) {
                        setActiveRegionId(null)
                      }
                    }}
                    onClick={(event) => {
                      if (suppressMarkerClickRef.current) {
                        event.preventDefault()
                        event.stopPropagation()
                        return
                      }

                      handleRegionIntent(region)
                    }}
                  >
                    <span className="castle-landing__marker-core" aria-hidden="true" />
                    <span className="castle-landing__marker-chip" aria-hidden="true">
                      {region.journeyLabel}
                    </span>
                  </button>
                )
              })}
            </div>

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
                  <a href={buildAuthEntryHref('signin', promptRegion.route)}>Sign in</a>
                  <a
                    href={buildAuthEntryHref('signup', promptRegion.route)}
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
        aria-hidden={!isMapOpen}
      >
        <div className="castle-landing__map-header">
          <div>
            <p className="castle-landing__map-eyebrow">Fallback Navigation</p>
            <h2>Estate list</h2>
          </div>
          <button type="button" onClick={() => setIsMapOpen(false)} aria-label="Close estate list">
            <X size={18} />
          </button>
        </div>

        <div className="castle-landing__map-list">
          {journeyRegions.map((region) => {
            const isLocked = region.authRequired && !isSignedIn
            const statusLabel = isLocked ? 'Locked' : region.journeyStatusFallback

            return (
              <button
                key={region.id}
                type="button"
                className="castle-landing__map-item"
                onClick={() => handleRegionIntent(region)}
              >
                <div>
                  <p>{region.journeyLabel}</p>
                  <span>{region.journeyPurpose}</span>
                </div>
                <strong data-locked={isLocked ? 'true' : 'false'}>{statusLabel}</strong>
              </button>
            )
          })}
        </div>
      </aside>
    </main>
  )
}
