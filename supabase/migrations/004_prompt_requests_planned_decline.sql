-- =============================================================================
-- Migration 004: Add decline_reason column to prompt_requests + admin UPDATE policy
-- =============================================================================
-- Parallels merge_decline_reason on forked_prompts from Migration 003.
-- Admin UPDATE policy enables Mark Planned, Resolve, and Decline actions
-- which all require UPDATE on prompt_requests.
-- =============================================================================

ALTER TABLE prompt_requests ADD COLUMN decline_reason TEXT;

-- Admin UPDATE policy for prompt_requests
-- (Mark Planned, Resolve, Decline all require UPDATE)
CREATE POLICY "requests_update_admin" ON prompt_requests
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
