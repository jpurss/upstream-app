---
description: "Plan 02 Phase 1 Summary — auth Server Actions (signIn, signUp, signInAsDemo, signOut), auth callback route, login page with two-column layout and hero demo CTAs, and signup page."
date_last_edited: 2026-03-25
phase: 01-foundation
plan: 02
subsystem: auth-ui
tags: [auth, server-actions, login, signup, demo-bypass, ui]
requires: ["01-01"]
provides: ["auth-flow", "login-page", "signup-page", "demo-bypass"]
affects: ["app-shell", "library-page"]
tech_stack:
  added: []
  patterns:
    - "useActionState (React 19) for Server Action error feedback"
    - "useTransition for demo button loading states"
    - "Server Actions in separate actions.ts files with 'use server' directive"
    - "signInAnonymously with user_metadata for demo role isolation"
key_files:
  created:
    - app/(auth)/login/actions.ts
    - app/(auth)/signup/actions.ts
    - app/(auth)/login/page.tsx
    - app/(auth)/signup/page.tsx
    - app/(auth)/layout.tsx
    - app/auth/callback/route.ts
    - lib/auth-utils.ts
    - tests/auth-actions.test.ts
    - tests/login-page.test.tsx
  modified: []
decisions:
  - "Used useTransition for demo buttons (not useActionState) since they take a role arg, not FormData — avoids form wrapper complexity"
  - "signIn and signUp actions accept (prevState, formData) signature required by useActionState"
  - "signOut placed in lib/auth-utils.ts (not login/actions.ts) for reuse by sidebar logout button in Plan 03"
  - "Auth layout is minimal — just zinc-950 background with min-h-screen"
metrics:
  duration: "~25 minutes"
  completed: "2026-03-25"
  tasks_completed: 2
  files_created: 9
  files_modified: 0
  tests_written: 15
  tests_passing: 15
---

# Phase 1 Plan 02: Auth Server Actions and Login UI Summary

**One-liner:** Supabase Server Actions (signIn/signUp/signInAsDemo/signOut) + two-column login page with hero demo CTAs + signup page, all following UI-SPEC design contract exactly.

---

## Tasks Completed

| Task | Name | Commit | Status |
|------|------|--------|--------|
| 1 | Auth Server Actions and callback route | 5d05f17 | Done |
| 2 | Login page and signup page UI | 0c22a1d | Done |

## What Was Built

### Task 1: Auth Server Actions

**`app/(auth)/login/actions.ts`** — Two Server Actions:
- `signIn(prevState, formData)`: calls `signInWithPassword`, returns `{ error: 'Incorrect email or password. Please try again.' }` on failure, redirects to `/library` on success
- `signInAsDemo(role)`: calls `signInAnonymously` with `demo_role` and `display_name` in `user_metadata`, redirects to `/library` on success

**`app/(auth)/signup/actions.ts`** — One Server Action:
- `signUp(prevState, formData)`: calls `signUp`, redirects to `/library` if auto-confirmed or `/login?message=...` for email confirmation flow

**`app/auth/callback/route.ts`** — GET handler:
- Exchanges `code` param for session via `exchangeCodeForSession`
- Redirects to `next` param (default `/library`) on success, `/login?error=auth` on failure

**`lib/auth-utils.ts`** — Shared utility:
- `signOut()`: calls `supabase.auth.signOut()`, redirects to `/login`
- Placed here (not in login/actions.ts) for sidebar logout button reuse

All Server Actions:
- Use `'use server'` directive
- Use server-side `createClient` from `@/lib/supabase/server`
- Never call `getSession()` (anti-pattern avoided per RESEARCH.md)
- Never import browser client

### Task 2: Login and Signup UI

**`app/(auth)/login/page.tsx`** — Two-column layout:
- Left column (60%, xl+ only): "Upstream" wordmark, tagline, 3 feature highlights with Lucide icons (`Library`, `GitFork`, `GitMerge`) in `#4287FF`
- Right column (auth panel): hero demo section → "Explore as Consultant" (accent fill) → "Explore as Admin" (accent outline) → "No signup required" subtext → Separator with "or" → email/password form → "Sign In" button → signup link
- Demo buttons use `useTransition` for loading state with `Loader2` spinner
- Login form uses `useActionState` for error feedback
- All copy matches UI-SPEC Copywriting Contract

**`app/(auth)/signup/page.tsx`** — Centered single-column:
- "Upstream" wordmark, email/password form, "Sign Up" button
- "Already have an account? Sign in" link to `/login`
- Uses `useActionState` for error feedback from `signUp` action

**`app/(auth)/layout.tsx`** — Minimal wrapper:
- Full viewport `min-h-screen bg-zinc-950` for auth pages

---

## Decisions Made

1. **useTransition for demo buttons, not useActionState:** Demo buttons call `signInAsDemo(role)` directly (not via FormData form submission). `useTransition` provides the pending/loading state without needing to wrap in a form.

2. **signIn/signUp accept (prevState, formData) signature:** Required by `useActionState` — the hook prepends `prevState` as the first argument. This is the correct React 19 pattern.

3. **signOut in lib/auth-utils.ts:** Anticipating Plan 03 sidebar component needing to import signOut. Placing it in `login/actions.ts` would create an odd import path for the sidebar.

4. **Auth layout is thin:** No navigation, no demo banner (those are post-login shell concerns from Plan 03), just the background.

---

## Deviations from Plan

None — plan executed exactly as written. All tasks completed via TDD (RED-GREEN cycle):
- `tests/auth-actions.test.ts` written first, confirmed failing, then implementation created
- `tests/login-page.test.tsx` written first, confirmed failing, then pages created

---

## Verification Results

```
Test Files: 2 passed (2)
Tests: 15 passed (15)
Duration: 777ms
```

Build output:
```
✓ Compiled successfully in 1272ms
Route (app)
├ ○ /login
├ ○ /signup
└ ƒ /auth/callback
```

---

## Known Stubs

None — all acceptance criteria met. Auth actions connect to real Supabase client. Pages wire to actual Server Actions. No hardcoded empty values flowing to UI.

---

## Self-Check: PASSED

Files exist:
- [x] app/(auth)/login/actions.ts — FOUND
- [x] app/(auth)/signup/actions.ts — FOUND
- [x] app/(auth)/login/page.tsx — FOUND
- [x] app/(auth)/signup/page.tsx — FOUND
- [x] app/(auth)/layout.tsx — FOUND
- [x] app/auth/callback/route.ts — FOUND
- [x] lib/auth-utils.ts — FOUND
- [x] tests/auth-actions.test.ts — FOUND
- [x] tests/login-page.test.tsx — FOUND

Commits:
- [x] 4577a0d — test(01-02): add failing tests for auth Server Actions
- [x] 5d05f17 — feat(01-02): implement auth Server Actions
- [x] 2895c51 — test(01-02): add failing tests for login and signup pages
- [x] 0c22a1d — feat(01-02): implement login page, signup page, and auth layout
