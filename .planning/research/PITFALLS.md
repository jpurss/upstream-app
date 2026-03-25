---
description: Domain pitfalls research for Upstream — a prompt management system with fork/merge workflow on Supabase. Covers RLS, fork/merge data model, demo bypass, RBAC, diff viewing, and seed data gotchas.
date_last_edited: 2026-03-25
---

# Pitfalls Research

**Domain:** Prompt management system with Git-like fork/merge workflow — CRUD app on Next.js + Supabase
**Researched:** 2026-03-25
**Confidence:** MEDIUM-HIGH (official Supabase docs + multiple verified sources; fork/merge domain is less documented)

---

## Critical Pitfalls

### Pitfall 1: RLS Enabled But No Policies — Silent Denial of All Data

**What goes wrong:**
You enable Row Level Security on a table, ship to demo, and every query returns an empty array. No errors are thrown — empty results are valid PostgreSQL responses. The product appears to work but shows nothing. Demo day: the library is empty, engagements load blank, the audience is confused.

**Why it happens:**
RLS defaults to "deny all" when enabled with no policies. The Supabase dashboard SQL Editor runs as the `postgres` superuser and bypasses RLS entirely, so local testing passes while real authenticated users get nothing. The auth helpers package is also deprecated (`@supabase/auth-helpers`) and mixing old/new packages can cause policy evaluation failures silently.

**How to avoid:**
- Write at least one SELECT policy before enabling RLS on any table
- Test policies using a real authenticated user session, not the SQL editor
- Add a policy test checklist to every migration: SELECT, INSERT, UPDATE, DELETE for each role
- Use `@supabase/ssr` (not the deprecated `@supabase/auth-helpers`)

**Warning signs:**
- Queries return empty arrays instead of errors when testing with an authenticated user
- Dashboard shows data but the app shows nothing
- Works when running with service role key, fails with anon/authenticated key

**Phase to address:** Data model and auth foundation phase (earliest phase that touches Supabase)

---

### Pitfall 2: Fork/Merge State Machine Stored as Booleans Instead of an Enum

**What goes wrong:**
The merge request lifecycle — `pending`, `approved`, `rejected`, `merged` — gets implemented as a collection of boolean columns (`is_pending`, `is_approved`, `merged_at`, `rejected_at`). Transitions become ambiguous. Can something be both approved and rejected? Does `merged_at IS NOT NULL` mean it was approved? The review queue query becomes a mess of OR conditions and the UI has contradictory states.

**Why it happens:**
The first implementation of "suggest merge" often only needs two states (pending/done), and booleans feel simpler. The third state (rejected, requires revision) gets added later as a column because altering an enum means a migration. By the time `approved_but_awaiting_merge` emerges, the schema is unsalvageable without a rewrite.

**How to avoid:**
Design the status enum upfront with all known states: `pending | approved | rejected | merged`. Store it as a single `status` column with a Postgres check constraint or enum type. Never add boolean columns for workflow state — they can't represent mutually exclusive states reliably.

**Warning signs:**
- Reviewing the schema reveals multiple columns that together encode state (e.g. `merged_at`, `rejected_at`, `approved_by`)
- Review queue query uses more than one OR condition to find "active" items
- UI shows a "pending" badge on something that also has a rejection timestamp

**Phase to address:** Data model design phase, before any merge/review features are built

---

### Pitfall 3: RBAC Stored in `user_metadata` Instead of App-Controlled Tables

**What goes wrong:**
You store the user's role (`consultant`, `lead`, `admin`) in `user_metadata` on the Supabase auth user object, then write RLS policies that read from `auth.jwt()->'user_metadata'->>'role'`. This looks clean but is a critical security hole: any authenticated user can call `supabase.auth.updateUser({ data: { role: 'admin' } })` and elevate their own permissions. `user_metadata` is user-writable by default.

**Why it happens:**
`user_metadata` is the obvious place to "attach" data to a user. The Supabase dashboard even shows it prominently. The distinction between `user_metadata` (user-writable) and `app_metadata` (server-writable) or a separate `profiles` table is easy to miss.

**How to avoid:**
Store roles in an app-controlled `profiles` table (with RLS preventing self-updates) or in `app_metadata` set via a server-side hook. Write RLS policies that join to the `profiles` table or use a custom JWT claim set via an Auth Hook (not `user_metadata`). Enable the Auth Hook in `Authentication > Hooks` in the dashboard — forgetting this step means all users get null roles silently.

**Warning signs:**
- RLS policies reference `auth.jwt()->'user_metadata'`
- A consultant can call `updateUser` and see different data
- No `profiles` table or equivalent in the schema
- Auth Hook created but not activated in the dashboard

