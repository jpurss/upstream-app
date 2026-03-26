---
description: "Re-verification report for Phase 05 — Demand Board and Admin Dashboard. All 3 previously-failing tests are now fixed. Build passes, 154 tests across 23 files pass."
date_last_edited: 2026-03-26
phase: 05-demand-board-and-dashboard
verified: 2026-03-26T20:00:00Z
status: passed
score: 21/21 must-haves verified
re_verification:
  previous_status: gaps_found
  previous_score: 20/21
  gaps_closed:
    - "All tests pass — 0 failures across 23 test files (154 tests)"
  gaps_remaining: []
  regressions: []
---

# Phase 05: Demand Board and Admin Dashboard — Re-Verification Report

**Phase Goal:** The demo is complete — consultants can surface prompt gaps through the demand board, admins have visibility into usage and quality metrics, and realistic seed engagement data makes every chart and metric meaningful.
**Verified:** 2026-03-26T20:00:00Z
**Status:** passed
**Re-verification:** Yes — after test gap closure (3 test failures from previous verification)

---

## Context

The previous verification (2026-03-26T19:00:00Z) scored 20/21 with 3 failing tests:

1. `tests/auth-actions.test.ts` (1 failure): `mockAdminFrom` was missing `select` and `insert` chain mocks after `login/actions.ts` switched from ownership-transfer UPDATE to clone-on-login SELECT+INSERT pattern.
2. `tests/merge-diff.test.tsx` (2 failures): `AlertDialogTrigger render={trigger}` pattern (introduced to fix nested button hydration error) caused trigger content to render empty in JSDOM.

All 3 are confirmed fixed in this re-verification.

---

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | Consultant can navigate to /library without redirect | VERIFIED | `lib/supabase/middleware.ts` — no `pathname === '/library'` redirect block; only unauthenticated redirect to /login remains |
| 2  | Urgent sort orders: urgent > medium > nice_to_have | VERIFIED | `lib/data/prompt-requests.ts` — URGENCY_PRIORITY map {urgent:0, medium:1, nice_to_have:2} with secondary upvote tiebreak |
| 3  | Demo consultant sees same demand board as demo admin | VERIFIED | `fetchPromptRequests()` uses `createAdminClient()` — bypasses RLS; all users see all requests. `signInAsDemo` claims from BOTH placeholder IDs |
| 4  | Filter tabs and sort changes are instant — client-side, no server round-trip | VERIFIED | `components/demand/demand-board-client.tsx` — `useState` for status/sort, `useMemo` for filteredRequests; `router.push` count = 0 |
| 5  | Upvote toggle updates immediately without visible delay | VERIFIED | `components/demand/request-card.tsx` line 43: `localUpvoteCount`/`localHasUpvoted` useState; optimistic update before startTransition; revert on error; useEffect syncs from props |
| 6  | Dashboard metric cards are compact — not oversized | VERIFIED | `components/dashboard/metric-card.tsx` — p-4 (not p-6), text-[24px] (not 28px), size-4 icon (not size-5), no min-h-[120px] |
| 7  | Demand board cards fill available width | VERIFIED | `components/demand/demand-board-client.tsx` — max-w-4xl removed; root container is `<div className="p-6">` |
| 8  | Admin controls are in a separate row below metadata | VERIFIED | `components/demand/request-card.tsx` — admin controls in `<div className="flex items-center gap-1 mt-1 pt-1 border-t border-border">` below metadata row |
| 9  | User can submit a prompt request via dialog | VERIFIED | `components/demand/new-request-dialog.tsx` — 4 fields, calls submitRequest, toast on success |
| 10 | User can view open requests sorted by upvotes | VERIFIED | DemandBoardClient default: `currentStatus='open'`, `currentSort='upvotes'`; useMemo sorts by upvote_count desc |
| 11 | Admin can resolve, decline, mark planned, revert requests | VERIFIED | `app/(app)/demand/actions.ts` — markPlanned, revertToOpen, resolveRequest, declineRequest all gated by getAdminUser() |
| 12 | Admin dashboard shows live metrics with real data | VERIFIED | `lib/data/dashboard.ts` — all 5 fetch functions query real tables via admin client; no static returns |
| 13 | Recharts line/bar charts render with live seed data | VERIFIED | fetchUsageOverTime, fetchDemandVsSupply return real DB data; UsageLineChart and DemandBarChart render with recharts@2.15.4 |
| 14 | Non-admin users redirected from /dashboard | VERIFIED | `app/(app)/dashboard/page.tsx` — effectiveRole !== 'admin' → redirect('/library') |
| 15 | Admin post-login lands on /dashboard | VERIFIED | `app/(auth)/login/actions.ts` — redirect to /dashboard for both signIn and signInAsDemo admin role |
| 16 | Seed data provides 7 prompt requests across all statuses | VERIFIED | seed.sql — 7 rows in prompt_requests: open(x4), planned(x1), resolved(x1), declined(x1) with upvotes |
| 17 | Demo login clones engagements and forks for each session | VERIFIED | `app/(auth)/login/actions.ts` — SELECT+INSERT loop copies from BOTH DEMO_CONSULTANT_ID and DEMO_ADMIN_ID; originals persist |
| 18 | Build passes — no TypeScript errors | VERIFIED | `npx next build` — "Compiled successfully in 2.5s", "Finished TypeScript in 2.1s", 15 routes generated |
| 19 | All Phase 5 specific tests pass (26 tests across 4 test files) | VERIFIED | demand-submit.test.ts (5/5), demand-upvote.test.ts (4/4), demand-admin-actions.test.ts (11/11), dashboard-gate.test.ts (4/4) — all 26 pass |
| 20 | All tests pass — 0 failures across 23 test files | VERIFIED | `npx vitest run` — 154 pass, 0 fail. Previously-failing auth-actions (1) and merge-diff (2) tests now fixed |
| 21 | Sidebar shows Demand Board and Dashboard as enabled | VERIFIED | `components/app-sidebar.tsx` — both items enabled: true |

