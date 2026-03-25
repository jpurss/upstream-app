---
description: Research for Phase 3 Engagement Workspace — engagement CRUD, fork creation, autosave, diff viewer, role-based landing, and test architecture. Resolves the STATE.md diff viewer dark mode blocker.
date_last_edited: 2026-03-25
---

# Phase 3: Engagement Workspace — Research

**Researched:** 2026-03-25
**Domain:** Next.js 16 App Router / Supabase RLS / react-diff-viewer-continued / autosave patterns / shadcn base-nova
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01** Consultants land on Engagements page after login. Admins land on Library page. Overrides Phase 1 D-07 for consultants only.

**D-02** Card grid layout for the engagement list. Each card shows: name, client name, industry badge, status dot (colored), fork count, last activity relative date.

**D-03** "New Engagement" button in page header — secondary-style when engagements exist; hero CTA in empty state.

**D-04** Empty state: centered Briefcase icon, "Create your first engagement" headline, brief explainer, prominent "New Engagement" CTA, subtle "or Browse the Library →" link.

**D-05** Create engagement is a modal dialog with 3 fields: Name, Client Name, Industry (dropdown). Stays on engagements page.

**D-06** After creating an engagement, optional second step shows a prompt picker to bootstrap with initial forks. User can skip.

**D-07** Workspace header shows: engagement name (H1), client name, industry badge, status dropdown, fork count chip, avg effectiveness display.

**D-08** Status changes via inline dropdown in workspace header. Completing triggers an AlertDialog confirmation.

**D-09** Forked prompts displayed as a card grid within the workspace. "+ Fork a Prompt" button in the workspace header area.

**D-10** Fork cards are minimal work-status trackers — show prompt title, customization status, adaptation status, last edited date. Not prompt previews.

**D-11** Click a fork card to navigate to the fork detail page.

**D-12** Fork entry point 1: "Fork to Engagement" button on prompt detail sidebar. Opens dialog listing active engagements.

**D-13** Fork entry point 2: "+ Fork a Prompt" in workspace. Full-screen modal with mini library browse (searchable, filterable card grid). Reuses LibraryGrid filtering logic.

**D-14** Fork entry point 3: Optional prompt picker step during engagement creation (D-06).

**D-15** If no active engagements when forking from prompt detail, show "No active engagements" with inline "Create one" link.

**D-16** Prevent duplicate forks — if already forked into the selected engagement, show as "Already forked" (grayed out). One fork per prompt per engagement.

**D-17** Fork detail page at `/engagements/[id]/forks/[forkId]`. Two-column layout: wide markdown editor left, narrow metadata sidebar right.

**D-18** Autosave with 1.5-second debounce. Subtle "Saving..." / "Saved" indicator. No explicit save button.

**D-19** Write/Preview tabs reuse the Phase 2 pattern. Diff is a third tab.

**D-20** Back link at top: "← Back to [Engagement Name]"

**D-21** Sidebar: effectiveness rating (5 stars), issue tags (toggle badges), feedback notes textarea, client context checkbox, adaptation notes textarea, source prompt link, fork date.

**D-22** Issue tags as clickable badge toggles: hallucination, too_verbose, wrong_format, model_degradation, needs_context. Autosave on toggle.

**D-23** Freeform feedback notes textarea below issue tags. Autosave.

**D-24** Diff is the third tab. Side-by-side: original_content (at fork time) left, adapted_content right.

**D-25** Side-by-side layout (not unified). "Original" and "Adapted" column headers.

### Claude's Discretion

- Diff library choice (react-diff-viewer-continued, @git-diff-view/react, or similar — check dark mode theming per STATE.md blocker)
- Engagement card dimensions, spacing, and hover effects
- Fork card visual design for customization/adaptation status indicators
- Prompt picker modal layout details and filter subset
- Industry dropdown values
- Autosave debounce timing (1-2 seconds range)
- Loading skeletons for engagement list, workspace, and fork detail
- Toast notifications for fork creation success
- URL structure for engagement routes beyond `/engagements/[id]/forks/[forkId]`

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ENG-01 | User can create an engagement with name, client name, and industry | Modal dialog pattern from D-05; Supabase insert into `engagements` table with `engagements_own` RLS; `createEngagement` server action |
| ENG-02 | User can view list of their engagements with status indicators | Server component fetching `engagements` + JOIN for fork count; card grid pattern from Phase 2 LibraryGrid |
| ENG-03 | User can view engagement workspace showing all forked prompts for that engagement | Server component fetching `forked_prompts WHERE engagement_id = $id`; fork card grid component |
| ENG-04 | User can mark an engagement as completed or paused | Inline status dropdown in workspace header; AlertDialog confirmation for "completed"; `updateEngagementStatus` server action |
| FORK-01 | User can fork a prompt into an engagement (creates snapshot at fork time) | `createFork` server action copies `prompts.content` into `forked_prompts.original_content` AND `adapted_content` at insert time; increments `total_checkouts` on parent |
| FORK-02 | User can edit forked prompt adapted content with markdown editor | ForkEditor component with Write/Preview/Diff tabs; autosave via debounced server action `updateForkContent`; mirrors Phase 2 MarkdownPreview pattern |
| FORK-03 | User can add adaptation notes explaining what was changed and why | Sidebar textarea with 1.5s debounce autosave; `updateForkMeta` server action |
| FORK-04 | User can flag a fork as containing client-specific context | Checkbox in sidebar; `updateForkMeta` server action with `contains_client_context: boolean` |
| FORK-05 | User can rate a forked prompt's effectiveness (1-5 stars) with 1-2 clicks | StarRating component — click any star to set; autosave on click; `updateForkRating` server action also updates `avg_effectiveness` on parent prompt |
| FORK-06 | User can add feedback notes and issue tags to a fork | IssueTagGroup component (toggle badges, autosave); feedback notes textarea (autosave); `updateForkFeedback` server action |
| FORK-07 | User can view diff between original content at fork time and adapted version | DiffViewer component wrapping react-diff-viewer-continued with `useDarkTheme={true}` and `splitView={true}`; reads `original_content` vs `adapted_content` from fork row |
</phase_requirements>

