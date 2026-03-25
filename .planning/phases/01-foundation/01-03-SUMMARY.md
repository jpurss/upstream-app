---
description: Plan 03 summary for Phase 1 Foundation — app shell with collapsible sidebar, demo banner, library placeholder page, and 18 realistic seed prompts. Partial — paused at Task 3 visual verification checkpoint.
date_last_edited: 2026-03-25
phase: 01-foundation
plan: "03"
subsystem: app-shell
status: partial-checkpoint
tags: [sidebar, app-shell, demo-banner, seed-data, navigation]
dependency_graph:
  requires: [01-01, 01-02]
  provides: [app-shell, seed-data]
  affects: [all-authenticated-pages]
tech_stack:
  added: []
  patterns:
    - Base UI useRender pattern for SidebarMenuButton (render prop instead of asChild)
    - Server Component app shell with getUser() (not getSession()) for security
    - force-dynamic to prevent anonymous user metadata caching
    - Role extraction from app_metadata (not user_metadata) to prevent self-elevation
key_files:
  created:
    - app/(app)/layout.tsx
    - components/app-sidebar.tsx
    - components/demo-banner.tsx
    - app/(app)/library/page.tsx
    - supabase/seed.sql
    - tests/sidebar.test.tsx
    - tests/demo-banner.test.tsx
  modified:
    - components/app-sidebar.tsx (bug fix: asChild -> render prop)
decisions:
  - "SidebarMenuButton uses render prop not asChild — this shadcn version uses Base UI useRender pattern"
  - "app/(app)/layout.tsx queries profiles table for real user display names, falls back to user_metadata for demo users"
  - "DemoBanner derives demo role from user.user_metadata.demo_role (set by signInAsDemo action in Plan 02)"
metrics:
  duration_minutes: 11
  completed_date: 2026-03-25
  tasks_completed: 2
  tasks_total: 3
  files_created: 7
  tests_added: 7
  tests_passing: 22
---

# Phase 1 Plan 03: App Shell with Sidebar, Demo Banner, Library Page, and Seed Data — Summary

**One-liner:** Collapsible sidebar with role-based nav (5 items for admin, 3 for consultant), anonymous demo banner with role label, library placeholder, and 18 realistic AI consulting seed prompts with 200-500 word content.

**Status:** Partial — Tasks 1 and 2 complete, paused at Task 3 (human visual verification checkpoint).

---

## Tasks Completed

### Task 1: App shell layout with sidebar and demo banner (TDD)

**Commits:**
- `5a85a50` — `test(01-03): add failing tests for AppSidebar and DemoBanner components` (RED)
- `d73a900` — `feat(01-03): implement app shell — AppSidebar, DemoBanner, and app layout` (GREEN)

**What was built:**

`components/app-sidebar.tsx` — Client Component:
- `<Sidebar collapsible="icon">` — collapses to icon-only mode
- 5 nav items array with `adminOnly` flag — admin sees all 5, consultant/anon see 3 (no Review Queue, no Dashboard)
- Library: active state with `isActive={true}` and render prop link
- Disabled items: `aria-disabled="true"`, `tabIndex={-1}`, `cursor-not-allowed`, tooltip "Coming in Phase N"
- Footer: Avatar with initials, display name, role Badge, logout form action calling `signOut` from `@/lib/auth-utils`
- Collapsed state: "U" monogram in header via `group-data-[collapsible=icon]` CSS

`components/demo-banner.tsx` — Shared Component:
- Returns `null` when `isAnonymous` is false
- 32px fixed-height banner with zinc-900 + #4287FF at 15% opacity background
- Copy: "Demo mode — [Consultant|Admin] view. Sign up to save your work."
- `role="banner"`, `aria-label="Demo mode indicator"` accessibility attributes
- "Sign Up" link in #4287FF pointing to `/signup`

`app/(app)/layout.tsx` — Server Component:
- `export const dynamic = 'force-dynamic'` prevents anonymous user metadata caching
- `supabase.auth.getUser()` (not `getSession()`) per security pattern
- Role from `user.app_metadata?.role` (not `user_metadata`) per D-14
- `isAnonymous` from `user.is_anonymous`
- Demo role from `user.user_metadata?.demo_role` (set by `signInAsDemo` in Plan 02)
- Queries `profiles` table for real user display names; falls back to `user_metadata.display_name` for demo
- Structure: `DemoBanner` above `SidebarProvider` containing `AppSidebar` + `<main>`

**Tests:** 7 new tests, all pass. 22 tests total across the project.

### Task 2: Library placeholder page and seed data SQL (no TDD — static content)

**Commit:** `e2cfb45` — `feat(01-03): add library placeholder page and 18 seed prompts`

**What was built:**

`app/(app)/library/page.tsx` — Server Component:
- "Prompt Library" heading (20px semibold per UI-SPEC)
- "18 prompts loaded and ready — full library browsing comes in Phase 2." body text (14px zinc-400 per UI-SPEC)
- No interactive elements — landing page placeholder only

`supabase/seed.sql` — 392 lines:
- 18 AI consulting prompts across 6 categories (3 each): Discovery, Solution Design, Build, Enablement, Delivery, Internal Ops
- Each prompt: 200-500 words of realistic, usable content with structured sections and `{{placeholder}}` variables
- Varied metadata per D-11: `avg_effectiveness` 3.2-4.8, `total_checkouts` 5-45, `total_ratings` 3-28
- 2026-era model names: Claude Sonnet 4 (10), GPT-4o (5), Gemini 2.0 Flash (3), model-agnostic (4 — counts >18 due to last_tested_model)
- `capability_type` mix: extraction, analysis, generation, transformation
- `complexity` mix: simple, moderate, advanced
- `created_by NULL` — no admin profile exists yet

---

## Task Pending

### Task 3: Visual verification of app shell and seed data

**Status:** Awaiting human verification checkpoint.

**Pre-verification required:**
- Paste `supabase/seed.sql` into Supabase Dashboard SQL Editor and execute
- Run dev server: `npm run dev`

**Verification steps:**
1. Supabase Table Editor shows 18 rows in prompts table
2. Visit http://localhost:3000/login
3. Click "Explore as Consultant" — verify demo banner, sidebar (3 items), library placeholder
4. Click sidebar collapse toggle — verify icon-only mode
5. Log out via sidebar footer — verify redirect to /login
6. Click "Explore as Admin" — verify sidebar shows all 5 items
7. Verify dark mode and accent color (#4287FF)
8. Verify fonts (Geist Sans for UI, Geist Mono for prompt areas)

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed SidebarMenuButton asChild prop not supported**
- **Found during:** Task 2 — build failed with TypeScript error
- **Issue:** This shadcn version uses Base UI `useRender` pattern; `asChild` prop does not exist on `SidebarMenuButton`. Standard Radix UI `asChild` pattern doesn't apply here.
- **Fix:** Changed enabled Library nav item to use `render={<Link href={item.href} />}` pattern, which is the Base UI equivalent.
- **Files modified:** `components/app-sidebar.tsx`
- **Commit:** `e2cfb45` (included in Task 2 commit)

---

## Self-Check Pending

(Self-check will be completed after Task 3 visual verification and final commit.)

---

## Known Stubs

- `app/(app)/library/page.tsx` — The Library page is intentionally a placeholder with static copy. Data will be wired in Phase 2 (library browsing feature). This is per plan design, not an oversight.
