---
description: Phase 5 implementation decisions for Demand Board and Dashboard — upvote interaction, request cards, admin resolve/decline flow, dashboard metrics and charts, seed data narrative for demo bypass.
date_last_edited: 2026-03-26
phase: 05-demand-board-and-dashboard
status: ready-for-planning
gathered: 2026-03-26
---

# Phase 5: Demand Board and Dashboard - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers two features that complete the v1 demo:

1. **Demand Board** (`/demand`) — All authenticated users can submit prompt requests, view and upvote existing requests, and see request status. Admins can mark requests as planned, resolve by linking to a created prompt, or decline with a reason.

2. **Admin Dashboard** (`/dashboard`) — Admin-only page showing top-level metrics (active prompts, total forks, open requests), charts (checkouts over time, top/bottom prompts, demand vs supply), and low-utilization prompt identification.

3. **Seed Data** — Pre-populated engagements, forks, merge suggestions, and demand board requests so the demo bypass user sees a living product, not an empty shell.

</domain>

<decisions>
## Implementation Decisions

### Upvote & Request Cards
- **D-01:** Upvote interaction uses arrow + count on the left side of each request card. Filled arrow (brand blue) when user has upvoted, outline when not. Count displayed below the arrow. ProductHunt/StackOverflow pattern.
- **D-02:** Request cards show: title, truncated description (2 lines), category badge, urgency badge (color-coded), submitter name, relative time. When resolved, also show linked prompt name as a clickable link.
- **D-03:** Demand board uses filter tabs: Open | Planned | Resolved | Declined | All — consistent with review queue pattern from Phase 4. Default sort: most upvoted. Additional sort options: newest, urgent first.
- **D-04:** Request submission via dialog triggered by "New Request" button on the demand board. Fields: title (text), description (textarea), category (dropdown — same 6 categories as library), urgency (dropdown — nice_to_have, medium, urgent).

### Admin Resolve/Decline Flow
- **D-05:** Request status lifecycle: Open (blue) → Planned (amber) → Resolved (green, linked to prompt) | Declined (red, with reason). The "Planned" status is an intermediate state signaling admin intent before a prompt exists.
- **D-06:** Admin resolve flow: "Resolve" button on request card opens a dialog with a search-select field. Admin types prompt name, autocomplete shows matches from active library prompts, select one and confirm. Stays on the demand board — no navigation.
- **D-07:** Admin decline flow: "Decline" button on request card expands an inline textarea for a reason (same pattern as merge decline in Phase 4). Required non-empty reason before "Confirm Decline" button activates.
- **D-08:** Admin controls (Planned/Resolve/Decline) appear directly on demand board cards — no separate request detail page. Fast triage workflow. Consultants see read-only cards (no admin buttons).

### Dashboard Layout & Charts
- **D-09:** Three metric cards across the top: (1) Active Prompts count, (2) Total Checkouts (forks), (3) Open Items (pending merge requests + open prompt requests as a combined or split number).
- **D-10:** Three charts per DASH requirements: (1) Line chart — checkouts over time (weekly granularity), (2) Two side-by-side tables — Top 10 most used prompts + Bottom 10 lowest rated prompts, (3) Grouped bar chart — demand vs supply (requests opened vs resolved by month).
- **D-11:** Additionally surface low-utilization prompts — prompts with zero or near-zero forks. Can be integrated into the bottom 10 table or as a separate "underutilized" section. Gives admins visibility into library gaps.
- **D-12:** Charting library: Recharts. Add `recharts` to package.json. Line chart for time series, bar chart for demand vs supply. Tables use existing component patterns (no chart library needed for tables).
- **D-13:** All dashboard data is live queries against real database — no hardcoded demo numbers. Charts and metrics reflect actual seed data. Authentic and trustworthy for the pitch.

### Seed Data Narrative
- **D-14:** 2 sample engagements owned by the demo consultant user: (1) "Acme Corp AI Strategy" — active, 3 forks with varied ratings (3-5 stars), one fork has a pending merge suggestion. (2) "TechStart Enablement" — completed, 2 forks with high ratings (4-5 stars), one fork was merged back to library.
- **D-15:** 5-7 sample prompt requests on the demand board: 3-4 open with varied upvote counts (2-14), 1-2 resolved (linked to existing library prompts), 1 declined with a reason. Shows full lifecycle. Include 1 "planned" status request.
- **D-16:** Demo consultant user owns the engagements, forks, and some demand requests. When Brendan clicks Demo Bypass, he sees "his" work immediately — first-person experience.
- **D-17:** Dashboard data is computed from seed data via live queries — no separate dashboard seed needed. The seed engagements, forks, ratings, and requests produce meaningful chart data.

