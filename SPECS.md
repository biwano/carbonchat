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
- **Document Types Management**: Reusable transformation instruction templates (name, instructions, description)
- **Documents Management**:
  - API endpoint to trigger AI-powered scraping/research (`POST /api/documents/scrape`)
  - Each document references a `document_type`, has a `search_query`, and stores the resulting `content`
- **AI Chatbot**: Loads **all documents** + their associated document type instructions and injects them as system preprompt/context for every user question
- **Real-time Chat Interface**: Modern UI with streaming AI responses
- **Knowledge Dashboard**: CRUD interface for both `document_types` and `documents`, with one-click "scrape now" buttons
- **User Authentication**: Supabase Auth (for protecting admin/knowledge management features)

## Technical Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes + Server Actions
- **Database**: Supabase (PostgreSQL) — **used exclusively for the knowledge base**
- **Auth**: Supabase Auth
- **Real-time**: Supabase Realtime (for chat presence and live updates)
- **AI Integration**: **OpenRouter** (for both knowledge scraping/research and chat responses)
- **Web Scraping / Research**: AI agents via OpenRouter (with search capabilities)
- **Deployment**: Vercel (with Edge Functions where possible)

## Architecture

**Core Principle**: The database (Supabase) is **used only to store the knowledge base**. Chat history is kept in-memory or in a separate lightweight store if needed.

### Key Components
1. **Document Scraper Service**: `POST /api/documents/scrape` endpoint that uses OpenRouter + web search capabilities to research a query and synthesize knowledge according to a `document_type`'s `transformation_instructions`.
2. **Knowledge Base Layer**: Two Supabase tables (`document_types` and `documents`) with proper foreign key relationship.
3. **Chat Engine**: On every user message, the system:
   - Loads all documents
   - Builds a rich system prompt containing all document content + their associated transformation rules
   - Streams the response from OpenRouter
4. **Admin Dashboard**: Interface to manage Document Types and Documents, trigger scraping, and preview generated knowledge.
5. **AI Service Layer**: Centralized OpenRouter client with structured prompting for both research and chat.

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
- Responsive, modern UI (mobile-first)
- Accessibility compliant

## Next Steps
1. Create initial Next.js 15 project with TypeScript, Tailwind, shadcn/ui, and Supabase
2. Set up Supabase schema (`document_types` + `documents` tables with foreign key)
3. Implement Document Scraper API endpoint (`POST /api/documents/scrape`)
4. Build main Chat interface that injects all documents as system context
5. Create admin dashboard for managing Document Types and Documents
6. Add realtime features using Supabase Realtime

---

**Status**: This document is the **living specification** for Carbonchat. All implementation decisions must follow this spec.

**Current Project Definition**:
- A realtime AI-powered **Knowledge Chatbot**
- Database is used **exclusively** to store `document_types` and `documents`
- Knowledge is dynamically built by AI agents performing internet research via OpenRouter
- Every chatbot response is grounded by injecting the entire knowledge base as system context

**Next milestone**: Initialize the Next.js + Supabase project and implement the core data model.
