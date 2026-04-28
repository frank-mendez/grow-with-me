# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Grow With Me** is a web-first pregnancy journey app for expecting mothers. The goal is emotional connection and visual storytelling — not just data tracking. It is currently in the bootstrapping phase (no application code exists yet).

## Planned Tech Stack

### Web MVP
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Animation:** Rive or Lottie, Framer Motion
- **Auth:** NextAuth / Auth.js
- **Database:** PostgreSQL or Supabase
- **Storage:** S3 or Supabase Storage (voice recordings)
- **API:** Next.js API routes (or a separate Node.js service)

### Future Mobile
- React Native (Expo) or Flutter with a shared API layer

## Core Features (MVP)

1. **Baby Timeline** — Week-by-week visual development with swipe/scroll navigation, tap to reveal baby size and highlights
2. **Talk to Baby** — Record and save voice messages per week, with womb-effect playback
3. **Kick Play** — Tap-based kick logger with ripple/sparkle animations and daily summaries
4. **Mood Garden** — Daily mood input that drives a visual garden (blooms on positive mood, subtle changes on stress)

## Design Principles

- Favor delightful, animated interactions over static dashboards
- Emotional resonance is a first-class feature — UX decisions should reinforce bonding, not just utility
- Web app ships first; keep the API layer clean enough to be consumed by a future mobile app
