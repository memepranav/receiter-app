import { z } from 'zod';

/**
 * User-related schemas using Zod for validation
 */

// User Profile Update Schema
export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-ZÀ-ÿ\u0600-\u06FF\s]+$/, 'First name can only contain letters and spaces')
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-ZÀ-ÿ\u0600-\u06FF\s]+$/, 'Last name can only contain letters and spaces')
    .optional(),
  country: z
    .string()
    .min(1, 'Country is required')
    .max(100, 'Country name must not exceed 100 characters')
    .optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .max(500, 'Bio must not exceed 500 characters')
    .optional()
    .or(z.literal(''))
});

// User Preferences Schema
export const userPreferencesSchema = z.object({
  language: z
    .string()
    .min(2, 'Language code is required')
    .max(5, 'Invalid language code')
    .default('en'),
  defaultTranslation: z
    .string()
    .min(1, 'Translation ID is required')
    .default('sahih_international'),
  defaultReciter: z
    .string()
    .min(1, 'Reciter ID is required')
    .default('abdul_basit'),
  notificationsEnabled: z.boolean().default(true),
  dailyReminderTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
    .optional(),
  darkMode: z.boolean().default(false),
  autoPlay: z.boolean().default(false),
  playbackSpeed: z
    .number()
    .min(0.5, 'Playback speed must be at least 0.5x')
    .max(2.0, 'Playback speed must not exceed 2.0x')
    .default(1.0),
  fontSize: z
    .enum(['small', 'medium', 'large', 'extra-large'])
    .default('medium'),
  arabicFont: z
    .enum(['uthmanic', 'indopak', 'simple'])
    .default('uthmanic'),
  showTransliteration: z.boolean().default(false),
  highlightCurrentAyah: z.boolean().default(true),
  enableVibration: z.boolean().default(true),
  keepScreenOn: z.boolean().default(false)
});

// Bookmark Schema
export const bookmarkSchema = z.object({
  surahNumber: z
    .number()
    .int('Surah number must be an integer')
    .min(1, 'Surah number must be between 1 and 114')
    .max(114, 'Surah number must be between 1 and 114'),
  ayahNumber: z
    .number()
    .int('Ayah number must be an integer')
    .min(1, 'Ayah number must be positive'),
  note: z
    .string()
    .max(500, 'Note must not exceed 500 characters')
    .optional()
    .or(z.literal(''))
});

// Update Bookmark Schema
export const updateBookmarkSchema = z.object({
  note: z
    .string()
    .max(500, 'Note must not exceed 500 characters')
    .optional()
    .or(z.literal(''))
});

// Wallet Connection Schema
export const walletConnectionSchema = z.object({
  walletAddress: z
    .string()
    .min(32, 'Invalid wallet address')
    .max(44, 'Invalid wallet address')
    .regex(/^[1-9A-HJ-NP-Za-km-z]+$/, 'Invalid wallet address format'),
  signature: z.string().min(1, 'Signature is required'),
  message: z.string().min(1, 'Message is required')
});

// User Search Schema
export const userSearchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query must not exceed 100 characters'),
  page: z
    .number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z
    .number()
    .int('Limit must be an integer')
    .min(5, 'Limit must be at least 5')
    .max(100, 'Limit must not exceed 100')
    .default(20)
});

// Friend Request Schema
export const friendRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required')
});

// User Statistics Query Schema
export const userStatsQuerySchema = z.object({
  period: z
    .enum(['daily', 'weekly', 'monthly', 'yearly', 'all_time'])
    .default('monthly'),
  startDate: z
    .string()
    .datetime('Invalid start date format')
    .optional(),
  endDate: z
    .string()
    .datetime('Invalid end date format')
    .optional()
});

// Profile Picture Upload Schema
export const profilePictureSchema = z.object({
  file: z.any().refine(
    (file) => {
      if (!file) return false;
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    },
    {
      message: 'File must be a valid image (JPEG, PNG, WebP) and under 5MB'
    }
  )
});

