# Upstream

## What This Is

A prompt management system for AI consultancies — "GitHub for Prompts." Consultants browse a central library, fork prompts into client engagements, adapt and rate them in the field, and push improvements back. Leadership gets visibility into what's being used, what's working, and where the gaps are. Built as a fully functional demo targeting Human Agency's Managing Director of AI, Brendan Langen.

## Core Value

Every engagement makes the firm smarter — field-tested prompt improvements flow back into the central library through a Git-like checkout/fork/merge workflow, turning individual consultant knowledge into institutional IP.

## Requirements

### Validated

- [x] Suggest merge back to central library with diff view — Validated in Phase 4: merge-workflow
- [x] Review queue with side-by-side diff for merge approval (lead/admin) — Validated in Phase 4: merge-workflow

### Active

- [ ] Central prompt library with full CRUD (admin)
- [ ] Browse, search, and filter library (category, capability, industry, effectiveness, model)
- [ ] Prompt detail view with content, metadata, history, field intelligence, active forks
- [ ] Engagement management (create, manage team, view workspace)
- [ ] Checkout/fork prompts to engagements
- [ ] Edit forked prompts with adaptation notes and client context flag
- [ ] Rate and provide feedback on forked prompts (1-2 clicks)
- [x] Suggest merge back to central library with diff view
- [x] Review queue with side-by-side diff for merge approval (lead/admin)
- [ ] Demand board — submit requests, upvote, resolve
- [ ] Admin dashboard with key metrics and analytics charts
- [ ] Auth with role-based access (consultant / admin) — email/password + demo bypass
- [ ] Demo bypass button — skip signup with anonymous session + seed data
- [ ] 18 realistic seed prompts across 6 categories for demo
- [ ] Markdown editor for prompt content
- [ ] Copy prompt content with one click

### Out of Scope

- Version diffing on central library prompts (full history) — v2
- Semantic/vector search — v2
- Prompt testing sandbox — v2
- Client-facing portal — v2
- Prompt chains/workflows as first-class objects — v2
- Auto-detection of client context (NER) — v2
- Slack integration — v2
- Export/import — v2
- Mobile-optimized layout — desktop-focused for v1
- Real-time notifications — polling/refresh sufficient for v1

## Context

**Target user:** Brendan Langen, Managing Director of AI at Human Agency — an AI consultancy running concurrent client engagements. The demo needs to immediately communicate: "this person understands our operational pain."

**Pitch goal:** Show, don't tell. A deployed, working product pre-loaded with realistic seed data. Not a deck.

**Design direction:** Linear/Raycast/Notion aesthetic. Dark mode default, Human Agency brand blue (#4287FF) accent. Dense power-user UI. Monospace for prompt content, sans-serif for everything else.

**Component philosophy:** Leverage high-quality OSS components wherever possible — markdown editors, diff viewers, data tables, charts — rather than building from scratch. Ship faster with better quality.

**Data model:** Prompt → Engagement → ForkedPrompt → PromptRequest. Users have roles (consultant/lead/admin). Full schema defined in PRD Section 7.2.

**Categories:** Discovery, Solution Design, Build, Enablement, Delivery, Internal Ops.

## Constraints

- **Stack**: Next.js 14+ (App Router) + Tailwind + shadcn/ui + Supabase (auth, Postgres, RLS, storage) + Vercel
- **Auth**: Supabase Auth — email/password + demo bypass mode (Google OAuth deferred to v2)
- **Content format**: Markdown for prompt content
- **Viewport**: Desktop-focused, no mobile optimization required
- **Hosting**: Vercel free tier + Supabase free tier for demo deployment
- **Components**: Prefer established OSS libraries (editors, diff, charts) over custom implementations

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js + Supabase stack | PRD recommendation, fast CRUD with auth/RLS built in | — Pending |
| Email/password + demo bypass (Google OAuth v2) | Simplifies v1 auth; demo bypass more important for pitch | — Pending |
| Markdown prompt content | Rich enough for structured prompts, simpler than custom templating | — Pending |
| Desktop-only for v1 | Power users on desktops, avoids responsive complexity | — Pending |
| Demo bypass button | Lets Brendan explore immediately without signup friction | — Pending |
| OSS components over custom | Ship faster with higher quality — editors, diff viewers, charts | — Pending |
| Dark mode default | Matches design direction (Linear/Raycast), consultants working late | — Pending |

---
*Last updated: 2026-03-26 — Phase 4 (merge-workflow) complete. Knowledge loop closes: consultants suggest merges, admins review/approve/decline with diff view.*
