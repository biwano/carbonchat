-- Migration: 20260420100000_add_date_limits_to_document_types.sql
-- Created: 2026-04-20
-- Description: Add configurable date limits (start and end relative to now) 
--              to document_types for AI research.

ALTER TABLE document_types
  ADD COLUMN IF NOT EXISTS date_limit_start_days_ago INTEGER,
  ADD COLUMN IF NOT EXISTS date_limit_end_days_ago INTEGER DEFAULT 0;

COMMENT ON COLUMN document_types.date_limit_start_days_ago IS
  'How many days back to start the research (e.g. 365 for 1 year ago). If NULL, no strict start limit is applied.';
COMMENT ON COLUMN document_types.date_limit_end_days_ago IS
  'How many days back to end the research (e.g. 0 for now, 180 for 6 months ago). Defaults to 0.';
