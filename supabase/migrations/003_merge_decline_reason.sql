-- =============================================================================
-- Migration 003: Add merge_decline_reason column to forked_prompts
-- =============================================================================
-- This column stores the admin's reason when declining a merge suggestion.
-- Shown to the consultant on their fork sidebar so they understand why
-- and can revise and resubmit.
-- =============================================================================

ALTER TABLE forked_prompts ADD COLUMN merge_decline_reason TEXT;
