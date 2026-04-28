'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// Brahms' Lullaby — Wiegenlied Op.49 No.4
// Source: orangefreesounds.com · CC Attribution 4.0 · Streamed directly, not stored
const STREAM_URL =
  'https://www.orangefreesounds.com/wp-content/uploads/2016/02/Brahms-lullaby.mp3'
const TRACK_NAME = "Brahms' Lullaby"
const TRACK_CREDIT = 'Wiegenlied · CC BY 4.0 · orangefreesounds.com'

const BAR_HEIGHTS = [0.45, 1, 0.65, 1, 0.5] as const

function MusicBars({ playing }: Readonly<{ playing: boolean }>) {
  return (
    <span className="inline-flex items-end gap-[2px] h-[14px]" aria-hidden="true">
      {BAR_HEIGHTS.map((h, i) => (
        <span
          key={`bar-${h}-${i}`}
          className="w-[2px] rounded-full"
          style={{
            height: `${h * 14}px`,
            background: 'var(--gold)',
            opacity: playing ? 0.8 : 0.25,
            animation: playing
              ? `music-bar ${0.45 + i * 0.12}s ease-in-out ${i * 0.08}s infinite alternate`
              : 'none',
            transition: 'opacity 0.4s',
          }}
        />
      ))}
    </span>
  )
}

export default function Footer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.28)
  const [loadError, setLoadError] = useState(false)

  const toggle = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.volume = volume
      try {
        await audio.play()
        setPlaying(true)
      } catch {
        // Browser blocked autoplay — user must interact first (expected on some browsers)
      }
    }
  }, [playing, volume])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  // Keep volume in sync after src loads
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const sync = () => { audio.volume = volume }
    audio.addEventListener('loadedmetadata', sync)
    return () => audio.removeEventListener('loadedmetadata', sync)
  }, [volume])

  return (
    <footer
      className="relative w-full"
      style={{ background: 'linear-gradient(to bottom, #0d1f18 0%, #0b1a14 100%)' }}
    >
      {/* Gold glow hairline */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-72 pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(201,160,50,0.35), transparent)',
        }}
      />

      <div className="max-w-3xl mx-auto px-6 py-12 flex flex-col items-center gap-8">

        {/* ── Heart icon ─────────────────────────────────── */}
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          style={{ fill: '#c9a032', opacity: 0.45 }}
          aria-hidden="true"
        >
          <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
        </svg>

        {/* ── Dedication ─────────────────────────────────── */}
        <blockquote className="flex flex-col items-center text-center gap-2 max-w-md">
          <p
            className="leading-relaxed text-[#f5f0e8]/80"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontWeight: 400,
              fontStyle: 'italic',
              fontSize: 'clamp(1rem, 2.4vw, 1.175rem)',
            }}
          >
            Lovingly dedicated to{' '}
            <span
              style={{
                fontStyle: 'normal',
                fontWeight: 500,
                background: 'linear-gradient(135deg, #c9a032 0%, #e8c46a 60%, #c9a032 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {process.env.NEXT_PUBLIC_DEDICATION_NAME ?? 'Rhoie Jhannarie Mendez'}
            </span>
            {' '}— a first-time mom whose strength, love, and journey
            inspired every line of this app.
          </p>
          <p
            className="text-[#c8bfad]/55 mt-1"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: 'clamp(0.85rem, 2vw, 1rem)',
            }}
          >
            Built as a Mother&rsquo;s Day gift — to capture the beauty of this
            once-in-a-lifetime chapter.
          </p>
        </blockquote>

        {/* ── Ornamental divider ─────────────────────────── */}
        <div className="flex items-center gap-3 w-full max-w-xs" aria-hidden="true">
          <span className="flex-1 h-px" style={{ background: 'rgba(201,160,50,0.12)' }} />
          <span
            className="text-[8px] tracking-[0.4em] uppercase"
            style={{ fontFamily: 'var(--font-dm-sans)', color: 'rgba(201,160,50,0.3)' }}
          >
            ✦
          </span>
          <span className="flex-1 h-px" style={{ background: 'rgba(201,160,50,0.12)' }} />
        </div>

        {/* ── Music player ───────────────────────────────── */}
        <div className="flex flex-col items-center gap-2.5">
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              aria-label={playing ? 'Pause ambient music' : 'Play ambient music'}
              className="group flex items-center gap-2.5 rounded-full px-5 py-2 transition-all duration-300"
              style={{
                border: '1px solid rgba(201,160,50,0.18)',
                color: 'rgba(201,160,50,0.65)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(201,160,50,0.5)'
                e.currentTarget.style.color = '#c9a032'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(201,160,50,0.18)'
                e.currentTarget.style.color = 'rgba(201,160,50,0.65)'
              }}
            >
              {/* Play / Pause icon */}
              {playing ? (
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current shrink-0" aria-hidden="true">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current shrink-0" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}

              <MusicBars playing={playing} />

              <span
                className="text-[0.62rem] tracking-[0.18em] uppercase"
                style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 400 }}
              >
                {playing ? 'Pause' : 'Ambient music'}
              </span>
            </button>

            {/* Volume — only when playing */}
            {playing && (
              <label className="flex items-center gap-1.5" aria-label="Volume">
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-[#c9a032]/40 shrink-0" aria-hidden="true">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-14 cursor-pointer"
                  style={{ accentColor: '#c9a032', height: '3px' }}
                  aria-label="Volume level"
                />
              </label>
            )}
          </div>

          {/* Track credit / error */}
          <p
            className="text-[0.58rem] tracking-[0.14em] uppercase"
            style={{
              fontFamily: 'var(--font-dm-sans)',
              color: loadError ? 'rgba(232,100,100,0.5)' : 'rgba(200, 191, 173, 0.28)',
            }}
          >
            {loadError
              ? 'Stream unavailable — check your connection'
              : `${TRACK_NAME} · ${TRACK_CREDIT}`}
          </p>
        </div>

        {/* ── Copyright ──────────────────────────────────── */}
        <p
          className="text-[0.58rem] tracking-[0.12em]"
          style={{
            fontFamily: 'var(--font-dm-sans)',
            color: 'rgba(200, 191, 173, 0.2)',
          }}
        >
          © {new Date().getFullYear()} Grow With Me · Built with love for a growing family
        </p>
      </div>

      {/* Audio element — streams from orangefreesounds.com, no local storage */}
      <audio
        ref={audioRef}
        src={STREAM_URL}
        loop
        preload="none"
        onError={() => { setLoadError(true); setPlaying(false) }}
        onEnded={() => setPlaying(false)}
      />
    </footer>
  )
}
