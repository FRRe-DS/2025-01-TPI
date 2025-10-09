import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Password actual del usuario',
    example: 'password123'
  })
  currentPassword: string;

  @ApiProperty({
    description: 'Nueva password del usuario',
    example: 'newpassword123'
  })
  newPassword: string;
}