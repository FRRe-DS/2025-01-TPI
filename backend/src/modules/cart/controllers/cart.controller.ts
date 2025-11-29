import { Controller, Get, Put, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from '../services/cart.service';
import { UpdateCartDto, CartResponseDto } from '../dto/cart.dto';
import { JwtAuthGuard, RequireScopes } from '../../../core/keycloak/jwt-auth.guard';

@ApiTags('cart')
@Controller('api/cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('Authorization')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Obtener carrito del usuario',
    description: 'Obtiene todos los productos en el carrito del usuario autenticado. El carrito se mantiene en la base de datos, por lo que persiste entre sesiones.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Carrito del usuario',
    type: CartResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token inválido o faltante'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor'
  })
  async getCart(@Request() req): Promise<CartResponseDto> {
    const userId = req.user.userId;
    
    if (!userId) {
      throw new Error('Usuario no identificado');
    }

    const items = await this.cartService.getCart(userId);
    
    return { items };
  }

  @Put()
  @ApiOperation({ 
    summary: 'Actualizar carrito del usuario',
    description: 'Actualiza el carrito del usuario con los productos especificados. Si un producto ya existe, se actualiza su cantidad. Si la cantidad es 0, se elimina el producto. El carrito se guarda en la base de datos y persiste entre sesiones.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Carrito actualizado exitosamente',
    type: CartResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos - cantidad debe ser mayor a 0 o productos duplicados'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token inválido o faltante'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor'
  })
  async updateCart(
    @Request() req,
    @Body() updateCartDto: UpdateCartDto
  ): Promise<CartResponseDto> {
    const userId = req.user.userId;
    
    if (!userId) {
      throw new Error('Usuario no identificado');
    }

    // Validar que el body tenga la estructura correcta
    if (!updateCartDto.items || !Array.isArray(updateCartDto.items)) {
      throw new BadRequestException('El campo items es requerido y debe ser un array');
    }

    const items = await this.cartService.updateCart(userId, updateCartDto);
    
    return { items };
  }
}

