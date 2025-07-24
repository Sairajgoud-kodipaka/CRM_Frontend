'use client';


import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rawApiResponse, setRawApiResponse] = useState<any>(null);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const token = localStorage.getItem('access_token');
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://jewelry-crm-backend.onrender.com/api';
        const res = await fetch(
          apiBase + '/clients/appointments/',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const data = await res.json();
        setRawApiResponse(data);
        if (Array.isArray(data)) {
          setAppointments(data);
        } else if (data && Array.isArray(data.results)) {
          setAppointments(data.results);
        } else {
          setAppointments([]);
        }
      } catch (err) {
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-blue-900 mb-2">Appointments</h1>
        <p className="text-gray-600">Manage your customer appointments and meetings</p>
      </div>
      <div className="bg-white rounded-xl shadow p-8 min-h-[300px]">
        {loading ? (
          <div className="text-blue-400 text-lg font-semibold mb-4">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center">
            <div className="text-blue-400 text-lg font-semibold mb-4">No appointments found</div>
            <Link href="/inhouse-sales/appointments/new">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold">+ Schedule New Appointment</button>
            </Link>
            {rawApiResponse && (
              <div className="mt-6 text-xs text-gray-500 break-all max-w-xl">
                <strong>Raw API response:</strong>
                <pre>{JSON.stringify(rawApiResponse, null, 2)}</pre>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-blue-800">Scheduled Appointments</h2>
              <Link href="/inhouse-sales/appointments/new">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold">+ Schedule New Appointment</button>
              </Link>
            </div>
            <table className="w-full border rounded-lg overflow-hidden">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-4 py-2 text-left">Customer</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Time</th>
                  <th className="px-4 py-2 text-left">Purpose</th>
                  <th className="px-4 py-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt: any) => (
                  <tr key={appt.id} className="border-b">
                    <td className="px-4 py-2">{appt.client_name || appt.client?.name || appt.client || '-'}</td>
                    <td className="px-4 py-2">{appt.date}</td>
                    <td className="px-4 py-2">{appt.time}</td>
                    <td className="px-4 py-2">{appt.purpose}</td>
                    <td className="px-4 py-2">{appt.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 
