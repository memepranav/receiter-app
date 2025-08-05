import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Security middleware
  app.use(helmet());
  app.use(compression());
  
  // CORS configuration
  app.enableCors({
    origin: configService.get('CORS_ORIGINS')?.split(',') || ['http://localhost:3002'],
    credentials: true,
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  // API prefix
  app.setGlobalPrefix('api');
  
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
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Quran Reciter API Documentation',
    customfavIcon: '/favicon.ico',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
  });
  
  const port = configService.get('API_PORT') || 3001;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Quran Reciter API running on port ${port}`);
  console.log(`📖 API Documentation: http://0.0.0.0:${port}/api/docs`);
}

bootstrap();