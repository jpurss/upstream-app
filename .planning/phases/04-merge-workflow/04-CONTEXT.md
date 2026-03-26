---
description: Phase 4 implementation decisions for Upstream Merge Workflow — suggest merge from fork sidebar, admin review queue page, two-column review detail with optional content editing, post-merge versioning and changelog.
date_last_edited: 2026-03-25
---

# Phase 4: Merge Workflow - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Consultants can suggest pushing field-tested improvements back to the central library from any forked prompt. Admins can review pending merge suggestions in a dedicated review queue, see side-by-side diffs with full fork context, optionally edit content before approving, or decline with a reason. Approved merges update the library prompt, bump the version, and create a changelog entry. This phase builds on the deployed schema (`merge_status`, `merge_suggestion` columns on `forked_prompts`, `prompt_changelog` table), the fork detail page from Phase 3, and the admin patterns from Phases 1-2. No demand board, no dashboard, no notifications beyond status badges.

Requirements: MERGE-01, MERGE-02, MERGE-03, MERGE-04, MERGE-05

</domain>

<decisions>
## Implementation Decisions

### Suggest Merge Flow
- **D-01:** "Suggest Merge" button lives in the fork sidebar as a new section at the bottom (after fork date). Consistent with the sidebar-as-actions pattern established in Phase 3 (rating, feedback, issue tags all in sidebar).
- **D-02:** Clicking "Suggest Merge" opens a dialog with a single textarea: "Why should this be merged back?" Merge note only — the diff, effectiveness rating, feedback notes, and adaptation notes already exist on the fork and will be shown to the admin automatically.
- **D-03:** No gate on merge suggestion — consultants can suggest a merge at any time regardless of whether they've rated the fork. Rating is optional context, not a prerequisite. Lower friction.
- **D-04:** After submitting, the merge button is replaced by a status badge in the sidebar section. "Pending Review" (amber) while awaiting admin decision. If approved: "Merged ✓" (green). If declined: "Declined" (red) with the admin's reason visible, and the button re-enables so the consultant can revise and resubmit.

### Admin Review Queue
- **D-05:** Dedicated `/review` page activated from the existing disabled "Review Queue" sidebar nav item (placed in Phase 1 D-05). Admin-only — hidden from consultants, consistent with Phase 2 D-15.
- **D-06:** Rich context cards in the review queue showing: prompt title, who suggested the merge, which engagement, effectiveness rating (stars), fork date, merge note preview (truncated), and time since submission. Enough to triage without clicking in.
- **D-07:** Default view shows pending suggestions only — the admin's action queue. Filter tabs or dropdown to switch between Pending, Approved, Declined, or All. Keeps the default view focused on what needs action.
- **D-08:** Sidebar "Review Queue" nav item shows a pending count badge (e.g., "Review Queue (3)"). Admins can see at a glance if there's work to do — same pattern as unread counts in Slack/Linear.

### Review & Decision UX
- **D-09:** Two-column layout for the review detail page: wide left column shows the side-by-side diff (reusing existing DiffViewer component from Phase 3). Narrow right sidebar shows: who suggested, engagement name, effectiveness rating, issue tags, feedback notes, merge note, and approve/decline action buttons. Mirrors the fork detail page layout.
- **D-10:** Admin can optionally edit the adapted content before approving. The review page includes an editable content area alongside the diff. "Approve & Merge" applies the (possibly edited) content to the library prompt.
- **D-11:** Decline flow uses an inline reason textarea — clicking "Decline" expands a required textarea below the button: "Why are you declining this?" Submit to confirm. Reason is stored and shown to the consultant on their fork sidebar. Fast, stays on the same page.

### Post-Merge Behavior
- **D-12:** On approve: library prompt content is replaced with the (possibly admin-edited) adapted content. Version number increments (e.g., 1 → 2). A changelog entry is created in `prompt_changelog` with the previous content, who merged it, and the merge note. Clean audit trail.
- **D-13:** Consultant notification is status change on fork only — no push notifications, no toasts on login. Consultant sees updated merge status badge when they visit the fork detail page. Simple for v1.

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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### PRD & Data Model
- `upstream-prd.md` §4 — Core data model (ForkedPrompt merge_status field, PromptChangelog entity)
- `upstream-prd.md` §7.2 — Database schema (forked_prompts.merge_status, forked_prompts.merge_suggestion columns; prompt_changelog table)
- `upstream-prd.md` §7.3 — RLS policies (forked_prompts_own, prompts_write_admin for library updates)

### Requirements
- `.planning/REQUIREMENTS.md` — MERGE-01 through MERGE-05 acceptance criteria

