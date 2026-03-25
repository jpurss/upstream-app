---
description: "Phase 3 Plan 03 summary — workspace header with status dropdown and AlertDialog confirmation, fork card work-status tracker with template/adaptation detection, fork grid with empty state, engagement workspace server page, and loading skeleton."
date_last_edited: 2026-03-25
phase: 03-engagement-workspace
plan: "03"
subsystem: workspace-ui
tags: [workspace, fork-cards, status-dropdown, server-component, skeleton]
dependency_graph:
  requires:
    - lib/types/engagement.ts
    - lib/types/fork.ts
    - lib/data/engagements.ts
    - lib/data/forks.ts
    - app/(app)/engagements/actions.ts
  provides:
    - components/engagements/workspace-header.tsx
    - components/engagements/fork-card.tsx
    - components/engagements/fork-grid.tsx
    - app/(app)/engagements/[id]/page.tsx
    - app/(app)/engagements/[id]/loading.tsx
  affects:
    - app/(app)/engagements/ routes
tech_stack:
  added: []
  patterns:
    - Client component with useTransition for non-blocking server action calls
    - base-ui Select onValueChange receives (value | null) — handled with null guard
    - AlertDialog controlled open state for deferred completion confirmation
    - Server component pattern with params: Promise<{id}> (Next.js 16)
    - Relative time calculation with inline getRelativeTime helper
key_files:
  created:
    - components/engagements/workspace-header.tsx
    - components/engagements/fork-card.tsx
    - components/engagements/fork-grid.tsx
    - app/(app)/engagements/[id]/page.tsx
    - app/(app)/engagements/[id]/loading.tsx
  modified: []
decisions:
  - "base-ui Select onValueChange signature is (value: T | null, eventDetails) — null guard required before casting to EngagementStatus"
  - "ForkCard includes inline getRelativeTime helper — no shared utility exists yet; can be extracted to lib/utils when a second consumer needs it"
  - "Workspace page does not pass onForkClick to WorkspaceHeader or ForkGrid — prompt picker modal (Plan 04) will wire this up"
metrics:
  duration: 4
  completed_date: 2026-03-25
  tasks_completed: 2
  files_created_or_modified: 5
---

# Phase 3 Plan 03: Engagement Workspace Summary

**One-liner:** Workspace header with inline status Select and AlertDialog completion confirmation + fork card work-status trackers with template/adaptation detection + responsive grid + server page + loading skeleton.

---

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Workspace header with status dropdown and engagement metadata | d36b64b | components/engagements/workspace-header.tsx |
| 2 | Fork card, fork grid, workspace page, and loading skeleton | 80c575d | components/engagements/fork-card.tsx, components/engagements/fork-grid.tsx, app/(app)/engagements/[id]/page.tsx, app/(app)/engagements/[id]/loading.tsx |

---

## Verification Results

1. `npx tsc --noEmit` — PASS, zero errors (after both tasks)
2. WorkspaceHeader contains all required acceptance criteria — CONFIRMED
3. ForkCard contains template/adaptation status detection — CONFIRMED
4. ForkGrid contains empty state copy from copywriting contract — CONFIRMED
5. Workspace page uses params: Promise pattern (Next.js 16) — CONFIRMED
6. Loading skeleton matches grid layout and card heights from UI-SPEC — CONFIRMED

---

## Decisions Made

1. **base-ui Select null guard** — The `onValueChange` callback signature from `@base-ui/react/select` is `(value: T | null, eventDetails)`. Since our value type is `EngagementStatus`, the handler must guard against null before processing. Added `if (!value) return` at the top of `handleStatusChange`.

2. **Inline `getRelativeTime` in ForkCard** — No shared relative time utility exists in the codebase yet. Rather than creating a new lib file for a single consumer, the helper is inlined in fork-card.tsx. Should be extracted to `lib/utils/date.ts` when Plan 04 or 05 needs a second consumer.

3. **`onForkClick` not wired in workspace page** — The WorkspaceHeader and ForkGrid accept `onForkClick` as an optional prop. The workspace page (server component) does not pass it yet — the prompt picker modal (Plan 04) will add a client wrapper that connects the button to the modal open state.

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Known Stubs

1. **`onForkClick` not wired** — `WorkspaceHeader` and `ForkGrid` both render their "+ Fork a Prompt" buttons in a disabled state because no `onForkClick` is passed from the workspace page. The buttons are visible but not interactive. Plan 04 (prompt picker modal) will add the client wrapper to connect these.

This is an intentional planned stub per the plan spec: "for now render it as a disabled-looking primary button or accept an `onForkClick` callback prop". Plan 04 resolves it.

---

## Self-Check: PASSED

Files confirmed present:
- components/engagements/workspace-header.tsx — FOUND
- components/engagements/fork-card.tsx — FOUND
- components/engagements/fork-grid.tsx — FOUND
- app/(app)/engagements/[id]/page.tsx — FOUND
- app/(app)/engagements/[id]/loading.tsx — FOUND

Commits confirmed:
- d36b64b — FOUND
- 80c575d — FOUND