// Account Deletion Schema
export const accountDeletionSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  confirmDeletion: z
    .string()
    .refine(val => val === 'DELETE', 'You must type "DELETE" to confirm'),
  reason: z
    .enum([
      'not_useful',
      'privacy_concerns',
      'technical_issues',
      'too_many_notifications',
      'found_alternative',
      'other'
    ])
    .optional(),
  feedback: z
    .string()
    .max(1000, 'Feedback must not exceed 1000 characters')
    .optional()
});

// Privacy Settings Schema
export const privacySettingsSchema = z.object({
  profileVisibility: z
    .enum(['public', 'friends_only', 'private'])
    .default('public'),
  showReadingStats: z.boolean().default(true),
  showBadges: z.boolean().default(true),
  allowFriendRequests: z.boolean().default(true),
  showInLeaderboard: z.boolean().default(true),
  dataCollection: z.boolean().default(true),
  marketingEmails: z.boolean().default(false)
});

// Notification Settings Schema
export const notificationSettingsSchema = z.object({
  pushNotifications: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
  readingReminders: z.boolean().default(true),
  rewardNotifications: z.boolean().default(true),
  badgeNotifications: z.boolean().default(true),
  friendRequests: z.boolean().default(true),
  leaderboardUpdates: z.boolean().default(false),
  systemAnnouncements: z.boolean().default(true),
  weeklyProgress: z.boolean().default(true),
  monthlyReport: z.boolean().default(true)
});

// Admin User Management Schema
export const adminUserUpdateSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(['user', 'admin', 'moderator']).optional(),
  emailVerified: z.boolean().optional(),
  notes: z
    .string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional()
});

// User Import Schema
export const userImportSchema = z.object({
  users: z.array(
    z.object({
      email: z.string().email('Invalid email address'),
      username: z.string().min(3, 'Username must be at least 3 characters'),
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      country: z.string().min(1, 'Country is required'),
      phoneNumber: z.string().optional(),
      role: z.enum(['user', 'admin', 'moderator']).default('user')
    })
  ).min(1, 'At least one user is required').max(1000, 'Cannot import more than 1000 users at once')
});

// Type exports
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;
export type BookmarkInput = z.infer<typeof bookmarkSchema>;
export type UpdateBookmarkInput = z.infer<typeof updateBookmarkSchema>;
export type WalletConnectionInput = z.infer<typeof walletConnectionSchema>;
export type UserSearchInput = z.infer<typeof userSearchSchema>;
export type FriendRequestInput = z.infer<typeof friendRequestSchema>;
export type UserStatsQueryInput = z.infer<typeof userStatsQuerySchema>;
export type ProfilePictureInput = z.infer<typeof profilePictureSchema>;
export type AccountDeletionInput = z.infer<typeof accountDeletionSchema>;
export type PrivacySettingsInput = z.infer<typeof privacySettingsSchema>;
export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;
export type UserImportInput = z.infer<typeof userImportSchema>;

// Response Schemas
export const userProfileResponseSchema = z.object({
  _id: z.string(),
  email: z.string().email(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  country: z.string(),
  phoneNumber: z.string().optional(),
  profilePicture: z.string().optional(),
  bio: z.string().optional(),
  isActive: z.boolean(),
  emailVerified: z.boolean(),
  walletAddress: z.string().optional(),
  preferences: userPreferencesSchema,
  statistics: z.object({
    totalJuzCompleted: z.number(),
    totalSurahCompleted: z.number(),
    totalAyahRead: z.number(),
    currentStreak: z.number(),
    longestStreak: z.number(),
    totalReadingTime: z.number(),
    totalPoints: z.number(),
    currentLevel: z.number(),
    badgesEarned: z.array(z.string()),
    lastReadingDate: z.date().optional()
  }),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>;