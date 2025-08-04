export interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: RevelationType;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda?: SajdaInfo;
}

export interface SajdaInfo {
  id: number;
  recommended: boolean;
  obligatory: boolean;
}

export interface Juz {
  number: number;
  surahs: JuzSurah[];
}

export interface JuzSurah {
  surahNumber: number;
  startAyah: number;
  endAyah: number;
}

export interface Hizb {
  number: number;
  quarters: HizbQuarter[];
}

export interface HizbQuarter {
  number: number;
  surahNumber: number;
  ayahNumber: number;
}

export interface Translation {
  id: string;
  name: string;
  author: string;
  language: string;
  direction: TextDirection;
}

export interface TranslatedAyah {
  ayahNumber: number;
  text: string;
  translation: string;
  translationId: string;
}

export interface Reciter {
  id: string;
  name: string;
  style: RecitationStyle;
  language: string;
  bitrate: string;
}

export interface AudioFile {
  surahNumber: number;
  reciterId: string;
  url: string;
  duration: number;
  fileSize: number;
  format: AudioFormat;
}

export interface ReadingSession {
  _id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  totalDuration: number; // in seconds
  surahsRead: ReadingSurah[];
  totalAyahsRead: number;
  points: number;
  completed: boolean;
}

export interface ReadingSurah {
  surahNumber: number;
  startAyah: number;
  endAyah: number;
  completedAyahs: number[];
  timeSpent: number; // in seconds
}

export interface QuranContent {
  surah: Surah;
  ayahs: Ayah[];
  translations?: TranslatedAyah[];
  audio?: AudioFile;
}

export interface SearchResult {
  surahNumber: number;
  ayahNumber: number;
  text: string;
  translation?: string;
  context: string;
}

export interface QuranNavigationItem {
  type: NavigationType;
  number: number;
  name: string;
  arabicName?: string;
  progress: number; // percentage completed
  isCompleted: boolean;
}

export enum RevelationType {
  MECCAN = 'Meccan',
  MEDINAN = 'Medinan'
}

export enum TextDirection {
  RTL = 'rtl',
  LTR = 'ltr'
}

export enum RecitationStyle {
  HAFS = 'Hafs',
  WARSH = 'Warsh',
  QALUN = 'Qalun'
}

export enum AudioFormat {
  MP3 = 'mp3',
  OGG = 'ogg',
  AAC = 'aac'
}

export enum NavigationType {
  JUZ = 'juz',
  SURAH = 'surah',
  HIZB = 'hizb'
}

export interface QuranStats {
  totalSurahs: number;
  totalAyahs: number;
  totalJuz: number;
  totalHizb: number;
  availableTranslations: number;
  availableReciters: number;
}