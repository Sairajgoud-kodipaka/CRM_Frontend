'use client';

import React, { useState } from 'react';
import { useBranding } from '@/contexts/BrandingContext';
import { motion } from 'framer-motion';

interface BrandingSettingsProps {
  isPlatformAdmin?: boolean;
}

const themePresets = [
  {
    name: 'Default',
    background: 'from-primary-50 to-secondary-100',
    text: 'text-primary-800',
    accent: 'text-primary-600',
    primary: '#ed751a',
    secondary: '#64748b'
  },
  {
    name: 'Royal Gold',
    background: 'from-amber-50 to-yellow-100',
    text: 'text-amber-800',
    accent: 'text-amber-600',
    primary: '#f59e0b',
    secondary: '#92400e'
  },
  {
    name: 'Ocean Blue',
    background: 'from-blue-50 to-indigo-100',
    text: 'text-blue-800',
    accent: 'text-blue-600',
    primary: '#3b82f6',
    secondary: '#1e40af'
  },
  {
    name: 'Emerald Green',
    background: 'from-emerald-50 to-green-100',
    text: 'text-emerald-800',
    accent: 'text-emerald-600',
    primary: '#10b981',
    secondary: '#047857'
  },
  {
    name: 'Rose Pink',
    background: 'from-pink-50 to-rose-100',
    text: 'text-pink-800',
    accent: 'text-pink-600',
    primary: '#ec4899',
    secondary: '#be185d'
  }
];

export const BrandingSettings: React.FC<BrandingSettingsProps> = ({ 
  isPlatformAdmin = false 
}) => {
  const { branding, updateBranding, isLoading } = useBranding();
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const [formData, setFormData] = useState({
    name: branding?.name || '',
    tagline: branding?.tagline || '',
    logo: branding?.logo || '',
    seasonalEnabled: branding?.seasonalEnabled || true,
    customSplash: {
      title: branding?.customSplash?.title || '',
      subtitle: branding?.customSplash?.subtitle || '',
      backgroundImage: branding?.customSplash?.backgroundImage || ''
    },
    theme: {
      background: branding?.theme?.background || 'from-primary-50 to-secondary-100',
      text: branding?.theme?.text || 'text-primary-800',
      accent: branding?.theme?.accent || 'text-primary-600',
      primary: branding?.theme?.primary || '#ed751a',
      secondary: branding?.theme?.secondary || '#64748b'
    }
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleThemeChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        [field]: value
      }
    }));
  };

  const handleCustomSplashChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      customSplash: {
        ...prev.customSplash,
        [field]: value
      }
    }));
  };

  const applyThemePreset = (preset: typeof themePresets[0]) => {
    setFormData(prev => ({
      ...prev,
      theme: {
        background: preset.background,
        text: preset.text,
        accent: preset.accent,
        primary: preset.primary,
        secondary: preset.secondary
      }
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateBranding({
        name: formData.name,
        tagline: formData.tagline,
        logo: formData.logo,
        seasonalEnabled: formData.seasonalEnabled,
        customSplash: formData.customSplash,
        theme: formData.theme
      });
    } catch (error) {
      console.error('Failed to save branding:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleInputChange('logo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isPlatformAdmin ? 'Platform Branding' : 'Store Branding'}
        </h1>
        <p className="text-gray-600">
          Customize your splash screen appearance and branding elements
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings Form */}
        <div className="space-y-6">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter business name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter tagline"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {formData.logo && (
                  <img
                    src={formData.logo}
                    alt="Logo preview"
                    className="mt-2 h-12 w-auto"
                  />
                )}
              </div>
            </div>
          </motion.div>

          {/* Theme Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Theme Colors</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme Presets
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {themePresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyThemePreset(preset)}
                      className="p-3 border rounded-md hover:border-primary-500 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <span className="text-sm font-medium">{preset.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    value={formData.theme.primary}
                    onChange={(e) => handleThemeChange('primary', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <input
                    type="color"
                    value={formData.theme.secondary}
                    onChange={(e) => handleThemeChange('secondary', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Seasonal Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Seasonal Content</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="seasonalEnabled"
                  checked={formData.seasonalEnabled}
                  onChange={(e) => handleInputChange('seasonalEnabled', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="seasonalEnabled" className="ml-2 block text-sm text-gray-900">
                  Enable seasonal splash screen content
                </label>
              </div>
              
              <p className="text-sm text-gray-600">
                When enabled, the splash screen will automatically show festive content during special occasions like Diwali, Akshay Tritiya, and wedding season.
              </p>
            </div>
          </motion.div>

          {/* Custom Splash */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Custom Splash Content</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Title
                </label>
                <input
                  type="text"
                  value={formData.customSplash.title}
                  onChange={(e) => handleCustomSplashChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Leave empty to use business name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Subtitle
                </label>
                <input
                  type="text"
                  value={formData.customSplash.subtitle}
                  onChange={(e) => handleCustomSplashChange('subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Leave empty to use tagline"
                />
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex space-x-4"
          >
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {previewMode ? 'Hide Preview' : 'Preview'}
            </button>
          </motion.div>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            
            {previewMode && (
              <div className={`relative w-full h-96 rounded-lg overflow-hidden bg-gradient-to-br ${formData.theme.background}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="mb-6">
                      {formData.logo && (
                        <img
                          src={formData.logo}
                          alt="Logo"
                          className="h-16 w-16 mx-auto mb-4"
                        />
                      )}
                    </div>
                    
                    <h1 className={`text-3xl font-bold ${formData.theme.text} mb-2`}>
                      {formData.customSplash.title || formData.name || 'Business Name'}
                    </h1>
                    
                    <p className={`text-lg ${formData.theme.text} opacity-80`}>
                      {formData.customSplash.subtitle || formData.tagline || 'Tagline'}
                    </p>
                    
                    <div className="mt-8">
                      <div className={`h-2 bg-white/20 rounded-full overflow-hidden`}>
                        <div 
                          className={`h-full ${formData.theme.accent} bg-gradient-to-r from-current to-current/60 rounded-full`}
                          style={{ width: '60%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {!previewMode && (
              <div className="text-center py-12 text-gray-500">
                <p>Click "Preview" to see how your splash screen will look</p>
              </div>
            )}
          </motion.div>

          {/* Color Palette */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Color Palette</h2>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: formData.theme.primary }}
                />
                <span className="text-sm font-medium">Primary: {formData.theme.primary}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: formData.theme.secondary }}
                />
                <span className="text-sm font-medium">Secondary: {formData.theme.secondary}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BrandingSettings; 