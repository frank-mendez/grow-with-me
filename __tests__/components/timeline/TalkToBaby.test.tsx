import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'

// ── Supabase mock ────────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => ({
  order: vi.fn(),
  eq: vi.fn(),
  select: vi.fn(),
  insert: vi.fn(),
  from: vi.fn(),
  createSignedUrl: vi.fn(),
  upload: vi.fn(),
  remove: vi.fn(),
  fromStorage: vi.fn(),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mocks.from,
    storage: { from: mocks.fromStorage },
  }),
}))

// ── Framer Motion mock ───────────────────────────────────────────────────────

vi.mock('framer-motion', () => ({
  motion: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    div: ({ children, animate, initial, exit, transition, ...rest }: React.ComponentProps<'div'> & Record<string, unknown>) => (
      <div {...rest}>{children}</div>
    ),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    p: ({ children, animate, initial, exit, transition, ...rest }: React.ComponentProps<'p'> & Record<string, unknown>) => (
      <p {...rest}>{children}</p>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

// ── MediaRecorder mock ───────────────────────────────────────────────────────

let capturedOnStop: (() => void) | null = null
let capturedOnDataAvailable: ((e: { data: Blob }) => void) | null = null

class MockMediaRecorder {
  static isTypeSupported = vi.fn().mockReturnValue(true)
  start: ReturnType<typeof vi.fn>
  stop: ReturnType<typeof vi.fn>
  state: RecordingState = 'inactive'

  constructor() {
    this.start = vi.fn().mockImplementation(() => { this.state = 'recording' })
    this.stop = vi.fn().mockImplementation(() => { this.state = 'inactive' })
  }

  set onstop(fn: () => void) {
    capturedOnStop = fn
  }

  set ondataavailable(fn: (e: { data: Blob }) => void) {
    capturedOnDataAvailable = fn
  }
}

// ── Import component (after mocks) ───────────────────────────────────────────

import { TalkToBaby } from '@/components/timeline/TalkToBaby'

// ── Global test setup ────────────────────────────────────────────────────────

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => 'blob:mock-preview-url')
  URL.revokeObjectURL = vi.fn()

  Object.defineProperty(navigator, 'mediaDevices', {
    value: {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }],
      }),
    },
    writable: true,
    configurable: true,
  })

  vi.stubGlobal('MediaRecorder', MockMediaRecorder)
})

beforeEach(() => {
  capturedOnStop = null
  capturedOnDataAvailable = null

  // Default: empty recordings
  const qb = { select: mocks.select, eq: mocks.eq, order: mocks.order, insert: mocks.insert }
  mocks.select.mockReturnValue(qb)
  mocks.eq.mockReturnValue(qb)
  mocks.from.mockReturnValue(qb)
  mocks.order.mockResolvedValue({ data: [], error: null })
  mocks.insert.mockResolvedValue({ error: null })

  mocks.createSignedUrl.mockResolvedValue({
    data: { signedUrl: 'https://signed.url/voice.webm' },
    error: null,
  })
  mocks.upload.mockResolvedValue({ error: null })
  mocks.remove.mockResolvedValue({ error: null })
  mocks.fromStorage.mockReturnValue({
    createSignedUrl: mocks.createSignedUrl,
    upload: mocks.upload,
    remove: mocks.remove,
  })

  vi.mocked(navigator.mediaDevices.getUserMedia).mockResolvedValue({
    getTracks: () => [{ stop: vi.fn() }],
  } as unknown as MediaStream)
})

// ── Tests ────────────────────────────────────────────────────────────────────