---

## Summary

Phase 3 builds the core engagement workspace on top of a fully deployed schema — `engagements`, `engagement_members`, and `forked_prompts` tables are live with correct RLS policies. No schema migration is needed. The key technical challenges are: (1) autosave architecture across multiple independent fields without race conditions, (2) diff viewer dark mode theming, and (3) a multi-step fork creation modal that reuses the existing LibraryGrid.

The diff viewer STATE.md blocker is **resolved**: `react-diff-viewer-continued` v4.2.0 has an explicit `useDarkTheme` prop and a `styles` override object for fine-grained CSS control. Pass `useDarkTheme={true}` and override `variables.dark` to match the zinc-950/900 palette. No need for the `@git-diff-view/react` fallback.

The autosave pattern should use per-field server actions (not a single "save all" action) with `useTransition` for non-blocking updates and `useCallback` + `useRef` for debounce management. Each field type — content textarea, rating click, tag toggle, checkboxes — autosaves independently. The `AutosaveIndicator` component tracks a shared "saving" flag via a context or prop-drilling from the parent ForkEditor/ForkSidebar pair.

**Primary recommendation:** Build data layer first (types + server actions), then page shells (engagement list, workspace, fork detail), then interactive components (autosave editor, star rating, diff viewer). This order means each task has clean dependencies and each task is independently testable.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.1 (installed) | App Router, server components, server actions | Already in project — no install |
| @supabase/ssr | 0.9.0 (installed) | Server/client Supabase clients | Already in project |
| react-diff-viewer-continued | 4.2.0 (npm) | Side-by-side diff viewer with dark mode support | Resolves STATE.md blocker; `useDarkTheme` prop confirmed |
| nuqs | 2.8.9 (installed) | URL state for prompt picker filters | Already in project; used in LibraryGrid |
| sonner | 2.0.7 (installed) | Toast notifications for fork success | Already in project |
| lucide-react | 1.6.0 (installed) | Icons (GitFork, Clock, Star, Briefcase, Plus, etc.) | Already in project |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-markdown + remark-gfm | installed | Markdown rendering in Preview tab | Fork detail Preview tab — same as Phase 2 |
| next-themes | installed | Dark mode detection | Pass `useDarkTheme={true}` to diff viewer; always true in this app |
| shadcn checkbox | latest | Client context toggle | Add via `npx shadcn@latest add checkbox` — not yet installed |
| shadcn dialog | latest | Create engagement, fork-to-engagement, prompt picker modals | Add via `npx shadcn@latest add dialog` — not yet installed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-diff-viewer-continued | @git-diff-view/react | git-diff-view/react v0.1.3 is very early; limited dark mode docs; react-diff-viewer-continued is more mature with explicit `useDarkTheme` prop |
| Server actions for autosave | Route handlers (API routes) | Server actions require no API route setup, work with `useTransition`, and are the established project pattern |
| Per-field autosave actions | Single "save all" action | Per-field prevents race conditions when multiple fields change in rapid succession; simpler retry logic |

**Installation (new packages only):**
```bash
npm install react-diff-viewer-continued
npx shadcn@latest add checkbox
npx shadcn@latest add dialog
```

**Version verification (run before writing Standard Stack):**
- react-diff-viewer-continued: `npm view react-diff-viewer-continued version` → 4.2.0 (verified 2026-03-25)
- @git-diff-view/react: `npm view @git-diff-view/react version` → 0.1.3 (too early, rejected)

---

## Architecture Patterns

### Recommended Project Structure

