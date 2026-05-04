'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { VoiceEntry } from '@/types/database'

interface TalkToBabyProps {
  weekId: string
  weekNumber: number
  userId: string | null
}

type RecordingStatus = 'idle' | 'recording' | 'preview' | 'uploading'

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getSupportedMimeType(): string {
  const candidates = ['audio/webm', 'audio/mp4', 'audio/ogg']
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? 'audio/webm'
}

function mimeToExt(mimeType: string): string {
  if (mimeType.includes('mp4')) return 'mp4'
  if (mimeType.includes('ogg')) return 'ogg'
  return 'webm'
}

function MicIcon({ size = 18, color = 'currentColor' }: Readonly<{ size?: number; color?: string }>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <line x1="8" y1="21" x2="16" y2="21" />
    </svg>
  )
}

export function TalkToBaby({ weekId, weekNumber, userId }: Readonly<TalkToBabyProps>) {
  const supabase = useMemo(() => createClient(), [])

  const [status, setStatus] = useState<RecordingStatus>('idle')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [timer, setTimer] = useState(0)
  const [recordings, setRecordings] = useState<VoiceEntry[]>([])
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioBlobRef = useRef<Blob | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const previewUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (!userId) return
    let active = true

    const fetchRecordings = async () => {
      const { data, error: fetchErr } = await supabase
        .from('voice_entries')
        .select('*')
        .eq('week_id', weekId)
        .order('created_at', { ascending: false })

      if (!active) return
      if (fetchErr) {
        setError('Could not load your recordings. Please refresh.')
        return
      }
      const entries = (data ?? []) as VoiceEntry[]
      setRecordings(entries)

      const urls: Record<string, string> = {}
      await Promise.all(
        entries.map(async (entry) => {
          const { data: urlData } = await supabase.storage
            .from('voice-recordings')
            .createSignedUrl(entry.audio_url, 3600)
          if (urlData?.signedUrl) urls[entry.id] = urlData.signedUrl
        })
      )
      if (active) setSignedUrls(urls)
    }

    fetchRecordings()
    return () => { active = false }
  }, [weekId, userId, supabase, refreshKey])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  async function startRecording() {
    if (status !== 'idle') return
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = getSupportedMimeType()
      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const url = URL.createObjectURL(blob)
        audioBlobRef.current = blob
        previewUrlRef.current = url
        setPreviewUrl(url)
        setStatus('preview')
        stream.getTracks().forEach((t) => t.stop())
      }

      recorder.start()
      setStatus('recording')
      setTimer(0)
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000)
    } catch (err) {
      const isDenied =
        err instanceof Error &&
        (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')
      setError(
        isDenied
          ? 'Microphone access was denied. Please allow it in your browser settings.'
          : 'Could not start recording. Please try again.'
      )
    }
  }

  function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    mediaRecorderRef.current?.stop()
  }

  function discardRecording() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    audioBlobRef.current = null
    setPreviewUrl(null)
    setTimer(0)
    setStatus('idle')
  }

  async function saveRecording() {
    const blob = audioBlobRef.current
    if (!blob || !userId) return

    setStatus('uploading')
    setError(null)

    const ext = mimeToExt(blob.type)
    const path = `${userId}/week-${weekNumber}/${Date.now()}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('voice-recordings')
      .upload(path, blob, { contentType: blob.type })

    if (uploadErr) {
      setError('Could not save your message. Please try again.')
      setStatus('preview')
      return
    }

    const { error: dbErr } = await supabase
      .from('voice_entries')
      .insert({ user_id: userId, week_id: weekId, audio_url: path })

    if (dbErr) {
      await supabase.storage.from('voice-recordings').remove([path])
      setError('Could not save your message. Please try again.')
      setStatus('preview')
      return
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    audioBlobRef.current = null
    setPreviewUrl(null)
    setTimer(0)
    setStatus('idle')
    setRefreshKey((k) => k + 1)
  }

  if (!userId) return null

  return (
    <div
      style={{
        marginTop: 24,
        padding: '1.25rem 1.5rem',
        background: 'rgba(14,32,22,0.75)',
        border: '1px solid rgba(201,160,50,0.14)',
        borderRadius: 16,
      }}
    >
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
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
            color: 'var(--gold)',
          }}
        >
          <MicIcon size={16} />
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
            Talk to Baby
          </p>
          <p style={{ fontSize: '12px', color: 'var(--cream-dim)', opacity: 0.65 }}>
            Leave a message your little one will treasure
          </p>
        </div>
      </div>

      {/* Recording controls */}
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <button
              onClick={startRecording}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                background: 'rgba(201,160,50,0.1)',
                border: '1px solid rgba(201,160,50,0.28)',
                borderRadius: 50,
                color: 'var(--cream)',
                fontSize: '13.5px',
                cursor: 'pointer',
                transition: 'background 0.2s, border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(201,160,50,0.18)'
                e.currentTarget.style.borderColor = 'rgba(201,160,50,0.45)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(201,160,50,0.1)'
                e.currentTarget.style.borderColor = 'rgba(201,160,50,0.28)'
              }}
            >
              <MicIcon size={15} />
              Start Recording
            </button>
          </motion.div>
        )}

        {status === 'recording' && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <motion.div
                animate={{ opacity: [1, 0.25, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: 'rgba(220,80,80,0.9)',
                  boxShadow: '0 0 8px rgba(220,80,80,0.5)',
                  flexShrink: 0,
                }}
              />
              <span
                aria-live="polite"
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '1.65rem',
                  color: 'var(--cream)',
                  fontWeight: 300,
                  letterSpacing: '0.04em',
                  lineHeight: 1,
                }}
              >
                {formatTimer(timer)}
              </span>
            </div>

            <button
              onClick={stopRecording}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                background: 'rgba(220,80,80,0.1)',
                border: '1px solid rgba(220,80,80,0.32)',
                borderRadius: 50,
                color: 'var(--cream)',
                fontSize: '13.5px',
                cursor: 'pointer',
                width: 'fit-content',
              }}
            >
              Stop Recording
            </button>
          </motion.div>
        )}

        {status === 'preview' && previewUrl && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <audio
              src={previewUrl}
              controls
              style={{ width: '100%', borderRadius: 8, accentColor: 'var(--gold)' }}
            />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={saveRecording}
                style={{
                  padding: '10px 22px',
                  background: 'rgba(201,160,50,0.12)',
                  border: '1px solid rgba(201,160,50,0.3)',
                  borderRadius: 50,
                  color: 'var(--cream)',
                  fontSize: '13.5px',
                  cursor: 'pointer',
                }}
              >
                Save Message
              </button>
              <button
                onClick={discardRecording}
                style={{
                  padding: '10px 22px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 50,
                  color: 'var(--cream-dim)',
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  opacity: 0.65,
                }}
              >
                Discard
              </button>
            </div>
          </motion.div>
        )}

        {status === 'uploading' && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: '2px solid rgba(201,160,50,0.25)',
                borderTopColor: 'var(--gold)',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: '13px', color: 'var(--cream-dim)' }}>
              Saving your message…
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: 12,
              fontSize: '13px',
              color: 'rgba(220,100,100,0.9)',
              lineHeight: 1.55,
            }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(201,160,50,0.1)', margin: '20px 0' }} />

      {/* Recordings list */}
      {recordings.length === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--cream-dim)', opacity: 0.6, lineHeight: 1.65 }}>
          No messages yet. Say something to your baby 💛
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recordings.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                padding: '12px 14px',
                background: 'rgba(20,43,31,0.55)',
                border: '1px solid rgba(201,160,50,0.1)',
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <p
                style={{
                  fontSize: '11px',
                  color: 'var(--gold)',
                  opacity: 0.7,
                  letterSpacing: '0.04em',
                }}
              >
                {formatDate(entry.created_at)}
              </p>
              {signedUrls[entry.id] ? (
                 
                <audio
                  src={signedUrls[entry.id]}
                  controls
                  style={{ width: '100%', accentColor: 'var(--gold)' }}
                />
              ) : (
                <p style={{ fontSize: '12px', color: 'var(--cream-dim)', opacity: 0.45 }}>
                  Loading…
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
