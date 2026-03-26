---
description: Phase roadmap for Upstream — a prompt management system for AI consultancies. Five phases from foundation and auth through library, engagement workspace, merge workflow, and demand board/dashboard.
date_last_edited: 2026-03-26
---

# Roadmap: Upstream

## Overview

Upstream ships as five phases that follow the strict dependency chain of the data model: schema and auth must exist before the library is readable, the library must exist before prompts can be forked, forks must exist before merges can be suggested, and the admin dashboard is only meaningful after real engagement data exists. Each phase closes a complete loop that a user can verify end-to-end before the next phase begins.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Database schema, auth (email + demo bypass), UI shell, and seed library data
- [x] **Phase 2: Prompt Library** - Admin CRUD, browse/search/filter, prompt detail, copy-to-clipboard (completed 2026-03-25)
- [ ] **Phase 3: Engagement Workspace** - Engagement management, fork/checkout, edit, rate, and field feedback
- [ ] **Phase 4: Merge Workflow** - Suggest merge, side-by-side diff, review queue, approve and reject
- [ ] **Phase 5: Demand Board and Dashboard** - Prompt requests, upvoting, admin metrics, and analytics charts

## Phase Details

### Phase 1: Foundation
**Goal**: A deployed, auth-gated application exists with the correct schema, role enforcement, demo bypass, and seed library data — so every subsequent phase builds on a stable base.
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, UI-01, UI-02, UI-03, UI-04, SEED-01
**Success Criteria** (what must be TRUE):
  1. User can sign up, log in, and log out — session persists across browser refresh
  2. Demo bypass button on the login page creates an anonymous session with full read access and pre-loaded seed prompts visible immediately — no signup required
  3. Admin and consultant roles are enforced — a consultant cannot access admin-only routes
  4. The UI shell renders in dark mode with Human Agency blue accent, sidebar navigation, monospace prompt content, and sans-serif chrome
  5. 18 realistic seed prompts across 6 categories exist in the database and are visible to any authenticated or demo user
**Plans:** 3/3 plans executed

Plans:
- [x] 01-01-PLAN.md — Project bootstrap, Supabase clients, full schema + RLS + Auth Hook, Vitest setup
- [x] 01-02-PLAN.md — Auth Server Actions (signup, login, logout, demo bypass), login page UI, signup page
- [x] 01-03-PLAN.md — App shell (sidebar, demo banner), library placeholder, 18 seed prompts

### Phase 2: Prompt Library
**Goal**: Users can browse, search, filter, and read prompts from the central library — and admins can create, edit, and deprecate them.
**Depends on**: Phase 1
**Requirements**: LIB-01, LIB-02, LIB-03, LIB-04, LIB-05, LIB-06, LIB-07, LIB-08
**Success Criteria** (what must be TRUE):
  1. User can browse all prompts in a grid or list view showing title, category badge, capability type, avg rating, checkout count, and model badge
  2. User can filter prompts by category, capability type, industry, effectiveness range, status, and target model — results update immediately
  3. User can search by keyword across title, description, and content — relevant prompts appear
  4. User can open a prompt detail page showing full rendered markdown content, metadata, and aggregate field intelligence (avg rating, total forks, recent feedback)
  5. Admin can create, edit, and deprecate prompts — consultant users see no create/edit/deprecate controls
**Plans:** 4/4 plans complete

Plans:
- [x] 02-01-PLAN.md — Install dependencies, shared Prompt type, data-access layer, Toaster + NuqsAdapter
- [x] 02-02-PLAN.md — Library browse page: card grid/list, filter bar, search, sort, filter chips, empty states
- [x] 02-03-PLAN.md — Prompt detail page: markdown content, metadata sidebar, copy-to-clipboard, field intelligence
- [x] 02-04-PLAN.md — Admin CRUD: server actions, create/edit form pages, deprecation dialog, admin controls

### Phase 3: Engagement Workspace
**Goal**: Consultants can create client engagements, fork prompts into them, adapt and annotate the forked content, and rate effectiveness after use — completing the core "GitHub for Prompts" loop.
**Depends on**: Phase 2
**Requirements**: ENG-01, ENG-02, ENG-03, ENG-04, FORK-01, FORK-02, FORK-03, FORK-04, FORK-05, FORK-06, FORK-07
**Success Criteria** (what must be TRUE):
  1. User can create an engagement, view their engagement list with status indicators, mark an engagement complete or paused, and access the engagement workspace
  2. User can fork a prompt from the library into an engagement — the fork captures the original content at fork time and appears in the engagement workspace
  3. User can open a forked prompt and edit its content in a markdown editor, add adaptation notes, flag client-specific context, and save changes
  4. User can rate a forked prompt's effectiveness with 1-2 clicks from the engagement workspace — no modal, no form submission required
  5. User can view the diff between the original (at fork time) and their adapted version within the forked prompt view
