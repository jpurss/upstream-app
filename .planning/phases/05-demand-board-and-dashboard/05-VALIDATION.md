---
phase: 5
slug: demand-board-and-dashboard
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.1 + @vitejs/plugin-react |
| **Config file** | `vitest.config.ts` (exists at project root) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 0 | DEMAND-01 | unit | `npm test -- tests/demand-submit.test.ts` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 0 | DEMAND-03 | unit | `npm test -- tests/demand-upvote.test.ts` | ❌ W0 | ⬜ pending |
| 05-01-03 | 01 | 0 | DEMAND-04, DEMAND-05 | unit | `npm test -- tests/demand-admin-actions.test.ts` | ❌ W0 | ⬜ pending |
| 05-01-04 | 01 | 0 | DASH-01 | unit | `npm test -- tests/dashboard-gate.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/demand-submit.test.ts` — stubs for DEMAND-01 (submitRequest auth + insert)
- [ ] `tests/demand-upvote.test.ts` — stubs for DEMAND-03 (toggleUpvote insert/delete)
- [ ] `tests/demand-admin-actions.test.ts` — stubs for DEMAND-04, DEMAND-05 (resolveRequest, declineRequest auth + mutations)
- [ ] `tests/dashboard-gate.test.ts` — stubs for DASH-01 (admin redirect gate)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Upvote arrow visual feedback (filled/outline) | DEMAND-03 | Visual rendering | Click upvote arrow, verify filled+brand blue when upvoted, outline when not |
| Chart rendering with seed data | DASH-02, DASH-03, DASH-04 | Recharts visual output | Load dashboard, verify line chart shows weekly data, bar chart shows demand vs supply, tables show top/bottom prompts |
| Demo bypass sees seed data | SEED-02, SEED-03 | End-to-end demo flow | Click Demo Bypass, navigate to engagements/demand/dashboard, verify pre-populated data |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
