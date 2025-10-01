import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  try {
    console.log('🚀 Iniciando aplicación...');
    console.log('📊 Variables de entorno:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- PORT:', process.env.PORT);
    console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Configurada' : 'NO CONFIGURADA');
    console.log('- SECRET_KEY:', process.env.SECRET_KEY ? 'Configurada' : 'NO CONFIGURADA');
    
    const app = await NestFactory.create(AppModule);
    
    // Configurar CORS para desarrollo
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://localhost:3001', 
        'http://localhost:5173',
        'http://localhost:4173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:4173'
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'Accept',
        'Origin',
        'X-Requested-With'
      ],
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204
    });

    // Configurar Swagger
    const config = new DocumentBuilder()
      .setTitle('ShopFlow API')
      .setDescription('API del backend para el portal de compras ShopFlow - Módulo de Compras')
      .setVersion('1.0')
      .addTag('app', 'Endpoints principales de la aplicación')
      .addTag('auth', 'Autenticación y autorización')
      .addTag('health', 'Health checks y status del sistema')
      .addTag('orders', 'Gestión de pedidos y compras')
      .addTag('products', 'Gestión de productos y catálogo')
      .addTag('users', 'Gestión de usuarios')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Token de autorización Bearer',
          in: 'header',
        },
        'Authorization'
      )
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'ShopFlow API Docs',
      customfavIcon: 'https://nestjs.com/img/logo-small.svg',
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
      ],
      customCssUrl: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      ],
    });
    
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`✅ Aplicación iniciada correctamente en el puerto ${port}`);
    console.log(`📚 Swagger disponible en: http://localhost:${port}/api/docs`);
  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error);
    console.error('❌ Stack trace:', error.stack);
    process.exit(1);
  }
}
bootstrap();
