import api from './api';

export const authService = {
  register: (userData) => {
    return api.post('/auth/register', userData);
  },
  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },
  getMe: () => {
    return api.get('/auth/me');
  },
  updatePreferences: (preferences) => {
    return api.put('/auth/preferences', { preferences });
  }
};
