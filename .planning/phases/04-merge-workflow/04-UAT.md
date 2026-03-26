---
status: diagnosed
phase: 04-merge-workflow
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03-SUMMARY.md, 04-04-SUMMARY.md]
started: 2026-03-26T08:10:00.000Z
updated: 2026-03-26T10:35:00.000Z
---

## Current Test

[testing complete]

## Tests

### 1. Suggest Merge from Fork Sidebar
expected: Navigate to a forked prompt detail page (any engagement → any fork). In the sidebar, below the Forked Date section, you should see a "Suggest Merge" button. Click it — a dialog opens with a textarea for a merge note. Type a note and submit. The dialog closes, and the sidebar now shows an amber "Pending Review" badge instead of the button.
result: pass
note: Initially failed due to migration 003 not applied — fixed by running `supabase db push`

### 2. Admin Pending Count Badge
expected: Log in as admin. In the left sidebar, the "Review Queue" nav item should show an amber badge with a number (matching however many pending merge suggestions exist). If there are no pending suggestions, the badge should not appear.
result: pass

### 3. Review Queue Page — Admin Access
expected: As admin, click "Review Queue" in the sidebar (or navigate to /review). You should see a page with filter tabs: All, Pending, Approved, Declined. Each merge suggestion appears as a card showing the prompt title, a status badge (colored by status), the submitter's name, a read-only star rating, and a truncated merge note. Click different tabs to filter.
result: pass

### 4. Review Queue — Non-Admin Redirect
expected: Log in as a consultant (non-admin). Navigate directly to /review in the URL bar. You should be redirected to /engagements — consultants cannot access the review queue.
result: pass

### 5. Review Detail — Side-by-Side Diff
expected: As admin on the review queue, click any pending merge suggestion card. You should land on /review/[id] with a two-column layout: left side shows a diff viewer with titles "Library (current)" and "Fork (adapted)" showing the differences between the original prompt and the forked version. Right side shows a sidebar with suggestion metadata.
result: issue
reported: "major UI/UX issues on the review page — text is too small to be read well due to being cramped. Overlapping the right side bar buttons."
severity: major

### 6. Approve Merge
expected: On the review detail page for a pending suggestion, click "Approve". The library prompt content should update to the fork's version, the prompt version should increment, and you should be redirected back to /review. The suggestion should now show as "Approved" status.
result: pass
note: User noted version number not displayed anywhere in prompt detail sidebar (DB increments but no UI). Also "Last Tested" vs "Updated" dates confusing — merge should arguably update last_tested too.

### 7. Decline Merge with Reason
expected: On the review detail page for a pending suggestion, click "Decline". An inline form expands below with a textarea for a reason. The "Confirm Decline" button is disabled until you type a reason. Enter a reason and confirm. You should be redirected to /review, and the suggestion shows "Declined" status.
result: pass
note: User accidentally clicked approve instead of decline — no confirmation dialog or undo on approve action. Approve is a destructive/significant action and needs a confirmation step.

### 8. Declined State — Consultant View
expected: As the consultant who submitted the declined merge, navigate back to that fork's detail page. The sidebar merge section should show a red "Declined" badge, the admin's decline reason in italics, and a "Revise & resubmit" link.
result: pass
note: User suggested a persistent notification section to inform consultants when merges are approved/declined instead of requiring navigation back to the fork. Good v2 feature.

## Summary

total: 8
passed: 7
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Review detail page shows a readable two-column layout with diff viewer and sidebar that don't overlap"
  status: failed
  reason: "User reported: major UI/UX issues — text too small, cramped layout, sidebar buttons overlap diff content"
  severity: major
  test: 5
  artifacts:
    - components/review/review-detail-client.tsx
    - components/review/review-sidebar.tsx
  missing: []

## UX Enhancement Notes (not gaps — future improvements)

- Version number should be displayed in prompt detail sidebar (currently only incremented in DB)
- Approve merge needs a confirmation dialog or undo mechanism (too easy to accidentally approve)
- Notification center for merge status updates (v2 feature — consultants shouldn't have to navigate back to fork to see outcome)
- "Last Tested" vs "Updated" date distinction unclear to users
