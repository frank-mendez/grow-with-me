import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderToString } from 'react-dom/server'

vi.mock('next/font/google', () => {
  const font = () => ({ variable: 'mock-font-var', className: 'mock-font-class' })
  return {
    Cormorant_Garamond: font,
    DM_Sans: font,
    Inter: font,
    Playfair_Display: font,
    Nunito: font,
    Lora: font,
    DM_Serif_Display: font,
    Manrope: font,
  }
})

vi.mock('@next/third-parties/google', () => ({
  GoogleAnalytics: ({ gaId }: { gaId: string }) => (
    <div data-testid="google-analytics" data-ga-id={gaId} />
  ),
}))

const { default: RootLayout } = await import('@/app/layout')

describe('RootLayout', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('does not render GoogleAnalytics outside production', () => {
    // NODE_ENV is 'test' by default in Vitest
    const html = renderToString(<RootLayout><div>child</div></RootLayout>)
    expect(html).not.toContain('data-testid="google-analytics"')
  })

  it('renders GoogleAnalytics with the correct measurement ID in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', 'G-WV5Q3KHX1S')
    const html = renderToString(<RootLayout><div>child</div></RootLayout>)
    expect(html).toContain('data-testid="google-analytics"')
    expect(html).toContain('G-WV5Q3KHX1S')
  })
})
