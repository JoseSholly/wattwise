import type { CSSProperties, ReactNode } from 'react'
import { useInView } from '../lib/useInView'

type Props = {
  children: ReactNode
  /** Stagger delay in ms — useful for reveal cascades in a list. */
  delay?: number
  /** Extra classes on the wrapper. */
  className?: string
  /** How far up the element travels while fading in. */
  distance?: number
  style?: CSSProperties
}

/**
 * Fade + slight upward slide when the element scrolls into view. GPU-cheap
 * (transform + opacity only). Respects `prefers-reduced-motion` via useInView.
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
  distance = 24,
  style,
}: Props) {
  const { ref, inView } = useInView<HTMLDivElement>()
  return (
    <div
      ref={ref}
      style={{
        transitionProperty: 'opacity, transform',
        transitionDuration: '700ms',
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: `${delay}ms`,
        transform: inView ? 'translate3d(0, 0, 0)' : `translate3d(0, ${distance}px, 0)`,
        opacity: inView ? 1 : 0,
        willChange: 'opacity, transform',
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  )
}
