'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { appointmentsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function ScheduleAppointmentPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    client: '', // customer ID
    date: '',
    time: '',
    purpose: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    appointmentsAPI.getCustomers()
      .then(res => setCustomers(res.data))
      .catch(() => toast.error('Failed to load customers'));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client || !form.date || !form.time || !form.purpose) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        time: form.time.length === 5 ? form.time + ':00' : form.time,
      };
      await appointmentsAPI.createAppointment(payload);
      toast.success('Appointment scheduled!');
      router.push('/inhouse-sales/appointments');
    } catch (err: any) {
      console.error('Appointment scheduling error:', err);
      if (err.response) {
        console.error('Error response data:', err.response.data);
        toast.error(err.response.data?.detail || err.response.data?.error || 'Failed to schedule appointment');
      } else {
        toast.error('Failed to schedule appointment');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-[#25364b] mb-1">Schedule New Appointment</h1>
              <p className="text-gray-500">Fill in the details to schedule a new appointment.</p>
            </div>
            <Link href="/inhouse-sales/appointments" className="text-orange-500 hover:underline text-sm">&larr; Back to Appointments</Link>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Name *</label>
              <select
                name="client"
                value={form.client}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">Select Customer</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name || `${c.first_name} ${c.last_name}`}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment Date *</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment Time *</label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Purpose / Reason for Appointment *</label>
              <input
                type="text"
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="e.g., Ring selection, Follow-up discussion"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Internal Notes (Optional)</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Any internal notes for this appointment..."
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500 transition font-semibold disabled:opacity-50"
              >
                {loading ? 'Scheduling...' : 'Schedule Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 