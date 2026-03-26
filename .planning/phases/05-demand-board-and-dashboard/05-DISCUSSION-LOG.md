---
description: Audit trail of Phase 5 discuss-phase Q&A — upvote design, request cards, dashboard charts, admin resolve/decline flow, seed data narrative decisions.
date_last_edited: 2026-03-26
---

# Phase 5: Demand Board and Dashboard - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-26
**Phase:** 05-demand-board-and-dashboard
**Areas discussed:** Upvote & request cards, Dashboard layout & charts, Admin resolve/decline flow, Seed data narrative

---

## Upvote & Request Cards

### Upvote Interaction

| Option | Description | Selected |
|--------|-------------|----------|
| Arrow + count | Vertical arrow button with count below, filled when upvoted. ProductHunt/StackOverflow pattern. | ✓ |
| Heart toggle | Heart icon that fills on click, count next to it. Twitter/Instagram pattern. | |
| Thumbs-up button | Thumbs-up icon with count. GitHub reactions pattern. | |

**User's choice:** Arrow + count
**Notes:** Positioned on left side of card, content on right. Matches professional/dense aesthetic.

### Card Information

| Option | Description | Selected |
|--------|-------------|----------|
| Title + description + badges | Title, truncated description, category badge, urgency badge, submitter, relative time | ✓ |
| Include engagement context | Also show which engagement prompted the request | |
| Include status badge | Show open/resolved/declined status badge on each card | |
| Include resolved prompt link | When resolved, show linked prompt as clickable link | ✓ |

**User's choice:** Title + description + badges, Include resolved prompt link
**Notes:** None

### Submission Form

| Option | Description | Selected |
|--------|-------------|----------|
| Dialog from demand board | "New Request" button opens dialog with title, description, category, urgency | ✓ |
| Full page form | Dedicated /demand/new page with more fields | |
| Inline expandable | Expandable form at top of demand board, collapses after submission | |

**User's choice:** Dialog from demand board
**Notes:** Same dialog pattern as new engagement

### Sort & Filter

| Option | Description | Selected |
|--------|-------------|----------|
| Filter tabs + sort | Tabs (Open/Resolved/Declined/All) + sort dropdown (most upvoted, newest, urgent first) | ✓ |
| Full filter bar | Reuse library filter bar with category, urgency, status dropdowns + search | |
| Simple list, no filters | Sorted list of open requests, minimal UI | |

**User's choice:** Filter tabs + sort
**Notes:** Consistent with review queue pattern

---

## Dashboard Layout & Charts

### Metrics Cards

| Option | Description | Selected |
|--------|-------------|----------|
| Active prompts count | Total prompts with status=active | ✓ |
| Avg effectiveness rating | Average star rating across all forks | |
| Total checkouts (forks) | How many times prompts forked into engagements | ✓ |
| Open merge requests + prompt requests | Pending items needing admin attention | ✓ |

**User's choice:** Active prompts, Total checkouts, Open merge + prompt requests
**Notes:** User also wants low-performing/underutilized prompts surfaced (zero or near-zero forks)

### Charts

| Option | Description | Selected |
|--------|-------------|----------|
| All 3 required charts | Line (checkouts/time), tables (top/bottom 10), bar (demand vs supply) | ✓ |
| Charts + avg effectiveness | Same plus 4th metric card with sparkline | |
| Simplified: tables only | Skip line chart, focus on tables and bar chart | |

**User's choice:** All 3 required charts
**Notes:** User specifically requested a way to identify low-performing prompts that aren't being utilized at all

### Charting Library

| Option | Description | Selected |
|--------|-------------|----------|
| Recharts | Most popular React charting library. Declarative, composable, good dark mode. | ✓ |
| shadcn charts (Recharts wrapper) | shadcn/ui charts component built on Recharts | |
| You decide | Let Claude pick | |

**User's choice:** Recharts
**Notes:** None

---

## Admin Resolve/Decline Flow

### Resolve Interaction

| Option | Description | Selected |
|--------|-------------|----------|
| Search-select from card | Resolve button opens dialog with prompt search/autocomplete | ✓ |
| Dropdown on detail page | Navigate to detail page, pick from dropdown | |
| Admin creates prompt first | Reversed flow — creation-centric | |

**User's choice:** Search-select from request card
**Notes:** Stays on demand board, no navigation

### Decline Interaction

| Option | Description | Selected |
|--------|-------------|----------|
| Inline reason on card | Decline button expands inline textarea, same as merge decline | ✓ |
| Dialog with reason | Modal dialog with textarea | |
| You decide | Let Claude pick | |

**User's choice:** Inline reason on card
**Notes:** Consistent with Phase 4 merge decline pattern

### Admin Controls Location

| Option | Description | Selected |
|--------|-------------|----------|
| Directly on cards | Admin sees Resolve/Decline buttons on each card | (user redirected) |
| Separate detail page | Click through to /demand/[id] | |
| Both — cards + detail page | Quick-action from cards or click for full detail | |

**User's choice:** User questioned whether it should be "resolve/decline" — suggested intermediate status
**Notes:** Led to status flow discussion below

### Status Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Add 'planned' status | Open → Planned → Resolved (linked) / Declined (with reason) | ✓ |
| Keep simple: Open → Resolved/Declined | Two end states only | |
| You decide | Let Claude pick | |

**User's choice:** Add 'planned' status
**Notes:** Signals admin intent/responsiveness before prompt exists. User's own idea.

---

## Seed Data Narrative

### Engagement Volume

| Option | Description | Selected |
|--------|-------------|----------|
| 2 engagements, 4-6 forks | Active "Acme Corp" + completed "TechStart". Varied ratings. | ✓ |
| 3 engagements, 6-8 forks | Three engagements, more chart data | |
| 1 engagement, 2-3 forks | Minimal viable seed | |

**User's choice:** 2 engagements, 4-6 forks
**Notes:** None

### Demand Board Seed

| Option | Description | Selected |
|--------|-------------|----------|
| 5-7 requests, mixed statuses | 3-4 open (varied upvotes), 1-2 resolved, 1 declined | ✓ |
| 3-4 requests, all open | Simpler, just voting mechanic | |
| 8-10 requests, rich variety | More data for charts | |

**User's choice:** 5-7 requests, mixed statuses
**Notes:** None

### Data Ownership

| Option | Description | Selected |
|--------|-------------|----------|
| Demo user owns data | Anonymous demo consultant owns engagements, forks, requests | ✓ |
| Mix of demo user + others | Demo user owns some, others from fictitious consultants | |
| You decide | Let Claude pick | |

**User's choice:** Demo user owns the data
**Notes:** First-person experience — Brendan sees "his" work

### Dashboard Data Source

| Option | Description | Selected |
|--------|-------------|----------|
| Live queries from seed data | Real Supabase queries, no fake numbers | ✓ |
| Hardcoded demo numbers | Static impressive-looking numbers | |
| You decide | Let Claude pick | |

**User's choice:** Live queries from seed data
**Notes:** Authentic and trustworthy for the pitch

---

## Claude's Discretion

- Exact seed data content (names, titles, reasons)
- Chart styling and responsive layout
- Sparkline trends vs static metric numbers
- Loading skeleton design
- Empty state messaging
- Underutilized prompts presentation

## Deferred Ideas

None — discussion stayed within phase scope
