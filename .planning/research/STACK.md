---
description: Technology stack recommendations for Upstream — a prompt management system for AI consultancies. Covers core framework, backend, auth, UI, and OSS component choices with rationale and confidence levels.
date_last_edited: 2026-03-25
---

# Stack Research

**Domain:** Full-stack CRUD web app — prompt management / knowledge management SaaS
**Researched:** 2026-03-25
**Confidence:** HIGH (core stack verified against official docs; component picks verified against GitHub/npm)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.2.x | Full-stack React framework | Current stable is 16.2 (not 14/15). App Router is the standard path. ~400% faster dev startup with Turbopack as default. React Compiler now stable. Vercel-native deployment. |
| React | 19.x | UI rendering | Bundled with Next.js 16. React Compiler eliminates manual `useMemo`/`useCallback`. Server Components reduce client bundle size. |
| TypeScript | 5.x | Type safety | Shipped by default in `create-next-app`. Zod 4 + TypeScript inference eliminates type duplication across schema/API/UI boundaries. |
| Tailwind CSS | 4.x | Utility-first styling | Default in `create-next-app`. Best option for the Linear/Raycast dense dark-mode aesthetic — atomic classes make custom dark themes fast. |
| shadcn/ui | latest (canary) | Component system | Copy-paste components that live in your codebase. Full dark mode support. Composable primitives (Dialog, Command, Table, etc.) built on Radix UI. Avoids being locked into a component library's opinions. |

### Backend / Data

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Supabase | latest | Auth + Postgres + RLS | Single service for auth (email + Google OAuth), relational DB, and row-level security. Free tier supports this demo indefinitely (500MB DB, unlimited auth users). RLS policies handle the consultant/lead/admin RBAC at the data layer, removing auth checks from application code. |
| `@supabase/supabase-js` | v2.x | Supabase JS client | Official client. Works in both browser and server contexts. |
| `@supabase/ssr` | latest | Next.js App Router integration | Required adapter for Supabase Auth in App Router. Manages cookie-based sessions across Server Components, Server Actions, and Middleware. Use `supabase.auth.getClaims()` (not `getSession()`) in server code. |
| PostgreSQL (via Supabase) | 15+ | Primary database | Relational model matches the Prompt → ForkedPrompt → PromptRequest hierarchy well. RLS policies on each table enforce role-based visibility without application-layer guards. |

### UI Component Libraries (OSS)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui | latest | Layout, forms, dialogs, tables baseline | All general UI — Button, Input, Select, Dialog, Tabs, Badge, Command (search palette). Already ships dark mode. |
| Tiptap | 3.x | Markdown / rich text editor | Prompt content editing. Headless, ProseMirror-based, MIT core. Use with `@tiptap/extension-markdown` for markdown import/export. The free OSS tier covers everything needed here — paid features (collaboration, AI) are out of scope for v1. |
| `@uiw/react-md-editor` | latest | Lightweight markdown editor alternative | Use instead of Tiptap if you want a simpler split-pane editor (textarea-based, lower complexity). Less flexible but faster to implement. Fallback option if Tiptap feels heavy. |
| `react-diff-viewer` | 3.1.x | Side-by-side diff view for merge reviews | Use for the merge review screen. Supports split view (side-by-side) and inline view, word-level highlighting, dark mode theming, and code folding. Last release May 2024 — maintained but not hyperactive. |
| `@git-diff-view/react` | 0.1.x | Alternative diff viewer with git aesthetics | Newer, more git-native look (v0.1.3, March 2026, actively maintained). Consider if react-diff-viewer's styling conflicts with the dark theme. |
| TanStack Table | v8.x | Prompt library data grid | Headless, 10–15kb. Handles sorting, filtering, pagination, column pinning. Use with shadcn/ui Table markup. Required for the prompt library browse view. |
| Recharts | 3.8.x | Analytics charts (dashboard) | SVG-based, declarative React components. 834k projects use it. v3.8.0 released March 2026 — actively maintained. Use for the admin dashboard metric charts (BarChart, LineChart, PieChart). |
| next-themes | latest | Dark mode toggle | Zero-flash dark mode for Next.js App Router. `ThemeProvider` wraps the root layout. Works with Tailwind's `dark:` classes. Required for dark mode default. |
| Sonner | latest | Toast notifications | Shadcn's recommended toast library. Replaces the older `react-hot-toast` pattern in shadcn setups. Handles success/error feedback for CRUD operations. |

