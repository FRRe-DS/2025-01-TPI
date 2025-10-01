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
