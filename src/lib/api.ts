import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post('/auth/login/', credentials);
    
    // Store tokens
    const { access, refresh } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    // Fetch user profile data
    try {
      const userResponse = await api.get('/auth/profile/');
      const userData = userResponse.data;
      
      return {
        access,
        refresh,
        user: userData
      };
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Return basic response if profile fetch fails
      return {
        access,
        refresh,
        user: { username: credentials.username }
      };
    }
  },
  
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
  }) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },
  
  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      await api.post('/auth/logout/', { refresh: refreshToken });
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },
  
  updateProfile: async (userData: Partial<any>) => {
    const response = await api.put('/auth/profile/', userData);
    return response.data;
  },
  
  changePassword: async (passwords: { old_password: string; new_password: string }) => {
    const response = await api.post('/auth/change-password/', passwords);
    return response.data;
  },
  
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password/', { email });
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getUsers: async (params?: any) => {
    const response = await api.get('/auth/list/', { params });
    return response.data;
  },
  
  getUser: async (id: number) => {
    const response = await api.get(`/auth/${id}/`);
    return response.data;
  },
  
  createUser: async (userData: any) => {
    const response = await api.post('/auth/create/', userData);
    return response.data;
  },
  
  updateUser: async (id: number, userData: any) => {
    const response = await api.put(`/auth/${id}/update/`, userData);
    return response.data;
  },
  
  deleteUser: async (id: number) => {
    const response = await api.delete(`/auth/${id}/delete/`);
    return response.data;
  },
};

// Team Members API
export const teamMembersAPI = {
  getTeamMembers: async (params?: any) => {
    const response = await api.get('/auth/team-members/', { params });
    return response.data;
  },
  
  getTeamMember: async (id: number) => {
    const response = await api.get(`/auth/team-members/${id}/`);
    return response.data;
  },
  
  createTeamMember: async (teamMemberData: any) => {
    const response = await api.post('/auth/team-members/create/', teamMemberData);
    return response.data;
  },
  
  updateTeamMember: async (id: number, teamMemberData: any) => {
    const response = await api.put(`/auth/team-members/${id}/update/`, teamMemberData);
    return response.data;
  },
  
  deleteTeamMember: async (id: number) => {
    const response = await api.delete(`/auth/team-members/${id}/delete/`);
    return response.data;
  },
  
  searchTeamMembers: async (params?: any) => {
    const response = await api.get('/auth/team-members/search/', { params });
    return response.data;
  },
  
  getTeamStats: async () => {
    const response = await api.get('/auth/team-stats/');
    return response.data;
  },
  
  getTeamMemberActivities: async (params?: any) => {
    const response = await api.get('/auth/team-members/activities/', { params });
    return response.data;
  },
  
  createTeamMemberActivity: async (activityData: any) => {
    const response = await api.post('/auth/team-members/activities/', activityData);
    return response.data;
  },
  
  getTeamMemberPerformance: async (params?: any) => {
    const response = await api.get('/auth/team-members/performance/', { params });
    return response.data;
  },
  
  createTeamMemberPerformance: async (performanceData: any) => {
    const response = await api.post('/auth/team-members/performance/', performanceData);
    return response.data;
  },
};

