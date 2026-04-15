'use client';

import AdministrationPanel from '../components/AdministrationPanel';
import Link from 'next/link';
import { Bot } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Admin Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center">
          <Link 
            href="/" 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
          >
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">Carbonchat</h1>
              <p className="text-xs text-muted-foreground -mt-1">Administration</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Admin Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AdministrationPanel />
      </div>
    </div>
  );
}
