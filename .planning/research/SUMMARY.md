---
description: Executive research summary for Upstream — a prompt management platform for AI consultancies. Synthesizes stack, feature, architecture, and pitfall research into roadmap implications and phase suggestions.
date_last_edited: 2026-03-25
---

# Project Research Summary

**Project:** Upstream — Prompt Management System for AI Consultancies
**Domain:** Prompt ops / knowledge management SaaS with Git-like fork/merge workflow
**Researched:** 2026-03-25
**Confidence:** HIGH

## Executive Summary

Upstream occupies a genuine gap in the prompt management tool landscape. Every existing tool (PromptLayer, LangSmith, Helicone, Agenta, Pezzo) optimizes for software engineering teams deploying prompts to production systems. None model the consultancy engagement lifecycle — where a firm maintains a curated internal library and individual consultants check out, adapt, and rate prompts within client engagements. The recommended approach is a Next.js 16 + Supabase full-stack application using the App Router, server-side rendering, and PostgreSQL row-level security as the authoritative authorization boundary. The "GitHub for Prompts" pitch is architecturally sound and implementable with well-established OSS components.

The fork/merge workflow is the product's core differentiating value and must be treated as a first-class data model from day one — not added as a UI layer on top of a simple CRUD system. Three architectural decisions lock in before any UI is built: (1) canonical prompts are immutable for consultants; (2) forked prompts snapshot content at fork time; (3) merge request status is a proper enum, not boolean columns. Getting these wrong requires medium-to-high cost migrations that cannot be deferred safely.

The primary risk is scope creep toward adjacent LLMOps features (testing sandbox, semantic search, real-time collaboration) that dilute the consultancy-specific value proposition without delivering proportional return. The research is clear: build the fork/rate/merge loop first and prove it, then consider expanding. The demo context — designed to pitch a specific stakeholder — makes seed data and demo bypass as important as any product feature.

---

## Key Findings

### Recommended Stack

The recommended stack is Next.js 16.2 (App Router, Turbopack default) + React 19 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui for the frontend, with Supabase as the single backend service providing PostgreSQL, Auth (email + Google OAuth), and row-level security. This stack is Vercel-native, has zero deployment configuration, and fits entirely within free tier limits for a demo. The Linear/Raycast dense dark-mode aesthetic is achievable with Tailwind dark classes and shadcn/ui's built-in dark mode — no custom design system needed.

Key OSS UI components complete the feature set: Tiptap 3 for the markdown prompt editor, `react-diff-viewer-continued` or `@git-diff-view/react` for merge review diffs, TanStack Table v8 for the prompt library data grid, Recharts 3.8 for admin dashboard charts, and Sonner for toast notifications. Form state uses React Hook Form 7 + Zod 4 — schemas defined once, types inferred everywhere, validated on both client and server.

**Core technologies:**
- Next.js 16.2 (App Router): Full-stack framework — Vercel-native, Server Components reduce client bundle, Turbopack at 400% faster dev startup
- Supabase (Postgres + Auth + RLS): Single service for DB, auth, and data authorization — eliminates three separate services; free tier sufficient for demo
- shadcn/ui + Tailwind 4: Component system with dark mode default — matches Linear aesthetic; copy-paste ownership means no library lock-in
- Tiptap 3: Headless markdown/rich-text editor — MIT core, extensible, ProseMirror-based; required for the prompt editing screen
- React Hook Form + Zod 4: Form state + schema validation — single schema definition covers TypeScript types, client validation, and server validation

### Expected Features

The feature research compared six established prompt management platforms. The verdict: Upstream's differentiating features (fork to engagement, adaptation notes, post-use rating, merge suggestion with diff, demand board, field intelligence aggregation) have no equivalent in any competitor. All P1 features can ship in v1 without anti-features that introduce disproportionate complexity.

**Must have (table stakes):**
- Auth with RBAC (consultant / lead / admin) + demo bypass — everything gates on identity
- Central prompt library with CRUD, browse, search, filter, and prompt detail view
- Engagement management (create engagement, add members, workspace view)
- Fork/checkout prompt to engagement with adaptation notes and client context flag
- Post-use rating on forked prompts (1-2 click, near-zero friction)
- Merge suggestion with side-by-side diff view
- Merge review queue with approve/reject for leads and admins
- Demand board (submit, upvote, resolve)
- Admin dashboard with key usage metrics
- 18 realistic seed prompts across 6 categories

**Should have (differentiators, also v1):**
- Field intelligence on prompt detail (aggregate ratings + fork count per canonical prompt)
- Demo bypass using `signInAnonymously()` with isolated per-session workspace

