const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/src/app.module');
const { DocumentBuilder, SwaggerModule } = require('@nestjs/swagger');

let app;

async function createApp() {
  if (!app) {
    console.log('🚀 Starting auth service...');
    app = await NestFactory.create(AppModule);
    
    // CORS
    app.enableCors({
      origin: '*',
      methods: '*',
      allowedHeaders: '*'
    });

    // Swagger configurado para usar CDN
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
      customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.5/swagger-ui.min.css',
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.5/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.5/swagger-ui-standalone-preset.min.js',
      ],
    });

    await app.init();
    console.log('✅ Auth service started');
  }
  return app;
}

module.exports = async (req, res) => {
  try {
    console.log(`${req.method} ${req.url}`);
    const app = await createApp();
    const server = app.getHttpAdapter().getInstance();
    server(req, res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};
