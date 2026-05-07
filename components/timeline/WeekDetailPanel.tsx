'use client'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import type { PregnancyWeek } from '@/types/database'
import { TalkToBaby } from './TalkToBaby'
import { KickPlay } from './KickPlay'
import { MoodGarden } from '@/components/mood/mood-garden'

const BabyVisual = dynamic(
  () => import('./BabyVisual').then((m) => ({ default: m.BabyVisual })),
  {
    ssr: false,
    loading: () => <div style={{ width: 300, height: 300 }} />,
  },
)

interface WeekDetailPanelProps {
  week: PregnancyWeek
  isCurrent: boolean
  userId: string | null
}

function LeafBranch({ style, flip }: Readonly<{ style?: React.CSSProperties; flip?: boolean }>) {
  return (
    <svg
      viewBox="0 0 140 200"
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
      {/* Main stem */}
      <path d="M70 195 C70 140 65 90 50 40" stroke="rgba(201,160,50,0.2)" strokeWidth="1.2" strokeLinecap="round" />
      {/* Large leaf left */}
      <path d="M50 40 C30 20 5 18 8 42 C12 62 38 66 50 40Z" fill="var(--forest-light)" fillOpacity="0.75" stroke="rgba(201,160,50,0.15)" strokeWidth="0.7" />
      <path d="M50 40 C36 50 22 52 8 42" stroke="rgba(201,160,50,0.15)" strokeWidth="0.5" strokeLinecap="round" />
      {/* Smaller leaf right */}
      <path d="M60 80 C82 62 105 65 100 82 C95 98 70 96 60 80Z" fill="var(--forest-light)" fillOpacity="0.65" stroke="rgba(201,160,50,0.12)" strokeWidth="0.6" />
      <path d="M60 80 C74 84 88 84 100 82" stroke="rgba(201,160,50,0.1)" strokeWidth="0.5" strokeLinecap="round" />
      {/* Tiny leaf */}
      <path d="M65 120 C48 108 38 115 44 126 C50 136 65 130 65 120Z" fill="var(--forest-light)" fillOpacity="0.55" stroke="rgba(201,160,50,0.1)" strokeWidth="0.5" />
    </svg>
  )
}

function FlowerCluster({ style }: Readonly<{ style?: React.CSSProperties }>) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ position: 'absolute', pointerEvents: 'none', ...style }}
    >
      {/* Center pink flower */}
      <circle cx="40" cy="40" r="6" fill="rgba(232,168,152,0.55)" />
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180
        const px = 40 + Math.cos(rad) * 9
        const py = 40 + Math.sin(rad) * 9
        return <ellipse key={deg} cx={px} cy={py} rx="5" ry="7" transform={`rotate(${deg} ${px} ${py})`} fill="rgba(232,168,152,0.45)" />
      })}
      {/* Small bud top-right */}
      <circle cx="64" cy="20" r="4" fill="rgba(232,168,152,0.35)" />
      {[0, 72, 144, 216, 288].map((deg) => {
        const rad = (deg * Math.PI) / 180
        const px = 64 + Math.cos(rad) * 6
        const py = 20 + Math.sin(rad) * 6
        return <ellipse key={deg} cx={px} cy={py} rx="3.5" ry="5" transform={`rotate(${deg} ${px} ${py})`} fill="rgba(232,168,152,0.3)" />
      })}
      {/* Leaf accent */}
      <path d="M20 65 C12 50 16 38 26 42 C32 45 26 62 20 65Z" fill="var(--forest-light)" fillOpacity="0.7" />
    </svg>
  )
}

function SeedlingIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(201,160,50,0.9)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 20h10" />
      <path d="M10 20c5.5-2.5.8-6.4 3-9" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-2-3.4 1.8-.4 3.4.3 4.5 1z" />
      <path d="M14.1 6a7 7 0 00-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.3-3.9-1.8-.1-3.5.5-4.5 1.3z" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(201,160,50,0.9)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function RulerIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(201,160,50,0.9)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.3 8.7L8.7 21.3c-.4.4-1 .4-1.4 0l-6.6-6.6c-.4-.4-.4-1 0-1.4L13.3 2.7c.4-.4 1-.4 1.4 0l6.6 6.6c.4.4.4 1 0 1.4z" />
      <path d="M7.5 10.5l2 2" />
      <path d="M10.5 7.5l2 2" />
      <path d="M13.5 4.5l2 2" />
      <path d="M4.5 13.5l2 2" />
    </svg>
  )
}

