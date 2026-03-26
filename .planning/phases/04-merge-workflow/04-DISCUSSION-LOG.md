---
description: Audit trail of Phase 4 discuss-phase Q&A for Upstream Merge Workflow. Records all options presented and user selections. Not consumed by downstream agents.
date_last_edited: 2026-03-25
---

# Phase 4: Merge Workflow - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-25
**Phase:** 04-merge-workflow
**Areas discussed:** Suggest Merge Trigger, Admin Review Queue, Review & Decision UX, Post-Merge Behavior

---

## Suggest Merge Trigger

### Q1: Where should the 'Suggest Merge' button live?

| Option | Description | Selected |
|--------|-------------|----------|
| Fork sidebar section | New section at bottom of existing fork sidebar. Keeps all fork actions in one place. Button opens dialog for merge note. | ✓ |
| Fork editor header | Prominent button in fork detail header bar. More visible but breaks sidebar = actions pattern. | |
| Both sidebar + Diff tab | Sidebar button + contextual CTA at bottom of Diff tab. | |

**User's choice:** Fork sidebar section
**Notes:** Recommended option — consistent with existing sidebar pattern.

### Q2: What should the merge suggestion dialog collect?

| Option | Description | Selected |
|--------|-------------|----------|
| Merge note only | Single textarea: 'Why should this be merged back?' Diff, rating, feedback already exist on fork. | ✓ |
| Merge note + summary of changes | Two fields: short summary line (commit title) + longer merge note. | |
| Merge note + section selector | Merge note + checkboxes for which parts changed. More structured but more friction. | |

**User's choice:** Merge note only
**Notes:** Keep it simple — fork context travels automatically.

### Q3: Should a rating be required before suggesting a merge?

| Option | Description | Selected |
|--------|-------------|----------|
| Require rating first | Button disabled until effectiveness rating is set. Ensures quality signal. | |
| No gate — always available | Let consultants suggest anytime. Rating is optional context. | ✓ |
| Soft nudge | Always enabled, but dialog prompts to consider rating first. | |

**User's choice:** No gate — always available
**Notes:** Lower friction preferred over quality gate.

### Q4: What should the consultant see after submitting?

| Option | Description | Selected |
|--------|-------------|----------|
| Status badge + disabled button | Badge replaces button: Pending Review → Merged ✓ or Declined (with reason, re-enable button). | ✓ |
| Status badge, no resubmit | Same badge but one shot — decline is final. | |
| Toast only, button stays | Minimal UI change. | |

**User's choice:** Status badge + disabled button
**Notes:** Declined merges allow resubmission after revision.

---

## Admin Review Queue

### Q1: Where should the review queue live?

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated /review page | New top-level route. Activates existing disabled sidebar item from Phase 1. | ✓ |
| Tab within Library page | Add 'Merge Reviews' tab to library. Conflates browsing with reviewing. | |
| Notification panel | Slide-out panel from bell icon. Lightweight but hard to filter. | |

**User's choice:** Dedicated /review page
**Notes:** Activates the Phase 1 placeholder sidebar nav item.

### Q2: What info should review queue cards show?

| Option | Description | Selected |
|--------|-------------|----------|
| Rich context cards | Prompt title, submitter, engagement, rating, fork date, merge note preview, time since submission. | ✓ |
| Minimal table rows | Table: prompt title, submitter, date, status. Compact, click for details. | |
| Split view | List + preview pane (email-like). Click shows diff without navigating. | |

**User's choice:** Rich context cards
**Notes:** Enough to triage without clicking in.

### Q3: Default view — pending only or all?

| Option | Description | Selected |
|--------|-------------|----------|
| Pending by default, filter to see all | Default = pending (action queue). Tabs/dropdown for Approved, Declined, All. | ✓ |
| All with status badges | One list, colored badges. Full history at a glance but noisier. | |
| Pending only, no history | Only pending items. No past decisions visible. | |

**User's choice:** Pending by default, filter to see all
**Notes:** Focused default with history accessible via filter.

---

## Review & Decision UX

### Q1: Layout for review detail page?

| Option | Description | Selected |
|--------|-------------|----------|
| Two-column: diff + context sidebar | Wide left = side-by-side diff. Narrow right = context + approve/decline. Mirrors fork detail. | ✓ |
| Full-width stacked | Context at top, full-width diff below, buttons at bottom. | |
| Three-panel | Original left, adapted center, context + decisions right. | |

**User's choice:** Two-column: diff + context sidebar
**Notes:** Consistent with fork detail page layout pattern.

### Q2: How should admin decline a merge?

| Option | Description | Selected |
|--------|-------------|----------|
| Inline reason textarea | 'Decline' expands required textarea below button. Submit to confirm. Stays on page. | ✓ |
| Confirmation dialog with reason | AlertDialog with required reason. More deliberate. | |
| Quick decline + optional reason | Immediate decline, optional reason after. Fastest but less informative. | |

**User's choice:** Inline reason textarea
**Notes:** Required reason ensures consultant always understands why.

### Q3: Can admin edit content before approving?

| Option | Description | Selected |
|--------|-------------|----------|
| No editing — approve as-is | Accept adapted content exactly. Decline for changes. Simple v1. | |
| Optional inline edit before approve | Admin can tweak content in editor before 'Approve & Merge'. | ✓ |
| Approve with minor edits noted | Editable content + 'I made minor edits' flag. | |

**User's choice:** Optional inline edit before approve
**Notes:** Handles minor tweaks without decline-resubmit round trips.

---

## Post-Merge Behavior

### Q1: How should the library prompt update on approve?

| Option | Description | Selected |
|--------|-------------|----------|
| Replace content + bump version + changelog | Content replaced, version increments, changelog entry created. Audit trail. | ✓ |
| Append as new version, keep old accessible | Old content preserved as version. New becomes current. | |
| Replace content only, no versioning | Just swap content. No audit trail. | |

**User's choice:** Replace content + bump version + changelog
**Notes:** Uses already-deployed prompt_changelog table.

### Q2: How does the consultant know the outcome?

| Option | Description | Selected |
|--------|-------------|----------|
| Status change on fork only | Badge updates on fork sidebar. No push notifications. See it when visiting fork. | ✓ |
| Sidebar badge count | Fork status + notification dot on Engagements sidebar. | |
| Toast on next login | One-time toast when consultant has status updates. | |

**User's choice:** Status change on fork only
**Notes:** Simple for v1 — no notification infrastructure needed.

### Q3: Pending count badge on sidebar?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — count badge | Small count on 'Review Queue' sidebar item (e.g., "(3)"). | ✓ |
| No badge — just the link | Admin clicks in to discover pending items. | |

**User's choice:** Yes — count badge
**Notes:** Ambient awareness for admins — Slack/Linear pattern.

---

## Claude's Discretion

- Review queue card dimensions, spacing, hover effects
- Review queue empty state design
- Merge suggestion dialog styling and validation
- Review detail page layout proportions
- Content editor component for admin edit-before-approve
- Loading skeletons
- Toast notifications for merge/approval/decline
- URL structure for review routes
- Filter component choice for queue status
- Badge count fetching strategy

## Deferred Ideas

None — discussion stayed within phase scope
