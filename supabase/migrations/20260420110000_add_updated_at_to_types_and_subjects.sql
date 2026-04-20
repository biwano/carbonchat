-- Migration: 20260420110000_add_updated_at_to_types_and_subjects.sql
-- Description: Adds updated_at column to document_types and subjects tables and sets up triggers.

-- Add updated_at to document_types
ALTER TABLE document_types ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

-- Add updated_at to subjects
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

-- Set up trigger for document_types
-- Reuse the existing update_updated_at_column function if it exists
DROP TRIGGER IF EXISTS update_document_types_updated_at ON document_types;
CREATE TRIGGER update_document_types_updated_at
  BEFORE INSERT OR UPDATE ON document_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Set up trigger for subjects
DROP TRIGGER IF EXISTS update_subjects_updated_at ON subjects;
CREATE TRIGGER update_subjects_updated_at
  BEFORE INSERT OR UPDATE ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
