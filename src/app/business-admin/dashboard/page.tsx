export default function BusinessAdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Business Dashboard</h2>
        <p className="text-gray-600">Overview of your jewelry business performance and operations</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Sales</h3>
          <p className="text-3xl font-bold text-gray-900">$0</p>
          <p className="text-sm text-gray-600">No sales data</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Customers</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600">No customers</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Products</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600">No products</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Team Members</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600">No team members</p>
        </div>
      </div>

      {/* Sales Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-sm font-medium text-gray-500">Leads</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
          <p className="text-sm text-gray-600">No leads</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-sm font-medium text-gray-500">Qualified</h3>
          <p className="text-3xl font-bold text-yellow-600">0</p>
          <p className="text-sm text-gray-600">No qualified leads</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-sm font-medium text-gray-500">Proposals</h3>
          <p className="text-3xl font-bold text-orange-600">0</p>
          <p className="text-sm text-gray-600">No proposals</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-sm font-medium text-gray-500">Negotiations</h3>
          <p className="text-3xl font-bold text-purple-600">0</p>
          <p className="text-sm text-gray-600">No negotiations</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-sm font-medium text-gray-500">Closed</h3>
          <p className="text-3xl font-bold text-green-600">0</p>
          <p className="text-sm text-gray-600">No closed deals</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Sales</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <div className="text-gray-400 text-sm">No recent sales</div>
              <p className="text-gray-500 text-xs mt-2">Sales will appear here once recorded</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <div className="text-gray-400 text-sm">No recent activity</div>
              <p className="text-gray-500 text-xs mt-2">Activity will appear here once the system is in use</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 