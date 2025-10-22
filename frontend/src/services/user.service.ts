// Servicio para gestionar datos de usuario
const API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3001';

export interface UserProfile {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: {
    id: number;
    phone: string;
    dni: string;
    birthDate: string;
  } | null;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dni?: string;
  birthDate?: string;
}

/**
 * Obtiene el perfil completo del usuario autenticado
 */
export async function getUserProfile(token: string): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/api/auth/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener el perfil del usuario');
  }

  return await response.json();
}

/**
 * Actualiza el perfil del usuario
 */
export async function updateUserProfile(token: string, data: UpdateProfileData): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/api/auth/profile`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Error al actualizar el perfil');
  }

  return await response.json();
}

