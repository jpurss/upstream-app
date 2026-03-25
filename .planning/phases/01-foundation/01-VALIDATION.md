---
phase: 01
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.1 + Testing Library 16.3.2 |
| **Config file** | `vitest.config.ts` (Wave 0 gap — must create) |
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
| 01-01-01 | 01 | 1 | AUTH-01 | integration | `npx vitest run tests/auth.test.ts -t "sign up"` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | AUTH-02 | smoke | `npx vitest run tests/auth.test.ts -t "session cookie"` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | AUTH-03 | unit | `npx vitest run tests/auth.test.ts -t "sign out"` | ❌ W0 | ⬜ pending |
| 01-01-04 | 01 | 1 | AUTH-04 | unit | `npx vitest run tests/rbac.test.ts -t "consultant redirect"` | ❌ W0 | ⬜ pending |
| 01-01-05 | 01 | 1 | AUTH-05 | unit | `npx vitest run tests/demo.test.ts -t "anon read"` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 2 | UI-01 | unit | `npx vitest run tests/theme.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 2 | UI-03 | unit | `npx vitest run tests/components.test.ts -t "monospace"` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 2 | UI-04 | unit | `npx vitest run tests/sidebar.test.ts` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 3 | SEED-01 | integration | `npx vitest run tests/seed.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — Vitest configuration with jsdom environment
- [ ] `tests/auth.test.ts` — AUTH-01, AUTH-02, AUTH-03 coverage
- [ ] `tests/rbac.test.ts` — AUTH-04 redirect logic coverage
- [ ] `tests/demo.test.ts` — AUTH-05 anonymous read access coverage
- [ ] `tests/theme.test.ts` — UI-01 dark mode default coverage
- [ ] `tests/components.test.ts` — UI-03 font class coverage
- [ ] `tests/sidebar.test.ts` — UI-04 sidebar nav items coverage
- [ ] `tests/seed.test.ts` — SEED-01 database row count coverage
- [ ] Framework install: `npm install -D vitest @testing-library/react jsdom @vitejs/plugin-react`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| RLS: consultant cannot insert to prompts table | AUTH-04 | Requires live Supabase connection with Auth Hook activated | 1. Sign in as consultant user 2. Attempt INSERT to prompts table via Supabase dashboard SQL editor 3. Verify RLS denial |
| Auth Hook injects role into JWT | AUTH-04 | Requires manual activation in Supabase Dashboard > Auth > Hooks | 1. Enable hook in dashboard 2. Sign in as test user 3. Inspect JWT payload for app_metadata.role |
| UI-02 Linear/Raycast aesthetic | UI-02 | Subjective visual assessment | Visual review of app shell — clean, dense, professional appearance |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
