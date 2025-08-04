/**
 * Application constants for the Quran reading app
 */

// API Constants (for backwards compatibility - use api.config.ts for new APIs)
export const LEGACY_API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    GOOGLE: '/auth/google'
  },
  USER: {
    PROFILE: '/user/profile',
    PREFERENCES: '/user/preferences',
    AVATAR: '/user/avatar',
    PASSWORD: '/user/password',
    ACCOUNT: '/user/account'
  },
  QURAN: {
    JUZ: '/quran/juz',
    SURAH: '/quran/surah',
    AYAH: '/quran/ayah',
    TRANSLATIONS: '/quran/translations',
    RECITERS: '/quran/reciters',
    AUDIO: '/quran/audio'
  },
  READING: {
    SESSION: '/reading/session',
    HISTORY: '/reading/history',
    STATS: '/reading/stats'
  },
  BOOKMARKS: {
    BASE: '/bookmarks'
  },
  REWARDS: {
    BALANCE: '/rewards/balance',
    HISTORY: '/rewards/history',
    CLAIM: '/rewards/claim',
    WITHDRAW: '/rewards/withdraw',
    LEADERBOARD: '/rewards/leaderboard'
  },
  BADGES: {
    BASE: '/badges',
    AVAILABLE: '/badges/available',
    CLAIM: '/badges/claim'
  },
  SOCIAL: {
    FRIENDS: '/social/friends',
    LEADERBOARD: '/social/leaderboard'
  },
  ACHIEVEMENTS: {
    BASE: '/achievements',
    AVAILABLE: '/achievements/available'
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    SETTINGS: '/notifications/settings'
  },
  ANALYTICS: {
    EVENT: '/analytics/event',
    DASHBOARD: '/analytics/dashboard',
    INSIGHTS: '/analytics/insights'
  }
} as const;

// Quran Constants
export const QURAN_INFO = {
  TOTAL_SURAHS: 114,
  TOTAL_JUZ: 30,
  TOTAL_HIZB: 60,
  TOTAL_AYAHS: 6236,
  TOTAL_PAGES: 604
} as const;

export const SURAH_NAMES = [
  { number: 1, arabic: 'الفاتحة', english: 'Al-Fatihah', ayahs: 7 },
  { number: 2, arabic: 'البقرة', english: 'Al-Baqarah', ayahs: 286 },
  { number: 3, arabic: 'آل عمران', english: 'Ali \'Imran', ayahs: 200 },
  { number: 4, arabic: 'النساء', english: 'An-Nisa', ayahs: 176 },
  { number: 5, arabic: 'المائدة', english: 'Al-Ma\'idah', ayahs: 120 },
  { number: 6, arabic: 'الأنعام', english: 'Al-An\'am', ayahs: 165 },
  { number: 7, arabic: 'الأعراف', english: 'Al-A\'raf', ayahs: 206 },
  { number: 8, arabic: 'الأنفال', english: 'Al-Anfal', ayahs: 75 },
  { number: 9, arabic: 'التوبة', english: 'At-Tawbah', ayahs: 129 },
  { number: 10, arabic: 'يونس', english: 'Yunus', ayahs: 109 },
  // ... (continuing with all 114 surahs - truncated for brevity)
] as const;

export const JUZ_INFO = [
  { number: 1, arabic: 'الأول', startSurah: 1, startAyah: 1, endSurah: 2, endAyah: 141 },
  { number: 2, arabic: 'الثاني', startSurah: 2, startAyah: 142, endSurah: 2, endAyah: 252 },
  { number: 3, arabic: 'الثالث', startSurah: 2, startAyah: 253, endSurah: 3, endAyah: 92 },
  // ... (continuing with all 30 juz - truncated for brevity)
] as const;

// User Constants
export const USER_CONSTANTS = {
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 20,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MAX_PROFILE_PICTURE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
  DEFAULT_AVATAR: '/images/default-avatar.png'
} as const;

