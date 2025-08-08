import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { QuranAyah, QuranAyahDocument } from './schemas/quran-ayah.schema';
import { Reciter, ReciterDocument } from './schemas/reciter.schema';
import { Translation, TranslationDocument } from './schemas/translation.schema';

import { LoggerService } from '../../core/logger/logger.service';
import { RedisService } from '../../core/redis/redis.service';
import { DatabaseService } from '../../core/database/database.service';

import { GetQuranQueryDto } from './dto/get-quran-query.dto';

@Injectable()
export class RecitationsService {
  constructor(
    @InjectModel(QuranAyah.name) private quranAyahModel: Model<QuranAyahDocument>,
    @InjectModel(Reciter.name) private reciterModel: Model<ReciterDocument>,
    @InjectModel(Translation.name) private translationModel: Model<TranslationDocument>,
    private loggerService: LoggerService,
    private redisService: RedisService,
    private databaseService: DatabaseService,
  ) {}

  /**
   * Get list of all Surahs
   */
  async getSurahs(): Promise<any> {
    const cacheKey = 'surahs:list';
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Aggregate to get unique surahs with their info from quran_ayahs
    const surahs = await this.quranAyahModel.aggregate([
      {
        $group: {
          _id: '$sura_number',
          sura_number: { $first: '$sura_number' },
          sura_name_arabic: { $first: '$sura_name_arabic' },
          numberOfAyahs: { $sum: 1 },
          firstAyah: { $first: '$ayah_text_arabic' }
        }
      },
      {
        $sort: { sura_number: 1 }
      },
      {
        $project: {
          _id: 0,
          number: '$sura_number',
          name: '$sura_name_arabic',
          numberOfAyahs: 1
        }
      }
    ]).exec();

    // Cache for 1 hour
    await this.redisService.set(cacheKey, JSON.stringify(surahs), 3600);

    return surahs;
  }

