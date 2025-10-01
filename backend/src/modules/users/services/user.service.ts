import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UserProfileCreateDto } from '../dto/userProfile.dto';

const prisma = new PrismaClient();

@Injectable()
export class UserService {
  
  // Obtener perfil del usuario
  async getUserProfile(userId: number) {
    try {
      const profile = await prisma.userProfile.findUnique({
        where: { userId: userId }
      });

      if (!profile) {
        return {
          error: 'Perfil no encontrado',
          code: 'PROFILE_NOT_FOUND'
        };
      }

      return profile;
    } catch (error) {
      return {
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      };
    }
  }

  // Crear perfil del usuario
  async createUserProfile(userId: number, profileData: UserProfileCreateDto) {
    try {
      // Verificar si ya existe un perfil
      const existingProfile = await prisma.userProfile.findUnique({
        where: { userId: userId }
      });

      if (existingProfile) {
        return {
          error: 'El perfil ya existe',
          code: 'PROFILE_ALREADY_EXISTS'
        };
      }

      // Crear nuevo perfil
      const newProfile = await prisma.userProfile.create({
        data: {
          userId: userId,
          phone: profileData.phone,
          dni: profileData.dni,
          birthDate: new Date(profileData.birthDate)
        }
      });

      return {
        message: 'Perfil creado exitosamente',
        profile: newProfile
      };
    } catch (error) {
      return {
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      };
    }
  }

  // Actualizar perfil del usuario
  async updateUserProfile(userId: number, profileData: UserProfileCreateDto) {
    try {
      // Verificar si existe el perfil
      const existingProfile = await prisma.userProfile.findUnique({
        where: { userId: userId }
      });

      if (!existingProfile) {
        return {
          error: 'Perfil no encontrado',
          code: 'PROFILE_NOT_FOUND'
        };
      }

      // Actualizar perfil
      const updatedProfile = await prisma.userProfile.update({
        where: { userId: userId },
        data: {
          phone: profileData.phone,
          dni: profileData.dni,
          birthDate: new Date(profileData.birthDate)
        }
      });

      return {
        message: 'Perfil actualizado exitosamente',
        profile: updatedProfile
      };
    } catch (error) {
      return {
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      };
    }
  }
}
