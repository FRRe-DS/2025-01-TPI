// AuthService - Servicio para manejar la autenticación
import { API_URL, setToken, removeToken, getToken, setUser, removeUser, getUser } from '../config/apiConfig';

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

    const data = await response.json();
    
    // Si la respuesta no es exitosa, lanzar error con el mensaje del servidor
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Error en login');
    }
    
    // Guardar token y datos del usuario en localStorage
    if (data.token) {
      setToken(data.token);
    }
    
    if (data.user) {
      console.log('💾 Guardando datos del usuario:', data.user);
      setUser(data.user);
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
  removeUser();
};

// Función para verificar si está autenticado
export const isAuthenticated = () => {
  return !!getToken();
};

// Función para obtener el token
export const getAuthToken = () => {
  return getToken();
};

// Función para obtener los datos del usuario desde localStorage
export const getCurrentUser = () => {
  return getUser();
};

// 🚀 Nueva función para cambiar contraseña
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No autenticado (401)");
    }

    const response = await fetch(AUTH_URL + "/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Incluir el status en el error para manejarlo en el modal
      const error = new Error(data.message || "Error al cambiar contraseña");
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error en changePassword:", error);
    throw error;
  }
};

// Exportar todas las funciones como objeto por conveniencia
export default {
  login,
  logout,
  isAuthenticated,
  getAuthToken,
  getCurrentUser,
  changePassword
};

