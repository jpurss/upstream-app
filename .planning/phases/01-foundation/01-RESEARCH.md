---
description: Research for Phase 1 Foundation — covers Next.js 16 App Router setup, Supabase Auth Hooks for RBAC, anonymous sign-in isolation, Tailwind 4 dark mode theming, shadcn/ui sidebar, and full database schema with RLS policies.
date_last_edited: 2026-03-25
---

# Phase 1: Foundation - Research

**Researched:** 2026-03-25
**Domain:** Next.js 16 + Supabase Auth + shadcn/ui + Tailwind 4
**Confidence:** HIGH (all claims verified against official docs or npm registry)

## Summary

Phase 1 is a greenfield Next.js 16 App Router application wired to a Supabase backend. The three technically nuanced areas are: (1) Supabase Auth Hook configuration to inject role into JWT `app_metadata` (required for RLS policies that enforce admin vs. consultant access), (2) anonymous sign-in isolation for the demo bypass using `signInAnonymously()`, and (3) Tailwind 4's breaking change from a JS config file to CSS-native configuration.

Next.js 16 introduces a naming change — `middleware.ts` is now `proxy.ts` — that the Supabase SSR docs have already adopted. This is stable (16.2.1 is npm latest as of research date). The full database schema from the PRD §7.2 is deployable as-is with one modification: change the `role` CHECK constraint from `('consultant', 'lead', 'admin')` to `('consultant', 'admin')` per decision D-09.

