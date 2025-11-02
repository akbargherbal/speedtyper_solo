import * as Sentry from '@sentry/node';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { getAllowedOrigins } from './config/cors';
import { SessionAdapter } from './sessions/session.adapter';
import { getSessionMiddleware } from './sessions/session.middleware';
import { json } from 'express';
import { AllExceptionsFilter } from './filters/exception.filter';
import { LocalUserService } from './users/services/local-user.service';

const GLOBAl_API_PREFIX = 'api';

async function runServer() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0,
  });
  const port = process.env.PORT || 1337;
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);

  const sessionMiddleware = await getSessionMiddleware();

  app.enableCors({
    origin: getAllowedOrigins(),
    credentials: true,
  });
  app.use(json({ limit: '50mb' }));

  app.use(sessionMiddleware);

  // Get LocalUserService for both WebSocket adapter and startup initialization
  const localUserService = app.get(LocalUserService);
  app.useWebSocketAdapter(
    new SessionAdapter(app, sessionMiddleware, localUserService),
  );

  app.setGlobalPrefix(GLOBAl_API_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  // Ensure local user exists on startup
  await localUserService.ensureLocalUser();
  console.log('[Bootstrap] ✅ Local Super User initialized');

  await app.listen(port);
  console.log(`[SpeedTyper.dev] Server listening on port ${port}`);
}

runServer();
