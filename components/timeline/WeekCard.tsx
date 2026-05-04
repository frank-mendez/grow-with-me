'use client'
import { motion } from 'framer-motion'
import type { PregnancyWeek } from '@/types/database'
import { BABY_SIZE_EMOJI } from '@/lib/sizeEmoji'

interface WeekCardProps {
  week: PregnancyWeek
  isSelected: boolean
  isCurrent: boolean
  onClick: () => void
}

function cardBorder(isSelected: boolean, isCurrent: boolean): string {
  if (isSelected) return '1px solid rgba(201,160,50,0.55)'
  if (isCurrent)  return '1px solid rgba(201,160,50,0.25)'
  return '1px solid rgba(201,160,50,0.08)'
}

export function WeekCard({ week, isSelected, isCurrent, onClick }: Readonly<WeekCardProps>) {
  const emoji = week.baby_size ? (BABY_SIZE_EMOJI[week.baby_size] ?? '🌿') : '🌿'

  return (
    <motion.button
      type="button"
      onClick={onClick}
      animate={{
        scale: isSelected ? 1 : 0.9,
        opacity: isSelected ? 1 : 0.6,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      whileTap={{ scale: 0.93 }}
      className="flex flex-col items-center w-full h-full p-0"
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        gap: 4,
      }}
      aria-label={`Week ${week.week_number}${isCurrent ? ', current week' : ''}`}
      aria-pressed={isSelected}
    >
      {/* Visual card box */}
      <div
        className="flex flex-col items-center justify-center gap-1 rounded-2xl w-full"
        style={{
          flex: 1,
          background: isSelected ? 'var(--forest-light)' : 'var(--forest-mid)',
          border: cardBorder(isSelected, isCurrent),
          boxShadow: isSelected
            ? '0 0 14px rgba(201,160,50,0.22), inset 0 0 8px rgba(201,160,50,0.06)'
            : 'none',
          padding: '10px 6px',
        }}
      >
        <span
          className="text-2xl font-light tabular-nums leading-none"
          style={{
            fontFamily: 'var(--font-cormorant)',
            color: isSelected ? 'var(--gold)' : 'var(--cream-dim)',
          }}
        >
          {week.week_number}
        </span>

        <span className="text-base leading-none" role="img" aria-hidden="true">
          {emoji}
        </span>

        {isCurrent && (
          <span
            className="text-[9px] tracking-widest uppercase"
            style={{ color: 'var(--gold)' }}
          >
            now
          </span>
        )}
      </div>

      {/* Week label below the box */}
      <span
        style={{
          fontSize: '9px',
          letterSpacing: '0.03em',
          color: isSelected ? 'var(--gold)' : 'var(--cream-dim)',
          opacity: isSelected ? 1 : 0.7,
          lineHeight: 1,
        }}
      >
        Week {week.week_number}
      </span>
    </motion.button>
  )
}
