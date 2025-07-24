'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tenantsAPI } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import GoogleMapsPreview from '@/components/GoogleMapsPreview';

interface TenantFormData {
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
  is_active: boolean;
}

export default function EditTenantPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;
  
  const [formData, setFormData] = useState<TenantFormData>({
    name: '',
    slug: '',
    business_type: '',
    industry: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    google_maps_url: '',
    subscription_plan: 'basic',
    subscription_status: 'active',
    max_users: 5,
    max_storage_gb: 10,
    is_active: true,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        setInitialLoading(true);
        console.log('Fetching tenant with ID:', tenantId);
        const tenant = await tenantsAPI.getTenant(parseInt(tenantId));
        console.log('Fetched tenant:', tenant);
        
        setFormData({
          name: tenant.name || '',
          slug: tenant.slug || '',
          business_type: tenant.business_type || '',
          industry: tenant.industry || '',
          description: tenant.description || '',
          email: tenant.email || '',
          phone: tenant.phone || '',
          address: tenant.address || '',
          website: tenant.website || '',
          google_maps_url: tenant.google_maps_url || '',
          subscription_plan: tenant.subscription_plan || 'basic',
          subscription_status: tenant.subscription_status || 'active',
          max_users: tenant.max_users || 5,
          max_storage_gb: tenant.max_storage_gb || 10,
          is_active: tenant.is_active ?? true,
        });
      } catch (error: any) {
        console.error('Failed to fetch tenant:', error);
        toast.error('Failed to load tenant information');
      } finally {
        setInitialLoading(false);
      }
    };

    if (tenantId) {
      fetchTenant();
    }
  }, [tenantId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    
    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      processedValue = parseInt(value) || 0;
    } else if (name === 'max_users' || name === 'max_storage_gb') {
      processedValue = parseInt(value) || 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Business name is required';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (formData.max_users < 1) {
      newErrors.max_users = 'Max users must be at least 1';
    }
    
    if (formData.max_storage_gb < 1) {
      newErrors.max_storage_gb = 'Storage must be at least 1 GB';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Updating tenant data:', formData);
      console.log('Tenant ID:', tenantId);
      const updatedTenant = await tenantsAPI.updateTenant(parseInt(tenantId), formData);
      
      toast.success(`Tenant ${updatedTenant.name} updated successfully!`);
      
      // Redirect back to tenant detail page
      router.push(`/platform-admin/tenants/${tenantId}`);
      
    } catch (error: any) {
      console.error('Failed to update tenant:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      
      // Handle validation errors from the backend
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle field-specific errors
        if (errorData.slug) {
          toast.error(`Slug error: ${errorData.slug[0]}`);
          setErrors(prev => ({ ...prev, slug: errorData.slug[0] }));
        } else if (errorData.name) {
          toast.error(`Name error: ${errorData.name[0]}`);
          setErrors(prev => ({ ...prev, name: errorData.name[0] }));
        } else if (errorData.email) {
          toast.error(`Email error: ${errorData.email[0]}`);
          setErrors(prev => ({ ...prev, email: errorData.email[0] }));
        } else {
          // Handle other validation errors
          const errorMessages = Object.values(errorData).flat();
          toast.error(errorMessages.join(', '));
        }
      } else {
        toast.error(error.message || 'Failed to update tenant');
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Tenant</h2>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Edit Tenant</h2>
          <p className="text-gray-600">Update tenant information and settings</p>
        </div>
        <Link
          href={`/platform-admin/tenants/${tenantId}`}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          Cancel
        </Link>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Tenant Information</h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Business Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter business name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Slug *</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.slug ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="business-name"
                />
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Business Type</label>
                <select
                  name="business_type"
                  value={formData.business_type}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select business type</option>
                  <option value="jewelry_store">Jewelry Store</option>
                  <option value="goldsmith">Goldsmith</option>
                  <option value="wholesaler">Wholesaler</option>
                  <option value="retailer">Retailer</option>
                  <option value="manufacturer">Manufacturer</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Industry</label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select industry</option>
                  <option value="jewelry">Jewelry</option>
                  <option value="luxury_goods">Luxury Goods</option>
                  <option value="fashion">Fashion</option>
                  <option value="retail">Retail</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Admin Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="admin@business.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Subscription Plan</label>
                <select
                  name="subscription_plan"
                  value={formData.subscription_plan}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="basic">Basic</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Subscription Status</label>
                <select
                  name="subscription_status"
                  value={formData.subscription_status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Users</label>
                <input
                  type="number"
                  name="max_users"
                  value={formData.max_users}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.max_users ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.max_users && (
                  <p className="mt-1 text-sm text-red-600">{errors.max_users}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Storage (GB)</label>
                <input
                  type="number"
                  name="max_storage_gb"
                  value={formData.max_storage_gb}
                  onChange={handleChange}
                  min="1"
                  max="1000"
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.max_storage_gb ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.max_storage_gb && (
                  <p className="mt-1 text-sm text-red-600">{errors.max_storage_gb}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter business description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter business address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Google Maps Location</label>
              <input
                type="url"
                name="google_maps_url"
                value={formData.google_maps_url}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://maps.google.com/..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Paste the Google Maps URL for the business location
              </p>
            </div>
            
            {/* Google Maps Preview */}
            <GoogleMapsPreview 
              mapsUrl={formData.google_maps_url} 
              address={formData.address} 
            />
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Active Tenant
              </label>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Link
                href={`/platform-admin/tenants/${tenantId}`}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Tenant'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 