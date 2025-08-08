import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import * as compression from 'compression';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  
  // Security middleware with Swagger UI exceptions
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://validator.swagger.io"],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));
  app.use(compression());
  
  // CORS configuration
  const corsOrigins = configService.get('CORS_ORIGINS')?.split(',').map(origin => origin.trim()) || ['http://localhost:3002'];
  console.log('🌐 CORS Origins configured:', corsOrigins);
  
  app.enableCors({
    origin: (origin, callback) => {
      console.log('🔍 CORS request from origin:', origin);
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (corsOrigins.indexOf(origin) !== -1) {
        console.log('✅ CORS origin allowed:', origin);
        return callback(null, true);
      } else {
        console.log('❌ CORS origin blocked:', origin);
        return callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  // API prefix
  app.setGlobalPrefix('api');
  
  // Serve swagger-ui static assets
  try {
    const swaggerUiAssetPath = path.join(require.resolve('swagger-ui-dist/package.json'), '..', 'dist');
    app.useStaticAssets(swaggerUiAssetPath, {
      prefix: '/api/docs/',
    });
  } catch (error) {
    console.warn('Could not set up Swagger UI static assets:', error.message);
  }
  
  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Quran Reciter API')
    .setDescription('Complete API documentation for the Quran Reciter mobile app')
    .setVersion('1.0')
    .addTag('Authentication', 'User registration, login, and auth management')
    .addTag('Admin Authentication', 'Admin panel authentication')
    .addTag('Users', 'User profile and management')
    .addTag('Quran Content', 'Quran text, translations, and recitations')
    .addTag('Reading Progress', 'Reading sessions, bookmarks, and progress tracking')
    .addTag('Rewards', 'Points, badges, and blockchain token management')
    .addTag('Analytics', 'User activity and session tracking')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  const port = configService.get('API_PORT') || 3001;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Quran Reciter API running on port ${port}`);
  console.log(`📖 API Documentation: http://0.0.0.0:${port}/api/docs`);
}

bootstrap();