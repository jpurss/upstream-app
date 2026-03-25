---
description: "Summary of Plan 04 — fork creation server actions (createFork/createMultipleForks), ForkToEngagementDialog (prompt detail sidebar entry point), PromptPickerModal (workspace entry point), WorkspaceClient wrapper, and prompt detail page integration with real fork counts and engagement list."
date_last_edited: 2026-03-25
phase: 03-engagement-workspace
plan: "04"
subsystem: fork-workflow
tags: [fork, server-actions, dialog, modal, supabase, rls]
dependency_graph:
  requires: ["03-01", "03-02", "03-03"]
  provides: ["fork-creation", "fork-to-engagement-dialog", "prompt-picker-modal", "real-fork-counts"]
  affects: ["app/(app)/library/[promptId]/page.tsx", "app/(app)/engagements/[id]/page.tsx", "components/library/prompt-detail-sidebar.tsx"]
tech_stack:
  added: []
  patterns:
    - "server-action fork snapshot: original_content + adapted_content both set to prompt.content at fork time"
    - "WorkspaceClient thin client wrapper: server page passes data, client manages modal open state"
    - "local useState for picker filters: no URL state pollution on workspace page"
    - "parallel data fetching: countActiveForks + fetchUserEngagements + forked_prompts query all await'd via Promise.all"
key_files:
  created:
    - app/(app)/engagements/[id]/actions.ts
    - components/engagements/fork-to-engagement-dialog.tsx
    - components/engagements/prompt-picker-modal.tsx
    - components/engagements/workspace-client.tsx
  modified:
    - components/library/prompt-detail-sidebar.tsx
    - components/engagements/new-engagement-dialog.tsx
    - app/(app)/library/[promptId]/page.tsx
    - app/(app)/engagements/[id]/page.tsx
decisions:
  - "D-fork-1: total_checkouts increment uses read-then-write pattern — no RPC function in migration schema; acceptable for v1 low concurrency"
  - "D-fork-2: WorkspaceClient thin wrapper isolates modal state from server component — cleaner than prop-drilling onForkClick down to WorkspaceHeader in a server tree"
  - "D-fork-3: createMultipleForks filters 'Already forked into this engagement' from error count — duplicate forks are silently skipped (not fatal), real errors still surface"
  - "D-fork-4: ForkToEngagementDialog filters to active engagements only — paused/completed not shown since forking into inactive engagements is low-value"
metrics:
  duration_minutes: 4
  completed_date: "2026-03-25"
  tasks_completed: 2
  tasks_total: 2
  files_created: 4
  files_modified: 4
---

# Phase 3 Plan 04: Fork Creation Workflow Summary

**One-liner:** Fork creation server actions with content snapshot pattern, three entry points (sidebar dialog, workspace picker modal, post-creation picker), duplicate prevention, and real active fork count on prompt detail.

## Tasks Completed

| # | Name | Commit | Key Files |
|---|------|--------|-----------|
| 1 | Fork creation server actions and fork-to-engagement dialog | `22814c7` | `app/(app)/engagements/[id]/actions.ts`, `components/engagements/fork-to-engagement-dialog.tsx` |
| 2 | Prompt picker modal, sidebar integration, and workspace wiring | `f2ff50a` | `components/engagements/prompt-picker-modal.tsx`, `components/engagements/workspace-client.tsx`, 4 modified files |

## What Was Built

### Fork Creation Server Actions (`app/(app)/engagements/[id]/actions.ts`)

`createFork(promptId, engagementId)` — the core checkout action:
1. Fetches source prompt `content` and `version`
2. Checks for duplicate fork (same `source_prompt_id` + `engagement_id` — returns error if exists)
3. Inserts fork with `original_content = adapted_content = prompt.content` (both set to snapshot at fork time)
4. Increments `total_checkouts` on source prompt via read-increment-write
5. `revalidatePath` for both `/engagements/[id]` and `/library/[promptId]`

