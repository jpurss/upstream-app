---
description: Phase 4 research for Upstream Merge Workflow — implementation patterns, RLS gaps, data flow, component reuse strategy, and validation architecture for the suggest-merge and admin review flows.
date_last_edited: 2026-03-26
---

# Phase 4: Merge Workflow - Research

**Researched:** 2026-03-26
**Domain:** Next.js 16 App Router + Supabase RLS + React Server Actions + existing component library
**Confidence:** HIGH — all findings sourced directly from live codebase and deployed schema

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Suggest Merge Flow**
- D-01: "Suggest Merge" button lives in the fork sidebar as a new section at the bottom (after fork date). Consistent with the sidebar-as-actions pattern established in Phase 3.
- D-02: Clicking "Suggest Merge" opens a dialog with a single textarea: "Why should this be merged back?" Merge note only — the diff, effectiveness rating, feedback notes, and adaptation notes already exist on the fork and will be shown to the admin automatically.
- D-03: No gate on merge suggestion — consultants can suggest a merge at any time regardless of whether they've rated the fork. Rating is optional context, not a prerequisite. Lower friction.
- D-04: After submitting, the merge button is replaced by a status badge in the sidebar section. "Pending Review" (amber) while awaiting admin decision. If approved: "Merged ✓" (green). If declined: "Declined" (red) with the admin's reason visible, and the button re-enables so the consultant can revise and resubmit.

**Admin Review Queue**
- D-05: Dedicated `/review` page activated from the existing disabled "Review Queue" sidebar nav item. Admin-only — hidden from consultants.
- D-06: Rich context cards in the review queue showing: prompt title, who suggested the merge, which engagement, effectiveness rating (stars), fork date, merge note preview (truncated), and time since submission.
- D-07: Default view shows pending suggestions only. Filter tabs or dropdown to switch between Pending, Approved, Declined, or All.
- D-08: Sidebar "Review Queue" nav item shows a pending count badge. Admins can see at a glance if there's work to do.

**Review & Decision UX**
- D-09: Two-column layout for the review detail page: wide left column shows the side-by-side diff (reusing existing DiffViewer component). Narrow right sidebar shows: who suggested, engagement name, effectiveness rating, issue tags, feedback notes, merge note, and approve/decline action buttons.
- D-10: Admin can optionally edit the adapted content before approving. The review page includes an editable content area alongside the diff.
- D-11: Decline flow uses an inline reason textarea — clicking "Decline" expands a required textarea. Reason is stored and shown to the consultant on their fork sidebar.

**Post-Merge Behavior**
- D-12: On approve: library prompt content is replaced with the (possibly admin-edited) adapted content. Version number increments. A changelog entry is created in `prompt_changelog`.
- D-13: Consultant notification is status change on fork only — no push notifications, no toasts on login. Consultant sees updated merge status badge when they visit the fork detail page.

### Claude's Discretion

- Review queue card dimensions, spacing, and hover effects
- Review queue empty state design
- Merge suggestion dialog styling and validation
- Review detail page exact layout proportions
- Content editor component choice for admin edit-before-approve (inline textarea vs. full Write/Preview tabs)
- Loading skeletons for review queue and review detail
- Toast notifications for merge submission, approval, and decline confirmation
- URL structure for review routes (e.g., `/review`, `/review/[suggestionId]`)
- Filter tab/dropdown component choice for review queue status filter
- Badge count fetching strategy (server component vs. client polling)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MERGE-01 | User can suggest a merge back to the central library from a forked prompt with a merge note | MergeSuggestionSection component + `suggestMerge` server action in fork actions file; `merge_suggestion` and `merge_status` columns already on `forked_prompts` |
| MERGE-02 | Merge suggestion shows side-by-side diff of original vs adapted content | `DiffViewer` component already deployed and dark-themed; review detail page left column renders it with `leftTitle="Library (current)"` and `rightTitle="Fork (adapted)"` |
| MERGE-03 | Admin can view a review queue of pending merge suggestions with context (who suggested, which engagement, effectiveness rating) | `/review` route + `fetchMergeSuggestions` data function using admin client; RLS gap means admin client REQUIRED |
| MERGE-04 | Admin can approve a merge suggestion — updates central library prompt content, bumps version, creates changelog entry | `approveMerge` server action using admin client; three-step write: update `prompts.content` + bump `version`, insert into `prompt_changelog`, update `forked_prompts.merge_status = 'approved'` |
| MERGE-05 | Admin can decline a merge suggestion with a reason | `declineMerge` server action; stores reason in a new `merge_decline_reason` column OR inline in `merge_suggestion` field via structured JSON — see RLS Pitfall 1 below |

