'use client'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect } from 'react'
import { computeProgress } from '@/lib/pregnancy'

interface BabyVisualProps {
  weekNumber: number
  size?: number
}

const BASE = 240

const PARTICLES_BASE = [
  { angle: 18,  r: 118, pSize: 2, delay: 0.0, dur: 4.2 },
  { angle: 72,  r: 108, pSize: 3, delay: 0.9, dur: 5.1 },
  { angle: 128, r: 122, pSize: 2, delay: 1.7, dur: 4.8 },
  { angle: 183, r: 112, pSize: 2, delay: 0.4, dur: 6.0 },
  { angle: 241, r: 118, pSize: 3, delay: 2.3, dur: 4.3 },
  { angle: 294, r: 106, pSize: 2, delay: 1.1, dur: 5.5 },
  { angle:  51, r:  96, pSize: 2, delay: 3.2, dur: 4.0 },
  { angle: 160, r: 100, pSize: 2, delay: 2.7, dur: 5.8 },
]

export function BabyVisual({ weekNumber, size = 240 }: BabyVisualProps) {
  const s = size / BASE
  const progress = useMotionValue(computeProgress(weekNumber))
  const scale = useSpring(progress, { stiffness: 120, damping: 18 })

  useEffect(() => {
    progress.set(computeProgress(weekNumber))
  }, [weekNumber, progress])

  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size, scale }}
    >
      {/* Diffuse outer glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: 224 * s,
          height: 224 * s,
          background: 'radial-gradient(circle, rgba(201,160,50,0.14) 0%, rgba(232,168,152,0.07) 45%, transparent 70%)',
          filter: 'blur(28px)',
        }}
      />

      {/* Ring 1 */}
      <div
        className="absolute rounded-full"
        style={{
          width: 196 * s,
          height: 196 * s,
          border: '1px solid rgba(201,160,50,0.1)',
          boxShadow: '0 0 28px rgba(201,160,50,0.07)',
        }}
      />

      {/* Ring 2 */}
      <div
        className="absolute rounded-full"
        style={{
          width: 156 * s,
          height: 156 * s,
          border: '1px solid rgba(201,160,50,0.2)',
          boxShadow: '0 0 18px rgba(201,160,50,0.09), inset 0 0 10px rgba(201,160,50,0.04)',
        }}
      />

      {/* Ring 3 */}
      <div
        className="absolute rounded-full"
        style={{
          width: 114 * s,
          height: 114 * s,
          border: '1px solid rgba(201,160,50,0.38)',
          boxShadow: '0 0 14px rgba(201,160,50,0.18)',
        }}
      />

      {/* Core sphere */}
      <div
        className="absolute rounded-full heartbeat"
        style={{
          width: 74 * s,
          height: 74 * s,
          background: [
            'radial-gradient(',
            'circle at 36% 28%,',
            'rgba(248,228,212,0.96) 0%,',
            'rgba(232,168,152,0.88) 28%,',
            'rgba(210,138,118,0.82) 58%,',
            'rgba(175,105,88,0.75) 85%,',
            'rgba(145,80,65,0.70) 100%)',
          ].join(' '),
          boxShadow: [
            '0 0 20px rgba(201,160,50,0.55)',
            '0 0 40px rgba(232,168,152,0.28)',
            '0 0 64px rgba(201,160,50,0.12)',
          ].join(', '),
        }}
      />

      {/* Ambient particles */}
      {PARTICLES_BASE.map(({ angle, r, pSize, delay, dur }, i) => {
        const scaledR = r * s
        const x = Math.cos((angle * Math.PI) / 180) * scaledR
        const y = Math.sin((angle * Math.PI) / 180) * scaledR
        return (
          <div
            key={i}
            className="baby-particle"
            style={{
              width: `${pSize}px`,
              height: `${pSize}px`,
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              background: pSize === 3 ? 'var(--gold-light)' : 'var(--gold)',
              animationDelay: `${delay}s`,
              animationDuration: `${dur}s`,
            }}
          />
        )
      })}
    </motion.div>
  )
}