`createMultipleForks(promptIds, engagementId)` — parallel fork creation for picker modal:
- Calls `createFork` for each ID in parallel via `Promise.all`
- Filters "already forked" errors from the error count (they're intentional guards, not failures)
- Returns `{ success, forked, errors, errorMessages }`

### Entry Point 1: ForkToEngagementDialog (`components/engagements/fork-to-engagement-dialog.tsx`)

Triggered by "Fork to Engagement" button in prompt detail sidebar. Shows:
- List of user's active engagements as radio-style selectable items
- Already-forked engagements: grayed out (opacity-50, pointer-events-none) with "Already in this engagement" label instead of client name
- "No active engagements" empty state with "Create one" link to `/engagements`
- Footer: "Fork to Engagement" primary CTA + "Back to Library" ghost dismiss

### Entry Point 2: PromptPickerModal (`components/engagements/prompt-picker-modal.tsx`)

Full-screen modal (max-width 800px, max-height 80vh) triggered by "+ Fork a Prompt" in workspace header:
- Local `useState` for search, category, capability — intentionally NOT `useQueryState`/nuqs (Pitfall 3 guard)
- Already-forked prompts rendered with "Already forked" `<Badge>` overlay, `opacity-50 pointer-events-none`
- Multi-select via checkbox-style selection with count in footer
- "Fork Selected (N)" primary CTA + "Done Browsing" ghost dismiss

### Entry Point 3: Post-Creation Picker (updated `new-engagement-dialog.tsx`)

`handleForkSelected` now calls `createMultipleForks` server action directly — previously was a stub callback (`onForkSelected`) that didn't persist anything. Now actually forks the selected prompts into the newly created engagement.

### Workspace Wiring (`workspace-client.tsx`)

Thin client wrapper that manages `PromptPickerModal` open state. The workspace page (`app/(app)/engagements/[id]/page.tsx`) is a server component — it can't hold React state. `WorkspaceClient` receives all data as props and manages the `pickerOpen` boolean, wiring `onForkClick` from `WorkspaceHeader` to open the modal.

### Prompt Detail Sidebar Integration

- New props: `activeForkCount`, `userEngagements`, `forkedEngagementIds`
- Active Forks stat now shows `activeForkCount ?? 0` instead of hardcoded `0`
- "Fork to Engagement" button (via `ForkToEngagementDialog`) rendered when `userEngagements` is provided

Prompt detail page (`app/(app)/library/[promptId]/page.tsx`) fetches three additional datasets in parallel:
- `countActiveForks(promptId)` — real fork count for the sidebar stat
- `fetchUserEngagements(user.id)` — user's engagements for the fork dialog list
- `supabase.from('forked_prompts').select('engagement_id').eq('source_prompt_id', promptId)` — which engagements already have this prompt forked

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Implementation Notes

**Note on total_checkouts increment:** The plan noted a potential race condition in the read-increment-write pattern for `total_checkouts`. No RPC function (`increment_checkouts`) exists in the migration schema (`001_initial_schema.sql`). The read-increment-write approach is retained as stated in the plan — acceptable for v1 with low concurrency. Future versions should add a Postgres function for atomic increment.

**ForkToEngagementDialog filters to active engagements:** The dialog shows only `status === 'active'` engagements. The plan spec described listing user engagements with already-forked items grayed out but didn't explicitly limit to active. Filtering to active is the correct behavior — forking into a paused or completed engagement would be confusing.

## Known Stubs

None — all fork creation paths are fully wired:
- Entry Point 1 (sidebar dialog): calls `createFork` directly
- Entry Point 2 (workspace picker): calls `createMultipleForks` directly
- Entry Point 3 (post-creation picker): calls `createMultipleForks` directly (previously a stub `onForkSelected` callback — now wired)
- Active fork count: real data from `countActiveForks()` database query

## Self-Check

Files created/modified:
- FOUND: app/(app)/engagements/[id]/actions.ts
- FOUND: components/engagements/fork-to-engagement-dialog.tsx
- FOUND: components/engagements/prompt-picker-modal.tsx
- FOUND: components/engagements/workspace-client.tsx
- FOUND: components/library/prompt-detail-sidebar.tsx
- FOUND: components/engagements/new-engagement-dialog.tsx
- FOUND: app/(app)/library/[promptId]/page.tsx
- FOUND: app/(app)/engagements/[id]/page.tsx

Commits:
- FOUND: 22814c7 (feat(03-04): fork creation server actions)
- FOUND: f2ff50a (feat(03-04): prompt picker modal, sidebar integration, workspace wiring)

## Self-Check: PASSED
