/**
 * Validation utilities for the Quran reading app
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate username format
 */
export function isValidUsername(username: string): boolean {
  // Username should be 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a valid length (10-15 digits)
  return cleaned.length >= 10 && cleaned.length <= 15;
}

/**
 * Validate Solana wallet address
 */
export function isValidSolanaAddress(address: string): boolean {
  // Solana addresses are base58 encoded and typically 32-44 characters
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(address);
}

/**
 * Validate Surah number (1-114)
 */
export function isValidSurahNumber(surahNumber: number): boolean {
  return Number.isInteger(surahNumber) && surahNumber >= 1 && surahNumber <= 114;
}

/**
 * Validate Juz number (1-30)
 */
export function isValidJuzNumber(juzNumber: number): boolean {
  return Number.isInteger(juzNumber) && juzNumber >= 1 && juzNumber <= 30;
}

/**
 * Validate Ayah number for a specific Surah
 */
export function isValidAyahNumber(surahNumber: number, ayahNumber: number): boolean {
  if (!isValidSurahNumber(surahNumber) || !Number.isInteger(ayahNumber) || ayahNumber < 1) {
    return false;
  }
  
  // Array of ayah counts for each surah (index 0 = Surah 1)
  const ayahCounts = [
    7, 286, 200, 176, 120, 165, 206, 75, 129, 109,
    123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
    112, 78, 118, 64, 77, 227, 93, 88, 69, 60,
    34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
    54, 53, 89, 59, 37, 35, 38, 29, 18, 45,
    60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
    14, 11, 11, 18, 12, 12, 30, 52, 52, 44,
    28, 28, 21, 56, 40, 31, 50, 40, 46, 42,
    29, 19, 36, 25, 22, 17, 19, 26, 30, 20,
    15, 21, 11, 8, 8, 19, 5, 8, 8, 11,
    11, 8, 3, 9, 5, 4, 7, 3, 6, 3,
    5, 4, 5, 6
  ];
  
  return ayahNumber <= ayahCounts[surahNumber - 1];
}

/**
 * Validate reading session duration (in seconds)
 */
export function isValidReadingDuration(duration: number): boolean {
  // Duration should be positive and reasonable (max 24 hours)
  return duration > 0 && duration <= 86400;
}

/**
 * Validate reward amount
 */
export function isValidRewardAmount(amount: number): boolean {
  // Amount should be positive and have at most 2 decimal places
  return amount > 0 && Number.isFinite(amount) && Math.round(amount * 100) === amount * 100;
}

/**
 * Validate user age (for registration)
 */
export function isValidAge(age: number): boolean {
  return Number.isInteger(age) && age >= 13 && age <= 120;
}

/**
 * Validate country code (ISO 3166-1 alpha-2)
 */
export function isValidCountryCode(countryCode: string): boolean {
  const validCodes = [
    'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT',
    'AU', 'AW', 'AX', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI',
    'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BV', 'BW', 'BY',
    'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN',
    'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM',
    'DO', 'DZ', 'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK',
    'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL',
    'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM',
    'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR',
    'IS', 'IT', 'JE', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN',
    'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS',
    'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK',
    'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW',
    'MX', 'MY', 'MZ', 'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP',
    'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM',
    'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW',
    'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM',
    'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF',
    'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW',
    'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI',
    'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW'
  ];
  
  return validCodes.includes(countryCode.toUpperCase());
}

/**
 * Validate language code (ISO 639-1)
 */
export function isValidLanguageCode(languageCode: string): boolean {
  const validCodes = [
    'ar', 'en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'zh', 'ja',
    'ko', 'hi', 'bn', 'ur', 'tr', 'fa', 'id', 'ms', 'th', 'vi',
    'nl', 'sv', 'da', 'no', 'fi', 'pl', 'cs', 'sk', 'hu', 'ro',
    'bg', 'hr', 'sr', 'sl', 'et', 'lv', 'lt', 'mt', 'cy', 'ga',
    'eu', 'ca', 'gl', 'br', 'co', 'fo', 'is', 'mk', 'sq', 'bs'
  ];
  
  return validCodes.includes(languageCode.toLowerCase());
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate audio file format
 */
export function isValidAudioFormat(format: string): boolean {
  const validFormats = ['mp3', 'ogg', 'aac', 'wav', 'm4a'];
  return validFormats.includes(format.toLowerCase());
}

/**
 * Validate reading speed (words per minute)
 */
export function isValidReadingSpeed(wpm: number): boolean {
  // Typical reading speeds range from 50-300 WPM
  return wpm >= 50 && wpm <= 300;
}

/**
 * Validate timezone
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate and sanitize user input
 */
export function validateAndSanitizeInput(
  input: string,
  minLength: number = 0,
  maxLength: number = 1000
): {
  isValid: boolean;
  sanitized: string;
  errors: string[];
} {
  const errors: string[] = [];
  let sanitized = sanitizeInput(input);
  
  if (sanitized.length < minLength) {
    errors.push(`Input must be at least ${minLength} characters long`);
  }
  
  if (sanitized.length > maxLength) {
    errors.push(`Input must not exceed ${maxLength} characters`);
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
}