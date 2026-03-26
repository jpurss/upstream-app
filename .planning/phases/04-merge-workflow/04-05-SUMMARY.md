---
description: "Gap closure Plan 05 — builds four leaf components for the review detail page redesign: enhanced DiffViewer with showDiffOnly, new ReviewContextBar (horizontal metadata bar), rewritten ReviewContentEditor (full-width panel), and new ApproveConfirmDialog (version-aware AlertDialog)."
date_last_edited: 2026-03-26
phase: 04-merge-workflow
plan: "05"
subsystem: review
tags: [review, diff, components, alert-dialog, tdd]
dependency_graph:
  requires: [04-04]
  provides: [review-context-bar, approve-confirm-dialog, review-content-editor-v2, diff-viewer-v2]
  affects: [review-detail-client, fork-detail-client]
tech_stack:
  added: []
  patterns: [AlertDialog-trigger-as-ReactNode, TDD-RED-GREEN, horizontal-metadata-bar]
key_files:
  created:
    - components/review/review-context-bar.tsx
    - components/review/approve-confirm-dialog.tsx
  modified:
    - components/engagements/diff-viewer.tsx
    - components/review/review-content-editor.tsx
    - components/review/review-detail-client.tsx
    - tests/merge-diff.test.tsx
decisions:
  - "DiffViewer showDiffOnly default changed from false to true — existing fork-detail-client usage must pass showDiffOnly={false} explicitly (handled in Plan 06)"
  - "AlertDialogTrigger receives trigger as ReactNode child (not render prop) — cleaner API for parent-controlled trigger styling"
  - "ReviewContentEditor fully rewritten — old collapsible pattern deleted, replaced with always-visible textarea panel"
  - "review-detail-client updated immediately to pass new required props (originalContent, onReset) — prevents TypeScript error until Plan 06 replaces it"
metrics:
  duration_seconds: 224
  completed_date: "2026-03-26"
  tasks_completed: 2
  files_changed: 6
---

# Phase 04 Plan 05: Leaf Components for Review Detail Redesign — Summary

**One-liner:** Four leaf components built with TDD — enhanced DiffViewer with showDiffOnly toggle, horizontal ReviewContextBar replacing the 280px sidebar, rewritten ReviewContentEditor as a full-width panel, and version-aware ApproveConfirmDialog using AlertDialog.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | DiffViewer showDiffOnly + ReviewContextBar + ReviewContentEditor rewrite | 0316e1b | diff-viewer.tsx, review-content-editor.tsx, review-context-bar.tsx (new), review-detail-client.tsx, tests/merge-diff.test.tsx |
| 2 | ApproveConfirmDialog with version-aware copy | 15c4580 | approve-confirm-dialog.tsx (new) |

## What Was Built

### DiffViewer enhancement (`components/engagements/diff-viewer.tsx`)
Added two new optional props:
- `showDiffOnly?: boolean` — default changed from hardcoded `false` to `true`. Long prompts with minor changes are now scannable by default.
- `extraLinesSurroundingDiff?: number` — defaults to 3 lines of context around each change.

**Breaking default change:** Existing consumers that relied on `showDiffOnly={false}` behavior must now pass it explicitly. The fork-detail-client.tsx and review-detail-client.tsx both use `DiffViewer` and will be addressed in Plan 06.

### ReviewContextBar (`components/review/review-context-bar.tsx`) — new file
Horizontal metadata bar replacing the 280px sidebar. Single-band compact display with:
- Row 1: Suggested by | Engagement (link with ExternalLink icon) | Rating (StarRating read-only) | Issues (IssueTagGroup read-only, omitted if empty)
- Row 2: Merge note with `line-clamp-2` truncation and tooltip showing full text on hover
- "More context" expandable toggle revealing feedback_notes, adaptation_notes, and contains_client_context

### ReviewContentEditor rewrite (`components/review/review-content-editor.tsx`)
Complete rewrite — the old collapsible pattern (ChevronDown, useState isExpanded) is gone. New always-visible full-width textarea panel:
- Props: `content`, `originalContent`, `onChange`, `onReset`
- Helper text explains purpose (13px, muted)
- `Textarea` with `min-h-[400px] font-mono text-[13px] leading-[1.6] bg-card border-border resize-y`
- Character count in bottom-right (`{content.length} characters`)
- "Reset to original adaptation" link appears only when content differs from originalContent

### ApproveConfirmDialog (`components/review/approve-confirm-dialog.tsx`) — new file
AlertDialog confirmation gate before merge:
- Props: `suggestionId`, `sourcePromptId`, `editedContent`, `hasEdited`, `currentVersion`, `mergeNote`, `onSuccess`, `trigger: ReactNode`
- Two description variants based on `hasEdited`:
  - False: "The fork's adapted content will replace the library prompt. Version will be bumped from N to N+1. This cannot be undone."
  - True: "Your edited content (not the original fork adaptation) will replace the library prompt. Version will be bumped from N to N+1. This cannot be undone."
- "Keep Reviewing" cancel (AlertDialogCancel — auto-closes)
- "Approve & Merge" confirm with `useTransition` spinner
- Success toast: "Prompt merged — now at version {N+1}"
- Error toast: "Merge failed — the library prompt may have been updated by someone else. Refresh and try again."

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript error in review-detail-client.tsx**
- **Found during:** Task 1 verification (tsc --noEmit)
- **Issue:** After adding `originalContent` and `onReset` as required props to `ReviewContentEditorProps`, the existing consumer `review-detail-client.tsx` passed only `content` and `onChange`, causing a TS2739 error.
- **Fix:** Added `originalContent={suggestion.adapted_content}` and `onReset={() => setEditedContent(suggestion.adapted_content)}` to the existing usage.
- **Files modified:** `components/review/review-detail-client.tsx`
- **Commit:** 0316e1b
- **Note:** Plan 06 will replace this entire component with the redesigned orchestrator — this fix is a bridge that keeps TypeScript clean until then.

**2. [Rule 2 - Test refinement] Fixed test assertions for tooltip and AlertDialog mocks**
- **Found during:** First GREEN run
- **Issue:** The base-ui tooltip mock renders merge note text twice (in TooltipTrigger and TooltipContent), causing `getByText` to find multiple elements. The AlertDialog mock renders both trigger and dialog open simultaneously, causing button name ambiguity.
- **Fix:** Changed `getByText` to `getAllByText` for merge note assertion; changed trigger in ApproveConfirmDialog test to use `data-testid` for unambiguous selection.
- **Files modified:** `tests/merge-diff.test.tsx`
- **Commit:** 0316e1b

## Verification Results

- `npx tsc --noEmit` — zero errors
- `npm test -- tests/merge-diff.test.tsx` — 26/26 tests pass
- All four components created with correct props interfaces
- No entity encoding issues (no `&amp;` literals in JSX text)

## Known Stubs

None. All components render real data from props. No hardcoded placeholders.

## Notes for Plan 06

Plan 06 will wire these leaf components into `ReviewDetailClient` as the orchestrator:
- `fork-detail-client.tsx` — must pass `showDiffOnly={false}` to DiffViewer to preserve current "show all lines" behavior
- `review-detail-client.tsx` — full replacement with stacked 4-zone layout using all four components from this plan

## Self-Check: PASSED

- FOUND: components/engagements/diff-viewer.tsx
- FOUND: components/review/review-context-bar.tsx
- FOUND: components/review/approve-confirm-dialog.tsx
- FOUND: components/review/review-content-editor.tsx
- FOUND: commit 0316e1b (Task 1)
- FOUND: commit 15c4580 (Task 2)
