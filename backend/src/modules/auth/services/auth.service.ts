import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {

  generateToken(payload: Record<string, any>): string {
    const secret = process.env.SECRET_KEY;
    if (!secret) {
      throw new Error('SECRET_KEY no definida en variables de entorno');
    }

    let token: string = jwt.sign(payload,secret,{
      expiresIn: '24h',
      algorithm: 'HS256',
    });

    console.log('🔧 AuthService - Token generado:', token);
    console.log('🔧 AuthService - Longitud del token:', token.length);
    console.log('🔧 AuthService - Tipo de dato:', typeof token);
    return token;
  }

}