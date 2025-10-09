// URLs base de los servicios
const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';
const AUTH_BASE = import.meta.env.VITE_AUTH_BASE_URL?.replace(/\/$/, '') || '';

export const API_URL = API_BASE + '/api';
export const AUTH_URL = AUTH_BASE + '/api/auth';

// Funciones para manejar el token
export const getToken = () => {
  return localStorage.getItem('access_token');
};

export const getRefreshToken = () => {
  return localStorage.getItem('refresh_token');
};

export const setToken = (accessToken, refreshToken) => {
  localStorage.setItem('access_token', accessToken);
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  }
};

export const removeToken = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// Funciones para manejar los datos del usuario
export const getUser = () => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const removeUser = () => {
  localStorage.removeItem('user');
};

export default { API_URL, AUTH_URL };
