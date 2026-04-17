-- Migration: 20260417170000_fix_documents_updated_at_trigger.sql
-- Description: Fixes the not-null constraint error on updated_at by ensuring the trigger runs on INSERT as well.

-- Ensure the function handles any input by always setting the current timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the old trigger that only ran on UPDATE
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;

-- Create the new trigger that runs on both INSERT and UPDATE
-- This ensures that even if a null value is passed for updated_at, it will be corrected to NOW()
CREATE TRIGGER update_documents_updated_at
  BEFORE INSERT OR UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