```
app/(app)/
├── engagements/
│   ├── page.tsx                        # Engagement list (server component)
│   ├── loading.tsx                     # Skeleton state
│   ├── actions.ts                      # createEngagement, updateEngagementStatus
│   └── [id]/
│       ├── page.tsx                    # Engagement workspace (server component)
│       ├── loading.tsx
│       ├── actions.ts                  # createFork(s)
│       └── forks/
│           └── [forkId]/
│               ├── page.tsx            # Fork detail (server component)
│               ├── loading.tsx
│               └── actions.ts         # updateForkContent, updateForkRating, updateForkFeedback, updateForkMeta

components/engagements/
├── engagement-card.tsx                 # Single engagement card
├── engagement-grid.tsx                 # Card grid + empty state
├── new-engagement-dialog.tsx           # Create modal + optional prompt picker step
├── workspace-header.tsx                # H1, client, status dropdown, fork count, avg effectiveness
├── fork-card.tsx                       # Work-status tracker card
├── fork-grid.tsx                       # Fork card grid + workspace empty state
├── fork-to-engagement-dialog.tsx       # From prompt detail sidebar
├── prompt-picker-modal.tsx             # Full-screen multi-select library browse
├── fork-editor.tsx                     # Write/Preview/Diff tabs with autosave
├── fork-sidebar.tsx                    # Orchestrates all sidebar sections
├── star-rating.tsx                     # 5-star amber rating with autosave
├── issue-tag-group.tsx                 # Toggle badge group with autosave
├── diff-viewer.tsx                     # Wrapper around react-diff-viewer-continued
└── autosave-indicator.tsx              # "Saving..." / "Saved" status display

lib/
├── data/
│   ├── engagements.ts                  # fetchUserEngagements, fetchEngagementById, fetchEngagementWithForkCount
│   └── forks.ts                        # fetchForksByEngagement, fetchForkById, checkDuplicateFork
└── types/
    ├── engagement.ts                   # Engagement, EngagementStatus types
    └── fork.ts                         # ForkedPrompt, IssueTag types
```

### Pattern 1: Server Component Initial Load + Client Autosave

**What:** Page server component fetches initial data and passes it to a client component that owns all autosave state.

**When to use:** Fork detail page — initial content loaded server-side (fast first paint), then all edits autosave client-side without full page reloads.

**Example:**
```typescript
// app/(app)/engagements/[id]/forks/[forkId]/page.tsx (Server Component)
export default async function ForkDetailPage({
  params,
}: {
  params: Promise<{ id: string; forkId: string }>
}) {
  const { id, forkId } = await params
  const fork = await fetchForkById(forkId)
  const engagement = await fetchEngagementById(id)
  if (!fork) notFound()

  return (
    <div className="flex flex-col h-full">
      <ForkDetailClient fork={fork} engagement={engagement} />
    </div>
  )
}

// components/engagements/fork-editor.tsx (Client Component)
'use client'
export function ForkEditor({ fork, onSavingChange }: ForkEditorProps) {
  const [content, setContent] = useState(fork.adapted_content ?? '')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleContentChange = (value: string) => {
    setContent(value)
    setSaveState('saving')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        await updateForkContent(fork.id, value)
        setSaveState('saved')
        setTimeout(() => setSaveState('idle'), 2000)
      })
    }, 1500)
  }
  // ...
}
```

### Pattern 2: Consultant User Helper (parallel to `getAdminUser`)

**What:** A `getConsultantUser()` helper in server actions that returns the authenticated user and their Supabase client. Since `forked_prompts_own` RLS uses `forked_by = auth.uid()`, consultant actions use the regular (not admin) client — RLS enforces ownership.

**When to use:** All server actions for engagements and forks. Consultants and admins can both fork.

**Example:**
```typescript
// app/(app)/engagements/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return { user, supabase }
}

export async function createEngagement(formData: FormData) {
  const ctx = await getAuthenticatedUser()
  if (!ctx) return { error: 'Unauthorized' }

  const { user, supabase } = ctx
  const { data, error } = await supabase
    .from('engagements')
    .insert({
      name: formData.get('name') as string,
      client_name: formData.get('client_name') as string,
      industry: formData.get('industry') as string,
      created_by: user.id,
      status: 'active',
    })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/engagements')
  return { success: true, engagement: data }
}
```

### Pattern 3: Fork Creation with Snapshot

**What:** At fork time, copy `prompts.content` (current version) into both `original_content` AND `adapted_content`. The `original_content` column never changes — it is the immutable snapshot for diff. Also increment `prompts.total_checkouts`.

**When to use:** All three fork entry points call this same server action.

