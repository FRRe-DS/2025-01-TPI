import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'nuevo@usuario.com'
  })
  email: string;

  @ApiProperty({
    description: 'Password del usuario',
    example: 'password123'
  })
  password: string;

  @ApiProperty({
    description: 'Primer nombre del usuario',
    example: 'Juan'
  })
  firstName: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez'
  })
  lastName: string;
}
