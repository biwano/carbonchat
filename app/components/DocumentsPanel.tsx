'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Play, FileText, Trash2, Plus, Edit, Loader2, ChevronDown } from 'lucide-react';
import AiBadge from './AiBadge';
import { supabase } from '@/lib/supabase';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

interface DocumentType {
  id: string;
  name: string;
  ai: boolean;
}

interface Subject {
  id: string;
  name: string;
}

interface Document {
  id: string;
  name: string;
  search_query: string;
  content: string;
  created_at: string;
  updated_at?: string;
  document_type_id: string;
  subject_id: string | null;
  document_types: {
    name: string;
    ai: boolean;
  };
  subjects?: {
    name: string;
  } | null;
}

export default function DocumentsPanel() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScraping, setIsScraping] = useState<string | null>(null); // ID of document being scraped, or 'new'
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    search_query: '', // DEPRECATED
    document_type_id: '',
    subject_id: '',
    content: ''
  });

  const fetchDocuments = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        document_type_id,
        subject_id,
        document_types (
          name,
          ai
        ),
        subjects (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (data) setDocuments(data as unknown as Document[]);
    if (error) console.error('Error fetching documents:', error);
    setIsLoading(false);
  };

  const fetchDocumentTypes = async () => {
    const { data, error } = await supabase
      .from('document_types')
      .select('id, name, ai')
      .order('name');
    
    if (data) setDocumentTypes(data);
    if (error) console.error('Error fetching document types:', error);
  };

  const fetchSubjects = async () => {
    const { data, error } = await supabase
      .from('subjects')
      .select('id, name')
      .order('name');
    
    if (data) setSubjects(data);
    if (error) console.error('Error fetching subjects:', error);
  };

  const selectedType = documentTypes.find(t => t.id === formData.document_type_id);
  const selectedTypeIsAi = selectedType?.ai ?? true;

  useEffect(() => {
    fetchDocuments();
    fetchDocumentTypes();
    fetchSubjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchDocuments();
    } else {
      console.error('Error deleting document:', error);
    }
  };

  const handleOpenCreateDialog = () => {
    setEditingDocument(null);
    setFormData({
      name: '',
      search_query: '',
      document_type_id: documentTypes[0]?.id || '',
      subject_id: subjects[0]?.id || '',
      content: ''
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (doc: Document) => {
    setEditingDocument(doc);
    setFormData({
      name: doc.name,
      search_query: doc.search_query || '',
      document_type_id: doc.document_type_id,
      subject_id: doc.subject_id || '',
      content: doc.content ?? ''
    });
    setIsDialogOpen(true);
  };

  const handleSaveDocument = async () => {
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

    if (editingDocument) {
      const { error } = await supabase
        .from('documents')
        .update({
          name: formData.name,
          search_query: '', // CLEAR SEARCH QUERY
          document_type_id: formData.document_type_id,
          subject_id: selectedTypeIsAi ? formData.subject_id : null,
          content: formData.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingDocument.id);

      if (error) {
        console.error('Error updating document:', error);
        alert('Failed to update document.');
      } else {
        setIsDialogOpen(false);
        fetchDocuments();
      }
    } else {
      setIsDialogOpen(false);

      if (selectedTypeIsAi) {
        const { data, error: insertError } = await supabase
          .from('documents')
          .insert({
            name: formData.name,
            search_query: '', // CLEAR SEARCH QUERY
            document_type_id: formData.document_type_id,
            subject_id: formData.subject_id,
            content: 'Researching and generating knowledge...'
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting document:', insertError);
          alert('Failed to create document.');
          return;
        }

        if (data) {
          triggerScrape(data.id);
        }
      } else {
        const { error: insertError } = await supabase
          .from('documents')
          .insert({
            name: formData.name,
            search_query: '',
            document_type_id: formData.document_type_id,
            subject_id: null,
            content: formData.content
          });

        if (insertError) {
          console.error('Error inserting document:', insertError);
          alert('Failed to create document.');
          return;
        }

        fetchDocuments();
      }
    }
  };

  const triggerScrape = async (id: string) => {
    setIsScraping(id);
    try {
      const res = await fetch('/api/documents/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        console.error('Scrape error:', result.error);
        alert(`Failed to generate document: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Scrape fetch error:', err);
      alert('Failed to trigger research. Please check your connection and try again.');
    } finally {
      setIsScraping(null);
      fetchDocuments();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Knowledge Base</h2>
          <p className="text-muted-foreground">Documents generated by AI research</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchDocuments} disabled={isLoading} variant="outline" className="border-border hover:bg-muted">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh List
          </Button>
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            New Document
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {documents.length === 0 && !isScraping ? (
          <Card className="p-12 text-center border border-border">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-foreground">No documents yet.</p>
            <p className="text-sm text-muted-foreground mt-3">Click &quot;New Document&quot; to start AI research.</p>
          </Card>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id} className={`border border-border ${isScraping === doc.id ? 'opacity-70' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {doc.name}
                      {isScraping === doc.id && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
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
                        variant="outline"
                        disabled={!!isScraping}
                        onClick={() => triggerScrape(doc.id)}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Refresh Content
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      disabled={!!isScraping}
                      onClick={() => handleOpenEditDialog(doc)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-destructive"
                      disabled={!!isScraping}
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Collapsible>
                  <CollapsibleTrigger
                    render={
                      <Button variant="ghost" size="sm" className="w-full flex justify-between items-center p-2 h-auto hover:bg-muted/50" />
                    }
                  >
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Document Content</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <div className="max-h-96 overflow-auto bg-muted p-4 rounded border border-border text-sm whitespace-pre-wrap font-light text-foreground leading-relaxed">
                      {doc.content}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/50">
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
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[720px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
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
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Document Type</Label>
              <Select 
                value={formData.document_type_id} 
                onValueChange={(value: string | null) => {
                  if (value) setFormData({ ...formData, document_type_id: value });
                }}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select a type">
                    {documentTypes.find(t => t.id === formData.document_type_id)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
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
                      fetchSubjects();
                    }}
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
                <Select 
                  value={formData.subject_id} 
                  onValueChange={(value: string | null) => {
                    if (value) setFormData({ ...formData, subject_id: value });
                  }}
                >
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select a subject">
                      {subjects.find(s => s.id === formData.subject_id)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.length === 0 ? (
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
          </div>
          <DialogFooter className="px-6 py-4 border-t border-border">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveDocument}>
              {editingDocument
                ? 'Save Changes'
                : selectedTypeIsAi
                  ? 'Start Research'
                  : 'Create Document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
