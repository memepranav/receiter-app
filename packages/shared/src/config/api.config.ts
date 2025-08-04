/**
 * API configuration for the Quran reading app
 */

// Environment variables with defaults
const getEnvVar = (key: string, defaultValue?: string): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue || '';
  }
  return defaultValue || '';
};

// API Base URLs
export const API_CONFIG = {
  BASE_URL: getEnvVar('REACT_APP_API_BASE_URL', 'http://localhost:3000'),
  API_VERSION: getEnvVar('REACT_APP_API_VERSION', 'v1'),
  ADMIN_BASE_URL: getEnvVar('REACT_APP_ADMIN_API_BASE_URL', 'http://localhost:3000/admin'),
  WS_URL: getEnvVar('REACT_APP_WS_URL', 'ws://localhost:3000'),
  CDN_URL: getEnvVar('REACT_APP_CDN_URL', 'https://cdn.quranapp.com'),
  AUDIO_CDN_URL: getEnvVar('REACT_APP_AUDIO_CDN_URL', 'https://audio.quranapp.com'),
  IMAGE_CDN_URL: getEnvVar('REACT_APP_IMAGE_CDN_URL', 'https://images.quranapp.com')
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    GOOGLE: '/auth/google',
    TWO_FACTOR_SETUP: '/auth/2fa/setup',
    TWO_FACTOR_VERIFY: '/auth/2fa/verify',
    TWO_FACTOR_DISABLE: '/auth/2fa/disable'
  },

  // User Management
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    PREFERENCES: '/user/preferences',
    AVATAR: '/user/avatar',
    PASSWORD: '/user/password',
    ACCOUNT: '/user/account',
    PRIVACY_SETTINGS: '/user/privacy',
    NOTIFICATION_SETTINGS: '/user/notifications',
    WALLET: '/user/wallet',
    FRIENDS: '/user/friends',
    SEARCH: '/user/search'
  },

  // Quran Content
  QURAN: {
    SURAHS: '/quran/surahs',
    SURAH: (id: number) => `/quran/surah/${id}`,
    JUZ: (id: number) => `/quran/juz/${id}`,
    AYAH: (surah: number, ayah: number) => `/quran/ayah/${surah}/${ayah}`,
    SEARCH: '/quran/search',
    TRANSLATIONS: '/quran/translations',
    RECITERS: '/quran/reciters',
    AUDIO: (reciter: string, surah: number) => `/quran/audio/${reciter}/${surah}`,
    PAGE: (page: number) => `/quran/page/${page}`
  },

  // Reading Sessions
  READING: {
    START_SESSION: '/reading/session/start',
    UPDATE_PROGRESS: '/reading/session/progress',
    COMPLETE_SESSION: '/reading/session/complete',
    HISTORY: '/reading/history',
    STATS: '/reading/stats',
    CURRENT_SESSION: '/reading/session/current'
  },

  // Bookmarks
  BOOKMARKS: {
    LIST: '/bookmarks',
    CREATE: '/bookmarks',
    UPDATE: (id: string) => `/bookmarks/${id}`,
    DELETE: (id: string) => `/bookmarks/${id}`,
    BULK_DELETE: '/bookmarks/bulk-delete'
  },

  // Rewards & Blockchain
  REWARDS: {
    BALANCE: '/rewards/balance',
    HISTORY: '/rewards/history',
    CLAIM: '/rewards/claim',
    WITHDRAW: '/rewards/withdraw',
    WITHDRAWAL_STATUS: (id: string) => `/rewards/withdrawal/${id}`,
    LEADERBOARD: '/rewards/leaderboard',
    RULES: '/rewards/rules',
    STAKING: '/rewards/staking',
    UNSTAKING: '/rewards/unstaking'
  },

  // Badges & Achievements
  BADGES: {
    USER_BADGES: '/badges',
    AVAILABLE: '/badges/available',
    CLAIM: '/badges/claim',
    PROGRESS: '/badges/progress'
  },

  // Social Features
  SOCIAL: {
    FRIENDS: '/social/friends',
    FRIEND_REQUESTS: '/social/friend-requests',
    SEND_REQUEST: '/social/friend-requests/send',
    ACCEPT_REQUEST: (id: string) => `/social/friend-requests/${id}/accept`,
    REJECT_REQUEST: (id: string) => `/social/friend-requests/${id}/reject`,
    REMOVE_FRIEND: (id: string) => `/social/friends/${id}/remove`,
    LEADERBOARD: '/social/leaderboard'
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (id: string) => `/notifications/${id}`,
    SETTINGS: '/notifications/settings',
    SUBSCRIBE: '/notifications/subscribe',
    UNSUBSCRIBE: '/notifications/unsubscribe'
  },

  // Analytics
  ANALYTICS: {
    TRACK_EVENT: '/analytics/event',
    USER_DASHBOARD: '/analytics/dashboard',
    READING_INSIGHTS: '/analytics/insights/reading',
    PERFORMANCE: '/analytics/performance'
  },

  // Admin Endpoints
  ADMIN: {
    AUTH: {
      LOGIN: '/admin/auth/login',
      LOGOUT: '/admin/auth/logout',
      PROFILE: '/admin/auth/me'
    },
    USERS: {
      LIST: '/admin/users',
      GET: (id: string) => `/admin/users/${id}`,
      UPDATE: (id: string) => `/admin/users/${id}`,
      DELETE: (id: string) => `/admin/users/${id}`,
      SUSPEND: (id: string) => `/admin/users/${id}/suspend`,
      ACTIVATE: (id: string) => `/admin/users/${id}/activate`,
      EXPORT: '/admin/users/export',
      IMPORT: '/admin/users/import'
    },
    ANALYTICS: {
      OVERVIEW: '/admin/analytics/overview',
      USERS: '/admin/analytics/users',
      READING: '/admin/analytics/reading',
      REWARDS: '/admin/analytics/rewards',
      EXPORT: '/admin/analytics/export'
    },
    REWARDS: {
      PENDING: '/admin/rewards/pending',
      PROCESS: '/admin/rewards/process',
      RULES: '/admin/rewards/rules',
      CREATE_RULE: '/admin/rewards/rules',
      UPDATE_RULE: (id: string) => `/admin/rewards/rules/${id}`,
      DELETE_RULE: (id: string) => `/admin/rewards/rules/${id}`,
      TRANSACTIONS: '/admin/rewards/transactions',
      DISTRIBUTE: '/admin/rewards/distribute'
    },
    BADGES: {
      LIST: '/admin/badges',
      CREATE: '/admin/badges',
      UPDATE: (id: string) => `/admin/badges/${id}`,
      DELETE: (id: string) => `/admin/badges/${id}`
    },
    CONTENT: {
      QURAN: '/admin/content/quran',
      TRANSLATIONS: '/admin/content/translations',
      RECITERS: '/admin/content/reciters',
      UPLOAD_AUDIO: '/admin/content/audio/upload'
    },
    SETTINGS: {
      APP: '/admin/settings/app',
      NOTIFICATIONS: '/admin/settings/notifications',
      MAINTENANCE: '/admin/settings/maintenance'
    },
    LOGS: {
      SYSTEM: '/admin/logs/system',
      ERROR: '/admin/logs/error',
      AUDIT: '/admin/logs/audit'
    }
  }
} as const;

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
} as const;

