'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { supportAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function PlatformAdminSupportTicketDetail() {
  const { user, loading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [internalMessage, setInternalMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showInternalForm, setShowInternalForm] = useState(false);

  useEffect(() => {
    if (user && params.id) {
      fetchTicket();
      fetchMessages();
    }
  }, [user, params.id]);

  const fetchTicket = async () => {
    try {
      const data = await supportAPI.getTicket(params.id);
      setTicket(data);
    } catch (err) {
      console.error('Error fetching ticket:', err);
      toast.error('Failed to fetch ticket details');
    } finally {
      setDataLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const data = await supportAPI.getTicketMessages(params.id);
      setMessages(Array.isArray(data) ? data : (data?.results || []));
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await supportAPI.sendMessage({
        ticket: params.id,
        content: newMessage,
        is_internal: false,
        message_type: 'text'
      });
      
      setNewMessage('');
      fetchMessages();
      toast.success('Message sent successfully!');
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSendInternalMessage = async (e) => {
    e.preventDefault();
    if (!internalMessage.trim()) return;

    setSending(true);
    try {
      await supportAPI.sendMessage({
        ticket: params.id,
        content: internalMessage,
        is_internal: true,
        message_type: 'text'
      });
      
      setInternalMessage('');
      setShowInternalForm(false);
      fetchMessages();
      toast.success('Internal message sent successfully!');
    } catch (err) {
      console.error('Error sending internal message:', err);
      toast.error('Failed to send internal message');
    } finally {
      setSending(false);
    }
  };

  const handleAssignToMe = async () => {
    try {
      await supportAPI.assignTicketToMe(params.id);
      toast.success('Ticket assigned to you successfully!');
      fetchTicket();
    } catch (err) {
      console.error('Error assigning ticket:', err);
      toast.error('Failed to assign ticket');
    }
  };

  const handleResolveTicket = async () => {
    try {
      await supportAPI.resolveTicket(params.id);
      toast.success('Ticket marked as resolved!');
      fetchTicket();
    } catch (err) {
      console.error('Error resolving ticket:', err);
      toast.error('Failed to resolve ticket');
    }
  };

  const handleCloseTicket = async () => {
    if (!confirm('Are you sure you want to close this ticket?')) return;

    try {
      await supportAPI.closeTicket(params.id);
      toast.success('Ticket closed successfully!');
      fetchTicket();
    } catch (err) {
      console.error('Error closing ticket:', err);
      toast.error('Failed to close ticket');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      reopened: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.open;
  };

  if (loading) {
    return <div className="p-8 text-blue-600 font-semibold">Loading...</div>;
  }

  if (!user || user.role !== 'platform_admin') {
    return <div className="p-8 text-red-600 font-semibold">Access denied. Only platform admins can view this page.</div>;
  }

  if (dataLoading) {
    return (
      <div className="p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 text-sm mt-2 text-center">Loading ticket...</p>
      </div>
    );
  }

  if (!ticket) {
    return <div className="p-8 text-red-600 font-semibold">Ticket not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {ticket.ticket_id} - {ticket.title}
          </h2>
          <p className="text-gray-600">Support ticket from {ticket.tenant_name}</p>
        </div>
        <div className="flex space-x-3">
          {!ticket.assigned_to_name && (
            <button
              onClick={handleAssignToMe}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Assign to Me
            </button>
          )}
          {ticket.status === 'open' && ticket.assigned_to_name && (
            <button
              onClick={handleResolveTicket}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Mark Resolved
            </button>
          )}
          {ticket.status !== 'closed' && (
            <button
              onClick={handleCloseTicket}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Close Ticket
            </button>
          )}
        </div>
      </div>

      {/* Ticket Info */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Priority:</span>
                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Category:</span>
                <span className="ml-2 text-sm text-gray-900">{ticket.category.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Created:</span>
                <span className="ml-2 text-sm text-gray-900">
                  {new Date(ticket.created_at).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Created by:</span>
                <span className="ml-2 text-sm text-gray-900">{ticket.created_by_name}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Tenant:</span>
                <span className="ml-2 text-sm text-gray-900">{ticket.tenant_name}</span>
              </div>
              {ticket.assigned_to_name && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Assigned to:</span>
                  <span className="ml-2 text-sm text-gray-900">{ticket.assigned_to_name}</span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Details</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Description:</span>
                <p className="mt-1 text-sm text-gray-900">{ticket.summary}</p>
              </div>
              {ticket.is_urgent && (
                <div className="flex items-center">
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    URGENT
                  </span>
                </div>
              )}
              {ticket.requires_callback && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Callback Requested:</span>
                  <p className="mt-1 text-sm text-gray-900">
                    Phone: {ticket.callback_phone}<br />
                    Preferred time: {ticket.callback_preferred_time}
                  </p>
                </div>
              )}
              {ticket.response_time_hours && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Response Time:</span>
                  <span className="ml-2 text-sm text-gray-900">{ticket.response_time_hours} hours</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Conversation</h3>
            <button
              onClick={() => setShowInternalForm(!showInternalForm)}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition"
            >
              {showInternalForm ? 'Cancel Internal Note' : 'Add Internal Note'}
            </button>
          </div>
        </div>
        
        {/* Internal Message Form */}
        {showInternalForm && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <form onSubmit={handleSendInternalMessage} className="space-y-3">
              <textarea
                value={internalMessage}
                onChange={(e) => setInternalMessage(e.target.value)}
                placeholder="Add internal note (only visible to platform admins)..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={sending}
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowInternalForm(false)}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!internalMessage.trim() || sending}
                  className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send Internal Note'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="p-6 max-h-96 overflow-y-auto">
          {messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_role === 'platform_admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_role === 'platform_admin'
                        ? message.is_internal
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-blue-600 text-white'
                        : message.is_system_message
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    {message.is_system_message ? (
                      <div className="text-xs italic">{message.content}</div>
                    ) : (
                      <div>
                        <div className="text-xs opacity-75 mb-1">
                          {message.sender_name} ({message.sender_role_display})
                          {message.is_internal && ' - Internal Note'}
                        </div>
                        <div>{message.content}</div>
                        <div className="text-xs opacity-75 mt-1">
                          {new Date(message.created_at).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No messages yet. Start the conversation!
            </div>
          )}
        </div>

        {/* Send Message */}
        {ticket.status !== 'closed' && (
          <div className="p-6 border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message to the business admin..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 