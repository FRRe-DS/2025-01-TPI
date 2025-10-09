import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  private readonly secretKey: string;

  constructor() {
    this.secretKey = process.env.SECRET_KEY || 'default-secret-key';
  }

  /**
   * Genera un access token JWT
   */
  generateAccessToken(payload: any): string {
    return jwt.sign(payload, this.secretKey, {
      expiresIn: '15m', // 15 minutos
      algorithm: 'HS256'
    });
  }

  /**
   * Genera un refresh token JWT
   */
  generateRefreshToken(payload: any): string {
    return jwt.sign(payload, this.secretKey, {
      expiresIn: '7d', // 7 días
      algorithm: 'HS256'
    });
  }

  /**
   * Verifica y decodifica un token JWT
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.secretKey);
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  /**
   * Decodifica un token sin verificar (útil para obtener datos)
   */
  decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * Verifica si un token está próximo a expirar
   */
  isTokenExpiringSoon(token: string, minutesThreshold: number = 5): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return true;
      }

      const expirationTime = decoded.exp * 1000; // Convertir a milisegundos
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;
      const thresholdMs = minutesThreshold * 60 * 1000;

      return timeUntilExpiration <= thresholdMs;
    } catch (error) {
      return true;
    }
  }
}
