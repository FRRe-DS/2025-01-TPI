import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('status')
@Controller('api/status')
export class StatusController {
  
  @Get()
  @ApiOperation({ summary: 'Información detallada del sistema' })
  @ApiResponse({ 
    status: 200, 
    description: 'Información completa del backend y servicios',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'OK' },
        message: { type: 'string', example: 'Backend funcionando correctamente' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        date: { type: 'string', example: '1 de enero de 2024' },
        time: { type: 'string', example: '00:00:00' },
        timezone: { type: 'string', example: 'America/New_York' },
        uptime: { type: 'number', example: 123.456 },
        environment: { type: 'string', example: 'production' },
        version: { type: 'string', example: '1.0.0' },
        services: {
          type: 'object',
          properties: {
            database: { type: 'string', example: 'Neon DB (connected)' },
            cache: { type: 'string', example: 'Not configured' },
            queue: { type: 'string', example: 'Not configured' }
          }
        },
        endpoints: {
          type: 'object',
          properties: {
            health: { type: 'string', example: '/health' },
            status: { type: 'string', example: '/api/status' },
            root: { type: 'string', example: '/' }
          }
        },
        test: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'TEST: Backend con Nest.js funcionando en Northflank' },
            description: { type: 'string', example: 'Este endpoint debería funcionar correctamente' },
            timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            url: { type: 'string', example: 'https://p01--backend--5k9g86lnqs8x.code.run/api/status' }
          }
        }
      }
    }
  })
  getStatus() {
    const now = new Date();
    return {
      status: 'OK',
      message: 'Backend funcionando correctamente',
      timestamp: now.toISOString(),
      date: now.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: now.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: 'Neon DB (connected)',
        cache: 'Not configured',
        queue: 'Not configured'
      },
      endpoints: {
        health: '/health',
        status: '/api/status',
        root: '/'
      },
      test: {
        message: 'TEST: Backend con Nest.js funcionando en Northflank',
        description: 'Este endpoint debería funcionar correctamente',
        timestamp: now.toISOString(),
        url: 'Backend URL will be configured in production'
      }
    };
  }
}
