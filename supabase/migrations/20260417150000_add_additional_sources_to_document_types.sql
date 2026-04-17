-- Migration: 20260417150000_add_additional_sources_to_document_types.sql
-- Created: 2026-04-17
-- Description: Add `additional_sources` text column to document_types.

ALTER TABLE document_types
  ADD COLUMN IF NOT EXISTS additional_sources TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN document_types.additional_sources IS
  'Optional sources (blogs, social media accounts, etc.) for the AI agent to research.';