### Form & Validation

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React Hook Form | 7.x | Form state management | Used for all form-heavy screens (create prompt, create engagement, edit forked prompt). Minimal re-renders, native integration with shadcn form primitives. |
| Zod | 4.x | Schema validation | Zod 4 now stable. Define schema once, infer TypeScript types, validate on both client and server. Use with RHF `zodResolver`. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Turbopack | Dev bundler (default in Next.js 16) | Now the default — `next dev` uses Turbopack automatically. ~400% faster startup than Webpack. No configuration needed. |
| ESLint 9 | Linting | Next.js 16 ships with ESLint 9 support. Use flat config format (`eslint.config.mjs`). |
| Prettier | Code formatting | Pair with `prettier-plugin-tailwindcss` to auto-sort class names. |
| `@next/codemod` | Upgrade automation | Use when upgrading Next.js major versions: `npx @next/codemod@canary upgrade latest` |

---

## Installation

```bash
# Bootstrap project
npx create-next-app@latest upstream --yes
# (TypeScript, Tailwind, ESLint, App Router, Turbopack selected by default)

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# shadcn/ui (initializes components.json)
npx shadcn@latest init

# Form + validation
npm install react-hook-form zod @hookform/resolvers

# Markdown editor (Tiptap core + markdown extension)
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-markdown

# Diff viewer
npm install react-diff-viewer-continued
# OR (newer git-native look)
npm install @git-diff-view/react @git-diff-view/utils

# Data tables
npm install @tanstack/react-table

# Charts
npm install recharts

# Dark mode
npm install next-themes

# Toast notifications (via shadcn)
npx shadcn@latest add sonner

# Dev tools
npm install -D prettier prettier-plugin-tailwindcss
```

---

## Alternatives Considered

| Category | Recommended | Alternative | When to Use Alternative |
|----------|-------------|-------------|------------------------|
| Framework | Next.js 16 | Remix / SvelteKit | If you need fine-grained loader control (Remix) or want smaller bundle (Svelte). Next.js wins here: Vercel-native, shadcn ecosystem built around it. |
| Backend/DB | Supabase | PlanetScale + Auth.js | If you need MySQL or want to self-host auth. Supabase is simpler for a solo-built demo on free tier. |
| DB (alternative) | Supabase Postgres | Neon (serverless Postgres) | Neon is excellent for serverless-native Postgres. But Supabase bundles auth + RLS + storage, removing 3 separate services. Single-vendor simplicity wins for a demo. |
| Component system | shadcn/ui | Radix UI (primitives only) | Radix is shadcn's foundation. Use Radix directly only if you want zero pre-styled components. For this project, shadcn's defaults match the Linear aesthetic well. |
| Markdown editor | Tiptap | `@uiw/react-md-editor` | react-md-editor is simpler and textarea-based (lower complexity, fewer bugs). Choose it if Tiptap feels over-engineered. Tiptap wins if you need extensibility (custom nodes, toolbar). |
| Diff viewer | react-diff-viewer | `@git-diff-view/react` | git-diff-view is newer and more git-native looking. react-diff-viewer has 3 years of battle-testing. Either works; pick based on visual alignment with your dark theme. |
| Charts | Recharts | Tremor / shadcn-charts | Tremor is a higher-level dashboard component library (built on Recharts). Use Tremor if you want even less setup. Shadcn now ships chart components built on Recharts — use those to stay within the shadcn ecosystem. |
| State management | React Server Components + `useState` | Zustand / Jotai | For this CRUD app, server state via Supabase + minimal local state is sufficient. No global state manager needed. Add Zustand only if complex cross-component state appears. |
| Data fetching | Supabase client (direct) | TanStack Query | TanStack Query v5 adds caching, background refetch, and optimistic updates. Consider adding it in Phase 2 if Supabase direct-fetch patterns feel repetitive. Not needed for MVP. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Next.js 14 / Pages Router | PRD specifies 14+ but current stable is 16.2. Pages Router is legacy — lacks Server Components, has worse DX. | Next.js 16.2 App Router |
| Prisma ORM | Adds a generation step + connection pooling complexity. Supabase's generated TypeScript types from `supabase gen types` gives you the same type safety without the ORM layer. | Supabase client + generated types |
| Monaco Editor | Massive bundle size (~2MB). Correct choice for a code IDE, but overkill for a markdown editor field. | Tiptap or `@uiw/react-md-editor` |
| Formik | Slower re-renders, larger bundle, less idiomatic in 2025. React Hook Form has displaced it as the standard. | React Hook Form |
| Material UI / Ant Design | Opinionated design system that fights the Linear/Raycast aesthetic. Requires theme overrides everywhere. | shadcn/ui (copy-paste into your codebase) |
| `getSession()` in server code | Supabase docs explicitly warn: never trust `getSession()` in server code because it cannot guarantee token revalidation. | `supabase.auth.getClaims()` on server |
| Redux | Architectural overkill for a CRUD app. No shared global state requirements justify Redux overhead. | `useState` + React Context where needed |
| next-auth / Auth.js | Supabase Auth already handles email + Google OAuth. Adding Auth.js creates two competing auth systems. | Supabase Auth (`@supabase/ssr`) |

