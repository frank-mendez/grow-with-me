# Theme System Design — Grow With Me

**Date:** 2026-05-08
**Phase:** 6
**Status:** Approved

---

## Overview

A flexible theming system that lets users choose a visual atmosphere for the app. Four themes are supported at launch. The system is built entirely without external theming libraries using CSS custom properties, `next/font/google`, and a `data-theme` attribute on `<html>`.

The experience should feel premium and emotional — switching themes changes the atmosphere of the app, not just the colors.

---

## Decisions Made

| Decision | Choice |
|---|---|
| Theme selector location | Settings page (`/settings`), below the due-date form |
| Persistence | `localStorage` + inline blocking script (no flash on reload) |
| Minimal Light style | True light mode — dark text on white/beige backgrounds |
| Theme preview cards | 2×2 mini wireframe grid. Active theme: colored ring + checkmark. |
| Architecture | `data-theme` attribute on `<html>` + CSS variable blocks per theme |

---

## The 4 Themes

### 🌿 Botanical Calm (default — matches current app look)
- **Mood:** Warm, organic, grounding
- **Palette:** Deep forest green · Gold · Cream
- **Colors:** `bg: #0F2A1D` · `card: #183826` · `accent: #E7C98B` · `text: #F5F5F5`
- **Fonts:** Cormorant Garamond (heading) + Inter (body)
- **id:** `botanical`

### 🌸 Soft Blossom
- **Mood:** Gentle, feminine, dreamy
- **Palette:** Dusty plum · Rose blush · Warm white
- **Colors:** `bg: #2D1B25` · `card: #3D2535` · `accent: #E8B4C0` · `text: #FFE8EE`
- **Fonts:** Playfair Display (heading) + Nunito (body)
- **id:** `blossom`

### 🌙 Midnight Glow
- **Mood:** Intimate, cozy, nighttime
- **Palette:** Deep navy · Soft lavender · Cool gray
- **Colors:** `bg: #0D1B30` · `card: #152440` · `accent: #B8A8DC` · `text: #DCD8F0`
- **Fonts:** Lora (heading) + Inter (body)
- **id:** `midnight`

### ☁️ Minimal Light
- **Mood:** Clean, bright, airy
- **Palette:** Warm white · Beige · Warm brown
- **Colors:** `bg: #F8F4EE` · `card: #FFFFFF` · `accent: #8B7355` · `text: #2A1F14`
- **Fonts:** DM Serif Display (heading) + Manrope (body)
- **id:** `light`

---

## CSS Variable Schema

13 tokens per theme, defined as `[data-theme="X"] { … }` blocks in `globals.css`.

```css
--bg              /* page background */
--card            /* card / primary surface background */
--card-alt        /* elevated surface: stat circles, input backgrounds */
--card-border     /* card border (rgba) */
--overlay-bg      /* hamburger menu full-screen overlay */
--accent          /* primary accent color */
--accent-dim      /* accent at low opacity (borders, glows) */
--text            /* primary text */
--text-dim        /* secondary / muted text */
--text-on-accent  /* text color on accent-colored buttons */
--font-heading    /* CSS var pointer → pre-loaded heading font */
--font-body       /* CSS var pointer → pre-loaded body font */
--glow            /* ambient particle / radial glow rgba */
```

Default (`:root, [data-theme="botanical"]`) preserves the current app's look exactly.

---

## Font Strategy

All 8 fonts pre-loaded at module level in `app/layout.tsx` via `next/font/google`. Each is exposed as a CSS variable. Theme blocks alias `--font-heading` and `--font-body` to the appropriate pre-loaded variable. Zero font flash, zero layout shift.

**Currently loaded:** `--font-cormorant`, `--font-dm-sans`

**To add:**
```
--font-inter         Inter (Botanical + Midnight body)
--font-playfair      Playfair Display (Blossom heading)
--font-nunito        Nunito (Blossom body)
--font-lora          Lora (Midnight heading)
--font-dm-serif      DM Serif Display (Light heading)
--font-manrope       Manrope (Light body)
```

