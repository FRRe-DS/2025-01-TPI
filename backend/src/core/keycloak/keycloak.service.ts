import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class KeycloakService {
  private readonly keycloakIssuer: string;
  private readonly keycloakUrl: string;
  private readonly realm: string;
  private readonly adminUsername = process.env.KEYCLOAK_ADMIN_USER || 'admin';
  private readonly adminPassword = process.env.KEYCLOAK_ADMIN_PASSWORD || 'ds2025';

  constructor() {
    // Priorizar KEYCLOAK_ISSUER, pero mantener compatibilidad con KEYCLOAK_URL + KEYCLOAK_REALM
    const issuer = process.env.KEYCLOAK_ISSUER;
    
    if (issuer) {
      // Extraer URL base y realm desde el issuer
      // Ejemplo: http://localhost:8080/realms/ds-2025-realm
      const issuerMatch = issuer.match(/^(https?:\/\/[^\/]+)\/realms\/([^\/]+)$/);
      if (issuerMatch) {
        this.keycloakIssuer = issuer;
        this.keycloakUrl = issuerMatch[1];
        this.realm = issuerMatch[2];
      } else {
        // Si el formato no es el esperado, usar valores por defecto
        this.keycloakIssuer = issuer;
        this.keycloakUrl = process.env.KEYCLOAK_URL || 'http://localhost:8080';
        this.realm = process.env.KEYCLOAK_REALM || 'ds-2025-realm';
      }
    } else {
      // Fallback a variables antiguas
      this.keycloakUrl = process.env.KEYCLOAK_URL || 'http://localhost:8080';
      this.realm = process.env.KEYCLOAK_REALM || 'ds-2025-realm';
      this.keycloakIssuer = `${this.keycloakUrl}/realms/${this.realm}`;
    }
  }

  private async getAdminToken(): Promise<string> {
    try {
      const response = await axios.post(
        `${this.keycloakUrl}/realms/master/protocol/openid-connect/token`,
        new URLSearchParams({
          username: this.adminUsername,
          password: this.adminPassword,
          grant_type: 'password',
          client_id: 'admin-cli',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error('Error obteniendo token de admin:', error);
      throw new Error('No se pudo autenticar con Keycloak admin');
    }
  }

  async validateToken(token: string): Promise<any> {
    try {
      // Validar el token usando el endpoint de userinfo
      const response = await axios.get(
        `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error validando token:', error.response?.data || error.message);
      return null;
    }
  }

  async getUserById(userId: string): Promise<any> {
    try {
      const adminToken = await this.getAdminToken();
      
      const response = await axios.get(
        `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      throw new Error('No se pudo obtener el usuario de Keycloak');
    }
  }

  async updateUser(userId: string, userData: any): Promise<any> {
    try {
      const adminToken = await this.getAdminToken();
      
      const response = await axios.put(
        `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw new Error('No se pudo actualizar el usuario en Keycloak');
    }
  }

  async getUserByToken(token: string): Promise<any> {
    try {
      // Decodificar el token JWT para obtener el userId
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      
      // Verificar que el token no haya expirado
      if (payload.exp && payload.exp < Date.now() / 1000) {
        return null;
      }

      // Obtener el ID del usuario desde el token
      const userId = payload.sub;
      if (!userId) {
        return null;
      }

      // Usar credenciales admin para obtener datos completos del usuario
      return await this.getUserById(userId);
    } catch (error) {
      console.error('Error obteniendo usuario por token:', error);
      return null;
    }
  }
}