**Defer (v2+):**
- Version history with full diff on central library prompts (v1 tracks edit timestamps only)
- Prompt testing sandbox / playground (requires API key management, model routing)
- Semantic / vector search (only valuable at 100+ prompt library scale)
- Slack / email notification integrations
- Client-facing portal (different auth model; effectively a second product)
- Mobile-optimized layout

### Architecture Approach

The system separates into five distinct UI domains (Library, Engagement Workspace, Merge Review, Demand Board, Admin Dashboard) all backed by Next.js Server Components and Server Actions that communicate directly with Supabase via the `@supabase/ssr` cookie-based client. There is no REST API layer — the App Router eliminates that middleman. RLS policies at the database layer are the authoritative authorization gate; application-layer role checks are a UX convenience only. The `middleware.ts` protects routes at the edge but cannot be the sole auth guard due to CVE-2025-29927.

**Major components:**
1. Auth layer + middleware — Supabase Auth (email + Google OAuth), role stored in `app_metadata` (not `user_metadata`), cookie-based sessions, edge route protection
2. Central prompt library — Server Components; browse, search, filter, detail; read-only for consultants; canonical prompts immutable at consultant level
3. Engagement workspace — Scoped by `engagement_id`; fork/checkout, edit, adaptation notes, post-use rating; all writes through Server Actions
4. Fork/merge pipeline — `merge_requests` table as first-class entity; status enum `pending | approved | rejected | merged`; diff rendered client-side from snapshotted content
5. Analytics / admin dashboard — Aggregation queries over `forked_prompts`, `prompt_ratings`, `merge_requests`; built last when data exists

### Critical Pitfalls

1. **RLS enabled with no policies** — Every Supabase table defaults to "deny all" when RLS is enabled without policies. The SQL editor bypasses RLS so tests pass but real users see empty results. Prevention: write SELECT policy before enabling RLS on each table; test with a real authenticated user session.

2. **RBAC stored in `user_metadata`** — Any authenticated user can call `supabase.auth.updateUser()` to elevate their own role. Prevention: store roles in a `profiles` table (or `app_metadata` via server-side Auth Hook) and write all RLS policies to reference that source. Never reference `user_metadata` in policies.

3. **Fork snapshot not taken at fork time** — If `ForkedPrompt` stores only a FK to the parent prompt, the diff breaks when the parent is later updated. Prevention: copy `original_content` and `original_title` into the `ForkedPrompt` row at fork time; diff is always `original_content` vs current `content`.

4. **Merge/fork status stored as booleans** — `is_pending`, `is_merged`, `rejected_at` columns create mutually exclusive states that can't be enforced. Prevention: define `status` as a PostgreSQL enum or check constraint with all states (`pending | approved | rejected | merged`) before any merge feature is built.

5. **Demo bypass creates shared mutable dataset** — A single hardcoded demo account means two concurrent visitors corrupt each other's state. Prevention: use `supabase.auth.signInAnonymously()` — each visitor gets an isolated anonymous user; the shared prompt library is read-only for anonymous sessions; engagement-level data is scoped by `auth.uid()`.

---

## Implications for Roadmap

The architecture research's build order (Layers 0-5) directly maps to natural roadmap phases. The dependency chain is strict: schema before UI, auth before data, library before forks, forks before merges. The demand board and admin dashboard are the only components that can be partially parallelized.

### Phase 1: Foundation — Schema, Auth, and Scaffold

**Rationale:** Every feature depends on the data model being correct. Schema errors cascade into fork/merge logic rewrites. Auth and RBAC must be established before any data access is built. This is also where the five critical pitfalls are either prevented or locked in permanently.

**Delivers:** Deployed Next.js 16 app on Vercel with Supabase project wired up, complete database schema with all tables and RLS policies, auth flows (email, Google OAuth, demo bypass with `signInAnonymously()`), role assignment in `app_metadata`, seed data (18 prompts across 6 categories), and dark-mode UI shell.

**Addresses:** Auth + RBAC, demo bypass, seed data (from FEATURES.md P1 list)

**Avoids:** RLS-with-no-policies pitfall, `user_metadata` RBAC pitfall, shared demo account pitfall, fork snapshot pitfall (schema column defined upfront), boolean status pitfall (enum defined upfront)

**Research flag:** Standard patterns — Supabase + Next.js App Router integration is thoroughly documented. No additional research needed.

---

### Phase 2: Prompt Library — Browse, Search, and Detail

**Rationale:** The library is the read-only foundation that all downstream features build on. Building it as a read-only surface first validates RLS policies and type generation under real auth conditions before any write paths exist. Keeps complexity low while delivering the first stakeholder-visible feature.

