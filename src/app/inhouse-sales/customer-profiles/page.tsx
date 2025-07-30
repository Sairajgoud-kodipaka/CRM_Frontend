"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { customersAPI } from "@/lib/api";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';

interface CustomerProfile {
  id: number;
  customer_visit: {
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
  };
  original_notes: string;
  telecaller_feedback: string;
  engagement_score: number;
  conversion_likelihood: string;
  last_contact_date: string | null;
  next_follow_up_date: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default function CustomerProfilesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profiles, setProfiles] = useState<CustomerProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [error, setError] = useState("");
  const [filterLikelihood, setFilterLikelihood] = useState("");
  const [filterEngagement, setFilterEngagement] = useState("");
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [sortModel, setSortModel] = useState<any>([
    { field: 'last_interaction', sort: 'desc' },
  ]);

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
    const fetchProfiles = async () => {
      setLoadingProfiles(true);
      setError("");
      try {
        const res = await (searchTerm ? customersAPI.searchCustomers({ search: searchTerm }) : customersAPI.getCustomers());
        setProfiles(res.results || res);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to fetch customer profiles");
      } finally {
        setLoadingProfiles(false);
      }
    };
    const delayDebounceFn = setTimeout(() => {
      fetchProfiles();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const getLikelihoodColor = (likelihood: string) => {
    switch (likelihood) {
      case 'very_high': return 'bg-green-100 text-green-700';
      case 'high': return 'bg-blue-100 text-blue-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-orange-100 text-orange-700';
      case 'very_low': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-blue-100 text-blue-700';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getEngagementLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  // Filter profiles
  const filteredProfiles = profiles.filter(profile => {
    const matchesLikelihood = !filterLikelihood || profile.conversion_likelihood === filterLikelihood;
    const matchesEngagement = !filterEngagement || 
      (filterEngagement === 'high' && profile.engagement_score >= 60) ||
      (filterEngagement === 'medium' && profile.engagement_score >= 40 && profile.engagement_score < 60) ||
      (filterEngagement === 'low' && profile.engagement_score < 40);
    
    const searchLower = search.toLowerCase();
    const matchesSearch = !search || 
      profile.customer_visit.customer_name.toLowerCase().includes(searchLower) ||
      profile.customer_visit.customer_phone.includes(search) ||
      (profile.customer_visit.customer_email && profile.customer_visit.customer_email.toLowerCase().includes(searchLower)) ||
      profile.telecaller_feedback.toLowerCase().includes(searchLower);
    
    return matchesLikelihood && matchesEngagement && matchesSearch;
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  if (!user || user.role !== 'inhouse_sales') {
    return null;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Enhanced Customer Profiles</h1>
        <button 
          onClick={() => router.push('/inhouse-sales/dashboard')}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Conversion Likelihood</label>
          <select 
            className="border rounded px-3 py-2"
            value={filterLikelihood}
            onChange={(e) => setFilterLikelihood(e.target.value)}
          >
            <option value="">All</option>
            <option value="very_high">Very High</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="very_low">Very Low</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Engagement Level</label>
          <select 
            className="border rounded px-3 py-2"
            value={filterEngagement}
            onChange={(e) => setFilterEngagement(e.target.value)}
          >
            <option value="">All</option>
            <option value="high">High (60+)</option>
            <option value="medium">Medium (40-59)</option>
            <option value="low">Low (&lt;40)</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Search</label>
          <input 
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="Search by name, phone, email, or feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loadingProfiles ? (
        <div className="text-gray-500 text-center py-12">Loading customer profiles...</div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
          {error}
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-5xl mb-4">👥</div>
          <div className="text-lg font-semibold mb-2">No customer profiles found</div>
          <div className="text-gray-500">Try adjusting your filters or search criteria.</div>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredProfiles.map((profile) => (
            <div key={profile.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{profile.customer_visit.customer_name}</h2>
                  <p className="text-gray-600">{profile.customer_visit.customer_phone}</p>
                  {profile.customer_visit.customer_email && (
                    <p className="text-gray-600">{profile.customer_visit.customer_email}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex gap-2 mb-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getLikelihoodColor(profile.conversion_likelihood)}`}>
                      {profile.conversion_likelihood.replace('_', ' ')}
                    </span>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getEngagementColor(profile.engagement_score)}`}>
                      {getEngagementLabel(profile.engagement_score)} ({profile.engagement_score})
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date(profile.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                {/* Original Sales Rep Notes */}
                <div>
                  <h3 className="font-semibold mb-2 text-blue-600">Original Visit Notes</h3>
                  <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Visit Date:</strong> {new Date(profile.customer_visit.visit_timestamp).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Lead Quality:</strong> 
                      <span className={`ml-1 inline-block px-2 py-1 rounded text-xs font-semibold ${
                        profile.customer_visit.lead_quality === 'hot' ? 'bg-red-100 text-red-700' :
                        profile.customer_visit.lead_quality === 'warm' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {profile.customer_visit.lead_quality}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Interests:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {profile.customer_visit.interests.map(interest => (
                          <span key={interest} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">
                      {profile.original_notes || "No notes recorded during visit"}
                    </div>
                  </div>
                </div>

                {/* Telecaller Feedback */}
                <div>
                  <h3 className="font-semibold mb-2 text-green-600">Telecaller Feedback</h3>
                  <div className="bg-green-50 p-4 rounded border-l-4 border-green-500">
                    {profile.telecaller_feedback ? (
                      <div className="text-sm text-gray-700">{profile.telecaller_feedback}</div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">No telecaller feedback yet</div>
                    )}
                    {profile.last_contact_date && (
                      <div className="text-sm text-gray-600 mt-2">
                        <strong>Last Contact:</strong> {new Date(profile.last_contact_date).toLocaleString()}
                      </div>
                    )}
                    {profile.next_follow_up_date && (
                      <div className="text-sm text-gray-600">
                        <strong>Next Follow-up:</strong> {new Date(profile.next_follow_up_date).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              {profile.tags && profile.tags.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Customer Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.tags.map((tag, index) => (
                      <span key={index} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <button 
                  onClick={() => router.push(`/inhouse-sales/customer-visits/${profile.customer_visit.id}`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  View Original Visit
                </button>
                {profile.conversion_likelihood === 'very_high' || profile.conversion_likelihood === 'high' ? (
                  <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    High Priority - Re-engage
                  </button>
                ) : (
                  <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
                    Schedule Follow-up
                  </button>
                )}
                <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                  Add Notes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 