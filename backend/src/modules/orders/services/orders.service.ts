import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateOrderDto, OrderResponseDto, OrderItemDto } from '../dto/orders.dto';

const prisma = new PrismaClient();

@Injectable()
export class OrdersService {

  /**
   * Crea una nueva orden y limpia el carrito del usuario
   * @param userId UUID del usuario de Keycloak
   * @param createOrderDto Datos de la orden
   * @returns Orden creada
   */
  async createOrder(userId: string, createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    try {
      // Validar que haya productos
      if (!createOrderDto.products || createOrderDto.products.length === 0) {
        throw new BadRequestException('La orden debe contener al menos un producto');
      }

      // Validar que no haya productos duplicados
      const productIds = createOrderDto.products.map(p => p.id);
      const uniqueProductIds = new Set(productIds);
      if (productIds.length !== uniqueProductIds.size) {
        throw new BadRequestException('No se pueden tener productos duplicados en la orden');
      }

      // Calcular total de productos
      const productsTotal = createOrderDto.products.reduce(
        (sum, product) => sum + (product.price * product.quantity),
        0
      );

      // Calcular total de la orden (productos + envío)
      const shippingCost = createOrderDto.shippingCost || 0;
      const totalAmount = productsTotal + shippingCost;

      // Generar orderId único (usando timestamp)
      const orderId = Date.now();

      // Usar transacción para crear la orden y limpiar el carrito
      const order = await prisma.$transaction(async (tx) => {
        // Crear la orden
        // Convertir a objetos planos para Prisma JSON fields
        const deliveryAddressPlain = {
          street: createOrderDto.deliveryAddress.street,
          city: createOrderDto.deliveryAddress.city,
          state: createOrderDto.deliveryAddress.state,
          postal_code: createOrderDto.deliveryAddress.postal_code,
          country: createOrderDto.deliveryAddress.country
        };
        
        const productsPlain = createOrderDto.products.map(p => ({
          id: p.id,
          quantity: p.quantity,
          price: p.price
        }));
        
        const newOrder = await tx.order.create({
          data: {
            userId,
            orderId,
            shippingId: createOrderDto.shippingId || null,
            status: 'pending',
            transportType: createOrderDto.transportType || null,
            shippingCost: createOrderDto.shippingCost ? createOrderDto.shippingCost : null,
            deliveryAddress: deliveryAddressPlain as any,
            products: productsPlain as any,
            totalAmount
          }
        });

        // Limpiar el carrito del usuario
        await tx.cartItem.deleteMany({
          where: { userId }
        });

        return newOrder;
      });

      return this.mapToOrderResponseDto(order);
    } catch (error) {
      console.error('Error creating order:', error);
      // Si ya es una excepción de NestJS, relanzarla
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear la orden');
    }
  }

  /**
   * Obtiene una orden por ID
   * @param userId UUID del usuario de Keycloak
   * @param orderId ID de la orden (como string, se convierte a BigInt)
   * @returns Orden encontrada
   */
  async getOrderById(userId: string, orderId: string): Promise<OrderResponseDto> {
    try {
      const orderIdBigInt = BigInt(orderId);
      const order = await prisma.order.findFirst({
        where: {
          orderId: orderIdBigInt,
          userId // Asegurar que la orden pertenece al usuario
        }
      });

      if (!order) {
        throw new NotFoundException(`Orden con ID ${orderId} no encontrada`);
      }

      return this.mapToOrderResponseDto(order);
    } catch (error) {
      console.error('Error getting order:', error);
      // Si ya es una excepción de NestJS, relanzarla
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener la orden');
    }
  }

  /**
   * Obtiene todas las órdenes del usuario
   * @param userId UUID del usuario de Keycloak
   * @returns Lista de órdenes del usuario
   */
  async getUserOrders(userId: string): Promise<OrderResponseDto[]> {
    try {
      const orders = await prisma.order.findMany({
        where: { userId },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return orders.map(order => this.mapToOrderResponseDto(order));
    } catch (error) {
      console.error('Error getting user orders:', error);
      throw new InternalServerErrorException('Error al obtener las órdenes');
    }
  }

  /**
   * Mapea un modelo Order de Prisma a OrderResponseDto
   */
  private mapToOrderResponseDto(order: any): OrderResponseDto {
    return {
      id: order.id,
      orderId: order.orderId.toString(), // Convertir BigInt a string para JSON
      shippingId: order.shippingId || undefined,
      status: order.status,
      transportType: order.transportType || undefined,
      shippingCost: order.shippingCost ? Number(order.shippingCost) : undefined,
      deliveryAddress: order.deliveryAddress as any,
      products: (order.products as any[]).map((p: any) => ({
        productId: p.id,
        quantity: p.quantity,
        price: p.price
      })),
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    };
  }
}

