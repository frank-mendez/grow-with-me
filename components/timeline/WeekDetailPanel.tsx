'use client'
import { motion } from 'framer-motion'
import type { PregnancyWeek } from '@/types/database'
import { BabyVisual } from './BabyVisual'

interface WeekDetailPanelProps {
  week: PregnancyWeek
  isCurrent: boolean
}

// Simple botanical leaf rendered inline as SVG — no external assets needed
function LeafAccent({
  style,
  flip,
}: {
  style?: React.CSSProperties
  flip?: boolean
}) {
  return (
    <svg
      viewBox="0 0 72 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        transform: flip ? 'scaleX(-1)' : undefined,
        ...style,
      }}
    >
      {/* Leaf body */}
      <path
        d="M36 106 C22 84 4 56 7 28 C10 4 36 6 36 6 C36 6 62 4 65 28 C68 56 50 84 36 106Z"
        fill="var(--forest-light)"
        fillOpacity={0.7}
        stroke="rgba(201,160,50,0.18)"
        strokeWidth="0.6"
      />
      {/* Central vein */}
      <path
        d="M36 106 C36 72 36 34 36 6"
        stroke="rgba(201,160,50,0.28)"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      {/* Side veins — left */}
      <path d="M36 38 C28 32 14 30 9 28"  stroke="rgba(201,160,50,0.12)" strokeWidth="0.5" strokeLinecap="round"/>
      <path d="M36 54 C26 48 11 47 7 44"  stroke="rgba(201,160,50,0.12)" strokeWidth="0.5" strokeLinecap="round"/>
      <path d="M36 70 C28 65 14 64 9 62"  stroke="rgba(201,160,50,0.10)" strokeWidth="0.5" strokeLinecap="round"/>
      {/* Side veins — right */}
      <path d="M36 38 C44 32 58 31 63 29" stroke="rgba(201,160,50,0.12)" strokeWidth="0.5" strokeLinecap="round"/>
      <path d="M36 54 C46 48 61 47 65 45" stroke="rgba(201,160,50,0.12)" strokeWidth="0.5" strokeLinecap="round"/>
      <path d="M36 70 C44 65 58 64 63 62" stroke="rgba(201,160,50,0.10)" strokeWidth="0.5" strokeLinecap="round"/>
    </svg>
  )
}

export function WeekDetailPanel({ week, isCurrent }: WeekDetailPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="relative flex flex-col items-center gap-8 py-10 overflow-hidden"
    >
      {/* Ambient background warmth — radial glow behind the sphere */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 420,
          height: 320,
          background: [
            'radial-gradient(',
            'circle at 50% 40%,',
            'rgba(232,168,152,0.07) 0%,',
            'rgba(201,160,50,0.05) 30%,',
            'transparent 65%)',
          ].join(' '),
          filter: 'blur(20px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Botanical leaf — top-left */}
      <LeafAccent
        style={{
          top: -8,
          left: -20,
          width: 56,
          opacity: 0.6,
          rotate: '-28deg',
          zIndex: 0,
        }}
      />

      {/* Botanical leaf — bottom-right, larger, flipped */}
      <LeafAccent
        flip
        style={{
          bottom: 16,
          right: -16,
          width: 72,
          opacity: 0.5,
          rotate: '22deg',
          zIndex: 0,
        }}
      />

      {/* Baby visual */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <BabyVisual weekNumber={week.week_number} />
      </div>

      {/* Text content */}
      <div className="text-center" style={{ position: 'relative', zIndex: 1, maxWidth: 320 }}>
        {/* Eyebrow */}
        <p
          className="text-[10px] tracking-[0.22em] uppercase mb-4"
          style={{ color: isCurrent ? 'var(--gold)' : 'var(--cream-dim)' }}
        >
          {isCurrent ? '✦ Your current week ✦' : `Week ${week.week_number}`}
        </p>

        {/* Title */}
        <h2
          className="font-light leading-tight mb-5"
          style={{
            fontFamily: 'var(--font-cormorant)',
            color: 'var(--cream)',
            fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
          }}
        >
          {week.title ?? `Week ${week.week_number}`}
        </h2>

        {/* Description */}
        {week.description && (
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--cream-dim)', opacity: 0.8, letterSpacing: '0.01em' }}
          >
            {week.description}
          </p>
        )}
      </div>
    </motion.div>
  )
}
