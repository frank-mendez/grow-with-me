# Theme System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 4-theme system (Botanical Calm, Soft Blossom, Midnight Glow, Minimal Light) with CSS custom properties, dynamic Google Fonts, localStorage persistence with no-flash architecture, and a 2×2 preview card selector on the Settings page.

**Architecture:** A `data-theme` attribute on `<html>` drives CSS variable blocks defined in `globals.css`. An inline blocking script reads `localStorage` before first paint to set that attribute. A `ThemeProvider` React context exposes `setTheme` to client components. All legacy CSS variables (`--gold`, `--cream`, `--forest`, etc.) are re-aliased per theme so existing component code adapts automatically; only hardcoded `rgba(...)` values need surgical migration.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, `next/font/google`, Vitest + React Testing Library

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `lib/themes.ts` | Theme IDs, preview data (colors, names, emoji) used by ThemeSelector |
| Create | `components/theme/ThemeProvider.tsx` | React context — exposes `{ theme, setTheme }`, syncs `data-theme` attribute + `localStorage` |
| Create | `components/theme/ThemeSelector.tsx` | 2×2 grid of mini preview cards rendered in Settings page |
| Create | `__tests__/lib/themes.test.ts` | Data integrity tests |
| Create | `__tests__/components/theme/ThemeProvider.test.tsx` | Context + persistence tests |
| Create | `__tests__/components/theme/ThemeSelector.test.tsx` | Render + interaction tests |
| Modify | `app/globals.css` | Replace `:root` block with 4 `[data-theme="X"]` blocks; add transition rule |
| Modify | `app/layout.tsx` | Add 6 new Google Fonts; add inline blocking script; wrap with ThemeProvider |
| Modify | `app/(dashboard)/settings/page.tsx` | Add `<ThemeSelector />` below due-date form |
| Modify | `components/ui/HamburgerMenu.tsx` | Hardcoded overlay rgba → `var(--overlay-bg)` |
| Modify | `components/timeline/WeekDetailPanel.tsx` | Hardcoded card/circle rgba → semantic CSS vars |
| Modify | `app/(dashboard)/layout.tsx` | `var(--forest)` / `var(--forest-mid)` → `var(--bg)` / `var(--card)` |

---

## Task 1: Theme definitions

**Files:**
- Create: `lib/themes.ts`
- Create: `__tests__/lib/themes.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// __tests__/lib/themes.test.ts
import { describe, it, expect } from 'vitest'
import { themes, DEFAULT_THEME } from '@/lib/themes'

describe('themes', () => {
  it('has exactly 4 themes', () => {
    expect(themes).toHaveLength(4)
  })

  it('contains botanical, blossom, midnight, light IDs', () => {
    const ids = themes.map((t) => t.id)
    expect(ids).toContain('botanical')
    expect(ids).toContain('blossom')
    expect(ids).toContain('midnight')
    expect(ids).toContain('light')
  })

  it('each theme has all required preview fields', () => {
    for (const t of themes) {
      expect(t.id).toBeTruthy()
      expect(t.name).toBeTruthy()
      expect(t.emoji).toBeTruthy()
      expect(t.bg).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(t.card).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(t.accent).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })

  it('DEFAULT_THEME is botanical', () => {
    expect(DEFAULT_THEME).toBe('botanical')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/lib/themes.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/themes'`

- [ ] **Step 3: Create `lib/themes.ts`**

```ts
export type ThemeId = 'botanical' | 'blossom' | 'midnight' | 'light'

export interface ThemePreview {
  id: ThemeId
  name: string
  emoji: string
  bg: string
  card: string
  accent: string
  text: string
  borderColor: string
}

export const themes: ThemePreview[] = [
  {
    id: 'botanical',
    name: 'Botanical Calm',
    emoji: '🌿',
    bg: '#0F2A1D',
    card: '#183826',
    accent: '#E7C98B',
    text: '#F5F5F5',
    borderColor: 'rgba(231, 201, 139, 0.18)',
  },
  {
    id: 'blossom',
    name: 'Soft Blossom',
    emoji: '🌸',
    bg: '#2D1B25',
    card: '#3D2535',
    accent: '#E8B4C0',
    text: '#FFE8EE',
    borderColor: 'rgba(232, 180, 192, 0.18)',
  },
  {
    id: 'midnight',
    name: 'Midnight Glow',
    emoji: '🌙',
    bg: '#0D1B30',
    card: '#152440',
    accent: '#B8A8DC',
    text: '#DCD8F0',
    borderColor: 'rgba(176, 160, 220, 0.18)',
  },
  {
    id: 'light',
    name: 'Minimal Light',
    emoji: '☁️',
    bg: '#F8F4EE',
    card: '#FFFFFF',
    accent: '#8B7355',
    text: '#2A1F14',
    borderColor: 'rgba(139, 115, 85, 0.14)',
  },
]

export const DEFAULT_THEME: ThemeId = 'botanical'
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- __tests__/lib/themes.test.ts
```

