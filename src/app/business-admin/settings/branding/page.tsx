'use client';

import { useState, useEffect } from 'react';

interface BrandingSettings {
  business_name: string;
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  contact_email: string;
  contact_phone: string;
  website_url: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  social_media: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
  business_hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

export default function SettingsBranding() {
  const [settings, setSettings] = useState<BrandingSettings>({
    business_name: '',
    logo_url: '',
    favicon_url: '',
    primary_color: '#3B82F6',
    secondary_color: '#1F2937',
    accent_color: '#F59E0B',
    contact_email: '',
    contact_phone: '',
    website_url: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    social_media: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: ''
    },
    business_hours: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '10:00 AM - 4:00 PM',
      sunday: 'Closed'
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'branding' | 'contact' | 'social' | 'hours'>('branding');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [faviconPreview, setFaviconPreview] = useState<string>('');

  // Mock data for demonstration
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSettings({
        business_name: 'Prestige Jewelers',
        logo_url: '/api/placeholder/200/80',
        favicon_url: '/api/placeholder/32/32',
        primary_color: '#3B82F6',
        secondary_color: '#1F2937',
        accent_color: '#F59E0B',
        contact_email: 'info@prestigejewelers.com',
        contact_phone: '+1 (555) 123-4567',
        website_url: 'https://prestigejewelers.com',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postal_code: '10001',
        social_media: {
          facebook: 'https://facebook.com/prestigejewelers',
          instagram: 'https://instagram.com/prestigejewelers',
          twitter: 'https://twitter.com/prestigejewelers',
          linkedin: 'https://linkedin.com/company/prestigejewelers'
        },
        business_hours: {
          monday: '9:00 AM - 6:00 PM',
          tuesday: '9:00 AM - 6:00 PM',
          wednesday: '9:00 AM - 6:00 PM',
          thursday: '9:00 AM - 6:00 PM',
          friday: '9:00 AM - 6:00 PM',
          saturday: '10:00 AM - 4:00 PM',
          sunday: 'Closed'
        }
      });
      setLogoPreview('/api/placeholder/200/80');
      setFaviconPreview('/api/placeholder/32/32');
      setLoading(false);
    }, 1000);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update settings with new values
    setSettings(prev => ({
      ...prev,
      ...settings
    }));
    
    setSaving(false);
    alert('Branding settings updated successfully!');
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFaviconFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFaviconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [platform]: value
      }
    }));
  };

  const handleBusinessHoursChange = (day: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      business_hours: {
        ...prev.business_hours,
        [day]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Branding & Appearance</h2>
        <p className="mb-4 text-gray-700">
          Upload your logo, set theme color, and update business contact details.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('branding')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'branding'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Branding
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contact'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Contact Info
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'social'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Social Media
            </button>
            <button
              onClick={() => setActiveTab('hours')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'hours'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Business Hours
            </button>
          </nav>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'branding' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Brand Identity</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
                      <input
                        type="text"
                        required
                        value={settings.business_name}
                        onChange={(e) => handleInputChange('business_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                      <input
                        type="url"
                        value={settings.website_url}
                        onChange={(e) => handleInputChange('website_url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold mb-4">Logo & Favicon</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                      <div className="space-y-2">
                        {logoPreview && (
                          <div className="border rounded p-2">
                            <img src={logoPreview} alt="Logo preview" className="max-w-full h-20 object-contain" />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500">Recommended: 200x80px, PNG or JPG</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
                      <div className="space-y-2">
                        {faviconPreview && (
                          <div className="border rounded p-2">
                            <img src={faviconPreview} alt="Favicon preview" className="w-8 h-8 object-contain" />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFaviconChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500">Recommended: 32x32px, ICO or PNG</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold mb-4">Color Scheme</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={settings.primary_color}
                          onChange={(e) => handleInputChange('primary_color', e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={settings.primary_color}
                          onChange={(e) => handleInputChange('primary_color', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={settings.secondary_color}
                          onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={settings.secondary_color}
                          onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={settings.accent_color}
                          onChange={(e) => handleInputChange('accent_color', e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={settings.accent_color}
                          onChange={(e) => handleInputChange('accent_color', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
                      <input
                        type="email"
                        required
                        value={settings.contact_email}
                        onChange={(e) => handleInputChange('contact_email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone *</label>
                      <input
                        type="tel"
                        required
                        value={settings.contact_phone}
                        onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold mb-4">Address</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                      <input
                        type="text"
                        value={settings.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          value={settings.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          value={settings.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <input
                          type="text"
                          value={settings.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                        <input
                          type="text"
                          value={settings.postal_code}
                          onChange={(e) => handleInputChange('postal_code', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Social Media Links</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                      <input
                        type="url"
                        value={settings.social_media.facebook}
                        onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://facebook.com/yourpage"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                      <input
                        type="url"
                        value={settings.social_media.instagram}
                        onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://instagram.com/yourpage"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                      <input
                        type="url"
                        value={settings.social_media.twitter}
                        onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://twitter.com/yourpage"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                      <input
                        type="url"
                        value={settings.social_media.linkedin}
                        onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://linkedin.com/company/yourcompany"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hours' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Business Hours</h3>
                  
                  <div className="space-y-4">
                    {Object.entries(settings.business_hours).map(([day, hours]) => (
                      <div key={day} className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700 w-24 capitalize">
                          {day}
                        </label>
                        <input
                          type="text"
                          value={hours}
                          onChange={(e) => handleBusinessHoursChange(day, e.target.value)}
                          className="flex-1 ml-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 9:00 AM - 6:00 PM"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-6 border-t">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 