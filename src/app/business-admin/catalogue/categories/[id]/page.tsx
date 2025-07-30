'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { productsAPI } from '@/lib/api';

interface Category {
  id: number;
  name: string;
  description: string;
  parent: {
    id: number;
    name: string;
  } | null;
  product_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  category_name: string;
  selling_price: number;
  current_price: number;
  quantity: number;
  status: string;
  is_in_stock: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  created_at: string;
}

export default function CategoryDetail() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (categoryId) {
      fetchData();
    }
  }, [categoryId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch category data
      const categoryData = await productsAPI.getCategory(Number(categoryId));
      console.log('Category Data:', categoryData);
      
      // Fetch products data with better error handling
      let productsData = [];
      try {
        // Use the new dedicated API for products by category
        const productsResponse = await productsAPI.getProductsByCategory(Number(categoryId));
        console.log('Products Response:', productsResponse);
        
        // Handle different response formats (direct array or paginated)
        if (Array.isArray(productsResponse)) {
          productsData = productsResponse;
        } else if (productsResponse && Array.isArray(productsResponse.results)) {
          productsData = productsResponse.results;
        } else if (productsResponse && Array.isArray(productsResponse.data)) {
          productsData = productsResponse.data;
        } else {
          console.warn('Unexpected products response format:', productsResponse);
          productsData = [];
        }
        
        console.log('Processed Products:', productsData);
        console.log('Products count:', productsData.length);
        
      } catch (productsError) {
        console.error('Error fetching products:', productsError);
        setError('Failed to load products for this category');
      }
      
      setCategory(categoryData);
      setProducts(productsData);
    } catch (err: any) {
      console.error('Error fetching category data:', err);
      setError('Failed to load category details');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
      discontinued: { color: 'bg-red-100 text-red-800', label: 'Discontinued' },
      out_of_stock: { color: 'bg-yellow-100 text-yellow-800', label: 'Out of Stock' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getStockBadge = (quantity: number, isInStock: boolean) => {
    if (!isInStock || quantity === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Out of Stock
        </span>
      );
    }
    
    if (quantity <= 5) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Low Stock ({quantity})
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        In Stock ({quantity})
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading category</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
          <p className="text-gray-600">{category.description || 'No description available'}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => router.push(`/business-admin/catalogue/categories/${category.id}/edit`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit Category
          </button>
          <button
            onClick={() => router.back()}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Category Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Category Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Category Name</label>
                <p className="mt-1 text-sm text-gray-900">{category.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Parent Category</label>
                <p className="mt-1 text-sm text-gray-900">
                  {category.parent ? category.parent.name : 'No parent category'}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-sm text-gray-900">
                  {category.description || 'No description available'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    category.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Total Products</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{category.product_count}</p>
              </div>
            </div>
          </div>

          {/* Products in this Category */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Products in this Category ({products.length})</h3>
            </div>
            <div className="p-6">
              {products.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.sku}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(product.current_price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStockBadge(product.quantity, product.is_in_stock)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(product.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => router.push(`/business-admin/catalogue/${product.id}`)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View
                              </button>
                              <button 
                                onClick={() => router.push(`/business-admin/catalogue/${product.id}/edit`)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-sm">No products in this category</div>
                  <p className="text-gray-500 text-xs mt-2">Add products to this category to see them here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Category Statistics</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Total Products</label>
                <p className="mt-1 text-2xl font-bold text-gray-900">{category.product_count}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Active Products</label>
                <p className="mt-1 text-lg font-semibold text-green-600">
                  {products.filter(p => p.status === 'active').length}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Out of Stock</label>
                <p className="mt-1 text-lg font-semibold text-red-600">
                  {products.filter(p => !p.is_in_stock).length}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Featured Products</label>
                <p className="mt-1 text-lg font-semibold text-blue-600">
                  {products.filter(p => p.is_featured).length}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Timestamps</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-500">Created</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(category.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(category.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/business-admin/catalogue/create')}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                Add Product to Category
              </button>
              <button
                onClick={() => router.push('/business-admin/catalogue/categories/create')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Create Subcategory
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 