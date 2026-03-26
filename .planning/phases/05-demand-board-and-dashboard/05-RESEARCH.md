---
description: Phase 5 research for Demand Board and Dashboard — covers schema migration gap (planned status + decline_reason), Recharts v2 vs v3 version decision, data access patterns, seed data structure, optimistic upvote pattern, and dashboard query design.
date_last_edited: 2026-03-26
---

# Phase 5: Demand Board and Dashboard — Research

**Researched:** 2026-03-26
**Domain:** Next.js 16 App Router, Supabase RLS, Recharts, Seed Data
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Upvote interaction uses arrow + count on the left side of each request card. Filled arrow (brand blue) when user has upvoted, outline when not. Count displayed below the arrow. ProductHunt/StackOverflow pattern.
- **D-02:** Request cards show: title, truncated description (2 lines), category badge, urgency badge (color-coded), submitter name, relative time. When resolved, also show linked prompt name as a clickable link.
- **D-03:** Demand board uses filter tabs: Open | Planned | Resolved | Declined | All — consistent with review queue pattern from Phase 4. Default sort: most upvoted. Additional sort options: newest, urgent first.
- **D-04:** Request submission via dialog triggered by "New Request" button on the demand board. Fields: title (text), description (textarea), category (dropdown — same 6 categories as library), urgency (dropdown — nice_to_have, medium, urgent).
- **D-05:** Request status lifecycle: Open (blue) → Planned (amber) → Resolved (green, linked to prompt) | Declined (red, with reason).
- **D-06:** Admin resolve flow: "Resolve" button opens a dialog with a search-select field. Admin types prompt name, autocomplete shows matches from active library prompts, select one and confirm. Stays on the demand board.
- **D-07:** Admin decline flow: "Decline" button expands an inline textarea for a reason. Required non-empty reason before "Confirm Decline" button activates.
- **D-08:** Admin controls (Planned/Resolve/Decline) appear directly on demand board cards. Consultants see read-only cards.
- **D-09:** Three metric cards across the top: (1) Active Prompts count, (2) Total Checkouts (forks), (3) Open Items (pending merge requests + open prompt requests).
- **D-10:** Three charts: (1) Line chart — checkouts over time (weekly granularity), (2) Two side-by-side tables — Top 10 most used prompts + Bottom 10 lowest rated prompts, (3) Grouped bar chart — demand vs supply (requests opened vs resolved by month).
- **D-11:** Surface low-utilization prompts — prompts with zero or near-zero forks.
- **D-12:** Charting library: Recharts. Add `recharts` to package.json. Line chart for time series, bar chart for demand vs supply.
- **D-13:** All dashboard data is live queries against real database — no hardcoded demo numbers.
- **D-14:** 2 sample engagements owned by the demo consultant user. (1) "Acme Corp AI Strategy" — active, 3 forks with varied ratings (3-5 stars), one fork has a pending merge suggestion. (2) "TechStart Enablement" — completed, 2 forks with high ratings (4-5 stars), one fork was merged back to library.
- **D-15:** 5-7 sample prompt requests on the demand board: 3-4 open with varied upvote counts (2-14), 1-2 resolved (linked to existing library prompts), 1 declined with a reason, 1 planned status.
- **D-16:** Demo consultant user owns the engagements, forks, and some demand requests.
- **D-17:** Dashboard data is computed from seed data via live queries — no separate dashboard seed needed.

### Claude's Discretion

