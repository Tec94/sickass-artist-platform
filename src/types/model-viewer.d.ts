import type { CSSProperties, DetailedHTMLProps, HTMLAttributes } from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          src?: string
          poster?: string
          autoplay?: boolean
          'camera-controls'?: boolean
          'auto-rotate'?: boolean
          'camera-orbit'?: string
          'min-camera-orbit'?: string
          'max-camera-orbit'?: string
          'min-field-of-view'?: string
          'max-field-of-view'?: string
          exposure?: string
          loading?: 'eager' | 'lazy'
          reveal?: 'auto' | 'interaction'
          style?: CSSProperties
        },
        HTMLElement
      >
    }
  }
}

export {}
