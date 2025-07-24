export default function EcommerceIntegration() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">E-commerce Integration</h2>
        <p className="text-gray-600">Manage your online store and e-commerce platforms</p>
      </div>

      {/* E-commerce Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Online Sales</h3>
          <p className="text-3xl font-bold text-gray-900">$0</p>
          <p className="text-sm text-gray-600">No online sales</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Orders</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600">No orders</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Products Online</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600">No online products</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
          <p className="text-3xl font-bold text-gray-900">0%</p>
          <p className="text-sm text-gray-600">No conversion data</p>
        </div>
      </div>

      {/* Platform Connections */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Platform Connections</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">No platform connections</div>
            <p className="text-gray-500 text-xs mt-2">Connect your e-commerce platforms to get started</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">No recent orders</div>
            <p className="text-gray-500 text-xs mt-2">Orders will appear here once received</p>
          </div>
        </div>
      </div>

      {/* Sync Status */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Sync Status</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">No sync data</div>
            <p className="text-gray-500 text-xs mt-2">Sync status will appear here once platforms are connected</p>
          </div>
        </div>
      </div>
    </div>
  );
} 