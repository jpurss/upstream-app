---
description: v1 requirements for Upstream — 38 requirements across 9 categories covering auth, library, engagements, forking, merge workflow, demand board, dashboard, UI/UX, and seed data. Includes phase traceability.
date_last_edited: 2026-03-25
---

# Requirements: Upstream

**Defined:** 2026-03-25
**Core Value:** Every engagement makes the firm smarter — field-tested prompt improvements flow back into the central library through a Git-like checkout/fork/merge workflow.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User can log in and session persists across browser refresh
- [ ] **AUTH-03**: User can log out from any page
- [ ] **AUTH-04**: Role-based access enforced — consultant and admin roles
- [ ] **AUTH-05**: Demo bypass button on login page creates anonymous session with full read access and seed data

### Library

- [x] **LIB-01**: Admin can create a new prompt with title, description, content (markdown), category, capability type, industry tags, use case tags, target model, complexity, input/output schema
- [x] **LIB-02**: Admin can edit an existing prompt in the central library
- [x] **LIB-03**: Admin can deprecate a prompt (set status to deprecated)
- [ ] **LIB-04**: User can browse library as grid or list of prompt cards showing title, category badge, capability type, avg rating, checkout count, model badge
- [ ] **LIB-05**: User can filter library by category, capability type, industry, effectiveness range, status, and target model
- [ ] **LIB-06**: User can search prompts by keyword (full-text search on title, description, content)
- [ ] **LIB-07**: User can view prompt detail page with full content, metadata, aggregate field intelligence (avg rating, total forks, recent feedback), and active fork count
- [ ] **LIB-08**: User can copy prompt content to clipboard with one click

### Engagements

- [x] **ENG-01**: User can create an engagement with name, client name, and industry
- [x] **ENG-02**: User can view list of their engagements with status indicators
- [x] **ENG-03**: User can view engagement workspace showing all forked prompts for that engagement
- [x] **ENG-04**: User can mark an engagement as completed or paused

### Forking

- [ ] **FORK-01**: User can checkout/fork a prompt from the central library into an engagement (creates a snapshot of the prompt content at fork time)
- [ ] **FORK-02**: User can edit a forked prompt's adapted content with a markdown editor
- [ ] **FORK-03**: User can add adaptation notes explaining what was changed and why
- [ ] **FORK-04**: User can flag a fork as containing client-specific context
- [ ] **FORK-05**: User can rate a forked prompt's effectiveness (1-5 stars) with 1-2 clicks
- [ ] **FORK-06**: User can add feedback notes and issue tags (hallucination, too_verbose, wrong_format, model_degradation, needs_context) to a fork
- [ ] **FORK-07**: User can view the diff between original prompt content (at fork time) and their adapted version

### Merge

- [ ] **MERGE-01**: User can suggest a merge back to the central library from a forked prompt with a merge note
- [ ] **MERGE-02**: Merge suggestion shows side-by-side diff of original vs adapted content
- [ ] **MERGE-03**: Admin can view a review queue of pending merge suggestions with context (who suggested, which engagement, effectiveness rating)
- [ ] **MERGE-04**: Admin can approve a merge suggestion — updates central library prompt content, bumps version, creates changelog entry
- [ ] **MERGE-05**: Admin can decline a merge suggestion with a reason

### Demand Board

- [ ] **DEMAND-01**: User can submit a prompt request with title, description, category, and urgency level
- [ ] **DEMAND-02**: User can view open prompt requests sorted by upvotes
- [ ] **DEMAND-03**: User can upvote a prompt request (toggle)
- [ ] **DEMAND-04**: Admin can resolve a request by linking it to a created prompt
- [ ] **DEMAND-05**: Admin can decline a request with a reason

### Dashboard

- [ ] **DASH-01**: Admin can view top-level metrics: total active prompts, avg effectiveness, total checkouts, open merge requests, open prompt requests
- [ ] **DASH-02**: Admin can view usage chart (checkouts over time)
- [ ] **DASH-03**: Admin can view top 10 most used prompts and bottom 10 lowest-rated prompts
- [ ] **DASH-04**: Admin can view demand vs supply (requests opened vs resolved)

### UI/UX