</phase_requirements>

---

## Summary

Phase 4 is primarily a wiring phase: the schema, the diff component, the sidebar structure, the admin auth pattern, and the two-column layout all already exist in the codebase. The implementation work is creating new routes (`/review`, `/review/[suggestionId]`), new server actions (`suggestMerge`, `approveMerge`, `declineMerge`), and new components that extend existing patterns.

**The single most important finding** is the RLS gap: the current `forked_prompts_own` policy allows access only to `forked_by = auth.uid()`. Admins using the regular Supabase client cannot read other users' forks. All admin review queries MUST use the admin client (service role), following the exact `getAdminUser()` pattern already established in `app/(app)/library/actions.ts`.

A second critical finding is that the `forked_prompts` table has no `merge_decline_reason` column. The schema has `merge_suggestion` (TEXT) for the consultant's note and `merge_status` (TEXT) for the lifecycle. A new column `merge_decline_reason TEXT` must be added via a migration before the decline action can store the admin's reason.

**Primary recommendation:** Build in three waves — (1) data layer + schema migration, (2) fork sidebar merge section, (3) admin review queue and detail pages.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.1 | App Router, Server Actions, Server Components | Already deployed |
| @supabase/ssr | ^0.9.0 | Supabase server client for Server Components and Actions | Already deployed |
| @supabase/supabase-js | ^2.100.0 | Admin client (service role) for RLS bypass | Already deployed |
| react-diff-viewer-continued | ^4.2.0 | Side-by-side diff rendering in review detail | Already deployed, dark-themed |
| sonner | ^2.0.7 | Toast notifications | Already deployed |
| nuqs | ^2.8.9 | URL state for review queue status filter | Already deployed |
| lucide-react | ^1.6.0 | Icons (GitMerge, Clock, Check, X, ChevronDown, ArrowLeft) | Already deployed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn Dialog | v4.1.0 | Merge suggestion dialog (NOT AlertDialog) | Consultant suggest merge flow only |
| shadcn Tabs | v4.1.0 | Review queue status filter (Pending/Approved/Declined/All) | Review queue page |
| shadcn Textarea | v4.1.0 | Merge note input, decline reason textarea | Both flows |
| shadcn Skeleton | v4.1.0 | Loading states for review queue cards | Review queue page |
| shadcn Tooltip | v4.1.0 | Full merge note on truncated card preview hover | Review queue card |

**No new packages required.** Every dependency is already installed.

---

## Architecture Patterns

### Recommended Project Structure (new files only)

```
app/(app)/review/
├── page.tsx                    # Server component — fetches pending suggestions list
├── loading.tsx                 # Skeleton loader for queue
└── [suggestionId]/
    ├── page.tsx                # Server component — fetches single merge suggestion detail
    └── loading.tsx             # Skeleton loader for detail

app/(app)/review/
└── actions.ts                  # Server actions: approveMerge, declineMerge

app/(app)/engagements/[id]/forks/[forkId]/
└── actions.ts                  # Extend EXISTING file: add suggestMerge action

components/review/
├── review-queue-card.tsx       # Rich context card (click → /review/[id])
├── review-detail-client.tsx    # Two-column client orchestrator
├── review-sidebar.tsx          # 280px sidebar with context + actions
├── review-content-editor.tsx   # Collapsible admin edit textarea
├── decline-reason-form.tsx     # Inline expanding decline form
└── pending-count-badge.tsx     # Numeric badge for sidebar nav

components/engagements/
└── merge-suggestion-section.tsx # Fork sidebar Section 8 (new component)

lib/data/
└── merge-suggestions.ts        # Data access: fetchMergeSuggestions, fetchMergeSuggestionById, countPendingMerges

lib/types/
└── merge.ts                    # MergeSuggestion type (extended fork view)

supabase/migrations/
└── 003_merge_decline_reason.sql # ADD COLUMN merge_decline_reason TEXT to forked_prompts
```

