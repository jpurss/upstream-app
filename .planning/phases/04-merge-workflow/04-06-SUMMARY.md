---
description: "Gap closure Plan 06 — ReviewDetailClient rewrite to stacked 4-zone layout, ReviewActionBar creation, DeclineReasonForm extension, fork-editor showDiffOnly fix, loading.tsx skeleton update, and ReviewSidebar deletion. Paused at human-verify checkpoint."
date_last_edited: 2026-03-26
phase: 04-merge-workflow
plan: "06"
subsystem: review
tags: [review, layout, stacked, action-bar, tdd, checkpoint]
dependency_graph:
  requires: [04-05]
  provides: [review-detail-client-v2, review-action-bar]
  affects: [review-detail-client, fork-editor, decline-reason-form, review-sidebar]
tech_stack:
  added: []
  patterns: [stacked-4-zone-layout, sticky-action-bar, TDD-RED-GREEN, inline-expand-decline]
key_files:
  created:
    - components/review/review-action-bar.tsx
  modified:
    - components/review/review-detail-client.tsx
    - components/review/decline-reason-form.tsx
    - components/engagements/fork-editor.tsx
    - app/(app)/review/[suggestionId]/loading.tsx
    - tests/merge-diff.test.tsx
  deleted:
    - components/review/review-sidebar.tsx
decisions:
  - "ReviewActionBar uses sticky bottom-0 with -mx-6 -mb-6 negative margin pattern — extends to page container edges without fixed positioning sidebar offset issues"
  - "DeclineReasonForm extended with onDiscard and initialExpanded props (backward compatible) — ReviewActionBar controls expand state from parent via conditional render"
  - "DiffViewer in fork-editor.tsx passes showDiffOnly={false} — fork editor Diff tab preserves show-all-lines behavior that was the previous default"
  - "ReviewSidebar deleted — no orphan imports remain after ReviewDetailClient rewrite"
metrics:
  duration_seconds: null
  completed_date: "2026-03-26"
  tasks_completed: 1
  files_changed: 7
---

# Phase 04 Plan 06: ReviewDetailClient Rewrite + ReviewActionBar — Summary

**One-liner:** Complete rewrite of ReviewDetailClient from cramped 2-column to stacked 4-zone layout with tabbed diff/edit, sticky ReviewActionBar with inline decline, fork-editor showDiffOnly backward-compat fix, and ReviewSidebar deletion.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | ReviewActionBar + ReviewDetailClient full rewrite + fork-detail fix | 433568c | review-action-bar.tsx (new), review-detail-client.tsx, decline-reason-form.tsx, fork-editor.tsx, loading.tsx, review-sidebar.tsx (deleted), tests/merge-diff.test.tsx |

## What Was Built

### ReviewActionBar (`components/review/review-action-bar.tsx`) — new file

Sticky bottom action bar for the review detail page:
- Container: `sticky bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm px-6 py-4 -mx-6 -mb-6`
- Left side: "Decline" button (outline). On click: conditionally renders `DeclineReasonForm` with `initialExpanded={true}`
- Right side: `ApproveConfirmDialog` wrapper with trigger button showing "Approve & Merge" and version indicator `v{N} -> v{N+1}`
- When decline form is open: approve button is `disabled={isDeclineOpen}` — prevents conflicting actions
- Both approve and decline navigate to `/review` on success via `useRouter().push`

### ReviewDetailClient (`components/review/review-detail-client.tsx`) — complete rewrite

Stacked 4-zone layout replacing the cramped 2-column (diff + 280px sidebar):

**Zone 1 — Page Header:**
- Row 1: Back link (`/review`) left + `StatusBadge` (pending/merged/declined) right
- Row 2: Prompt title (20px semibold)
- `StatusBadge` inline helper: renders teal/orange/red badge per merge_status

**Zone 2 — Context Bar:**
- `ReviewContextBar` component (horizontal metadata bar from Plan 05)

