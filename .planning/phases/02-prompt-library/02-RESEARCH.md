---
description: Research for Phase 02 (Prompt Library) — stack recommendations, architecture patterns, data fetching strategy, filtering with URL state, markdown rendering, admin CRUD, and testing map.
date_last_edited: 2026-03-25
---

# Phase 02: Prompt Library - Research

**Researched:** 2026-03-25
**Domain:** Next.js App Router data fetching, client-side filtering with URL state, Supabase full-text search, react-markdown, shadcn/ui form composition, Server Actions
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Library Browse Layout & Cards**
- D-01: Card grid as default view with toggle to compact list/table view. Responsive grid (3-4 columns). Toggle button in the filter bar area.
- D-02: Rich prompt cards showing: category badge (top-left), target model badge (top-right), title, 1-line description truncated, capability type + industry tags, star rating with count, checkout count.
- D-03: Whole card is clickable — navigates to `/library/[id]` detail page. Subtle hover effect (elevation/border glow).

**Filtering & Search Interaction**
- D-04: Top filter bar above the grid — horizontal row with search input on the left, dropdown selects for filters, grid/list toggle and sort dropdown on the right.
- D-05: Instant/real-time filtering — results update immediately as user types or selects a filter. Search is debounced (300ms). URL params update for shareable/bookmarkable filter state.
- D-06: All six filter dimensions: category, capability type, industry, effectiveness range (slider), status (active/deprecated), target model. Each as a dropdown select (or slider for effectiveness).
- D-07: Active filters shown as dismissible chips below the filter bar. "Clear all" button appears when any filter is active. Result count displayed (e.g., "6 of 18 prompts").

**Prompt Detail Page**
- D-08: Two-column layout — full markdown content rendered on the left (wide column), metadata sidebar on the right. Back-to-library link at top.
- D-09: Markdown content rendered with proper formatting (headings, lists, code blocks) using Geist Mono as base font. Uses a markdown rendering library (react-markdown or similar).
- D-10: Copy-to-clipboard button in the metadata sidebar. Copies full markdown content. Toast notification confirms success. Button icon briefly changes to checkmark.
- D-11: Field intelligence shown as stats block in sidebar: avg effectiveness (star + number), total checkouts, active fork count, total ratings count. No feedback section yet — that comes from Phase 3 forks.

**Admin CRUD Experience**
- D-12: Dedicated form pages for create (`/library/new`) and edit (`/library/[id]/edit`). Full-page forms with all prompt fields. Save/Cancel buttons.
- D-13: Write/Preview tabs for markdown content editor — plain textarea in Write tab (Geist Mono font), rendered preview in Preview tab. No toolbar buttons.
- D-14: Deprecation via status toggle with confirmation dialog. Deprecated prompts filtered from default library view but accessible by direct URL.
- D-15: Admin-only controls (Create, Edit, Deprecate buttons) are hidden for non-admin users — not disabled, just not rendered.
- D-16: "New Prompt" button in the library page header, right-aligned. Only visible to admin users.

**Sorting**
- D-17: Four sort options: Highest rated (default), Most used (checkouts), Newest first, Alphabetical.

**Empty & Zero States**
- D-18: When filters return no results: centered "No prompts match your filters" message with "Clear all filters" button.

**Markdown Editor**
- D-19: Write/Preview tab pattern (like GitHub issues) for admin create/edit form. Simple textarea + preview toggle. No rich text toolbar.

### Claude's Discretion
- Page header design (title + count + optional subtitle)
- Loading skeleton patterns for card grid and detail page
- Exact spacing, card dimensions, and border radius
- Markdown rendering library choice (react-markdown, etc.)
- List view column layout and density
- Form validation patterns and error messages
- Toast notification library/pattern
- Filter dropdown component choice (shadcn Select, Popover, etc.)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LIB-01 | Admin can create a new prompt with all fields | Server Actions pattern + shadcn form composition; admin role check from JWT app_metadata |
| LIB-02 | Admin can edit an existing prompt | Same Server Action pattern; prefill from server fetch on edit page |
| LIB-03 | Admin can deprecate a prompt (set status to deprecated) | Server Action updating `status` field; AlertDialog confirmation component |
| LIB-04 | User can browse library as grid or list with prompt card metadata | Client component with nuqs URL state for filters; initial data from server component |
| LIB-05 | User can filter library by 6 dimensions | nuqs for URL state; shadcn Select + Slider components; client-side filter logic on fetched data |
| LIB-06 | User can search prompts by keyword (full-text search) | Supabase `textSearch()` using pre-built GIN index on prompts; debounced via `useCallback` + `setTimeout` |
| LIB-07 | User can view prompt detail page with full content and aggregate field intelligence | Server component fetching prompt by ID; react-markdown for content rendering; stats from prompt fields |
| LIB-08 | User can copy prompt content to clipboard with one click | `navigator.clipboard.writeText()` in a client component; sonner toast for confirmation |

