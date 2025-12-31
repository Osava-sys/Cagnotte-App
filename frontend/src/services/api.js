const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Événements pour la gestion globale des erreurs
const apiEvents = {
  listeners: {},
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  },
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  },
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
};

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Vérifier si le token est expiré (décodage basique JWT)
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Ajouter une marge de 60 secondes
    return payload.exp * 1000 < Date.now() - 60000;
  } catch {
    return true;
  }
};

// API request helper
const request = async (endpoint, options = {}) => {
  const token = getToken();

  // Vérifier si le token est expiré avant de faire la requête
  if (token && isTokenExpired(token)) {
    auth.logout();
    apiEvents.emit('SESSION_EXPIRED', { message: 'Votre session a expiré. Veuillez vous reconnecter.' });
    throw { success: false, error: 'Session expirée', code: 'SESSION_EXPIRED' };
  }

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

    // Gérer les erreurs d'authentification
    if (response.status === 401) {
      auth.logout();
      apiEvents.emit('UNAUTHORIZED', {
        message: 'Votre session a expiré ou vous n\'êtes pas autorisé.',
        endpoint
      });
      throw {
        success: false,
        error: 'Non autorisé. Veuillez vous reconnecter.',
        code: 'UNAUTHORIZED'
      };
    }

    // Gérer les erreurs d'accès interdit
    if (response.status === 403) {
      apiEvents.emit('FORBIDDEN', {
        message: 'Vous n\'avez pas les droits pour effectuer cette action.',
        endpoint
      });
      throw {
        success: false,
        error: 'Accès refusé.',
        code: 'FORBIDDEN'
      };
    }

    // Gérer les erreurs serveur
    if (response.status >= 500) {
      apiEvents.emit('SERVER_ERROR', {
        message: 'Le serveur a rencontré une erreur. Veuillez réessayer.',
        status: response.status,
        endpoint
      });
      throw {
        success: false,
        error: 'Erreur serveur. Veuillez réessayer plus tard.',
        code: 'SERVER_ERROR'
      };
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
    // Gérer les erreurs réseau
    if (error instanceof TypeError && error.message.includes('fetch')) {
      apiEvents.emit('NETWORK_ERROR', {
        message: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.'
      });
      throw {
        success: false,
        error: 'Erreur de connexion. Vérifiez votre connexion internet.',
        code: 'NETWORK_ERROR'
      };
    }

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
    request(endpoint, { method: 'DELETE' }),

  // Accès aux événements pour écouter les erreurs globales
  events: apiEvents
};

// Export direct des événements API
export { apiEvents };

// Auth methods
export const auth = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const data = response.data || response;
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    const data = response.data || response;
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
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    const token = getToken();
    if (!token) return false;
    // Vérifier si le token n'est pas expiré
    return !isTokenExpired(token);
  },

  // Rafraîchir les données utilisateur depuis le serveur
  refreshUser: async () => {
    try {
      const response = await api.get('/auth/me');
      const data = response.data || response;
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        return data.user;
      }
      return null;
    } catch {
      return null;
    }
  }
};