### Pattern 1: Admin Data Fetch with Service Role Client

The review queue MUST use the admin client because RLS `forked_prompts_own` restricts access to `forked_by = auth.uid()`. Admins using the regular client cannot read other users' forks.

```typescript
// lib/data/merge-suggestions.ts
import { createAdminClient } from '@/lib/supabase/admin'

export type MergeSuggestion = {
  id: string
  merge_status: string
  merge_suggestion: string | null
  merge_decline_reason: string | null
  adapted_content: string
  original_content: string
  effectiveness_rating: number | null
  issues: string[]
  feedback_notes: string | null
  adaptation_notes: string | null
  forked_at: string
  forked_by: string
  source_prompt_id: string
  engagement_id: string
  // joined fields
  source_prompt_title: string
  source_prompt_content: string
  source_prompt_version: number
  submitter_name: string
  engagement_name: string
}

export async function fetchMergeSuggestions(
  status: 'pending' | 'approved' | 'declined' | 'all' = 'pending'
): Promise<MergeSuggestion[]> {
  const supabase = createAdminClient() // service role — bypasses RLS

  let query = supabase
    .from('forked_prompts')
    .select(`
      *,
      prompts!source_prompt_id(title, content, version),
      profiles!forked_by(name),
      engagements!engagement_id(name)
    `)
    .neq('merge_status', 'none') // only forks that have been submitted
    .order('forked_at', { ascending: false })

  if (status !== 'all') {
    query = query.eq('merge_status', status)
  }

  const { data, error } = await query
  if (error) return []

  return (data ?? []).map((f: any) => ({
    ...f,
    source_prompt_title: f.prompts?.title ?? 'Unknown',
    source_prompt_content: f.prompts?.content ?? '',
    source_prompt_version: f.prompts?.version ?? 1,
    submitter_name: f.profiles?.name ?? 'Unknown',
    engagement_name: f.engagements?.name ?? 'Unknown',
    prompts: undefined,
    profiles: undefined,
    engagements: undefined,
  }))
}

export async function fetchMergeSuggestionById(id: string): Promise<MergeSuggestion | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('forked_prompts')
    .select(`
      *,
      prompts!source_prompt_id(title, content, version),
      profiles!forked_by(name),
      engagements!engagement_id(name, id)
    `)
    .eq('id', id)
    .not('merge_status', 'eq', 'none')
    .single()

  if (error || !data) return null
  return { /* same mapping */ } as MergeSuggestion
}

export async function countPendingMerges(): Promise<number> {
  const supabase = createAdminClient()
  const { count } = await supabase
    .from('forked_prompts')
    .select('id', { count: 'exact', head: true })
    .eq('merge_status', 'pending')
  return count ?? 0
}
```

### Pattern 2: suggestMerge Server Action (Consultant-Owned)

The suggest action uses the REGULAR client because the consultant is writing to their own fork (`forked_prompts_own` allows `FOR ALL` to `forked_by = auth.uid()`).

```typescript
// Extend app/(app)/engagements/[id]/forks/[forkId]/actions.ts

export async function suggestMerge(forkId: string, mergeNote: string) {
  const ctx = await getAuthenticatedUser()
  if (!ctx) return { error: 'Unauthorized' }
  const { supabase } = ctx

  const { error } = await supabase
    .from('forked_prompts')
    .update({
      merge_status: 'pending',
      merge_suggestion: mergeNote,
      merge_decline_reason: null, // clear any prior decline reason
    })
    .eq('id', forkId)

  if (error) return { error: error.message }
  revalidatePath(`/engagements`) // path includes forkId route
  return { success: true }
}
```

### Pattern 3: approveMerge Server Action (Admin, Three-Step Write)

Three writes must succeed atomically — use sequential awaits with explicit error checking. No Postgres transaction wrapper needed at this scale; if step 2 or 3 fails, the version bump has already happened, so step 3 (status update) is idempotent on retry.

