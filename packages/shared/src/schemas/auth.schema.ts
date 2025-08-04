import { z } from 'zod';

/**
 * Authentication schemas using Zod for validation
 */

// Register Schema
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must not exceed 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-ZÀ-ÿ\u0600-\u06FF\s]+$/, 'First name can only contain letters and spaces'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-ZÀ-ÿ\u0600-\u06FF\s]+$/, 'Last name can only contain letters and spaces'),
  country: z
    .string()
    .min(1, 'Country is required')
    .max(100, 'Country name must not exceed 100 characters'),
  phoneNumber: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
    .optional(),
  acceptTerms: z
    .boolean()
    .refine(val => val === true, 'You must accept the terms and conditions')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
});

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
});

// Reset Password Schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Change Password Schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  confirmNewPassword: z.string()
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword']
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword']
});

// Google OAuth Schema
export const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'Google ID token is required'),
  accessToken: z.string().optional()
});

// Email Verification Schema
export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required')
});

// Refresh Token Schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

// Two-Factor Authentication Setup Schema
export const twoFactorSetupSchema = z.object({
  secret: z.string().min(1, 'Secret is required'),
  token: z
    .string()
    .length(6, 'Token must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Token must contain only numbers')
});

// Two-Factor Authentication Verify Schema
export const twoFactorVerifySchema = z.object({
  token: z
    .string()
    .length(6, 'Token must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Token must contain only numbers')
});

// Admin Login Schema
export const adminLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
  twoFactorToken: z
    .string()
    .length(6, 'Two-factor token must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Token must contain only numbers')
    .optional()
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type TwoFactorSetupInput = z.infer<typeof twoFactorSetupSchema>;
export type TwoFactorVerifyInput = z.infer<typeof twoFactorVerifySchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

// JWT Token Schema
export const jwtPayloadSchema = z.object({
  sub: z.string(), // user ID
  email: z.string().email(),
  username: z.string(),
  role: z.enum(['user', 'admin', 'moderator']),
  iat: z.number(),
  exp: z.number()
});

export type JWTPayload = z.infer<typeof jwtPayloadSchema>;

// Authentication Response Schema
export const authResponseSchema = z.object({
  user: z.object({
    _id: z.string(),
    email: z.string().email(),
    username: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    profilePicture: z.string().optional(),
    isActive: z.boolean(),
    emailVerified: z.boolean(),
    role: z.enum(['user', 'admin', 'moderator']).default('user'),
    createdAt: z.date()
  }),
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number()
});

export type AuthResponse = z.infer<typeof authResponseSchema>;