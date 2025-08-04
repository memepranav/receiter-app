import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionDocument = Transaction & Document;

export enum TransactionType {
  REWARD_CLAIM = 'reward_claim',
  WITHDRAWAL = 'withdrawal',
  DEPOSIT = 'deposit',
  REFUND = 'refund',
  ADMIN_ADJUSTMENT = 'admin_adjustment',
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Schema({
  timestamps: true,
  collection: 'transactions',
})
export class Transaction {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: TransactionType })
  type: TransactionType;

  @Prop({ required: true })
  amount: number; // Amount in points

  @Prop({ required: false })
  tokenAmount?: number; // Amount in blockchain tokens (if different from points)

  @Prop({ required: true, enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Prop({ required: false })
  description?: string;

  // Blockchain information
  @Prop({ required: false })
  walletAddress?: string;

  @Prop({ required: false })
  transactionHash?: string;

  @Prop({ required: false })
  blockchainNetwork?: string; // 'solana', 'ethereum', etc.

  @Prop({ required: false })
  blockNumber?: number;

  @Prop({ required: false })
  gasUsed?: number;

  @Prop({ required: false })
  gasFee?: number;

  // Processing information
  @Prop({ required: false })
  processedAt?: Date;

  @Prop({ required: false })
  completedAt?: Date;

  @Prop({ required: false })
  failedAt?: Date;

  @Prop({ required: false })
  failureReason?: string;

  // Related entities
  @Prop({ required: false })
  rewardIds?: string[]; // Array of reward IDs if claiming multiple rewards

  @Prop({ required: false })
  referenceId?: string; // External reference ID

  // Metadata
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  // Admin information
  @Prop({ required: false, type: Types.ObjectId, ref: 'User' })
  processedBy?: Types.ObjectId;

  @Prop({ required: false })
  adminNotes?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Indexes
TransactionSchema.index({ userId: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ transactionHash: 1 });
TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ userId: 1, status: 1 });
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ walletAddress: 1 });