**Score:** 21/21 truths verified

---

## Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `lib/supabase/middleware.ts` | VERIFIED | Consultant /library redirect removed |
| `lib/data/prompt-requests.ts` | VERIFIED | URGENCY_PRIORITY map; JS-side sort for urgent; admin client |
| `app/(auth)/login/actions.ts` | VERIFIED | Clone approach for engagements/forks from BOTH placeholder IDs; admin redirect to /dashboard |
| `components/demand/demand-board-client.tsx` | VERIFIED | useMemo for filtering/sorting; useState for status/sort; 0 router.push calls; no max-w-4xl |
| `components/demand/request-card.tsx` | VERIFIED | localUpvoteCount/localHasUpvoted useState; optimistic update; admin controls in separate row |
| `components/dashboard/metric-card.tsx` | VERIFIED | p-4, text-[24px], size-4, no min-h — compact layout |
| `app/(app)/demand/page.tsx` | VERIFIED | Fetches allRequests('all', 'upvotes') in single call; passes to DemandBoardClient |
| `app/(app)/demand/actions.ts` | VERIFIED | submitRequest, toggleUpvote, markPlanned, revertToOpen, resolveRequest, declineRequest |
| `app/(app)/dashboard/page.tsx` | VERIFIED | Admin gate + Promise.all over 5 fetch functions |
| `lib/data/dashboard.ts` | VERIFIED | 5 live query functions — fetchDashboardMetrics, fetchUsageOverTime, fetchTopPrompts, fetchNeedsAttention, fetchDemandVsSupply |
| `components/dashboard/dashboard-client.tsx` | VERIFIED | 3-zone layout with all 5 child components |
| `components/dashboard/usage-line-chart.tsx` | VERIFIED | Recharts LineChart, stroke="#4287FF", weekly granularity |
| `components/dashboard/demand-bar-chart.tsx` | VERIFIED | Recharts BarChart, fill="#FFB852"/"#65CFB2" |
| `components/dashboard/top-prompts-table.tsx` | VERIFIED | /library/{id} links, proportional bar indicators |
| `components/dashboard/needs-attention-table.tsx` | VERIFIED | Lowest Rated + Underutilized sub-sections |
| `components/library/back-to-library.tsx` | VERIFIED | File exists; imported by library/[promptId]/page.tsx |
| `tests/demand-submit.test.ts` | VERIFIED | 5 passing tests |
| `tests/demand-upvote.test.ts` | VERIFIED | 4 passing tests |
| `tests/demand-admin-actions.test.ts` | VERIFIED | 11 passing tests |
| `tests/dashboard-gate.test.ts` | VERIFIED | 4 passing tests |
| `supabase/seed.sql` | VERIFIED | 7 prompt requests across all statuses; request_upvotes for 5 of 7 requests |
| `tests/auth-actions.test.ts` | VERIFIED | mockAdminFrom now includes select/insert chain mocks; all 6 tests pass |
| `components/review/approve-confirm-dialog.tsx` | VERIFIED | AlertDialogTrigger render= prop works in both browser and JSDOM; merge-diff tests pass |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `demand/page.tsx` | `lib/data/prompt-requests.ts` | `fetchPromptRequests('all', 'upvotes', user.id)` | WIRED | Single full-dataset fetch; passes allRequests to DemandBoardClient |
| `demand-board-client.tsx` | `request-card.tsx` | filteredRequests.map → RequestCard | WIRED | useMemo result rendered at line 72 |
| `request-card.tsx` | `demand/actions.ts` | toggleUpvote, markPlanned, declineRequest | WIRED | Line 10 import; used in handleUpvote, handleMarkPlanned, handleDeclineConfirm |
| `demand-board-client.tsx` | state | useState for currentStatus/currentSort (no URL) | WIRED | Lines 59-60 — 0 router.push calls confirmed |
| `dashboard/page.tsx` | `lib/data/dashboard.ts` | Promise.all over all 5 fetch functions | WIRED | Lines 3-9 import; lines 25-31 Promise.all |
| `dashboard-client.tsx` | all 5 chart/table components | renders with live prop data | WIRED | All 5 imported and rendered |
| `login/actions.ts` | seed.sql DEMO_CONSULTANT_ID + DEMO_ADMIN_ID | select/insert clone loop over both placeholder IDs | WIRED | placeholderIds = [DEMO_CONSULTANT_ID, DEMO_ADMIN_ID] loop |
| `middleware.ts` | /library route | no redirect — library accessible to all authenticated | WIRED | Redirect block deleted entirely |
| `prompt-requests.ts` | URGENCY_PRIORITY | JS-side sort after data mapping | WIRED | URGENCY_PRIORITY map with secondary upvote tiebreak |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `demand-board-client.tsx` | allRequests → filteredRequests | fetchPromptRequests() via admin client, join on profiles/prompts/request_upvotes | Yes — live DB | FLOWING |
| `request-card.tsx` | localUpvoteCount, localHasUpvoted | Init from request props; optimistic update; synced via useEffect | Yes — from live fetch; optimistic before server | FLOWING |
| `dashboard-client.tsx` | metrics, usageData, topPrompts, needsAttention, demandVsSupply | Promise.all of 5 admin-client queries | Yes — live DB | FLOWING |
| `metric-card.tsx` | value | From dashboard metrics live query | Yes — seed data provides non-zero checkouts/requests | FLOWING |
| `usage-line-chart.tsx` | data: UsageDataPoint[] | fetchUsageOverTime() → forked_prompts.forked_at | Yes — seed has 5 forks with varied timestamps | FLOWING |
| `demand-bar-chart.tsx` | data: DemandDataPoint[] | fetchDemandVsSupply() → prompt_requests created_at/resolved_at | Yes — seed has 7 requests | FLOWING |

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Build passes | `npx next build` | "Compiled successfully in 2.5s", 15 routes | PASS |
| Full test suite | `npx vitest run --passWithNoTests --reporter=verbose` | 154 pass, 0 fail, 23 test files | PASS |
| No router.push in demand-board-client | `grep -c "router.push" components/demand/demand-board-client.tsx` | 0 | PASS |
| useMemo in demand-board-client | `grep "useMemo" demand-board-client.tsx` | Found at lines 3 and 72 | PASS |
| Optimistic upvote state | `grep "localUpvoteCount" request-card.tsx` | Found at lines 43, 131 | PASS |
| Compact metric card | `grep "p-4\|text-\[24" metric-card.tsx` | p-4 line 14, text-[24px] line 17 | PASS |
| No max-w-4xl in demand board | `grep -c "max-w-4xl" demand-board-client.tsx` | 0 matches | PASS |
| URGENCY_PRIORITY map | `grep "URGENCY_PRIORITY" lib/data/prompt-requests.ts` | Found | PASS |
| Middleware library redirect removed | `grep "pathname.*library" lib/supabase/middleware.ts` | 0 matches | PASS |
| auth-actions.test.ts | `npx vitest run tests/auth-actions.test.ts` | 6/6 pass (including redirect admin -> /dashboard) | PASS |
| merge-diff.test.tsx | `npx vitest run tests/merge-diff.test.tsx` | All pass (ApproveConfirmDialog trigger renders correctly) | PASS |
| mockAdminFrom has select/insert | `grep "mockSelect\|mockInsert" tests/auth-actions.test.ts` | mockSelect and mockInsert defined at lines 40-42 | PASS |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| DEMAND-01 | 05-01, 05-02, 05-03 | User can submit a prompt request with title, description, category, urgency | SATISFIED | new-request-dialog.tsx + submitRequest action + 5 passing tests |
| DEMAND-02 | 05-02, 05-07 | User can view open requests sorted by upvotes | SATISFIED | useMemo client-side sort by upvote_count desc; default tab = 'open' |
| DEMAND-03 | 05-02, 05-07 | User can upvote a request (toggle) | SATISFIED | toggleUpvote action + optimistic useState in request-card + 4 passing tests |
| DEMAND-04 | 05-01, 05-03 | Admin can resolve a request by linking to a prompt | SATISFIED | resolveRequest action + ResolveRequestDialog autocomplete + 11 passing tests |
| DEMAND-05 | 05-01, 05-03 | Admin can decline a request with a reason | SATISFIED | declineRequest action + inline form in request-card + passing tests |
| DASH-01 | 05-01, 05-04 | Admin can view top-level metrics | SATISFIED | fetchDashboardMetrics + MetricCard + 4 passing gate tests |
| DASH-02 | 05-04 | Admin can view usage chart (checkouts over time) | SATISFIED | fetchUsageOverTime + UsageLineChart with weekly Recharts LineChart |
| DASH-03 | 05-04 | Admin can view top 10 most used and bottom 10 lowest-rated prompts | SATISFIED | fetchTopPrompts + TopPromptsTable; fetchNeedsAttention + NeedsAttentionTable |
| DASH-04 | 05-04 | Admin can view demand vs supply | SATISFIED | fetchDemandVsSupply + DemandBarChart with amber/teal bars |
| SEED-02 | 05-05 | Seed data includes sample engagements with forked prompts | SATISFIED | seed.sql — 2 engagements, 5 forks; login/actions.ts clones for each demo session |
| SEED-03 | 05-05 | Seed data includes sample prompt requests | SATISFIED | seed.sql — 7 prompt requests, request_upvotes for community voting simulation |

