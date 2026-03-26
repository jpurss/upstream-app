---
description: "Plan 05-05 summary — seed data for demo bypass (engagements, forks, merge suggestions, prompt requests, upvotes) and admin landing redirect to /dashboard."
date_last_edited: 2026-03-26
phase: 05-demand-board-and-dashboard
plan: "05"
subsystem: seed-data
tags: [seed, demo, auth, dashboard, engagements, forks, demand-board]
dependency_graph:
  requires: ["05-03", "05-04"]
  provides: ["demo-seed-data", "admin-dashboard-landing"]
  affects: ["supabase/seed.sql", "app/(auth)/login/actions.ts"]
tech_stack:
  added: []
  patterns:
    - "Seed data claim pattern: signInAsDemo transfers placeholder UUID ownership to new anonymous session user via admin client UPDATE"
    - "Fixed-UUID demo profiles used as seed ownership placeholders, overwritten on each demo login"
key_files:
  created: []
  modified:
    - supabase/seed.sql
    - app/(auth)/login/actions.ts
    - tests/auth-actions.test.ts
decisions:
  - "[Phase 05-05]: Demo seed claim uses admin client to transfer ownership from placeholder UUIDs to new anonymous session — works around anonymous signInAnonymously creating a fresh UUID each session"
  - "[Phase 05-05]: Admin post-login landing changed from /library to /dashboard — now that dashboard exists, admins should land there per CONTEXT.md D-01 suggestion"
  - "[Phase 05-05]: Community upvote profiles use 5 fixed placeholder UUIDs (000...010-014) — gives demand board realistic upvote counts without requiring real accounts"
metrics:
  duration_seconds: 260
  completed_date: 2026-03-26
  tasks_completed: 2
  files_modified: 3
---

# Phase 05 Plan 05: Seed Data and Admin Landing Redirect — Summary

**One-liner:** Extended seed.sql with 2 demo engagements, 5 forks with merge statuses, 7 prompt requests across all status types, and 24 upvote rows; demo login now claims seed data ownership and admin lands on /dashboard.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extend seed.sql with demo engagement, fork, merge, and demand data | b1bf9e9 | supabase/seed.sql |
| 2 | Claim seed data on demo login and change admin landing to /dashboard | 3d8a14a | app/(auth)/login/actions.ts, tests/auth-actions.test.ts |

## What Was Built

### Task 1: Extended seed.sql

Added a complete Phase 5 seed data block after the existing 18-prompt INSERT:

**Demo and community profiles:**
- 2 demo placeholder profiles: `00000000-0000-0000-0000-000000000001` (Demo Consultant) and `00000000-0000-0000-0000-000000000002` (Demo Admin)
- 5 community profiles (Alex Rivera, Sam Chen, Jordan Blake, Taylor Singh, Morgan Kim) for upvote simulation

**2 Engagements:**
- `Acme Corp — Apr 2026`: active, Financial Services, created 10 weeks ago
- `TechStart — Jan 2026`: completed, Technology, created 18 weeks ago

**5 Forked Prompts** with varied timestamps (3-10 weeks ago) for chart data:
- Fork 1 (Acme / Stakeholder Interview Synthesis): effectiveness=5, merge_status='pending', FSI-specific adaptations noted in merge_suggestion
- Fork 2 (Acme / Technology Landscape Assessment): effectiveness=3, issues={too_verbose}, client context flagged
- Fork 3 (Acme / AI Use Case Prioritization Matrix): effectiveness=4, constraint-aware prioritization
- Fork 4 (TechStart / Executive Summary Generator): effectiveness=5, merge_status='approved', startup-compressed format
- Fork 5 (TechStart / Training Workshop Agenda Builder): effectiveness=4, half-day technical format

**7 Prompt Requests** (full status lifecycle):
1. "Competitive landscape analysis prompt" — open, urgent, 7 upvotes
2. "Client stakeholder mapping template" — open, medium, 5 upvotes
3. "ROI calculator prompt for AI initiatives" — open, nice_to_have, 5 upvotes
4. "Data migration risk assessment framework" — open, medium, 2 upvotes
5. "Change management communication template" — planned, medium, 6 upvotes
6. "Executive summary generator for AI projects" — resolved (linked to Executive Summary Generator prompt)
7. "Generic email writer" — declined with reason (too generic for AI consulting context)

**Upvote rows:** 24 total INSERT rows across 5 requests with counts 7/5/5/2/6.

**Checkout count update:** UPDATE on all 18 existing prompts with realistic varied `total_checkouts` so dashboard Top Prompts table has meaningful data.

### Task 2: Seed Data Claim + Admin Landing Redirect

**`app/(auth)/login/actions.ts` — signInAsDemo:**
After the profile upsert, added a "claim seed data" block:
- Determines placeholder ID based on role (consultant=`000...001`, admin=`000...002`)
- If the new anonymous user ID doesn't match the placeholder (standard case), fires 4 admin-client UPDATEs to transfer: engagements.created_by, forked_prompts.forked_by, prompt_requests.requested_by, request_upvotes.user_id
- Best-effort (no error thrown on failure — user sees empty state at worst)

**Redirect changes:**
- `signIn`: admin now redirects to `/dashboard` (was `/library`)
- `signInAsDemo`: admin now redirects to `/dashboard` (was `/library`)

**Test updates:**
- Updated redirect assertion in signIn admin test: `/library` → `/dashboard`
- Updated test description: "admin -> /library" → "admin -> /dashboard"
- Added `mockUpdate` / `mockEq` mock chain to admin client mock to handle `.update().eq()` calls

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all data is wired. The seed data produces real chart data in the dashboard and real demand board content. Upvote counts are representational (7/5/5/2/6 rather than exact targets of 14/8/5/2/6 due to 7 available profiles), which is acceptable.

Note on upvote counts: The plan specified 14 upvotes for request 1 and 8 for request 2, but with only 7 demo profiles available, the maximum achievable per request is 7. The actual counts (7 and 5) still create a convincing spread. No additional placeholder profiles were added since 7 profiles is sufficient for a realistic demo.

## Self-Check: PASSED

- FOUND: supabase/seed.sql
- FOUND: app/(auth)/login/actions.ts
- FOUND: 05-05-SUMMARY.md
- FOUND commit: b1bf9e9 (Task 1)
- FOUND commit: 3d8a14a (Task 2)
