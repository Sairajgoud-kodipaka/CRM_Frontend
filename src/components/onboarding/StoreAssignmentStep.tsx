'use client';

import { useState } from 'react';
import { OnboardingData } from '@/app/onboarding/page';

interface StoreAssignmentStepProps {
  data: OnboardingData;
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: Partial<OnboardingData>) => void;
}

const availableStores = [
  {
    id: 'mg-road-bangalore',
    name: 'M.G. Road (Bangalore)',
    address: 'M.G. Road, Bangalore, Karnataka',
    status: 'Active'
  },
  {
    id: 'churchgate-mumbai',
    name: 'Churchgate (Mumbai)',
    address: 'Churchgate, Mumbai, Maharashtra',
    status: 'Active'
  },
  {
    id: 'jubilee-hills-hyderabad',
    name: 'Jubilee Hills (Hyderabad)',
    address: 'Jubilee Hills, Hyderabad, Telangana',
    status: 'Active'
  },
  {
    id: 'connaught-place-delhi',
    name: 'Connaught Place (Delhi)',
    address: 'Connaught Place, New Delhi',
    status: 'Active'
  },
  {
    id: 'park-street-kolkata',
    name: 'Park Street (Kolkata)',
    address: 'Park Street, Kolkata, West Bengal',
    status: 'Active'
  }
];

export default function StoreAssignmentStep({ data, onNext, onBack, onUpdate }: StoreAssignmentStepProps) {
  const [showRequestAccess, setShowRequestAccess] = useState(false);
  const [requestedStore, setRequestedStore] = useState('');

  const handleStoreToggle = (storeId: string) => {
    const newAssignedStores = data.assignedStores.includes(storeId)
      ? data.assignedStores.filter(id => id !== storeId)
      : [...data.assignedStores, storeId];
    
    onUpdate({ assignedStores: newAssignedStores });
  };

  const handleRequestAccess = () => {
    if (requestedStore.trim()) {
      // In a real implementation, this would send a request to the backend
      alert(`Access request sent for: ${requestedStore}`);
      setRequestedStore('');
      setShowRequestAccess(false);
    }
  };

  const handleContinue = () => {
    // For some roles, store assignment might be optional
    // For others, it might be required
    const requiresStoreAssignment = ['inhouse-sales', 'tele-calling'].includes(data.primaryRole);
    
    if (requiresStoreAssignment && data.assignedStores.length === 0) {
      alert('Please select at least one store for your role.');
      return;
    }
    
    onNext();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Select Your Store(s)
          </h2>
          <p className="text-gray-600">
            Choose which stores you'll be working with
          </p>
        </div>

        {/* Store Selection */}
        <div className="mb-8">
          <div className="space-y-3">
            {availableStores.map((store) => {
              const isSelected = data.assignedStores.includes(store.id);
              return (
                <div
                  key={store.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleStoreToggle(store.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{store.name}</h3>
                        <p className="text-sm text-gray-500">{store.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        store.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {store.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Request Access Section */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-gray-600 mb-3">
              Don't see your store? Request access to additional locations.
            </p>
            {!showRequestAccess ? (
              <button
                type="button"
                onClick={() => setShowRequestAccess(true)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Request Store Access
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={requestedStore}
                  onChange={(e) => setRequestedStore(e.target.value)}
                  placeholder="Enter store name or location"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex justify-center space-x-2">
                  <button
                    type="button"
                    onClick={handleRequestAccess}
                    disabled={!requestedStore.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Request
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRequestAccess(false);
                      setRequestedStore('');
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Stores Summary */}
        {data.assignedStores.length > 0 && (
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Selected Stores:</h4>
            <div className="flex flex-wrap gap-2">
              {data.assignedStores.map((storeId) => {
                const store = availableStores.find(s => s.id === storeId);
                return (
                  <span
                    key={storeId}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {store?.name}
                  </span>
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
          <button
            type="button"
            onClick={handleContinue}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
} 