**Primary recommendation:** Bootstrap with `create-next-app@latest`, add Supabase SSR and shadcn/ui, deploy the Auth Hook and full schema to Supabase before writing any application code, then build the UI shell.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Demo bypass is hero-level prominence — the dominant CTA above the fold. Large "Explore the Demo" button with "No signup required" subtext. Email/password login is secondary below an "or" divider.
- **D-02:** Login page includes 2-3 feature highlight bullets/icons showing what Upstream does (library, fork/merge, demand board) alongside the form.
- **D-03:** Demo user appears as "Demo Consultant" with a generic avatar. Subtle banner indicating demo mode.
- **D-04:** Two demo buttons available: "Explore as Consultant" and "Explore as Admin" — Brendan can try both perspectives in one session.
- **D-05:** All 5 nav items visible in sidebar from Phase 1: Library (active), Engagements (disabled), Demand Board (disabled), Review Queue (admin, disabled), Dashboard (admin, disabled). Unbuilt items are grayed out.
- **D-06:** Sidebar is collapsible — toggle between expanded (labels visible) and collapsed (icons only). Standard Linear/Raycast pattern.
- **D-07:** After login, user lands directly on the Library page. No intermediate welcome screen or dashboard.
- **D-08:** Full schema deployed in Phase 1 — all tables, all RLS policies, all indexes. Phases 2-5 add UI only, no migrations needed.
- **D-09:** Schema CHECK constraint allows 2 roles only: `CHECK (role IN ('consultant', 'admin'))`. No lead role in v1.
- **D-10:** Full realistic content — each of the 18 prompts has 200-500 words of real, usable prompt text with system instructions, structured sections, and placeholders like `{{client_name}}`.
- **D-11:** Varied and realistic metadata using modern 2026 models (Claude Sonnet 4, GPT-4o, Gemini 2.0, model-agnostic). Different effectiveness ratings (3.2-4.8), varied checkout counts (5-45).
- **D-12:** Two roles only — consultant and admin (no lead role in v1)
- **D-13:** Demo bypass uses `signInAnonymously()` for per-session isolation — not a shared hardcoded account
- **D-14:** RBAC stored in `app_metadata` via Auth Hook (not `user_metadata`) — prevents self-elevation
- **D-15:** Stack: Next.js 14+ (App Router) + Tailwind + shadcn/ui + Supabase + Vercel
- **D-16:** Dark mode default, Human Agency brand blue (#4287FF) accent
- **D-17:** Monospace font for prompt content, sans-serif for UI chrome
- **D-18:** Desktop-only for v1

### Claude's Discretion
- Specific shadcn/ui component choices for sidebar, buttons, forms
- Auth Hook implementation details
- RLS policy exact syntax (adapt PRD §7.3 for 2-role model)
- Specific font families (monospace and sans-serif choices)
- Responsive sidebar collapse animation/behavior
- Demo mode banner design and placement

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | User can sign up with email and password | Supabase email/password auth via `supabase.auth.signUp()` |
| AUTH-02 | User can log in and session persists across browser refresh | Supabase session cookies via `@supabase/ssr`, `proxy.ts` token refresh |
| AUTH-03 | User can log out from any page | `supabase.auth.signOut()` from any Server Action |
| AUTH-04 | Role-based access enforced — consultant and admin roles | Auth Hook injects role into JWT `app_metadata`; RLS policies read `auth.jwt()->'app_metadata'->>'role'` |
| AUTH-05 | Demo bypass button creates anonymous session with full read access and seed data | `supabase.auth.signInAnonymously()`; RLS policies grant anon+authenticated read on prompts |
| UI-01 | Dark mode default with Human Agency brand blue (#4287FF) accent | next-themes `defaultTheme="dark"`; CSS variable `--primary` set to `#4287FF` in globals.css |
| UI-02 | Linear/Raycast-inspired aesthetic — clean, dense, professional | shadcn/ui component library with Tailwind 4 |
| UI-03 | Monospace font for prompt content, sans-serif for UI chrome | GeistSans + GeistMono from `geist` package; Tailwind font-family utilities |
| UI-04 | Responsive sidebar navigation with Library, Engagements, Demand Board, Review Queue, Dashboard | shadcn/ui Sidebar with `collapsible="icon"` mode |
| SEED-01 | 18 realistic AI consulting prompts pre-loaded across 6 categories | SQL seed file inserted via Supabase migration or seed script |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.1 | App Router framework, proxy auth middleware | npm latest stable as of 2026-03-25 |
| @supabase/supabase-js | 2.100.0 | Supabase browser client | Official JS client |
| @supabase/ssr | 0.9.0 | Cookie-based session management for SSR | Required for App Router auth pattern |
| tailwindcss | 4.2.2 | Utility CSS | npm latest — v4 is now stable, CSS config (no tailwind.config.js) |
| shadcn | 4.1.0 | Component scaffolding CLI | `npx shadcn@latest init` |
| next-themes | 0.4.6 | Dark/light mode switching | shadcn-recommended companion |
| geist | 1.7.0 | Geist Sans + Geist Mono fonts | Vercel's font — clean, professional, designed for developer tools |
| lucide-react | 1.6.0 | Icon library | shadcn/ui default icon set |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vercel/analytics | 2.0.1 | Usage analytics | Add to layout.tsx, zero config on Vercel |
| vitest | 4.1.1 | Unit test runner | Test framework for auth utils, RLS helper functions |
| @testing-library/react | 16.3.2 | Component testing | Test form components, login flow |
| @playwright/test | 1.58.2 | E2E tests | Auth flow smoke tests (optional for phase 1) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| geist | Inter (next/font/google) | Inter is slightly more widely used but Geist is purpose-built for developer tools; better monospace pairing |
| shadcn/ui Sidebar | Custom sidebar | Sidebar handles collapse state, keyboard nav, cookie persistence — not worth hand-rolling |
| next-themes | Custom class toggle | next-themes handles SSR hydration mismatch edge cases that are easy to get wrong |
| Tailwind 4 CSS config | Tailwind 3 with tailwind.config.js | Tailwind 4 is stable and npm latest; shadcn init generates v4 config automatically |

**Installation:**
```bash
# Bootstrap
npx create-next-app@latest upstream --typescript --eslint --app --src-dir=false --import-alias="@/*"
cd upstream

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# shadcn/ui
npx shadcn@latest init

# Fonts and theme
npm install geist next-themes

# shadcn components needed for Phase 1
npx shadcn@latest add button input label form sidebar separator badge avatar

# Analytics (add after Vercel deploy)
npm install @vercel/analytics
```

**Version verification:** All versions above confirmed against npm registry on 2026-03-25.

---

## Architecture Patterns

### Recommended Project Structure
```
upstream/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx          # Login page with demo CTAs
│   ├── (app)/
│   │   ├── layout.tsx            # App shell with SidebarProvider
│   │   └── library/
│   │       └── page.tsx          # Library placeholder (Phase 2 builds it out)
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts          # Supabase auth callback handler
│   ├── globals.css               # Tailwind 4 CSS config + CSS variables
│   └── layout.tsx                # Root layout: fonts, ThemeProvider
├── components/
│   ├── app-sidebar.tsx           # Sidebar nav with all 5 items
│   ├── demo-banner.tsx           # Demo mode banner strip
│   ├── theme-provider.tsx        # next-themes wrapper
│   └── ui/                       # shadcn generated components
├── lib/
│   └── supabase/
│       ├── client.ts             # Browser client (createBrowserClient)
│       ├── server.ts             # Server client (createServerClient)
│       └── middleware.ts         # updateSession helper
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed.sql                  # 18 seed prompts
├── proxy.ts                      # Auth session refresh (Next.js 16 name)
└── .env.local
```

### Pattern 1: Supabase SSR Client Split

**What:** Two separate Supabase client creators — one for Server Components/Actions/Route Handlers, one for Client Components.

**When to use:** Always. Never use the browser client in server code.

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — proxy handles session refresh
          }
        },
      },
    }
  )
}

// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```

### Pattern 2: Auth Session Refresh in proxy.ts

**What:** Next.js 16 renames `middleware.ts` to `proxy.ts`. The Supabase SSR pattern refreshes the session on every request.

**When to use:** Required — without this, sessions expire silently.

```typescript
// proxy.ts (NOT middleware.ts — Next.js 16 renamed this)
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

```typescript
// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Redirect unauthenticated users to login
  if (!user && !request.nextUrl.pathname.startsWith('/login') &&
      !request.nextUrl.pathname.startsWith('/auth')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

### Pattern 3: Auth Hook for RBAC via app_metadata

**What:** A PostgreSQL function registered as a Supabase Auth Hook that injects the user's role into the JWT `app_metadata` before token issuance.

**When to use:** Required for server-side role enforcement. Without this, RLS policies cannot check role.

```sql
-- The hook reads role from profiles table and injects into JWT
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = (event->>'user_id')::uuid;

  claims := event->'claims';

  IF jsonb_typeof(claims->'app_metadata') IS NULL THEN
    claims := jsonb_set(claims, '{app_metadata}', '{}');
  END IF;

  -- Inject role (or 'anon' if no profile — anonymous demo users)
  claims := jsonb_set(
    claims,
    '{app_metadata,role}',
    to_jsonb(COALESCE(user_role, 'anon'))
  );
  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

-- Required grants
GRANT ALL ON TABLE public.profiles TO supabase_auth_admin;
REVOKE ALL ON TABLE public.profiles FROM authenticated, anon, public;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
```

**Enable in Supabase dashboard:** Authentication > Hooks > Custom Access Token Hook > select `public.custom_access_token_hook`.

**Read role in RLS policies:**
```sql
-- Check for admin role
(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
```

### Pattern 4: Anonymous Sign-In for Demo Bypass

**What:** `signInAnonymously()` creates an isolated per-session user without requiring signup.

**When to use:** Demo bypass buttons. Each click creates a new anonymous user.

```typescript
// Server Action for demo bypass
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signInAsDemo(role: 'consultant' | 'admin') {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInAnonymously({
    options: {
      data: {
        demo_role: role,        // stored in user_metadata for display only
        display_name: role === 'admin' ? 'Demo Admin' : 'Demo Consultant',
      }
    }
  })
  if (error) throw error
  redirect('/library')
}
```

Note: `is_anonymous` claim is available in RLS via `auth.jwt() ->> 'is_anonymous'`. Anonymous users get the same read access as authenticated users — RLS read policies should include both `authenticated` and `anon` roles.

### Pattern 5: Dark Mode Default with Custom Accent

**What:** next-themes with `defaultTheme="dark"` plus CSS variable override for brand blue.

```typescript
// components/theme-provider.tsx
"use client"
import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// app/layout.tsx (root)
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

```css
/* app/globals.css — Tailwind 4 + shadcn CSS variables */
@import "tailwindcss";

@theme {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

/* Override shadcn primary with Human Agency blue */
:root {
  --primary: #4287FF;
  --primary-foreground: #ffffff;
}

.dark {
  --primary: #4287FF;
  --primary-foreground: #ffffff;
  --background: oklch(0.13 0 0);
  --foreground: oklch(0.985 0 0);
}
```

### Pattern 6: Sidebar with Icon Collapse (D-06)

```typescript
// components/app-sidebar.tsx
import {
  Sidebar, SidebarContent, SidebarHeader, SidebarMenu,
  SidebarMenuItem, SidebarMenuButton, SidebarTrigger
} from '@/components/ui/sidebar'
import { Library, Briefcase, MessageSquare, GitMerge, BarChart2 } from 'lucide-react'

const navItems = [
  { title: 'Library', icon: Library, href: '/library', enabled: true, adminOnly: false },
  { title: 'Engagements', icon: Briefcase, href: '/engagements', enabled: false, adminOnly: false },
  { title: 'Demand Board', icon: MessageSquare, href: '/demand', enabled: false, adminOnly: false },
  { title: 'Review Queue', icon: GitMerge, href: '/review', enabled: false, adminOnly: true },
  { title: 'Dashboard', icon: BarChart2, href: '/dashboard', enabled: false, adminOnly: true },
]

export function AppSidebar({ userRole }: { userRole: 'consultant' | 'admin' | null }) {
  const visibleItems = navItems.filter(item => !item.adminOnly || userRole === 'admin')

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {/* Logo / app name */}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {visibleItems.map(item => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={item.href === '/library'}
                disabled={!item.enabled}
                tooltip={item.title}
              >
                <a href={item.href}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}
```

### Anti-Patterns to Avoid

- **Reading role from `user_metadata`:** Users can write to `user_metadata` via `supabase.auth.update()` — never use it for authorization. Use `app_metadata` via the Auth Hook only.
- **Using `getSession()` for server-side auth checks:** The Supabase docs explicitly warn "getSession is insecure on the server." Use `getUser()` instead — it validates the JWT server-side.
- **Storing demo role in `app_metadata` via hook:** Anonymous users have no profile row, so the hook will return `null` for their role. Handle this by storing `demo_role` in `user_metadata` for display purposes only, and give anonymous users read access via the `anon` Postgres role in RLS, not via a role claim.
- **Using `tailwind.config.js` with Tailwind 4:** Tailwind 4 uses CSS-native configuration in `globals.css`. The `tailwind.config.js` file is no longer needed for basic setup.
- **Using `middleware.ts` instead of `proxy.ts`:** Next.js 16.0 renamed the middleware file to `proxy.ts`. The function export must also be named `proxy`, not `middleware`. (A codemod is available: `npx @next/codemod@canary middleware-to-proxy .`)

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sidebar collapse state | Custom useState + CSS | shadcn/ui Sidebar with `collapsible="icon"` | Handles keyboard nav, cookie persistence of open state, ARIA roles, mobile behavior |
| Dark mode toggle | Manual class toggle on `<html>` | next-themes ThemeProvider | Handles SSR hydration mismatch (flash of wrong theme) — notoriously hard to get right |
| Auth session refresh | Manual JWT token refresh logic | `@supabase/ssr` updateSession in proxy.ts | Edge cases: token near-expiry, concurrent tabs, cookie path conflicts |
| RBAC role checks | Reading from profiles table on every request | Auth Hook + JWT `app_metadata` | DB round trip per request vs. zero-cost JWT claim read |
| Font loading | Manual @font-face | `geist` npm package + Next.js variable fonts | Automatic font subsetting, zero layout shift, no CORS issues |
| Form validation | Manual state + error messages | `react-hook-form` + `zod` (shadcn form pattern) | Login form already uses this pattern; consistent error handling |

**Key insight:** The auth + session layer has significant hidden complexity (token refresh races, cookie scoping, anonymous user isolation). `@supabase/ssr` handles all of it — deviating from the prescribed pattern introduces hard-to-debug auth bugs.

---

## Common Pitfalls

### Pitfall 1: Auth Hook Not Activated After Creation
**What goes wrong:** You write and deploy the `custom_access_token_hook` SQL function, but JWTs don't contain the `app_metadata.role` claim. RLS policies checking for role silently fail (return no rows instead of error).
**Why it happens:** The hook must be manually enabled in the Supabase Dashboard under Authentication > Hooks. Creating the SQL function alone does nothing.
**How to avoid:** Include a smoke test immediately after hook deployment: sign in, call `supabase.auth.getSession()`, decode the access token, confirm `app_metadata.role` is present.
**Warning signs:** RLS policies that check `(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'` return no rows even for admin users.

### Pitfall 2: Anonymous User Metadata Caching in Next.js
**What goes wrong:** Multiple demo sessions in the same browser appear to share user metadata — a second "Explore as Consultant" click returns the first anonymous user's data.
**Why it happens:** Supabase has documented this: "The Supabase team has received reports of user metadata being cached across unique anonymous users" in Next.js static rendering.
**How to avoid:** Use dynamic rendering for all pages that consume Supabase session data. Add `export const dynamic = 'force-dynamic'` to any page/layout that calls `createServerClient`. Confirm two concurrent browser tabs get distinct `user.id` values.
**Warning signs:** Demo sessions show same `user.id` in different tabs.

### Pitfall 3: Tailwind 4 vs Tailwind 3 Config Mismatch
**What goes wrong:** shadcn component generation fails or styles don't apply because the project has a mix of Tailwind 3 config (`tailwind.config.js` with `content` array) and Tailwind 4 CSS-native config.
**Why it happens:** `create-next-app` may scaffold with Tailwind 3 defaults; `shadcn@latest init` now assumes Tailwind 4.
**How to avoid:** Run `npx shadcn@latest init` AFTER bootstrapping the project and let it handle Tailwind configuration. Don't manually create `tailwind.config.js`. Verify `globals.css` uses `@import "tailwindcss"` (v4 pattern) not `@tailwind base; @tailwind components; @tailwind utilities` (v3 pattern).
**Warning signs:** Shadcn components render unstyled; `npx shadcn@latest add` errors on config detection.

### Pitfall 4: proxy.ts vs middleware.ts
**What goes wrong:** Auth session refresh doesn't run, causing users to be silently logged out or unable to access protected routes.
**Why it happens:** Next.js 16.0 renamed `middleware.ts` to `proxy.ts`. A file named `middleware.ts` in the project root will be ignored by Next.js 16.
**How to avoid:** Use `proxy.ts` (not `middleware.ts`) at the project root. Export the function as `proxy` (not `middleware`).
**Warning signs:** Supabase sessions expire on navigation; `console.log` inside the middleware function never fires.

### Pitfall 5: Anonymous Users and RLS Policy Gaps
**What goes wrong:** Anonymous demo users can't see seed prompts — the read policy only covers `authenticated` role, but `signInAnonymously()` users are assigned the `anon` Postgres role.
**Why it happens:** Supabase anonymous sign-in creates a real session, but users get `anon` Postgres role until they convert to a permanent account. The `authenticated` role check in RLS excludes them.
**How to avoid:** Write prompts read policy as `TO authenticated, anon` or use `USING (true)` for public read access on the prompts table.
**Warning signs:** Demo users see empty library; regular authenticated users see content normally.

### Pitfall 6: Schema includes 'lead' role in PRD §7.2
**What goes wrong:** PRD §7.2 has `CHECK (role IN ('consultant', 'lead', 'admin'))`. Deploying this without modification violates decision D-09.
**Why it happens:** The PRD was written before the 2-role constraint was decided. The schema SQL must be edited before deployment.
**How to avoid:** Change the profiles table CHECK to `CHECK (role IN ('consultant', 'admin'))` before running migrations.

---

## Code Examples

Verified patterns from official sources:

### RLS Policies (Full Schema — adapted for 2-role model)
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_changelog ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE forked_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_upvotes ENABLE ROW LEVEL SECURITY;

-- Prompts: everyone (including anonymous demo users) can read
CREATE POLICY "prompts_read_all"
  ON prompts FOR SELECT
  TO authenticated, anon
  USING (true);

-- Prompts: only admins can write
CREATE POLICY "prompts_write_admin"
  ON prompts FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Profiles: users read own, admins read all
CREATE POLICY "profiles_read_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Profiles: users update own (not role field — that's controlled by admin)
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Forked prompts: owner can CRUD
CREATE POLICY "forked_prompts_own"
  ON forked_prompts FOR ALL
  TO authenticated
  USING (forked_by = auth.uid());

-- Engagements: creator can CRUD
CREATE POLICY "engagements_own"
  ON engagements FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

-- Engagement members: members can read engagement
CREATE POLICY "engagements_member_read"
  ON engagements FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM engagement_members
    WHERE engagement_id = engagements.id AND user_id = auth.uid()
  ));

-- Prompt requests: authenticated users can read all, insert own
CREATE POLICY "requests_read"
  ON prompt_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "requests_insert_own"
  ON prompt_requests FOR INSERT
  TO authenticated
  WITH CHECK (requested_by = auth.uid());
```

### Server Component Role Check
```typescript
// In a Server Component or Server Action
import { createClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Read role from JWT app_metadata (injected by Auth Hook)
  const role = user.app_metadata?.role
  if (role !== 'admin') redirect('/library')

  // Admin-only content...
}
```

### Demo Banner Component
```typescript
// components/demo-banner.tsx
"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function DemoBanner() {
  const [isAnonymous, setIsAnonymous] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAnonymous(user?.is_anonymous ?? false)
    })
  }, [])

  if (!isAnonymous) return null

  return (
    <div className="w-full bg-primary/10 border-b border-primary/20 px-4 py-1.5 text-center text-sm text-primary">
      Demo mode — sign up to save your work
    </div>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` | `proxy.ts` (function exported as `proxy`) | Next.js 16.0 | File must be renamed; old name ignored by framework |
| `tailwind.config.js` with JS object | `globals.css` with `@import "tailwindcss"` + `@theme {}` | Tailwind 4.0 | No more config file; CSS variables are first-class |
| `auth.getSession()` for server auth | `auth.getUser()` (validates JWT server-side) | Supabase SSR docs updated ~2024 | getSession is explicitly documented as insecure on server |
| `next/font/google` for Inter | `geist` npm package | 2024 | Vercel's own font; designed for developer tools |
| Hardcoded demo user | `signInAnonymously()` | Supabase anonymous auth GA | Per-session isolation, no credential sharing |

**Deprecated/outdated:**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` env var name: The Supabase docs now use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Both work but new examples use the new name.
- `@supabase/auth-helpers-nextjs`: Superseded by `@supabase/ssr`. Do not use.

---

## Open Questions

1. **Auth Hook: anonymous user profile row**
   - What we know: `signInAnonymously()` creates an auth.users entry. The hook queries profiles by `user_id`.
   - What's unclear: Should anonymous users get a profile row? The PRD mentions "Demo Consultant" display name but the demo_role is stored in user_metadata.
   - Recommendation: Do NOT create a profiles row for anonymous users. Store display name in `user_metadata` (for UI only). The hook should COALESCE to return 'anon' if no profile found, and RLS read policies should explicitly include `anon` Postgres role.

2. **Vercel deployment: environment variables for Supabase**
   - What we know: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY needed.
   - What's unclear: Whether the Supabase project needs to be created before or during the build wave.
   - Recommendation: Plan Wave 0 as pure infrastructure — create Supabase project, get credentials, set up Vercel project with env vars, deploy a skeleton. All subsequent waves build on that.

3. **Seed data insertion method**
   - What we know: 18 prompts with 200-500 words each is significant SQL.
   - What's unclear: Whether to use Supabase migrations (tracked in git) or a standalone seed script.
   - Recommendation: Use a `supabase/seed.sql` file run separately from migrations. This keeps schema migrations clean and seed data separately re-runnable.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All build/dev tooling | Yes | v25.8.1 | — |
| npm | Package management | Yes | 11.11.0 | — |
| Supabase project | Auth, DB, RLS | Not yet | — | Must create before Wave 1 |
| Vercel account | Deployment | Unknown | — | Local dev works; deploy later |

**Missing dependencies with no fallback:**
- Supabase project: Must be created at supabase.com before any backend work. URL and publishable key are required for `.env.local`.

**Missing dependencies with fallback:**
- Vercel deployment: Development and testing can proceed locally with `npm run dev`. Vercel deployment can be deferred to end of phase.

---

## Project Constraints (from CLAUDE.md)

Directives from the user's global CLAUDE.md that constrain planning:

| Directive | Impact on Phase 1 |
|-----------|-------------------|
| **TDD by default** — Every code task must follow RED-GREEN-REFACTOR | All tasks creating auth utilities, Server Actions, or components must have failing tests written first |
| **Verification before completion** — Never claim done without running verification command | Each task must specify a concrete verification command (e.g., `npm run test`, page screenshot, curl) |
| **All .md files must have YAML front matter** | RESEARCH.md, PLAN.md, and any docs created in this phase need `description` + `date_last_edited` |
| **Plan before coding** — present plan, get approval before materializing | The PLAN.md must be approved before any code is written |
| **No extra features** — don't add features beyond what's asked | Phase 1 scope is strictly the foundation; no early implementation of Phase 2 library features |
| **Use exa/Ref MCP tools, not built-in WebSearch** | Applies to agents during execution — use `ref_search_documentation` or `web_search_exa` for lookup |
| **GSD workflow is active** — do not invoke standalone superpowers skills | Execution agents must not invoke `/superpowers:executing-plans` independently |

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.1 + Testing Library 16.3.2 |
| Config file | `vitest.config.ts` (Wave 0 gap — must create) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Sign up with email/password creates a user session | integration | `npx vitest run tests/auth.test.ts -t "sign up"` | Wave 0 gap |
| AUTH-02 | Session persists after browser refresh (cookie present) | smoke | `npx vitest run tests/auth.test.ts -t "session cookie"` | Wave 0 gap |
| AUTH-03 | Sign out clears session and redirects to /login | unit | `npx vitest run tests/auth.test.ts -t "sign out"` | Wave 0 gap |
| AUTH-04 | Consultant cannot access /dashboard (admin-only) | unit | `npx vitest run tests/rbac.test.ts -t "consultant redirect"` | Wave 0 gap |
| AUTH-05 | Anonymous session has read access to prompts | unit | `npx vitest run tests/demo.test.ts -t "anon read"` | Wave 0 gap |
| UI-01 | Dark class applied to html element on load | unit | `npx vitest run tests/theme.test.ts` | Wave 0 gap |
| UI-03 | Prompt content renders with monospace font class | unit | `npx vitest run tests/components.test.ts -t "monospace"` | Wave 0 gap |
| UI-04 | Sidebar renders 5 nav items; 3 disabled for consultant | unit | `npx vitest run tests/sidebar.test.ts` | Wave 0 gap |
| SEED-01 | Database contains 18 prompts across 6 categories | integration | `npx vitest run tests/seed.test.ts` | Wave 0 gap |
| AUTH-04 | RLS: consultant cannot insert to prompts table | manual | Manual Supabase dashboard check | manual-only |

> AUTH-04 RLS enforcement is manual-only because testing it requires a live Supabase connection with the Auth Hook activated. Unit tests can cover the redirect logic; the actual RLS policy must be smoke-tested against a real database.

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose` (quick run)
- **Per wave merge:** `npx vitest run` (full suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` — Vitest configuration with jsdom environment
- [ ] `tests/auth.test.ts` — AUTH-01, AUTH-02, AUTH-03 coverage
- [ ] `tests/rbac.test.ts` — AUTH-04 redirect logic coverage
- [ ] `tests/demo.test.ts` — AUTH-05 anonymous read access coverage
- [ ] `tests/theme.test.ts` — UI-01 dark mode default coverage
- [ ] `tests/components.test.ts` — UI-03 font class coverage
- [ ] `tests/sidebar.test.ts` — UI-04 sidebar nav items coverage
- [ ] `tests/seed.test.ts` — SEED-01 database row count coverage
- [ ] Framework install: `npm install -D vitest @testing-library/react jsdom @vitejs/plugin-react` (not yet installed)

---

## Sources

### Primary (HIGH confidence)
- Official Supabase Auth Hooks documentation — hook function signature, required grants, dashboard activation
- Official Supabase anonymous auth documentation — `signInAnonymously()`, `is_anonymous` claim, RLS integration, caching caveat
- Official Supabase RLS documentation — `auth.jwt()` access pattern, `app_metadata` vs `user_metadata` security distinction
- Official Next.js 16 documentation — `proxy.ts` naming, migration from `middleware.ts`
- Official shadcn/ui documentation — Sidebar component API, `collapsible="icon"`, installation
- Official shadcn/ui dark mode documentation — next-themes ThemeProvider setup, `defaultTheme="dark"`
- GitHub vercel/geist-font README — GeistSans/GeistMono import pattern, Tailwind 4 `@theme` config
- npm registry — version confirmation for all packages (2026-03-25)

### Secondary (MEDIUM confidence)
- Supabase GitHub examples/auth/nextjs — `proxy.ts` and `lib/supabase/middleware.ts` file structure (verified directory listing; inferred implementation from official docs pattern)

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions confirmed against npm registry
- Architecture: HIGH — patterns from official Supabase + Next.js docs
- Auth Hook: HIGH — SQL from official Supabase Auth Hooks docs
- Tailwind 4 config: HIGH — confirmed from official geist README and npm latest
- Pitfalls: HIGH — Auth Hook activation, anonymous caching from official Supabase docs; proxy.ts rename from official Next.js 16 docs

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (Supabase APIs are stable; Next.js 16 is recent but released)