</phase_requirements>

---

## Summary

Phase 2 builds a complete prompt library UI on top of the schema and auth already deployed in Phase 1. The data layer is ready — 18 seed prompts exist, RLS is active, and the full-text search GIN index (`idx_prompts_fulltext`) is already created. This phase is pure frontend + Server Action work.

The central architectural decision is how to handle filtering and search. Decision D-05 requires real-time filtering with URL param state. The correct solution is **nuqs** (type-safe URL state for React, v2.8.9), which syncs filter state to the URL query string without hydration issues in Next.js App Router. The library page server component reads initial data; a client component wrapper handles filter state and re-queries Supabase via the browser client. This avoids a full-page server round-trip on every filter change while keeping URLs bookmarkable.

For markdown rendering (D-09, D-13 preview), use **react-markdown v10.1.0** with **remark-gfm v4.0.1**. These are the current stable versions and the standard choice for Next.js apps. No alternatives are worth considering — react-markdown is the ecosystem standard and handles all formatting the prompts require (headings, lists, code blocks with `{{variable}}` syntax). For toast notifications (D-10 copy confirmation), use **sonner v2.0.7** which is the shadcn-recommended toast library.

For the admin CRUD forms, use shadcn's Server Actions pattern with `'use server'` functions that call `supabase.from('prompts').insert/update`. Role enforcement happens at two levels: RLS (`prompts_write_admin` policy) and UI (conditional rendering based on `effectiveRole` from layout).

**Primary recommendation:** Initial data load via server component, client-side filter/search state via nuqs, Supabase browser client for filtered re-queries, react-markdown for content rendering, sonner for toasts, shadcn AlertDialog for deprecation confirmation.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| nuqs | 2.8.9 | URL query string state manager | Type-safe, Next.js App Router native, no hydration mismatch issues with `useQueryState` |
| react-markdown | 10.1.0 | Render markdown content | De-facto standard for React; handles headings, code blocks, lists; supports custom components |
| remark-gfm | 4.0.1 | GitHub-Flavored Markdown plugin | Adds tables, strikethrough, task lists — prompts use GFM features |
| sonner | 2.0.7 | Toast notifications | shadcn's official recommendation; works with App Router; no context provider needed |

### Supporting (already installed — no install needed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @supabase/ssr | 0.9.0 | Server + browser Supabase clients | All data fetching — server.ts for page loads, client.ts for filter re-queries |
| lucide-react | 1.6.0 | Icons (star, copy, check, filter, etc.) | All iconography in UI — project standard via shadcn |
| next-themes | 0.4.6 | Dark mode | Already wired; no additional work |

### shadcn Components to Add (not yet installed)
| Component | Purpose | Install Command |
|-----------|---------|-----------------|
| select | Filter dropdowns (category, capability type, etc.) | `npx shadcn@latest add select` |
| slider | Effectiveness range filter | `npx shadcn@latest add slider` |
| tabs | Write/Preview tabs on admin form editor | `npx shadcn@latest add tabs` |
| textarea | Markdown content editor in admin form | `npx shadcn@latest add textarea` |
| alert-dialog | Deprecation confirmation dialog | `npx shadcn@latest add alert-dialog` |
| card | Prompt cards in grid/list view | `npx shadcn@latest add card` |
| dialog | (optional) any modal needs | `npx shadcn@latest add dialog` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| nuqs | Manual `useSearchParams` + `router.push` | nuqs is 10x less boilerplate, type-safe, handles serialization — no reason to hand-roll |
| react-markdown | marked.js, MDX | react-markdown renders inline in React component tree; no compilation step; simpler than MDX for display-only use case |
| sonner | shadcn Toast (Radix-based) | sonner is simpler API, fewer lines, already the shadcn recommendation |
| Client re-query | Server action + `revalidatePath` | revalidatePath causes full page reload — wrong UX for instant filtering |