- [ ] **UI-01**: Dark mode as default theme with Human Agency brand blue (#4287FF) as accent color
- [ ] **UI-02**: Linear/Raycast-inspired aesthetic — clean, dense, professional
- [ ] **UI-03**: Monospace font for prompt content, sans-serif for UI chrome
- [ ] **UI-04**: Responsive sidebar navigation with Library, My Engagements, Demand Board, Review Queue (admin), Dashboard (admin)

### Seed Data

- [ ] **SEED-01**: 18 realistic AI consulting prompts pre-loaded across 6 categories (Discovery, Solution Design, Build, Enablement, Delivery, Internal Ops)
- [ ] **SEED-02**: Seed data includes 2-3 sample engagements with forked prompts showing the workflow in action
- [ ] **SEED-03**: Seed data includes sample prompt requests on the demand board

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Auth Enhancements

- **AUTH-V2-01**: Google OAuth login
- **AUTH-V2-02**: Lead role with intermediate permissions

### Library Enhancements

- **LIB-V2-01**: Full version history with diff between any two versions
- **LIB-V2-02**: Semantic/vector search for finding similar prompts
- **LIB-V2-03**: Prompt testing sandbox (run against model inline)

### Collaboration

- **COLLAB-V2-01**: Add team members to engagements
- **COLLAB-V2-02**: View all forks in an engagement across team members
- **COLLAB-V2-03**: Email notifications on merge approval/rejection

### Integrations

- **INT-V2-01**: Slack notifications for merge requests and new prompts
- **INT-V2-02**: Export/import prompt library as JSON

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time collaborative editing | CRDT/OT complexity; consultants work async on prompts |
| Client-facing portal | Separate auth/branding model; essentially a second product |
| Prompt chains/workflows | DAG editor + execution engine = LangChain scope |
| Auto-detection of client context (NER) | False positives erode trust; manual flag preferred |
| Mobile-optimized layout | Power users are at desks; mobile prompt editing is poor UX |
| A/B testing for prompt variants | Requires request interception + statistical tracking |
| Public prompt marketplace | Dilutes firm-specific IP angle |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| UI-01 | Phase 1 | Pending |
| UI-02 | Phase 1 | Pending |
| UI-03 | Phase 1 | Pending |
| UI-04 | Phase 1 | Pending |
| SEED-01 | Phase 1 | Pending |
| LIB-01 | Phase 2 | Complete |
| LIB-02 | Phase 2 | Complete |
| LIB-03 | Phase 2 | Complete |
| LIB-04 | Phase 2 | Pending |
| LIB-05 | Phase 2 | Pending |
| LIB-06 | Phase 2 | Pending |
| LIB-07 | Phase 2 | Pending |
| LIB-08 | Phase 2 | Pending |
| ENG-01 | Phase 3 | Complete |
| ENG-02 | Phase 3 | Complete |
| ENG-03 | Phase 3 | Complete |
| ENG-04 | Phase 3 | Complete |
| FORK-01 | Phase 3 | Pending |
| FORK-02 | Phase 3 | Pending |
| FORK-03 | Phase 3 | Pending |
| FORK-04 | Phase 3 | Pending |
| FORK-05 | Phase 3 | Pending |
| FORK-06 | Phase 3 | Pending |
| FORK-07 | Phase 3 | Pending |
| MERGE-01 | Phase 4 | Pending |
| MERGE-02 | Phase 4 | Pending |
| MERGE-03 | Phase 4 | Pending |
| MERGE-04 | Phase 4 | Pending |
| MERGE-05 | Phase 4 | Pending |
| DEMAND-01 | Phase 5 | Pending |
| DEMAND-02 | Phase 5 | Pending |
| DEMAND-03 | Phase 5 | Pending |
| DEMAND-04 | Phase 5 | Pending |
| DEMAND-05 | Phase 5 | Pending |
| DASH-01 | Phase 5 | Pending |
| DASH-02 | Phase 5 | Pending |
| DASH-03 | Phase 5 | Pending |
| DASH-04 | Phase 5 | Pending |
| SEED-02 | Phase 5 | Pending |
| SEED-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 38 total
- Mapped to phases: 38
- Unmapped: 0

---
*Requirements defined: 2026-03-25*
*Last updated: 2026-03-25 — traceability table populated after roadmap creation*
