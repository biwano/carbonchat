'use client';

import Link from 'next/link';
import { Bot, Settings } from 'lucide-react';
import ChatPanel from './components/ChatPanel';

export default function Home() {

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Carbonchat</h1>
              <p className="text-xs text-muted-foreground -mt-1">Knowledge Chatbot</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <Link 
              href="/admin"
              className="flex items-center gap-2 px-4 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-full text-sm cursor-pointer transition-colors border border-border"
            >
              <Settings className="w-4 h-4" />
              Administration
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <ChatPanel />
      </div>
    </div>
  );
}