**Example:**
```typescript
// app/(app)/engagements/[id]/actions.ts
export async function createFork(promptId: string, engagementId: string) {
  const ctx = await getAuthenticatedUser()
  if (!ctx) return { error: 'Unauthorized' }
  const { user, supabase } = ctx

  // 1. Fetch the source prompt
  const { data: prompt } = await supabase
    .from('prompts')
    .select('content, version')
    .eq('id', promptId)
    .single()
  if (!prompt) return { error: 'Prompt not found' }

  // 2. Check for duplicate fork
  const { data: existing } = await supabase
    .from('forked_prompts')
    .select('id')
    .eq('source_prompt_id', promptId)
    .eq('engagement_id', engagementId)
    .single()
  if (existing) return { error: 'Already forked into this engagement' }

  // 3. Create the fork — snapshot content in BOTH columns
  const { data: fork, error } = await supabase
    .from('forked_prompts')
    .insert({
      source_prompt_id: promptId,
      source_version: prompt.version,
      engagement_id: engagementId,
      original_content: prompt.content,   // IMMUTABLE SNAPSHOT
      adapted_content: prompt.content,    // Starting point for edits
      forked_by: user.id,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // 4. Increment total_checkouts on the source prompt
  await supabase.rpc('increment_checkouts', { prompt_id: promptId })
  // or: .update({ total_checkouts: supabase.sql`total_checkouts + 1` })

  revalidatePath(`/engagements/${engagementId}`)
  return { success: true, fork }
}
```

### Pattern 4: Role-Based Redirect (D-01)

**What:** After login, consultants go to `/engagements`, admins go to `/library`. Implemented in the Supabase auth callback or in `proxy.ts`.

**When to use:** Login flow — check the user's role from `app_metadata` and redirect accordingly.

**Example:**
```typescript
// app/(auth)/login/actions.ts — after successful signIn
const role = user.app_metadata?.role
const demoRole = user.user_metadata?.demo_role
const effectiveRole = role ?? demoRole ?? 'consultant'
redirect(effectiveRole === 'admin' ? '/library' : '/engagements')
```

### Pattern 5: Sidebar Active State for Engagement Routes

**What:** The `app-sidebar.tsx` currently hardcodes `isActive={true}` for all enabled items. For Phase 3, Engagements nav item needs active state detection on `/engagements/*` routes.

**When to use:** When enabling the Engagements nav item in `app-sidebar.tsx`.

**Example:**
```typescript
// components/app-sidebar.tsx
'use client'
import { usePathname } from 'next/navigation'
// ...
const pathname = usePathname()
// In render:
isActive={pathname.startsWith(item.href)}
```

### Anti-Patterns to Avoid

- **Diffing against the live parent prompt:** Never `JOIN prompts ON source_prompt_id` to get diff content. Always read `original_content` from the `forked_prompts` row. The parent evolves; the snapshot never changes.
- **Single "save all" autosave action:** A single action that patches the entire fork row means a 1.5s textarea debounce blocks a star rating click from saving immediately. Keep star rating and tag toggle saves synchronous (no debounce) and content/notes saves debounced.
- **Admin client for fork mutations:** The `forked_prompts_own` RLS policy (`forked_by = auth.uid()`) is the security gate. Use the regular Supabase client — not the service-role admin client — so RLS enforces ownership correctly.
- **useEffect for autosave:** Don't wire autosave in `useEffect` with a dependency array. Use `useCallback` with a `useRef` debounce timer and `useTransition` for non-blocking saves.
- **nuqs URL state in the prompt picker modal:** The picker modal is an overlay above the engagement workspace. Using `nuqs` inside the modal would update the URL and potentially conflict with workspace navigation. Use local `useState` for picker search/filter state instead.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Side-by-side diff view | Custom diffing algorithm | react-diff-viewer-continued | Handles word-level diff, line numbers, fold, dark theme — hundreds of edge cases |
| Markdown rendering | Custom renderer | react-markdown + remark-gfm | Already installed and in use (Phase 2 MarkdownPreview) |
| Toast notifications | Custom toast | sonner `toast()` | Already installed and in use |
| Debounce utility | Custom setTimeout management | `useRef` + `setTimeout` (idiomatic React) | No library needed; the pattern is 10 lines |
| Confirmation dialog | Custom modal | `AlertDialog` (already installed) | Already installed; handles focus trap, keyboard dismissal |
| Date formatting ("3 days ago") | Custom logic | `Intl.RelativeTimeFormat` (native JS) or `Date` arithmetic | No library needed for simple relative dates in this context |

**Key insight:** This phase is composition-heavy, not library-heavy. Most hard problems (auth, RLS, markdown, toasts, diffs) are already solved by installed libraries. The work is wiring them together correctly.

---

## Diff Viewer — Blocker Resolved

**STATE.md blocker:** "Confirm diff viewer dark mode theming (react-diff-viewer-continued vs @git-diff-view/react) before committing to implementation"

**Resolution:** `react-diff-viewer-continued` v4.2.0 is the correct choice. It has:
- `useDarkTheme={true}` prop — toggles built-in dark palette
- `styles` prop — override CSS variables for the dark theme (background colors, text, highlight colors)
- `splitView={true}` prop — side-by-side layout as required by D-25
- `leftTitle` / `rightTitle` props — for "Original" / "Adapted" column headers (D-25)

