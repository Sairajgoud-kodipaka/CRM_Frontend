"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { customersAPI } from "@/lib/api";
import toast from "react-hot-toast";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  customer_type: string;
  city: string;
  created_at: string;
  deleted_at: string;
}

export default function CustomersTrashPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    const fetchTrashedCustomers = async () => {
      try {
        const data = await customersAPI.getTrashedCustomers();
        // Accept both paginated and non-paginated responses
        let customersList = [];
        if (Array.isArray(data)) {
          customersList = data;
        } else if (data && Array.isArray(data.results)) {
          customersList = data.results;
        } else if (data && typeof data === 'object') {
          customersList = Object.values(data).flat().filter((item: any) => item && item.id);
        }
        setCustomers(customersList as Customer[]);
      } catch (err: any) {
        setError(err.message || "Failed to fetch trashed customers");
        toast.error("Failed to load trashed customers");
      } finally {
        setLoading(false);
      }
    };
    fetchTrashedCustomers();
  }, []);

  const handleRestore = async (customerId: number) => {
    setActionLoading(customerId);
    try {
      await customersAPI.restoreCustomer(customerId);
      toast.success("Customer restored");
      setCustomers(customers.filter((c) => c.id !== customerId));
    } catch (err: any) {
      toast.error("Failed to restore customer");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (customerId: number) => {
    if (!confirm("Are you sure you want to permanently delete this customer? This cannot be undone.")) return;
    setActionLoading(customerId);
    try {
      await customersAPI.permanentlyDeleteCustomer(customerId);
      toast.success("Customer permanently deleted");
      setCustomers(customers.filter((c) => c.id !== customerId));
    } catch (err: any) {
      toast.error("Failed to permanently delete customer");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900 mb-2">Trashed Customers</h1>
          <p className="text-gray-600">Restore or permanently delete customers from the trash</p>
        </div>
        <Link href="/inhouse-sales/customers">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold">Back to Customers</button>
        </Link>
      </div>
      {loading ? (
        <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center justify-center min-h-[300px]">
          <div className="text-blue-400 text-lg font-semibold">Loading trashed customers...</div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center justify-center min-h-[300px]">
          <div className="text-red-400 text-lg font-semibold mb-4">Error: {error}</div>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center justify-center min-h-[300px]">
          <div className="text-blue-400 text-lg font-semibold mb-4">No trashed customers</div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deleted At</th>
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
                        {customer.deleted_at ? new Date(customer.deleted_at).toLocaleString() : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                      <button
                        onClick={() => handleRestore(customer.id)}
                        disabled={actionLoading === customer.id}
                        className={`px-3 py-1 rounded bg-green-100 text-green-800 hover:bg-green-200 ${actionLoading === customer.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(customer.id)}
                        disabled={actionLoading === customer.id}
                        className={`px-3 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200 ${actionLoading === customer.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Delete Permanently
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