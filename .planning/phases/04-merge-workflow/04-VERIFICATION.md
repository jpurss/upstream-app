---
description: Re-verification report for Phase 04 (Merge Workflow) — confirms gap closure after plans 04-05 and 04-06 redesigned the review detail page with a stacked 4-zone layout, floating action bar, and DiffViewer showDiffOnly toggle.
date_last_edited: 2026-03-26
phase: 04-merge-workflow
verified: 2026-03-26T12:00:00Z
status: gaps_found
score: 5/5 must-haves verified
re_verification: true
gaps:
  - truth: "Action bar button text renders correctly (no HTML entity escaping visible to users)"
    status: partial
    reason: "review-action-bar.tsx line 66 uses &amp; in JSX text content, which renders as literal '&amp;' on screen instead of '&'. The plan explicitly called this out as a bug to fix. merge-suggestion-section.tsx line 82 has the same issue with 'Revise &amp; resubmit'."
    artifacts:
      - path: "components/review/review-action-bar.tsx"
        issue: "Line 66: 'Approve &amp; Merge' in JSX text — renders as 'Approve &amp; Merge' on screen"
      - path: "components/engagements/merge-suggestion-section.tsx"
        issue: "Line 82: 'Revise &amp; resubmit' in JSX text — renders as 'Revise &amp; resubmit' on screen"
    missing:
      - "Replace &amp; with & in JSX text content in review-action-bar.tsx"
      - "Replace &amp; with & in JSX text content in merge-suggestion-section.tsx"
human_verification:
  - test: "Verify stacked 4-zone layout and full merge workflow end-to-end"
    expected: "Review detail page shows stacked layout (back link + status badge, horizontal context bar, Changes/Edit tabs, floating action bar). Approve opens confirmation dialog before executing. Decline expands inline form in action bar."
    why_human: "Requires live Supabase DB, two-role auth sessions, and visual inspection of layout correctness"
---

# Phase 4: Merge Workflow — Re-Verification Report

**Phase Goal:** The knowledge loop closes — consultants can suggest pushing field-tested improvements back to the central library, and admins can review, diff, approve, or reject them.
**Verified:** 2026-03-26
**Status:** GAPS FOUND (1 minor bug)
**Re-verification:** Yes — after gap closure plans 04-05 and 04-06

---

## Re-Verification Context

Previous verification (`2026-03-26T08:05:00Z`) had status **passed** (5/5). The UAT then surfaced a major UI issue (Test 5): review detail page was cramped, text unreadable, sidebar buttons overlapping diff content. Plans 04-05 and 04-06 were executed to redesign the review detail page. This is the verification of that gap closure.

**Previous gaps closed by 04-05/04-06:**
- Review detail page cramped two-column layout replaced with stacked 4-zone layout
- DiffViewer now supports showDiffOnly toggle for collapsing unchanged lines
- ReviewContextBar replaces 280px sidebar with compact horizontal metadata bar
- ReviewContentEditor rewritten as full-width panel (not collapsible)
- ApproveConfirmDialog added — approve now requires confirmation before executing
- Sticky floating action bar with version indicator on approve button

**Re-verification focus:** Plans 04-05 and 04-06 must-haves, plus confirmation of original 5 truths.

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can submit a merge suggestion from any forked prompt with a merge note — the suggestion enters a pending review queue | VERIFIED | `MergeSuggestionSection` (139 lines, all 4 states) wired in fork-sidebar.tsx Section 8. `suggestMerge` action sets `merge_status='pending'`. |
| 2 | The merge suggestion view shows a side-by-side diff of the original library content vs the adapted fork content | VERIFIED | `ReviewDetailClient` renders `DiffViewer` with `source_prompt_content` vs `editedContent`, labels "Library (current)" / "Fork (adapted)". showDiffOnly toggle present. |
| 3 | Admin can view all pending merge suggestions with context (who suggested, which engagement, effectiveness rating) and filter by status | VERIFIED | `/review` page admin-gated, `ReviewQueueClient` with Pending/Approved/Declined/All tabs, `ReviewQueueCard` shows submitter, engagement, star rating, merge note. |
| 4 | Admin can approve a merge — the central library prompt content updates, version increments, and a changelog entry is created | VERIFIED | `approveMerge` in `review/actions.ts` updates prompt content, bumps version, inserts changelog. `ApproveConfirmDialog` gates the action with version-aware copy. |
| 5 | Admin can decline a merge with a reason — the fork is notified of the rejection reason | VERIFIED | `declineMerge` stores reason. `DeclineReasonForm` with `initialExpanded` and `onDiscard` props wired in `ReviewActionBar`. Declined state in `MergeSuggestionSection` shows reason and "Revise & resubmit" link. |

**Score:** 5/5 truths verified

---

## Plan 04-05 Must-Haves Verification

