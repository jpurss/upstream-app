---
description: "Verification report for Phase 05 — Demand Board and Admin Dashboard. Checks all must_haves across 5 plans against the actual codebase."
date_last_edited: 2026-03-26
phase: 05-demand-board-and-dashboard
verified: 2026-03-26T15:35:00Z
status: passed
score: 21/21 must-haves verified
re_verification: false
---

# Phase 05: Demand Board and Admin Dashboard — Verification Report

**Phase Goal:** Build the Demand Board for consultants to surface prompt gaps, and the Admin Dashboard for firm-wide usage visibility — completing the v1 feedback loop.
**Verified:** 2026-03-26
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1 | Schema supports decline_reason and admin UPDATE on prompt_requests | VERIFIED | `supabase/migrations/004_prompt_requests_planned_decline.sql` — `ALTER TABLE prompt_requests ADD COLUMN decline_reason TEXT` and `CREATE POLICY "requests_update_admin"` both present |
| 2 | PromptRequest and RequestStatus types exist and are importable | VERIFIED | `lib/types/prompt-request.ts` exports `PromptRequest`, `RequestStatus`, `RequestUrgency`, `REQUEST_STATUSES`, `REQUEST_URGENCIES`, `URGENCY_LABELS` |
| 3 | recharts v2.15.x is installed and importable | VERIFIED | `npm ls recharts` shows `recharts@2.15.4` (not 3.x) |
| 4 | getRelativeTime is a shared utility, not duplicated | VERIFIED | `lib/utils/date.ts` exports `getRelativeTime`; `components/review/review-queue-card.tsx` imports from `@/lib/utils/date` with zero local definition remaining |
| 5 | Demand Board and Dashboard sidebar items are enabled and navigable | VERIFIED | `components/app-sidebar.tsx` line 40: `enabled: true` for Demand Board; line 42: `enabled: true` for Dashboard |
| 6 | User can view open prompt requests sorted by most upvoted | VERIFIED | `lib/data/prompt-requests.ts` — `fetchPromptRequests()` with admin client, JS-side `.sort((a, b) => b.upvote_count - a.upvote_count)` for upvotes sort |
| 7 | User can upvote or un-upvote a request with one click and immediate visual feedback | VERIFIED | `components/demand/request-card.tsx` — `ArrowUp` with `fill-[#4287FF]` when upvoted, `useTransition` + `toggleUpvote`, error toast on failure |
| 8 | User can filter requests by status tabs and sort by multiple criteria | VERIFIED | `components/demand/demand-board-client.tsx` — shadcn `Tabs` for Open/Planned/Resolved/Declined/All + `Select` for upvotes/newest/urgent, both push URL params |
| 9 | User can submit a prompt request via dialog with title, description, category, urgency | VERIFIED | `components/demand/new-request-dialog.tsx` — all 4 fields present, calls `submitRequest`, toast on success |
| 10 | Admin can mark Planned, revert to Open, resolve, and decline requests | VERIFIED | `app/(app)/demand/actions.ts` exports `markPlanned`, `revertToOpen`, `resolveRequest`, `declineRequest`, all gated by `getAdminUser()` |
| 11 | Admin resolve uses prompt autocomplete search | VERIFIED | `components/demand/resolve-request-dialog.tsx` — typed search filters `prompts` prop, max 5 results, select highlights with `bg-accent`, calls `resolveRequest` |
| 12 | Consultant users see no admin controls | VERIFIED | `components/demand/request-card.tsx` line 127: `{isAdmin && request.status === 'open' && ...}` — conditional render, not CSS-hidden |
| 13 | Admin can view top-level metrics: active prompts, total checkouts, open items | VERIFIED | `lib/data/dashboard.ts` — `fetchDashboardMetrics()` queries `prompts`, `forked_prompts`, `prompt_requests` via admin client; `components/dashboard/metric-card.tsx` renders 28px values |
| 14 | Admin can view a line chart showing checkouts over time (weekly granularity) | VERIFIED | `components/dashboard/usage-line-chart.tsx` — Recharts `LineChart` with `stroke="#4287FF"`, `height={300}`, weekly JS grouping in `fetchUsageOverTime()` |
| 15 | Admin can view top 10 most used prompts table | VERIFIED | `components/dashboard/top-prompts-table.tsx` — links to `/library/{id}`, proportional bar indicator; `fetchTopPrompts()` queries DB ordered by `total_checkouts DESC LIMIT 10` |
| 16 | Admin can view lowest rated and underutilized prompts in a Needs Attention table | VERIFIED | `components/dashboard/needs-attention-table.tsx` — "Lowest Rated" sub-section with `StarRating`, "Underutilized" sub-section with "0 checkouts"; both from `fetchNeedsAttention()` live queries |
| 17 | Admin can view demand vs supply grouped bar chart | VERIFIED | `components/dashboard/demand-bar-chart.tsx` — `fill="#FFB852"` (opened) + `fill="#65CFB2"` (resolved), data from `fetchDemandVsSupply()` live query |
| 18 | Non-admin users are redirected away from /dashboard | VERIFIED | `app/(app)/dashboard/page.tsx` — `if (effectiveRole !== 'admin') redirect('/library')` after auth check |
| 19 | All dashboard data is live queries — no hardcoded numbers | VERIFIED | `lib/data/dashboard.ts` — all 5 export functions use `createAdminClient()` and query real tables; no static returns |
| 20 | Demo bypass sees pre-populated engagements, forks, demand requests | VERIFIED | `supabase/seed.sql` — 2 engagements, 5 forks with spread `forked_at` timestamps, 7 prompt requests across all statuses; `app/(auth)/login/actions.ts` claims seed data via placeholder UUID transfer |
| 21 | Admin post-login landing is /dashboard | VERIFIED | `app/(auth)/login/actions.ts` — both `signIn` and `signInAsDemo` redirect admin to `/dashboard` (changed from `/library`) |

