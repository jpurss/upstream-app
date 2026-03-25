---
description: Audit trail for Phase 3 discuss-phase Q&A session — records all options presented, user selections, and rationale for engagement workspace decisions.
date_last_edited: 2026-03-25
---

# Phase 3: Engagement Workspace - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-25
**Phase:** 03-engagement-workspace
**Areas discussed:** Engagement list & workspace layout, Fork creation flow, Fork editing & annotation, Rating feedback & diff

---

## Engagement List & Workspace Layout

### Engagement list display

| Option | Description | Selected |
|--------|-------------|----------|
| Card grid | Reuses card grid pattern from library. Cards show name, client, industry badge, status, fork count, last activity. | ✓ |
| Table/list view | Dense table with sortable columns. Power-user friendly. | |

**User's choice:** Card grid
**Notes:** None

### Engagement workspace fork display

| Option | Description | Selected |
|--------|-------------|----------|
| Card grid (like library) | Fork cards reuse PromptCard pattern. "+ Fork a Prompt" button in header. | ✓ |
| Compact list | Table-style rows. Denser, shows more forks. | |

**User's choice:** Card grid
**Notes:** User clarified that fork cards should NOT show library metadata (category, model, etc.) — once forked, the consultant already chose the prompt. Cards should focus on work status: customized? adapted? last touched? This led to the minimal work-status card design (D-10).

### Create engagement flow

| Option | Description | Selected |
|--------|-------------|----------|
| Modal dialog | Quick dialog with 3 fields (Name, Client, Industry). Stays on page. | ✓ |
| Dedicated page | Full page at /engagements/new. More room but overkill for 3 fields. | |

**User's choice:** Modal dialog
**Notes:** None

### Consultant landing page

| Option | Description | Selected |
|--------|-------------|----------|
| Consultants → Engagements, Admins → Library | Role-based landing. Overrides Phase 1 D-07 for consultants. | ✓ |
| Everyone → Engagements | All users land on Engagements. | |
| Keep Library for all | Keep Phase 1 D-07 as-is. | |

**User's choice:** Consultants → Engagements, Admins → Library
**Notes:** User initiated this idea — suggested consultants should see engagements first as their daily workflow surface, with "New Engagement" as hero CTA when empty.

### Engagement status changes

| Option | Description | Selected |
|--------|-------------|----------|
| Dropdown in workspace header | Status badge click reveals Active/Paused/Completed options. Inline, fast. | ✓ |
| Action buttons | Separate Pause and Mark Complete buttons. More visible but more space. | |

**User's choice:** Dropdown in workspace header
**Notes:** None

### Empty state

| Option | Description | Selected |
|--------|-------------|----------|
| Hero CTA + context | Centered icon, headline, explainer, New Engagement button, Browse Library link. | ✓ |
| Minimal + button | Just text and button, no explanation. | |

**User's choice:** Hero CTA + context
**Notes:** None

### Workspace header info

| Option | Description | Selected |
|--------|-------------|----------|
| Name + client + industry + stats | Full context: name, client, industry badge, status dropdown, fork count, avg effectiveness. | ✓ |
| Name + client + status only | Minimal header. Stats in fork cards. | |

**User's choice:** Name + client + industry + stats
**Notes:** None

### Fork card design

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal work-status cards | Title + customization status + adaptation status + last edited date. No library metadata. | ✓ |

**User's choice:** Minimal work-status cards
**Notes:** User drove this decision — argued that library metadata is noise once forked. Cards should track: what it's for, has it been customized (templates filled), has it been adapted (content changed beyond templates).

---

## Fork Creation Flow

### Fork entry point

| Option | Description | Selected |
|--------|-------------|----------|
| From prompt detail page | "Fork to Engagement" button in sidebar. | |
| From engagement workspace | "+ Fork a Prompt" button opens prompt browser modal. | |
| Both entry points | Fork from detail page AND from workspace. | ✓ |

**User's choice:** Both entry points + during engagement creation
**Notes:** User added a third entry point: prompt selection during the engagement creation flow.

### Prompt selection during engagement creation

