"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { storesAPI } from "@/lib/api";

export default function StoreDashboardPage() {
  const params = useParams();
  const storeId = Number(params?.id);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const data = await storesAPI.getDashboard(storeId);
        setDashboard(data);
      } catch (err) {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    if (storeId) fetchDashboard();
  }, [storeId]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Store Dashboard</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : dashboard ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded shadow p-4">
            <div className="text-gray-500">Total Customers</div>
            <div className="text-2xl font-bold">{dashboard.total_customers ?? '-'}</div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="text-gray-500">Appointments</div>
            <div className="text-2xl font-bold">{dashboard.total_appointments ?? '-'}</div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="text-gray-500">Conversion Rate</div>
            <div className="text-2xl font-bold">{dashboard.conversion_rate ? `${dashboard.conversion_rate}%` : '-'}</div>
          </div>
        </div>
      ) : null}
      {/* Placeholder for charts/analytics */}
      <div className="bg-white rounded shadow p-6 text-center text-gray-400">[Charts & KPIs coming soon]</div>
    </div>
  );
} 