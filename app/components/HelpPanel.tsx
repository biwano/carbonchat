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
  BarChart3,
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
            <span className="text-foreground font-medium">research objective</span>{' '}
            that the AI agent should explore.
          </p>
          <p>
            Each subject has a name and a detailed content description. This content is passed to the AI agent as the primary source of truth or research objective.
          </p>
          <p>
            Think of the Subject content as the <span className="text-foreground font-medium">primary prompt</span> for the research phase. The more detailed and specific your description, the better the AI can focus its search.
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
            AI types also include{' '}
            <span className="text-foreground font-medium">additional sources</span>{' '}
            (blogs, social media accounts, etc.),{' '}
            <span className="text-foreground font-medium">source relevance factors</span>, and{' '}
            <span className="text-foreground font-medium">date limits</span>.
          </p>
          <p>
            The AI agent will research the additional sources to supplement its general research, use the relevance factors to prioritize and rate the quality of each source it finds, and strictly adhere to any configured date limits (e.g. &quot;at most 1 year old&quot;).
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
            <span className="text-foreground font-medium">knowledge entry</span>. It holds the final content and any sources used to create it.
          </p>
          <p className="text-foreground font-medium flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-primary" />
            AI-researched documents
          </p>
          <ol className="list-decimal pl-6 space-y-1">
            <li>You create a document by selecting a **Type** and a **Subject**.</li>
            <li>Clicking <span className="text-foreground font-medium">&quot;Start Research&quot;</span> creates the document and triggers the AI agent.</li>
            <li>The AI researches the subject (and any additional sources from the Type) and synthesizes content per the type&apos;s instructions.</li>
            <li>The result is stored as content, and any URLs found during research are saved in the <span className="text-foreground font-medium">Sources</span> field.</li>
            <li>You can edit it manually or use <span className="text-foreground font-medium">&quot;Refresh Content&quot;</span> anytime to regenerate it.</li>
            <li>Use <span className="text-foreground font-medium">&quot;Refresh All Content&quot;</span> in the Documents panel to concurrently update all AI-researched documents at once.</li>
          </ol>
          <p className="text-foreground font-medium flex items-center gap-1 pt-1">
            <User className="w-4 h-4" />
            Manual documents
          </p>
          <ol className="list-decimal pl-6 space-y-1">
            <li>You create a document by writing the content and sources directly.</li>
            <li>No subject is used, and no AI research is performed.</li>
          </ol>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="w-5 h-5 text-primary" />
            Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-4">
          <div className="space-y-2">
            <p className="text-foreground font-medium">1. Transformation Instructions</p>
            <p>
              Be specific about the desired output format. Instead of &quot;Summarize this&quot;, try:
              <br />
              <span className="italic">&quot;Extract key features and code examples. Present them as a bulleted list with a final summary of potential use cases.&quot;</span>
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-foreground font-medium">2. Subject Content</p>
            <p>
              Provide clear and detailed descriptions for your subjects. This is what the AI uses to search the web.
              <br />
              <span className="italic">Good Subject Content: &quot;Research the latest features of Next.js 15, specifically focusing on the new caching mechanisms and PPR (Partial Prerendering).&quot;</span>
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-foreground font-medium">3. Additional Sources</p>
            <p>
              Use the <span className="text-foreground font-medium">Additional Sources</span> field in Document Types to point the AI to specific trustworthy URLs, blogs, or social media handles to supplement its general research.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-foreground font-medium">4. Source Relevance Factors</p>
            <p>
              Guide the AI on how to value different sources. For example:
              <br />
              <span className="italic">&quot;Prioritize official documentation and GitHub repositories. Treat forum posts as low-relevance and ignore marketing landing pages.&quot;</span>
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-foreground font-medium">5. Date Limits</p>
            <p>
              Restrict the research to a specific timeframe by setting start and end limits in days relative to today.
              <br />
              <span className="italic">Example: Set Start to 365 and End to 0 to only include research material from the last year.</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="w-5 h-5 text-primary" />
            Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
          <p>
            The <span className="text-foreground font-medium">Stats</span> tab shows OpenRouter account credit figures: <span className="text-foreground font-medium">total</span> (purchased), <span className="text-foreground font-medium">used</span> (consumed), and <span className="text-foreground font-medium">remaining</span> (the difference). Data is fetched from OpenRouter; use <span className="text-foreground font-medium">Refresh</span> to pull the latest values.
          </p>
          <p>
            A <span className="text-foreground font-medium">management API key</span> (or, for local development, the same key as chat if your OpenRouter project allows) must be configured on the server. These numbers reflect provider billing, not in-app message counts.
          </p>
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
            On every user message, the chat engine loads **all** documents, sorted by their last update time. Their contents are injected into the AI system prompt to ground every response in your curated knowledge.
          </p>
          <p>
            Carbonchat supports multi-turn conversations, meaning the AI remembers the context of previous messages in the current session while staying grounded in your documents.
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
