import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { setupSwagger } from './config/swagger.config';
import compression from 'compression';
import morgan from 'morgan';
import helmet from 'helmet';
import * as express from 'express';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  
const expressApp = app.getHttpAdapter().getInstance();
expressApp.set('trust proxy', 1);

  /**
   * SECURITY: Request Size Limit
   */
  app.use(express.json({
  limit: process.env.REQUEST_LIMIT || '20kb',
}));
  app.use(express.urlencoded({ limit: '20kb', extended: true }));

  /**
   * Compression
   */
  app.use(compression());

  
    // Security Headers
  
  app.use(helmet());

  /**
   * Logging
   */
  app.use(
    morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'),
  );

  app.setGlobalPrefix('api/v1');

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  /**
   * Validation
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  /**
   * CORS
   */
app.enableCors({
  origin: [
    process.env.FRONTEND_URL,
    
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  credentials: true,
});

  const reflector = app.get(Reflector);

app.useGlobalGuards(
  new JwtAuthGuard(reflector),
  new RolesGuard(reflector),
);

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();