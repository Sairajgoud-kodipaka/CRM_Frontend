'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { tenantsAPI } from '@/lib/api';

export default function PlatformAdminDashboard() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        console.log('Fetching tenants...');
        const data = await tenantsAPI.getTenants();
        console.log('Tenants data:', data);
        setTenants(data.results || data || []);
      } catch (error: any) {
        console.error('Failed to fetch tenants:', error);
        console.error('Error details:', error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((tenant: any) => tenant.subscription_status === 'active').length;
  
  // Debug information
  console.log('Dashboard state:', { totalTenants, activeTenants, tenants, loading });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Platform Dashboard</h2>
        <p className="text-gray-600">Overview of all CRM deployments and system health</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total CRMs Deployed</h3>
          <p className="text-3xl font-bold text-gray-900">{loading ? '...' : totalTenants}</p>
          <p className="text-sm text-gray-600">{loading ? 'Loading...' : 'Active deployments'}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Subscriptions</h3>
          <p className="text-3xl font-bold text-gray-900">{loading ? '...' : activeTenants}</p>
          <p className="text-sm text-gray-600">{loading ? 'Loading...' : 'Active subscriptions'}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">System Uptime</h3>
          <p className="text-3xl font-bold text-gray-900">99.9%</p>
          <p className="text-sm text-green-600">Last 30 days</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Support Tickets</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600">No tickets</p>
        </div>
      </div>

      {/* Recent Tenants */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Recent Deployments</h3>
            <Link
              href="/platform-admin/deploy-crm"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              Deploy New CRM
            </Link>
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 text-sm mt-2">Loading tenants...</p>
            </div>
          ) : tenants.length > 0 ? (
            <div className="space-y-4">
              {tenants.slice(0, 5).map((tenant: any) => (
                <div key={tenant.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{tenant.name}</h4>
                    <p className="text-sm text-gray-600">{tenant.business_type || 'Jewelry Business'}</p>
                    <p className="text-xs text-gray-500">Created {new Date(tenant.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      tenant.subscription_status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {tenant.subscription_status}
                    </span>
                    <Link
                      href={`/platform-admin/tenants/${tenant.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
              {tenants.length > 5 && (
                <div className="text-center pt-4">
                  <Link
                    href="/platform-admin/tenants"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View all {totalTenants} tenants →
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-sm">No tenants deployed yet</div>
              <p className="text-gray-500 text-xs mt-2">Deploy your first CRM to get started</p>
              <Link
                href="/platform-admin/deploy-crm"
                className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
              >
                Deploy First CRM
              </Link>
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
              href="/platform-admin/deploy-crm"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <h4 className="font-medium text-gray-900">Deploy New CRM</h4>
              <p className="text-sm text-gray-600">Create a new CRM instance</p>
            </Link>
            <Link
              href="/platform-admin/analytics"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <h4 className="font-medium text-gray-900">View Analytics</h4>
              <p className="text-sm text-gray-600">Platform usage statistics</p>
            </Link>
            <Link
              href="/platform-admin/support"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <h4 className="font-medium text-gray-900">Support</h4>
              <p className="text-sm text-gray-600">Manage support tickets</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 