**Plans:** 6/7 plans executed

Plans:
- [x] 03-01-PLAN.md — Install deps, Engagement/Fork types, data access layer, server actions, sidebar nav, role-based redirect
- [x] 03-02-PLAN.md — Engagement list page: card grid, empty state, create engagement modal with prompt picker
- [x] 03-03-PLAN.md — Engagement workspace: header with status dropdown, fork card grid, fork empty state
- [x] 03-04-PLAN.md — Fork creation: 3 entry points, server actions, prompt picker modal, duplicate prevention
- [x] 03-05-PLAN.md — Fork detail: Write/Preview/Diff editor, autosave, star rating, issue tags, feedback sidebar
- [x] 03-06-PLAN.md — Gap closure: profile creation on auth + engagement dialog simplification
- [x] 03-07-PLAN.md — Gap closure: proxy role redirect + ForkGrid CTA wiring + inline star rating

### Phase 4: Merge Workflow
**Goal**: The knowledge loop closes — consultants can suggest pushing field-tested improvements back to the central library, and admins can review, diff, approve, or reject them.
**Depends on**: Phase 3
**Requirements**: MERGE-01, MERGE-02, MERGE-03, MERGE-04, MERGE-05
**Success Criteria** (what must be TRUE):
  1. User can submit a merge suggestion from any forked prompt with a merge note — the suggestion enters a pending review queue
  2. The merge suggestion view shows a side-by-side diff of the original library content vs the adapted fork content
  3. Admin can view all pending merge suggestions with context (who suggested, which engagement, effectiveness rating) and filter by status
  4. Admin can approve a merge — the central library prompt content updates, version increments, and a changelog entry is created
  5. Admin can decline a merge with a reason — the fork is notified of the rejection reason
**Plans:** 7 plans (4 executed + 1 in progress + 2 gap closure)

Plans:
- [x] 04-00-PLAN.md — Wave 0: Create 6 behavioral test stub files for TDD (merge-suggest, merge-data, review-queue, merge-approve, merge-decline, merge-diff)
- [x] 04-01-PLAN.md — Schema migration, merge types, data access layer, server actions (suggestMerge, approveMerge, declineMerge)
- [x] 04-02-PLAN.md — Fork sidebar merge section (suggest/status badges), app sidebar pending count badge
- [x] 04-03-PLAN.md — Review queue page: filter tabs, rich context cards, empty state, loading skeleton
- [x] 04-04-PLAN.md — Review detail page: side-by-side diff, edit-before-approve, approve/decline flows
- [ ] 04-05-PLAN.md — Gap closure: DiffViewer showDiffOnly, ReviewContextBar, ApproveConfirmDialog, ReviewContentEditor rewrite
- [ ] 04-06-PLAN.md — Gap closure: ReviewDetailClient redesign (stacked 4-zone layout), ReviewActionBar, status-aware rendering

### Phase 5: Demand Board and Dashboard
**Goal**: The demo is complete — consultants can surface prompt gaps through the demand board, admins have visibility into usage and quality metrics, and realistic seed engagement data makes every chart and metric meaningful.
**Depends on**: Phase 4
**Requirements**: DEMAND-01, DEMAND-02, DEMAND-03, DEMAND-04, DEMAND-05, DASH-01, DASH-02, DASH-03, DASH-04, SEED-02, SEED-03
**Success Criteria** (what must be TRUE):
  1. User can submit a prompt request, view open requests sorted by upvotes, and upvote or un-upvote a request with one click
  2. Admin can resolve a request by linking it to a created prompt, or decline with a reason
  3. Admin dashboard shows top-level metrics (active prompts, avg effectiveness, total checkouts, open merge requests, open prompt requests) with real data from seed engagements
  4. Admin can view a usage chart (checkouts over time), top 10 most used prompts, bottom 10 lowest-rated prompts, and demand vs supply chart
  5. The demo user clicking "Demo Bypass" sees a pre-populated workspace with sample engagements, forked prompts, and demand board requests — not an empty product
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete | 2026-03-25 |
| 2. Prompt Library | 4/4 | Complete   | 2026-03-25 |
| 3. Engagement Workspace | 6/7 | In Progress|  |
| 4. Merge Workflow | 5/7 | In Progress|  |
| 5. Demand Board and Dashboard | 0/TBD | Not started | - |
