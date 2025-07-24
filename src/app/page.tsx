'use client';

import Link from 'next/link';
import { useBranding } from '@/contexts/BrandingContext';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { branding, isLoading } = useBranding();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br ${branding?.theme?.background || 'from-primary-50 to-secondary-100'}`}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-xl shadow-lg p-10 flex flex-col items-center"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <img 
            src={branding?.logo || "/logo.png"} 
            alt={`${branding?.name || 'Jewelry CRM'} Logo`} 
            className="h-16 w-16 mx-auto mb-2" 
          />
          <h1 className={`text-3xl font-bold tracking-tight ${branding?.theme?.text || 'text-primary-800'}`}>
            {branding?.name || 'Jewelry CRM'}
          </h1>
          <p className="text-gray-500 mt-2 text-center">
            {branding?.tagline || 'Multi-User CRM for Jewelry Businesses'}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Link
              href="/onboarding"
              className={`px-8 py-3 rounded-lg text-lg font-semibold shadow transition-colors ${
                branding?.theme?.primary 
                  ? `bg-[${branding.theme.primary}] text-white hover:opacity-90`
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              Start Onboarding
            </Link>
            <Link
              href="/select-role"
              className={`px-8 py-3 rounded-lg text-lg font-semibold border-2 transition-colors ${
                branding?.theme?.primary 
                  ? `border-[${branding.theme.primary}] text-[${branding.theme.primary}] hover:bg-[${branding.theme.primary}] hover:text-white`
                  : 'border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white'
              }`}
            >
              Quick Start
            </Link>
          </div>
        </motion.div>
      </motion.div>
      
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-10 text-gray-400 text-xs"
      >
        &copy; {new Date().getFullYear()} {branding?.name || 'Jewelry CRM'}
      </motion.footer>
    </div>
  );
} 