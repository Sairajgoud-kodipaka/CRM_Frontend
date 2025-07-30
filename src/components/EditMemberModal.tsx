'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { teamMembersAPI } from '@/lib/api';
import { storesAPI } from '@/lib/api';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member: any;
}

interface TeamMemberData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string;
  department: string;
  position: string;
  hire_date: string;
  sales_target: number;
  skills: string[];
  notes: string;
  status: string;
  performance_rating: string;
  store?: number;
}

const roleOptions = [
  { value: 'manager', label: 'Manager' },
  { value: 'inhouse_sales', label: 'In-house Sales' },
  { value: 'tele_calling', label: 'Tele-calling' },
  { value: 'marketing', label: 'Marketing' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'on_leave', label: 'On Leave' },
];

const performanceOptions = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'average', label: 'Average' },
  { value: 'below_average', label: 'Below Average' },
  { value: 'poor', label: 'Poor' },
];

export default function EditMemberModal({ isOpen, onClose, onSuccess, member }: EditMemberModalProps) {
  const [formData, setFormData] = useState<TeamMemberData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'inhouse_sales',
    phone: '',
    department: '',
    position: '',
    hire_date: new Date().toISOString().split('T')[0],
    sales_target: 0,
    skills: [],
    notes: '',
    status: 'active',
    performance_rating: 'good',
  });
  
  const [errors, setErrors] = useState<Partial<TeamMemberData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [stores, setStores] = useState<any[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);

  // Populate form data when member changes
  useEffect(() => {
    if (member) {
      let transformedRole = member.user_role?.toLowerCase().replace(/[ -]/g, '_') || 'inhouse_sales';
      
      // Fix specific role transformations
      if (transformedRole === 'in_house_sales') {
        transformedRole = 'inhouse_sales';
      }
      
      setFormData({
        username: member.user_username || '',
        email: member.user_email || '',
        first_name: member.user_name?.split(' ')[0] || '',
        last_name: member.user_name?.split(' ').slice(1).join(' ') || '',
        role: transformedRole,
        phone: member.phone || '',
        department: member.department || '',
        position: member.position || '',
        hire_date: member.hire_date || new Date().toISOString().split('T')[0],
        sales_target: member.sales_target || 0,
        skills: member.skills || [],
        notes: member.notes || '',
        status: member.status || 'active',
        performance_rating: member.performance_rating || 'good',
        store: member.store || member.store_id || undefined,
      });
    }
  }, [member]);

  // Fetch stores for dropdown
  useEffect(() => {
    const fetchStores = async () => {
      setStoresLoading(true);
      try {
        const data = await storesAPI.getStores();
        setStores(Array.isArray(data) ? data : (data && Array.isArray(data.results) ? data.results : []));
      } catch {
        setStores([]);
      } finally {
        setStoresLoading(false);
      }
    };
    fetchStores();
  }, []);

  const validateForm = () => {
    const newErrors: Partial<TeamMemberData> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }
    
    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Remove username from formData as it's not expected by the backend
      const { username, ...updateData } = formData;
      
      // Ensure skills is properly formatted
      if (updateData.skills && Array.isArray(updateData.skills)) {
        updateData.skills = updateData.skills.filter(skill => skill.trim() !== '');
      }
      
      // Ensure sales_target is a number
      if (updateData.sales_target !== undefined) {
        updateData.sales_target = parseFloat(String(updateData.sales_target)) || 0;
      }
      
      // Ensure role is properly formatted (replace hyphens with underscores)
      if (updateData.role) {
        updateData.role = updateData.role.replace(/[ -]/g, '_');
      }

      // Ensure store is a number or undefined
      if (typeof updateData.store === 'string' && updateData.store === '') updateData.store = undefined;
      
      await teamMembersAPI.updateTeamMember(member.id, updateData);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating team member:', error);
      alert(error.response?.data?.message || 'Failed to update team member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof TeamMemberData, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Edit Team Member
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-96 overflow-y-auto">
            {/* Personal Information */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.first_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.last_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Work Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.role ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {roleOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="text-red-500 text-xs mt-1">{errors.role}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Performance Rating
                  </label>
                  <select
                    value={formData.performance_rating}
                    onChange={(e) => handleInputChange('performance_rating', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {performanceOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.department ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.department && (
                    <p className="text-red-500 text-xs mt-1">{errors.department}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position *
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.position ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.position && (
                    <p className="text-red-500 text-xs mt-1">{errors.position}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hire Date
                  </label>
                  <input
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => handleInputChange('hire_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sales Target ($)
                  </label>
                  <input
                    type="number"
                    value={formData.sales_target}
                    onChange={(e) => handleInputChange('sales_target', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store
                  </label>
                  <select
                    value={formData.store ?? ''}
                    onChange={e => handleInputChange('store', e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={storesLoading}
                  >
                    <option value="">Select a store (optional)</option>
                    {stores.map((store: any) => (
                      <option key={store.id} value={store.id}>{store.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Additional Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes about the team member..."
                />
              </div>
            </div>
          </form>
          
          <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : 'Update Member'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 