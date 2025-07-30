export default function PlatformAdminSalesFunnel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Sales Funnel Overview</h2>
        <p className="text-gray-600">Cross-tenant sales performance and funnel analysis</p>
      </div>

      {/* Funnel Metrics */}
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

      {/* Top Performing Tenants */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Top Performing Tenants</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">No tenant data</div>
            <p className="text-gray-500 text-xs mt-2">Performance data will appear here once tenants are active</p>
          </div>
        </div>
      </div>
    </div>
  );
} 