'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { customersAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function InhouseSalesAddCustomer() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    customer_type: 'individual',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    date_of_birth: '',
    anniversary_date: '',
    notes: '',
    // Additional jewelry-specific fields
    preferred_metal: '',
    preferred_stone: '',
    ring_size: '',
    budget_range: '',
    assigned_to: '',
    // New fields for Demographics & Visit
    community: '',
    leadSource: '',
    reasonForVisit: '',
    ageOfEndUser: '',
    nextFollowUp: '',
    summaryNotes: '',
  });

  // Customer Interests state
  const [interests, setInterests] = useState([
    {
      mainCategory: '',
      preferences: {
        designSelected: false,
        wantsDiscount: false,
        checkingOthers: false,
        lessVariety: false,
      },
      other: '',
    },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Customer Interests handlers
  const handleInterestChange = (idx: number, field: string, value: string) => {
    setInterests((prev) =>
      prev.map((item, i) =>
        i === idx
          ? { ...item, [field]: value }
          : item
      )
    );
  };
  const handleAddInterest = () => {
    setInterests((prev) => [
      ...prev,
      {
        mainCategory: '',
        preferences: {
          designSelected: false,
          wantsDiscount: false,
          checkingOthers: false,
          lessVariety: false,
        },
        other: '',
      },
    ]);
  };
  const handleRemoveInterest = (idx: number) => {
    setInterests((prev) => prev.filter((_, i) => i !== idx));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Customer name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== CUSTOMER FORM SUBMISSION START ===');
    console.log('Form validation result:', validateForm());
    
    if (validateForm()) {
      setLoading(true);
      try {
        // Prepare data with interests
        const customerData = {
          ...formData,
          customer_interests: interests
        };
        
        // Clean the data - remove empty strings and convert to null
        const cleanedData = Object.fromEntries(
          Object.entries(customerData).map(([key, value]) => [
            key, 
            value === '' ? null : value
          ])
        );
        
        console.log('Cleaned data:', cleanedData);
        
        console.log('=== FRONTEND DATA BEING SENT ===');
        console.log('Form Data:', formData);
        console.log('Interests:', interests);
        console.log('Combined Customer Data:', customerData);
        console.log('API Endpoint: /api/clients/clients/');
        console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'https://jewelry-crm-backend.onrender.com/api');
        
        // Check authentication
        const token = localStorage.getItem('access_token');
        console.log('Auth token exists:', !!token);
        if (token) {
          console.log('Token preview:', token.substring(0, 50) + '...');
        }
        
        // Test if Django server is running
        try {
          const testResponse = await fetch('https://jewelry-crm-backend.onrender.com/api/');
          console.log('Django server test response:', testResponse.status);
        } catch (testError) {
          console.error('Django server test failed:', testError);
        }
        
        // Test the clients endpoint
        try {
          const testClientResponse = await fetch('https://jewelry-crm-backend.onrender.com/api/clients/clients/test/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({test: 'data'})
          });
          const testData = await testClientResponse.json();
          console.log('Test client endpoint response:', testData);
        } catch (testError) {
          console.error('Test client endpoint failed:', testError);
        }
        
        const response = await customersAPI.createCustomer(cleanedData);
        console.log('=== API RESPONSE SUCCESS ===');
        console.log('Response:', response);
        
        toast.success('Customer added successfully!');
        router.push('/inhouse-sales/customers');
      } catch (error: any) {
        console.log('=== API ERROR DETAILS ===');
        console.error('Error object:', error);
        console.error('Error response:', error.response);
        console.error('Error response data:', error.response?.data);
        console.error('Error response status:', error.response?.status);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.message || 
                           error.message || 
                           'Failed to add customer. Please try again.';
        toast.error(errorMessage);
      } finally {
        setLoading(false);
        console.log('=== CUSTOMER FORM SUBMISSION END ===');
      }
    } else {
      console.log('Form validation failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Customer</h1>
              <p className="mt-2 text-gray-600">Create a new customer profile for jewelry sales</p>
            </div>
            <Link
              href="/inhouse-sales/customers"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Back to Customers
            </Link>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter customer's full name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="customer@example.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Type
                  </label>
                  <select
                    name="customer_type"
                    value={formData.customer_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="individual">Individual</option>
                    <option value="business">Business</option>
                    <option value="wholesale">Wholesale</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Address Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="New York"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="NY"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="United States"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anniversary Date
                  </label>
                  <input
                    type="date"
                    name="anniversary_date"
                    value={formData.anniversary_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Jewelry Preferences */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Jewelry Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Metal
                  </label>
                  <select
                    name="preferred_metal"
                    value={formData.preferred_metal}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select metal preference</option>
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                    <option value="platinum">Platinum</option>
                    <option value="palladium">Palladium</option>
                    <option value="rose_gold">Rose Gold</option>
                    <option value="white_gold">White Gold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Stone
                  </label>
                  <select
                    name="preferred_stone"
                    value={formData.preferred_stone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select stone preference</option>
                    <option value="diamond">Diamond</option>
                    <option value="ruby">Ruby</option>
                    <option value="emerald">Emerald</option>
                    <option value="sapphire">Sapphire</option>
                    <option value="pearl">Pearl</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ring Size
                  </label>
                  <select
                    name="ring_size"
                    value={formData.ring_size}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select ring size</option>
                    <option value="3">3</option>
                    <option value="3.5">3.5</option>
                    <option value="4">4</option>
                    <option value="4.5">4.5</option>
                    <option value="5">5</option>
                    <option value="5.5">5.5</option>
                    <option value="6">6</option>
                    <option value="6.5">6.5</option>
                    <option value="7">7</option>
                    <option value="7.5">7.5</option>
                    <option value="8">8</option>
                    <option value="8.5">8.5</option>
                    <option value="9">9</option>
                    <option value="9.5">9.5</option>
                    <option value="10">10</option>
                    <option value="10.5">10.5</option>
                    <option value="11">11</option>
                    <option value="11.5">11.5</option>
                    <option value="12">12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range
                  </label>
                  <select
                    name="budget_range"
                    value={formData.budget_range}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select budget range</option>
                    <option value="under_1000">Under $1,000</option>
                    <option value="1000_5000">$1,000 - $5,000</option>
                    <option value="5000_10000">$5,000 - $10,000</option>
                    <option value="10000_25000">$10,000 - $25,000</option>
                    <option value="25000_50000">$25,000 - $50,000</option>
                    <option value="over_50000">Over $50,000</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lead Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Lead Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Source
                  </label>
                  <select
                    name="leadSource"
                    value={formData.leadSource}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Source</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Google">Google</option>
                    <option value="Referral">Referral</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.leadSource && <p className="mt-1 text-sm text-red-600">{errors.leadSource}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned To
                  </label>
                  <select
                    name="assigned_to"
                    value={formData.assigned_to}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select salesperson</option>
                    <option value="current_user">Assign to me</option>
                    <option value="team_lead">Team Lead</option>
                    <option value="senior_sales">Senior Sales</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Notes</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any additional notes about the customer, preferences, or special requirements..."
                />
              </div>
            </div>

            {/* Demographics & Visit */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Demographics & Visit</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Community
                  </label>
                  <select
                    name="community"
                    value={formData.community}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Community</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Jain">Jain</option>
                    <option value="Parsi">Parsi</option>
                    <option value="Buddhist">Buddhist</option>
                    <option value="Cross Community">Cross Community</option>
                  </select>
                  {errors.community && <p className="mt-1 text-sm text-red-600">{errors.community}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Visit
                  </label>
                  <select
                    name="reasonForVisit"
                    value={formData.reasonForVisit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Reason</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Gifting">Gifting</option>
                    <option value="Self-purchase">Self-purchase</option>
                    <option value="Repair">Repair</option>
                    <option value="Browse">Browse</option>
                  </select>
                  {errors.reasonForVisit && <p className="mt-1 text-sm text-red-600">{errors.reasonForVisit}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age of End-User
                  </label>
                  <select
                    name="ageOfEndUser"
                    value={formData.ageOfEndUser}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Age Group</option>
                    <option value="Under 18">Under 18</option>
                    <option value="18-25">18-25</option>
                    <option value="26-35">26-35</option>
                    <option value="36-45">36-45</option>
                    <option value="46-55">46-55</option>
                    <option value="56-65">56-65</option>
                    <option value="65+">65+</option>
                    <option value="All/Family">All/Family</option>
                  </select>
                  {errors.ageOfEndUser && <p className="mt-1 text-sm text-red-600">{errors.ageOfEndUser}</p>}
                </div>
              </div>
            </div>

            {/* Follow-up & Summary */}
            <div className="border rounded-lg p-6 bg-white mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Follow-up & Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Next Follow-up Date</label>
                  <input
                    type="date"
                    name="nextFollowUp"
                    value={formData.nextFollowUp || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {errors.nextFollowUp && <p className="mt-1 text-sm text-red-600">{errors.nextFollowUp}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Summary Notes of Visit</label>
                  <textarea
                    name="summaryNotes"
                    value={formData.summaryNotes || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Key discussion points, items shown, next steps..."
                  />
                  {errors.summaryNotes && <p className="mt-1 text-sm text-red-600">{errors.summaryNotes}</p>}
                </div>
              </div>
            </div>

            {/* Customer Interests */}
            <div className="border rounded-lg p-6 bg-white mt-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-gray-900">Customer Interests</h2>
                <button type="button" onClick={handleAddInterest} className="flex items-center gap-1 px-3 py-1 border border-blue-200 rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition">
                  <span className="text-lg">+</span> Add Interest
                </button>
              </div>
              <hr className="mb-4" />
              {interests.map((item, idx) => (
                <div key={idx} className="border rounded-lg p-4 mb-4 bg-blue-50/30">
                  <div className="font-medium text-gray-700 mb-2">Interest Item #{idx + 1}</div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Main Category *</label>
                    <select
                      id="mainCategory"
                      name="mainCategory"
                      value={item.mainCategory}
                      onChange={e => handleInterestChange(idx, 'mainCategory', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Category</option>
                      <option value="Diamond">Diamond</option>
                      <option value="Gold">Gold</option>
                      <option value="Polki">Polki</option>
                    </select>
                  </div>
                  <div className="border rounded-md p-4 bg-white">
                    <div className="font-semibold text-gray-800 mb-2">Customer Preference</div>
                    <hr className="mb-2" />
                    <div className="space-y-2 mb-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="designSelected"
                          checked={item.preferences.designSelected}
                          onChange={e => handleInterestChange(idx, 'preferences.designSelected', e.target.checked ? 'true' : 'false')}
                          className="accent-blue-600"
                        />
                        Design Selected?
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="wantsDiscount"
                          checked={item.preferences.wantsDiscount}
                          onChange={e => handleInterestChange(idx, 'preferences.wantsDiscount', e.target.checked ? 'true' : 'false')}
                          className="accent-blue-600"
                        />
                        Wants More Discount
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="checkingOthers"
                          checked={item.preferences.checkingOthers}
                          onChange={e => handleInterestChange(idx, 'preferences.checkingOthers', e.target.checked ? 'true' : 'false')}
                          className="accent-blue-600"
                        />
                        Checking Other Jewellers
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="lessVariety"
                          checked={item.preferences.lessVariety}
                          onChange={e => handleInterestChange(idx, 'preferences.lessVariety', e.target.checked ? 'true' : 'false')}
                          className="accent-blue-600"
                        />
                        Felt Less Variety
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Other Preferences (if any)</label>
                      <input
                        type="text"
                        name="other"
                        value={item.other}
                        onChange={e => handleInterestChange(idx, 'other', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Specific customization request"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/inhouse-sales/customers"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding Customer & Visit Log...
                  </div>
                ) : (
                  'Add Customer & Visit Log'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
