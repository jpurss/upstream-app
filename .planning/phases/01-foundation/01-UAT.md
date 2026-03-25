---
status: complete
phase: 01-foundation
source: [01-01-SUMMARY.md, 01-02-SUMMARY.md, 01-03-SUMMARY.md]
started: 2026-03-25T12:00:00Z
updated: 2026-03-25T12:15:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running dev server. Run `npm run dev`. Server boots without errors. Visit http://localhost:3000 — you should be redirected to /login. The login page loads with no console errors.
result: pass

### 2. Login Page Layout
expected: Login page shows a two-column layout on desktop (xl+). Left column has "Upstream" wordmark, tagline, and 3 feature highlights with blue icons. Right column has demo buttons at top ("Explore as Consultant" filled blue, "Explore as Admin" outlined blue), "No signup required" subtext, separator with "or", then email/password form with "Sign In" button and signup link.
result: pass

### 3. Demo Bypass — Consultant
expected: Click "Explore as Consultant" on login page. Button shows loading spinner briefly. You're redirected to /library. Demo banner appears at top: "Demo mode — Consultant view. Sign up to save your work." with blue "Sign Up" link. Sidebar shows 3 nav items (Library is active/clickable, other 2 are disabled with "Coming in Phase N" tooltips).
result: pass

### 4. Demo Bypass — Admin
expected: Log out first, then click "Explore as Admin" on login page. You're redirected to /library. Demo banner says "Admin view". Sidebar shows 5 nav items (Library active, 4 others disabled with phase tooltips). Admin-only items (Review Queue, Dashboard) are visible.
result: issue
reported: "only 3 items visible in admin mode — missing Review Queue and Dashboard"
severity: major

### 5. Sidebar Collapse
expected: Click the sidebar collapse toggle. Sidebar collapses to icon-only mode showing just icons and a "U" monogram in the header. Click again to expand back to full width with labels.
result: pass

### 6. Sidebar Footer
expected: At bottom of sidebar: your avatar with initials, display name, and a role badge (e.g. "consultant" or "admin"). A logout button/action is present.
result: pass

### 7. Sign Out
expected: Click logout in sidebar footer. You're redirected back to /login. The authenticated session is cleared (refreshing doesn't auto-login).
result: pass

### 8. Library Placeholder
expected: After logging in (demo or real), the /library page shows "Prompt Library" heading and body text mentioning "18 prompts loaded and ready" with a note about Phase 2.
result: pass

### 9. Seed Data in Database
expected: Open Supabase Dashboard Table Editor. The `prompts` table has 18 rows across 6 categories (Discovery, Solution Design, Build, Enablement, Delivery, Internal Ops) with varied effectiveness ratings and checkout counts.
result: pass

### 10. Signup Page
expected: From login page, click the "Sign up" link. Signup page shows "Upstream" wordmark, email/password form, "Sign Up" button, and "Already have an account? Sign in" link back to /login.
result: pass

### 11. Dark Mode and Accent Color
expected: Entire app uses dark mode (zinc-950 background, zinc-900 cards/sidebar, zinc-800 borders). Accent color #4287FF (Human Agency blue) appears on primary buttons, active nav items, icons, and links. Fonts: Geist Sans for UI text, Geist Mono for code/prompt areas.
result: pass

## Summary

total: 11
passed: 10
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Admin sidebar shows 5 nav items (Library, Engagements, Demand Board, Review Queue, Dashboard)"
  status: failed
  reason: "User reported: only 3 items visible in admin mode — missing Review Queue and Dashboard"
  severity: major
  test: 4
  root_cause: "Demo users have demo_role in user_metadata but no role in app_metadata (Auth Hook only writes from profiles table — anon users have no profile). layout.tsx passes role=null to sidebar, so adminOnly items are filtered out. demoRole is only used for banner, not sidebar."
  artifacts:
    - path: "app/(app)/layout.tsx"
      issue: "role passed to AppSidebar is null for demo users — demoRole not used as fallback"
  missing:
    - "Use demoRole as fallback for role when user is anonymous: const effectiveRole = role ?? (isAnonymous ? demoRole : null)"
    - "Pass effectiveRole to AppSidebar instead of role"
  debug_session: ""