```typescript
// app/(app)/review/actions.ts

export async function approveMerge(
  forkId: string,
  promptId: string,
  approvedContent: string,
  mergeNote: string
) {
  const adminCtx = await getAdminUser()
  if (!adminCtx) return { error: 'Unauthorized' }
  const { user, supabase } = adminCtx // supabase = admin client

  // Step 1: fetch current prompt version
  const { data: prompt, error: fetchError } = await supabase
    .from('prompts')
    .select('version, content')
    .eq('id', promptId)
    .single()
  if (fetchError || !prompt) return { error: 'Prompt not found' }

  const newVersion = (prompt.version ?? 1) + 1

  // Step 2: update prompt content + bump version
  const { error: updateError } = await supabase
    .from('prompts')
    .update({ content: approvedContent, version: newVersion })
    .eq('id', promptId)
  if (updateError) return { error: updateError.message }

  // Step 3: create changelog entry
  await supabase.from('prompt_changelog').insert({
    prompt_id: promptId,
    version: newVersion,
    change_description: mergeNote || 'Merged from field fork',
    previous_content: prompt.content,
    changed_by: user.id,
  })

  // Step 4: update fork status
  await supabase
    .from('forked_prompts')
    .update({ merge_status: 'approved' })
    .eq('id', forkId)

  revalidatePath('/review')
  revalidatePath(`/library/${promptId}`)
  return { success: true }
}
```

### Pattern 4: declineMerge Server Action

```typescript
export async function declineMerge(forkId: string, reason: string) {
  const adminCtx = await getAdminUser()
  if (!adminCtx) return { error: 'Unauthorized' }
  const { supabase } = adminCtx

  const { error } = await supabase
    .from('forked_prompts')
    .update({
      merge_status: 'declined',
      merge_decline_reason: reason,
    })
    .eq('id', forkId)

  if (error) return { error: error.message }
  revalidatePath('/review')
  return { success: true }
}
```

### Pattern 5: Review Queue Page (Server Component)

```typescript
// app/(app)/review/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchMergeSuggestions } from '@/lib/data/merge-suggestions'

export default async function ReviewQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  // Admin gate — server-side check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.app_metadata?.role
  const isAnonymous = user?.is_anonymous ?? false
  const demoRole = isAnonymous ? user?.user_metadata?.demo_role : null
  const effectiveRole = role ?? demoRole
  if (effectiveRole !== 'admin') redirect('/engagements')

  const { status = 'pending' } = await searchParams
  const suggestions = await fetchMergeSuggestions(status as any)

  return <ReviewQueueClient suggestions={suggestions} currentStatus={status} />
}
```

### Pattern 6: Pending Count Badge in Sidebar

The sidebar currently receives `userRole` from the layout. To show a pending count, the layout needs to fetch it from `countPendingMerges()` when the user is admin, then pass it down to `AppSidebar`.

**Implementation approach:** Extend `AppSidebarProps` with an optional `pendingMergeCount?: number`. The layout calls `countPendingMerges()` only when `effectiveRole === 'admin'`. The sidebar renders the badge inline next to "Review Queue" text.

```typescript
// In app/(app)/layout.tsx — add after effectiveRole is computed:
let pendingMergeCount = 0
if (effectiveRole === 'admin') {
  pendingMergeCount = await countPendingMerges()
}
// Pass to AppSidebar:
<AppSidebar ... pendingMergeCount={pendingMergeCount} />
```

### Pattern 7: MergeSuggestionSection Component

Reads `fork.merge_status` and `fork.merge_decline_reason` to determine which render state to show. Uses `useTransition` for optimistic dialog submit.

```typescript
// components/engagements/merge-suggestion-section.tsx
'use client'
// State: 'none' | 'pending' | 'approved' | 'declined'
// Props: fork (ForkedPromptWithTitle), engagementId (string)
// Renders:
//   merge_status === 'none': Dialog trigger button
//   merge_status === 'pending': Amber badge
//   merge_status === 'approved': Teal badge
//   merge_status === 'declined': Red badge + decline reason + "Revise & resubmit" link
```

### Anti-Patterns to Avoid

