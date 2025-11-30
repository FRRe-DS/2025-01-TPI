import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, Min, IsObject, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class DeliveryAddressDto {
  @ApiProperty({
    description: 'Calle y número',
    example: 'Av. Corrientes 1234',
    type: String
  })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({
    description: 'Ciudad',
    example: 'Buenos Aires',
    type: String
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'Provincia/Estado',
    example: 'CABA',
    type: String
  })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    description: 'Código postal',
    example: 'A1234ABC',
    type: String
  })
  @IsString()
  @IsNotEmpty()
  postal_code: string;

  @ApiProperty({
    description: 'País',
    example: 'Argentina',
    type: String
  })
  @IsString()
  @IsNotEmpty()
  country: string;
}

export class OrderProductDto {
  @ApiProperty({
    description: 'ID del producto',
    example: 1,
    type: Number
  })
  @IsNumber()
  @Min(1)
  id: number;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 2,
    type: Number,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Precio unitario del producto al momento de la compra',
    example: 1500.00,
    type: Number
  })
  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID del envío del backend de logística',
    example: 789,
    type: Number,
    required: false
  })
  @IsOptional()
  @IsNumber()
  shippingId?: number;

  @ApiProperty({
    description: 'Tipo de transporte utilizado',
    example: 'road',
    enum: ['air', 'sea', 'road', 'rail'],
    required: false
  })
  @IsOptional()
  @IsEnum(['air', 'sea', 'road', 'rail'])
  transportType?: string;

  @ApiProperty({
    description: 'Costo de envío',
    example: 1500.00,
    type: Number,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingCost?: number;

  @ApiProperty({
    description: 'Dirección de entrega',
    type: DeliveryAddressDto
  })
  @IsObject()
  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  deliveryAddress: DeliveryAddressDto;

  @ApiProperty({
    description: 'Productos de la orden',
    type: [OrderProductDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  products: OrderProductDto[];
}

export class OrderItemDto {
  @ApiProperty({
    description: 'ID del producto',
    example: 1,
    type: Number
  })
  productId: number;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 2,
    type: Number
  })
  quantity: number;

  @ApiProperty({
    description: 'Precio unitario del producto al momento de la compra',
    example: 1500.00,
    type: Number
  })
  price: number;
}

export class OrderResponseDto {
  @ApiProperty({
    description: 'ID interno de la orden',
    example: 1,
    type: Number
  })
  id: number;

  @ApiProperty({
    description: 'ID único de la orden (usado para referencia)',
    example: 1704067200000,
    type: String // BigInt se serializa como string en JSON
  })
  orderId: string;

  @ApiProperty({
    description: 'ID del envío del backend de logística',
    example: 789,
    type: Number,
    required: false
  })
  shippingId?: number;

  @ApiProperty({
    description: 'Estado de la orden',
    example: 'pending',
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
  })
  status: string;

  @ApiProperty({
    description: 'Tipo de transporte utilizado',
    example: 'road',
    enum: ['air', 'sea', 'road', 'rail'],
    required: false
  })
  transportType?: string;

  @ApiProperty({
    description: 'Costo de envío',
    example: 1500.00,
    type: Number,
    required: false
  })
  shippingCost?: number;

  @ApiProperty({
    description: 'Dirección de entrega',
    type: DeliveryAddressDto
  })
  deliveryAddress: DeliveryAddressDto;

  @ApiProperty({
    description: 'Productos de la orden',
    type: [OrderItemDto]
  })
  products: OrderItemDto[];

  @ApiProperty({
    description: 'Total de la orden (productos + envío)',
    example: 4500.00,
    type: Number
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Fecha de creación de la orden',
    example: '2025-01-20T10:00:00.000Z',
    type: String
  })
  createdAt: string;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-01-20T10:00:00.000Z',
    type: String
  })
  updatedAt: string;
}

export class OrdersListResponseDto {
  @ApiProperty({
    description: 'Lista de órdenes del usuario',
    type: [OrderResponseDto]
  })
  orders: OrderResponseDto[];

  @ApiProperty({
    description: 'Total de órdenes',
    example: 5,
    type: Number
  })
  total: number;
}