---

## Theme Switching — No Flash Architecture

### Inline blocking script (in `<head>`, before first paint)

```ts
// In app/layout.tsx <head>
<script dangerouslySetInnerHTML={{ __html: `
  (function(){try{
    var t=localStorage.getItem('gwm-theme')||'botanical';
    document.documentElement.setAttribute('data-theme',t);
  }catch(e){}})()`
}} />
```

Runs synchronously before any paint. Reads localStorage, sets `data-theme` on `<html>`. Default is `botanical` so the app looks identical to today if no theme is stored.

### ThemeProvider

Client component wrapping the app. Responsibilities:
- Reads `data-theme` from `document.documentElement` on mount (already set by the inline script)
- Exposes `{ theme, setTheme }` via React context
- On `setTheme(id)`: sets `data-theme` attribute + writes to `localStorage`

### Transition

Applied globally so every surface fades together (color/atmosphere only — no layout jank):

```css
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

`width`, `height`, `font-size`, and `transform` are intentionally excluded. Users who prefer reduced motion get instant theme switches.

---

## Settings Page — ThemeSelector Component

Added below the existing due-date form inside a new card section labelled "Appearance".

Layout: 2×2 grid of mini wireframe preview cards. Each card shows:
- Background color fill
- Simulated text hierarchy (accent eyebrow, heading, body, button)
- Theme name in accent color at the bottom

Active state: accent-colored ring border (2px) + small checkmark badge (top-right) + faint "X is active" label below the grid.

Selecting a theme calls `setTheme(id)` from context immediately — no save button needed.

---

## Component Migration — Hardcoded Color Audit

These components have hardcoded dark `rgba` values that won't respond to `data-theme` automatically. Each is migrated to the matching CSS token:

| Component | Hardcoded value | Replaced with |
|---|---|---|
| `HamburgerMenu.tsx` | `rgba(11,26,20,0.97)` overlay bg | `var(--overlay-bg)` |
| `WeekDetailPanel.tsx` | `rgba(14,32,22,0.75)` just-for-you card bg | `var(--card)` |
| `WeekDetailPanel.tsx` | `rgba(20,43,31,0.9)` stat circles | `var(--card-alt)` |
| `settings/page.tsx` | `rgba(0,0,0,0.25)` date input | `var(--card-alt)` |
| `dashboard/layout.tsx` | `var(--forest)` page bg | `var(--bg)` |

SVG decorations in `WeekDetailPanel` (leaf branches, flower clusters) use `var(--forest-light)` fills — these will be aliased to `var(--card-alt)` so they remain visible across themes.

---

## Accessibility

- **Contrast:** All 4 themes maintain minimum 4.5:1 contrast for body text against their card backgrounds.
- **Minimal Light:** Dark text (`#2A1F14`) on white/beige passes AAA for all text sizes.
- **Transitions excluded from `prefers-reduced-motion`:** The CSS transition block will be wrapped in a `@media (prefers-reduced-motion: no-preference)` query so users who opt out of motion get instant switches.

---

## Files

### New
```
lib/themes.ts
components/theme/ThemeProvider.tsx
components/theme/ThemeSelector.tsx
```

### Modified
```
app/layout.tsx                        — fonts, inline script, ThemeProvider wrapper
app/globals.css                       — [data-theme="X"] blocks, transition rule
app/(dashboard)/layout.tsx            — var(--forest) → var(--bg)
app/(dashboard)/settings/page.tsx     — add <ThemeSelector />, migrate input color
components/ui/HamburgerMenu.tsx       — hardcoded overlay bg → var(--overlay-bg)
components/timeline/WeekDetailPanel.tsx — hardcoded rgba → CSS vars
```

---

## Out of Scope

- Per-user theme sync to Supabase (localStorage only for now)
- Custom theme builder
- Theme-specific Framer Motion animation variants
