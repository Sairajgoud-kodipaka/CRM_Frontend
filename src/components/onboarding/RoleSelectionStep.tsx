'use client';

import { useState } from 'react';
import { OnboardingData } from '@/app/onboarding/page';

interface RoleSelectionStepProps {
  data: OnboardingData;
  onNext: () => void;
  onUpdate: (data: Partial<OnboardingData>) => void;
}

const roles = [
  {
    id: 'platform-admin',
    name: 'Platform Admin',
    description: 'Deploy/manage CRMs, analytics, support',
    icon: '🏢',
    color: 'from-purple-500 to-purple-600',
    hoverColor: 'from-purple-600 to-purple-700'
  },
  {
    id: 'business-admin',
    name: 'Business Admin',
    description: 'Store dashboard, team, catalogue, pipeline',
    icon: '👔',
    color: 'from-blue-500 to-blue-600',
    hoverColor: 'from-blue-600 to-blue-700'
  },
  {
    id: 'managers',
    name: 'Manager',
    description: 'Team management, sales funnel, customer DB',
    icon: '👨‍💼',
    color: 'from-green-500 to-green-600',
    hoverColor: 'from-green-600 to-green-700'
  },
  {
    id: 'inhouse-sales',
    name: 'In-House Sales',
    description: 'Sales dashboard, add customer, announcements',
    icon: '💼',
    color: 'from-orange-500 to-orange-600',
    hoverColor: 'from-orange-600 to-orange-700'
  },
  {
    id: 'marketing',
    name: 'Marketing Team',
    description: 'Ecom, WhatsApp, dashboard',
    icon: '📢',
    color: 'from-pink-500 to-pink-600',
    hoverColor: 'from-pink-600 to-pink-700'
  },
  {
    id: 'tele-calling',
    name: 'Tele-Caller',
    description: 'Tele-calling, sales funnel, dashboard',
    icon: '📞',
    color: 'from-teal-500 to-teal-600',
    hoverColor: 'from-teal-600 to-teal-700'
  }
];

export default function RoleSelectionStep({ data, onNext, onUpdate }: RoleSelectionStepProps) {
  const [error, setError] = useState('');

  const handleRoleSelect = (roleId: string) => {
    const newSelectedRoles = data.selectedRoles.includes(roleId)
      ? data.selectedRoles.filter(id => id !== roleId)
      : [...data.selectedRoles, roleId];
    
    onUpdate({
      selectedRoles: newSelectedRoles,
      primaryRole: newSelectedRoles.length > 0 ? newSelectedRoles[0] : ''
    });
    setError('');
  };

  const handlePrimaryRoleSelect = (roleId: string) => {
    onUpdate({ primaryRole: roleId });
    setError('');
  };

  const handleContinue = () => {
    if (data.selectedRoles.length === 0) {
      setError('Please select at least one role');
      return;
    }
    if (!data.primaryRole) {
      setError('Please select your primary role');
      return;
    }
    onNext();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Select Your Primary Role
          </h2>
          <p className="text-gray-600">
            Choose the role that best describes your primary responsibilities
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Role Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {roles.map((role) => {
            const isSelected = data.selectedRoles.includes(role.id);
            const isPrimary = data.primaryRole === role.id;
            
            return (
              <div
                key={role.id}
                className={`relative cursor-pointer transition-all duration-200 ${
                  isSelected ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <button
                  onClick={() => handleRoleSelect(role.id)}
                  className={`w-full p-6 rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r ${role.color} flex items-center justify-center text-white text-xl`}>
                      {role.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{role.name}</h3>
                    <p className="text-sm text-gray-500">{role.description}</p>
                  </div>
                </button>
                
                {/* Primary Role Indicator */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrimaryRoleSelect(role.id);
                      }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isPrimary
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                      }`}
                      title={isPrimary ? 'Primary Role' : 'Set as Primary Role'}
                    >
                      {isPrimary ? '★' : '☆'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Roles Summary */}
        {data.selectedRoles.length > 0 && (
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Selected Roles:</h4>
            <div className="flex flex-wrap gap-2">
              {data.selectedRoles.map((roleId) => {
                const role = roles.find(r => r.id === roleId);
                const isPrimary = data.primaryRole === roleId;
                return (
                  <span
                    key={roleId}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isPrimary
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {role?.name} {isPrimary && '(Primary)'}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={data.selectedRoles.length === 0 || !data.primaryRole}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
} 