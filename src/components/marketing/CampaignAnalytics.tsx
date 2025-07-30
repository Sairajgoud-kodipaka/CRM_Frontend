'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MousePointer, 
  Target, 
  DollarSign,
  Users,
  Calendar,
  Download,
  BarChart3
} from 'lucide-react';
import api from '@/lib/api';

interface CampaignAnalytics {
  id: string;
  name: string;
  type: string;
  status: string;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    ctr: number;
    conversionRate: number;
    roi: number;
    cost: number;
  };
  timeline: Array<{
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
  demographics: Array<{
    age: string;
    count: number;
    percentage: number;
  }>;
  devices: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
  locations: Array<{
    location: string;
    count: number;
    percentage: number;
  }>;
}

export default function CampaignAnalytics({ campaignId }: { campaignId: string }) {
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/marketing/campaigns/${campaignId}/analytics/`);
        setAnalytics(response.data);
      } catch (error) {
        console.error('Error fetching campaign analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [campaignId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Analytics</h2>
          <p className="text-gray-600">{analytics.name}</p>
        </div>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.metrics.impressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total reach
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.metrics.ctr.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.metrics.clicks.toLocaleString()} clicks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.metrics.conversionRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.metrics.conversions} conversions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.metrics.roi.toFixed(1)}x</div>
            <p className="text-xs text-muted-foreground">
              ₹{(analytics.metrics.revenue / 1000).toFixed(0)}K revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>Audience Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.demographics.map((demo) => (
                <div key={demo.age} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{demo.age}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${demo.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12">{demo.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Devices */}
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.devices.map((device) => (
                <div key={device.device} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{device.device}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${device.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12">{device.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Locations */}
      <Card>
        <CardHeader>
          <CardTitle>Top Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.locations.map((location) => (
              <div key={location.location} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{location.location}</p>
                  <p className="text-sm text-gray-500">{location.count} conversions</p>
                </div>
                <Badge variant="outline">{location.percentage}%</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.timeline.map((day) => (
              <div key={day.date} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium">
                    {new Date(day.date).toLocaleDateString()}
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Impressions</p>
                      <p className="font-medium">{day.impressions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Clicks</p>
                      <p className="font-medium">{day.clicks}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Conversions</p>
                      <p className="font-medium">{day.conversions}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Revenue</p>
                      <p className="font-medium">₹{(day.revenue / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 