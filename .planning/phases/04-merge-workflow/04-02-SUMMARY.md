---
description: Summary for Phase 04 Plan 02 — MergeSuggestionSection component with 4 render states wired to fork sidebar, Review Queue nav activated with amber pending-count badge, layout server-side count fetch for admins.
date_last_edited: 2026-03-26
phase: "04-merge-workflow"
plan: "02"
subsystem: "merge-workflow"
tags: ["components", "sidebar", "badge", "dialog", "tdd"]
dependency_graph:
  requires: ["04-01"]
  provides: ["merge-suggestion-section", "review-queue-nav-badge"]
  affects: ["fork-detail-sidebar", "app-sidebar", "app-layout"]
tech_stack:
  added: []
  patterns: ["useTransition-optimistic-ui", "statusConfig-badge-pattern", "server-side-count-fetch"]
key_files:
  created:
    - components/engagements/merge-suggestion-section.tsx
  modified:
    - components/engagements/fork-sidebar.tsx
    - components/app-sidebar.tsx
    - app/(app)/layout.tsx
decisions:
  - "MergeSuggestionSection uses a statusConfig object keyed by merge_status string — avoids switch/if chains for 4-state rendering"
  - "Dialog open state managed via React state (useState) not Dialog's own open — required by base-ui Dialog.Root controlled mode"
  - "pendingMergeCount defaults to 0 in AppSidebar props — layout only passes it when effectiveRole === admin"
metrics:
  duration_minutes: 3
  completed_date: "2026-03-26"
  tasks_completed: 2
  files_modified: 4
---

# Phase 04 Plan 02: UI Components — Merge Suggestion Section + Review Queue Nav

**One-liner:** MergeSuggestionSection with 4 status states (none/pending/approved/declined) + Dialog for merge note submission + amber pending count badge in Review Queue sidebar nav.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | MergeSuggestionSection component + ForkSidebar integration | 18a5aac | components/engagements/merge-suggestion-section.tsx, components/engagements/fork-sidebar.tsx |
| 2 | Activate Review Queue sidebar nav + pending count badge | 2ae82e3 | components/app-sidebar.tsx, app/(app)/layout.tsx |

## Verification

- `npx tsc --noEmit` — passes with zero errors
- `npm test -- tests/merge-suggest.test.ts` — 4/4 tests pass
- `components/engagements/merge-suggestion-section.tsx` exists, starts with `'use client'`
- `statusConfig` object with pending/approved/declined entries exists
- Dialog (not AlertDialog) used for merge note submission
- ForkSidebar renders MergeSuggestionSection as Section 8 with `border-t border-border`
- Review Queue nav item has `enabled: true`
- AppSidebar renders amber Badge when `pendingMergeCount > 0`
- Layout fetches `countPendingMerges()` only when `effectiveRole === 'admin'`

## Deviations from Plan

None — plan executed exactly as written.

## Decisions Made

1. **statusConfig object for badge rendering** — Rather than a switch or if/else chain for the 4 render states, a `statusConfig` object keyed by `merge_status` value drives icon, background color, text color, and label. This keeps the component concise and easily extensible.

2. **Controlled Dialog open state via useState** — The base-ui Dialog.Root accepts `open` and `onOpenChange` props for controlled mode. Using React state makes the open/close transitions predictable from `handleSubmit` (optimistic close on success, stay open on error).

3. **pendingMergeCount defaults to 0 in AppSidebar** — The prop is optional with a default of 0. This keeps consultant-facing renders unchanged (no badge, no DB query) — only admin layouts pass the real count.

## Known Stubs

None — all render states are fully wired. Merge status flows from real Supabase data via `fork.merge_status` prop.

## Self-Check: PASSED