Expected: PASS — 4 tests

- [ ] **Step 5: Commit**

```bash
git add lib/themes.ts __tests__/lib/themes.test.ts
git commit -m "feat: add theme definitions"
```

---

## Task 2: CSS variable system

**Files:**
- Modify: `app/globals.css`

No unit tests — verify visually after Task 5 wires up the provider.

- [ ] **Step 1: Replace `app/globals.css`**

Replace the entire file with the following. All animations are preserved unchanged. The key changes: (1) `:root` becomes 4 `[data-theme="X"]` blocks, each with 13 semantic tokens + legacy aliases so existing `var(--gold)`, `var(--cream)`, `var(--forest)` component code adapts automatically. (2) `body` switches to semantic tokens. (3) A `prefers-reduced-motion`-gated transition rule is added at the end.

```css
@import "tailwindcss";

/* ─────────────────────────────────────────────────────────────
   THEMES  — each block defines 13 semantic tokens + legacy
   aliases so existing var(--gold/--cream/--forest) code adapts
   automatically without touching individual components.
   ───────────────────────────────────────────────────────────── */

:root,
[data-theme="botanical"] {
  /* Semantic tokens */
  --bg:             #0F2A1D;
  --card:           #183826;
  --card-alt:       rgba(20, 43, 31, 0.9);
  --card-border:    rgba(231, 201, 139, 0.18);
  --overlay-bg:     rgba(11, 26, 20, 0.97);
  --accent:         #E7C98B;
  --accent-dim:     rgba(231, 201, 139, 0.15);
  --text:           #F5F5F5;
  --text-dim:       rgba(245, 245, 245, 0.5);
  --text-on-accent: #0F2A1D;
  --font-heading:   var(--font-cormorant);
  --font-body:      var(--font-inter);
  --glow:           rgba(231, 201, 139, 0.15);

  /* Legacy aliases */
  --forest:       #0F2A1D;
  --forest-mid:   #183826;
  --forest-light: #1e3d2c;
  --gold:         #E7C98B;
  --gold-light:   #F0D89E;
  --blush:        rgba(232, 168, 152, 0.6);
  --cream:        #F5F5F5;
  --cream-dim:    rgba(245, 245, 245, 0.5);
}

[data-theme="blossom"] {
  /* Semantic tokens */
  --bg:             #2D1B25;
  --card:           #3D2535;
  --card-alt:       rgba(55, 28, 44, 0.9);
  --card-border:    rgba(232, 180, 192, 0.18);
  --overlay-bg:     rgba(28, 10, 20, 0.97);
  --accent:         #E8B4C0;
  --accent-dim:     rgba(232, 180, 192, 0.15);
  --text:           #FFE8EE;
  --text-dim:       rgba(255, 232, 238, 0.5);
  --text-on-accent: #2D1B25;
  --font-heading:   var(--font-playfair);
  --font-body:      var(--font-nunito);
  --glow:           rgba(232, 180, 192, 0.15);

  /* Legacy aliases */
  --forest:       #2D1B25;
  --forest-mid:   #3D2535;
  --forest-light: rgba(55, 28, 44, 0.8);
  --gold:         #E8B4C0;
  --gold-light:   #F0C8D4;
  --blush:        rgba(232, 180, 192, 0.6);
  --cream:        #FFE8EE;
  --cream-dim:    rgba(255, 232, 238, 0.5);
}

[data-theme="midnight"] {
  /* Semantic tokens */
  --bg:             #0D1B30;
  --card:           #152440;
  --card-alt:       rgba(18, 32, 56, 0.9);
  --card-border:    rgba(176, 160, 220, 0.18);
  --overlay-bg:     rgba(8, 12, 24, 0.97);
  --accent:         #B8A8DC;
  --accent-dim:     rgba(184, 168, 220, 0.15);
  --text:           #DCD8F0;
  --text-dim:       rgba(220, 216, 240, 0.5);
  --text-on-accent: #0D1B30;
  --font-heading:   var(--font-lora);
  --font-body:      var(--font-inter);
  --glow:           rgba(184, 168, 220, 0.15);

  /* Legacy aliases */
  --forest:       #0D1B30;
  --forest-mid:   #152440;
  --forest-light: rgba(18, 32, 56, 0.8);
  --gold:         #B8A8DC;
  --gold-light:   #CCC0E8;
  --blush:        rgba(184, 168, 220, 0.6);
  --cream:        #DCD8F0;
  --cream-dim:    rgba(220, 216, 240, 0.5);
}

[data-theme="light"] {
  /* Semantic tokens */
  --bg:             #F8F4EE;
  --card:           #FFFFFF;
  --card-alt:       #F0EBE2;
  --card-border:    rgba(139, 115, 85, 0.14);
  --overlay-bg:     rgba(248, 244, 238, 0.97);
  --accent:         #8B7355;
  --accent-dim:     rgba(139, 115, 85, 0.12);
  --text:           #2A1F14;
  --text-dim:       rgba(42, 31, 20, 0.5);
  --text-on-accent: #FFFFFF;
  --font-heading:   var(--font-dm-serif);
  --font-body:      var(--font-manrope);
  --glow:           rgba(139, 115, 85, 0.12);

  /* Legacy aliases */
  --forest:       #F8F4EE;
  --forest-mid:   #FFFFFF;
  --forest-light: #F0EBE2;
  --gold:         #8B7355;
  --gold-light:   #A08060;
  --blush:        rgba(139, 115, 85, 0.4);
  --cream:        #2A1F14;
  --cream-dim:    rgba(42, 31, 20, 0.5);
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body, sans-serif);
  overflow-x: hidden;
}

/* ── Floating particles ─────────────────────────────────── */
@keyframes float-up {
  0%   { transform: translateY(0)   translateX(0)   scale(1);   opacity: 0; }
  10%  { opacity: 0.7; }
  90%  { opacity: 0.3; }
  100% { transform: translateY(-80vh) translateX(30px) scale(0.4); opacity: 0; }
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: var(--gold-light);
  animation: float-up linear infinite;
  pointer-events: none;
}

/* ── Heartbeat pulse ────────────────────────────────────── */
@keyframes heartbeat {
  0%, 100% { transform: scale(1);   opacity: 1; }
  14%       { transform: scale(1.15); opacity: 1; }
  28%       { transform: scale(1);   opacity: 1; }
  42%       { transform: scale(1.08); opacity: 0.9; }
  70%       { transform: scale(1);   opacity: 1; }
}
.heartbeat { animation: heartbeat 2.2s ease-in-out infinite; }

/* ── Shimmer button ─────────────────────────────────────── */
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200%  center; }
}
.btn-shimmer {
  background: linear-gradient(
    90deg,
    var(--gold) 0%,
    var(--gold-light) 40%,
    var(--gold) 60%,
    var(--gold) 100%
  );
  background-size: 200% auto;
  animation: shimmer 3s linear infinite;
}

/* ── Gentle reveal ──────────────────────────────────────── */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-up { animation: fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; }

/* ── Leaf sway ──────────────────────────────────────────── */
@keyframes sway {
  0%, 100% { transform: rotate(-2deg); }
  50%       { transform: rotate(2deg);  }
}
.sway { animation: sway 6s ease-in-out infinite; transform-origin: bottom center; }
.sway-alt { animation: sway 8s ease-in-out infinite reverse; transform-origin: bottom center; }

/* ── Radial glow pulse ──────────────────────────────────── */
@keyframes glow-pulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50%       { opacity: 0.7; transform: scale(1.1); }
}
.glow-pulse { animation: glow-pulse 4s ease-in-out infinite; }

/* ── Music bar equaliser ────────────────────────────────── */
@keyframes music-bar {
  from { transform: scaleY(0.25); }
  to   { transform: scaleY(1); }
}

/* ── Hide scrollbar cross-browser ───────────────────────── */
.no-scrollbar { scrollbar-width: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }

/* ── Baby visual ambient particle ───────────────────────── */
@keyframes baby-particle {
  0%   { transform: translate(-50%, -50%) scale(1); opacity: 0; }
  15%  { opacity: 0.85; }
  85%  { opacity: 0.25; }
  100% { transform: translate(-50%, calc(-50% - 22px)) scale(0.35); opacity: 0; }
}
.baby-particle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  animation: baby-particle ease-in-out infinite;
}

/* ── Theme transition ───────────────────────────────────── */
@media (prefers-reduced-motion: no-preference) {
  *, *::before, *::after {
    transition:
      background-color 0.35s ease,
      border-color 0.35s ease,
      color 0.25s ease,
      box-shadow 0.35s ease;
  }
}
```

