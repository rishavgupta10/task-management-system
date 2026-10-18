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
  // Supports comma-separated origins, wildcard, localhost, or domains with/without protocol
  const rawOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:3000'];

  const allowedOrigins = new Set<string>();
  // Always allow localhost for local development
  allowedOrigins.add('http://localhost:3000');
  allowedOrigins.add('http://127.0.0.1:3000');

  for (const origin of rawOrigins) {
    if (!origin) continue;
    if (origin === '*') {
      allowedOrigins.add('*');
    } else if (origin.startsWith('http://') || origin.startsWith('https://')) {
      allowedOrigins.add(origin.replace(/\/$/, ''));
    } else {
      // If Render passes raw host without protocol like "task-management-frontend-j7zs.onrender.com"
      allowedOrigins.add(`https://${origin}`);
      allowedOrigins.add(`http://${origin}`);
    }
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.has('*') || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      // Also match if origin domain matches without protocol
      for (const allowed of allowedOrigins) {
        if (origin === allowed || origin.includes(allowed.replace(/^https?:\/\//, ''))) {
          return callback(null, true);
        }
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
