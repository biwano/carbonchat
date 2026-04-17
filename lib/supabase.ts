import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      document_types: {
        Row: {
          id: string
          name: string
          transformation_instructions: string
          additional_sources: string | null
          source_relevance_factors: string
          description?: string
          ai: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          transformation_instructions: string
          additional_sources?: string | null
          source_relevance_factors?: string
          description?: string
          ai?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          transformation_instructions?: string
          additional_sources?: string | null
          source_relevance_factors?: string
          description?: string
          ai?: boolean
          created_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          name: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          content: string
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          name: string
          document_type_id: string
          subject_id: string | null
          content: string
          sources: string | null
          created_at: string
          updated_at: string
          metadata?: Record<string, unknown>
        }
        Insert: {
          id?: string
          name: string
          document_type_id: string
          subject_id?: string | null
          content?: string
          sources?: string | null
          created_at?: string
          updated_at?: string
          metadata?: Record<string, unknown>
        }
      }
    }
  }
}
