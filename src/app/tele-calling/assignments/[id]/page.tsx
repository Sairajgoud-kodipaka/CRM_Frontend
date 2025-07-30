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

export default function AssignmentDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id;
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loadingAssignment, setLoadingAssignment] = useState(true);
  const [error, setError] = useState("");
  const [showCallLogModal, setShowCallLogModal] = useState(false);
  const [callLogData, setCallLogData] = useState({
    call_status: "connected",
    call_duration: 0,
    feedback: "",
    customer_sentiment: "neutral",
    revisit_required: false,
    revisit_notes: "",
    disposition_code: ""
  });
  const [loggingCall, setLoggingCall] = useState(false);
  const [logError, setLogError] = useState("");

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role !== 'tele_calling') {
        router.replace('/tele-calling/dashboard');
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
      const res = await axios.get(`http://localhost:8000/api/telecalling/assignments/${assignmentId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Assignment data received:", res.data);
      setAssignment(res.data);
    } catch (err: any) {
      console.error("Error fetching assignment:", err);
      setError(err.response?.data?.detail || "Failed to fetch assignment");
    } finally {
      setLoadingAssignment(false);
    }
  };

  const handleCallLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingCall(true);
    setLogError("");
    
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(`http://localhost:8000/api/telecalling/call-logs/`, {
        assignment: assignmentId,
        ...callLogData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowCallLogModal(false);
      setCallLogData({
        call_status: "connected",
        call_duration: 0,
        feedback: "",
        customer_sentiment: "neutral",
        revisit_required: false,
        revisit_notes: "",
        disposition_code: ""
      });
      fetchAssignment(); // Refresh assignment data
    } catch (err: any) {
      setLogError(err.response?.data?.detail || "Failed to log call");
    } finally {
      setLoggingCall(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user || user.role !== 'tele_calling') {
    return null;
  }

  if (loadingAssignment) {
    return <div className="text-gray-500 text-center py-12">Loading assignment details...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
          {error}
        </div>
        <Link href="/tele-calling/assignments" className="text-blue-600 hover:underline">
          Back to Assignments
        </Link>
      </div>
    );
  }

  if (!assignment) {
    return <div className="p-8">Assignment not found</div>;
  }

  // Safety check for customer_visit_details
  if (!assignment.customer_visit_details) {
    return (
      <div className="p-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 text-center">
          Customer visit data is missing for this assignment.
        </div>
        <Link href="/tele-calling/assignments" className="text-blue-600 hover:underline">
          Back to Assignments
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assignment Details</h1>
        <div className="flex gap-2">
            <button
              onClick={() => setShowCallLogModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Log Call
            </button>
          <Link 
            href="/tele-calling/assignments"
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Back to Assignments
          </Link>
        </div>
      </div>

      {/* Call Log Modal */}
      {showCallLogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Log Call for {assignment.customer_visit_details?.customer_name || 'Customer'}</h2>
              <button 
                onClick={() => setShowCallLogModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCallLog} className="space-y-4">
              {logError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                  {logError}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Call Status *</label>
                  <select
                    required
                    className="w-full border rounded px-3 py-2"
                    value={callLogData.call_status}
                    onChange={(e) => setCallLogData(prev => ({ ...prev, call_status: e.target.value }))}
                  >
                    <option value="connected">Connected</option>
                    <option value="no_answer">No Answer</option>
                    <option value="busy">Busy</option>
                    <option value="wrong_number">Wrong Number</option>
                    <option value="not_interested">Not Interested</option>
                    <option value="call_back">Call Back Later</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Call Duration (seconds)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border rounded px-3 py-2"
                    value={callLogData.call_duration}
                    onChange={(e) => setCallLogData(prev => ({ ...prev, call_duration: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Customer Sentiment</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={callLogData.customer_sentiment}
                  onChange={(e) => setCallLogData(prev => ({ ...prev, customer_sentiment: e.target.value }))}
                >
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Call Feedback (to Manager)</label>
                <textarea
                  rows={4}
                  className="w-full border rounded px-3 py-2"
                  value={callLogData.feedback}
                  onChange={(e) => setCallLogData(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder="Describe the conversation, customer's response, and any important details for the manager..."
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="revisit_required"
                  checked={callLogData.revisit_required}
                  onChange={(e) => setCallLogData(prev => ({ ...prev, revisit_required: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="revisit_required" className="text-sm font-medium">
                  Revisit Required
                </label>
              </div>
              
              {callLogData.revisit_required && (
                <div>
                  <label className="block text-sm font-medium mb-1">Revisit Notes</label>
                  <textarea
                    rows={3}
                    className="w-full border rounded px-3 py-2"
                    value={callLogData.revisit_notes}
                    onChange={(e) => setCallLogData(prev => ({ ...prev, revisit_notes: e.target.value }))}
                    placeholder="Why is a revisit needed? What should be discussed?"
                  />
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loggingCall}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {loggingCall ? "Logging..." : "Log Call"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCallLogModal(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
                <label className="text-sm font-medium text-gray-600">Email</label>
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
          </div>
        </div>

        {/* Assignment Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Assignment Details</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                assignment.status === 'completed' ? 'bg-green-100 text-green-700' :
                assignment.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                assignment.status === 'follow_up' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                  {assignment.status.replace('_', ' ')}
                </span>
              </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Priority</label>
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                assignment.priority === 'high' ? 'bg-red-100 text-red-700' :
                assignment.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {assignment.priority}
              </span>
            </div>
            {assignment.scheduled_time && (
              <div>
                <label className="text-sm font-medium text-gray-600">Scheduled Time</label>
                <div className="text-lg">{new Date(assignment.scheduled_time).toLocaleString()}</div>
              </div>
            )}
            {assignment.notes && (
              <div>
                <label className="text-sm font-medium text-gray-600">Assignment Notes</label>
                <div className="text-sm bg-gray-50 p-2 rounded">{assignment.notes}</div>
              </div>
            )}
              <div>
              <label className="text-sm font-medium text-gray-600">Sales Rep</label>
              <div className="text-lg">
                {assignment.customer_visit_details?.sales_rep_details ? (
                  `${assignment.customer_visit_details.sales_rep_details.first_name || ''} ${assignment.customer_visit_details.sales_rep_details.last_name || ''}`.trim() || 'Not specified'
                ) : (
                  'Not specified'
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Assigned By</label>
              <div className="text-lg">
                {assignment.assigned_by_details ? (
                  `${assignment.assigned_by_details.first_name || ''} ${assignment.assigned_by_details.last_name || ''}`.trim() || 'Not specified'
                ) : (
                  'Not specified'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Rep Notes */}
      {assignment.customer_visit_details?.notes && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Sales Rep Notes</h2>
          <div className="bg-gray-50 p-4 rounded">
            {assignment.customer_visit_details.notes}
          </div>
        </div>
      )}

      {/* Call History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Call History</h2>
        {assignment.call_logs && assignment.call_logs.length > 0 ? (
          <div className="space-y-4">
            {assignment.call_logs.map((call) => (
              <div key={call.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        call.call_status === 'connected' ? 'bg-green-100 text-green-700' :
                        call.call_status === 'no_answer' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {call.call_status.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(call.call_time).toLocaleString()}
                      </span>
                      {call.call_duration > 0 && (
                        <span className="text-sm text-gray-500">
                          Duration: {formatDuration(call.call_duration)}
                        </span>
                      )}
                    </div>
                    {call.feedback && (
                      <div className="text-sm text-gray-700 mb-2">{call.feedback}</div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Sentiment:</span>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        call.customer_sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                        call.customer_sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {call.customer_sentiment}
                      </span>
                    </div>
                    {call.revisit_required && call.revisit_notes && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="text-sm font-medium text-yellow-800">Revisit Required:</div>
                        <div className="text-sm text-yellow-700">{call.revisit_notes}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">No calls logged yet</div>
        )}
      </div>
    </div>
  );
} 