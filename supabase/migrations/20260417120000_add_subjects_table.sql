-- Create subjects table
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add subject_id to documents
ALTER TABLE documents ADD COLUMN subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Allow public access (anon) for development
CREATE POLICY "Allow public read for subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Allow public insert for subjects" ON subjects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for subjects" ON subjects FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for subjects" ON subjects FOR DELETE USING (true);
