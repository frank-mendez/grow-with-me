'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { KickLog } from '@/types/database'

interface KickPlayProps {
  userId: string
}

type Particle = { id: number; angle: number }

const PARTICLE_COUNT = 6
const DEBOUNCE_MS = 900

function getProgressMessage(count: number): string {
  if (count === 0) return "Waiting for baby's first kick today 💛"
  if (count <= 5) return 'Baby is waking up ✨'
  if (count <= 10) return 'Nice and active today 💪'
  return 'Lots of movement today!'
}

// Computes the local-time ISO date string for today or N days ago.
// Called at write time so taps always go to the current day, even across midnight.
function isoDate(daysAgo = 0): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDay(iso: string): string {
  const [y, m, day] = iso.split('-').map(Number)
  return new Date(y, m - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function KickPlay({ userId }: Readonly<KickPlayProps>) {
  const supabase = useMemo(() => createClient(), [])

  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchFailed, setFetchFailed] = useState(false)
  const [history, setHistory] = useState<KickLog[]>([])
  const [particles, setParticles] = useState<Particle[]>([])

  const pendingCountRef = useRef<number | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const particleIdRef = useRef(0)
  const mountedRef = useRef(true)

  useEffect(() => () => { mountedRef.current = false }, [])

  useEffect(() => {
    let active = true

    async function load() {
      const loadDate = isoDate()

      const { data, error } = await supabase
        .from('kick_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', isoDate(6))
        .order('date', { ascending: false })

      if (!active) return

      if (error) {
        setFetchFailed(true)
        setIsLoading(false)
        return
      }

      const logs = (data ?? []) as KickLog[]
      const todayLog = logs.find((l) => l.date === loadDate)
      setCount(todayLog?.count ?? 0)

      // Fill the last 5 calendar days, using 0 for any day without a logged row.
      const logsByDate = new Map(
        logs.filter((l) => l.date !== loadDate).map((l) => [l.date, l]),
      )
      setHistory(
        Array.from({ length: 5 }, (_, i) => {
          const date = isoDate(i + 1)
          return logsByDate.get(date) ?? { id: date, user_id: userId, date, count: 0 }
        }),
      )
      setIsLoading(false)
    }

    load()
    return () => { active = false }
  }, [userId, supabase])

  // Fire-and-forget flush on unmount for any unwritten pending count.
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      if (pendingCountRef.current !== null) {
        supabase
          .from('kick_logs')
          .upsert(
            { user_id: userId, date: isoDate(), count: pendingCountRef.current },
            { onConflict: 'user_id,date' },
          )
      }
    }
  }, [supabase, userId])

  function handleTap() {
    if (isLoading || fetchFailed) return

    setCount((prev) => {
      const next = prev + 1
      pendingCountRef.current = next
      return next
    })

    setParticles((prev) => [
      ...prev,
      ...Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: particleIdRef.current++,
        angle: (i / PARTICLE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.5,
      })),
    ])

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(async () => {
      if (pendingCountRef.current !== null) {
        const n = pendingCountRef.current
        const { error } = await supabase
          .from('kick_logs')
          .upsert(
            { user_id: userId, date: isoDate(), count: n },
            { onConflict: 'user_id,date' },
          )
        // Only clear pending if no new taps arrived during the write and the write succeeded.
        // On error, leave pendingCountRef so the next debounce or unmount flush retries.
        if (!error && pendingCountRef.current === n) {
          pendingCountRef.current = null
        }
      }
    }, DEBOUNCE_MS)
  }

  if (isLoading) {
    return (
      <div
        style={{
          padding: '1.25rem 1.5rem',
          background: 'rgba(14,32,22,0.75)',
          border: '1px solid rgba(201,160,50,0.14)',
          borderRadius: 16,
          minHeight: 180,
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
            height: 80,
            borderRadius: '50%',
            background: 'rgba(201,160,50,0.07)',
            border: '1px solid rgba(201,160,50,0.12)',
          }}
        />
      </div>
    )
  }

  const progressMessage = getProgressMessage(count)
  const showHistory = history.some((d) => d.count > 0)

  return (
    <div
      style={{
        padding: '1.25rem 1.5rem',
        background: 'rgba(14,32,22,0.75)',
        border: '1px solid rgba(201,160,50,0.14)',
        borderRadius: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
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
          <span style={{ fontSize: '15px' }}>👣</span>
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
            Kick Play
          </p>
          <p style={{ fontSize: '12px', color: 'var(--cream-dim)', opacity: 0.65 }}>
            Tap when you feel a kick
          </p>
        </div>
      </div>

      {fetchFailed ? (
        <p style={{ fontSize: '13px', color: 'rgba(220,100,100,0.85)', lineHeight: 1.55 }}>
          Could not load kick data. Please refresh.
        </p>
      ) : (
        <>
          {/* Tap zone */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
              paddingBottom: 8,
            }}
          >
            <div style={{ position: 'relative' }}>
              {/* Burst particles */}
              <AnimatePresence>
                {particles.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ x: 0, y: 0, opacity: 0.9, scale: 1 }}
                    animate={{
                      x: Math.cos(p.angle) * 62,
                      y: Math.sin(p.angle) * 62,
                      opacity: 0,
                      scale: 0.2,
                    }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    onAnimationComplete={() => {
                      if (mountedRef.current) {
                        setParticles((prev) => prev.filter((q) => q.id !== p.id))
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: -3.5,
                      marginLeft: -3.5,
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: 'var(--gold-light)',
                      pointerEvents: 'none',
                      zIndex: 2,
                    }}
                  />
                ))}
              </AnimatePresence>

              {/* Tap button */}
              <motion.button
                onClick={handleTap}
                whileTap={{ scale: 0.91 }}
                style={{
                  width: 148,
                  height: 148,
                  borderRadius: '50%',
                  background: 'rgba(201,160,50,0.07)',
                  border: '1.5px solid rgba(201,160,50,0.28)',
                  boxShadow:
                    '0 0 28px rgba(201,160,50,0.07), inset 0 0 20px rgba(201,160,50,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                  position: 'relative',
                  zIndex: 1,
                }}
                aria-label={`Log a kick. ${count} kick${count === 1 ? '' : 's'} today.`}
              >
                <motion.span
                  key={count}
                  initial={{ scale: 1.18, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: '3.75rem',
                    color: 'var(--cream)',
                    fontWeight: 300,
                    lineHeight: 1,
                    display: 'block',
                  }}
                >
                  {count}
                </motion.span>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--cream-dim)',
                    opacity: 0.65,
                    marginTop: 4,
                  }}
                >
                  kicks today
                </span>
              </motion.button>
            </div>

            {/* Progress message */}
            <AnimatePresence mode="wait">
              <motion.p
                key={progressMessage}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                style={{ fontSize: '13px', color: 'var(--cream-dim)', textAlign: 'center' }}
              >
                {progressMessage}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* History — only shown once at least one prior day has kicks */}
          {showHistory && (
            <>
              <div style={{ height: 1, background: 'rgba(201,160,50,0.1)', margin: '16px 0' }} />
              <p
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--gold)',
                  opacity: 0.7,
                  marginBottom: 10,
                }}
              >
                Recent days
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {history.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: 'var(--cream-dim)', opacity: 0.55 }}>
                      {formatDay(log.date)}
                    </span>
                    <span
                      style={{
                        fontSize: '13px',
                        color: 'var(--cream)',
                        fontFamily: 'var(--font-cormorant)',
                        fontWeight: 400,
                      }}
                    >
                      {log.count} kick{log.count === 1 ? '' : 's'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
