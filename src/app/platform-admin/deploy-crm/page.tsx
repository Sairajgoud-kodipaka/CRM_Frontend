'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { tenantsAPI } from '@/lib/api';
import Link from 'next/link';
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
  max_users: number;
  max_storage_gb: number;
  admin_username: string;
  admin_email: string;
  admin_password: string;
}

export default function PlatformAdminDeployCRM() {
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
    max_users: 5,
    max_storage_gb: 10,
    admin_username: '',
    admin_email: '',
    admin_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tenants, setTenants] = useState([]);
  const [tenantsLoading, setTenantsLoading] = useState(true);

  // Fetch tenants on component mount
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        console.log('Fetching tenants for deploy page...');
        const data = await tenantsAPI.getTenants();
        console.log('Tenants data for deploy page:', data);
        setTenants(data.results || data || []);
      } catch (error: any) {
        console.error('Failed to fetch tenants:', error);
        console.error('Error details:', error.response?.data);
      } finally {
        setTenantsLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const generateSlug = (name: string) => {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Add timestamp to make it unique
    const timestamp = Date.now().toString().slice(-4);
    return `${baseSlug}-${timestamp}`;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
    
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: '' }));
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
    
    if (!formData.admin_username.trim()) {
      newErrors.admin_username = 'Admin username is required';
    }
    if (!formData.admin_email.trim()) {
      newErrors.admin_email = 'Admin email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.admin_email)) {
      newErrors.admin_email = 'Please enter a valid email address';
    }
    if (!formData.admin_password.trim()) {
      newErrors.admin_password = 'Admin password is required';
    } else if (formData.admin_password.length < 6) {
      newErrors.admin_password = 'Password must be at least 6 characters';
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
      console.log('Sending tenant data:', formData);
      const tenant = await tenantsAPI.createTenant(formData);
      
      toast.success(`CRM deployed successfully for ${tenant.name}!`);
      
      // Reset form
      setFormData({
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
        max_users: 5,
        max_storage_gb: 10,
        admin_username: '',
        admin_email: '',
        admin_password: '',
      });
      
      // Refresh tenants list
      const updatedTenants = await tenantsAPI.getTenants();
      setTenants(updatedTenants.results || updatedTenants || []);
      
    } catch (error: any) {
      console.error('Failed to create tenant:', error);
      
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
        } else if (errorData.admin_username) {
          toast.error(`Admin Username error: ${errorData.admin_username[0]}`);
          setErrors(prev => ({ ...prev, admin_username: errorData.admin_username[0] }));
        } else if (errorData.admin_email) {
          toast.error(`Admin Email error: ${errorData.admin_email[0]}`);
          setErrors(prev => ({ ...prev, admin_email: errorData.admin_email[0] }));
        } else if (errorData.admin_password) {
          toast.error(`Admin Password error: ${errorData.admin_password[0]}`);
          setErrors(prev => ({ ...prev, admin_password: errorData.admin_password[0] }));
        } else {
          // Handle other validation errors
          const errorMessages = Object.values(errorData).flat();
          toast.error(errorMessages.join(', '));
        }
      } else {
        toast.error(error.message || 'Failed to deploy CRM');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Deploy New CRM</h2>
        <p className="text-gray-600">Create and manage new CRM instances for jewelry businesses</p>
      </div>

      {/* Deploy Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">New CRM Deployment</h3>
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
                  onChange={handleNameChange}
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
                  onChange={(e) => {
                    handleChange(e);
                    if (errors.slug) {
                      setErrors(prev => ({ ...prev, slug: '' }));
                    }
                  }}
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
                <label className="block text-sm font-medium text-gray-700">Max Users</label>
                <input
                  type="number"
                  name="max_users"
                  value={formData.max_users}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
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
                placeholder="https://www.business.com"
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of the business"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Admin Username *</label>
              <input
                type="text"
                name="admin_username"
                value={formData.admin_username}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.admin_username ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="admin username"
              />
              {errors.admin_username && (
                <p className="mt-1 text-sm text-red-600">{errors.admin_username}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Admin Email *</label>
              <input
                type="email"
                name="admin_email"
                value={formData.admin_email}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.admin_email ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="admin@email.com"
              />
              {errors.admin_email && (
                <p className="mt-1 text-sm text-red-600">{errors.admin_email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Admin Password *</label>
              <input
                type="password"
                name="admin_password"
                value={formData.admin_password}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.admin_password ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="admin password"
              />
              {errors.admin_password && (
                <p className="mt-1 text-sm text-red-600">{errors.admin_password}</p>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deploying...
                  </div>
                ) : (
                  'Deploy CRM'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Recent Deployments */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Deployments</h3>
        </div>
        <div className="p-6">
          {tenantsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 text-sm mt-2">Loading deployments...</p>
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
                  <button
                    onClick={() => window.open('/platform-admin/dashboard', '_blank')}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View all {tenants.length} deployments →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-sm">No recent deployments</div>
              <p className="text-gray-500 text-xs mt-2">Deployments will appear here once created</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 