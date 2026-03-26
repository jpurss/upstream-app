---
description: Summary for Phase 04 Plan 01 — schema migration, TypeScript types, data access layer, and server actions for the merge workflow. Migration adds merge_decline_reason column; MergeSuggestion type created; fetchMergeSuggestions, fetchMergeSuggestionById, countPendingMerges implemented via admin client; suggestMerge, approveMerge, and declineMerge server actions created.
date_last_edited: 2026-03-26
phase: "04-merge-workflow"
plan: "01"
subsystem: "merge-workflow"
tags: ["schema", "types", "data-access", "server-actions", "tdd"]
dependency_graph:
  requires: ["04-00"]
  provides: ["merge-suggestion-data-layer", "merge-server-actions"]
  affects: ["fork-detail-sidebar", "review-queue-ui", "review-detail-ui"]
tech_stack:
  added: []
  patterns: ["admin-client-bypass-rls", "getAdminUser-pattern", "getAuthenticatedUser-pattern"]
key_files:
  created:
    - supabase/migrations/003_merge_decline_reason.sql
    - lib/types/merge.ts
    - lib/data/merge-suggestions.ts
    - app/(app)/review/actions.ts
    - tests/merge-data.test.ts
    - tests/merge-suggest.test.ts
    - tests/merge-approve.test.ts
    - tests/merge-decline.test.ts
  modified:
    - lib/types/fork.ts
    - app/(app)/engagements/[id]/forks/[forkId]/actions.ts
decisions:
  - "Admin client (createAdminClient) used for all merge data queries — RLS forked_prompts_own only grants access to fork owner, service role required for admin review"
  - "getAdminUser() in review/actions.ts is a self-contained copy (not imported from library/actions.ts) — server actions must be self-contained per Next.js file boundaries"
  - "suggestMerge clears merge_decline_reason on resubmission — allows declined consultant to revise and try again cleanly"
  - "approveMerge uses read-then-write for version bump — no RPC function in schema, acceptable for v1 low concurrency"
metrics:
  duration_minutes: 3
  completed_date: "2026-03-26"
  tasks_completed: 2
  files_modified: 10
---

# Phase 04 Plan 01: Data Foundation Summary

**One-liner:** Schema migration + MergeSuggestion type + admin-client data access layer (fetchMergeSuggestions, fetchMergeSuggestionById, countPendingMerges) + three server actions (suggestMerge, approveMerge, declineMerge).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Schema migration, types, data access layer | 329a4ec | 003_merge_decline_reason.sql, lib/types/fork.ts, lib/types/merge.ts, lib/data/merge-suggestions.ts, tests/merge-data.test.ts |
| 2 | Server actions — suggestMerge, approveMerge, declineMerge | f97474c | app/(app)/engagements/[id]/forks/[forkId]/actions.ts, app/(app)/review/actions.ts, tests/merge-suggest.test.ts, tests/merge-approve.test.ts, tests/merge-decline.test.ts |

## Verification

- `npx tsc --noEmit` — passes with zero errors
- `npm test -- tests/merge-data.test.ts tests/merge-suggest.test.ts tests/merge-approve.test.ts tests/merge-decline.test.ts` — 23 tests pass, 23 todos
- `supabase/migrations/003_merge_decline_reason.sql` exists with `ALTER TABLE forked_prompts ADD COLUMN merge_decline_reason TEXT`
- `lib/types/merge.ts` exports `MergeSuggestion` with all required joined fields
- `lib/data/merge-suggestions.ts` exports 3 functions, all using `createAdminClient`
- `app/(app)/review/actions.ts` exports `approveMerge` and `declineMerge` with `getAdminUser()`
- `app/(app)/engagements/[id]/forks/[forkId]/actions.ts` exports `suggestMerge`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed `mockFrom` reference error in merge-decline.test.ts**
- **Found during:** Task 2 RED→GREEN step
- **Issue:** Test asserted `expect(mockFrom).toBeUndefined()` to verify admin client was used, but `mockFrom` was not declared in that test file's scope — only `mockAdminFrom` was
- **Fix:** Removed the erroneous `expect(mockFrom).toBeUndefined()` line; the `expect(mockAdminFrom).toHaveBeenCalledWith('forked_prompts')` assertion below it already verifies the same intent correctly
- **Files modified:** tests/merge-decline.test.ts
- **Commit:** f97474c

## Decisions Made

1. **Admin client for all merge queries** — RLS `forked_prompts_own` only grants access to the fork owner (forked_by = auth.uid()). The admin reviewing merge suggestions is a different user. Service role bypasses this restriction cleanly without needing a cross-user RLS policy.

2. **Self-contained getAdminUser() in review/actions.ts** — Server actions cannot import helper functions from other server action files in Next.js (each `'use server'` file must be self-contained). The `getAdminUser()` function is copied verbatim from `app/(app)/library/actions.ts`.

3. **suggestMerge clears merge_decline_reason on resubmit** — When a consultant whose merge was declined revises and resubmits, the prior decline reason should be cleared. Otherwise stale reasons from previous reviews could confuse the admin.

4. **approveMerge uses read-then-write for version bump** — The schema has no `increment_version()` RPC. A read-then-write is acceptable at v1 concurrency levels; this matches the pattern already used for `total_checkouts` increment in Phase 3.

## Known Stubs

None — all functions are fully wired with real Supabase queries. Migration is ready to apply.

## Self-Check: PASSED
