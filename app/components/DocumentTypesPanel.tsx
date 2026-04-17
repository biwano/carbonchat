'use client';

import { useState } from 'react';
import { useQuery, useInsertMutation, useUpdateMutation, useDeleteMutation } from '@supabase-cache-helpers/postgrest-react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit, Save, X, ChevronDown, Sparkles, User, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DocumentType } from '@/lib/supabase.types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import AiBadge from "./AiBadge";
import { Skeleton } from "@/components/ui/skeleton";

interface FormData {
  name: string;
  transformation_instructions: string;
  additional_sources: string;
  description: string;
  ai: boolean;
}

const EMPTY_FORM: FormData = {
  name: '',
  transformation_instructions: '',
  additional_sources: '',
  description: '',
  ai: true,
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
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  // Queries using Supabase Cache Helpers
  const { data: types, isLoading } = useQuery(
    supabase
      .from('document_types')
      .select('*')
      .order('name')
  );

  // Mutations using Supabase Cache Helpers
  const { mutate: create, isPending: isCreatingPending } = useInsertMutation(
    supabase.from('document_types'),
    ['id'],
    null,
    {
      onSuccess: () => {
        setFormData(EMPTY_FORM);
        setIsCreating(false);
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
      description: type.description || '',
      ai: type.ai
    });
    setIsCreating(false);
  };

  const cancelAction = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Document Types</h2>
          <p className="text-muted-foreground">Define how AI should transform research into knowledge</p>
        </div>
        {!isCreating && !editingId && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Type
          </Button>
        )}
      </div>

      {(isCreating || editingId) && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Document Type' : 'Create New Document Type'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="e.g. Technical Documentation"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Short description of what this type is for"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              />
            </div>
            {formData.ai && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Transformation Instructions</label>
                  <Textarea
                    placeholder="Tell the AI exactly how to process the research..."
                    rows={6}
                    value={formData.transformation_instructions}
                    onChange={(e) => setFormData({ ...formData, transformation_instructions: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Additional Sources</label>
                  <Textarea
                    placeholder="Enter URLs or names of blogs, social media accounts, etc. for the AI to research..."
                    rows={3}
                    value={formData.additional_sources}
                    onChange={(e) => setFormData({ ...formData, additional_sources: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">The AI will use these sources to supplement its research.</p>
                </div>
              </>
            )}
            <div className="flex gap-3 pt-2">
              {editingId ? (
                <Button 
                  onClick={() => handleUpdate(editingId)}
                  disabled={isUpdatingPending}
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
                  disabled={isCreatingPending}
                >
                  {isCreatingPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Create Type
                </Button>
              )}
              <Button variant="outline" onClick={cancelAction} disabled={isCreatingPending || isUpdatingPending}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                    <div className="space-y-4">
                    <Collapsible>
                      <CollapsibleTrigger
                        render={
                          <Button variant="ghost" size="sm" className="w-full flex justify-between items-center p-2 h-auto hover:bg-muted/50" />
                        }
                      >
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Transformation Instructions</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-2">
                          <div className="bg-muted p-6 rounded-lg border border-border text-sm leading-relaxed whitespace-pre-wrap text-foreground max-h-60 overflow-auto">
                            {type.transformation_instructions}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {type.additional_sources && (
                        <div className="space-y-2">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">Additional Sources</span>
                          <div className="bg-muted/30 p-4 rounded-lg border border-border/50 text-sm whitespace-pre-wrap text-foreground italic">
                            {type.additional_sources}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          ))
        )}
      </div>
    </div>
  );
}
