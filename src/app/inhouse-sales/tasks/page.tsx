'use client';

import { useEffect, useState } from 'react';
import { tasksAPI, customersAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    client: '',
    title: '',
    description: '',
    due_date: '',
  });
  const [customers, setCustomers] = useState<any[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
    fetchCustomers();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    try {
      const res = await tasksAPI.getTasks();
      setTasks(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCustomers() {
    try {
      const res = await customersAPI.getCustomers();
      setCustomers(Array.isArray(res) ? res : res.data || []);
    } catch {
      setCustomers([]);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.title || !form.client) {
      setFormError('Please select a customer and enter a title.');
      return;
    }
    try {
      // Only send required fields
      const payload: any = {
        client: Number(form.client),
        title: form.title,
      };
      if (form.description) payload.description = form.description;
      if (form.due_date) payload.due_date = form.due_date;
      await tasksAPI.createTask(payload);
      setForm({ client: '', title: '', description: '', due_date: '' });
      setShowForm(false);
      fetchTasks();
    } catch (err: any) {
      console.error('Task creation error:', err);
      if (err.response && err.response.data) {
        setFormError(JSON.stringify(err.response.data));
      } else {
        toast.error('Failed to add task.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-blue-900 mb-2">My Tasks</h1>
        <p className="text-gray-600">Manage your assigned tasks and customer follow-ups.</p>
      </div>
      <div className="bg-white rounded-xl shadow p-8 min-h-[300px]">
        <div className="mb-4 flex justify-between items-center">
          <span>Filtering options will be available soon.</span>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold" onClick={() => setShowForm(true)}>+ Add Task</button>
        </div>
        <div>
          <h2 className="font-bold mb-2">Task List ({tasks.length})</h2>
          <p className="mb-2 text-gray-500">All tasks assigned to you, including scheduled customer follow-ups.</p>
          <table className="w-full border rounded-lg overflow-hidden">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Due Date</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Related To</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">Loading...</td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">No tasks found.</td>
                </tr>
              ) : (
                tasks.map((task: any) => (
                  <tr key={task.id}>
                    <td className="px-4 py-2">{task.title}</td>
                    <td className="px-4 py-2">{task.due_date || '-'}</td>
                    <td className="px-4 py-2">{task.status || '-'}</td>
                    <td className="px-4 py-2">{task.client_name || task.client || '-'}</td>
                    <td className="px-4 py-2">Edit | Delete</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-blue-50 p-6 rounded shadow space-y-4 mt-4">
            <h3 className="text-lg font-bold mb-2">Add New Task</h3>
            <select name="client" value={form.client} onChange={handleChange} className="w-full px-3 py-2 border rounded" required>
              <option value="">Select Customer</option>
              {customers.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name || `${c.first_name} ${c.last_name}`}</option>
              ))}
            </select>
            <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Task Title" className="w-full px-3 py-2 border rounded" required />
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full px-3 py-2 border rounded" />
            <input type="date" name="due_date" value={form.due_date} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
            {formError && <div className="text-red-600 text-sm mt-2">{formError}</div>}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Add Task</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 