- [ ] **Step 2: Run the full test suite to confirm nothing broke**

```bash
npm test
```

Expected: All existing tests PASS. (CSS changes do not affect unit tests.)

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: replace root vars with per-theme CSS variable blocks"
```

---

## Task 3: Font loading

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace the font imports and html className in `app/layout.tsx`**

Replace the entire file with:

```tsx
import type { Metadata } from 'next'
import {
  Cormorant_Garamond,
  DM_Sans,
  Inter,
  Playfair_Display,
  Nunito,
  Lora,
  DM_Serif_Display,
  Manrope,
} from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
})

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
})

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
})

const dmSerif = DM_Serif_Display({
  variable: '--font-dm-serif',
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
})

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'Grow With Me — Your Pregnancy Journey',
  description:
    'A beautiful week-by-week pregnancy companion. Track kicks, record messages to your baby, and watch your garden of moods bloom.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} ${inter.variable} ${playfair.variable} ${nunito.variable} ${lora.variable} ${dmSerif.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Verify the build compiles**

```bash
npm run build 2>&1 | tail -20
```

Expected: Build succeeds. Watch for any `next/font` import errors — font names must match exactly (use underscores for spaces: `DM_Serif_Display`, `Playfair_Display`).

- [ ] **Step 3: Run tests to confirm nothing broke**

