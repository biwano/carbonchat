'use client';

import AdministrationPanel from '../components/AdministrationPanel';
import Link from 'next/link';
import { ArrowLeft, Bot } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Admin Header */}
      <div className="border-b border-zinc-800 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Carbonchat</h1>
              <p className="text-xs text-zinc-500 -mt-1">Administration</p>
            </div>
          </div>
          
          <Link 
            href="/"
            className="flex items-center gap-2 px-5 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-sm border border-zinc-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
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
