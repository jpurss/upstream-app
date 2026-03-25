---
description: Audit trail of Phase 2 discuss-phase Q&A for Upstream Prompt Library. Not consumed by downstream agents.
date_last_edited: 2026-03-25
---

# Phase 2: Prompt Library - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-25
**Phase:** 02-prompt-library
**Areas discussed:** Library browse layout & cards, Filtering & search interaction, Prompt detail page, Admin CRUD experience, Empty & zero states, Sorting options, Markdown editor for admin, Page header & branding

---

## Library Browse Layout & Cards

### Q1: How should the library display prompts?

| Option | Description | Selected |
|--------|-------------|----------|
| Card grid with toggle | Default responsive card grid (3-4 columns). Toggle to compact list view. | ✓ |
| Card grid only | Always cards, no list mode. Simpler to build. | |
| Table/list only | Dense data table with sortable columns. | |

**User's choice:** Card grid with toggle (Recommended)
**Notes:** Preview shown with grid and list mockups.

### Q2: What information should each prompt card show?

| Option | Description | Selected |
|--------|-------------|----------|
| Rich cards | Category badge, title, 1-line description, capability type, model badge, star rating + count, checkout count. | ✓ |
| Minimal cards | Category badge, title, star rating only. | |
| You decide | Claude picks the detail level. | |

**User's choice:** Rich cards (Recommended)
**Notes:** Preview shown with detailed card mockup.

### Q3: What should happen when hovering/clicking a prompt card?

| Option | Description | Selected |
|--------|-------------|----------|
| Click navigates to detail page | Whole card clickable, navigates to /library/[id]. Subtle hover effect. | ✓ |
| Click opens side panel | Slide-over panel without leaving library page. | |
| You decide | Claude picks interaction pattern. | |

**User's choice:** Click navigates to detail page (Recommended)

---

## Filtering & Search Interaction

### Q4: Where should filters live on the library page?

| Option | Description | Selected |
|--------|-------------|----------|
| Top filter bar | Horizontal bar above grid with dropdown selects. Search on left. Linear/Notion style. | ✓ |
| Sidebar filter panel | Vertical panel on left with checkboxes/sliders. | |
| Popover filter builder | Single 'Filter' button opening a popover. | |

**User's choice:** Top filter bar (Recommended)
**Notes:** Preview shown with filter bar + card grid layout.

### Q5: How should filtering and search update results?

| Option | Description | Selected |
|--------|-------------|----------|
| Instant / real-time | Results update immediately. Debounced search (300ms). URL params for sharing. | ✓ |
| Apply button | User clicks 'Apply' to see results. | |
| You decide | Claude picks update behavior. | |

**User's choice:** Instant / real-time (Recommended)

### Q6: Which filter dimensions should be available?

| Option | Description | Selected |
|--------|-------------|----------|
| All six from requirements | Category, capability type, industry, effectiveness range, status, target model. | ✓ |
| Core four only | Category, capability type, status, target model. | |
| You decide | Claude picks filter balance. | |

**User's choice:** All six from requirements (Recommended)

### Q7: How should active filters be shown and cleared?

| Option | Description | Selected |
|--------|-------------|----------|
| Active filter chips + clear all | Dismissible chips below filter bar. 'Clear all' button. Result count shown. | ✓ |
| Highlighted dropdowns only | Active dropdowns change style. No chip row. | |
| You decide | Claude picks indication pattern. | |

**User's choice:** Active filter chips + clear all (Recommended)

---

## Prompt Detail Page

### Q8: How should the prompt detail page be laid out?

| Option | Description | Selected |
|--------|-------------|----------|
| Content left, metadata sidebar | Full markdown content on left, metadata sidebar on right. | ✓ |
| Full-width stacked | Title/metadata header at top, full-width content below. | |
| Tabbed sections | Tabs for Content, Metadata, Field Intelligence, History. | |

**User's choice:** Content left, metadata sidebar (Recommended)
**Notes:** Preview shown with two-column layout mockup.

### Q9: How should copy-to-clipboard work?

| Option | Description | Selected |
|--------|-------------|----------|
| Copy button in sidebar + toast | Prominent button in sidebar. Toast confirms. Icon changes to checkmark. | ✓ |
| Copy button above content | Floating copy icon at top-right of content area. | |
| Both locations | Copy in sidebar AND on content block. | |

**User's choice:** Copy button in sidebar + toast (Recommended)

### Q10: What field intelligence should the detail page show?

