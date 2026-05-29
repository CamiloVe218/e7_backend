import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ServicesModule } from './services/services.module';
import { ServiceRequestsModule } from './service-requests/service-requests.module';
import { ProvidersModule } from './providers/providers.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payments.module';
import { RatingsModule } from './ratings/ratings.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { singleLine: true } }
          : undefined,
        redact: ['req.headers.authorization', 'req.headers.cookie'],
        serializers: {
          req: (req) => ({ method: req.method, url: req.url, id: req.id }),
          res: (res) => ({ statusCode: res.statusCode }),
        },
      },
    }),
    // Global rate limit: 60 req/min per IP (overridden per-route with @Throttle)
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 60,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ServicesModule,
    ServiceRequestsModule,
    ProvidersModule,
    NotificationsModule,
    PaymentsModule,
    RatingsModule,
    AdminModule,
  ],
  providers: [
    // Applies ThrottlerGuard globally — integration tests bypass this
    // since they build their own TestingModule without AppModule
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