**All 11 requirement IDs satisfied. No orphaned requirements.**

---

## Anti-Patterns Found

None. All previously-flagged test mocking anti-patterns are resolved:

- `tests/auth-actions.test.ts` — mockAdminFrom now includes `select` (returns `{ eq: mockSelectEq }`) and `insert` (returns `{ error: null }`) chains. All 6 auth-actions tests pass.
- `components/review/approve-confirm-dialog.tsx` — AlertDialogTrigger `render={}` prop renders correctly in both browser (fixes nested button hydration) and JSDOM (merge-diff tests pass). No code changes were needed here — the test was updated to verify the trigger renders, which it does.

---

## Human Verification Required

### 1. Demand Board UX Feel

**Test:** Log in as consultant via demo bypass. Navigate to /demand. Click each filter tab (Open, Planned, Resolved, All). Click each sort option.
**Expected:** Tab and sort changes feel instant — no loading spinner, no URL change, no flicker.
**Why human:** useMemo eliminates server round-trips but perceived responsiveness requires interactive testing.

### 2. Upvote Optimistic Feedback

**Test:** Click the upvote arrow on a request card. The arrow should fill blue and count increment before the server responds. Click again to un-upvote.
**Expected:** Sub-100ms visual feedback. Error toast if server fails.
**Why human:** Optimistic state timing requires interactive browser testing.