**Phase to address:** Auth and RBAC foundation phase

---

### Pitfall 4: Demo Bypass Creates a Shared Mutable Dataset

**What goes wrong:**
The "Demo Bypass" button signs everyone into the same pre-seeded demo account (or uses a fixed anonymous session pointing at shared rows). Two simultaneous visitors — the target stakeholder and a colleague — see each other's edits. The stakeholder forks a prompt, the colleague deletes it. The "demo" is corrupted by concurrent use and the seed data cannot be trusted.

**Why it happens:**
The fastest implementation of a demo bypass is one shared admin/demo user with seed data attached to that user's ID. It works in solo testing. Multi-user corruption only surfaces under real demo conditions.

**How to avoid:**
Use Supabase's `signInAnonymously()` for the demo bypass — it creates an isolated anonymous user per session. Seed data should be READ-ONLY global content (the prompt library, categories) owned by a fixed admin account with SELECT-only RLS for anonymous users. Engagement-level data (forks, ratings) can be created per anonymous session and are isolated by `auth.uid()`. This way each visitor has their own workspace on top of a shared read-only library.

**Warning signs:**
- Demo bypass signs users into a single hardcoded account
- Seed data rows have a single fixed `user_id` that the demo user "is"
- No isolation between two concurrent demo sessions
- CAPTCHA or rate limiting absent on anonymous sign-in endpoint (abuse risk)

**Phase to address:** Auth foundation phase (before seeding demo data)

---

### Pitfall 5: Forked Prompt Snapshot Not Taken at Fork Time

**What goes wrong:**
A consultant forks Prompt A (v1). An admin later updates Prompt A to v2 in the central library. The consultant's fork now shows the v2 content, even though they forked v1. When they submit a merge suggestion with a diff, the diff is against v2 — making it appear they made no changes, or the diff is backwards. The fork/merge workflow breaks because forks don't represent a true snapshot.

**Why it happens:**
The `ForkedPrompt` table stores a foreign key to the parent `Prompt`, not a copy of its content. Querying `JOIN prompts ON forked_prompts.prompt_id = prompts.id` always returns current content. This feels correct for "live link" but is wrong for a fork-and-diverge workflow.

**How to avoid:**
At fork time, copy the `content`, `title`, and relevant metadata into the `ForkedPrompt` row itself (as `original_content`, `original_title`). The fork stores both the snapshot it diverged from AND the consultant's adapted version. The diff is always `original_content` vs `forked_content`. The parent prompt evolving after fork does not affect the forked copy.

**Warning signs:**
- `ForkedPrompt` table has no `original_content` or `snapshot_*` columns
- Diff view queries the parent prompt's current content at render time
- Editing the parent prompt changes what all forks "diverged from"

**Phase to address:** Data model design phase, before fork/checkout feature is built

---

### Pitfall 6: N+1 Queries in the Prompt Library and Engagement Views

**What goes wrong:**
The prompt library loads 18 prompts, then for each prompt fetches: its category, its active forks count, its average rating, its tags. That's 18 × 4 = 72 queries for one page load. On the free Supabase tier (connection limits, cold starts), this produces visible latency — 3-5 seconds for the library to render. The demo feels slow.

**Why it happens:**
React Server Components + Supabase's JavaScript client make it easy to write `await supabase.from('prompts').select('*')` followed by per-row lookups in a loop. It reads naturally as code but translates to query-per-row.

**How to avoid:**
Use Supabase's nested select syntax to fetch related data in a single query: `select('*, category:categories(*), forks:forked_prompts(count)'`. For aggregates (average rating, fork count), create Postgres views or use SQL aggregate subqueries. Test the network tab during development — if prompt library load triggers more than 3 network requests, investigate.

**Warning signs:**
- Library page makes more than 3 Supabase requests on load (check browser devtools network tab)
- Per-prompt data (ratings, fork counts) fetched in a `forEach` or `map` over results
- Page load time exceeds 1 second on a warm Supabase connection

