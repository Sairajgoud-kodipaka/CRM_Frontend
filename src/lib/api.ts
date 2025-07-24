import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jewelry-crm-backend.onrender.com/api';

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
    const response = await api.post('/auth/team-members/', teamMemberData);
    return response.data;
  },
  
  updateTeamMember: async (id: number, teamMemberData: any) => {
    const response = await api.put(`/auth/team-members/${id}/`, teamMemberData);
    return response.data;
  },
  
  deleteTeamMember: async (id: number) => {
    const response = await api.delete(`/auth/team-members/${id}/`);
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
    const response = await api.get('/products/', { params });
    return response.data;
  },
  
  getProduct: async (id: number) => {
    const response = await api.get(`/products/${id}/`);
    return response.data;
  },
  
  createProduct: async (productData: any) => {
    const response = await api.post('/products/', productData);
    return response.data;
  },
  
  updateProduct: async (id: number, productData: any) => {
    const response = await api.put(`/products/${id}/`, productData);
    return response.data;
  },
  
  deleteProduct: async (id: number) => {
    const response = await api.delete(`/products/${id}/`);
    return response.data;
  },
  
  getCategories: async () => {
    const response = await api.get('/products/categories/');
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: async () => {
    const response = await api.get('/analytics/dashboard/');
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
  createAppointment: async (data: any) => {
    const token = localStorage.getItem('access_token');
    return api.post('/clients/appointments/', data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  },
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

export const tasksAPI = {
  getTasks: async () => {
    const token = localStorage.getItem('access_token');
    return api.get('/clients/tasks/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  },
  createTask: async (data: any) => {
    const token = localStorage.getItem('access_token');
    return api.post('/clients/tasks/', data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  }
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

// Onboarding API
export const onboardingAPI = {
  submitOnboarding: async (data: { onboarding_data: any }) => {
    const response = await api.post('/onboarding/submit/', data);
    return response.data;
  },
  
  saveOnboardingProgress: async (onboardingData: any) => {
    const response = await api.post('/onboarding/save-progress/', onboardingData);
    return response.data;
  },
  
  getOnboardingProgress: async (userId: number) => {
    const response = await api.get(`/onboarding/progress/${userId}/`);
    return response.data;
  },
  
  completeOnboarding: async (userId: number, finalData: any) => {
    const response = await api.post(`/onboarding/complete/${userId}/`, finalData);
    return response.data;
  },
  
  getProgress: async () => {
    const response = await api.get('/onboarding/progress/');
    return response.data;
  },
  
  updateProgress: async (data: any) => {
    const response = await api.patch('/onboarding/progress/', data);
    return response.data;
  },
};

export default api; 
