import { apiClient } from './client';

export const supportAPI = {
  // Ticket management
  getTickets: async (queryParams = '') => {
    const response = await apiClient.get(`/support/tickets/${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  },

  getTicket: async (ticketId: string) => {
    const response = await apiClient.get(`/support/tickets/${ticketId}/`);
    return response.data;
  },

  createTicket: async (ticketData: any) => {
    const response = await apiClient.post('/support/tickets/', ticketData);
    return response.data;
  },

  updateTicket: async (ticketId: string, ticketData: any) => {
    const response = await apiClient.patch(`/support/tickets/${ticketId}/`, ticketData);
    return response.data;
  },

  // Ticket actions
  assignTicketToMe: async (ticketId: string) => {
    const response = await apiClient.post(`/support/tickets/${ticketId}/assign_to_me/`);
    return response.data;
  },

  resolveTicket: async (ticketId: string) => {
    const response = await apiClient.post(`/support/tickets/${ticketId}/resolve/`);
    return response.data;
  },

  closeTicket: async (ticketId: string) => {
    const response = await apiClient.post(`/support/tickets/${ticketId}/close/`);
    return response.data;
  },

  reopenTicket: async (ticketId: string) => {
    const response = await apiClient.post(`/support/tickets/${ticketId}/reopen/`);
    return response.data;
  },

  // Messages
  getTicketMessages: async (ticketId: string) => {
    const response = await apiClient.get(`/support/messages/?ticket=${ticketId}`);
    return response.data;
  },

  sendMessage: async (messageData: any) => {
    const response = await apiClient.post('/support/messages/', messageData);
    return response.data;
  },

  // Dashboard stats
  getDashboardStats: async () => {
    const response = await apiClient.get('/support/tickets/dashboard_stats/');
    return response.data;
  },

  // Notifications
  getNotifications: async () => {
    const response = await apiClient.get('/support/notifications/');
    return response.data;
  },

  markNotificationAsRead: async (notificationId: string) => {
    const response = await apiClient.post(`/support/notifications/${notificationId}/mark_as_read/`);
    return response.data;
  },

  markAllNotificationsAsRead: async () => {
    const response = await apiClient.post('/support/notifications/mark_all_as_read/');
    return response.data;
  },

  // Settings
  getSettings: async () => {
    const response = await apiClient.get('/support/settings/');
    return response.data;
  },

  updateSettings: async (settingsData: any) => {
    const response = await apiClient.patch('/support/settings/', settingsData);
    return response.data;
  }
}; 