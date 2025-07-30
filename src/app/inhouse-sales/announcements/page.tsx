'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, PinIcon, AlertTriangleIcon, MessageSquareIcon, UsersIcon, ClockIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface Announcement {
  id: number;
  title: string;
  content: string;
  announcement_type: string;
  priority: string;
  priority_color: string;
  is_pinned: boolean;
  is_active: boolean;
  requires_acknowledgment: boolean;
  publish_at: string;
  expires_at: string | null;
  author: {
    id: number;
    username: string;
    full_name: string;
    role: string;
  };
  created_at: string;
  updated_at: string;
  read_count: number;
  unread_count: number;
  is_read_by_current_user: boolean;
  is_acknowledged_by_current_user: boolean;
}

interface TeamMessage {
  id: number;
  subject: string;
  content: string;
  message_type: string;
  sender: {
    id: number;
    username: string;
    full_name: string;
    role: string;
  };
  recipients: Array<{
    id: number;
    username: string;
    full_name: string;
    role: string;
  }>;
  is_urgent: boolean;
  requires_response: boolean;
  created_at: string;
  read_count: number;
  unread_count: number;
  is_read_by_current_user: boolean;
  is_responded_by_current_user: boolean;
  thread_count: number;
}

export default function AnnouncementsPage() {
  const { user, loading: authLoading } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [teamMessages, setTeamMessages] = useState<TeamMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'announcements' | 'messages'>('announcements');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<TeamMessage | null>(null);
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    announcement_type: 'system_wide',
    priority: 'medium',
    is_pinned: false,
    requires_acknowledgment: false,
    publish_at: new Date().toISOString().slice(0, 16),
    expires_at: '',
  });

  const [messageForm, setMessageForm] = useState({
    subject: '',
    content: '',
    message_type: 'general',
    is_urgent: false,
    requires_response: false,
  });

  const [replyForm, setReplyForm] = useState({
    content: '',
  });

  useEffect(() => {
    if (!authLoading) {
      console.log('[Announcements] Auth loading finished, user:', user);
      console.log('[Announcements] Auth token:', localStorage.getItem('access_token'));
      fetchData();
    }
  }, [authLoading]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/auth/login';
    }
  }, [authLoading, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      
      // Check if user is authenticated
      const token = localStorage.getItem('access_token');
      console.log('[Announcements] Auth token present:', !!token);
      console.log('[Announcements] User from context:', user);
      console.log('[Announcements] User tenant:', user?.tenant);
      
      if (!token || !user) {
        setError('Please log in to view announcements.');
        setAnnouncements([]);
        setTeamMessages([]);
        setUnreadAnnouncements(0);
        setUnreadMessages(0);
        return;
      }
      
      // Fetch announcements
      console.log('Fetching announcements...');
      try {
        const announcementsResponse = await api.get('/announcements/announcements/');
        console.log('Announcements response:', announcementsResponse);
        console.log('Announcements data:', announcementsResponse.data);
        console.log('Announcements data type:', typeof announcementsResponse.data);
        console.log('Is array:', Array.isArray(announcementsResponse.data));
        
        // Ensure we have an array
        let announcementsData = [];
        if (Array.isArray(announcementsResponse.data)) {
          announcementsData = announcementsResponse.data;
        } else if (announcementsResponse.data && Array.isArray(announcementsResponse.data.results)) {
          announcementsData = announcementsResponse.data.results;
        } else if (announcementsResponse.data && Array.isArray(announcementsResponse.data.data)) {
          announcementsData = announcementsResponse.data.data;
        } else {
          console.log('No valid array found in announcements response');
        }
        
        setAnnouncements(announcementsData);
        console.log('Set announcements:', announcementsData);
      } catch (announcementError) {
        console.error('Error fetching announcements:', announcementError);
        setAnnouncements([]);
      }

      // Fetch team messages
      console.log('Fetching team messages...');
      try {
        const messagesResponse = await api.get('/announcements/messages/');
        console.log('Messages response:', messagesResponse);
        console.log('Messages data:', messagesResponse.data);
        console.log('Messages data type:', typeof messagesResponse.data);
        console.log('Is array:', Array.isArray(messagesResponse.data));
        
        // Ensure we have an array
        let messagesData = [];
        if (Array.isArray(messagesResponse.data)) {
          messagesData = messagesResponse.data;
        } else if (messagesResponse.data && Array.isArray(messagesResponse.data.results)) {
          messagesData = messagesResponse.data.results;
        } else if (messagesResponse.data && Array.isArray(messagesResponse.data.data)) {
          messagesData = messagesResponse.data.data;
        } else {
          console.log('No valid array found in messages response');
        }
        
        setTeamMessages(messagesData);
        console.log('Set messages:', messagesData);
      } catch (messageError) {
        console.error('Error fetching messages:', messageError);
        setTeamMessages([]);
      }

      // Fetch unread counts
      console.log('Fetching unread counts...');
      const unreadAnnouncementsResponse = await api.get('/announcements/announcements/unread_count/');
      console.log('Unread announcements response:', unreadAnnouncementsResponse);
      setUnreadAnnouncements(unreadAnnouncementsResponse.data?.unread_count || 0);

      const unreadMessagesResponse = await api.get('/announcements/messages/unread_count/');
      console.log('Unread messages response:', unreadMessagesResponse);
      setUnreadMessages(unreadMessagesResponse.data?.unread_count || 0);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch announcements or messages.');
      // Set empty arrays on error to prevent map errors
      setAnnouncements([]);
      setTeamMessages([]);
      setUnreadAnnouncements(0);
      setUnreadMessages(0);
    } finally {
      setLoading(false);
    }
  };

  const markAnnouncementAsRead = async (announcementId: number) => {
    try {
      await api.post(`/announcements/announcements/${announcementId}/mark_as_read/`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error marking announcement as read:', error);
    }
  };

  const acknowledgeAnnouncement = async (announcementId: number) => {
    try {
      await api.post(`/announcements/announcements/${announcementId}/acknowledge/`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error acknowledging announcement:', error);
    }
  };

  const markMessageAsRead = async (messageId: number) => {
    try {
      await api.post(`/announcements/messages/${messageId}/mark_as_read/`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const respondToMessage = async (messageId: number) => {
    try {
      await api.post(`/announcements/messages/${messageId}/respond/`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error responding to message:', error);
    }
  };

  const replyToMessage = async () => {
    if (!selectedMessage) return;
    
    try {
      await api.post(`/announcements/messages/${selectedMessage.id}/reply/`, {
        content: replyForm.content,
        subject: `Re: ${selectedMessage.subject}`,
        message_type: 'general',
      });
      
      setShowReplyDialog(false);
      setSelectedMessage(null);
      setReplyForm({ content: '' });
      fetchData();
    } catch (error) {
      console.error('Error replying to message:', error);
    }
  };

  const createAnnouncement = async () => {
    try {
      await api.post('/announcements/announcements/', announcementForm);
      setShowCreateDialog(false);
      setAnnouncementForm({
        title: '',
        content: '',
        announcement_type: 'system_wide',
        priority: 'medium',
        is_pinned: false,
        requires_acknowledgment: false,
        publish_at: new Date().toISOString().slice(0, 16),
        expires_at: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const createMessage = async () => {
    try {
      console.log('Creating message with data:', messageForm);
      
      // Validate required fields
      if (!messageForm.subject.trim()) {
        setError('Subject is required.');
        return;
      }
      
      if (!messageForm.content.trim()) {
        setError('Content is required.');
        return;
      }
      
      // Format the message data properly
      const messageData = {
        subject: messageForm.subject,
        content: messageForm.content,
        message_type: messageForm.message_type,
        is_urgent: messageForm.is_urgent,
        requires_response: messageForm.requires_response,
      };
      
      console.log('Formatted message data:', messageData);
      
      const response = await api.post('/announcements/messages/', messageData);
      console.log('Message creation response:', response);
      
      setShowMessageDialog(false);
      setMessageForm({
        subject: '',
        content: '',
        message_type: 'general',
        is_urgent: false,
        requires_response: false,
      });
      fetchData();
    } catch (error: any) {
      console.error('Error creating message:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to create message. Please try again.';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'object') {
          // Handle field-specific errors
          const fieldErrors = Object.entries(error.response.data)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          errorMessage = `Validation errors: ${fieldErrors}`;
        }
      }
      
      setError(errorMessage);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      system_wide: 'bg-purple-100 text-purple-800',
      team_specific: 'bg-green-100 text-green-800',
      store_specific: 'bg-blue-100 text-blue-800',
      role_specific: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type as keyof typeof colors] || colors.system_wide;
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading announcements...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangleIcon className="w-6 h-6 text-red-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Error Loading Data</h3>
              <p className="text-red-600 mt-1">{error}</p>
              <button 
                onClick={fetchData}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('[Announcements] Rendering component');
  console.log('[Announcements] Announcements state:', announcements);
  console.log('[Announcements] Team messages state:', teamMessages);
  console.log('[Announcements] Announcements length:', announcements.length);
  console.log('[Announcements] Team messages length:', teamMessages.length);
  console.log('[Announcements] Active tab:', activeTab);
  console.log('[Announcements] Loading state:', loading);
  console.log('[Announcements] Error state:', error);
  console.log('[Announcements] Team messages details:', teamMessages.map(m => ({ id: m.id, subject: m.subject, content: m.content, sender: m.sender?.full_name })));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Communication & Announcements</h1>
          <p className="text-gray-600 mt-2">Stay updated with important announcements and team messages</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <PinIcon className="w-4 h-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    placeholder="Enter announcement title"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                    placeholder="Enter announcement content"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={announcementForm.announcement_type}
                      onValueChange={(value) => setAnnouncementForm({ ...announcementForm, announcement_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system_wide">System-wide</SelectItem>
                        <SelectItem value="team_specific">Team-specific</SelectItem>
                        <SelectItem value="store_specific">Store-specific</SelectItem>
                        <SelectItem value="role_specific">Role-specific</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={announcementForm.priority}
                      onValueChange={(value) => setAnnouncementForm({ ...announcementForm, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="publish_at">Publish At</Label>
                    <Input
                      id="publish_at"
                      type="datetime-local"
                      value={announcementForm.publish_at}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, publish_at: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expires_at">Expires At (Optional)</Label>
                    <Input
                      id="expires_at"
                      type="datetime-local"
                      value={announcementForm.expires_at}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, expires_at: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                                  <Checkbox
                id="is_pinned"
                checked={announcementForm.is_pinned}
                onCheckedChange={(checked) => setAnnouncementForm({ ...announcementForm, is_pinned: checked as boolean })}
              />
                    <Label htmlFor="is_pinned">Pin to top</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                                  <Checkbox
                id="requires_acknowledgment"
                checked={announcementForm.requires_acknowledgment}
                onCheckedChange={(checked) => setAnnouncementForm({ ...announcementForm, requires_acknowledgment: checked as boolean })}
              />
                    <Label htmlFor="requires_acknowledgment">Requires acknowledgment</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createAnnouncement}>
                    Create Announcement
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <MessageSquareIcon className="w-4 h-4 mr-2" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Send Team Message</DialogTitle>
                <p className="text-sm text-gray-600 mt-2">
                  This message will be sent to all team members of your store.
                </p>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                    placeholder="Enter message subject"
                  />
                </div>
                <div>
                  <Label htmlFor="message_content">Content</Label>
                  <Textarea
                    id="message_content"
                    value={messageForm.content}
                    onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
                    placeholder="Enter message content"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="message_type">Type</Label>
                    <Select
                      value={messageForm.message_type}
                      onValueChange={(value) => setMessageForm({ ...messageForm, message_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="task">Task-related</SelectItem>
                        <SelectItem value="customer">Customer-related</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                                  <Checkbox
                id="is_urgent"
                checked={messageForm.is_urgent}
                onCheckedChange={(checked) => setMessageForm({ ...messageForm, is_urgent: checked as boolean })}
              />
                    <Label htmlFor="is_urgent">Urgent message</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                                  <Checkbox
                id="requires_response"
                checked={messageForm.requires_response}
                onCheckedChange={(checked) => setMessageForm({ ...messageForm, requires_response: checked as boolean })}
              />
                    <Label htmlFor="requires_response">Requires response</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createMessage}>
                    Send Message
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Reply to Message</DialogTitle>
                {selectedMessage && (
                  <p className="text-sm text-gray-600 mt-2">
                    Replying to: {selectedMessage.subject}
                  </p>
                )}
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reply_content">Your Reply</Label>
                  <Textarea
                    id="reply_content"
                    value={replyForm.content}
                    onChange={(e) => setReplyForm({ ...replyForm, content: e.target.value })}
                    placeholder="Enter your reply..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowReplyDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={replyToMessage}>
                    Send Reply
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Announcements</p>
                <p className="text-2xl font-bold">{announcements.length}</p>
              </div>
              <PinIcon className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread Announcements</p>
                <p className="text-2xl font-bold text-red-600">{unreadAnnouncements}</p>
              </div>
              <AlertTriangleIcon className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Messages</p>
                <p className="text-2xl font-bold">{teamMessages.length}</p>
              </div>
              <MessageSquareIcon className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-red-600">{unreadMessages}</p>
              </div>
              <MessageSquareIcon className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'announcements'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Announcements ({announcements.length})
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'messages'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Team Messages ({teamMessages.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <PinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements yet</h3>
                <p className="text-gray-600">Create your first announcement to get started.</p>
              </CardContent>
            </Card>
          ) : (
            (Array.isArray(announcements) ? announcements : []).map((announcement) => (
              <Card key={announcement.id} className={`${!announcement.is_read_by_current_user ? 'border-l-4 border-l-blue-500' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                        {announcement.is_pinned && (
                          <PinIcon className="w-4 h-4 text-blue-500" />
                        )}
                        <Badge className={getPriorityColor(announcement.priority)}>
                          {announcement.priority}
                        </Badge>
                        <Badge className={getTypeColor(announcement.announcement_type)}>
                          {announcement.announcement_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>By {announcement.author.full_name}</span>
                        <span>•</span>
                        <span>{format(new Date(announcement.created_at), 'MMM dd, yyyy HH:mm')}</span>
                        {announcement.requires_acknowledgment && (
                          <>
                            <span>•</span>
                            <span className="text-orange-600">Requires acknowledgment</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!announcement.is_read_by_current_user && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAnnouncementAsRead(announcement.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                      {announcement.requires_acknowledgment && !announcement.is_acknowledged_by_current_user && (
                        <Button
                          size="sm"
                          onClick={() => acknowledgeAnnouncement(announcement.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <UsersIcon className="w-4 h-4" />
                      {announcement.read_count} read
                    </span>
                    {announcement.expires_at && (
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        Expires: {format(new Date(announcement.expires_at), 'MMM dd, yyyy')}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="space-y-4">
          {teamMessages.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquareIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No team messages yet</h3>
                <p className="text-gray-600">Send your first team message to get started.</p>
              </CardContent>
            </Card>
          ) : (
            (Array.isArray(teamMessages) ? teamMessages : []).map((message) => (
              <Card key={message.id} className={`${!message.is_read_by_current_user ? 'border-l-4 border-l-green-500' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{message.subject}</CardTitle>
                        {message.is_urgent && (
                          <Badge className="bg-red-100 text-red-800">
                            Urgent
                          </Badge>
                        )}
                        <Badge className="bg-blue-100 text-blue-800">
                          {message.message_type}
                        </Badge>
                        {message.thread_count > 0 && (
                          <Badge variant="outline">
                            {message.thread_count} replies
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>From {message.sender.full_name}</span>
                        <span>•</span>
                        <span>{format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}</span>
                        {message.requires_response && (
                          <>
                            <span>•</span>
                            <span className="text-orange-600">Requires response</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!message.is_read_by_current_user && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markMessageAsRead(message.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                      {message.requires_response && !message.is_responded_by_current_user && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedMessage(message);
                            setShowReplyDialog(true);
                          }}
                        >
                          Respond
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {message.content || 'No content available'}
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <UsersIcon className="w-4 h-4" />
                      {message.read_count} read, {message.unread_count} unread
                    </span>
                    <span className="flex items-center gap-1">
                      <UsersIcon className="w-4 h-4" />
                      To: {message.recipients.map(r => r.full_name).join(', ')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
} 