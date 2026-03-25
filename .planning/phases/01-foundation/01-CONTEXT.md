---
description: Phase 1 implementation decisions for Upstream Foundation — auth, demo bypass, UI shell, schema, and seed data choices that guide research and planning.
date_last_edited: 2026-03-25
---

# Phase 1: Foundation - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Deploy the database schema, authentication system (email/password + demo bypass), UI application shell with sidebar navigation, and 18 realistic seed prompts. This is the base layer everything else builds on — no library CRUD, no engagement workflow, no merge flow.

Requirements: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, UI-01, UI-02, UI-03, UI-04, SEED-01

</domain>

<decisions>
## Implementation Decisions

### Login & Demo Experience
- **D-01:** Demo bypass is hero-level prominence — the dominant CTA above the fold. Large "Explore the Demo" button with "No signup required" subtext. Email/password login is secondary below an "or" divider.
- **D-02:** Login page includes 2-3 feature highlight bullets/icons showing what Upstream does (library, fork/merge, demand board) alongside the form. Not just tagline — give product context.
- **D-03:** Demo user appears as "Demo Consultant" with a generic avatar. Subtle banner indicating demo mode.
- **D-04:** Two demo buttons available: "Explore as Consultant" and "Explore as Admin" — Brendan can try both perspectives in one session.

### Navigation Shell
- **D-05:** All 5 nav items visible in sidebar from Phase 1: Library (active), Engagements (disabled), Demand Board (disabled), Review Queue (admin, disabled), Dashboard (admin, disabled). Unbuilt items are grayed out. Shows full product vision.
- **D-06:** Sidebar is collapsible — toggle between expanded (labels visible) and collapsed (icons only). Standard Linear/Raycast pattern.
- **D-07:** After login, user lands directly on the Library page. No intermediate welcome screen or dashboard. Fast to value.

### Schema Scope
- **D-08:** Full schema deployed in Phase 1 — all tables (profiles, prompts, prompt_changelog, engagements, engagement_members, forked_prompts, prompt_requests, request_upvotes), all RLS policies, all indexes. Phases 2-5 add UI only, no migrations needed.
- **D-09:** Schema CHECK constraint allows 2 roles only: `CHECK (role IN ('consultant', 'admin'))`. No lead role in v1. Simple migration to add in v2.

### Seed Prompt Data
- **D-10:** Full realistic content — each of the 18 prompts has 200-500 words of real, usable prompt text with system instructions, structured sections, and placeholders like `{{client_name}}`. Brendan should read one and think "I could use this tomorrow."
- **D-11:** Varied and realistic metadata using modern 2026 models (Claude Sonnet 4, GPT-4o, Gemini 2.0, model-agnostic). Different effectiveness ratings (3.2-4.8), varied checkout counts (5-45), some tested recently, some not. Library should feel lived-in, like a real team has been using it.

### Carried Forward (Pre-decided)
- **D-12:** Two roles only — consultant and admin (no lead role in v1)
- **D-13:** Demo bypass uses `signInAnonymously()` for per-session isolation — not a shared hardcoded account
- **D-14:** RBAC stored in `app_metadata` via Auth Hook (not `user_metadata`) — prevents self-elevation
- **D-15:** Stack: Next.js 14+ (App Router) + Tailwind + shadcn/ui + Supabase + Vercel
- **D-16:** Dark mode default, Human Agency brand blue (#4287FF) accent
- **D-17:** Monospace font for prompt content, sans-serif for UI chrome
- **D-18:** Desktop-only for v1

### Claude's Discretion
- Specific shadcn/ui component choices for sidebar, buttons, forms
- Auth Hook implementation details
- RLS policy exact syntax (adapt PRD §7.3 for 2-role model)
- Specific font families (monospace and sans-serif choices)
- Responsive sidebar collapse animation/behavior
- Demo mode banner design and placement

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### PRD & Data Model
- `upstream-prd.md` §4 — Core data model (Prompt, Engagement, ForkedPrompt, PromptRequest, User entities)
- `upstream-prd.md` §7.2 — Database schema (SQL CREATE statements — adapt for 2-role constraint)
- `upstream-prd.md` §7.3 — Row-Level Security policies (adapt for 2-role model, use app_metadata not auth.role())

### Auth & Roles
- `upstream-prd.md` §3 — User personas (consultant and admin only for v1)
- `.planning/PROJECT.md` — Key decisions table (demo bypass via signInAnonymously, RBAC via app_metadata Auth Hook)

### UI/UX Direction
- `upstream-prd.md` §8 — UI/UX principles, design direction, key interactions
- `.planning/REQUIREMENTS.md` — UI-01 through UI-04 acceptance criteria

### Seed Data
- `upstream-prd.md` §10 — Seed data for demo (18 prompts across 6 categories with titles and descriptions)
- `.planning/REQUIREMENTS.md` — SEED-01 acceptance criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project. No existing codebase.

### Established Patterns
- None — patterns will be established in this phase (component structure, styling approach, data fetching, auth flow).

### Integration Points
- Supabase project needs to be created and configured
- Vercel deployment target
- Next.js App Router directory structure to be established

</code_context>

<specifics>
## Specific Ideas

- Login page layout: hero demo CTA → "or" divider → email/password form, with feature highlights
- Two demo entry points: "Explore as Consultant" and "Explore as Admin"
- Sidebar nav shows full product vision from day 1 with disabled items for unbuilt phases
- Seed prompts should use 2026-era model names (Claude Sonnet 4, GPT-4o, Gemini 2.0)
- Seed data variety should tell a story — different usage levels, ratings, last-tested dates

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-25*
