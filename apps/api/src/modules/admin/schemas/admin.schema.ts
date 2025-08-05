import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminDocument = Admin & Document;

@Schema({
  collection: 'admins',
  timestamps: true,
})
export class Admin {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: {
      firstName: { type: String },
      lastName: { type: String },
      displayName: { type: String },
      avatar: { type: String },
    },
    default: {},
  })
  profile: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    avatar?: string;
  };

  @Prop({ required: true, enum: ['admin', 'super_admin'], default: 'admin' })
  role: string;

  @Prop({
    type: {
      isActive: { type: Boolean, default: true },
      isEmailVerified: { type: Boolean, default: false },
    },
    default: { isActive: true, isEmailVerified: false },
  })
  status: {
    isActive: boolean;
    isEmailVerified: boolean;
  };

  @Prop({
    type: {
      failedLoginAttempts: { type: Number, default: 0 },
      lastLoginDate: { type: Date },
      lastLoginIP: { type: String },
      lastActivity: { type: Date },
    },
    default: { failedLoginAttempts: 0 },
  })
  security: {
    failedLoginAttempts: number;
    lastLoginDate?: Date;
    lastLoginIP?: string;
    lastActivity?: Date;
  };

  @Prop({
    type: [String],
    default: [
      'users:read',
      'users:write',
      'analytics:read',
      'rewards:read',
      'rewards:write',
      'content:read',
      'content:write',
      'settings:read',
      'settings:write',
    ],
  })
  permissions: string[];
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

// Indexes
AdminSchema.index({ email: 1 });
AdminSchema.index({ 'status.isActive': 1 });
AdminSchema.index({ role: 1 });