  /**
   * Get specific Surah by number
   */
  async getSurah(surahNumber: number, query: GetQuranQueryDto, userId: string): Promise<any> {
    if (surahNumber < 1 || surahNumber > 114) {
      throw new NotFoundException('Invalid Surah number');
    }

    const cacheKey = `surah:${surahNumber}:${JSON.stringify(query)}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      this.loggerService.logUserActivity('surah_accessed', userId, { surahNumber, cached: true });
      return JSON.parse(cached);
    }

    // Query ayahs for the specific surah
    let matchQuery: any = { sura_number: surahNumber };
    
    // Apply ayah range filter if specified
    if (query.startAyah && query.endAyah) {
      matchQuery.ayah_number = { $gte: query.startAyah, $lte: query.endAyah };
    } else if (query.startAyah) {
      matchQuery.ayah_number = { $gte: query.startAyah };
    } else if (query.endAyah) {
      matchQuery.ayah_number = { $lte: query.endAyah };
    }

    const ayahs = await this.quranAyahModel
      .find(matchQuery)
      .sort({ ayah_number: 1 })
      .exec();

    if (ayahs.length === 0) {
      throw new NotFoundException('Surah not found');
    }

    // Get surah metadata from first ayah
    const firstAyah = ayahs[0];
    let result: any = {
      number: firstAyah.sura_number,
      name: firstAyah.sura_name_arabic,
      numberOfAyahs: ayahs.length,
      ayahs: ayahs.map(ayah => ({
        number: ayah.ayah_number,
        text: ayah.ayah_text_arabic,
        juz: ayah.juz_number,
        hizb: ayah.hizb_number,
        quarter: ayah.quarter_hizb_segment,
        isBismillah: ayah.is_bismillah
      }))
    };

    // Add translation if requested
    if (query.translation) {
      const translation = await this.getTranslationForSurah(surahNumber, query.translation);
      result.translation = translation;
    }

    // Add audio URL if reciter specified
    if (query.reciter) {
      const audioUrl = await this.getAudioUrl(query.reciter, surahNumber);
      result.audioUrl = audioUrl;
    }

    // Cache for 30 minutes
    await this.redisService.set(cacheKey, JSON.stringify(result), 1800);

    this.loggerService.logUserActivity('surah_accessed', userId, { 
      surahNumber, 
      translation: query.translation,
      reciter: query.reciter 
    });

    return result;
  }

  /**
   * Get list of all Juz with detailed information
   */
  async getJuzList(): Promise<any> {
    const cacheKey = 'juz:list';
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Aggregate to get detailed Juz list with start/end surah info and ranges
    const juzList = await this.quranAyahModel.aggregate([
      {
        $group: {
          _id: '$juz_number',
          juz_number: { $first: '$juz_number' },
          totalAyahs: { $sum: 1 },
          ayahs: { 
            $push: {
              sura_number: '$sura_number',
              sura_name_arabic: '$sura_name_arabic',
              ayah_number: '$ayah_number'
            }
          }
        }
      },
      {
        $sort: { juz_number: 1 }
      },
      {
        $addFields: {
          // Sort ayahs to get first and last properly
          sortedAyahs: {
            $sortArray: {
              input: '$ayahs',
              sortBy: { sura_number: 1, ayah_number: 1 }
            }
          }
        }
      },
      {
        $addFields: {
          startAyah: { $first: '$sortedAyahs' },
          endAyah: { $last: '$sortedAyahs' }
        }
      },
      {
        $project: {
          _id: 0,
          number: '$juz_number',
          name: { 
            $switch: {
              branches: [
                { case: { $eq: ['$juz_number', 1] }, then: 'الجزء الأول' },
                { case: { $eq: ['$juz_number', 2] }, then: 'الجزء الثاني' },
                { case: { $eq: ['$juz_number', 3] }, then: 'الجزء الثالث' },
                { case: { $eq: ['$juz_number', 4] }, then: 'الجزء الرابع' },
                { case: { $eq: ['$juz_number', 5] }, then: 'الجزء الخامس' },
                { case: { $eq: ['$juz_number', 6] }, then: 'الجزء السادس' },
                { case: { $eq: ['$juz_number', 7] }, then: 'الجزء السابع' },
                { case: { $eq: ['$juz_number', 8] }, then: 'الجزء الثامن' },
                { case: { $eq: ['$juz_number', 9] }, then: 'الجزء التاسع' },
                { case: { $eq: ['$juz_number', 10] }, then: 'الجزء العاشر' },
                { case: { $eq: ['$juz_number', 11] }, then: 'الجزء الحادي عشر' },
                { case: { $eq: ['$juz_number', 12] }, then: 'الجزء الثاني عشر' },
                { case: { $eq: ['$juz_number', 13] }, then: 'الجزء الثالث عشر' },
                { case: { $eq: ['$juz_number', 14] }, then: 'الجزء الرابع عشر' },
                { case: { $eq: ['$juz_number', 15] }, then: 'الجزء الخامس عشر' },
                { case: { $eq: ['$juz_number', 16] }, then: 'الجزء السادس عشر' },
                { case: { $eq: ['$juz_number', 17] }, then: 'الجزء السابع عشر' },
                { case: { $eq: ['$juz_number', 18] }, then: 'الجزء الثامن عشر' },
                { case: { $eq: ['$juz_number', 19] }, then: 'الجزء التاسع عشر' },
                { case: { $eq: ['$juz_number', 20] }, then: 'الجزء العشرون' },
                { case: { $eq: ['$juz_number', 21] }, then: 'الجزء الحادي والعشرون' },
                { case: { $eq: ['$juz_number', 22] }, then: 'الجزء الثاني والعشرون' },
                { case: { $eq: ['$juz_number', 23] }, then: 'الجزء الثالث والعشرون' },
                { case: { $eq: ['$juz_number', 24] }, then: 'الجزء الرابع والعشرون' },
                { case: { $eq: ['$juz_number', 25] }, then: 'الجزء الخامس والعشرون' },
                { case: { $eq: ['$juz_number', 26] }, then: 'الجزء السادس والعشرون' },
                { case: { $eq: ['$juz_number', 27] }, then: 'الجزء السابع والعشرون' },
                { case: { $eq: ['$juz_number', 28] }, then: 'الجزء الثامن والعشرون' },
                { case: { $eq: ['$juz_number', 29] }, then: 'الجزء التاسع والعشرون' },
                { case: { $eq: ['$juz_number', 30] }, then: 'الجزء الثلاثون' }
              ],
              default: { $concat: ['الجزء ', { $toString: '$juz_number' }] }
            }
          },
          englishName: { $concat: ['Juz ', { $toString: '$juz_number' }] },
          totalAyahs: 1,
          startSurah: {
            number: '$startAyah.sura_number',
            name: '$startAyah.sura_name_arabic',
            startAyah: '$startAyah.ayah_number'
          },
          endSurah: {
            number: '$endAyah.sura_number',
            name: '$endAyah.sura_name_arabic',
            endAyah: '$endAyah.ayah_number'
          },
          displayName: {
            $concat: [
              '$startAyah.sura_name_arabic',
              ' (',
              { $toString: '$startAyah.sura_number' },
              ':',
              { $toString: '$startAyah.ayah_number' },
              ') - ',
              '$endAyah.sura_name_arabic',
              ' (',
              { $toString: '$endAyah.sura_number' },
              ':',
              { $toString: '$endAyah.ayah_number' },
              ')'
            ]
          },
          range: {
            $concat: [
              '$startAyah.sura_name_arabic',
              ' (',
              { $toString: '$startAyah.sura_number' },
              ':',
              { $toString: '$startAyah.ayah_number' },
              ') - ',
              '$endAyah.sura_name_arabic',
              ' (',
              { $toString: '$endAyah.sura_number' },
              ':',
              { $toString: '$endAyah.ayah_number' },
              ')'
            ]
          }
        }
      }
    ]).exec();

    // Cache for 1 hour
    await this.redisService.set(cacheKey, JSON.stringify(juzList), 3600);

    return juzList;
  }

  /**
   * Get specific Juz by number
   */
  async getJuz(juzNumber: number, query: GetQuranQueryDto, userId: string): Promise<any> {
    if (juzNumber < 1 || juzNumber > 30) {
      throw new NotFoundException('Invalid Juz number');
    }

    const cacheKey = `juz:${juzNumber}:${JSON.stringify(query)}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      this.loggerService.logUserActivity('juz_accessed', userId, { juzNumber, cached: true });
      return JSON.parse(cached);
    }

