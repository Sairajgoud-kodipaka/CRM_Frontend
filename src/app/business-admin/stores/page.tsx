"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { storesAPI } from "@/lib/api";

async function fetchManagerName(managerId: number) {
  if (!managerId) return "-";
  try {
    const res = await fetch(`/api/users/${managerId}`);
    if (!res.ok) return managerId;
    const user = await res.json();
    return user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username || managerId;
  } catch {
    return managerId;
  }
}

export default function StoreListPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [managerNames, setManagerNames] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      try {
        const data = await storesAPI.getStores();
        let storeArr = Array.isArray(data) ? data : (data && Array.isArray(data.results) ? data.results : []);
        setStores(storeArr);
        // Fetch manager names
        const ids = storeArr.map((s: any) => s.manager).filter(Boolean);
        const uniqueIds = Array.from(new Set(ids));
        const nameMap: Record<number, string> = {};
        await Promise.all(uniqueIds.map(async (id) => {
          const numId = Number(id);
          nameMap[numId] = await fetchManagerName(numId);
        }));
        setManagerNames(nameMap);
      } catch (err: any) {
        setError("Failed to load stores");
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Stores</h1>
        <Link href="/business-admin/stores/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ Add Store</Link>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Code</th>
                <th className="px-4 py-2 border">City</th>
                <th className="px-4 py-2 border">State</th>
                <th className="px-4 py-2 border">Manager</th>
                <th className="px-4 py-2 border">Active</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(stores) && stores.length > 0 ? (
                stores.map((store) => (
                  <tr key={store.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border font-medium">{store.name}</td>
                    <td className="px-4 py-2 border">{store.code}</td>
                    <td className="px-4 py-2 border">{store.city}</td>
                    <td className="px-4 py-2 border">{store.state}</td>
                    <td className="px-4 py-2 border">{store.manager ? managerNames[Number(store.manager)] || store.manager : "-"}</td>
                    <td className="px-4 py-2 border">{store.is_active ? "Yes" : "No"}</td>
                    <td className="px-4 py-2 border space-x-2">
                      <Link href={`/business-admin/stores/${store.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                      <Link href={`/business-admin/stores/${store.id}/dashboard`} className="text-green-600 hover:underline">Dashboard</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="text-center py-4">No stores found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 