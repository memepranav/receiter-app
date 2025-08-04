import { z } from 'zod';

/**
 * Quran-related schemas using Zod for validation
 */

// Reading Session Schema
export const readingSessionSchema = z.object({
  surahNumber: z
    .number()
    .int('Surah number must be an integer')
    .min(1, 'Surah number must be between 1 and 114')
    .max(114, 'Surah number must be between 1 and 114'),
  juzNumber: z
    .number()
    .int('Juz number must be an integer')
    .min(1, 'Juz number must be between 1 and 30')
    .max(30, 'Juz number must be between 1 and 30')
    .optional(),
  startAyah: z
    .number()
    .int('Start ayah must be an integer')
    .min(1, 'Start ayah must be positive'),
  endAyah: z
    .number()
    .int('End ayah must be an integer')
    .min(1, 'End ayah must be positive')
    .optional(),
  translationId: z.string().optional(),
  reciterId: z.string().optional()
});

// Update Reading Progress Schema
export const updateReadingProgressSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  currentAyah: z
    .number()
    .int('Current ayah must be an integer')
    .min(1, 'Current ayah must be positive'),
  timeSpent: z
    .number()
    .min(0, 'Time spent must be non-negative'),
  ayahsCompleted: z
    .array(z.number().int().min(1))
    .optional()
});

// Complete Reading Session Schema
export const completeReadingSessionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  totalTimeSpent: z
    .number()
    .min(0, 'Total time spent must be non-negative'),
  ayahsCompleted: z
    .array(z.number().int().min(1))
    .min(1, 'At least one ayah must be completed'),
  accuracy: z
    .number()
    .min(0, 'Accuracy must be between 0 and 100')
    .max(100, 'Accuracy must be between 0 and 100')
    .optional(),
  notes: z
    .string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional()
});

// Quran Search Schema
export const quranSearchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(200, 'Search query must not exceed 200 characters'),
  translationId: z.string().optional(),
  searchInArabic: z.boolean().default(false),
  searchInTranslation: z.boolean().default(true),
  surahFilter: z
    .array(z.number().int().min(1).max(114))
    .optional(),
  juzFilter: z
    .array(z.number().int().min(1).max(30))
    .optional(),
  page: z
    .number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z
    .number()
    .int('Limit must be an integer')
    .min(5, 'Limit must be at least 5')
    .max(50, 'Limit must not exceed 50')
    .default(20)
});

// Audio Playback Schema
export const audioPlaybackSchema = z.object({
  reciterId: z.string().min(1, 'Reciter ID is required'),
  surahNumber: z
    .number()
    .int('Surah number must be an integer')
    .min(1, 'Surah number must be between 1 and 114')
    .max(114, 'Surah number must be between 1 and 114'),
  startAyah: z
    .number()
    .int('Start ayah must be an integer')
    .min(1, 'Start ayah must be positive')
    .optional(),
  endAyah: z
    .number()
    .int('End ayah must be an integer')
    .min(1, 'End ayah must be positive')
    .optional(),
  playbackSpeed: z
    .number()
    .min(0.5, 'Playback speed must be at least 0.5x')
    .max(2.0, 'Playback speed must not exceed 2.0x')
    .default(1.0),
  autoPlay: z.boolean().default(false),
  repeat: z.boolean().default(false)
});

// Quran Content Query Schema
export const quranContentQuerySchema = z.object({
  surahNumber: z
    .number()
    .int('Surah number must be an integer')
    .min(1, 'Surah number must be between 1 and 114')
    .max(114, 'Surah number must be between 1 and 114')
    .optional(),
  juzNumber: z
    .number()
    .int('Juz number must be an integer')
    .min(1, 'Juz number must be between 1 and 30')
    .max(30, 'Juz number must be between 1 and 30')
    .optional(),
  pageNumber: z
    .number()
    .int('Page number must be an integer')
    .min(1, 'Page number must be between 1 and 604')
    .max(604, 'Page number must be between 1 and 604')
    .optional(),
  translationIds: z
    .array(z.string())
    .max(5, 'Maximum 5 translations allowed')
    .optional(),
  includeAudio: z.boolean().default(false),
  reciterId: z.string().optional()
});

// Reading Statistics Query Schema
export const readingStatsQuerySchema = z.object({
  period: z
    .enum(['daily', 'weekly', 'monthly', 'yearly', 'all_time'])
    .default('monthly'),
  surahNumber: z
    .number()
    .int('Surah number must be an integer')
    .min(1, 'Surah number must be between 1 and 114')
    .max(114, 'Surah number must be between 1 and 114')
    .optional(),
  juzNumber: z
    .number()
    .int('Juz number must be an integer')
    .min(1, 'Juz number must be between 1 and 30')
    .max(30, 'Juz number must be between 1 and 30')
    .optional(),
  startDate: z
    .string()
    .datetime('Invalid start date format')
    .optional(),
  endDate: z
    .string()
    .datetime('Invalid end date format')
    .optional()
});

