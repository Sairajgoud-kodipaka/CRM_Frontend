'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MousePointer, 
  Users, 
  DollarSign,
  Calendar,
  Target,
  BarChart3
} from 'lucide-react';
import api from '@/lib/api';

interface CampaignMetric {
  id: string;
  name: string;
  type: 'whatsapp' | 'email' | 'social' | 'sms';
  status: 'active' | 'paused' | 'completed' | 'draft';
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  cost: number;
  startDate: string;
  endDate: string;
  targetAudience: number;
  conversionRate: number;
  ctr: number;
  roi: number;
}

export default function CampaignMetrics() {
  const [campaigns, setCampaigns] = useState<CampaignMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchCampaignMetrics();
  }, [filter, timeRange]);

  const fetchCampaignMetrics = async () => {
    try {
      const response = await api.get(`/marketing/campaigns/metrics/?filter=${filter}&time_range=${timeRange}`);
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaign metrics:', error);
      // Mock data for development
      setCampaigns([
        {
          id: '1',
          name: 'Diwali Collection 2024',
          type: 'whatsapp',
          status: 'active',
          impressions: 12500,
          clicks: 890,
          conversions: 156,
          revenue: 450000,
          cost: 25000,
          startDate: '2024-10-15',
          endDate: '2024-11-15',
          targetAudience: 20000,
          conversionRate: 1.25,
          ctr: 7.12,
          roi: 18.0
        },
        {
          id: '2',
          name: 'Wedding Season Special',
          type: 'email',
          status: 'active',
          impressions: 8900,
          clicks: 567,
          conversions: 89,
          revenue: 320000,
          cost: 15000,
          startDate: '2024-10-01',
          endDate: '2024-12-31',
          targetAudience: 15000,
          conversionRate: 1.0,
          ctr: 6.37,
          roi: 21.33
        },
        {
          id: '3',
          name: 'Birthday Offers Campaign',
          type: 'sms',
          status: 'completed',
          impressions: 5600,
          clicks: 234,
          conversions: 45,
          revenue: 180000,
          cost: 8000,
          startDate: '2024-09-01',
          endDate: '2024-10-01',
          targetAudience: 8000,
          conversionRate: 0.8,
          ctr: 4.18,
          roi: 22.5
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
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

  const totalMetrics = campaigns.reduce((acc, campaign) => ({
    impressions: acc.impressions + campaign.impressions,
    clicks: acc.clicks + campaign.clicks,
    conversions: acc.conversions + campaign.conversions,
    revenue: acc.revenue + campaign.revenue,
    cost: acc.cost + campaign.cost
  }), { impressions: 0, clicks: 0, conversions: 0, revenue: 0, cost: 0 });

  const overallROI = totalMetrics.cost > 0 ? (totalMetrics.revenue - totalMetrics.cost) / totalMetrics.cost * 100 : 0;
  const overallCTR = totalMetrics.impressions > 0 ? (totalMetrics.clicks / totalMetrics.impressions) * 100 : 0;
  const overallConversionRate = totalMetrics.clicks > 0 ? (totalMetrics.conversions / totalMetrics.clicks) * 100 : 0;

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
          <h2 className="text-2xl font-bold text-gray-900">Campaign Metrics</h2>
          <p className="text-gray-600">Detailed performance analysis of your marketing campaigns</p>
        </div>
        <div className="flex space-x-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.impressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across {campaigns.length} campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallCTR.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              {totalMetrics.clicks.toLocaleString()} total clicks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallConversionRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              {totalMetrics.conversions.toLocaleString()} conversions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall ROI</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallROI.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              ₹{(totalMetrics.revenue / 100000).toFixed(1)}L revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign List */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getTypeIcon(campaign.type)}</span>
                    <div>
                      <h3 className="font-medium">{campaign.name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Impressions</p>
                    <p className="font-medium">{campaign.impressions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">CTR</p>
                    <p className="font-medium">{campaign.ctr.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Conversions</p>
                    <p className="font-medium">{campaign.conversions}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Conv. Rate</p>
                    <p className="font-medium">{campaign.conversionRate.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Revenue</p>
                    <p className="font-medium">₹{(campaign.revenue / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-gray-500">ROI</p>
                    <p className="font-medium">{campaign.roi.toFixed(1)}x</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{Math.round((campaign.impressions / campaign.targetAudience) * 100)}%</span>
                  </div>
                  <Progress value={(campaign.impressions / campaign.targetAudience) * 100} className="w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 