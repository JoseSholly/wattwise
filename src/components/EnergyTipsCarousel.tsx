import { useEffect, useRef, useState } from 'react'
import { ENERGY_TIPS, type EnergyTip } from '../lib/energyTips'

type Direction = 'up' | 'down'

/**
 * Vertical, multi-column marquee of energy tips. Each column scrolls on its
 * own rAF loop so direction changes are instant and smooth (no CSS animation
 * restart). The direction of travel is coupled to the page's scroll direction
 * — scroll up, cards travel up; scroll down, cards travel down — but motion
 * is continuous: once pointed in a direction, cards keep moving at a steady
 * speed until the user scrolls the other way. Respects reduced-motion.
 */
export function EnergyTipsCarousel() {
  const [direction, setDirection] = useState<Direction>('up')
  const lastScrollY = useRef(0)

  useEffect(() => {
    lastScrollY.current = window.scrollY
    let ticking = false

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const current = window.scrollY
        const delta = current - lastScrollY.current
        if (Math.abs(delta) > 2) {
          setDirection(delta > 0 ? 'down' : 'up')
          lastScrollY.current = current
        }
        ticking = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Deal cards into three columns in round-robin order so categories mix
  // across columns rather than clustering by index.
  const columns: EnergyTip[][] = [[], [], []]
  ENERGY_TIPS.forEach((t, i) => columns[i % 3].push(t))

  // Slightly different speeds per column so columns don't look lock-stepped.
  const speeds = [34, 42, 38]
  // Fixed initial offsets so columns start out of phase on first paint.
  const offsets = [0, 120, 240]

  return (
    <div className="relative h-[480px] overflow-hidden sm:h-[560px]">
      {/* Top/bottom gradient fades — cards bleed into the page background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-bg to-transparent sm:h-24" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-bg to-transparent sm:h-24" />

      <div className="mx-auto grid h-full max-w-6xl grid-cols-1 gap-5 px-4 sm:grid-cols-2 sm:gap-6 sm:px-6 lg:grid-cols-3">
        {columns.map((tips, i) => {
          // Progressive reveal across breakpoints: 1 col on mobile, 2 on
          // tablet, 3 on desktop.
          const visibility = i === 2 ? 'hidden lg:block' : i === 1 ? 'hidden sm:block' : ''
          return (
            <Column
              key={i}
              tips={tips}
              direction={direction}
              speed={speeds[i]}
              initialOffset={offsets[i]}
              className={visibility}
            />
          )
        })}
      </div>
    </div>
  )
}

type ColumnProps = {
  tips: EnergyTip[]
  direction: Direction
  speed: number
  initialOffset: number
  className?: string
}

function Column({ tips, direction, speed, initialOffset, className = '' }: ColumnProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const yRef = useRef(-initialOffset)
  const halfHeightRef = useRef(0)
  const directionRef = useRef(direction)

  // Keep the latest direction visible to the rAF loop without restarting it.
  useEffect(() => {
    directionRef.current = direction
  }, [direction])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const measure = () => {
      // The track holds two identical copies, so one copy = scrollHeight / 2.
      halfHeightRef.current = track.scrollHeight / 2
    }
    measure()

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      // Park the track at its starting offset without animation.
      track.style.transform = `translate3d(0, ${yRef.current}px, 0)`
      return
    }

    let raf = 0
    let lastTime = performance.now()

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05) // clamp to avoid big jumps on tab resume
      lastTime = now

      const sign = directionRef.current === 'up' ? -1 : 1
      yRef.current += speed * dt * sign

      // Seamless wrap: y=0 and y=-halfHeight show identical content because
      // the track is two stacked copies of the same list.
      const half = halfHeightRef.current
      if (half > 0) {
        if (yRef.current <= -half) yRef.current += half
        else if (yRef.current > 0) yRef.current -= half
      }

      track.style.transform = `translate3d(0, ${yRef.current}px, 0)`
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    const onResize = () => measure()
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [speed])

  const doubled = [...tips, ...tips]

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={trackRef} className="flex flex-col gap-5 will-change-transform">
        {doubled.map((entry, i) => (
          <TipCard key={i} entry={entry} />
        ))}
      </div>
    </div>
  )
}

function TipCard({ entry }: { entry: EnergyTip }) {
  return (
    <article className="flex flex-col gap-2.5 rounded-lg border border-line bg-surface p-5 sm:gap-3 sm:p-6">
      <p className="label-mono text-accent-ink">{entry.category}</p>
      <p className="text-[14px] leading-relaxed text-fg sm:text-[15px] sm:leading-relaxed">
        {entry.tip}
      </p>
    </article>
  )
}
