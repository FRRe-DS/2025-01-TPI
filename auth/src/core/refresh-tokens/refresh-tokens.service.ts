import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class RefreshTokensService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async saveRefreshToken(userId: number, refreshToken: string): Promise<void> {
    try {
      // Calcular fecha de expiración (7 días)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Eliminar refresh tokens expirados del usuario
      await this.prisma.token.deleteMany({
        where: {
          userId: userId,
          expiresAt: { lt: new Date() }
        }
      });

      // Guardar nuevo refresh token
      await this.prisma.token.create({
        data: {
          token: refreshToken,
          userId: userId,
          expiresAt: expiresAt
        }
      });

      console.log('✅ Refresh token guardado para usuario:', userId);
    } catch (error) {
      console.error('❌ Error al guardar refresh token:', error);
      throw error;
    }
  }

  async validateRefreshToken(refreshToken: string): Promise<{ userId: number; isValid: boolean }> {
    try {
      const tokenRecord = await this.prisma.token.findUnique({
        where: { token: refreshToken },
        include: { user: true }
      });

      if (!tokenRecord) {
        return { userId: 0, isValid: false };
      }

      // Verificar que el token no haya expirado
      if (tokenRecord.expiresAt < new Date()) {
        // Eliminar token expirado
        await this.prisma.token.delete({
          where: { id: tokenRecord.id }
        });
        return { userId: 0, isValid: false };
      }

      // Verificar que el usuario esté activo
      if (!tokenRecord.user.isActive) {
        return { userId: 0, isValid: false };
      }

      return { userId: tokenRecord.userId, isValid: true };
    } catch (error) {
      console.error('❌ Error al validar refresh token:', error);
      return { userId: 0, isValid: false };
    }
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
      await this.prisma.token.deleteMany({
        where: { token: refreshToken }
      });
      console.log('✅ Refresh token revocado');
    } catch (error) {
      console.error('❌ Error al revocar refresh token:', error);
      throw error;
    }
  }

  async revokeAllUserTokens(userId: number): Promise<void> {
    try {
      await this.prisma.token.deleteMany({
        where: { userId: userId }
      });
      console.log('✅ Todos los refresh tokens del usuario revocados:', userId);
    } catch (error) {
      console.error('❌ Error al revocar todos los tokens del usuario:', error);
      throw error;
    }
  }

  async cleanupExpiredTokens(): Promise<void> {
    try {
      const result = await this.prisma.token.deleteMany({
        where: {
          expiresAt: { lt: new Date() }
        }
      });
      console.log('🧹 Tokens expirados eliminados:', result.count);
    } catch (error) {
      console.error('❌ Error al limpiar tokens expirados:', error);
      throw error;
    }
  }
}
