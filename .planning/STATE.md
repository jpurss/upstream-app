---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: Milestone complete
stopped_at: Completed 05-05-PLAN.md
last_updated: "2026-03-26T19:34:59.286Z"
progress:
  total_phases: 5
  completed_phases: 5
  total_plans: 26
  completed_plans: 26
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-25)

**Core value:** Every engagement makes the firm smarter — field-tested prompt improvements flow back into the central library through a Git-like checkout/fork/merge workflow.
**Current focus:** Phase 05 — demand-board-and-dashboard

## Current Position

Phase: 05
Plan: Not started

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
| Phase 01 P01 | 11 | 2 tasks | 22 files |
| Phase 01 P01 | 45 | 3 tasks | 16 files |
| Phase 01 P02 | 25 | 2 tasks | 9 files |
| Phase 02 P01 | 3 | 3 tasks | 21 files |
| Phase 02-prompt-library P03 | 4 | 2 tasks | 6 files |
| Phase 02 P02 | 5 | 3 tasks | 11 files |
| Phase 02-prompt-library P04 | 11 | 3 tasks | 13 files |
| Phase 03-engagement-workspace P01 | 203 | 2 tasks | 10 files |
| Phase 03-engagement-workspace P02 | 3 | 2 tasks | 5 files |
| Phase 03-engagement-workspace P03 | 4 | 2 tasks | 5 files |
| Phase 03-engagement-workspace P04 | 4 | 2 tasks | 8 files |
| Phase 03-engagement-workspace P05 | 4 | 2 tasks | 10 files |
| Phase 03-engagement-workspace P06 | 3 | 2 tasks | 6 files |
| Phase 03-engagement-workspace P07 | 8 | 2 tasks | 5 files |
| Phase 04-merge-workflow P00 | 2 | 2 tasks | 6 files |
| Phase 04-merge-workflow P01 | 3 | 2 tasks | 10 files |
| Phase 04-merge-workflow P02 | 3 | 2 tasks | 4 files |
| Phase 04-merge-workflow P03 | 4 | 2 tasks | 6 files |
| Phase 04-merge-workflow P04 | 6 | 2 tasks | 10 files |
| Phase 04-merge-workflow P05 | 224 | 2 tasks | 6 files |
| Phase 05-demand-board-and-dashboard P01 | 4 | 2 tasks | 13 files |
| Phase 05-demand-board-and-dashboard P04 | 12 | 2 tasks | 9 files |
| Phase 05-demand-board-and-dashboard P02 | 6 | 2 tasks | 12 files |
| Phase 05-demand-board-and-dashboard P03 | 5 | 2 tasks | 7 files |
| Phase 05-demand-board-and-dashboard P05 | 260 | 2 tasks | 3 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Pre-build]: Two roles only — consultant and admin (no lead role in v1)
- [Pre-build]: Demo bypass uses `signInAnonymously()` for per-session isolation — not a shared hardcoded account
- [Pre-build]: RBAC stored in `app_metadata` via Auth Hook (not `user_metadata`) — prevents self-elevation
- [Pre-build]: Fork captures `original_content` snapshot at fork time — diff never breaks when parent updates
- [Pre-build]: Merge request status is a PostgreSQL enum (`pending | approved | rejected | merged`) — not boolean columns
- [Phase 01]: Used geist npm package for fonts instead of next/font/google — consistent with RESEARCH.md recommendation for developer tools
- [Phase 01]: shadcn 4.x preset system changed — zinc-dark not available, CSS variables overridden manually in globals.css for zinc-950/900/800 dark palette with #4287FF primary
- [Phase 01]: proxy.ts confirmed as Next.js 16 rename of middleware.ts — named export 'proxy' required (not 'middleware')
- [Phase 01]: RLS role check: always use auth.jwt()->'app_metadata'->>'role', never auth.role() — prevents privilege escalation via user_metadata self-edit
- [Phase 01]: proxy.ts naming convention confirmed correct for Next.js 16 — middleware.ts was renamed
- [Phase 01]: Auth Hook deployed: custom_access_token_hook injects role from profiles into JWT app_metadata on every token issue
- [Phase 01]: Used useTransition for demo buttons (not useActionState) since signInAsDemo takes role arg not FormData
- [Phase 01]: signOut placed in lib/auth-utils.ts for sidebar reuse — avoids awkward import from login/actions.ts
- [Phase 02]: fetchPromptById does NOT filter by status per D-14 — deprecated prompts remain accessible at direct URLs
- [Phase 02]: Added PROMPT_CATEGORIES runtime constant to lib/types/prompt.ts to enable runtime category value testing
- [Phase 02-03]: Active Forks hardcoded to 0 in sidebar stats — forks table query deferred to Phase 3 per plan spec
- [Phase 02]: FilterBar and FilterChips implemented in Task 1 (dependency of LibraryGrid) — Task 2 tests validate existing implementation
- [Phase 02]: LibraryGrid uses useMemo for client-side filtering and separate state for Supabase search results — avoids Pitfall 5 (search overrides initial prompts)
- [Phase 02-prompt-library]: Server Actions handle mutations with RLS as security gate and server-side role check as defense-in-depth
- [Phase 02-prompt-library]: deprecatePrompt returns {success: true} with no redirect — called from client dialog which handles navigation
- [Phase 02-prompt-library]: Admin controls conditionally rendered (not disabled, not hidden via CSS) — consultant sees clean read-only library
- [Phase 02-polish]: Filter bar restructured with progressive disclosure — Search/Sort/View always visible, taxonomy filters behind "Filters" toggle button with count badge
- [Phase 02-polish]: Content typography hierarchy differentiated — H1 18px with border-b, H2 16px, H3 14px, all sans-serif headings against mono body
- [Phase 02-polish]: Card star fill now conditional (filled >= 4.0, outline below), deprecated cards dimmed, descriptions expanded to 2 lines
- [Phase 02-polish]: Card left border: transparent by default, transitions to brand blue on hover (was gold border-l-2, removed for visual redundancy with star)
- [Phase 02-polish]: Search ilike queries escape special characters; search loading uses Loader2 spinner; star ratings have aria-label accessibility
- [Phase 02-polish]: Copy button relabeled "Copy Prompt", back link uses ArrowLeft icon with hover:text-foreground
- [Phase 03-engagement-workspace]: Server actions for engagements use regular Supabase client — RLS engagements_own policy enforces ownership
- [Phase 03-engagement-workspace]: Role-based redirect (D-01): consultants land on /engagements after login, admins land on /library
- [Phase 03-engagement-workspace]: Sidebar active state uses pathname.startsWith(item.href) — handles nested routes correctly
- [Phase 03-engagement-workspace]: NewEngagementDialog manages open state via useState — renders own Button trigger, avoids prop chain for empty state CTA
- [Phase 03-engagement-workspace]: Active prompts passed as server-fetched props to NewEngagementDialog — consistent with library page pattern, no client-side Supabase in modal
- [Phase 03-engagement-workspace]: onForkSelected is a prop callback stub — wired in Plan 04 when createFork server action exists
- [Phase 03-engagement-workspace]: base-ui Select onValueChange receives (value | null) — null guard required before casting to EngagementStatus
- [Phase 03-engagement-workspace]: ForkCard inline getRelativeTime helper — extract to lib/utils/date.ts when Plan 04-05 adds second consumer
- [Phase 03-engagement-workspace]: onForkClick not wired in workspace page — prompt picker modal (Plan 04) will add client wrapper
- [Phase 03-engagement-workspace]: [Phase 03-fork-workflow]: total_checkouts increment uses read-then-write — no RPC function in schema; acceptable for v1 low concurrency
- [Phase 03-engagement-workspace]: [Phase 03-fork-workflow]: WorkspaceClient thin wrapper isolates modal open state from server component — avoids prop drilling onForkClick through server tree
- [Phase 03-engagement-workspace]: [Phase 03-fork-workflow]: ForkToEngagementDialog filters to active engagements only — forking into paused/completed engagements is low-value UX
- [Phase 03-engagement-workspace]: ForkDetailClient as client orchestrator wrapper — page.tsx stays a pure server component; ForkEditor and ForkSidebar manage their own state independently
- [Phase 03-engagement-workspace]: Preview tab uses inline ReactMarkdown (not MarkdownPreview) — MarkdownPreview has its own Write/Preview tabs that would conflict with ForkEditor Tabs
- [Phase 03-engagement-workspace]: Per-field autosave: useRef+setTimeout debounce (NOT useEffect) with separate useTransition per field group to prevent cross-field blocking
- [Phase 03-engagement-workspace]: Admin client (service role) used for profile provisioning — regular client cannot INSERT to profiles due to RLS + auth hook REVOKE
- [Phase 03-engagement-workspace]: Engagement name auto-generated as ClientName — Mon YYYY, removing superfluous manual naming field; ignoreDuplicates:true on signIn upsert preserves admin-assigned roles
- [Phase 03-engagement-workspace]: Only redirect exact /library path — not /library/* — so consultants retain access to individual prompt detail pages
- [Phase 03-engagement-workspace]: ForkGrid moved inside WorkspaceClient to share pickerOpen state — both WorkspaceHeader and empty-state CTA now call setPickerOpen(true)
- [Phase 03-engagement-workspace]: showLabel prop on StarRating (default true) — renders label on fork detail sidebar, hidden on compact fork cards via showLabel={false}
- [Phase 04-merge-workflow]: it.todo() used for Wave 0 stubs — todos appear in vitest output without failing, admin client mock separated from server client mock in approve/decline files
- [Phase 04-merge-workflow]: Admin client (createAdminClient) used for all merge data queries — RLS forked_prompts_own only grants access to fork owner, service role required for admin review
- [Phase 04-merge-workflow]: getAdminUser() in review/actions.ts is self-contained copy — server actions cannot import helpers across 'use server' file boundaries
- [Phase 04-merge-workflow]: suggestMerge clears merge_decline_reason on resubmission — allows declined consultant to revise and resubmit cleanly without stale prior reason
- [Phase 04-merge-workflow]: MergeSuggestionSection uses statusConfig object keyed by merge_status — avoids switch chains for 4-state rendering
- [Phase 04-merge-workflow]: pendingMergeCount defaults to 0 in AppSidebar — layout only passes real count when effectiveRole === admin, consultants unaffected
- [Phase 04-merge-workflow]: StarRating.onRate made optional to support read-only display in review queue and review detail sidebar
- [Phase 04-merge-workflow]: Review queue filter tabs use router.push for URL state — triggers server re-fetch on tab change, simpler than nuqs for this use case
- [Phase 04-merge-workflow]: redirect() mock in server component tests must throw to correctly simulate Next.js halt-on-redirect behavior
- [Phase 04-merge-workflow]: DiffViewer leftTitle/rightTitle props use defaults — existing fork-detail usage unchanged, review detail passes 'Library (current)'/'Fork (adapted)'
- [Phase 04-merge-workflow]: IssueTagGroup.onToggle made optional for read-only contexts — mirrors StarRating.onRate pattern from Plan 03
- [Phase 04-merge-workflow]: Inline decline form (no modal) — required non-empty textarea IS the confirmation gate per UI-SPEC
- [Phase 04-merge-workflow]: DiffViewer showDiffOnly default changed from false to true — fork-detail-client must pass showDiffOnly={false} explicitly (Plan 06)
- [Phase 04-merge-workflow]: AlertDialogTrigger receives trigger as ReactNode child (not render prop) in ApproveConfirmDialog — cleaner parent-controlled trigger API
- [Phase 04-merge-workflow]: ReviewContentEditor fully rewritten — old collapsible pattern deleted, replaced with always-visible textarea panel with originalContent/onReset props
- [Phase 04]: ReviewActionBar uses sticky bottom-0 with -mx-6 -mb-6 pattern — extends to page container edges without sidebar offset calculation
- [Phase 04]: ReviewSidebar deleted — replaced by ReviewContextBar (horizontal metadata bar) + ReviewActionBar (sticky bottom bar) in the new stacked layout
- [Phase 05-demand-board-and-dashboard]: recharts@^2.15.4 installed (v2 not v3) per D-12 — v3 has breaking API changes
- [Phase 05-demand-board-and-dashboard]: getRelativeTime extracted to lib/utils/date.ts — was inline in review-queue-card, demand board is second consumer
- [Phase 05-demand-board-and-dashboard]: Data layer stubs created as empty comment-only files — Plans 02 and 04 fill them in
- [Phase 05-04]: Dashboard admin gate redirects to /library (not /engagements) — non-admin users belong in library per D-01
- [Phase 05-04]: Recharts chart config encapsulated inside wrapper components — parents pass typed data arrays only, no Recharts internals at page level
- [Phase 05-04]: Dark mode Recharts colors hardcoded as inline props — Recharts cannot inherit CSS variables (#4287FF line, #FFB852 opened, #65CFB2 resolved)
- [Phase 05-04]: JS-side date grouping for usage/demand charts — Supabase JS client lacks date_trunc, fetch raw rows and group in-memory
- [Phase 05-demand-board-and-dashboard]: Demand board accessible to all authenticated users — no admin gate in demand/page.tsx per D-08 (consultants see read-only cards)
- [Phase 05-demand-board-and-dashboard]: Upvote sort is JS-side after data mapping — Supabase cannot ORDER BY aggregate join count from request_upvotes
- [Phase 05-demand-board-and-dashboard]: getRelativeTime extracted from review-queue-card.tsx to lib/utils/date.ts as shared utility
- [Phase 05-demand-board-and-dashboard]: ResolveRequestDialog owned by DemandBoardClient — RequestCard emits onResolveClick callback, client holds dialog state
- [Phase 05-demand-board-and-dashboard]: Active prompts fetched server-side only for admin role in demand page — avoids unnecessary admin DB call for consultants
- [Phase 05-demand-board-and-dashboard]: Demo seed claim uses admin client to transfer placeholder UUID ownership to new anonymous session on signInAsDemo — works around per-session UUID isolation
- [Phase 05-demand-board-and-dashboard]: Admin post-login landing changed from /library to /dashboard — dashboard now exists and is the correct admin home

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 1]: Validate Auth Hook activation (writing roles into JWT `app_metadata`) end-to-end before any RLS policy relies on role claims
- [Phase 1]: Smoke-test anonymous user isolation under RLS with two concurrent demo sessions before finalizing seed data
- [Phase 4]: Confirm diff viewer dark mode theming (`react-diff-viewer-continued` vs `@git-diff-view/react`) before committing to implementation

- [Phase 04-merge-workflow]: DiffViewer showDiffOnly default changed from false to true — fork-editor must pass showDiffOnly={false} explicitly (done in Plan 06)
- [Phase 04-merge-workflow]: AlertDialogTrigger receives trigger as ReactNode child in ApproveConfirmDialog — cleaner parent-controlled trigger API
- [Phase 04-merge-workflow]: ReviewContentEditor fully rewritten — old collapsible pattern deleted, replaced with always-visible textarea panel with originalContent/onReset props
- [Phase 04-merge-workflow]: ReviewActionBar uses sticky bottom-0 with -mx-6 -mb-6 pattern — extends to page container edges without sidebar offset calculation
- [Phase 04-merge-workflow]: ReviewSidebar deleted — replaced by ReviewContextBar (horizontal metadata bar) + ReviewActionBar (sticky bottom bar) in the new stacked layout

## Session Continuity

Last session: 2026-03-26T19:27:57.015Z
Stopped at: Completed 05-05-PLAN.md
Resume file: None
