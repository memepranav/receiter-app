import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

// Schemas
import { AnalyticsEvent, AnalyticsEventSchema } from './schemas/analytics-event.schema';
import { UserSession, UserSessionSchema } from './schemas/user-session.schema';

// User schema from users module
import { User, UserSchema } from '../users/schemas/user.schema';

// Core modules
import { LoggerModule } from '../../core/logger/logger.module';
import { RedisModule } from '../../core/redis/redis.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: AnalyticsEvent.name, schema: AnalyticsEventSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: User.name, schema: UserSchema },
    ]),
    LoggerModule,
    RedisModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}