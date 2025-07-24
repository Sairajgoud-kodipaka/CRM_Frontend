'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeColors {
  background: string;
  text: string;
  accent: string;
  primary: string;
  secondary: string;
}

interface BrandingData {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  favicon: string;
  theme: ThemeColors;
  isCustom: boolean;
  tenantId?: string;
  seasonalEnabled: boolean;
  customSplash?: {
    title: string;
    subtitle: string;
    backgroundImage?: string;
  };
}

interface BrandingContextType {
  branding: BrandingData | null;
  isLoading: boolean;
  error: string | null;
  updateBranding: (data: Partial<BrandingData>) => Promise<void>;
  refreshBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

// Default branding for the platform
const defaultBranding: BrandingData = {
  id: 'default',
  name: 'Jewelry CRM',
  tagline: 'Crafting Relationships, Delivering Brilliance',
  logo: '/logo.png',
  favicon: '/favicon.ico',
  theme: {
    background: 'from-primary-50 to-secondary-100',
    text: 'text-primary-800',
    accent: 'text-primary-600',
    primary: '#ed751a',
    secondary: '#64748b'
  },
  isCustom: false,
  seasonalEnabled: true
};

// Sample tenant branding data (in real app, this would come from API)
const tenantBranding: Record<string, BrandingData> = {
  'tenant-1': {
    id: 'tenant-1',
    name: 'Royal Jewellers',
    tagline: 'Where Elegance Meets Excellence',
    logo: '/branding/royal-jewellers-logo.png',
    favicon: '/branding/royal-jewellers-favicon.ico',
    theme: {
      background: 'from-amber-50 to-yellow-100',
      text: 'text-amber-800',
      accent: 'text-amber-600',
      primary: '#f59e0b',
      secondary: '#92400e'
    },
    isCustom: true,
    tenantId: 'tenant-1',
    seasonalEnabled: true,
    customSplash: {
      title: 'Royal Jewellers',
      subtitle: 'Luxury Redefined'
    }
  },
  'tenant-2': {
    id: 'tenant-2',
    name: 'Diamond Palace',
    tagline: 'Timeless Beauty, Modern Service',
    logo: '/branding/diamond-palace-logo.png',
    favicon: '/branding/diamond-palace-favicon.ico',
    theme: {
      background: 'from-blue-50 to-indigo-100',
      text: 'text-blue-800',
      accent: 'text-blue-600',
      primary: '#3b82f6',
      secondary: '#1e40af'
    },
    isCustom: true,
    tenantId: 'tenant-2',
    seasonalEnabled: false
  }
};

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<BrandingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate API call to fetch branding data
  const fetchBranding = async (tenantId?: string): Promise<BrandingData> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (tenantId && tenantBranding[tenantId]) {
      return tenantBranding[tenantId];
    }

    return defaultBranding;
  };

  // Initialize branding on mount
  useEffect(() => {
    const initializeBranding = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get tenant ID from localStorage or URL params
        const tenantId = localStorage.getItem('tenantId') || 
                        new URLSearchParams(window.location.search).get('tenant');

        const brandingData = await fetchBranding(tenantId || undefined);
        setBranding(brandingData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load branding');
        setBranding(defaultBranding); // Fallback to default
      } finally {
        setIsLoading(false);
      }
    };

    initializeBranding();
  }, []);

  // Update branding data
  const updateBranding = async (data: Partial<BrandingData>) => {
    try {
      setError(null);
      
      if (!branding) {
        throw new Error('No branding data available');
      }

      const updatedBranding = { ...branding, ...data };
      setBranding(updatedBranding);

      // In a real app, you would save this to the backend
      if (branding.tenantId) {
        // await api.updateTenantBranding(branding.tenantId, updatedBranding);
        console.log('Branding updated for tenant:', branding.tenantId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update branding');
      throw err;
    }
  };

  // Refresh branding data
  const refreshBranding = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const tenantId = branding?.tenantId;
      const brandingData = await fetchBranding(tenantId);
      setBranding(brandingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh branding');
    } finally {
      setIsLoading(false);
    }
  };

  const value: BrandingContextType = {
    branding,
    isLoading,
    error,
    updateBranding,
    refreshBranding
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = (): BrandingContextType => {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}; 