// Customers API (using clients endpoint)
export const customersAPI = {
  getCustomers: async (params?: any) => {
    const response = await api.get('/clients/clients/', { params });
    return response.data;
  },
  
  getCustomer: async (id: number) => {
    const response = await api.get(`/clients/clients/${id}/`);
    return response.data;
  },
  
  createCustomer: async (customerData: any) => {
    console.log('=== API LAYER - CREATE CUSTOMER ===');
    console.log('Request URL:', '/clients/clients/');
    console.log('Request Data:', customerData);
    console.log('Request Headers:', api.defaults.headers);
    
    // Check if we have auth token
    const token = localStorage.getItem('access_token');
    console.log('Auth token in API call:', !!token);
    
    try {
      const response = await api.post('/clients/clients/', customerData);
      console.log('=== API LAYER - SUCCESS ===');
      console.log('Response Status:', response.status);
      console.log('Response Data:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('=== API LAYER - ERROR ===');
      console.error('API Error:', error);
      console.error('API Error Response:', error.response);
      console.error('API Error Data:', error.response?.data);
      console.error('API Error Data (stringified):', JSON.stringify(error.response?.data, null, 2));
      console.error('API Error Status:', error.response?.status);
      console.error('API Error Headers:', error.response?.headers);
      
      // Log more details about the request
      console.error('Request URL:', '/clients/clients/');
      console.error('Request Method:', 'POST');
      console.error('Request Data:', customerData);
      console.error('Auth Token Present:', !!token);
      
      throw error;
    }
  },
  
  updateCustomer: async (id: number, customerData: any) => {
    const response = await api.put(`/clients/clients/${id}/`, customerData);
    return response.data;
  },
  
  deleteCustomer: async (id: number) => {
    const response = await api.delete(`/clients/clients/${id}/`);
    return response.data;
  },
  
  getCustomerSegments: async () => {
    const response = await api.get('/clients/clients/segments/');
    return response.data;
  },
  searchCustomers: async (params?: any) => {
    const response = await api.get('/clients/clients/search/', { params });
    return response.data;
  },
  getTrashedCustomers: async () => {
    const response = await api.get('/clients/clients/trash/');
    return response.data;
  },
  restoreCustomer: async (id: number) => {
    const response = await api.post(`/clients/clients/${id}/restore/`);
    return response.data;
  },
  permanentlyDeleteCustomer: async (id: number) => {
    const response = await api.delete(`/clients/clients/${id}/permanent/`);
    return response.data;
  },
  getAuditLogsForCustomer: async (clientId: number) => {
    const response = await api.get(`/clients/audit-logs/?client=${clientId}`);
    return response.data;
  },

  // Import/Export functions
  exportCustomersCSV: async () => {
    const response = await api.get('/clients/clients/export/csv/', {
      responseType: 'blob'
    });
    return response.data;
  },

  exportCustomersJSON: async () => {
    const response = await api.get('/clients/clients/export/json/', {
      responseType: 'blob'
    });
    return response.data;
  },

  importCustomersCSV: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/clients/clients/import/csv/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  importCustomersJSON: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/clients/clients/import/json/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  downloadTemplate: async () => {
    const response = await api.get('/clients/clients/template/download/', {
      responseType: 'blob'
    });
    return response.data;
  },
};

export const telecallingAPI = {
  getStats: async () => {
    return await api.get('/telecalling/assignments/stats/');
  },
  getLeaderboard: async () => {
    return await api.get('/telecalling/assignments/leaderboard/');
  },
  getFollowUps: async (params?: any) => {
    return await api.get('/telecalling/followups/', { params });
  },
};

// Sales API
export const salesAPI = {
  getLeads: async (params?: any) => {
    const response = await api.get('/sales/leads/', { params });
    return response.data;
  },
  
  getLead: async (id: number) => {
    const response = await api.get(`/sales/leads/${id}/`);
    return response.data;
  },
  
  createLead: async (leadData: any) => {
    const response = await api.post('/sales/leads/', leadData);
    return response.data;
  },
  
  updateLead: async (id: number, leadData: any) => {
    const response = await api.put(`/sales/leads/${id}/`, leadData);
    return response.data;
  },
  
  deleteLead: async (id: number) => {
    const response = await api.delete(`/sales/leads/${id}/`);
    return response.data;
  },
  
  getSales: async (params?: any) => {
    const response = await api.get('/sales/', { params });
    return response.data;
  },
  
  getSalesStats: async () => {
    const response = await api.get('/sales/stats/');
    return response.data;
  },
  
  getPipeline: async () => {
    const response = await api.get('/sales/pipeline/');
    return response.data;
  },
};

// Products API
export const productsAPI = {
  getProducts: async (params?: any) => {
    const response = await api.get('/products/list/', { params });
    return response.data;
  },
  
  getProduct: async (id: number) => {
    const response = await api.get(`/products/${id}/`);
    return response.data;
  },
  
  createProduct: async (productData: any) => {
    const response = await api.post('/products/create/', productData);
    return response.data;
  },
  
  updateProduct: async (id: number, productData: any) => {
    const response = await api.put(`/products/${id}/update/`, productData);
    return response.data;
  },
  
  deleteProduct: async (id: number) => {
    const response = await api.delete(`/products/${id}/delete/`);
    return response.data;
  },
  
  getCategories: async () => {
    const response = await api.get('/products/categories/');
    return response.data;
  },
  
  getCategoriesDebug: async () => {
    const response = await api.get('/products/categories/debug/');
    return response.data;
  },
  
  getProductsByCategory: async (categoryId: number) => {
    const response = await api.get(`/products/by-category/${categoryId}/`);
    return response.data;
  },
  
  getCategory: async (id: number) => {
    const response = await api.get(`/products/categories/${id}/`);
    return response.data;
  },
  
  createCategory: async (categoryData: any) => {
    const response = await api.post('/products/categories/create/', categoryData);
    return response.data;
  },
  
  updateCategory: async (id: number, categoryData: any) => {
    const response = await api.put(`/products/categories/${id}/update/`, categoryData);
    return response.data;
  },
  
  deleteCategory: async (id: number) => {
    const response = await api.delete(`/products/categories/${id}/delete/`);
    return response.data;
  },
  
  getProductStats: async () => {
    const response = await api.get('/products/stats/');
    return response.data;
  },
  
  getProductVariants: async (productId: number) => {
    const response = await api.get(`/products/${productId}/variants/`);
    return response.data;
  },
  
  createProductVariant: async (productId: number, variantData: any) => {
    const response = await api.post(`/products/${productId}/variants/create/`, variantData);
    return response.data;
  },
  
  updateProductVariant: async (variantId: number, variantData: any) => {
    const response = await api.put(`/products/variants/${variantId}/update/`, variantData);
    return response.data;
  },
  
  deleteProductVariant: async (variantId: number) => {
    const response = await api.delete(`/products/variants/${variantId}/delete/`);
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: async () => {
    const response = await api.get('/analytics/dashboard/');
    return response.data;
  },
  
  getSimpleDashboardStats: async () => {
    const response = await api.get('/analytics/dashboard-stats/');
    return response.data;
  },
  
  getSalesAnalytics: async (params?: any) => {
    const response = await api.get('/analytics/sales/', { params });
    return response.data;
  },
  
  getCustomerAnalytics: async (params?: any) => {
    const response = await api.get('/analytics/customers/', { params });
    return response.data;
  },
  
  getPerformanceAnalytics: async (params?: any) => {
    const response = await api.get('/analytics/performance/', { params });
    return response.data;
  },
};

// Integrations API
export const integrationsAPI = {
  getWhatsAppStatus: async () => {
    const response = await api.get('/integrations/whatsapp/status/');
    return response.data;
  },
  
  sendWhatsAppMessage: async (messageData: any) => {
    const response = await api.post('/integrations/whatsapp/send/', messageData);
    return response.data;
  },
  
  getEcommerceStatus: async () => {
    const response = await api.get('/integrations/ecommerce/status/');
    return response.data;
  },
  
  syncEcommerceData: async () => {
    const response = await api.post('/integrations/ecommerce/sync/');
    return response.data;
  },
};

// Tenants API
export const tenantsAPI = {
  getTenants: async (params?: any) => {
    const response = await api.get('/tenants/', { params });
    return response.data;
  },
  
  getPlatformDashboard: async () => {
    const response = await api.get('/tenants/platform-dashboard/');
    return response.data;
  },
  
  getTenant: async (id: number) => {
    const response = await api.get(`/tenants/${id}/`);
    return response.data;
  },
  
  createTenant: async (tenantData: any) => {
    const response = await api.post('/tenants/create/', tenantData);
    return response.data;
  },
  
  updateTenant: async (id: number, tenantData: any) => {
    console.log(`Making PUT request to /tenants/${id}/update/ with data:`, tenantData);
    const response = await api.put(`/tenants/${id}/update/`, tenantData);
    console.log('Update response:', response);
    return response.data;
  },
  
  deleteTenant: async (id: number) => {
    const response = await api.delete(`/tenants/${id}/delete/`);
    return response.data;
  },
};

export const appointmentsAPI = {
  // Basic CRUD operations
  createAppointment: async (data: any) => {
    const token = localStorage.getItem('access_token');
    return api.post('/clients/appointments/', data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  },
  getAppointments: async (params?: any) => {
    const token = localStorage.getItem('access_token');
    return api.get('/clients/appointments/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      params
    });
  },
  getAppointment: async (id: number) => {
    const token = localStorage.getItem('access_token');
    return api.get(`/clients/appointments/${id}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  },
  updateAppointment: async (id: number, data: any) => {
    const token = localStorage.getItem('access_token');
    return api.put(`/clients/appointments/${id}/`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  },
  deleteAppointment: async (id: number) => {
    const token = localStorage.getItem('access_token');
    return api.delete(`/clients/appointments/${id}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  },

  // Lifecycle actions
  confirmAppointment: async (id: number) => {
    const token = localStorage.getItem('access_token');
    return api.post(`/clients/appointments/${id}/confirm/`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  },
  completeAppointment: async (id: number, outcomeNotes?: string) => {
    const token = localStorage.getItem('access_token');
    return api.post(`/clients/appointments/${id}/complete/`, {
      outcome_notes: outcomeNotes
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  },
  cancelAppointment: async (id: number, reason?: string) => {
    const token = localStorage.getItem('access_token');
    return api.post(`/clients/appointments/${id}/cancel/`, {
      reason
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  },
  rescheduleAppointment: async (id: number, newDate: string, newTime: string, reason?: string) => {
    const token = localStorage.getItem('access_token');
    return api.post(`/clients/appointments/${id}/reschedule/`, {
      new_date: newDate,
      new_time: newTime,
      reason
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  },
  sendReminder: async (id: number) => {
    const token = localStorage.getItem('access_token');
    return api.post(`/clients/appointments/${id}/send_reminder/`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  },

  // Specialized endpoints
  getCalendarData: async () => {
    const token = localStorage.getItem('access_token');
    return api.get('/clients/appointments/calendar/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  },
  getTodayAppointments: async () => {
    const token = localStorage.getItem('access_token');
    return api.get('/clients/appointments/today/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  },
  getUpcomingAppointments: async () => {
    const token = localStorage.getItem('access_token');
    return api.get('/clients/appointments/upcoming/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  },
  getOverdueAppointments: async () => {
    const token = localStorage.getItem('access_token');
    return api.get('/clients/appointments/overdue/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  },

  // Customer data
  getCustomers: async () => {
    const token = localStorage.getItem('access_token');
    return api.get('/clients/clients/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  }
};

// Follow-ups API
export const followUpsAPI = {
  // Basic CRUD operations
  createFollowUp: async (data: any) => {
    const token = localStorage.getItem('access_token');
    return api.post('/clients/follow-ups/', data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  },
  getFollowUps: async (params?: any) => {
    const token = localStorage.getItem('access_token');
    return api.get('/clients/follow-ups/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      params
    });
  },
  getFollowUp: async (id: number) => {
    const token = localStorage.getItem('access_token');
    return api.get(`/clients/follow-ups/${id}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  },
  updateFollowUp: async (id: number, data: any) => {
    const token = localStorage.getItem('access_token');
    return api.put(`/clients/follow-ups/${id}/`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  },
  deleteFollowUp: async (id: number) => {
    const token = localStorage.getItem('access_token');
    return api.delete(`/clients/follow-ups/${id}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  },

  // Lifecycle actions
  completeFollowUp: async (id: number, outcomeNotes?: string) => {
    const token = localStorage.getItem('access_token');
    return api.post(`/clients/follow-ups/${id}/complete/`, {
      outcome_notes: outcomeNotes
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  },
  sendReminder: async (id: number) => {
    const token = localStorage.getItem('access_token');
    return api.post(`/clients/follow-ups/${id}/send_reminder/`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  },

  // Specialized endpoints
  getOverdueFollowUps: async () => {
    const token = localStorage.getItem('access_token');
    return api.get('/clients/follow-ups/overdue/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  },
  getDueTodayFollowUps: async () => {
    const token = localStorage.getItem('access_token');
    return api.get('/clients/follow-ups/due_today/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  },
  getUpcomingFollowUps: async () => {
    const token = localStorage.getItem('access_token');
    return api.get('/clients/follow-ups/upcoming/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  }
};

// Tasks API
export const tasksAPI = {
  getTasks: async () => {
    const response = await api.get('/clients/tasks/');
    return response;
  },
  createTask: async (data: any) => {
    const response = await api.post('/clients/tasks/', data);
    return response;
  },
  updateTask: async (id: number, data: any) => {
    const response = await api.put(`/clients/tasks/${id}/`, data);
    return response;
  },
  deleteTask: async (id: number) => {
    const response = await api.delete(`/clients/tasks/${id}/`);
    return response;
  },
};

// Stores API
export const storesAPI = {
  getStores: async () => {
    const response = await api.get('/stores/');
    return response.data;
  },
  getStore: async (id: number) => {
    const response = await api.get(`/stores/${id}/`);
    return response.data;
  },
  createStore: async (payload: any) => {
    const response = await api.post('/stores/', payload);
    return response.data;
  },
  updateStore: async (id: number, payload: any) => {
    const response = await api.put(`/stores/${id}/`, payload);
    return response.data;
  },
  deleteStore: async (id: number) => {
    const response = await api.delete(`/stores/${id}/`);
    return response.data;
  },
  assignTeam: async (id: number, payload: any) => {
    const response = await api.patch(`/stores/${id}/assign-team/`, payload);
    return response.data;
  },
  getTeam: async (id: number) => {
    const response = await api.get(`/stores/${id}/team/`);
    return response.data;
  },
  getDashboard: async (id: number) => {
    const response = await api.get(`/stores/${id}/dashboard/`);
    return response.data;
  },
};

export const purchasesAPI = {
  getPurchases: async (params?: any) => {
    return api.get('/purchases/', { params }).then(res => res.data);
  },
  getPurchase: async (id: number) => {
    return api.get(`/purchases/${id}/`).then(res => res.data);
  },
  createPurchase: async (data: any) => {
    return api.post('/purchases/', data).then(res => res.data);
  },
  updatePurchase: async (id: number, data: any) => {
    return api.put(`/purchases/${id}/`, data).then(res => res.data);
  },
  deletePurchase: async (id: number) => {
    return api.delete(`/purchases/${id}/`).then(res => res.data);
  },
};

// Feedback API
export const feedbackAPI = {
  // Basic feedback operations
  getFeedbacks: async (params?: any) => {
    const response = await api.get('/feedback/', { params });
    return response.data;
  },
  
  getFeedback: async (id: number) => {
    const response = await api.get(`/feedback/${id}/`);
    return response.data;
  },
  
  createFeedback: async (feedbackData: any) => {
    const response = await api.post('/feedback/', feedbackData);
    return response.data;
  },
  
  updateFeedback: async (id: number, feedbackData: any) => {
    const response = await api.put(`/feedback/${id}/`, feedbackData);
    return response.data;
  },
  
  // Feedback actions
  markReviewed: async (id: number) => {
    const response = await api.post(`/feedback/${id}/mark_reviewed/`);
    return response.data;
  },
  
  escalateFeedback: async (id: number) => {
    const response = await api.post(`/feedback/${id}/escalate/`);
    return response.data;
  },
  
  deleteFeedback: async (id: number) => {
    const response = await api.delete(`/feedback/${id}/`);
    return response.data;
  },
  
  // Feedback statistics
  getFeedbackStats: async () => {
    const response = await api.get('/feedback/stats/');
    return response.data;
  },
  
  // Feedback responses
  getFeedbackResponses: async (feedbackId: number) => {
    const response = await api.get(`/feedback/${feedbackId}/responses/`);
    return response.data;
  },
  
  createFeedbackResponse: async (feedbackId: number, responseData: any) => {
    const response = await api.post(`/feedback/${feedbackId}/responses/`, responseData);
    return response.data;
  },
  
  // Feedback surveys
  getFeedbackSurveys: async (params?: any) => {
    const response = await api.get('/feedback/surveys/', { params });
    return response.data;
  },
  
  getFeedbackSurvey: async (id: number) => {
    const response = await api.get(`/feedback/surveys/${id}/`);
    return response.data;
  },
  
  createFeedbackSurvey: async (surveyData: any) => {
    const response = await api.post('/feedback/surveys/', surveyData);
    return response.data;
  },
  
  updateFeedbackSurvey: async (id: number, surveyData: any) => {
    const response = await api.put(`/feedback/surveys/${id}/`, surveyData);
    return response.data;
  },
  
  deleteFeedbackSurvey: async (id: number) => {
    const response = await api.delete(`/feedback/surveys/${id}/`);
    return response.data;
  },
  
  // Survey statistics
  getSurveyStats: async () => {
    const response = await api.get('/feedback/surveys/stats/');
    return response.data;
  },
  
  // Survey questions
  getSurveyQuestions: async (surveyId: number) => {
    const response = await api.get(`/feedback/surveys/${surveyId}/questions/`);
    return response.data;
  },
  
  createSurveyQuestion: async (surveyId: number, questionData: any) => {
    const response = await api.post(`/feedback/surveys/${surveyId}/questions/`, questionData);
    return response.data;
  },
  
  updateSurveyQuestion: async (surveyId: number, questionId: number, questionData: any) => {
    const response = await api.put(`/feedback/surveys/${surveyId}/questions/${questionId}/`, questionData);
    return response.data;
  },
  
  deleteSurveyQuestion: async (surveyId: number, questionId: number) => {
    const response = await api.delete(`/feedback/surveys/${surveyId}/questions/${questionId}/`);
    return response.data;
  },
  
  // Survey submissions
  getSurveySubmissions: async (surveyId: number) => {
    const response = await api.get(`/feedback/surveys/${surveyId}/submissions/`);
    return response.data;
  },
  
  getSurveySubmission: async (surveyId: number, submissionId: number) => {
    const response = await api.get(`/feedback/surveys/${surveyId}/submissions/${submissionId}/`);
    return response.data;
  },
  
  createSurveySubmission: async (surveyId: number, submissionData: any) => {
    const response = await api.post(`/feedback/surveys/${surveyId}/submissions/`, submissionData);
    return response.data;
  },
  
  // Public endpoints
  getPublicFeedbacks: async (params?: any) => {
    const response = await api.get('/feedback/public/', { params });
    return response.data;
  },
  
  submitPublicFeedback: async (feedbackData: any) => {
    const response = await api.post('/feedback/submit/', feedbackData);
    return response.data;
  },
};

// Escalation API
export const escalationAPI = {
  // Basic escalation operations
  getEscalations: async (params?: any) => {
    const response = await api.get('/escalation/', { params });
    return response.data;
  },
  
  getEscalation: async (id: number) => {
    const response = await api.get(`/escalation/${id}/`);
    return response.data;
  },
  
  createEscalation: async (escalationData: any) => {
    const response = await api.post('/escalation/', escalationData);
    return response.data;
  },
  
  updateEscalation: async (id: number, escalationData: any) => {
    const response = await api.put(`/escalation/${id}/`, escalationData);
    return response.data;
  },
  
  deleteEscalation: async (id: number) => {
    const response = await api.delete(`/escalation/${id}/`);
    return response.data;
  },
  
  // Escalation statistics
  getEscalationStats: async () => {
    const response = await api.get('/escalation/stats/');
    return response.data;
  },
  
  // Escalation notes
  getEscalationNotes: async (escalationId: number) => {
    const response = await api.get(`/escalation/${escalationId}/notes/`);
    return response.data;
  },
  
  createEscalationNote: async (escalationId: number, noteData: any) => {
    const response = await api.post(`/escalation/${escalationId}/notes/`, noteData);
    return response.data;
  },
  
  // Escalation actions
  assignEscalation: async (id: number, userId: number) => {
    const response = await api.post(`/escalation/${id}/assign/`, { assigned_to: userId });
    return response.data;
  },
  
  changeEscalationStatus: async (id: number, status: string) => {
    const response = await api.post(`/escalation/${id}/change_status/`, { status });
    return response.data;
  },
  

  
  resolveEscalation: async (id: number) => {
    const response = await api.post(`/escalation/${id}/resolve/`);
    return response.data;
  },
  
  closeEscalation: async (id: number) => {
    const response = await api.post(`/escalation/${id}/close/`);
    return response.data;
  },
};

// Support API
export const supportAPI = {
  // Ticket management
  getTickets: async (queryParams = '') => {
    const response = await api.get(`/support/tickets/${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  },

  getTicket: async (ticketId: string) => {
    const response = await api.get(`/support/tickets/${ticketId}/`);
    return response.data;
  },

  createTicket: async (ticketData: any) => {
    const response = await api.post('/support/tickets/', ticketData);
    return response.data;
  },

  updateTicket: async (ticketId: string, ticketData: any) => {
    const response = await api.patch(`/support/tickets/${ticketId}/`, ticketData);
    return response.data;
  },

  // Ticket actions
  assignTicketToMe: async (ticketId: string) => {
    const response = await api.post(`/support/tickets/${ticketId}/assign_to_me/`);
    return response.data;
  },

  resolveTicket: async (ticketId: string) => {
    const response = await api.post(`/support/tickets/${ticketId}/resolve/`);
    return response.data;
  },

  closeTicket: async (ticketId: string) => {
    const response = await api.post(`/support/tickets/${ticketId}/close/`);
    return response.data;
  },

  reopenTicket: async (ticketId: string) => {
    const response = await api.post(`/support/tickets/${ticketId}/reopen/`);
    return response.data;
  },

  // Messages
  getTicketMessages: async (ticketId: string) => {
    const response = await api.get(`/support/messages/?ticket=${ticketId}`);
    return response.data;
  },

  sendMessage: async (messageData: any) => {
    const response = await api.post('/support/messages/', messageData);
    return response.data;
  },

  // Dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/support/tickets/dashboard_stats/');
    return response.data;
  },

  // Notifications
  getNotifications: async () => {
    const response = await api.get('/support/notifications/');
    return response.data;
  },

  markNotificationAsRead: async (notificationId: string) => {
    const response = await api.post(`/support/notifications/${notificationId}/mark_as_read/`);
    return response.data;
  },

  markAllNotificationsAsRead: async () => {
    const response = await api.post('/support/notifications/mark_all_as_read/');
    return response.data;
  },

  // Settings
  getSettings: async () => {
    const response = await api.get('/support/settings/');
    return response.data;
  },

  updateSettings: async (settingsData: any) => {
    const response = await api.patch('/support/settings/', settingsData);
    return response.data;
  }
};

export default api; 