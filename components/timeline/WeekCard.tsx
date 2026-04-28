'use client'
import { motion } from 'framer-motion'
import type { PregnancyWeek } from '@/types/database'

// Fruit/size emoji per pregnancy week — mirrors the classic size-comparison concept
const WEEK_EMOJI: Record<number, string> = {
  1:  '🌱', 2:  '🌱', 3:  '🫘', 4:  '🫐',
  5:  '🫘', 6:  '🫛', 7:  '🍇', 8:  '🍓',
  9:  '🍒', 10: '🍓', 11: '🍋', 12: '🍋',
  13: '🍑', 14: '🍋', 15: '🍎', 16: '🥑',
  17: '🍐', 18: '🍠', 19: '🥭', 20: '🍌',
  21: '🥕', 22: '🌽', 23: '🥥', 24: '🌽',
  25: '🥬', 26: '🥒', 27: '🥦', 28: '🍆',
  29: '🎃', 30: '🥬', 31: '🍍', 32: '🍍',
  33: '🥬', 34: '🥬', 35: '🍈', 36: '🥬',
  37: '🎃', 38: '🎃', 39: '🎃', 40: '🎃',
}

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
  const emoji = WEEK_EMOJI[week.week_number] ?? '🌿'

  return (
    <motion.button
      onClick={onClick}
      animate={{
        scale: isSelected ? 1 : 0.9,
        opacity: isSelected ? 1 : 0.6,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      whileTap={{ scale: 0.93 }}
      className="flex flex-col items-center justify-center gap-1 rounded-2xl p-3 w-full h-full"
      style={{
        background: isSelected ? 'var(--forest-light)' : 'var(--forest-mid)',
        border: cardBorder(isSelected, isCurrent),
        boxShadow: isSelected
          ? '0 0 14px rgba(201,160,50,0.22), inset 0 0 8px rgba(201,160,50,0.06)'
          : 'none',
        cursor: 'pointer',
      }}
      aria-label={`Week ${week.week_number}${isCurrent ? ', current week' : ''}`}
      aria-pressed={isSelected}
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
    </motion.button>
  )
}
