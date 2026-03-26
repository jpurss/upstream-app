---
description: Phase 5 Plan 02 summary — demand board data layer, server actions, and consultant-facing UI with upvote interaction, filter tabs, and sort controls.
date_last_edited: 2026-03-26
phase: 05-demand-board-and-dashboard
plan: 02
subsystem: ui
tags: [supabase, server-actions, react, nextjs, typescript, tdd, vitest]

requires:
  - phase: 05-01
    provides: lib/types/prompt-request.ts (PromptRequest types), lib/utils/date.ts, recharts install, sidebar activation, test stubs

provides:
  - lib/data/prompt-requests.ts — fetchPromptRequests and countRequestsByStatus data access functions
  - app/(app)/demand/actions.ts — submitRequest and toggleUpvote server actions with auth checks
  - app/(app)/demand/page.tsx — server component demand board page (open to all authenticated users)
  - components/demand/request-card.tsx — request card with upvote column, status/urgency badges, optimistic toggle
  - components/demand/demand-board-client.tsx — filter tabs, sort dropdown, card list, empty states

affects:
  - 05-03 (admin triage actions — Mark Planned/Resolve/Decline — extend RequestCard)
  - 05-04 (dashboard data layer reads from same prompt_requests table)
  - 05-05 (seed data populates prompt_requests table for demand board demo)

tech-stack:
  added: []
  patterns:
    - fetchPromptRequests uses admin client (service role) for RLS bypass, passes currentUserId for user_has_upvoted computation
    - Upvote sort done JS-side (sorted after mapping) because Supabase cannot ORDER BY aggregate from joined table
    - toggleUpvote uses maybeSingle() check pattern — insert if no row, delete if row exists
    - RequestCard uses useTransition for optimistic upvote with error toast via sonner on failure
    - DemandBoardClient uses router.push URL state for tab/sort — consistent with Phase 4 review queue pattern

key-files:
  created:
    - lib/types/prompt-request.ts
    - lib/utils/date.ts
    - lib/data/prompt-requests.ts
    - app/(app)/demand/actions.ts
    - app/(app)/demand/page.tsx
    - components/demand/request-card.tsx
    - components/demand/demand-board-client.tsx
    - tests/demand-submit.test.ts
    - tests/demand-upvote.test.ts
  modified:
    - components/review/review-queue-card.tsx (import getRelativeTime from shared util)
    - components/app-sidebar.tsx (Demand Board + Dashboard enabled: true)
    - tests/sidebar.test.tsx (updated to reflect Phase 5 sidebar items now enabled)

key-decisions:
  - "Demand board accessible to all authenticated users — no effectiveRole admin gate in page.tsx (per D-08)"
  - "Upvote sort is JS-side after data mapping — Supabase cannot ORDER BY aggregate join count"
  - "getRelativeTime extracted to lib/utils/date.ts as shared utility (was inline in review-queue-card)"
  - "Admin controls left as commented placeholder in RequestCard — Plan 03 adds Mark Planned/Resolve/Decline buttons"
  - "Plan 01 foundation artifacts created as part of Plan 02 execution (parallel agent — depends_on not met)"

patterns-established:
  - "Data access layer for demand board: admin client + JS-side sort for upvote aggregates"
  - "Server actions use regular client (getUser pattern) for user-level operations; admin client only for admin-gated actions"
  - "DemandBoardSkeleton exported from demand-board-client.tsx for use in loading.tsx if needed"

requirements-completed:
  - DEMAND-01
  - DEMAND-02
  - DEMAND-03

duration: 6min
completed: 2026-03-26
---

# Phase 5 Plan 02: Demand Board Data Layer and UI Summary

**Demand board at `/demand` with upvote toggle, filter tabs (Open/Planned/Resolved/Declined/All), sort dropdown (Most upvoted/Newest/Urgent), and request cards with status/urgency badges — open to all authenticated users**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-03-26T19:01:21Z
- **Completed:** 2026-03-26T19:07:28Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments

- Full demand board data layer with fetchPromptRequests (admin client, JS-side upvote sort, user_has_upvoted) and countRequestsByStatus for tab badges
- Server actions for submitRequest and toggleUpvote with auth checks, revalidatePath, 9 TDD tests all passing
- Complete consultant-facing demand board UI — request cards with upvote column, filter tabs, sort dropdown, status/urgency badges, empty states, optimistic upvote toggle with error toast

## Task Commits

Each task was committed atomically:

