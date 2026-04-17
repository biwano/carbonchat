-- Migration: 20260417171000_fix_created_at_not_null.sql
-- Description: Ensures created_at columns are always populated, even if a null value is explicitly passed during insertion.

-- Ensure subjects.created_at is NOT NULL to be consistent with other tables
ALTER TABLE subjects ALTER COLUMN created_at SET NOT NULL;

-- Create a function to handle created_at population
-- This sets created_at to NOW() if it's null on INSERT, and prevents changing it on UPDATE
CREATE OR REPLACE FUNCTION ensure_created_at_column()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.created_at IS NULL THEN
      NEW.created_at = NOW();
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Prevent modification of created_at once set
    NEW.created_at = OLD.created_at;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to documents table
DROP TRIGGER IF EXISTS ensure_documents_created_at ON documents;
CREATE TRIGGER ensure_documents_created_at
  BEFORE INSERT OR UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION ensure_created_at_column();

-- Add trigger to document_types table
DROP TRIGGER IF EXISTS ensure_document_types_created_at ON document_types;
CREATE TRIGGER ensure_document_types_created_at
  BEFORE INSERT OR UPDATE ON document_types
  FOR EACH ROW
  EXECUTE FUNCTION ensure_created_at_column();

-- Add trigger to subjects table
DROP TRIGGER IF EXISTS ensure_subjects_created_at ON subjects;
CREATE TRIGGER ensure_subjects_created_at
  BEFORE INSERT OR UPDATE ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION ensure_created_at_column();
