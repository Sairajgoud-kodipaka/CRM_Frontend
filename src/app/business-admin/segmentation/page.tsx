"use client";

import { useEffect, useState, useMemo, Fragment } from 'react';
import { customersAPI } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const ALL_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'demographic', label: 'Demographic' },
  { key: 'community', label: 'Community' },
  { key: 'status', label: 'Status' },
  { key: 'product', label: 'Product' },
  { key: 'intent', label: 'Intent' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'tags', label: 'Tags' },
  { key: 'expand', label: 'Expand' },
];

function filterAndSort(customers: any[], search: string, sortKey: string, filterTag: string) {
  let filtered = customers;
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter((c: any) =>
      c.name.toLowerCase().includes(s) ||
      c.email.toLowerCase().includes(s) ||
      c.city.toLowerCase().includes(s)
    );
  }
  if (filterTag && filterTag !== 'All') {
    filtered = filtered.filter((c: any) => c.tags && c.tags.some((t: any) => t.name === filterTag));
  }
  if (sortKey) {
    filtered = [...filtered].sort((a: any, b: any) => {
      if (sortKey === 'Name') return a.name.localeCompare(b.name);
      if (sortKey === 'Created') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortKey === 'City') return a.city.localeCompare(b.city);
      return 0;
    });
  }
  return filtered;
}

const ALL_TAGS = [
  { name: 'Hindu', slug: 'hindu' },
  { name: 'Muslim', slug: 'muslim' },
  { name: 'Jain', slug: 'jain' },
  { name: 'Parsi', slug: 'parsi' },
  { name: 'Buddhist', slug: 'buddhist' },
  { name: 'Cross Community', slug: 'cross-community' },
  { name: 'Anniversary This Week', slug: 'anniversary-week' },
  { name: 'Birthday This Week', slug: 'birthday-week' },
  { name: 'Browsing Prospect', slug: 'browsing-prospect' },
  { name: 'Cold Lead', slug: 'not-interested' },
  { name: 'Converted Customer', slug: 'converted-customer' },
  { name: 'Diamond Interested', slug: 'diamond-interested' },
  { name: 'Gen X (36–45)', slug: 'middle-age-shopper' },
  { name: 'Gifting', slug: 'gifting' },
  { name: 'Gold Interested', slug: 'gold-interested' },
  { name: 'Google Search', slug: 'google-lead' },
  { name: 'High-Spending Customer', slug: 'high-value' },
  { name: 'Medium-Spending Customer', slug: 'mid-value' },
  { name: 'Millennial (26–35)', slug: 'millennial-shopper' },
  { name: 'Mixed Buyer', slug: 'mixed-buyer' },
  { name: 'Needs Follow-up', slug: 'needs-follow-up' },
  { name: 'Needs Nurturing', slug: 'needs-nurturing' },
  { name: 'Polki Interested', slug: 'polki-interested' },
  { name: 'Referral', slug: 'referral' },
  { name: 'Repair Customer', slug: 'repair-customer' },
  { name: 'Self-purchase', slug: 'self-purchase' },
  { name: 'Senior (>46)', slug: 'senior-shopper' },
  { name: 'Unknown/Other', slug: 'other-source' },
  { name: 'Walk-in', slug: 'walk-in' },
  { name: 'Wedding Buyer', slug: 'wedding-buyer' },
  { name: 'Young (18–25)', slug: 'young-adult' },
];