```bash
npm test
```

Expected: All tests PASS.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: pre-load all 8 theme fonts in root layout"
```

---

## Task 4: ThemeProvider

**Files:**
- Create: `components/theme/ThemeProvider.tsx`
- Create: `__tests__/components/theme/ThemeProvider.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
// __tests__/components/theme/ThemeProvider.test.tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { ThemeProvider, useTheme } from '@/components/theme/ThemeProvider'

function TestConsumer() {
  const { theme, setTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme('blossom')}>switch</button>
    </div>
  )
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

describe('ThemeProvider', () => {
  it('provides default theme (botanical) when no data-theme is set', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )
    expect(screen.getByTestId('theme').textContent).toBe('botanical')
  })

  it('reads data-theme attribute from document on mount', async () => {
    document.documentElement.setAttribute('data-theme', 'midnight')
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )
    await act(async () => {})
    expect(screen.getByTestId('theme').textContent).toBe('midnight')
  })

  it('setTheme updates the data-theme attribute on document', async () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )
    await act(async () => {
      fireEvent.click(screen.getByText('switch'))
    })
    expect(document.documentElement.getAttribute('data-theme')).toBe('blossom')
  })

  it('setTheme writes the theme id to localStorage', async () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )
    await act(async () => {
      fireEvent.click(screen.getByText('switch'))
    })
    expect(localStorage.getItem('gwm-theme')).toBe('blossom')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- __tests__/components/theme/ThemeProvider.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/theme/ThemeProvider'`

- [ ] **Step 3: Create `components/theme/ThemeProvider.tsx`**

```tsx
'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { DEFAULT_THEME, type ThemeId } from '@/lib/themes'

interface ThemeContextValue {
  theme: ThemeId
  setTheme: (id: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME)

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme') as ThemeId | null
    if (current) setThemeState(current)
  }, [])

  function setTheme(id: ThemeId) {
    setThemeState(id)
    document.documentElement.setAttribute('data-theme', id)
    try {
      localStorage.setItem('gwm-theme', id)
    } catch {
      // storage unavailable — silently ignore
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- __tests__/components/theme/ThemeProvider.test.tsx
```

Expected: PASS — 4 tests

- [ ] **Step 5: Commit**

