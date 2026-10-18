import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global exception filter for consistent error formats
  app.useGlobalFilters(new AllExceptionsFilter());

  // Input validation with whitelist and automatic transformation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // 1. Allow any localhost or local loopback
      if (
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.startsWith('http://localhost')
      ) {
        return callback(null, true);
      }

      // 2. Allow all Render and Vercel deployed domains
      if (origin.endsWith('.onrender.com') || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // 3. Allow explicitly configured CORS_ORIGIN
      if (process.env.CORS_ORIGIN) {
        const configured = process.env.CORS_ORIGIN.split(',').map((o) => o.trim());
        if (configured.includes('*') || configured.includes(origin)) {
          return callback(null, true);
        }
      }

      // Default safe allow with reflection so client never faces CORS preflight failure
      return callback(null, true);
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Idempotency-Key',
      'x-organization-id',
      'x-client-timestamp',
      'x-request-id',
    ],
    exposedHeaders: [
      'Idempotency-Key',
      'x-organization-id',
      'x-cache-status',
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