**Delivers:** Prompt library browse page (TanStack Table with search, filter by category/model/tags), prompt detail view (rendered markdown, metadata, field intelligence placeholder), copy-to-clipboard, admin-only create/edit/delete controls.

**Addresses:** Prompt CRUD, browse/search/filter, prompt detail view, tagging and categorization (from FEATURES.md table stakes)

**Avoids:** N+1 query pitfall (use Supabase nested select from the start), fetching full content for list views (select metadata columns only for lists)

**Research flag:** Standard patterns — Server Components + Supabase query patterns are well-established.

---

### Phase 3: Engagement Workspace — Fork, Edit, and Rate

**Rationale:** The "GitHub for Prompts" core IP lives here. This phase delivers the checkout workflow that no competitor has. The engagement → fork → edit → rate loop is the minimum viable demonstration of the product's unique value.

**Delivers:** Engagement creation and management (team members), fork/checkout prompt into engagement (snapshot copied at fork time), forked prompt edit view with Tiptap markdown editor (adaptation notes, client context flag), 1-2 click post-use rating surfaced on engagement workspace list.

**Addresses:** Engagement management, fork to engagement, adaptation notes + client context flag, post-use rating (from FEATURES.md)

**Avoids:** Fork snapshot pitfall (enforced in schema from Phase 1), Tiptap SSR hydration pitfall (`immediatelyRender: false` required)

**Research flag:** Tiptap 3 integration with Next.js App Router — confirm `immediatelyRender: false` behavior with server-rendered pages. The client-only editor component pattern is documented but worth verifying against Next.js 16.

---

### Phase 4: Merge Workflow — Suggest, Review, and Approve

**Rationale:** The merge review completes the bidirectional flow that makes the "GitHub for Prompts" pitch land. Without it, the fork is a dead end. This phase closes the loop and demonstrates institutional knowledge accumulation.

**Delivers:** "Suggest merge" action on forked prompts (creates `merge_requests` record with `pending` status), merge review queue page (lead/admin only), side-by-side diff view using `react-diff-viewer-continued` (diff against `original_content` snapshot, not live parent), approve/reject with reviewer notes, canonical prompt update on approval.

**Addresses:** Merge suggestion with diff view, merge review queue (from FEATURES.md)

**Avoids:** Diff-against-live-parent pitfall (use `original_content` from fork), merge status boolean pitfall (use enum defined in Phase 1)

**Research flag:** `react-diff-viewer-continued` dark mode theming — verify the actively maintained fork supports the dark theme without significant style overrides. `@git-diff-view/react` is the alternative if styling conflicts arise.

---

### Phase 5: Demand Board and Admin Dashboard

**Rationale:** Both features are additive layers on top of existing data. The demand board is independent; the admin dashboard is meaningless without real data from Phases 2-4. Shipping them last ensures the dashboard has something to show.

**Delivers:** Demand board (submit request, upvote with optimistic update, admin resolve + link to resulting prompt), admin dashboard with Recharts charts (fork count by category, top-rated prompts, merge approval rate, open requests), prompt detail page field intelligence section (aggregate ratings, fork count across all forks).

**Addresses:** Demand board, admin dashboard with key metrics, field intelligence aggregation on prompt detail (from FEATURES.md)

**Avoids:** Sequential `await` on dashboard panels (use `Promise.all` for independent data sections), RLS on unindexed columns (add indexes on `status`, `engagement_id`, `source_prompt_id` before aggregation queries)

**Research flag:** Admin dashboard aggregation queries — run `EXPLAIN ANALYZE` on the category/rating aggregation queries. At 18 seed prompts this is trivial, but the query patterns set precedents. Materialized views may be needed if query complexity grows.

---

### Phase Ordering Rationale

- **Schema first, always:** All five critical pitfalls (RLS, RBAC, fork snapshot, status enum, demo bypass) are prevented at the schema/foundation layer. Building schema last or iterating on it mid-product is the highest-cost mistake in this domain.
- **Read before write:** The library phase (read-only) validates auth, RLS, and TypeScript type generation under real conditions before any write paths exist. Bugs discovered here are cheap to fix.
- **Strict fork dependency chain:** Engagements must exist before forks; forks must exist before merge requests. FEATURES.md feature dependency map confirms this is a non-negotiable sequential build.
- **Demand board is decoupled:** It has no dependencies on forks or merge requests. It could theoretically be built in Phase 2, but is lower priority and benefits from being shipped alongside the dashboard for a cohesive "community + oversight" release.
- **Dashboard last:** The admin metrics are only meaningful after real engagement, fork, and rating data exists. Building it in Phase 2 means charting empty datasets in the demo.

