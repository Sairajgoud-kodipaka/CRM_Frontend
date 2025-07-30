'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Users, 
  Target, 
  MessageSquare, 
  Calendar,
  Save,
  Send,
  Eye,
  Settings,
  Image,
  Link
} from 'lucide-react';
import api from '@/lib/api';

interface Segment {
  id: string;
  name: string;
  count: number;
  category: string;
}

interface CampaignTemplate {
  id: string;
  name: string;
  type: 'whatsapp' | 'email' | 'social' | 'sms';
  content: string;
  variables: string[];
}

export default function CampaignBuilder() {
  const [campaign, setCampaign] = useState({
    name: '',
    type: 'whatsapp' as 'whatsapp' | 'email' | 'social' | 'sms',
    description: '',
    content: '',
    selectedSegments: [] as string[],
    schedule: {
      type: 'immediate' as 'immediate' | 'scheduled' | 'recurring',
      date: '',
      time: '',
      timezone: 'Asia/Kolkata'
    },
    settings: {
      trackOpens: true,
      trackClicks: true,
      trackConversions: true,
      allowUnsubscribe: true
    }
  });

  const [segments, setSegments] = useState<Segment[]>([]);
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    fetchSegments();
    fetchTemplates();
  }, []);

  const fetchSegments = async () => {
    try {
      const response = await api.get('/marketing/segments/');
      setSegments(response.data.segments || []);
    } catch (error) {
      console.error('Error fetching segments:', error);
      setSegments([]);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/marketing/templates/');
      setTemplates(response.data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates([]);
    }
  };

  const handleSegmentToggle = (segmentId: string) => {
    setCampaign(prev => ({
      ...prev,
      selectedSegments: prev.selectedSegments.includes(segmentId)
        ? prev.selectedSegments.filter(id => id !== segmentId)
        : [...prev.selectedSegments, segmentId]
    }));
  };

  const handleTemplateSelect = (template: CampaignTemplate) => {
    setCampaign(prev => ({
      ...prev,
      type: template.type,
      content: template.content
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.post('/marketing/campaigns/', campaign);
      console.log('Campaign saved:', response.data);
      // Handle success
    } catch (error) {
      console.error('Error saving campaign:', error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    setLoading(true);
    try {
      const response = await api.post('/marketing/campaigns/send/', campaign);
      console.log('Campaign sent:', response.data);
      // Handle success
    } catch (error) {
      console.error('Error sending campaign:', error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const totalAudience = campaign.selectedSegments.reduce((total, segmentId) => {
    const segment = segments.find(s => s.id === segmentId);
    return total + (segment?.count || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Builder</h2>
          <p className="text-gray-600">Create and configure your marketing campaigns</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handleSend} disabled={loading || totalAudience === 0}>
            <Send className="w-4 h-4 mr-2" />
            Send Campaign
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center space-x-4 mb-6">
        {[1, 2, 3, 4].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {stepNumber}
            </div>
            {stepNumber < 4 && (
              <div className={`w-16 h-1 mx-2 ${step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Campaign Details */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={campaign.name}
                    onChange={(e) => setCampaign(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter campaign name"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Campaign Type</Label>
                  <Select value={campaign.type} onValueChange={(value: any) => setCampaign(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={campaign.description}
                    onChange={(e) => setCampaign(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your campaign"
                    rows={3}
                  />
                </div>
                <Button onClick={() => setStep(2)} disabled={!campaign.name}>
                  Next: Audience
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Audience Selection */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Target Audience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {segments.map((segment) => (
                    <div key={segment.id} className="border rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={campaign.selectedSegments.includes(segment.id)}
                          onCheckedChange={() => handleSegmentToggle(segment.id)}
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{segment.name}</h3>
                          <p className="text-sm text-gray-500">{segment.category}</p>
                          <p className="text-sm text-gray-600">{segment.count} customers</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} disabled={campaign.selectedSegments.length === 0}>
                    Next: Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Content */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Campaign Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Templates */}
                <div>
                  <Label>Templates</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {templates.filter(t => t.type === campaign.type).map((template) => (
                      <div key={template.id} className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50" onClick={() => handleTemplateSelect(template)}>
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{template.content.substring(0, 100)}...</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="content">Message Content</Label>
                  <Textarea
                    id="content"
                    value={campaign.content}
                    onChange={(e) => setCampaign(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter your message content"
                    rows={6}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Available variables: {'{customer_name}'}, {'{discount_percentage}'}, {'{appointment_link}'}
                  </p>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button onClick={() => setStep(4)} disabled={!campaign.content}>
                    Next: Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Schedule */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Schedule & Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Send Schedule</Label>
                  <Select value={campaign.schedule.type} onValueChange={(value: any) => setCampaign(prev => ({ 
                    ...prev, 
                    schedule: { ...prev.schedule, type: value }
                  }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Send Immediately</SelectItem>
                      <SelectItem value="scheduled">Schedule for Later</SelectItem>
                      <SelectItem value="recurring">Recurring Campaign</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {campaign.schedule.type !== 'immediate' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={campaign.schedule.date}
                        onChange={(e) => setCampaign(prev => ({ 
                          ...prev, 
                          schedule: { ...prev.schedule, date: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={campaign.schedule.time}
                        onChange={(e) => setCampaign(prev => ({ 
                          ...prev, 
                          schedule: { ...prev.schedule, time: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <Label>Campaign Settings</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={campaign.settings.trackOpens}
                        onCheckedChange={(checked) => setCampaign(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings, trackOpens: checked as boolean }
                        }))}
                      />
                      <Label>Track Opens</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={campaign.settings.trackClicks}
                        onCheckedChange={(checked) => setCampaign(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings, trackClicks: checked as boolean }
                        }))}
                      />
                      <Label>Track Clicks</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={campaign.settings.allowUnsubscribe}
                        onCheckedChange={(checked) => setCampaign(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings, allowUnsubscribe: checked as boolean }
                        }))}
                      />
                      <Label>Allow Unsubscribe</Label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(3)}>
                    Back
                  </Button>
                  <Button onClick={handleSend} disabled={loading}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Campaign
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Campaign Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-gray-500">Campaign Name</Label>
                <p className="font-medium">{campaign.name || 'Not set'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Type</Label>
                <Badge variant="outline" className="capitalize">{campaign.type}</Badge>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Target Audience</Label>
                <p className="font-medium">{totalAudience} customers</p>
                <p className="text-sm text-gray-500">{campaign.selectedSegments.length} segments selected</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Schedule</Label>
                <p className="font-medium capitalize">{campaign.schedule.type}</p>
                {campaign.schedule.type === 'scheduled' && campaign.schedule.date && (
                  <p className="text-sm text-gray-500">
                    {new Date(campaign.schedule.date).toLocaleDateString()} at {campaign.schedule.time}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selected Segments */}
          {campaign.selectedSegments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {campaign.selectedSegments.map((segmentId) => {
                    const segment = segments.find(s => s.id === segmentId);
                    return segment ? (
                      <div key={segmentId} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium text-sm">{segment.name}</p>
                          <p className="text-xs text-gray-500">{segment.count} customers</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSegmentToggle(segmentId)}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : null;
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 