- Exact seed data content (engagement names, request titles, decline reasons) — should be realistic for AI consultancy context
- Chart styling, colors, and responsive layout within the dark mode theme
- Whether metric cards use sparkline trends or just static numbers
- Loading skeleton design for dashboard and demand board
- Empty state messaging and icons
- How "underutilized prompts" section is presented (separate card, table row highlight, etc.)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DEMAND-01 | User can submit a prompt request with title, description, category, and urgency level | `prompt_requests` table exists; `requests_insert_own` RLS policy in place; server action pattern from `review/actions.ts` |
| DEMAND-02 | User can view open prompt requests sorted by upvotes | `request_upvotes` table exists; count requires join or subquery; sort by count descending |
| DEMAND-03 | User can upvote a prompt request (toggle) | `request_upvotes` composite PK enforces one vote per user; toggle = insert or delete; optimistic update via `useTransition` |
| DEMAND-04 | Admin can resolve a request by linking it to a created prompt | `resolved_by_prompt` FK column exists on `prompt_requests`; requires `planned` status migration; admin client bypasses RLS |
| DEMAND-05 | Admin can decline a request with a reason | Schema gap: `decline_reason` column does not exist on `prompt_requests` — requires Migration 004 |
| DASH-01 | Admin can view top-level metrics: active prompts, avg effectiveness, total checkouts, open merge requests, open prompt requests | All data available from existing tables; aggregation queries via admin client |
| DASH-02 | Admin can view usage chart (checkouts over time) | `forked_at` timestamp on `forked_prompts`; group by week via `date_trunc('week', forked_at)` |
| DASH-03 | Admin can view top 10 most used prompts and bottom 10 lowest-rated prompts | `total_checkouts` on `prompts`; `avg_effectiveness` on `prompts`; simple ORDER BY queries |
| DASH-04 | Admin can view demand vs supply (requests opened vs resolved) | `created_at` on `prompt_requests` for "opened"; `resolved_at` for "resolved"; group by month |
| SEED-02 | Seed data includes 2-3 sample engagements with forked prompts | Requires demo user ID known at seed time; seed SQL must reference the demo bypass user UUID |
| SEED-03 | Seed data includes sample prompt requests on the demand board | Requires demo user ID for `requested_by`; upvote seed requires demo user ID for `user_id` |

</phase_requirements>

---

## Summary

Phase 5 delivers two features that complete the v1 demo: the Demand Board (`/demand`) and Admin Dashboard (`/dashboard`), plus seed data that makes the demo bypass experience feel lived-in. All prior phases have established a clear, replicable pattern — server component pages fetch data with the admin client, pass typed props to client orchestrators, mutations go through `'use server'` actions with `getAdminUser()` role check. Phase 5 follows this pattern exactly, with two new surfaces and one new library.

The most important discovery is a **schema gap**: the `prompt_requests` table is missing two things that CONTEXT.md decisions require — (1) the `planned` status value (only `open`, `resolved`, `declined` exist today; the `status TEXT DEFAULT 'open'` column has no CHECK constraint, so this is a data-only concern addressed by documentation not a migration) and (2) a `decline_reason` TEXT column that parallels `merge_decline_reason` on `forked_prompts`. Migration 003 established the pattern; Migration 004 must add `decline_reason` to `prompt_requests`. This is a blocking prerequisite for DEMAND-05.

Seed data is the second area requiring careful planning. The demo bypass creates an anonymous user with `demo_role = 'consultant'` in `user_metadata`. Seed data for engagements, forks, and demand requests must all reference the same user ID — but that ID is not known at migration/seed time because anonymous users are created at runtime. The correct pattern is a dedicated seeded demo profile (a real Supabase user row), or the seed SQL inserts a placeholder UUID and the demo bypass's `signInAnonymously()` is updated to use a fixed UUID. Research shows the current implementation uses `signInAnonymously()` which generates a new UUID each session — so seed data that belongs "to" the demo user requires a different approach. See Open Questions.

**Primary recommendation:** Implement in 6 waves — (0) Migration + recharts install, (1) Demand Board data layer + server actions, (2) Demand Board UI, (3) Dashboard data layer, (4) Dashboard UI, (5) Seed data.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | ^2.15.4 (v2 latest) | Line chart + grouped bar chart | Locked in D-12; React 19 compatible per peer deps |
| @supabase/supabase-js | ^2.100.0 (already installed) | All DB queries | Already in project |
| next | 16.2.1 (already installed) | App Router, Server Actions | Already in project |

**Version note on recharts:** CONTEXT.md D-12 specifies `^2.15.0`. The latest v2 patch is `2.15.4` (verified via `npm view`). The latest overall is v3.8.1. Research confirmed recharts v3 is a major release with API changes from v2. Since D-12 locks the v2 range and the `^` semver means "compatible with 2.x", install `recharts@^2.15.4`. Do NOT install v3 — it would break the established API patterns in this research.

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sonner | already installed | Toast notifications for optimistic update errors | Already used in merge suggestion section |
| lucide-react | ^1.6.0 (already installed) | Icons for cards, metric cards, buttons | Already in project |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| recharts | shadcn Charts (built on recharts v3) | shadcn charts wrap recharts v3, which conflicts with D-12 locking v2; do not use |
| recharts | chart.js / tremor | Not standard for this project; no reason to deviate from D-12 |

**Installation:**
```bash
npm install recharts@^2.15.4
```

**Version verification (run before planning):**
```bash
npm view recharts version   # currently: 3.8.1 (latest overall)
npm view recharts@2 version  # currently: 2.15.4 (latest v2)
```

