---
description: Gap closure plan fixing three UAT bugs — consultant /library redirect blocker, alphabetical urgency sort, and admin demo seeing no seed data.
date_last_edited: 2026-03-26
phase: 05-demand-board-and-dashboard
plan: "06"
subsystem: demand-board
tags: [bugfix, gap-closure, middleware, data-layer, auth]
dependency_graph:
  requires: [05-03-SUMMARY.md, 05-05-SUMMARY.md]
  provides: [consultant-library-access, urgency-sort-correctness, demo-seed-parity]
  affects: [lib/supabase/middleware.ts, lib/data/prompt-requests.ts, app/(auth)/login/actions.ts]
tech_stack:
  added: []
  patterns: [JS-side sort with priority map, multi-ID seed claim loop]
key_files:
  created: []
  modified:
    - lib/supabase/middleware.ts
    - lib/data/prompt-requests.ts
    - app/(auth)/login/actions.ts
    - components/demand/demand-board-client.tsx
    - components/demand/new-request-dialog.tsx
decisions:
  - "Urgency sort moved fully to JS side — URGENCY_PRIORITY map gives correct order urgent > medium > nice_to_have with secondary upvote tiebreak"
  - "Seed claim now loops over both DEMO_CONSULTANT_ID and DEMO_ADMIN_ID — both demo roles see same demand board data"
  - "Middleware consultant /library redirect deleted entirely — library page already handles read-only rendering for non-admins"
metrics:
  duration_minutes: 8
  completed_date: "2026-03-26"
  tasks_completed: 2
  files_modified: 5
---

# Phase 05 Plan 06: UAT Gap Closure — Three Bug Fixes Summary

**One-liner:** Surgical three-file fix closing the consultant /library redirect blocker, alphabetical urgency sort, and admin demo seed data gap found in UAT.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Fix middleware consultant /library redirect and urgency sort | 9a1adfc | lib/supabase/middleware.ts, lib/data/prompt-requests.ts |
| 2 | Fix seed data claim to transfer ALL demo data for both roles | c63c2de | app/(auth)/login/actions.ts |

## What Was Built

Three surgical fixes to production bugs found during UAT:

**Fix 1 — Middleware (BLOCKER):** Deleted the 6-line block that redirected non-admin users from `/library` to `/engagements`. This block was added in Phase 3 to prevent skeleton flash during post-login navigation but incorrectly blocked consultants from accessing the browse experience. The library page already handles read-only rendering for non-admins (admin CRUD controls are conditionally rendered), so no replacement logic was needed.

**Fix 2 — Urgency Sort (MAJOR):** Replaced Supabase `ORDER BY urgency DESC` (alphabetical, producing `urgent > nice_to_have > medium`) with a JS-side sort using a `URGENCY_PRIORITY` map (`{urgent: 0, medium: 1, nice_to_have: 2}`). Added a secondary tiebreak sort by `upvote_count` within the same urgency tier. Pattern matches the existing upvotes JS-side sort (Supabase cannot ORDER BY aggregate join).

**Fix 3 — Seed Data Claim (MAJOR):** Replaced the role-conditional single-placeholder claim (`role === 'admin' ? DEMO_ADMIN_ID : DEMO_CONSULTANT_ID`) with a loop over both placeholder IDs. Both demo roles now transfer ownership from `DEMO_CONSULTANT_ID` (owns engagements, forks, requests) and `DEMO_ADMIN_ID` (owns upvotes). Result: admin demo sees the same 7 seed prompt requests on the demand board as consultant demo.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed base-ui Select onValueChange null type mismatch**
- **Found during:** Task 1 verification (build check)
- **Issue:** `demand-board-client.tsx` passed `handleSortChange(val: string)` to `onValueChange` which expects `(value: string | null, eventDetails) => void`. Same pattern in `new-request-dialog.tsx` with `setCategory` and `setUrgency` directly passed as handlers.
- **Fix:** Added `| null` type to `handleSortChange` with early return guard; wrapped `setCategory` and `setUrgency` in arrow functions with null guards.
- **Files modified:** components/demand/demand-board-client.tsx, components/demand/new-request-dialog.tsx
- **Commit:** 2fd8b22

## Known Stubs

None — all three fixes wire real data and logic.

## Self-Check: PASSED

All modified files confirmed present on disk. All three task commits (9a1adfc, c63c2de, 2fd8b22) confirmed in git log. Build passes with no TypeScript errors.
