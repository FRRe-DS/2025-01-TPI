import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class RefreshTokensService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Crea un nuevo refresh token en la base de datos
   */
  async createRefreshToken(userId: number, token: string, expiresAt: Date): Promise<void> {
    try {
      await this.prisma.token.create({
        data: {
          userId,
          token,
          expiresAt
        }
      });
    } catch (error) {
      console.error('Error creating refresh token:', error);
      throw new Error('Error al crear refresh token');
    }
  }

  /**
   * Verifica si un refresh token es válido
   */
  async isValidRefreshToken(token: string): Promise<boolean> {
    try {
      const tokenRecord = await this.prisma.token.findUnique({
        where: { token },
        include: { user: true }
      });

      if (!tokenRecord) {
        return false;
      }

      // Verificar si el token ha expirado
      if (tokenRecord.expiresAt < new Date()) {
        // Eliminar el token expirado
        await this.deleteRefreshToken(token);
        return false;
      }

      // Verificar si el usuario está activo
      if (!tokenRecord.user.isActive) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating refresh token:', error);
      return false;
    }
  }

  /**
   * Obtiene el usuario asociado a un refresh token
   */
  async getUserFromRefreshToken(token: string): Promise<any> {
    try {
      const tokenRecord = await this.prisma.token.findUnique({
        where: { token },
        include: { user: true }
      });

      if (!tokenRecord) {
        return null;
      }

      return tokenRecord.user;
    } catch (error) {
      console.error('Error getting user from refresh token:', error);
      return null;
    }
  }

  /**
   * Elimina un refresh token específico
   */
  async deleteRefreshToken(token: string): Promise<void> {
    try {
      await this.prisma.token.delete({
        where: { token }
      });
    } catch (error) {
      console.error('Error deleting refresh token:', error);
    }
  }

  /**
   * Elimina todos los refresh tokens de un usuario
   */
  async deleteAllUserRefreshTokens(userId: number): Promise<void> {
    try {
      await this.prisma.token.deleteMany({
        where: { userId }
      });
    } catch (error) {
      console.error('Error deleting user refresh tokens:', error);
    }
  }

  /**
   * Limpia tokens expirados
   */
  async cleanupExpiredTokens(): Promise<void> {
    try {
      await this.prisma.token.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
    }
  }

  /**
   * Cierra la conexión de Prisma
   */
  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}