'use client';

import { useState } from 'react';
import { useQuery, useInsertMutation, useUpdateMutation, useDeleteMutation } from '@supabase-cache-helpers/postgrest-react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RefreshCw, FileText, Plus, Edit, Loader2 } from 'lucide-react';
import AiBadge from './AiBadge';
import DocumentCard from './DocumentCard';
import { useScrapeMutation } from '@/app/hooks/useScrapeMutation';
import { supabase } from '@/lib/supabase';
import { DocumentWithRelations as Document } from '@/lib/supabase.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

function DocumentSkeleton() {
  return (
    <Card className="border border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export default function DocumentsPanel() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    document_type_id: '',
    subject_id: '',
    content: '',
    sources: ''
  });

  // Queries using Supabase Cache Helpers
  const { data: documents, isLoading: isLoadingDocs, isFetching: isFetchingDocs, refetch: refetchDocs } = useQuery(
    supabase
      .from('documents')
      .select(`
        *,
        document_types (
          name,
          ai
        ),
        subjects (
          name
        )
      `)
      .order('updated_at', { ascending: false })
  );

  const { data: documentTypes } = useQuery(
    supabase
      .from('document_types')
      .select('id, name, ai')
      .order('updated_at', { ascending: false })
  );

  const { data: subjects, isFetching: isFetchingSubjects, refetch: refetchSubjects } = useQuery(
    supabase
      .from('subjects')
      .select('id, name')
      .order('updated_at', { ascending: false })
  );

  // Mutations
  const { mutate: deleteDoc, isPending: isDeletingPending, variables: deletingVariables } = useDeleteMutation(
    supabase.from('documents'),
    ['id'],
    null
  );

  const scrapeMutation = useScrapeMutation();

  const handleRefreshAll = async () => {
    if (!documents) return;
    const aiDocs = documents.filter(doc => doc.document_types?.ai);
    if (aiDocs.length === 0) return;

    setRefreshingAll(true);
    try {
      // Trigger individual mutations for each AI document
      // This ensures each card shows its own loading state and error handling
      await Promise.allSettled(aiDocs.map(doc => 
        scrapeMutation.mutateAsync(doc.id)
      ));
      refetchDocs();
    } finally {
      setRefreshingAll(false);
    }
  };

  const { mutate: insertDoc, isPending: isInsertingPending } = useInsertMutation(
    supabase.from('documents'),
    ['id'],
    '*, document_types(name, ai), subjects(name)'
  );

  const { mutate: updateDoc, isPending: isUpdatingPending } = useUpdateMutation(
    supabase.from('documents'),
    ['id'],
    '*, document_types(name, ai), subjects(name)'
  );

  const selectedType = (documentTypes || []).find(t => t.id === formData.document_type_id);
  const selectedTypeIsAi = selectedType?.ai ?? true;

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    deleteDoc({ id });
  };

  const handleOpenCreateDialog = () => {
    setEditingDocument(null);
    const defaultType = documentTypes?.[0]?.id || '';
    const defaultSubject = subjects?.[0]?.id || '';
    setFormData({
      name: '',
      document_type_id: defaultType,
      subject_id: defaultSubject,
      content: '',
      sources: ''
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (doc: Document) => {
    setEditingDocument(doc);
    setFormData({
      name: doc.name,
      document_type_id: doc.document_type_id,
      subject_id: doc.subject_id || '',
      content: doc.content ?? '',
      sources: doc.sources ?? ''
    });
    setIsDialogOpen(true);
  };

  const handleOpenDetailsDialog = (doc: Document) => {
    setViewingDocument(doc);
    setIsDetailsDialogOpen(true);
  };

  const handleSaveDocument = () => {
    if (!formData.name || !formData.document_type_id) {
      alert('Please fill in all fields.');
      return;
    }

    if (selectedTypeIsAi && !formData.subject_id) {
      alert('Please select a subject for AI-researched documents.');
      return;
    }

    if (!selectedTypeIsAi && !formData.content) {
      alert('Please provide content for manually-authored documents.');
      return;
    }

    const payload: Partial<Document> = {
      name: formData.name,
      document_type_id: formData.document_type_id,
      subject_id: selectedTypeIsAi ? formData.subject_id : null,
      content: formData.content,
      sources: formData.sources,
    };

    if (editingDocument) {
      updateDoc({ ...payload, id: editingDocument.id }, {
        onSuccess: () => {
          setIsDialogOpen(false);
        },
        onError: (error) => {
          alert(`Failed to update document: ${error.message}`);
        }
      });
    } else {
      if (selectedTypeIsAi) {
        payload.content = 'Researching and generating knowledge...';
        payload.sources = '';
      }
      insertDoc([payload], {
        onSuccess: (data) => {
          if (data && data[0] && selectedTypeIsAi) {
            scrapeMutation.mutate(data[0].id, {
              onSuccess: () => refetchDocs()
            });
          }
          setIsDialogOpen(false);
        },
        onError: (error) => {
          alert(`Failed to create document: ${error.message}`);
        }
      });
    }
  };

  const isPending = isInsertingPending || isUpdatingPending;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Knowledge Base</h2>
          <p className="text-muted-foreground">Documents generated by AI research</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleRefreshAll} 
            disabled={isLoadingDocs || isFetchingDocs || refreshingAll || !documents || documents.length === 0} 
            variant="outline" 
            className="border-border hover:bg-muted"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetchingDocs || refreshingAll ? 'animate-spin' : ''}`} />
            Refresh All Content
          </Button>
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            New Document
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoadingDocs ? (
          <>
            <DocumentSkeleton />
            <DocumentSkeleton />
            <DocumentSkeleton />
          </>
        ) : !documents || documents.length === 0 ? (
          <Card className="p-12 text-center border border-border">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-foreground">No documents yet.</p>
            <p className="text-sm text-muted-foreground mt-3">Click &quot;New Document&quot; to start AI research.</p>
          </Card>
        ) : (
          documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onEdit={handleOpenEditDialog}
              onDelete={handleDelete}
              onViewDetails={handleOpenDetailsDialog}
              onRefreshSuccess={() => refetchDocs()}
              isDeleting={isDeletingPending && deletingVariables?.id === doc.id}
            />
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[720px] max-h-[90vh] flex flex-col p-0 overflow-hidden border border-border">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{editingDocument ? 'Edit Document' : 'New Document'}</DialogTitle>
            <DialogDescription>
              {editingDocument
                ? selectedTypeIsAi
                  ? 'Update document metadata and content. Use "Refresh Content" to regenerate content with AI research.'
                  : 'Update document metadata and content. This document type is manual, so content is edited directly.'
                : selectedTypeIsAi
                  ? 'Enter research details. The AI will immediately start researching and generating content.'
                  : 'Write the document content directly. This document type is manual — no AI research will be performed.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g. Next.js 15 Guide"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Document Type</Label>
              <Select 
                value={formData.document_type_id} 
                onValueChange={(value: string | null) => {
                  if (value) setFormData({ ...formData, document_type_id: value });
                }}
                disabled={isPending}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select a type">
                    {(documentTypes || []).find(t => t.id === formData.document_type_id)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(documentTypes || []).map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedTypeIsAi && (
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="subject">Subject</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-[10px] gap-1"
                    onClick={(e) => {
                      e.preventDefault();
                      refetchSubjects();
                    }}
                    disabled={isFetchingSubjects || isPending}
                  >
                    <RefreshCw className={`w-3 h-3 ${isFetchingSubjects ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
                <Select 
                  value={formData.subject_id} 
                  onValueChange={(value: string | null) => {
                    if (value) setFormData({ ...formData, subject_id: value });
                  }}
                  disabled={isPending}
                >
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select a subject">
                      {(subjects || []).find(s => s.id === formData.subject_id)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {!subjects || subjects.length === 0 ? (
                      <div className="p-2 text-xs text-muted-foreground text-center">
                        No subjects found. Create one in the Subjects tab first.
                      </div>
                    ) : (
                      subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            {(editingDocument || !selectedTypeIsAi) && (
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder={selectedTypeIsAi
                    ? 'Document content. Edit manually or regenerate via Refresh Content.'
                    : 'Write the document content here.'}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="min-h-[240px] font-mono text-xs leading-relaxed"
                  disabled={isPending}
                />
                {selectedTypeIsAi ? (
                  <p className="text-xs text-muted-foreground">
                    Manual edits are saved directly. Running &quot;Refresh Content&quot; will overwrite this with freshly researched content.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    This document type is manual. Content is written and edited directly — no AI research is performed.
                  </p>
                )}
              </div>
            )}
            {(editingDocument || !selectedTypeIsAi) && (
              <div className="grid gap-2">
                <Label htmlFor="sources">Sources</Label>
                <Textarea
                  id="sources"
                  placeholder={selectedTypeIsAi
                    ? 'Sources used for research. Edit manually or regenerate via Refresh Content.'
                    : 'List any sources or URLs here.'}
                  value={formData.sources}
                  onChange={(e) => setFormData({ ...formData, sources: e.target.value })}
                  className="min-h-[120px] font-mono text-xs leading-relaxed"
                  disabled={isPending}
                />
                <p className="text-xs text-muted-foreground">
                  {selectedTypeIsAi 
                    ? 'URLs and resources used by the AI agent.' 
                    : 'Reference sources for this manual document.'}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="px-6 py-4 border-t border-border">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isPending}>Cancel</Button>
            <Button onClick={handleSaveDocument} disabled={isPending}>
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {editingDocument
                ? 'Save Changes'
                : selectedTypeIsAi
                  ? 'Start Research'
                  : 'Create Document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 overflow-hidden border border-border">
          {viewingDocument && (
            <>
              <DialogHeader className="px-6 pt-6">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl">{viewingDocument.name}</DialogTitle>
                  <div className="flex items-center gap-2">
                    <AiBadge ai={viewingDocument.document_types?.ai} />
                  </div>
                </div>
                <DialogDescription>
                  Full document information and research results
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto">
                <div className="px-6 py-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-[10px] uppercase tracking-wider">Type</Label>
                      <p className="font-medium">{viewingDocument.document_types?.name}</p>
                    </div>
                    {viewingDocument.subjects && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-[10px] uppercase tracking-wider">Subject</Label>
                        <p className="font-medium">{viewingDocument.subjects.name}</p>
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-border/50 w-full" />

                  <div className="space-y-3">
                    <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Document Content</Label>
                    <div className="bg-muted p-5 rounded-lg border border-border text-sm whitespace-pre-wrap font-light text-foreground leading-relaxed">
                      {viewingDocument.content || <span className="text-muted-foreground italic">No content available.</span>}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Research Sources</Label>
                    <div className="bg-muted/50 p-5 rounded-lg border border-border text-xs whitespace-pre-wrap font-light text-foreground leading-relaxed italic">
                      {viewingDocument.sources || 'No sources documented for this research.'}
                    </div>
                  </div>

                  <div className="h-px bg-border/50 w-full" />

                  <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-tight">
                    <div>Created: {new Date(viewingDocument.created_at).toLocaleString()}</div>
                    {viewingDocument.updated_at && (
                      <div>Updated: {new Date(viewingDocument.updated_at).toLocaleString()}</div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20">
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
                <Button onClick={() => {
                  setIsDetailsDialogOpen(false);
                  handleOpenEditDialog(viewingDocument);
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Document
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
