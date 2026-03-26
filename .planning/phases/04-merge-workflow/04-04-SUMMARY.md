---
description: Summary for Phase 04 Plan 04 — Review detail page with two-column diff layout, ReviewSidebar with 7 sections, ReviewContentEditor (collapsible admin edit), DeclineReasonForm (inline expand), and admin-gated server page. Completes the full merge workflow loop.
date_last_edited: 2026-03-26
phase: "04-merge-workflow"
plan: "04"
subsystem: "merge-workflow"
tags: ["review-detail", "diff-viewer", "approve-merge", "decline-merge", "tdd", "ui"]
dependency_graph:
  requires: ["04-01", "04-03"]
  provides: ["review-detail-page", "review-sidebar", "review-content-editor", "decline-reason-form"]
  affects: ["review-queue-page", "fork-detail-sidebar"]
tech_stack:
  added: []
  patterns: ["collapsible-admin-edit", "inline-decline-flow", "two-column-review-layout", "admin-gate-server-component"]
key_files:
  created:
    - components/review/review-content-editor.tsx
    - components/review/review-detail-client.tsx
    - components/review/review-sidebar.tsx
    - components/review/decline-reason-form.tsx
    - app/(app)/review/[suggestionId]/page.tsx
    - app/(app)/review/[suggestionId]/loading.tsx
  modified:
    - components/engagements/diff-viewer.tsx
    - components/engagements/issue-tag-group.tsx
    - components/review/review-queue-card.tsx
    - tests/merge-diff.test.tsx
decisions:
  - "DiffViewer leftTitle/rightTitle props default to 'Original'/'Adapted' — existing fork-detail usage unchanged, review detail passes 'Library (current)'/'Fork (adapted)'"
  - "IssueTagGroup.onToggle made optional — read-only mode when omitted, interactive when provided. Mirrors StarRating.onRate pattern from Plan 03."
  - "DeclineReasonForm is an inline expand (not a modal) — the required reason textarea IS the confirmation pattern per UI-SPEC destructive confirmation contract"
  - "ReviewSidebar uses router.push('/review') on both approve and decline paths — client-side redirect after server action success"
metrics:
  duration_minutes: 6
  completed_date: "2026-03-26"
  tasks_completed: 2
  files_modified: 10
---

# Phase 04 Plan 04: Review Detail Page Summary

**One-liner:** Review detail page at /review/[suggestionId] with two-column diff layout (DiffViewer with custom titles + collapsible content editor on left, 7-section ReviewSidebar with approve/inline-decline actions on right), completing the full merge workflow loop.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | DiffViewer title props + ReviewDetailClient + ReviewContentEditor | ddec490 | components/engagements/diff-viewer.tsx, components/review/review-content-editor.tsx, components/review/review-detail-client.tsx, tests/merge-diff.test.tsx |
| 2 | ReviewSidebar + DeclineReasonForm + review detail page | a55fc67 | components/review/review-sidebar.tsx, components/review/decline-reason-form.tsx, app/(app)/review/[suggestionId]/page.tsx, app/(app)/review/[suggestionId]/loading.tsx, components/engagements/issue-tag-group.tsx, components/review/review-queue-card.tsx |

## Verification

- `npx tsc --noEmit` — passes with zero errors
- `npm test -- tests/merge-data.test.ts tests/merge-suggest.test.ts tests/merge-approve.test.ts tests/merge-decline.test.ts tests/merge-diff.test.tsx tests/review-queue.test.ts` — 30 tests pass across all 6 phase 04 test files
- `app/(app)/review/[suggestionId]/page.tsx` exists as server component with admin gate
- DiffViewer accepts optional `leftTitle`/`rightTitle` props; defaults preserved for existing usage
- Empty state message updated to "No differences found."
- ReviewDetailClient two-column layout: `flex-1` left + `w-[280px]` right
- ReviewSidebar renders 7 sections using `py-4 border-t border-border` pattern
- DeclineReasonForm: "Confirm Decline" disabled when textarea empty
- Both approve and decline flows redirect to `/review` on success

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added missing `@testing-library/jest-dom` import to merge-diff.test.tsx**
- **Found during:** Task 1 RED step
- **Issue:** The Wave 0 stub file was created without the `@testing-library/jest-dom` import. Tests using `toHaveTextContent` and `toBeInTheDocument` threw "Invalid Chai property" errors because jest-dom matchers weren't loaded.
- **Fix:** Added `import '@testing-library/jest-dom'` to the test file — consistent with all other tsx test files in the project (demo-banner.test.tsx, library-grid.test.tsx, etc.)
- **Files modified:** tests/merge-diff.test.tsx
- **Commit:** ddec490

**2. [Rule 2 - Missing critical functionality] Made IssueTagGroup.onToggle optional**
- **Found during:** Task 2 — creating ReviewSidebar
- **Issue:** `IssueTagGroup` required `onToggle` as non-optional, but the plan specifies read-only display in ReviewSidebar (Section 3). TypeScript would reject the component without this fix.
- **Fix:** Changed `onToggle: (tags: IssueTag[]) => void` to `onToggle?: (tags: IssueTag[]) => void`. Added `isReadOnly` flag — when read-only, buttons are `disabled` with `cursor-default`. Mirrors the StarRating.onRate pattern from Plan 03.
- **Files modified:** components/engagements/issue-tag-group.tsx
- **Commit:** a55fc67

**3. [Rule 1 - Bug] Removed invalid `asChild` prop from base-ui TooltipTrigger**
- **Found during:** Task 2 TypeScript check
- **Issue:** `review-queue-card.tsx` (Plan 03) used `<TooltipTrigger asChild>` — a Radix UI pattern. The base-ui `TooltipTrigger` has no `asChild` prop, causing TS2322 error.
- **Fix:** Removed `asChild` attribute. base-ui `TooltipTrigger` wraps children directly without needing `asChild`.
- **Files modified:** components/review/review-queue-card.tsx
- **Commit:** a55fc67

## Decisions Made

1. **Custom title props on DiffViewer use defaults** — Adding `leftTitle?: string` and `rightTitle?: string` with defaults `'Original'` and `'Adapted'` means all existing uses of DiffViewer (fork-detail) remain unchanged. Review detail passes `'Library (current)'` and `'Fork (adapted)'` to match UI-SPEC.

2. **IssueTagGroup read-only mode matches StarRating pattern** — Both components now follow the same pattern: interactive behavior is opt-in via an optional callback prop. When the callback is omitted, the component renders read-only with disabled buttons and `cursor-default`.

3. **Inline decline form (no modal)** — Per UI-SPEC and CONTEXT.md, the decline flow expands inline below the "Decline" button. The required non-empty textarea IS the confirmation gate — no separate modal needed. This is less friction than a modal while still preventing accidental declines.

4. **ReviewSidebar uses router.push on both paths** — After `approveMerge` or `declineMerge` succeeds, `router.push('/review')` handles the redirect client-side. This is consistent with the pattern from other client action flows in the codebase.

## Known Stubs

None — all components are fully wired with real server actions. The complete merge workflow loop is now functional:
1. Consultant forks prompt → edits in workspace
2. Consultant submits merge suggestion via MergeSuggestionSection
3. Admin sees pending count badge in sidebar nav
4. Admin visits /review → sees ReviewQueueCard list
5. Admin clicks card → /review/[suggestionId] → ReviewDetailClient
6. Admin reviews diff, optionally edits content, then approves (version bump + changelog) or declines (reason stored)
7. Both paths redirect to /review

## Self-Check: PASSED
