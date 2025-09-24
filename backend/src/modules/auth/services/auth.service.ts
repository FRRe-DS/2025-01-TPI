import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {

generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    console.log('🔧 AuthService - Token generado:', token);
    console.log('🔧 AuthService - Longitud del token:', token.length);
    console.log('🔧 AuthService - Tipo de dato:', typeof token);
    return token;
  }

}