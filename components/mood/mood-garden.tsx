'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { isoDate, isoDateOffset } from '@/lib/date'
import type { Mood, MoodEntry } from '@/types/database'

interface MoodGardenProps {
  userId: string
}

const MOOD_OPTIONS: { value: Mood; emoji: string; label: string }[] = [
  { value: 'HAPPY',    emoji: '😊', label: 'Happy'   },
  { value: 'NEUTRAL',  emoji: '😌', label: 'Neutral'  },
  { value: 'STRESSED', emoji: '😟', label: 'Stressed' },
  { value: 'SAD',      emoji: '😢', label: 'Sad'      },
]

const GARDEN_GLYPHS: Record<Mood, string> = {
  HAPPY:    '🌸',
  NEUTRAL:  '🌿',
  STRESSED: '🍂',
  SAD:      '🌧',
}

function PlantCell({ entry, isNew }: { entry: MoodEntry | null; isNew: boolean }) {
  const glyph = entry ? GARDEN_GLYPHS[entry.mood] : null

  if (!glyph) {
    return (
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'rgba(201,160,50,0.04)',
          border: '1px dashed rgba(201,160,50,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 10, color: 'rgba(201,160,50,0.25)' }}>·</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={isNew ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: 'rgba(201,160,50,0.06)',
        border: '1px solid rgba(201,160,50,0.14)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* HAPPY: slow bloom pulse */}
      {entry!.mood === 'HAPPY' && (
        <motion.div
          animate={{ scale: [1, 1.55, 1], opacity: [0.18, 0, 0.18] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 10,
            background: 'rgba(232,168,152,0.35)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* SAD: gentle shimmer wash */}
      {entry!.mood === 'SAD' && (
        <motion.div
          animate={{ opacity: [0, 0.22, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 10,
            background: 'linear-gradient(180deg, rgba(120,160,220,0.3) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />
      )}

      <span style={{ fontSize: 20, position: 'relative', zIndex: 1 }}>{glyph}</span>
    </motion.div>
  )
}

export function MoodGarden({ userId }: Readonly<MoodGardenProps>) {
  const supabase = useMemo(() => createClient(), [])

  const [todayMood, setTodayMood] = useState<Mood | null>(null)
  const [history, setHistory]     = useState<(MoodEntry | null)[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchFailed, setFetchFailed] = useState(false)
  const [isSaving, setIsSaving]   = useState(false)
  // Tracks the saved row ID only for the first entry of the day, to trigger the bloom animation.
  const [newEntryId, setNewEntryId] = useState<string | null>(null)
  // Anchors all date arithmetic to the day the data was loaded, so display
  // stays consistent if the panel remains open past midnight.
  const [loadDate, setLoadDate] = useState(() => isoDate())
  const isSavingRef = useRef(false)
  const mountedRef  = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    let active = true

    async function load() {
      const today = isoDate()
      setLoadDate(today)
      setFetchFailed(false)
      setIsLoading(true)
      setTodayMood(null)
      setHistory(Array.from({ length: 6 }, () => null))
      setNewEntryId(null)
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('date', isoDateOffset(today, 6))
        .order('date', { ascending: false })

      if (!active) return

      if (error) {
        setFetchFailed(true)
        setIsLoading(false)
        return
      }

      const entries = (data ?? []) as MoodEntry[]
      const todayEntry = entries.find((e) => e.date === today)
      setTodayMood(todayEntry?.mood ?? null)

      const byDate = new Map(entries.filter((e) => e.date !== today).map((e) => [e.date, e]))
      // Build oldest→newest (left to right), anchored to the captured `today`
      // so all arithmetic stays consistent if midnight passes mid-load.
      setHistory(
        Array.from({ length: 6 }, (_, i) => byDate.get(isoDateOffset(today, 6 - i)) ?? null),
      )
      setIsLoading(false)
    }

    load()
    return () => { active = false }
  }, [userId, supabase])

  async function handleMoodSelect(mood: Mood) {
    // Ref-based guard is synchronous — prevents the race condition where two rapid
    // taps both pass the check before the first setState(true) re-render fires.
    if (isSavingRef.current) return
    isSavingRef.current = true

    const today = isoDate()
    const dayChanged = today !== loadDate
    if (dayChanged) {
      // Calendar day rolled over while the panel was open. Shift the existing
      // history forward by one slot so previously loaded data is preserved:
      // yesterday's today-mood moves into the last history slot, and each
      // prior day slides one position earlier. Only the oldest day falls off.
      const yesterdayEntry: MoodEntry | null =
        todayMood !== null
          ? { id: 'rolled-over', user_id: userId, date: loadDate, mood: todayMood }
          : null
      setHistory((prev) => [...prev.slice(1), yesterdayEntry])
      setLoadDate(today)
      setTodayMood(null)
      setNewEntryId(null)
    }

    const wasFirstEntry = dayChanged || todayMood === null
    const previousMood  = dayChanged ? null : todayMood

    setNewEntryId(null)  // reset so re-selecting doesn't re-trigger the bloom animation
    setTodayMood(mood)   // optimistic
    setIsSaving(true)

    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .upsert(
          { user_id: userId, date: today, mood },
          { onConflict: 'user_id,date' },
        )
        .select()
        .single()

      if (!mountedRef.current) return

      if (error) {
        setTodayMood(previousMood)  // roll back optimistic update
        return
      }

      // Only animate on the very first check-in of the day, not on mood changes.
      if (wasFirstEntry && data) {
        setNewEntryId((data as MoodEntry).id)
      }
    } finally {
      // Always release the guard, even if the Supabase call throws unexpectedly.
      isSavingRef.current = false
      if (mountedRef.current) setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div
        style={{
          padding: '1.25rem 1.5rem',
          background: 'rgba(14,32,22,0.75)',
          border: '1px solid rgba(201,160,50,0.14)',
          borderRadius: 16,
          minHeight: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          animate={{ opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            width: 80,
            height: 12,
            borderRadius: 6,
            background: 'rgba(201,160,50,0.07)',
            border: '1px solid rgba(201,160,50,0.12)',
          }}
        />
      </div>
    )
  }

  const hasAnyHistory = history.some(Boolean)

  const todayEntry: MoodEntry | null = todayMood !== null
    ? { id: newEntryId ?? 'today-optimistic', user_id: userId, date: loadDate, mood: todayMood }
    : null

  return (
    <div
      style={{
        padding: '1.25rem 1.5rem',
        background: 'rgba(14,32,22,0.75)',
        border: '1px solid rgba(201,160,50,0.14)',
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(201,160,50,0.1)',
            border: '1px solid rgba(201,160,50,0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '15px' }}>🌱</span>
        </div>
        <div>
          <p
            style={{
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: 2,
            }}
          >
            Mood Garden
          </p>
          <p style={{ fontSize: '12px', color: 'var(--cream-dim)', opacity: 0.65 }}>
            How are you feeling today?
          </p>
        </div>
      </div>

      {fetchFailed ? (
        <p style={{ fontSize: '13px', color: 'rgba(220,100,100,0.85)', lineHeight: 1.55 }}>
          Could not load your garden. Please refresh.
        </p>
      ) : (
        <>
          {/* Mood selector */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {MOOD_OPTIONS.map(({ value, emoji, label }) => {
              const isSelected = todayMood === value
              return (
                <motion.button
                  key={value}
                  type="button"
                  onClick={() => handleMoodSelect(value)}
                  whileTap={{ scale: 0.93 }}
                  disabled={isSaving}
                  style={{
                    flex: '1 1 0',
                    minWidth: 60,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 5,
                    padding: '10px 6px',
                    borderRadius: 12,
                    border: isSelected
                      ? '1.5px solid rgba(201,160,50,0.55)'
                      : '1px solid rgba(201,160,50,0.14)',
                    background: isSelected
                      ? 'rgba(201,160,50,0.12)'
                      : 'rgba(14,32,22,0.5)',
                    cursor: isSaving ? 'default' : 'pointer',
                    transition: 'background 0.18s, border-color 0.18s',
                    userSelect: 'none',
                  }}
                  aria-label={label}
                  aria-pressed={isSelected}
                >
                  <motion.span
                    animate={isSelected ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    style={{ fontSize: 22, lineHeight: 1 }}
                  >
                    {emoji}
                  </motion.span>
                  <span
                    style={{
                      fontSize: '10px',
                      color: isSelected ? 'var(--gold)' : 'var(--cream-dim)',
                      opacity: isSelected ? 1 : 0.55,
                      letterSpacing: '0.04em',
                      transition: 'color 0.18s, opacity 0.18s',
                    }}
                  >
                    {label}
                  </span>
                </motion.button>
              )
            })}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(201,160,50,0.1)' }} />

          {/* Garden */}
          <div>
            <p
              style={{
                fontSize: '10px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                opacity: 0.7,
                marginBottom: 12,
              }}
            >
              Your garden
            </p>

            <AnimatePresence mode="wait">
              {!hasAnyHistory && !todayMood ? (
                <motion.p
                  key="empty"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    fontSize: '13px',
                    color: 'var(--cream-dim)',
                    opacity: 0.55,
                    lineHeight: 1.6,
                  }}
                >
                  Your garden will grow as you check in 🌱
                </motion.p>
              ) : (
                <motion.div
                  key="garden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Past 6 days, oldest → newest */}
                  {history.map((entry, i) => (
                    <PlantCell
                      key={entry ? entry.id : `empty-${i}`}
                      entry={entry}
                      isNew={false}
                    />
                  ))}

                  {/* Today — always shown so the row is a stable 7-cell grid */}
                  <PlantCell
                    key={`today-${todayEntry?.id ?? 'placeholder'}`}
                    entry={todayEntry}
                    isNew={newEntryId !== null}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  )
}
