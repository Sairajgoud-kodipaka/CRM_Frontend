'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onboardingAPI } from '@/lib/api';
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import RoleSelectionStep from '@/components/onboarding/RoleSelectionStep';
import BasicInfoStep from '@/components/onboarding/BasicInfoStep';
import BusinessDetailsStep from '@/components/onboarding/BusinessDetailsStep';
import TeamAssignmentStep from '@/components/onboarding/TeamAssignmentStep';
import StoreAssignmentStep from '@/components/onboarding/StoreAssignmentStep';
import InterestsStep from '@/components/onboarding/InterestsStep';
import ProfileReviewStep from '@/components/onboarding/ProfileReviewStep';
import SuccessStep from '@/components/onboarding/SuccessStep';

export interface OnboardingData {
  // Step 1: Welcome (no data needed)
  
  // Step 2: Role Selection
  selectedRoles: string[];
  primaryRole: string;
  
  // Step 3: Basic Info
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password: string;
  
  // Step 4: Business/Store Details (Admin/Manager only)
  businessName: string;
  storeName: string;
  city: string;
  state: string;
  teams: string[];
  
  // Step 5: Team Assignment
  teamMembers: Array<{
    email: string;
    role: string;
    store?: string;
  }>;
  
  // Step 6: Store Assignment
  assignedStores: string[];
  
  // Step 7: Interests & Setup
  interests: {
    customerSegmentation: boolean;
    salesFunnel: boolean;
    tagAnalytics: boolean;
    campaignManager: boolean;
  };
}

const ONBOARDING_STEPS = [
  'welcome',
  'role-selection',
  'basic-info',
  'business-details',
  'team-assignment',
  'store-assignment',
  'interests',
  'review',
  'success'
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    selectedRoles: [],
    primaryRole: '',
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    businessName: '',
    storeName: '',
    city: '',
    state: '',
    teams: [],
    teamMembers: [],
    assignedStores: [],
    interests: {
      customerSegmentation: true,
      salesFunnel: true,
      tagAnalytics: true,
      campaignManager: true,
    }
  });

  // Load saved progress from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('onboarding_data');
    const savedStep = localStorage.getItem('onboarding_step');
    
    if (savedData) {
      setOnboardingData(JSON.parse(savedData));
    }
    
    if (savedStep) {
      setCurrentStep(parseInt(savedStep));
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = (data: Partial<OnboardingData>, step?: number) => {
    const newData = { ...onboardingData, ...data };
    setOnboardingData(newData);
    localStorage.setItem('onboarding_data', JSON.stringify(newData));
    
    if (step !== undefined) {
      setCurrentStep(step);
      localStorage.setItem('onboarding_step', step.toString());
    }
  };

  const nextStep = () => {
    const nextStepIndex = currentStep + 1;
    if (nextStepIndex < ONBOARDING_STEPS.length) {
      setCurrentStep(nextStepIndex);
      localStorage.setItem('onboarding_step', nextStepIndex.toString());
    }
  };

  const prevStep = () => {
    const prevStepIndex = currentStep - 1;
    if (prevStepIndex >= 0) {
      setCurrentStep(prevStepIndex);
      localStorage.setItem('onboarding_step', prevStepIndex.toString());
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < ONBOARDING_STEPS.length) {
      setCurrentStep(stepIndex);
      localStorage.setItem('onboarding_step', stepIndex.toString());
    }
  };

  const handleComplete = async () => {
    try {
      // Submit onboarding data to backend and create user account
      const response = await onboardingAPI.submitOnboarding({
        onboarding_data: onboardingData
      });
      
      // Store user info for login
      if (response.user) {
        localStorage.setItem('onboarding_user', JSON.stringify(response.user));
      }
      
      // Clear onboarding data from localStorage
      localStorage.removeItem('onboarding_data');
      localStorage.removeItem('onboarding_step');
      
      // Redirect to appropriate dashboard based on primary role
      const dashboardRoutes: Record<string, string> = {
        'platform-admin': '/platform-admin/dashboard',
        'business-admin': '/business-admin/dashboard',
        'managers': '/managers/dashboard',
        'inhouse-sales': '/inhouse-sales/dashboard',
        'marketing': '/marketing/dashboard',
        'tele-calling': '/tele-calling/dashboard',
      };
      
      const dashboardRoute = dashboardRoutes[onboardingData.primaryRole] || '/dashboard';
      router.push(dashboardRoute);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Still redirect even if API call fails
      const dashboardRoutes: Record<string, string> = {
        'platform-admin': '/platform-admin/dashboard',
        'business-admin': '/business-admin/dashboard',
        'managers': '/managers/dashboard',
        'inhouse-sales': '/inhouse-sales/dashboard',
        'marketing': '/marketing/dashboard',
        'tele-calling': '/tele-calling/dashboard',
      };
      
      const dashboardRoute = dashboardRoutes[onboardingData.primaryRole] || '/dashboard';
      router.push(dashboardRoute);
    }
  };

  const renderCurrentStep = () => {
    const step = ONBOARDING_STEPS[currentStep];
    
    switch (step) {
      case 'welcome':
        return (
          <WelcomeStep 
            onNext={nextStep}
          />
        );
      
      case 'role-selection':
        return (
          <RoleSelectionStep
            data={onboardingData}
            onNext={nextStep}
            onUpdate={(data) => saveProgress(data)}
          />
        );
      
      case 'basic-info':
        return (
          <BasicInfoStep
            data={onboardingData}
            onNext={nextStep}
            onBack={prevStep}
            onUpdate={(data) => saveProgress(data)}
          />
        );
      
      case 'business-details':
        return (
          <BusinessDetailsStep
            data={onboardingData}
            onNext={nextStep}
            onBack={prevStep}
            onUpdate={(data) => saveProgress(data)}
          />
        );
      
      case 'team-assignment':
        return (
          <TeamAssignmentStep
            data={onboardingData}
            onNext={nextStep}
            onBack={prevStep}
            onUpdate={(data) => saveProgress(data)}
          />
        );
      
      case 'store-assignment':
        return (
          <StoreAssignmentStep
            data={onboardingData}
            onNext={nextStep}
            onBack={prevStep}
            onUpdate={(data) => saveProgress(data)}
          />
        );
      
      case 'interests':
        return (
          <InterestsStep
            data={onboardingData}
            onNext={nextStep}
            onBack={prevStep}
            onUpdate={(data) => saveProgress(data)}
          />
        );
      
      case 'review':
        return (
          <ProfileReviewStep
            data={onboardingData}
            onNext={nextStep}
            onBack={prevStep}
            onEdit={(stepIndex) => goToStep(stepIndex)}
          />
        );
      
      case 'success':
        return (
          <SuccessStep
            data={onboardingData}
            onComplete={handleComplete}
          />
        );
      
      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Indicator */}
        {currentStep > 0 && currentStep < ONBOARDING_STEPS.length - 1 && (
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">
                  Step {currentStep + 1} of {ONBOARDING_STEPS.length - 2}
                </span>
              </div>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep) / (ONBOARDING_STEPS.length - 2)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Current Step Content */}
        {renderCurrentStep()}
      </div>
    </div>
  );
} 