---

## Architecture Patterns

### Recommended Project Structure

```
app/(app)/
├── demand/
│   └── page.tsx                          # Server component, admin gate, fetch requests
├── dashboard/
│   └── page.tsx                          # Server component, admin gate, fetch metrics

components/
├── demand/
│   ├── request-card.tsx                  # Full card with upvote + admin actions
│   ├── demand-board-client.tsx           # Client orchestrator (tabs, sort, list)
│   ├── new-request-dialog.tsx            # New request form dialog
│   └── resolve-request-dialog.tsx        # Admin resolve with prompt search
├── dashboard/
│   ├── metric-card.tsx                   # Single metric card (icon + number + label)
│   ├── usage-line-chart.tsx              # Recharts LineChart wrapper
│   ├── demand-bar-chart.tsx              # Recharts BarChart wrapper
│   ├── top-prompts-table.tsx             # Top 10 most used
│   └── needs-attention-table.tsx         # Lowest rated + underutilized

lib/
├── data/
│   ├── prompt-requests.ts                # fetchRequests, countRequests, fetchRequestById
│   └── dashboard.ts                      # fetchMetrics, fetchUsageOverTime, fetchDemandVsSupply

app/(app)/demand/
│   └── actions.ts                        # submitRequest, toggleUpvote, markPlanned, resolveRequest, declineRequest

supabase/migrations/
│   └── 004_prompt_requests_decline_reason.sql   # ADD COLUMN decline_reason TEXT
```

### Pattern 1: Server Component Page with Admin Gate

Exact replication of `app/(app)/review/page.tsx`. All new admin-only pages use this pattern:

```typescript
// app/(app)/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchDashboardMetrics } from '@/lib/data/dashboard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = user.app_metadata?.role as string | null
  const isAnonymous = user.is_anonymous ?? false
  const demoRole = isAnonymous ? (user.user_metadata?.demo_role as string ?? 'consultant') : null
  const effectiveRole = role ?? (isAnonymous ? demoRole : null)

  if (effectiveRole !== 'admin') redirect('/library')

  const metrics = await fetchDashboardMetrics()
  return <DashboardClient metrics={metrics} />
}
```

### Pattern 2: Data Access Layer with Admin Client

Source: `lib/data/merge-suggestions.ts` — replicate exactly for demand board.

```typescript
// lib/data/prompt-requests.ts
import { createAdminClient } from '@/lib/supabase/admin'

export async function fetchPromptRequests(
  status: 'open' | 'planned' | 'resolved' | 'declined' | 'all' = 'open',
  sort: 'upvotes' | 'newest' | 'urgent' = 'upvotes'
): Promise<PromptRequest[]> {
  const supabase = createAdminClient()

  let query = supabase
    .from('prompt_requests')
    .select(`
      *,
      profiles!requested_by(name),
      prompts!resolved_by_prompt(title, id),
      upvote_count:request_upvotes(count)
    `)

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  // Sort logic
  if (sort === 'newest') query = query.order('created_at', { ascending: false })
  else if (sort === 'urgent') query = query.order('urgency', { ascending: false })
  // upvotes sort: handled client-side after counting
  // ... (see Pitfall 1 below)

  const { data, error } = await query
  // ...
}
```

**Note on upvote count sort:** Supabase does not support `ORDER BY` on aggregated joined subqueries directly with the JS client. Sort by upvotes requires either (a) a Postgres view or function, or (b) fetching all results and sorting client-side in the server component. For v1 low data volume (20-50 requests max), client-side sort in the data layer is acceptable.

### Pattern 3: Server Action with getAdminUser

Source: `app/(app)/review/actions.ts` — copy `getAdminUser()` into the new demand/actions.ts file (same constraint as Phase 4: cannot import helpers across `'use server'` boundaries).

```typescript
// app/(app)/demand/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const role = user.app_metadata?.role as string | null
  const isAnonymous = user.is_anonymous ?? false
  const demoRole = isAnonymous ? (user.user_metadata?.demo_role as string ?? 'consultant') : null
  const effectiveRole = role ?? (isAnonymous ? demoRole : null)
  if (effectiveRole !== 'admin') return null
  return { user, supabase: createAdminClient() }
}

export async function declineRequest(requestId: string, reason: string) {
  const ctx = await getAdminUser()
  if (!ctx) return { error: 'Unauthorized' }
  const { supabase } = ctx

  const { error } = await supabase
    .from('prompt_requests')
    .update({ status: 'declined', decline_reason: reason })
    .eq('id', requestId)

  if (error) return { error: error.message }
  revalidatePath('/demand')
  return { success: true }
}
```

