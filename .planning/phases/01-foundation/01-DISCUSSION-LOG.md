---
description: Audit trail of Phase 1 Foundation discuss-phase Q&A — captures all options presented and user selections for compliance review.
date_last_edited: 2026-03-25
---

# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-25
**Phase:** 01-foundation
**Areas discussed:** Login & demo experience, Navigation shell, Schema scope, Seed prompt depth

---

## Login & Demo Experience

### Demo bypass prominence

| Option | Description | Selected |
|--------|-------------|----------|
| Hero-level (Recommended) | Demo bypass is dominant CTA — large button above fold, email/password secondary below | ✓ |
| Equal weight | Demo button and login are side by side or equally sized | |
| Subtle link | Email/password is main form, demo bypass is small text link at bottom | |

**User's choice:** Hero-level
**Notes:** None

### Login page context

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal (Recommended) | Logo, tagline, demo CTA, login form. Clean and fast. | |
| Feature highlights | Add 2-3 short bullet points or icons showing what Upstream does | ✓ |
| Split layout | Left side: product marketing. Right side: login form. | |

**User's choice:** Feature highlights
**Notes:** None

### Demo user identity

| Option | Description | Selected |
|--------|-------------|----------|
| Named persona (Recommended) | Appears as 'Demo Consultant' with generic avatar, subtle demo banner | ✓ |
| Anonymous label | Shows 'Guest User' or 'Anonymous' | |
| You decide | Claude picks best approach | |

**User's choice:** Named persona
**Notes:** None

### Demo user role

| Option | Description | Selected |
|--------|-------------|----------|
| Consultant (Recommended) | Demo user sees consultant experience only | |
| Admin | Demo user gets full admin access | |
| Both available | Two demo buttons: 'Explore as Consultant' and 'Explore as Admin' | ✓ |

**User's choice:** Both available
**Notes:** None

---

## Navigation Shell

### Unbuilt nav items

| Option | Description | Selected |
|--------|-------------|----------|
| All visible, disabled (Recommended) | Show all 5 nav items, unbuilt ones grayed/disabled | ✓ |
| Only built items | Show only Library in Phase 1 | |
| All visible, 'coming soon' | Show all nav items with 'Coming Soon' tooltip on unbuilt ones | |

**User's choice:** All visible, disabled
**Notes:** None

### Sidebar collapsibility

| Option | Description | Selected |
|--------|-------------|----------|
| Collapsible (Recommended) | Toggle between expanded (labels) and collapsed (icons only) | ✓ |
| Always open | Sidebar stays expanded at all times | |
| You decide | Claude picks based on layout | |

**User's choice:** Collapsible
**Notes:** None

### Landing page after login

| Option | Description | Selected |
|--------|-------------|----------|
| Library view directly (Recommended) | Land on Library page immediately, no intermediate screen | ✓ |
| Welcome/overview page | Brief welcome page with 'Browse Library' CTA | |
| You decide | Claude picks best landing experience | |

**User's choice:** Library view directly
**Notes:** None

---

## Schema Scope

### Full vs incremental schema

| Option | Description | Selected |
|--------|-------------|----------|
| Full schema upfront (Recommended) | Deploy all tables, RLS, indexes in Phase 1. Phases 2-5 are UI only. | ✓ |
| Phase-by-phase | Each phase adds its own tables incrementally | |
| You decide | Claude picks based on migration simplicity | |

**User's choice:** Full schema upfront
**Notes:** None

### Role constraint

| Option | Description | Selected |
|--------|-------------|----------|
| 2 roles only (Recommended) | CHECK (role IN ('consultant', 'admin')). Matches v1 scope. | ✓ |
| 3 roles, enforce 2 in app | Schema allows 3 roles, app uses only 2 | |
| You decide | Claude picks based on migration simplicity | |

**User's choice:** 2 roles only
**Notes:** None

---

## Seed Prompt Depth

### Content detail level

| Option | Description | Selected |
|--------|-------------|----------|
| Full realistic content (Recommended) | 200-500 words per prompt, real usable text with structured sections | ✓ |
| Medium — structured skeleton | ~100-200 words with clear structure but not fully fleshed out | |
| Minimal placeholders | Title + 2-3 sentences + short stub | |

**User's choice:** Full realistic content
**Notes:** None

### Metadata variety

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, varied and realistic (Recommended) | Different models, ratings, checkout counts. Feels lived-in. | ✓ |
| Uniform defaults | All prompts start with same defaults | |
| You decide | Claude picks realistic variety | |

**User's choice:** Varied and realistic
**Notes:** User specified: use modern 2026 models (Claude Sonnet 4, GPT-4o, Gemini 2.0) and realistic seed data

---

## Claude's Discretion

- Specific shadcn/ui component choices
- Auth Hook implementation details
- RLS policy exact syntax
- Font family selection
- Sidebar collapse animation
- Demo mode banner design

## Deferred Ideas

None — discussion stayed within phase scope
