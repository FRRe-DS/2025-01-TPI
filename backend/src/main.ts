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
    
    // Middleware CORS manual adicional - GARANTÍA ABSOLUTA
    app.use((req, res, next) => {
      console.log(`🌐 CORS: ${req.method} ${req.path} desde ${req.get('Origin') || 'localhost'}`);
      
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
      res.header('Access-Control-Expose-Headers', '*');
      res.header('Access-Control-Allow-Credentials', 'false');
      
      // Responder a OPTIONS inmediatamente
      if (req.method === 'OPTIONS') {
        console.log('✅ CORS: Respondiendo OPTIONS con 200');
        res.status(200).end();
        return;
      }
      
      next();
    });
    
    // Configurar CORS para aceptar CUALQUIER petición - SIN RESTRICCIONES
    app.enableCors({
      origin: true, // ✅ ACEPTA CUALQUIER ORIGEN (más permisivo que '*')
      methods: '*', // ✅ ACEPTA CUALQUIER MÉTODO HTTP
      allowedHeaders: '*', // ✅ ACEPTA CUALQUIER HEADER
      exposedHeaders: '*', // ✅ EXPONE CUALQUIER HEADER
      credentials: false, // ✅ Sin credenciales para máxima compatibilidad
      preflightContinue: false,
      optionsSuccessStatus: 200, // ✅ Status 200 para OPTIONS
      maxAge: 86400 // ✅ Cache preflight por 24 horas
    });

    // Configurar Swagger
    const config = new DocumentBuilder()
      .setTitle('Shipper API')
      .setDescription('API del backend para el portal de compras Shipper - Módulo de Compras')
      .setVersion('1.0')
      .addTag('app', 'Endpoints principales de la aplicación')
      .addTag('health', 'Health checks y status del sistema')
      .addTag('user', 'Gestión de usuarios')
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
      customSiteTitle: 'Shipper API Docs',
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