function StatCircle({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: '50%',
        background: 'var(--card-alt)',
        border: '1px solid var(--card-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  )
}

export function WeekDetailPanel({ week, isCurrent, userId }: Readonly<WeekDetailPanelProps>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="relative overflow-hidden"
    >
      {/* Ambient warm glow across the full panel */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: '30%',
          width: 480,
          height: 320,
          background: 'radial-gradient(circle at 40% 50%, rgba(232,168,152,0.06) 0%, rgba(201,160,50,0.04) 35%, transparent 65%)',
          filter: 'blur(24px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div className="flex flex-col md:flex-row" style={{ minHeight: 440, position: 'relative', zIndex: 1 }}>

        {/* ── Left column: baby visual ─────────────────────── */}
        <div
          className="relative flex items-center justify-center w-full md:w-1/2"
          style={{ minHeight: 360, zIndex: 1 }}
        >
            {/* Large leaf branch — top left */}
            <LeafBranch
              style={{ top: -20, left: -8, width: 100, opacity: 0.8 }}
            />

            {/* Large leaf branch — top right, flipped */}
            <LeafBranch
              flip
              style={{ top: 0, right: -10, width: 80, opacity: 0.55 }}
            />

            {/* Flower cluster — bottom left */}
            <FlowerCluster
              style={{ bottom: 10, left: 10, width: 90, opacity: 0.75 }}
            />

            {/* Sparkles */}
            {[
              { id: 'spark-a', top: '18%', left: '12%', size: 8, opacity: 0.55 },
              { id: 'spark-b', top: '72%', right: '15%' as string | undefined, size: 6, opacity: 0.4 },
              { id: 'spark-c', top: '38%', left: '6%', size: 5, opacity: 0.35 },
            ].map(({ id, top, left, right, size, opacity }) => (
              <div
                key={id}
                aria-hidden="true"
                className="glow-pulse"
                style={{
                  position: 'absolute',
                  top,
                  left,
                  right,
                  width: size,
                  height: size,
                  opacity,
                  background: 'var(--gold)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  boxShadow: '0 0 6px rgba(201,160,50,0.6)',
                }}
              />
            ))}

            <BabyVisual weekNumber={week.week_number} size={300} />
        </div>

        {/* ── Right column: week content ───────────────────── */}
        <div
          className="flex flex-col justify-center px-6 py-8"
          style={{
            flex: 1,
            position: 'relative',
            zIndex: 1,
            gap: 16,
          }}
        >
          {/* Eyebrow */}
          <p
            style={{
              fontSize: '12px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: -4,
            }}
          >
            {isCurrent ? '✦ Your current week ✦' : `Week ${week.week_number}`}
          </p>

          {/* Heading */}
          <h2
            style={{
              fontFamily: 'var(--font-cormorant)',
              color: 'var(--cream)',
              fontSize: 'clamp(2.2rem, 6vw, 3.2rem)',
              fontWeight: 300,
              lineHeight: 1.05,
            }}
          >
            {week.title ?? `Week ${week.week_number}`}
          </h2>

          {/* Description */}
          {week.description && (
            <p
              style={{
                fontSize: '13.5px',
                color: 'var(--cream-dim)',
                lineHeight: 1.65,
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
              }}
            >
              <span style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 1 }}>❤</span>
              {week.description}
            </p>
          )}

          {/* Divider */}
          {(week.baby_size || week.trimester || week.approx_size) && (
            <div style={{ height: 1, background: 'rgba(201,160,50,0.14)' }} />
          )}

          {/* Stats row */}
          {(week.baby_size || week.trimester || week.approx_size) && (
            <div className="flex flex-col gap-3">
              {week.baby_size && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <StatCircle><SeedlingIcon /></StatCircle>
                  <div>
                    <p style={{ fontSize: '10.5px', color: 'var(--cream-dim)', marginBottom: 1 }}>
                      Baby is the size of
                    </p>
                    <p
                      style={{
                        fontSize: '16px',
                        color: 'var(--cream)',
                        fontFamily: 'var(--font-cormorant)',
                        fontWeight: 500,
                        lineHeight: 1.1,
                      }}
                    >
                      {week.baby_size}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 flex-wrap">
                {week.trimester && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 120 }}>
                    <StatCircle><CalendarIcon /></StatCircle>
                    <div>
                      <p style={{ fontSize: '10.5px', color: 'var(--cream-dim)', marginBottom: 1 }}>Trimester</p>
                      <p style={{ fontSize: '14px', color: 'var(--cream)', fontFamily: 'var(--font-cormorant)', fontWeight: 500 }}>
                        {week.trimester}
                      </p>
                    </div>
                  </div>
                )}

                {week.approx_size && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 100 }}>
                    <StatCircle><RulerIcon /></StatCircle>
                    <div>
                      <p style={{ fontSize: '10.5px', color: 'var(--cream-dim)', marginBottom: 1 }}>Baby size</p>
                      <p style={{ fontSize: '14px', color: 'var(--cream)', fontFamily: 'var(--font-cormorant)', fontWeight: 500 }}>
                        {week.approx_size}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* User-gated features: Kick Play → Talk to Baby → Mood Garden */}
      {userId && (
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '0 16px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {isCurrent && <KickPlay userId={userId} />}
          <TalkToBaby weekId={week.id} weekNumber={week.week_number} userId={userId} />
          <MoodGarden userId={userId} />
        </div>
      )}

      {/* Just for you — week content, shown regardless of auth state */}
      {week.just_for_you && (
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '12px 16px 24px',
          }}
        >
          <div
            style={{
              padding: '1rem 1.25rem',
              background: 'var(--card)',
              border: '1px solid var(--card-border)',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--accent-dim)',
                border: '1px solid var(--card-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '14px', color: 'var(--gold)' }}>❤</span>
            </div>

            <div className="flex-1" style={{ minWidth: 0 }}>
              <p
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--gold)',
                  marginBottom: 5,
                }}
              >
                Just for you
              </p>
              <p style={{ fontSize: '13px', color: 'var(--cream-dim)', lineHeight: 1.65 }}>
                {week.just_for_you}
              </p>
            </div>

            <span aria-hidden="true" style={{ fontSize: '36px', flexShrink: 0, opacity: 0.7, alignSelf: 'center' }}>
              ☕
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