### Truths from 04-05 PLAN frontmatter

| Truth | Status | Evidence |
|-------|--------|----------|
| DiffViewer supports showDiffOnly mode that collapses unchanged lines | VERIFIED | `diff-viewer.tsx` lines 27-38: `showDiffOnly?: boolean` default `true`, `extraLinesSurroundingDiff?: number` default 3. Both passed to `ReactDiffViewer`. `key` prop forces re-render on toggle. |
| ReviewContextBar displays suggestion metadata in a compact horizontal layout | VERIFIED | `review-context-bar.tsx` 125 lines: horizontal flex row with submitter, engagement link, star rating, issue tags separated by pipe dividers. Merge note in row 2 with tooltip. "More context" expandable toggle. |
| ApproveConfirmDialog shows version-aware confirmation before merge | VERIFIED | `approve-confirm-dialog.tsx` 88 lines: two description variants based on `hasEdited`, version numbers N and N+1, "Keep Reviewing" cancel, "Approve & Merge" confirm with spinner. |
| ReviewContentEditor is a full-width textarea panel (not a collapsible) | VERIFIED | `review-content-editor.tsx` 43 lines: always-visible `Textarea` with `min-h-[400px] font-mono`, character count, conditional "Reset to original adaptation" link. No expand/collapse state. |

### Artifacts from 04-05 PLAN frontmatter

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `components/engagements/diff-viewer.tsx` | Enhanced DiffViewer with showDiffOnly and extraLinesSurroundingDiff props | VERIFIED | 61 lines. `showDiffOnly` and `extraLinesSurroundingDiff` in interface and destructure with defaults. Both passed to ReactDiffViewer. `key` prop added in latest polish commit. |
| `components/review/review-context-bar.tsx` | Horizontal metadata bar replacing 280px sidebar | VERIFIED | 125 lines (min_lines: 40). `MergeSuggestion` type import, `useState`, submitter/engagement/rating/issues/merge-note rendered. |
| `components/review/approve-confirm-dialog.tsx` | AlertDialog confirmation with version-aware copy | VERIFIED | 88 lines (min_lines: 40). `approveMerge` import, version arithmetic, two description variants. |
| `components/review/review-content-editor.tsx` | Full-width editor panel with reset link and character count | VERIFIED | 43 lines (min_lines: 30). All four required props: `content`, `originalContent`, `onChange`, `onReset`. |

### Key Links from 04-05 PLAN frontmatter

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `approve-confirm-dialog.tsx` | `app/(app)/review/actions.ts` | `approveMerge` import | WIRED | Line 17: `import { approveMerge } from '@/app/(app)/review/actions'` |
| `review-context-bar.tsx` | `lib/types/merge.ts` | `MergeSuggestion` type import | WIRED | Line 10: `import type { MergeSuggestion } from '@/lib/types/merge'` |

---

## Plan 04-06 Must-Haves Verification

### Truths from 04-06 PLAN frontmatter

| Truth | Status | Evidence |
|-------|--------|----------|
| Review detail page uses stacked 4-zone layout instead of two-column | VERIFIED | `review-detail-client.tsx`: `flex flex-col gap-6` root. Zone 1 header, Zone 2 ReviewContextBar, Zone 3 Tabs (pending) or read-only diff, Zone 4 ReviewActionBar. No column layout. |
| Admin can switch between Changes tab and Edit tab | VERIFIED | `Tabs value={activeTab} onValueChange={setActiveTab}` with `TabsTrigger value="changes"` and `value="edit"`. Both tabs render full-width content. |
| Admin edits in Edit tab are reflected in the Changes diff | VERIFIED | `editedContent` state initialized from `suggestion.adapted_content`, bound to `ReviewContentEditor onChange={setEditedContent}`. DiffViewer receives `adapted={editedContent}`. |
| Sticky action bar with Approve & Merge and Decline stays visible | VERIFIED | `review-action-bar.tsx` line 30: `fixed bottom-6 left-[var(--sidebar-width)] right-0 z-40 flex justify-center`. Floating pill above content. |
| Approve button opens confirmation dialog before executing merge | VERIFIED | `ReviewActionBar` wraps `ApproveConfirmDialog` — clicking trigger opens AlertDialog, no direct mutation. |
| Decline expands inline form within the sticky bar | VERIFIED | `isDeclineOpen` state in `ReviewActionBar`. When true, renders `DeclineReasonForm initialExpanded={true}`. Approve button `disabled={isDeclineOpen}`. |
| Approved/declined suggestions show read-only view | VERIFIED | `isPending` check gates Tabs rendering. Non-pending path renders read-only diff with no Edit tab and no ReviewActionBar. |
| Fork detail page still shows all diff lines (showDiffOnly={false}) | VERIFIED | `fork-editor.tsx` line 126: `<DiffViewer original={fork.original_content} adapted={content} showDiffOnly={false} />` |

