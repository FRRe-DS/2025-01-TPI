// AuthService - Servicio para manejar la autenticación
import { API_URL, setToken, removeToken, getToken } from '../config/apiConfig';

const AUTH_URL = API_URL + '/auth';

// Función para realizar login
export const login = async (email, password) => {
  try {
    const response = await fetch(AUTH_URL + '/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Error en login');
    }

    const data = await response.json();
    
    // Guardar token en localStorage
    if (data.token) {
      setToken(data.token);
    }

    return data;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

// Función para logout
export const logout = () => {
  removeToken();
};

// Función para verificar si está autenticado
export const isAuthenticated = () => {
  return !!getToken();
};

// Función para obtener el token
export const getAuthToken = () => {
  return getToken();
};

// Obtener el usuario autenticado (perfil actual)
export const getCurrentUser = async () => {
  const token = getToken();
  if (!token) {
    throw new Error('No autenticado');
  }

  const response = await fetch(API_URL + '/users/me', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('No se pudo obtener el perfil');
  }

  return response.json();
};

// Exportar todas las funciones como objeto por conveniencia
export default {
  login,
  logout,
  isAuthenticated,
  getAuthToken,
  getCurrentUser
};