-- Migration: 20260415130000_public_crud_rls.sql
-- Created: 2026-04-15
-- Description: Enable full CRUD access for unauthenticated (anon) users on all tables

-- Drop existing restricted policies
DROP POLICY IF EXISTS "Public read access to document_types" ON document_types;
DROP POLICY IF EXISTS "Public read access to documents" ON documents;
DROP POLICY IF EXISTS "Authenticated users can manage document_types" ON document_types;
DROP POLICY IF EXISTS "Authenticated users can manage documents" ON documents;

-- Create new unrestricted policies for anon and authenticated roles
CREATE POLICY "Enable full access for all users to document_types" ON document_types
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable full access for all users to documents" ON documents
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
