'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DocumentType {
  id: string;
  name: string;
  transformation_instructions: string;
  description?: string;
}

export default function DocumentTypesPanel() {
  const [types, setTypes] = useState<DocumentType[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    transformation_instructions: '',
    description: ''
  });

  const fetchTypes = async () => {
    const { data, error } = await supabase
      .from('document_types')
      .select('*')
      .order('name');
    
    if (data) setTypes(data);
    if (error) console.error('Error fetching types:', error);
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleCreate = async () => {
    if (!formData.name || !formData.transformation_instructions) return;

    const { error } = await supabase
      .from('document_types')
      .insert([formData]);

    if (!error) {
      setFormData({ name: '', transformation_instructions: '', description: '' });
      setIsCreating(false);
      fetchTypes();
    } else {
      console.error('Error creating type:', error);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.name || !formData.transformation_instructions) return;

    const { error } = await supabase
      .from('document_types')
      .update(formData)
      .eq('id', id);

    if (!error) {
      setEditingId(null);
      setFormData({ name: '', transformation_instructions: '', description: '' });
      fetchTypes();
    } else {
      console.error('Error updating type:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document type? This will also delete all associated documents.')) return;

    const { error } = await supabase
      .from('document_types')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchTypes();
    } else {
      console.error('Error deleting type:', error);
    }
  };

  const startEditing = (type: DocumentType) => {
    setEditingId(type.id);
    setFormData({
      name: type.name,
      transformation_instructions: type.transformation_instructions,
      description: type.description || ''
    });
    setIsCreating(false);
  };

  const cancelAction = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ name: '', transformation_instructions: '', description: '' });
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Transformation Instructions</label>
              <Textarea
                placeholder="Tell the AI exactly how to process the research..."
                rows={6}
                value={formData.transformation_instructions}
                onChange={(e) => setFormData({ ...formData, transformation_instructions: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-2">
              {editingId ? (
                <Button onClick={() => handleUpdate(editingId)}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              ) : (
                <Button onClick={handleCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Type
                </Button>
              )}
              <Button variant="outline" onClick={cancelAction}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {types.map((type) => (
          editingId !== type.id && (
            <Card key={type.id} className="border border-border">
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle className="text-lg">{type.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => startEditing(type)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive"
                      onClick={() => handleDelete(type.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {type.description && <p className="text-sm text-muted-foreground mb-3">{type.description}</p>}
                <div className="bg-muted p-6 rounded-lg border border-border text-sm leading-relaxed whitespace-pre-wrap text-foreground max-h-60">
                  {type.transformation_instructions}
                </div>
              </CardContent>
            </Card>
          )
        ))}
      </div>
    </div>
  );
}
