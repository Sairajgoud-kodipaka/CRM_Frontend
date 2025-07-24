'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { customersAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  customer_type: string;
  city: string;
  total_purchases: number;
  last_purchase_date: string;
  is_active: boolean;
  created_at: string;
  tags: { name: string; slug: string }[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        console.log('=== FETCHING CUSTOMERS ===');
        const data = await customersAPI.getCustomers();
        console.log('Customers data:', data);
        setCustomers(data.results || data || []);
      } catch (err: any) {
        console.error('Error fetching customers:', err);
        setError(err.message || 'Failed to fetch customers');
        toast.error('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleViewCustomer = (customerId: number) => {
    console.log('Viewing customer:', customerId);
    // Redirect to customer detail page
    window.location.href = `/inhouse-sales/customers/${customerId}`;
  };

  const handleEditCustomer = (customerId: number) => {
    console.log('Editing customer:', customerId);
    // Redirect to edit page (you'll need to create this page)
    window.location.href = `/inhouse-sales/customers/${customerId}/edit`;
  };

  const handleDeleteCustomer = async (customerId: number, customerName: string) => {
    if (!confirm(`Are you sure you want to delete customer "${customerName}"?`)) {
      return;
    }

    setDeleteLoading(customerId);
    try {
      await customersAPI.deleteCustomer(customerId);
      toast.success(`Customer "${customerName}" deleted successfully`);
      // Refresh the customers list
      const updatedCustomers = customers.filter(c => c.id !== customerId);
      setCustomers(updatedCustomers);
    } catch (err: any) {
      console.error('Error deleting customer:', err);
      toast.error('Failed to delete customer');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
        <h1 className="text-3xl font-extrabold text-blue-900 mb-2">Customers</h1>
        <p className="text-gray-600 mb-8">Manage your customer relationships and sales pipeline</p>
        <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center justify-center min-h-[300px]">
          <div className="text-blue-400 text-lg font-semibold">Loading customers...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
        <h1 className="text-3xl font-extrabold text-blue-900 mb-2">Customers</h1>
        <p className="text-gray-600 mb-8">Manage your customer relationships and sales pipeline</p>
        <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center justify-center min-h-[300px]">
          <div className="text-red-400 text-lg font-semibold mb-4">Error: {error}</div>
          <Link href="/inhouse-sales/add-customer">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold">+ Add New Customer</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900 mb-2">Customers</h1>
          <p className="text-gray-600">Manage your customer relationships and sales pipeline</p>
        </div>
        <Link href="/inhouse-sales/add-customer">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold">+ Add New Customer</button>
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center justify-center min-h-[300px]">
          <div className="text-blue-400 text-lg font-semibold mb-4">No customers found</div>
          <Link href="/inhouse-sales/add-customer">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold">+ Add New Customer</button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {customer.customer_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {customer.tags && customer.tags.length > 0 ? (
                          customer.tags.map((tag: any) => (
                            <span key={tag.slug} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              {tag.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">No tags</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleViewCustomer(customer.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleEditCustomer(customer.id)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                        disabled={deleteLoading === customer.id}
                        className={`${deleteLoading === customer.id ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-900'}`}
                      >
                        {deleteLoading === customer.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 