**Phase to address:** Library browse and prompt detail phase

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip RLS on seed-only tables (categories, tags) | Faster setup | Any table without RLS is fully public via the anon key | Never — always enable RLS even with a permissive SELECT ALL policy |
| Use `user_metadata` for roles | No extra table needed | Users can self-elevate permissions | Never |
| Store status as booleans (`is_merged`, `is_rejected`) | Simpler to start | Mutually exclusive states become impossible to enforce | Never for state machines |
| Single shared demo account | Demo works immediately | Multi-user corruption, no isolation | Never for a deployed demo |
| Fetch parent prompt content at diff-render time | No snapshot column needed | Diffs break when parent is updated | Never — snapshot at fork time |
| Client-side filtering of prompts by role/category | No server query params | Fetches all rows then discards most; breaks at scale | Only for < 50 rows total (never here) |
| No connection pooling config | Works fine locally | Free tier hits connection limits fast | Never for production/demo |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase Auth + Next.js App Router | Using `@supabase/auth-helpers` (deprecated) | Use `@supabase/ssr` with middleware refresh pattern |
| Supabase Auth + Next.js Middleware | Relying solely on middleware for auth — middleware can be bypassed (CVE-2025-29927) | Add server-side auth checks in RSC/Route Handlers in addition to middleware |
| Supabase client initialization | Creating client at module level (persists across requests) | Initialize inside each request handler; never store user state at module level |
| Supabase Auth + CDN/Vercel | Missing `Cache-Control: private, no-store` on auth routes | Set cache headers on any route handling auth; this is critical for SSR on Vercel |
| Tiptap / markdown editor + SSR | Hydration mismatch (editor renders on server) | Set `immediatelyRender: false`; wrap editor in `'use client'` |
| react-diff-viewer | Original `react-diff-viewer` package (6 years unmaintained) | Use `react-diff-viewer-continued` (actively maintained fork) |
| Supabase anonymous sign-in | No rate limiting on demo bypass | Add CAPTCHA or Cloudflare Turnstile to prevent database bloat from abuse |
| Supabase views + RLS | Views bypass RLS by default (created as postgres user) | Set `security_invoker = true` on views (Postgres 15+) or avoid views in RLS-controlled surfaces |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| N+1 queries on library page | 3-5s load time, 20+ network requests | Use Supabase nested select; aggregate in SQL | With any list > 10 items |
| Sequential awaits instead of parallel fetches | Dashboard takes 2-4s to load multiple panels | Use `Promise.all([...])` for independent fetches | Any page with 2+ independent data sections |
| RLS policy on unindexed columns | Slow queries that worsen with data growth | Index every column used in `WHERE` clauses of RLS policies (user_id, prompt_id, status) | Noticeable at 1,000+ rows |
| Fetching full prompt content for list views | Large payloads, slow renders | Select only metadata columns for lists; fetch content on detail view | At 18+ prompts with long content |
| Waterfall RSC data fetching | Each panel waits for previous | Use Suspense boundaries with parallel fetch | Immediately on any multi-section page |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| `user_metadata` used in RLS policies | User self-elevates to admin role | Store roles in `profiles` table or `app_metadata` via server-only Auth Hook |
| Service role key exposed in client code | Full database bypass — all RLS ignored | Service role key server-only (env var); never in client bundles |
| RLS disabled on any table | All rows exposed via anon key to anyone | Enable RLS + at least one policy on every table |
| Demo bypass creates auth-bypass pathway | Auth middleware CVE-2025-29927 exploitation risk (pre-15.2.3) | Deploy on Vercel (mitigates CVE); add server-side auth checks beyond middleware |
| No CAPTCHA on anonymous sign-in | Malicious actors inflate DB with anonymous users | Add invisible Turnstile to demo bypass button |
| `WITH CHECK` missing on INSERT/UPDATE policies | Users insert/update rows with arbitrary `user_id` | Every INSERT and UPDATE policy needs a `WITH CHECK` clause |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Diff view shows raw text (not markdown-rendered) | Consultant can't tell if changes look right | Show rendered markdown preview + line diff toggle |
| "Suggest Merge" with no diff context | Lead reviewer can't evaluate without opening both versions | Always render side-by-side diff inline in review queue |
| Fork/checkout with no visual indicator of parent prompt state | Consultant doesn't know if parent was updated since fork | Show "parent updated since fork" badge on ForkedPrompt detail |
| Rating UI buried deep in forked prompt detail | Consultants don't rate prompts → no field intelligence | Surface 1-click rating on engagement workspace list view |
| Demo bypass drops user into empty-looking app | Stakeholder thinks the product has no data | Demo bypass should land on a pre-populated engagement workspace, not an empty dashboard |
| Markdown editor toggling between raw/preview modes confuses non-technical users | Consultants see syntax instead of formatted output | Default to WYSIWYG/preview mode; raw mode secondary |

---

## "Looks Done But Isn't" Checklist

