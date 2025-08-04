import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Surah, SurahDocument } from './schemas/surah.schema';
import { Juz, JuzDocument } from './schemas/juz.schema';
import { Reciter, ReciterDocument } from './schemas/reciter.schema';
import { Translation, TranslationDocument } from './schemas/translation.schema';

import { LoggerService } from '../../core/logger/logger.service';
import { RedisService } from '../../core/redis/redis.service';

import { GetQuranQueryDto } from './dto/get-quran-query.dto';

@Injectable()
export class RecitationsService {
  constructor(
    @InjectModel(Surah.name) private surahModel: Model<SurahDocument>,
    @InjectModel(Juz.name) private juzModel: Model<JuzDocument>,
    @InjectModel(Reciter.name) private reciterModel: Model<ReciterDocument>,
    @InjectModel(Translation.name) private translationModel: Model<TranslationDocument>,
    private loggerService: LoggerService,
    private redisService: RedisService,
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

    const surahs = await this.surahModel
      .find()
      .select('number name englishName englishNameTranslation numberOfAyahs revelationType')
      .sort({ number: 1 })
      .exec();

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

    const surah = await this.surahModel.findOne({ number: surahNumber }).exec();

    if (!surah) {
      throw new NotFoundException('Surah not found');
    }

    let result: any = surah.toObject();

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
   * Get list of all Juz
   */
  async getJuzList(): Promise<any> {
    const cacheKey = 'juz:list';
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const juzList = await this.juzModel
      .find()
      .select('number name englishName totalAyahs startPage endPage')
      .sort({ number: 1 })
      .exec();

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

    const juz = await this.juzModel.findOne({ number: juzNumber }).exec();

    if (!juz) {
      throw new NotFoundException('Juz not found');
    }

    // Get ayahs for all surahs in this Juz
    const ayahs = [];
    for (const juzSurah of juz.surahs) {
      const surah = await this.surahModel.findOne({ number: juzSurah.surahNumber }).exec();
      if (surah) {
        const surahAyahs = surah.ayahs.slice(juzSurah.startAyah - 1, juzSurah.endAyah);
        ayahs.push(...surahAyahs.map(ayah => ({
          ...ayah,
          surahNumber: juzSurah.surahNumber,
          surahName: juzSurah.surahName,
        })));
      }
    }

    let result: any = {
      ...juz.toObject(),
      ayahs,
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
    const surah = await this.surahModel.findOne({ number: surahNumber }).exec();

    if (!surah) {
      throw new NotFoundException('Surah not found');
    }

    const ayah = surah.ayahs.find(a => a.number === ayahNumber);

    if (!ayah) {
      throw new NotFoundException('Ayah not found');
    }

    let result: any = {
      ...ayah,
      surahNumber,
      surahName: surah.name,
      surahEnglishName: surah.englishName,
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
    
    const searchResults = await this.surahModel
      .find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { englishName: { $regex: query, $options: 'i' } },
          { englishNameTranslation: { $regex: query, $options: 'i' } },
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
    // Get a random surah
    const randomSurahNumber = Math.floor(Math.random() * 114) + 1;
    const surah = await this.surahModel.findOne({ number: randomSurahNumber }).exec();

    if (!surah) {
      throw new NotFoundException('Surah not found');
    }

    // Get a random ayah from the surah
    const randomAyahIndex = Math.floor(Math.random() * surah.ayahs.length);
    const ayah = surah.ayahs[randomAyahIndex];

    let result: any = {
      ...ayah,
      surahNumber: randomSurahNumber,
      surahName: surah.name,
      surahEnglishName: surah.englishName,
    };

    // Add translation if requested
    if (query.translation) {
      const translation = await this.getTranslationForAyah(randomSurahNumber, ayah.number, query.translation);
      result.translation = translation;
    }

    this.loggerService.logUserActivity('random_ayah_accessed', userId, { 
      surahNumber: randomSurahNumber, 
      ayahNumber: ayah.number 
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
    const dateNumber = parseInt(today.replace(/-/g, '')) % 6236; // Total ayahs in Quran
    
    // Find the ayah at this position
    let currentCount = 0;
    let targetSurah: SurahDocument | null = null;
    let targetAyah: any = null;

    const surahs = await this.surahModel.find().sort({ number: 1 }).exec();
    
    for (const surah of surahs) {
      if (currentCount + surah.numberOfAyahs > dateNumber) {
        targetSurah = surah;
        targetAyah = surah.ayahs[dateNumber - currentCount];
        break;
      }
      currentCount += surah.numberOfAyahs;
    }

    if (!targetSurah || !targetAyah) {
      // Fallback to first ayah of Al-Fatiha
      targetSurah = await this.surahModel.findOne({ number: 1 }).exec();
      targetAyah = targetSurah?.ayahs[0];
    }

    let result: any = {
      ...targetAyah,
      surahNumber: targetSurah!.number,
      surahName: targetSurah!.name,
      surahEnglishName: targetSurah!.englishName,
      date: today,
    };

    // Add translation if requested
    if (query.translation) {
      const translation = await this.getTranslationForAyah(
        targetSurah!.number, 
        targetAyah.number, 
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
      surahNumber: targetSurah!.number, 
      ayahNumber: targetAyah.number 
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
}