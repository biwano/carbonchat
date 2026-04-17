'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Play, Info, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import AiBadge from './AiBadge';
import { DocumentWithRelations as Document } from '@/lib/supabase.types';
import { useMutationState } from '@tanstack/react-query';
import { useScrapeMutation } from '@/app/hooks/useScrapeMutation';

interface DocumentCardProps {
  doc: Document;
  onEdit: (doc: Document) => void;
  onDelete: (id: string) => void;
  onViewDetails: (doc: Document) => void;
  onRefreshSuccess?: () => void;
  isDeleting?: boolean;
}

export default function DocumentCard({
  doc,
  onEdit,
  onDelete,
  onViewDetails,
  onRefreshSuccess,
  isDeleting = false,
}: DocumentCardProps) {
  const [localError, setLocalError] = useState<string | null>(null);

  const scrapeMutation = useScrapeMutation(() => {
    setLocalError(null);
    if (onRefreshSuccess) onRefreshSuccess();
  });

  // Track if THIS document is being scraped anywhere (locally or via "Refresh All")
  const mutationStates = useMutationState({
    filters: { mutationKey: ['scrape'], status: 'pending' },
    select: (mutation) => mutation.state.variables === doc.id ? mutation.state.status : null,
  });

  const isScraping = mutationStates.filter(Boolean).length > 0;

  // Track global errors for this document
  const errorStates = useMutationState({
    filters: { mutationKey: ['scrape'], status: 'error' },
    select: (mutation) => mutation.state.variables === doc.id ? (mutation.state.error as Error) : null,
  });

  const globalError = errorStates.filter(Boolean).pop();
  const scrapeError = localError || (globalError ? (globalError as Error).message : null);

  const handleRefresh = () => {
    setLocalError(null);
    scrapeMutation.mutate(doc.id, {
      onError: (error) => setLocalError(error.message)
    });
  };

  return (
    <Card className={`border border-border ${isScraping ? 'opacity-70' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {doc.name}
              {isScraping ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                  <span className="text-[10px] font-medium text-primary uppercase tracking-wider">Researching</span>
                </div>
              ) : scrapeError ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive">
                  <AlertCircle className="w-3 h-3" />
                  <span className="text-[10px] font-medium uppercase tracking-wider" title={scrapeError}>Research Failed</span>
                </div>
              ) : null}
            </CardTitle>
            <div className="text-xs flex flex-wrap gap-x-4 gap-y-1">
              <p className="text-primary flex items-center gap-2">
                <span>Type: {doc.document_types?.name || 'Unknown'}</span>
                <AiBadge ai={doc.document_types?.ai} size="sm" />
              </p>
              {doc.subjects && (
                <p className="text-muted-foreground">
                  Subject: <span className="text-foreground font-medium">{doc.subjects.name}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {doc.document_types?.ai && (
              <Button
                size="sm"
                variant={scrapeError ? "destructive" : "outline"}
                disabled={isScraping}
                onClick={handleRefresh}
              >
                {isScraping ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : scrapeError ? (
                  <RefreshCw className="w-3 h-3 mr-1" />
                ) : (
                  <Play className="w-3 h-3 mr-1" />
                )}
                {scrapeError ? "Retry Research" : "Refresh Content"}
              </Button>
            )}
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => onViewDetails(doc)}
            >
              <Info className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              disabled={isScraping}
              onClick={() => onEdit(doc)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-destructive"
              disabled={isScraping || isDeleting}
              onClick={() => onDelete(doc.id)}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="text-[10px] text-muted-foreground">
            Created: {new Date(doc.created_at).toLocaleString()}
          </div>
          {doc.updated_at && (
            <div className="text-[10px] text-muted-foreground">
              Updated: {new Date(doc.updated_at).toLocaleString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
