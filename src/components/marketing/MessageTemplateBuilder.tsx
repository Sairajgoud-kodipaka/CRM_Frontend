'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Save, 
  Eye, 
  Edit, 
  Trash2, 
  Copy,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';

interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
  type: 'whatsapp' | 'email' | 'sms';
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

export default function MessageTemplateBuilder() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    category: '',
    type: 'whatsapp' as 'whatsapp' | 'email' | 'sms',
    variables: [] as string[]
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/marketing/templates/');
      setTemplates(response.data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Mock data
      setTemplates([
        {
          id: '1',
          name: 'Diwali Collection',
          content: '🎉 Diwali Special Collection is here! Get up to 50% off on exclusive jewelry pieces.',
          category: 'Promotional',
          type: 'whatsapp',
          status: 'approved',
          variables: ['customer_name', 'discount_percentage'],
          createdAt: '2024-10-15T10:00:00Z',
          updatedAt: '2024-10-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'Birthday Wishes',
          content: 'Happy Birthday {{customer_name}}! 🎂 Enjoy 20% off on your birthday purchase.',
          category: 'Personal',
          type: 'sms',
          status: 'approved',
          variables: ['customer_name', 'discount_percentage'],
          createdAt: '2024-10-14T09:00:00Z',
          updatedAt: '2024-10-14T09:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'whatsapp': return '💬';
      case 'email': return '📧';
      case 'sms': return '📱';
      default: return '📊';
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const response = await api.post('/marketing/templates/', newTemplate);
      setTemplates(prev => [...prev, response.data]);
      setShowCreateForm(false);
      setNewTemplate({ name: '', content: '', category: '', type: 'whatsapp', variables: [] });
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;
    try {
      const response = await api.put(`/marketing/templates/${editingTemplate.id}/`, editingTemplate);
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? response.data : t));
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await api.delete(`/marketing/templates/${templateId}/`);
        setTemplates(prev => prev.filter(t => t.id !== templateId));
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const addVariable = (variable: string) => {
    if (!newTemplate.variables.includes(variable)) {
      setNewTemplate(prev => ({ ...prev, variables: [...prev.variables, variable] }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Message Template Builder</h2>
          <p className="text-gray-600">Create and manage message templates</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Create Template Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Template Name</label>
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Input
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Promotional, Personal"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <Select value={newTemplate.type} onValueChange={(value: any) => setNewTemplate(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message Content</label>
              <Textarea
                value={newTemplate.content}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter your message content. Use {{variable_name}} for dynamic content."
                rows={6}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => addVariable('customer_name')}>
                  Add {'{{customer_name}}'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => addVariable('discount_percentage')}>
                  Add {'{{discount_percentage}}'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => addVariable('appointment_link')}>
                  Add {'{{appointment_link}}'}
                </Button>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate} disabled={!newTemplate.name || !newTemplate.content}>
                <Save className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Template Form */}
      {editingTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Template Name</label>
                <Input
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Input
                  value={editingTemplate.category}
                  onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, category: e.target.value } : null)}
                  placeholder="e.g., Promotional, Personal"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message Content</label>
              <Textarea
                value={editingTemplate.content}
                onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, content: e.target.value } : null)}
                placeholder="Enter your message content"
                rows={6}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTemplate}>
                <Save className="w-4 h-4 mr-2" />
                Update Template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates List */}
      <div className="space-y-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-2xl">{getTypeIcon(template.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium">{template.name}</h3>
                      <Badge className={getStatusColor(template.status)}>
                        {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                      </Badge>
                      <Badge variant="outline">
                        {template.category}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {template.type}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{template.content}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.variables.map((variable) => (
                        <Badge key={variable} variant="secondary" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                    </div>

                    <div className="text-sm text-gray-500">
                      Created: {new Date(template.createdAt).toLocaleDateString()}
                      {template.updatedAt !== template.createdAt && (
                        <span> • Updated: {new Date(template.updatedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditingTemplate(template)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-1" />
                    Duplicate
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <Plus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No templates found</h3>
              <p className="mb-4">Create your first message template to get started</p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 