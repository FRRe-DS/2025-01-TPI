/**
 * Helper para extraer el access token del usuario
 * Compatible con react-oidc-context y similar a STOCK
 */
export function getAccessToken(user: any): string | null {
  return user?.access_token || user?.accessToken || null;
}

