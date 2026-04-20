'use client';

import { useState } from 'react';
import { useQuery, useInsertMutation, useUpdateMutation, useDeleteMutation } from '@supabase-cache-helpers/postgrest-react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit, Save, ChevronDown, Sparkles, User, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DocumentType } from '@/lib/supabase.types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AiBadge from "./AiBadge";
import { Skeleton } from "@/components/ui/skeleton";

interface FormData {
  name: string;
  transformation_instructions: string;
  additional_sources: string;
  source_relevance_factors: string;
  description: string;
  ai: boolean;
  date_limit_start_days_ago: string;
  date_limit_end_days_ago: string;
}

const EMPTY_FORM: FormData = {
  name: '',
  transformation_instructions: '',
  additional_sources: '',
  source_relevance_factors: '',
  description: '',
  ai: true,
  date_limit_start_days_ago: '',
  date_limit_end_days_ago: '0',
};

function DocumentTypeSkeleton() {
  return (
    <Card className="border border-border">
      <CardHeader>
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  );
}

export default function DocumentTypesPanel() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  // Queries using Supabase Cache Helpers
  const { data: types, isLoading } = useQuery(
    supabase
      .from('document_types')
      .select('*')
      .order('updated_at', { ascending: false })
  );

  // Mutations using Supabase Cache Helpers
  const { mutate: create, isPending: isCreatingPending } = useInsertMutation(
    supabase.from('document_types'),
    ['id'],
    null,
    {
      onSuccess: () => {
        setFormData(EMPTY_FORM);
        setIsDialogOpen(false);
      },
    }
  );

  const { mutate: update, isPending: isUpdatingPending } = useUpdateMutation(
    supabase.from('document_types'),
    ['id'],
    null,
    {
      onSuccess: () => {
        setEditingId(null);
        setFormData(EMPTY_FORM);
        setIsDialogOpen(false);
      },
    }
  );

  const { mutate: deleteType, isPending: isDeletingPending, variables: deletingVariables } = useDeleteMutation(
    supabase.from('document_types'),
    ['id'],
    null
  );

  const handleCreate = () => {
    if (!formData.name) return;
    if (formData.ai && !formData.transformation_instructions) return;

    const payload = {
      ...formData,
      transformation_instructions: formData.ai ? formData.transformation_instructions : '',
      additional_sources: formData.ai ? formData.additional_sources : '',
      source_relevance_factors: formData.ai ? formData.source_relevance_factors : '',
      date_limit_start_days_ago: (formData.ai && formData.date_limit_start_days_ago) ? parseInt(formData.date_limit_start_days_ago) : null,
      date_limit_end_days_ago: formData.ai ? parseInt(formData.date_limit_end_days_ago || '0') : null,
    };

    create([payload]);
  };

  const handleUpdate = (id: string) => {
    if (!formData.name) return;
    if (formData.ai && !formData.transformation_instructions) return;

    const payload = {
      ...formData,
      transformation_instructions: formData.ai ? formData.transformation_instructions : '',
      additional_sources: formData.ai ? formData.additional_sources : '',
      source_relevance_factors: formData.ai ? formData.source_relevance_factors : '',
      date_limit_start_days_ago: (formData.ai && formData.date_limit_start_days_ago) ? parseInt(formData.date_limit_start_days_ago) : null,
      date_limit_end_days_ago: formData.ai ? parseInt(formData.date_limit_end_days_ago || '0') : null,
    };

    update({ ...payload, id });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document type? This will also delete all associated documents.')) return;
    deleteType({ id });
  };

  const startEditing = (type: DocumentType) => {
    setEditingId(type.id);
    setFormData({
      name: type.name,
      transformation_instructions: type.transformation_instructions,
      additional_sources: type.additional_sources || '',
      source_relevance_factors: type.source_relevance_factors || '',
      description: type.description || '',
      ai: type.ai,
      date_limit_start_days_ago: type.date_limit_start_days_ago?.toString() || '',
      date_limit_end_days_ago: type.date_limit_end_days_ago?.toString() || '0'
    });
    setIsDialogOpen(true);
  };

  const cancelAction = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  const isPending = isCreatingPending || isUpdatingPending;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Document Types</h2>
          <p className="text-muted-foreground">Define how AI should transform research into knowledge</p>
        </div>
        <Button onClick={() => {
          setEditingId(null);
          setFormData(EMPTY_FORM);
          setIsDialogOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          New Type
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[720px] max-h-[90vh] flex flex-col p-0 overflow-hidden border border-border">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{editingId ? 'Edit Document Type' : 'Create New Document Type'}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="e.g. Technical Documentation"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Short description of what this type is for"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isPending}
              />
            </div>
            <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
              <div className="space-y-0.5">
                <label htmlFor="ai-toggle" className="text-sm font-medium flex items-center gap-2">
                  {formData.ai ? <Sparkles className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-muted-foreground" />}
                  AI-researched
                </label>
                <p className="text-xs text-muted-foreground">
                  {formData.ai
                    ? 'Documents of this type are researched and generated by the AI from a search query.'
                    : 'Documents of this type are authored manually; their content is written directly by the user.'}
                </p>
              </div>
              <Switch
                id="ai-toggle"
                checked={formData.ai}
                onCheckedChange={(checked: boolean) => setFormData({ ...formData, ai: checked })}
                disabled={isPending}
              />
            </div>
            {formData.ai && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Transformation Instructions</label>
                  <Textarea
                    placeholder="Tell the AI exactly how to process the research..."
                    rows={6}
                    value={formData.transformation_instructions}
                    onChange={(e) => setFormData({ ...formData, transformation_instructions: e.target.value })}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Additional Sources</label>
                  <Textarea
                    placeholder="Enter URLs or names of blogs, social media accounts, etc. for the AI to research..."
                    rows={3}
                    value={formData.additional_sources}
                    onChange={(e) => setFormData({ ...formData, additional_sources: e.target.value })}
                    disabled={isPending}
                  />
                  <p className="text-xs text-muted-foreground">The AI will use these sources to supplement its research.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Source Relevance Factors</label>
                  <Textarea
                    placeholder="Tell the AI how to prioritize and rate sources (e.g. 'Prefer academic papers', 'Ignore social media')..."
                    rows={3}
                    value={formData.source_relevance_factors}
                    onChange={(e) => setFormData({ ...formData, source_relevance_factors: e.target.value })}
                    disabled={isPending}
                  />
                  <p className="text-xs text-muted-foreground">The AI will use these instructions to rate the pertinence of each source.</p>
                </div>
                <div className="grid grid-cols-2 gap-4 border border-border p-3 rounded-lg bg-muted/20">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      Research Start (Days Ago)
                    </label>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="e.g. 365 (Optional)"
                      value={formData.date_limit_start_days_ago}
                      onChange={(e) => setFormData({ ...formData, date_limit_start_days_ago: e.target.value })}
                      disabled={isPending}
                    />
                    <p className="text-[10px] text-muted-foreground">Empty = no start limit. 365 = 1 year ago.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      Research End (Days Ago)
                    </label>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="e.g. 0"
                      value={formData.date_limit_end_days_ago}
                      onChange={(e) => setFormData({ ...formData, date_limit_end_days_ago: e.target.value })}
                      disabled={isPending}
                    />
                    <p className="text-[10px] text-muted-foreground">0 = Now. 180 = ~6 months ago.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="px-6 py-4 border-t border-border">
            <Button variant="outline" onClick={cancelAction} disabled={isPending}>
              Cancel
            </Button>
            {editingId ? (
              <Button 
                onClick={() => handleUpdate(editingId)}
                disabled={isPending}
              >
                {isUpdatingPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            ) : (
              <Button 
                onClick={handleCreate}
                disabled={isPending}
              >
                {isCreatingPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Type
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {isLoading ? (
          <>
            <DocumentTypeSkeleton />
            <DocumentTypeSkeleton />
            <DocumentTypeSkeleton />
          </>
        ) : (
          (types || []).map((type) => (
            editingId !== type.id && (
              <Card key={type.id} className="border border-border">
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {type.name}
                      <AiBadge ai={type.ai} />
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => startEditing(type)}
                        disabled={isDeletingPending}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive"
                        onClick={() => handleDelete(type.id)}
                        disabled={isDeletingPending}
                      >
                        {isDeletingPending && deletingVariables?.id === type.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {type.description && <p className="text-sm text-muted-foreground mb-3">{type.description}</p>}

                  {type.ai && (
                    <Collapsible>
                      <CollapsibleTrigger
                        render={
                          <Button variant="ghost" size="sm" className="w-full flex justify-between items-center p-2 h-auto hover:bg-muted/50" />
                        }
                      >
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Details</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-2 space-y-4">
                        <div className="space-y-2 px-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2">Transformation Instructions</span>
                          <div className="bg-muted p-6 rounded-lg border border-border text-sm leading-relaxed whitespace-pre-wrap text-foreground max-h-60 overflow-auto">
                            {type.transformation_instructions}
                          </div>
                        </div>

                        {type.additional_sources && (
                          <div className="space-y-2 px-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2">Additional Sources</span>
                            <div className="bg-muted/30 p-4 rounded-lg border border-border/50 text-sm whitespace-pre-wrap text-foreground italic">
                              {type.additional_sources}
                            </div>
                          </div>
                        )}

                        {type.source_relevance_factors && (
                          <div className="space-y-2 px-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2">Source Relevance Factors</span>
                            <div className="bg-muted/30 p-4 rounded-lg border border-border/50 text-sm whitespace-pre-wrap text-foreground italic">
                              {type.source_relevance_factors}
                            </div>
                          </div>
                        )}

                        <div className="px-1">
                          <div className="bg-muted/30 px-3 py-2 rounded-md border border-border/50 w-fit">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Date Limit</span>
                            <span className="text-xs text-foreground">
                              {type.date_limit_start_days_ago !== null && type.date_limit_start_days_ago !== undefined ? (
                                <>
                                  <strong>{type.date_limit_start_days_ago}d</strong> ago to <strong>{type.date_limit_end_days_ago || 0}d</strong> ago
                                </>
                              ) : (
                                <span className="text-muted-foreground italic">No strict limit (prioritize recent)</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-tight">
                    <span>Created: {new Date(type.created_at).toLocaleDateString()}</span>
                    <span>Updated: {new Date(type.updated_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            )
          ))
        )}
      </div>
    </div>
  );
}
