/**
 * Helper para extraer el user_id del token JWT
 * El user_id está en el claim 'sub' del token
 */
export function getUserId(user: any): number | null {
  if (!user) return null;
  
  // Intentar obtener del profile
  if (user.profile?.sub) {
    // El sub puede ser un UUID, necesitamos extraer un número
    // Si el sub es un UUID, podemos usar un hash o simplemente usar el sub como string
    // Por ahora, intentamos parsear si es un número
    const sub = user.profile.sub;
    const numericId = parseInt(sub, 10);
    if (!isNaN(numericId)) {
      return numericId;
    }
    // Si no es un número, intentamos extraer números del UUID
    const numbers = sub.replace(/\D/g, '');
    if (numbers.length > 0) {
      return parseInt(numbers.substring(0, 9), 10) || null;
    }
  }
  
  // Intentar decodificar el token directamente
  try {
    const token = user.access_token || user.accessToken;
    if (token) {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.sub) {
          const numericId = parseInt(payload.sub, 10);
          if (!isNaN(numericId)) {
            return numericId;
          }
          // Si no es un número, extraer números del UUID
          const numbers = payload.sub.replace(/\D/g, '');
          if (numbers.length > 0) {
            return parseInt(numbers.substring(0, 9), 10) || null;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error decoding token:', error);
  }
  
  return null;
}

