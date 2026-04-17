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
  Tags,
} from 'lucide-react';

export default function HelpPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Help</h2>
        <p className="text-muted-foreground">
          Understand how Subjects, Document Types, and Documents power the chatbot.
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
            The knowledge base is built on three core concepts:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <span className="text-foreground font-medium">Subjects</span> — The **what**. The core topic or source material for research.
            </li>
            <li>
              <span className="text-foreground font-medium">Document Types</span> — The **how**. Reusable rules for how the AI should process and format information.
            </li>
            <li>
              <span className="text-foreground font-medium">Documents</span> — The **result**. The finished knowledge entry, either AI-generated or manually authored.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tags className="w-5 h-5 text-primary" />
            Subjects
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
          <p>
            A Subject defines the{' '}
            <span className="text-foreground font-medium">core topic</span> or{' '}
            <span className="text-foreground font-medium">source information</span>{' '}
            that the AI should research.
          </p>
          <p>
            Each subject has a name and a detailed content description. This content is passed to the AI agent as the primary source of truth or research objective.
          </p>
          <p>
            One subject can be reused by multiple documents. For example, you might have a subject &quot;Next.js 15&quot; and create several documents using different types (Summary, FAQ, Technical Guide) for that same subject.
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
            the subject information into a finished document.
          </p>
          <p>
            Each type defines{' '}
            <span className="text-foreground font-medium">
              transformation instructions
            </span>{' '}
            — a prompt describing the desired structure, tone, format, and constraints.
          </p>
          <p>
            AI types can also include{' '}
            <span className="text-foreground font-medium">additional sources</span>{' '}
            (blogs, social media accounts, etc.). The AI agent will research these specific sources to supplement the information provided in the Subject.
          </p>
          <p>
            A type also has an{' '}
            <span className="text-foreground font-medium">AI toggle</span>:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <span className="inline-flex items-center gap-1 text-foreground font-medium">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                AI-researched
              </span>{' '}
              (default) — documents of this type use a **Subject** to generate content via AI research.
            </li>
            <li>
              <span className="inline-flex items-center gap-1 text-foreground font-medium">
                <User className="w-3.5 h-3.5" />
                Manual
              </span>{' '}
              — documents of this type are authored by you directly. No subject is required.
            </li>
          </ul>
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
            <span className="text-foreground font-medium">knowledge entry</span>.
          </p>
          <p className="text-foreground font-medium flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-primary" />
            AI-researched documents
          </p>
          <ol className="list-decimal pl-6 space-y-1">
            <li>You create a document by selecting a **Type** and a **Subject**.</li>
            <li>The AI researches the subject and synthesizes content per the type&apos;s rules.</li>
            <li>The result is stored as content. You can edit it manually or Refresh it anytime to regenerate from the subject.</li>
          </ol>
          <p className="text-foreground font-medium flex items-center gap-1 pt-1">
            <User className="w-4 h-4" />
            Manual documents
          </p>
          <ol className="list-decimal pl-6 space-y-1">
            <li>You create a document by writing the content directly.</li>
            <li>No subject is used, and no AI research is performed.</li>
          </ol>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5 text-primary" />
            Chat Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
          <p>
            On every user message, the chat engine loads **all** documents. Their contents are injected into the AI system prompt to ground every response in your curated knowledge.
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
              <span className="text-foreground font-medium">Subjects</span>: Define what you want to talk about (e.g. &quot;Next.js 15 Features&quot;).
            </li>
            <li>
              <span className="text-foreground font-medium">Document Types</span>: Define how you want it presented (e.g. &quot;Detailed FAQ&quot;).
            </li>
            <li>
              <span className="text-foreground font-medium">Documents</span>: Create a document linking the Subject and the Type.
            </li>
            <li>
              <span className="text-foreground font-medium">Chat</span>: Ask the bot about your new knowledge!
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
