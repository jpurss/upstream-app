---
description: "Summary of Phase 1 Plan 01 — Next.js 16 project bootstrap with Supabase SSR client split, shadcn/ui zinc dark, Geist fonts, dark mode theming with #4287FF primary, proxy.ts session refresh, full 8-table database schema with RLS policies and Auth Hook. Paused at Task 3 checkpoint awaiting Supabase project creation and schema deployment."
date_last_edited: 2026-03-25
phase: 01-foundation
plan: "01"
subsystem: foundation
tags: [bootstrap, nextjs, supabase, shadcn, tailwind, schema, rls, auth-hook]
requires: []
provides:
  - next-js-16-app-router-project
  - supabase-ssr-client-split
  - shadcn-ui-zinc-dark-components
  - geist-fonts-dark-mode-theme
  - proxy-ts-session-refresh
  - database-schema-migration-file
  - vitest-test-infrastructure
affects: []
tech_stack:
  added:
    - "next@16.2.1 — App Router framework with proxy.ts (renamed from middleware.ts)"
    - "@supabase/supabase-js@2.100.0 — Supabase JS client"
    - "@supabase/ssr@0.9.0 — Cookie-based SSR session management"
    - "tailwindcss@4.x — CSS-native config (no tailwind.config.js)"
    - "shadcn/ui@4.1.0 — Component scaffolding with zinc dark preset"
    - "geist@1.7.0 — GeistSans and GeistMono fonts"
    - "next-themes@0.4.6 — Dark mode SSR-safe toggle"
    - "lucide-react@1.6.0 — Icon library (shadcn default)"
    - "vitest@4.1.1 — Unit test runner with jsdom environment"
    - "@vitejs/plugin-react — React plugin for vitest"
    - "@testing-library/react — Component test utilities"
  patterns:
    - "Supabase SSR split: server.ts (createServerClient) / client.ts (createBrowserClient)"
    - "proxy.ts at project root — Next.js 16 renamed middleware.ts to proxy.ts"
    - "Auth Hook: custom_access_token_hook injects role into JWT app_metadata"
    - "RLS policies use auth.jwt()->'app_metadata'->>'role' (not auth.role())"
    - "ThemeProvider wraps all children with defaultTheme=dark"
    - "CSS variables for shadcn theming — #4287FF overrides primary in both :root and .dark"
key_files:
  created:
    - "lib/supabase/server.ts — Server-side Supabase client factory (createServerClient)"
    - "lib/supabase/client.ts — Browser-side Supabase client factory (createBrowserClient)"
    - "lib/supabase/middleware.ts — updateSession helper (uses getUser not getSession)"
    - "proxy.ts — Next.js 16 auth session refresh on every request"
    - "components/theme-provider.tsx — next-themes wrapper component"
    - "supabase/migrations/001_initial_schema.sql — Full 8-table schema + RLS + Auth Hook"
    - "vitest.config.ts — jsdom environment, passWithNoTests=true"
    - ".env.example — Supabase URL and publishable key placeholders"
    - "components/ui/{button,input,label,separator,badge,avatar,sidebar,sheet,skeleton,tooltip}.tsx"
    - "hooks/use-mobile.ts — shadcn sidebar mobile detection hook"
    - "lib/utils.ts — shadcn cn() utility"
  modified:
    - "app/layout.tsx — GeistSans/GeistMono vars, ThemeProvider defaultTheme=dark"
    - "app/globals.css — #4287FF primary, zinc-950 dark bg, zinc-900 cards/sidebar, zinc-800 border"
    - "app/page.tsx — Replaced with redirect('/login')"
    - "package.json — Added test/test:watch scripts"
    - ".gitignore — Added !.env.example exception"
decisions:
  - "Used geist npm package for fonts (GeistSans/GeistMono) rather than next/font/google — consistent with RESEARCH.md recommendation"
  - "Set passWithNoTests=true in vitest.config.ts to allow npm test to pass before any tests exist"
  - "shadcn 4.x uses new preset system — zinc-dark preset not available; initialized with --defaults then overrode CSS variables manually"
  - "AGENTS.md notes Next.js 16 breaking changes — verified proxy.ts naming convention is correct per node_modules/next/dist/docs"
---

# Phase 1 Plan 01: Bootstrap Next.js 16 Foundation — Summary

**One-liner:** Next.js 16 App Router + Supabase SSR split client + shadcn/ui zinc dark + #4287FF primary + proxy.ts session refresh + complete 8-table schema with RLS and Auth Hook SQL migration.

## Status

**Tasks 1 and 2 complete. Paused at Task 3 (human-action checkpoint): Supabase project creation and schema deployment.**