```bash
git add components/theme/ThemeProvider.tsx __tests__/components/theme/ThemeProvider.test.tsx
git commit -m "feat: add ThemeProvider context with localStorage persistence"
```

---

## Task 5: Wire inline blocking script + ThemeProvider into root layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Add the blocking script and ThemeProvider to `app/layout.tsx`**

Replace the `export default function RootLayout` in `app/layout.tsx` with:

```tsx
import { ThemeProvider } from '@/components/theme/ThemeProvider'

// (keep all font declarations from Task 3 — only the function body changes)

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} ${inter.variable} ${playfair.variable} ${nunito.variable} ${lora.variable} ${dmSerif.variable} ${manrope.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('gwm-theme')||'botanical';document.documentElement.setAttribute('data-theme',t);}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Run the dev server and verify no theme flash**

```bash
npm run dev
```

Open http://localhost:3000 in the browser. Switch to Soft Blossom in the app (not yet built — skip for now). Reload — confirms blocking script fires before paint once ThemeSelector is wired in Task 7.

- [ ] **Step 3: Run the full test suite**

```bash
npm test
```

Expected: All tests PASS. The inline script uses `dangerouslySetInnerHTML` which RTL ignores cleanly.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: add no-flash blocking script and ThemeProvider to root layout"
```

---

## Task 6: ThemeSelector component

**Files:**
- Create: `components/theme/ThemeSelector.tsx`
- Create: `__tests__/components/theme/ThemeSelector.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
// __tests__/components/theme/ThemeSelector.test.tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { ThemeSelector } from '@/components/theme/ThemeSelector'
import { themes } from '@/lib/themes'

function renderWithProvider(initialTheme = 'botanical') {
  document.documentElement.setAttribute('data-theme', initialTheme)
  return render(
    <ThemeProvider>
      <ThemeSelector />
    </ThemeProvider>
  )
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

describe('ThemeSelector', () => {
  it('renders a button for all 4 themes', async () => {
    renderWithProvider()
    await act(async () => {})
    for (const t of themes) {
      expect(
        screen.getByRole('button', { name: `Select ${t.name} theme` })
      ).toBeInTheDocument()
    }
  })

  it('marks the active theme button as aria-pressed', async () => {
    renderWithProvider('botanical')
    await act(async () => {})
    expect(
      screen.getByRole('button', { name: 'Select Botanical Calm theme' })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('button', { name: 'Select Soft Blossom theme' })
    ).toHaveAttribute('aria-pressed', 'false')
  })

  it('updates data-theme and localStorage when a theme card is clicked', async () => {
    const user = userEvent.setup()
    renderWithProvider('botanical')
    await act(async () => {})
    await user.click(screen.getByRole('button', { name: 'Select Midnight Glow theme' }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('midnight')
    expect(localStorage.getItem('gwm-theme')).toBe('midnight')
  })

  it('shows the active theme name in the status label', async () => {
    renderWithProvider('blossom')
    await act(async () => {})
    expect(screen.getByText('Soft Blossom is active')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- __tests__/components/theme/ThemeSelector.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/theme/ThemeSelector'`

- [ ] **Step 3: Create `components/theme/ThemeSelector.tsx`**