export default function CustomerSegmentation() {
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('All');
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showColumns, setShowColumns] = useState<string[]>(ALL_COLUMNS.map(c => c.key));
  const [columnsModalOpen, setColumnsModalOpen] = useState(false);
  const pageSize = 10;
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [editTagsCustomer, setEditTagsCustomer] = useState<any | null>(null);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [savingTags, setSavingTags] = useState(false);
  const [sortKey, setSortKey] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [quickActionLoading, setQuickActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await customersAPI.getCustomers();
        const customers = data.results || data || [];
        setAllCustomers(customers);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch customers');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // --- Summary Tiles Logic ---
  const summary = useMemo(() => {
    let highSpending = 0, needsFollowUp = 0, birthdayThisWeek = 0, newLeads = 0;
    allCustomers.forEach((c: any) => {
      if (c.tags?.some((t: any) => t.slug === 'high-value')) highSpending++;
      if (c.tags?.some((t: any) => t.slug === 'needs-follow-up')) needsFollowUp++;
      if (c.tags?.some((t: any) => t.slug === 'birthday-week')) birthdayThisWeek++;
      if (c.tags?.some((t: any) => t.slug === 'not-interested')) newLeads++; // Example: adjust as needed
    });
    return { highSpending, needsFollowUp, birthdayThisWeek, newLeads };
  }, [allCustomers]);

  // --- All unique tags for filter dropdown and sidebar ---
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    allCustomers.forEach(c => c.tags?.forEach((t: any) => tagSet.add(t.name)));
    return Array.from(tagSet).sort();
  }, [allCustomers]);

  // --- Filtering/Search Logic ---
  const filtered = useMemo(() => {
    let filtered = allCustomers;
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((c: any) =>
        c.name?.toLowerCase().includes(s) ||
        c.email?.toLowerCase().includes(s) ||
        c.city?.toLowerCase().includes(s) ||
        c.tags?.some((t: any) => t.name.toLowerCase().includes(s))
      );
    }
    if (selectedTags.length > 0) {
      filtered = filtered.filter((c: any) =>
        selectedTags.every(tag => c.tags?.some((t: any) => t.name === tag))
      );
    } else if (filterTag !== 'All') {
      filtered = filtered.filter((c: any) => c.tags?.some((t: any) => t.name === filterTag));
    }
    if (sortKey) {
      filtered = [...filtered].sort((a: any, b: any) => {
        if (sortKey === 'Name') return a.name.localeCompare(b.name);
        if (sortKey === 'Created') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortKey === 'City') return a.city.localeCompare(b.city);
        return 0;
      });
    }
    return filtered;
  }, [allCustomers, search, filterTag, selectedTags, sortKey]);

  // --- Pagination ---
  const totalPages = Math.ceil(filtered.length / pageSize);
  const pagedCustomers = filtered.slice((page-1)*pageSize, page*pageSize);

  // --- Tag Color Map ---
  const tagColor = (slug: string) => {
    if (slug.includes('diamond')) return 'bg-blue-100 text-blue-800';
    if (slug.includes('gold')) return 'bg-yellow-100 text-yellow-800';
    if (slug.includes('polki')) return 'bg-pink-100 text-pink-800';
    if (slug.includes('high-value')) return 'bg-green-100 text-green-800';
    if (slug.includes('needs-follow-up')) return 'bg-orange-100 text-orange-800';
    if (slug.includes('birthday')) return 'bg-purple-100 text-purple-800';
    if (slug.includes('referral')) return 'bg-teal-100 text-teal-800';
    return 'bg-gray-100 text-gray-800';
  };

  // --- Sidebar Handlers ---
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };
  const handleClearFilters = () => setSelectedTags([]);

  // --- Column Modal Handlers ---
  const handleColumnToggle = (key: string) => {
    setShowColumns(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Bulk select handlers
  const handleSelectRow = (id: number) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  };
  const handleSelectAll = () => {
    if (selectedRows.length === pagedCustomers.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(pagedCustomers.map((c: any) => c.id));
    }
  };
  // Export selected to CSV
  const handleExportSelected = () => {
    const selected = pagedCustomers.filter((c: any) => selectedRows.includes(c.id));
    if (selected.length === 0) return;
    const headers = ['Name', 'Email', 'Demographic', 'Community', 'Status', 'Product', 'Intent', 'Revenue', 'Tags'];
    const rows = selected.map((c: any) => [
      c.name,
      c.email,
      c.tags?.find((t: any) => t.category?.toLowerCase().includes('demographic'))?.name || '-',
      c.community || '-',
      c.tags?.find((t: any) => t.category?.toLowerCase().includes('crm status'))?.name || '-',
      c.tags?.find((t: any) => t.category?.toLowerCase().includes('product interest'))?.name || '-',
      c.tags?.find((t: any) => t.category?.toLowerCase().includes('purchase intent'))?.name || '-',
      c.tags?.find((t: any) => t.category?.toLowerCase().includes('revenue'))?.name || '-',
      c.tags?.map((t: any) => t.name).join('; ')
    ]);
    const csv = [headers, ...rows].map(r => r.map(x => '"' + (x || '') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'selected_customers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const openEditTags = (customer: any) => {
    setEditTagsCustomer(customer);
    setEditTags(customer.tags?.map((t: any) => t.slug) || []);
    // Close customer modal if it's open
    if (customerModalOpen) {
      setCustomerModalOpen(false);
    }
  };
  const closeEditTags = () => {
    setEditTagsCustomer(null);
    setEditTags([]);
    // Reopen customer modal if it was closed for tag editing
    if (selectedCustomer) {
      setCustomerModalOpen(true);
    }
  };
  const handleTagCheckbox = (slug: string) => {
    setEditTags(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  };
  const saveTags = async () => {
    if (!editTagsCustomer) return;
    setSavingTags(true);
    try {
      console.log('=== FRONTEND TAG UPDATE DEBUG ===');
      console.log('Customer ID:', editTagsCustomer.id);
      console.log('Selected tags:', editTags);
      
      // Try sending tags as 'tag_slugs' first (this is what the backend expects)
      let payload = { tag_slugs: editTags };
      console.log('Sending payload:', payload);
      
      let response;
      try {
        response = await customersAPI.updateCustomer(editTagsCustomer.id, payload);
        console.log('Tag update successful:', response);
      } catch (e: any) {
        console.error('First attempt failed:', e);
        // If that fails, try with 'tags' field
        payload = { tags: editTags } as any;
        console.log('Trying with tags field:', payload);
        response = await customersAPI.updateCustomer(editTagsCustomer.id, payload);
        console.log('Second attempt successful:', response);
      }
      
      // Refresh customer row (refetch all customers for simplicity)
      const data = await customersAPI.getCustomers();
      setAllCustomers(data.results || data || []);
      
      // Show success message
      alert('Tags updated successfully!');
      
      closeEditTags();
    } catch (e: any) {
      console.error('=== TAG UPDATE ERROR ===');
      console.error('Error object:', e);
      console.error('Error response:', e?.response);
      console.error('Error data:', e?.response?.data);
      console.error('Error status:', e?.response?.status);
      
      alert('Failed to update tags: ' + (e?.response?.data?.detail || e.message || 'Unknown error'));
      console.error('Tag update error:', e?.response?.data || e);
    } finally {
      setSavingTags(false);
    }
  };

  const openCustomerModal = (customer: any) => {
    setSelectedCustomer(customer);
    setCustomerModalOpen(true);
  };

  const closeCustomerModal = () => {
    setSelectedCustomer(null);
    setCustomerModalOpen(false);
  };

  // Quick Actions Functions
  const handleSendEmail = async (customer: any) => {
    setQuickActionLoading('email');
    try {
      // Create email link with customer info
      const subject = encodeURIComponent(`Follow-up for ${customer.name}`);
      const body = encodeURIComponent(`Hi ${customer.name},\n\nThank you for your interest in our jewelry collection.\n\nBest regards,\nYour Jewelry Team`);
      const mailtoLink = `mailto:${customer.email}?subject=${subject}&body=${body}`;
      window.open(mailtoLink, '_blank');
    } catch (error) {
      console.error('Error opening email:', error);
      alert('Failed to open email client');
    } finally {
      setQuickActionLoading(null);
    }
  };

  const handleMakeCall = async (customer: any) => {
    setQuickActionLoading('call');
    try {
      if (customer.phone) {
        const telLink = `tel:${customer.phone}`;
        window.open(telLink, '_blank');
      } else {
        alert('No phone number available for this customer');
      }
    } catch (error) {
      console.error('Error making call:', error);
      alert('Failed to initiate call');
    } finally {
      setQuickActionLoading(null);
    }
  };

  const handleScheduleMeeting = async (customer: any) => {
    setQuickActionLoading('meeting');
    try {
      // Create calendar event with customer info
      const eventTitle = encodeURIComponent(`Meeting with ${customer.name}`);
      const eventDetails = encodeURIComponent(`Customer: ${customer.name}\nEmail: ${customer.email}\nPhone: ${customer.phone || 'Not provided'}\n\nMeeting to discuss jewelry requirements.`);
      const calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDetails}`;
      window.open(calendarLink, '_blank');
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      alert('Failed to open calendar');
    } finally {
      setQuickActionLoading(null);
    }
  };

  const handleAddToPipeline = async (customer: any) => {
    setQuickActionLoading('pipeline');
    try {
      // Navigate to pipeline creation with customer pre-filled
      const pipelineData = {
        title: `Follow-up with ${customer.name}`,
        client_id: customer.id,
        expected_value: 0,
        expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        notes: `Customer from segmentation: ${customer.name}\nEmail: ${customer.email}\nPhone: ${customer.phone || 'Not provided'}\n\nTags: ${customer.tags?.map((t: any) => t.name).join(', ') || 'None'}`
      };
      
      // Store pipeline data in localStorage for the pipeline page to pick up
      localStorage.setItem('prefilledPipelineData', JSON.stringify(pipelineData));
      
      // Open pipeline page in new tab
      window.open('/business-admin/pipeline', '_blank');
      
      // Show success message
      alert('Customer added to pipeline! Opening pipeline page...');
    } catch (error) {
      console.error('Error adding to pipeline:', error);
      alert('Failed to add customer to pipeline');
    } finally {
      setQuickActionLoading(null);
    }
  };

  // Compute segment distribution for the chart
  const segmentData = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    filtered.forEach((c: any) => {
      c.tags?.forEach((t: any) => {
        tagCounts[t.name] = (tagCounts[t.name] || 0) + 1;
      });
    });
    return Object.entries(tagCounts).map(([name, count]) => ({ name, count }));
  }, [filtered]);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      {/* Main Content */}
      <div className="flex-1 space-y-8">
        {/* Summary Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-lg font-bold">High-Spending</div>
            <div className="text-2xl font-extrabold text-green-700">{summary.highSpending}</div>
      </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-lg font-bold">Needs Follow-up</div>
            <div className="text-2xl font-extrabold text-orange-700">{summary.needsFollowUp}</div>
        </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-lg font-bold">Birthday This Week</div>
            <div className="text-2xl font-extrabold text-purple-700">{summary.birthdayThisWeek}</div>
        </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-lg font-bold">New Leads</div>
            <div className="text-2xl font-extrabold text-blue-700">{summary.newLeads}</div>
        </div>
        </div>
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center mb-4">
          <input
            type="text"
            placeholder="Search by name, email, city, tag..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search customers"
          />
          <select
            value={filterTag}
            onChange={e => setFilterTag(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
            aria-label="Filter by tag"
          >
            <option value="All">All</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
          <button
            className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
            onClick={() => setColumnsModalOpen(true)}
            aria-label="Customize columns"
          >Columns ⚙️</button>
          <div className="relative group">
            <button className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700" onClick={e => e.preventDefault()} aria-label="Bulk actions">
              Bulk Actions ▼
            </button>
            <div className="absolute mt-1 left-0 bg-white border rounded shadow z-10 min-w-[160px] hidden group-hover:block group-focus-within:block">
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm" onClick={handleExportSelected} aria-label="Export selected customers to CSV">
                Export Selected (CSV)
              </button>
              {/* Add more actions here */}
            </div>
          </div>
          <button className="px-3 py-2 border border-blue-300 rounded-md bg-blue-50 text-blue-700" aria-label="Export all customers">Export</button>
        </div>
        {/* Columns Modal */}
        {columnsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30" role="dialog" aria-modal="true" aria-label="Customize Columns">
            <div className="bg-white rounded-lg shadow-lg p-6 w-80">
              <div className="font-bold mb-2">Customize Columns</div>
              <div className="space-y-2 mb-4">
                {ALL_COLUMNS.map(col => (
                  <label key={col.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showColumns.includes(col.key)}
                      onChange={() => handleColumnToggle(col.key)}
                      className="accent-blue-600"
                      aria-label={`Show ${col.label} column`}
                    />
                    <span>{col.label}</span>
                  </label>
                ))}
              </div>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md mr-2"
                onClick={() => setColumnsModalOpen(false)}
                aria-label="Close customize columns modal"
              >Done</button>
            </div>
          </div>
        )}
        {/* Main Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200" role="table" aria-label="Customer Segmentation Table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2">
                  <input type="checkbox" checked={selectedRows.length === pagedCustomers.length && pagedCustomers.length > 0} onChange={handleSelectAll} aria-label="Select all customers" />
                </th>
                {ALL_COLUMNS.map(col => showColumns.includes(col.key) && (
                  <th key={col.key} className="px-2 py-2">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagedCustomers.map((customer: any) => (
                <Fragment key={customer.id}>
                  <tr>
                    <td className="px-2 py-2">
                      <input type="checkbox" checked={selectedRows.includes(customer.id)} onChange={() => handleSelectRow(customer.id)} aria-label={`Select customer ${customer.name}`} />
                    </td>
                          {showColumns.includes('name') && (
        <td className="px-2 py-2 whitespace-nowrap">
          <button
            onClick={() => openCustomerModal(customer)}
            className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
            aria-label={`View details for ${customer.name}`}
          >
            {customer.name}
          </button>
        </td>
      )}
                    {showColumns.includes('email') && (
                      <td className="px-2 py-2 whitespace-nowrap">{customer.email}</td>
                    )}
                    {showColumns.includes('demographic') && (
                      <td className="px-2 py-2 whitespace-nowrap hidden md:table-cell">{customer.tags?.find((t: any) => t.category?.toLowerCase().includes('demographic'))?.name || '-'}</td>
                    )}
                    {showColumns.includes('community') && (
                      <td className="px-2 py-2 whitespace-nowrap">{customer.community || '-'}</td>
                    )}
                    {showColumns.includes('status') && (
                      <td className="px-2 py-2 whitespace-nowrap hidden md:table-cell">{customer.tags?.find((t: any) => t.category?.toLowerCase().includes('crm status'))?.name || '-'}</td>
                    )}
                    {showColumns.includes('product') && (
                      <td className="px-2 py-2 whitespace-nowrap hidden md:table-cell">{customer.tags?.find((t: any) => t.category?.toLowerCase().includes('product interest'))?.name || '-'}</td>
                    )}
                    {showColumns.includes('intent') && (
                      <td className="px-2 py-2 whitespace-nowrap hidden md:table-cell">{customer.tags?.find((t: any) => t.category?.toLowerCase().includes('purchase intent'))?.name || '-'}</td>
                    )}
                    {showColumns.includes('revenue') && (
                      <td className="px-2 py-2 whitespace-nowrap hidden md:table-cell">{customer.tags?.find((t: any) => t.category?.toLowerCase().includes('revenue'))?.name || '-'}</td>
                    )}
                    {showColumns.includes('tags') && (
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {customer.tags && customer.tags.length > 0 ? (
                            customer.tags.map((tag: any) => (
                              <span key={tag.slug} className={`inline-block ${tagColor(tag.slug)} text-xs px-2 py-1 rounded-full`}>
                                {tag.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">No tags</span>
                          )}
                        </div>
                      </td>
                    )}
                    {showColumns.includes('expand') && (
                      <td className="px-2 py-2 whitespace-nowrap">
                        <button
                          className="text-blue-600 font-bold text-lg focus:outline-none"
                          onClick={() => setExpandedRow(expandedRow === customer.id ? null : customer.id)}
                          aria-label={expandedRow === customer.id ? 'Collapse customer details' : 'Expand customer details'}
                        >{expandedRow === customer.id ? '-' : '+'}</button>
                      </td>
                    )}
                  </tr>
                  {expandedRow === customer.id && (
                    <tr className="bg-blue-50">
                      <td colSpan={showColumns.length} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="font-semibold mb-1">Email:</div>
                            <div className="mb-2">{customer.email}</div>
                            <div className="font-semibold mb-1">Phone:</div>
                            <div className="mb-2">{customer.phone || '-'}</div>
                            <div className="font-semibold mb-1">Address:</div>
                            <div className="mb-2">{customer.address || '-'}</div>
                            <div className="font-semibold mb-1">Tags:</div>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {customer.tags && customer.tags.length > 0 ? (
                                customer.tags.map((tag: any) => (
                                  <span key={tag.slug} className={`inline-block ${tagColor(tag.slug)} text-xs px-2 py-1 rounded-full`}>
                                    {tag.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 text-xs">No tags</span>
                              )}
                              <button className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300" onClick={() => openEditTags(customer)} aria-label="Edit tags for customer">
                                ✎ Edit Tags
                              </button>
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold mb-1">Timeline/Activity:</div>
                            <div className="mb-2 text-gray-500 italic">(Timeline/Activity placeholder)</div>
                            <div className="font-semibold mb-1">Quick Actions:</div>
                            <div className="flex gap-2">
                              <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs" aria-label="Email customer">Email</button>
                              <button className="px-3 py-1 bg-green-600 text-white rounded-md text-xs" aria-label="Call customer">Call</button>
                              <button className="px-3 py-1 bg-orange-600 text-white rounded-md text-xs" aria-label="Assign tag to customer">Assign Tag</button>
          </div>
        </div>
      </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-2 mt-2">
            <button disabled={page === 1} onClick={() => setPage(Math.max(1, page-1))} className="px-2 py-1 text-xs border rounded disabled:opacity-50" aria-label="Previous page">
              &lt;
            </button>
            <span className="text-xs" aria-label="Current page">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(Math.min(totalPages, page+1))} className="px-2 py-1 text-xs border rounded disabled:opacity-50" aria-label="Next page">
              &gt;
            </button>
          </div>
        )}
        {/* Segment Distribution Chart at Bottom */}
        <div className="w-full mt-8 flex justify-center">
          <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl w-full">
            <div className="text-xl font-bold text-blue-900 mb-2">Segment Distribution (Customers per Tag)</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={segmentData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} aria-label="Segment name" />
                <YAxis allowDecimals={false} aria-label="Customer count" />
                <Tooltip aria-label="Segment distribution tooltip" />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} aria-label="Segment bar" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {editTagsCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30" role="dialog" aria-modal="true" aria-label="Edit Tags">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Tags for {editTagsCustomer.name}</h2>
              <button
                onClick={closeEditTags}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                aria-label="Close tag edit modal"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Select tags to assign to this customer:</p>
              <div className="text-sm text-gray-500">
                Currently selected: <span className="font-medium">{editTags.length}</span> tags
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 max-h-96 overflow-y-auto">
              {ALL_TAGS.map(tag => (
                <label key={tag.slug} className="flex items-center gap-3 p-2 rounded border hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editTags.includes(tag.slug)}
                    onChange={() => handleTagCheckbox(tag.slug)}
                    className="accent-blue-600"
                    aria-label={`Select ${tag.name} tag`}
                  />
                  <span className="text-sm">{tag.name}</span>
                </label>
              ))}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {editTags.length > 0 && (
                  <span>Selected tags: {editTags.map(slug => ALL_TAGS.find(t => t.slug === slug)?.name).join(', ')}</span>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300" 
                  onClick={closeEditTags} 
                  disabled={savingTags} 
                  aria-label="Cancel tag edit"
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50" 
                  onClick={saveTags} 
                  disabled={savingTags} 
                  aria-label="Save tags"
                >
                  {savingTags ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {customerModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30" role="dialog" aria-modal="true" aria-label="Customer Details">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Customer Details</h2>
              <button
                onClick={closeCustomerModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                aria-label="Close customer details modal"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Basic Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">Name:</span>
                      <span className="ml-2">{selectedCustomer.name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="ml-2">{selectedCustomer.email}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Phone:</span>
                      <span className="ml-2">{selectedCustomer.phone || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Address:</span>
                      <span className="ml-2">{selectedCustomer.address || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">City:</span>
                      <span className="ml-2">{selectedCustomer.city || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Community:</span>
                      <span className="ml-2">{selectedCustomer.community || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Created:</span>
                      <span className="ml-2">{new Date(selectedCustomer.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">Tags & Segments</h3>
                    <button
                      onClick={() => {
                        closeCustomerModal();
                        openEditTags(selectedCustomer);
                      }}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      aria-label="Edit tags for customer"
                    >
                      Edit Tags
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCustomer.tags && selectedCustomer.tags.length > 0 ? (
                      selectedCustomer.tags.map((tag: any) => (
                        <span key={tag.slug} className={`inline-block ${tagColor(tag.slug)} text-sm px-3 py-1 rounded-full`}>
                          {tag.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400">No tags assigned</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                {/* Demographics */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Demographics</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">Age Group:</span>
                      <span className="ml-2">
                        {selectedCustomer.tags?.find((t: any) => t.category?.toLowerCase().includes('demographic'))?.name || 'Not specified'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Preferred Metal:</span>
                      <span className="ml-2">{selectedCustomer.preferred_metal || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Preferred Stone:</span>
                      <span className="ml-2">{selectedCustomer.preferred_stone || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Ring Size:</span>
                      <span className="ml-2">{selectedCustomer.ring_size || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Budget Range:</span>
                      <span className="ml-2">{selectedCustomer.budget_range || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                {/* Lead Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Lead Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">Lead Source:</span>
                      <span className="ml-2">{selectedCustomer.lead_source || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className="ml-2">
                        {selectedCustomer.tags?.find((t: any) => t.category?.toLowerCase().includes('crm status'))?.name || 'Not specified'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Product Interest:</span>
                      <span className="ml-2">
                        {selectedCustomer.tags?.find((t: any) => t.category?.toLowerCase().includes('product interest'))?.name || 'Not specified'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Purchase Intent:</span>
                      <span className="ml-2">
                        {selectedCustomer.tags?.find((t: any) => t.category?.toLowerCase().includes('purchase intent'))?.name || 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleSendEmail(selectedCustomer)}
                      disabled={quickActionLoading === 'email'}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {quickActionLoading === 'email' ? 'Opening...' : 'Send Email'}
                    </button>
                    <button 
                      onClick={() => handleMakeCall(selectedCustomer)}
                      disabled={quickActionLoading === 'call'}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {quickActionLoading === 'call' ? 'Calling...' : 'Make Call'}
                    </button>
                    <button 
                      onClick={() => handleScheduleMeeting(selectedCustomer)}
                      disabled={quickActionLoading === 'meeting'}
                      className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {quickActionLoading === 'meeting' ? 'Opening...' : 'Schedule Meeting'}
                    </button>
                    <button 
                      onClick={() => handleAddToPipeline(selectedCustomer)}
                      disabled={quickActionLoading === 'pipeline'}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {quickActionLoading === 'pipeline' ? 'Adding...' : 'Add to Pipeline'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={closeCustomerModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                aria-label="Close customer details"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 