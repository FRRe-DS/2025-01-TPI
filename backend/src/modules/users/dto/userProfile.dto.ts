import { ApiProperty } from '@nestjs/swagger';

export class UserProfileCreateDto {
  @ApiProperty({
    description: 'Teléfono del usuario',
    example: '+54 11 1234-5678'
  })
  phone: string;

  @ApiProperty({
    description: 'DNI del usuario',
    example: '12345678'
  })
  dni: string;

  @ApiProperty({
    description: 'Fecha de nacimiento del usuario',
    example: '1990-01-15'
  })
  birthDate: string;
}

export class UserProfileUpdateDto {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
    required: false
  })
  firstName?: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
    required: false
  })
  lastName?: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan.perez@email.com',
    required: false
  })
  email?: string;

  @ApiProperty({
    description: 'Teléfono del usuario',
    example: '+54 11 1234-5678',
    required: false
  })
  phone?: string;

  @ApiProperty({
    description: 'DNI del usuario',
    example: '12345678',
    required: false
  })
  dni?: string;

  @ApiProperty({
    description: 'Fecha de nacimiento del usuario',
    example: '1990-01-15',
    required: false
  })
  birthDate?: string;
}
