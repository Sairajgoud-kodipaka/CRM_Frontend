'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, FunnelIcon, MagnifyingGlassIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { escalationAPI } from '@/lib/api';

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
  due_date: string;
  is_overdue: boolean;
  sla_hours: number;
}

export default function EscalationManagement() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_escalations: 0,
    open_escalations: 0,
    overdue_escalations: 0,
    resolved_today: 0,
    avg_resolution_time: 0,
    sla_compliance_rate: 0,
  });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchEscalations();
    fetchStats();
  }, [debouncedSearchTerm, statusFilter, priorityFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
  };

  const fetchEscalations = async () => {
    try {
      const params: any = {};
      
      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (priorityFilter) {
        params.priority = priorityFilter;
      }
      
      const data = await escalationAPI.getEscalations(params);
      setEscalations(data.results || data);
    } catch (error) {
      console.error('Error fetching escalations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await escalationAPI.getEscalationStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending_customer': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Escalation Management</h1>
          <p className="text-gray-600">Manage customer issues and escalations</p>
        </div>
        <Link
          href="/escalation/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Escalation
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
                             <ExclamationTriangleIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Escalations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_escalations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Open Escalations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.open_escalations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
                             <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overdue_escalations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Resolved Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.resolved_today}</p>
            </div>
          </div>
        </div>
      </div>

             {/* Filters and Search */}
       <div className="bg-white p-6 rounded-lg shadow">
         <div className="flex flex-col sm:flex-row gap-4">
           <div className="flex-1">
             <div className="relative">
               <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
               <input
                 type="text"
                 placeholder="Search escalations..."
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
               <option value="open">Open</option>
               <option value="in_progress">In Progress</option>
               <option value="pending_customer">Pending Customer</option>
               <option value="resolved">Resolved</option>
               <option value="closed">Closed</option>
             </select>
             <select 
               value={priorityFilter}
               onChange={(e) => setPriorityFilter(e.target.value)}
               className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
             >
               <option value="">All Priority</option>
               <option value="urgent">Urgent</option>
               <option value="high">High</option>
               <option value="medium">Medium</option>
               <option value="low">Low</option>
             </select>
             <button
               onClick={clearFilters}
               className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
             >
               Clear
             </button>
           </div>
         </div>
       </div>

      {/* Escalations List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Escalations</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {escalations.length === 0 ? (
            <div className="px-6 py-12 text-center">
                             <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No escalations</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new escalation.</p>
            </div>
          ) : (
            escalations.map((escalation) => (
              <div key={escalation.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900">
                        <Link href={`/escalation/${escalation.id}`} className="hover:text-blue-600">
                          {escalation.title}
                        </Link>
                      </h4>
                      {escalation.is_overdue && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Overdue
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{escalation.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>Client: {escalation.client_name || escalation.client.name}</span>
                      <span>Created by: {escalation.created_by.username}</span>
                      {escalation.assigned_to && (
                        <span>Assigned to: {escalation.assigned_to.username}</span>
                      )}
                      <span>Created: {formatDate(escalation.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(escalation.priority)}`}>
                      {escalation.priority}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(escalation.status)}`}>
                      {escalation.status.replace('_', ' ')}
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