| Option | Description | Selected |
|--------|-------------|----------|
| Stats block in sidebar | Avg effectiveness, total checkouts, active fork count, total ratings. | ✓ |
| Stats + placeholder section | Same stats plus 'Recent Feedback' placeholder for Phase 3. | |
| You decide | Claude determines field intelligence level. | |

**User's choice:** Stats block in sidebar (Recommended)

### Q11: How should markdown prompt content be rendered?

| Option | Description | Selected |
|--------|-------------|----------|
| Rendered markdown in monospace | Proper headings/lists/code blocks in Geist Mono base font. react-markdown or similar. | ✓ |
| Raw markdown in code block | Show raw markdown in a styled code block. | |
| You decide | Claude picks rendering approach. | |

**User's choice:** Rendered markdown in monospace (Recommended)

---

## Admin CRUD Experience

### Q12: How should admins create and edit prompts?

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated form page | /library/new and /library/[id]/edit. Full-page form with all fields. | ✓ |
| Modal/drawer form | Overlay modal or slide-in drawer. | |
| Inline editing on detail page | Edit button makes fields editable in-place. | |

**User's choice:** Dedicated form page (Recommended)
**Notes:** Preview shown with form layout mockup.

### Q13: How should prompt deprecation work?

| Option | Description | Selected |
|--------|-------------|----------|
| Status toggle with confirmation | Confirmation dialog, status changes to deprecated. Hidden from browse, accessible by URL. | ✓ |
| Soft delete with undo | Hides immediately with 10-second undo toast. | |
| You decide | Claude picks deprecation UX. | |

**User's choice:** Status toggle with confirmation (Recommended)

### Q14: How should admin-only controls appear to consultants vs admins?

| Option | Description | Selected |
|--------|-------------|----------|
| Hidden for non-admins | Create/Edit/Deprecate buttons don't render. Clean read-only library. | ✓ |
| Visible but disabled | Grayed out with 'Admin only' tooltip. | |
| You decide | Claude picks role-gating pattern. | |

**User's choice:** Hidden for non-admins (Recommended)

### Q15: Where should the 'Create Prompt' entry point be?

| Option | Description | Selected |
|--------|-------------|----------|
| Library header button | '+ New Prompt' in library page header, right-aligned. Admin only. | ✓ |
| Floating action button | Fixed FAB in bottom-right corner. | |
| You decide | Claude picks create entry point. | |

**User's choice:** Library header button (Recommended)

---

## Empty & Zero States

### Q16: What shows when filters return no matching prompts?

| Option | Description | Selected |
|--------|-------------|----------|
| Helpful message + clear filters | Centered 'No prompts match your filters' + 'Clear all filters' button. | ✓ |
| Inline message only | Small 'No results.' text. | |
| You decide | Claude designs empty state. | |

**User's choice:** Helpful message + clear filters (Recommended)

---

## Sorting Options

### Q17: What sort options and default order?

| Option | Description | Selected |
|--------|-------------|----------|
| 4 options, default by rating | Highest rated, Most used, Newest, Alphabetical. Default: highest rated. | ✓ |
| 3 options, default newest | Newest, Highest rated, Most used. Default: newest. | |
| You decide | Claude picks sort options. | |

**User's choice:** 4 options, default by rating (Recommended)

---

## Markdown Editor for Admin

### Q18: What kind of markdown editor?

| Option | Description | Selected |
|--------|-------------|----------|
| Write/Preview tabs | Simple textarea + preview toggle. No toolbar. Like GitHub issues. | ✓ |
| Rich editor with toolbar | WYSIWYG with bold/italic/heading buttons. TipTap or MDXEditor. | |
| Side-by-side live preview | Editor left, live preview right. | |
| You decide | Claude picks editor approach. | |

**User's choice:** Write/Preview tabs (Recommended)

---

## Page Header & Branding

### Q19: What should the library page header look like?

| Option | Description | Selected |
|--------|-------------|----------|
| Title + count + description | 'Prompt Library' with count badge and subtitle. Admin sees '+ New Prompt'. | |
| Title only, minimal | Just 'Prompt Library'. | |
| You decide | Claude designs the page header. | ✓ |

**User's choice:** You decide
**Notes:** Deferred to Claude's discretion.

---

## Claude's Discretion

- Page header design (title, count, optional subtitle)
- Loading skeleton patterns
- Exact spacing, card dimensions, border radius
- Markdown rendering library choice
- List view column layout
- Form validation and error messages
- Toast notification pattern
- Filter dropdown component choice

## Deferred Ideas

None — discussion stayed within phase scope