### Research Flags

Phases needing deeper research during planning:
- **Phase 1 (Auth Hook for `app_metadata`):** The exact Supabase Auth Hook setup for writing custom JWT claims is documented but has sharp edges — specifically activating the hook in the dashboard after creating it. Worth a targeted research spike before implementation.
- **Phase 4 (Diff viewer dark mode):** Both `react-diff-viewer-continued` and `@git-diff-view/react` offer dark mode, but exact theming API varies. Confirm which aligns with Tailwind dark class approach before committing.

Phases with standard patterns (skip research-phase):
- **Phase 2 (Library UI):** Next.js Server Components + TanStack Table is thoroughly documented. Standard CRUD patterns apply.
- **Phase 3 (Engagement workspace):** Supabase insert/update patterns, RHF + Zod forms, and engagement scoping are all well-documented. Tiptap integration note above is the only caveat.
- **Phase 5 (Dashboard):** Recharts in Next.js is standard. Supabase aggregate queries are SQL fundamentals.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All core packages verified against official docs as of March 2026. Version numbers confirmed (Next.js 16.2.1, Recharts 3.8.0, git-diff-view 0.1.3). Free tier limits verified against Supabase and Vercel pricing pages. |
| Features | HIGH | Six competitor platforms analyzed across multiple independent comparison sources. Feature gap (no competitor has the engagement fork/merge model) confirmed from first-party product docs. |
| Architecture | HIGH | Patterns derive from official Supabase RLS docs, Next.js App Router project structure docs, and established CRUD + branching data models. Build order is logically derived from dependency graph. |
| Pitfalls | MEDIUM-HIGH | RLS, RBAC, and auth pitfalls sourced from official Supabase docs and a confirmed CVE. Fork/merge state machine pitfalls are less documented externally — derived from the architecture's inherent structure. The N+1 pitfall is universal and well-evidenced. |

**Overall confidence:** HIGH

### Gaps to Address

- **Auth Hook activation steps:** Supabase's process for activating custom Auth Hooks (the step that writes roles into JWT claims) is documented but reported as easy to miss (the "activate in dashboard" step). Validate this works end-to-end in Phase 1 before any feature relies on role claims.
- **Anonymous user isolation under RLS:** The `signInAnonymously()` + RLS isolation pattern for demo bypass is the recommended approach but should be smoke-tested with two concurrent sessions early in Phase 1 before seed data is finalized.
- **Diff viewer theming:** Neither diff library was tested against this project's specific dark theme. This is a minor implementation risk, not a strategic gap — resolved by picking one and testing early in Phase 4.
- **Tiptap 3 + React 19 compatibility:** Tiptap 3 is documented to support React 19, but this is a recent combination. The `immediatelyRender: false` SSR fix is the known issue; monitor for any additional hydration edge cases during Phase 3.

---

## Sources

### Primary (HIGH confidence)
- Next.js 16.2 official release blog and installation docs — stack selection, version confirmation
- Supabase Auth + Next.js guide — `@supabase/ssr` patterns, `getClaims()` vs `getSession()` distinction, Auth Hook for `app_metadata`
- Supabase RLS docs — policy patterns, security invoker views, anonymous sign-in
- shadcn/ui docs — component inventory, dark mode setup
- Tiptap docs — v3 feature set, MIT core scope, SSR setup (`immediatelyRender: false`)
- TanStack Table v8 docs — headless data grid patterns
- Recharts GitHub (v3.8.0, March 2026) — chart component inventory
- CVE-2025-29927 disclosure (Datadog Security Labs) — Next.js middleware auth bypass; server-side auth check requirement
- Vercel pricing — free tier limits confirmed

### Secondary (MEDIUM confidence)
- Braintrust, ZenML, Future AGI competitor comparison articles — feature gap analysis across PromptLayer, LangSmith, Helicone, Pezzo, Agenta
- git-diff-view GitHub (v0.1.3, March 2026) — alternative diff viewer
- ProsperaSoft blog — RLS misconfiguration recovery patterns
- Specfy blog — Git-like versioning in Postgres schema patterns
- react-diff-viewer-continued GitHub — actively maintained fork confirmation

### Tertiary (LOW confidence)
- Inferred from architecture: fork/merge state machine pitfall (status-as-booleans) is not widely documented but structurally inevitable given the workflow design; validated against general state machine design principles.

---

*Research completed: 2026-03-25*
*Ready for roadmap: yes*
