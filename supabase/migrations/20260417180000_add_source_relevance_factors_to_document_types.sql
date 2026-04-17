-- Migration: 20260417180000_add_source_relevance_factors_to_document_types.sql
-- Created: 2026-04-17
-- Description: Add `source_relevance_factors` text column to document_types.

ALTER TABLE document_types
  ADD COLUMN IF NOT EXISTS source_relevance_factors TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN document_types.source_relevance_factors IS
  'Instructions for the AI to rate the pertinence of a source (e.g. "Prioritize official documentation", "Ignore forums").';
