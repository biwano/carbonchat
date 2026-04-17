-- Migration: 20260417153000_add_sources_to_documents.sql
-- Description: Add sources column to documents table for storing research URLs

ALTER TABLE documents ADD COLUMN IF NOT EXISTS sources TEXT DEFAULT '' NOT NULL;

COMMENT ON COLUMN documents.sources IS 'Resources and URLs used for research (AI-generated for AI types, user-authored for non-AI types)';
