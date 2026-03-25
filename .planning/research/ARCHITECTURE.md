---
description: Architecture patterns and component structure for the Upstream prompt management system — covering the Git-like fork/merge workflow, role-based access layers, data flow, and build order.
date_last_edited: 2026-03-25
---

# Architecture Research

**Domain:** Prompt management system with Git-like branching workflow
**Researched:** 2026-03-25
**Confidence:** HIGH (stack is well-documented; patterns derive from established CRUD + branching data models)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Next.js App Router (Vercel)                  │
│                                                                       │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Library UI  │  │ Engagement UI  │  │ Merge UI │  │ Admin UI │  │
│  │  (browse,    │  │  (workspace,   │  │ (review  │  │(metrics, │  │
│  │   search,    │  │   forks,       │  │  queue,  │  │ demand   │  │
│  │   detail)    │  │   ratings)     │  │  diff)   │  │ board)   │  │
│  └──────┬───────┘  └───────┬────────┘  └────┬─────┘  └────┬─────┘  │
│         │                  │                │              │        │
│  ┌──────┴──────────────────┴────────────────┴──────────────┴──────┐ │
│  │              Server Components + Server Actions                  │ │
│  │   (data fetching, mutations, auth-gated, Supabase SSR client)   │ │
│  └──────────────────────────────┬───────────────────────────────── ┘ │
└─────────────────────────────────┼─────────────────────────────────── ┘
                                  │ SQL queries via Supabase client
┌─────────────────────────────────┼─────────────────────────────────── ┐
│                    Supabase (Postgres + Auth + RLS)                   │
│                                  │                                    │
│  ┌───────────────┐  ┌────────────┴──────┐  ┌──────────────────────┐  │
│  │  Auth (GoTrue)│  │   Postgres DB     │  │   RLS Policies       │  │
│  │  email/Google │  │                   │  │  (role-gated rows)   │  │
│  │  JWT + roles  │  │  prompts          │  │                      │  │
│  │  in app_meta  │  │  engagements      │  │  consultant: read    │  │
│  └───────────────┘  │  forked_prompts   │  │  own engagement data │  │
│                     │  prompt_ratings   │  │  lead: + write to    │  │
│                     │  merge_requests   │  │  merge queue         │  │
│                     │  demand_requests  │  │  admin: full access  │  │
│                     │  users            │  │                      │  │
│                     └───────────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|---------------|----------------|
| Library UI | Browse, search, filter, view detail of canonical prompts | Server components; read-only for consultants |
| Engagement UI | Workspace per client engagement — team, forked prompts, ratings | Server + client components; scoped to engagement membership |
| Fork workflow | Check out a canonical prompt into an engagement; track divergence | DB record creation with `source_prompt_id` FK |
| Merge UI | Side-by-side diff of forked vs. canonical; approve/reject queue | OSS diff viewer (react-diff-viewer or similar); lead/admin only |
| Demand Board | Submit prompt requests, upvote, mark resolved | Simple CRUD with vote counter; all roles can read/submit |
| Admin Dashboard | Metrics, usage charts, category coverage, top-rated prompts | Aggregation queries; admin-only route group |
| Auth layer | Email + Google OAuth; role stored in `app_metadata`; demo bypass | Supabase Auth + middleware-based route protection |
| RLS layer | Enforce data boundaries at DB level regardless of app code path | Postgres policies keyed on `auth.jwt() -> 'app_metadata' -> 'role'` |

---

## Recommended Project Structure

```
src/
├── app/
│   ├── (auth)/                  # Auth route group — no main nav
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (app)/                   # Authenticated app shell with nav
│   │   ├── layout.tsx           # Main nav, auth guard
│   │   ├── library/
│   │   │   ├── page.tsx         # Browse + search library
│   │   │   └── [id]/page.tsx    # Prompt detail view
│   │   ├── engagements/
│   │   │   ├── page.tsx         # Engagement list
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # Engagement workspace
│   │   │       └── prompts/
│   │   │           └── [forkId]/page.tsx  # Forked prompt edit view
│   │   ├── merge-queue/
│   │   │   ├── page.tsx         # Review queue (lead/admin)
│   │   │   └── [id]/page.tsx    # Diff + approve/reject
│   │   ├── demand/
│   │   │   └── page.tsx         # Demand board
│   │   └── admin/
│   │       └── page.tsx         # Dashboard + metrics (admin only)
│   └── demo/
│       └── page.tsx             # Demo bypass entry point
├── components/
│   ├── ui/                      # shadcn/ui re-exports and extensions
│   ├── prompts/                 # PromptCard, PromptDetail, MarkdownViewer
│   ├── forks/                   # ForkCard, ForkEditor, DiffViewer
│   ├── engagements/             # EngagementCard, TeamList
│   ├── merge/                   # MergeReviewPanel, DiffSideBySide
│   ├── demand/                  # DemandCard, UpvoteButton
│   └── dashboard/               # MetricCard, UsageChart, CategoryChart
├── lib/
│   ├── supabase/
│   │   ├── server.ts            # SSR Supabase client (cookie-based)
│   │   ├── client.ts            # Browser Supabase client
│   │   └── types.ts             # Generated DB types (supabase gen types)
│   ├── actions/                 # Server Actions for mutations
│   │   ├── prompts.ts
│   │   ├── forks.ts
│   │   ├── merges.ts
│   │   └── demand.ts
│   └── queries/                 # Reusable query helpers (server-side)
│       ├── prompts.ts
│       ├── forks.ts
│       └── analytics.ts
├── hooks/                       # Client-side React hooks
│   ├── useRole.ts               # Read role from session
│   └── useOptimisticVote.ts     # Demand board upvote
└── middleware.ts                # Auth guard + role-based route protection
```