- **Using regular Supabase client in admin review queries:** The `forked_prompts_own` RLS policy restricts access to `forked_by = auth.uid()`. Admin client MUST be used in `lib/data/merge-suggestions.ts` and `app/(app)/review/actions.ts`.
- **Passing `merge_decline_reason` to client before migration:** The column does not exist until migration `003_merge_decline_reason.sql` runs.
- **Routing the review queue through the existing engagements layout segment:** Reviews live at `/review/`, not under `/engagements/`. The `app/(app)/review/` route group shares the same `app/(app)/layout.tsx` wrapper (which provides AppSidebar + NuqsAdapter).
- **Triggering `revalidatePath` for the fork detail without knowing the engagement ID:** In `approveMerge` and `declineMerge`, the fork detail page path is `engagements/[id]/forks/[forkId]` — pass the engagement ID through or use `revalidatePath('/engagements', 'layout')` to bust the entire engagements segment cache.
- **Using AlertDialog for the merge suggestion dialog:** The deprecation dialog uses AlertDialog (destructive confirmation pattern). The merge dialog is NOT destructive — use standard `Dialog` from shadcn.
- **Polling for pending count:** The pending count badge is fetched server-side at layout render time. It is a static snapshot per page load. Real-time polling is explicitly out of scope (D-13). When admin approves/declines, `revalidatePath('/review')` busts the layout cache and the badge updates on next nav.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Side-by-side diff rendering | Custom diff algorithm | `react-diff-viewer-continued` (already deployed) | Handles line-by-line diff, word diff, dark theme, gutter — edge cases abound |
| Admin auth gate | Per-action role check from scratch | `getAdminUser()` from `app/(app)/library/actions.ts` | Pattern already established; handles real users + anonymous demo admin |
| Toast feedback | Custom notification system | `sonner` (already deployed) | One-liner: `toast.success('...')` |
| URL state for filter tabs | `useState` + URL sync | `nuqs` `useQueryState` (already deployed) | Bookmarkable, browser back button support |
| Textarea resize | Custom resize logic | `resize-none` + `min-h-[Xpx]` Tailwind | Matches all other textareas in the app |

**Key insight:** Phase 4 reuses more than it creates. The entire data model, auth pattern, admin client, diff component, sidebar structure, and two-column layout template are already in production. The planner should treat each new task as "wire this existing piece to this new route."

---

## Critical Schema Gap

### Missing Column: `merge_decline_reason`

The deployed `forked_prompts` table has:
- `merge_status TEXT DEFAULT 'none'` — lifecycle field
- `merge_suggestion TEXT` — consultant's merge note

**It does NOT have a `merge_decline_reason` column.** Without this, `declineMerge` cannot store the admin's reason, and MERGE-05 cannot be met.

**Required migration:**

```sql
-- supabase/migrations/003_merge_decline_reason.sql
ALTER TABLE forked_prompts ADD COLUMN merge_decline_reason TEXT;
```

This migration must be the FIRST task in Wave 1 (before any component or action code is written that references the column).

**Also update `lib/types/fork.ts`:** Add `merge_decline_reason: string | null` to `ForkedPrompt` type.

---

## RLS Gap Analysis

| Operation | Actor | Client Type | RLS Policy | Notes |
|-----------|-------|-------------|------------|-------|
| `suggestMerge` — UPDATE own fork | Consultant | Regular (`createClient()`) | `forked_prompts_own` (FOR ALL, forked_by = uid) | Allowed — consultant writes to their own row |
| `fetchMergeSuggestions` — SELECT all pending | Admin | Admin (`createAdminClient()`) | Bypasses RLS (service role) | REQUIRED — admin cannot access other users' forks via regular client |
| `fetchMergeSuggestionById` | Admin | Admin | Bypasses RLS | Same as above |
| `approveMerge` — UPDATE prompt | Admin | Admin | `prompts_write_admin` would allow this, but use admin client for consistency | Admin client already used in `getAdminUser()` |
| `approveMerge` — INSERT changelog | Admin | Admin | No write policy on `prompt_changelog` for authenticated — only read. Must use service role. | Critical: no write RLS policy exists for `prompt_changelog` |
| `approveMerge` — UPDATE fork status | Admin | Admin | `forked_prompts_own` would BLOCK this (admin != fork owner). Must use service role. | Critical: admin cannot update consultant's fork via regular client |
| `declineMerge` — UPDATE fork status | Admin | Admin | Same as above — service role required | Critical |
| `countPendingMerges` — SELECT count | Admin | Admin | Regular client would return 0 (no own forks with pending status). Must use service role. | Admin client required |

