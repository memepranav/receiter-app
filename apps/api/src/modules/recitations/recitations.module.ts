import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { RecitationsController } from './recitations.controller';
import { RecitationsService } from './recitations.service';

// Schemas
import { QuranAyah, QuranAyahSchema } from './schemas/quran-ayah.schema';
import { Reciter, ReciterSchema } from './schemas/reciter.schema';
import { Translation, TranslationSchema } from './schemas/translation.schema';

// Core modules
import { LoggerModule } from '../../core/logger/logger.module';
import { RedisModule } from '../../core/redis/redis.module';
import { DatabaseModule } from '../../core/database/database.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: QuranAyah.name, schema: QuranAyahSchema },
      { name: Reciter.name, schema: ReciterSchema },
      { name: Translation.name, schema: TranslationSchema },
    ]),
    LoggerModule,
    RedisModule,
    DatabaseModule,
  ],
  controllers: [RecitationsController],
  providers: [RecitationsService],
  exports: [RecitationsService, MongooseModule],
})
export class RecitationsModule {}