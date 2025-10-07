import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
const API_URL = `${BASE}/api`;

const authService = {
  async register(userData) {
    const config = {
      headers: {
        'Content-Type': userData instanceof FormData ? 'multipart/form-data' : 'application/json'
      }
    };
    const response = await axios.post(`${API_URL}/auth/register`, userData, config);
    return response.data;
  },

  async login(credentials) {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  async verifyOTP(userId, code) {
    const response = await axios.post(`${API_URL}/auth/verify-otp`, { userId, code });
    return response.data;
  },

  async resendOTP(userId) {
    const response = await axios.post(`${API_URL}/auth/resend-otp`, { userId });
    return response.data;
  },

  logout() {
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }
};

export default authService;
