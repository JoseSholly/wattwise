import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type Variants,
} from 'motion/react'
import { useEffect, useRef, type PointerEvent, type ReactNode } from 'react'

import { EASE } from './ease'

/** Fade + rise + de-blur on first scroll into view. Static under reduced motion. */
export function FadeUp({
  children,
  delay = 0,
  className = '',
  y = 28,
}: {
  children: ReactNode
  /** Seconds. */
  delay?: number
  className?: string
  y?: number
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

const wordsParent: Variants = { hidden: {}, show: {} }
const word: Variants = {
  hidden: { y: '110%', opacity: 0, filter: 'blur(6px)' },
  show: { y: '0%', opacity: 1, filter: 'blur(0px)', transition: { duration: 1, ease: EASE } },
}

/**
 * Headline that rises in word by word from behind a clip line. Screen readers
 * get the plain sentence; the animated words are aria-hidden.
 */
export function SplitWords({
  text,
  as = 'h2',
  className = '',
  delay = 0,
}: {
  text: string
  as?: 'h1' | 'h2'
  className?: string
  delay?: number
}) {
  const reduce = useReducedMotion()
  const Tag = as === 'h1' ? motion.h1 : motion.h2
  const words = text.split(' ')
  return (
    <Tag
      className={className}
      variants={wordsParent}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      transition={{ staggerChildren: 0.055, delayChildren: delay }}
    >
      <span className="sr-only">{text}</span>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true">
          <span className="inline-block overflow-hidden pb-[0.1em] align-bottom">
            <motion.span className="inline-block" variants={reduce ? undefined : word}>
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </Tag>
  )
}

/** Counts from zero to `value` once visible, keeping its decimal places. */
export function CountUp({ value, delay = 0 }: { value: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const reduce = useReducedMotion()
  const target = Number.parseFloat(value)
  const decimals = (value.split('.')[1] ?? '').length

  useEffect(() => {
    const el = ref.current
    if (!el || !inView || reduce) return
    const controls = animate(0, target, {
      duration: 1.8,
      delay,
      ease: EASE,
      onUpdate: (v) => {
        el.textContent = v.toFixed(decimals)
      },
    })
    return () => controls.stop()
  }, [inView, reduce, target, decimals, delay])

  return <span ref={ref}>{reduce ? value : (0).toFixed(decimals)}</span>
}

/** Pulls its child gently toward a mouse pointer. Ignores touch input. */
export function Magnetic({
  children,
  strength = 0.28,
  className = '',
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 })

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      className={className}
      style={{ x: sx, y: sy }}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.div>
  )
}

/**
 * Card whose surface and border light up in amber under the cursor, the way
 * x.ai's product tiles do. Purely decorative layers; content sits on top.
 */
export function Spotlight({ children, className = '' }: { children: ReactNode; className?: string }) {
  const mx = useMotionValue(-1000)
  const my = useMotionValue(-1000)
  const fill = useMotionTemplate`radial-gradient(480px circle at ${mx}px ${my}px, rgb(var(--accent) / 0.12), transparent 60%)`
  const edge = useMotionTemplate`radial-gradient(280px circle at ${mx}px ${my}px, rgb(var(--accent) / 0.85), transparent 65%)`

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    mx.set(e.clientX - r.left)
    my.set(e.clientY - r.top)
  }

  return (
    <div
      onPointerMove={onMove}
      className={`group relative isolate rounded-2xl border border-line bg-surface/70 ${className}`}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: fill }}
      />
      <motion.div
        aria-hidden="true"
        className="spotlight-edge pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: edge }}
      />
      {children}
    </div>
  )
}

/** Amber sparks drifting up off a horizon line. Hidden under reduced motion via CSS. */
export function Sparks({ count = 26, className = '' }: { count?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      {Array.from({ length: count }).map((_, i) => {
        // Deterministic pseudo-random spread so renders are stable.
        const r = (n: number) => ((Math.sin(i * 928.37 + n * 17.13) + 1) / 2) % 1
        return (
          <span
            key={i}
            className="spark"
            style={{
              left: `${18 + r(1) * 64}%`,
              width: `${1.5 + r(2) * 2}px`,
              height: `${1.5 + r(2) * 2}px`,
              animationDuration: `${7 + r(3) * 9}s`,
              animationDelay: `${-r(4) * 16}s`,
            }}
          />
        )
      })}
    </div>
  )
}
