'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Link from 'next/link';

interface Assignment {
  id: number;
  client: {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    tags?: string[];
  };
  status: string;
  scheduled_time: string | null;
  notes: string;
  outcome: string;
  created_at: string;
  call_logs?: CallLog[];
}

interface CallLog {
  id: number;
  notes: string;
  outcome: string;
  call_time: string;
  disposition_code: string;
  recording_url?: string;
}

interface PerformanceStats {
  total_calls: number;
  completed_calls: number;
  conversions: number;
  follow_ups: number;
  avg_call_duration: number;
}

export default function TeleCallingPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<PerformanceStats>({
    total_calls: 0,
    completed_calls: 0,
    conversions: 0,
    follow_ups: 0,
    avg_call_duration: 0
  });
  const [activeTab, setActiveTab] = useState<'today' | 'pending' | 'completed'>('today');

  useEffect(() => {
    fetchAssignments();
    fetchStats();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://localhost:8000/api/telecalling/assignments/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments(response.data.results || response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const [assignmentsRes, logsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/telecalling/assignments/', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/telecalling/logs/', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const assignments = assignmentsRes.data.results || assignmentsRes.data;
      const logs = logsRes.data.results || logsRes.data;

      const today = new Date().toDateString();
      const todayLogs = logs.filter((log: any) => 
        new Date(log.call_time).toDateString() === today
      );

      setStats({
        total_calls: logs.length,
        completed_calls: assignments.filter((a: any) => a.status === 'completed').length,
        conversions: logs.filter((log: any) => 
          log.disposition_code?.toLowerCase().includes('interested') ||
          log.outcome?.toLowerCase().includes('converted')
        ).length,
        follow_ups: assignments.filter((a: any) => a.status === 'follow_up').length,
        avg_call_duration: todayLogs.length > 0 ? Math.round(todayLogs.length * 3.5) : 0 // Mock calculation
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const getFilteredAssignments = () => {
    const today = new Date().toDateString();
    
    switch (activeTab) {
      case 'today':
        return assignments.filter(a => 
          a.scheduled_time && new Date(a.scheduled_time).toDateString() === today
        );
      case 'pending':
        return assignments.filter(a => 
          a.status === 'not_started' || a.status === 'in_progress'
        );
      case 'completed':
        return assignments.filter(a => a.status === 'completed');
      default:
        return assignments;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'follow_up': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-200 text-gray-600';
    }
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tele-calling Dashboard</h1>
        <div className="flex gap-2">
          <Link 
            href="/tele-calling/assignments" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            View All Assignments
          </Link>
          <Link 
            href="/tele-calling/sales-funnel" 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Sales Funnel
          </Link>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total_calls}</div>
          <div className="text-sm text-gray-600">Total Calls</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completed_calls}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.conversions}</div>
          <div className="text-sm text-gray-600">Conversions</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.follow_ups}</div>
          <div className="text-sm text-gray-600">Follow-ups</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.avg_call_duration}m</div>
          <div className="text-sm text-gray-600">Avg Duration</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'today' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Today's Calls
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'pending' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'completed' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Completed
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500 text-center py-12">Loading assignments...</div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
          {error}
        </div>
      ) : getFilteredAssignments().length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-5xl mb-4">📞</div>
          <div className="text-lg font-semibold mb-2">
            No {activeTab === 'today' ? "today's" : activeTab} assignments found
          </div>
          <div className="text-gray-500">
            {activeTab === 'today' 
              ? "No calls scheduled for today. Check pending assignments or create new ones."
              : activeTab === 'pending'
              ? "All assignments have been completed or are in progress."
              : "No completed assignments yet."
            }
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {getFilteredAssignments().map((assignment) => (
            <div key={assignment.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {assignment.client.first_name} {assignment.client.last_name}
                  </h3>
                  <div className="text-gray-600">
                    📞 {formatPhone(assignment.client.phone)}
                  </div>
                  <div className="text-gray-600">
                    📧 {assignment.client.email}
                  </div>
                  {assignment.client.tags && assignment.client.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {assignment.client.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(assignment.status)}`}>
                    {assignment.status.replace('_', ' ')}
                  </span>
                  {assignment.scheduled_time && (
                    <div className="text-sm text-gray-500 mt-1">
                      📅 {new Date(assignment.scheduled_time).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
              
              {assignment.notes && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-1">Notes:</div>
                  <div className="text-gray-600 bg-gray-50 p-3 rounded">
                    {assignment.notes}
                  </div>
                </div>
              )}

              {assignment.call_logs && assignment.call_logs.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Call History:</div>
                  <div className="space-y-2">
                    {assignment.call_logs.map((log) => (
                      <div key={log.id} className="bg-gray-50 p-3 rounded text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{log.outcome}</div>
                            <div className="text-gray-600">{log.notes}</div>
                          </div>
                          <div className="text-gray-500 text-xs">
                            {new Date(log.call_time).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Link
                  href={`/tele-calling/assignments/${assignment.id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                >
                  View Details
                </Link>
                {assignment.status !== 'completed' && (
                  <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
                    Log Call
                  </button>
                )}
                {assignment.status === 'follow_up' && (
                  <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 text-sm">
                    Schedule Follow-up
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 