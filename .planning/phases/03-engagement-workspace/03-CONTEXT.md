---
description: Phase 3 implementation decisions for Upstream Engagement Workspace — engagement list, fork creation flow, fork editing with autosave, rating/feedback/diff, and role-based landing page.
date_last_edited: 2026-03-25
---

# Phase 3: Engagement Workspace - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Consultants can create client engagements, fork prompts into them, adapt and annotate forked content, rate effectiveness, add feedback, and view diffs between original and adapted versions — completing the core "GitHub for Prompts" loop. This phase builds on the deployed schema (engagements, forked_prompts tables already exist), auth system, and prompt library from Phases 1-2. No merge workflow, no demand board, no dashboard.

Requirements: ENG-01, ENG-02, ENG-03, ENG-04, FORK-01, FORK-02, FORK-03, FORK-04, FORK-05, FORK-06, FORK-07

</domain>

<decisions>
## Implementation Decisions

### Role-Based Landing Page
- **D-01:** Consultants land on the Engagements page after login (their daily workspace). Admins land on the Library page (their management surface). Overrides Phase 1 D-07 for consultants only.

### Engagement List
- **D-02:** Card grid layout for the engagement list page. Each engagement card shows: name, client name, industry badge, status indicator (colored dot), fork count, and last activity relative date. Consistent with the library's card grid pattern.
- **D-03:** "New Engagement" button in the page header. When engagements exist, it's a secondary-style button. When no engagements exist, it's the hero CTA in the empty state.
- **D-04:** Empty state: centered icon + "Create your first engagement" headline, brief explainer ("Fork prompts into client workspaces, adapt them, and rate what works"), prominent "New Engagement" button, and a subtle "or Browse the Library →" link.

### Create Engagement Flow
- **D-05:** Modal dialog with 3 fields: Name (text), Client Name (text), Industry (dropdown). Simple — only 3 fields don't justify a full page. Stays on the engagements page.
- **D-06:** After creating an engagement, an optional second step shows a prompt picker: "Add prompts to get started" with a searchable list of library prompts. User can select 1+ prompts to fork immediately, or skip to enter an empty workspace.

### Engagement Workspace
- **D-07:** Workspace header shows: engagement name (H1), client name, industry badge, status dropdown, fork count, and avg effectiveness across forks. Full context at a glance.
- **D-08:** Status changes via dropdown in the workspace header. Click the status badge to reveal options: Active, Paused, Completed. Completing triggers a confirmation dialog. Inline, fast, no page navigation.
- **D-09:** Forked prompts displayed as a card grid within the workspace. "+ Fork a Prompt" button in the workspace header area.

### Fork Cards (Minimal, Work-Focused)
- **D-10:** Fork cards are minimal work-status trackers, NOT prompt previews. Library metadata (category, model, etc.) is irrelevant once forked — the consultant already chose the prompt. Cards show: prompt title, customization status (template fields like `{{client_name}}` filled in?), adaptation status (content changed beyond templates?), and last edited relative date.
- **D-11:** Click a fork card to navigate to the fork detail page.

### Fork Creation Flow — Three Entry Points
- **D-12:** Entry point 1: "Fork to Engagement" button on the prompt detail page sidebar. Opens a dialog listing the user's active engagements. Select one, click Fork.
- **D-13:** Entry point 2: "+ Fork a Prompt" button in the engagement workspace. Opens a full-screen modal with a mini library browse view (searchable, filterable card grid). User selects 1+ prompts, clicks Fork. Reuses existing LibraryGrid filtering logic.
- **D-14:** Entry point 3: Optional prompt picker step during engagement creation (D-06).
- **D-15:** If no engagements exist when forking from prompt detail, the dialog shows "Create one first" with an inline create button.
- **D-16:** Prevent duplicate forks — if a prompt is already forked into the selected engagement, show it as "Already forked" (grayed out) in the picker. One fork per prompt per engagement.

### Fork Detail Page
- **D-17:** Dedicated page at `/engagements/[id]/forks/[forkId]` with two-column layout: wide markdown editor on the left (Write/Preview/Diff tabs), narrow metadata sidebar on the right. Mirrors the library detail page layout pattern.
- **D-18:** Autosave with debounce (1-2 seconds of inactivity). Subtle "Saving..." / "Saved" indicator in the header. No explicit save button. Notion/Linear style.
- **D-19:** Write/Preview tabs reuse the Phase 2 pattern (plain textarea in Write, rendered markdown in Preview). Diff is a third tab.
- **D-20:** Back link at top: "← Back to [Engagement Name]"

### Fork Sidebar (Metadata + Feedback)
- **D-21:** Sidebar contains: effectiveness rating (5 clickable stars, instant autosave), issue tags (toggle badges), feedback notes (freeform textarea), client context checkbox, adaptation notes textarea, source prompt link, fork date.
- **D-22:** Issue tags displayed as clickable badge-style toggles: hallucination, too_verbose, wrong_format, model_degradation, needs_context. Click to toggle on/off. Active tags highlighted, inactive muted. Autosave on toggle.
- **D-23:** Freeform feedback notes textarea below the issue tags for anything not covered by structured tags. Autosave.

