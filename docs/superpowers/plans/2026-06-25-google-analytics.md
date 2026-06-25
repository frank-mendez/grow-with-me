# Google Analytics Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Google Analytics 4 to the Grow With Me app, firing only in production.

**Architecture:** Install `@next/third-parties`, store the measurement ID as a `NEXT_PUBLIC_` env var, and render `<GoogleAnalytics>` inside the root layout behind a `NODE_ENV === 'production'` guard.

**Tech Stack:** Next.js 16 App Router, `@next/third-parties`, Vitest + `react-dom/server`

## Global Constraints

- Measurement ID: `G-WV5Q3KHX1S`
- GA must NOT fire in `test` or `development` environments — guard with `process.env.NODE_ENV === 'production'`
- No custom event tracking in scope; GA4 auto-collects pageviews
- `app/layout.tsx` is excluded from coverage thresholds (`vitest.config.ts:16`) — tests still run but don't affect coverage gates

---

### Task 1: Install dependency and configure env vars

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `.env.local`
- Modify: `.env.example`

**Interfaces:**
- Produces: `NEXT_PUBLIC_GA_MEASUREMENT_ID` env var available to the app at runtime

- [ ] **Step 1: Install `@next/third-parties`**

```bash
npm install @next/third-parties
```

Expected output: package added to `dependencies` in `package.json`.

- [ ] **Step 2: Add measurement ID to `.env.local`**

Append to `.env.local`:
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-WV5Q3KHX1S
```

- [ ] **Step 3: Add placeholder to `.env.example`**

Append to `.env.example`:
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "chore: install @next/third-parties and add GA env var placeholder"
```

Note: do NOT stage `.env.local` — it holds the real ID and is gitignored.

---

### Task 2: Add GoogleAnalytics to root layout

**Files:**
- Modify: `app/layout.tsx`
- Create: `__tests__/app/layout.test.tsx`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_GA_MEASUREMENT_ID` env var from Task 1
- Consumes: `GoogleAnalytics` from `@next/third-parties/google` — signature: `({ gaId: string }) => JSX.Element`

**Testing note:** `app/layout.tsx` renders `<html>/<body>` directly, so use `renderToString` from `react-dom/server` rather than `@testing-library/react` to avoid jsdom DOM-nesting issues. Also, the layout calls 8 `next/font/google` constructor functions at module load time — mock all of them or the import will fail.

- [ ] **Step 1: Write the failing tests**

Create `__tests__/app/layout.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- __tests__/app/layout.test.tsx
```

Expected: first test may pass (GA not rendered), second test fails because `@next/third-parties/google` is not yet wired into the layout.

- [ ] **Step 3: Update `app/layout.tsx`**

Add import at the top, after the existing imports:

```tsx
import { GoogleAnalytics } from '@next/third-parties/google'
```

Add the component just before the closing `</html>` tag. The full updated return block:

```tsx
return (
  <html
    lang="en"
    className={`${cormorant.variable} ${dmSans.variable} ${inter.variable} ${playfair.variable} ${nunito.variable} ${lora.variable} ${dmSerif.variable} ${manrope.variable} h-full antialiased`}
  >
    <head>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var v=['botanical','blossom','midnight','light'];var t=localStorage.getItem('gwm-theme');document.documentElement.setAttribute('data-theme',v.indexOf(t)>-1?t:'botanical');}catch(e){}})()`,
        }}
      />
    </head>
    <body className="min-h-full flex flex-col">
      <ThemeProvider>{children}</ThemeProvider>
    </body>
    {process.env.NODE_ENV === 'production' && (
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!} />
    )}
  </html>
)
```

- [ ] **Step 4: Run layout tests to confirm they pass**

```bash
npm test -- __tests__/app/layout.test.tsx
```

Expected: both tests pass.

- [ ] **Step 5: Run the full test suite to confirm no regressions**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx __tests__/app/layout.test.tsx
git commit -m "feat: add Google Analytics 4 via @next/third-parties (production only)"
```
