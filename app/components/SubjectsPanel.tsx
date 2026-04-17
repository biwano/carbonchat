'use client';

import { useState } from 'react';
import { useQuery, useInsertMutation, useUpdateMutation, useDeleteMutation } from '@supabase-cache-helpers/postgrest-react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Plus, Edit, Trash2, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Subject } from '@/lib/supabase.types';
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
import { Skeleton } from "@/components/ui/skeleton";

function SubjectSkeleton() {
  return (
    <Card className="border border-border flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-1">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <Skeleton className="h-24 w-full" />
        <div className="mt-4">
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function SubjectsPanel() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    content: ''
  });

  // Queries using Supabase Cache Helpers
  const { data: subjects, isLoading, isFetching, refetch } = useQuery(
    supabase
      .from('subjects')
      .select('*')
      .order('name')
  );

  // Mutations using Supabase Cache Helpers
  const { mutate: create, isPending: isCreatingPending } = useInsertMutation(
    supabase.from('subjects'),
    ['id'],
    null,
    {
      onSuccess: () => {
        setIsDialogOpen(false);
      },
    }
  );

  const { mutate: update, isPending: isUpdatingPending } = useUpdateMutation(
    supabase.from('subjects'),
    ['id'],
    null,
    {
      onSuccess: () => {
        setIsDialogOpen(false);
      },
    }
  );

  const { mutate: deleteSubject, isPending: isDeletingPending, variables: deletingVariables } = useDeleteMutation(
    supabase.from('subjects'),
    ['id'],
    null
  );

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subject? Documents using it will be unlinked.')) return;
    deleteSubject({ id });
  };

  const handleOpenCreateDialog = () => {
    setEditingSubject(null);
    setFormData({
      name: '',
      content: ''
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      content: subject.content
    });
    setIsDialogOpen(true);
  };

  const handleSaveSubject = () => {
    if (!formData.name || !formData.content) {
      alert('Please fill in all fields.');
      return;
    }

    if (editingSubject) {
      update({
        id: editingSubject.id,
        name: formData.name,
        content: formData.content
      });
    } else {
      create([{
        name: formData.name,
        content: formData.content
      }]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Subjects</h2>
          <p className="text-muted-foreground">Topics and sources for AI research</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => refetch()} 
            disabled={isLoading || isFetching} 
            variant="outline" 
            className="border-border hover:bg-muted"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            New Subject
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <SubjectSkeleton />
            <SubjectSkeleton />
            <SubjectSkeleton />
          </>
        ) : !subjects || subjects.length === 0 ? (
          <Card className="p-12 text-center border border-border col-span-full">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-foreground">No subjects yet.</p>
            <p className="text-sm text-muted-foreground mt-3">Create a subject to start building your knowledge base.</p>
          </Card>
        ) : (
          subjects.map((subject) => (
            <Card key={subject.id} className="border border-border flex flex-col">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">{subject.name}</CardTitle>
                <div className="flex gap-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => handleOpenEditDialog(subject)}
                    disabled={isDeletingPending}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-destructive" 
                    onClick={() => handleDelete(subject.id)}
                    disabled={isDeletingPending}
                  >
                    {isDeletingPending && deletingVariables?.id === subject.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-sm text-muted-foreground line-clamp-4 bg-muted/50 p-3 rounded border border-border/50 italic">
                  &quot;{subject.content}&quot;
                </div>
                <div className="mt-4 text-[10px] text-muted-foreground">
                  Created: {new Date(subject.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{editingSubject ? 'Edit Subject' : 'New Subject'}</DialogTitle>
            <DialogDescription>
              Define the content that the AI should use as a source or topic for research.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Subject Name</Label>
              <Input
                id="name"
                placeholder="e.g. Next.js 15, Global Warming, etc."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isCreatingPending || isUpdatingPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Subject Content / Description</Label>
              <Textarea
                id="content"
                placeholder="Describe the subject in detail. This content will be used by the AI to understand what to research."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="min-h-[200px]"
                disabled={isCreatingPending || isUpdatingPending}
              />
              <p className="text-xs text-muted-foreground">
                This content tells the AI **what** to talk about. The Document Type tells it **how** to talk about it.
              </p>
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-border">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCreatingPending || isUpdatingPending}>Cancel</Button>
            <Button onClick={handleSaveSubject} disabled={isCreatingPending || isUpdatingPending}>
              {isCreatingPending || isUpdatingPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {editingSubject ? 'Save Changes' : 'Create Subject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