### Structure Rationale

- **`(auth)` and `(app)` route groups:** Separate the unauthenticated login shell from the main app shell without adding URL segments. The `(app)/layout.tsx` can enforce auth and render the main nav once.
- **`lib/actions/`:** Server Actions co-located by domain (not by route) so mutations can be reused across pages. Supabase mutations happen server-side, keeping the service-role key out of the client bundle.
- **`lib/queries/`:** Extracted query helpers make Server Components thin — they import a query function rather than building SQL inline.
- **`components/` by domain, not by type:** Avoids a flat "components/atoms/molecules" taxonomy that breaks down at scale. Each domain folder owns its view pieces.
- **`middleware.ts`:** Auth guard runs at the edge on every `(app)` route — redirect to login if no session; return 403 for admin routes if role is wrong.

---

## Architectural Patterns

### Pattern 1: Central Library as Immutable Source of Truth

**What:** The `prompts` table holds canonical prompt records. They are never edited directly by consultants — only admins can mutate them. Consultants work exclusively on `forked_prompts` which hold a `source_prompt_id` FK and a `content` copy at fork time.

**When to use:** Any time a record type needs both a "blessed master" and per-engagement variations. Same pattern used in Git (main branch + feature branches), CMS drafts (published vs. draft), and document co-authoring.

**Trade-offs:** Adds a level of indirection — queries must join or union across two tables to show "prompts in use." Worth it because it makes the merge workflow structurally enforced rather than a UI convention.

**Example:**
```typescript
// Forking a prompt into an engagement
export async function forkPrompt(promptId: string, engagementId: string) {
  const supabase = await createClient()
  const { data: source } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', promptId)
    .single()

  return supabase.from('forked_prompts').insert({
    source_prompt_id: promptId,
    engagement_id: engagementId,
    content: source.content,        // snapshot at fork time
    status: 'active',
    forked_at: new Date().toISOString(),
  })
}
```

### Pattern 2: RLS as the Authorization Boundary (Not the App Layer)

**What:** Every table has row-level security policies that enforce role and ownership rules at the database level. The app layer adds convenience (hide buttons, redirect routes), but the DB is the authoritative gate.

**When to use:** Always in Supabase. This pattern protects against bugs in app logic, direct API calls, and any future tooling that accesses the database directly.

**Trade-offs:** RLS policies must be maintained in sync with application logic — two places to update when access rules change. Mitigate by keeping RLS permissive at the row level and using more specific application checks for UI gating.

**Example:**
```sql
-- Consultants can only see forked_prompts for engagements they belong to
create policy "Engagement member can read forks"
on forked_prompts
for select
to authenticated
using (
  engagement_id in (
    select engagement_id from engagement_members
    where user_id = (select auth.uid())
  )
);

-- Admins can read everything
create policy "Admin reads all"
on forked_prompts
for select
to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
```

### Pattern 3: Merge Request as a First-Class Entity

**What:** When a consultant proposes merging their fork back to the central library, a `merge_requests` row is created. It captures: source fork ID, proposed content, diff snapshot, submitter, status (pending/approved/rejected), and reviewer notes. The actual `prompts` record is only updated when an admin/lead approves.

**When to use:** Any time an approval workflow gates a mutation. Makes the review auditable, reversible (reject without touching canonical), and queryable (show open requests in the queue).

**Trade-offs:** Adds a table and a two-step write. Worth it — it's the core differentiating workflow of the product.

