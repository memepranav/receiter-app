import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

// Admin model
import { Admin, AdminDocument } from '../schemas/admin.schema';

// Services
import { LoggerService } from '../../../core/logger/logger.service';

// Interfaces
import { AuthenticatedUser, JwtPayload, AuthTokens } from '../../auth/interfaces/auth.interface';

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private loggerService: LoggerService,
  ) {}

  /**
   * Validate admin credentials
   */
  async validateAdmin(email: string, password: string): Promise<AuthenticatedUser | null> {
    try {
      // Find admin by email and ensure it's active
      const admin = await this.adminModel.findOne({
        email: email.toLowerCase(),
        'status.isActive': true,
      }).exec();

      if (!admin) {
        return null;
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        // Log failed login attempt
        await this.adminModel.updateOne(
          { _id: admin._id },
          {
            $inc: { 'security.failedLoginAttempts': 1 },
            $set: { updatedAt: new Date() },
          },
        );
        return null;
      }

      // Reset failed login attempts and update last login
      await this.adminModel.updateOne(
        { _id: admin._id },
        {
          $set: {
            'security.failedLoginAttempts': 0,
            'security.lastLoginDate': new Date(),
            'security.lastActivity': new Date(),
            updatedAt: new Date(),
          },
        },
      );

      return {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.profile?.displayName || 
              `${admin.profile?.firstName} ${admin.profile?.lastName}`.trim() || 
              'Admin User',
        role: admin.role,
      };
    } catch (error) {
      this.loggerService.errorWithContext('Admin validation error', error.stack);
      return null;
    }
  }

  /**
   * Login admin and generate tokens
   */
  async login(admin: AuthenticatedUser): Promise<AuthTokens> {
    try {
      const adminDoc = await this.adminModel.findById(admin.id).exec();
      if (!adminDoc) {
        throw new UnauthorizedException('Admin not found');
      }

      // Check if admin is still active
      if (!adminDoc.status.isActive) {
        throw new UnauthorizedException('Admin account is deactivated');
      }

      // Update last activity
      await this.adminModel.updateOne(
        { _id: adminDoc._id },
        {
          $set: {
            'security.lastActivity': new Date(),
            updatedAt: new Date(),
          },
        },
      );

      this.loggerService.logAuthEvent('admin_login', admin.id, {
        email: admin.email,
        role: admin.role,
      });

      return this.generateTokens(adminDoc);
    } catch (error) {
      this.loggerService.errorWithContext('Admin login error', error.stack);
      throw new UnauthorizedException('Login failed');
    }
  }

  /**
   * Get admin profile by ID
   */
  async getAdminProfile(adminId: string): Promise<any> {
    try {
      const admin = await this.adminModel
        .findById(adminId)
        .select('-password')
        .exec();

      if (!admin) {
        throw new UnauthorizedException('Admin not found');
      }

      if (!admin.status.isActive) {
        throw new UnauthorizedException('Admin account is deactivated');
      }

      // Update last activity
      await this.adminModel.updateOne(
        { _id: admin._id },
        {
          $set: {
            'security.lastActivity': new Date(),
            updatedAt: new Date(),
          },
        },
      );

      return {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.profile?.displayName || 
              `${admin.profile?.firstName} ${admin.profile?.lastName}`.trim() || 
              'Admin User',
        role: admin.role,
        permissions: admin.permissions,
        lastLoginDate: admin.security?.lastLoginDate,
        avatar: admin.profile?.avatar,
      };
    } catch (error) {
      this.loggerService.errorWithContext('Get admin profile error', error.stack);
      throw new UnauthorizedException('Failed to get admin profile');
    }
  }

  /**
   * Verify JWT token and get admin
   */
  async verifyAdminToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      return this.getAdminProfile(payload.sub);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Generate JWT tokens for admin
   */
  private async generateTokens(admin: AdminDocument): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN') || '24h',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET') || this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      user: {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.profile?.displayName || 
              `${admin.profile?.firstName} ${admin.profile?.lastName}`.trim() || 
              'Admin User',
        role: admin.role,
      },
    };
  }
}