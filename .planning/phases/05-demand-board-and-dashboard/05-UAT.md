---
status: complete
phase: 05-demand-board-and-dashboard
source: [05-01-SUMMARY.md, 05-02-SUMMARY.md, 05-03-SUMMARY.md, 05-04-SUMMARY.md, 05-05-SUMMARY.md]
started: 2026-03-26T19:30:00Z
updated: 2026-03-26T19:45:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running dev server. Run `supabase db reset` to re-seed. Start `npm run dev`. Server boots without errors, seed completes, login page loads.
result: pass

### 2. Sidebar Navigation
expected: After logging in, sidebar shows "Demand Board" and "Dashboard" items. Both are clickable (not grayed out or disabled). Clicking each navigates to /demand and /dashboard respectively.
result: pass

### 3. Demand Board Page
expected: Navigate to /demand. See request cards from seed data showing upvote counts (arrow + number), status badges (Open/Planned/Resolved/Declined), and urgency badges. Filter tabs appear at top: Open, Planned, Resolved, Declined, All. Sort dropdown shows: Most upvoted, Newest, Urgent.
result: issue
reported: "They all work but it feels super sluggish when I click a filter or sort. Also when I click upvote, there's quite a long delay before it changes number and color. Doesn't feel like a great UX"
severity: minor

### 4. Demand Board Filtering and Sorting
expected: Click each filter tab — cards filter by status. "All" shows everything. Click sort dropdown options — "Most upvoted" puts highest-voted first, "Newest" sorts by date, "Urgent" sorts by urgency level.
result: issue
reported: "urgent -> nice to have -> medium. That's the wrong order but urgent did get moved to the top"
severity: major

### 5. Upvote Toggle
expected: Click the upvote arrow on a request card. Arrow highlights and count increments by 1 (optimistic). Click again — arrow un-highlights and count decrements. Works instantly without page reload.
result: pass

### 6. New Request Dialog
expected: Click "New Request" button at the top of demand board. Dialog opens with 4 fields: title, description, category dropdown, urgency dropdown. Fill all fields and submit. Dialog closes, new request appears in the board under "Open" tab.
result: pass

### 7. Admin Triage — Mark Planned
expected: As admin, see "Mark Planned" button on an open request card. Click it — card status changes to "Planned". A "Revert to Open" button now appears on that card. Click "Revert to Open" — status goes back to "Open".
result: pass

### 8. Admin Triage — Resolve with Prompt
expected: As admin, click "Resolve" on an open/planned request card. A dialog appears with a prompt search/autocomplete field. Type a few letters — matching library prompts appear (max 5). Select one. Request becomes "Resolved" with a link to the selected prompt.
result: pass

### 9. Admin Triage — Decline with Reason
expected: As admin, click "Decline" on a request. An inline form expands below the card (not a modal) with a required reason textarea. Type a reason and submit. Request becomes "Declined". The decline reason is visible on the card.
result: pass

### 10. Dashboard — Admin Gate and Layout
expected: As admin, navigate to /dashboard. See 3 metric cards at top (active prompts count, total checkouts count, open demand items count). Below that, a usage-over-time line chart (blue line) and a demand vs supply bar chart (amber and teal bars). Below charts, two tables: Top Prompts (with proportional bar indicators) and Needs Attention. As a non-admin user, navigating to /dashboard redirects to /library.
result: issue
reported: "pass but the cards for those data points are massive. Taking up way too much real estate for 3 pieces of data"
severity: cosmetic

### 11. Demo Seed Data
expected: Click "Continue as Demo" on login page. After login, navigate to /demand — see 7 seed request cards with realistic upvote counts (some with 5-7 upvotes). Navigate to /dashboard — charts show data points (not empty). Metric cards show non-zero numbers. Top Prompts table shows prompts with checkout counts.
result: pass

### 12. Admin Landing Redirect
expected: Sign in as admin (or demo admin). After login, land on /dashboard instead of /library. The dashboard loads with live data.
result: pass

### 13. Consultant Seed Data Parity
expected: Demo consultant should see the same seed data as demo admin on the demand board — same request cards, same upvote counts.
result: issue
reported: "Consultant seed data should match admin seed data"
severity: major

### 14. Consultant Library Access
expected: Consultant can click Library in the sidebar and browse prompts (read-only).
result: issue
reported: "the consultant library button doesn't load anymore and I can't access the library in the consultant view now"
severity: blocker

## Summary

total: 14
passed: 9
issues: 5
pending: 0
skipped: 0

## Gaps

- truth: "Demand board filter/sort and upvote toggle should feel responsive without full page reload delay"
  status: failed
  reason: "User reported: They all work but it feels super sluggish when I click a filter or sort. Also when I click upvote, there's quite a long delay before it changes number and color."
  severity: minor
  test: 3
  artifacts:
    - app/(app)/demand/page.tsx
    - components/demand/demand-board-client.tsx
    - components/demand/request-card.tsx
  missing:
    - "Client-side filtering/sorting instead of router.push server round-trip"
    - "True optimistic upvote update before server action completes"

- truth: "Urgent sort should order: urgent → medium → nice_to_have (not alphabetical)"
  status: failed
  reason: "User reported: urgent -> nice to have -> medium. That's the wrong order but urgent did get moved to the top"
  severity: major
  test: 4
  artifacts:
    - lib/data/prompt-requests.ts
  missing:
    - "JS-side urgency sort using priority map instead of Supabase alphabetical ORDER BY"

- truth: "Dashboard metric cards should be compact — proportional to the data they display"
  status: failed
  reason: "User reported: the cards for those data points are massive. Taking up way too much real estate for 3 pieces of data"
  severity: cosmetic
  test: 10
  artifacts:
    - components/dashboard/metric-card.tsx
  missing:
    - "Reduce MetricCard padding and font sizes for more compact layout"

- truth: "Consultant demo should see the same demand board seed data as admin demo"
  status: failed
  reason: "User reported: Consultant seed data should match admin seed data"
  severity: major
  test: 13
  artifacts:
    - supabase/seed.sql
    - app/(auth)/login/actions.ts
  missing:
    - "Seed data claim should transfer ALL demo data to both roles, not just role-specific placeholder data"

- truth: "Consultant can browse the prompt library (read-only)"
  status: failed
  reason: "User reported: the consultant library button doesn't load anymore and I can't access the library in the consultant view now"
  severity: blocker
  test: 14
  artifacts:
    - lib/supabase/middleware.ts
  missing:
    - "Middleware redirects non-admin from /library to /engagements — consultants cannot browse prompts"
