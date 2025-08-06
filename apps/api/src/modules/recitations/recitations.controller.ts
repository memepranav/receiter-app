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
@Controller('v1/quran')
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

  // ==================== HIERARCHICAL STRUCTURE ENDPOINTS ====================

  @ApiOperation({ 
    summary: 'Get Quran structure overview',
    description: 'Returns the complete hierarchical structure: 30 Juz → 60 Hizb → 240 Rubʿ al-Hizb → 6,236 Ayahs'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Structure overview retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          totalAyahs: 6236,
          totalJuz: 30,
          totalHizb: 60,
          totalQuarters: 240,
          description: "30 Juz → 60 Hizb → 240 Rubʿ al-Hizb → 6,236 Ayahs"
        }
      }
    }
  })
  @Get('structure')
  async getQuranStructure(@GetUser() user: AuthenticatedUser) {
    return this.recitationsService.getQuranStructure();
  }

  @ApiOperation({ 
    summary: 'Get Hizb list for a specific Juz',
    description: 'Returns all Hizb (halves) within a specific Juz, each containing 4 quarters'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Hizb list retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          juzNumber: 1,
          hizbs: [
            {
              hizbNumber: 1,
              ayahCount: 148,
              quarterCount: 4,
              surahs: [
                { surah: 1, surahName: "الفاتحة" },
                { surah: 2, surahName: "البقرة" }
              ]
            },
            {
              hizbNumber: 2,
              ayahCount: 111,
              quarterCount: 4,
              surahs: [
                { surah: 2, surahName: "البقرة" }
              ]
            }
          ]
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Juz not found' })
  @ApiParam({ name: 'juzNumber', description: 'Juz number (1-30)', example: 1 })
  @Get('juz/:juzNumber/hizbs')
  async getHizbsForJuz(
    @Param('juzNumber', ParseIntPipe) juzNumber: number,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.recitationsService.getHizbsForJuz(juzNumber, user.id);
  }

  @ApiOperation({ 
    summary: 'Get specific Hizb content',
    description: 'Returns content of a specific Hizb within a Juz, optionally including full ayah text'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Hizb retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          juzNumber: 1,
          hizbNumber: 1,
          ayahCount: 148,
          quarterCount: 4,
          surahs: [
            { surah: 1, surahName: "الفاتحة" },
            { surah: 2, surahName: "البقرة" }
          ],
          ayahs: [
            {
              id: "1:1",
              surah: 1,
              surahName: "الفاتحة",
              ayah: 1,
              text: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
              juz: 1,
              hizb: 1,
              quarter: 1
            }
          ]
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Hizb not found' })
  @ApiParam({ name: 'juzNumber', description: 'Juz number (1-30)', example: 1 })
  @ApiParam({ name: 'hizbNumber', description: 'Hizb number (1-60)', example: 1 })
  @Get('juz/:juzNumber/hizb/:hizbNumber')
  async getHizb(
    @Param('juzNumber', ParseIntPipe) juzNumber: number,
    @Param('hizbNumber', ParseIntPipe) hizbNumber: number,
    @Query() query: GetQuranQueryDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.recitationsService.getHizb(juzNumber, hizbNumber, query, user.id);
  }

  @ApiOperation({ 
    summary: 'Get Rubʿ (quarters) list for a specific Hizb',
    description: 'Returns all 4 Rubʿ al-Hizb (quarters) within a specific Hizb, with ayah ranges'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Rubʿ list retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          juzNumber: 1,
          hizbNumber: 1,
          quarters: [
            {
              quarterNumber: 1,
              ayahCount: 37,
              surahs: [
                { surah: 1, surahName: "الفاتحة" },
                { surah: 2, surahName: "البقرة" }
              ],
              range: {
                start: { surah: 1, surahName: "الفاتحة", ayah: 1 },
                end: { surah: 2, surahName: "البقرة", ayah: 30 }
              }
            },
            {
              quarterNumber: 2,
              ayahCount: 37,
              surahs: [{ surah: 2, surahName: "البقرة" }],
              range: {
                start: { surah: 2, surahName: "البقرة", ayah: 31 },
                end: { surah: 2, surahName: "البقرة", ayah: 67 }
              }
            }
          ]
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Hizb not found' })
  @ApiParam({ name: 'juzNumber', description: 'Juz number (1-30)', example: 1 })
  @ApiParam({ name: 'hizbNumber', description: 'Hizb number (1-60)', example: 1 })
  @Get('juz/:juzNumber/hizb/:hizbNumber/quarters')
  async getQuartersForHizb(
    @Param('juzNumber', ParseIntPipe) juzNumber: number,
    @Param('hizbNumber', ParseIntPipe) hizbNumber: number,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.recitationsService.getQuartersForHizb(juzNumber, hizbNumber, user.id);
  }

  @ApiOperation({ 
    summary: 'Get specific Rubʿ al-Hizb (quarter) content with ayahs',
    description: 'Returns complete content of a specific quarter including all ayahs, translations, and audio support'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Rubʿ al-Hizb retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          juzNumber: 1,
          hizbNumber: 1,
          quarterNumber: 1,
          rubAlHizb: "Rubʿ 1",
          ayahCount: 37,
          surahs: [
            { surah: 1, surahName: "الفاتحة" },
            { surah: 2, surahName: "البقرة" }
          ],
          range: {
            start: { surah: 1, surahName: "الفاتحة", ayah: 1 },
            end: { surah: 2, surahName: "البقرة", ayah: 30 }
          },
          ayahs: [
            {
              id: "1:1",
              surah: 1,
              surahName: "الفاتحة",
              ayah: 1,
              text: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
              translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
              juz: 1,
              hizb: 1,
              quarter: 1,
              page: 1,
              sajda: false
            }
          ]
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Rubʿ al-Hizb not found' })
  @ApiParam({ name: 'juzNumber', description: 'Juz number (1-30)', example: 1 })
  @ApiParam({ name: 'hizbNumber', description: 'Hizb number (1-60)', example: 1 })
  @ApiParam({ name: 'quarterNumber', description: 'Quarter number (1-4)', example: 1 })
  @Get('juz/:juzNumber/hizb/:hizbNumber/quarter/:quarterNumber')
  async getQuarter(
    @Param('juzNumber', ParseIntPipe) juzNumber: number,
    @Param('hizbNumber', ParseIntPipe) hizbNumber: number,
    @Param('quarterNumber', ParseIntPipe) quarterNumber: number,
    @Query() query: GetQuranQueryDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.recitationsService.getQuarter(juzNumber, hizbNumber, quarterNumber, query, user.id);
  }
}