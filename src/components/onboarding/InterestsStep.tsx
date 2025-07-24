'use client';

import { OnboardingData } from '@/app/onboarding/page';

interface InterestsStepProps {
  data: OnboardingData;
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: Partial<OnboardingData>) => void;
}

const tools = [
  {
    id: 'customerSegmentation',
    name: 'Customer Segmentation',
    description: 'Group customers by behavior, preferences, and demographics',
    icon: '🎯',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'salesFunnel',
    name: 'Sales Funnel',
    description: 'Track leads through your sales process',
    icon: '📊',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'tagAnalytics',
    name: 'Tag Analytics',
    description: 'Analyze customer tags and preferences',
    icon: '🏷️',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'campaignManager',
    name: 'Campaign Manager',
    description: 'Create and manage marketing campaigns',
    icon: '📢',
    color: 'from-orange-500 to-orange-600'
  }
];

export default function InterestsStep({ data, onNext, onBack, onUpdate }: InterestsStepProps) {
  const handleToggle = (toolId: keyof OnboardingData['interests']) => {
    onUpdate({
      interests: {
        ...data.interests,
        [toolId]: !data.interests[toolId]
      }
    });
  };

  const handleSelectAll = () => {
    onUpdate({
      interests: {
        customerSegmentation: true,
        salesFunnel: true,
        tagAnalytics: true,
        campaignManager: true,
      }
    });
  };

  const handleSelectNone = () => {
    onUpdate({
      interests: {
        customerSegmentation: false,
        salesFunnel: false,
        tagAnalytics: false,
        campaignManager: false,
      }
    });
  };

  const selectedCount = Object.values(data.interests).filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-3xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Choose Your Tools
          </h2>
          <p className="text-gray-600">
            Select the features that will help you work more effectively
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 flex justify-center space-x-4">
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={handleSelectNone}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Select None
          </button>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {tools.map((tool) => {
            const isSelected = data.interests[tool.id as keyof OnboardingData['interests']];
            
            return (
              <div
                key={tool.id}
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleToggle(tool.id as keyof OnboardingData['interests'])}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tool.color} flex items-center justify-center text-white text-xl`}>
                    {tool.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{tool.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selection Summary */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <div className="text-center">
            <p className="text-blue-900 font-medium">
              {selectedCount} of {tools.length} tools selected
            </p>
            <p className="text-sm text-blue-700 mt-1">
              You can change these later in Settings
            </p>
          </div>
        </div>

        {/* Selected Tools List */}
        {selectedCount > 0 && (
          <div className="mb-8">
            <h4 className="font-semibold text-gray-900 mb-3">Selected Tools:</h4>
            <div className="flex flex-wrap gap-2">
              {tools.map((tool) => {
                const isSelected = data.interests[tool.id as keyof OnboardingData['interests']];
                if (!isSelected) return null;
                
                return (
                  <span
                    key={tool.id}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {tool.icon} {tool.name}
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
            onClick={onNext}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
} 