**Theming approach:**
```typescript
// components/engagements/diff-viewer.tsx
'use client'
import ReactDiffViewer from 'react-diff-viewer-continued'

const darkStyles = {
  variables: {
    dark: {
      diffViewerBackground: '#09090b',     // --background zinc-950
      diffViewerColor: 'oklch(0.985 0 0)', // --foreground
      addedBackground: '#14532d26',        // subtle teal tint
      addedColor: '#65CFB2',              // --success
      removedBackground: '#7f1d1d26',     // subtle red tint
      removedColor: '#E3392A',            // --destructive
      wordAddedBackground: '#14532d4d',
      wordRemovedBackground: '#7f1d1d4d',
      gutterBackground: '#18181b',        // --card zinc-900
      gutterColor: '#71717a',             // --muted-foreground
    },
  },
}

export function DiffViewer({ original, adapted }: { original: string; adapted: string }) {
  if (original === adapted) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        No changes yet. Edit in Write mode to see a diff.
      </div>
    )
  }
  return (
    <ReactDiffViewer
      oldValue={original}
      newValue={adapted}
      splitView={true}
      useDarkTheme={true}
      styles={darkStyles}
      leftTitle="Original"
      rightTitle="Adapted"
      hideLineNumbers={false}
      showDiffOnly={false}
    />
  )
}
```

---

## Database State

**Confirmed from `supabase/migrations/001_initial_schema.sql`:**

The `forked_prompts` table includes `original_content TEXT` — this was added beyond the PRD schema per the STATE.md pre-build decision. No migration work is needed for Phase 3.

**Deployed tables (relevant to Phase 3):**

```
engagements (id, name, client_name, industry, status, created_by, created_at, completed_at)
engagement_members (engagement_id, user_id)
forked_prompts (id, source_prompt_id, source_version, engagement_id,
                original_content,    ← snapshot at fork time (CONFIRMED)
                adapted_content, adaptation_notes, effectiveness_rating,
                usage_count, feedback_notes, issues[], merge_status,
                merge_suggestion, contains_client_context, forked_by, forked_at, last_used)
```

**Deployed RLS policies (relevant to Phase 3):**

| Policy | Table | Rule |
|--------|-------|------|
| `engagements_own` | engagements | Full CRUD where `created_by = auth.uid()` |
| `engagements_member_read` | engagements | SELECT where user is in engagement_members |
| `forked_prompts_own` | forked_prompts | Full CRUD where `forked_by = auth.uid()` |
| `engagement_members_read` | engagement_members | SELECT where `user_id = auth.uid()` |

**Important:** The `forked_prompts_own` policy does NOT include `INSERT WITH CHECK`. It uses a single `FOR ALL ... USING` clause. This means `INSERT` is allowed as long as `forked_by = auth.uid()` — which will be set in the action. No admin client needed for fork mutations.

**avg_effectiveness update strategy:** When saving a star rating, the server action must recalculate `avg_effectiveness` on the parent `prompts` row. Use an aggregate query or a Postgres function. Do not compute it client-side.

```sql
-- Suggested approach: after updating effectiveness_rating on a fork, recalculate
UPDATE prompts
SET avg_effectiveness = (
  SELECT AVG(effectiveness_rating)::float
  FROM forked_prompts
  WHERE source_prompt_id = $promptId
    AND effectiveness_rating IS NOT NULL
),
total_ratings = (
  SELECT COUNT(*)
  FROM forked_prompts
  WHERE source_prompt_id = $promptId
    AND effectiveness_rating IS NOT NULL
)
WHERE id = $promptId;
```

---

## Common Pitfalls

### Pitfall 1: Diff Against Live Parent (Not Snapshot)

**What goes wrong:** Developer JOINs `prompts` table to get the "original" for diff — but the parent prompt may have been updated since the fork was created. The diff shows wrong baseline.

**Why it happens:** The natural instinct is "compare to the library version" — but the snapshot is in `original_content` on the fork row, not the live prompt.

**How to avoid:** Always read `original_content` from `forked_prompts` for diff. Never JOIN `prompts` for this purpose.

**Warning signs:** Diff shows changes the consultant didn't make; diff breaks after admin edits the central prompt.

### Pitfall 2: Autosave Race Condition (Multiple Fields Saving Simultaneously)

**What goes wrong:** User types in the content textarea (1.5s debounce pending) then immediately clicks a star. Two server actions fire nearly simultaneously, both reading stale state, last-writer-wins overwrites data.

**Why it happens:** Multiple independent `useTransition` instances are not aware of each other.

**How to avoid:** Keep autosave actions field-scoped — `updateForkContent` only touches `adapted_content`, `updateForkRating` only touches `effectiveness_rating`. Postgres UPDATE of different columns is safe. Never use a single "patch entire row" action.

