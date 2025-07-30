"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface CustomerVisit {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  interests: string[];
  visit_timestamp: string;
  notes: string;
  lead_quality: string;
  assigned_to_telecaller: boolean;
  created_at: string;
  sales_rep_details?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface Assignment {
  id: number;
  telecaller: number;
  customer_visit: number;
  assigned_by: number;
  status: string;
  priority: string;
  scheduled_time: string | null;
  notes: string;
  outcome: string;
  created_at: string;
  updated_at: string;
  telecaller_details?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  assigned_by_details?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  customer_visit_details?: CustomerVisit;
}

interface UserMini {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export default function AssignmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [telecallers, setTelecallers] = useState<UserMini[]>([]);
  const [customerVisits, setCustomerVisits] = useState<CustomerVisit[]>([]);
  const [formTelecaller, setFormTelecaller] = useState("");
  const [formCustomerVisit, setFormCustomerVisit] = useState("");
  const [formScheduled, setFormScheduled] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState("assigned");
  const [formPriority, setFormPriority] = useState("medium");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [filterTelecaller, setFilterTelecaller] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role !== 'tele_calling' && user.role !== 'manager') {
        router.replace('/dashboard');
      }
    }
  }, [user, authLoading, router]);

  // Fetch telecallers and customer visits for dropdowns (managers only)
  useEffect(() => {
    if (user?.role === 'manager') {
      const fetchDropdowns = async () => {
        try {
          const token = localStorage.getItem("access_token");
          const [teleRes, visitsRes] = await Promise.all([
            axios.get("http://localhost:8000/api/auth/list/?role=tele_calling", { 
              headers: { Authorization: `Bearer ${token}` } 
            }),
            axios.get("http://localhost:8000/api/telecalling/customer-visits/today_leads/", { 
              headers: { Authorization: `Bearer ${token}` } 
            })
          ]);
          setTelecallers(teleRes.data.results || teleRes.data);
          setCustomerVisits(visitsRes.data.results || visitsRes.data);
        } catch (err) {
          console.error("Failed to fetch dropdowns:", err);
        }
      };
      fetchDropdowns();
    }
  }, [user]);

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("access_token");
        console.log("Token exists:", !!token);
        console.log("Making request to:", "http://localhost:8000/api/telecalling/assignments/");
        
        const res = await axios.get("http://localhost:8000/api/telecalling/assignments/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Assignments response:", res.data);
        setAssignments(res.data.results || res.data);
      } catch (err: any) {
        console.error("Failed to fetch assignments:", err);
        console.error("Error status:", err.response?.status);
        console.error("Error data:", err.response?.data);
        console.error("Error message:", err.message);
        
        if (err.response?.status === 401) {
          setError("Authentication failed. Please login again.");
        } else if (err.response?.status === 404) {
          setError("API endpoint not found. Please check if the server is running.");
        } else if (err.code === 'ECONNREFUSED') {
          setError("Cannot connect to server. Please check if the backend is running on localhost:8000");
        } else {
          setError(err.response?.data?.detail || err.message || "Failed to fetch assignments");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      const token = localStorage.getItem("access_token");
      await axios.post("http://localhost:8000/api/telecalling/assignments/", {
        telecaller: formTelecaller,
        customer_visit: formCustomerVisit,
        scheduled_time: formScheduled || null,
        notes: formNotes,
        status: formStatus,
        priority: formPriority,
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      // Reset form
      setFormTelecaller("");
      setFormCustomerVisit("");
      setFormScheduled("");
      setFormNotes("");
      setFormStatus("assigned");
      setFormPriority("medium");
      setShowCreateModal(false);
      
      // Refresh assignments
      const res = await axios.get("http://localhost:8000/api/telecalling/assignments/", { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setAssignments(res.data.results || res.data);
    } catch (err: any) {
      console.error("Failed to create assignment:", err);
      setFormError(err.response?.data?.detail || "Failed to create assignment");
    } finally {
      setFormLoading(false);
    }
  };

  const handleMakeCall = (assignment: Assignment) => {
    const customer = assignment.customer_visit_details;
    if (customer?.customer_phone) {
      // Open phone dialer
      window.open(`tel:${customer.customer_phone}`, '_blank');
    }
  };

  const handleSendEmail = (assignment: Assignment) => {
    const customer = assignment.customer_visit_details;
    if (customer?.customer_email) {
      // Open email client
      const subject = encodeURIComponent(`Follow up on your visit - ${customer.customer_name}`);
      const body = encodeURIComponent(`Dear ${customer.customer_name},\n\nThank you for visiting us. We would like to follow up on your interest in our products.\n\nBest regards,\nYour Sales Team`);
      window.open(`mailto:${customer.customer_email}?subject=${subject}&body=${body}`, '_blank');
    }
  };

  const handleSendMessage = (assignment: Assignment) => {
    const customer = assignment.customer_visit_details;
    if (customer?.customer_phone) {
      // Open WhatsApp or SMS
      const message = encodeURIComponent(`Hi ${customer.customer_name}, thank you for visiting us. We would like to follow up on your interest in our products.`);
      window.open(`https://wa.me/${customer.customer_phone.replace(/\D/g, '')}?text=${message}`, '_blank');
    }
  };

  // Filtered assignments
  const filteredAssignments = assignments.filter(a => {
    const teleName = a.telecaller_details ? `${a.telecaller_details.first_name} ${a.telecaller_details.last_name}`.toLowerCase() : "";
    const customerName = a.customer_visit_details ? a.customer_visit_details.customer_name.toLowerCase() : "";
    const matchesTele = !filterTelecaller || (a.telecaller_details && a.telecaller_details.id.toString() === filterTelecaller);
    const matchesStatus = !filterStatus || a.status === filterStatus;
    const matchesSearch = !search ||
      teleName.includes(search.toLowerCase()) ||
      customerName.includes(search.toLowerCase()) ||
      (a.notes && a.notes.toLowerCase().includes(search.toLowerCase()));
    return matchesTele && matchesStatus && matchesSearch;
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  if (!user || (user.role !== 'tele_calling' && user.role !== 'manager')) {
    return null;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Tele-calling Assignments</h1>
      
      {user.role === 'manager' && (
        <button 
          className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" 
          onClick={() => setShowCreateModal(true)}
        >
          + Create Assignment
        </button>
      )}

      {/* Create Assignment Modal (Managers only) */}
      {showCreateModal && user.role === 'manager' && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
            <button 
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl" 
              onClick={() => setShowCreateModal(false)}
            >
              &times;
            </button>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <h2 className="text-lg font-semibold mb-2">Create New Assignment</h2>
              {formError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2">{formError}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Telecaller</label>
                  <select 
                    className="w-full border rounded px-2 py-1" 
                    value={formTelecaller} 
                    onChange={e => setFormTelecaller(e.target.value)} 
                    required
                  >
                    <option value="">Select telecaller</option>
                    {telecallers.map(tc => (
                      <option key={tc.id} value={tc.id}>
                        {tc.first_name} {tc.last_name} ({tc.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Customer Visit</label>
                  <select 
                    className="w-full border rounded px-2 py-1" 
                    value={formCustomerVisit} 
                    onChange={e => setFormCustomerVisit(e.target.value)} 
                    required
                  >
                    <option value="">Select customer visit</option>
                    {customerVisits.map(cv => (
                      <option key={cv.id} value={cv.id}>
                        {cv.customer_name} - {cv.customer_phone} ({cv.lead_quality})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Scheduled Time</label>
                  <input 
                    type="datetime-local" 
                    className="w-full border rounded px-2 py-1" 
                    value={formScheduled} 
                    onChange={e => setFormScheduled(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select 
                    className="w-full border rounded px-2 py-1" 
                    value={formPriority} 
                    onChange={e => setFormPriority(e.target.value)}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea 
                  className="w-full border rounded px-2 py-1" 
                  value={formNotes} 
                  onChange={e => setFormNotes(e.target.value)} 
                  rows={3}
                  placeholder="Enter specific instructions for the telecaller..."
                />
              </div>
              
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" 
                  disabled={formLoading}
                >
                  {formLoading ? "Creating..." : "Create Assignment"}
                </button>
                <button 
                  type="button" 
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300" 
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Details Modal */}
      {showClientModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
            <button 
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl" 
              onClick={() => setShowClientModal(false)}
            >
              &times;
            </button>
            
                         <div className="space-y-4">
               <h2 className="text-lg font-semibold mb-4">
                 Client Details & Task
                 {selectedAssignment.customer_visit_details && (
                   <span className="text-blue-600 ml-2">
                     - {selectedAssignment.customer_visit_details.customer_name}
                   </span>
                 )}
               </h2>
              
              {selectedAssignment.customer_visit_details && (
                <div className="space-y-4">
                  {/* Client Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">{selectedAssignment.customer_visit_details.customer_name}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Phone:</span> {selectedAssignment.customer_visit_details.customer_phone}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {selectedAssignment.customer_visit_details.customer_email || 'Not provided'}
                      </div>
                      <div>
                        <span className="font-medium">Lead Quality:</span> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          selectedAssignment.customer_visit_details.lead_quality === 'hot' ? 'bg-red-100 text-red-700' :
                          selectedAssignment.customer_visit_details.lead_quality === 'warm' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {selectedAssignment.customer_visit_details.lead_quality}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Visit Date:</span> {new Date(selectedAssignment.customer_visit_details.visit_timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {selectedAssignment.customer_visit_details.interests.length > 0 && (
                      <div className="mt-3">
                        <span className="font-medium">Product Interests:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedAssignment.customer_visit_details.interests.map(interest => (
                            <span key={interest} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sales Rep Notes */}
                  {selectedAssignment.customer_visit_details.notes && (
                    <div>
                      <h4 className="font-medium mb-2">Sales Rep Notes:</h4>
                      <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                        {selectedAssignment.customer_visit_details.notes}
                      </div>
                    </div>
                  )}

                                     {/* Assignment Details */}
                   <div className="bg-gray-50 p-3 rounded">
                     <h4 className="font-medium mb-2">Assignment Details:</h4>
                     <div className="grid grid-cols-2 gap-4 text-sm">
                       <div>
                         <span className="font-medium">Status:</span> 
                         <span className={`ml-2 px-2 py-1 rounded text-xs ${
                           selectedAssignment.status === 'completed' ? 'bg-green-100 text-green-700' : 
                           selectedAssignment.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 
                           selectedAssignment.status === 'follow_up' ? 'bg-yellow-100 text-yellow-700' :
                           selectedAssignment.status === 'unreachable' ? 'bg-red-100 text-red-700' :
                           'bg-gray-100 text-gray-700'
                         }`}>
                           {selectedAssignment.status.replace('_', ' ')}
                         </span>
                       </div>
                       <div>
                         <span className="font-medium">Priority:</span> 
                         <span className={`ml-2 px-2 py-1 rounded text-xs ${
                           selectedAssignment.priority === 'high' ? 'bg-red-100 text-red-700' :
                           selectedAssignment.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                           'bg-gray-100 text-gray-700'
                         }`}>
                           {selectedAssignment.priority}
                         </span>
                       </div>
                       <div>
                         <span className="font-medium">Assigned:</span> {new Date(selectedAssignment.created_at).toLocaleDateString()}
                       </div>
                       {selectedAssignment.assigned_by_details && (
                         <div>
                           <span className="font-medium">By:</span> {selectedAssignment.assigned_by_details.first_name} {selectedAssignment.assigned_by_details.last_name}
                         </div>
                       )}
                     </div>
                   </div>

                   {/* Manager's Task */}
                   {selectedAssignment.notes && (
                     <div>
                       <h4 className="font-medium mb-2">Manager's Task:</h4>
                       <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                         {selectedAssignment.notes}
                       </div>
                     </div>
                   )}

                                     {/* Action Buttons */}
                   <div className="pt-4 border-t">
                     <h4 className="font-medium mb-3 text-gray-700">Quick Actions:</h4>
                     <div className="flex flex-wrap gap-3">
                       <button
                         onClick={() => handleMakeCall(selectedAssignment)}
                         className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
                       >
                         📞 Make Call
                       </button>
                       {selectedAssignment.customer_visit_details.customer_email && (
                         <button
                           onClick={() => handleSendEmail(selectedAssignment)}
                           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                         >
                           📧 Send Email
                         </button>
                       )}
                       <button
                         onClick={() => handleSendMessage(selectedAssignment)}
                         className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2 transition-colors"
                       >
                         💬 Send WhatsApp
                       </button>
                       <Link 
                         href={`/tele-calling/assignments/${selectedAssignment.id}`}
                         className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors"
                       >
                         📝 Log Call
                       </Link>
                     </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        {user.role === 'manager' && (
          <div>
            <label className="block text-sm font-medium mb-1">Telecaller</label>
            <select 
              className="w-full border rounded px-2 py-1" 
              value={filterTelecaller} 
              onChange={e => setFilterTelecaller(e.target.value)}
            >
              <option value="">All</option>
              {telecallers.map(tc => (
                <option key={tc.id} value={tc.id}>
                  {tc.first_name} {tc.last_name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select 
            className="w-full border rounded px-2 py-1" 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="follow_up">Follow-up Needed</option>
            <option value="unreachable">Unreachable</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Search</label>
          <input 
            className="w-full border rounded px-2 py-1" 
            placeholder="Search by telecaller, client, or notes" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500 text-center py-12">Loading...</div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">{error}</div>
      ) : filteredAssignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-5xl mb-4">📞</div>
          <div className="text-lg font-semibold mb-2">No assignments found</div>
          <div className="text-gray-500">Try adjusting your filters or search.</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead>
              <tr>
                {user.role === 'manager' && (
                  <th className="px-4 py-2 text-left">Telecaller</th>
                )}
                <th className="px-4 py-2 text-left">Client</th>
                <th className="px-4 py-2 text-left">Contact</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Priority</th>
                <th className="px-4 py-2 text-left">Scheduled Time</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((assignment) => (
                <tr key={assignment.id} className="border-t hover:bg-gray-50">
                  {user.role === 'manager' && (
                    <td className="px-4 py-2">
                      {assignment.telecaller_details ? 
                        `${assignment.telecaller_details.first_name} ${assignment.telecaller_details.last_name}` : 
                        assignment.telecaller
                      }
                    </td>
                  )}
                                     <td className="px-4 py-2">
                     <button
                       onClick={() => {
                         setSelectedAssignment(assignment);
                         setShowClientModal(true);
                       }}
                       className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-1"
                     >
                       {assignment.customer_visit_details ? 
                         assignment.customer_visit_details.customer_name : 
                         'Unknown'
                       }
                       <span className="text-xs opacity-60">👁️</span>
                     </button>
                   </td>
                  <td className="px-4 py-2 text-sm">
                    {assignment.customer_visit_details && (
                      <div>
                        <div>{assignment.customer_visit_details.customer_phone}</div>
                        {assignment.customer_visit_details.customer_email && (
                          <div className="text-gray-500">{assignment.customer_visit_details.customer_email}</div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      assignment.status === 'completed' ? 'bg-green-100 text-green-700' : 
                      assignment.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 
                      assignment.status === 'follow_up' ? 'bg-yellow-100 text-yellow-700' :
                      assignment.status === 'unreachable' ? 'bg-red-100 text-red-700' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {assignment.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      assignment.priority === 'high' ? 'bg-red-100 text-red-700' :
                      assignment.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {assignment.priority}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {assignment.scheduled_time ? new Date(assignment.scheduled_time).toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setShowClientModal(true);
                        }}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Details
                      </button>
                      <Link 
                        href={`/tele-calling/assignments/${assignment.id}`} 
                        className="text-green-600 hover:underline text-sm"
                      >
                        Log Call
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 