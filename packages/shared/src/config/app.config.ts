/**
 * Application configuration for the Quran reading app
 */

// Environment variables helper
const getEnvVar = (key: string, defaultValue?: string): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue || '';
  }
  return defaultValue || '';
};

const getBooleanEnvVar = (key: string, defaultValue: boolean = false): boolean => {
  const value = getEnvVar(key);
  return value ? value.toLowerCase() === 'true' : defaultValue;
};

const getNumberEnvVar = (key: string, defaultValue: number = 0): number => {
  const value = getEnvVar(key);
  return value ? parseInt(value, 10) || defaultValue : defaultValue;
};

// Application Information
export const APP_INFO = {
  NAME: 'Quran Reader',
  VERSION: getEnvVar('REACT_APP_VERSION', '1.0.0'),
  DESCRIPTION: 'A comprehensive Quran reading app with blockchain rewards',
  AUTHOR: 'Reciter App Team',
  LICENSE: 'MIT',
  REPOSITORY: 'https://github.com/reciterapp/quran-reader',
  WEBSITE: 'https://quranreader.app',
  SUPPORT_EMAIL: 'support@quranreader.app',
  PRIVACY_POLICY: 'https://quranreader.app/privacy',
  TERMS_OF_SERVICE: 'https://quranreader.app/terms'
} as const;

// Environment Configuration
export const ENV_CONFIG = {
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  IS_DEVELOPMENT: getEnvVar('NODE_ENV', 'development') === 'development',
  IS_PRODUCTION: getEnvVar('NODE_ENV', 'development') === 'production',
  IS_TEST: getEnvVar('NODE_ENV', 'development') === 'test',
  BUILD_VERSION: getEnvVar('REACT_APP_BUILD_VERSION', 'dev'),
  BUILD_TIMESTAMP: getEnvVar('REACT_APP_BUILD_TIMESTAMP', new Date().toISOString())
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: getBooleanEnvVar('REACT_APP_ENABLE_ANALYTICS', true),
  ENABLE_PUSH_NOTIFICATIONS: getBooleanEnvVar('REACT_APP_ENABLE_PUSH_NOTIFICATIONS', true),
  ENABLE_OFFLINE_MODE: getBooleanEnvVar('REACT_APP_ENABLE_OFFLINE_MODE', false),
  ENABLE_DARK_MODE: getBooleanEnvVar('REACT_APP_ENABLE_DARK_MODE', true),
  ENABLE_REWARDS_SYSTEM: getBooleanEnvVar('REACT_APP_ENABLE_REWARDS_SYSTEM', true),
  ENABLE_SOCIAL_FEATURES: getBooleanEnvVar('REACT_APP_ENABLE_SOCIAL_FEATURES', true),
  ENABLE_AUDIO_PLAYBACK: getBooleanEnvVar('REACT_APP_ENABLE_AUDIO_PLAYBACK', true),
  ENABLE_MEMORIZATION_MODE: getBooleanEnvVar('REACT_APP_ENABLE_MEMORIZATION_MODE', false),
  ENABLE_TAJWEED_HIGHLIGHTING: getBooleanEnvVar('REACT_APP_ENABLE_TAJWEED_HIGHLIGHTING', false),
  ENABLE_LIVE_TRANSLATION: getBooleanEnvVar('REACT_APP_ENABLE_LIVE_TRANSLATION', false),
  ENABLE_VOICE_RECOGNITION: getBooleanEnvVar('REACT_APP_ENABLE_VOICE_RECOGNITION', false),
  ENABLE_BETA_FEATURES: getBooleanEnvVar('REACT_APP_ENABLE_BETA_FEATURES', false)
} as const;

