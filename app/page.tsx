'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Footer from '@/components/Footer'

// cosmetic-only randomness — not used for security, cryptography, or anything sensitive
const rand = () => Math.random() // NOSONAR

/* ── Botanical SVG decorations ──────────────────────────── */
function BottomLeftBotanical() {
  return (
    <svg
      viewBox="0 0 220 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute bottom-0 left-0 w-40 md:w-56 opacity-20 sway"
      aria-hidden="true"
    >
      <path d="M30 280 Q40 200 80 160 Q120 120 100 60" stroke="#7ab87a" strokeWidth="2" fill="none" />
      <ellipse cx="100" cy="60" rx="28" ry="42" fill="#4a8f4a" transform="rotate(-20 100 60)" />
      <ellipse cx="65" cy="140" rx="22" ry="36" fill="#3d7a3d" transform="rotate(25 65 140)" />
      <ellipse cx="110" cy="110" rx="20" ry="34" fill="#5a9a5a" transform="rotate(-35 110 110)" />
      <ellipse cx="50" cy="190" rx="18" ry="28" fill="#4a8f4a" transform="rotate(15 50 190)" />
      <path d="M30 280 Q20 220 60 180 Q90 150 75 100" stroke="#7ab87a" strokeWidth="1.5" fill="none" opacity="0.6" />
    </svg>
  )
}

function TopRightBotanical() {
  return (
    <svg
      viewBox="0 0 240 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute top-0 right-0 w-44 md:w-64 opacity-20 sway-alt"
      aria-hidden="true"
    >
      <path d="M210 0 Q200 80 160 120 Q120 160 140 220" stroke="#7ab87a" strokeWidth="2" fill="none" />
      <ellipse cx="140" cy="220" rx="28" ry="44" fill="#4a8f4a" transform="rotate(15 140 220)" />
      <ellipse cx="175" cy="140" rx="24" ry="38" fill="#3d7a3d" transform="rotate(-20 175 140)" />
      <ellipse cx="130" cy="170" rx="20" ry="32" fill="#5a9a5a" transform="rotate(30 130 170)" />
      <ellipse cx="180" cy="80" rx="18" ry="30" fill="#4a8f4a" transform="rotate(-10 180 80)" />
      <path d="M210 0 Q225 70 185 110 Q155 145 165 200" stroke="#7ab87a" strokeWidth="1.5" fill="none" opacity="0.6" />
    </svg>
  )
}

/* ── Particle canvas ────────────────────────────────────── */
function ParticleField() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    /* v8 ignore next — ref is always set when component mounts */
    if (!container) return

    const particles: HTMLDivElement[] = []

    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div')
      const size = rand() * 3 + 1
      p.className = 'particle'
      p.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${rand() * 100}%;
        bottom: ${rand() * 20}%;
        animation-delay: ${rand() * 10}s;
        animation-duration: ${rand() * 12 + 8}s;
        opacity: 0;
      `
      container.appendChild(p)
      particles.push(p)
    }

    return () => particles.forEach((p) => p.remove())
  }, [])

  return <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" />
}

/* ── Feature card ───────────────────────────────────────── */
interface FeatureCardProps {
  icon: string
  title: string
  description: string
  delay: string
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <div
      className="fade-up group relative rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-6 hover:border-[#c9a032]/30 hover:bg-white/[0.05] transition-all duration-500"
      style={{ animationDelay: delay }}
    >
      <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">
        {icon}
      </div>
      <h3
        className="text-lg mb-2 text-[#f5f0e8]"
        style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, letterSpacing: '0.02em' }}
      >
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-[#c8bfad]/80 font-light">{description}</p>
    </div>
  )
}

/* ── Main page ──────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

      {/* Deep forest gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, #1e3d2c 0%, #0f2419 40%, #0b1a14 100%)',
        }}
      />

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      {/* Center radial glow */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full glow-pulse pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(201,160,50,0.08) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      <BottomLeftBotanical />
      <TopRightBotanical />
      <ParticleField />

      {/* ── Content ─────────────────────────────── */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-20 flex flex-col items-center text-center">

        {/* Heartbeat orb */}
        <div className="fade-up mb-8" style={{ animationDelay: '0.1s' }}>
          <div
            className="heartbeat inline-flex items-center justify-center w-16 h-16 rounded-full"
            style={{
              background: 'radial-gradient(circle, #c9a032 0%, #7a4a1a 100%)',
              boxShadow: '0 0 32px rgba(201,160,50,0.4)',
            }}
          >
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-[#f5f0e8]" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
            </svg>
          </div>
        </div>

        {/* Headline */}
        <h1
          className="fade-up mb-4 leading-[1.05] tracking-tight text-[#f5f0e8]"
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: 'clamp(2.8rem, 8vw, 5.5rem)',
            animationDelay: '0.2s',
          }}
        >
          Grow With{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #c9a032, #e8c46a, #c9a032)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Me
          </span>
        </h1>

        {/* Eyebrow line */}
        <div className="fade-up flex items-center gap-3 mb-6" style={{ animationDelay: '0.35s' }}>
          <span className="h-px w-10 bg-[#c9a032]/40" />
          <p
            className="text-[0.7rem] tracking-[0.3em] uppercase text-[#c9a032]/70"
            style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 400 }}
          >
            Your pregnancy journey
          </p>
          <span className="h-px w-10 bg-[#c9a032]/40" />
        </div>

        {/* Tagline */}
        <p
          className="fade-up leading-relaxed text-[#c8bfad] max-w-lg font-light"
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            animationDelay: '0.45s',
          }}
        >
          A week-by-week sanctuary for you and your growing baby.
          Record voice messages, track kicks, tend your mood garden —
          and watch a little life unfold.
        </p>

        {/* CTA buttons */}
        <div className="fade-up mt-10 flex flex-col sm:flex-row gap-4" style={{ animationDelay: '0.6s' }}>
          <Link
            href="/login"
            className="btn-shimmer rounded-full px-8 py-3.5 text-[#0b1a14] font-medium text-sm tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200"
            style={{ fontFamily: 'var(--font-dm-sans)' }}
          >
            Begin Your Journey
          </Link>
          <button
            className="rounded-full px-8 py-3.5 border border-[#c9a032]/30 text-[#c8bfad] font-light text-sm tracking-wide hover:border-[#c9a032]/60 hover:text-[#f5f0e8] transition-all duration-300"
            style={{ fontFamily: 'var(--font-dm-sans)' }}
          >
            See the features
          </button>
        </div>

        {/* Week badge */}
        <div
          className="fade-up mt-10 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-[#c9a032]/70 border border-[#c9a032]/10"
          style={{ animationDelay: '0.75s', fontFamily: 'var(--font-dm-sans)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#c9a032]/60 animate-pulse" />
          40 weeks of guided milestones
        </div>

        {/* Feature cards */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-3 w-full text-left">
          <FeatureCard
            icon="🍼"
            title="Baby Timeline"
            description="Week-by-week visual development with animated reveals."
            delay="0.8s"
          />
          <FeatureCard
            icon="🎙️"
            title="Talk to Baby"
            description="Record voice messages with a warm womb-effect playback."
            delay="0.9s"
          />
          <FeatureCard
            icon="✨"
            title="Kick Play"
            description="Tap-based kick logger with ripple and sparkle animations."
            delay="1.0s"
          />
          <FeatureCard
            icon="🌸"
            title="Mood Garden"
            description="Daily moods that bloom into a living visual garden."
            delay="1.1s"
          />
        </div>

      </div>

      {/* Bottom vignette */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #0b1a14 0%, transparent 100%)' }}
      />
    </main>
    <Footer />
    </>
  )
}
