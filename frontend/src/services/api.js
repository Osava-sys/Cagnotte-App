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

  // Ne pas ajouter Content-Type pour FormData
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Gérer le cas 304 (Not Modified) - réponse vide mais réussie
    if (response.status === 304) {
      return { success: true, data: [] };
    }
    
    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch {
        error = { 
          success: false,
          error: `Erreur serveur (${response.status})` 
        };
      }
      throw error;
    }
    
    // Essayer de parser le JSON, mais gérer le cas où le body est vide
    const text = await response.text();
    if (!text || text.trim() === '') {
      return { success: true, data: [] };
    }
    
    try {
      const data = JSON.parse(text);
      // Normaliser la réponse pour avoir toujours { success, data }
      if (data.success !== undefined) {
        return data;
      }
      // Si la réponse n'a pas de structure { success, data }, la wrapper
      return { success: true, data };
    } catch (parseError) {
      console.error('Erreur parsing JSON:', parseError, 'Text:', text);
      return { success: true, data: [] };
    }
  } catch (error) {
    // Si c'est déjà un objet d'erreur formaté, le renvoyer tel quel
    if (error.error || error.success === false) {
      throw error;
    }
    // Sinon, wrapper l'erreur
    throw { success: false, error: error.message || 'Erreur réseau' };
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

