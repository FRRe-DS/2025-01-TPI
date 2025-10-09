import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from '../dto/register.dto';
import { ChangePasswordDto } from '../dto/changePassword.dto';
import { JwtService } from '../../../core/jwt/jwt.service';
import { RefreshTokensService } from '../../../core/refresh-tokens/refresh-tokens.service';

@Injectable()
export class AuthService {
  private prisma: PrismaClient;

  constructor(
    private jwtService: JwtService,
    private refreshTokensService: RefreshTokensService
  ) {
    this.prisma = new PrismaClient();
  }

  async login(email: string, password: string) {
    try {
      console.log('🔍 Iniciando proceso de login para:', email);
      
      // Verificar conexión a la base de datos
      try {
        await this.prisma.$connect();
        console.log('✅ Conexión a la base de datos establecida');
      } catch (dbError) {
        console.error('❌ Error de conexión a la base de datos:', dbError);
        throw dbError;
      }

      // Buscar usuario por email
      console.log('🔍 Buscando usuario con email:', email);
      const user = await this.prisma.auth.findUnique({
        where: { email: email }
      });
      console.log('👤 Usuario encontrado:', user ? 'Sí' : 'No');

      if (!user) {
        throw {
          error: 'Credenciales incorrectas',
          code: 'INVALID_CREDENTIALS'
        };
      }

      // Verificar password
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        throw {
          error: 'Credenciales incorrectas',
          code: 'INVALID_CREDENTIALS'
        };
      }

      // Verificar que el usuario esté activo
      if (!user.isActive) {
        throw {
          error: 'Credenciales incorrectas',
          code: 'INVALID_CREDENTIALS'
        };
      }

      // Generar tokens JWT
      console.log('🔑 Generando tokens JWT...');
      const accessToken = this.jwtService.generateAccessToken({ userId: user.id });
      const refreshToken = this.jwtService.generateRefreshToken({ userId: user.id });
      
      console.log('🔑 Access token generado (longitud):', accessToken.length);
      console.log('🔑 Refresh token generado (longitud):', refreshToken.length);

      // Guardar refresh token en la base de datos
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 días
      await this.refreshTokensService.createRefreshToken(user.id, refreshToken, expiresAt);

      // Login exitoso - devolver tokens y datos del usuario
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };

    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  }

  async register(registerData: RegisterDto) {
    try {
      // Validar que las contraseñas coincidan
      if (registerData.password !== registerData.repeatPassword) {
        throw {
          error: "Las contraseñas no coinciden",
          code: "PASSWORD_MISMATCH"
        };
      }

      // Verificar si el email ya existe
      const existingUser = await this.prisma.auth.findUnique({
        where: { email: registerData.email }
      });

      if (existingUser) {
        throw {
          error: "El email ya está registrado",
          code: "EMAIL_ALREADY_EXISTS"
        };
      }

      // Crear nuevo usuario
      const hashedPassword = await bcrypt.hash(registerData.password, 10);

      await this.prisma.auth.create({
        data: {
          email: registerData.email,
          password: hashedPassword,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          isActive: true
        }
      });

      // Usuario creado exitosamente
      return {
        message: "Usuario registrado exitosamente"
      };

    } catch (error) {
      console.error('❌ Error en registro:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      console.log('🔄 Procesando refresh token...');

      // Validar refresh token en la base de datos
      const isValid = await this.refreshTokensService.isValidRefreshToken(refreshToken);
      
      if (!isValid) {
        throw {
          error: 'Refresh token inválido o expirado',
          code: 'INVALID_REFRESH_TOKEN'
        };
      }

      // Obtener datos del usuario desde el token
      const user = await this.refreshTokensService.getUserFromRefreshToken(refreshToken);

      if (!user || !user.isActive) {
        throw {
          error: 'Usuario no encontrado o inactivo',
          code: 'USER_NOT_FOUND'
        };
      }

      // Generar nuevos tokens
      const newAccessToken = this.jwtService.generateAccessToken({ userId: user.id });
      const newRefreshToken = this.jwtService.generateRefreshToken({ userId: user.id });

      // Revocar el refresh token anterior y guardar el nuevo
      await this.refreshTokensService.deleteRefreshToken(refreshToken);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 días
      await this.refreshTokensService.createRefreshToken(user.id, newRefreshToken, expiresAt);

      console.log('✅ Tokens renovados exitosamente');

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken
      };

    } catch (error) {
      console.error('❌ Error en refresh token:', error);
      throw error;
    }
  }

  async changePassword(changePasswordData: ChangePasswordDto, userId: number) {
    try {
      // Obtener usuario
      const user = await this.prisma.auth.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw {
          success: false,
          message: 'Usuario no encontrado',
          user: null
        };
      }

      // Verificar que el usuario esté activo
      if (!user.isActive) {
        throw {
          success: false,
          message: 'Usuario inactivo',
          user: null
        };
      }

      // Verificar password actual
      const passwordMatch = await bcrypt.compare(changePasswordData.currentPassword, user.password);
      if (!passwordMatch) {
        throw {
          success: false,
          message: 'Password actual incorrecto',
          user: null
        };
      }

      // Actualizar la contraseña
      const hashedPassword = await bcrypt.hash(changePasswordData.newPassword, 10);

      await this.prisma.auth.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          updatedAt: new Date()
        }
      });

      // Revocar todos los refresh tokens del usuario (forzar re-login)
      await this.refreshTokensService.deleteAllUserRefreshTokens(userId);

      // Contraseña cambiada exitosamente
      return {
        success: true,
        message: 'Contraseña cambiada exitosamente. Todos los tokens han sido revocados.',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: new Date()
        }
      };

    } catch (error) {
      console.error('❌ Error en cambio de contraseña:', error);
      throw error;
    }
  }


  getPublicKey(): string {
    // Para JWT con clave secreta, no hay clave pública
    // Esto es para compatibilidad con el controller
    return 'JWT con clave secreta - no requiere clave pública';
  }
}