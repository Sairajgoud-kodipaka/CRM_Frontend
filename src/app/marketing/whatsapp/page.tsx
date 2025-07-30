'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Users, 
  Send, 
  Eye, 
  Target, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Settings,
  Download,
  BarChart3
} from 'lucide-react';
import api from '@/lib/api';

interface WhatsAppCampaign {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused';
  targetAudience: number;
  sent: number;
  delivered: number;
  read: number;
  replied: number;
  conversions: number;
  revenue: number;
  scheduledAt?: string;
  createdAt: string;
  content: string;
  segments: string[];
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  language: string;
  status: 'approved' | 'pending' | 'rejected';
}

interface ContactList {
  id: string;
  name: string;
  count: number;
  lastUpdated: string;
  source: string;
}

export default function WhatsAppCampaignManager() {
  const [campaigns, setCampaigns] = useState<WhatsAppCampaign[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('campaigns');

  useEffect(() => {
    fetchWhatsAppData();
  }, []);

  const fetchWhatsAppData = async () => {
    try {
      // Fetch WhatsApp metrics and campaigns
      const metricsResponse = await api.get('/marketing/whatsapp-metrics/');
      const campaignsResponse = await api.get('/marketing/campaign-list/');
      const templatesResponse = await api.get('/marketing/template-list/');
      
      // Filter WhatsApp campaigns
      const whatsappCampaigns = campaignsResponse.data.filter((campaign: any) => 
        campaign.campaign_type === 'whatsapp'
      );
      
      setCampaigns(whatsappCampaigns.map((campaign: any) => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        targetAudience: campaign.estimated_reach,
        sent: campaign.messages_sent,
        delivered: campaign.messages_delivered,
        read: campaign.messages_read,
        replied: campaign.replies_received,
        conversions: campaign.conversions,
        revenue: campaign.revenue_generated,
        createdAt: campaign.created_at,
        content: campaign.custom_message || '',
        segments: campaign.target_audience || []
      })));
      
      setTemplates(templatesResponse.data.filter((template: any) => 
        template.template_type === 'whatsapp'
      ).map((template: any) => ({
        id: template.id,
        name: template.name,
        content: template.message_content,
        category: template.category,
        language: 'en',
        status: template.approval_status
      })));
      
      // Mock contact lists for now
      setContactLists([
        {
          id: '1',
          name: 'High-Value Customers',
          count: 156,
          lastUpdated: '2024-10-15T10:00:00Z',
          source: 'CRM'
        },
        {
          id: '2',
          name: 'Wedding Buyers',
          count: 89,
          lastUpdated: '2024-10-14T15:30:00Z',
          source: 'CRM'
        }
      ]);
    } catch (error) {
      console.error('Error fetching WhatsApp data:', error);
      // Mock data for development
      setCampaigns([
        {
          id: '1',
          name: 'Diwali Collection Launch',
          status: 'active',
          targetAudience: 2000,
          sent: 1850,
          delivered: 1780,
          read: 1450,
          replied: 89,
          conversions: 23,
          revenue: 125000,
          createdAt: '2024-10-15T10:00:00Z',
          content: '🎉 Diwali Special Collection is here! Get up to 50% off on exclusive jewelry pieces.',
          segments: ['High-Value Customers', 'Wedding Buyers']
        },
        {
          id: '2',
          name: 'Birthday Wishes Campaign',
          status: 'completed',
          targetAudience: 500,
          sent: 500,
          delivered: 485,
          read: 420,
          replied: 45,
          conversions: 12,
          revenue: 75000,
          createdAt: '2024-10-14T09:00:00Z',
          content: 'Happy Birthday! 🎂 Enjoy 20% off on your birthday purchase.',
          segments: ['Birthday This Week']
        },
        {
          id: '3',
          name: 'Wedding Season Promo',
          status: 'scheduled',
          targetAudience: 1500,
          sent: 0,
          delivered: 0,
          read: 0,
          replied: 0,
          conversions: 0,
          revenue: 0,
          scheduledAt: '2024-10-20T10:00:00Z',
          createdAt: '2024-10-15T14:00:00Z',
          content: 'Perfect wedding jewelry collection! Book your appointment today.',
          segments: ['Wedding Buyers', 'Gifting Prospects']
        }
      ]);
      setTemplates([
        {
          id: '1',
          name: 'Diwali Collection',
          content: '🎉 Diwali Special Collection is here! Get up to 50% off on exclusive jewelry pieces.',
          category: 'Promotional',
          language: 'English',
          status: 'approved'
        },
        {
          id: '2',
          name: 'Birthday Wishes',
          content: 'Happy Birthday {{customer_name}}! 🎂 Enjoy 20% off on your birthday purchase.',
          category: 'Personal',
          language: 'English',
          status: 'approved'
        },
        {
          id: '3',
          name: 'Wedding Collection',
          content: 'Perfect wedding jewelry collection! Book your appointment today.',
          category: 'Promotional',
          language: 'English',
          status: 'pending'
        }
      ]);
      setContactLists([
        {
          id: '1',
          name: 'High-Value Customers',
          count: 156,
          lastUpdated: '2024-10-15T10:30:00Z',
          source: 'CRM Import'
        },
        {
          id: '2',
          name: 'Wedding Buyers',
          count: 89,
          lastUpdated: '2024-10-14T15:45:00Z',
          source: 'Manual Entry'
        },
        {
          id: '3',
          name: 'Birthday Contacts',
          count: 23,
          lastUpdated: '2024-10-15T08:00:00Z',
          source: 'Auto Generated'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTemplateStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalMetrics = campaigns.reduce((acc, campaign) => ({
    sent: acc.sent + campaign.sent,
    delivered: acc.delivered + campaign.delivered,
    read: acc.read + campaign.read,
    replied: acc.replied + campaign.replied,
    conversions: acc.conversions + campaign.conversions,
    revenue: acc.revenue + campaign.revenue
  }), { sent: 0, delivered: 0, read: 0, replied: 0, conversions: 0, revenue: 0 });

  const deliveryRate = (totalMetrics?.sent || 0) > 0 ? ((totalMetrics?.delivered || 0) / (totalMetrics?.sent || 0)) * 100 : 0;
  const readRate = (totalMetrics?.delivered || 0) > 0 ? ((totalMetrics?.read || 0) / (totalMetrics?.delivered || 0)) * 100 : 0;
  const replyRate = (totalMetrics?.read || 0) > 0 ? ((totalMetrics?.replied || 0) / (totalMetrics?.read || 0)) * 100 : 0;
  const conversionRate = (totalMetrics?.replied || 0) > 0 ? ((totalMetrics?.conversions || 0) / (totalMetrics?.replied || 0)) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Marketing</h1>
          <p className="text-gray-600">Manage your WhatsApp campaigns and templates</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics?.sent?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              {deliveryRate.toFixed(1)}% delivery rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Read</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics?.read?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              {readRate.toFixed(1)}% read rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Replies</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics?.replied || 0}</div>
            <p className="text-xs text-muted-foreground">
              {replyRate.toFixed(1)}% reply rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{((totalMetrics?.revenue || 0) / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">
              {conversionRate.toFixed(1)}% conversion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <TabsList value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="contacts">Contact Lists</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(campaigns || []).map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <MessageSquare className="h-5 w-5 text-green-600" />
                        <div>
                          <h3 className="font-medium">{campaign.name}</h3>
                          <p className="text-sm text-gray-500">
                            Created {new Date(campaign.createdAt).toLocaleDateString()}
                            {campaign.scheduledAt && (
                              <span> • Scheduled for {new Date(campaign.scheduledAt).toLocaleDateString()}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-500">Target</p>
                        <p className="font-medium">{campaign.targetAudience?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Sent</p>
                        <p className="font-medium">{campaign.sent?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Delivered</p>
                        <p className="font-medium">{campaign.delivered?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Read</p>
                        <p className="font-medium">{campaign.read?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Replies</p>
                        <p className="font-medium">{campaign.replied}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Revenue</p>
                        <p className="font-medium">₹{(campaign.revenue / 1000).toFixed(0)}K</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{campaign.targetAudience > 0 ? Math.round((campaign.sent / campaign.targetAudience) * 100) : 0}%</span>
                      </div>
                      <Progress value={campaign.targetAudience > 0 ? (campaign.sent / campaign.targetAudience) * 100 : 0} className="w-full" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {(campaign.segments || []).map((segment) => (
                          <Badge key={segment} variant="outline" className="text-xs">
                            {segment}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="w-4 h-4 mr-1" />
                          Analytics
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(templates || []).map((template) => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-gray-500">{template.category} • {template.language}</p>
                      </div>
                      <Badge className={getTemplateStatusColor(template.status)}>
                        {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.content}</p>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Use Template
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Lists</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(contactLists || []).map((list) => (
                  <div key={list.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{list.name}</h3>
                        <p className="text-sm text-gray-500">{list.source}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{list.count?.toLocaleString() || '0'} contacts</p>
                        <p className="text-sm text-gray-500">
                          Updated {new Date(list.lastUpdated).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Use List
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Delivery Rate</span>
                    <span className="font-medium">{deliveryRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={deliveryRate} className="w-full" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Read Rate</span>
                    <span className="font-medium">{readRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={readRate} className="w-full" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reply Rate</span>
                    <span className="font-medium">{replyRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={replyRate} className="w-full" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Conversion Rate</span>
                    <span className="font-medium">{conversionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={conversionRate} className="w-full" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Campaign completed</p>
                      <p className="text-xs text-gray-500">Diwali Collection - 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Campaign scheduled</p>
                      <p className="text-xs text-gray-500">Wedding Season Promo - 1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium">Template pending approval</p>
                      <p className="text-xs text-gray-500">Wedding Collection - 3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </TabsList>
    </div>
  );
} 