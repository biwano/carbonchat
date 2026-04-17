'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  FileText,
  Settings,
  MessageSquare,
  Workflow,
  Lightbulb,
  Sparkles,
  User,
} from 'lucide-react';

export default function HelpPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Help</h2>
        <p className="text-muted-foreground">
          Understand how Documents and Document Types power the chatbot.
        </p>
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5 text-primary" />
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
          <p>
            Carbonchat is an AI chatbot grounded in a curated{' '}
            <span className="text-foreground font-medium">knowledge base</span>{' '}
            that you build and maintain from this Administration panel.
          </p>
          <p>
            The knowledge base is made of two related concepts:{' '}
            <span className="text-foreground font-medium">Document Types</span>{' '}
            (reusable rules) and{' '}
            <span className="text-foreground font-medium">Documents</span>{' '}
            (individual knowledge entries researched by the AI).
          </p>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="w-5 h-5 text-primary" />
            Document Types
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
          <p>
            A Document Type is a{' '}
            <span className="text-foreground font-medium">reusable template</span>{' '}
            that tells the AI{' '}
            <span className="text-foreground font-medium">how</span> to transform
            raw research into a finished document.
          </p>
          <p>
            Each type defines{' '}
            <span className="text-foreground font-medium">
              transformation instructions
            </span>{' '}
            — a prompt describing the desired structure, tone, format, level of
            detail, and any constraints.
          </p>
          <p>
            A type also has an{' '}
            <span className="text-foreground font-medium">AI toggle</span>{' '}
            that controls how its documents are produced:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <span className="inline-flex items-center gap-1 text-foreground font-medium">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                AI-researched
              </span>{' '}
              (default) — documents of this type ask the AI to research a
              search query and synthesize content according to the
              transformation instructions.
            </li>
            <li>
              <span className="inline-flex items-center gap-1 text-foreground font-medium">
                <User className="w-3.5 h-3.5" />
                Manual
              </span>{' '}
              — documents of this type are authored by you directly. No AI
              research is performed, and the search query is not used.
            </li>
          </ul>
          <p>Examples:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <span className="text-foreground font-medium">
                Wikipedia-style Summary
              </span>{' '}
              — neutral tone, sectioned overview, key facts first.
            </li>
            <li>
              <span className="text-foreground font-medium">
                Technical Documentation
              </span>{' '}
              — code samples, API references, setup steps.
            </li>
            <li>
              <span className="text-foreground font-medium">Market Research</span>{' '}
              — trends, players, opportunities, sources.
            </li>
          </ul>
          <p>
            One type can be reused by many documents, so you only need to design
            a good template once.
          </p>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-primary" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
          <p>
            A Document is a single{' '}
            <span className="text-foreground font-medium">knowledge entry</span>{' '}
            in your knowledge base. It references one Document Type and the
            document&apos;s lifecycle depends on whether that type is
            AI-researched or manual.
          </p>
          <p className="text-foreground font-medium flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-primary" />
            AI-researched documents
          </p>
          <ol className="list-decimal pl-6 space-y-1">
            <li>You create a document with a name, type, and search query.</li>
            <li>
              The AI researches the query and synthesizes the result using the
              type&apos;s transformation instructions.
            </li>
            <li>
              The synthesized{' '}
              <span className="text-foreground font-medium">content</span> is
              stored on the document. You can{' '}
              <span className="text-foreground font-medium">edit it manually</span>{' '}
              from the document&apos;s edit dialog for quick fixes, tweaks, or
              additions.
            </li>
            <li>
              You can <span className="text-foreground font-medium">Refresh Content</span>{' '}
              at any time to re-run the research and regenerate the document
              (this overwrites any manual edits).
            </li>
          </ol>
          <p className="text-foreground font-medium flex items-center gap-1 pt-1">
            <User className="w-4 h-4" />
            Manual documents
          </p>
          <ol className="list-decimal pl-6 space-y-1">
            <li>
              You create a document with a name, type, and{' '}
              <span className="text-foreground font-medium">content</span>{' '}
              (written directly). The search query field is not shown.
            </li>
            <li>
              You can edit the content at any time. No research or refresh is
              ever performed for these documents.
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5 text-primary" />
            How they impact the Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
          <p>
            On every user message, the chat engine:
          </p>
          <ol className="list-decimal pl-6 space-y-1">
            <li>Loads <span className="text-foreground font-medium">all</span> documents from the knowledge base.</li>
            <li>
              Joins each document with its Document Type&apos;s transformation
              instructions.
            </li>
            <li>
              Builds a rich{' '}
              <span className="text-foreground font-medium">system prompt</span>{' '}
              and sends it to the AI together with the user&apos;s message.
            </li>
          </ol>
          <p>
            This means the breadth, quality, and freshness of your documents
            directly shape every answer the chatbot gives. The chatbot can only
            be as accurate and useful as the knowledge base behind it.
          </p>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Workflow className="w-5 h-5 text-primary" />
            Recommended Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed">
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Open the{' '}
              <span className="text-foreground font-medium">Document Types</span>{' '}
              tab and create a type that matches your need (e.g.
              &quot;Wikipedia-style Summary&quot;). Decide whether it should be{' '}
              <span className="text-foreground font-medium">AI-researched</span>{' '}
              or <span className="text-foreground font-medium">Manual</span>{' '}
              using the toggle on the form.
            </li>
            <li>
              Write clear, specific{' '}
              <span className="text-foreground font-medium">
                transformation instructions
              </span>{' '}
              describing the structure and tone you expect.
            </li>
            <li>
              Switch to the{' '}
              <span className="text-foreground font-medium">Documents</span> tab
              and create a new document. For AI types, provide a focused
              search query. For manual types, write the content directly.
            </li>
            <li>
              For AI documents, wait for the research to finish. For manual
              documents, your content is saved immediately.
            </li>
            <li>
              Review the result and, if needed,{' '}
              <span className="text-foreground font-medium">edit the content manually</span>{' '}
              for small corrections — no need to re-run research for typos or
              minor tweaks.
            </li>
            <li>
              For AI documents, use{' '}
              <span className="text-foreground font-medium">Refresh Content</span>{' '}
              periodically to keep the knowledge up to date (this will overwrite
              any manual edits). Manual documents are not refreshed.
            </li>
            <li>Open the chat — your knowledge is now grounding every reply.</li>
          </ol>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="w-5 h-5 text-primary" />
            Tips &amp; Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Keep transformation instructions{' '}
              <span className="text-foreground font-medium">explicit</span>:
              describe sections, formatting, and what to omit.
            </li>
            <li>
              Use <span className="text-foreground font-medium">focused</span>{' '}
              search queries — one topic per document beats a single sprawling
              entry.
            </li>
            <li>
              Keep the knowledge base{' '}
              <span className="text-foreground font-medium">lean</span>: every
              document is sent on every chat request, so quality beats quantity.
            </li>
            <li>
              <span className="text-foreground font-medium">Refresh</span>{' '}
              AI documents whose subject evolves (news, product docs, market
              data).
            </li>
            <li>
              Prefer{' '}
              <span className="text-foreground font-medium">manual edits</span>{' '}
              for small fixes (typos, outdated details, pruning). Remember that
              Refresh Content overwrites manual changes on AI documents, so
              re-apply them if you regenerate.
            </li>
            <li>
              Use{' '}
              <span className="text-foreground font-medium">Manual</span>{' '}
              document types for content the AI cannot research (internal
              policies, private notes, curated specifics) and keep AI types
              for public, searchable subjects.
            </li>
            <li>
              Reuse a single Document Type across many documents to keep your
              knowledge base visually and stylistically consistent.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