**Example:**
```typescript
// Submit a merge request
export async function submitMergeRequest(forkId: string, proposedContent: string) {
  const supabase = await createClient()
  return supabase.from('merge_requests').insert({
    forked_prompt_id: forkId,
    proposed_content: proposedContent,
    status: 'pending',
    submitted_at: new Date().toISOString(),
  })
}

// Approve: update the merge request status AND the canonical prompt
export async function approveMerge(mergeRequestId: string) {
  const supabase = await createClient()
  const { data: req } = await supabase
    .from('merge_requests')
    .select('*, forked_prompts(source_prompt_id, proposed_content)')
    .eq('id', mergeRequestId)
    .single()

  await supabase.from('prompts')
    .update({ content: req.proposed_content })
    .eq('id', req.forked_prompts.source_prompt_id)

  return supabase.from('merge_requests')
    .update({ status: 'approved', reviewed_at: new Date().toISOString() })
    .eq('id', mergeRequestId)
}
```

---

## Data Flow

### Fork Workflow (Checkout to Merge)

```
Consultant views library
    ↓
"Checkout" prompt → forkPrompt() Server Action
    ↓
forked_prompts row created (snapshot of content + source_prompt_id)
    ↓
Consultant edits fork in engagement workspace
    ↓
PromptRating row created (optional, 1-2 click)
    ↓
"Suggest merge" → submitMergeRequest() Server Action
    ↓
merge_requests row created (status: pending)
    ↓
Lead/Admin views merge queue → diff rendered client-side
    ↓
Approve → prompts.content updated + merge_requests.status = approved
Reject  → merge_requests.status = rejected + reviewer_notes
```

### Role-Gated Data Access

```
User request arrives at Next.js route
    ↓
middleware.ts checks Supabase session (cookie)
    ↓ (no session)
Redirect → /login

    ↓ (session exists)
Session JWT carries role in app_metadata
    ↓
Server Component calls Supabase SSR client
    ↓
Supabase executes query with RLS applied
    ↓
RLS policies filter rows based on auth.jwt() role + auth.uid()
    ↓
Server Component receives only authorized rows
    ↓
Route-level role check for admin-only pages (middleware or layout)
```

### Key Data Flows

1. **Library → Fork → Edit → Rate:** Linear, all within one engagement context. The engagement ID is the scope key — it threads through every query in the workspace.

2. **Fork → Merge Request → Approval → Canonical update:** Two-phase write. Phase 1 is consultant-initiated. Phase 2 is gated on lead/admin role. The `merge_requests` table is the handoff point between phases.

3. **Ratings → Analytics → Dashboard:** `prompt_ratings` and `forked_prompts.usage_count` aggregate into the admin dashboard. Queries run as aggregations (avg rating by category, merge approval rate, top-used prompts). No separate analytics store needed at v1 scale.

4. **Demand Board → Resolution:** `demand_requests` are standalone. Upvote increments a counter (optimistic update in UI, confirmed by server). Admins mark resolved and can link to the resulting prompt.

---

## Build Order (Dependencies Drive Sequence)

The system has clear dependency layers. Each layer must exist before the next is buildable.

```
Layer 0: Foundation (no dependencies)
├── Supabase project + schema migrations
├── Auth setup (email, Google OAuth, demo bypass)
├── Next.js scaffold + Tailwind + shadcn/ui
└── RLS policies + seed data

Layer 1: Read-Only Core (depends on Layer 0)
├── Library browse + search + filter
└── Prompt detail view (content, metadata)

Layer 2: Engagement Workspace (depends on Layer 1)
├── Engagement CRUD
├── Fork/checkout flow
├── Forked prompt edit view
└── Prompt ratings

Layer 3: Merge Workflow (depends on Layer 2)
├── Merge request submission
├── Diff view (OSS component)
└── Review queue + approve/reject

Layer 4: Community Layer (depends on Layer 0, lightweight)
└── Demand board (submit, upvote, resolve)

Layer 5: Analytics + Admin (depends on Layers 1-4 for data)
└── Admin dashboard with charts and metrics
```

**Why this order matters:**
- The schema must be correct before any UI is built — schema changes cause cascading rewrites
- The library (read-only) is the simplest surface for validating RLS and type generation before introducing writes
- Forks cannot exist without engagements; merge requests cannot exist without forks — the dependency chain is strictly linear
- Demand board is isolated (no dependencies on forks or merges) and could be built in parallel with Layer 2-3, but is lower priority
- The dashboard aggregates data that only becomes meaningful after real data exists in the system — build it last

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-50 users (demo) | Monolith fine. Supabase free tier, Vercel hobby. No caching layer needed. |
| 50-500 users | Add Supabase connection pooler (PgBouncer). Add Next.js route caching for library pages (`revalidate`). |
| 500-5k users | Consider read replicas for analytics queries. Move dashboard aggregations to materialized views or cron-refreshed summary tables. |
| 5k+ users | Extract analytics to separate read path. Add Redis for demand board vote debouncing. Evaluate edge caching for library content. |

