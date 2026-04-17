'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Plus, Edit, Trash2, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
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

interface Subject {
  id: string;
  name: string;
  content: string;
  created_at: string;
}

export default function SubjectsPanel() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    content: ''
  });

  const fetchSubjects = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name');
    
    if (data) setSubjects(data);
    if (error) console.error('Error fetching subjects:', error);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subject? Documents using it will be unlinked.')) return;

    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchSubjects();
    } else {
      console.error('Error deleting subject:', error);
      alert('Failed to delete subject.');
    }
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

  const handleSaveSubject = async () => {
    if (!formData.name || !formData.content) {
      alert('Please fill in all fields.');
      return;
    }

    if (editingSubject) {
      const { error } = await supabase
        .from('subjects')
        .update({
          name: formData.name,
          content: formData.content
        })
        .eq('id', editingSubject.id);

      if (error) {
        console.error('Error updating subject:', error);
        alert('Failed to update subject.');
      } else {
        setIsDialogOpen(false);
        fetchSubjects();
      }
    } else {
      const { error } = await supabase
        .from('subjects')
        .insert({
          name: formData.name,
          content: formData.content
        });

      if (error) {
        console.error('Error inserting subject:', error);
        alert('Failed to create subject.');
      } else {
        setIsDialogOpen(false);
        fetchSubjects();
      }
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
          <Button onClick={fetchSubjects} disabled={isLoading} variant="outline" className="border-border hover:bg-muted">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            New Subject
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subjects.length === 0 ? (
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
                  <Button size="icon" variant="ghost" onClick={() => handleOpenEditDialog(subject)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(subject.id)}>
                    <Trash2 className="w-4 h-4" />
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
              />
              <p className="text-xs text-muted-foreground">
                This content tells the AI **what** to talk about. The Document Type tells it **how** to talk about it.
              </p>
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-border">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSubject}>
              {editingSubject ? 'Save Changes' : 'Create Subject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
