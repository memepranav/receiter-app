import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

import { RecitationsService } from './recitations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/auth.interface';

// Query DTOs
import { GetQuranQueryDto } from './dto/get-quran-query.dto';

@ApiTags('Quran Content')
@Controller('api/v1/quran')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class RecitationsController {
  constructor(private readonly recitationsService: RecitationsService) {}

  @ApiOperation({ summary: 'Get all Surahs list' })
  @ApiResponse({ status: 200, description: 'Surahs list retrieved successfully' })
  @Get('surahs')
  async getSurahs(@GetUser() user: AuthenticatedUser) {
    return this.recitationsService.getSurahs();
  }

  @ApiOperation({ summary: 'Get specific Surah by number' })
  @ApiResponse({ status: 200, description: 'Surah retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Surah not found' })
  @ApiParam({ name: 'surahNumber', description: 'Surah number (1-114)' })
  @Get('surah/:surahNumber')
  async getSurah(
    @Param('surahNumber', ParseIntPipe) surahNumber: number,
    @Query() query: GetQuranQueryDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.recitationsService.getSurah(surahNumber, query, user.id);
  }

  @ApiOperation({ summary: 'Get all Juz list' })
  @ApiResponse({ status: 200, description: 'Juz list retrieved successfully' })
  @Get('juz')
  async getJuzList(@GetUser() user: AuthenticatedUser) {
    return this.recitationsService.getJuzList();
  }

  @ApiOperation({ summary: 'Get specific Juz by number' })
  @ApiResponse({ status: 200, description: 'Juz retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Juz not found' })
  @ApiParam({ name: 'juzNumber', description: 'Juz number (1-30)' })
  @Get('juz/:juzNumber')
  async getJuz(
    @Param('juzNumber', ParseIntPipe) juzNumber: number,
    @Query() query: GetQuranQueryDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.recitationsService.getJuz(juzNumber, query, user.id);
  }

  @ApiOperation({ summary: 'Get specific Ayah' })
  @ApiResponse({ status: 200, description: 'Ayah retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Ayah not found' })
  @ApiParam({ name: 'surahNumber', description: 'Surah number (1-114)' })
  @ApiParam({ name: 'ayahNumber', description: 'Ayah number' })
  @Get('ayah/:surahNumber/:ayahNumber')
  async getAyah(
    @Param('surahNumber', ParseIntPipe) surahNumber: number,
    @Param('ayahNumber', ParseIntPipe) ayahNumber: number,
    @Query() query: GetQuranQueryDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.recitationsService.getAyah(surahNumber, ayahNumber, query, user.id);
  }

  @ApiOperation({ summary: 'Get available reciters' })
  @ApiResponse({ status: 200, description: 'Reciters list retrieved successfully' })
  @Get('reciters')
  async getReciters(@GetUser() user: AuthenticatedUser) {
    return this.recitationsService.getReciters();
  }

  @ApiOperation({ summary: 'Get specific reciter details' })
  @ApiResponse({ status: 200, description: 'Reciter details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Reciter not found' })
  @ApiParam({ name: 'reciterId', description: 'Reciter identifier' })
  @Get('reciter/:reciterId')
  async getReciter(
    @Param('reciterId') reciterId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.recitationsService.getReciter(reciterId);
  }

  @ApiOperation({ summary: 'Get audio URL for Surah recitation' })
  @ApiResponse({ status: 200, description: 'Audio URL retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Audio not found' })
  @ApiParam({ name: 'reciterId', description: 'Reciter identifier' })
  @ApiParam({ name: 'surahNumber', description: 'Surah number (1-114)' })
  @Get('audio/:reciterId/:surahNumber')
  async getAudio(
    @Param('reciterId') reciterId: string,
    @Param('surahNumber', ParseIntPipe) surahNumber: number,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.recitationsService.getAudio(reciterId, surahNumber, user.id);
  }

  @ApiOperation({ summary: 'Get available translations' })
  @ApiResponse({ status: 200, description: 'Translations list retrieved successfully' })
  @Get('translations')
  async getTranslations(@GetUser() user: AuthenticatedUser) {
    return this.recitationsService.getTranslations();
  }

  @ApiOperation({ summary: 'Get specific translation details' })
  @ApiResponse({ status: 200, description: 'Translation details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Translation not found' })
  @ApiParam({ name: 'translationId', description: 'Translation identifier' })
  @Get('translation/:translationId')
  async getTranslation(
    @Param('translationId') translationId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.recitationsService.getTranslation(translationId);
  }

  @ApiOperation({ summary: 'Search Quran content' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  @Get('search')
  async searchQuran(
    @Query('q') query: string,
    @Query('surah') surah?: number,
    @Query('translation') translation?: string,
    @Query('limit') limit = 20,
    @GetUser() user?: AuthenticatedUser,
  ) {
    return this.recitationsService.searchQuran(query, {
      surah,
      translation,
      limit,
      userId: user.id,
    });
  }

  @ApiOperation({ summary: 'Get random Ayah' })
  @ApiResponse({ status: 200, description: 'Random Ayah retrieved successfully' })
  @Get('random')
  async getRandomAyah(
    @Query() query: GetQuranQueryDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.recitationsService.getRandomAyah(query, user.id);
  }

  @ApiOperation({ summary: 'Get Ayah of the Day' })
  @ApiResponse({ status: 200, description: 'Ayah of the Day retrieved successfully' })
  @Get('ayah-of-day')
  async getAyahOfDay(
    @Query() query: GetQuranQueryDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.recitationsService.getAyahOfDay(query, user.id);
  }
}