    // Get all ayahs for the specific Juz
    const ayahs = await this.quranAyahModel
      .find({ juz_number: juzNumber })
      .sort({ sura_number: 1, ayah_number: 1 })
      .exec();

    if (ayahs.length === 0) {
      throw new NotFoundException('Juz not found');
    }

    // Group ayahs by surah for better organization
    const surahsInJuz = ayahs.reduce((acc, ayah) => {
      const surahKey = ayah.sura_number;
      if (!acc[surahKey]) {
        acc[surahKey] = {
          sura_number: ayah.sura_number,
          sura_name_arabic: ayah.sura_name_arabic,
          ayahs: []
        };
      }
      acc[surahKey].ayahs.push({
        number: ayah.ayah_number,
        text: ayah.ayah_text_arabic,
        juz: ayah.juz_number,
        hizb: ayah.hizb_number,
        quarter: ayah.quarter_hizb_segment,
        isBismillah: ayah.is_bismillah
      });
      return acc;
    }, {});

    let result: any = {
      number: juzNumber,
      name: `الجزء ${juzNumber}`,
      englishName: `Juz ${juzNumber}`,
      totalAyahs: ayahs.length,
      surahs: Object.values(surahsInJuz),
      ayahs: ayahs.map(ayah => ({
        number: ayah.ayah_number,
        text: ayah.ayah_text_arabic,
        sura_number: ayah.sura_number,
        sura_name_arabic: ayah.sura_name_arabic,
        juz: ayah.juz_number,
        hizb: ayah.hizb_number,
        quarter: ayah.quarter_hizb_segment,
        isBismillah: ayah.is_bismillah
      })),
    };

    // Add translation if requested
    if (query.translation) {
      // Get translations for all ayahs in this Juz
      const translatedAyahs = await this.getTranslationForJuz(juzNumber, query.translation);
      result.translation = translatedAyahs;
    }

    // Cache for 30 minutes
    await this.redisService.set(cacheKey, JSON.stringify(result), 1800);

    this.loggerService.logUserActivity('juz_accessed', userId, { 
      juzNumber, 
      translation: query.translation 
    });

