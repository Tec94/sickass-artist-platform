import React from 'react'

export interface LogoSliderProps {
  logos: React.ReactNode[]
  speed?: number
  direction?: 'left' | 'right'
  showBlur?: boolean
  blurLayers?: number
  blurIntensity?: number
  className?: string
  pauseOnHover?: boolean
}

export const LogoSlider = ({
  logos,
  speed = 60,
  direction = 'left',
  showBlur = true,
  blurLayers = 8,
  blurIntensity = 1,
  className,
  pauseOnHover = false,
}: LogoSliderProps) => {
  const rootClass = ['logo-slider w-full overflow-hidden', className].filter(Boolean).join(' ')

  return (
    <div
      className={rootClass}
      style={{
        ['--speed' as string]: speed,
        ['--count' as string]: logos.length,
        ['--blurs' as string]: blurLayers,
        ['--blur' as string]: blurIntensity,
      } as React.CSSProperties}
    >
      <div
        className="logo-slider__container relative w-full min-h-[80px] grid"
        data-direction={direction}
        data-pause-on-hover={pauseOnHover}
      >
        {showBlur && (
          <div className="logo-slider__blur logo-slider__blur--left absolute top-0 bottom-0 left-0 w-1/4 z-10 pointer-events-none rotate-180">
            {Array.from({ length: blurLayers }).map((_, i) => (
              <div key={i} className="absolute inset-0" style={{ ['--blur-index' as string]: i } as React.CSSProperties} />
            ))}
          </div>
        )}
        {showBlur && (
          <div className="logo-slider__blur logo-slider__blur--right absolute top-0 bottom-0 right-0 w-1/4 z-10 pointer-events-none">
            {Array.from({ length: blurLayers }).map((_, i) => (
              <div key={i} className="absolute inset-0" style={{ ['--blur-index' as string]: i } as React.CSSProperties} />
            ))}
          </div>
        )}

        <ul className="logo-slider__track flex h-full w-fit m-0 p-0 list-none">
          {logos.map((logo, index) => (
            <li
              key={index}
              className="logo-slider__item grid place-items-center shrink-0"
              style={{ ['--item-index' as string]: index } as React.CSSProperties}
            >
              <div className="w-full h-full flex items-center justify-center">
                {logo}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

LogoSlider.displayName = 'LogoSlider'
