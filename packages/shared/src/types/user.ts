export interface User {
  _id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  country: string;
  phoneNumber?: string;
  profilePicture?: string;
  isActive: boolean;
  emailVerified: boolean;
  walletAddress?: string;
  preferences: UserPreferences;
  statistics: UserStatistics;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  language: string;
  defaultTranslation: string;
  defaultReciter: string;
  notificationsEnabled: boolean;
  dailyReminderTime?: string;
  darkMode: boolean;
  autoPlay: boolean;
  playbackSpeed: number;
}

export interface UserStatistics {
  totalJuzCompleted: number;
  totalSurahCompleted: number;
  totalAyahRead: number;
  currentStreak: number;
  longestStreak: number;
  totalReadingTime: number; // in minutes
  totalPoints: number;
  currentLevel: number;
  badgesEarned: string[];
  lastReadingDate?: Date;
}

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  country: string;
  phoneNumber?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  country?: string;
  phoneNumber?: string;
  profilePicture?: string;
}

export interface UpdateUserPreferencesDto {
  language?: string;
  defaultTranslation?: string;
  defaultReciter?: string;
  notificationsEnabled?: boolean;
  dailyReminderTime?: string;
  darkMode?: boolean;
  autoPlay?: boolean;
  playbackSpeed?: number;
}

export interface UserProfile {
  user: User;
  readingProgress: ReadingProgress;
  recentActivity: RecentActivity[];
}

export interface ReadingProgress {
  currentJuz: number;
  currentSurah: number;
  currentAyah: number;
  completedJuz: number[];
  completedSurah: number[];
  bookmarks: Bookmark[];
}

export interface RecentActivity {
  _id: string;
  type: ActivityType;
  description: string;
  points?: number;
  timestamp: Date;
}

export interface Bookmark {
  _id: string;
  surahNumber: number;
  ayahNumber: number;
  note?: string;
  createdAt: Date;
}

export enum ActivityType {
  READING_SESSION = 'reading_session',
  SURAH_COMPLETED = 'surah_completed',
  JUZ_COMPLETED = 'juz_completed',
  BADGE_EARNED = 'badge_earned',
  LEVEL_UP = 'level_up',
  STREAK_MILESTONE = 'streak_milestone'
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

export interface AdminUser extends User {
  role: UserRole;
  permissions: string[];
  lastLogin?: Date;
}