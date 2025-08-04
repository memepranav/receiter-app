import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

// Schemas
import { ReadingSession, ReadingSessionSchema } from './schemas/reading-session.schema';
import { Bookmark, BookmarkSchema } from './schemas/bookmark.schema';
import { ReadingGoal, ReadingGoalSchema } from './schemas/reading-goal.schema';

// User schema from users module
import { User, UserSchema } from '../users/schemas/user.schema';

// Core modules
import { LoggerModule } from '../../core/logger/logger.module';
import { RedisModule } from '../../core/redis/redis.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: ReadingSession.name, schema: ReadingSessionSchema },
      { name: Bookmark.name, schema: BookmarkSchema },
      { name: ReadingGoal.name, schema: ReadingGoalSchema },
      { name: User.name, schema: UserSchema },
    ]),
    LoggerModule,
    RedisModule,
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}