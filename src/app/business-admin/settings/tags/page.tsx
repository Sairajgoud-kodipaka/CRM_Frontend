'use client';

import { useState, useEffect } from 'react';

interface Tag {
  id: number;
  name: string;
  color: string;
  description: string;
  auto_apply: boolean;
  conditions: string[];
  customer_count: number;
  created_at: string;
}

interface Segment {
  id: number;
  name: string;
  description: string;
  tags: string[];
  conditions: string[];
  customer_count: number;
  is_active: boolean;
  created_at: string;
}

export default function SettingsTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tags' | 'segments'>('tags');
  const [showTagModal, setShowTagModal] = useState(false);
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);
  const [tagForm, setTagForm] = useState({
    name: '',
    color: '#3B82F6',
    description: '',
    auto_apply: false,
    conditions: ['']
  });
  const [segmentForm, setSegmentForm] = useState({
    name: '',
    description: '',
    tags: [] as string[],
    conditions: [''],
    is_active: true
  });

  // Mock data for demonstration
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTags([
        {
          id: 1,
          name: 'VIP Customer',
          color: '#10B981',
          description: 'High-value customers with premium purchases',
          auto_apply: true,
          conditions: ['total_spent > 10000', 'purchase_count > 5'],
          customer_count: 45,
          created_at: '2024-01-15'
        },
        {
          id: 2,
          name: 'New Customer',
          color: '#3B82F6',
          description: 'First-time customers',
          auto_apply: true,
          conditions: ['purchase_count = 1'],
          customer_count: 128,
          created_at: '2024-01-10'
        },
        {
          id: 3,
          name: 'Gold Collection',
          color: '#F59E0B',
          description: 'Customers who purchased gold items',
          auto_apply: true,
          conditions: ['category = gold'],
          customer_count: 89,
          created_at: '2024-01-05'
        },
        {
          id: 4,
          name: 'Diamond Enthusiast',
          color: '#8B5CF6',
          description: 'Customers interested in diamond jewelry',
          auto_apply: false,
          conditions: ['viewed_diamond_items > 3'],
          customer_count: 67,
          created_at: '2024-01-01'
        }
      ]);

      setSegments([
        {
          id: 1,
          name: 'Premium Buyers',
          description: 'High-value customers for exclusive offers',
          tags: ['VIP Customer', 'Gold Collection'],
          conditions: ['total_spent > 50000'],
          customer_count: 23,
          is_active: true,
          created_at: '2024-01-15'
        },
        {
          id: 2,
          name: 'New Market',
          description: 'Recent customers for onboarding campaigns',
          tags: ['New Customer'],
          conditions: ['registration_date > 30_days_ago'],
          customer_count: 89,
          is_active: true,
          created_at: '2024-01-10'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTag) {
      // Update existing tag
      setTags(tags.map(tag => 
        tag.id === editingTag.id 
          ? { ...tag, ...tagForm }
          : tag
      ));
    } else {
      // Create new tag
      const newTag: Tag = {
        id: Date.now(),
        ...tagForm,
        customer_count: 0,
        created_at: new Date().toISOString().split('T')[0]
      };
      setTags([...tags, newTag]);
    }
    setShowTagModal(false);
    setEditingTag(null);
    setTagForm({ name: '', color: '#3B82F6', description: '', auto_apply: false, conditions: [''] });
  };

  const handleSegmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSegment) {
      // Update existing segment
      setSegments(segments.map(segment => 
        segment.id === editingSegment.id 
          ? { ...segment, ...segmentForm }
          : segment
      ));
    } else {
      // Create new segment
      const newSegment: Segment = {
        id: Date.now(),
        ...segmentForm,
        customer_count: 0,
        created_at: new Date().toISOString().split('T')[0]
      };
      setSegments([...segments, newSegment]);
    }
    setShowSegmentModal(false);
    setEditingSegment(null);
    setSegmentForm({ name: '', description: '', tags: [], conditions: [''], is_active: true });
  };

  const editTag = (tag: Tag) => {
    setEditingTag(tag);
    setTagForm({
      name: tag.name,
      color: tag.color,
      description: tag.description,
      auto_apply: tag.auto_apply,
      conditions: tag.conditions
    });
    setShowTagModal(true);
  };

  const editSegment = (segment: Segment) => {
    setEditingSegment(segment);
    setSegmentForm({
      name: segment.name,
      description: segment.description,
      tags: segment.tags,
      conditions: segment.conditions,
      is_active: segment.is_active
    });
    setShowSegmentModal(true);
  };

  const deleteTag = (tagId: number) => {
    if (confirm('Are you sure you want to delete this tag?')) {
      setTags(tags.filter(tag => tag.id !== tagId));
    }
  };

  const deleteSegment = (segmentId: number) => {
    if (confirm('Are you sure you want to delete this segment?')) {
      setSegments(segments.filter(segment => segment.id !== segmentId));
    }
  };

  const addCondition = (type: 'tag' | 'segment') => {
    if (type === 'tag') {
      setTagForm({ ...tagForm, conditions: [...tagForm.conditions, ''] });
    } else {
      setSegmentForm({ ...segmentForm, conditions: [...segmentForm.conditions, ''] });
    }
  };

  const removeCondition = (index: number, type: 'tag' | 'segment') => {
    if (type === 'tag') {
      const newConditions = tagForm.conditions.filter((_, i) => i !== index);
      setTagForm({ ...tagForm, conditions: newConditions });
    } else {
      const newConditions = segmentForm.conditions.filter((_, i) => i !== index);
      setSegmentForm({ ...segmentForm, conditions: newConditions });
    }
  };

  const updateCondition = (index: number, value: string, type: 'tag' | 'segment') => {
    if (type === 'tag') {
      const newConditions = [...tagForm.conditions];
      newConditions[index] = value;
      setTagForm({ ...tagForm, conditions: newConditions });
    } else {
      const newConditions = [...segmentForm.conditions];
      newConditions[index] = value;
      setSegmentForm({ ...segmentForm, conditions: newConditions });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Tags & Segmentation</h2>
        <p className="mb-4 text-gray-700">
          Define and edit customer tags, map auto-tagging rules, and manage segmentation logic.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{tags.length}</div>
          <div className="text-sm text-gray-600">Total Tags</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{segments.length}</div>
          <div className="text-sm text-gray-600">Active Segments</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {tags.filter(tag => tag.auto_apply).length}
          </div>
          <div className="text-sm text-gray-600">Auto-Apply Tags</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">
            {tags.reduce((sum, tag) => sum + tag.customer_count, 0)}
          </div>
          <div className="text-sm text-gray-600">Tagged Customers</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('tags')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tags'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Customer Tags ({tags.length})
            </button>
            <button
              onClick={() => setActiveTab('segments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'segments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Segments ({segments.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'tags' ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Customer Tags</h3>
                <button
                  onClick={() => setShowTagModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Create Tag
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tags.map(tag => (
                  <div key={tag.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: tag.color }}
                        ></div>
                        <h4 className="font-semibold">{tag.name}</h4>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editTag(tag)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTag(tag.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{tag.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {tag.customer_count} customers
                      </span>
                      {tag.auto_apply && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          Auto-apply
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Segments</h3>
                <button
                  onClick={() => setShowSegmentModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Create Segment
                </button>
              </div>

              <div className="space-y-4">
                {segments.map(segment => (
                  <div key={segment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{segment.name}</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editSegment(segment)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteSegment(segment.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{segment.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {segment.customer_count} customers
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        segment.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {segment.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tag Modal */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingTag ? 'Edit Tag' : 'Create New Tag'}
              </h3>
              <button 
                onClick={() => {
                  setShowTagModal(false);
                  setEditingTag(null);
                  setTagForm({ name: '', color: '#3B82F6', description: '', auto_apply: false, conditions: [''] });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTagSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tag Name *</label>
                  <input
                    type="text"
                    required
                    value={tagForm.name}
                    onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input
                    type="color"
                    value={tagForm.color}
                    onChange={(e) => setTagForm({ ...tagForm, color: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={tagForm.description}
                  onChange={(e) => setTagForm({ ...tagForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="auto_apply"
                  checked={tagForm.auto_apply}
                  onChange={(e) => setTagForm({ ...tagForm, auto_apply: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="auto_apply" className="text-sm text-gray-700">
                  Auto-apply this tag based on conditions
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conditions</label>
                {tagForm.conditions.map((condition, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={condition}
                      onChange={(e) => updateCondition(index, e.target.value, 'tag')}
                      placeholder="e.g., total_spent > 1000"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {tagForm.conditions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCondition(index, 'tag')}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addCondition('tag')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Condition
                </button>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTagModal(false);
                    setEditingTag(null);
                    setTagForm({ name: '', color: '#3B82F6', description: '', auto_apply: false, conditions: [''] });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingTag ? 'Update Tag' : 'Create Tag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Segment Modal */}
      {showSegmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingSegment ? 'Edit Segment' : 'Create New Segment'}
              </h3>
              <button 
                onClick={() => {
                  setShowSegmentModal(false);
                  setEditingSegment(null);
                  setSegmentForm({ name: '', description: '', tags: [], conditions: [''], is_active: true });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSegmentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Segment Name *</label>
                <input
                  type="text"
                  required
                  value={segmentForm.name}
                  onChange={(e) => setSegmentForm({ ...segmentForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={segmentForm.description}
                  onChange={(e) => setSegmentForm({ ...segmentForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Include Tags</label>
                <select
                  multiple
                  value={segmentForm.tags}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setSegmentForm({ ...segmentForm, tags: selectedOptions });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {tags.map(tag => (
                    <option key={tag.id} value={tag.name}>
                      {tag.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple tags</p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={segmentForm.is_active}
                  onChange={(e) => setSegmentForm({ ...segmentForm, is_active: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Active segment
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Conditions</label>
                {segmentForm.conditions.map((condition, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={condition}
                      onChange={(e) => updateCondition(index, e.target.value, 'segment')}
                      placeholder="e.g., registration_date > 30_days_ago"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {segmentForm.conditions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCondition(index, 'segment')}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addCondition('segment')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Condition
                </button>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSegmentModal(false);
                    setEditingSegment(null);
                    setSegmentForm({ name: '', description: '', tags: [], conditions: [''], is_active: true });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingSegment ? 'Update Segment' : 'Create Segment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 