### Pattern 4: Optimistic Upvote with useTransition

Source: Established pattern from Phase 3 autosave (per-field useTransition). Upvote must feel instantaneous.

```typescript
// Inside RequestCard (client component)
const [isUpvoted, setIsUpvoted] = useState(initialIsUpvoted)
const [count, setCount] = useState(initialCount)
const [isPending, startTransition] = useTransition()

function handleUpvote() {
  const next = !isUpvoted
  const nextCount = next ? count + 1 : count - 1
  setIsUpvoted(next)  // optimistic
  setCount(nextCount)  // optimistic

  startTransition(async () => {
    const result = await toggleUpvote(requestId)
    if (!result.success) {
      setIsUpvoted(!next)  // revert
      setCount(count)      // revert
      toast.error('Could not save upvote. Try again.')
    }
  })
}
```

### Pattern 5: Recharts Dark Mode Charts

Recharts does NOT inherit CSS variables — inline hex values required. Both chart wrapper components encapsulate all Recharts config so parent pages receive only typed data.

```typescript
// components/dashboard/usage-line-chart.tsx
'use client'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'

interface UsageDataPoint { week: string; count: number }

export function UsageLineChart({ data }: { data: UsageDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis
          dataKey="week"
          stroke="#27272a"
          tick={{ fill: '#71717a', fontSize: 13 }}
        />
        <YAxis
          stroke="#27272a"
          tick={{ fill: '#71717a', fontSize: 13 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            color: 'oklch(0.985 0 0)',
          }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#4287FF"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

### Pattern 6: Dashboard Aggregate Queries

Dashboard data fetched in the server component via the admin client, passed to client as props. Each query is a separate function in `lib/data/dashboard.ts`.

```typescript
// Metric: total checkouts
const { count } = await supabase
  .from('forked_prompts')
  .select('id', { count: 'exact', head: true })

// Checkouts over time (weekly, last 12 weeks)
const { data } = await supabase.rpc('get_weekly_checkouts', { weeks_back: 12 })
// OR: plain query with date_trunc — may require a Postgres view/function

// Top 10 most used prompts
const { data } = await supabase
  .from('prompts')
  .select('id, title, total_checkouts')
  .eq('status', 'active')
  .order('total_checkouts', { ascending: false })
  .limit(10)
