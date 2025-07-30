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
  assigned_to_telecaller: boolean;
  created_at: string;
}

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  customer_type: string;
  city: string;
  created_at: string;
  tags: { name: string; slug: string }[];
}

export default function CustomerVisitsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [visits, setVisits] = useState<CustomerVisit[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingVisits, setLoadingVisits] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    interests: [] as string[],
    notes: "",
    lead_quality: "warm"
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  const interestOptions = [
    "Diamond Rings", "Gold Jewelry", "Silver Jewelry", "Platinum", 
    "Pearls", "Gemstones", "Wedding Bands", "Engagement Rings",
    "Necklaces", "Earrings", "Bracelets", "Watches"
  ];

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role !== 'inhouse_sales') {
        router.replace('/inhouse-sales/dashboard');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetchVisits();
    fetchCustomers();
  }, []);

  const fetchVisits = async () => {
    setLoadingVisits(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get("http://localhost:8000/api/telecalling/customer-visits/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVisits(res.data.results || res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch customer visits");
    } finally {
      setLoadingVisits(false);
    }
  };

  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const token = localStorage.getItem("access_token");
      console.log("Fetching customers with token:", token ? "Token exists" : "No token");
      
      const res = await axios.get("http://localhost:8000/api/clients/clients/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Customers API response:", res.data);
      setCustomers(res.data.results || res.data);
    } catch (err: any) {
      console.error("Failed to fetch customers:", err);
      console.error("Error details:", err.response?.data);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    
    try {
      const token = localStorage.getItem("access_token");
      
      // Ensure interests is always an array and clean up data
      const visitData = {
        customer_name: formData.customer_name.trim(),
        customer_phone: formData.customer_phone.trim(),
        customer_email: formData.customer_email.trim() || null, // Send null if empty
        interests: Array.isArray(formData.interests) ? formData.interests : [],
        notes: formData.notes.trim(),
        lead_quality: formData.lead_quality
      };
      
      console.log("Creating visit with data:", visitData);
      
      const response = await axios.post("http://localhost:8000/api/telecalling/customer-visits/", visitData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Visit created successfully:", response.data);
      
      // Reset form
      setFormData({
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        interests: [],
        notes: "",
        lead_quality: "warm"
      });
      setSelectedCustomerId(null);
      setShowCreateModal(false);
      
      // Refresh visits
      fetchVisits();
    } catch (err: any) {
      console.error("Error creating visit:", err);
      console.error("Error response:", err.response?.data);
      
      // Handle validation errors
      if (err.response?.status === 400) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          // Format validation errors
          const errorMessages = [];
          for (const [field, errors] of Object.entries(errorData)) {
            if (Array.isArray(errors)) {
              errorMessages.push(`${field}: ${errors.join(', ')}`);
            } else {
              errorMessages.push(`${field}: ${errors}`);
            }
          }
          setFormError(errorMessages.join('; '));
        } else {
          setFormError(errorData || "Validation error occurred");
        }
      } else {
        setFormError(err.response?.data?.detail || err.response?.data?.message || "Failed to create customer visit");
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleInterestChange = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleCustomerSelection = (customerId: number | null) => {
    setSelectedCustomerId(customerId);
    if (customerId) {
      const selectedCustomer = customers.find(c => c.id === customerId);
      if (selectedCustomer) {
        setFormData(prev => ({
          ...prev,
          customer_name: `${selectedCustomer.first_name} ${selectedCustomer.last_name}`.trim(),
          customer_phone: selectedCustomer.phone,
          customer_email: selectedCustomer.email || ""
        }));
      }
    } else {
      // Clear form when "Select Customer" is chosen
      setFormData(prev => ({
        ...prev,
        customer_name: "",
        customer_phone: "",
        customer_email: ""
      }));
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  if (!user || user.role !== 'inhouse_sales') {
    return null;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer Visit Records</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Record New Visit
        </button>
      </div>

      {/* Create Visit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Record Customer Visit</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreateVisit} className="space-y-4">
              {formError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                  {formError}
                </div>
              )}
              
              {/* Customer Selection Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-1">Select Existing Customer (Optional)</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={selectedCustomerId || ""}
                  onChange={(e) => handleCustomerSelection(parseInt(e.target.value) || null)}
                  disabled={loadingCustomers}
                >
                  <option value="">
                    {loadingCustomers ? "Loading customers..." : "Select Customer"}
                  </option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {`${customer.first_name} ${customer.last_name}`.trim()} - {customer.phone}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select a customer to auto-fill their details, or leave empty to enter new customer information
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full border rounded px-3 py-2"
                    value={formData.customer_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    className="w-full border rounded px-3 py-2"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border rounded px-3 py-2"
                  value={formData.customer_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Lead Quality</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={formData.lead_quality}
                  onChange={(e) => setFormData(prev => ({ ...prev, lead_quality: e.target.value }))}
                >
                  <option value="hot">Hot Lead</option>
                  <option value="warm">Warm Lead</option>
                  <option value="cold">Cold Lead</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Product Interests</label>
                <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                  {interestOptions.map(interest => (
                    <label key={interest} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.interests.includes(interest)}
                        onChange={() => handleInterestChange(interest)}
                        className="rounded"
                      />
                      <span className="text-sm">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Visit Notes</label>
                <textarea
                  rows={4}
                  className="w-full border rounded px-3 py-2"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Describe the customer's interests, questions, and any important details..."
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {formLoading ? "Recording..." : "Record Visit"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loadingVisits ? (
        <div className="text-gray-500 text-center py-12">Loading customer visits...</div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
          {error}
        </div>
      ) : visits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-5xl mb-4">📝</div>
          <div className="text-lg font-semibold mb-2">No customer visits recorded yet</div>
          <div className="text-gray-500">Start by recording your first customer visit.</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Contact</th>
                <th className="px-4 py-2 text-left">Interests</th>
                <th className="px-4 py-2 text-left">Lead Quality</th>
                <th className="px-4 py-2 text-left">Visit Time</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit) => (
                <tr key={visit.id} className="border-t">
                  <td className="px-4 py-2 font-medium">{visit.customer_name}</td>
                  <td className="px-4 py-2">
                    <div>{visit.customer_phone}</div>
                    {visit.customer_email && (
                      <div className="text-sm text-gray-500">{visit.customer_email}</div>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {visit.interests.slice(0, 3).map(interest => (
                        <span key={interest} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                          {interest}
                        </span>
                      ))}
                      {visit.interests.length > 3 && (
                        <span className="text-gray-500 text-xs">+{visit.interests.length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      visit.lead_quality === 'hot' ? 'bg-red-100 text-red-700' :
                      visit.lead_quality === 'warm' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {visit.lead_quality}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {new Date(visit.visit_timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      visit.assigned_to_telecaller ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {visit.assigned_to_telecaller ? 'Assigned' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <Link 
                      href={`/inhouse-sales/customer-visits/${visit.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Details
                    </Link>
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