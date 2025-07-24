"use client";

import { useEffect, useState } from "react";
import { storesAPI } from "@/lib/api";

export default function SettingsStores() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editStore, setEditStore] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deactivateStore, setDeactivateStore] = useState<any | null>(null);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});
  const [formError, setFormError] = useState<string | null>(null);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const data = await storesAPI.getStores();
      setStores(Array.isArray(data) ? data : (data && Array.isArray(data.results) ? data.results : []));
    } catch (err: any) {
      setError("Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStores(); }, []);

  // Edit logic
  const openEdit = (store: any) => {
    setEditStore(store);
    setForm({ ...store });
    setFormError(null);
    setShowEditModal(true);
  };
  const closeEdit = () => {
    setShowEditModal(false);
    setEditStore(null);
    setForm({});
    setFormError(null);
  };
  const handleEditChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };
  const handleEditSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await storesAPI.updateStore(editStore.id, form);
      closeEdit();
      fetchStores();
    } catch (err: any) {
      setFormError("Failed to update store");
    } finally {
      setSaving(false);
    }
  };

  // Deactivate logic
  const openDeactivate = (store: any) => {
    setDeactivateStore(store);
    setShowDeactivateConfirm(true);
  };
  const closeDeactivate = () => {
    setDeactivateStore(null);
    setShowDeactivateConfirm(false);
  };
  const handleDeactivate = async () => {
    if (!deactivateStore) return;
    setSaving(true);
    try {
      await storesAPI.updateStore(deactivateStore.id, { is_active: false });
      closeDeactivate();
      fetchStores();
    } catch (err: any) {
      setError("Failed to deactivate store");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Store Management</h2>
      <p className="mb-4 text-gray-700">Manage your stores/outlets, assign managers, and configure store details here.</p>
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
                stores.map((store: any) => (
                  <tr key={store.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border font-medium">{store.name}</td>
                    <td className="px-4 py-2 border">{store.code}</td>
                    <td className="px-4 py-2 border">{store.city}</td>
                    <td className="px-4 py-2 border">{store.state}</td>
                    <td className="px-4 py-2 border">{store.manager || "-"}</td>
                    <td className="px-4 py-2 border">{store.is_active ? "Yes" : "No"}</td>
                    <td className="px-4 py-2 border space-x-2">
                      <button className="text-blue-600 hover:underline" onClick={() => openEdit(store)}>Edit</button>
                      {store.is_active && (
                        <button className="text-red-600 hover:underline" onClick={() => openDeactivate(store)}>Deactivate</button>
                      )}
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <h3 className="text-lg font-bold mb-4">Edit Store</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block font-medium">Name</label>
                <input name="name" value={form.name || ''} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block font-medium">Code</label>
                <input name="code" value={form.code || ''} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block font-medium">City</label>
                <input name="city" value={form.city || ''} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block font-medium">State</label>
                <input name="state" value={form.state || ''} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block font-medium">Manager (User ID)</label>
                <input name="manager" value={form.manager || ''} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
              </div>
              {formError && <div className="text-red-600">{formError}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeEdit} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation */}
      {showDeactivateConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <h3 className="text-lg font-bold mb-4">Deactivate Store</h3>
            <p className="mb-6">Are you sure you want to deactivate <span className="font-semibold">{deactivateStore?.name}</span>?</p>
            <div className="flex justify-end gap-2">
              <button onClick={closeDeactivate} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={handleDeactivate} disabled={saving} className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50">{saving ? 'Deactivating...' : 'Deactivate'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 