**Installation (new packages only):**
```bash
npm install nuqs react-markdown remark-gfm sonner
npx shadcn@latest add select slider tabs textarea alert-dialog card
```

**Version verification (confirmed 2026-03-25):**
- nuqs: 2.8.9 (npm view)
- react-markdown: 10.1.0 (npm view)
- remark-gfm: 4.0.1 (npm view)
- sonner: 2.0.7 (npm view)

---

## Architecture Patterns

### Recommended Project Structure
```
app/(app)/library/
├── page.tsx                    # Server component: initial data fetch + pass to client
├── loading.tsx                 # Skeleton for library page
├── [promptId]/
│   ├── page.tsx                # Server component: fetch single prompt by ID
│   ├── loading.tsx             # Skeleton for detail page
│   └── edit/
│       └── page.tsx            # Admin-only edit form page
└── new/
    └── page.tsx                # Admin-only create form page

components/library/
├── library-grid.tsx            # "use client" — filter state, grid/list toggle, rendering
├── prompt-card.tsx             # Individual card component (grid view)
├── prompt-card-list.tsx        # Individual row component (list view)
├── filter-bar.tsx              # Filter controls, search input, sort dropdown
├── filter-chips.tsx            # Active filter chips with dismiss
├── prompt-detail-content.tsx   # Markdown rendered content (left column)
├── prompt-detail-sidebar.tsx   # Metadata + copy button (right column)
├── prompt-form.tsx             # Shared create/edit form "use client"
├── markdown-preview.tsx        # Shared Write/Preview tab component
└── deprecation-dialog.tsx      # AlertDialog wrapper for confirm deprecation

app/(app)/library/actions.ts    # Server Actions: createPrompt, updatePrompt, deprecatePrompt
```

### Pattern 1: Server Component Initial Load + Client Filter Shell

**What:** The library page server component fetches all `active` prompts on page load, passes them as props to a client component. The client component manages filter state locally (and in URL via nuqs), applies filters in-memory for instant response. For keyword search, debounce then re-query Supabase via browser client.

**When to use:** When you need both SSR initial render AND instant client-side filtering without full page reloads.

**Example:**
```typescript
// app/(app)/library/page.tsx — Server Component
import { createClient } from '@/lib/supabase/server'
import { LibraryGrid } from '@/components/library/library-grid'

export default async function LibraryPage() {
  const supabase = await createClient()

  const { data: prompts } = await supabase
    .from('prompts')
    .select('*')
    .eq('status', 'active')
    .order('avg_effectiveness', { ascending: false })

  return <LibraryGrid initialPrompts={prompts ?? []} />
}
```

```typescript
// components/library/library-grid.tsx — Client Component
'use client'
import { useQueryState } from 'nuqs'
import { useMemo, useCallback, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function LibraryGrid({ initialPrompts }: { initialPrompts: Prompt[] }) {
  const [search, setSearch] = useQueryState('q', { defaultValue: '' })
  const [category, setCategory] = useQueryState('category', { defaultValue: '' })
  const [sort, setSort] = useQueryState('sort', { defaultValue: 'highest-rated' })
  const [viewMode, setViewMode] = useQueryState('view', { defaultValue: 'grid' })
  const [prompts, setPrompts] = useState(initialPrompts)

  // Debounced search re-queries Supabase for full-text
  const doSearch = useCallback(async (q: string) => {
    if (!q) { setPrompts(initialPrompts); return }
    const supabase = createClient()
    const { data } = await supabase
      .from('prompts')
      .select('*')
      .textSearch('content_search', q, { type: 'websearch', config: 'english' })
    setPrompts(data ?? [])
  }, [initialPrompts])

  // Client-side filter applied to current prompts array
  const filtered = useMemo(() => {
    let result = prompts
    if (category) result = result.filter(p => p.category === category)
    // ... other filters
    return result
  }, [prompts, category /*, other filters */])

  // ...
}
```