**Between Zone 2 and Zone 3 — Decline reason panel:**
- Only rendered for `merge_status === 'declined'`
- Red-tinted card: `bg-[#E3392A]/5 border border-[#E3392A]/20`
- Shows `merge_decline_reason` text

**Zone 3 — Tabbed Main Content:**
- **Pending state:** `Tabs` with "Changes" + "Edit before approving" tabs
  - "Changes" tab: full-width `DiffViewer` with `showDiffOnly` toggle button (Expand/Minimize2 icons)
  - Blue dot indicator on "Changes" tab label when `hasEdited === true`
  - `rightTitle` dynamic: "Edited (will be merged)" when edited, "Fork (adapted)" otherwise
  - "Edit before approving" tab: full-width `ReviewContentEditor`
- **Approved/Declined state:** Read-only diff with appropriate titles, no tab UI

**Zone 4 — Sticky Action Bar:**
- `ReviewActionBar` rendered only when `isPending === true`

### DeclineReasonForm (`components/review/decline-reason-form.tsx`) — extended

Added two backward-compatible props:
- `onDiscard?: () => void` — called when user clicks "Discard reason" (also called after successful decline)
- `initialExpanded?: boolean` — default `false`. When `true`, skips collapsed state and renders textarea directly
- Used by `ReviewActionBar` which renders `DeclineReasonForm` only when `isDeclineOpen` is true, with `initialExpanded={true}`

### Fork-editor DiffViewer fix (`components/engagements/fork-editor.tsx`)

Added `showDiffOnly={false}` to the DiffViewer in the Diff tab. The DiffViewer default changed from `false` to `true` in Plan 05 — this restores the previous "show all lines" behavior for the fork editor context.

### Loading skeleton (`app/(app)/review/[suggestionId]/loading.tsx`)

Rewritten to match the stacked layout: header → context bar → tab bar → diff area → action bar. Removes the old side-by-side skeleton (main + 280px sidebar).

### ReviewSidebar deleted

`components/review/review-sidebar.tsx` deleted entirely. Confirmed zero remaining imports before deletion.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] DiffViewer is in fork-editor.tsx, not fork-detail-client.tsx**
- **Found during:** Task 1 implementation
- **Issue:** Plan said to update `fork-detail-client.tsx` but the DiffViewer is actually in `fork-editor.tsx` (the editor component mounted by ForkDetailClient). The fork-detail-client.tsx doesn't use DiffViewer directly.
- **Fix:** Added `showDiffOnly={false}` to DiffViewer in `fork-editor.tsx` — same intended outcome, correct file.
- **Files modified:** `components/engagements/fork-editor.tsx`
- **Commit:** 433568c

**2. [Rule 2 - Test refinement] getAllByText for Approve & Merge button assertion**
- **Found during:** Task 1 GREEN run
- **Issue:** The "Approve & Merge" button contains nested spans, causing getByText to find multiple matching elements.
- **Fix:** Changed `getByText(/approve & merge/i)` to `getAllByText(/approve & merge/i)` with `length > 0` assertion.
- **Files modified:** `tests/merge-diff.test.tsx`
- **Commit:** 433568c

## Verification Results

- `npx tsc --noEmit` — zero errors
- `npm test -- tests/merge-diff.test.tsx` — 37/37 tests pass
- ReviewDetailClient stacked 4-zone layout implemented
- ReviewActionBar created with sticky positioning and inline decline
- Fork-editor showDiffOnly={false} preserves existing behavior
- ReviewSidebar deleted, no orphan imports

## Known Stubs

None. All components render real data from props. No hardcoded placeholders.

## Checkpoint: Human Verify

**Task 2 is a human-verify checkpoint.** The implementation is complete and compiles cleanly. Human verification of the visual layout and interaction flows is required before marking this plan complete.

See checkpoint return message for verification steps.

## Self-Check: PASSED

- FOUND: components/review/review-action-bar.tsx
- FOUND: components/review/review-detail-client.tsx
- NOT FOUND: components/review/review-sidebar.tsx (correctly deleted)
- FOUND: commit 433568c
- TypeScript: zero errors
- Tests: 37/37 pass