```tsx
'use client'
import { themes } from '@/lib/themes'
import { useTheme } from '@/components/theme/ThemeProvider'

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const active = themes.find((t) => t.id === theme)

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--card-border)',
        borderRadius: 14,
        padding: 16,
      }}
    >
      <p
        style={{
          fontSize: 10,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          marginBottom: 4,
        }}
      >
        Appearance
      </p>
      <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>
        Choose a visual atmosphere for your journey
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {themes.map((t) => {
          const isActive = theme === t.id
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={isActive}
              aria-label={`Select ${t.name} theme`}
              onClick={() => setTheme(t.id)}
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                border: isActive
                  ? `2px solid ${t.accent}`
                  : '1px solid rgba(128, 128, 128, 0.15)',
                cursor: 'pointer',
                padding: 0,
                background: 'transparent',
                position: 'relative',
                textAlign: 'left',
              }}
            >
              {/* Preview area */}
              <div style={{ background: t.bg, padding: '10px 10px 6px' }}>
                <div
                  style={{
                    height: 5,
                    background: t.accent,
                    opacity: 0.3,
                    borderRadius: 3,
                    marginBottom: 4,
                    width: '55%',
                  }}
                />
                <div
                  style={{
                    height: 9,
                    background: t.text,
                    opacity: 0.75,
                    borderRadius: 3,
                    marginBottom: 3,
                  }}
                />
                <div
                  style={{
                    height: 4,
                    background: t.text,
                    opacity: 0.25,
                    borderRadius: 3,
                    width: '75%',
                    marginBottom: 6,
                  }}
                />
                <div
                  style={{
                    height: 6,
                    background: t.accent,
                    borderRadius: 4,
                    width: '50%',
                  }}
                />
              </div>

              {/* Name label */}
              <div
                style={{
                  background: t.bg,
                  padding: '5px 10px 8px',
                  borderTop: `1px solid ${t.borderColor}`,
                }}
              >
                <p style={{ fontSize: 9, color: t.accent, margin: 0 }}>{t.name}</p>
              </div>

              {/* Active checkmark badge */}
              {isActive && (
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: 7,
                    right: 7,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: t.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ color: t.bg, fontSize: 9, fontWeight: 700, lineHeight: 1 }}>
                    ✓
                  </span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {active && (
        <p
          style={{
            fontSize: 9,
            color: 'var(--text-dim)',
            marginTop: 10,
            textAlign: 'center',
            letterSpacing: '0.05em',
          }}
        >
          {active.name} is active
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- __tests__/components/theme/ThemeSelector.test.tsx
```

Expected: PASS — 4 tests

- [ ] **Step 5: Run the full test suite**

```bash
npm test
```

Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
git add components/theme/ThemeSelector.tsx __tests__/components/theme/ThemeSelector.test.tsx
git commit -m "feat: add ThemeSelector 2x2 preview card grid"
```

---

## Task 7: Add ThemeSelector to Settings page

**Files:**
- Modify: `app/(dashboard)/settings/page.tsx`

- [ ] **Step 1: Add ThemeSelector below the due-date form**

Replace the entire `app/(dashboard)/settings/page.tsx` with:

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { Header } from '@/components/ui/header'
import { ThemeSelector } from '@/components/theme/ThemeSelector'
import type { Profile } from '@/types/database'
import { saveDueDate } from './actions'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('due_date')
    .eq('id', user.id)
    .single<Pick<Profile, 'due_date'>>()

  return (
    <Container className="pt-6">
      <div className="fade-up mb-8">
        <Header eyebrow="Personalize" title="Settings" />
      </div>

      <div className="flex flex-col gap-4 fade-up">
        <form action={saveDueDate}>
          <div
            className="rounded-2xl p-6"
            style={{ background: 'var(--card)', border: '1px solid var(--card-border)' }}
          >
            <label className="block mb-5">
              <p
                className="text-xs tracking-widest uppercase mb-1"
                style={{ color: 'var(--accent)' }}
              >
                Due Date
              </p>
              <p className="text-xs mb-3" style={{ color: 'var(--text-dim)' }}>
                Used to calculate your current week of pregnancy
              </p>
              <input
                type="date"
                name="due_date"
                defaultValue={profile?.due_date ?? ''}
                required
                className="w-full rounded-lg px-4 py-3 text-sm outline-none focus:ring-1"
                style={{
                  background: 'var(--card-alt)',
                  border: '1px solid var(--card-border)',
                  color: 'var(--text)',
                  colorScheme: 'dark',
                }}
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-xl py-3 text-sm font-medium tracking-wide transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
            >
              Save
            </button>
          </div>
        </form>

        <ThemeSelector />
      </div>
    </Container>
  )
}
```

- [ ] **Step 2: Run the existing settings tests**

```bash
npm test -- __tests__/app/settings.test.tsx
```

Expected: All 4 existing settings tests PASS. ThemeSelector renders with context defaults and does not interfere.

- [ ] **Step 3: Run the full test suite**

```bash
npm test
```

Expected: All tests PASS.

- [ ] **Step 4: Commit**

```bash
git add app/(dashboard)/settings/page.tsx
git commit -m "feat: add ThemeSelector to Settings page"
```

---

## Task 8: Migrate hardcoded colors to CSS variables

**Files:**
- Modify: `components/ui/HamburgerMenu.tsx`
- Modify: `components/timeline/WeekDetailPanel.tsx`
- Modify: `app/(dashboard)/layout.tsx`