**Summary:** All admin operations on `forked_prompts` and `prompt_changelog` MUST use the admin client. There is no RLS policy granting admins write access to these tables via the regular authenticated role.

---

## Common Pitfalls

### Pitfall 1: Regular Client Returns Empty Review Queue
**What goes wrong:** Admin fetches `forked_prompts` with `merge_status = 'pending'` using `createClient()`. The `forked_prompts_own` policy filters to `forked_by = auth.uid()`. If the admin has no pending suggestions on their own forks, the query returns empty.
**Why it happens:** The RLS policy was designed for consultants, not admins. There is no separate admin read policy on `forked_prompts`.
**How to avoid:** Use `createAdminClient()` (service role) for ALL reads in `lib/data/merge-suggestions.ts`.
**Warning signs:** Review queue page always shows empty state regardless of submitted suggestions.

### Pitfall 2: Admin Can't Update Consultant's Fork Status
**What goes wrong:** `approveMerge` tries `supabase.from('forked_prompts').update({ merge_status: 'approved' }).eq('id', forkId)` using the regular authenticated client. The RLS policy blocks the write because `forked_by != admin_uid`.
**Why it happens:** `forked_prompts_own` is `FOR ALL TO authenticated USING (forked_by = auth.uid())`. Admins are authenticated users — the policy applies.
**How to avoid:** `approveMerge` and `declineMerge` must use `getAdminUser()` which returns the admin client.
**Warning signs:** `{ error: 'new row violates row-level security policy' }` or silent no-op update.

### Pitfall 3: prompt_changelog Has No Write RLS Policy
**What goes wrong:** Admin tries to insert a changelog entry using the regular authenticated client. The table has `prompt_changelog_read` policy (SELECT only for authenticated and anon) but no INSERT policy for authenticated users.
**Why it happens:** Only admins should write changelogs, and the existing approach for `prompts` writes uses the admin client. Changelog inserts were anticipated to follow the same pattern.
**How to avoid:** Always use the admin client from `getAdminUser()` when inserting into `prompt_changelog`.
**Warning signs:** Changelog insert returns RLS error; version increments but no changelog row appears.

### Pitfall 4: Stale Fork Status on Return Visit
**What goes wrong:** Consultant submits a merge suggestion. Admin approves it. Consultant visits the fork detail page and still sees "Pending Review" badge.
**Why it happens:** The fork detail page is cached. `approveMerge` calls `revalidatePath('/review')` but doesn't bust the fork detail cache.
**How to avoid:** In `approveMerge` and `declineMerge`, also call `revalidatePath('/engagements', 'layout')` to bust the entire engagements segment, OR call `revalidatePath` with the specific fork URL if the engagement ID is available.
**Warning signs:** Badge shows wrong status after admin decision.

### Pitfall 5: DiffViewer Receives Identical Content
**What goes wrong:** A fork where `adapted_content === original_content` renders the DiffViewer empty state: "No changes yet. Edit in Write mode to see a diff." This is confusing in the review context — the admin doesn't have a Write mode.
**Why it happens:** `DiffViewer` has an explicit guard: `if (original === adapted) return <empty state>`. The empty state copy references "Write mode" which doesn't exist in the review detail page.
**How to avoid:** The review detail DiffViewer should pass different `leftTitle`/`rightTitle` props. Consider whether to allow suggesting a merge with no diff (currently not gated). If the diff is empty, show a contextual message instead of the fork editor's empty state copy.
**Warning signs:** Review detail shows "No changes yet. Edit in Write mode" when the fork has no adaptations.

### Pitfall 6: Sidebar Active State for `/review/*` Routes
**What goes wrong:** When navigating to `/review/[suggestionId]`, the "Review Queue" nav item is not highlighted because `pathname.startsWith('/review')` is checked, but the nav item is currently `enabled: false` and renders as `aria-disabled`. It won't register the `isActive` state.
**Why it happens:** Phase 1 placed Review Queue in the nav as a disabled placeholder. Phase 4 must change `enabled: true` for admin users.
**How to avoid:** When activating the Review Queue nav item in `app-sidebar.tsx`, update the `enabled` field to `true`. The existing `pathname.startsWith(item.href)` logic in `SidebarMenuButton` then works correctly.
**Warning signs:** User is on `/review` but nav shows no active state.

