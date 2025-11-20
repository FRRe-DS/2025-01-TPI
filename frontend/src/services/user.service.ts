// Servicio para gestionar datos de usuario con Keycloak
const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8081';

export interface UserProfile {
  success: boolean;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    enabled: boolean;
    createdTimestamp: number;
    phone: string;
    dni: string;
    birthDate: string;
  };
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dni?: string;
  birthDate?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    enabled: boolean;
  };
}

/**
 * Obtiene el perfil completo del usuario autenticado desde Keycloak
 */
export async function getUserProfile(token: string): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/api/user/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al obtener el perfil del usuario');
  }

  return await response.json();
}

/**
 * Actualiza el perfil del usuario en Keycloak
 */
export async function updateUserProfile(token: string, data: UpdateProfileData): Promise<UpdateProfileResponse> {
  const response = await fetch(`${API_URL}/api/user/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al actualizar el perfil');
  }

  return await response.json();
}