// Tajweed Report Schema
export const tajweedReportSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  ayahNumber: z
    .number()
    .int('Ayah number must be an integer')
    .min(1, 'Ayah number must be positive'),
  mistakes: z.array(
    z.object({
      type: z.enum([
        'pronunciation',
        'tajweed_rule',
        'rhythm',
        'pause',
        'stress',
        'vowel_length'
      ]),
      position: z
        .number()
        .int('Position must be an integer')
        .min(0, 'Position must be non-negative'),
      description: z.string().min(1, 'Description is required'),
      severity: z.enum(['minor', 'moderate', 'major']),
      suggestion: z.string().optional()
    })
  ).optional(),
  overallScore: z
    .number()
    .min(0, 'Score must be between 0 and 100')
    .max(100, 'Score must be between 0 and 100'),
  feedback: z
    .string()
    .max(500, 'Feedback must not exceed 500 characters')
    .optional()
});

// Memorization Progress Schema
export const memorizationProgressSchema = z.object({
  surahNumber: z
    .number()
    .int('Surah number must be an integer')
    .min(1, 'Surah number must be between 1 and 114')
    .max(114, 'Surah number must be between 1 and 114'),
  memorizedAyahs: z
    .array(z.number().int().min(1))
    .min(1, 'At least one ayah must be memorized'),
  accuracy: z
    .number()
    .min(0, 'Accuracy must be between 0 and 100')
    .max(100, 'Accuracy must be between 0 and 100'),
  testDate: z
    .string()
    .datetime('Invalid test date format')
    .optional(),
  notes: z
    .string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional()
});

// Recitation Upload Schema
export const recitationUploadSchema = z.object({
  surahNumber: z
    .number()
    .int('Surah number must be an integer')
    .min(1, 'Surah number must be between 1 and 114')
    .max(114, 'Surah number must be between 1 and 114'),
  startAyah: z
    .number()
    .int('Start ayah must be an integer')
    .min(1, 'Start ayah must be positive'),
  endAyah: z
    .number()
    .int('End ayah must be an integer')
    .min(1, 'End ayah must be positive'),
  audioFile: z.any().refine(
    (file) => {
      if (!file) return false;
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac'];
      const maxSize = 50 * 1024 * 1024; // 50MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    },
    {
      message: 'File must be a valid audio format (MP3, WAV, OGG, AAC) and under 50MB'
    }
  ),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
});

// Type exports
export type ReadingSessionInput = z.infer<typeof readingSessionSchema>;
export type UpdateReadingProgressInput = z.infer<typeof updateReadingProgressSchema>;
export type CompleteReadingSessionInput = z.infer<typeof completeReadingSessionSchema>;
export type QuranSearchInput = z.infer<typeof quranSearchSchema>;
export type AudioPlaybackInput = z.infer<typeof audioPlaybackSchema>;
export type QuranContentQueryInput = z.infer<typeof quranContentQuerySchema>;
export type ReadingStatsQueryInput = z.infer<typeof readingStatsQuerySchema>;
export type TajweedReportInput = z.infer<typeof tajweedReportSchema>;
export type MemorizationProgressInput = z.infer<typeof memorizationProgressSchema>;
export type RecitationUploadInput = z.infer<typeof recitationUploadSchema>;

// Response Schemas
export const surahResponseSchema = z.object({
  number: z.number(),
  name: z.string(),
  englishName: z.string(),
  numberOfAyahs: z.number(),
  revelationType: z.enum(['Meccan', 'Medinan']),
  ayahs: z.array(
    z.object({
      number: z.number(),
      text: z.string(),
      numberInSurah: z.number(),
      juz: z.number(),
      manzil: z.number(),
      page: z.number(),
      ruku: z.number(),
      hizbQuarter: z.number(),
      sajda: z.object({
        id: z.number(),
        recommended: z.boolean(),
        obligatory: z.boolean()
      }).optional()
    })
  ),
  translations: z.array(
    z.object({
      ayahNumber: z.number(),
      text: z.string(),
      translation: z.string(),
      translationId: z.string()
    })
  ).optional(),
  audio: z.object({
    surahNumber: z.number(),
    reciterId: z.string(),
    url: z.string(),
    duration: z.number(),
    fileSize: z.number(),
    format: z.enum(['mp3', 'ogg', 'aac'])
  }).optional()
});

export const juzResponseSchema = z.object({
  number: z.number(),
  surahs: z.array(
    z.object({
      surahNumber: z.number(),
      startAyah: z.number(),
      endAyah: z.number()
    })
  ),
  ayahs: z.array(
    z.object({
      surahNumber: z.number(),
      number: z.number(),
      text: z.string(),
      numberInSurah: z.number(),
      juz: z.number(),
      manzil: z.number(),
      page: z.number(),
      ruku: z.number(),
      hizbQuarter: z.number()
    })
  ),
  translations: z.array(
    z.object({
      surahNumber: z.number(),
      ayahNumber: z.number(),
      text: z.string(),
      translation: z.string(),
      translationId: z.string()
    })
  ).optional()
});

export type SurahResponse = z.infer<typeof surahResponseSchema>;
export type JuzResponse = z.infer<typeof juzResponseSchema>;