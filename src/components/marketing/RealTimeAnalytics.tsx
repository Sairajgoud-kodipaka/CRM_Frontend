'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Users, 
  Eye, 
  MousePointer, 
  Target, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  BarChart3,
  PieChart
} from 'lucide-react';
import api from '@/lib/api';

interface RealTimeMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface LiveCampaign {
  id: string;
  name: string;
  type: 'whatsapp' | 'email' | 'social' | 'sms';
  status: 'active' | 'paused' | 'completed';
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  target: number;
  progress: number;
}

interface LiveActivity {
  id: string;
  type: 'conversion' | 'click' | 'impression' | 'revenue';
  description: string;
  value: number;
  timestamp: string;
  campaign?: string;
}

interface RealTimeData {
  metrics: RealTimeMetric[];
  campaigns: LiveCampaign[];
  activity: LiveActivity[];
}

export default function RealTimeAnalytics() {
  const [data, setData] = useState<RealTimeData | null>(null);

  useEffect(() => {
    const fetchRealTimeData = async () => {
      try {
        const response = await api.get('/marketing/realtime-analytics/');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching real-time analytics:', error);
      }
    };

    fetchRealTimeData();
    const interval = setInterval(fetchRealTimeData, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'conversion':
        return <Target className="h-4 w-4 text-green-600" />;
      case 'click':
        return <MousePointer className="h-4 w-4 text-blue-600" />;
      case 'impression':
        return <Eye className="h-4 w-4 text-purple-600" />;
      case 'revenue':
        return <DollarSign className="h-4 w-4 text-yellow-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatValue = (value: number, type: string) => {
    switch (type) {
      case 'revenue':
        return `₹${(value / 1000).toFixed(0)}K`;
      case 'time':
        return `${value} min`;
      default:
        return value.toLocaleString();
    }
  };

  if (!data) {
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
          <h2 className="text-2xl font-bold text-gray-900">Real-Time Analytics</h2>
          <p className="text-gray-600">Live marketing performance and activity monitoring</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
          <Button variant="outline" size="sm">
            <Zap className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-Time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.metrics.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              {getTrendIcon(metric.trend)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatValue(metric.value, metric.name.toLowerCase())}
              </div>
              <p className={`text-xs ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change > 0 ? '+' : ''}{metric.change}% from last hour
              </p>
            </CardContent>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full"></div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Live Campaigns</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.campaigns.map((campaign) => (
                <div key={campaign.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        campaign.status === 'active' ? 'bg-green-500' : 
                        campaign.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></div>
                      <div>
                        <h3 className="font-medium">{campaign.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{campaign.type}</p>
                      </div>
                    </div>
                    <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-gray-500">Impressions</p>
                      <p className="font-medium">{campaign.impressions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Clicks</p>
                      <p className="font-medium">{campaign.clicks}</p>
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

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{campaign.progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={campaign.progress} className="w-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Live Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {data.activity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.description}</p>
                    {activity.campaign && (
                      <p className="text-xs text-gray-500">Campaign: {activity.campaign}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-sm font-medium">
                      {activity.type === 'revenue' ? `₹${(activity.value / 1000).toFixed(0)}K` : activity.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary (Last 24 Hours)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {data.metrics.find(m => m.name === 'Live Impressions')?.value.toLocaleString() || 0}
              </div>
              <p className="text-sm text-gray-600">Total Impressions</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {data.metrics.find(m => m.name === 'Recent Clicks')?.value || 0}
              </div>
              <p className="text-sm text-gray-600">Total Clicks</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {data.metrics.find(m => m.name === 'Conversions Today')?.value || 0}
              </div>
              <p className="text-sm text-gray-600">Conversions</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                ₹{(data.metrics.find(m => m.name === 'Revenue (24h)')?.value || 0) / 1000}K
              </div>
              <p className="text-sm text-gray-600">Revenue</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 