// Reward Constants
export const REWARD_CONSTANTS = {
  POINTS_PER_AYAH: 1,
  POINTS_PER_SURAH_COMPLETION: 50,
  POINTS_PER_JUZ_COMPLETION: 300,
  DAILY_STREAK_BONUS: 10,
  WEEKLY_STREAK_BONUS: 50,
  MONTHLY_STREAK_BONUS: 200,
  PERFECT_RECITATION_BONUS: 25,
  FIRST_TIME_BONUS: 100,
  REFERRAL_BONUS: 500,
  MIN_WITHDRAWAL_AMOUNT: 100,
  MAX_WITHDRAWAL_AMOUNT: 10000,
  WITHDRAWAL_FEE_PERCENTAGE: 2.5
} as const;

// Reading Constants
export const READING_CONSTANTS = {
  MIN_READING_SESSION: 30, // seconds
  MAX_READING_SESSION: 14400, // 4 hours
  AUTO_SAVE_INTERVAL: 30, // seconds
  SESSION_TIMEOUT: 1800, // 30 minutes
  MAX_BOOKMARKS_PER_USER: 1000,
  MAX_NOTE_LENGTH: 500
} as const;

// Audio Constants
export const AUDIO_CONSTANTS = {
  SUPPORTED_FORMATS: ['mp3', 'ogg', 'aac'],
  DEFAULT_PLAYBACK_SPEED: 1.0,
  MIN_PLAYBACK_SPEED: 0.5,
  MAX_PLAYBACK_SPEED: 2.0,
  PLAYBACK_SPEED_STEP: 0.25,
  DEFAULT_VOLUME: 0.8,
  BUFFER_SIZE: 1024 * 1024, // 1MB
  MAX_FILE_SIZE: 50 * 1024 * 1024 // 50MB
} as const;

// Language Constants
export const SUPPORTED_LANGUAGES = [
  { code: 'ar', name: 'العربية', direction: 'rtl' },
  { code: 'en', name: 'English', direction: 'ltr' },
  { code: 'fr', name: 'Français', direction: 'ltr' },
  { code: 'es', name: 'Español', direction: 'ltr' },
  { code: 'de', name: 'Deutsch', direction: 'ltr' },
  { code: 'tr', name: 'Türkçe', direction: 'ltr' },
  { code: 'ur', name: 'اردو', direction: 'rtl' },
  { code: 'fa', name: 'فارسی', direction: 'rtl' },
  { code: 'id', name: 'Bahasa Indonesia', direction: 'ltr' },
  { code: 'ms', name: 'Bahasa Melayu', direction: 'ltr' }
] as const;

// Translation Constants
export const POPULAR_TRANSLATIONS = [
  { id: 'sahih_international', name: 'Sahih International', language: 'en' },
  { id: 'pickthall', name: 'Pickthall', language: 'en' },
  { id: 'yusuf_ali', name: 'Yusuf Ali', language: 'en' },
  { id: 'french_hamidullah', name: 'Hamidullah', language: 'fr' },
  { id: 'spanish_cortes', name: 'Cortés', language: 'es' },
  { id: 'german_bubenheim', name: 'Bubenheim & Elyas', language: 'de' },
  { id: 'turkish_diyanet', name: 'Diyanet İşleri', language: 'tr' },
  { id: 'urdu_jalandhari', name: 'Jalandhri', language: 'ur' },
  { id: 'indonesian_affairs', name: 'Indonesian Ministry of Religious Affairs', language: 'id' }
] as const;