    return result;
  }

  /**
   * Get specific Ayah
   */
  async getAyah(
    surahNumber: number, 
    ayahNumber: number, 
    query: GetQuranQueryDto, 
    userId: string
  ): Promise<any> {
    const ayah = await this.quranAyahModel.findOne({
      sura_number: surahNumber,
      ayah_number: ayahNumber
    }).exec();

    if (!ayah) {
      throw new NotFoundException('Ayah not found');
    }

    let result: any = {
      number: ayah.ayah_number,
      text: ayah.ayah_text_arabic,
      sura_number: ayah.sura_number,
      sura_name_arabic: ayah.sura_name_arabic,
      juz: ayah.juz_number,
      hizb: ayah.hizb_number,
      quarter: ayah.quarter_hizb_segment,
      isBismillah: ayah.is_bismillah,
    };

    // Add translation if requested
    if (query.translation) {
      const translation = await this.getTranslationForAyah(surahNumber, ayahNumber, query.translation);
      result.translation = translation;
    }

    this.loggerService.logUserActivity('ayah_accessed', userId, { 
      surahNumber, 
      ayahNumber,
      translation: query.translation 
    });

    return result;
  }

  /**
   * Get available reciters
   */
  async getReciters(): Promise<any> {
    const cacheKey = 'reciters:list';
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const reciters = await this.reciterModel
      .find({ isActive: true })
      .select('identifier name englishName style country imageUrl isComplete popularity')
      .sort({ popularity: -1, name: 1 })
      .exec();

    // Cache for 1 hour
    await this.redisService.set(cacheKey, JSON.stringify(reciters), 3600);

    return reciters;
  }

  /**
   * Get specific reciter
   */
  async getReciter(reciterId: string): Promise<any> {
    const reciter = await this.reciterModel.findOne({ identifier: reciterId, isActive: true }).exec();

    if (!reciter) {
      throw new NotFoundException('Reciter not found');
    }

    return reciter;
  }

  /**
   * Get audio URL for recitation
   */
  async getAudio(reciterId: string, surahNumber: number, userId: string): Promise<any> {
    const reciter = await this.reciterModel.findOne({ identifier: reciterId, isActive: true }).exec();

    if (!reciter) {
      throw new NotFoundException('Reciter not found');
    }

    if (!reciter.availableSurahs.includes(surahNumber)) {
      throw new NotFoundException('Audio not available for this Surah');
    }

    const audioUrl = await this.getAudioUrl(reciterId, surahNumber);

    this.loggerService.logUserActivity('audio_accessed', userId, { 
      reciterId, 
      surahNumber 
    });

    return { audioUrl };
  }

  /**
   * Get available translations
   */
  async getTranslations(): Promise<any> {
    const cacheKey = 'translations:list';
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const translations = await this.translationModel
      .find({ isActive: true })
      .select('identifier name englishName language languageName translator isComplete popularity')
      .sort({ popularity: -1, name: 1 })
      .exec();

    // Group by language
    const groupedTranslations = translations.reduce((acc, translation) => {
      if (!acc[translation.language]) {
        acc[translation.language] = {
          language: translation.language,
          languageName: translation.languageName,
          translations: [],
        };
      }
      acc[translation.language].translations.push(translation);
      return acc;
    }, {});

    const result = Object.values(groupedTranslations);

    // Cache for 1 hour
    await this.redisService.set(cacheKey, JSON.stringify(result), 3600);

    return result;
  }

  /**
   * Get specific translation
   */
  async getTranslation(translationId: string): Promise<any> {
    const translation = await this.translationModel
      .findOne({ identifier: translationId, isActive: true })
      .exec();

    if (!translation) {
      throw new NotFoundException('Translation not found');
    }

    return translation;
  }

  /**
   * Search Quran content
   */
  async searchQuran(query: string, options: any): Promise<any> {
    // TODO: Implement full-text search across Quran content
    // This would typically use MongoDB text search or Elasticsearch
    
    // Search in Quran ayahs collection
    const searchResults = await this.quranAyahModel
      .find({
        $or: [
          { sura_name_arabic: { $regex: query, $options: 'i' } },
          { ayah_text_arabic: { $regex: query, $options: 'i' } },
        ],
      })
      .limit(options.limit || 20)
      .exec();

    this.loggerService.logUserActivity('quran_searched', options.userId, { query });

    return {
      query,
      results: searchResults,
      total: searchResults.length,
    };
  }

  /**
   * Get random Ayah
   */
  async getRandomAyah(query: GetQuranQueryDto, userId: string): Promise<any> {
    // Get total ayah count
    const totalAyahs = await this.quranAyahModel.countDocuments().exec();
    const randomIndex = Math.floor(Math.random() * totalAyahs);
    
    // Get random ayah using skip
    const ayah = await this.quranAyahModel.findOne().skip(randomIndex).exec();

    if (!ayah) {
      throw new NotFoundException('Ayah not found');
    }

    let result: any = {
      number: ayah.ayah_number,
      text: ayah.ayah_text_arabic,
      surahNumber: ayah.sura_number,
      surahName: ayah.sura_name_arabic,
      juz: ayah.juz_number,
      hizb: ayah.hizb_number,
      quarter: ayah.quarter_hizb_segment,
      isBismillah: ayah.is_bismillah
    };

    // Add translation if requested
    if (query.translation) {
      const translation = await this.getTranslationForAyah(ayah.sura_number, ayah.ayah_number, query.translation);
      result.translation = translation;
    }

    this.loggerService.logUserActivity('random_ayah_accessed', userId, { 
      surahNumber: ayah.sura_number, 
      ayahNumber: ayah.ayah_number 
    });

    return result;
  }

  /**
   * Get Ayah of the Day
   */
  async getAyahOfDay(query: GetQuranQueryDto, userId: string): Promise<any> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const cacheKey = `ayah-of-day:${today}:${JSON.stringify(query)}`;
    
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      this.loggerService.logUserActivity('ayah_of_day_accessed', userId, { cached: true });
      return JSON.parse(cached);
    }

    // Use date as seed for consistent daily ayah
    const totalAyahs = await this.quranAyahModel.countDocuments().exec();
    const dateNumber = parseInt(today.replace(/-/g, '')) % totalAyahs;
    
    // Get ayah at this position
    const targetAyah = await this.quranAyahModel.findOne().skip(dateNumber).exec();

    if (!targetAyah) {
      // Fallback to first ayah of Al-Fatiha
      const fallbackAyah = await this.quranAyahModel.findOne({ sura_number: 1, ayah_number: 1 }).exec();
      if (!fallbackAyah) {
        throw new NotFoundException('No ayahs found');
      }
    }

    const ayah = targetAyah || await this.quranAyahModel.findOne({ sura_number: 1, ayah_number: 1 }).exec();

    let result: any = {
      number: ayah!.ayah_number,
      text: ayah!.ayah_text_arabic,
      surahNumber: ayah!.sura_number,
      surahName: ayah!.sura_name_arabic,
      juz: ayah!.juz_number,
      hizb: ayah!.hizb_number,
      quarter: ayah!.quarter_hizb_segment,
      isBismillah: ayah!.is_bismillah,
      date: today,
    };

    // Add translation if requested
    if (query.translation) {
      const translation = await this.getTranslationForAyah(
        ayah!.sura_number, 
        ayah!.ayah_number, 
        query.translation
      );
      result.translation = translation;
    }

    // Cache until end of day
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const secondsUntilEndOfDay = Math.floor((endOfDay.getTime() - now.getTime()) / 1000);
    
    await this.redisService.set(cacheKey, JSON.stringify(result), secondsUntilEndOfDay);

    this.loggerService.logUserActivity('ayah_of_day_accessed', userId, { 
      date: today,
      surahNumber: ayah!.sura_number, 
      ayahNumber: ayah!.ayah_number 
    });

    return result;
  }

  /**
   * Helper: Get translation for a specific ayah
   */
  private async getTranslationForAyah(
    surahNumber: number, 
    ayahNumber: number, 
    translationId: string
  ): Promise<string | null> {
    const translation = await this.translationModel
      .findOne({ identifier: translationId, isActive: true })
      .exec();

    if (!translation || !translation.ayahs) {
      return null;
    }

    const translatedAyah = translation.ayahs.find(
      a => a.surahNumber === surahNumber && a.ayahNumber === ayahNumber
    );

    return translatedAyah?.text || null;
  }

  /**
   * Helper: Get translation for entire surah
   */
  private async getTranslationForSurah(surahNumber: number, translationId: string): Promise<any[]> {
    const translation = await this.translationModel
      .findOne({ identifier: translationId, isActive: true })
      .exec();

    if (!translation || !translation.ayahs) {
      return [];
    }

    return translation.ayahs.filter(a => a.surahNumber === surahNumber);
  }

  /**
   * Helper: Get translation for entire juz
   */
  private async getTranslationForJuz(juzNumber: number, translationId: string): Promise<any[]> {
    // TODO: Implement based on Juz ayah mapping
    return [];
  }

  /**
   * Helper: Generate audio URL
   */
  private async getAudioUrl(reciterId: string, surahNumber: number): Promise<string> {
    const reciter = await this.reciterModel.findOne({ identifier: reciterId }).exec();
    
    if (!reciter || !reciter.audioBaseUrl) {
      // Return a placeholder or default audio service URL
      return `https://audio.qurancdn.com/${reciterId}/${surahNumber.toString().padStart(3, '0')}.mp3`;
    }

    return `${reciter.audioBaseUrl}/${surahNumber.toString().padStart(3, '0')}.mp3`;
  }

  // ==================== HIERARCHICAL STRUCTURE METHODS ====================

  /**
   * Get Quran structure overview (30 Juz → 60 Hizb → 240 Rubʿ)
   */
  async getQuranStructure(): Promise<any> {
    const cacheKey = 'quran:structure:overview';
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const db = this.databaseService.getConnection().db;
    const collection = db.collection('quran_ayahs');

    const stats = await Promise.all([
      collection.countDocuments({}),
      collection.distinct('juz_number').then(juz => juz.filter(j => j > 0).length),
      collection.distinct('hizb_number').then(hizb => hizb.filter(h => h > 0).length),
      collection.aggregate([
        { $group: { _id: { juz: '$juz_number', hizb: '$hizb_number' } } },
        { $count: 'total' }
      ]).toArray().then(result => result[0]?.total * 4 || 0) // Each Hizb has 4 quarters
    ]);

    const structure = {
      totalAyahs: stats[0],
      totalJuz: stats[1],
      totalHizb: stats[2], 
      totalQuarters: stats[3], // Each Hizb has 4 Rubʿ
      description: '30 Juz → 60 Hizb → 240 Rubʿ al-Hizb → 6,236 Ayahs'
    };

    // Cache for 1 day
    await this.redisService.set(cacheKey, JSON.stringify(structure), 86400);

    return structure;
  }

  /**
   * Get Hizb list for a specific Juz
   */
  async getHizbsForJuz(juzNumber: number, userId: string): Promise<any> {
    if (juzNumber < 1 || juzNumber > 30) {
      throw new NotFoundException('Invalid Juz number');
    }

    const cacheKey = `juz:${juzNumber}:hizbs`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      this.loggerService.logUserActivity('juz_hizbs_accessed', userId, { juzNumber, cached: true });
      return JSON.parse(cached);
    }

    const db = this.databaseService.getConnection().db;
    const collection = db.collection('quran_ayahs');

    const hizbList = await collection.aggregate([
      { $match: { juz_number: juzNumber } },
      {
        $group: {
          _id: '$hizb_number',
          quarterCount: { $addToSet: '$quarter_hizb_segment' },
          ayahCount: { $sum: 1 },
          surahs: { $addToSet: { surah: '$sura_number', surahName: '$sura_name_arabic' } }
        }
      },
      {
        $project: {
          hizbNumber: '$_id',
          quarterCount: { $size: '$quarterCount' },
          ayahCount: 1,
          surahs: 1
        }
      },
      { $sort: { hizbNumber: 1 } }
    ]).toArray();

    const result = {
      juzNumber,
      hizbs: hizbList.map(hizb => ({
        hizbNumber: hizb.hizbNumber,
        ayahCount: hizb.ayahCount,
        quarterCount: 4, // Always 4 Rubʿ per Hizb
        surahs: hizb.surahs.sort((a, b) => a.surah - b.surah)
      }))
    };

    // Cache for 30 minutes
    await this.redisService.set(cacheKey, JSON.stringify(result), 1800);

    this.loggerService.logUserActivity('juz_hizbs_accessed', userId, { juzNumber });

    return result;
  }

  /**
   * Get specific Hizb content
   */
  async getHizb(juzNumber: number, hizbNumber: number, query: GetQuranQueryDto, userId: string): Promise<any> {
    if (juzNumber < 1 || juzNumber > 30) {
      throw new NotFoundException('Invalid Juz number');
    }
    if (hizbNumber < 1 || hizbNumber > 60) {
      throw new NotFoundException('Invalid Hizb number');
    }

    const cacheKey = `juz:${juzNumber}:hizb:${hizbNumber}:${JSON.stringify(query)}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      this.loggerService.logUserActivity('hizb_accessed', userId, { juzNumber, hizbNumber, cached: true });
      return JSON.parse(cached);
    }

    const db = this.databaseService.getConnection().db;
    const collection = db.collection('quran_ayahs');

    // Get all ayahs for this Hizb
    const ayahs = await collection.find({ 
      juz_number: juzNumber, 
      hizb_number: hizbNumber 
    })
    .sort({ sura_number: 1, ayah_number: 1 })
    .toArray();

    if (ayahs.length === 0) {
      throw new NotFoundException('Hizb not found');
    }

    // Get unique surahs in this Hizb
    const surahs = Array.from(new Set(ayahs.map(ayah => ayah.sura_number)))
      .map(surahNum => {
        const ayah = ayahs.find(a => a.sura_number === surahNum);
        return {
          surah: surahNum,
          surahName: ayah?.sura_name_arabic || ''
        };
      })
      .sort((a, b) => a.surah - b.surah);

    const result = {
      juzNumber,
      hizbNumber,
      ayahCount: ayahs.length,
      quarterCount: 4,
      surahs,
      ayahs: query.includeText ? ayahs.map(ayah => ({
        id: ayah._id,
        surah: ayah.sura_number,
        surahName: ayah.sura_name_arabic,
        ayah: ayah.ayah_number,
        text: ayah.ayah_text_arabic,
        juz: ayah.juz_number,
        hizb: ayah.hizb_number,
        quarter: parseInt(ayah.quarter_hizb_segment)
      })) : undefined
    };

    // Cache for 30 minutes
    await this.redisService.set(cacheKey, JSON.stringify(result), 1800);

    this.loggerService.logUserActivity('hizb_accessed', userId, { juzNumber, hizbNumber });

    return result;
  }

  /**
   * Get Rubʿ (quarters) list for a specific Hizb
   */
  async getQuartersForHizb(juzNumber: number, hizbNumber: number, userId: string): Promise<any> {
    if (juzNumber < 1 || juzNumber > 30) {
      throw new NotFoundException('Invalid Juz number');
    }
    if (hizbNumber < 1 || hizbNumber > 60) {
      throw new NotFoundException('Invalid Hizb number');
    }

    const cacheKey = `juz:${juzNumber}:hizb:${hizbNumber}:quarters`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      this.loggerService.logUserActivity('hizb_quarters_accessed', userId, { juzNumber, hizbNumber, cached: true });
      return JSON.parse(cached);
    }

    const db = this.databaseService.getConnection().db;
    const collection = db.collection('quran_ayahs');

    // Get all ayahs for this Hizb
    const allAyahs = await collection.find({ 
      juz_number: juzNumber, 
      hizb_number: hizbNumber 
    })
    .sort({ sura_number: 1, ayah_number: 1 })
    .toArray();

    if (allAyahs.length === 0) {
      throw new NotFoundException('Hizb not found');
    }

    // Divide ayahs into 4 quarters (Rubʿ al-Hizb)
    const totalAyahs = allAyahs.length;
    const ayahsPerQuarter = Math.ceil(totalAyahs / 4);
    
    const quarters = [];
    
    for (let i = 0; i < 4; i++) {
      const startIndex = i * ayahsPerQuarter;
      const endIndex = Math.min((i + 1) * ayahsPerQuarter, totalAyahs);
      const quarterAyahs = allAyahs.slice(startIndex, endIndex);
      
      if (quarterAyahs.length > 0) {
        const firstAyah = quarterAyahs[0];
        const lastAyah = quarterAyahs[quarterAyahs.length - 1];
        
        // Get unique surahs in this quarter
        const surahs = Array.from(new Set(quarterAyahs.map(ayah => ayah.sura_number)))
          .map(surahNum => {
            const ayah = quarterAyahs.find(a => a.sura_number === surahNum);
            return {
              surah: surahNum,
              surahName: ayah?.sura_name_arabic || ''
            };
          })
          .sort((a, b) => a.surah - b.surah);
        
        quarters.push({
          quarterNumber: i + 1,
          ayahCount: quarterAyahs.length,
          surahs: surahs,
          range: {
            start: {
              surah: firstAyah.sura_number,
              surahName: firstAyah.sura_name_arabic,
              ayah: firstAyah.ayah_number
            },
            end: {
              surah: lastAyah.sura_number,
              surahName: lastAyah.sura_name_arabic,
              ayah: lastAyah.ayah_number
            }
          }
        });
      }
    }

    const result = {
      juzNumber,
      hizbNumber,
      quarters
    };

    // Cache for 30 minutes
    await this.redisService.set(cacheKey, JSON.stringify(result), 1800);

    this.loggerService.logUserActivity('hizb_quarters_accessed', userId, { juzNumber, hizbNumber });

    return result;
  }

  /**
   * Get specific Rubʿ al-Hizb (quarter) content with ayahs
   */
  async getQuarter(
    juzNumber: number, 
    hizbNumber: number, 
    quarterNumber: number, 
    query: GetQuranQueryDto, 
    userId: string
  ): Promise<any> {
    if (juzNumber < 1 || juzNumber > 30) {
      throw new NotFoundException('Invalid Juz number');
    }
    if (hizbNumber < 1 || hizbNumber > 60) {
      throw new NotFoundException('Invalid Hizb number');
    }
    if (quarterNumber < 1 || quarterNumber > 4) {
      throw new NotFoundException('Invalid quarter number');
    }

    const cacheKey = `juz:${juzNumber}:hizb:${hizbNumber}:quarter:${quarterNumber}:${JSON.stringify(query)}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      this.loggerService.logUserActivity('quarter_accessed', userId, { 
        juzNumber, hizbNumber, quarterNumber, cached: true 
      });
      return JSON.parse(cached);
    }

    const db = this.databaseService.getConnection().db;
    const collection = db.collection('quran_ayahs');

    // Get all ayahs for this Hizb
    const allAyahs = await collection.find({ 
      juz_number: juzNumber, 
      hizb_number: hizbNumber 
    })
    .sort({ sura_number: 1, ayah_number: 1 })
    .toArray();

    if (allAyahs.length === 0) {
      throw new NotFoundException('Hizb not found');
    }

    // Divide ayahs into 4 quarters and get the requested quarter
    const totalAyahs = allAyahs.length;
    const ayahsPerQuarter = Math.ceil(totalAyahs / 4);
    const quarterIndex = quarterNumber - 1; // Convert to 0-based index
    
    const startIndex = quarterIndex * ayahsPerQuarter;
    const endIndex = Math.min((quarterIndex + 1) * ayahsPerQuarter, totalAyahs);
    const quarterAyahs = allAyahs.slice(startIndex, endIndex);

    if (quarterAyahs.length === 0) {
      throw new NotFoundException('Quarter not found');
    }

    // Format ayahs for display
    const formattedAyahs = quarterAyahs.map(ayah => ({
      id: ayah._id,
      surah: ayah.sura_number,
      surahName: ayah.sura_name_arabic,
      ayah: ayah.ayah_number,
      text: ayah.ayah_text_arabic,
      translation: query.translation ? '' : undefined, // TODO: Add translation lookup
      juz: ayah.juz_number,
      hizb: ayah.hizb_number,
      quarter: quarterNumber
    }));

    // Get unique surahs in this quarter
    const surahs = Array.from(new Set(quarterAyahs.map(ayah => ayah.sura_number)))
      .map(surahNum => {
        const ayah = quarterAyahs.find(a => a.sura_number === surahNum);
        return {
          surah: surahNum,
          surahName: ayah?.sura_name_arabic || ''
        };
      })
      .sort((a, b) => a.surah - b.surah);

    const result = {
      juzNumber,
      hizbNumber,
      quarterNumber,
      rubAlHizb: `Rubʿ ${quarterNumber}`, // Arabic terminology
      ayahCount: formattedAyahs.length,
      surahs,
      range: {
        start: {
          surah: quarterAyahs[0].sura_number,
          surahName: quarterAyahs[0].sura_name_arabic,
          ayah: quarterAyahs[0].ayah_number
        },
        end: {
          surah: quarterAyahs[quarterAyahs.length - 1].sura_number,
          surahName: quarterAyahs[quarterAyahs.length - 1].sura_name_arabic,
          ayah: quarterAyahs[quarterAyahs.length - 1].ayah_number
        }
      },
      ayahs: formattedAyahs
    };

    // Cache for 30 minutes
    await this.redisService.set(cacheKey, JSON.stringify(result), 1800);

    this.loggerService.logUserActivity('quarter_accessed', userId, { 
      juzNumber, hizbNumber, quarterNumber 
    });

    return result;
  }

  /**
   * Get specific Rubʿ al-Hizb by direct rub number (1-240)
   */
  async getRub(rubNumber: number, query: GetQuranQueryDto, userId: string): Promise<any> {
    if (rubNumber < 1 || rubNumber > 240) {
      throw new NotFoundException('Invalid Rub number. Must be between 1 and 240');
    }

    const cacheKey = `rub:${rubNumber}:${JSON.stringify(query)}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      this.loggerService.logUserActivity('rub_accessed', userId, { rubNumber, cached: true });
      return JSON.parse(cached);
    }

    const db = this.databaseService.getConnection().db;
    const collection = db.collection('quran_ayahs');

    // Calculate juz and hizb numbers from rub number
    // Each Juz has 8 Rubs (240 total / 30 Juz = 8 Rubs per Juz)
    // Each Hizb has 4 Rubs (240 total / 60 Hizb = 4 Rubs per Hizb)
    const juzNumber = Math.ceil(rubNumber / 8);
    const hizbNumber = Math.ceil(rubNumber / 4);
    const quarterInHizb = ((rubNumber - 1) % 4) + 1; // Quarter within the Hizb (1-4)

    // Get all ayahs for this Hizb
    const allAyahs = await collection.find({ 
      juz_number: juzNumber, 
      hizb_number: hizbNumber 
    })
    .sort({ sura_number: 1, ayah_number: 1 })
    .toArray();

    if (allAyahs.length === 0) {
      throw new NotFoundException('Rub not found');
    }

    // Divide ayahs into 4 quarters and get the requested quarter
    const totalAyahs = allAyahs.length;
    const ayahsPerQuarter = Math.ceil(totalAyahs / 4);
    const quarterIndex = quarterInHizb - 1; // Convert to 0-based index
    
    const startIndex = quarterIndex * ayahsPerQuarter;
    const endIndex = Math.min((quarterIndex + 1) * ayahsPerQuarter, totalAyahs);
    const rubAyahs = allAyahs.slice(startIndex, endIndex);

    if (rubAyahs.length === 0) {
      throw new NotFoundException('Rub not found');
    }

    // Format ayahs according to the requested structure
    const formattedAyahs = rubAyahs.map(ayah => ({
      number: ayah.ayah_number,
      text: ayah.ayah_text_arabic,
      surahNumber: ayah.sura_number,
      surahName: ayah.sura_name_arabic,
      translation: query.translation ? '' : undefined // TODO: Add translation lookup
    }));

    const result = {
      rubNumber,
      hizbNumber,
      juzNumber,
      ayahs: formattedAyahs
    };

    // Cache for 30 minutes
    await this.redisService.set(cacheKey, JSON.stringify(result), 1800);

    this.loggerService.logUserActivity('rub_accessed', userId, { rubNumber });

    return result;
  }
}