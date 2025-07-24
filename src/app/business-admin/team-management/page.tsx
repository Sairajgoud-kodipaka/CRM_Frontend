'use client';

import { useState, useEffect } from 'react';
import { teamMembersAPI, storesAPI } from '@/lib/api';
import AddMemberModal from '@/components/AddMemberModal';
import EditMemberModal from '@/components/EditMemberModal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

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
  store_name?: string; // Added store_name to the interface
}

export default function TeamManagement() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('');

  // Calculate stats
  const totalMembers = teamMembers.length;
  const activeMembers = teamMembers.filter(member => member.status === 'active').length;
  const totalSales = teamMembers.reduce((sum, member) => sum + member.current_sales, 0);
  const avgPerformance = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await teamMembersAPI.getTeamMembers();
      setTeamMembers(response.results || response || []);
    } catch (err: any) {
      console.error('Error fetching team members:', err);
      setError('Failed to load team members');
      // For demo purposes, show some mock data
      setTeamMembers([
        {
          id: 1,
          employee_id: '1001',
          user_name: 'John Doe',
          user_email: 'john.doe@example.com',
          user_role: 'Manager',
          user_username: 'john.doe',
          department: 'Sales',
          position: 'Sales Manager',
          status: 'active',
          performance_rating: 'excellent',
          sales_target: 50000,
          current_sales: 45000,
          sales_percentage: 90,
          performance_color: 'text-green-600',
          hire_date: '2024-01-15',
          store_name: 'Store A'
        },
        {
          id: 2,
          employee_id: '1002',
          user_name: 'Jane Smith',
          user_email: 'jane.smith@example.com',
          user_role: 'In-house Sales',
          user_username: 'jane.smith',
          department: 'Sales',
          position: 'Sales Representative',
          status: 'active',
          performance_rating: 'good',
          sales_target: 30000,
          current_sales: 28000,
          sales_percentage: 93,
          performance_color: 'text-blue-600',
          hire_date: '2024-01-16',
          store_name: 'Store B'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
    // Fetch stores for filter dropdown
    const fetchStores = async () => {
      try {
        const data = await storesAPI.getStores();
        setStores(Array.isArray(data) ? data : (data && Array.isArray(data.results) ? data.results : []));
      } catch {}
    };
    fetchStores();
  }, []);

  const handleAddMember = () => {
    setIsModalOpen(true);
  };

  const handleMemberAdded = () => {
    fetchTeamMembers();
  };

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const handleMemberEdited = () => {
    fetchTeamMembers();
    setSelectedMember(null);
  };

  const handleRemoveMember = (member: TeamMember) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;
    
    try {
      setIsDeleting(true);
      await teamMembersAPI.deleteTeamMember(memberToDelete.id);
      await fetchTeamMembers();
      setIsDeleteModalOpen(false);
      setMemberToDelete(null);
    } catch (error: any) {
      console.error('Error deleting team member:', error);
      alert(error.response?.data?.message || 'Failed to delete team member');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setMemberToDelete(null);
  };

  const getStatusBadgeColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-red-100 text-red-800',
      'suspended': 'bg-yellow-100 text-yellow-800',
      'on_leave': 'bg-gray-100 text-gray-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusDisplayName = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'active': 'Active',
      'inactive': 'Inactive',
      'suspended': 'Suspended',
      'on_leave': 'On Leave'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Filter team members by selected store
  const filteredMembers = selectedStore
    ? teamMembers.filter(m => m.store_name === selectedStore)
    : teamMembers;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
        <p className="text-gray-600">Manage your sales team and their performance</p>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Team Members</h3>
          <p className="text-3xl font-bold text-gray-900">{totalMembers}</p>
          <p className="text-sm text-gray-600">
            {totalMembers === 0 ? 'No team members' : `${totalMembers} member${totalMembers !== 1 ? 's' : ''}`}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Members</h3>
          <p className="text-3xl font-bold text-gray-900">{activeMembers}</p>
          <p className="text-sm text-gray-600">
            {activeMembers === 0 ? 'No active members' : `${activeMembers} active`}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Sales</h3>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalSales)}</p>
          <p className="text-sm text-gray-600">
            {totalSales === 0 ? 'No sales data' : 'This month'}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Avg Performance</h3>
          <p className="text-3xl font-bold text-gray-900">{avgPerformance}%</p>
          <p className="text-sm text-gray-600">
            {avgPerformance === 0 ? 'No performance data' : 'Team average'}
          </p>
        </div>
      </div>

      {/* Store Filter Dropdown */}
      <div className="mb-4 flex items-center gap-4">
        <label htmlFor="store-filter" className="font-medium">Store:</label>
        <select
          id="store-filter"
          value={selectedStore}
          onChange={e => setSelectedStore(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">All Stores</option>
          {stores.map(store => (
            <option key={store.id} value={store.name}>{store.name}</option>
          ))}
        </select>
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
            <button 
              onClick={handleAddMember}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Member
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 text-sm mt-2">Loading team members...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-400 text-sm">{error}</div>
              <button 
                onClick={fetchTeamMembers}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                Try again
              </button>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-sm">No team members found for this store.</div>
              <p className="text-gray-500 text-xs mt-2">Add your first team member to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Store
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {member.user_name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {member.user_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {member.user_email}
                            </div>
                            <div className="text-xs text-gray-400">
                              ID: {member.employee_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.user_role}</div>
                        <div className="text-sm text-gray-500">{member.position}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.department || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(member.status)}`}>
                          {getStatusDisplayName(member.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* Display store name if available, else '-' */}
                        {member.store_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleEditMember(member)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleRemoveMember(member)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredMembers.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-4">No team members found for this store.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Performance Overview</h3>
        </div>
        <div className="p-6">
          {teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-sm">No performance data</div>
              <p className="text-gray-500 text-xs mt-2">Performance metrics will appear here once team members are added</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{activeMembers}</div>
                <div className="text-sm text-gray-600">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{avgPerformance}%</div>
                <div className="text-sm text-gray-600">Team Performance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalSales)}</div>
                <div className="text-sm text-gray-600">Total Sales</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
        </div>
        <div className="p-6">
          {teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-sm">No recent activities</div>
              <p className="text-gray-500 text-xs mt-2">Activities will appear here once the team is active</p>
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.slice(0, 3).map((member) => (
                <div key={member.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-8 w-8">
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-700">
                        {member.user_name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{member.user_name}</span> joined the team
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(member.hire_date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
              <AddMemberModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleMemberAdded}
        />
        
        {selectedMember && (
          <EditMemberModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedMember(null);
            }}
            onSuccess={handleMemberEdited}
            member={selectedMember}
          />
        )}

        {memberToDelete && (
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            memberName={memberToDelete.user_name}
            isLoading={isDeleting}
          />
        )}
      </div>
    );
  } 