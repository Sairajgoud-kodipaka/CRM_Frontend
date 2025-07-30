'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { followUpsAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  useEffect(() => {
    fetchFollowUps();
  }, [statusFilter, priorityFilter]);

  async function fetchFollowUps() {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (priorityFilter) {
        params.priority = priorityFilter;
      }
      
      console.log('Fetching follow-ups with params:', params);
      const response = await followUpsAPI.getFollowUps(params);
      console.log('Follow-ups response:', response);
      
      const data = response.data;
      
      if (Array.isArray(data)) {
        setFollowUps(data);
      } else if (data && Array.isArray(data.results)) {
        setFollowUps(data.results);
      } else {
        setFollowUps([]);
      }
    } catch (err: any) {
      console.error('Error fetching follow-ups:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      if (err.response?.status === 403) {
        toast.error('Access denied. You do not have permission to view follow-ups.');
      } else if (err.response?.status === 401) {
        toast.error('Authentication required. Please log in again.');
      } else {
        toast.error(err.response?.data?.detail || 'Failed to load follow-ups');
      }
      setFollowUps([]);
    } finally {
      setLoading(false);
    }
  }

  const handleComplete = async (followUpId: number, outcomeNotes?: string) => {
    try {
      await followUpsAPI.completeFollowUp(followUpId, outcomeNotes);
      toast.success('Follow-up completed!');
      fetchFollowUps();
    } catch (err: any) {
      console.error('Error completing follow-up:', err);
      toast.error(err.response?.data?.detail || 'Failed to complete follow-up');
    }
  };

  const handleSendReminder = async (followUpId: number) => {
    try {
      await followUpsAPI.sendReminder(followUpId);
      toast.success('Reminder sent!');
      fetchFollowUps();
    } catch (err: any) {
      console.error('Error sending reminder:', err);
      toast.error(err.response?.data?.detail || 'Failed to send reminder');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityColors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[priority as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800'}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-blue-900 mb-2">Follow-ups</h1>
        <p className="text-gray-600">Manage follow-up tasks and reminders</p>
      </div>
      
      <div className="bg-white rounded-xl shadow p-8 min-h-[300px]">
        {loading ? (
          <div className="text-blue-400 text-lg font-semibold mb-4">Loading follow-ups...</div>
        ) : followUps.length === 0 ? (
          <div className="flex flex-col items-center justify-center">
            <div className="text-blue-400 text-lg font-semibold mb-4">No follow-ups found</div>
            <Link href="/inhouse-sales/appointments/new">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold">+ Create Follow-up</button>
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-bold text-blue-800">Follow-up Tasks</h2>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1 border rounded text-sm"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-1 border rounded text-sm"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <Link href="/inhouse-sales/appointments/new">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold">+ Create Follow-up</button>
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border rounded-lg overflow-hidden">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Customer</th>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Due Date</th>
                    <th className="px-4 py-2 text-left">Priority</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {followUps.map((followUp: any) => (
                    <tr key={followUp.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{followUp.client_name}</div>
                        {followUp.assigned_to_name && (
                          <div className="text-sm text-gray-500">Assigned to: {followUp.assigned_to_name}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{followUp.title}</div>
                        <div className="text-sm text-gray-500 mt-1">{followUp.description}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{new Date(followUp.due_date).toLocaleDateString()}</div>
                        {followUp.due_time && (
                          <div className="text-sm text-gray-500">{followUp.due_time}</div>
                        )}
                        {followUp.is_overdue && (
                          <div className="text-xs text-red-600 mt-1">Overdue</div>
                        )}
                        {followUp.is_due_today && (
                          <div className="text-xs text-orange-600 mt-1">Due Today</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {getPriorityBadge(followUp.priority)}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(followUp.status)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {followUp.type_display || followUp.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {followUp.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleComplete(followUp.id)}
                                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleSendReminder(followUp.id)}
                                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                              >
                                Remind
                              </button>
                            </>
                          )}
                          {followUp.status === 'in_progress' && (
                            <button
                              onClick={() => handleComplete(followUp.id)}
                              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 