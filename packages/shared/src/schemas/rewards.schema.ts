import { z } from 'zod';

/**
 * Rewards and blockchain-related schemas using Zod for validation
 */

// Reward Claim Schema
export const rewardClaimSchema = z.object({
  rewardIds: z
    .array(z.string().min(1, 'Reward ID is required'))
    .min(1, 'At least one reward ID is required')
    .max(50, 'Cannot claim more than 50 rewards at once')
});

// Withdrawal Request Schema
export const withdrawalRequestSchema = z.object({
  amount: z
    .number()
    .min(100, 'Minimum withdrawal amount is 100 tokens')
    .max(10000, 'Maximum withdrawal amount is 10,000 tokens')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
  walletAddress: z
    .string()
    .min(32, 'Invalid wallet address')
    .max(44, 'Invalid wallet address')
    .regex(/^[1-9A-HJ-NP-Za-km-z]+$/, 'Invalid Solana wallet address format'),
  twoFactorCode: z
    .string()
    .length(6, 'Two-factor code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Two-factor code must contain only numbers')
    .optional()
});

// Reward Rule Creation Schema
export const createRewardRuleSchema = z.object({
  type: z.enum([
    'reading_completion',
    'surah_completion',
    'juz_completion',
    'daily_streak',
    'weekly_streak',
    'monthly_streak',
    'badge_earned',
    'referral',
    'quiz_completion',
    'perfect_recitation',
    'first_time_bonus'
  ]),
  name: z
    .string()
    .min(1, 'Rule name is required')
    .max(100, 'Rule name must not exceed 100 characters'),
  description: z
    .string()
    .min(1, 'Rule description is required')
    .max(500, 'Rule description must not exceed 500 characters'),
  baseAmount: z
    .number()
    .min(0.01, 'Base amount must be at least 0.01')
    .max(10000, 'Base amount must not exceed 10,000')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
  multipliers: z
    .array(
      z.object({
        condition: z.string().min(1, 'Multiplier condition is required'),
        value: z
          .number()
          .min(0.1, 'Multiplier value must be at least 0.1')
          .max(10, 'Multiplier value must not exceed 10'),
        description: z
          .string()
          .min(1, 'Multiplier description is required')
          .max(200, 'Multiplier description must not exceed 200 characters')
      })
    )
    .max(5, 'Maximum 5 multipliers allowed')
    .optional(),
  conditions: z
    .array(
      z.object({
        field: z.string().min(1, 'Condition field is required'),
        operator: z.enum([
          'equals',
          'greater_than',
          'less_than',
          'greater_than_or_equal',
          'less_than_or_equal',
          'in',
          'not_in'
        ]),
        value: z.any(),
        description: z
          .string()
          .min(1, 'Condition description is required')
          .max(200, 'Condition description must not exceed 200 characters')
      })
    )
    .max(10, 'Maximum 10 conditions allowed')
    .optional(),
  isActive: z.boolean().default(true)
});

// Update Reward Rule Schema
export const updateRewardRuleSchema = createRewardRuleSchema.partial().omit({ type: true });

// Badge Creation Schema
export const createBadgeSchema = z.object({
  name: z
    .string()
    .min(1, 'Badge name is required')
    .max(100, 'Badge name must not exceed 100 characters'),
  description: z
    .string()
    .min(1, 'Badge description is required')
    .max(500, 'Badge description must not exceed 500 characters'),
  icon: z
    .string()
    .url('Icon must be a valid URL')
    .or(z.string().regex(/^[\w-]+$/, 'Icon must be a valid icon name')),
  requirements: z
    .array(
      z.object({
        type: z.enum([
          'total_ayahs_read',
          'total_surahs_completed',
          'total_juz_completed',
          'consecutive_days',
          'total_reading_time',
          'perfect_recitations',
          'referrals_made'
        ]),
        value: z
          .number()
          .int('Requirement value must be an integer')
          .min(1, 'Requirement value must be at least 1'),
        description: z
          .string()
          .min(1, 'Requirement description is required')
          .max(200, 'Requirement description must not exceed 200 characters')
      })
    )
    .min(1, 'At least one requirement is required')
    .max(5, 'Maximum 5 requirements allowed'),
  rewardAmount: z
    .number()
    .min(0, 'Reward amount must be non-negative')
    .max(1000, 'Reward amount must not exceed 1,000')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
  isActive: z.boolean().default(true)
});

// Update Badge Schema
export const updateBadgeSchema = createBadgeSchema.partial();

// Leaderboard Query Schema
export const leaderboardQuerySchema = z.object({
  type: z.enum(['points', 'reading_time', 'ayahs_read', 'streak', 'badges']),
  period: z.enum(['daily', 'weekly', 'monthly', 'all_time']),
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
    .default(50)
});

// Transaction Query Schema
export const transactionQuerySchema = z.object({
  type: z
    .enum(['earned', 'spent', 'withdrawn', 'refund', 'bonus', 'penalty'])
    .optional(),
  status: z
    .enum(['pending', 'completed', 'failed', 'cancelled'])
    .optional(),
  startDate: z
    .string()
    .datetime('Invalid start date format')
    .optional(),
  endDate: z
    .string()
    .datetime('Invalid end date format')
    .optional(),
  minAmount: z
    .number()
    .min(0, 'Minimum amount must be non-negative')
    .optional(),
  maxAmount: z
    .number()
    .min(0, 'Maximum amount must be non-negative')
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
    .max(100, 'Limit must not exceed 100')
    .default(20)
});

