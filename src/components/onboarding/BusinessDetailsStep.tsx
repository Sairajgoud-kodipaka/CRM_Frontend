'use client';

import { useState } from 'react';
import { OnboardingData } from '@/app/onboarding/page';

interface BusinessDetailsStepProps {
  data: OnboardingData;
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: Partial<OnboardingData>) => void;
}

const cities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur'
];

const states = [
  'Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal',
  'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Bihar', 'Odisha'
];

const commonTeams = ['Sales', 'Marketing', 'Tele-calling', 'Customer Service', 'Inventory'];

export default function BusinessDetailsStep({ data, onNext, onBack, onUpdate }: BusinessDetailsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTeam, setNewTeam] = useState('');
  const [showNewStoreInput, setShowNewStoreInput] = useState(false);

  // Check if user should see this step (admin/manager roles)
  const shouldShowStep = ['platform-admin', 'business-admin', 'managers'].includes(data.primaryRole);

  if (!shouldShowStep) {
    // Skip this step for non-admin/manager roles
    onNext();
    return null;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!data.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!data.storeName.trim()) {
      newErrors.storeName = 'Store name is required';
    }

    if (!data.city) {
      newErrors.city = 'Please select a city';
    }

    if (!data.state) {
      newErrors.state = 'Please select a state';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    onUpdate({ [field]: value });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTeamToggle = (team: string) => {
    const newTeams = data.teams.includes(team)
      ? data.teams.filter(t => t !== team)
      : [...data.teams, team];
    onUpdate({ teams: newTeams });
  };

  const handleAddTeam = () => {
    if (newTeam.trim() && !data.teams.includes(newTeam.trim())) {
      onUpdate({ teams: [...data.teams, newTeam.trim()] });
      setNewTeam('');
    }
  };

  const handleRemoveTeam = (team: string) => {
    onUpdate({ teams: data.teams.filter(t => t !== team) });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Your Business & Store Details
          </h2>
          <p className="text-gray-600">
            Tell us about your jewelry business and store location
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleContinue(); }} className="space-y-6">
          {/* Business Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name *
            </label>
            <input
              type="text"
              value={data.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.businessName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your business name"
            />
            {errors.businessName && (
              <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
            )}
          </div>

          {/* Store Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Name *
            </label>
            {!showNewStoreInput ? (
              <div className="space-y-2">
                <select
                  value={data.storeName}
                  onChange={(e) => {
                    if (e.target.value === 'new') {
                      setShowNewStoreInput(true);
                      handleInputChange('storeName', '');
                    } else {
                      handleInputChange('storeName', e.target.value);
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.storeName ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a store or add new</option>
                  <option value="M.G. Road (Bangalore)">M.G. Road (Bangalore)</option>
                  <option value="Churchgate (Mumbai)">Churchgate (Mumbai)</option>
                  <option value="Jubilee Hills (Hyderabad)">Jubilee Hills (Hyderabad)</option>
                  <option value="new">+ Add New Store</option>
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={data.storeName}
                  onChange={(e) => handleInputChange('storeName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.storeName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter store name"
                />
                <button
                  type="button"
                  onClick={() => setShowNewStoreInput(false)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  ← Back to store selection
                </button>
              </div>
            )}
            {errors.storeName && (
              <p className="mt-1 text-sm text-red-600">{errors.storeName}</p>
            )}
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <select
                value={data.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.city ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <select
                value={data.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.state ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select State</option>
                {states.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state}</p>
              )}
            </div>
          </div>

          {/* Teams */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teams to Manage
            </label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {commonTeams.map((team) => (
                  <button
                    key={team}
                    type="button"
                    onClick={() => handleTeamToggle(team)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                      data.teams.includes(team)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {team}
                  </button>
                ))}
              </div>
              
              {/* Custom Team Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTeam}
                  onChange={(e) => setNewTeam(e.target.value)}
                  placeholder="Add custom team"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTeam())}
                />
                <button
                  type="button"
                  onClick={handleAddTeam}
                  disabled={!newTeam.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>

              {/* Selected Teams */}
              {data.teams.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Selected teams:</p>
                  <div className="flex flex-wrap gap-2">
                    {data.teams.map((team) => (
                      <span
                        key={team}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {team}
                        <button
                          type="button"
                          onClick={() => handleRemoveTeam(team)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
            >
              Save & Continue →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 