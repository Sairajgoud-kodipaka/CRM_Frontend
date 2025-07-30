'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { productsAPI } from '@/lib/api';

// Check if user is authenticated
const isAuthenticated = () => {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('access_token');
  }
  return false;
};

export default function CreateCategory() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent: '',
  });

  // Fetch existing categories for parent dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productsAPI.getCategories();
        console.log('Raw API response:', response);
        
        // Handle different response structures
        let categoriesArray = [];
        if (Array.isArray(response)) {
          categoriesArray = response;
        } else if (response && Array.isArray(response.results)) {
          categoriesArray = response.results;
        } else if (response && Array.isArray(response.data)) {
          categoriesArray = response.data;
        }
        
        console.log('Processed categories array:', categoriesArray);
        setCategories(categoriesArray);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Don't show error for parent categories - make it optional
        setCategories([]); // Set empty array on error
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check authentication
    if (!isAuthenticated()) {
      setError('You must be logged in to create categories');
      setLoading(false);
      return;
    }

    // Validate input
    if (!formData.name.trim()) {
      setError('Category name is required');
      setLoading(false);
      return;
    }

    // Check if category name already exists
    const existingCategory = categories.find((cat: any) => 
      cat.name.toLowerCase() === formData.name.toLowerCase()
    );
    
    if (existingCategory) {
      setError(`A category with the name "${formData.name}" already exists. Please choose a different name.`);
      setLoading(false);
      return;
    }

    try {
      // Create a simple category data object
      const categoryData: {
        name: string;
        description: string;
        parent?: number;
      } = {
        name: formData.name.trim(),
        description: formData.description.trim() || '',
      };

      // Only add parent if it's selected
      if (formData.parent && formData.parent !== '') {
        categoryData.parent = parseInt(formData.parent);
      }

      console.log('Sending category data:', categoryData);
      const result = await productsAPI.createCategory(categoryData);
      console.log('Category created successfully:', result);
      router.push('/business-admin/catalogue');
    } catch (err: any) {
      console.error('Error creating category:', err);
      console.log('Full error response:', err.response?.data);
      
      // Handle different types of validation errors
      if (err.response?.data) {
        const errorData = err.response.data;
        console.log('Error data:', errorData);
        
        if (errorData.name) {
          setError(`Category name error: ${Array.isArray(errorData.name) ? errorData.name.join(', ') : errorData.name}`);
        } else if (errorData.non_field_errors) {
          setError(errorData.non_field_errors.join(', '));
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else {
          // Show the full error data for debugging
          setError(`Validation error: ${JSON.stringify(errorData)}`);
        }
      } else {
        setError('Failed to create category');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Create New Category</h2>
        <p className="text-gray-600">Add a new category to organize your products</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error creating category</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter category name"
          />
          {categories.length > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              Existing categories: {categories.map((cat: any) => cat.name).join(', ')}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter category description"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parent Category (Optional)
          </label>
          <select
            name="parent"
            value={formData.parent}
            onChange={handleInputChange}
            disabled={categoriesLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">No Parent Category</option>
            {categoriesLoading ? (
              <option value="" disabled>Loading categories...</option>
            ) : categories.length === 0 ? (
              <option value="" disabled>No categories available</option>
            ) : (
              categories.map((category: any) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            )}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Select a parent category to create a subcategory, or leave empty for a top-level category
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  );
} 