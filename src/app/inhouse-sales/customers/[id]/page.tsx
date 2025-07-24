'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { customersAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  customer_type: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  date_of_birth: string;
  anniversary_date: string;
  notes: string;
  preferred_metal: string;
  preferred_stone: string;
  ring_size: string;
  budget_range: string;
  community: string;
  lead_source: string;
  reason_for_visit: string;
  age_of_end_user: string;
  next_follow_up: string;
  summary_notes: string;
  customer_interests: any[];
  created_at: string;
  updated_at: string;
  tags: any[]; // Added tags to the interface
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const data = await customersAPI.getCustomer(parseInt(customerId));
        setCustomer(data);
      } catch (err: any) {
        console.error('Error fetching customer:', err);
        setError(err.message || 'Failed to fetch customer');
        toast.error('Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  const handleDelete = async () => {
    if (!customer) return;
    
    if (!confirm(`Are you sure you want to delete customer "${customer.name}"?`)) {
      return;
    }

    try {
      await customersAPI.deleteCustomer(customer.id);
      toast.success(`Customer "${customer.name}" deleted successfully`);
      router.push('/inhouse-sales/customers');
    } catch (err: any) {
      console.error('Error deleting customer:', err);
      toast.error('Failed to delete customer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
        <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center justify-center min-h-[300px]">
          <div className="text-blue-400 text-lg font-semibold">Loading customer details...</div>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
        <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center justify-center min-h-[300px]">
          <div className="text-red-400 text-lg font-semibold mb-4">
            {error || 'Customer not found'}
          </div>
          <Link href="/inhouse-sales/customers">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold">
              Back to Customers
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900 mb-2">Customer Details</h1>
          <p className="text-gray-600">View and manage customer information</p>
          {/* Tags Badges */}
          <div className="mt-2 flex flex-wrap gap-2">
            {customer.tags && customer.tags.length > 0 ? (
              customer.tags.map((tag: any) => (
                <span key={tag.slug} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {tag.name}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-xs">No tags assigned</span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/inhouse-sales/customers/${customer.id}/edit`}>
            <button className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-semibold">
              Edit Customer
            </button>
          </Link>
          <button 
            onClick={handleDelete}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-semibold"
          >
            Delete Customer
          </button>
          <Link href="/inhouse-sales/customers">
            <button className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition font-semibold">
              Back to Customers
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-lg font-semibold text-gray-900">{customer.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{customer.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{customer.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer Type</label>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {customer.customer_type}
                  </span>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Address</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900">{customer.address || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">City</label>
                  <p className="text-gray-900">{customer.city || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">State</label>
                  <p className="text-gray-900">{customer.state || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Country</label>
                  <p className="text-gray-900">{customer.country || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Jewelry Preferences */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Jewelry Preferences</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Preferred Metal</label>
                  <p className="text-gray-900">{customer.preferred_metal || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Preferred Stone</label>
                  <p className="text-gray-900">{customer.preferred_stone || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ring Size</label>
                  <p className="text-gray-900">{customer.ring_size || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Budget Range</label>
                  <p className="text-gray-900">{customer.budget_range || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Demographics & Visit */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Demographics & Visit</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Community</label>
                  <p className="text-gray-900">{customer.community || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Lead Source</label>
                  <p className="text-gray-900">{customer.lead_source || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Reason for Visit</label>
                  <p className="text-gray-900">{customer.reason_for_visit || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Age of End User</label>
                  <p className="text-gray-900">{customer.age_of_end_user || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes and Follow-up */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes & Follow-up</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-sm font-medium text-gray-500">Notes</label>
                <p className="text-gray-900 mt-1">{customer.notes || 'No notes available'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Next Follow-up</label>
                <p className="text-gray-900 mt-1">{customer.next_follow_up || 'Not scheduled'}</p>
              </div>
            </div>
          </div>

          {/* Customer Interests */}
          {customer.customer_interests && customer.customer_interests.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Interests</h2>
              <div className="space-y-4">
                {customer.customer_interests.map((interest, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Interest #{index + 1}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Main Category</label>
                        <p className="text-gray-900">{interest.mainCategory || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Preferences</label>
                        <div className="space-y-1">
                          {interest.preferences?.designSelected && <p className="text-sm text-gray-900">• Design Selected</p>}
                          {interest.preferences?.wantsDiscount && <p className="text-sm text-gray-900">• Wants More Discount</p>}
                          {interest.preferences?.checkingOthers && <p className="text-sm text-gray-900">• Checking Other Jewellers</p>}
                          {interest.preferences?.lessVariety && <p className="text-sm text-gray-900">• Felt Less Variety</p>}
                        </div>
                      </div>
                    </div>
                    {interest.other && (
                      <div className="mt-3">
                        <label className="text-sm font-medium text-gray-500">Other Preferences</label>
                        <p className="text-gray-900">{interest.other}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <label className="font-medium">Created:</label>
                <p>{new Date(customer.created_at).toLocaleString()}</p>
              </div>
              <div>
                <label className="font-medium">Last Updated:</label>
                <p>{new Date(customer.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 