### Pitfall 7: `merge_decline_reason` Column Not Yet in TypeScript Types
**What goes wrong:** After running the migration, code tries to read `fork.merge_decline_reason` but `ForkedPrompt` type in `lib/types/fork.ts` doesn't include it. TypeScript errors or `undefined` at runtime.
**How to avoid:** Wave 1 must update `ForkedPromptWithTitle` (and base `ForkedPrompt`) to add `merge_decline_reason: string | null` before any component code references it.

---

## Code Examples

### Status Badge Render Pattern

```typescript
// In MergeSuggestionSection — status-driven render
const statusConfig = {
  pending: {
    bg: 'bg-[#FFB852]/15',
    text: 'text-[#FFB852]',
    icon: Clock,
    label: 'Pending Review',
  },
  approved: {
    bg: 'bg-[#65CFB2]/15',
    text: 'text-[#65CFB2]',
    icon: Check,
    label: 'Merged',
  },
  declined: {
    bg: 'bg-[#E3392A]/15',
    text: 'text-[#E3392A]',
    icon: X,
    label: 'Declined',
  },
}

// Render:
const config = statusConfig[mergeStatus as keyof typeof statusConfig]
return (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[13px] ${config.bg} ${config.text}`}>
    <config.icon className="size-3" />
    {config.label}
  </span>
)
```

### Dialog vs AlertDialog Decision

```typescript
// CORRECT: merge suggestion dialog uses Dialog (not AlertDialog)
// AlertDialog is for destructive confirmations (deprecation-dialog.tsx)
// Dialog is for form-style interactions

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog'

