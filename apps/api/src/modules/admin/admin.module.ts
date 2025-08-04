import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

// Import schemas from other modules
import { User, UserSchema } from '../users/schemas/user.schema';
import { ReadingSession, ReadingSessionSchema } from '../progress/schemas/reading-session.schema';
import { Reward, RewardSchema } from '../rewards/schemas/reward.schema';
import { Transaction, TransactionSchema } from '../rewards/schemas/transaction.schema';
import { Badge, BadgeSchema } from '../rewards/schemas/badge.schema';
import { AnalyticsEvent, AnalyticsEventSchema } from '../analytics/schemas/analytics-event.schema';

// Core modules
import { LoggerModule } from '../../core/logger/logger.module';
import { RedisModule } from '../../core/redis/redis.module';

// Other service modules for admin operations
import { UsersService } from '../users/users.service';
import { RewardsService } from '../rewards/rewards.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { BlockchainService } from '../rewards/blockchain.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ReadingSession.name, schema: ReadingSessionSchema },
      { name: Reward.name, schema: RewardSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Badge.name, schema: BadgeSchema },
      { name: AnalyticsEvent.name, schema: AnalyticsEventSchema },
    ]),
    LoggerModule,
    RedisModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, UsersService, RewardsService, AnalyticsService, BlockchainService],
  exports: [AdminService],
})
export class AdminModule {}