**Score:** 21/21 truths verified

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/004_prompt_requests_planned_decline.sql` | decline_reason column + admin UPDATE policy | VERIFIED | Contains `ALTER TABLE`, `CREATE POLICY "requests_update_admin"`, and `auth.jwt() -> 'app_metadata' ->> 'role'` |
| `lib/types/prompt-request.ts` | PromptRequest type, RequestStatus, RequestUrgency, constants | VERIFIED | All 6 expected exports present |
| `lib/utils/date.ts` | Shared getRelativeTime utility | VERIFIED | Exports `getRelativeTime`, imported by review-queue-card (local copy removed) |
| `lib/data/prompt-requests.ts` | fetchPromptRequests, countRequestsByStatus | VERIFIED | Substantive implementation with join queries and JS-side upvote sort |
| `lib/data/dashboard.ts` | 5 fetch functions, live queries | VERIFIED | All 5 functions export: `fetchDashboardMetrics`, `fetchUsageOverTime`, `fetchTopPrompts`, `fetchNeedsAttention`, `fetchDemandVsSupply` |
| `app/(app)/demand/page.tsx` | Server component, passes activePrompts for admin | VERIFIED | Auth check, `fetchPromptRequests`, `countRequestsByStatus`, admin-only `activePrompts` fetch, passes to `DemandBoardClient` |
| `app/(app)/demand/actions.ts` | submitRequest, toggleUpvote, markPlanned, revertToOpen, resolveRequest, declineRequest | VERIFIED | All 6 actions exported; `getUser` and `getAdminUser` helpers; all call `revalidatePath('/demand')` |
| `app/(app)/dashboard/page.tsx` | Admin-gated, calls all 5 fetch functions | VERIFIED | `effectiveRole !== 'admin'` guard, `Promise.all` over all 5 fetches, passes to `DashboardClient` |
| `components/demand/request-card.tsx` | RequestCard with upvote column, admin controls, inline decline | VERIFIED | `statusConfig`, `urgencyConfig`, `ArrowUp`, `aria-label`, `toggleUpvote`, `markPlanned`, `declineRequest`, inline decline textarea |
| `components/demand/demand-board-client.tsx` | DemandBoardClient with tabs, sort, NewRequestDialog, ResolveRequestDialog | VERIFIED | `Tabs`, `Select`, `RequestCard` map, `NewRequestDialog`, `ResolveRequestDialog`, `router.push`, empty states |
| `components/demand/new-request-dialog.tsx` | NewRequestDialog with 4 fields | VERIFIED | All 4 fields, `PROMPT_CATEGORIES`, `submitRequest`, "Prompt request submitted" toast, disabled when title/description empty |
| `components/demand/resolve-request-dialog.tsx` | ResolveRequestDialog with autocomplete | VERIFIED | Prompt search filter, selection highlight, `resolveRequest`, "Request resolved" toast |
| `components/dashboard/dashboard-client.tsx` | DashboardClient with 3-zone layout | VERIFIED | MetricCards zone, charts zone, tables zone; all 5 child components imported and rendered with live props |
| `components/dashboard/metric-card.tsx` | MetricCard with 28px value | VERIFIED | `text-[28px] font-semibold`, icon, label, subLines support |
| `components/dashboard/usage-line-chart.tsx` | UsageLineChart Recharts wrapper | VERIFIED | `'use client'`, `ResponsiveContainer`, `LineChart`, `stroke="#4287FF"`, `height={300}`, "Prompt Usage Over Time" heading |
| `components/dashboard/demand-bar-chart.tsx` | DemandBarChart Recharts wrapper | VERIFIED | `'use client'`, `BarChart`, `fill="#FFB852"`, `fill="#65CFB2"`, "Demand vs Supply" heading |
| `components/dashboard/top-prompts-table.tsx` | TopPromptsTable with links and bar indicators | VERIFIED | `"Most Used Prompts"`, `/library/{id}` links, proportional `bg-[#4287FF]/20` bar |
| `components/dashboard/needs-attention-table.tsx` | NeedsAttentionTable with sub-sections | VERIFIED | `"Needs Attention"`, `"Lowest Rated"`, `"Underutilized"`, `StarRating`, "All prompts have been checked out at least once." |
| `components/app-sidebar.tsx` | Demand Board and Dashboard both enabled | VERIFIED | Lines 40 and 42: both `enabled: true` |
| `tests/demand-submit.test.ts` | 5 passing tests for submitRequest | VERIFIED | 5 real tests, 0 `it.todo` remaining |
| `tests/demand-upvote.test.ts` | 4 passing tests for toggleUpvote | VERIFIED | 4 real tests, 0 `it.todo` remaining |
| `tests/demand-admin-actions.test.ts` | 11 passing tests for admin actions | VERIFIED | 11 real tests across markPlanned/resolveRequest/declineRequest/revertToOpen, 0 `it.todo` remaining |
| `tests/dashboard-gate.test.ts` | 4 passing tests for admin gate | VERIFIED | 4 real tests (unauthenticated, consultant, admin, demo admin), 0 `it.todo` remaining |
| `supabase/seed.sql` | 2 engagements, 5 forks, 7 prompt requests, upvotes, checkout counts | VERIFIED | All present with placeholder UUIDs, varied timestamps, all 4 statuses represented |
| `app/(auth)/login/actions.ts` | Admin redirect to /dashboard + claim seed data | VERIFIED | `redirect('/dashboard')` in both `signIn` and `signInAsDemo`; seed claim logic transfers engagements, forks, requests, upvotes from placeholder UUIDs |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `app/(app)/demand/page.tsx` | `lib/data/prompt-requests.ts` | `fetchPromptRequests` call | WIRED | Line 4 import + line 30 call with user.id |
| `components/demand/demand-board-client.tsx` | `components/demand/request-card.tsx` | renders `RequestCard` for each request | WIRED | Line 17 import + line 130 `requests.map((request) => <RequestCard ...>)` |
| `components/demand/request-card.tsx` | `app/(app)/demand/actions.ts` | calls `toggleUpvote`, `markPlanned`, `declineRequest` | WIRED | Line 10 import; used in `handleUpvote`, `handleMarkPlanned`, `handleDeclineConfirm` |
| `components/demand/request-card.tsx` | `app/(app)/demand/actions.ts` | calls `markPlanned` or `declineRequest` (admin) | WIRED | Admin buttons wire to `markPlanned` (line 57) and `declineRequest` (line 79) |
| `components/demand/resolve-request-dialog.tsx` | `app/(app)/demand/actions.ts` | calls `resolveRequest` | WIRED | Line 18 import + line 64 call |
| `components/demand/new-request-dialog.tsx` | `app/(app)/demand/actions.ts` | calls `submitRequest` | WIRED | Line 24 import + line 56 call |
| `app/(app)/dashboard/page.tsx` | `lib/data/dashboard.ts` | calls all 5 fetch functions | WIRED | Lines 3-9 import + `Promise.all([...])` on lines 25-31 |
| `components/dashboard/dashboard-client.tsx` | `components/dashboard/usage-line-chart.tsx` | renders `UsageLineChart` | WIRED | Line 3 import + line 61 `<UsageLineChart data={usageData} />` |
| `components/dashboard/dashboard-client.tsx` | `components/dashboard/demand-bar-chart.tsx` | renders `DemandBarChart` | WIRED | Line 4 import + line 62 `<DemandBarChart data={demandVsSupply} />` |
| `supabase/seed.sql` | `app/(auth)/login/actions.ts` | placeholder UUIDs match claim logic | WIRED | Both use `00000000-0000-0000-0000-000000000001` (consultant) and `00000000-0000-0000-0000-000000000002` (admin) |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `components/demand/demand-board-client.tsx` | `requests: PromptRequest[]` | `fetchPromptRequests()` in page.tsx → admin client join query on `prompt_requests`, `profiles`, `prompts`, `request_upvotes` | Yes — live DB query | FLOWING |
| `components/demand/request-card.tsx` | `request: PromptRequest` | Passed from DemandBoardClient via `requests.map()` | Yes — from live fetch | FLOWING |
| `components/dashboard/dashboard-client.tsx` | `metrics`, `usageData`, `topPrompts`, `needsAttention`, `demandVsSupply` | `Promise.all` in dashboard page.tsx → all 5 `lib/data/dashboard.ts` functions use `createAdminClient()` | Yes — all live DB queries; no hardcoded values or static fallbacks | FLOWING |
| `components/dashboard/usage-line-chart.tsx` | `data: UsageDataPoint[]` | `fetchUsageOverTime()` → `forked_prompts.forked_at` grouped by week in JS | Yes — queries real fork timestamps; fills missing weeks with 0 | FLOWING |
| `components/dashboard/demand-bar-chart.tsx` | `data: DemandDataPoint[]` | `fetchDemandVsSupply()` → `prompt_requests.created_at` and `resolved_at` grouped by month in JS | Yes — queries real request data | FLOWING |
| `components/dashboard/top-prompts-table.tsx` | `prompts: TopPrompt[]` | `fetchTopPrompts()` → `prompts.total_checkouts DESC LIMIT 10` | Yes — live query; seed data provides varied checkout counts | FLOWING |
| `components/dashboard/needs-attention-table.tsx` | `prompts: NeedsAttentionPrompt[]` | `fetchNeedsAttention()` → two queries: lowest `avg_effectiveness` + `total_checkouts = 0` | Yes — live queries with `total_ratings > 0` guard on lowest rated | FLOWING |

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All 154 tests pass | `npm test` | 23 test files, 154 tests, 0 failures | PASS |
| recharts 2.x installed | `npm ls recharts` | `recharts@2.15.4` | PASS |
| Migration 004 SQL file exists with correct content | File read | `decline_reason` column + `requests_update_admin` policy present | PASS |
| review-queue-card uses shared utility (no local duplicate) | `grep -c "function getRelativeTime" review-queue-card.tsx` | 0 | PASS |
| No `it.todo` stubs remain in any of 4 test files | grep count | 0 in all 4 files | PASS |
| Admin redirect is /dashboard | `grep "redirect.*dashboard" login/actions.ts` | Found in both `signIn` and `signInAsDemo` | PASS |
| Seed data has all 4 request statuses | seed.sql inspection | open (x4), planned (x1), resolved (x1), declined (x1) | PASS |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| DEMAND-01 | 05-01, 05-02, 05-03 | User can submit a prompt request with title, description, category, urgency | SATISFIED | `new-request-dialog.tsx` + `submitRequest` action + test suite passing |
| DEMAND-02 | 05-02 | User can view open prompt requests sorted by upvotes | SATISFIED | `fetchPromptRequests()` default sort='upvotes', JS-side sort, demand board page |
| DEMAND-03 | 05-02 | User can upvote a prompt request (toggle) | SATISFIED | `toggleUpvote` action + `RequestCard` optimistic UI + test suite passing |
| DEMAND-04 | 05-01, 05-03 | Admin can resolve a request by linking it to a created prompt | SATISFIED | `resolveRequest` action + `ResolveRequestDialog` with autocomplete + tests passing |
| DEMAND-05 | 05-01, 05-03 | Admin can decline a request with a reason | SATISFIED | `declineRequest` action + inline decline form in `RequestCard` + tests passing |
| DASH-01 | 05-01, 05-04 | Admin can view top-level metrics: active prompts, checkouts, open requests | SATISFIED | `fetchDashboardMetrics()` + `MetricCard` + admin gate + gate tests passing |
| DASH-02 | 05-04 | Admin can view usage chart (checkouts over time) | SATISFIED | `fetchUsageOverTime()` + `UsageLineChart` with weekly Recharts LineChart |
| DASH-03 | 05-04 | Admin can view top 10 most used and bottom 10 lowest-rated prompts | SATISFIED | `fetchTopPrompts()` + `TopPromptsTable`; `fetchNeedsAttention()` + `NeedsAttentionTable` with StarRating |
| DASH-04 | 05-04 | Admin can view demand vs supply (requests opened vs resolved) | SATISFIED | `fetchDemandVsSupply()` + `DemandBarChart` with amber/teal bars |
| SEED-02 | 05-05 | Seed data includes 2-3 sample engagements with forked prompts showing workflow | SATISFIED | `seed.sql` — 2 engagements (Acme Corp AI Strategy, TechStart Enablement), 5 forks with varied ratings/merge statuses/timestamps |
| SEED-03 | 05-05 | Seed data includes sample prompt requests on the demand board | SATISFIED | `seed.sql` — 7 prompt requests across all 4 statuses, upvote rows simulating community voting |

**All 11 requirement IDs satisfied. No orphaned requirements found.**

---

## Anti-Patterns Found

None flagged. All `placeholder=` attributes in form components are HTML input placeholder text (expected UI pattern). The `empty returns` in `fetchNeedsAttention` (e.g., `return []`) are error fallbacks with prior DB queries, not stubs. No TODO/FIXME comments, no console.log-only handlers, no hardcoded empty arrays passed as props at call sites.

---

## Human Verification Required

### 1. Demand Board — Full Interaction Flow

**Test:** Log in as consultant via demo bypass. Navigate to /demand. Verify request cards render with upvote counts, status badges, category/urgency badges, requester name, and relative time. Click the upvote arrow on a request. Verify count increments and arrow fills blue. Click again — verify it un-upvotes (arrow goes back to outline).
**Expected:** Immediate visual feedback. No page reload needed. Error toast if action fails.
**Why human:** Optimistic UI state and visual transitions cannot be verified by grep.

### 2. Admin Demand Board — Triage Actions

**Test:** Log in as admin via demo bypass. Navigate to /demand. Verify admin controls appear on Open cards (Mark Planned, Resolve, Decline). Click "Mark Planned" on a request — verify status badge changes to amber "Planned" and "Revert to Open" button appears. Click "Decline" — verify inline textarea expands, type a reason, click "Confirm Decline" — verify card moves to Declined tab.
**Expected:** Correct state transitions. Toast confirmations. Form collapses after submit.
**Why human:** Client state transitions (isDeclining, status badge re-render) require visual inspection.

### 3. Resolve Dialog — Autocomplete Search

**Test:** As admin, click "Resolve" on an open request. Verify the resolve dialog opens. Type a partial prompt title. Verify filtered results appear (max 5). Click a result — verify it fills the input and highlights with bg-accent. Click "Confirm Resolve" — verify dialog closes and request moves to Resolved tab with linked prompt name.
**Expected:** Search is case-insensitive, max 5 results, selection highlights, toast "Request resolved".
**Why human:** Dropdown filtering and selection state require interactive testing.

### 4. Admin Dashboard — Live Charts Rendering

**Test:** Log in as admin via demo bypass. Land on /dashboard. Verify three metric cards show non-zero numbers (seed data provides checkouts, prompt requests, merge suggestions). Verify line chart shows data points with a blue line. Verify bar chart shows amber and teal bars. Verify Top Prompts table has entries with proportional bar indicators. Verify Needs Attention table shows Underutilized section with seed prompts.
**Expected:** All charts render with real seed data — no empty states except where data is genuinely absent.
**Why human:** Recharts rendering, chart dimensions, and visual correctness require browser inspection.

### 5. Demo Claim Flow — Seed Data Ownership

**Test:** Log in as consultant via demo bypass. Navigate to /engagements — verify "Acme Corp AI Strategy" and "TechStart Enablement" appear. Navigate to /demand — verify 4+ open requests with upvote counts (not all 0). Log out. Log in as consultant again — verify the same seed data appears (seed claim runs each login, reclaiming from placeholder).
**Expected:** Seed engagements and requests visible immediately after demo login with correct ownership.
**Why human:** Requires running against a live Supabase instance with seed data applied. Cannot verify RLS transfer logic programmatically.

---

## Gaps Summary

No gaps found. All 21 observable truths verified, all 25 artifacts substantive and wired, all 10 key links connected, all 154 tests passing, all 11 requirement IDs satisfied, no blocker anti-patterns detected.

---

_Verified: 2026-03-26T15:35:00Z_
_Verifier: Claude (gsd-verifier)_