// UI Configuration
export const UI_CONFIG = {
  THEME: {
    DEFAULT_THEME: getEnvVar('REACT_APP_DEFAULT_THEME', 'light'),
    ENABLE_SYSTEM_THEME: getBooleanEnvVar('REACT_APP_ENABLE_SYSTEM_THEME', true),
    ENABLE_THEME_SWITCHING: getBooleanEnvVar('REACT_APP_ENABLE_THEME_SWITCHING', true)
  },
  LAYOUT: {
    SIDEBAR_WIDTH: getNumberEnvVar('REACT_APP_SIDEBAR_WIDTH', 280),
    HEADER_HEIGHT: getNumberEnvVar('REACT_APP_HEADER_HEIGHT', 64),
    FOOTER_HEIGHT: getNumberEnvVar('REACT_APP_FOOTER_HEIGHT', 48),
    MOBILE_BREAKPOINT: getNumberEnvVar('REACT_APP_MOBILE_BREAKPOINT', 768),
    TABLET_BREAKPOINT: getNumberEnvVar('REACT_APP_TABLET_BREAKPOINT', 1024)
  },
  ANIMATION: {
    ENABLE_ANIMATIONS: getBooleanEnvVar('REACT_APP_ENABLE_ANIMATIONS', true),
    ANIMATION_DURATION: getNumberEnvVar('REACT_APP_ANIMATION_DURATION', 300),
    ENABLE_REDUCED_MOTION: getBooleanEnvVar('REACT_APP_ENABLE_REDUCED_MOTION', false)
  },
  FONTS: {
    ARABIC_FONT_FAMILY: getEnvVar('REACT_APP_ARABIC_FONT_FAMILY', 'Uthmanic'),
    DEFAULT_FONT_FAMILY: getEnvVar('REACT_APP_DEFAULT_FONT_FAMILY', 'Inter, system-ui, sans-serif'),
    FONT_SIZE_BASE: getNumberEnvVar('REACT_APP_FONT_SIZE_BASE', 16),
    ENABLE_FONT_SCALING: getBooleanEnvVar('REACT_APP_ENABLE_FONT_SCALING', true)
  }
} as const;

// Reading Configuration
export const READING_CONFIG = {
  DEFAULT_TRANSLATION: getEnvVar('REACT_APP_DEFAULT_TRANSLATION', 'sahih_international'),
  DEFAULT_RECITER: getEnvVar('REACT_APP_DEFAULT_RECITER', 'abdul_basit'),
  DEFAULT_PLAYBACK_SPEED: parseFloat(getEnvVar('REACT_APP_DEFAULT_PLAYBACK_SPEED', '1.0')),
  AUTO_SCROLL_ENABLED: getBooleanEnvVar('REACT_APP_AUTO_SCROLL_ENABLED', true),
  AUTO_SCROLL_SPEED: getNumberEnvVar('REACT_APP_AUTO_SCROLL_SPEED', 50),
  HIGHLIGHT_CURRENT_AYAH: getBooleanEnvVar('REACT_APP_HIGHLIGHT_CURRENT_AYAH', true),
  SHOW_AYAH_NUMBERS: getBooleanEnvVar('REACT_APP_SHOW_AYAH_NUMBERS', true),
  SHOW_TRANSLATION: getBooleanEnvVar('REACT_APP_SHOW_TRANSLATION', true),
  ENABLE_NIGHT_MODE: getBooleanEnvVar('REACT_APP_ENABLE_NIGHT_MODE', true),
  VERSE_BY_VERSE_MODE: getBooleanEnvVar('REACT_APP_VERSE_BY_VERSE_MODE', false),
  AUTO_SAVE_PROGRESS: getBooleanEnvVar('REACT_APP_AUTO_SAVE_PROGRESS', true),
  AUTO_SAVE_INTERVAL: getNumberEnvVar('REACT_APP_AUTO_SAVE_INTERVAL', 30000) // 30 seconds
} as const;

// Offline Configuration
export const OFFLINE_CONFIG = {
  ENABLE_SERVICE_WORKER: getBooleanEnvVar('REACT_APP_ENABLE_SERVICE_WORKER', true),
  CACHE_STRATEGY: getEnvVar('REACT_APP_CACHE_STRATEGY', 'cache_first'),
  CACHE_EXPIRY_DAYS: getNumberEnvVar('REACT_APP_CACHE_EXPIRY_DAYS', 7),
  MAX_CACHE_SIZE_MB: getNumberEnvVar('REACT_APP_MAX_CACHE_SIZE_MB', 100),
  PRELOAD_ESSENTIAL_CONTENT: getBooleanEnvVar('REACT_APP_PRELOAD_ESSENTIAL_CONTENT', true),
  SYNC_WHEN_ONLINE: getBooleanEnvVar('REACT_APP_SYNC_WHEN_ONLINE', true)
} as const;

