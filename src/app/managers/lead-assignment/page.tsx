"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import Link from "next/link";

interface CustomerVisit {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  interests: string[];
  visit_timestamp: string;
  notes: string;
  lead_quality: string;
  sales_rep_details: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface Telecaller {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export default function LeadAssignmentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [todayLeads, setTodayLeads] = useState<CustomerVisit[]>([]);
  const [telecallers, setTelecallers] = useState<Telecaller[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [loadingTelecallers, setLoadingTelecallers] = useState(true);
  const [error, setError] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [selectedTelecallers, setSelectedTelecallers] = useState<number[]>([]);
  const [assignmentPriority, setAssignmentPriority] = useState("medium");
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role !== 'manager') {
        router.replace('/managers/dashboard');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetchTodayLeads();
    fetchTelecallers();
  }, []);

  const fetchTodayLeads = async () => {
    setLoadingLeads(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get("http://localhost:8000/api/telecalling/customer-visits/today_leads/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodayLeads(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch today's leads");
    } finally {
      setLoadingLeads(false);
    }
  };

  const fetchTelecallers = async () => {
    setLoadingTelecallers(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get("http://localhost:8000/api/auth/list/?role=tele_calling", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTelecallers(res.data.results || res.data);
    } catch (err: any) {
      console.error("Failed to fetch telecallers:", err);
    } finally {
      setLoadingTelecallers(false);
    }
  };

  const handleLeadSelection = (leadId: number) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleTelecallerSelection = (telecallerId: number) => {
    setSelectedTelecallers(prev => 
      prev.includes(telecallerId) 
        ? prev.filter(id => id !== telecallerId)
        : [...prev, telecallerId]
    );
  };

  const handleBulkAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLeads.length === 0 || selectedTelecallers.length === 0) {
      setAssignmentError("Please select at least one lead and one telecaller");
      return;
    }

    setAssigning(true);
    setAssignmentError("");
    
    try {
      const token = localStorage.getItem("access_token");
      await axios.post("http://localhost:8000/api/telecalling/assignments/bulk_assign/", {
        customer_visit_ids: selectedLeads,
        telecaller_ids: selectedTelecallers,
        priority: assignmentPriority,
        notes: assignmentNotes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Reset form
      setSelectedLeads([]);
      setSelectedTelecallers([]);
      setAssignmentPriority("medium");
      setAssignmentNotes("");
      setShowAssignmentModal(false);
      
      // Refresh leads
      fetchTodayLeads();
      
      // Show success message
      alert("Leads assigned successfully!");
    } catch (err: any) {
      setAssignmentError(err.response?.data?.detail || "Failed to assign leads");
    } finally {
      setAssigning(false);
    }
  };

  const selectAllLeads = () => {
    setSelectedLeads(todayLeads.map(lead => lead.id));
  };

  const deselectAllLeads = () => {
    setSelectedLeads([]);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  if (!user || user.role !== 'manager') {
    return null;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Today's Lead Assignment</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAssignmentModal(true)}
            disabled={selectedLeads.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Assign Selected ({selectedLeads.length})
          </button>
          <Link 
            href="/managers/dashboard"
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Bulk Assign Leads</h2>
              <button 
                onClick={() => setShowAssignmentModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleBulkAssignment} className="space-y-4">
              {assignmentError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                  {assignmentError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2">Selected Leads ({selectedLeads.length})</label>
                <div className="max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                  {todayLeads.filter(lead => selectedLeads.includes(lead.id)).map(lead => (
                    <div key={lead.id} className="text-sm py-1">
                      {lead.customer_name} - {lead.customer_phone}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Assign to Telecallers</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                  {telecallers.map(telecaller => (
                    <label key={telecaller.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedTelecallers.includes(telecaller.id)}
                        onChange={() => handleTelecallerSelection(telecaller.id)}
                        className="rounded"
                      />
                      <span className="text-sm">{telecaller.first_name} {telecaller.last_name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={assignmentPriority}
                    onChange={(e) => setAssignmentPriority(e.target.value)}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Assignment Notes</label>
                <textarea
                  rows={3}
                  className="w-full border rounded px-3 py-2"
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  placeholder="Any specific instructions for the telecallers..."
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={assigning || selectedTelecallers.length === 0}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {assigning ? "Assigning..." : "Assign Leads"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAssignmentModal(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loadingLeads ? (
        <div className="text-gray-500 text-center py-12">Loading today's leads...</div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
          {error}
        </div>
      ) : todayLeads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-5xl mb-4">📊</div>
          <div className="text-lg font-semibold mb-2">No leads for today</div>
          <div className="text-gray-500">All leads have been assigned or no visits recorded today.</div>
        </div>
      ) : (
        <>
          {/* Selection Controls */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <button 
                onClick={selectAllLeads}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Select All
              </button>
              <button 
                onClick={deselectAllLeads}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
              >
                Deselect All
              </button>
            </div>
            <div className="text-sm text-gray-600">
              {selectedLeads.length} of {todayLeads.length} leads selected
            </div>
          </div>

          {/* Leads Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">
                    <input
                      type="checkbox"
                      checked={selectedLeads.length === todayLeads.length}
                      onChange={(e) => e.target.checked ? selectAllLeads() : deselectAllLeads()}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-2 text-left">Customer</th>
                  <th className="px-4 py-2 text-left">Contact</th>
                  <th className="px-4 py-2 text-left">Interests</th>
                  <th className="px-4 py-2 text-left">Lead Quality</th>
                  <th className="px-4 py-2 text-left">Sales Rep</th>
                  <th className="px-4 py-2 text-left">Visit Time</th>
                </tr>
              </thead>
              <tbody>
                {todayLeads.map((lead) => (
                  <tr key={lead.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => handleLeadSelection(lead.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-2 font-medium">{lead.customer_name}</td>
                    <td className="px-4 py-2">
                      <div>{lead.customer_phone}</div>
                      {lead.customer_email && (
                        <div className="text-sm text-gray-500">{lead.customer_email}</div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-1">
                        {lead.interests.slice(0, 2).map(interest => (
                          <span key={interest} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                            {interest}
                          </span>
                        ))}
                        {lead.interests.length > 2 && (
                          <span className="text-gray-500 text-xs">+{lead.interests.length - 2} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        lead.lead_quality === 'hot' ? 'bg-red-100 text-red-700' :
                        lead.lead_quality === 'warm' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {lead.lead_quality}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {lead.sales_rep_details.first_name} {lead.sales_rep_details.last_name}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {new Date(lead.visit_timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
} 