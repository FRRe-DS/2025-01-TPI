import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class JwtService {
  private privateKey: string;
  private publicKey: string;
  private readonly keysPath = path.join(process.cwd(), 'keys');

  constructor() {
    this.initializeKeys();
  }

  private initializeKeys() {
    // Crear directorio de claves si no existe
    if (!fs.existsSync(this.keysPath)) {
      fs.mkdirSync(this.keysPath, { recursive: true });
    }

    const privateKeyPath = path.join(this.keysPath, 'private.pem');
    const publicKeyPath = path.join(this.keysPath, 'public.pem');

    // Si las claves no existen, generarlas
    if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
      console.log('🔑 Generando par de claves RSA...');
      this.generateKeyPair();
    } else {
      console.log('🔑 Cargando claves RSA existentes...');
      this.loadKeys();
    }
  }

  private generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    // Guardar claves en archivos
    const privateKeyPath = path.join(this.keysPath, 'private.pem');
    const publicKeyPath = path.join(this.keysPath, 'public.pem');

    fs.writeFileSync(privateKeyPath, privateKey);
    fs.writeFileSync(publicKeyPath, publicKey);

    this.privateKey = privateKey;
    this.publicKey = publicKey;

    console.log('✅ Par de claves RSA generado y guardado');
  }

  private loadKeys() {
    const privateKeyPath = path.join(this.keysPath, 'private.pem');
    const publicKeyPath = path.join(this.keysPath, 'public.pem');

    this.privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    this.publicKey = fs.readFileSync(publicKeyPath, 'utf8');

    console.log('✅ Claves RSA cargadas correctamente');
  }

  generateAccessToken(payload: any): string {
    const tokenPayload = {
      ...payload,
      iat: Math.floor(Date.now() / 1000), // Issued at
      exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutos
      iss: 'auth-service', // Issuer
      aud: 'backend-service', // Audience
      type: 'access'
    };

    return jwt.sign(tokenPayload, this.privateKey, { algorithm: 'RS256' });
  }

  generateRefreshToken(payload: any): string {
    const tokenPayload = {
      ...payload,
      iat: Math.floor(Date.now() / 1000), // Issued at
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 días
      iss: 'auth-service', // Issuer
      aud: 'auth-service', // Audience
      type: 'refresh'
    };

    return jwt.sign(tokenPayload, this.privateKey, { algorithm: 'RS256' });
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.publicKey, { algorithms: ['RS256'] });
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  getPublicKey(): string {
    return this.publicKey;
  }

  decodeToken(token: string): any {
    return jwt.decode(token);
  }
}
