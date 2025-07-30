'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { productsAPI } from '@/lib/api';

interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  category: {
    id: number;
    name: string;
    description: string;
  };
  brand: string;
  cost_price: number;
  selling_price: number;
  discount_price: number;
  quantity: number;
  min_quantity: number;
  max_quantity: number;
  weight: number;
  dimensions: string;
  material: string;
  color: string;
  size: string;
  status: string;
  is_featured: boolean;
  is_bestseller: boolean;
  meta_title: string;
  meta_description: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  is_in_stock: boolean;
  is_low_stock: boolean;
  current_price: number;
  profit_margin: number;
  variants: any[];
  variant_count: number;
}

export default function ProductDetail() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getProduct(Number(productId));
      setProduct(data);
    } catch (err: any) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details');
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

  if (error || !product) {
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
              <h3 className="text-sm font-medium text-red-800">Error loading product</h3>
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
          <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
          <p className="text-gray-600">SKU: {product.sku}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => router.push(`/business-admin/catalogue/${product.id}/edit`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit Product
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
        {/* Main Product Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Product Name</label>
                <p className="mt-1 text-sm text-gray-900">{product.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">SKU</label>
                <p className="mt-1 text-sm text-gray-900">{product.sku}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Brand</label>
                <p className="mt-1 text-sm text-gray-900">{product.brand || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Category</label>
                <p className="mt-1 text-sm text-gray-900">{product.category?.name || 'Uncategorized'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-sm text-gray-900">{product.description || 'No description available'}</p>
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Cost Price</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(product.cost_price)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Selling Price</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(product.selling_price)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Current Price</label>
                <p className="mt-1 text-lg font-semibold text-blue-600">{formatCurrency(product.current_price)}</p>
              </div>
              {product.discount_price && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Discount Price</label>
                  <p className="mt-1 text-lg font-semibold text-green-600">{formatCurrency(product.discount_price)}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-500">Profit Margin</label>
                <p className="mt-1 text-lg font-semibold text-green-600">{product.profit_margin.toFixed(2)}%</p>
              </div>
            </div>
          </div>

          {/* Inventory Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Current Stock</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{product.quantity}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Stock Status</label>
                <div className="mt-1">{getStockBadge(product.quantity, product.is_in_stock)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Minimum Stock</label>
                <p className="mt-1 text-sm text-gray-900">{product.min_quantity}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Maximum Stock</label>
                <p className="mt-1 text-sm text-gray-900">{product.max_quantity}</p>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Weight</label>
                <p className="mt-1 text-sm text-gray-900">{product.weight ? `${product.weight}g` : 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Dimensions</label>
                <p className="mt-1 text-sm text-gray-900">{product.dimensions || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Material</label>
                <p className="mt-1 text-sm text-gray-900">{product.material || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Color</label>
                <p className="mt-1 text-sm text-gray-900">{product.color || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Size</label>
                <p className="mt-1 text-sm text-gray-900">{product.size || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Visibility */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status & Visibility</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">{getStatusBadge(product.status)}</div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={product.is_featured}
                  disabled
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Featured Product</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={product.is_bestseller}
                  disabled
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Bestseller</label>
              </div>
            </div>
          </div>

          {/* SEO Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Meta Title</label>
                <p className="mt-1 text-sm text-gray-900">{product.meta_title || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Meta Description</label>
                <p className="mt-1 text-sm text-gray-900">{product.meta_description || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Tags</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {product.tags && product.tags.length > 0 ? (
                    product.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No tags</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Variants ({product.variant_count})</h3>
              <div className="space-y-3">
                {product.variants.slice(0, 3).map((variant) => (
                  <div key={variant.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{variant.name}</p>
                        <p className="text-xs text-gray-500">SKU: {variant.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(variant.current_price)}</p>
                        <p className="text-xs text-gray-500">Stock: {variant.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {product.variants.length > 3 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{product.variants.length - 3} more variants
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Timestamps</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-500">Created</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(product.created_at).toLocaleDateString('en-US', {
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
                  {new Date(product.updated_at).toLocaleDateString('en-US', {
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
        </div>
      </div>
    </div>
  );
} 