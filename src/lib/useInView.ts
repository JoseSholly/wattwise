import { useEffect, useRef, useState } from 'react'

type Options = {
  /** How much of the element must be visible before firing. */
  threshold?: number
  /** Trigger a bit before the element hits the viewport edge. */
  rootMargin?: string
  /** Fire once and stop observing, vs. re-fire on every scroll in/out. */
  once?: boolean
}

/**
 * Observes an element and reports whether it's in the viewport. Respects
 * `prefers-reduced-motion` by marking as visible immediately, so animations
 * don't play for users who've opted out.
 */
export function useInView<T extends Element = HTMLDivElement>({
  threshold = 0.15,
  rootMargin = '0px 0px -10% 0px',
  once = true,
}: Options = {}) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setInView(true)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true)
            if (once) io.disconnect()
          } else if (!once) {
            setInView(false)
          }
        }
      },
      { threshold, rootMargin },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [threshold, rootMargin, once])

  return { ref, inView }
}
