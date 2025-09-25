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

export default API_URL;
