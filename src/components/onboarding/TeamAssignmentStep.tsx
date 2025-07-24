'use client';

import { useState } from 'react';
import { OnboardingData } from '@/app/onboarding/page';

interface TeamAssignmentStepProps {
  data: OnboardingData;
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: Partial<OnboardingData>) => void;
}

const availableRoles = [
  { id: 'inhouse-sales', name: 'In-House Sales', icon: '💼' },
  { id: 'marketing', name: 'Marketing Team', icon: '📢' },
  { id: 'tele-calling', name: 'Tele-Caller', icon: '📞' },
  { id: 'managers', name: 'Manager', icon: '👨‍💼' },
];

const availableStores = [
  'M.G. Road (Bangalore)',
  'Churchgate (Mumbai)',
  'Jubilee Hills (Hyderabad)',
];

export default function TeamAssignmentStep({ data, onNext, onBack, onUpdate }: TeamAssignmentStepProps) {
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('inhouse-sales');
  const [newStore, setNewStore] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if user should see this step (admin/manager roles)
  const shouldShowStep = ['platform-admin', 'business-admin', 'managers'].includes(data.primaryRole);

  if (!shouldShowStep) {
    // Skip this step for non-admin/manager roles
    onNext();
    return null;
  }

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAddTeamMember = () => {
    const errors: Record<string, string> = {};

    if (!newEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(newEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    if (data.teamMembers.some(member => member.email === newEmail)) {
      errors.email = 'This email is already added';
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    const newMember = {
      email: newEmail.trim(),
      role: newRole,
      store: newStore || undefined,
    };

    onUpdate({
      teamMembers: [...data.teamMembers, newMember]
    });

    setNewEmail('');
    setNewRole('inhouse-sales');
    setNewStore('');
    setErrors({});
  };

  const handleRemoveTeamMember = (email: string) => {
    onUpdate({
      teamMembers: data.teamMembers.filter(member => member.email !== email)
    });
  };

  const handleSkip = () => {
    onNext();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Assign Your Team
          </h2>
          <p className="text-gray-600">
            Invite your teammates now or skip for later
          </p>
        </div>

        {/* Add New Team Member */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Team Member</h3>
          
          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter team member's email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.icon} {role.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Store Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Assignment (Optional)
              </label>
              <select
                value={newStore}
                onChange={(e) => setNewStore(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">No specific store</option>
                {availableStores.map((store) => (
                  <option key={store} value={store}>{store}</option>
                ))}
              </select>
            </div>

            {/* Add Button */}
            <button
              type="button"
              onClick={handleAddTeamMember}
              disabled={!newEmail.trim()}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Team Member
            </button>
          </div>
        </div>

        {/* Team Members List */}
        {data.teamMembers.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members ({data.teamMembers.length})</h3>
            <div className="space-y-3">
              {data.teamMembers.map((member, index) => {
                const role = availableRoles.find(r => r.id === member.role);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {member.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.email}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{role?.icon} {role?.name}</span>
                          {member.store && (
                            <>
                              <span>•</span>
                              <span>📍 {member.store}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTeamMember(member.email)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Back
          </button>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleSkip}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Skip for now
            </button>
            <button
              type="button"
              onClick={onNext}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 