### Pattern 2: Supabase Full-Text Search

**What:** The `idx_prompts_fulltext` GIN index is already created in migration 001. Use `textSearch()` from the Supabase JS client. The `websearch` type accepts plain English queries with implicit AND between words.

**When to use:** Keyword search across title, description, content (LIB-06).

**Important:** The index is defined as:
```sql
CREATE INDEX idx_prompts_fulltext ON prompts USING GIN (
  to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || content)
);
```
The column expression is a computed tsvector — use `.textSearch()` on `prompts`, passing the raw column expression. In Supabase JS v2, call:
```typescript
supabase.from('prompts').select('*').textSearch('content', query, {
  type: 'websearch',
  config: 'english'
})
```
Note: Supabase `textSearch` may need the index column name adjusted — test the query. If the compound index doesn't map cleanly, fall back to a Postgres function or `or()` with `ilike` on title/description/content for v1 (acceptable for 18 prompts, suboptimal at scale).

### Pattern 3: Server Actions for Admin CRUD

**What:** Admin create/edit/deprecate operations use `'use server'` functions. They perform the Supabase mutation, then call `revalidatePath('/library')` to bust Next.js cache.

**When to use:** Any mutation from a form page.

**Example:**
```typescript
// app/(app)/library/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPrompt(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.app_metadata?.role

  if (role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase.from('prompts').insert({
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    // ... other fields
    created_by: user.id,
  })

  if (error) return { error: error.message }

  revalidatePath('/library')
  redirect('/library')
}

export async function deprecatePrompt(promptId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('prompts')
    .update({ status: 'deprecated' })
    .eq('id', promptId)

  if (error) return { error: error.message }

  revalidatePath('/library')
  revalidatePath(`/library/${promptId}`)
  return { success: true }
}
```

### Pattern 4: react-markdown with Geist Mono for Prompt Content

**What:** Render prompt content with react-markdown + remark-gfm. Apply Geist Mono via a custom `components` prop.

**When to use:** Detail page content column (D-09) and admin form Preview tab (D-13).

**Example:**
```typescript
// components/library/prompt-detail-content.tsx
'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function PromptDetailContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Apply Geist Mono to all text-level elements
        p: ({ children }) => (
          <p className="font-mono text-[13px] text-foreground leading-relaxed mb-4">
            {children}
          </p>
        ),
        code: ({ children }) => (
          <code className="font-mono text-[13px] bg-muted px-1 py-0.5 rounded">
            {children}
          </code>
        ),
        // headings use Geist Sans per design system
        h1: ({ children }) => (
          <h1 className="text-base font-semibold mb-3 mt-6">{children}</h1>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
```

### Pattern 5: Role Check for Admin UI Visibility

**What:** The layout already passes `effectiveRole` down. For library page and detail page, the role must be re-fetched server-side to gate admin controls. Do NOT rely on client-side role — always fetch from server component.

**When to use:** All admin-only UI elements (Create button, Edit button, Deprecate).

**Example:**
```typescript
// In library/[promptId]/page.tsx
export default async function PromptDetailPage({ params }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = user?.app_metadata?.role === 'admin'
  const prompt = await fetchPrompt(params.promptId)

  return (
    <PromptDetailLayout prompt={prompt}>
      {isAdmin && <AdminControls promptId={prompt.id} />}
    </PromptDetailLayout>
  )
}
```

### Pattern 6: nuqs for URL Filter State

**What:** nuqs `useQueryState` hooks sync each filter dimension to a URL query param. On mount, nuqs reads from the URL (enabling bookmarkable URLs). On change, nuqs updates the URL without triggering navigation.

**When to use:** All filter dimensions (D-05, D-06) and sort/view mode (D-17, D-01).

**Important nuqs App Router note:** The library page must be wrapped in a `NuqsAdapter` from `nuqs/adapters/next/app`. Add it to the `(app)/layout.tsx` or the library page itself.

```typescript
// In layout or page:
import { NuqsAdapter } from 'nuqs/adapters/next/app'
// Wrap children: <NuqsAdapter>{children}</NuqsAdapter>
```

