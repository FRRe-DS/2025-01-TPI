import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  try {
    console.log('🚀 Iniciando servicio de autenticación...');
    console.log('📊 Variables de entorno:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- PORT:', process.env.PORT);
    console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Configurada' : 'NO CONFIGURADA');
    console.log('- SECRET_KEY:', process.env.SECRET_KEY ? 'Configurada' : 'NO CONFIGURADA');
    
    const app = await NestFactory.create(AppModule);
    
    // CORS ULTRA PERMISIVO - SIN RESTRICCIONES
    app.use((req, res, next) => {
      // Permitir CUALQUIER origen
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', '*');
      res.header('Access-Control-Allow-Headers', '*');
      res.header('Access-Control-Expose-Headers', '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Max-Age', '86400');
      
      // Responder a OPTIONS inmediatamente
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }
      
      next();
    });
    
    // CORS adicional de NestJS
    app.enableCors({
      origin: '*',
      methods: '*',
      allowedHeaders: '*',
      exposedHeaders: '*',
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 200
    });

    // Configurar Swagger
    const config = new DocumentBuilder()
      .setTitle('Auth Service API')
      .setDescription('Servicio de autenticación y autorización para el sistema Shipper')
      .setVersion('1.0')
      .addTag('app', 'Endpoints principales del servicio')
      .addTag('auth', 'Autenticación y autorización')
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
      customSiteTitle: 'Auth Service API Docs',
      customfavIcon: 'https://nestjs.com/img/logo-small.svg',
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
      ],
      customCssUrl: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      ],
    });
    
    const port = process.env.PORT ?? 3001;
    await app.listen(port);
    console.log(`✅ Servicio de autenticación iniciado correctamente en el puerto ${port}`);
    console.log(`📚 Swagger disponible en: http://localhost:${port}/api/docs`);
  } catch (error) {
    console.error('❌ Error al iniciar el servicio de autenticación:', error);
    console.error('❌ Stack trace:', error.stack);
    process.exit(1);
  }
}
bootstrap();
