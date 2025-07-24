export default function WhatsAppIntegration() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">WhatsApp Integration</h2>
        <p className="text-gray-600">Manage your WhatsApp Business integration and messaging</p>
      </div>

      {/* WhatsApp Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Messages Sent</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600">No messages sent</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Messages Received</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600">No messages received</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Response Rate</h3>
          <p className="text-3xl font-bold text-gray-900">0%</p>
          <p className="text-sm text-gray-600">No response data</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Chats</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600">No active chats</p>
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Connection Status</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">WhatsApp not connected</div>
            <p className="text-gray-500 text-xs mt-2">Connect your WhatsApp Business account to get started</p>
            <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              Connect WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Recent Messages */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Messages</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">No recent messages</div>
            <p className="text-gray-500 text-xs mt-2">Messages will appear here once WhatsApp is connected</p>
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
              <h4 className="font-medium text-gray-900">Send Broadcast</h4>
              <p className="text-sm text-gray-600">Send message to multiple contacts</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <h4 className="font-medium text-gray-900">View Templates</h4>
              <p className="text-sm text-gray-600">Manage message templates</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <h4 className="font-medium text-gray-900">Settings</h4>
              <p className="text-sm text-gray-600">Configure WhatsApp settings</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 