// Performance Configuration
export const PERFORMANCE_CONFIG = {
  ENABLE_LAZY_LOADING: getBooleanEnvVar('REACT_APP_ENABLE_LAZY_LOADING', true),
  ENABLE_CODE_SPLITTING: getBooleanEnvVar('REACT_APP_ENABLE_CODE_SPLITTING', true),
  ENABLE_IMAGE_OPTIMIZATION: getBooleanEnvVar('REACT_APP_ENABLE_IMAGE_OPTIMIZATION', true),
  DEBOUNCE_DELAY: getNumberEnvVar('REACT_APP_DEBOUNCE_DELAY', 300),
  THROTTLE_DELAY: getNumberEnvVar('REACT_APP_THROTTLE_DELAY', 100),
  VIRTUAL_SCROLLING_THRESHOLD: getNumberEnvVar('REACT_APP_VIRTUAL_SCROLLING_THRESHOLD', 100),
  PRELOAD_PAGES: getNumberEnvVar('REACT_APP_PRELOAD_PAGES', 3)
} as const;

// Storage Configuration
export const STORAGE_CONFIG = {
  USE_LOCAL_STORAGE: getBooleanEnvVar('REACT_APP_USE_LOCAL_STORAGE', true),
  USE_SESSION_STORAGE: getBooleanEnvVar('REACT_APP_USE_SESSION_STORAGE', true),
  USE_INDEXED_DB: getBooleanEnvVar('REACT_APP_USE_INDEXED_DB', true),
  ENCRYPT_SENSITIVE_DATA: getBooleanEnvVar('REACT_APP_ENCRYPT_SENSITIVE_DATA', false),
  STORAGE_QUOTA_MB: getNumberEnvVar('REACT_APP_STORAGE_QUOTA_MB', 50),
  CLEANUP_OLD_DATA: getBooleanEnvVar('REACT_APP_CLEANUP_OLD_DATA', true),
  DATA_RETENTION_DAYS: getNumberEnvVar('REACT_APP_DATA_RETENTION_DAYS', 30)
} as const;

// Security Configuration
export const SECURITY_CONFIG = {
  ENABLE_CSP: getBooleanEnvVar('REACT_APP_ENABLE_CSP', true),
  ENABLE_CORS: getBooleanEnvVar('REACT_APP_ENABLE_CORS', true),
  TOKEN_REFRESH_THRESHOLD: getNumberEnvVar('REACT_APP_TOKEN_REFRESH_THRESHOLD', 300000), // 5 minutes
  MAX_LOGIN_ATTEMPTS: getNumberEnvVar('REACT_APP_MAX_LOGIN_ATTEMPTS', 5),
  LOCKOUT_DURATION: getNumberEnvVar('REACT_APP_LOCKOUT_DURATION', 900000), // 15 minutes
  ENABLE_2FA: getBooleanEnvVar('REACT_APP_ENABLE_2FA', false),
  SESSION_TIMEOUT: getNumberEnvVar('REACT_APP_SESSION_TIMEOUT', 3600000), // 1 hour
  IDLE_TIMEOUT: getNumberEnvVar('REACT_APP_IDLE_TIMEOUT', 1800000) // 30 minutes
} as const;

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  ENABLE_BROWSER_NOTIFICATIONS: getBooleanEnvVar('REACT_APP_ENABLE_BROWSER_NOTIFICATIONS', true),
  ENABLE_EMAIL_NOTIFICATIONS: getBooleanEnvVar('REACT_APP_ENABLE_EMAIL_NOTIFICATIONS', true),
  ENABLE_PUSH_NOTIFICATIONS: getBooleanEnvVar('REACT_APP_ENABLE_PUSH_NOTIFICATIONS', false),
  DEFAULT_NOTIFICATION_DURATION: getNumberEnvVar('REACT_APP_DEFAULT_NOTIFICATION_DURATION', 5000),
  MAX_NOTIFICATIONS: getNumberEnvVar('REACT_APP_MAX_NOTIFICATIONS', 5),
  ENABLE_SOUND: getBooleanEnvVar('REACT_APP_ENABLE_NOTIFICATION_SOUND', true),
  VAPID_PUBLIC_KEY: getEnvVar('REACT_APP_VAPID_PUBLIC_KEY')
} as const;

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  GOOGLE_ANALYTICS_ID: getEnvVar('REACT_APP_GOOGLE_ANALYTICS_ID'),
  FACEBOOK_PIXEL_ID: getEnvVar('REACT_APP_FACEBOOK_PIXEL_ID'),
  HOTJAR_ID: getEnvVar('REACT_APP_HOTJAR_ID'),
  MIXPANEL_TOKEN: getEnvVar('REACT_APP_MIXPANEL_TOKEN'),
  ENABLE_ERROR_TRACKING: getBooleanEnvVar('REACT_APP_ENABLE_ERROR_TRACKING', true),
  SENTRY_DSN: getEnvVar('REACT_APP_SENTRY_DSN'),
  TRACK_USER_INTERACTIONS: getBooleanEnvVar('REACT_APP_TRACK_USER_INTERACTIONS', true),
  SAMPLE_RATE: parseFloat(getEnvVar('REACT_APP_ANALYTICS_SAMPLE_RATE', '1.0'))
} as const;

