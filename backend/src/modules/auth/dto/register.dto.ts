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
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez'
  })
  name: string;
}
