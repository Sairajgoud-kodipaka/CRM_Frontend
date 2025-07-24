'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authAPI } from '@/lib/api';
import Link from 'next/link';

const roleDashboards: Record<string, string> = {
  'platform-admin': '/platform-admin/dashboard',
  'business-admin': '/business-admin/dashboard',
  'managers': '/managers/dashboard',
  'inhouse-sales': '/inhouse-sales/dashboard',
  'tele-calling': '/tele-calling/dashboard',
  'marketing': '/marketing/dashboard',
};

const roleLabels: Record<string, string> = {
  'platform-admin': 'Platform Admin',
  'business-admin': 'Business Admin',
  'managers': 'Managers',
  'inhouse-sales': 'In-house Sales',
  'tele-calling': 'Tele-calling Team',
  'marketing': 'Marketing Team',
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const qRole = searchParams.get('role');
    if (qRole) {
      setRole(qRole);
      localStorage.setItem('selected_role', qRole);
    } else {
      const stored = localStorage.getItem('selected_role');
      if (stored) setRole(stored);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await authAPI.login({ username, password });
      // Store user info and tokens
      localStorage.setItem('user', JSON.stringify(result.user));
      // Redirect to dashboard for this role
      const dashboard = roleDashboards[role] || '/';
      router.push(dashboard);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <h2 className="text-2xl font-bold text-blue-700 mb-2">Login</h2>
        <p className="mb-6 text-gray-500">{roleLabels[role] || 'Select your role'}</p>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username or Email</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="mt-4 w-full flex justify-between items-center">
          <Link href="/select-role" className="text-blue-600 hover:underline text-sm">Change Role</Link>
          <Link href={`/register?role=${role}`} className="text-blue-600 hover:underline text-sm">Register</Link>
        </div>
      </div>
    </div>
  );
} 