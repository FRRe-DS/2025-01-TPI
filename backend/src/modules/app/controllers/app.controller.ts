import { Controller, Get, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

@ApiTags('app')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Página principal del API' })
  @ApiResponse({ status: 200, description: 'Página de información del API' })
  getRoot(@Res() res: Response) {
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ShopFlow API - Portal de Compras</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #333;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 3rem;
            max-width: 800px;
            width: 90%;
            text-align: center;
        }
        
        .logo {
            font-size: 3rem;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 1rem;
        }
        
        .subtitle {
            font-size: 1.2rem;
            color: #666;
            margin-bottom: 2rem;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
        }
        
        .info-card {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }
        
        .info-card h3 {
            color: #667eea;
            margin-bottom: 0.5rem;
        }
        
        .info-card p {
            color: #666;
            line-height: 1.5;
        }
        
        .links {
            margin-top: 2rem;
        }
        
        .link-button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            margin: 0 10px;
            transition: all 0.3s ease;
            font-weight: 500;
        }
        
        .link-button:hover {
            background: #5a6fd8;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        
        .status {
            background: #d4edda;
            color: #155724;
            padding: 10px 20px;
            border-radius: 8px;
            display: inline-block;
            margin: 1rem 0;
            font-weight: 500;
        }
        
        .footer {
            margin-top: 2rem;
            color: #999;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🛒 ShopFlow API</div>
        <div class="subtitle">Portal de Compras - Módulo de Compras</div>
        
        <div class="status">✅ Sistema funcionando correctamente</div>
        
        <div class="info-grid">
            <div class="info-card">
                <h3>📚 Documentación</h3>
                <p>Accede a la documentación completa del API con Swagger UI para explorar todos los endpoints disponibles.</p>
            </div>
            
            <div class="info-card">
                <h3>🔐 Autenticación</h3>
                <p>Sistema de login, registro y gestión de usuarios con JWT tokens para seguridad.</p>
            </div>
            
            <div class="info-card">
                <h3>👤 Perfiles</h3>
                <p>Gestión de perfiles de usuario con datos complementarios como teléfono, DNI y fecha de nacimiento.</p>
            </div>
            
            <div class="info-card">
                <h3>🛍️ Compras</h3>
                <p>Endpoints para gestión de productos, carrito de compras y pedidos (en desarrollo).</p>
            </div>
        </div>
        
        <div class="links">
            <a href="/api/docs" class="link-button">📖 Ver Documentación</a>
            <a href="/health" class="link-button">💚 Health Check</a>
            <a href="/api/status" class="link-button">📊 Status</a>
        </div>
        
        <div class="footer">
            <p>Desarrollado para el proyecto TPI - 2025</p>
            <p>Backend: NestJS + Prisma + PostgreSQL</p>
        </div>
    </div>
</body>
</html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}
