---
description: "Wave 0 foundations for Phase 02: 8 test stubs, npm dependencies (nuqs, react-markdown, remark-gfm, sonner), 6 shadcn components, shared Prompt TypeScript type, Supabase data-access layer, Toaster in root layout, NuqsAdapter in app layout."
date_last_edited: 2026-03-25
phase: 02-prompt-library
plan: "01"
subsystem: shared-infrastructure
tags: [types, data-access, supabase, nuqs, sonner, shadcn, tdd]
dependency_graph:
  requires: []
  provides:
    - lib/types/prompt.ts (Prompt, PromptCategory, PromptStatus, PromptCapabilityType, PROMPT_CATEGORIES)
    - lib/data/prompts.ts (fetchAllActivePrompts, fetchPromptById, searchPrompts)
    - Sonner Toaster in root layout
    - NuqsAdapter in app layout
    - 8 Wave 0 test stubs for TDD RED phases in Plans 02-04
    - shadcn components: select, slider, tabs, textarea, alert-dialog, card
  affects:
    - Plans 02-02, 02-03, 02-04 (all depend on these shared types and query functions)
tech_stack:
  added:
    - nuqs@2.8.9
    - react-markdown@10.1.0
    - remark-gfm@4.0.1
    - sonner@2.0.7
  patterns:
    - "Supabase server client via createClient() from @/lib/supabase/server"
    - "TDD RED-GREEN with vitest + @testing-library/react"
    - "it.todo() pattern for Wave 0 stubs — recognized by vitest but skipped"
key_files:
  created:
    - lib/types/prompt.ts
    - lib/data/prompts.ts
    - tests/library-grid.test.tsx
    - tests/library-filter.test.tsx
    - tests/library-search.test.tsx
    - tests/library-detail.test.tsx
    - tests/library-copy.test.tsx
    - tests/library-create.test.tsx
    - tests/library-edit.test.tsx
    - tests/library-deprecate.test.tsx
    - tests/prompt-type.test.ts
  modified:
    - app/layout.tsx (added Toaster import + JSX)
    - app/(app)/layout.tsx (added NuqsAdapter import + JSX)
    - package.json (4 new npm packages)
    - components/ui/select.tsx
    - components/ui/slider.tsx
    - components/ui/tabs.tsx
    - components/ui/textarea.tsx
    - components/ui/alert-dialog.tsx
    - components/ui/card.tsx
decisions:
  - "Added PROMPT_CATEGORIES runtime constant to lib/types/prompt.ts to make category values testable at runtime (TypeScript union types are erased at compile time)"
  - "fetchPromptById does NOT filter by status per D-14 — deprecated prompts remain accessible at direct URLs"
  - "searchPrompts uses ilike fallback per RESEARCH.md Pitfall 1 — appropriate for 18 prompts in v1"
  - "Toaster placed inside ThemeProvider so it inherits dark mode theme"
  - "NuqsAdapter wraps children inside main element (not outer div) — scoped to authenticated app routes only"
metrics:
  duration: "3 minutes"
  completed_date: "2026-03-25"
  tasks_completed: 3
  files_created: 11
  files_modified: 10
---

# Phase 02 Plan 01: Wave 0 Foundations Summary

**One-liner:** Installed nuqs/sonner/react-markdown, added 6 shadcn components, created shared Prompt TypeScript type with DB-mirrored fields, Supabase data-access layer with ilike search, Toaster in root layout, NuqsAdapter in app layout, and 8 Wave 0 test stub files.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 0 | Create Wave 0 test stub files | 7c30e31 | 8 test files in tests/ |
| 1 | Install dependencies and add shadcn components | d3a5090 | package.json, 6 shadcn components |
| TDD RED | Failing tests for Prompt type and data-access | de1581a | tests/prompt-type.test.ts |
| 2 | Create Prompt type, data-access, wire layouts | 72bd3e2 | lib/types/prompt.ts, lib/data/prompts.ts, app/layout.tsx, app/(app)/layout.tsx |

## Verification Results

```
Test Files  5 passed | 8 skipped (13)
      Tests 27 passed | 34 todo (61)
   Duration 1.34s
```

All acceptance criteria satisfied:
- package.json contains nuqs@^2.8.9, react-markdown@^10.1.0, remark-gfm@^4.0.1, sonner@^2.0.7
- All 6 shadcn components exist in components/ui/
- lib/types/prompt.ts exports Prompt, PromptCategory, PromptStatus, PromptCapabilityType, PROMPT_CATEGORIES
- lib/data/prompts.ts exports fetchAllActivePrompts, fetchPromptById, searchPrompts
- fetchPromptById does NOT contain .eq('status') — per D-14
- app/layout.tsx contains Toaster import and JSX
- app/(app)/layout.tsx contains NuqsAdapter import and JSX
- All 8 Wave 0 stub files exist with describe/it.todo blocks

## Deviations from Plan

### Auto-added Improvements

**1. [Rule 2 - Missing] Added PROMPT_CATEGORIES runtime constant**
- **Found during:** Task 2 TDD RED phase
- **Issue:** TypeScript union types are erased at compile time — the test for "PromptCategory includes all 6 seed categories" would need a runtime value to assert against
- **Fix:** Added `export const PROMPT_CATEGORIES: PromptCategory[]` constant alongside the type export
- **Files modified:** lib/types/prompt.ts
- **Commit:** 72bd3e2

## Known Stubs

None — all files implement real logic (data-access layer queries real Supabase). No placeholder data.

## Self-Check: PASSED