// Blockchain Configuration
export const BLOCKCHAIN_CONFIG = {
  SOLANA_NETWORK: getEnvVar('REACT_APP_SOLANA_NETWORK', 'devnet'),
  SOLANA_RPC_URL: getEnvVar('REACT_APP_SOLANA_RPC_URL', 'https://api.devnet.solana.com'),
  PROGRAM_ID: getEnvVar('REACT_APP_PROGRAM_ID'),
  TOKEN_MINT: getEnvVar('REACT_APP_TOKEN_MINT'),
  ENABLE_WALLET_ADAPTER: getBooleanEnvVar('REACT_APP_ENABLE_WALLET_ADAPTER', true),
  AUTO_CONNECT_WALLET: getBooleanEnvVar('REACT_APP_AUTO_CONNECT_WALLET', false),
  WALLET_CONNECTION_TIMEOUT: getNumberEnvVar('REACT_APP_WALLET_CONNECTION_TIMEOUT', 30000),
  GAS_PRICE_MULTIPLIER: parseFloat(getEnvVar('REACT_APP_GAS_PRICE_MULTIPLIER', '1.0'))
} as const;

// Social Configuration
export const SOCIAL_CONFIG = {
  ENABLE_SHARING: getBooleanEnvVar('REACT_APP_ENABLE_SHARING', true),
  FACEBOOK_APP_ID: getEnvVar('REACT_APP_FACEBOOK_APP_ID'),
  TWITTER_HANDLE: getEnvVar('REACT_APP_TWITTER_HANDLE', '@QuranReaderApp'),
  DISCORD_INVITE_URL: getEnvVar('REACT_APP_DISCORD_INVITE_URL'),
  TELEGRAM_CHANNEL: getEnvVar('REACT_APP_TELEGRAM_CHANNEL'),
  DEFAULT_SHARE_MESSAGE: getEnvVar('REACT_APP_DEFAULT_SHARE_MESSAGE', 'Check out this amazing Quran verse!'),
  ENABLE_COMMENTS: getBooleanEnvVar('REACT_APP_ENABLE_COMMENTS', false),
  ENABLE_RATINGS: getBooleanEnvVar('REACT_APP_ENABLE_RATINGS', false)
} as const;

