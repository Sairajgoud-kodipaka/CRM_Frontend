'use client';

import { useState, useEffect } from 'react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface GoogleMapsPreviewProps {
  mapsUrl: string;
  address: string;
}

export default function GoogleMapsPreview({ mapsUrl, address }: GoogleMapsPreviewProps) {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!mapsUrl) {
      setIsValid(false);
      return;
    }

    // Convert Google Maps URL to a working embed URL without API key
    const convertToEmbedUrl = (url: string): string => {
      try {
        // Handle different Google Maps URL formats
        if (url.includes('maps.google.com') || url.includes('goo.gl/maps')) {
          // For now, we'll use a static map image or redirect approach
          // since we don't have an API key
          return '';
        }
        
        return '';
      } catch (error) {
        console.error('Error converting maps URL:', error);
        return '';
      }
    };

    const embed = convertToEmbedUrl(mapsUrl);
    setEmbedUrl(embed);
    setIsValid(!!embed);
  }, [mapsUrl, address]);

  const handleOpenMaps = () => {
    if (mapsUrl) {
      window.open(mapsUrl, '_blank');
    }
  };

  if (!mapsUrl) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-sm text-gray-500 text-center">
          No Google Maps location provided
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {/* Map Preview */}
      <div className="relative">
        <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border-2 border-dashed border-blue-200 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700">Location Preview</p>
              <p className="text-xs text-gray-500 mt-1">{address || 'Address not provided'}</p>
            </div>
            <button
              onClick={handleOpenMaps}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 mx-auto transition-colors duration-200"
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              <span>Open in Google Maps</span>
            </button>
          </div>
        </div>
        {mapsUrl && (
          <div className="absolute top-2 right-2">
            <button
              onClick={handleOpenMaps}
              className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 px-3 py-1 rounded-md shadow-sm flex items-center space-x-1 text-sm font-medium transition-all duration-200"
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              <span>Open</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Location Link */}
      {mapsUrl && (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">Google Maps Location</p>
            <p className="text-sm text-gray-600 truncate">{address || 'Address not provided'}</p>
            <p className="text-xs text-blue-600 mt-1">Click to open in Google Maps</p>
          </div>
          <button
            onClick={handleOpenMaps}
            className="ml-3 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
            title="Open in Google Maps"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
} 