**Warning signs:** Rating click doesn't persist; notes textarea resets after star click.

### Pitfall 3: nuqs URL State in Prompt Picker Modal

**What goes wrong:** Reusing `LibraryGrid` as-is inside the prompt picker modal pushes filter state into the URL. Navigating or pressing Back after fork creation leaves filter params in the URL and confuses the engagement workspace URL state.

**Why it happens:** LibraryGrid uses `useQueryState` from nuqs which syncs to URL by default.

**How to avoid:** Create a `PromptPickerGrid` variant that accepts controlled props (search, category, capability) as `useState` instead of `useQueryState`. Or pass `nuqs`'s `shallow` option and clean up on close.

**Warning signs:** URL shows `?q=discovery&category=Build` on the engagement workspace page after closing the picker modal.

### Pitfall 4: Forgetting `revalidatePath` After Fork Creation

**What goes wrong:** Fork is created in the database but the engagement workspace page doesn't show the new fork card because Next.js cached the page.

**Why it happens:** Server components cache aggressively. Mutations via Server Actions must call `revalidatePath`.

**How to avoid:** Every mutation action that affects a page must call `revalidatePath` for that route.

**Example:**
```typescript
// After createFork:
revalidatePath(`/engagements/${engagementId}`)
// After updateForkRating (affects avg_effectiveness shown in workspace header):
revalidatePath(`/engagements/${engagementId}`)
revalidatePath(`/engagements/${engagementId}/forks/${forkId}`)
// After createEngagement:
revalidatePath('/engagements')
```

### Pitfall 5: Sidebar Active State Regression

**What goes wrong:** After enabling the Engagements nav item, the active detection (`isActive={true}` hardcoded) makes both Library and Engagements appear active simultaneously, or neither appears active.

**Why it happens:** The current sidebar hardcodes `isActive={true}` for all enabled items. It needs `pathname.startsWith(item.href)` for dynamic detection.

**How to avoid:** Update `app-sidebar.tsx` to use `usePathname()` for active state detection when enabling the Engagements item. This is a quick fix but must not be forgotten.

**Warning signs:** Two nav items highlighted simultaneously; or the blue active indicator disappears after enabling Engagements.

### Pitfall 6: Anonymous User Can't Create Engagements

**What goes wrong:** Demo consultant session tries to create an engagement but fails because `forked_prompts_own` / `engagements_own` RLS uses `auth.uid()` — and anonymous users have a valid UID, but the `engagements` INSERT also sets `created_by = user.id`. This should work.

**Why it happens:** Not actually a bug — anonymous users get a real UUID from `signInAnonymously()`. But verify this is tested.

**How to avoid:** Confirm the demo consultant flow through engagement creation in smoke tests. The `engagements_own` policy (`created_by = auth.uid()`) correctly uses `auth.uid()` which is the Supabase anon user UUID.

---

## Code Examples

Verified patterns from the existing codebase:

### Autosave Debounce Pattern (extends existing Phase 2 patterns)

```typescript
'use client'
import { useState, useRef, useTransition, useCallback } from 'react'
import { updateForkContent } from '../actions'

export function ForkContentEditor({ forkId, initialContent }: Props) {
  const [content, setContent] = useState(initialContent)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [isPending, startTransition] = useTransition()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const scheduleSave = useCallback((value: string) => {
    setSaveState('saving')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      startTransition(async () => {
        const result = await updateForkContent(forkId, value)
        if (result.error) {
          toast.error("Couldn't save changes. Retrying...")
        } else {
          setSaveState('saved')
          setTimeout(() => setSaveState('idle'), 2000)
        }
      })
    }, 1500)
  }, [forkId])

  return (
    <Textarea
      value={content}
      onChange={(e) => {
        setContent(e.target.value)
        scheduleSave(e.target.value)
      }}
      className="font-mono min-h-[400px] resize-none"
    />
  )
}
```