### Anti-Patterns to Avoid
- **Filtering server-side on every keystroke:** Each filter change would cause a server round-trip. Filter in-memory client-side; only re-query Supabase for full-text search with debounce.
- **Using `revalidatePath` for search:** This triggers server re-render, not instant filtering. Use client-side filtering.
- **Role check from `user_metadata`:** Always use `app_metadata.role` (JWT-injected by Auth Hook). `user_metadata` is user-editable.
- **Using `getSession()` in Server Components:** The project already uses `getUser()` — maintain this pattern.
- **Passing non-serializable data across server/client boundary:** Pass plain objects from server to client — no class instances or functions.
- **`space-y-*` classes:** Use `flex flex-col gap-*` per shadcn skill rules.
- **Manual `dark:` overrides:** Use semantic tokens (`bg-background`, `text-muted-foreground`).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL query string state | Manual `useSearchParams` + `router.push` | nuqs `useQueryState` | nuqs handles serialization, type safety, shallow routing, and SSR hydration correctly |
| Markdown rendering | Custom parser or regex transformations | react-markdown + remark-gfm | HTML injection risks, edge cases in nested lists, code block handling — all solved |
| Toast notifications | Custom toast state + portal | sonner | Animation, stacking, timing, dismiss — all hand-rolled toasts miss edge cases |
| Deprecation confirm | Custom modal state | shadcn `AlertDialog` | Accessibility (focus trap, aria-labelledby), keyboard dismiss, consistent design |
| Copy to clipboard | Manual `document.execCommand('copy')` | `navigator.clipboard.writeText()` | `execCommand` is deprecated; clipboard API is standard and async |
| Debounce | Custom `setTimeout` ref tracking | Simple `useEffect` with `setTimeout` + cleanup | For a single search input, a 3-line `useEffect` is fine — no library needed |

**Key insight:** The prompts data model is entirely relational with no complex query patterns. Supabase JS client handles all query needs. The frontend complexity is filter state management, not data complexity.

---

## Common Pitfalls

### Pitfall 1: Full-Text Search Column Name Mismatch
**What goes wrong:** `textSearch('content', q)` fails because the GIN index is on a concatenated expression `(title || ' ' || description || ' ' || content)`, not on a single column named `content`.
**Why it happens:** Supabase `textSearch()` targets a column name or an expression column, and the index was built on a computed expression.
**How to avoid:** Either (a) use `.or('title.ilike.%q%,description.ilike.%q%,content.ilike.%q%')` as a fallback for 18 prompts (acceptable for v1 scale), or (b) add a generated column to the prompts table that materializes the tsvector and target that column. For v1 with 18 prompts, `ilike` is fast enough.
**Warning signs:** Supabase returns an empty array or 400 error on text search queries.

### Pitfall 2: nuqs Adapter Missing
**What goes wrong:** `useQueryState` throws "No NuqsAdapter found in component tree" or URL params don't update.
**Why it happens:** nuqs v2 requires explicit adapter registration for Next.js App Router.
**How to avoid:** Add `<NuqsAdapter>` from `nuqs/adapters/next/app` wrapping the library client component tree. Can be placed in the `(app)/layout.tsx`.
**Warning signs:** URL bar doesn't update when filters change; runtime error on first render.

### Pitfall 3: react-markdown Peer Dependency Mismatch
**What goes wrong:** Build error about mismatched React peer dependencies.
**Why it happens:** react-markdown v10 targets React 19, which is what this project uses. remark-gfm v4 is compatible. No issue expected, but verify after install.
**How to avoid:** Install both at the same time: `npm install react-markdown remark-gfm`. If peer warnings appear, they are likely advisory — confirm the build still succeeds.
**Warning signs:** `npm install` prints peer dependency warnings; TypeScript errors on import.

### Pitfall 4: Admin Role Double-Checked But Not Enough
**What goes wrong:** RLS rejects the write with a 403 because the server action does the role check in JS but Supabase uses the session's JWT, which may not have the `admin` role injected yet (e.g., during Auth Hook propagation delay after first login).
**Why it happens:** Auth Hook writes role into JWT at token issue time. On very first login the JWT may not have the role yet until the next token refresh.
**How to avoid:** The server action's role check in JS is a UI guard, not a security gate — RLS is the real gate. Both are needed. If a 403 occurs in production, instruct the user to re-login.
**Warning signs:** Admin user gets 403 on first create after logging in; subsequent requests succeed.

