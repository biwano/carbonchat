# Specifications: Carbonchat

## Overview
Carbonchat is an **AI-powered knowledge chatbot** with realtime capabilities. It maintains a dynamic **knowledge base** built by scraping and synthesizing information from the internet using AI.

**Core Concept**: 
Users maintain two related Supabase tables:
- `document_types`: Reusable templates containing transformation instructions (how the AI should process researched information).
- `documents`: Individual knowledge entries that reference a document type, define a `search_query`, and store the final synthesized `content`.

An API endpoint triggers an AI agent (via OpenRouter) to perform web research and generate knowledge according to the selected document type's rules. 

When a user interacts with the chatbot, **all documents are retrieved** and injected — along with their corresponding document type instructions — as a rich system prompt to ground every response in the curated knowledge base.

## Core Features
- **AI Chatbot**: Primary interface; loads **all documents** + their associated document type instructions as rich system context/preprompt for every response.
- **Administration Panel** (renamed from "Settings"): Section for knowledge management at `/admin`:
  - **Document Types Management**: Full CRUD support (create, read, **update**, **delete**) for transformation instruction templates. All operations are performed **directly from the frontend** using the Supabase client.
  - **Documents Management**: CRUD + one-click "Research Now" buttons that trigger AI-powered scraping.
- **Document Scraper**: `POST /api/documents/scrape` endpoint using OpenRouter to research `search_query` and synthesize per `document_type` rules.
- **Real-time Chat Interface**: Modern streaming responses grounded in the full knowledge base.
- **Unrestricted Public Access**: Row Level Security (RLS) is configured to allow **unauthenticated (anon) CRUD access** to both `document_types` and `documents` tables (useful for development/testing).

## Technical Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes + Server Actions
- **Database**: Supabase (PostgreSQL) — **used exclusively for the knowledge base**
- **Auth**: Supabase Auth
- **Real-time**: Supabase Realtime (for chat presence and live updates)
- **AI Integration**: **OpenRouter** via the official `openai` SDK (configured with `baseURL: "https://openrouter.ai/api/v1"` and required headers)
- **Web Scraping / Research**: AI agents via OpenRouter (with search capabilities)
- **Deployment**: Vercel (with Edge Functions where possible)

## Architecture

**Core Principle**: The database (Supabase) is **used only to store the knowledge base**. Chat history is kept in-memory or in a separate lightweight store if needed.

### Key Components
1. **Document Scraper Service**: `POST /api/documents/scrape` endpoint that uses OpenRouter (with search capabilities) to research a query and synthesize knowledge according to a `document_type`'s `transformation_instructions`.
2. **Knowledge Base Layer**: Two Supabase tables (`document_types` and `documents`) with proper foreign key relationship. **All schema changes must use timestamp-prefixed migration files** in `supabase/migrations/` (e.g. `20260415114130_initial_schema.sql`).
3. **Chat Engine**: On every user message, the system:
   - Loads all documents (with joined type instructions)
   - Builds a rich system prompt containing all document content + transformation rules
   - Returns streamed or JSON response from OpenRouter
4. **UI Structure**: 
   - Full-page **Chat** interface at `/` (no tab selector).
   - Dedicated full-page **Administration** route at `/admin` (replaces previous Settings/Administration tab selector and separate panels; "Back to Chat" button removed from admin header for cleaner full-page experience).
   - **Theme**: Default shadcn/ui dark theme only. Remove all custom/hardcoded colors (e.g. `violet-*`, `zinc-*`, `emerald-*`, specific bg-*/text-*/border-* Tailwind color classes). Use only semantic theme classes (`bg-background`, `text-foreground`, `bg-card`, `border-border`, `bg-primary`, `text-primary-foreground`, `bg-muted`, etc.). Apply `dark` class by default to `<html>` in layout. Simplify `globals.css` to rely on Tailwind v4 + shadcn defaults without extensive custom oklch color palette.
5. **AI Service Layer**: Centralized OpenAI client configured for OpenRouter.

### Supabase Data Model

**Table 1: `document_types`** (stores reusable transformation rules)
```sql
- id (uuid, primary key)
- name (text)                    -- e.g. "Technical Documentation", "Market Research", "Wikipedia-style Summary"
- transformation_instructions (text)  -- The prompt that tells the AI how to transform raw data
- description (text)
- created_at (timestamptz)
```

**Table 2: `documents`** (references document type)
```sql
- id (uuid, primary key)
- name (text)                    -- Short identifier for this document/knowledge piece
- document_type_id (uuid, fk → document_types)
- search_query (text)            -- What the AI should research on the internet
- content (text)                 -- The synthesized knowledge
- created_at (timestamptz)
- updated_at (timestamptz)
- metadata (jsonb)
```

**Relationship**: One `document_type` can be used by many `documents`.
**Security**: RLS policies — primarily admin/owner access for knowledge management. Public read access for the chatbot if desired.

## Non-Functional Requirements
- Fast knowledge retrieval and prompt construction
- High-quality AI-generated knowledge (good research + synthesis)
- Low latency chat responses with streaming
- Privacy-focused (especially around web scraping and user queries)
- Responsive, modern UI using **default shadcn/ui dark theme only** (mobile-first, semantic color classes, no custom color palette)
- Accessibility compliant

---

**Current Status**: Core implementation complete. Next priority: Implementing full CRUD for Document Types and Documents directly from the frontend, and opening up RLS for unrestricted development/testing access.

## Implementation Plan: Frontend CRUD & Public RLS
1. **Migration**: Create `supabase/migrations/20260415130000_public_crud_rls.sql` to enable `INSERT`, `UPDATE`, `DELETE` for `anon` on `document_types` and `documents`.
2. **Frontend Implementation**:
   - **DocumentTypesPanel.tsx**:
     - Implement **Create** functionality using the Supabase client directly.
     - Add **Update** (Edit) logic using the Supabase client directly.
     - Add **Delete** logic using the Supabase client directly.
   - **DocumentsPanel.tsx**:
     - Add **Delete** logic using the Supabase client directly.
3. **API Cleanup**: Remove existing API routes for `document-types` and `documents` (except `/api/documents/scrape` and `/api/chat` which require server-side logic for AI interactions) to ensure all CRUD is frontend-driven.

