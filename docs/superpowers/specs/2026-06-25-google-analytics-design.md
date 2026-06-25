# Google Analytics Setup — Design Spec

**Date:** 2026-06-25
**Issue:** [#10](https://github.com/frank-mendez/grow-with-me/issues/10)
**Measurement ID:** `G-WV5Q3KHX1S`

## Overview

Add Google Analytics 4 to the Grow With Me Next.js App Router application. Tracking fires only in production to keep analytics data clean.

## Approach

Use the official `@next/third-parties` package, which provides a `<GoogleAnalytics>` component optimized for Next.js. It injects the gtag script with `afterInteractive` strategy and GA4 auto-tracks client-side page navigation.

## Changes

### 1. Dependency

```
npm install @next/third-parties
```

### 2. Environment variables

**`.env.local`** — add:
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-WV5Q3KHX1S
```

**`.env.example`** — add:
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

### 3. Root layout (`app/layout.tsx`)

Import `GoogleAnalytics` from `@next/third-parties/google` and render it inside `<html>` only in true production. Vercel sets `NODE_ENV=production` on preview deployments too, so use `VERCEL_ENV` as the primary discriminator when running on Vercel:

```tsx
import { GoogleAnalytics } from '@next/third-parties/google'

// inside RootLayout return, before </html>:
{process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID &&
  (process.env.VERCEL_ENV === 'production' ||
    (!process.env.VERCEL_ENV && process.env.NODE_ENV === 'production')) && (
    <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
  )}
```

## Constraints

- GA never fires on `localhost` or Vercel preview deployments. On Vercel, `VERCEL_ENV === 'production'` is the guard (Vercel sets `NODE_ENV=production` on previews too). Outside Vercel, `NODE_ENV === 'production'` is the fallback.
- No custom event tracking in scope — GA4 auto-collects pageviews on SPA navigation.
- No additional abstraction layer needed.
