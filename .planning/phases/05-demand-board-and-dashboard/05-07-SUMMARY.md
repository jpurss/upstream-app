---
description: Gap closure for demand board UX — client-side filtering, optimistic upvotes, compact metric cards, full-width layout, and uncrowded admin controls.
date_last_edited: 2026-03-26
phase: "05-demand-board-and-dashboard"
plan: "07"
subsystem: "demand-board, dashboard"
tags: [ux, performance, layout, client-state]
dependency_graph:
  requires: []
  provides: [demand-board-client-filtering, optimistic-upvotes, compact-metric-cards]
  affects: [app/(app)/demand/page.tsx, components/demand/demand-board-client.tsx, components/demand/request-card.tsx, components/dashboard/metric-card.tsx]
tech_stack:
  added: []
  patterns: [useMemo for client-side filtering, optimistic state with revert-on-failure, useState replaces URL search params]
key_files:
  created: []
  modified:
    - app/(app)/demand/page.tsx
    - components/demand/demand-board-client.tsx
    - components/demand/request-card.tsx
    - components/dashboard/metric-card.tsx
    - components/demand/new-request-dialog.tsx
    - components/library/back-to-library.tsx
decisions:
  - "Client-side filtering via useMemo removes all server round-trips for tab/sort changes — mirrors the library-grid.tsx pattern already established in Phase 02"
  - "Server fetches allRequests('all', 'upvotes') once — statusCounts computed client-side from the full dataset, eliminating the separate countRequestsByStatus() call"
  - "Optimistic upvote uses local useState with revert-on-failure — useEffect syncs back from props after server revalidation from other actions (resolve, decline)"
  - "Admin controls moved below metadata row with border-t separator — title row now only contains title + status badge"
metrics:
  duration: "~15 minutes"
  completed_date: "2026-03-26"
  tasks_completed: 2
  files_modified: 6
---

# Phase 05 Plan 07: Demand Board UX Gap Closure Summary

Client-side filtering and sorting with useMemo, optimistic upvotes with revert-on-failure, compact metric cards (40% shorter), full-width demand board layout, and admin controls moved below the title row.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Convert demand board to client-side filtering with optimistic upvotes | e8e2fde | page.tsx, demand-board-client.tsx, request-card.tsx |
| 2 | Compact dashboard metric cards | 1b30959 | metric-card.tsx |

## What Was Built

**Task 1 — Client-side demand board (e8e2fde):**
- `app/(app)/demand/page.tsx`: Simplified to fetch `allRequests('all', 'upvotes', user.id)` in a single call. Removed `searchParams` destructuring, removed `countRequestsByStatus()` call. Passes `allRequests` prop (not pre-filtered `requests`).
- `components/demand/demand-board-client.tsx`: Props changed from `requests/currentStatus/currentSort/statusCounts` to `allRequests`. Added `useState` for `currentStatus` (default: 'open') and `currentSort` (default: 'upvotes'). Removed `useRouter` entirely. Added `useMemo` block computing `filteredRequests` and `statusCounts` client-side with full filter+sort logic (upvotes/newest/urgent). Removed `max-w-4xl` — board fills available width.
- `components/demand/request-card.tsx`: Added `localUpvoteCount` and `localHasUpvoted` useState. `handleUpvote` applies optimistic update before `startTransition`, reverts on error. Added `useEffect` to sync from props after server revalidation. Admin controls moved from the title row to a dedicated row below the metadata line, with `border-t border-border` separator.

**Task 2 — Compact metric cards (1b30959):**
- `components/dashboard/metric-card.tsx`: `p-6` → `p-4`, removed `min-h-[120px]`, `gap-3` → `gap-2`, `text-[28px]` → `text-[24px]`, `size-5` → `size-4`, removed `gap-1` between number and label.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Select onValueChange type mismatch in demand-board-client.tsx**
- **Found during:** Build verification after Task 1
- **Issue:** `handleSortChange(val: string)` not assignable to `(value: string | null, eventDetails: ...) => void` — the base-ui Select component passes `string | null`
- **Fix:** Changed signature to `handleSortChange(val: string | null)` with null guard
- **Files modified:** `components/demand/demand-board-client.tsx`
- **Commit:** 46ca649

**2. [Rule 3 - Blocking] Fixed pre-existing Select type mismatch in new-request-dialog.tsx**
- **Found during:** Build verification
- **Issue:** Same `string | null` mismatch — `setCategory` and `setUrgency` passed directly as `onValueChange` handlers
- **Fix:** Wrapped with null-guarded arrow functions: `(val) => { if (val) setCategory(val) }`
- **Files modified:** `components/demand/new-request-dialog.tsx`
- **Commit:** 46ca649

**3. [Rule 3 - Blocking] Added missing back-to-library.tsx component**
- **Found during:** Build verification
- **Issue:** `app/(app)/library/[promptId]/page.tsx` imports `@/components/library/back-to-library` which did not exist in the worktree (existed in main repo only — likely created by a parallel agent)
- **Fix:** Copied component from main repo into worktree
- **Files modified:** `components/library/back-to-library.tsx` (created)
- **Commit:** 46ca649

## Known Stubs

None — all demand board and metric card functionality is fully wired.

## Self-Check

### Files exist:
- `components/demand/demand-board-client.tsx` — FOUND
- `components/demand/request-card.tsx` — FOUND
- `app/(app)/demand/page.tsx` — FOUND
- `components/dashboard/metric-card.tsx` — FOUND

### Commits exist:
- e8e2fde — FOUND
- 1b30959 — FOUND
- 46ca649 — FOUND

### Build: PASSED (no TypeScript errors, all 15 routes generated)

## Self-Check: PASSED
