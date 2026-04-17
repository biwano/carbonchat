import { Database } from './supabase';

export type DocumentType = Database['public']['Tables']['document_types']['Row'];
export type Subject = Database['public']['Tables']['subjects']['Row'];
export type Document = Database['public']['Tables']['documents']['Row'];

export interface DocumentMetadata {
  model?: string;
  tokens?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  generated_at?: string;
  is_refresh?: boolean;
}

export type DocumentWithRelations = Omit<Document, 'metadata'> & {
  metadata: DocumentMetadata | null;
  document_types: Pick<DocumentType, 'name' | 'ai'> | null;
  subjects: Pick<Subject, 'name'> | null;
};
