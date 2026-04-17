'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  FileText,
  Settings,
  MessageSquare,
  Workflow,
  Lightbulb,
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
            in your knowledge base. It references one Document Type and defines
            a <span className="text-foreground font-medium">search query</span>{' '}
            — what the AI should research on the internet.
          </p>
          <p>Lifecycle:</p>
          <ol className="list-decimal pl-6 space-y-1">
            <li>You create a document with a name, type, and search query.</li>
            <li>
              The AI researches the query and synthesizes the result using the
              type&apos;s transformation instructions.
            </li>
            <li>
              The synthesized{' '}
              <span className="text-foreground font-medium">content</span> is
              stored on the document and shown read-only in the UI.
            </li>
            <li>
              You can <span className="text-foreground font-medium">Refresh Content</span>{' '}
              at any time to re-run the research and update the document.
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
              &quot;Wikipedia-style Summary&quot;).
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
              and create a new document with a focused search query.
            </li>
            <li>Wait for the AI to finish researching and generating content.</li>
            <li>
              Review the result, then{' '}
              <span className="text-foreground font-medium">Refresh Content</span>{' '}
              periodically to keep the knowledge up to date.
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
              documents whose subject evolves (news, product docs, market data).
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
