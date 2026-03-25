---
description: Human UAT checklist for Phase 02 — 4 tests covering browse, filter/search, admin create, and admin edit/deprecate flows.
date_last_edited: 2026-03-25
status: partial
phase: 02-prompt-library
source: [02-VERIFICATION.md]
started: 2026-03-25T10:00:00Z
updated: 2026-03-25T10:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Library Browse with Live Seed Data
Navigate to /library as consultant — verify 18 seed prompts visible in grid, no admin controls
expected: Cards render with title, category badge, model badge, star rating, checkout count. No "New Prompt" button. Grid layout responsive.
result: [pending]

### 2. Filter, Search, and URL State
Use the filter bar — select a category, type a search query, toggle list view
expected: Filter chips appear with active filter. Result count shows "N of M prompts". Search debounces ~300ms. List view shows prompt rows. URL params update (?category=Discovery&q=...).
result: [pending]

### 3. Prompt Detail and Copy-to-Clipboard
Click a card to reach detail page, copy content
expected: Two-column layout, monospace markdown content, Copy→Check icon swap, "Copied to clipboard" toast. Sidebar shows metadata and stats grid.
result: [pending]

### 4. Admin CRUD Controls
Log in as admin — create, edit, and deprecate a prompt
expected: /library/new form with 11 fields + Write/Preview tabs. Submit redirects to /library with new prompt. Edit pre-fills all fields. Deprecate dialog shows "Deprecate this prompt?" with "Keep Prompt"/"Deprecate" buttons. Deprecated prompt absent from grid.
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
