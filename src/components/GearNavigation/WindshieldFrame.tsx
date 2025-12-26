import { ReactNode } from 'react'
import './WindshieldFrame.css'

interface WindshieldFrameProps {
  children: ReactNode
}

export const WindshieldFrame = ({ children }: WindshieldFrameProps) => {
  return (
    <div className="windshield-frame" role="main" aria-label="Main content area">
      <div className="windshield-bezel" aria-hidden="true" />
      <div className="windshield-border" aria-hidden="true" />
      <div className="windshield-content">{children}</div>
    </div>
  )
}