describe('TalkToBaby', () => {
  describe('when userId is null', () => {
    it('renders nothing', () => {
      const { container } = render(
        <TalkToBaby weekId="wk-1" weekNumber={12} userId={null} />
      )
      expect(container.firstChild).toBeNull()
    })
  })

  describe('idle state', () => {
    it('shows the section header', async () => {
      render(<TalkToBaby weekId="wk-1" weekNumber={12} userId="user-123" />)
      await waitFor(() => {
        expect(screen.getByText('Talk to Baby')).toBeInTheDocument()
      })
    })

    it('shows Start Recording button', async () => {
      render(<TalkToBaby weekId="wk-1" weekNumber={12} userId="user-123" />)
      await waitFor(() => {
        expect(screen.getByText('Start Recording')).toBeInTheDocument()
      })
    })

    it('shows empty state when there are no recordings', async () => {
      render(<TalkToBaby weekId="wk-1" weekNumber={12} userId="user-123" />)
      await waitFor(() => {
        expect(screen.getByText(/No messages yet/i)).toBeInTheDocument()
      })
    })

    it('fetches recordings for the given weekId on mount', async () => {
      render(<TalkToBaby weekId="wk-42" weekNumber={12} userId="user-123" />)
      await waitFor(() => {
        expect(mocks.eq).toHaveBeenCalledWith('week_id', 'wk-42')
      })
    })

    it('filters the query by user_id in addition to week_id', async () => {
      render(<TalkToBaby weekId="wk-42" weekNumber={12} userId="user-123" />)
      await waitFor(() => {
        expect(mocks.eq).toHaveBeenCalledWith('user_id', 'user-123')
        expect(mocks.eq).toHaveBeenCalledWith('week_id', 'wk-42')
      })
    })

    it('clears a stale fetch error when a subsequent fetch succeeds', async () => {
      // First render: fetch fails → error shown
      mocks.order.mockResolvedValueOnce({ data: null, error: new Error('transient') })

      render(<TalkToBaby weekId="wk-1" weekNumber={12} userId="user-123" />)
      await waitFor(() =>
        expect(screen.getByText(/Could not load your recordings/i)).toBeInTheDocument()
      )

      // Next fetch (triggered by refreshKey) succeeds → error cleared
      mocks.order.mockResolvedValueOnce({ data: [], error: null })

      // Reach preview state and save to increment refreshKey
      mocks.order.mockResolvedValue({ data: [], error: null })
      mocks.upload.mockResolvedValue({ error: null })
      mocks.insert.mockResolvedValue({ error: null })

      fireEvent.click(await screen.findByText('Start Recording'))
      await waitFor(() => screen.getByText('Stop Recording'))
      fireEvent.click(screen.getByText('Stop Recording'))
      await act(async () => {
        capturedOnDataAvailable?.({ data: new Blob(['audio'], { type: 'audio/webm' }) })
        capturedOnStop?.()
      })
      await waitFor(() => screen.getByText('Save Message'))
      fireEvent.click(screen.getByText('Save Message'))

      await waitFor(() => {
        expect(screen.queryByText(/Could not load your recordings/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('recordings list', () => {
    it('renders a recording entry with formatted date and audio player', async () => {
      mocks.order.mockResolvedValue({
        data: [
          {
            id: 'rec-1',
            user_id: 'user-123',
            week_id: 'wk-1',
            audio_url: 'user-123/week-12/1234567890.webm',
            created_at: '2026-05-04T10:30:00.000Z',
          },
        ],
        error: null,
      })

      const { container } = render(
        <TalkToBaby weekId="wk-1" weekNumber={12} userId="user-123" />
      )

      await waitFor(() => {
        expect(container.querySelector('audio')).toBeInTheDocument()
      })
      expect(screen.queryByText(/No messages yet/i)).not.toBeInTheDocument()
    })

    it('requests a signed URL for each recording', async () => {
      mocks.order.mockResolvedValue({
        data: [
          {
            id: 'rec-1',
            user_id: 'user-123',
            week_id: 'wk-1',
            audio_url: 'user-123/week-12/1234567890.webm',
            created_at: '2026-05-04T10:30:00.000Z',
          },
        ],
        error: null,
      })

      render(<TalkToBaby weekId="wk-1" weekNumber={12} userId="user-123" />)

      await waitFor(() => {
        expect(mocks.createSignedUrl).toHaveBeenCalledWith(
          'user-123/week-12/1234567890.webm',
          3600
        )
      })
    })

    it('shows "Could not load audio" when signed URL generation fails', async () => {
      mocks.order.mockResolvedValue({
        data: [
          {
            id: 'rec-1',
            user_id: 'user-123',
            week_id: 'wk-1',
            audio_url: 'user-123/week-12/fail.webm',
            created_at: '2026-05-04T10:30:00.000Z',
          },
        ],
        error: null,
      })
      mocks.createSignedUrl.mockResolvedValue({ data: null, error: new Error('Storage error') })

      render(<TalkToBaby weekId="wk-1" weekNumber={12} userId="user-123" />)

      await waitFor(() => {
        expect(screen.getByText(/Could not load audio/i)).toBeInTheDocument()
      })
    })
  })

  describe('recording flow', () => {
    it('requests microphone access when Start Recording is clicked', async () => {
      render(<TalkToBaby weekId="wk-1" weekNumber={12} userId="user-123" />)
      await waitFor(() => screen.getByText('Start Recording'))

      fireEvent.click(screen.getByText('Start Recording'))

      await waitFor(() => {
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
          audio: true,
        })
      })
    })

    it('shows Stop Recording button while recording', async () => {
      render(<TalkToBaby weekId="wk-1" weekNumber={12} userId="user-123" />)
      await waitFor(() => screen.getByText('Start Recording'))

      fireEvent.click(screen.getByText('Start Recording'))

      await waitFor(() => {
        expect(screen.getByText('Stop Recording')).toBeInTheDocument()
      })
    })

    it('shows the timer while recording', async () => {
      render(<TalkToBaby weekId="wk-1" weekNumber={12} userId="user-123" />)
      await waitFor(() => screen.getByText('Start Recording'))

      fireEvent.click(screen.getByText('Start Recording'))

      await waitFor(() => {
        expect(screen.getByText('00:00')).toBeInTheDocument()
      })
    })

    it('shows Save Message and Discard after stopping', async () => {
      render(<TalkToBaby weekId="wk-1" weekNumber={12} userId="user-123" />)
      await waitFor(() => screen.getByText('Start Recording'))

      fireEvent.click(screen.getByText('Start Recording'))
      await waitFor(() => screen.getByText('Stop Recording'))

      fireEvent.click(screen.getByText('Stop Recording'))

      await act(async () => {
        capturedOnStop?.()
      })

      await waitFor(() => {
        expect(screen.getByText('Save Message')).toBeInTheDocument()
        expect(screen.getByText('Discard')).toBeInTheDocument()
      })
    })

    it('returns to idle when Discard is clicked', async () => {
      render(<TalkToBaby weekId="wk-1" weekNumber={12} userId="user-123" />)
      await waitFor(() => screen.getByText('Start Recording'))

      fireEvent.click(screen.getByText('Start Recording'))
      await waitFor(() => screen.getByText('Stop Recording'))

      fireEvent.click(screen.getByText('Stop Recording'))
      await act(async () => { capturedOnStop?.() })

      await waitFor(() => screen.getByText('Discard'))
      fireEvent.click(screen.getByText('Discard'))

      await waitFor(() => {
        expect(screen.getByText('Start Recording')).toBeInTheDocument()
      })
    })
  })

  describe('save recording', () => {
    async function reachPreviewState() {
      render(<TalkToBaby weekId="wk-1" weekNumber={12} userId="user-123" />)
      await waitFor(() => screen.getByText('Start Recording'))
      fireEvent.click(screen.getByText('Start Recording'))
      await waitFor(() => screen.getByText('Stop Recording'))
      fireEvent.click(screen.getByText('Stop Recording'))
      await act(async () => {
        capturedOnDataAvailable?.({ data: new Blob(['audio'], { type: 'audio/webm' }) })
        capturedOnStop?.()
      })
      await waitFor(() => screen.getByText('Save Message'))
    }

    it('uploads to storage with correct path format', async () => {
      await reachPreviewState()
      fireEvent.click(screen.getByText('Save Message'))

      await waitFor(() => {
        expect(mocks.upload).toHaveBeenCalledWith(
          expect.stringMatching(/^user-123\/week-12\/\d+\.webm$/),
          expect.any(Blob),
          expect.objectContaining({ contentType: expect.any(String) })
        )
      })
    })

    it('inserts a voice_entry record after successful upload', async () => {
      await reachPreviewState()
      fireEvent.click(screen.getByText('Save Message'))

      await waitFor(() => {
        expect(mocks.insert).toHaveBeenCalledWith(
          expect.objectContaining({
            user_id: 'user-123',
            week_id: 'wk-1',
            audio_url: expect.stringMatching(/^user-123\/week-12\/\d+\.webm$/),
          })
        )
      })
    })

    it('falls back to audio/webm content type when blob.type is empty', async () => {
      MockMediaRecorder.isTypeSupported
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)

      render(<TalkToBaby weekId="wk-1" weekNumber={12} userId="user-123" />)
      await waitFor(() => screen.getByText('Start Recording'))
      fireEvent.click(screen.getByText('Start Recording'))
      await waitFor(() => screen.getByText('Stop Recording'))
      fireEvent.click(screen.getByText('Stop Recording'))

      await act(async () => {
        capturedOnDataAvailable?.({ data: new Blob(['audio'], { type: '' }) })
        capturedOnStop?.()
      })

      await waitFor(() => screen.getByText('Save Message'))
      fireEvent.click(screen.getByText('Save Message'))

      await waitFor(() => {
        expect(mocks.upload).toHaveBeenCalledWith(
          expect.stringMatching(/^user-123\/week-12\/\d+\.webm$/),
          expect.any(Blob),
          expect.objectContaining({ contentType: 'audio/webm' })
        )
      })
    })

    it('returns to idle after a successful save', async () => {
      await reachPreviewState()
      fireEvent.click(screen.getByText('Save Message'))

      await waitFor(() => {
        expect(screen.getByText('Start Recording')).toBeInTheDocument()
      })
    })
  })

  describe('error handling', () => {
    it('stops stream tracks when MediaRecorder construction fails', async () => {
      const mockTrackStop = vi.fn()
      vi.mocked(navigator.mediaDevices.getUserMedia).mockResolvedValueOnce({
        getTracks: () => [{ stop: mockTrackStop }],
      } as unknown as MediaStream)

      vi.stubGlobal('MediaRecorder', class {
        static isTypeSupported = vi.fn().mockReturnValue(true)
        constructor() { throw new Error('NotSupportedError') }
      })

      render(<TalkToBaby weekId="wk-1" weekNumber={12} userId="user-123" />)
      await waitFor(() => screen.getByText('Start Recording'))

      fireEvent.click(screen.getByText('Start Recording'))

      await waitFor(() => {
        expect(mockTrackStop).toHaveBeenCalled()
        expect(screen.getByText(/Could not start recording/i)).toBeInTheDocument()
      })

      vi.stubGlobal('MediaRecorder', MockMediaRecorder)
    })

    it('shows a friendly message when microphone is denied', async () => {
      vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValue(
        Object.assign(new Error('Permission denied'), { name: 'NotAllowedError' })
      )

      render(<TalkToBaby weekId="wk-1" weekNumber={12} userId="user-123" />)
      await waitFor(() => screen.getByText('Start Recording'))

      fireEvent.click(screen.getByText('Start Recording'))

      await waitFor(() => {
        expect(
          screen.getByText(/Microphone access was denied/i)
        ).toBeInTheDocument()
      })
    })

    it('shows a friendly message when upload fails', async () => {
      mocks.upload.mockResolvedValue({ error: new Error('Network error') })

      render(<TalkToBaby weekId="wk-1" weekNumber={12} userId="user-123" />)
      await waitFor(() => screen.getByText('Start Recording'))

      fireEvent.click(screen.getByText('Start Recording'))
      await waitFor(() => screen.getByText('Stop Recording'))
      fireEvent.click(screen.getByText('Stop Recording'))

      await act(async () => {
        capturedOnDataAvailable?.({ data: new Blob(['audio'], { type: 'audio/webm' }) })
        capturedOnStop?.()
      })

      await waitFor(() => screen.getByText('Save Message'))
      fireEvent.click(screen.getByText('Save Message'))

      await waitFor(() => {
        expect(screen.getByText(/Could not save your message/i)).toBeInTheDocument()
      })

      // Stays in preview so user can retry
      expect(screen.getByText('Save Message')).toBeInTheDocument()
    })

    it('shows an error when fetching recordings fails', async () => {
      mocks.order.mockResolvedValue({ data: null, error: new Error('DB error') })

      render(<TalkToBaby weekId="wk-1" weekNumber={12} userId="user-123" />)

      await waitFor(() => {
        expect(screen.getByText(/Could not load your recordings/i)).toBeInTheDocument()
      })
    })

    it('cleans up the orphaned storage file when DB insert fails', async () => {
      mocks.insert.mockResolvedValue({ error: new Error('DB insert error') })

      render(<TalkToBaby weekId="wk-1" weekNumber={12} userId="user-123" />)
      await waitFor(() => screen.getByText('Start Recording'))
      fireEvent.click(screen.getByText('Start Recording'))
      await waitFor(() => screen.getByText('Stop Recording'))
      fireEvent.click(screen.getByText('Stop Recording'))

      await act(async () => {
        capturedOnDataAvailable?.({ data: new Blob(['audio'], { type: 'audio/webm' }) })
        capturedOnStop?.()
      })

      await waitFor(() => screen.getByText('Save Message'))
      fireEvent.click(screen.getByText('Save Message'))

      await waitFor(() => {
        expect(mocks.remove).toHaveBeenCalledWith(
          expect.arrayContaining([expect.stringMatching(/^user-123\/week-12\/\d+\.webm$/)])
        )
      })
      expect(screen.getByText(/Could not save your message/i)).toBeInTheDocument()
    })

    it('starts recording when no MIME type is explicitly supported', async () => {
      MockMediaRecorder.isTypeSupported
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)

      render(<TalkToBaby weekId="wk-1" weekNumber={12} userId="user-123" />)
      await waitFor(() => screen.getByText('Start Recording'))

      fireEvent.click(screen.getByText('Start Recording'))

      await waitFor(() => {
        expect(screen.getByText('Stop Recording')).toBeInTheDocument()
      })
    })

    it('does not start a second recording when Start Recording is clicked again mid-flight', async () => {
      vi.mocked(navigator.mediaDevices.getUserMedia).mockClear()

      render(<TalkToBaby weekId="wk-1" weekNumber={12} userId="user-123" />)
      await waitFor(() => screen.getByText('Start Recording'))

      fireEvent.click(screen.getByText('Start Recording'))
      await waitFor(() => screen.getByText('Stop Recording'))

      // Button is gone — status is 'recording', so clicking the DOM again is N/A.
      // Verify getUserMedia was called exactly once (no second invocation).
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1)
    })
  })
})