// Localization Configuration
export const LOCALIZATION_CONFIG = {
  DEFAULT_LANGUAGE: getEnvVar('REACT_APP_DEFAULT_LANGUAGE', 'en'),
  FALLBACK_LANGUAGE: getEnvVar('REACT_APP_FALLBACK_LANGUAGE', 'en'),
  SUPPORTED_LANGUAGES: getEnvVar('REACT_APP_SUPPORTED_LANGUAGES', 'en,ar,fr,es,de,tr,ur,id').split(','),
  ENABLE_RTL: getBooleanEnvVar('REACT_APP_ENABLE_RTL', true),
  AUTO_DETECT_LANGUAGE: getBooleanEnvVar('REACT_APP_AUTO_DETECT_LANGUAGE', true),
  LOAD_TRANSLATIONS_ASYNC: getBooleanEnvVar('REACT_APP_LOAD_TRANSLATIONS_ASYNC', true),
  TRANSLATION_NAMESPACE: getEnvVar('REACT_APP_TRANSLATION_NAMESPACE', 'common')
} as const;

// Development Configuration
export const DEV_CONFIG = {
  ENABLE_LOGGER: getBooleanEnvVar('REACT_APP_ENABLE_LOGGER', ENV_CONFIG.IS_DEVELOPMENT),
  LOG_LEVEL: getEnvVar('REACT_APP_LOG_LEVEL', 'info'),
  ENABLE_REDUX_DEVTOOLS: getBooleanEnvVar('REACT_APP_ENABLE_REDUX_DEVTOOLS', ENV_CONFIG.IS_DEVELOPMENT),
  ENABLE_REACT_DEVTOOLS: getBooleanEnvVar('REACT_APP_ENABLE_REACT_DEVTOOLS', ENV_CONFIG.IS_DEVELOPMENT),
  SHOW_DEBUG_INFO: getBooleanEnvVar('REACT_APP_SHOW_DEBUG_INFO', ENV_CONFIG.IS_DEVELOPMENT),
  MOCK_API_CALLS: getBooleanEnvVar('REACT_APP_MOCK_API_CALLS', false),
  ENABLE_HOT_RELOAD: getBooleanEnvVar('REACT_APP_ENABLE_HOT_RELOAD', ENV_CONFIG.IS_DEVELOPMENT),
  SKIP_PREFLIGHT_CHECK: getBooleanEnvVar('SKIP_PREFLIGHT_CHECK', false)
} as const;

// PWA Configuration
export const PWA_CONFIG = {
  ENABLE_PWA: getBooleanEnvVar('REACT_APP_ENABLE_PWA', true),
  APP_NAME: getEnvVar('REACT_APP_PWA_NAME', APP_INFO.NAME),
  APP_SHORT_NAME: getEnvVar('REACT_APP_PWA_SHORT_NAME', 'QuranReader'),
  APP_DESCRIPTION: getEnvVar('REACT_APP_PWA_DESCRIPTION', APP_INFO.DESCRIPTION),
  THEME_COLOR: getEnvVar('REACT_APP_PWA_THEME_COLOR', '#5955DD'),
  BACKGROUND_COLOR: getEnvVar('REACT_APP_PWA_BACKGROUND_COLOR', '#FFFFFF'),
  START_URL: getEnvVar('REACT_APP_PWA_START_URL', '/'),
  DISPLAY_MODE: getEnvVar('REACT_APP_PWA_DISPLAY_MODE', 'standalone'),
  ORIENTATION: getEnvVar('REACT_APP_PWA_ORIENTATION', 'portrait')
} as const;

// Export all configurations
export const APP_CONFIG = {
  APP_INFO,
  ENV_CONFIG,
  FEATURE_FLAGS,
  UI_CONFIG,
  READING_CONFIG,
  OFFLINE_CONFIG,
  PERFORMANCE_CONFIG,
  STORAGE_CONFIG,
  SECURITY_CONFIG,
  NOTIFICATION_CONFIG,
  ANALYTICS_CONFIG,
  BLOCKCHAIN_CONFIG,
  SOCIAL_CONFIG,
  LOCALIZATION_CONFIG,
  DEV_CONFIG,
  PWA_CONFIG
} as const;

// Helper functions
export const isFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[feature];
};

export const getConfig = <T extends keyof typeof APP_CONFIG>(section: T): typeof APP_CONFIG[T] => {
  return APP_CONFIG[section];
};

export const isDevelopment = (): boolean => ENV_CONFIG.IS_DEVELOPMENT;
export const isProduction = (): boolean => ENV_CONFIG.IS_PRODUCTION;
export const isTest = (): boolean => ENV_CONFIG.IS_TEST;