```

**Note on `date_trunc` queries:** The Supabase JS client does not expose `date_trunc` natively. For "checkouts over time" and "demand vs supply" monthly grouping, the options are:
1. Fetch all records and group in JavaScript (acceptable for low volume demo data)
2. Create a Postgres function via a new migration and call via `.rpc()`
3. Use a Supabase view and query it

Option 1 (JS grouping) is recommended for v1 — no new migration needed, low data volume, simpler planner tasks.

### Anti-Patterns to Avoid

- **Do not query `forked_prompts` with the regular Supabase client for admin views** — RLS `forked_prompts_own` policy only grants access to the fork owner. Always use `createAdminClient()` for admin data access.
- **Do not use `auth.role()` in RLS policies** — this is the Postgres role (authenticated/anon), not the RBAC role. Always use `auth.jwt() -> 'app_metadata' ->> 'role'`.
- **Do not import `getAdminUser()` from another `'use server'` file** — Next.js 16 App Router does not allow cross-file imports of server action helpers. Copy the function directly into each `actions.ts` file (established in Phase 4).
- **Do not use recharts v3 or shadcn chart components** — D-12 locks recharts v2; shadcn charts wrap v3.
- **Do not sort by upvote count with `.order()` on a joined count** — the Supabase JS client doesn't support ordering by aggregate joins; sort in JS after fetching.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Charts | Custom SVG or canvas-based chart | recharts `LineChart` + `BarChart` | D-12 explicitly locks recharts; edge cases in responsive scaling, tooltips, animation |
| Optimistic state | Manual polling or refetch after action | `useTransition` + setState revert pattern | Already established in Phase 3 (autosave) and Phase 4 (MergeSuggestionSection) |
| Status badge colors | New color/icon mapping | Extend `statusConfig` from `review-queue-card.tsx` | Pattern is identical; copy and add `open` + `planned` keys |
| Relative time formatting | New utility | Extract `getRelativeTime()` from `review-queue-card.tsx` to `lib/utils/date.ts` | Same function used in demand board cards — 2 consumers justifies extraction |
| Prompt search autocomplete in Resolve dialog | Full search library | Controlled `Input` + `useState` filter against the already-fetched active prompts list | Only ~18 prompts in seed; no need for Combobox or external search — simple `filter()` on title |
| Role check in server actions | New auth middleware | Copy `getAdminUser()` pattern from `review/actions.ts` | Established pattern; cannot be imported across action files |

---

## Schema Gap: Critical Migration Required

This section is critical. Two schema changes are blocking implementation.

### Gap 1: `decline_reason` column on `prompt_requests`

**Problem:** DEMAND-05 requires admins to decline requests with a reason. The `prompt_requests` table has no `decline_reason` column. The analogous column `merge_decline_reason` on `forked_prompts` was added in Migration 003.

**Required Migration 004:**
```sql
-- supabase/migrations/004_prompt_requests_planned_decline.sql
ALTER TABLE prompt_requests ADD COLUMN decline_reason TEXT;
```

### Gap 2: `planned` status

**Problem:** CONTEXT.md D-05 defines a "Planned" intermediate status. The `prompt_requests.status` column uses `TEXT DEFAULT 'open'` (no CHECK constraint), so `planned` can be inserted without a migration. However, the absence of a CHECK constraint means the data layer can be inconsistent. No migration needed — just document the valid values.

**Valid status values (document in TypeScript type):**
```typescript
// lib/types/prompt-request.ts
export type RequestStatus = 'open' | 'planned' | 'resolved' | 'declined'
```

### Gap 3: Missing RLS update policy for `prompt_requests`

**Problem:** The schema has `requests_read` (SELECT) and `requests_insert_own` (INSERT) policies but NO UPDATE policy. Admin actions like "Mark Planned", "Resolve", and "Decline" all use UPDATE. The admin client uses service role, which bypasses RLS, so this is not a functional blocker. However, for correctness and future-proofing, an explicit admin UPDATE policy should be added in Migration 004.

**Recommended addition to Migration 004:**
```sql
CREATE POLICY "requests_update_admin" ON prompt_requests
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
```

---

## Seed Data Architecture

### Critical Problem: Demo User ID Is Unknown at Seed Time

The current demo bypass uses `signInAnonymously()` which generates a fresh UUID every session. Seed data for engagements, forks, and demand requests must reference a consistent `user_id`. There are two viable approaches:

**Option A: Seeded demo profile (recommended)**
Create a real Supabase auth user with a fixed UUID at seed time. The demo bypass flow checks if this user exists and signs in with it using a fixed credential, or signs them in anonymously but immediately links them to the seeded profile via a lookup.

Looking at the existing `signInAsDemo` pattern in the codebase — it calls `signInAnonymously()` and sets `user_metadata.demo_role`. To make seed data "belong" to this user, the simplest v1 approach is:

**Option B: Seed with a placeholder UUID, demo session reads by role**
Seed data is inserted with a fixed placeholder UUID (e.g., `'00000000-0000-0000-0000-000000000001'`). The app sidebar and engagement/request pages show "your data" by checking `created_by = auth.uid()` — but since the demo user's UID won't match, the demo user sees ALL data (which is available via admin-like queries) rather than only their own.

For the demo UX described in D-16 ("he sees 'his' work immediately — first-person experience"), Option B breaks down. The demo user must actually own the seed records.

**Recommended resolution (for planner to spec):** Create a fixture profile row and a deterministic demo consultant UUID in the seed file. During `signInAsDemo('consultant')`, after calling `signInAnonymously()`, immediately upsert the session user's anonymous ID into the profiles table and link them to the seeded engagements/requests. OR: Use a fixed seeded anonymous-user UUID by creating the Supabase user server-side via service role in seed.sql.

This is flagged as an Open Question because the final approach affects plan task design for the seed wave.

### Existing Seed Pattern

Current `supabase/seed.sql` inserts 18 prompts with `created_by = NULL`. The Phase 5 seed must:

1. Insert engagements with `created_by = <demo_user_uuid>`
2. Insert forked_prompts with `forked_by = <demo_user_uuid>`, referencing the 18 seeded prompts
3. Insert prompt_requests with `requested_by = <demo_user_uuid>`
4. Insert request_upvotes to simulate community activity

Seed data must come AFTER the 18 prompts are inserted (foreign key constraint on `resolved_by_prompt`). The seed file already uses a single file — append Phase 5 seed data after the existing 18-prompt INSERT.

---

## Common Pitfalls

### Pitfall 1: Sorting by Upvote Count via Supabase JS Client

**What goes wrong:** Attempting `query.order('upvote_count')` after a join that uses aggregate count will fail or silently ignore the order clause.

**Why it happens:** The Supabase JS client's `.select()` with `upvote_count:request_upvotes(count)` produces a nested array count, not a column that can be ordered.

**How to avoid:** Fetch all requests, then sort in JavaScript:
```typescript
const sorted = data.sort((a, b) => {
  return (b.request_upvotes?.length ?? 0) - (a.request_upvotes?.length ?? 0)
})
```

**Warning signs:** Requests appear in database insertion order regardless of upvote counts.

### Pitfall 2: Recharts SSR Error — "window is not defined"

**What goes wrong:** Recharts components access `window` during SSR. If a chart component is imported into a Server Component (even transitively), Next.js will throw at build time.

**How to avoid:** All chart components must have `'use client'` at the top. The page component passes data as props to the dashboard client, which renders the charts. Never import chart components into server components.

**Warning signs:** Build error: `ReferenceError: window is not defined` in a file importing recharts.

### Pitfall 3: `prompt_requests` UPDATE Without Admin Policy

**What goes wrong:** Regular authenticated client UPDATE fails silently (RLS returns 0 rows affected) when there is no matching policy, even for admins — because the admin client bypasses RLS but the regular client doesn't.

**How to avoid:** Always use `createAdminClient()` for any admin server action that updates `prompt_requests`. Confirm Migration 004 adds the explicit admin UPDATE policy for defense-in-depth.

**Warning signs:** "Mark Planned" appears to succeed (no error) but the card's status badge doesn't change after revalidation.

### Pitfall 4: getRelativeTime Duplication

**What goes wrong:** Phase 4 left `getRelativeTime()` as a local helper in `review-queue-card.tsx` with a comment "extract when second consumer added". Phase 5 demand board cards are that second consumer.

**How to avoid:** Extract `getRelativeTime()` to `lib/utils/date.ts` in Wave 0/1. Both `review-queue-card.tsx` and the new `request-card.tsx` import from there.

**Warning signs:** Two copies of identical function appear in the codebase.

### Pitfall 5: Recharts `ResponsiveContainer` Height Must Be Explicit

**What goes wrong:** `ResponsiveContainer` with `height="100%"` inside a container that doesn't have an explicit height will render as 0px (invisible chart).

**How to avoid:** Always set a numeric `height` on `ResponsiveContainer` directly, OR set an explicit height on the parent container in Tailwind (`h-[300px]`). The UI-SPEC mandates `height={300}` on ResponsiveContainer.

**Warning signs:** Charts render as empty containers with no SVG output.

### Pitfall 6: Demo Seed Data Not Visible to Demo User

**What goes wrong:** Seed data inserted with a placeholder UUID for `created_by`/`forked_by`/`requested_by`. The demo user's anonymous session has a different UUID. RLS `engagements_own` policy filters to `created_by = auth.uid()`, so the demo user sees zero engagements despite seed data existing.

**How to avoid:** Resolve the demo user UUID approach before writing the seed wave. See Seed Data Architecture section and Open Questions.

**Warning signs:** Demo bypass lands on `/engagements` and shows the empty state despite seed.sql having engagement records.

---

## Code Examples

### Verified pattern: statusConfig for request status badges

```typescript
// Source: components/review/review-queue-card.tsx — extend this exact pattern
import { CircleDot, Clock, CheckCircle, XCircle } from 'lucide-react'

