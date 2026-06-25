'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || globalThis.location.origin).replace(/\/$/, '')
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    })

    if (otpError) {
      setError(otpError.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center py-12"
      style={{ background: 'var(--forest)' }}
    >
      <Container>
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="heartbeat inline-block text-4xl mb-4">🌿</div>
          <h1
            className="text-3xl font-light italic mb-2"
            style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--cream)' }}
          >
            Grow With Me
          </h1>
          <p className="text-sm" style={{ color: 'var(--cream-dim)' }}>
            Your pregnancy journey, week by week
          </p>
        </div>

        {sent ? (
          /* Success state */
          <div className="text-center fade-up space-y-4">
            <p className="text-4xl">✉️</p>
            <h2
              className="text-2xl font-light"
              style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--cream)' }}
            >
              Check your inbox
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--cream-dim)' }}>
              We sent a magic link to{' '}
              <span style={{ color: 'var(--gold-light)' }}>{email}</span>.
              <br />
              Tap it to continue your journey.
            </p>
            <button
              onClick={() => { setSent(false); setEmail('') }}
              className="text-xs underline underline-offset-2 mt-2 transition-colors"
              style={{ color: 'var(--cream-dim)' }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          /* Login form */
          <form onSubmit={handleSubmit} className="space-y-5 fade-up">
            <div>
              <label
                htmlFor="email"
                className="block text-xs tracking-widest uppercase mb-2"
                style={{ color: 'var(--cream-dim)' }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                style={{
                  background: 'var(--forest-mid)',
                  border: '1px solid rgba(201,160,50,0.2)',
                  color: 'var(--cream)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--gold)')}
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = 'rgba(201,160,50,0.2)')
                }
              />
            </div>

            {error && (
              <p className="text-xs" style={{ color: '#f87171' }}>
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send magic link'}
            </Button>

            <p className="text-xs text-center" style={{ color: 'var(--cream-dim)' }}>
              No password needed — we&rsquo;ll email you a secure link.
            </p>
          </form>
        )}
      </Container>
    </div>
  )
}
