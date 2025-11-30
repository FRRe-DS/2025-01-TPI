import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto, OrderResponseDto, OrdersListResponseDto } from '../dto/orders.dto';
import { JwtAuthGuard } from '../../../core/keycloak/jwt-auth.guard';

@ApiTags('orders')
@Controller('api/orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('Authorization')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Crear una nueva orden',
    description: 'Crea una nueva orden con los productos del carrito. Al crear la orden, el carrito del usuario se limpia automáticamente.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Orden creada exitosamente',
    type: OrderResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos - la orden debe contener al menos un producto'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token inválido o faltante'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor'
  })
  async createOrder(
    @Request() req,
    @Body() createOrderDto: CreateOrderDto
  ): Promise<OrderResponseDto> {
    const userId = req.user.userId;
    
    if (!userId) {
      throw new Error('Usuario no identificado');
    }

    const order = await this.ordersService.createOrder(userId, createOrderDto);
    
    return order;
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obtener todas las órdenes del usuario',
    description: 'Obtiene todas las órdenes del usuario autenticado, ordenadas por fecha de creación (más recientes primero).'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de órdenes del usuario',
    type: OrdersListResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token inválido o faltante'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor'
  })
  async getUserOrders(@Request() req): Promise<OrdersListResponseDto> {
    const userId = req.user.userId;
    
    if (!userId) {
      throw new Error('Usuario no identificado');
    }

    const orders = await this.ordersService.getUserOrders(userId);
    
    return {
      orders,
      total: orders.length
    };
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener una orden por ID',
    description: 'Obtiene los detalles de una orden específica por su ID. Solo se pueden obtener órdenes del usuario autenticado.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden (orderId)',
    type: String,
    example: '1704067200000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Detalles de la orden',
    type: OrderResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Orden no encontrada'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token inválido o faltante'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor'
  })
  async getOrderById(
    @Request() req,
    @Param('id') orderId: string
  ): Promise<OrderResponseDto> {
    const userId = req.user.userId;
    
    if (!userId) {
      throw new Error('Usuario no identificado');
    }

    const order = await this.ordersService.getOrderById(userId, orderId);
    
    return order;
  }
}

