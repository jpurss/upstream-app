---
description: Summary of Plan 07 gap closure — consultant login redirect, ForkGrid CTA wiring, and inline star rating on fork cards.
date_last_edited: 2026-03-25
phase: 03-engagement-workspace
plan: "07"
subsystem: ui
tags: [next-middleware, role-based-routing, fork-grid, star-rating, supabase-ssr]

requires:
  - phase: 03-engagement-workspace
    provides: WorkspaceClient, ForkGrid, ForkCard, StarRating, updateForkRating action

provides:
  - Edge-level role-based redirect (consultants /library → /engagements) in lib/supabase/middleware.ts
  - ForkGrid moved inside WorkspaceClient — empty-state CTA now opens PromptPickerModal
  - Inline star rating on ForkCard with optimistic local state and stopPropagation guard

affects:
  - "03-engagement-workspace"
  - "fork-detail"
  - "prompt-picker-modal"

tech-stack:
  added: []
  patterns:
    - "Edge redirect in updateSession: derive effectiveRole from app_metadata.role, then demo_role fallback, then 'consultant' default; redirect non-admin on exact /library path"
    - "ForkGrid inside WorkspaceClient shares pickerOpen state — both header button and empty-state CTA call setPickerOpen(true)"
    - "Inline action with stopPropagation: wrap interactive sub-element inside a Link with onClick e.preventDefault + e.stopPropagation to prevent navigation"
    - "showLabel prop pattern on StarRating: default true preserves existing detail sidebar behavior, false for compact card mode"

key-files:
  created: []
  modified:
    - lib/supabase/middleware.ts
    - components/engagements/workspace-client.tsx
    - components/engagements/fork-card.tsx
    - components/engagements/star-rating.tsx
    - app/(app)/engagements/[id]/page.tsx

key-decisions:
  - "Redirect only exact /library path, NOT /library/* — consultants must retain access to individual prompt detail pages"
  - "updateForkRating requires 4 args (forkId, rating, sourcePromptId, engagementId) — plan interface comment was simplified; actual action recalculates avg_effectiveness on parent prompt"
  - "ForkGrid moved into WorkspaceClient rather than coordinator prop drilling — simpler than passing setPickerOpen down through page.tsx"

patterns-established:
  - "Edge-layer role routing: effectiveRole derivation uses app_metadata.role then user_metadata.demo_role (anonymous users) then 'consultant' default — matches (app)/layout.tsx logic"
  - "showLabel?: boolean pattern for compact vs. full component variants"

requirements-completed: [ENG-03, FORK-05]

duration: 8min
completed: 2026-03-25
---

# Phase 03 Plan 07: Gap Closure — Login Redirect, CTA Wiring, Inline Rating Summary

**Edge-level consultant redirect (/library → /engagements), ForkGrid CTA wired to PromptPickerModal, and 1-click inline star rating on fork cards without page navigation**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-25T18:55:48Z
- **Completed:** 2026-03-25T19:03:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Added role-based redirect in `updateSession` middleware — consultants landing on `/library` are redirected to `/engagements` before any server components render, eliminating the skeleton flash
- Moved `ForkGrid` from the workspace page server component into `WorkspaceClient` so the empty-state "Fork a Prompt" CTA shares the `pickerOpen` state and is no longer disabled
- Added `showLabel` prop to `StarRating` and inline rating to `ForkCard` — clicking stars rates the fork immediately via `updateForkRating` without navigating to the detail page

## Task Commits

Each task was committed atomically:

1. **Task 1: Role-based redirect in middleware** - `1359131` (feat)
2. **Task 2: ForkGrid wiring + inline star rating** - `606c295` (feat)

## Files Created/Modified

- `lib/supabase/middleware.ts` — Added effectiveRole derivation and /library → /engagements redirect after unauthenticated redirect block
- `components/engagements/workspace-client.tsx` — Added forks prop, ForkGrid import, ForkGrid rendered with onForkClick wired
- `app/(app)/engagements/[id]/page.tsx` — Removed ForkGrid render and import; forks passed to WorkspaceClient instead
- `components/engagements/fork-card.tsx` — Added StarRating import, updateForkRating import, useState/useTransition for local rating, stopPropagation wrapper
- `components/engagements/star-rating.tsx` — Added showLabel?: boolean prop (default true), conditionally renders "Rate effectiveness" label

## Decisions Made

- Only redirect exact `/library` path, not `/library/*` — consultants must retain access to individual prompt detail pages from the library
- `updateForkRating` in the actual actions file takes 4 parameters (`forkId`, `rating`, `sourcePromptId`, `engagementId`), not 2 as the plan interface comment stated — ForkCard passes all 4 using `fork.source_prompt_id` and `fork.engagement_id` from the `ForkedPromptWithTitle` type
- ForkGrid moved inside `WorkspaceClient` (rather than coordinator-level prop drilling) for the simplest state sharing path

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] updateForkRating call signature corrected**
- **Found during:** Task 2 (inline star rating on fork cards)
- **Issue:** Plan stated `updateForkRating(forkId, rating)` with 2 args; actual server action signature is `updateForkRating(forkId, rating, sourcePromptId, engagementId)` — missing args would cause incorrect avg_effectiveness recalculation and missing revalidatePath calls
- **Fix:** Passed all 4 args — `updateForkRating(fork.id, rating, fork.source_prompt_id, fork.engagement_id)`
- **Files modified:** `components/engagements/fork-card.tsx`
- **Verification:** TypeScript passes with no errors
- **Committed in:** 606c295 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Fix required for correct server action behavior. No scope creep.

## Issues Encountered

None — TypeScript passed clean on first run after both tasks.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All three gap-closure items from the UAT/Verification checklist are now addressed
- Consultant login no longer flashes library skeleton (edge redirect)
- Empty workspace state is no longer a dead end (CTA wired)
- Fork cards support 1-click rating from the workspace grid (inline stars)
- No blockers for final phase verification

---
*Phase: 03-engagement-workspace*
*Completed: 2026-03-25*
