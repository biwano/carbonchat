'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, BookOpen, HelpCircle, Tags } from 'lucide-react';
import DocumentsPanel from './DocumentsPanel';
import DocumentTypesPanel from './DocumentTypesPanel';
import SubjectsPanel from './SubjectsPanel';
import HelpPanel from './HelpPanel';

export default function AdministrationPanel() {
  const [activeAdminTab, setActiveAdminTab] = useState('documents');

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Administration</h2>
            <p className="text-muted-foreground">Manage subjects, document types and AI-generated knowledge entries</p>
          </div>
        </div>
      </div>

      <Tabs value={activeAdminTab} onValueChange={setActiveAdminTab} className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-muted border border-border">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="subjects" className="flex items-center gap-2">
            <Tags className="w-4 h-4" />
            Subjects
          </TabsTrigger>
          <TabsTrigger value="types" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Document types
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Help
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="documents" className="mt-0">
            <DocumentsPanel />
          </TabsContent>

          <TabsContent value="types" className="mt-0">
            <DocumentTypesPanel />
          </TabsContent>

          <TabsContent value="subjects" className="mt-0">
            <SubjectsPanel />
          </TabsContent>

          <TabsContent value="help" className="mt-0">
            <HelpPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
