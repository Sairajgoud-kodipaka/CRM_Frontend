'use client';

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-12 w-full max-w-2xl text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center">
            <span className="text-white text-2xl font-bold">💎</span>
          </div>
        </div>

        {/* Welcome Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Jewelry CRM!
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          Your partner in jewelry business growth and customer delight.
        </p>

        {/* Mission Statement */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <p className="text-gray-700 text-lg">
            Transform your jewelry business with intelligent customer management, 
            powerful analytics, and seamless team collaboration.
          </p>
        </div>

        {/* Get Started Button */}
        <button
          onClick={onNext}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          Get Started →
        </button>

        {/* Footer */}
        <p className="mt-8 text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Jewel OS CRM
        </p>
      </div>
    </div>
  );
} 