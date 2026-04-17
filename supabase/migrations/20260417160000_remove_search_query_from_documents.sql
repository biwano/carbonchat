-- Remove the deprecated search_query column from the documents table
ALTER TABLE documents DROP COLUMN IF EXISTS search_query;
