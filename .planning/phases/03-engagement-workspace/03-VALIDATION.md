---
phase: 3
slug: engagement-workspace
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.1 + @testing-library/react 16.3.2 |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `npx vitest run tests/engagements*.test.* tests/fork*.test.* tests/star*.test.* tests/diff*.test.* tests/issue*.test.* --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/engagements*.test.* tests/fork*.test.* tests/star*.test.* tests/diff*.test.* tests/issue*.test.* --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | ENG-01 | unit | `npx vitest run tests/engagement-create.test.ts -x` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | ENG-02 | unit | `npx vitest run tests/engagement-grid.test.tsx -x` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | ENG-03 | unit | `npx vitest run tests/fork-grid.test.tsx -x` | ❌ W0 | ⬜ pending |
| 03-01-04 | 01 | 1 | ENG-04 | unit | `npx vitest run tests/engagement-status.test.ts -x` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | FORK-01 | unit | `npx vitest run tests/fork-create.test.ts -x` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 2 | FORK-02 | unit | `npx vitest run tests/fork-editor.test.tsx -x` | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 2 | FORK-03, FORK-04 | unit | `npx vitest run tests/fork-sidebar.test.tsx -x` | ❌ W0 | ⬜ pending |
| 03-03-03 | 03 | 2 | FORK-05 | unit | `npx vitest run tests/star-rating.test.tsx -x` | ❌ W0 | ⬜ pending |
| 03-03-04 | 03 | 2 | FORK-06 | unit | `npx vitest run tests/issue-tag-group.test.tsx -x` | ❌ W0 | ⬜ pending |
| 03-04-01 | 04 | 2 | FORK-07 | unit | `npx vitest run tests/diff-viewer.test.tsx -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/engagement-create.test.ts` — stubs for ENG-01
- [ ] `tests/engagement-grid.test.tsx` — stubs for ENG-02
- [ ] `tests/fork-grid.test.tsx` — stubs for ENG-03
- [ ] `tests/engagement-status.test.ts` — stubs for ENG-04
- [ ] `tests/fork-create.test.ts` — stubs for FORK-01
- [ ] `tests/fork-editor.test.tsx` — stubs for FORK-02
- [ ] `tests/fork-sidebar.test.tsx` — stubs for FORK-03, FORK-04
- [ ] `tests/star-rating.test.tsx` — stubs for FORK-05
- [ ] `tests/issue-tag-group.test.tsx` — stubs for FORK-06
- [ ] `tests/diff-viewer.test.tsx` — stubs for FORK-07
- [ ] Mock Supabase client patterns (model from `tests/library-grid.test.tsx`)
- [ ] Mock `ForkedPrompt` and `Engagement` type fixtures

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Autosave visual indicators ("Saving..."/"Saved") | FORK-02 | CSS transition timing | 1. Edit fork content 2. Observe "Saving..." appears within 200ms 3. "Saved" replaces after server response |
| Side-by-side diff layout renders correctly | FORK-07 | Visual layout verification | 1. Navigate to fork with changes 2. Click Diff tab 3. Verify two columns: "Original" left, "Adapted" right |
| Role-based landing page redirect | ENG-01 | Auth flow integration | 1. Login as consultant 2. Verify redirect to /engagements 3. Login as admin 4. Verify redirect to /library |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
