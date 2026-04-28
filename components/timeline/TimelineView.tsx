'use client'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { PregnancyWeek } from '@/types/database'
import { Container } from '@/components/ui/container'
import { Header } from '@/components/ui/header'
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
      {/* Page-level warm atmosphere — visible behind both strip and detail */}
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
      <Container className="pt-6" style={{ position: 'relative', zIndex: 1 }}>
        <Header eyebrow="Your journey" title="Timeline" />
      </Container>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <WeekCardStrip
          weeks={weeks}
          selectedWeek={selectedWeek}
          initialWeek={firstAvailableWeek}
          currentWeek={currentWeek}
          onSelect={setSelectedWeek}
        />
      </div>

      <Container style={{ position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">
          {selected && (
            <WeekDetailPanel
              key={selected.id}
              week={selected}
              isCurrent={selected.week_number === currentWeek}
            />
          )}
        </AnimatePresence>
      </Container>
    </div>
  )
}
