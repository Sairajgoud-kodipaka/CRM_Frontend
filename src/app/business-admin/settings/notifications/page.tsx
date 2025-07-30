'use client';

import { useState, useEffect } from 'react';

interface NotificationTemplate {
  id: number;
  name: string;
  type: 'whatsapp' | 'sms' | 'email';
  subject?: string;
  content: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function SettingsNotifications() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [form, setForm] = useState({
    name: '',
    type: 'whatsapp' as 'whatsapp' | 'sms' | 'email',
    subject: '',
    content: '',
    is_active: true
  });

  // Mock data for demonstration
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTemplates([
        {
          id: 1,
          name: 'Welcome Message',
          type: 'whatsapp',
          content: 'Welcome to {{business_name}}! Thank you for choosing us. Your customer ID is {{customer_id}}. We\'re here to serve you with the finest jewelry.',
          variables: ['business_name', 'customer_id'],
          is_active: true,
          created_at: '2024-01-15',
          updated_at: '2024-01-15'
        },
        {
          id: 2,
          name: 'Appointment Reminder',
          type: 'whatsapp',
          content: 'Hi {{customer_name}}, this is a reminder for your appointment at {{business_name}} on {{appointment_date}} at {{appointment_time}}. Please confirm your attendance.',
          variables: ['customer_name', 'business_name', 'appointment_date', 'appointment_time'],
          is_active: true,
          created_at: '2024-01-10',
          updated_at: '2024-01-10'
        },
        {
          id: 3,
          name: 'Order Confirmation',
          type: 'email',
          subject: 'Order Confirmation - {{order_id}}',
          content: 'Dear {{customer_name}},\n\nThank you for your order! Your order #{{order_id}} has been confirmed.\n\nOrder Details:\n- Total Amount: {{order_amount}}\n- Delivery Date: {{delivery_date}}\n\nWe\'ll keep you updated on your order status.\n\nBest regards,\n{{business_name}} Team',
          variables: ['customer_name', 'order_id', 'order_amount', 'delivery_date', 'business_name'],
          is_active: true,
          created_at: '2024-01-05',
          updated_at: '2024-01-05'
        },
        {
          id: 4,
          name: 'SMS Verification',
          type: 'sms',
          content: 'Your verification code is {{verification_code}}. Valid for 10 minutes. {{business_name}}',
          variables: ['verification_code', 'business_name'],
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: 5,
          name: 'Promotional Offer',
          type: 'whatsapp',
          content: '🎉 Special Offer Alert! 🎉\n\n{{customer_name}}, enjoy {{discount_percentage}}% off on {{product_category}} this week!\n\nUse code: {{promo_code}}\nValid until: {{valid_until}}\n\nVisit {{business_name}} today!',
          variables: ['customer_name', 'discount_percentage', 'product_category', 'promo_code', 'valid_until', 'business_name'],
          is_active: false,
          created_at: '2024-01-20',
          updated_at: '2024-01-20'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredTemplates = templates.filter(template => template.type === activeTab);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      // Update existing template
      setTemplates(templates.map(template => 
        template.id === editingTemplate.id 
          ? { ...template, ...form, updated_at: new Date().toISOString().split('T')[0] }
          : template
      ));
    } else {
      // Create new template
      const newTemplate: NotificationTemplate = {
        id: Date.now(),
        ...form,
        variables: extractVariables(form.content),
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0]
      };
      setTemplates([...templates, newTemplate]);
    }
    setShowModal(false);
    setEditingTemplate(null);
    setForm({ name: '', type: 'whatsapp', subject: '', content: '', is_active: true });
  };

  const extractVariables = (content: string): string[] => {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;
    while ((match = variableRegex.exec(content)) !== null) {
      variables.push(match[1]);
    }
    return [...new Set(variables)]; // Remove duplicates
  };

  const editTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setForm({
      name: template.name,
      type: template.type,
      subject: template.subject || '',
      content: template.content,
      is_active: template.is_active
    });
    setShowModal(true);
  };

  const deleteTemplate = (templateId: number) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(template => template.id !== templateId));
    }
  };

  const toggleTemplateStatus = (templateId: number) => {
    setTemplates(templates.map(template => 
      template.id === templateId 
        ? { ...template, is_active: !template.is_active, updated_at: new Date().toISOString().split('T')[0] }
        : template
    ));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'whatsapp':
        return '💬';
      case 'sms':
        return '📱';
      case 'email':
        return '📧';
      default:
        return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'whatsapp':
        return 'bg-green-100 text-green-800';
      case 'sms':
        return 'bg-blue-100 text-blue-800';
      case 'email':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Notification Templates</h2>
        <p className="mb-4 text-gray-700">
          Set up WhatsApp, SMS, and email templates for business events and campaigns.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{templates.length}</div>
          <div className="text-sm text-gray-600">Total Templates</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {templates.filter(t => t.is_active).length}
          </div>
          <div className="text-sm text-gray-600">Active Templates</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {templates.filter(t => t.type === 'whatsapp').length}
          </div>
          <div className="text-sm text-gray-600">WhatsApp Templates</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">
            {templates.filter(t => t.type === 'email').length}
          </div>
          <div className="text-sm text-gray-600">Email Templates</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'whatsapp'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              💬 WhatsApp ({templates.filter(t => t.type === 'whatsapp').length})
            </button>
            <button
              onClick={() => setActiveTab('sms')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sms'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📱 SMS ({templates.filter(t => t.type === 'sms').length})
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'email'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📧 Email ({templates.filter(t => t.type === 'email').length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Templates
            </h3>
            <button
              onClick={() => {
                setForm({ name: '', type: activeTab, subject: '', content: '', is_active: true });
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create Template
            </button>
          </div>

          <div className="space-y-4">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No {activeTab} templates found. Create your first template!
              </div>
            ) : (
              filteredTemplates.map(template => (
                <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getTypeIcon(template.type)}</span>
                      <div>
                        <h4 className="font-semibold">{template.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(template.type)}`}>
                            {template.type.toUpperCase()}
                          </span>
                          <span>Updated: {template.updated_at}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleTemplateStatus(template.id)}
                        className={`px-3 py-1 rounded text-sm ${
                          template.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {template.is_active ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => editTemplate(template)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {template.subject && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-700">Subject:</span>
                      <span className="text-sm text-gray-600 ml-2">{template.subject}</span>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Content:</span>
                    <div className="mt-1 p-3 bg-gray-50 rounded text-sm text-gray-700 whitespace-pre-wrap">
                      {template.content}
                    </div>
                  </div>
                  
                  {template.variables.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Variables:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {template.variables.map(variable => (
                          <span
                            key={variable}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                          >
                            {variable}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Template Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingTemplate(null);
                  setForm({ name: '', type: 'whatsapp', subject: '', content: '', is_active: true });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    required
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as 'whatsapp' | 'sms' | 'email' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="sms">SMS</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>

              {form.type === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Order Confirmation - {{order_id}}"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <textarea
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Enter your ${form.type} template content here...\n\nUse variables like {{customer_name}}, {{order_id}}, etc.`}
                />
                <div className="mt-2 text-sm text-gray-500">
                  <p>Available variables: {'{customer_name}'}, {'{business_name}'}, {'{order_id}'}, {'{order_amount}'}, {'{appointment_date}'}, {'{verification_code}'}, etc.</p>
                  <p className="mt-1">Detected variables: {extractVariables(form.content).join(', ') || 'None'}</p>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Active template
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTemplate(null);
                    setForm({ name: '', type: 'whatsapp', subject: '', content: '', is_active: true });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 