### Pitfall 5: Client-Side Filtering Stale After CRUD
**What goes wrong:** Admin creates a prompt, is redirected to `/library`, but the new prompt doesn't appear because the client component is holding stale `initialPrompts` state.
**Why it happens:** `revalidatePath('/library')` in the server action invalids the Next.js cache, causing a fresh server render on next navigation. But if the client component cached `initialPrompts` in local state, it may not re-initialize.
**How to avoid:** Don't store `initialPrompts` in `useState` with a stale initializer. Instead, use `useMemo` to derive displayed prompts from the prop directly, or use a `key` on the client component that changes after mutations. The server component re-renders on navigation after `revalidatePath`, so `initialPrompts` prop will be fresh.
**Warning signs:** Newly created prompts don't appear until hard refresh.

### Pitfall 6: Effectiveness Slider Filter UX
**What goes wrong:** Slider returns a continuous value but `avg_effectiveness` is a float stored in the DB. Filtering client-side on "3.5+" means prompts with 3.49 are excluded.
**Why it happens:** Float precision and continuous range doesn't map cleanly to a discrete slider.
**How to avoid:** Use a discrete slider (e.g., 1-5 stars minimum). Filter as `p.avg_effectiveness >= sliderValue`. Treat slider value as minimum threshold, not exact match.
**Warning signs:** Too many or too few results compared to visible star ratings on cards.

### Pitfall 7: Anonymous Demo User Role for Admin Controls
**What goes wrong:** A demo admin user (`demoRole = 'admin'`) doesn't have `app_metadata.role = 'admin'` — they have `app_metadata.role = 'anon'` per the Auth Hook logic for anonymous users.
**Why it happens:** The Auth Hook only writes the role from the `profiles` table, and anonymous users have no profile row. The layout derives `effectiveRole` from `demoRole` but this is a UI-only construct.
**How to avoid:** When checking role for admin control visibility in server components, use the same `effectiveRole` logic from the layout. Check `user.is_anonymous` and fall back to `user.user_metadata.demo_role` for anonymous users. For RLS purposes, demo admin users will be blocked from writes — this is intentional (demo users are read-only by design per the auth decisions).
**Warning signs:** Demo admin user sees admin controls but gets 403 on save — this is correct behavior but should be handled gracefully (not a bug, but needs a clear error message).

---

## Code Examples

Verified patterns from existing codebase and library docs:

### Reading User Role in Server Component
```typescript
// Source: existing app/(app)/layout.tsx pattern
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
const role = (user?.app_metadata?.role as 'consultant' | 'admin' | null) ?? null
const isAnonymous = user?.is_anonymous ?? false
const demoRole = isAnonymous
  ? ((user?.user_metadata?.demo_role as 'consultant' | 'admin' | null) ?? 'consultant')
  : null
const effectiveRole = role ?? (isAnonymous ? demoRole : null)
const isAdmin = effectiveRole === 'admin'
```

### Supabase Query with Filtering
```typescript
// Source: Supabase JS v2 client API
const supabase = createClient() // browser client
const { data, error } = await supabase
  .from('prompts')
  .select('id, title, description, category, capability_type, industry_tags, target_model, avg_effectiveness, total_checkouts, total_ratings, status')
  .eq('status', 'active')
  .gte('avg_effectiveness', minEffectiveness)
  .eq('category', selectedCategory)
  .order('avg_effectiveness', { ascending: false })
```

### Copy to Clipboard with sonner Toast
```typescript
// Source: MDN Clipboard API + sonner docs
'use client'
import { toast } from 'sonner'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={handleCopy} className="...">
      {copied
        ? <Check data-icon="inline-start" />
        : <Copy data-icon="inline-start" />
      }
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}
```

### nuqs Filter State Pattern
```typescript
// Source: nuqs v2 docs — useQueryState
'use client'
import { useQueryState, parseAsString, parseAsFloat } from 'nuqs'

export function LibraryFilters() {
  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''))
  const [category, setCategory] = useQueryState('category', parseAsString.withDefault(''))
  const [minRating, setMinRating] = useQueryState('rating', parseAsFloat.withDefault(0))
  const [sort, setSort] = useQueryState('sort', parseAsString.withDefault('highest-rated'))

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => doSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // ...
}
```