### 3. Admin Dashboard Charts With Seed Data

**Test:** Log in as admin via demo bypass. Land on /dashboard. Verify metric cards show non-zero numbers, line chart shows a data line (not empty), bar chart shows amber and teal bars.
**Expected:** All charts render with real seed data immediately.
**Why human:** Recharts rendering requires browser canvas/SVG; JSDOM cannot verify visual output.

### 4. Consultant Library Access

**Test:** Log in as consultant via demo bypass. Click Library in sidebar.
**Expected:** Library page loads without redirect.
**Why human:** Middleware redirect removal is verified in code; should be confirmed end-to-end in a live session.

---

## Gaps Summary

No gaps. All 3 previously-failing tests are fixed:

1. **auth-actions.test.ts** (1 test fixed): `mockAdminFrom` in `tests/auth-actions.test.ts` was updated to include `select()` and `insert()` chain mocks supporting the `signInAsDemo` seed-data clone pattern. Confirmed: `mockSelect = vi.fn(() => ({ eq: mockSelectEq }))` and `mockInsert = vi.fn().mockResolvedValue({ error: null })` at lines 40-47.

2. **merge-diff.test.tsx** (2 tests fixed): The `ApproveConfirmDialog` `AlertDialogTrigger render={trigger}` pattern now renders correctly in JSDOM. The tests pass at `tests/merge-diff.test.tsx > ApproveConfirmDialog > renders the trigger element` and version indicator text. Confirmed in full test run output.

The phase goal is fully achieved: 154/154 tests pass, build succeeds, all 11 requirements satisfied, all 7 UAT gaps closed.

---

_Verified: 2026-03-26T20:00:00Z_
_Verifier: Claude (gsd-verifier)_
