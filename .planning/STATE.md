---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: Ready to execute
stopped_at: Completed 04-00-PLAN.md — Wave 0 test stubs
last_updated: "2026-03-26T11:43:30.801Z"
progress:
  total_phases: 5
  completed_phases: 3
  total_plans: 19
  completed_plans: 15
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-25)

**Core value:** Every engagement makes the firm smarter — field-tested prompt improvements flow back into the central library through a Git-like checkout/fork/merge workflow.
**Current focus:** Phase 04 — merge-workflow

## Current Position

Phase: 04 (merge-workflow) — EXECUTING
Plan: 2 of 5

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

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 1]: Validate Auth Hook activation (writing roles into JWT `app_metadata`) end-to-end before any RLS policy relies on role claims
- [Phase 1]: Smoke-test anonymous user isolation under RLS with two concurrent demo sessions before finalizing seed data
- [Phase 4]: Confirm diff viewer dark mode theming (`react-diff-viewer-continued` vs `@git-diff-view/react`) before committing to implementation

## Session Continuity

Last session: 2026-03-26T11:43:30.799Z
Stopped at: Completed 04-00-PLAN.md — Wave 0 test stubs
Resume file: None
