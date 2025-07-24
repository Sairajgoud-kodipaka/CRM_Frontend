'use client';

import { useRouter } from 'next/navigation';

const roles = [
  { name: 'Platform Admin', slug: 'platform-admin', description: 'Deploy/manage CRMs, analytics, support' },
  { name: 'Business Admin', slug: 'business-admin', description: 'Store dashboard, team, catalogue, pipeline' },
  { name: 'Managers', slug: 'managers', description: 'Team management, sales funnel, customer DB' },
  { name: 'In-house Sales', slug: 'inhouse-sales', description: 'Sales dashboard, add customer, announcements' },
  { name: 'Tele-calling Team', slug: 'tele-calling', description: 'Tele-calling, sales funnel, dashboard' },
  { name: 'Marketing Team', slug: 'marketing', description: 'Ecom, WhatsApp, dashboard' },
];

export default function SelectRolePage() {
  const router = useRouter();

  const handleSelect = (role: string) => {
    localStorage.setItem('selected_role', role);
    router.push(`/login?role=${role}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-2xl flex flex-col items-center">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">Select Your Role</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {roles.map((role) => (
            <button
              key={role.slug}
              onClick={() => handleSelect(role.slug)}
              className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-6 flex flex-col items-start shadow transition group"
            >
              <span className="text-lg font-semibold text-blue-800 group-hover:text-blue-900">{role.name}</span>
              <span className="text-sm text-gray-500 mt-2">{role.description}</span>
            </button>
          ))}
        </div>
        <p className="mt-8 text-gray-400 text-xs">&copy; {new Date().getFullYear()} Jewel OS CRM</p>
      </div>
    </div>
  );
} 