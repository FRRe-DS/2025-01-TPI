import { ApiProperty } from '@nestjs/swagger';

export class CartItemDto {
  @ApiProperty({
    description: 'ID del producto',
    example: 1,
    type: Number
  })
  productId: number;

  @ApiProperty({
    description: 'Cantidad del producto en el carrito',
    example: 2,
    type: Number,
    minimum: 1
  })
  quantity: number;
}

export class UpdateCartDto {
  @ApiProperty({
    description: 'Array de items del carrito',
    type: [CartItemDto],
    example: [
      { productId: 1, quantity: 2 },
      { productId: 3, quantity: 1 }
    ]
  })
  items: CartItemDto[];
}

export class CartResponseDto {
  @ApiProperty({
    description: 'Array de items del carrito del usuario',
    type: [CartItemDto],
    example: [
      { productId: 1, quantity: 2 },
      { productId: 3, quantity: 1 }
    ]
  })
  items: CartItemDto[];
}