| Option | Description | Selected |
|--------|-------------|----------|
| Optional step after create | Create dialog stays simple (3 fields). After Create, optional prompt picker step. Can skip. | ✓ |
| Inline in create dialog | Prompt picker inside the create dialog. Single step but more complex. | |

**User's choice:** Optional step after create
**Notes:** None

### Engagement picker (from prompt detail)

| Option | Description | Selected |
|--------|-------------|----------|
| Dialog with engagement list | Dialog listing active engagements. Select one, click Fork. | ✓ |
| Dropdown inline | Small select menu next to Fork button. | |

**User's choice:** Dialog with engagement list
**Notes:** None

### Prompt picker (from workspace)

| Option | Description | Selected |
|--------|-------------|----------|
| Full-screen modal with library browse | Large modal with mini library view — searchable, filterable. Multi-select. | ✓ |
| Simple searchable list | Compact dialog with search and list. No filters. | |
| Navigate to library | Button takes user to library page with engagement pre-selected. | |

**User's choice:** Full-screen modal with library browse
**Notes:** None

### Duplicate forks

| Option | Description | Selected |
|--------|-------------|----------|
| No, prevent duplicates | Already-forked prompts grayed out in picker. One fork per prompt per engagement. | ✓ |
| Yes, allow multiple forks | Same prompt can be forked multiple times into same engagement. | |

**User's choice:** No, prevent duplicates
**Notes:** None

---

## Fork Editing & Annotation

### Edit location

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated fork detail page | Full page at /engagements/[id]/forks/[forkId]. Editor + sidebar layout. | ✓ |
| Inline edit in workspace | Expanding card reveals editor inline. No navigation. | |

**User's choice:** Dedicated fork detail page
**Notes:** None

### Save behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Autosave with debounce | Auto-save after 1-2s inactivity. "Saving.../Saved" indicator. No save button. | ✓ |
| Explicit save button | Save button activates on changes. Unsaved changes warning. | |

**User's choice:** Autosave with debounce
**Notes:** None

### Page layout

| Option | Description | Selected |
|--------|-------------|----------|
| Editor main + metadata sidebar | Two-column: editor left (Write/Preview/Diff tabs), sidebar right (notes, flags, source). | ✓ |
| Stacked layout | Editor full-width top, metadata bar below. | |

**User's choice:** Editor main + metadata sidebar
**Notes:** None

---

## Rating, Feedback & Diff

### Rating interaction

| Option | Description | Selected |
|--------|-------------|----------|
| Inline stars in fork sidebar | 5 clickable stars in sidebar. Click = instant save. No modal/form. | ✓ |
| Star rating on fork card | Rate from workspace without opening fork. | |

**User's choice:** Inline stars in fork sidebar
**Notes:** None

### Issue tags

| Option | Description | Selected |
|--------|-------------|----------|
| Toggle badges in sidebar | Clickable badge toggles for each issue type. Active = highlighted. Autosave. | ✓ |
| Dropdown multi-select | Single dropdown with checkboxes. | |

**User's choice:** Toggle badges in sidebar
**Notes:** User added: "but maybe also a free entry for notes or other?" — confirmed freeform feedback_notes textarea below the toggle badges.

### Diff display

| Option | Description | Selected |
|--------|-------------|----------|
| Third tab on the editor | Write / Preview / Diff tabs. Diff shows side-by-side comparison. | ✓ |
| Separate diff page | Dedicated route for diff view. | |

**User's choice:** Third tab on the editor
**Notes:** None

### Diff style

| Option | Description | Selected |
|--------|-------------|----------|
| Side-by-side | Original left, adapted right. GitHub PR review style. | ✓ |
| Unified diff | Single column with +/- markers. | |
| Toggle between both | User switches between side-by-side and unified. | |

**User's choice:** Side-by-side
**Notes:** None

---

## Claude's Discretion

- Diff library choice (dark mode theming is a known blocker to investigate)
- Engagement card dimensions, spacing, hover effects
- Fork card visual design for status indicators
- Prompt picker modal layout and filter subset
- Industry dropdown values
- Autosave debounce timing within 1-2 second range
- Loading skeletons for all new pages
- Toast notifications for fork creation
- Engagement route URL structure details

## Deferred Ideas

None — discussion stayed within phase scope
