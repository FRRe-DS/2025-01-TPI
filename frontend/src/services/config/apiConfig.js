// URL base del backend
export const API_URL = 'https://p01--backend--vtq7dc7r2j7w.code.run/api';

// Funciones para manejar el token
export const getToken = () => {
  return localStorage.getItem('token');
};

export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const removeToken = () => {
  localStorage.removeItem('token');
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

export default API_URL;
