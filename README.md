# Carbonchat

An AI-powered knowledge chatbot that builds its intelligence by researching the internet using AI agents.

## Architecture (as defined in SPECS.md)

- **Database**: Supabase — used **exclusively** for `document_types` and `documents` tables
- **AI**: OpenRouter via the official `openai` SDK
- **Frontend**: Next.js 15 + TypeScript + Tailwind + shadcn/ui

## Setup

1. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

2. Add your credentials to `.env.local`:
   - Supabase URL & Anon Key
   - OpenRouter API Key (`sk-or-...`)

3. Apply the database schema:
   - Run the migration in your Supabase dashboard (SQL Editor): copy contents of `supabase/migrations/20260415114130_initial_schema.sql`
   - Or use Supabase CLI: `supabase db push`

4. Start development server:
   ```bash
   npm run dev
   ```

## Core Features

- Manage Document Types (transformation instruction templates)
- Trigger AI-powered web research to create Documents
- Chatbot that automatically uses **all documents** as system context/preprompt
- Real-time streaming responses (foundational support implemented)

See `SPECS.md` for the complete living specification.
