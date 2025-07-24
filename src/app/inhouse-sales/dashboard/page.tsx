'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { customersAPI } from '@/lib/api';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
}

export default function InhouseSalesDashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  useEffect(() => {
    customersAPI.getCustomers().then(res => {
      setCustomers(res.results || res);
    });
  }, []);

  return (
    <div className="space-y-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen p-4 md:p-8">
      <div>
        <h2 className="text-3xl font-extrabold text-blue-900 drop-shadow-sm mb-1">In-house Sales Dashboard</h2>
        <p className="text-lg text-blue-700/80 font-medium">Overview of your in-house sales performance and activity</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-blue-100 hover:shadow-2xl transition">
          <div className="mb-2">
            <div className="text-blue-500 text-sm font-semibold">Total Sales</div>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-blue-900">$0</p>
            <p className="text-sm text-blue-400">No sales data</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-blue-100 hover:shadow-2xl transition">
          <div className="mb-2">
            <div className="text-blue-500 text-sm font-semibold">Active Customers</div>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-blue-900">{customers.filter(c => c.is_active).length}</p>
            <p className="text-sm text-blue-400">{customers.length === 0 ? 'No customers' : 'Active customers'}</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-blue-100 hover:shadow-2xl transition">
          <div className="mb-2">
            <div className="text-blue-500 text-sm font-semibold">Orders</div>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-blue-900">0</p>
            <p className="text-sm text-blue-400">No orders</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-blue-100 hover:shadow-2xl transition">
          <div className="mb-2">
            <div className="text-blue-500 text-sm font-semibold">Announcements</div>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-blue-900">0</p>
            <p className="text-sm text-blue-400">No announcements</p>
          </div>
        </div>
      </div>

      {/* Recent Customers */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-blue-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-blue-900">Recent Customers</h3>
          <Link href="/inhouse-sales/customers" className="text-blue-600 hover:underline font-medium">View All</Link>
        </div>
        {customers.length === 0 ? (
          <div className="text-blue-400 text-center py-8">No customers yet.</div>
        ) : (
          <ul className="divide-y divide-blue-100">
            {customers.slice(0, 5).map((c) => (
              <li key={c.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold text-blue-900">{c.name}</div>
                  <div className="text-sm text-blue-500">{c.email}</div>
                  <div className="text-sm text-blue-400">{c.phone}</div>
                </div>
                <div className="mt-2 md:mt-0">
                  <Link href={`/inhouse-sales/customers/${c.id}`} className="text-blue-600 hover:underline text-sm">View</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 