### Deprecation AlertDialog
```typescript
// Source: shadcn AlertDialog pattern
'use client'
import { AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { deprecatePrompt } from '../actions'

export function DeprecationDialog({ promptId }: { promptId: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Deprecate</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deprecate this prompt?</AlertDialogTitle>
          <AlertDialogDescription>
            This prompt will be hidden from browse but remains in the database.
            It can be accessed by direct URL.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => deprecatePrompt(promptId)}>
            Deprecate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

---

## Environment Availability

This phase has no external tool dependencies beyond the existing project stack.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js / npm | Package install | ✓ | (project running) | — |
| Supabase project | All data ops | ✓ | Running (Phase 1 complete) | — |
| nuqs | URL filter state | ✗ (not installed) | 2.8.9 available | Manual searchParams (more complex) |
| react-markdown | Markdown render | ✗ (not installed) | 10.1.0 available | Dangerously set innerHTML (security risk — do not use) |
| sonner | Copy toast | ✗ (not installed) | 2.0.7 available | shadcn Toast (more boilerplate) |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** nuqs, react-markdown, sonner — all installable via npm; no blockers.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.1 + @testing-library/react 16.3.2 |
| Config file | `vitest.config.ts` (project root) |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LIB-01 | Admin create form renders all required fields | unit | `npm test -- tests/library-create.test.tsx` | ❌ Wave 0 |
| LIB-02 | Edit form pre-fills with existing prompt data | unit | `npm test -- tests/library-edit.test.tsx` | ❌ Wave 0 |
| LIB-03 | Deprecation dialog renders and calls action on confirm | unit | `npm test -- tests/library-deprecate.test.tsx` | ❌ Wave 0 |
| LIB-04 | Library grid renders prompt cards with correct metadata fields | unit | `npm test -- tests/library-grid.test.tsx` | ❌ Wave 0 |
| LIB-05 | Filter bar: selecting a category hides non-matching cards | unit | `npm test -- tests/library-filter.test.tsx` | ❌ Wave 0 |
| LIB-06 | Search input triggers debounced query (mock Supabase client) | unit | `npm test -- tests/library-search.test.tsx` | ❌ Wave 0 |
| LIB-07 | Detail page renders markdown content and sidebar metadata | unit | `npm test -- tests/library-detail.test.tsx` | ❌ Wave 0 |
| LIB-08 | Copy button calls clipboard.writeText and fires toast | unit | `npm test -- tests/library-copy.test.tsx` | ❌ Wave 0 |

**Note on test approach:** The existing test pattern mocks Supabase and Next.js navigation. Follow the same pattern for library tests — mock `@/lib/supabase/client`, `@/lib/supabase/server`, `next/navigation`, and `sonner`.

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
All test files for this phase need to be created as part of the TDD workflow. The test infrastructure itself is in place:
- [ ] `tests/library-grid.test.tsx` — covers LIB-04
- [ ] `tests/library-filter.test.tsx` — covers LIB-05
- [ ] `tests/library-search.test.tsx` — covers LIB-06
- [ ] `tests/library-detail.test.tsx` — covers LIB-07
- [ ] `tests/library-copy.test.tsx` — covers LIB-08
- [ ] `tests/library-create.test.tsx` — covers LIB-01
- [ ] `tests/library-edit.test.tsx` — covers LIB-02
- [ ] `tests/library-deprecate.test.tsx` — covers LIB-03

**Existing infrastructure covers:** vitest config, jsdom env, @testing-library/react, `@` alias, `vi.mock` patterns for supabase and next/navigation.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useSearchParams` + manual router.push for URL state | nuqs `useQueryState` | nuqs v2 (2024) | Type-safe, no boilerplate, works with Next.js 14+ App Router |
| `react-markdown` v8 + `rehype-sanitize` required | react-markdown v10 (built-in XSS safe) | 2024 | No separate sanitize plugin needed for content we write |
| shadcn zinc-dark preset | Manual CSS variable overrides in globals.css | Phase 1 decision | Already done — do not re-init shadcn |
| `middleware.ts` for Next.js auth | `proxy.ts` with named export `proxy` | Next.js 16 | Already implemented in Phase 1 |