// Reward Distribution Schema (Admin)
export const rewardDistributionSchema = z.object({
  userIds: z
    .array(z.string().min(1, 'User ID is required'))
    .min(1, 'At least one user ID is required')
    .max(1000, 'Cannot distribute rewards to more than 1000 users at once'),
  rewardType: z.enum([
    'reading_completion',
    'surah_completion',
    'juz_completion',
    'daily_streak',
    'weekly_streak',
    'monthly_streak',
    'badge_earned',
    'referral',
    'quiz_completion',
    'perfect_recitation',
    'first_time_bonus'
  ]),
  amount: z
    .number()
    .min(0.01, 'Amount must be at least 0.01')
    .max(1000, 'Amount must not exceed 1,000')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(200, 'Description must not exceed 200 characters'),
  metadata: z.record(z.any()).optional()
});

// Referral Code Schema
export const referralCodeSchema = z.object({
  code: z
    .string()
    .min(6, 'Referral code must be at least 6 characters')
    .max(20, 'Referral code must not exceed 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Referral code can only contain letters, numbers, underscores, and hyphens'),
  maxUses: z
    .number()
    .int('Max uses must be an integer')
    .min(1, 'Max uses must be at least 1')
    .max(10000, 'Max uses must not exceed 10,000')
    .optional(),
  expiresAt: z
    .string()
    .datetime('Invalid expiration date format')
    .optional(),
  rewardAmount: z
    .number()
    .min(1, 'Reward amount must be at least 1')
    .max(1000, 'Reward amount must not exceed 1,000')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places')
    .default(100)
});

// Staking Schema
export const stakingSchema = z.object({
  amount: z
    .number()
    .min(100, 'Minimum staking amount is 100 tokens')
    .max(100000, 'Maximum staking amount is 100,000 tokens')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
  duration: z
    .number()
    .int('Duration must be an integer')
    .min(1, 'Minimum staking duration is 1 day')
    .max(365, 'Maximum staking duration is 365 days'), // in days
  autoRenew: z.boolean().default(false)
});

// Unstaking Schema
export const unstakingSchema = z.object({
  stakingId: z.string().min(1, 'Staking ID is required'),
  amount: z
    .number()
    .min(0.01, 'Amount must be at least 0.01')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places')
    .optional() // If not provided, unstake all
});

// Type exports
export type RewardClaimInput = z.infer<typeof rewardClaimSchema>;
export type WithdrawalRequestInput = z.infer<typeof withdrawalRequestSchema>;
export type CreateRewardRuleInput = z.infer<typeof createRewardRuleSchema>;
export type UpdateRewardRuleInput = z.infer<typeof updateRewardRuleSchema>;
export type CreateBadgeInput = z.infer<typeof createBadgeSchema>;
export type UpdateBadgeInput = z.infer<typeof updateBadgeSchema>;
export type LeaderboardQueryInput = z.infer<typeof leaderboardQuerySchema>;
export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>;
export type RewardDistributionInput = z.infer<typeof rewardDistributionSchema>;
export type ReferralCodeInput = z.infer<typeof referralCodeSchema>;
export type StakingInput = z.infer<typeof stakingSchema>;
export type UnstakingInput = z.infer<typeof unstakingSchema>;

// Response Schemas
export const rewardBalanceResponseSchema = z.object({
  userId: z.string(),
  totalEarned: z.number(),
  totalSpent: z.number(),
  totalWithdrawn: z.number(),
  availableBalance: z.number(),
  pendingBalance: z.number(),
  stakedBalance: z.number().default(0),
  lastUpdated: z.date()
});

export const leaderboardResponseSchema = z.object({
  type: z.enum(['points', 'reading_time', 'ayahs_read', 'streak', 'badges']),
  period: z.enum(['daily', 'weekly', 'monthly', 'all_time']),
  entries: z.array(
    z.object({
      rank: z.number(),
      userId: z.string(),
      username: z.string(),
      profilePicture: z.string().optional(),
      score: z.number(),
      change: z.number(),
      badges: z.array(z.string())
    })
  ),
  lastUpdated: z.date()
});

export const transactionResponseSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  type: z.enum(['earned', 'spent', 'withdrawn', 'refund', 'bonus', 'penalty']),
  amount: z.number(),
  balanceBefore: z.number(),
  balanceAfter: z.number(),
  description: z.string(),
  blockchainTxHash: z.string().optional(),
  walletAddress: z.string().optional(),
  status: z.enum(['pending', 'completed', 'failed', 'cancelled']),
  createdAt: z.date(),
  processedAt: z.date().optional(),
  failureReason: z.string().optional()
});

export type RewardBalanceResponse = z.infer<typeof rewardBalanceResponseSchema>;
export type LeaderboardResponse = z.infer<typeof leaderboardResponseSchema>;
export type TransactionResponse = z.infer<typeof transactionResponseSchema>;