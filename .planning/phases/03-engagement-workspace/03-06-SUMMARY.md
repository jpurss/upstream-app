---
description: Summary of Plan 06 — fixes FK violation blocking engagement creation by provisioning profiles rows via admin client on all auth flows, and simplifies the engagement dialog to 2 fields with auto-naming.
date_last_edited: 2026-03-25
phase: 03-engagement-workspace
plan: "06"
subsystem: auth
tags: [supabase, rls, profiles, admin-client, service-role, engagement, dialog]

requires:
  - phase: 03-engagement-workspace
    provides: Engagement CRUD server actions and NewEngagementDialog component
  - phase: 01-foundation
    provides: Supabase auth setup with signInAnonymously and signInWithPassword

provides:
  - Profile row creation on every auth path (demo login, real login, signup)
  - lib/supabase/admin.ts createAdminClient() for service-role bypass
  - Safety-net INSERT RLS policy on profiles table
  - Simplified NewEngagementDialog with 2 fields (Client Name + Industry)
  - Auto-generated engagement name from client_name + month/year suffix

affects:
  - 03-engagement-workspace (unblocks all 10 FK-blocked UAT tests)
  - Any future phase that creates data referencing profiles(id)

tech-stack:
  added: []
  patterns:
    - Admin client (service role) used for profile provisioning to bypass RLS — regular client used for all other engagement operations
    - Upsert with ignoreDuplicates:true for idempotent first-login profile creation
    - Auto-naming from user-entered fields + date suffix eliminates redundant input

key-files:
  created:
    - lib/supabase/admin.ts
    - supabase/migrations/002_profiles_insert_policy.sql
  modified:
    - app/(auth)/login/actions.ts
    - app/(auth)/signup/actions.ts
    - app/(app)/engagements/actions.ts
    - components/engagements/new-engagement-dialog.tsx

key-decisions:
  - "Admin client (service role) used for profile provisioning — regular client cannot INSERT to profiles due to RLS + auth hook REVOKE"
  - "signIn uses ignoreDuplicates:true so admin-assigned roles are not overwritten on subsequent logins"
  - "Profile creation is best-effort — upsert errors are logged but do not block login redirect"
  - "Engagement name auto-generated as ClientName — Mon YYYY, removing superfluous manual naming field"

patterns-established:
  - "Best-effort upsert: create resource using admin client, log error on failure, never block the primary flow"
  - "Auto-naming pattern: derive display name from required fields + timestamp, no dedicated name field"

requirements-completed: [ENG-01]

duration: 3min
completed: 2026-03-25
---

# Phase 03 Plan 06: Profile Provisioning and Dialog Simplification Summary

**Admin client upserts profiles on every auth path (demo, login, signup) to fix FK violation, and engagement dialog reduced to 2 fields with auto-generated name**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-25T20:07:41Z
- **Completed:** 2026-03-25T20:10:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Fixed the root cause of 10 blocked UAT tests: `engagements.created_by` FK violation due to missing profiles row
- Provisioned profiles on all three auth paths using service-role admin client to bypass RLS
- Added `supabase/migrations/002_profiles_insert_policy.sql` as defense-in-depth INSERT policy
- Removed the Engagement Name field from the creation dialog — redundant since client-to-engagement is 1:1
- Engagement name now auto-generated as `ClientName — Mon YYYY` from the required client_name field

## Task Commits

Each task was committed atomically:

1. **Task 1: Add profile upsert to auth flows and create INSERT RLS policy** - `2488622` (feat)
2. **Task 2: Simplify engagement dialog to 2 fields with auto-naming** - `aeec908` (feat)

## Files Created/Modified

- `lib/supabase/admin.ts` - Created: service-role Supabase client that bypasses RLS
- `supabase/migrations/002_profiles_insert_policy.sql` - Created: safety-net INSERT policy for profiles
- `app/(auth)/login/actions.ts` - Modified: profile upsert in both signIn() and signInAsDemo()
- `app/(auth)/signup/actions.ts` - Modified: profile upsert after immediate session confirmed
- `app/(app)/engagements/actions.ts` - Modified: removed name field, added auto-name generation
- `components/engagements/new-engagement-dialog.tsx` - Modified: removed Engagement Name field, simplified validation

## Decisions Made

- Admin client used for profile provisioning because profiles RLS has no INSERT policy for authenticated users, and the auth hook REVOKE further restricts access. Service role is the correct tool here.
- `ignoreDuplicates: true` on signIn() upsert prevents overwriting admin-assigned roles on repeat logins.
- Profile errors logged but never block redirect — auth flow succeeds regardless.
- Engagement name derived from client_name + date rather than requiring a separate field, matching the 1:1 client-to-engagement mental model.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. The migration file `supabase/migrations/002_profiles_insert_policy.sql` must be applied to the Supabase project (run via the Supabase CLI or dashboard) to activate the safety-net INSERT policy.

## Next Phase Readiness

- Engagement creation is now unblocked end-to-end — profiles row exists before FK constraint is evaluated
- All 10 previously blocked UAT tests can now proceed
- The dialog simplification reduces cognitive load during the demo flow

---
*Phase: 03-engagement-workspace*
*Completed: 2026-03-25*