// INCORRECT: don't use AlertDialog for merge suggestion
// AlertDialog pattern = "Are you sure you want to delete X?" — wrong semantics
```

### Activation of "Review Queue" Nav Item

```typescript
// In app-sidebar.tsx — change Review Queue item from enabled:false to:
{
  title: 'Review Queue',
  icon: GitPullRequestArrow,
  href: '/review',
  enabled: true,  // ← change this
  adminOnly: true,
  phase: 4
}
// The adminOnly:true ensures consultants never see this item.
// The visibleItems filter already handles this.
```

---

## Environment Availability

Step 2.6: SKIPPED — this phase is purely code/config changes. All external dependencies (Supabase, Node.js 25, Next.js 16) already confirmed active in the running project. The only infrastructure change is a SQL migration to add one column, which runs against the already-connected Supabase instance.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.1 + @testing-library/react |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MERGE-01 | `suggestMerge` server action updates `merge_status='pending'` and `merge_suggestion` | unit | `npm test -- tests/merge-suggest.test.ts` | ❌ Wave 0 |
| MERGE-01 | `suggestMerge` returns `{ error: 'Unauthorized' }` for unauthenticated | unit | `npm test -- tests/merge-suggest.test.ts` | ❌ Wave 0 |
| MERGE-02 | `DiffViewer` renders left/right titles as passed props | unit | `npm test -- tests/merge-diff.test.tsx` | ❌ Wave 0 |
| MERGE-03 | `fetchMergeSuggestions` uses admin client (verifiable via mock) | unit | `npm test -- tests/merge-data.test.ts` | ❌ Wave 0 |
| MERGE-03 | Review queue page redirects non-admin to `/engagements` | unit | `npm test -- tests/review-queue.test.ts` | ❌ Wave 0 |
| MERGE-04 | `approveMerge` bumps prompt version, inserts changelog, updates fork status | unit | `npm test -- tests/merge-approve.test.ts` | ❌ Wave 0 |
| MERGE-04 | `approveMerge` returns `{ error: 'Unauthorized' }` for consultant | unit | `npm test -- tests/merge-approve.test.ts` | ❌ Wave 0 |
| MERGE-05 | `declineMerge` sets `merge_status='declined'` and stores reason | unit | `npm test -- tests/merge-decline.test.ts` | ❌ Wave 0 |
| MERGE-05 | `declineMerge` returns `{ error: 'Unauthorized' }` for consultant | unit | `npm test -- tests/merge-decline.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/merge-suggest.test.ts` — covers MERGE-01 (server action unit tests)
- [ ] `tests/merge-data.test.ts` — covers MERGE-03 (data layer, verifies admin client usage)
- [ ] `tests/review-queue.test.ts` — covers MERGE-03 (admin gate redirect)
- [ ] `tests/merge-approve.test.ts` — covers MERGE-04 (three-step write, version bump)
- [ ] `tests/merge-decline.test.ts` — covers MERGE-05 (decline reason storage)
- [ ] `tests/merge-diff.test.tsx` — covers MERGE-02 (DiffViewer props)

Test mock pattern is established in `tests/library-deprecate.test.tsx`. All new tests follow the same vi.mock pattern for `@/lib/supabase/server`, `@/lib/supabase/admin`, `next/cache`, `next/navigation`, and `sonner`.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| N/A — phase is new | All patterns established in Phases 1-3 | — | Build directly on existing patterns |
| `middleware.ts` naming | `proxy.ts` naming | Next.js 16 | Already handled — do not create middleware.ts |
| `auth.role()` in RLS | `auth.jwt()->'app_metadata'->>'role'` | Phase 1 decision | Already deployed — follow same pattern |

---

## Open Questions

1. **Can a fork have multiple merge suggestions over time (resubmission after decline)?**
   - What we know: D-04 says the button re-enables after decline, implying resubmission is intended.
   - What's unclear: The schema uses a single `merge_suggestion` column — resubmission overwrites the previous note. Decline reason is also a single column. This means the fork can only track ONE merge suggestion lifecycle at a time.
   - Recommendation: This is acceptable for v1. The `suggestMerge` action must reset `merge_decline_reason = null` when resubmitting (included in Pattern 2 above).

2. **What happens to the pending count badge if the admin is also the fork owner (edge case in demo)?**
   - What we know: The demo admin logs in anonymously. Their forks (if any) would show up in the admin's review queue.
   - What's unclear: Should admins be able to review their own fork suggestions? No gate exists in the schema.
   - Recommendation: Accept this edge case for v1. The `countPendingMerges` query includes all pending forks from any user, including the admin if they ever submitted one.

3. **Should the review detail page use `nuqs` for the `contentEditorOpen` state?**
   - What we know: The content editor starts collapsed (D-10). Claude's Discretion allows URL structure choice.
   - Recommendation: Use local `useState` — the editor state doesn't need to survive navigation or page reload. `nuqs` is reserved for filter state that should be bookmarkable (the status filter on review queue). Matches the `PromptPickerModal` precedent.

---

## Sources

### Primary (HIGH confidence)
- Live codebase: `supabase/migrations/001_initial_schema.sql` — schema, RLS policies
- Live codebase: `components/engagements/diff-viewer.tsx` — DiffViewer props and dark theme implementation
- Live codebase: `components/engagements/fork-sidebar.tsx` — Section structure, autosave patterns
- Live codebase: `components/engagements/fork-detail-client.tsx` — Two-column layout dimensions
- Live codebase: `app/(app)/library/actions.ts` — `getAdminUser()` pattern
- Live codebase: `components/app-sidebar.tsx` — nav item structure, role-based filtering
- Live codebase: `lib/data/forks.ts` — Supabase join query patterns
- Live codebase: `lib/types/fork.ts` — ForkedPrompt type (confirms missing `merge_decline_reason`)
- Live codebase: `package.json` — confirmed all dependencies already installed
- Live codebase: `tests/library-deprecate.test.tsx` — established test mock pattern

### Secondary (MEDIUM confidence)
- `04-CONTEXT.md` — D-01 through D-13 locked decisions
- `04-UI-SPEC.md` — component inventory, interaction contracts, copy

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified in package.json
- Architecture: HIGH — patterns directly derived from deployed codebase
- RLS analysis: HIGH — verified against live migration SQL
- Pitfalls: HIGH — derived from actual RLS policy text and existing code patterns
- Test structure: HIGH — vitest.config.ts verified, existing test files provide exact mock patterns

**Research date:** 2026-03-26
**Valid until:** Stable — no external dependencies; only changes if schema migrations are added before planning completes
