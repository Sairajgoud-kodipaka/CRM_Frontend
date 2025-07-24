'use client';

import { useEffect, useState } from 'react';
import { teamMembersAPI } from '@/lib/api';
import AddMemberModal from '@/components/AddMemberModal';

interface TeamMember {
  id: number;
  employee_id: string;
  user_name: string;
  user_email: string;
  user_role: string;
  user_username: string;
  department: string;
  position: string;
  status: string;
  performance_rating: string;
  sales_target: number;
  current_sales: number;
  sales_percentage: number;
  performance_color: string;
  hire_date: string;
  store_name?: string;
}

export default function ManagersTeamManagement() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTeamMembers = async () => {
    setIsLoading(true);
    try {
      const response = await teamMembersAPI.getTeamMembers();
      setTeamMembers(response.results || response || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Team Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Add Member
        </button>
      </div>
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading team...</div>
      ) : (
        <table className="w-full bg-white rounded-lg shadow overflow-hidden">
          <thead>
            <tr className="bg-blue-50 text-blue-900">
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Username</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Role</th>
              <th className="py-2 px-4 text-left">Store</th>
              <th className="py-2 px-4 text-left">Position</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member) => (
              <tr key={member.id} className="border-b last:border-b-0">
                <td className="py-2 px-4">{member.user_name}</td>
                <td className="py-2 px-4">{member.user_username}</td>
                <td className="py-2 px-4">{member.user_email}</td>
                <td className="py-2 px-4 capitalize">{member.user_role}</td>
                <td className="py-2 px-4">{member.store_name || '-'}</td>
                <td className="py-2 px-4">{member.position}</td>
              </tr>
            ))}
            {teamMembers.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No team members yet.</td></tr>
            )}
          </tbody>
        </table>
      )}
      <AddMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTeamMembers}
      />
    </div>
  );
} 