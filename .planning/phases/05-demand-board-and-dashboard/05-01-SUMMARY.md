---
description: "Summary for Phase 5 Plan 01 — schema migration, PromptRequest types, recharts v2 install, shared date utility extraction, sidebar activation, and Wave 0 test stubs."
date_last_edited: 2026-03-26
phase: 05-demand-board-and-dashboard
plan: "01"
subsystem: database, testing, ui
tags: [supabase, recharts, typescript, vitest, rls, migration]

requires:
  - phase: 04-merge-workflow
    provides: "Schema with prompt_requests + request_upvotes tables, established it.todo() test pattern, admin client pattern"

provides:
  - "Migration 004: decline_reason column + admin UPDATE RLS policy on prompt_requests"
  - "PromptRequest, RequestStatus, RequestUrgency TypeScript types with constants"
  - "recharts@2.15.4 installed (v2 per D-12)"
  - "Shared getRelativeTime utility at lib/utils/date.ts"
  - "Demand Board and Dashboard sidebar items enabled (enabled: true)"
  - "Empty data layer stubs: lib/data/prompt-requests.ts, lib/data/dashboard.ts"
  - "Wave 0 test stubs: 4 files, 26 it.todo() stubs covering DEMAND-01, DEMAND-03, DEMAND-04, DEMAND-05, DASH-01"

affects: [05-02-demand-board-ui, 05-03-demand-server-actions, 05-04-dashboard, 05-05-seed-data]

tech-stack:
  added: ["recharts@2.15.4"]
  patterns:
    - "Shared utility extraction: getRelativeTime moved from component to lib/utils/date.ts for multi-consumer reuse"
    - "Wave 0 test stubs with it.todo() — appear in vitest output without failing, same as Phase 4 pattern"
    - "Empty data layer stubs with comment indicating which plan implements them"

key-files:
  created:
    - supabase/migrations/004_prompt_requests_planned_decline.sql
    - lib/types/prompt-request.ts
    - lib/utils/date.ts
    - lib/data/prompt-requests.ts
    - lib/data/dashboard.ts
    - tests/demand-submit.test.ts
    - tests/demand-upvote.test.ts
    - tests/demand-admin-actions.test.ts
    - tests/dashboard-gate.test.ts
  modified:
    - components/review/review-queue-card.tsx
    - components/app-sidebar.tsx
    - tests/sidebar.test.tsx
    - package.json

key-decisions:
  - "recharts@^2.15.4 installed (v2 not v3) per D-12 — recharts v3 has breaking API changes"
  - "getRelativeTime extracted to lib/utils/date.ts — was inline in review-queue-card.tsx, now shared with demand board (second consumer)"
  - "sidebar.test.tsx Test 3 updated: Phase 5 enables all nav items, so aria-disabled=true check became 0 expected (was >=2)"
  - "Data layer stubs created as empty comment-only files — Plans 02 and 04 fill them in"

patterns-established:
  - "Shared utility pattern: lib/utils/*.ts for cross-component helpers"
  - "Wave 0 stub pattern: it.todo() in dedicated test files, vitest shows todos without failures"

requirements-completed: [DEMAND-01, DEMAND-03, DEMAND-04, DEMAND-05, DASH-01]

duration: 4min
completed: 2026-03-26
---

# Phase 5 Plan 01: Foundation Summary

**Supabase migration 004 adds decline_reason + admin UPDATE policy, PromptRequest TypeScript types defined, recharts v2.15.4 installed, getRelativeTime extracted to shared utility, Demand Board and Dashboard sidebar enabled, and 26 Wave 0 test stubs scaffolded across 4 files**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-03-26T18:58:00Z
- **Completed:** 2026-03-26T19:04:05Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments
- Schema migration 004: `decline_reason TEXT` column + `requests_update_admin` RLS policy enabling admin UPDATE on prompt_requests
- TypeScript types for demand board: `PromptRequest`, `RequestStatus`, `RequestUrgency`, `URGENCY_LABELS`, `REQUEST_STATUSES`, `REQUEST_URGENCIES`
- recharts@2.15.4 installed (v2 per D-12 — v3 has breaking changes)
- `getRelativeTime` extracted from `review-queue-card.tsx` to `lib/utils/date.ts` — shared by review queue and demand board
- Demand Board and Dashboard sidebar nav items enabled (`enabled: true`)
- 4 Wave 0 test stub files with 26 `it.todo()` stubs covering all Phase 5 behavioral requirements

