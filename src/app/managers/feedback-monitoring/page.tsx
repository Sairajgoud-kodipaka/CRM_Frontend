"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import Link from "next/link";

interface Assignment {
  id: number;
  customer_visit?: number;
  customer_visit_details?: {
    id: number;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    interests: string[];
    lead_quality: string;
  };
  telecaller_details?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  status: string;
  priority: string;
  call_logs: CallLog[];
}

interface CallLog {
  id: number;
  call_status: string;
  call_duration: number;
  feedback: string;
  customer_sentiment: string;
  revisit_required: boolean;
  revisit_notes: string;
  call_time: string;
}

export default function FeedbackMonitoringPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [highPotentialLeads, setHighPotentialLeads] = useState<Assignment[]>([]);
  const [unconnectedCalls, setUnconnectedCalls] = useState<Assignment[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<Assignment[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("high-potential");

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
    fetchMonitoringData();
  }, []);

  const fetchMonitoringData = async () => {
    setLoadingData(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      const [highPotentialRes, unconnectedRes, feedbackRes] = await Promise.all([
        axios.get("http://localhost:8000/api/telecalling/followups/high_potential_leads/", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:8000/api/telecalling/followups/unconnected_calls/", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:8000/api/telecalling/assignments/", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setHighPotentialLeads(highPotentialRes.data);
      setUnconnectedCalls(unconnectedRes.data);
      
      // Get recent assignments with call logs for feedback monitoring
      const allAssignments = feedbackRes.data.results || feedbackRes.data;
      const withRecentCalls = allAssignments.filter((assignment: Assignment) => 
        assignment.call_logs && assignment.call_logs.length > 0
      );
      setRecentFeedback(withRecentCalls.slice(0, 10)); // Show last 10
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch monitoring data");
    } finally {
      setLoadingData(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-700';
      case 'negative': return 'bg-red-100 text-red-700';
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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  if (!user || user.role !== 'manager') {
    return null;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Feedback Monitoring & Follow-ups</h1>
        <Link 
          href="/managers/dashboard"
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab("high-potential")}
          className={`px-4 py-2 font-medium ${
            activeTab === "high-potential"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          High Potential Leads ({highPotentialLeads.length})
        </button>
        <button
          onClick={() => setActiveTab("unconnected")}
          className={`px-4 py-2 font-medium ${
            activeTab === "unconnected"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Unconnected Calls ({unconnectedCalls.length})
        </button>
        <button
          onClick={() => setActiveTab("feedback")}
          className={`px-4 py-2 font-medium ${
            activeTab === "feedback"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Recent Feedback ({recentFeedback.length})
        </button>
      </div>

      {loadingData ? (
        <div className="text-gray-500 text-center py-12">Loading monitoring data...</div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
          {error}
        </div>
      ) : (
        <>
          {/* High Potential Leads Tab */}
          {activeTab === "high-potential" && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">High Potential Leads</h2>
                <p className="text-gray-600">Leads with positive sentiment that need follow-up attention</p>
              </div>
              
              {highPotentialLeads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="text-5xl mb-4">🎯</div>
                  <div className="text-lg font-semibold mb-2">No high potential leads</div>
                  <div className="text-gray-500">All leads are being handled appropriately.</div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {highPotentialLeads.map((assignment) => (
                    <div key={assignment.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{assignment.customer_visit.customer_name}</h3>
                          <p className="text-gray-600">{assignment.customer_visit.customer_phone}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            assignment.priority === 'high' ? 'bg-red-100 text-red-700' :
                            assignment.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {assignment.priority} Priority
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Telecaller</label>
                          <div className="text-sm">
                            {assignment.telecaller_details.first_name} {assignment.telecaller_details.last_name}
                          </div>
                        </div>
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
                      </div>
                      
                      {assignment.call_logs && assignment.call_logs.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded">
                          <h4 className="font-medium mb-2">Recent Call Feedback</h4>
                          {assignment.call_logs.slice(-1).map((call) => (
                            <div key={call.id} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getCallStatusColor(call.call_status)}`}>
                                  {call.call_status.replace('_', ' ')}
                                </span>
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getSentimentColor(call.customer_sentiment)}`}>
                                  {call.customer_sentiment}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {new Date(call.call_time).toLocaleString()}
                                </span>
                              </div>
                              {call.feedback && (
                                <div className="text-sm text-gray-700">{call.feedback}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                                             <div className="mt-4 flex gap-2">
                         <Link 
                           href={`/managers/assignments/${assignment.id}`}
                           className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                         >
                           View Details
                         </Link>
                         <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                           Schedule Follow-up
                         </button>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Unconnected Calls Tab */}
          {activeTab === "unconnected" && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Unconnected Calls</h2>
                <p className="text-gray-600">Calls that couldn't reach the customer and need retry</p>
              </div>
              
              {unconnectedCalls.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="text-5xl mb-4">📞</div>
                  <div className="text-lg font-semibold mb-2">No unconnected calls</div>
                  <div className="text-gray-500">All calls are being connected successfully.</div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {unconnectedCalls.map((assignment) => (
                    <div key={assignment.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{assignment.customer_visit_details?.customer_name || 'Not specified'}</h3>
                          <p className="text-gray-600">{assignment.customer_visit_details?.customer_phone || 'Not specified'}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
                            Needs Retry
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Telecaller</label>
                          <div className="text-sm">
                            {assignment.telecaller_details.first_name} {assignment.telecaller_details.last_name}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Attempts</label>
                          <div className="text-sm">{assignment.call_logs?.length || 0}</div>
                        </div>
                      </div>
                      
                      {assignment.call_logs && assignment.call_logs.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded">
                          <h4 className="font-medium mb-2">Call Attempts</h4>
                          <div className="space-y-2">
                            {assignment.call_logs.slice(-3).map((call) => (
                              <div key={call.id} className="flex items-center gap-2 text-sm">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getCallStatusColor(call.call_status)}`}>
                                  {call.call_status.replace('_', ' ')}
                                </span>
                                <span className="text-gray-500">
                                  {new Date(call.call_time).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                                             <div className="mt-4 flex gap-2">
                         <Link 
                           href={`/managers/assignments/${assignment.id}`}
                           className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                         >
                           View Details
                         </Link>
                         <button className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700">
                           Retry Call
                         </button>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Feedback Tab */}
          {activeTab === "feedback" && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Recent Call Feedback</h2>
                <p className="text-gray-600">Latest call outcomes and customer responses</p>
              </div>
              
              {recentFeedback.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="text-5xl mb-4">💬</div>
                  <div className="text-lg font-semibold mb-2">No recent feedback</div>
                  <div className="text-gray-500">No calls have been logged yet.</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border rounded-lg">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left">Customer</th>
                        <th className="px-4 py-2 text-left">Telecaller</th>
                        <th className="px-4 py-2 text-left">Call Status</th>
                        <th className="px-4 py-2 text-left">Sentiment</th>
                        <th className="px-4 py-2 text-left">Feedback</th>
                        <th className="px-4 py-2 text-left">Time</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentFeedback.map((assignment) => {
                        const latestCall = assignment.call_logs?.[assignment.call_logs.length - 1];
                        if (!latestCall) return null;
                        
                        return (
                          <tr key={assignment.id} className="border-t">
                            <td className="px-4 py-2">
                              <div className="font-medium">{assignment.customer_visit_details?.customer_name || 'Not specified'}</div>
                              <div className="text-sm text-gray-500">{assignment.customer_visit_details?.customer_phone || 'Not specified'}</div>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {assignment.telecaller_details ? 
                                `${assignment.telecaller_details.first_name} ${assignment.telecaller_details.last_name}` : 
                                'Not specified'
                              }
                            </td>
                            <td className="px-4 py-2">
                              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getCallStatusColor(latestCall.call_status)}`}>
                                {latestCall.call_status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getSentimentColor(latestCall.customer_sentiment)}`}>
                                {latestCall.customer_sentiment}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <div className="max-w-xs truncate text-sm">
                                {latestCall.feedback || "No feedback provided"}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {new Date(latestCall.call_time).toLocaleString()}
                            </td>
                                                         <td className="px-4 py-2">
                               <Link 
                                 href={`/managers/assignments/${assignment.id}`}
                                 className="text-blue-600 hover:underline text-sm"
                               >
                                 View Details
                               </Link>
                             </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
} 