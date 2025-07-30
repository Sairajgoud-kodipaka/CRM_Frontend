'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search,
  Users,
  Target,
  Filter,
  Plus,
  X
} from 'lucide-react';
import api from '@/lib/api';

interface Segment {
  id: string;
  name: string;
  category: string;
  count: number;
  description: string;
  tags: string[];
}

interface AudienceSelectorProps {
  selectedSegments: string[];
  onSelectionChange: (segments: string[]) => void;
}

export default function AudienceSelector({ selectedSegments, onSelectionChange }: AudienceSelectorProps) {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      const response = await api.get('/analytics/segments/');
      setSegments(response.data.segments || []);
    } catch (error) {
      console.error('Error fetching segments:', error);
      // Mock data
      setSegments([
        {
          id: '1',
          name: 'High-Value Customers',
          category: 'Revenue',
          count: 156,
          description: 'Customers with high spending patterns',
          tags: ['high-spending', 'loyal', 'premium']
        },
        {
          id: '2',
          name: 'Wedding Buyers',
          category: 'Intent',
          count: 89,
          description: 'Customers interested in wedding jewelry',
          tags: ['wedding', 'high-intent', 'seasonal']
        },
        {
          id: '3',
          name: 'Gifting Prospects',
          category: 'Intent',
          count: 234,
          description: 'Customers looking for gift items',
          tags: ['gifting', 'occasional', 'mid-value']
        },
        {
          id: '4',
          name: 'Diamond Enthusiasts',
          category: 'Product',
          count: 67,
          description: 'Customers interested in diamond jewelry',
          tags: ['diamond', 'premium', 'specific']
        },
        {
          id: '5',
          name: 'Birthday This Week',
          category: 'Event',
          count: 23,
          description: 'Customers with birthdays this week',
          tags: ['birthday', 'event-driven', 'urgent']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSegments = segments.filter(segment => {
    const matchesSearch = segment.name.toLowerCase().includes(search.toLowerCase()) ||
                         segment.description.toLowerCase().includes(search.toLowerCase()) ||
                         segment.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || segment.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSegmentToggle = (segmentId: string) => {
    const newSelection = selectedSegments.includes(segmentId)
      ? selectedSegments.filter(id => id !== segmentId)
      : [...selectedSegments, segmentId];
    onSelectionChange(newSelection);
  };

  const totalAudience = selectedSegments.reduce((total, segmentId) => {
    const segment = segments.find(s => s.id === segmentId);
    return total + (segment?.count || 0);
  }, 0);

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
          <h2 className="text-xl font-bold text-gray-900">Select Target Audience</h2>
          <p className="text-gray-600">Choose segments for your campaign</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            <Users className="w-4 h-4 mr-1" />
            {totalAudience.toLocaleString()} customers selected
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search segments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="Revenue">Revenue</option>
              <option value="Intent">Intent</option>
              <option value="Product">Product</option>
              <option value="Event">Event</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Segments List */}
      <div className="space-y-4">
        {filteredSegments.map((segment) => (
          <Card key={segment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <Checkbox
                  checked={selectedSegments.includes(segment.id)}
                  onCheckedChange={() => handleSegmentToggle(segment.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium">{segment.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {segment.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{segment.count.toLocaleString()} customers</p>
                      <p className="text-sm text-gray-500">{segment.category}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{segment.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {segment.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSegments.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No segments found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Segments Summary */}
      {selectedSegments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Segments ({selectedSegments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedSegments.map((segmentId) => {
                const segment = segments.find(s => s.id === segmentId);
                return segment ? (
                  <div key={segmentId} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{segment.name}</p>
                      <p className="text-sm text-gray-500">{segment.count.toLocaleString()} customers</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSegmentToggle(segmentId)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : null;
              })}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">
                Total Audience: {totalAudience.toLocaleString()} customers
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 