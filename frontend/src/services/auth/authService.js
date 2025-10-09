// AuthService - Servicio para manejar la autenticación
import { API_URL, AUTH_URL, setToken, removeToken, getToken, getRefreshToken, setUser, removeUser, getUser } from '../config/apiConfig';

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
    
    // Guardar tokens y datos del usuario en localStorage
    if (data.access_token && data.refresh_token) {
      setToken(data.access_token, data.refresh_token);
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

// 🚀 Función para cambiar contraseña
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

    // Si el cambio fue exitoso, limpiar tokens (fueron revocados)
    if (data.success) {
      removeToken();
      removeUser();
    }

    return data;
  } catch (error) {
    console.error("Error en changePassword:", error);
    throw error;
  }
};

// 🆕 Función para refrescar token
export const refreshToken = async () => {
  try {
    const refreshTokenValue = getRefreshToken();
    if (!refreshTokenValue) {
      throw new Error("No refresh token disponible");
    }

    const response = await fetch(AUTH_URL + "/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshTokenValue }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al refrescar token");
    }

    // Guardar nuevos tokens
    if (data.access_token && data.refresh_token) {
      setToken(data.access_token, data.refresh_token);
    }

    return data;
  } catch (error) {
    console.error("Error en refreshToken:", error);
    // Si falla el refresh, limpiar todo
    removeToken();
    removeUser();
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
  changePassword,
  refreshToken
};

