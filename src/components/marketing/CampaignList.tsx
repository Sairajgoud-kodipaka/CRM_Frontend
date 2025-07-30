'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  Calendar,
  Users,
  Target,
  BarChart3
} from 'lucide-react';
import api from '@/lib/api';

interface Campaign {
  id: string;
  name: string;
  type: 'whatsapp' | 'email' | 'social' | 'sms';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  targetAudience: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  conversions: number;
  revenue: number;
  scheduledAt?: string;
  createdAt: string;
  segments: string[];
  description: string;
}

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await api.get('/marketing/campaigns/');
      setCampaigns(response.data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      // Mock data for development
      setCampaigns([
        {
          id: '1',
          name: 'Diwali Collection Launch',
          type: 'whatsapp',
          status: 'active',
          targetAudience: 2000,
          sent: 1850,
          delivered: 1780,
          opened: 1450,
          clicked: 89,
          conversions: 23,
          revenue: 125000,
          createdAt: '2024-10-15T10:00:00Z',
          segments: ['High-Value Customers', 'Wedding Buyers'],
          description: 'Launch campaign for Diwali jewelry collection'
        },
        {
          id: '2',
          name: 'Wedding Season Email',
          type: 'email',
          status: 'scheduled',
          targetAudience: 1500,
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          conversions: 0,
          revenue: 0,
          scheduledAt: '2024-10-20T10:00:00Z',
          createdAt: '2024-10-15T14:00:00Z',
          segments: ['Wedding Buyers', 'Gifting Prospects'],
          description: 'Email campaign for wedding season promotions'
        },
        {
          id: '3',
          name: 'Birthday SMS Campaign',
          type: 'sms',
          status: 'completed',
          targetAudience: 500,
          sent: 500,
          delivered: 485,
          opened: 420,
          clicked: 45,
          conversions: 12,
          revenue: 75000,
          createdAt: '2024-10-14T09:00:00Z',
          segments: ['Birthday This Week'],
          description: 'SMS campaign for birthday offers'
        },
        {
          id: '4',
          name: 'Social Media Promo',
          type: 'social',
          status: 'draft',
          targetAudience: 3000,
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          conversions: 0,
          revenue: 0,
          createdAt: '2024-10-15T16:00:00Z',
          segments: ['All Customers'],
          description: 'Social media promotion campaign'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(search.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || campaign.type === filterType;
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'whatsapp': return '💬';
      case 'email': return '📧';
      case 'social': return '📱';
      case 'sms': return '📱';
      default: return '📊';
    }
  };

  const handleStatusChange = async (campaignId: string, newStatus: string) => {
    try {
      await api.patch(`/marketing/campaigns/${campaignId}/`, { status: newStatus });
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId ? { ...campaign, status: newStatus as any } : campaign
      ));
    } catch (error) {
      console.error('Error updating campaign status:', error);
    }
  };

  const handleDelete = async (campaignId: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        await api.delete(`/marketing/campaigns/${campaignId}/`);
        setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
      } catch (error) {
        console.error('Error deleting campaign:', error);
      }
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
          <h2 className="text-2xl font-bold text-gray-900">Campaigns</h2>
          <p className="text-gray-600">Manage your marketing campaigns</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search campaigns..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Campaign type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <div className="space-y-4">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-2xl">{getTypeIcon(campaign.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium">{campaign.name}</h3>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {campaign.type}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{campaign.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Target</p>
                        <p className="font-medium">{campaign.targetAudience.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Sent</p>
                        <p className="font-medium">{campaign.sent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Delivered</p>
                        <p className="font-medium">{campaign.delivered.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Opened</p>
                        <p className="font-medium">{campaign.opened.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Conversions</p>
                        <p className="font-medium">{campaign.conversions}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Revenue</p>
                        <p className="font-medium">₹{(campaign.revenue / 1000).toFixed(0)}K</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1">
                      {campaign.segments.map((segment) => (
                        <Badge key={segment} variant="outline" className="text-xs">
                          {segment}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-3 text-sm text-gray-500">
                      Created: {new Date(campaign.createdAt).toLocaleDateString()}
                      {campaign.scheduledAt && (
                        <span> • Scheduled: {new Date(campaign.scheduledAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Analytics
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  
                  {campaign.status === 'active' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatusChange(campaign.id, 'paused')}
                    >
                      <Pause className="w-4 h-4 mr-1" />
                      Pause
                    </Button>
                  )}
                  
                  {campaign.status === 'paused' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatusChange(campaign.id, 'active')}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Resume
                    </Button>
                  )}
                  
                  {campaign.status === 'draft' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatusChange(campaign.id, 'active')}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Launch
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(campaign.id)}
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

      {filteredCampaigns.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No campaigns found</h3>
              <p className="mb-4">Try adjusting your search or filter criteria</p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Campaign
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 