import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AdminController } from './admin.controller';
import { AdminAuthController } from './admin-auth.controller';
import { AdminTestController } from './admin-test.controller';
import { AdminService } from './admin.service';
import { AdminAuthService } from './services/admin-auth.service';

// Import admin schema
import { Admin, AdminSchema } from './schemas/admin.schema';

// Import schemas from other modules
import { User, UserSchema } from '../users/schemas/user.schema';
import { ReadingSession, ReadingSessionSchema } from '../progress/schemas/reading-session.schema';
import { Reward, RewardSchema } from '../rewards/schemas/reward.schema';
import { Transaction, TransactionSchema } from '../rewards/schemas/transaction.schema';
import { Badge, BadgeSchema } from '../rewards/schemas/badge.schema';
import { AnalyticsEvent, AnalyticsEventSchema } from '../analytics/schemas/analytics-event.schema';
import { UserSession, UserSessionSchema } from '../analytics/schemas/user-session.schema';
import { Surah, SurahSchema } from '../recitations/schemas/surah.schema';
import { Juz, JuzSchema } from '../recitations/schemas/juz.schema';
import { Reciter, ReciterSchema } from '../recitations/schemas/reciter.schema';
import { Translation, TranslationSchema } from '../recitations/schemas/translation.schema';

// Core modules
import { LoggerModule } from '../../core/logger/logger.module';
import { RedisModule } from '../../core/redis/redis.module';
import { EmailModule } from '../../core/email/email.module';
import { DatabaseModule } from '../../core/database/database.module';

// Other service modules for admin operations
import { UsersService } from '../users/users.service';
import { RewardsService } from '../rewards/rewards.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { BlockchainService } from '../rewards/blockchain.service';
import { AuthService } from '../auth/auth.service';
import { RecitationsService } from '../recitations/recitations.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN') || '24h',
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: User.name, schema: UserSchema },
      { name: ReadingSession.name, schema: ReadingSessionSchema },
      { name: Reward.name, schema: RewardSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Badge.name, schema: BadgeSchema },
      { name: AnalyticsEvent.name, schema: AnalyticsEventSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: Surah.name, schema: SurahSchema },
      { name: Juz.name, schema: JuzSchema },
      { name: Reciter.name, schema: ReciterSchema },
      { name: Translation.name, schema: TranslationSchema },
    ]),
    LoggerModule,
    RedisModule,
    EmailModule,
    DatabaseModule,
  ],
  controllers: [AdminController, AdminAuthController, AdminTestController],
  providers: [AdminService, AdminAuthService, AuthService, UsersService, RewardsService, AnalyticsService, BlockchainService, RecitationsService],
  exports: [AdminService, AdminAuthService],
})
export class AdminModule {}