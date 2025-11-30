import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CartItemDto, UpdateCartDto } from '../dto/cart.dto';

const prisma = new PrismaClient();

@Injectable()
export class CartService {
  
  /**
   * Obtiene el carrito del usuario
   * @param userId UUID del usuario de Keycloak
   * @returns Array de items del carrito
   */
  async getCart(userId: string): Promise<CartItemDto[]> {
    try {
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        select: {
          productId: true,
          quantity: true,
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));
    } catch (error) {
      console.error('Error getting cart:', error);
      throw new InternalServerErrorException('Error al obtener el carrito');
    }
  }

  /**
   * Actualiza el carrito del usuario
   * Reemplaza completamente el carrito anterior con los nuevos items.
   * Si se envía un array vacío, el carrito quedará vacío.
   * @param userId UUID del usuario de Keycloak
   * @param updateCartDto Array de items a actualizar (puede estar vacío para vaciar el carrito)
   * @returns Array de items del carrito actualizado
   */
  async updateCart(userId: string, updateCartDto: UpdateCartDto): Promise<CartItemDto[]> {
    try {
      // Validar que todos los items tengan cantidad > 0
      const invalidItems = updateCartDto.items.filter(item => item.quantity <= 0);
      if (invalidItems.length > 0) {
        throw new BadRequestException('La cantidad debe ser mayor a 0');
      }

      // Validar que no haya productos duplicados en el request
      const productIds = updateCartDto.items.map(item => item.productId);
      const uniqueProductIds = new Set(productIds);
      if (productIds.length !== uniqueProductIds.size) {
        throw new BadRequestException('No se pueden tener productos duplicados en el carrito');
      }

      // Usar transacción para asegurar consistencia
      const result = await prisma.$transaction(async (tx) => {
        // Eliminar todos los items actuales del usuario
        await tx.cartItem.deleteMany({
          where: { userId }
        });

        // Crear los nuevos items
        if (updateCartDto.items.length > 0) {
          await tx.cartItem.createMany({
            data: updateCartDto.items.map(item => ({
              userId,
              productId: item.productId,
              quantity: item.quantity
            }))
          });
        }

        // Retornar los items actualizados
        const updatedItems = await tx.cartItem.findMany({
          where: { userId },
          select: {
            productId: true,
            quantity: true,
          },
          orderBy: {
            createdAt: 'asc'
          }
        });

        return updatedItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }));
      });

      return result;
    } catch (error) {
      console.error('Error updating cart:', error);
      // Si ya es una excepción de NestJS, relanzarla
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el carrito');
    }
  }

  /**
   * Limpia el carrito del usuario (elimina todos los items)
   * @param userId UUID del usuario de Keycloak
   */
  async clearCart(userId: string): Promise<void> {
    try {
      await prisma.cartItem.deleteMany({
        where: { userId }
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw new InternalServerErrorException('Error al limpiar el carrito');
    }
  }
}