## Task Commits

Each task was committed atomically:

1. **Task 1: Schema migration, recharts install, types, utility extraction, sidebar activation** - `328f9ad` (feat)
2. **Task 2: Create Wave 0 test stubs per VALIDATION.md** - `ec01821` (test)

## Files Created/Modified

- `supabase/migrations/004_prompt_requests_planned_decline.sql` - Adds decline_reason column + admin UPDATE RLS policy
- `lib/types/prompt-request.ts` - PromptRequest, RequestStatus, RequestUrgency types and constants
- `lib/utils/date.ts` - Shared getRelativeTime utility extracted from review-queue-card
- `lib/data/prompt-requests.ts` - Empty stub (implemented in Plan 02)
- `lib/data/dashboard.ts` - Empty stub (implemented in Plan 04)
- `components/review/review-queue-card.tsx` - Replaced local getRelativeTime with import from lib/utils/date
- `components/app-sidebar.tsx` - Demand Board and Dashboard items set to enabled: true
- `tests/sidebar.test.tsx` - Updated Test 3: Phase 5 enables all nav items (0 aria-disabled expected)
- `tests/demand-submit.test.ts` - 5 it.todo() stubs for DEMAND-01 (submitRequest)
- `tests/demand-upvote.test.ts` - 4 it.todo() stubs for DEMAND-03 (toggleUpvote)
- `tests/demand-admin-actions.test.ts` - 14 it.todo() stubs for DEMAND-04, DEMAND-05 (markPlanned, resolveRequest, declineRequest, revertToOpen)
- `tests/dashboard-gate.test.ts` - 4 it.todo() stubs for DASH-01 (admin gate)
- `package.json` - recharts@2.15.4 added

## Decisions Made

- **recharts@^2.15.4 (v2)**: Installing v2 specifically per D-12 — v3 has breaking API changes and would require different component syntax
- **getRelativeTime extraction**: Was already noted in STATE.md Phase 3 decision as "extract to lib/utils/date.ts when Plan 04-05 adds second consumer" — demand board is that second consumer
- **sidebar.test.tsx update**: Test 3 was asserting `aria-disabled="true"` on Demand Board + Dashboard — enabling them makes this assertion fail. Updated to assert 0 disabled items as the correct Phase 5 state

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated sidebar.test.tsx Test 3 to match Phase 5 expected state**
- **Found during:** Task 1 (sidebar activation)
- **Issue:** `tests/sidebar.test.tsx` Test 3 asserted `aria-disabled="true"` count >= 2 (checking Demand Board + Dashboard were disabled). After enabling them in `app-sidebar.tsx`, this test failed.
- **Fix:** Updated test name and assertion to expect 0 `aria-disabled` items — Phase 5 enables all nav items
- **Files modified:** `tests/sidebar.test.tsx`
- **Verification:** `npm test -- tests/sidebar.test.tsx` — 3/3 pass
- **Committed in:** `328f9ad` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug)
**Impact on plan:** Necessary to keep test suite green after the intentional sidebar activation. No scope creep.

## Issues Encountered

None.

## Known Stubs

- `lib/data/prompt-requests.ts` — comment-only file, implemented in Plan 02
- `lib/data/dashboard.ts` — comment-only file, implemented in Plan 04
- 26 `it.todo()` stubs in 4 test files — implemented as tests fill in during Plans 02–04

These stubs are intentional scaffold artifacts. Plans 02 and 04 will wire the data layer. Test stubs will be filled with real test implementations as each server action is built.

## Next Phase Readiness

- Migration 004, types, and recharts are ready for Plans 02–04 to consume
- Demand Board (`/demand`) and Dashboard (`/dashboard`) sidebar links are live but routes return 404 — Plan 02 creates the demand board page
- Test stubs are scaffolded and will be driven by Plans 02–04 using TDD green phase

---
*Phase: 05-demand-board-and-dashboard*
*Completed: 2026-03-26*
