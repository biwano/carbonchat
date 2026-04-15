'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit } from 'lucide-react';

interface DocumentType {
  id: string;
  name: string;
  transformation_instructions: string;
  description?: string;
}

export default function DocumentTypesPanel() {
  const [types, setTypes] = useState<DocumentType[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newType, setNewType] = useState({
    name: '',
    transformation_instructions: '',
    description: ''
  });

  const fetchTypes = async () => {
    const res = await fetch('/api/document-types');
    const data = await res.json();
    setTypes(data);
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const createType = async () => {
    if (!newType.name || !newType.transformation_instructions) return;

    await fetch('/api/document-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newType),
    });

    setNewType({ name: '', transformation_instructions: '', description: '' });
    setIsCreating(false);
    fetchTypes();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Document Types</h2>
          <p className="text-muted-foreground">Define how AI should transform research into knowledge</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Type
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Document Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Name (e.g. Technical Documentation)"
              value={newType.name}
              onChange={(e) => setNewType({ ...newType, name: e.target.value })}
            />
            <Input
              placeholder="Short description"
              value={newType.description}
              onChange={(e) => setNewType({ ...newType, description: e.target.value })}
            />
            <Textarea
              placeholder="Transformation instructions - tell the AI exactly how to process the research..."
              rows={6}
              value={newType.transformation_instructions}
              onChange={(e) => setNewType({ ...newType, transformation_instructions: e.target.value })}
            />
            <div className="flex gap-3">
              <Button onClick={createType}>Create Type</Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {types.map((type) => (
          <Card key={type.id} className="border border-border">
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle className="text-lg">{type.name}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {type.description && <p className="text-sm text-muted-foreground mb-3">{type.description}</p>}
              <div className="bg-muted p-4 rounded-lg text-sm font-mono text-foreground border border-border">
                {type.transformation_instructions}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
