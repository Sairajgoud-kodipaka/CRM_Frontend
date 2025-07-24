'use client';

import { OnboardingData } from '@/app/onboarding/page';

interface SuccessStepProps {
  data: OnboardingData;
  onComplete: () => void;
}

const roleLabels: Record<string, string> = {
  'platform-admin': 'Platform Admin',
  'business-admin': 'Business Admin',
  'managers': 'Manager',
  'inhouse-sales': 'In-House Sales',
  'marketing': 'Marketing Team',
  'tele-calling': 'Tele-Caller',
};

const dashboardRoutes: Record<string, string> = {
  'platform-admin': '/platform-admin/dashboard',
  'business-admin': '/business-admin/dashboard',
  'managers': '/managers/dashboard',
  'inhouse-sales': '/inhouse-sales/dashboard',
  'marketing': '/marketing/dashboard',
  'tele-calling': '/tele-calling/dashboard',
};

export default function SuccessStep({ data, onComplete }: SuccessStepProps) {
  const roleLabel = roleLabels[data.primaryRole] || 'User';
  const dashboardRoute = dashboardRoutes[data.primaryRole] || '/dashboard';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-12 w-full max-w-2xl text-center">
        {/* Success Animation */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome, {data.firstName}!
        </h1>
        
        <p className="text-xl text-gray-600 mb-6">
          You're all set up and ready to go as a <span className="font-semibold text-blue-600">{roleLabel}</span>
        </p>

        {/* Account Summary */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">Your Account Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div>
              <p className="text-sm text-blue-700">Name</p>
              <p className="font-medium text-blue-900">{data.firstName} {data.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Email</p>
              <p className="font-medium text-blue-900">{data.email}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Primary Role</p>
              <p className="font-medium text-blue-900">{roleLabel}</p>
            </div>
            {data.businessName && (
              <div>
                <p className="text-sm text-blue-700">Business</p>
                <p className="font-medium text-blue-900">{data.businessName}</p>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">What's Next?</h3>
          <div className="space-y-2 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">1</span>
              </div>
              <span className="text-gray-700">Explore your personalized dashboard</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">2</span>
              </div>
              <span className="text-gray-700">Complete your profile setup</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">3</span>
              </div>
              <span className="text-gray-700">Start managing your jewelry business</span>
            </div>
          </div>
        </div>

        {/* Dashboard Button */}
        <button
          onClick={onComplete}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          Go to My Dashboard →
        </button>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            💡 <strong>Tip:</strong> You can always access onboarding and settings from your profile menu
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Jewel OS CRM
        </p>
      </div>
    </div>
  );
} 