### Existing Server Action Pattern (from `app/(app)/library/actions.ts`)

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Established pattern — getAuthenticatedUser is the consultant equivalent of getAdminUser
async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return { user, supabase }
}
```

### Fork Card Status Detection (Customization vs Adaptation)

```typescript
// Determine fork card status indicators
function getForkStatus(fork: ForkedPrompt) {
  const hasTemplateVars = /\{\{[^}]+\}\}/.test(fork.adapted_content ?? '')
  const isAdapted = fork.adapted_content !== fork.original_content
  return {
    // "Template ready" if {{variables}} remain unfilled
    hasUnfilledTemplates: hasTemplateVars,
    // "Adapted" if content changed beyond template fills
    isAdapted: isAdapted && !hasTemplateVars,
  }
}
```

### Engagement List Data Fetch

```typescript
// lib/data/engagements.ts
export async function fetchUserEngagements(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('engagements')
    .select(`
      *,
      forked_prompts(id, effectiveness_rating)
    `)
    .eq('created_by', userId)
    .order('created_at', { ascending: false })

  if (error) return []

  return (data ?? []).map((eng) => ({
    ...eng,
    fork_count: eng.forked_prompts.length,
    avg_effectiveness: eng.forked_prompts.length > 0
      ? eng.forked_prompts
          .filter((f: any) => f.effectiveness_rating !== null)
          .reduce((sum: number, f: any) => sum + f.effectiveness_rating, 0) /
        eng.forked_prompts.filter((f: any) => f.effectiveness_rating !== null).length
      : 0,
  }))
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router + API routes for mutations | App Router + Server Actions | Next.js 13+ | Mutations in `'use server'` files, no API boilerplate |
| `searchParams` as strings (sync) | `params` and `searchParams` as Promises (async) | Next.js 15+ | Dynamic params must be `await`ed in page components |
| `middleware.ts` | `proxy.ts` | Next.js 16 (this project) | Named export `proxy` required (not `middleware`) — confirmed in STATE.md |

**Deprecated/outdated patterns:**
- `auth.role()` in RLS: Never use — use `auth.jwt() -> 'app_metadata' ->> 'role'` per STATE.md D-14
- `useEffect` for autosave: Use `useTransition` + `useRef` debounce instead
- Space utilities (`space-x-*`, `space-y-*`): Never use — use `flex gap-*` per shadcn SKILL.md

---

## Open Questions

1. **increment_checkouts: native SQL or Postgres function?**
   - What we know: `total_checkouts` must increment when a fork is created. The supabase-js client doesn't support `SET total_checkouts = total_checkouts + 1` natively in a single call without a raw SQL query or RPC.
   - What's unclear: Whether there is already an `increment_checkouts` RPC function deployed, or whether Phase 3 needs to add one.
   - Recommendation: Use `supabase.rpc('increment', { table: 'prompts', column: 'total_checkouts', row_id: promptId })` if available, or use a raw SQL `update prompts set total_checkouts = total_checkouts + 1 where id = $1`. Check if a generic increment function exists in the Supabase project before creating one.

2. **avg_effectiveness recalculation: in action or Postgres trigger?**
   - What we know: Every time a fork's `effectiveness_rating` changes, the parent `prompts.avg_effectiveness` must update. The current Phase 2 code shows `avg_effectiveness` hardcoded as a DB column (not computed).
   - What's unclear: Whether to update it in the server action (2 queries: save rating, then recalculate avg) or to create a Postgres trigger.
   - Recommendation: Server action approach (2 explicit queries) is simpler and more observable in Phase 3. A trigger could be added in a future phase if performance requires it.

---

## Environment Availability

All dependencies for Phase 3 are either already installed or available as standard npm packages.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Next.js 16 | All routes | Yes | 16.2.1 | — |
| @supabase/ssr | Auth + data | Yes | 0.9.0 | — |
| react-diff-viewer-continued | FORK-07 (diff view) | No (needs install) | 4.2.0 on npm | — |
| shadcn checkbox | FORK-04 (client context) | No (needs install) | via shadcn CLI | — |
| shadcn dialog | ENG-01 (create modal), FORK-01 | No (needs install) | via shadcn CLI | — |
| Supabase engagements table | ENG-01 to ENG-04 | Yes (deployed) | — | — |
| Supabase forked_prompts table | FORK-01 to FORK-07 | Yes (deployed) | — | — |
| nuqs | Prompt picker URL state | Yes | 2.8.9 | Use useState (see Pitfall 3) |
| sonner | Toast notifications | Yes | 2.0.7 | — |
| react-markdown, remark-gfm | Preview tab | Yes | installed | — |

**Missing dependencies requiring install (no fallback):**
- `react-diff-viewer-continued` — needed for FORK-07
- shadcn `checkbox` and `dialog` components — needed for FORK-04 and ENG-01

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.1 + @testing-library/react 16.3.2 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npx vitest run tests/engagements*.test.* --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ENG-01 | `createEngagement` server action inserts correctly and rejects unauthorized | unit | `npx vitest run tests/engagement-create.test.ts -x` | Wave 0 |
| ENG-02 | EngagementGrid renders cards with correct content; renders empty state when no engagements | unit | `npx vitest run tests/engagement-grid.test.tsx -x` | Wave 0 |
| ENG-03 | ForkGrid renders fork cards for an engagement; shows workspace empty state | unit | `npx vitest run tests/fork-grid.test.tsx -x` | Wave 0 |
| ENG-04 | `updateEngagementStatus` changes status; AlertDialog confirmation triggers on "completed" | unit | `npx vitest run tests/engagement-status.test.ts -x` | Wave 0 |
| FORK-01 | `createFork` copies content into both `original_content` and `adapted_content`; rejects duplicate forks | unit | `npx vitest run tests/fork-create.test.ts -x` | Wave 0 |
| FORK-02 | ForkEditor autosave debounce fires after 1.5s; shows "Saving..." then "Saved" | unit | `npx vitest run tests/fork-editor.test.tsx -x` | Wave 0 |
| FORK-03 | Adaptation notes textarea autosaves on change | unit | `npx vitest run tests/fork-sidebar.test.tsx -x` | Wave 0 |
| FORK-04 | Client context checkbox toggles and autosaves | unit | `npx vitest run tests/fork-sidebar.test.tsx -x` | Wave 0 |
| FORK-05 | StarRating — click star N sets rating to N; autosaves on click; no debounce | unit | `npx vitest run tests/star-rating.test.tsx -x` | Wave 0 |
| FORK-06 | IssueTagGroup — toggle tag activates/deactivates; autosaves on toggle | unit | `npx vitest run tests/issue-tag-group.test.tsx -x` | Wave 0 |
| FORK-07 | DiffViewer renders side-by-side columns; shows empty state when original === adapted | unit | `npx vitest run tests/diff-viewer.test.tsx -x` | Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run tests/engagements*.test.* tests/fork*.test.* tests/star*.test.* tests/diff*.test.* tests/issue*.test.*`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

All engagement and fork test files are new — none exist yet. Wave 0 must create:

- [ ] `tests/engagement-create.test.ts` — covers ENG-01
- [ ] `tests/engagement-grid.test.tsx` — covers ENG-02
- [ ] `tests/fork-grid.test.tsx` — covers ENG-03
- [ ] `tests/engagement-status.test.ts` — covers ENG-04
- [ ] `tests/fork-create.test.ts` — covers FORK-01
- [ ] `tests/fork-editor.test.tsx` — covers FORK-02
- [ ] `tests/fork-sidebar.test.tsx` — covers FORK-03, FORK-04
- [ ] `tests/star-rating.test.tsx` — covers FORK-05
- [ ] `tests/issue-tag-group.test.tsx` — covers FORK-06
- [ ] `tests/diff-viewer.test.tsx` — covers FORK-07

Shared fixtures needed:
- [ ] Mock Supabase client patterns from existing tests (see `tests/library-grid.test.tsx` for model)
- [ ] Mock `ForkedPrompt` and `Engagement` type fixtures

---

## Project Constraints (from CLAUDE.md)

- All markdown files must have YAML front matter with `description` and `date_last_edited`
- No save buttons — autosave pattern enforced by D-18
- Use `'use server'` for mutations; use `createClient()` (not admin client) for consultant actions
- Role check: `user.app_metadata?.role` (real users) or `user.user_metadata?.demo_role` (anonymous demo users) — same pattern as Phase 2 `getAdminUser`
- No `space-x-*` / `space-y-*` — use `flex gap-*`
- No `w-10 h-10` — use `size-10`
- `cn()` for conditional classes
- No raw hex values in className — use semantic tokens (`text-muted-foreground`, `bg-card`, etc.)
- Icons in buttons use `data-icon` attribute
- Dialog requires `DialogTitle` (visually hidden or visible) for accessibility
- `proxy.ts` naming convention (not `middleware.ts`) — confirmed correct for Next.js 16

---

## Sources

### Primary (HIGH confidence)

- Codebase scan: `supabase/migrations/001_initial_schema.sql` — confirmed `original_content` column, `engagements_own` and `forked_prompts_own` RLS policies, all 8 tables deployed
- Codebase scan: `app/(app)/library/actions.ts` — confirmed server action pattern, `getAdminUser` helper, `revalidatePath` usage
- Codebase scan: `components/library/library-grid.tsx` — confirmed `nuqs` URL state pattern, debounced Supabase search, client-side filtering with `useMemo`
- Codebase scan: `package.json` — confirmed all installed packages and versions
- Codebase scan: `vitest.config.ts` + `tests/` — confirmed test framework and mock patterns
- `npm view react-diff-viewer-continued readme` — confirmed `useDarkTheme` prop, `styles` override API, `splitView`, `leftTitle`/`rightTitle` props; v4.2.0 current (2026-03-25)
- `node_modules/next/dist/docs/01-app/02-guides/forms.md` — confirmed Next.js 16 Server Actions API unchanged from 15

### Secondary (MEDIUM confidence)

- `.planning/STATE.md` decisions — confirmed role checking pattern (`app_metadata.role`), `proxy.ts` naming, Phase 2 decisions that carry into Phase 3
- `03-CONTEXT.md` + `03-UI-SPEC.md` — full design contract confirmed from discussion session

### Tertiary (LOW confidence)

- None — all key claims verified against codebase or npm registry

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified via npm registry and codebase
- Architecture: HIGH — derived from deployed schema, established codebase patterns, and locked decisions
- Pitfalls: HIGH — based on codebase inspection and existing STATE.md decisions
- Diff viewer dark mode: HIGH — `useDarkTheme` prop confirmed from npm readme

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable libraries; Next.js/shadcn change infrequently)
