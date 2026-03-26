---
phase: 04
slug: merge-workflow
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.1 + @testing-library/react |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | MERGE-01 | unit | `npm test -- tests/merge-suggest.test.ts` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | MERGE-01 | unit | `npm test -- tests/merge-suggest.test.ts` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 1 | MERGE-02 | unit | `npm test -- tests/merge-diff.test.tsx` | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 1 | MERGE-03 | unit | `npm test -- tests/merge-data.test.ts` | ❌ W0 | ⬜ pending |
| 04-03-02 | 03 | 1 | MERGE-03 | unit | `npm test -- tests/review-queue.test.ts` | ❌ W0 | ⬜ pending |
| 04-04-01 | 04 | 2 | MERGE-04 | unit | `npm test -- tests/merge-approve.test.ts` | ❌ W0 | ⬜ pending |
| 04-04-02 | 04 | 2 | MERGE-04 | unit | `npm test -- tests/merge-approve.test.ts` | ❌ W0 | ⬜ pending |
| 04-05-01 | 05 | 2 | MERGE-05 | unit | `npm test -- tests/merge-decline.test.ts` | ❌ W0 | ⬜ pending |
| 04-05-02 | 05 | 2 | MERGE-05 | unit | `npm test -- tests/merge-decline.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/merge-suggest.test.ts` — stubs for MERGE-01 (suggestMerge server action)
- [ ] `tests/merge-data.test.ts` — stubs for MERGE-03 (data layer, admin client verification)
- [ ] `tests/review-queue.test.ts` — stubs for MERGE-03 (admin gate redirect)
- [ ] `tests/merge-approve.test.ts` — stubs for MERGE-04 (approve action, version bump, changelog)
- [ ] `tests/merge-decline.test.ts` — stubs for MERGE-05 (decline reason storage)
- [ ] `tests/merge-diff.test.tsx` — stubs for MERGE-02 (DiffViewer props)

Test mock pattern established in `tests/library-deprecate.test.tsx`.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Side-by-side diff renders correctly with dark theme | MERGE-02 | Visual rendering verification | Open review detail, verify left/right columns show diff with syntax highlighting |
| Status badge color transitions (amber/teal/red) | MERGE-01, MERGE-04, MERGE-05 | CSS color rendering | Submit merge suggestion, verify amber badge; approve, verify teal; decline, verify red |
| Pending count badge updates in sidebar | MERGE-03 | Layout-level server fetch | Submit suggestion, navigate, verify badge count increments |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