| Task | Name | Status | Commit |
|------|------|--------|--------|
| 1 | Bootstrap Next.js 16 project | COMPLETE | bd9f9b6 |
| 2 | Deploy full database schema | COMPLETE | c531845 |
| 3 | Create Supabase project and deploy schema | AWAITING HUMAN ACTION | — |

## What Was Built

### Task 1: Project Bootstrap

**Next.js 16 project** bootstrapped with all required dependencies:
- Supabase SSR client split (server/browser) in `lib/supabase/`
- `proxy.ts` at root (Next.js 16 renamed `middleware.ts` — research confirmed)
- shadcn/ui initialized with zinc dark; 10 components added (button, input, label, sidebar, sheet, avatar, badge, separator, skeleton, tooltip)
- Geist fonts via npm package (GeistSans variable, GeistMono for prompt content)
- Dark mode default via `next-themes` with `defaultTheme="dark"`
- `#4287FF` (Human Agency blue) wired as `--primary` CSS variable in both `:root` and `.dark`
- `#09090b` (zinc-950) as dark background, `#18181b` (zinc-900) for cards/sidebar
- Vitest configured with jsdom environment, `passWithNoTests: true`

### Task 2: Database Schema Migration

**318-line SQL migration** file at `supabase/migrations/001_initial_schema.sql`:
- 8 tables: profiles (2-role only), prompts, prompt_changelog, engagements, engagement_members, forked_prompts (with `original_content` snapshot), prompt_requests, request_upvotes
- 6 indexes including GIN fulltext on prompts
- RLS enabled on all 8 tables
- 12 RLS policies using `auth.jwt()->'app_metadata'->>'role'` (NOT deprecated `auth.role()`)
- `prompts_read_all` includes `anon` role for anonymous demo bypass users
- `custom_access_token_hook` function injects role from profiles into JWT `app_metadata`
- `supabase_auth_admin` grants for Auth Hook security
- `updated_at` trigger on prompts table
- No `'lead'` role anywhere (D-09 enforced)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] shadcn 4.x preset system changed**
- **Found during:** Task 1
- **Issue:** shadcn 4.x no longer has "zinc-dark" as a named preset — available presets are nova, vega, maia, lyra, mira
- **Fix:** Initialized shadcn with `--defaults` flag, then manually updated `app/globals.css` to use zinc-950 dark background, zinc-900 cards/sidebar, zinc-800 borders, and `#4287FF` primary — matching the UI-SPEC color palette exactly
- **Files modified:** app/globals.css
- **Commit:** bd9f9b6

**2. [Rule 2 - Feature] Added passWithNoTests to vitest config**
- **Found during:** Task 1
- **Issue:** `npx vitest run` exits code 1 when no test files exist — plan states it should "exit cleanly"
- **Fix:** Added `passWithNoTests: true` to vitest.config.ts
- **Files modified:** vitest.config.ts
- **Commit:** bd9f9b6

**3. [Rule 1 - Bug] .gitignore blocked .env.example**
- **Found during:** Task 1
- **Issue:** .gitignore had `.env*` pattern which blocked staging `.env.example`
- **Fix:** Added `!.env.example` exception to .gitignore
- **Files modified:** .gitignore
- **Commit:** bd9f9b6

## Task 3: Human Action Required

Task 3 is a `checkpoint:human-action` that requires the user to:

1. Create a Supabase project at supabase.com (name: "upstream")
2. Go to Project Settings > API and copy Project URL and anon key
3. Update `.env.local` with real values
4. Go to SQL Editor, paste `supabase/migrations/001_initial_schema.sql`, run it
5. Verify all 8 tables appear in Table Editor
6. Authentication > Providers > Anonymous Sign-In — Enable
7. Authentication > Hooks > Custom Access Token Hook > select `public.custom_access_token_hook` > Save
8. Run `npm run dev` — verify app boots without Supabase connection errors

After completing these steps, the next plan (01-02) can proceed with auth Server Actions, login page, and signup page.

## Known Stubs

- `app/page.tsx` — redirects to `/login` only; no UI
- No `/login` route exists yet — will 404 until Plan 01-02 creates it
- `.env.local` has placeholder credentials until Task 3 is completed by user

## Self-Check

Files created/modified:
- [x] `lib/supabase/server.ts` — FOUND
- [x] `lib/supabase/client.ts` — FOUND
- [x] `lib/supabase/middleware.ts` — FOUND
- [x] `proxy.ts` — FOUND
- [x] `components/theme-provider.tsx` — FOUND
- [x] `app/layout.tsx` — MODIFIED
- [x] `app/globals.css` — MODIFIED
- [x] `vitest.config.ts` — FOUND
- [x] `supabase/migrations/001_initial_schema.sql` — FOUND (318 lines)
- [x] `.env.example` — FOUND

Commits:
- [x] bd9f9b6 — FOUND (Task 1)
- [x] c531845 — FOUND (Task 2)
