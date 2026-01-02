import { ReactNode } from 'react'
import { FlashlightEffect } from '../Effects/FlashlightEffect'

interface WindshieldFrameProps {
  children: ReactNode
}

export const WindshieldFrame = ({ children }: WindshieldFrameProps) => {
  return (
    <div className="windshield-frame" role="main" aria-label="Main content area">
      <div className="windshield-bezel" aria-hidden="true" />
      <div className="windshield-border" aria-hidden="true" />
      <FlashlightEffect className="windshield-content-wrapper">
        <div className="windshield-content">{children}</div>
      </FlashlightEffect>

      <style>{`
        .windshield-frame {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 24px;
          overflow: hidden;
          background: #000;
          border: 1px solid #111;
          box-shadow: 0 40px 100px rgba(0,0,0,0.8);
        }

        .windshield-bezel {
          position: absolute;
          inset: 0;
          pointer-events: none;
          border: 20px solid #050505;
          border-radius: 24px;
          z-index: 10;
        }

        .windshield-border {
          position: absolute;
          inset: 18px;
          pointer-events: none;
          border: 1px solid #222;
          border-radius: 12px;
          z-index: 11;
        }

        .windshield-content-wrapper {
          width: 100%;
          height: 100%;
          border-radius: 12px;
        }

        .windshield-content {
          width: 100%;
          height: 100%;
          padding: 40px;
          overflow-y: auto;
          scrollbar-width: none;
        }

        .windshield-content::-webkit-scrollbar {
          display: none;
        }

        @media (max-width: 768px) {
          .windshield-frame {
            border-radius: 0;
            border: none;
          }
          .windshield-bezel, .windshield-border {
            display: none;
          }
          .windshield-content {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  )
}