const statusConfig = {
  open:     { label: 'Open',     color: '#4287FF', icon: CircleDot,    bg: 'bg-[#4287FF]/15',  text: 'text-[#4287FF]'  },
  planned:  { label: 'Planned',  color: '#FFB852', icon: Clock,        bg: 'bg-[#FFB852]/15',  text: 'text-[#FFB852]'  },
  resolved: { label: 'Resolved', color: '#65CFB2', icon: CheckCircle,  bg: 'bg-[#65CFB2]/15',  text: 'text-[#65CFB2]'  },
  declined: { label: 'Declined', color: '#E3392A', icon: XCircle,      bg: 'bg-[#E3392A]/15',  text: 'text-[#E3392A]'  },
} as const
```

### Verified pattern: Filter tabs with router.push URL state

```typescript
// Source: app/(app)/review/review-queue-client.tsx
'use client'
import { useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

function handleTabChange(val: string) {
  router.push('/demand?status=' + val)
}
// Note: demand board has 5 tabs (add 'planned') vs review queue's 4
```

### Verified pattern: Inline decline form (no modal)

```typescript
// Source: components/engagements/merge-suggestion-section.tsx (adapted)
// The full expansion pattern:
const [decliningId, setDecliningId] = useState<string | null>(null)
const [declineReason, setDeclineReason] = useState('')

// In JSX: if (isAdmin && decliningId === request.id) render inline form
// "Confirm Decline" disabled={!declineReason.trim()}
```

### Verified pattern: Recharts grouped bar chart

```typescript
// Source: recharts docs — confirmed compatible with React 19 via peerDeps
'use client'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'

export function DemandBarChart({ data }: { data: DemandDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="month" stroke="#27272a" tick={{ fill: '#71717a', fontSize: 13 }} />
        <YAxis stroke="#27272a" tick={{ fill: '#71717a', fontSize: 13 }} />
        <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }} />
        <Legend wrapperStyle={{ color: '#71717a', fontSize: 13 }} />
        <Bar dataKey="opened" name="Requests opened" fill="#FFB852" radius={[2, 2, 0, 0]} />
        <Bar dataKey="resolved" name="Resolved" fill="#65CFB2" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
```

### Verified pattern: Admin landing redirect update

```typescript
// Source: STATE.md [Phase 03-engagement-workspace] decision:
// "Only redirect exact /library path — not /library/* — so consultants retain access to individual prompt detail pages"
// For Phase 5: admin landing should change from /library to /dashboard
// Location: app/(app)/layout.tsx or the post-login redirect logic
// Change: effectiveRole === 'admin' redirect to '/dashboard' (not '/library')
// This is a minor change — flip one string in the existing redirect logic
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded chart colors | Inline hex values for dark mode | Phase 5 (recharts) | Chart components must own their color config — not inheritable from CSS |
| Shared `getAdminUser` helper import | Copy-paste into each `actions.ts` | Phase 4 constraint | Each `'use server'` file must be self-contained |

**Deprecated/outdated:**
- `middleware.ts` naming: renamed to `proxy.ts` in Next.js 16. Confirmed in STATE.md.
- `auth.role()` in RLS: this is the Postgres role, not the app role. Never use it. Use `auth.jwt() -> 'app_metadata' ->> 'role'`.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm install | ✓ | darwin 25.3.0 | — |
| Supabase local | seed data, migrations | ✓ (assumed) | — | — |
| recharts | D-12, charts | ✗ (not installed) | — | Must install: `npm install recharts@^2.15.4` |

**Missing dependencies with no fallback:**
- recharts: must be installed in Wave 0 before any chart component task begins.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest 4.1.1 + @vitejs/plugin-react |
| Config file | `vitest.config.ts` (exists at project root) |
| Quick run command | `npm test` |
| Full suite command | `npm test` (runs all tests; no separate watch mode needed for CI) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DEMAND-01 | `submitRequest` action: returns error when not authenticated | unit | `npm test -- --reporter=verbose tests/demand-submit.test.ts` | ❌ Wave 0 |
| DEMAND-01 | `submitRequest` action: inserts row with correct `requested_by = auth.uid()` | unit | same | ❌ Wave 0 |
| DEMAND-03 | `toggleUpvote` action: inserts upvote row when not yet upvoted | unit | `npm test -- tests/demand-upvote.test.ts` | ❌ Wave 0 |
| DEMAND-03 | `toggleUpvote` action: deletes upvote row when already upvoted | unit | same | ❌ Wave 0 |
| DEMAND-04 | `resolveRequest` action: returns Unauthorized for consultant | unit | `npm test -- tests/demand-admin-actions.test.ts` | ❌ Wave 0 |
| DEMAND-04 | `resolveRequest` action: sets status='resolved' + resolved_by_prompt | unit | same | ❌ Wave 0 |
| DEMAND-05 | `declineRequest` action: returns Unauthorized for consultant | unit | same | ❌ Wave 0 |
| DEMAND-05 | `declineRequest` action: sets status='declined' + decline_reason | unit | same | ❌ Wave 0 |
| DASH-01 | Dashboard page: redirects non-admin to /library | unit | `npm test -- tests/dashboard-gate.test.ts` | ❌ Wave 0 |
| DASH-01 | Dashboard page: redirects unauthenticated to /login | unit | same | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm test` (all tests are fast — < 5s total based on prior phases)
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/demand-submit.test.ts` — covers DEMAND-01 (submitRequest server action)
- [ ] `tests/demand-upvote.test.ts` — covers DEMAND-03 (toggleUpvote server action)
- [ ] `tests/demand-admin-actions.test.ts` — covers DEMAND-04, DEMAND-05 (markPlanned, resolveRequest, declineRequest admin actions)
- [ ] `tests/dashboard-gate.test.ts` — covers DASH-01 admin gate redirect behavior
- [ ] `lib/utils/date.ts` — extract `getRelativeTime()` before demand board card uses it (avoids duplication Pitfall 4)

---

## Open Questions

1. **Demo seed user UUID — how does the demo bypass user "own" seed data?**
   - What we know: `signInAnonymously()` creates a fresh UUID each session; RLS `engagements_own` policy filters by `created_by = auth.uid()`; seed data must reference the same UUID as the demo user
   - What's unclear: The correct approach — seeded profile + fixed UUID, or a post-login data linking step
   - Recommendation: Use a fixed demo consultant UUID (e.g., `'demo-consultant-000-000-000000000001'` formatted as valid UUID) inserted into `profiles` via seed.sql. Update `signInAsDemo('consultant')` in `lib/auth-utils.ts` to call `supabase.auth.signInWithPassword({ email: 'demo@upstream.ai', password: 'demo1234' })` for the seeded user, or after `signInAnonymously()` run an upsert that sets the anonymous user's profile to the seeded engagements' `created_by`. The planner must choose and spec this in the seed wave.

2. **Recharts v2 vs v3 — is the locked version still the right choice?**
   - What we know: D-12 locks `^2.15.0`; recharts v3.8.1 is the latest with a different API; the UI-SPEC was written with v2 patterns (no `ChartContainer` or `ChartTooltip` shadcn wrappers)
   - What's unclear: Whether v3 breaking changes are significant enough to matter here
   - Recommendation: Stay with v2.15.4 as locked. The API surface used (ResponsiveContainer, LineChart, BarChart, Line, Bar, XAxis, YAxis, Tooltip, Legend) is stable across v2 and the UI-SPEC was written against it. No reason to deviate.

3. **Admin landing redirect — change from `/library` to `/dashboard`?**
   - What we know: STATE.md records `[Phase 03-engagement-workspace]: Role-based redirect (D-01): consultants land on /engagements after login, admins land on /library`
   - What's unclear: Whether the CONTEXT.md comment "consider changing to /dashboard now that it exists" is a locked decision or discretionary
   - Recommendation: CONTEXT.md code_context section says "consider" — treat as Claude's discretion. Change admin post-login redirect to `/dashboard` as a sidebar-level change in the demand board/dashboard activation wave.

---

## Sources

### Primary (HIGH confidence)

- Codebase scan: `supabase/migrations/001_initial_schema.sql` — `prompt_requests` and `request_upvotes` table definitions, RLS policies
- Codebase scan: `app/(app)/review/actions.ts` — `getAdminUser()` pattern, admin server action structure
- Codebase scan: `lib/data/merge-suggestions.ts` — data access layer pattern (admin client, joined queries)
- Codebase scan: `components/review/review-queue-card.tsx` — statusConfig pattern, getRelativeTime
- Codebase scan: `components/app-sidebar.tsx` — `enabled: false` entries for demand/dashboard; navItems structure
- `npm view recharts version` — recharts latest: 3.8.1 (v2 latest: 2.15.4) — verified 2026-03-26
- `npm view recharts peerDependencies` — React 19 compatible in both v2 and v3

### Secondary (MEDIUM confidence)

- `vitest.config.ts` + `tests/` directory scan — confirmed vitest 4.x + jsdom environment; existing test patterns
- `supabase/migrations/` directory listing — confirmed 3 existing migrations, pattern for Migration 004

### Tertiary (LOW confidence)

- Supabase JS client limitation on ORDER BY aggregate joins — based on general Supabase knowledge; workaround (JS-side sort) verified as safe for low data volumes

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified via npm registry and codebase scan
- Architecture: HIGH — all patterns are direct replications of existing Phase 3/4 code
- Schema gaps: HIGH — confirmed by reading migration files and schema directly
- Recharts patterns: MEDIUM — API verified against peer deps; exact render behavior not locally testable until installed
- Seed data demo user approach: LOW — open question; the right implementation depends on a decision the planner must spec

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (stable stack; recharts v2 not expected to release breaking changes)
