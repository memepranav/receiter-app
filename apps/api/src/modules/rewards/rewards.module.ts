import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';
import { BlockchainService } from './blockchain.service';

// Schemas
import { Reward, RewardSchema } from './schemas/reward.schema';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { Badge, BadgeSchema } from './schemas/badge.schema';

// User schema from users module
import { User, UserSchema } from '../users/schemas/user.schema';

// Core modules
import { LoggerModule } from '../../core/logger/logger.module';
import { RedisModule } from '../../core/redis/redis.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Reward.name, schema: RewardSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Badge.name, schema: BadgeSchema },
      { name: User.name, schema: UserSchema },
    ]),
    LoggerModule,
    RedisModule,
  ],
  controllers: [RewardsController],
  providers: [RewardsService, BlockchainService],
  exports: [RewardsService, BlockchainService],
})
export class RewardsModule {}