1. **Task 1: Data access layer, server actions, TDD tests** - `80e76bb` (feat)
2. **Task 2: Demand board page, client orchestrator, request cards** - `96a7e4a` (feat)

## Files Created/Modified

- `lib/types/prompt-request.ts` — PromptRequest, RequestStatus, RequestUrgency types (Plan 01 artifact created here)
- `lib/utils/date.ts` — Shared getRelativeTime utility extracted from review-queue-card
- `lib/data/prompt-requests.ts` — fetchPromptRequests (admin client, upvote join, JS sort) + countRequestsByStatus
- `app/(app)/demand/actions.ts` — submitRequest and toggleUpvote server actions ('use server', regular client)
- `app/(app)/demand/page.tsx` — Server component page with auth check, role detection, data fetch, no admin gate
- `components/demand/request-card.tsx` — Request card with upvote column (ArrowUp, optimistic toggle), status/urgency badges, resolved prompt link
- `components/demand/demand-board-client.tsx` — Filter tabs + sort dropdown + card list + empty states + DemandBoardSkeleton
- `tests/demand-submit.test.ts` — 5 tests for submitRequest (auth, insert, status, revalidate, error)
- `tests/demand-upvote.test.ts` — 4 tests for toggleUpvote (insert, delete, auth, revalidate)
- `components/review/review-queue-card.tsx` — Updated to import getRelativeTime from shared util
- `components/app-sidebar.tsx` — Demand Board + Dashboard enabled: true
- `tests/sidebar.test.tsx` — Test 3 updated to expect 0 aria-disabled items (Phase 5 items now enabled)

## Decisions Made

- Demand board is open to all authenticated users — no admin gate per D-08 ("Consultants see read-only cards")
- Upvote sort computed JS-side after data mapping because Supabase cannot ORDER BY an aggregate from a joined table
- getRelativeTime extracted from review-queue-card to lib/utils/date.ts as a shared utility (Plan 01 task executed here as prerequisite)
- Admin controls rendered as commented placeholder in RequestCard per plan spec — Plan 03 adds Mark Planned/Resolve/Decline buttons
- Regular Supabase client (not admin) used in server actions — submitRequest and toggleUpvote are user-level operations

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created Plan 01 foundation artifacts (types, utils, sidebar, test stubs)**
- **Found during:** Pre-execution check — Plan 02 depends_on 05-01 but 05-01 had not been executed
- **Issue:** lib/types/prompt-request.ts, lib/utils/date.ts, sidebar enabled flags, and test stub scaffolding were all missing; without them Plan 02 would fail to compile
- **Fix:** Created lib/types/prompt-request.ts with full PromptRequest type exports; created lib/utils/date.ts with getRelativeTime; updated review-queue-card.tsx to import from shared util; enabled Demand Board and Dashboard in app-sidebar.tsx; scaffolded demand-submit.test.ts and demand-upvote.test.ts stubs (which were then immediately filled in as part of TDD)
- **Files modified:** lib/types/prompt-request.ts, lib/utils/date.ts, components/review/review-queue-card.tsx, components/app-sidebar.tsx, tests/demand-submit.test.ts, tests/demand-upvote.test.ts, tests/sidebar.test.tsx
- **Verification:** npm test — all 137 tests pass including updated sidebar test
- **Committed in:** 80e76bb (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Prerequisite artifacts created inline. No scope creep — all were exact Plan 01 outputs needed by Plan 02.

## Issues Encountered

- Sidebar test (Test 3) expected aria-disabled on Demand Board and Dashboard, which was correct pre-Phase 5. Updated test to expect 0 disabled items after enabling the sidebar items per plan spec. All tests pass.

## Known Stubs

- `components/demand/request-card.tsx` line 103: `{/* Admin controls rendered in Plan 03 */}` — Intentional. Plan 03 adds Mark Planned, Resolve, and Decline buttons for admin users. The RequestCard `isAdmin` and `onAdminAction` props are already typed and threaded through for Plan 03 to wire.

## Next Phase Readiness

- `/demand` route renders a working demand board — filter tabs, sort dropdown, request cards with upvote interaction, empty states
- Plan 03 extends RequestCard with admin action buttons (Mark Planned, Resolve dialog, inline Decline form)
- Plan 04 reads from same data tables for dashboard metrics and charts
- Plan 05 populates prompt_requests seed data for the demo

---
*Phase: 05-demand-board-and-dashboard*
*Completed: 2026-03-26*