- [ ] **Fork workflow:** The forked prompt stores a snapshot of `original_content` at fork time — verify with `SELECT original_content FROM forked_prompts LIMIT 1`
- [ ] **RLS:** Every table has RLS enabled AND at least one policy — verify with `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'`
- [ ] **RBAC:** Roles are stored in `profiles` table (or `app_metadata`), NOT in `user_metadata` — verify by checking which column RLS policies reference
- [ ] **Demo bypass isolation:** Two concurrent anonymous sessions cannot see each other's forks — verify by opening two incognito windows and creating different forks
- [ ] **Merge status enum:** Status transitions are enforced as an enum/check constraint — verify with `\d forked_prompts` or equivalent
- [ ] **Diff view:** Diff renders against `original_content` (snapshot), not current parent prompt content — verify by editing parent after forking and confirming diff unchanged
- [ ] **Auth package:** App uses `@supabase/ssr` not `@supabase/auth-helpers` — verify in `package.json`
- [ ] **Tiptap hydration:** Markdown editor has `immediatelyRender: false` — verify no hydration warnings in browser console
- [ ] **Seed data:** Demo seed runs idempotently — verify `npm run seed` can be run twice without duplicate key errors
- [ ] **Review queue:** Approved/rejected/merged items are excluded from the queue — verify with a test approval and confirm item leaves queue

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| RLS misconfiguration discovered post-launch | LOW | Add policies via migration, no data loss |
| Fork snapshot not stored (all forks reference live parent) | HIGH | Requires migration to add `original_content` column, backfill from current parent (lossy — true original lost), rewrite diff logic |
| RBAC in `user_metadata` | MEDIUM | Migrate roles to `profiles` table, update all RLS policies, re-test every role-gated feature |
| Shared demo account (multi-user corruption) | MEDIUM | Implement `signInAnonymously()`, reseed, update RLS policies to use `auth.uid()` scoping |
| Status stored as booleans | MEDIUM | Add `status` enum column, migrate existing rows, drop boolean columns, update all queries |
| N+1 queries discovered late | LOW-MEDIUM | Refactor fetch calls to use nested select; targeted fix per page |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| RLS enabled with no policies | Foundation: data model + auth | RLS audit query against `pg_tables` |
| RBAC in `user_metadata` | Foundation: auth + roles | Check RLS policy definitions reference `profiles` not `user_metadata` |
| Fork snapshot not taken at fork time | Foundation: data model | `SELECT original_content FROM forked_prompts` returns non-null values |
| Status stored as booleans | Foundation: data model | Schema inspection shows single `status` enum column |
| Shared demo account | Foundation: auth | Two incognito sessions create isolated forks |
| N+1 queries | Library + engagement views phase | Browser network tab shows ≤3 requests per page load |
| Tiptap SSR hydration | Prompt editing phase | No React hydration warnings in browser console |
| Diff against live parent (not snapshot) | Merge/review phase | Edit parent post-fork, confirm diff unchanged |
| JWT role caching after role change | Auth + RBAC phase | Change role in DB, verify user must re-auth to see new permissions |
| RLS on unindexed columns | Data model phase | `EXPLAIN ANALYZE` on key queries; all policy columns indexed |

---

## Sources

- [Supabase RLS Docs — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) (HIGH confidence)
- [Supabase Custom Claims & RBAC Docs](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) (HIGH confidence)
- [Supabase Next.js SSR Auth Setup](https://supabase.com/docs/guides/auth/server-side/nextjs) (HIGH confidence)
- [Supabase Anonymous Sign-ins](https://supabase.com/docs/guides/auth/auth-anonymous) (HIGH confidence)
- [Fixing RLS Misconfigurations — ProsperaSoft](https://prosperasoft.com/blog/database/supabase/supabase-rls-issues/) (MEDIUM confidence)
- [CVE-2025-29927: Next.js Middleware Authorization Bypass — Datadog Security Labs](https://securitylabs.datadoghq.com/articles/nextjs-middleware-auth-bypass/) (HIGH confidence — official CVE disclosure)
- [Supabase Performance Advisor — RLS Init Plan](https://supabase.com/docs/guides/database/database-advisors?queryGroups=lint&lint=0003_auth_rls_initplan) (HIGH confidence)
- [Git-Like Versioning in Postgres — Specfy Blog](https://www.specfy.io/blog/7-git-like-versioning-in-postgres) (MEDIUM confidence)
- [react-diff-viewer-continued — GitHub](https://github.com/Aeolun/react-diff-viewer-continued) (MEDIUM confidence)
- [Tiptap Next.js SSR Setup](https://tiptap.dev/docs/editor/getting-started/install/nextjs) (HIGH confidence)
- [Supabase Seeding Docs](https://supabase.com/docs/guides/local-development/seeding-your-database) (HIGH confidence)

---
*Pitfalls research for: Upstream — prompt management system with fork/merge workflow*
*Researched: 2026-03-25*
