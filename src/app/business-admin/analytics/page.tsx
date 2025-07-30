'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import api from '@/lib/api';

// Simple DatePicker component
const DatePicker = ({ selected, onChange, placeholderText, className }: {
  selected: Date;
  onChange: (date: Date) => void;
  placeholderText: string;
  className?: string;
}) => (
  <input
    type="date"
    value={selected.toISOString().split('T')[0]}
    onChange={(e) => onChange(new Date(e.target.value))}
    className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
);

interface AnalyticsData {
  sales: {
    total_sales: number;
    monthly_sales: number;
    total_revenue: number;
    monthly_revenue: number;
    avg_order_value: number;
  };
  pipeline: {
    stages: Record<string, {
      name: string;
      count: number;
      value: number;
    }>;
    total_pipeline_value: number;
    active_deals: number;
  };
  conversion: {
    total_leads: number;
    converted_leads: number;
    conversion_rate: number;
    monthly_leads: number;
    monthly_converted: number;
    monthly_conversion_rate: number;
  };
  revenue: {
    current_revenue: number;
    last_month_revenue: number;
    revenue_growth: number;
    revenue_by_product: Array<{
      items__product__category: string;
      total: number;
    }>;
  };
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end_date: new Date(),
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics/dashboard/');
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600">Comprehensive sales and revenue analytics</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive sales and revenue analytics</p>
        </div>
        <div className="flex items-center space-x-4">
          <DatePicker
            selected={dateRange.start_date}
            onChange={(date) => setDateRange(prev => ({ ...prev, start_date: date }))}
            placeholderText="Start Date"
            className="w-40"
          />
          <DatePicker
            selected={dateRange.end_date}
            onChange={(date) => setDateRange(prev => ({ ...prev, end_date: date }))}
            placeholderText="End Date"
            className="w-40"
          />
          <Button onClick={fetchAnalyticsData}>Refresh</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            {analyticsData?.revenue.revenue_growth !== null && analyticsData?.revenue.revenue_growth !== undefined && (
              <div className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded">
                <span className={analyticsData.revenue.revenue_growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {analyticsData.revenue.revenue_growth >= 0 ? '+' : ''}{formatPercentage(analyticsData.revenue.revenue_growth)}
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analyticsData?.revenue.current_revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              vs {formatCurrency(analyticsData?.revenue.last_month_revenue || 0)} last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.sales.total_sales || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData?.sales.monthly_sales || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(analyticsData?.conversion.conversion_rate || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {analyticsData?.conversion.converted_leads || 0} of {analyticsData?.conversion.total_leads || 0} leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analyticsData?.pipeline.total_pipeline_value || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {analyticsData?.pipeline.active_deals || 0} active deals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Stages */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Stages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analyticsData?.pipeline.stages && Object.entries(analyticsData.pipeline.stages).map(([stage, data]) => (
              <div key={stage} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{data.name}</h4>
                  <div className="text-xs px-2 py-1 border rounded">{data.count}</div>
                </div>
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(data.value)}
                </div>
                <Progress 
                  value={(data.count / Math.max(analyticsData.pipeline.active_deals, 1)) * 100} 
                  className="mt-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Product */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Product Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData?.revenue.revenue_by_product.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">
                    {product.items__product__category || 'Uncategorized'}
                  </h4>
                </div>
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(product.total)}
                </div>
              </div>
            ))}
            {(!analyticsData?.revenue.revenue_by_product || analyticsData.revenue.revenue_by_product.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No product revenue data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lead Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Leads</span>
                <span className="font-bold">{analyticsData?.conversion.total_leads || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Converted</span>
                <span className="font-bold text-green-600">{analyticsData?.conversion.converted_leads || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Conversion Rate</span>
                <span className="font-bold">{formatPercentage(analyticsData?.conversion.conversion_rate || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Monthly Leads</span>
                <span className="font-bold">{analyticsData?.conversion.monthly_leads || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Monthly Converted</span>
                <span className="font-bold text-green-600">{analyticsData?.conversion.monthly_converted || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Monthly Rate</span>
                <span className="font-bold">{formatPercentage(analyticsData?.conversion.monthly_conversion_rate || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 