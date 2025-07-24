export default function CatalogueManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Catalogue Management</h2>
        <p className="text-gray-600">Manage your product catalog and inventory</p>
      </div>

      {/* Catalogue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600">No products</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Listings</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600">No active listings</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Categories</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600">No categories</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
          <p className="text-3xl font-bold text-gray-900">$0</p>
          <p className="text-sm text-gray-600">No inventory value</p>
        </div>
      </div>

      {/* Product Categories */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Product Categories</h3>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Add Category
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">No product categories</div>
            <p className="text-gray-500 text-xs mt-2">Create categories to organize your products</p>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Recent Products</h3>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              Add Product
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">No products</div>
            <p className="text-gray-500 text-xs mt-2">Add your first product to get started</p>
          </div>
        </div>
      </div>
    </div>
  );
} 