// Request Configuration
export const REQUEST_CONFIG = {
  TIMEOUT: parseInt(getEnvVar('REACT_APP_REQUEST_TIMEOUT', '30000')), // 30 seconds
  RETRY_ATTEMPTS: parseInt(getEnvVar('REACT_APP_RETRY_ATTEMPTS', '3')),
  RETRY_DELAY: parseInt(getEnvVar('REACT_APP_RETRY_DELAY', '1000')), // 1 second
  MAX_CONCURRENT_REQUESTS: parseInt(getEnvVar('REACT_APP_MAX_CONCURRENT_REQUESTS', '10'))
} as const;

// Response Status Codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

// Content Types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
  HTML: 'text/html'
} as const;

// Request Headers
export const DEFAULT_HEADERS = {
  'Content-Type': CONTENT_TYPES.JSON,
  'Accept': CONTENT_TYPES.JSON,
  'X-Requested-With': 'XMLHttpRequest'
} as const;

// Auth Headers
export const AUTH_HEADERS = {
  AUTHORIZATION: 'Authorization',
  REFRESH_TOKEN: 'X-Refresh-Token',
  TWO_FACTOR_TOKEN: 'X-2FA-Token'
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  LONG_TTL: 60 * 60 * 1000, // 1 hour
  STATIC_TTL: 24 * 60 * 60 * 1000, // 24 hours
  MAX_CACHE_SIZE: 100, // Maximum number of cached items
  CACHE_KEYS: {
    USER_PROFILE: 'user_profile',
    USER_PREFERENCES: 'user_preferences',
    QURAN_CONTENT: 'quran_content',
    TRANSLATIONS: 'translations',
    RECITERS: 'reciters',
    BADGES: 'badges',
    LEADERBOARD: 'leaderboard'
  }
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An internal server error occurred. Please try again later.',
  RATE_LIMITED: 'Too many requests. Please wait before trying again.',
  OFFLINE: 'You are currently offline. Please check your internet connection.'
} as const;

// WebSocket Events
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  REWARD_EARNED: 'reward_earned',
  BADGE_EARNED: 'badge_earned',
  FRIEND_REQUEST: 'friend_request',
  LEADERBOARD_UPDATE: 'leaderboard_update',
  NOTIFICATION: 'notification',
  READING_SESSION_UPDATE: 'reading_session_update'
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
} as const;

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_AUDIO_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac'],
  UPLOAD_TIMEOUT: 60000 // 60 seconds
} as const;

// Development Configuration
export const API_DEV_CONFIG = {
  LOG_LEVEL: getEnvVar('REACT_APP_LOG_LEVEL', 'info'),
  ENABLE_DEBUG: getEnvVar('REACT_APP_ENABLE_DEBUG', 'false') === 'true',
  MOCK_API: getEnvVar('REACT_APP_MOCK_API', 'false') === 'true',
  DISABLE_SSL_VERIFY: getEnvVar('REACT_APP_DISABLE_SSL_VERIFY', 'false') === 'true'
} as const;

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string, version: string = API_CONFIG.API_VERSION): string => {
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  const versionPath = version ? `/api/${version}` : '';
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${baseUrl}${versionPath}${cleanEndpoint}`;
};

// Helper function to build admin API URL
export const buildAdminApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.ADMIN_BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${baseUrl}${cleanEndpoint}`;
};

// Helper function to build CDN URL
export const buildCdnUrl = (path: string, type: 'general' | 'audio' | 'image' = 'general'): string => {
  const cdnUrls = {
    general: API_CONFIG.CDN_URL,
    audio: API_CONFIG.AUDIO_CDN_URL,
    image: API_CONFIG.IMAGE_CDN_URL
  };
  
  const baseUrl = cdnUrls[type].replace(/\/$/, ''); // Remove trailing slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${cleanPath}`;
};