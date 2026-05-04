'use client'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { PregnancyWeek } from '@/types/database'
import { Container } from '@/components/ui/container'
import { WeekCardStrip } from './WeekCardStrip'
import { WeekDetailPanel } from './WeekDetailPanel'

interface TimelineViewProps {
  weeks: PregnancyWeek[]
  initialWeek: number
  currentWeek: number | null
}

export function TimelineView({ weeks, initialWeek, currentWeek }: Readonly<TimelineViewProps>) {
  const firstAvailableWeek = weeks.find((w) => w.week_number === initialWeek)?.week_number ?? weeks[0]?.week_number ?? initialWeek
  const [selectedWeek, setSelectedWeek] = useState(firstAvailableWeek)
  const selected = weeks.find((w) => w.week_number === selectedWeek) ?? weeks[0]

  return (
    <div className="fade-up" style={{ position: 'relative' }}>
      {/* Page-level warm atmosphere */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse 80% 50% at 50% 70%, rgba(201,160,50,0.04) 0%, transparent 60%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Header section */}
      <Container className="pt-6 pb-2" style={{ position: 'relative', zIndex: 1 }}>
        <p
          className="text-xs tracking-widest uppercase mb-1"
          style={{ color: 'var(--gold)' }}
        >
          Your journey
        </p>
        <h1
          className="font-light mb-1"
          style={{
            fontFamily: 'var(--font-cormorant)',
            color: 'var(--cream)',
            fontSize: 'clamp(2rem, 6vw, 2.75rem)',
            lineHeight: 1.1,
          }}
        >
          Timeline
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--cream-dim)', opacity: 0.75, letterSpacing: '0.01em' }}>
          Every week, a new miracle.
        </p>
      </Container>

      {/* Week card strip */}
      <div style={{ position: 'relative', zIndex: 1, marginTop: 16 }}>
        <WeekCardStrip
          weeks={weeks}
          selectedWeek={selectedWeek}
          initialWeek={firstAvailableWeek}
          currentWeek={currentWeek}
          onSelect={setSelectedWeek}
        />
      </div>

      {/* Detail panel — wider than Container to allow two-column layout */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 900,
          margin: '0 auto',
          padding: '0 16px',
        }}
      >
        <AnimatePresence mode="wait">
          {selected && (
            <WeekDetailPanel
              key={selected.id}
              week={selected}
              isCurrent={selected.week_number === currentWeek}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
