'use client'
import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { PregnancyWeek } from '@/types/database'
import { WeekCard } from './WeekCard'

interface WeekCardStripProps {
  weeks: PregnancyWeek[]
  selectedWeek: number
  initialWeek: number
  currentWeek: number | null
  onSelect: (weekNumber: number) => void
}

export function WeekCardStrip({
  weeks,
  selectedWeek,
  initialWeek,
  currentWeek,
  onSelect,
}: Readonly<WeekCardStripProps>) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const card = container.querySelector<HTMLElement>(`[data-week="${selectedWeek}"]`)
    const behavior = selectedWeek === initialWeek ? 'instant' : 'smooth'
    card?.scrollIntoView?.({ behavior, inline: 'center', block: 'nearest' })
  }, [selectedWeek, initialWeek])

  const currentIndex = weeks.findIndex((w) => w.week_number === selectedWeek)
  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < weeks.length - 1

  const navBase: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'rgba(11,26,20,0.88)',
    border: '1px solid rgba(201,160,50,0.28)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    zIndex: 2,
    cursor: 'pointer',
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Left arrow */}
      <motion.button
        onClick={() => canGoPrev && onSelect(weeks[currentIndex - 1].week_number)}
        whileTap={{ scale: 0.86 }}
        aria-label="Previous week"
        style={{
          ...navBase,
          left: 10,
          opacity: canGoPrev ? 1 : 0.22,
          color: canGoPrev ? 'var(--cream)' : 'var(--cream-dim)',
        }}
      >
        ‹
      </motion.button>

      {/* Scrollable card strip */}
      <div
        ref={containerRef}
        className="no-scrollbar flex gap-3 py-4"
        style={{
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          paddingLeft: 'calc(50% - 44px)',
          paddingRight: 'calc(50% - 44px)',
        }}
      >
        {weeks.map((week) => (
          <div
            key={week.id}
            data-week={week.week_number}
            style={{ scrollSnapAlign: 'center', flexShrink: 0, width: 88, height: 120 }}
          >
            <WeekCard
              week={week}
              isSelected={week.week_number === selectedWeek}
              isCurrent={week.week_number === currentWeek}
              onClick={() => onSelect(week.week_number)}
            />
          </div>
        ))}
      </div>

      {/* Right arrow */}
      <motion.button
        onClick={() => canGoNext && onSelect(weeks[currentIndex + 1].week_number)}
        whileTap={{ scale: 0.86 }}
        aria-label="Next week"
        style={{
          ...navBase,
          right: 10,
          opacity: canGoNext ? 1 : 0.22,
          color: canGoNext ? 'var(--cream)' : 'var(--cream-dim)',
        }}
      >
        ›
      </motion.button>
    </div>
  )
}
