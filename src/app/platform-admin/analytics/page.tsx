export default function PlatformAdminAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Platform Analytics</h2>
        <p className="text-gray-600">Usage statistics and live analytics across all CRM deployments</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-900">$0</p>
          <p className="text-sm text-gray-600">No revenue data</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Sessions</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600">No active sessions</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">API Calls</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600">No API calls</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Storage Used</h3>
          <p className="text-3xl font-bold text-gray-900">0 GB</p>
          <p className="text-sm text-gray-600">No storage used</p>
        </div>
      </div>

      {/* Usage by Tenant */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Usage by Tenant</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">No tenant data</div>
            <p className="text-gray-500 text-xs mt-2">Usage statistics will appear here once tenants are active</p>
          </div>
        </div>
      </div>

      {/* System Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">System Performance</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <div className="text-gray-400 text-sm">No performance data</div>
              <p className="text-gray-500 text-xs mt-2">Performance metrics will be available once the system is in use</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Error Logs</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <div className="text-gray-400 text-sm">No errors</div>
              <p className="text-gray-500 text-xs mt-2">System is running smoothly</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 