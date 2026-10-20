import { motion, useTransform, type MotionValue } from 'motion/react'
import { Sparks } from './motion'

type Props = {
  /** 0 → 1 as the hero scrolls out of view. */
  progress: MotionValue<number>
  /** Pointer offset from the hero centre, in px, already spring-smoothed. */
  pointerX: MotionValue<number>
}

/**
 * The hero's sunrise: a huge planet whose rim glows amber, with a breathing
 * corona, a flare drifting along the edge and sparks of energy lifting off.
 * On scroll the planet sinks and the light dims, so the hero reads as
 * "sunset" as you move on to the content.
 */
export function Horizon({ progress, pointerX }: Props) {
  const sink = useTransform(progress, [0, 1], [0, 220])
  const dim = useTransform(progress, [0, 0.8], [1, 0.25])
  const drift = useTransform(pointerX, (v) => v * -0.04)

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 [--rim:76%] sm:[--rim:64%]"
      style={{ y: sink, x: drift, opacity: dim }}
    >
      {/* Corona above the rim */}
      <div className="absolute left-1/2 top-[calc(var(--rim)-50vh)] h-[100vh] w-[150vw] -translate-x-1/2 sm:w-[120vw]">
        <div className="horizon-corona h-full w-full" />
      </div>

      {/* Sparks rising off the rim */}
      <div className="absolute inset-x-0 top-0 h-[var(--rim)]">
        <Sparks />
      </div>

      {/* Planet */}
      <div
        className="horizon-planet absolute left-1/2 top-[var(--rim)] aspect-square -translate-x-1/2 rounded-full"
        style={{ width: 'max(2400px, 240vw)' }}
      />

      {/* Flare riding the rim */}
      <div className="absolute left-1/2 top-[var(--rim)] -ml-[90px] -mt-[9px] h-[18px] w-[180px]">
        <div className="horizon-flare h-full w-full" />
      </div>
    </motion.div>
  )
}
