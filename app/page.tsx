'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, BookOpen, Settings } from 'lucide-react';
import DocumentTypesPanel from './components/DocumentTypesPanel';
import DocumentsPanel from './components/DocumentsPanel';
import ChatPanel from './components/ChatPanel';

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="border-b border-zinc-800 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Carbonchat</h1>
              <p className="text-xs text-zinc-500 -mt-1">Knowledge Chatbot</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="px-3 py-1.5 bg-zinc-800 rounded-full flex items-center gap-2 text-emerald-400">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              Connected
            </div>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-zinc-900">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="types" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Types
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="chat" className="mt-0">
              <ChatPanel />
            </TabsContent>

            <TabsContent value="documents" className="mt-0">
              <DocumentsPanel />
            </TabsContent>

            <TabsContent value="types" className="mt-0">
              <DocumentTypesPanel />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
