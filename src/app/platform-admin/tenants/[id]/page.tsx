'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tenantsAPI } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import DeleteTenantModal from '@/components/DeleteTenantModal';
import GoogleMapsPreview from '@/components/GoogleMapsPreview';

interface Tenant {
  id: number;
  name: string;
  slug: string;
  business_type: string;
  industry: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  google_maps_url: string;
  subscription_plan: string;
  subscription_status: string;
  max_users: number;
  max_storage_gb: number;
  created_at: string;
  updated_at: string;
  subscription_start: string;
  subscription_end: string;
  is_active: boolean;
}

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;
  
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        setLoading(true);
        const data = await tenantsAPI.getTenant(parseInt(tenantId));
        setTenant(data);
      } catch (error: any) {
        console.error('Failed to fetch tenant:', error);
        setError(error.response?.data?.message || 'Failed to load tenant details');
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      fetchTenant();
    }
  }, [tenantId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-red-100 text-red-800',
      'suspended': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getPlanBadgeColor = (plan: string) => {
    const colorMap: { [key: string]: string } = {
      'basic': 'bg-blue-100 text-blue-800',
      'professional': 'bg-purple-100 text-purple-800',
      'enterprise': 'bg-indigo-100 text-indigo-800'
    };
    return colorMap[plan] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tenant Details</h2>
            <p className="text-gray-600">Loading tenant information...</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tenant Details</h2>
            <p className="text-gray-600">Error loading tenant information</p>
          </div>
          <Link
            href="/platform-admin/dashboard"
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Back to Dashboard
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">
            <div className="text-red-500 text-lg mb-2">Error</div>
            <p className="text-gray-600">{error || 'Tenant not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{tenant.name}</h2>
          <p className="text-gray-600">Tenant ID: {tenant.id} • Slug: {tenant.slug}</p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/platform-admin/dashboard"
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Back to Dashboard
          </Link>
          <button
            onClick={() => router.push(`/platform-admin/tenants/${tenant.id}/edit`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Edit Tenant
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Subscription Status</h3>
          <div className="mt-2">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(tenant.subscription_status)}`}>
              {tenant.subscription_status}
            </span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Plan</h3>
          <div className="mt-2">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanBadgeColor(tenant.subscription_plan)}`}>
              {tenant.subscription_plan}
            </span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Max Users</h3>
          <p className="text-2xl font-bold text-gray-900">{tenant.max_users}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Storage Limit</h3>
          <p className="text-2xl font-bold text-gray-900">{tenant.max_storage_gb} GB</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Information */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Name</label>
              <p className="mt-1 text-sm text-gray-900">{tenant.name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Type</label>
              <p className="mt-1 text-sm text-gray-900">{tenant.business_type || 'Not specified'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Industry</label>
              <p className="mt-1 text-sm text-gray-900">{tenant.industry || 'Not specified'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <p className="mt-1 text-sm text-gray-900">{tenant.description || 'No description provided'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <p className="mt-1 text-sm text-gray-900">
                {tenant.website ? (
                  <a href={tenant.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                    {tenant.website}
                  </a>
                ) : (
                  'Not specified'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">
                {tenant.email ? (
                  <a href={`mailto:${tenant.email}`} className="text-blue-600 hover:text-blue-800">
                    {tenant.email}
                  </a>
                ) : (
                  'Not specified'
                )}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="mt-1 text-sm text-gray-900">
                {tenant.phone ? (
                  <a href={`tel:${tenant.phone}`} className="text-blue-600 hover:text-blue-800">
                    {tenant.phone}
                  </a>
                ) : (
                  'Not specified'
                )}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <p className="mt-1 text-sm text-gray-900">{tenant.address || 'Not specified'}</p>
            </div>
            
            {/* Google Maps Preview */}
            <GoogleMapsPreview 
              mapsUrl={tenant.google_maps_url || ''} 
              address={tenant.address || ''} 
            />
          </div>
        </div>

        {/* Subscription Details */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Subscription Details</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Plan</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{tenant.subscription_plan}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{tenant.subscription_status}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Subscription Start</label>
              <p className="mt-1 text-sm text-gray-900">
                {tenant.subscription_start ? formatDate(tenant.subscription_start) : 'Not set'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Subscription End</label>
              <p className="mt-1 text-sm text-gray-900">
                {tenant.subscription_end ? formatDate(tenant.subscription_end) : 'Not set'}
              </p>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">System Information</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tenant ID</label>
              <p className="mt-1 text-sm text-gray-900">{tenant.id}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Slug</label>
              <p className="mt-1 text-sm text-gray-900">{tenant.slug}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Created</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(tenant.created_at)}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Updated</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(tenant.updated_at)}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Active Status</label>
              <p className="mt-1 text-sm text-gray-900">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  tenant.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {tenant.is_active ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Actions</h3>
        </div>
        <div className="p-6">
          <div className="flex space-x-4">
            <button
              onClick={() => router.push(`/platform-admin/tenants/${tenant.id}/edit`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Edit Tenant
            </button>
            <button
              onClick={() => {
                // Store tenant info in localStorage for business admin access
                localStorage.setItem('current_tenant', JSON.stringify({
                  id: tenant.id,
                  name: tenant.name,
                  slug: tenant.slug
                }));
                window.open(`/business-admin/dashboard`, '_blank');
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Access CRM
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Delete Tenant
            </button>
          </div>
        </div>
      </div>
      
      {/* Delete Tenant Modal */}
      <DeleteTenantModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          if (!tenant) return;
          
          setDeleteLoading(true);
          try {
            await tenantsAPI.deleteTenant(tenant.id);
            toast.success(`Tenant ${tenant.name} deleted successfully!`);
            router.push('/platform-admin/dashboard');
          } catch (error: any) {
            console.error('Failed to delete tenant:', error);
            toast.error(error.response?.data?.message || 'Failed to delete tenant');
            setShowDeleteModal(false);
          } finally {
            setDeleteLoading(false);
          }
        }}
        tenantName={tenant?.name || ''}
        loading={deleteLoading}
      />
    </div>
  );
} 