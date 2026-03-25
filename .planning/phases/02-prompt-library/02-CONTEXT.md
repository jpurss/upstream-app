---
description: Phase 2 implementation decisions for Upstream Prompt Library — browse layout, filtering, detail page, admin CRUD, sorting, empty states, and markdown editor choices.
date_last_edited: 2026-03-25
---

# Phase 2: Prompt Library - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can browse, search, filter, and read prompts from the central library — and admins can create, edit, and deprecate them. This phase builds on the deployed schema, auth system, and seed data from Phase 1. No engagement workflow, no forking, no merge flow.

Requirements: LIB-01, LIB-02, LIB-03, LIB-04, LIB-05, LIB-06, LIB-07, LIB-08

</domain>

<decisions>
## Implementation Decisions

### Library Browse Layout & Cards
- **D-01:** Card grid as default view with a toggle to switch to compact list/table view. Responsive grid (3-4 columns). Toggle button in the filter bar area.
- **D-02:** Rich prompt cards showing: category badge (top-left), target model badge (top-right), title, 1-line description truncated, capability type + industry tags, star rating with count, checkout count.
- **D-03:** Whole card is clickable — navigates to `/library/[id]` detail page. Subtle hover effect (elevation/border glow).

### Filtering & Search Interaction
- **D-04:** Top filter bar above the grid — horizontal row with search input on the left, dropdown selects for filters, grid/list toggle and sort dropdown on the right.
- **D-05:** Instant/real-time filtering — results update immediately as user types or selects a filter. Search is debounced (300ms). URL params update for shareable/bookmarkable filter state.
- **D-06:** All six filter dimensions from LIB-05: category, capability type, industry, effectiveness range (slider), status (active/deprecated), target model. Each as a dropdown select (or slider for effectiveness).
- **D-07:** Active filters shown as dismissible chips below the filter bar. "Clear all" button appears when any filter is active. Result count displayed (e.g., "6 of 18 prompts").

### Prompt Detail Page
- **D-08:** Two-column layout — full markdown content rendered on the left (wide column), metadata sidebar on the right. Back-to-library link at top.
- **D-09:** Markdown content rendered with proper formatting (headings, lists, code blocks) using Geist Mono as base font. Uses a markdown rendering library (react-markdown or similar).
- **D-10:** Copy-to-clipboard button in the metadata sidebar. Copies full markdown content. Toast notification confirms success. Button icon briefly changes to checkmark.
- **D-11:** Field intelligence shown as stats block in sidebar: avg effectiveness (star + number), total checkouts, active fork count, total ratings count. No feedback section yet — that comes from Phase 3 forks.

### Admin CRUD Experience
- **D-12:** Dedicated form pages for create (`/library/new`) and edit (`/library/[id]/edit`). Full-page forms with all prompt fields. Save/Cancel buttons.
- **D-13:** Write/Preview tabs for markdown content editor — plain textarea in Write tab (Geist Mono font), rendered preview in Preview tab. No toolbar buttons — admins know markdown.
- **D-14:** Deprecation via status toggle with confirmation dialog: "This prompt will be hidden from browse but remains in the database." Deprecated prompts filtered from default library view but accessible by direct URL.
- **D-15:** Admin-only controls (Create, Edit, Deprecate buttons) are hidden for non-admin users — not disabled, just not rendered. Consultants see a clean read-only library.
- **D-16:** "New Prompt" button in the library page header, right-aligned. Only visible to admin users.

### Sorting
- **D-17:** Four sort options: Highest rated (default), Most used (checkouts), Newest first, Alphabetical. Default sort by highest rated — best content surfaces for first impression.

### Empty & Zero States
- **D-18:** When filters return no results: centered message "No prompts match your filters" with a "Clear all filters" button. Keeps user on the page with clear recovery action.

### Markdown Editor
- **D-19:** Write/Preview tab pattern (like GitHub issues) for the admin create/edit form. Simple textarea + preview toggle. No rich text toolbar.

### Claude's Discretion
- Page header design (title + count + optional subtitle — user said "you decide")
- Loading skeleton patterns for card grid and detail page
- Exact spacing, card dimensions, and border radius
- Markdown rendering library choice (react-markdown, etc.)
- List view column layout and density
- Form validation patterns and error messages
- Toast notification library/pattern
- Filter dropdown component choice (shadcn Select, Popover, etc.)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### PRD & Data Model
- `upstream-prd.md` §4 — Core data model (Prompt entity fields, relationships)
- `upstream-prd.md` §7.2 — Database schema (prompts table, indexes including full-text search)
- `upstream-prd.md` §7.3 — RLS policies (prompts_read_all for any auth user, prompts_write_admin for admin only)

### Requirements
- `.planning/REQUIREMENTS.md` — LIB-01 through LIB-08 acceptance criteria

### UI/UX Direction
- `upstream-prd.md` §8 — UI/UX principles, design direction, key interactions
- `.impeccable.md` — Design system: color palette, typography, spacing, component principles

### Prior Phase Context
- `.planning/phases/01-foundation/01-CONTEXT.md` — Phase 1 decisions that carry forward (auth, schema, navigation, seed data)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/ui/badge.tsx` — Category and model badges on prompt cards
- `components/ui/button.tsx` — Primary/secondary/ghost button variants for CTA, filters, actions
- `components/ui/skeleton.tsx` — Loading placeholders for card grid and detail page
- `components/ui/input.tsx` — Search input field
- `components/ui/tooltip.tsx` — Hover tooltips for metadata and actions
- `components/ui/sheet.tsx` — Could be used for mobile filter panel or side panels
- `components/app-sidebar.tsx` — Navigation sidebar with role-based filtering (Library link already active)

### Established Patterns
- Server components for initial data fetching (`await createClient()` from `@supabase/ssr`)
- Server actions for mutations (create/edit/deprecate) — `'use server'` pattern from auth actions
- Browser client exists (`lib/supabase/client.ts`) but unused — Phase 2 will need it for client-side filtering
- Route groups: `(app)` for authenticated routes with layout, `(auth)` for public routes
- Role checking via `app_metadata.role` from JWT (not `user_metadata`)
- Dark mode via next-themes provider

### Integration Points
- `app/(app)/library/page.tsx` — Existing placeholder page to replace with full library UI
- `app/(app)/library/[promptId]/page.tsx` — New detail page route
- `app/(app)/library/new/page.tsx` — New admin create page
- `app/(app)/library/[promptId]/edit/page.tsx` — New admin edit page
- `lib/supabase/server.ts` — Server-side Supabase client for queries
- `lib/supabase/client.ts` — Browser client for real-time filter state
- `supabase/seed.sql` — 18 seed prompts already loaded with full schema

</code_context>

<specifics>
## Specific Ideas

- Card grid with toggle to list view — covers both discovery browsing and power-user scanning
- Rich cards show enough info to decide whether to click (category, model, rating, checkouts)
- Filter bar is top-horizontal (Linear/Notion style), not a sidebar — maximizes card grid space
- Instant filtering with URL param state — shareable filter combinations
- Active filter chips + result count keep user oriented
- Detail page: content-left, metadata-sidebar-right layout
- Copy button in sidebar with toast confirmation — primary action for consultants
- Admin CRUD on dedicated pages (not modals) — enough fields to justify full page
- Write/Preview tabs for markdown (GitHub-style) — no toolbar clutter
- Deprecation is a status change with confirmation, not a delete
- Admin controls hidden (not disabled) for non-admins
- Default sort by highest rated — surfaces best content for Brendan's first impression

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-prompt-library*
*Context gathered: 2026-03-25*