### Scaling Priorities

1. **First bottleneck:** Library queries without RLS index optimization. As the prompt library grows, add composite indexes on `(category, is_published, effectiveness_score)`. RLS policies with subqueries also benefit from indexes on FK columns.
2. **Second bottleneck:** Dashboard aggregation queries running on every page load. Replace with materialized views or server-side caching (`unstable_cache` in Next.js) with a 5-minute TTL.

---

## Anti-Patterns

### Anti-Pattern 1: Editing Canonical Prompts Directly

**What people do:** Allow consultants to edit the `prompts` table directly — "we'll add approval later."
**Why it's wrong:** There is no "later." The fork/merge model is the product's core value. Adding it retroactively requires migrating existing edits, reworking the data model, and breaking any existing forks. It must be built first.
**Do this instead:** From day one, consultants only ever edit `forked_prompts`. The canonical `prompts` table is write-protected for consultants at the RLS level.

### Anti-Pattern 2: Storing Role in `user_metadata` Instead of `app_metadata`

**What people do:** Call `supabase.auth.updateUser({ data: { role: 'admin' } })` which writes to user-editable metadata.
**Why it's wrong:** Any authenticated user can call `updateUser` and elevate their own role. This is a privilege escalation vulnerability.
**Do this instead:** Set role via the Supabase service-role client (admin SDK or Edge Function) which writes to `raw_app_meta_data`. This field cannot be modified by the user.

### Anti-Pattern 3: Putting Business Logic in the Frontend

**What people do:** Fetch all rows, filter in React, rely on hidden UI elements to gate admin-only actions.
**Why it's wrong:** RLS is bypassed if someone calls the Supabase API directly. The admin dashboard data and merge approval actions are exposed.
**Do this instead:** All data access goes through Server Components or Server Actions. Mutations use the SSR Supabase client which respects RLS. Client components only receive pre-filtered, pre-authorized data.

### Anti-Pattern 4: One Massive `useEffect` Data Fetcher in Each Page

**What people do:** Build client components that fetch their own data via `useEffect` + `supabase.from().select()`.
**Why it's wrong:** This makes every page dependent on client-side JavaScript, loses server-side rendering benefits, and makes auth context management fragile.
**Do this instead:** Use Server Components for data fetching. Pass pre-fetched data as props to client components. Reserve client-side Supabase queries for real-time subscriptions (which Upstream v1 doesn't need) or optimistic UI patterns (like upvoting).

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Supabase Auth | Cookie-based session via `@supabase/ssr`. Middleware reads session on every request. | Use `createServerClient` for SSR, `createBrowserClient` for client components. |
| Supabase Postgres | Server Components call `createClient()` from `lib/supabase/server.ts`. Server Actions use the same. | Never expose service-role key to client. Generated types via `supabase gen types`. |
| Vercel | Deploy via git push. Environment vars set in Vercel dashboard. | `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are safe to expose. |
| Markdown editor (OSS) | Client component wrapping a library like `@uiw/react-md-editor`. Content stored as raw markdown string. | Editor only needed in fork edit view — one screen. |
| Diff viewer (OSS) | Client component wrapping `react-diff-viewer-continued` or similar. Receives `oldValue` / `newValue` strings. | Used in merge review screen only. |
| Chart library (OSS) | Recharts or Tremor for admin dashboard. Server-rendered data, client-side chart rendering. | Keep chart components isolated in `components/dashboard/`. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Server Component ↔ Supabase | Direct Supabase SSR client call in async component | No API layer needed — App Router eliminates the REST API middleman |
| Server Action ↔ Supabase | Same SSR client from `lib/supabase/server.ts` | Mutations are co-located with the routes that trigger them |
| Client Component ↔ Server | Props from parent Server Component, or Server Action invocation | Client components should not query Supabase directly in v1 |
| Middleware ↔ Auth | Supabase session cookie read in `middleware.ts`, role checked from JWT | Protect `/admin` and `/merge-queue` at the middleware layer |
| RLS ↔ App Logic | RLS is the authoritative gate; app logic is a UX convenience | If they disagree, RLS wins — users see an empty result, not an error |

---

## Sources

- Next.js App Router project structure: https://nextjs.org/docs/app/getting-started/project-structure (verified 2026-03-25, version 16.2.1)
- Supabase RLS role-based patterns: https://supabase.com/docs/guides/database/postgres/row-level-security (verified 2026-03-25)
- Supabase auth role storage in `app_metadata`: https://supabase.com/docs/guides/auth/row-level-security (verified 2026-03-25)
- Supabase + Next.js App Router integration: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs (verified 2026-03-25)

---

*Architecture research for: Upstream — Prompt Management System*
*Researched: 2026-03-25*
