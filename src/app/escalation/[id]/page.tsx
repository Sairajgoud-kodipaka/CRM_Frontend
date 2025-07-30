'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { escalationAPI } from '@/lib/api';
import { ArrowLeftIcon, ExclamationTriangleIcon, ClockIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Escalation {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  client: {
    name: string;
    email: string;
  };
  client_name: string;
  created_by: {
    username: string;
  };
  assigned_to?: {
    username: string;
  };
  created_at: string;
  updated_at: string;
  assigned_at?: string;
  resolved_at?: string;
  closed_at?: string;
  due_date: string;
  is_overdue: boolean;
  sla_hours: number;
}

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open', color: 'bg-blue-100 text-blue-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'pending_customer', label: 'Pending Customer', color: 'bg-purple-100 text-purple-800' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-800' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

export default function EscalationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const escalationId = Number(params?.id);
  const [escalation, setEscalation] = useState<Escalation | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isNaN(escalationId)) {
      fetchEscalation();
    }
    // eslint-disable-next-line
  }, [escalationId]);

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

  const fetchEscalation = async () => {
    try {
      setLoading(true);
      const data = await escalationAPI.getEscalation(escalationId);
      setEscalation(data);
    } catch (error) {
      console.error('Error fetching escalation:', error);
      setEscalation(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!escalation) return;
    
    try {
      setUpdating(true);
      
      // Use the change_status action endpoint
      await escalationAPI.changeEscalationStatus(escalation.id, newStatus);
      
      // Refresh escalation data
      await fetchEscalation();
      setShowStatusDropdown(false);
      
      // Show success notification
      setNotification({
        message: `Escalation status updated to ${getStatusLabel(newStatus)}`,
        type: 'success'
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error updating escalation status:', error);
      setNotification({
        message: 'Failed to update escalation status',
        type: 'error'
      });
      
      // Clear error notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(option => option.value === status);
    return statusOption?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(option => option.value === status);
    return statusOption?.label || status;
  };

  const getPriorityColor = (priority: string) => {
    const priorityOption = PRIORITY_OPTIONS.find(option => option.value === priority);
    return priorityOption?.color || 'bg-gray-100 text-gray-800';
  };

  const getPriorityLabel = (priority: string) => {
    const priorityOption = PRIORITY_OPTIONS.find(option => option.value === priority);
    return priorityOption?.label || priority;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!escalation) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <button
          type="button"
          onClick={() => router.push('/inhouse-sales/escalation')}
          className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" /> Back to Escalations
        </button>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Escalation Not Found</h2>
          <p className="text-gray-600">The escalation entry you are looking for does not exist.</p>
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
        onClick={() => router.push('/inhouse-sales/escalation')}
        className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 mb-4"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" /> Back to Escalations
      </button>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{escalation.title}</h1>
          
          {/* Status Update Section */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(escalation.status)}`}>
                {getStatusLabel(escalation.status)}
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
                      disabled={option.value === escalation.status || updating}
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
        
        <div className="mb-6 text-gray-600">{escalation.description}</div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <span className="font-medium">Category:</span> {escalation.category.replace('_', ' ')}
          </div>
          <div>
            <span className="font-medium">Priority:</span> 
            <span className={`ml-2 px-2 py-1 rounded-full text-sm font-medium ${getPriorityColor(escalation.priority)}`}>
              {getPriorityLabel(escalation.priority)}
            </span>
          </div>
                     <div>
             <span className="font-medium">Client:</span> {escalation.client_name || escalation.client?.name}
           </div>
          <div>
            <span className="font-medium">Created By:</span> {escalation.created_by?.username}
          </div>
          <div>
            <span className="font-medium">Assigned To:</span> {escalation.assigned_to?.username || 'Unassigned'}
          </div>
          <div>
            <span className="font-medium">SLA Hours:</span> {escalation.sla_hours}
          </div>
          <div>
            <span className="font-medium">Created At:</span> {formatDate(escalation.created_at)}
          </div>
          <div>
            <span className="font-medium">Updated At:</span> {formatDate(escalation.updated_at)}
          </div>
          {escalation.assigned_at && (
            <div>
              <span className="font-medium">Assigned At:</span> {formatDate(escalation.assigned_at)}
            </div>
          )}
          {escalation.resolved_at && (
            <div>
              <span className="font-medium">Resolved At:</span> {formatDate(escalation.resolved_at)}
            </div>
          )}
          {escalation.closed_at && (
            <div>
              <span className="font-medium">Closed At:</span> {formatDate(escalation.closed_at)}
            </div>
          )}
          <div>
            <span className="font-medium">Due Date:</span> {formatDate(escalation.due_date)}
          </div>
        </div>
        
        {/* Overdue Warning */}
        {escalation.is_overdue && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800 font-medium">This escalation is overdue!</span>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => handleStatusUpdate('in_progress')}
            disabled={escalation.status === 'in_progress' || updating}
            className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ClockIcon className="h-4 w-4 mr-2" />
            Mark In Progress
          </button>
          
          <button
            onClick={() => handleStatusUpdate('resolved')}
            disabled={escalation.status === 'resolved' || updating}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckIcon className="h-4 w-4 mr-2" />
            Resolve
          </button>
          
          <button
            onClick={() => handleStatusUpdate('closed')}
            disabled={escalation.status === 'closed' || updating}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XMarkIcon className="h-4 w-4 mr-2" />
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 