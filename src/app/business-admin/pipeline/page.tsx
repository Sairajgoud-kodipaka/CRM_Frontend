export default function PipelineAutomation() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Sales Pipeline & Automation</h2>
        <p className="text-gray-600">Manage your sales pipeline and automate customer interactions</p>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Pipeline Value</h3>
          <p className="text-3xl font-bold text-gray-900">$0</p>
          <p className="text-sm text-gray-600">No pipeline value</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Deals</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600">No active deals</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
          <p className="text-3xl font-bold text-gray-900">0%</p>
          <p className="text-sm text-gray-600">No conversion data</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Avg Deal Size</h3>
          <p className="text-3xl font-bold text-gray-900">$0</p>
          <p className="text-sm text-gray-600">No deal data</p>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Pipeline Stages</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">No pipeline stages</div>
            <p className="text-gray-500 text-xs mt-2">Configure your sales pipeline stages to get started</p>
          </div>
        </div>
      </div>

      {/* Automation Workflows */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Automation Workflows</h3>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              Create Workflow
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">No automation workflows</div>
            <p className="text-gray-500 text-xs mt-2">Create workflows to automate customer interactions</p>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">No recent activities</div>
            <p className="text-gray-500 text-xs mt-2">Activities will appear here once the pipeline is in use</p>
          </div>
        </div>
      </div>
    </div>
  );
} 