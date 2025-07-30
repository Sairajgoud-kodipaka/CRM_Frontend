"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

interface Assignment {
  id: number;
  telecaller: number;
  telecaller_details?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  assigned_by?: number;
  assigned_by_details?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  customer_visit?: number;
  customer_visit_details?: {
    id: number;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    interests: string[];
    visit_timestamp: string;
    notes: string;
    lead_quality: string;
    sales_rep_details: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    };
  };
  status: string;
  priority: string;
  scheduled_time: string | null;
  notes: string;
  outcome: string;
  created_at: string;
  call_logs: CallLog[];
}

interface CallLog {
  id: number;
  assignment: number;
  call_status: string;
  call_duration: number;
  feedback: string;
  customer_sentiment: string;
  revisit_required: boolean;
  revisit_notes: string;
  recording_url: string | null;
  disposition_code: string | null;
  call_time: string;
}

export default function ManagerAssignmentDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id;
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loadingAssignment, setLoadingAssignment] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role !== 'manager') {
        router.replace('/managers/dashboard');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (assignmentId) {
      fetchAssignment();
    }
  }, [assignmentId]);

  const fetchAssignment = async () => {
    setLoadingAssignment(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `http://localhost:8000/api/telecalling/assignments/${assignmentId}/`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log("Assignment data received:", response.data);
      setAssignment(response.data);
    } catch (err: any) {
      console.error("Error fetching assignment:", err);
      setError(err.response?.data?.detail || "Failed to fetch assignment details");
    } finally {
      setLoadingAssignment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-700';
      case 'negative': return 'bg-red-100 text-red-700';
      case 'neutral': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCallStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-700';
      case 'no_answer': return 'bg-yellow-100 text-yellow-700';
      case 'busy': return 'bg-orange-100 text-orange-700';
      case 'call_back': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading || loadingAssignment) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || user.role !== 'manager') {
    return null;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link 
          href="/managers/feedback-monitoring"
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Back to Feedback Monitoring
        </Link>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="p-8">
        <div className="text-center">Assignment not found</div>
        <Link 
          href="/managers/feedback-monitoring"
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Back to Feedback Monitoring
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assignment Details</h1>
        <Link 
          href="/managers/feedback-monitoring"
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Back to Feedback Monitoring
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <div className="text-lg font-semibold">{assignment.customer_visit_details?.customer_name || 'Not specified'}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Phone</label>
              <div className="text-lg">{assignment.customer_visit_details?.customer_phone || 'Not specified'}</div>
            </div>
            {assignment.customer_visit_details?.customer_email && (
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <div className="text-lg">{assignment.customer_visit_details.customer_email}</div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-600">Lead Quality</label>
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                assignment.customer_visit_details?.lead_quality === 'hot' ? 'bg-red-100 text-red-700' :
                assignment.customer_visit_details?.lead_quality === 'warm' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {assignment.customer_visit_details?.lead_quality}
              </span>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Product Interests</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {assignment.customer_visit_details?.interests && assignment.customer_visit_details.interests.length > 0 ? (
                  assignment.customer_visit_details.interests.map(interest => (
                    <span key={interest} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                      {interest}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No interests specified</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Visit Notes</label>
              <div className="text-sm text-gray-700 mt-1">
                {assignment.customer_visit_details?.notes || 'No notes provided'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Sales Representative</label>
              <div className="text-sm">
                {assignment.customer_visit_details?.sales_rep_details ? 
                  `${assignment.customer_visit_details.sales_rep_details.first_name} ${assignment.customer_visit_details.sales_rep_details.last_name}` : 
                  'Not specified'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Assignment Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(assignment.status)}`}>
                {assignment.status.replace('_', ' ')}
              </span>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Priority</label>
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(assignment.priority)}`}>
                {assignment.priority}
              </span>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Telecaller</label>
              <div className="text-sm">
                {assignment.telecaller_details ? 
                  `${assignment.telecaller_details.first_name} ${assignment.telecaller_details.last_name}` : 
                  'Not assigned'
                }
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Assigned By</label>
              <div className="text-sm">
                {assignment.assigned_by_details ? 
                  `${assignment.assigned_by_details.first_name} ${assignment.assigned_by_details.last_name}` : 
                  'Not specified'
                }
              </div>
            </div>
            {assignment.scheduled_time && (
              <div>
                <label className="text-sm font-medium text-gray-600">Scheduled Time</label>
                <div className="text-sm">{new Date(assignment.scheduled_time).toLocaleString()}</div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-600">Manager Notes</label>
              <div className="text-sm text-gray-700 mt-1">
                {assignment.notes || 'No notes provided'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Outcome</label>
              <div className="text-sm text-gray-700">
                {assignment.outcome || 'Not specified'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Created</label>
              <div className="text-sm text-gray-500">{new Date(assignment.created_at).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Call History */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Call History</h2>
        {assignment.call_logs && assignment.call_logs.length > 0 ? (
          <div className="space-y-4">
            {assignment.call_logs.map((call) => (
              <div key={call.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getCallStatusColor(call.call_status)}`}>
                      {call.call_status.replace('_', ' ')}
                    </span>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getSentimentColor(call.customer_sentiment)}`}>
                      {call.customer_sentiment}
                    </span>
                    {call.call_duration > 0 && (
                      <span className="text-sm text-gray-500">
                        Duration: {formatDuration(call.call_duration)}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(call.call_time).toLocaleString()}
                  </div>
                </div>
                
                {call.feedback && (
                  <div className="mb-2">
                    <label className="text-sm font-medium text-gray-600">Feedback:</label>
                    <div className="text-sm text-gray-700 mt-1">{call.feedback}</div>
                  </div>
                )}
                
                {call.revisit_required && call.revisit_notes && (
                  <div className="mb-2">
                    <label className="text-sm font-medium text-gray-600">Revisit Notes:</label>
                    <div className="text-sm text-gray-700 mt-1">{call.revisit_notes}</div>
                  </div>
                )}
                
                {call.disposition_code && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Disposition Code:</label>
                    <div className="text-sm text-gray-700 mt-1">{call.disposition_code}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📞</div>
            <div>No calls have been logged yet</div>
          </div>
        )}
      </div>
    </div>
  );
} 