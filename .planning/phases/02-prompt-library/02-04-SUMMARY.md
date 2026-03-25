---
description: Summary for Phase 02 Plan 04 — admin CRUD capabilities for the prompt library including server actions, prompt form with Write/Preview markdown tabs, create/edit pages, deprecation dialog, and admin-only UI controls wired into library and detail pages.
date_last_edited: 2026-03-25
phase: 02-prompt-library
plan: "04"
subsystem: admin-crud
tags: [server-actions, shadcn, forms, markdown, next.js, tailwind, lucide-react, sonner]

requires:
  - phase: 02-01
    provides: "fetchPromptById, Prompt type, lib/types/prompt.ts"
  - phase: 02-02
    provides: "Library browse page, LibraryGrid, isAdmin pattern, library/page.tsx"
  - phase: 02-03
    provides: "PromptDetailSidebar with isAdmin prop and admin controls slot"

provides:
  - "Server Actions: createPrompt, updatePrompt, deprecatePrompt with admin role guard"
  - "PromptForm: shared form component for create and edit pages with all 11 fields"
  - "MarkdownPreview: Write/Preview tabs with Geist Mono textarea and react-markdown preview"
  - "DeprecationDialog: AlertDialog confirmation with copywriting contract text"
  - "Admin create page at /library/new (admin-only, redirects consultants)"
  - "Admin edit page at /library/[id]/edit with pre-filled form and Deprecate button in header"
  - "New Prompt button on library page (admin-only, conditional render)"
  - "Edit Prompt + Deprecate controls in detail sidebar (admin-only, conditional render)"

affects: [engagements-phase, forking-phase]

tech-stack:
  added:
    - "shadcn field component (FieldGroup, Field, FieldLabel, FieldDescription) — installed from base-nova registry"
    - "shadcn spinner component — installed from base-nova registry"
  patterns:
    - "Server Actions with 'use server' directive for all CRUD mutations"
    - "Admin role guard pattern: shared getAdminUser() helper in actions.ts checks app_metadata.role and demo_role"
    - "base Select API with items prop — all Select components use items array, no inline JSX-only pattern"
    - "FieldGroup + Field + FieldLabel pattern for form layout (not raw divs)"
    - "Button with render={<Link>} + nativeButton={false} for button-as-link navigation"
    - "AlertDialogTrigger with render={<Button />} — base API, not asChild"
    - "useTransition for server action pending state with Spinner component"
    - "revalidatePath after mutations to clear Next.js cache"

key-files:
  created:
    - app/(app)/library/actions.ts
    - components/library/prompt-form.tsx
    - components/library/markdown-preview.tsx
    - components/library/deprecation-dialog.tsx
    - app/(app)/library/new/page.tsx
    - app/(app)/library/[promptId]/edit/page.tsx
    - components/ui/field.tsx
    - components/ui/spinner.tsx
  modified:
    - app/(app)/library/page.tsx
    - components/library/prompt-detail-sidebar.tsx
    - tests/library-create.test.tsx
    - tests/library-deprecate.test.tsx
    - tests/library-edit.test.tsx

decisions:
  - "Server Actions handle mutations — RLS is the security gate, server-side role check is defense-in-depth"
  - "deprecatePrompt returns {success: true} (no redirect) — called from client dialog which needs to handle navigation"
  - "PromptForm uses controlled state for Select values (required for base API) but defaultValue for text inputs"
  - "targetModel and complexity Select values typed as string | null to match base Select's onValueChange signature"
  - "sonner and react-markdown/remark-gfm were listed in package.json but not installed — installed via npm install"
  - "Field and Spinner shadcn components were needed but not installed — added from base-nova registry"

metrics:
  duration_minutes: 11
  completed_date: "2026-03-25"
  tasks_completed: 3
  files_created: 8
  files_modified: 5
---

# Phase 02 Plan 04: Admin CRUD Summary

Admin users can now fully manage the prompt library — create new prompts, edit existing ones, and deprecate outdated prompts. Server Actions with role-based guards handle all mutations. A shared PromptForm component with Write/Preview markdown tabs powers both create and edit workflows. Admin controls are conditionally rendered (not disabled, not hidden via CSS) for clean role separation.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1a | Server actions + deprecation dialog | 1eb8188 | actions.ts, deprecation-dialog.tsx |
| 1b | Prompt form + markdown preview | 1eb8188 | prompt-form.tsx, markdown-preview.tsx, field.tsx, spinner.tsx |
| 2 | Admin pages + admin controls wired | c2a46d6 | new/page.tsx, edit/page.tsx, library/page.tsx, sidebar.tsx |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] sonner, react-markdown, remark-gfm not installed**
- **Found during:** Task 1a — tests failed with "Failed to resolve import sonner"
- **Issue:** These packages were declared in package.json but not installed in node_modules
- **Fix:** Ran `npm install sonner react-markdown remark-gfm nuqs` in the project root
- **Files modified:** package-lock.json (node_modules populated)
- **Commit:** Included in 1eb8188 context

**2. [Rule 3 - Blocking] shadcn field and spinner components missing**
- **Found during:** Task 1b — FieldGroup, FieldLabel, FieldDescription, Spinner referenced in plan but not installed
- **Issue:** Plan specified these shadcn components but they weren't in components/ui/
- **Fix:** Ran `npx shadcn@latest add field spinner --yes`
- **Files created:** components/ui/field.tsx, components/ui/spinner.tsx
- **Commit:** 1eb8188

**3. [Rule 1 - Bug] TypeScript type error: targetModel/complexity setState mismatch**
- **Found during:** Task 2 (build verification)
- **Issue:** `useState<string>` didn't match `onValueChange: (value: string | null) => void` on base Select
- **Fix:** Changed to `useState<string | null>` and added null coalescing in formData.set calls
- **Commit:** c2a46d6

## Known Stubs

None — all form fields wire to server actions with real database mutations.

## Self-Check: PASSED

Files created:
- app/(app)/library/actions.ts — FOUND
- components/library/prompt-form.tsx — FOUND
- components/library/markdown-preview.tsx — FOUND
- components/library/deprecation-dialog.tsx — FOUND
- app/(app)/library/new/page.tsx — FOUND
- app/(app)/library/[promptId]/edit/page.tsx — FOUND

Commits verified:
- 1eb8188 — Task 1a+1b commit
- c2a46d6 — Task 2 commit

Build: PASSED (Next.js 16.2.1 Turbopack, TypeScript check passed)
Tests: 14 tests passing in library-create, library-deprecate, library-edit test files