### Diff View
- **D-24:** Diff is the third tab (Write / Preview / Diff) on the fork detail page editor area. Shows side-by-side comparison: original_content (at fork time) on the left, adapted_content on the right. Uses a diff library.
- **D-25:** Side-by-side layout (not unified). Standard GitHub PR review pattern. Original labeled "Original" and adapted labeled "Adapted".

### Claude's Discretion
- Diff library choice (react-diff-viewer-continued, @git-diff-view/react, or similar — check dark mode theming per STATE.md blocker)
- Engagement card dimensions, spacing, and hover effects
- Fork card visual design for customization/adaptation status indicators
- Prompt picker modal layout details and filter subset
- Industry dropdown values
- Autosave debounce timing (1-2 seconds range)
- Loading skeletons for engagement list, workspace, and fork detail
- Toast notifications for fork creation success
- URL structure for engagement routes beyond the decided `/engagements/[id]/forks/[forkId]`

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### PRD & Data Model
- `upstream-prd.md` §4 — Core data model (Engagement, ForkedPrompt entities and relationships)
- `upstream-prd.md` §7.2 — Database schema (engagements, engagement_members, forked_prompts tables — already deployed)
- `upstream-prd.md` §7.3 — RLS policies (engagements_own, forked_prompts_own, engagement_members_read)

### Requirements
- `.planning/REQUIREMENTS.md` — ENG-01 through ENG-04, FORK-01 through FORK-07 acceptance criteria

### UI/UX Direction
- `upstream-prd.md` §8 — UI/UX principles, design direction, key interactions
- `.impeccable.md` — Design system: color palette, typography, spacing, component principles

### Prior Phase Context
- `.planning/phases/01-foundation/01-CONTEXT.md` — Auth, schema, navigation decisions (D-07 overridden for consultants by D-01 above)
- `.planning/phases/02-prompt-library/02-CONTEXT.md` — Library layout, card patterns, Write/Preview tabs, admin controls, filter bar — all reusable patterns

### Known Blockers
- `.planning/STATE.md` — Blocker: "Confirm diff viewer dark mode theming (react-diff-viewer-continued vs @git-diff-view/react) before committing to implementation"

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/library/library-grid.tsx` — Client-side filtering/sorting with `nuqs` URL state. Reusable pattern for engagement list and prompt picker modal.
- `components/library/filter-bar.tsx` — Search + filter controls. Can be adapted for prompt picker in fork creation.
- `components/library/prompt-card.tsx` — Card display pattern. Reference for engagement and fork card designs.
- `components/library/prompt-detail-sidebar.tsx` — Two-column detail layout with metadata sidebar. Fork detail page mirrors this.
- `components/library/prompt-form.tsx` — Write/Preview tab pattern for markdown editing. Reusable for fork content editor.
- `components/library/markdown-preview.tsx` — Markdown renderer for Preview tab.
- `components/ui/alert-dialog.tsx` — Confirmation dialogs (engagement completion, deprecation pattern).
- `components/ui/badge.tsx` — Status and category badges for engagement cards.
- `components/ui/tabs.tsx` — Tab component for Write/Preview/Diff.
- `components/app-sidebar.tsx` — Sidebar nav with disabled "Engagements" item to enable.
- `lib/supabase/admin.ts` — Admin client for service-role operations.

### Established Patterns
- Server components for initial data fetching (async page components with `createClient()`)
- Server actions for mutations (`'use server'` with role checks via `getAdminUser()` pattern — adapt for consultant actions)
- Client-side Supabase for real-time filtering/search (browser client in `lib/supabase/client.ts`)
- URL state management via `nuqs` for filter/sort parameters
- Role checking via `user.app_metadata.role` or `user.user_metadata.demo_role` for anonymous users
- Dark mode via `next-themes`, brand blue `#4287FF` accent

### Integration Points
- `app/(app)/engagements/` — New route group for engagement pages
- `app/(app)/engagements/[id]/` — Engagement workspace page
- `app/(app)/engagements/[id]/forks/[forkId]/` — Fork detail page
- `components/app-sidebar.tsx` — Enable "Engagements" nav item
- `components/library/prompt-detail-sidebar.tsx` — Add "Fork to Engagement" button, replace hardcoded "0" active forks with real count
- `lib/data/` — New data access functions for engagements and forks
- `lib/types/` — New Engagement and ForkedPrompt type definitions
- `proxy.ts` — May need route protection updates for engagement routes
- Database: `engagements`, `engagement_members`, `forked_prompts` tables with RLS already deployed

</code_context>

<specifics>
## Specific Ideas

- Consultants land on Engagements after login — this is their daily workspace, not the library
- Empty state guides first-time users with context about what engagements are and a link to browse the library
- Fork cards strip away library metadata — focus on work status: customized? adapted? when last touched?
- Three fork entry points cover all workflows: from prompt detail, from workspace, and during engagement creation
- Post-creation prompt picker lets users bootstrap an engagement with initial forks in one flow
- Autosave everywhere — editing, rating, feedback, issue tags all save on change. No save buttons.
- Diff as a tab alongside Write/Preview — natural editing flow progression: write it, preview it, compare it
- Feedback combines structured (toggle badges for common issues) and freeform (textarea for anything else)
- One fork per prompt per engagement — prevents confusion, grayed out in picker if already forked

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-engagement-workspace*
*Context gathered: 2026-03-25*
