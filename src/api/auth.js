import axiosInstance from '../utils/axios';

export const authApi = {
  registerAirlineUser: async (airlineId, userData) => {
    const response = await axiosInstance.post(`/auth/airlines/${airlineId}/register-user`, userData);
    return response.data;
  },

  loginAirlineUser: async (airlineId, credentials) => {
    const response = await axiosInstance.post(`/auth/airlines/${airlineId}/login`, credentials);
    return response.data;
  },

  registerAdmin: async (adminData) => {
    const response = await axiosInstance.post('/auth/register-admin', adminData);
    return response.data;
  },

  registerExecutive: async (executiveData) => {
    const response = await axiosInstance.post('/auth/register-executive', executiveData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/get-current-loggedin-user');
    return response.data;
  },

  resetPassword: async (data) => {
    const response = await axiosInstance.post('/auth/reset-password', data);
    return response.data;
  },

  forgotPassword: async (data) => {
    const response = await axiosInstance.post('/auth/forgot-password', data);
    return response.data;
  },

  confirmEmail: async (email, token) => {
    const response = await axiosInstance.get('/auth/confirm-email', {
      params: { email, token }
    });
    return response.data;
  },

  changePassword: async (data) => {
    const response = await axiosInstance.post('/auth/change-password', data);
    return response.data;
  }
};

export default authApi;