### Claude's Discretion
- Exact seed data content (engagement names, request titles, decline reasons) — should be realistic for AI consultancy context
- Chart styling, colors, and responsive layout within the dark mode theme
- Whether metric cards use sparkline trends or just static numbers
- Loading skeleton design for dashboard and demand board
- Empty state messaging and icons
- How "underutilized prompts" section is presented (separate card, table row highlight, etc.)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Architecture
- `.planning/REQUIREMENTS.md` — DEMAND-01 through DEMAND-05, DASH-01 through DASH-04, SEED-02, SEED-03
- `.planning/ROADMAP.md` §Phase 5 — success criteria and dependency chain
- `upstream-prd.md` — Full PRD with data model (Section 7.2), demand board spec, dashboard spec

### Schema & Data
- `supabase/migrations/001_initial_schema.sql` — `prompt_requests` and `request_upvotes` table definitions, RLS policies, indexes
- `supabase/seed.sql` — Existing 18 seed prompts pattern for extending with engagement/fork/request seed data

### Established Patterns (from prior phases)
- `components/review/review-queue-card.tsx` — Status badge config pattern (pending/approved/declined with colors and icons) — reuse for request status badges
- `components/review/review-queue-client.tsx` — Filter tabs pattern (Pending/Approved/Declined/All with router.push URL state)
- `components/engagements/merge-suggestion-section.tsx` — Inline decline form pattern
- `components/library/library-grid.tsx` — Card grid with filtering, sorting, search, empty states
- `components/app-sidebar.tsx` — Sidebar nav with `enabled: false` entries for Demand Board and Dashboard (flip to true)
- `lib/data/merge-suggestions.ts` — Data access layer pattern (fetchAll, fetchById, count functions)
- `app/(app)/review/actions.ts` — Admin server action pattern (getAdminUser + createAdminClient)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Card/Grid/Badge/Dialog** — Full shadcn/ui component library already installed. Card, Badge, Dialog, AlertDialog, Tabs, Button, Input, Textarea, Select, Skeleton, Spinner all available.
- **StarRating** (`components/engagements/star-rating.tsx`) — Reusable for displaying fork effectiveness in dashboard tables
- **FilterChips** (`components/library/filter-chips.tsx`) — Active filter pills with clear buttons, reusable if demand board adds filters
- **EmptyState pattern** — Centered icon + headline + explainer + CTA, used in library-grid and engagement-grid

### Established Patterns
- **Server component pages** fetch data with `createClient()`, pass to client components as props
- **Server actions** (`'use server'`) handle mutations with role check + `revalidatePath()`
- **Admin client** (`createAdminClient()`) bypasses RLS for admin-only operations
- **Role detection**: `user.app_metadata.role` with demo role fallback for anonymous users
- **URL state**: `nuqs` for shareable filter/sort state; review queue uses `router.push` for simpler tab state
- **Status badge colors**: Pending=#FFB852 (amber), Approved=#65CFB2 (green), Declined=#E3392A (red) — extend with Open=blue, Planned=amber

### Integration Points
- **Sidebar**: `app-sidebar.tsx` lines 39-40 have Demand Board and Dashboard entries with `enabled: false` — flip to `true`
- **Admin landing**: Phase 3 D-01 set admin landing to `/library` — consider changing to `/dashboard` now that it exists
- **Seed data**: Current seed.sql has 18 prompts. Phase 5 seed extends with engagements, forks, merge suggestions, and prompt requests for the demo user
- **Schema**: `prompt_requests` table exists but needs `planned` added to the status values (currently `open, resolved, declined`)

</code_context>

<specifics>
## Specific Ideas

- User wants low-performing/underutilized prompts surfaced on the dashboard — not just lowest rated, but also least checked out (zero or near-zero forks)
- "Planned" status was user's idea — signals admin responsiveness before a prompt is actually created, making the demand board feel like a real prioritization tool
- Resolve flow stays on the demand board (no detail page) — fast admin triage is the priority
- Arrow + count upvote is positioned on the left side of request cards, not inline with metadata

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-demand-board-and-dashboard*
*Context gathered: 2026-03-26*
