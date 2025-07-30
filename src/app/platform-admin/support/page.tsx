'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { supportAPI } from '@/lib/api';
import toast from 'react-hot-toast';

// Type definitions
interface SupportTicket {
  id: number;
  ticket_id: string;
  title: string;
  summary?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'reopened';
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  is_urgent: boolean;
  created_at: string;
  created_by_name: string;
  tenant_name: string;
  assigned_to_name?: string;
  message_count: number;
}

interface SupportStats {
  total_tickets: number;
  open_tickets: number;
  resolved_today: number;
  avg_response_hours: number;
}

interface Filters {
  status: string;
  priority: string;
  category: string;
  search: string;
}

type PriorityType = 'critical' | 'high' | 'medium' | 'low';
type StatusType = 'open' | 'in_progress' | 'resolved' | 'closed' | 'reopened';

export default function PlatformAdminSupport() {
  const { user, loading } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [stats, setStats] = useState<SupportStats>({
    total_tickets: 0,
    open_tickets: 0,
    resolved_today: 0,
    avg_response_hours: 0
  });
  const [filters, setFilters] = useState<Filters>({
    status: '',
    priority: '',
    category: '',
    search: ''
  });

  useEffect(() => {
    if (user) {
      fetchTickets();
      fetchStats();
    }
  }, [user, filters]);

  const fetchTickets = async () => {
    setDataLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const data = await supportAPI.getTickets(queryParams.toString());
      setTickets(Array.isArray(data) ? data : (data?.results || []));
    } catch (err) {
      console.error('Error fetching tickets:', err);
      toast.error('Failed to fetch support tickets');
    } finally {
      setDataLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await supportAPI.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleAssignToMe = async (ticketId: number) => {
    try {
      await supportAPI.assignTicketToMe(ticketId.toString());
      toast.success('Ticket assigned to you successfully!');
      fetchTickets();
    } catch (err) {
      console.error('Error assigning ticket:', err);
      toast.error('Failed to assign ticket');
    }
  };

  const handleResolveTicket = async (ticketId: number) => {
    try {
      await supportAPI.resolveTicket(ticketId.toString());
      toast.success('Ticket marked as resolved!');
      fetchTickets();
      fetchStats();
    } catch (err) {
      console.error('Error resolving ticket:', err);
      toast.error('Failed to resolve ticket');
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getPriorityColor = (priority: PriorityType): string => {
    const colors: Record<PriorityType, string> = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status: StatusType): string => {
    const colors: Record<StatusType, string> = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      reopened: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.open;
  };

  if (loading) {
    return <div className="p-8 text-blue-600 font-semibold">Loading...</div>;
  }

  if (!user || user.role !== 'platform_admin') {
    return <div className="p-8 text-red-600 font-semibold">Access denied. Only platform admins can view this page.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Support Management</h2>
        <p className="text-gray-600">Manage support tickets and customer inquiries across all tenants</p>
      </div>

      {/* Support Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Open Tickets</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.open_tickets}</p>
          <p className="text-sm text-gray-600">Requires attention</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Resolved Today</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.resolved_today}</p>
          <p className="text-sm text-green-600">Issues resolved</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Avg Response Time</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.avg_response_hours}h</p>
          <p className="text-sm text-gray-600">Last 30 days</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Tickets</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.total_tickets}</p>
          <p className="text-sm text-gray-600">All time</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="reopened">Reopened</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="technical">Technical Issue</option>
              <option value="billing">Billing & Subscription</option>
              <option value="feature_request">Feature Request</option>
              <option value="bug_report">Bug Report</option>
              <option value="general">General Inquiry</option>
              <option value="integration">Integration Issue</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search tickets..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Support Tickets</h3>
        </div>
        <div className="p-6">
          {dataLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 text-sm mt-2">Loading tickets...</p>
            </div>
          ) : tickets.length > 0 ? (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">
                          <Link href={`/platform-admin/support/${ticket.id}`} className="hover:text-blue-600">
                            {ticket.ticket_id} - {ticket.title}
                          </Link>
                        </h4>
                        {ticket.is_urgent && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            URGENT
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        From: {ticket.created_by_name} ({ticket.tenant_name})
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{ticket.message_count} messages</span>
                        {ticket.assigned_to_name && (
                          <>
                            <span>•</span>
                            <span>Assigned to {ticket.assigned_to_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
                    {!ticket.assigned_to_name && (
                      <button
                        onClick={() => handleAssignToMe(ticket.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                      >
                        Assign to Me
                      </button>
                    )}
                    {ticket.status === 'open' && ticket.assigned_to_name && (
                      <button
                        onClick={() => handleResolveTicket(ticket.id)}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                      >
                        Mark Resolved
                      </button>
                    )}
                    <Link
                      href={`/platform-admin/support/${ticket.id}`}
                      className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-sm">No support tickets found</div>
              <p className="text-gray-500 text-xs mt-2">Tickets will appear here once submitted by business admins</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/platform-admin/support/settings"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <h4 className="font-medium text-gray-900">Support Settings</h4>
              <p className="text-sm text-gray-600">Configure response times and notifications</p>
            </Link>
            <Link
              href="/platform-admin/support/reports"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <h4 className="font-medium text-gray-900">View Reports</h4>
              <p className="text-sm text-gray-600">Support analytics and performance</p>
            </Link>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <h4 className="font-medium text-gray-900">Export Data</h4>
              <p className="text-sm text-gray-600">Export ticket data for analysis</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 