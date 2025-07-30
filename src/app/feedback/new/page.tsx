'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StarIcon, UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { feedbackAPI, customersAPI } from '@/lib/api';

interface Client {
  id: number;
  name: string;
  email: string;
}

interface FeedbackFormData {
  title: string;
  content: string;
  category: string;
  overall_rating: number;
  product_rating?: number;
  service_rating?: number;
  value_rating?: number;
  client: number;
  is_anonymous: boolean;
  is_public: boolean;
  tags: string[];
}

export default function NewFeedbackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState<FeedbackFormData>({
    title: '',
    content: '',
    category: 'general',
    overall_rating: 0,
    product_rating: undefined,
    service_rating: undefined,
    value_rating: undefined,
    client: 0,
    is_anonymous: false,
    is_public: false,
    tags: [],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FeedbackFormData, string>>>({});

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await customersAPI.getCustomers();
      setClients(response.results || response);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FeedbackFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRatingChange = (field: keyof FeedbackFormData, rating: number) => {
    setFormData(prev => ({ ...prev, [field]: rating }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FeedbackFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (formData.overall_rating === 0) {
      newErrors.overall_rating = 'Overall rating is required';
    }

    if (!formData.client) {
      newErrors.client = 'Please select a client';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      // Clean up the data before sending
      const submitData = {
        ...formData,
        product_rating: formData.product_rating || null,
        service_rating: formData.service_rating || null,
        value_rating: formData.value_rating || null,
      };

      await feedbackAPI.createFeedback(submitData);
      
      // Redirect to feedback list
      router.push('/inhouse-sales/feedback');
    } catch (error: any) {
      console.error('Error creating feedback:', error);
      if (error.response?.data) {
        // Handle backend validation errors
        const backendErrors = error.response.data;
        setErrors(backendErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarRating = (
    field: keyof FeedbackFormData,
    value: number,
    label: string,
    required: boolean = false
  ) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingChange(field, star)}
              className="focus:outline-none"
            >
              <StarIcon
                className={`h-6 w-6 ${
                  star <= value
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">({value || 0}/5)</span>
        </div>
        {errors[field] && (
          <p className="text-sm text-red-600">{errors[field]}</p>
        )}
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Back to Feedback Button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => router.push('/inhouse-sales/feedback')}
          className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
        >
          ← Back to Feedback
        </button>
      </div>
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">New Feedback</h1>
        <p className="text-gray-600">Submit new customer feedback</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief title for the feedback"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                rows={4}
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detailed feedback content"
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
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
            </div>

            {/* Client Selection */}
            <div>
              <label htmlFor="client" className="block text-sm font-medium text-gray-700">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                id="client"
                value={formData.client}
                onChange={(e) => handleInputChange('client', Number(e.target.value))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
              {errors.client && (
                <p className="mt-1 text-sm text-red-600">{errors.client}</p>
              )}
            </div>
          </div>
        </div>

        {/* Ratings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Ratings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="md:col-span-2">
              {renderStarRating('overall_rating', formData.overall_rating, 'Overall Rating', true)}
            </div>

            {/* Product Rating */}
            <div>
              {renderStarRating('product_rating', formData.product_rating || 0, 'Product Rating')}
            </div>

            {/* Service Rating */}
            <div>
              {renderStarRating('service_rating', formData.service_rating || 0, 'Service Rating')}
            </div>

            {/* Value Rating */}
            <div>
              {renderStarRating('value_rating', formData.value_rating || 0, 'Value for Money')}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Settings</h3>
          
          <div className="space-y-4">
            {/* Anonymous Feedback */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_anonymous"
                checked={formData.is_anonymous}
                onChange={(e) => handleInputChange('is_anonymous', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_anonymous" className="ml-2 block text-sm text-gray-900">
                Anonymous Feedback
              </label>
            </div>

            {/* Public Feedback */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_public"
                checked={formData.is_public}
                onChange={(e) => handleInputChange('is_public', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
                Public Feedback (can be displayed publicly)
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
} 