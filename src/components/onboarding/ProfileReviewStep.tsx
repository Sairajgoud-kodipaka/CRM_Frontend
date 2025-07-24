'use client';

import { OnboardingData } from '@/app/onboarding/page';

interface ProfileReviewStepProps {
  data: OnboardingData;
  onNext: () => void;
  onBack: () => void;
  onEdit: (stepIndex: number) => void;
}

const roleLabels: Record<string, string> = {
  'platform-admin': 'Platform Admin',
  'business-admin': 'Business Admin',
  'managers': 'Manager',
  'inhouse-sales': 'In-House Sales',
  'marketing': 'Marketing Team',
  'tele-calling': 'Tele-Caller',
};

const toolLabels: Record<string, string> = {
  'customerSegmentation': 'Customer Segmentation',
  'salesFunnel': 'Sales Funnel',
  'tagAnalytics': 'Tag Analytics',
  'campaignManager': 'Campaign Manager',
};

export default function ProfileReviewStep({ data, onNext, onBack, onEdit }: ProfileReviewStepProps) {
  const selectedTools = Object.entries(data.interests)
    .filter(([_, enabled]) => enabled)
    .map(([key, _]) => toolLabels[key]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-3xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Review Your Profile
          </h2>
          <p className="text-gray-600">
            Please review your information before we set up your account
          </p>
        </div>

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <button
                onClick={() => onEdit(2)} // Basic Info step
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{data.firstName} {data.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{data.email}</p>
              </div>
              {data.mobile && (
                <div>
                  <p className="text-sm text-gray-500">Mobile</p>
                  <p className="font-medium text-gray-900">{data.mobile}</p>
                </div>
              )}
            </div>
          </div>

          {/* Role Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Role & Permissions</h3>
              <button
                onClick={() => onEdit(1)} // Role Selection step
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Primary Role</p>
                <p className="font-medium text-gray-900">{roleLabels[data.primaryRole]}</p>
              </div>
              {data.selectedRoles.length > 1 && (
                <div>
                  <p className="text-sm text-gray-500">Additional Roles</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {data.selectedRoles
                      .filter(role => role !== data.primaryRole)
                      .map(role => (
                        <span
                          key={role}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {roleLabels[role]}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Business Information (Admin/Manager only) */}
          {['platform-admin', 'business-admin', 'managers'].includes(data.primaryRole) && (
            <>
              {data.businessName && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
                    <button
                      onClick={() => onEdit(3)} // Business Details step
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Business Name</p>
                      <p className="font-medium text-gray-900">{data.businessName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Store</p>
                      <p className="font-medium text-gray-900">{data.storeName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">{data.city}, {data.state}</p>
                    </div>
                    {data.teams.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500">Teams</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {data.teams.map(team => (
                            <span
                              key={team}
                              className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                            >
                              {team}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Team Members */}
              {data.teamMembers.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Team Members ({data.teamMembers.length})</h3>
                    <button
                      onClick={() => onEdit(4)} // Team Assignment step
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-2">
                    {data.teamMembers.map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{member.email}</p>
                          <p className="text-sm text-gray-500">
                            {roleLabels[member.role]}
                            {member.store && ` • ${member.store}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Store Assignment */}
          {data.assignedStores.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Store Assignment</h3>
                <button
                  onClick={() => onEdit(5)} // Store Assignment step
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.assignedStores.map(storeId => (
                  <span
                    key={storeId}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {storeId}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Selected Tools */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Selected Tools</h3>
              <button
                onClick={() => onEdit(6)} // Interests step
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </button>
            </div>
            {selectedTools.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedTools.map(tool => (
                  <span
                    key={tool}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No tools selected</p>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-8">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={onNext}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
          >
            Confirm & Finish →
          </button>
        </div>
      </div>
    </div>
  );
} 