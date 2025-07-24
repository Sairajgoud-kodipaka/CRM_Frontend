export default function PlatformAdminSupport() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Support Management</h2>
        <p className="text-gray-600">Manage support tickets and customer inquiries across all tenants</p>
      </div>

      {/* Support Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Open Tickets</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600">No open tickets</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Resolved Today</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600">No tickets resolved</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Avg Response Time</h3>
          <p className="text-3xl font-bold text-gray-900">--</p>
          <p className="text-sm text-gray-600">No data available</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Satisfaction Rate</h3>
          <p className="text-3xl font-bold text-gray-900">--</p>
          <p className="text-sm text-gray-600">No ratings</p>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Support Tickets</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">No support tickets</div>
            <p className="text-gray-500 text-xs mt-2">Tickets will appear here once submitted</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <h4 className="font-medium text-gray-900">Create Ticket</h4>
              <p className="text-sm text-gray-600">Add new support ticket</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <h4 className="font-medium text-gray-900">View Reports</h4>
              <p className="text-sm text-gray-600">Support analytics</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <h4 className="font-medium text-gray-900">Settings</h4>
              <p className="text-sm text-gray-600">Configure support</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 