### Artifacts from 04-06 PLAN frontmatter

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `components/review/review-detail-client.tsx` | Stacked 4-zone layout orchestrator | VERIFIED | 195 lines (min_lines: 80). All 4 zones present. StatusBadge inline helper. |
| `components/review/review-action-bar.tsx` | Sticky bottom bar with approve/decline | VERIFIED | 76 lines (min_lines: 50). Fixed positioning, pill styling, ApproveConfirmDialog + DeclineReasonForm. |

### Key Links from 04-06 PLAN frontmatter

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `review-detail-client.tsx` | `review-context-bar.tsx` | `ReviewContextBar` import | WIRED | Line 9: `import { ReviewContextBar } from '@/components/review/review-context-bar'`. Used line 82. |
| `review-detail-client.tsx` | `review-action-bar.tsx` | `ReviewActionBar` import | WIRED | Line 10: `import { ReviewActionBar } from '@/components/review/review-action-bar'`. Used line 187. |
| `review-detail-client.tsx` | `diff-viewer.tsx` | `DiffViewer` with `showDiffOnly` | WIRED | Line 8: import. Lines 132-139 and 174-181: `showDiffOnly={showDiffOnly}` passed. |
| `review-action-bar.tsx` | `approve-confirm-dialog.tsx` | `ApproveConfirmDialog` import | WIRED | Line 8: `import { ApproveConfirmDialog } from '@/components/review/approve-confirm-dialog'`. Used line 52. |
| `review-action-bar.tsx` | `decline-reason-form.tsx` | `DeclineReasonForm` import | WIRED | Line 7: `import { DeclineReasonForm } from '@/components/review/decline-reason-form'`. Used line 34. |

---

## Deletions Verified

| File | Expected | Status |
|------|----------|--------|
| `components/review/review-sidebar.tsx` | Deleted — replaced by stacked layout | VERIFIED DELETED — file absent from `components/review/`. Zero orphan imports found. |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `review-detail-client.tsx` | `suggestion` | `fetchMergeSuggestionById` in server page.tsx | Yes — DB query via `createAdminClient()` with `.single()` | FLOWING |
| `review-context-bar.tsx` | `suggestion` | Props from `ReviewDetailClient` (server-fetched) | Yes — all fields come from real DB join query | FLOWING |
| `review-action-bar.tsx` | `suggestion`, `editedContent`, `hasEdited` | Props from `ReviewDetailClient` | Yes — `editedContent` from component state initialized by real DB data | FLOWING |
| `approve-confirm-dialog.tsx` | `currentVersion`, `editedContent` | Props from `ReviewActionBar` → `ReviewDetailClient` | Yes — `source_prompt_version` from DB | FLOWING |

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| merge-diff tests pass | `npm test -- tests/merge-diff.test.tsx` | 37/37 tests pass | PASS |
| TypeScript compilation clean | `npx tsc --noEmit` | No output (zero errors) | PASS |
| fork-editor passes showDiffOnly={false} | `grep showDiffOnly fork-editor.tsx` | Line 126: `showDiffOnly={false}` found | PASS |
| review-sidebar.tsx deleted and no orphan imports | `grep -r "review-sidebar"` across codebase | Zero results | PASS |
| DiffViewer has key prop for re-render on toggle | `grep key diff-viewer.tsx` | `key={showDiffOnly ? 'diff-only' : 'full'}` on line 48 | PASS |
| ApproveConfirmDialog wired to approveMerge action | `grep approveMerge approve-confirm-dialog.tsx` | Line 17 import, line 46 call | PASS |
| Full test suite — phase 04 test files | 6 phase-04 test files, all pass | All pass (merge-suggest, merge-data, review-queue, merge-approve, merge-decline, merge-diff: 37/37) | PASS |
| Pre-existing failures unrelated to phase 04 | Tests in auth-actions, sidebar, library-filter, library-create, library-edit, login-page, library-deprecate | 10 failures confirmed pre-existing from Phases 1-2 (created in commits 4577a0d, d73a900, 5a85a50, 7c30e31). No phase-04 commits touched these files. | INFO |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| MERGE-01 | 04-01, 04-02 | User can suggest a merge from a forked prompt with a merge note | SATISFIED | `suggestMerge` action + `MergeSuggestionSection` wired in fork-sidebar Section 8 |
| MERGE-02 | 04-04, 04-05, 04-06 | Merge suggestion shows side-by-side diff | SATISFIED | `DiffViewer` with `showDiffOnly` toggle in `ReviewDetailClient`. Full-width, readable. |
| MERGE-03 | 04-01, 04-03 | Admin can view review queue with context, filter by status | SATISFIED | `/review` page, `ReviewQueueClient` tabs, `ReviewQueueCard` rich context |
| MERGE-04 | 04-01, 04-04, 04-05, 04-06 | Admin can approve — library content updates, version bumps, changelog created | SATISFIED | `approveMerge` action. `ApproveConfirmDialog` gates action with version-aware copy. |
| MERGE-05 | 04-01, 04-04, 04-06 | Admin can decline with reason — consultant sees rejection reason | SATISFIED | `declineMerge` action. `DeclineReasonForm` with `initialExpanded`/`onDiscard` in sticky bar. Declined state surfaces reason to consultant. |