// Reciter Constants
export const POPULAR_RECITERS = [
  { id: 'abdul_basit', name: 'عبد الباسط عبد الصمد', style: 'Hafs' },
  { id: 'mishary_rashid', name: 'مشاري بن راشد العفاسي', style: 'Hafs' },
  { id: 'saad_alghamdi', name: 'سعد الغامدي', style: 'Hafs' },
  { id: 'maher_almuaiqly', name: 'ماهر المعيقلي', style: 'Hafs' },
  { id: 'abdul_rahman_alsudais', name: 'عبد الرحمن السديس', style: 'Hafs' },
  { id: 'saud_alshuraim', name: 'سعود الشريم', style: 'Hafs' },
  { id: 'omar_alkazabri', name: 'عمر القزابري', style: 'Warsh' },
  { id: 'nasser_alqatami', name: 'ناصر القطامي', style: 'Hafs' }
] as const;

// Badge Constants
export const BADGE_CATEGORIES = {
  READING: 'reading',
  COMPLETION: 'completion',
  STREAK: 'streak',
  SOCIAL: 'social',
  SPECIAL: 'special'
} as const;

export const BADGE_RARITIES = {
  COMMON: { name: 'Common', color: '#6B7280' },
  UNCOMMON: { name: 'Uncommon', color: '#10B981' },
  RARE: { name: 'Rare', color: '#3B82F6' },
  EPIC: { name: 'Epic', color: '#8B5CF6' },
  LEGENDARY: { name: 'Legendary', color: '#F59E0B' }
} as const;

// Analytics Constants
export const ANALYTICS_EVENTS = {
  USER_REGISTRATION: 'user_registration',
  USER_LOGIN: 'user_login',
  READING_SESSION_START: 'reading_session_start',
  READING_SESSION_END: 'reading_session_end',
  SURAH_COMPLETED: 'surah_completed',
  JUZ_COMPLETED: 'juz_completed',
  BOOKMARK_CREATED: 'bookmark_created',
  REWARD_EARNED: 'reward_earned',
  BADGE_EARNED: 'badge_earned',
  WITHDRAWAL_REQUESTED: 'withdrawal_requested',
  AUDIO_PLAYED: 'audio_played',
  TRANSLATION_VIEWED: 'translation_viewed',
  SHARE_AYAH: 'share_ayah',
  SEARCH_PERFORMED: 'search_performed'
} as const;

// Notification Constants
export const NOTIFICATION_TYPES = {
  REWARD_EARNED: 'reward_earned',
  BADGE_EARNED: 'badge_earned',
  STREAK_MILESTONE: 'streak_milestone',
  FRIEND_REQUEST: 'friend_request',
  LEADERBOARD_UPDATE: 'leaderboard_update',
  READING_REMINDER: 'reading_reminder',
  WITHDRAWAL_STATUS: 'withdrawal_status',
  SYSTEM_ANNOUNCEMENT: 'system_announcement'
} as const;

// Error Constants
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INVALID_WALLET_ADDRESS: 'INVALID_WALLET_ADDRESS',
  BLOCKCHAIN_ERROR: 'BLOCKCHAIN_ERROR'
} as const;

// Status Constants (for backwards compatibility - use api.config.ts for new status codes)
export const LEGACY_STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  RATE_LIMITED: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

// Cache Constants
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  USER_STATS: 'user_stats',
  QURAN_CONTENT: 'quran_content',
  TRANSLATIONS: 'translations',
  RECITERS: 'reciters',
  LEADERBOARD: 'leaderboard',
  BADGES: 'badges',
  REWARDS_BALANCE: 'rewards_balance'
} as const;

export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400 // 24 hours
} as const;

// Pagination Constants (for backwards compatibility - use api.config.ts for new pagination)
export const LEGACY_PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5
} as const;

// File Upload Constants
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'audio/mpeg',
    'audio/ogg',
    'audio/aac'
  ]
} as const;

// Date/Time Constants
export const DATE_FORMATS = {
  SHORT: 'MM/dd/yyyy',
  MEDIUM: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  FULL: 'EEEE, MMMM dd, yyyy'
} as const;

export const TIME_FORMATS = {
  SHORT: 'HH:mm',
  MEDIUM: 'HH:mm:ss',
  LONG: 'HH:mm:ss z'
} as const;