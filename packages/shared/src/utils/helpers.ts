/**
 * Helper utility functions for the Quran reading app
 */

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Calculate reading progress percentage
 */
export function calculateReadingProgress(
  completedAyahs: number,
  totalAyahs: number = 6236
): number {
  return Math.round((completedAyahs / totalAyahs) * 100 * 100) / 100;
}

/**
 * Calculate reward points based on reading activity
 */
export function calculateRewardPoints(
  ayahsRead: number,
  surahsCompleted: number,
  juzCompleted: number,
  streakDays: number,
  multiplier: number = 1
): number {
  const basePoints = 
    (ayahsRead * 1) + 
    (surahsCompleted * 50) + 
    (juzCompleted * 300) + 
    (streakDays * 10);
  
  return Math.round(basePoints * multiplier);
}

/**
 * Generate avatar URL from initials
 */
export function generateAvatarUrl(firstName: string, lastName: string): string {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const colors = [
    '1abc9c', '2ecc71', '3498db', '9b59b6', 'e74c3c', 
    'f39c12', 'e67e22', '95a5a6', '34495e', '16a085'
  ];
  
  const colorIndex = (firstName.charCodeAt(0) + lastName.charCodeAt(0)) % colors.length;
  const backgroundColor = colors[colorIndex];
  
  return `https://ui-avatars.com/api/?name=${initials}&background=${backgroundColor}&color=fff&size=200`;
}

/**
 * Check if user is on a streak
 */
export function isOnStreak(lastReadingDate: Date, currentDate: Date = new Date()): boolean {
  const daysDiff = Math.floor(
    (currentDate.getTime() - lastReadingDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return daysDiff <= 1; // Allow for same day or previous day
}

/**
 * Calculate streak count
 */
export function calculateStreak(readingDates: Date[]): number {
  if (readingDates.length === 0) return 0;
  
  // Sort dates in descending order
  const sortedDates = readingDates.sort((a, b) => b.getTime() - a.getTime());
  
  let streak = 1;
  let currentDate = new Date(sortedDates[0]);
  
  for (let i = 1; i < sortedDates.length; i++) {
    const previousDate = new Date(sortedDates[i]);
    const daysDiff = Math.floor(
      (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysDiff === 1) {
      streak++;
      currentDate = previousDate;
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Get user level based on total points
 */
export function getUserLevel(totalPoints: number): {
  level: number;
  pointsToNextLevel: number;
  progressPercentage: number;
} {
  // Level calculation: Level = floor(sqrt(points / 100))
  const level = Math.floor(Math.sqrt(totalPoints / 100)) + 1;
  const pointsForCurrentLevel = Math.pow(level - 1, 2) * 100;
  const pointsForNextLevel = Math.pow(level, 2) * 100;
  
  const pointsToNextLevel = pointsForNextLevel - totalPoints;
  const progressPoints = totalPoints - pointsForCurrentLevel;
  const levelRange = pointsForNextLevel - pointsForCurrentLevel;
  const progressPercentage = Math.round((progressPoints / levelRange) * 100);
  
  return {
    level,
    pointsToNextLevel,
    progressPercentage: Math.max(0, Math.min(100, progressPercentage))
  };
}

/**
 * Get time of day greeting
 */
export function getTimeGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

/**
 * Get Islamic greeting based on time
 */
export function getIslamicGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  
  if (hour >= 5 && hour < 12) return 'صباح الخير'; // Good morning
  if (hour >= 12 && hour < 17) return 'مساء الخير'; // Good afternoon
  return 'مساء الخير'; // Good evening
}

/**
 * Convert seconds to time components
 */
export function secondsToTimeComponents(seconds: number): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  return {
    hours,
    minutes,
    seconds: remainingSeconds
  };
}

/**
 * Create a delay/sleep function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
  
  throw lastError!;
}

/**
 * Check if two arrays are equal
 */
export function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  
  return a.every((val, index) => val === b[index]);
}

/**
 * Remove duplicates from array
 */
export function removeDuplicates<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Group array items by a key
 */
export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Shuffle array randomly
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Get random item from array
 */
export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Check if string contains Arabic text
 */
export function containsArabic(text: string): boolean {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
  return arabicRegex.test(text);
}

/**
 * Normalize Arabic text for searching
 */
export function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u0652]/g, '') // Remove diacritics
    .replace(/آ/g, 'ا') // Normalize Alif
    .replace(/إ/g, 'ا') // Normalize Alif
    .replace(/أ/g, 'ا') // Normalize Alif
    .replace(/ة/g, 'ت') // Normalize Taa Marbouta
    .replace(/ي/g, 'ى') // Normalize Yaa
    .trim();
}

/**
 * Get optimal image size for different screen densities
 */
export function getOptimalImageSize(
  baseWidth: number,
  baseHeight: number,
  pixelRatio: number = 1
): { width: number; height: number } {
  return {
    width: Math.round(baseWidth * pixelRatio),
    height: Math.round(baseHeight * pixelRatio)
  };
}

/**
 * Create a URL with query parameters
 */
export function createUrlWithParams(baseUrl: string, params: Record<string, any>): string {
  const url = new URL(baseUrl, window?.location?.origin || 'http://localhost');
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });
  
  return url.toString();
}

/**
 * Parse query parameters from URL
 */
export function parseQueryParams(url: string): Record<string, string> {
  const urlObj = new URL(url);
  const params: Record<string, string> = {};
  
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * clamp(factor, 0, 1);
}