**Deprecated/outdated:**
- `document.execCommand('copy')`: Deprecated in all major browsers. Use `navigator.clipboard.writeText()`.
- `react-markdown` v8/v9 with separate rehype plugins: v10 simplifies the API.
- shadcn v3 patterns: Project uses shadcn 4.x (base-nova style) — use `base` not `radix` APIs (already captured in components.json `"base": "base"`).

---

## Open Questions

1. **Full-text search column targeting**
   - What we know: GIN index is on a concatenated expression, not a named generated column
   - What's unclear: Whether Supabase JS `textSearch()` can target compound expression indexes directly or requires a named column
   - Recommendation: Write the search implementation with `ilike` fallback first (correct for 18 prompts); add a generated column migration if search quality is poor at higher prompt counts

2. **Sonner provider placement**
   - What we know: sonner requires a `<Toaster>` component in the component tree
   - What's unclear: Whether it should go in `(app)/layout.tsx` or the root `layout.tsx`
   - Recommendation: Add `<Toaster>` to root `app/layout.tsx` so it's available everywhere (copy toast is only Phase 2, but toasts will be needed in later phases too)

3. **Card dimensions for design system**
   - What we know: User left exact dimensions to Claude's discretion
   - What's unclear: What column count works best at the main content width given sidebar offset
   - Recommendation: 3 columns at `lg:`, 2 at `md:`, 1 at `sm:` using `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

---

## Project Constraints (from CLAUDE.md)

Directives the planner must verify compliance with:

1. **TDD by Default:** Every code-producing task must follow RED-GREEN-REFACTOR. Write failing test first, confirm it fails, then implement.
2. **`'use client'` required** for any component using `useState`, `useEffect`, event handlers, or browser APIs — confirmed by `"isRSC": true` in shadcn config.
3. **No `space-x-*` / `space-y-*`:** Use `flex gap-*` for all spacing.
4. **No manual `dark:` overrides:** Use semantic tokens (`bg-background`, `text-muted-foreground`, etc.).
5. **`cn()` for conditional classes**, not template literal ternaries.
6. **`data-icon` attribute for icons in buttons**, no sizing classes on icons inside components.
7. **shadcn `base` primitives**, not `radix` (project `"base": "base"` in components.json).
8. **Icon library is `lucide`** — import from `lucide-react`, not other icon sets.
9. **Package manager is `npm`** — all installs use `npm install`, not pnpm/yarn.
10. **YAML front matter required** on all `.md` files created.
11. **All `.md` files** need `description` and `date_last_edited` fields.
12. **Do not add features not in the plan** without explicit user approval.
13. **Verification before completion:** Run the test command and read full output before claiming any task done.
14. **Role check always via `app_metadata.role`**, never `user_metadata.role`.

---

## Sources

### Primary (HIGH confidence)
- Existing codebase: `supabase/migrations/001_initial_schema.sql` — RLS policies, full-text search index definition, Auth Hook logic
- Existing codebase: `app/(app)/layout.tsx` — established role check pattern
- Existing codebase: `vitest.config.ts`, `tests/login-page.test.tsx` — test infrastructure patterns
- Existing codebase: `components.json` — shadcn config (style=base-nova, base=base, iconLibrary=lucide, tailwindVersion=v4)
- npm registry (verified 2026-03-25): nuqs@2.8.9, react-markdown@10.1.0, remark-gfm@4.0.1, sonner@2.0.7

### Secondary (MEDIUM confidence)
- nuqs documentation (package description): "Type-safe search params state manager for React — Like useState, but stored in the URL query string"
- react-markdown v10 changelog: React 19 compatible, remark-gfm v4 peer

### Tertiary (LOW confidence)
- Supabase `textSearch()` on compound GIN expression: behavior not directly verified against live database — marked as Open Question #1

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified against npm registry 2026-03-25
- Architecture: HIGH — patterns derived directly from existing codebase, no speculation
- Pitfalls: HIGH — most derived from existing codebase decisions and documented schema
- Full-text search targeting: LOW — marked as open question pending live test

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable libraries; nuqs/react-markdown/shadcn rarely have breaking changes between minor versions)
