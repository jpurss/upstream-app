---
phase: 01
slug: foundation
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-25
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.1 + Testing Library 16.3.2 |
| **Config file** | `vitest.config.ts` (created in Plan 01-01, Task 1) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-02-T1 | 02 | 2 | AUTH-01, AUTH-02, AUTH-03, AUTH-05 | unit | `npx vitest run tests/auth-actions.test.ts --reporter=verbose` | tests/auth-actions.test.ts | ⬜ pending |
| 01-02-T2 | 02 | 2 | UI-02 | render | `npx vitest run tests/login-page.test.tsx --reporter=verbose` | tests/login-page.test.tsx | ⬜ pending |
| 01-03-T1a | 03 | 3 | UI-04 | render | `npx vitest run tests/sidebar.test.tsx --reporter=verbose` | tests/sidebar.test.tsx | ⬜ pending |
| 01-03-T1b | 03 | 3 | UI-04 | render | `npx vitest run tests/demo-banner.test.tsx --reporter=verbose` | tests/demo-banner.test.tsx | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

All Wave 0 test scaffolds are created inline by their respective TDD tasks (each task with `tdd="true"` writes failing tests first as part of the RED-GREEN-REFACTOR cycle). No separate Wave 0 step is needed.

- [x] `vitest.config.ts` — Created in Plan 01-01, Task 1
- [x] `tests/auth-actions.test.ts` — Created in Plan 01-02, Task 1 (tdd="true")
- [x] `tests/login-page.test.tsx` — Created in Plan 01-02, Task 2 (tdd="true")
- [x] `tests/sidebar.test.tsx` — Created in Plan 01-03, Task 1 (tdd="true")
- [x] `tests/demo-banner.test.tsx` — Created in Plan 01-03, Task 1 (tdd="true")
- [x] Framework install: `npm install -D vitest @testing-library/react jsdom @vitejs/plugin-react` (Plan 01-01, Task 1)

---

## Tasks Without Automated Tests

| Task ID | Plan | Rationale |
|---------|------|-----------|
| 01-01-T1 | 01 | Bootstrap/config task — verified by `npm run build` and `npx vitest run` exit codes |
| 01-01-T2 | 01 | SQL migration file — verified by file existence and content checks (no runtime test) |
| 01-01-T3 | 01 | checkpoint:human-action — Supabase project creation, manual by nature |
| 01-03-T2 | 03 | tdd="false" — static Server Component (library placeholder) + SQL seed data file, no testable logic |
| 01-03-T3 | 03 | checkpoint:human-verify — visual inspection of running app |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| RLS: consultant cannot insert to prompts table | AUTH-04 | Requires live Supabase connection with Auth Hook activated | 1. Sign in as consultant user 2. Attempt INSERT to prompts table via Supabase dashboard SQL editor 3. Verify RLS denial |
| Auth Hook injects role into JWT | AUTH-04 | Requires manual activation in Supabase Dashboard > Auth > Hooks | 1. Enable hook in dashboard 2. Sign in as test user 3. Inspect JWT payload for app_metadata.role |
| UI-02 Linear/Raycast aesthetic | UI-02 | Subjective visual assessment | Visual review of app shell — clean, dense, professional appearance |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (all test files created by tdd="true" tasks)
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
