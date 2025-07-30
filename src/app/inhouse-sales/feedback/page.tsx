'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlusIcon, StarIcon, ChatBubbleLeftIcon, ChartBarIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { feedbackAPI } from '@/lib/api';

interface Feedback {
  id: number;
  title: string;
  content: string;
  category: string;
  status: string;
  overall_rating: number;
  sentiment: string;
  client: {
    name: string;
    email: string;
  };
  submitted_by: {
    username: string;
  };
  created_at: string;
  is_public: boolean;
  is_anonymous: boolean;
}

export default function FeedbackManagement() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_feedback: 0,
    positive_feedback: 0,
    negative_feedback: 0,
    neutral_feedback: 0,
    avg_overall_rating: 0,
  });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchFeedbacks();
    fetchStats();
  }, [debouncedSearchTerm, statusFilter, categoryFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCategoryFilter('');
  };

  const fetchFeedbacks = async () => {
    try {
      console.log('Fetching feedbacks...');
      const params: any = {};
      
      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (categoryFilter) {
        params.category = categoryFilter;
      }
      
      const data = await feedbackAPI.getFeedbacks(params);
      console.log('Feedbacks received:', data);
      setFeedbacks(data.results || data);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('Fetching feedback stats...');
      const data = await feedbackAPI.getFeedbackStats();
      console.log('Stats received:', data);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'actioned': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'escalated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'very_positive': return 'bg-green-100 text-green-800';
      case 'positive': return 'bg-green-100 text-green-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'very_negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Feedback Management</h1>
          <p className="text-gray-600">Manage customer feedback and reviews</p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/feedback/surveys"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Surveys
          </Link>
          <Link
            href="/feedback/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Feedback
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
                             <ChatBubbleLeftIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Feedback</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_feedback}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <StarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Positive</p>
              <p className="text-2xl font-bold text-gray-900">{stats.positive_feedback}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <StarIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Negative</p>
              <p className="text-2xl font-bold text-gray-900">{stats.negative_feedback}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <StarIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Neutral</p>
              <p className="text-2xl font-bold text-gray-900">{stats.neutral_feedback}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <StarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avg_overall_rating.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <ChatBubbleLeftIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="actioned">Actioned</option>
              <option value="closed">Closed</option>
              <option value="escalated">Escalated</option>
            </select>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="general">General</option>
              <option value="product_quality">Product Quality</option>
              <option value="service_experience">Service Experience</option>
              <option value="staff_behavior">Staff Behavior</option>
              <option value="store_ambience">Store Ambience</option>
              <option value="pricing">Pricing</option>
              <option value="delivery">Delivery</option>
              <option value="website_experience">Website Experience</option>
              <option value="customer_support">Customer Support</option>
            </select>
            {(searchTerm || statusFilter || categoryFilter) && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Feedback</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {feedbacks.length === 0 ? (
            <div className="px-6 py-12 text-center">
                             <ChatBubbleLeftIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No feedback</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by collecting customer feedback.</p>
            </div>
          ) : (
            feedbacks.map((feedback) => (
              <div key={feedback.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900">
                        <Link href={`/feedback/${feedback.id}`} className="hover:text-blue-600">
                          {feedback.title}
                        </Link>
                      </h4>
                      {feedback.is_public && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <EyeIcon className="h-3 w-3 mr-1" />
                          Public
                        </span>
                      )}
                      {feedback.is_anonymous && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Anonymous
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{feedback.content}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>Client: {feedback.client.name}</span>
                      <span>Submitted by: {feedback.submitted_by.username}</span>
                      <span>Created: {formatDate(feedback.created_at)}</span>
                    </div>
                    <div className="mt-2">
                      {renderStars(feedback.overall_rating)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                      {feedback.status}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(feedback.sentiment)}`}>
                      {feedback.sentiment.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 