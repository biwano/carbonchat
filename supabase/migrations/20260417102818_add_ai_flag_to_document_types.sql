-- Migration: 20260417102818_add_ai_flag_to_document_types.sql
-- Created: 2026-04-17
-- Description: Add `ai` boolean flag to document_types to distinguish
--              AI-researched document types from manually-authored ones.

ALTER TABLE document_types
  ADD COLUMN IF NOT EXISTS ai BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN document_types.ai IS
  'If true, documents of this type are AI-researched via /api/documents/scrape. If false, documents are manually authored by the user (content editable at creation, search_query unused).';
