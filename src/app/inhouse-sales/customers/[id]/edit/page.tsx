'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { customersAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  customer_type: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  date_of_birth: string;
  anniversary_date: string;
  notes: string;
  preferred_metal: string;
  preferred_stone: string;
  ring_size: string;
  budget_range: string;
  community: string;
  lead_source: string;
  reason_for_visit: string;
  age_of_end_user: string;
  next_follow_up: string;
  summary_notes: string;
  customer_interests: any[];
}

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({});
  const [interests, setInterests] = useState<any[]>([]);
  // Add products state and fetch logic (reuse from add-customer page)
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  useEffect(() => {
    setCategoriesLoading(true);
    const token = localStorage.getItem('access_token');
    fetch('http://localhost:8000/api/products/categories/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : (data.results || [])))
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
    setProductsLoading(true);
    fetch('http://localhost:8000/api/products/list/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : (data.results || []);
        setProducts(arr.map((prod: any) => ({
          id: prod.id,
          name: prod.name,
          category: typeof prod.category === 'object' && prod.category !== null ? prod.category.id : prod.category
        })));
      })
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));
  }, []);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const data = await customersAPI.getCustomer(parseInt(customerId));
        setFormData(data);
        setInterests(data.customer_interests || []);
      } catch (err: any) {
        console.error('Error fetching customer:', err);
        setError(err.message || 'Failed to fetch customer');
        toast.error('Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInterestChange = (idx: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setInterests((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
          return {
            ...item,
            preferences: {
              ...item.preferences,
              [name]: e.target.checked,
            },
          };
        } else {
          return {
            ...item,
            [name]: value,
          };
        }
      })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const customerData = {
        ...formData,
        customer_interests: interests
      };
      
      await customersAPI.updateCustomer(parseInt(customerId), customerData);
      toast.success('Customer updated successfully!');
      router.push(`/inhouse-sales/customers/${customerId}`);
    } catch (err: any) {
      console.error('Error updating customer:', err);
      toast.error('Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
        <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center justify-center min-h-[300px]">
          <div className="text-blue-400 text-lg font-semibold">Loading customer details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
        <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center justify-center min-h-[300px]">
          <div className="text-red-400 text-lg font-semibold mb-4">{error}</div>
          <Link href="/inhouse-sales/customers">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold">
              Back to Customers
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900 mb-2">Edit Customer</h1>
          <p className="text-gray-600">Update customer information</p>
        </div>
        <Link href={`/inhouse-sales/customers/${customerId}`}>
          <button className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition font-semibold">
            Cancel
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Type</label>
                  <select
                    name="customer_type"
                    value={formData.customer_type || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="individual">Individual</option>
                    <option value="business">Business</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Jewelry Preferences */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Jewelry Preferences</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Metal</label>
                  <select
                    name="preferred_metal"
                    value={formData.preferred_metal || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Metal</option>
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                    <option value="platinum">Platinum</option>
                    <option value="diamond">Diamond</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Stone</label>
                  <select
                    name="preferred_stone"
                    value={formData.preferred_stone || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Stone</option>
                    <option value="diamond">Diamond</option>
                    <option value="ruby">Ruby</option>
                    <option value="emerald">Emerald</option>
                    <option value="sapphire">Sapphire</option>
                    <option value="pearl">Pearl</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ring Size</label>
                  <input
                    type="text"
                    name="ring_size"
                    value={formData.ring_size || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                  <select
                    name="budget_range"
                    value={formData.budget_range || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Budget</option>
                    <option value="1000_5000">₹1,000 - ₹5,000</option>
                    <option value="5000_10000">₹5,000 - ₹10,000</option>
                    <option value="10000_25000">₹10,000 - ₹25,000</option>
                    <option value="25000_50000">₹25,000 - ₹50,000</option>
                    <option value="50000_100000">₹50,000 - ₹1,00,000</option>
                    <option value="100000_plus">₹1,00,000+</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Demographics & Visit */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Demographics & Visit</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Community</label>
                  <select
                    name="community"
                    value={formData.community || ''}
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
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lead Source</label>
                  <select
                    name="lead_source"
                    value={formData.lead_source || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Lead Source</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Google">Google</option>
                    <option value="Referral">Referral</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit</label>
                  <select
                    name="reason_for_visit"
                    value={formData.reason_for_visit || ''}
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
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age of End User</label>
                  <select
                    name="age_of_end_user"
                    value={formData.age_of_end_user || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Age</option>
                    <option value="18-25">18-25</option>
                    <option value="26-35">26-35</option>
                    <option value="36-45">36-45</option>
                    <option value="46-55">46-55</option>
                    <option value="55+">55+</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Notes and Follow-up */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes & Follow-up</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Next Follow-up Date</label>
                <input
                  type="date"
                  name="next_follow_up"
                  value={formData.next_follow_up || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Customer Interests */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Customer Interests</h2>
              <button
                type="button"
                onClick={handleAddInterest}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                + Add Interest
              </button>
            </div>
            
            {interests.map((interest, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-900">Interest #{index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Main Category</label>
                    <select
                      name="mainCategory"
                      value={interest.mainCategory || ''}
                      onChange={(e) => handleInterestChange(index, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Category</option>
                      <option value="Diamond">Diamond</option>
                      <option value="Gold">Gold</option>
                      <option value="Polki">Polki</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferences</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="designSelected"
                          checked={interest.preferences?.designSelected || false}
                          onChange={(e) => handleInterestChange(index, e)}
                          className="mr-2"
                        />
                        Design Selected
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="wantsDiscount"
                          checked={interest.preferences?.wantsDiscount || false}
                          onChange={(e) => handleInterestChange(index, e)}
                          className="mr-2"
                        />
                        Wants More Discount
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="checkingOthers"
                          checked={interest.preferences?.checkingOthers || false}
                          onChange={(e) => handleInterestChange(index, e)}
                          className="mr-2"
                        />
                        Checking Other Jewellers
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="lessVariety"
                          checked={interest.preferences?.lessVariety || false}
                          onChange={(e) => handleInterestChange(index, e)}
                          className="mr-2"
                        />
                        Felt Less Variety
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Other Preferences</label>
                  <input
                    type="text"
                    name="other"
                    value={interest.other || ''}
                    onChange={(e) => handleInterestChange(index, e)}
                    placeholder="e.g., Specific customization request"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {interest.mainCategory && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Products</label>
                    {(interest.products || []).map((prodEntry: any, prodIdx: number) => (
                      <div key={prodIdx} className="flex items-center gap-4 mb-2">
                        <select
                          value={prodEntry.product}
                          onChange={e => {
                            const value = e.target.value;
                            setInterests(prev =>
                              prev.map((it, i) =>
                                i === index
                                  ? {
                                      ...it,
                                      products: it.products.map((p: any, pi: number) =>
                                        pi === prodIdx ? { ...p, product: value } : p
                                      ),
                                    }
                                  : it
                              )
                            );
                          }}
                        >
                          <option value="">Select Product</option>
                          {products
                            .filter(prod => {
                              const cat = categories.find((c: any) => c.name === interest.mainCategory);
                              return cat && prod.category === cat.id;
                            })
                            .map(prod => (
                              <option key={prod.id} value={prod.name}>{prod.name}</option>
                            ))}
                        </select>
                        <input
                          type="number"
                          placeholder="Revenue Opportunity"
                          value={prodEntry.revenue}
                          onChange={e => {
                            const value = e.target.value;
                            setInterests(prev =>
                              prev.map((it, i) =>
                                i === index
                                  ? {
                                      ...it,
                                      products: it.products.map((p: any, pi: number) =>
                                        pi === prodIdx ? { ...p, revenue: value } : p
                                      ),
                                    }
                                  : it
                              )
                            );
                          }}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setInterests(prev =>
                          prev.map((it, i) =>
                            i === index
                              ? { ...it, products: [...(it.products || []), { product: '', revenue: '' }] }
                              : it
                          )
                        );
                      }}
                      className="text-orange-600 hover:underline"
                    >
                      + Add Product to this Interest
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`px-8 py-3 rounded-md font-semibold transition ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700'
              } text-white`}
            >
              {saving ? 'Saving...' : 'Update Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 