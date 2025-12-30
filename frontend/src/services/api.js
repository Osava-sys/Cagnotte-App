const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// API request helper
const request = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    ...options
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erreur serveur' }));
      throw error;
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// API methods
export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  
  post: (endpoint, data) => 
    request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  
  put: (endpoint, data) => 
    request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  
  delete: (endpoint) => 
    request(endpoint, { method: 'DELETE' })
};

// Auth methods
export const auth = {
  login: async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },
  
  register: async (userData) => {
    const data = await api.post('/auth/register', userData);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