**Orphaned requirements check:** No additional MERGE-* requirements in REQUIREMENTS.md beyond MERGE-01 through MERGE-05. No orphaned requirements.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `components/review/review-action-bar.tsx` | 66 | `Approve &amp; Merge` in JSX text content | WARNING | Renders as literal "Approve &amp; Merge" on screen instead of "Approve & Merge". Plan 06 explicitly listed fixing this as a requirement ("No &amp; entity encoding bugs" in verification checklist). |
| `components/review/review-action-bar.tsx` | 68 | `v{N} &rarr; v{N+1}` in JSX text content | Info | `&rarr;` is a valid HTML entity that JSX resolves to "→". This renders correctly. Not a bug. |
| `components/engagements/merge-suggestion-section.tsx` | 82 | `Revise &amp; resubmit` in JSX text content | WARNING | Renders as literal "Revise &amp; resubmit" on screen. Pre-dates plan 04-06 but should be fixed alongside the action bar fix. |

---

## Human Verification Required

### 1. Full Review Detail Page Layout

**Test:** As admin (Demo Bypass → admin), navigate to /review → click any pending merge suggestion.
**Expected:** Page shows stacked layout (not side-by-side): back link + status badge at top, horizontal context bar (submitter, engagement, rating, merge note), then "Changes" / "Edit before approving" tabs, then full-width diff viewer. Floating pill action bar at bottom with "Decline" (destructive red, rounded-full) and "Approve & Merge v{N} → v{N+1}" buttons. The "Approve & Merge" button text should read with an ampersand, NOT "Approve &amp; Merge".
**Why human:** Requires live Supabase DB, admin session, and visual layout inspection.

### 2. Tab Interaction and Edit State Sync

**Test:** On a pending review detail page, click "Edit before approving" tab. Modify the content. Switch back to "Changes" tab.
**Expected:** Changes tab diff now shows the edited content on the right side (title: "Edited (will be merged)"). A small blue dot appears on the "Changes" tab label. "Show all lines" / "Show changes only" toggle is functional.
**Why human:** Requires live data and interactive session to verify state synchronization.

### 3. Approve Confirmation Flow

**Test:** Click "Approve & Merge" in the sticky bar.
**Expected:** AlertDialog opens with title "Approve and merge this change?", description including current and next version numbers, "Keep Reviewing" cancel button, and "Approve & Merge" confirm button. Clicking cancel closes dialog without action. Clicking confirm executes merge and redirects to /review with success toast showing version number.
**Why human:** Requires live DB mutation and two-step interaction flow.

### 4. Decline Inline Expansion

**Test:** Click "Decline" in the sticky bar.
**Expected:** Decline button is replaced by an inline DeclineReasonForm (textarea pre-expanded). While form is open, "Approve & Merge" button is grayed out/disabled. Type a reason and click "Confirm Decline" — redirects to /review. Open another pending suggestion, click "Decline", then click "Discard reason" — form closes, approve re-enables.
**Why human:** Requires live DB and interactive flow verification.

---

## Gaps Summary

One gap blocking a clean pass: two files contain `&amp;` in JSX text content that renders as literal `&amp;` on screen. Plan 06 explicitly required fixing this ("No `&amp;` entity encoding bugs" in its verification checklist, and explicitly said "this plan fixes that by using proper JSX string content"). The fix was not applied.

**Affected files:**
- `components/review/review-action-bar.tsx` line 66: `Approve &amp; Merge` should be `Approve & Merge`
- `components/engagements/merge-suggestion-section.tsx` line 82: `Revise &amp; resubmit` should be `Revise & resubmit`

**All 5 phase success criteria are otherwise verified.** The review detail page redesign (plans 04-05 and 04-06) is structurally complete, correctly wired, and all 37 merge-diff tests pass. TypeScript compiles clean. The `&amp;` bug is a visible UI text rendering defect, not a structural gap.

**Pre-existing test failures (unrelated to Phase 4):** 10 tests failing across auth-actions, sidebar, library-create, library-deprecate, library-edit, library-filter, and login-page test files. All originate from Phase 1-2 commits (4577a0d, d73a900, 5a85a50, 7c30e31, 7ed69ba). No Phase 4 commits modified these test files.

---

_Verified: 2026-03-26T12:00:00Z_
_Verifier: Claude (gsd-verifier)_