### UI/UX Direction
- `upstream-prd.md` §8 — UI/UX principles, design direction, key interactions
- `.impeccable.md` — Design system: color palette, typography, spacing, component principles

### Prior Phase Context
- `.planning/phases/01-foundation/01-CONTEXT.md` — Auth, schema, navigation decisions (D-05: Review Queue nav item already placed but disabled)
- `.planning/phases/02-prompt-library/02-CONTEXT.md` — Admin controls pattern (D-15: hidden not disabled), deprecation dialog pattern (D-14), two-column detail layout (D-08)
- `.planning/phases/03-engagement-workspace/03-CONTEXT.md` — Fork sidebar sections (D-21), autosave pattern (D-18), diff tab (D-24/D-25), fork detail page layout (D-17)

### Existing Components
- `components/engagements/diff-viewer.tsx` — Side-by-side diff component (react-diff-viewer-continued), already themed for dark mode
- `components/engagements/fork-sidebar.tsx` — Fork sidebar with 7 sections, extension point for merge section
- `components/library/deprecation-dialog.tsx` — AlertDialog pattern reusable for merge confirmation flows
- `app/(app)/library/actions.ts` — `getAdminUser()` pattern for admin-only server actions

### Schema (Already Deployed)
- `supabase/migrations/001_initial_schema.sql` — `forked_prompts.merge_status` (TEXT DEFAULT 'none'), `forked_prompts.merge_suggestion` (TEXT), `prompt_changelog` table (version, change_description, previous_content, changed_by)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/engagements/diff-viewer.tsx` — DiffViewer component with dark theme, split view. Directly reusable for merge review detail page.
- `components/engagements/fork-sidebar.tsx` — 7-section sidebar pattern. New merge section slots in at the bottom.
- `components/library/deprecation-dialog.tsx` — AlertDialog trigger + confirmation + server action + toast pattern. Adaptable for merge suggestion dialog.
- `components/engagements/fork-detail-client.tsx` — Two-column layout (editor + sidebar). Review detail page mirrors this.
- `lib/data/forks.ts` — Fork query patterns with joins. Extend for merge suggestion queries.
- `app/(app)/library/actions.ts` — `getAdminUser()` admin auth check pattern. Reuse for merge review actions.
- `app/(app)/engagements/[id]/forks/[forkId]/actions.ts` — Fork mutation pattern with `getAuthenticatedUser()`. Reuse for merge suggestion submission.
- `components/app-sidebar.tsx` — Sidebar nav with disabled items and role-based filtering. Review Queue item to activate with badge.

### Established Patterns
- Server components for initial data fetch (async page components with `createClient()`)
- Server actions for mutations (`'use server'` with role checks)
- Admin auth check via `getAdminUser()` (returns null for non-admins)
- Consultant auth check via `getAuthenticatedUser()` (returns null for unauthenticated)
- Dark mode via `next-themes`, brand blue `#4287FF` accent
- Role checking via `user.app_metadata.role` or `user.user_metadata.demo_role`
- URL state management via `nuqs` for filter parameters
- Toast notifications via `sonner`

### Integration Points
- `app/(app)/review/` — New route group for admin review pages
- `app/(app)/review/[suggestionId]/` — Review detail page
- `components/app-sidebar.tsx` — Activate "Review Queue" nav item, add pending count badge
- `components/engagements/fork-sidebar.tsx` — Add merge suggestion section at bottom
- `lib/data/` — New data access functions for merge suggestions
- `lib/types/` — Extend ForkedPrompt type or create MergeSuggestion view type
- `app/(app)/engagements/[id]/forks/[forkId]/actions.ts` — Add `suggestMerge` action
- `app/(app)/review/actions.ts` — New admin actions: `approveMerge`, `declineMerge`

</code_context>

<specifics>
## Specific Ideas

- Merge suggestion is a single-textarea dialog — friction-free, fork context travels with it automatically
- No rating gate — consultants can suggest merges anytime, rating is optional signal
- Status badge lifecycle on fork: none → Pending Review (amber) → Merged ✓ (green) or Declined (red with reason)
- Declined merges allow resubmission — consultant can revise and try again
- Review queue activates the Phase 1 placeholder sidebar item — product feels complete as features light up
- Pending count badge on sidebar gives admins ambient awareness without checking the page
- Review detail mirrors fork detail two-column layout — consistent spatial pattern across the app
- Admin can edit content before approving — handles minor tweaks without decline-resubmit round trips
- Decline requires a reason — consultants always understand why, can improve and resubmit
- Version bump + changelog on approve creates audit trail in the already-deployed `prompt_changelog` table

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-merge-workflow*
*Context gathered: 2026-03-25*
