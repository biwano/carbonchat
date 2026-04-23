'use client';

import { Suspense, useCallback, useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, BookOpen, HelpCircle, Tags, BarChart3 } from 'lucide-react';
import DocumentsPanel from './DocumentsPanel';
import DocumentTypesPanel from './DocumentTypesPanel';
import SubjectsPanel from './SubjectsPanel';
import HelpPanel from './HelpPanel';
import StatsPanel from './StatsPanel';

const ADMIN_TAB_VALUES = [
  'documents',
  'subjects',
  'types',
  'stats',
  'help',
] as const;
type AdminTab = (typeof ADMIN_TAB_VALUES)[number];
const DEFAULT_TAB: AdminTab = 'documents';

const ADMIN_TABS = new Set<string>(ADMIN_TAB_VALUES);

function isAdminTab(value: string): value is AdminTab {
  return ADMIN_TABS.has(value);
}

function urlWithParams(pathname: string, params: URLSearchParams): string {
  const q = params.toString();
  return q ? `${pathname}?${q}` : pathname;
}

function AdministrationPanelInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab: AdminTab = useMemo(() => {
    const raw = searchParams.get('tab');
    if (raw && isAdminTab(raw)) return raw;
    return DEFAULT_TAB;
  }, [searchParams]);

  // Normalize: drop redundant `?tab=documents` and strip invalid `tab` values
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (!tab) return;
    if (!isAdminTab(tab) || tab === 'documents') {
      const next = new URLSearchParams(searchParams.toString());
      next.delete('tab');
      router.replace(urlWithParams(pathname, next), { scroll: false });
    }
  }, [searchParams, pathname, router]);

  const handleValueChange = useCallback(
    (value: string) => {
      if (!isAdminTab(value)) return;
      const next = new URLSearchParams(searchParams.toString());
      if (value === 'documents') {
        next.delete('tab');
      } else {
        next.set('tab', value);
      }
      router.replace(urlWithParams(pathname, next), { scroll: false });
    },
    [pathname, router, searchParams]
  );

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

      <Tabs value={activeTab} onValueChange={handleValueChange} className="w-full">
        <TabsList className="grid w-full max-w-5xl grid-cols-2 sm:grid-cols-3 md:grid-cols-5 bg-muted border border-border gap-1 h-auto p-1">
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
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Stats
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

          <TabsContent value="stats" className="mt-0">
            <StatsPanel />
          </TabsContent>

          <TabsContent value="help" className="mt-0">
            <HelpPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function AdministrationPanelFallback() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="mb-8 h-24 rounded-lg bg-muted/50 animate-pulse" />
      <div className="h-12 max-w-5xl rounded-lg bg-muted/50 animate-pulse" />
      <div className="h-64 rounded-lg bg-muted/30 animate-pulse" />
    </div>
  );
}

export default function AdministrationPanel() {
  return (
    <Suspense fallback={<AdministrationPanelFallback />}>
      <AdministrationPanelInner />
    </Suspense>
  );
}