---

## Stack Patterns by Variant

**For the markdown editor (prompt content):**
- Use Tiptap with `@tiptap/extension-markdown` if you want a rich WYSIWYG experience with toolbar controls
- Use `@uiw/react-md-editor` if you want a split-pane raw markdown editor (source | preview side by side)
- For the Linear aesthetic, the raw markdown approach may feel more appropriate for a "power user" tool

**For dark mode:**
- Install `next-themes`, wrap root layout with `<ThemeProvider defaultTheme="dark" attribute="class">`
- Set Tailwind's `darkMode: 'class'` in `tailwind.config.ts`
- All shadcn components pick up dark mode automatically via the `dark:` class cascade

**For RBAC with Supabase RLS:**
- Store role in `users.role` (enum: `consultant | lead | admin`)
- Surface role in JWT via custom Supabase auth hook: `raw_app_meta_data.role`
- RLS policies reference `(auth.jwt() -> 'app_meta_data' ->> 'role')` for role-gated tables
- Server Components call `supabase.auth.getClaims()` and check role before rendering admin routes

**For Vercel free tier longevity:**
- 100GB/month bandwidth is ample for a demo
- Keep all images in Supabase Storage (not Vercel Blob) to avoid Vercel storage costs
- Use ISR (`revalidate`) for the prompt library listing — reduces function invocations

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Next.js 16.x | React 19.x | React 19 is required for Next.js 16 App Router. React Compiler is stable. |
| `@supabase/ssr` | Next.js 13+ App Router | Requires middleware setup for cookie management. Follow the official Next.js guide exactly. |
| Tiptap 3.x | React 18+ | Tiptap 3 dropped support for React 17. Works with React 19. |
| TanStack Table v8 | React 18+ | v8 is the current stable. v9 is in development but not yet production-ready. |
| Recharts 3.x | React 18+ | v3 adds TypeScript generics. Breaking changes from v2 — use migration guide if upgrading. |
| next-themes | Next.js 13+ App Router | Requires `suppressHydrationWarning` on `<html>` element to prevent hydration mismatch. |
| Zod 4 | TypeScript 5+ | Zod 4 requires TypeScript 5 for full inference support. |

---

## Free Tier Constraints

| Service | Free Tier Limit | Risk for This Project |
|---------|----------------|----------------------|
| Supabase | 500MB DB, unlimited auth, 1GB file storage, 2GB bandwidth | LOW — 18 seed prompts + demo data is well under 500MB |
| Vercel Hobby | 100GB bandwidth, 1M function invocations/month | LOW — demo traffic with one user (Brendan) is negligible |
| Vercel Hobby | No team collaboration, no password protection | LOW — public demo URL is the intent |

---

## Sources

- Next.js 16.2 official release blog — `https://nextjs.org/blog` — HIGH confidence (official source, March 18 2026)
- Next.js installation docs — `https://nextjs.org/docs/app/getting-started/installation` — HIGH confidence (current version 16.2.1 confirmed)
- Supabase Auth + Next.js guide — `https://supabase.com/docs/guides/auth/server-side/nextjs` — HIGH confidence (official docs, `getClaims()` warning confirmed)
- Supabase RLS docs — `https://supabase.com/docs/guides/database/postgres/row-level-security` — HIGH confidence
- shadcn/ui docs — `https://ui.shadcn.com/docs` — HIGH confidence (components confirmed, dark mode confirmed)
- Tiptap docs — `https://tiptap.dev/docs/editor/getting-started/overview` — HIGH confidence (v3 confirmed, MIT core confirmed)
- TanStack Table docs — `https://tanstack.com/table/latest` — HIGH confidence (v8 current, headless confirmed)
- Recharts GitHub — `https://github.com/recharts/recharts` — HIGH confidence (v3.8.0, March 2026, actively maintained)
- react-diff-viewer GitHub releases — HIGH confidence (v3.1.0, actively maintained)
- git-diff-view GitHub — `https://github.com/MrWangJustToDo/git-diff-view` — HIGH confidence (v0.1.3, March 2026)
- Zod docs — `https://zod.dev` — HIGH confidence (v4 stable confirmed)
- Vercel pricing — `https://vercel.com/pricing` — HIGH confidence (100GB bandwidth, 1M invocations confirmed)

---

*Stack research for: Upstream — Prompt Management System for AI Consultancies*
*Researched: 2026-03-25*
