'use client'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect } from 'react'
import { computeProgress } from '@/lib/pregnancy'

interface BabyVisualProps {
  weekNumber: number
}

// Polar positions (angle in degrees, radius in px) for 8 ambient particles
const PARTICLES = [
  { angle: 18,  r: 118, size: 2, delay: 0.0, dur: 4.2 },
  { angle: 72,  r: 108, size: 3, delay: 0.9, dur: 5.1 },
  { angle: 128, r: 122, size: 2, delay: 1.7, dur: 4.8 },
  { angle: 183, r: 112, size: 2, delay: 0.4, dur: 6.0 },
  { angle: 241, r: 118, size: 3, delay: 2.3, dur: 4.3 },
  { angle: 294, r: 106, size: 2, delay: 1.1, dur: 5.5 },
  { angle:  51, r:  96, size: 2, delay: 3.2, dur: 4.0 },
  { angle: 160, r: 100, size: 2, delay: 2.7, dur: 5.8 },
]

export function BabyVisual({ weekNumber }: BabyVisualProps) {
  const progress = useMotionValue(computeProgress(weekNumber))
  const scale = useSpring(progress, { stiffness: 120, damping: 18 })

  useEffect(() => {
    progress.set(computeProgress(weekNumber))
  }, [weekNumber, progress])

  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width: 240, height: 240, scale }}
    >
      {/* Diffuse outer glow — blurred, very low opacity */}
      <div
        className="absolute rounded-full"
        style={{
          width: 224,
          height: 224,
          background: 'radial-gradient(circle, rgba(201,160,50,0.14) 0%, rgba(232,168,152,0.07) 45%, transparent 70%)',
          filter: 'blur(28px)',
        }}
      />

      {/* Ring 1 — far outer, barely visible */}
      <div
        className="absolute rounded-full"
        style={{
          width: 196,
          height: 196,
          border: '1px solid rgba(201,160,50,0.1)',
          boxShadow: '0 0 28px rgba(201,160,50,0.07)',
        }}
      />

      {/* Ring 2 — mid */}
      <div
        className="absolute rounded-full"
        style={{
          width: 156,
          height: 156,
          border: '1px solid rgba(201,160,50,0.2)',
          boxShadow: '0 0 18px rgba(201,160,50,0.09), inset 0 0 10px rgba(201,160,50,0.04)',
        }}
      />

      {/* Ring 3 — inner, more defined */}
      <div
        className="absolute rounded-full"
        style={{
          width: 114,
          height: 114,
          border: '1px solid rgba(201,160,50,0.38)',
          boxShadow: '0 0 14px rgba(201,160,50,0.18)',
        }}
      />

      {/* Core sphere — warm organic gradient; highlight at top-left for 3-D depth */}
      <div
        className="absolute rounded-full heartbeat"
        style={{
          width: 74,
          height: 74,
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

      {/* Ambient particles — rise and fade around the sphere */}
      {PARTICLES.map(({ angle, r, size, delay, dur }, i) => {
        const x = Math.cos((angle * Math.PI) / 180) * r
        const y = Math.sin((angle * Math.PI) / 180) * r
        return (
          <div
            key={i}
            className="baby-particle"
            style={{
              width: size,
              height: size,
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              background: size === 3 ? 'var(--gold-light)' : 'var(--gold)',
              animationDelay: `${delay}s`,
              animationDuration: `${dur}s`,
            }}
          />
        )
      })}
    </motion.div>
  )
}
