'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { feedbackAPI } from '@/lib/api';
import { StarIcon, ArrowLeftIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Feedback {
  id: number;
  title: string;
  content: string;
  category: string;
  status: string;
  overall_rating: number;
  product_rating?: number;
  service_rating?: number;
  value_rating?: number;
  sentiment?: string;
  sentiment_score?: number;
  client: { name: string; email: string };
  submitted_by?: { username: string };
  reviewed_by?: { username: string };
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  actioned_at?: string;
  is_anonymous: boolean;
  is_public: boolean;
  tags?: string[];
  responses?: any[];
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'reviewed', label: 'Reviewed', color: 'bg-blue-100 text-blue-800' },
  { value: 'actioned', label: 'Action Taken', color: 'bg-green-100 text-green-800' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800' },
  { value: 'escalated', label: 'Escalated', color: 'bg-red-100 text-red-800' },
];

export default function FeedbackDetailPage() {
  const router = useRouter();
  const params = useParams();
  const feedbackId = Number(params?.id);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isNaN(feedbackId)) {
      fetchFeedback();
    }
    // eslint-disable-next-line
  }, [feedbackId]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const data = await feedbackAPI.getFeedback(feedbackId);
      setFeedback(data);
    } catch (error) {
      setFeedback(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!feedback) return;
    
    try {
      setUpdating(true);
      
      if (newStatus === 'reviewed') {
        await feedbackAPI.markReviewed(feedback.id);
      } else if (newStatus === 'escalated') {
        await feedbackAPI.escalateFeedback(feedback.id);
      } else {
        await feedbackAPI.updateFeedback(feedback.id, { status: newStatus });
      }
      
      // Refresh feedback data
      await fetchFeedback();
      setShowStatusDropdown(false);
      
      // Show success notification
      setNotification({
        message: `Feedback status updated to ${getStatusLabel(newStatus)}`,
        type: 'success'
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error updating feedback status:', error);
      setNotification({
        message: 'Failed to update feedback status',
        type: 'error'
      });
      
      // Clear error notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setUpdating(false);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`h-5 w-5 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">({rating})</span>
    </div>
  );

  const getStatusColor = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(option => option.value === status);
    return statusOption?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(option => option.value === status);
    return statusOption?.label || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <button
          type="button"
          onClick={() => router.push('/inhouse-sales/feedback')}
          className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" /> Back to Feedback
        </button>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Feedback Not Found</h2>
          <p className="text-gray-600">The feedback entry you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}
      
      <button
        type="button"
        onClick={() => router.push('/inhouse-sales/feedback')}
        className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 mb-4"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" /> Back to Feedback
      </button>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{feedback.title}</h1>
          
          {/* Status Update Section */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(feedback.status)}`}>
                {getStatusLabel(feedback.status)}
              </span>
              
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                disabled={updating}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
            
            {showStatusDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="py-1">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleStatusUpdate(option.value)}
                      disabled={option.value === feedback.status || updating}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-4 text-gray-600">{feedback.content}</div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <span className="font-medium">Category:</span> {feedback.category}
          </div>
          <div>
            <span className="font-medium">Sentiment:</span> {feedback.sentiment || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Sentiment Score:</span> {feedback.sentiment_score ?? 'N/A'}
          </div>
          <div>
            <span className="font-medium">Client:</span> {feedback.client?.name}
          </div>
          <div>
            <span className="font-medium">Submitted By:</span> {feedback.is_anonymous ? 'Anonymous' : feedback.submitted_by?.username || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Created At:</span> {new Date(feedback.created_at).toLocaleString()}
          </div>
          <div>
            <span className="font-medium">Updated At:</span> {new Date(feedback.updated_at).toLocaleString()}
          </div>
          {feedback.reviewed_at && (
            <div>
              <span className="font-medium">Reviewed At:</span> {new Date(feedback.reviewed_at).toLocaleString()}
            </div>
          )}
          {feedback.actioned_at && (
            <div>
              <span className="font-medium">Actioned At:</span> {new Date(feedback.actioned_at).toLocaleString()}
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <span className="font-medium">Overall Rating:</span> {renderStars(feedback.overall_rating)}
        </div>
        
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="font-medium">Product Rating:</span> {feedback.product_rating ? renderStars(feedback.product_rating) : 'N/A'}
          </div>
          <div>
            <span className="font-medium">Service Rating:</span> {feedback.service_rating ? renderStars(feedback.service_rating) : 'N/A'}
          </div>
          <div>
            <span className="font-medium">Value Rating:</span> {feedback.value_rating ? renderStars(feedback.value_rating) : 'N/A'}
          </div>
        </div>
        
        <div className="mb-4">
          <span className="font-medium">Tags:</span> {feedback.tags && feedback.tags.length > 0 ? feedback.tags.join(', ') : 'None'}
        </div>
        
        <div className="mb-4">
          <span className="font-medium">Public:</span> {feedback.is_public ? 'Yes' : 'No'}
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => handleStatusUpdate('reviewed')}
            disabled={feedback.status === 'reviewed' || updating}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckIcon className="h-4 w-4 mr-2" />
            Mark as Reviewed
          </button>
          
          <button
            onClick={() => handleStatusUpdate('escalated')}
            disabled={feedback.status === 'escalated' || updating}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
            Escalate
          </button>
          
          <button
            onClick={() => handleStatusUpdate('actioned')}
            disabled={feedback.status === 'actioned' || updating}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark as Actioned
          </button>
          
          <button
            onClick={() => handleStatusUpdate('closed')}
            disabled={feedback.status === 'closed' || updating}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 