This task replaces hardcoded `rgba(...)` color values that cannot adapt to themes via CSS aliases. No behavior changes — styling only.

- [ ] **Step 1: Update `components/ui/HamburgerMenu.tsx`**

Find the overlay `<div>` (line ~68) with `background: 'rgba(11,26,20,0.97)'` and change it to `var(--overlay-bg)`. Also update the sign-out button border.

Two changes in the file:

Change 1 — overlay background:
```tsx
// Before
background: 'rgba(11,26,20,0.97)',

// After
background: 'var(--overlay-bg)',
```

Change 2 — sign-out button border (line ~125):
```tsx
// Before
border: '1px solid rgba(201,160,50,0.2)',

// After
border: '1px solid var(--card-border)',
```

- [ ] **Step 2: Update `StatCircle` in `components/timeline/WeekDetailPanel.tsx`**

The `StatCircle` function (line ~116) has two hardcoded values:

```tsx
// Before
function StatCircle({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: '50%',
        background: 'rgba(20,43,31,0.9)',
        border: '1px solid rgba(201,160,50,0.22)',
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

// After
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
```

- [ ] **Step 3: Update the "Just for you" card in `WeekDetailPanel.tsx`**

Find the just-for-you wrapper `<div>` (line ~355) and its inner icon circle (line ~370). Three hardcoded values to replace:

```tsx
// Outer card wrapper — Before
style={{
  padding: '1rem 1.25rem',
  background: 'rgba(14,32,22,0.75)',
  border: '1px solid rgba(201,160,50,0.14)',
  borderRadius: 14,
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
}}

// Outer card wrapper — After
style={{
  padding: '1rem 1.25rem',
  background: 'var(--card)',
  border: '1px solid var(--card-border)',
  borderRadius: 14,
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
}}
```

```tsx
// Icon circle — Before
style={{
  width: 36,
  height: 36,
  borderRadius: '50%',
  background: 'rgba(201,160,50,0.12)',
  border: '1px solid rgba(201,160,50,0.22)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}}

// Icon circle — After
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
```

- [ ] **Step 4: Update `app/(dashboard)/layout.tsx`**

Two values to change for explicitness (functionally covered by aliases but cleaner):

```tsx
// Page wrapper — Before
style={{ minHeight: '100dvh', background: 'var(--forest)' }}

// Page wrapper — After
style={{ minHeight: '100dvh', background: 'var(--bg)' }}
```

```tsx
// Header — Before
style={{
  background: 'var(--forest-mid)',
  borderBottom: '1px solid rgba(201,160,50,0.12)',
}}

// Header — After
style={{
  background: 'var(--card)',
  borderBottom: '1px solid var(--card-border)',
}}
```

- [ ] **Step 5: Run the full test suite**

```bash
npm test
```

Expected: All tests PASS. These are styling-only changes — no behavior affected.

- [ ] **Step 6: Commit**

```bash
git add components/ui/HamburgerMenu.tsx components/timeline/WeekDetailPanel.tsx app/(dashboard)/layout.tsx
git commit -m "feat: migrate hardcoded rgba colors to semantic CSS variables"
```

---

## Task 9: Final verification

- [ ] **Step 1: Run the complete test suite one last time**

```bash
npm test
```

Expected: All tests PASS.

- [ ] **Step 2: Start the dev server and manually verify all 4 themes**

```bash
npm run dev
```

Open http://localhost:3000, sign in, go to `/settings`.

Manual checks:
1. **Botanical Calm** (default) — deep green background, gold accents, cream text. Identical to pre-implementation look.
2. **Soft Blossom** — switch theme. Plum background, rose accents, warm white text. Cormorant→Playfair Display heading font.
3. **Midnight Glow** — deep navy background, lavender accents, cool gray text.
4. **Minimal Light** — white/beige background, warm brown accents, dark text. Light mode feel.
5. Reload the page with each theme selected — no flash of incorrect theme on reload.
6. Navigate between pages while in non-default theme — theme persists.
7. Open hamburger menu in each theme — overlay background adapts.
8. Timeline page in each theme — week cards, stat circles, just-for-you card all adapt.

- [ ] **Step 3: Commit if any final tweaks were needed, then push**

```bash
git push origin feature/phase-6
```
