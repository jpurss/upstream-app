---
phase: 02
slug: prompt-library
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.1 + @testing-library/react 16.3.2 |
| **Config file** | `vitest.config.ts` (project root) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | LIB-01 | unit | `npm test -- tests/library-create.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 02-01-02 | 01 | 1 | LIB-02 | unit | `npm test -- tests/library-edit.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 02-01-03 | 01 | 1 | LIB-03 | unit | `npm test -- tests/library-deprecate.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 02-02-01 | 02 | 1 | LIB-04 | unit | `npm test -- tests/library-grid.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 02-02-02 | 02 | 1 | LIB-05 | unit | `npm test -- tests/library-filter.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 02-02-03 | 02 | 1 | LIB-06 | unit | `npm test -- tests/library-search.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 02-03-01 | 03 | 2 | LIB-07 | unit | `npm test -- tests/library-detail.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 02-03-02 | 03 | 2 | LIB-08 | unit | `npm test -- tests/library-copy.test.tsx` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/library-grid.test.tsx` — stubs for LIB-04
- [ ] `tests/library-filter.test.tsx` — stubs for LIB-05
- [ ] `tests/library-search.test.tsx` — stubs for LIB-06
- [ ] `tests/library-detail.test.tsx` — stubs for LIB-07
- [ ] `tests/library-copy.test.tsx` — stubs for LIB-08
- [ ] `tests/library-create.test.tsx` — stubs for LIB-01
- [ ] `tests/library-edit.test.tsx` — stubs for LIB-02
- [ ] `tests/library-deprecate.test.tsx` — stubs for LIB-03

*Existing infrastructure covers: vitest config, jsdom env, @testing-library/react, `@` alias, `vi.mock` patterns for supabase and next/navigation.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Grid/list view toggle renders correctly | LIB-04 | Visual layout verification | Toggle between grid and list views, check card layout |
| Filter chips dismiss animation | LIB-05 | Visual interaction | Click dismiss on filter chips, verify removal |
| Markdown content renders correctly | LIB-07 | Visual rendering quality | Open detail page, verify markdown formatting |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
