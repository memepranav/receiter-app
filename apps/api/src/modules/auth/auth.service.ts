import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

// User model
import { User, UserDocument } from '../users/schemas/user.schema';

// Services
import { RedisService } from '../../core/redis/redis.service';
import { LoggerService } from '../../core/logger/logger.service';
import { EmailService } from '../../core/email/email.service';

// DTOs
import { RegisterDto } from './dto/register.dto';

// Interfaces
import { AuthenticatedUser, JwtPayload, AuthTokens } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  private readonly saltRounds = 12;
  private readonly resetTokenExpiry = 3600000; // 1 hour

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
    private loggerService: LoggerService,
    private emailService: EmailService,
  ) {}

  /**
   * Register new user
   */
  async register(registerDto: RegisterDto): Promise<AuthTokens> {
    const { email, password, name, phoneNumber } = registerDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    // Create user
    const user = new this.userModel({
      email,
      password: hashedPassword,
      name,
      phoneNumber,
      authProvider: 'local',
      isEmailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedUser = await user.save();

    this.loggerService.logAuthEvent('user_registered', savedUser._id.toString(), {
      email,
      provider: 'local',
    });

    // Generate tokens
    return this.generateTokens(savedUser);
  }

  /**
   * Validate user credentials
   */
  async validateUser(email: string, password: string): Promise<AuthenticatedUser | null> {
    const user = await this.userModel.findOne({ email, authProvider: 'local' }).exec();
    
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  /**
   * Login user
   */
  async login(user: AuthenticatedUser): Promise<AuthTokens> {
    const userDoc = await this.userModel.findById(user.id).exec();
    if (!userDoc) {
      throw new UnauthorizedException('User not found');
    }

    // Update last login
    userDoc.lastLoginAt = new Date();
    await userDoc.save();

    this.loggerService.logAuthEvent('user_login', user.id, {
      email: user.email,
    });

    return this.generateTokens(userDoc);
  }

  /**
   * Google OAuth login/register
   */
  async googleLogin(profile: any): Promise<AuthenticatedUser> {
    const { id, emails, name, photos } = profile;
    const email = emails[0].value;

    let user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      // Register new user
      user = new this.userModel({
        email,
        name: `${name.givenName} ${name.familyName}`,
        authProvider: 'google',
        googleId: id,
        avatar: photos[0]?.value,
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await user.save();

      this.loggerService.logAuthEvent('user_registered', user._id.toString(), {
        email,
        provider: 'google',
      });
    } else if (user.authProvider !== 'google') {
      // Link Google account to existing user
      user.googleId = id;
      user.isEmailVerified = true;
      if (!user.avatar && photos[0]?.value) {
        user.avatar = photos[0].value;
      }
      await user.save();
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  /**
   * Refresh access token
   */
  async refresh(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // Check if refresh token is blacklisted
      const isBlacklisted = await this.redisService.exists(`blacklisted_refresh_${refreshToken}`);
      if (isBlacklisted) {
        throw new UnauthorizedException('Refresh token is blacklisted');
      }

      const user = await this.userModel.findById(payload.sub).exec();
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Blacklist old refresh token
      await this.redisService.set(
        `blacklisted_refresh_${refreshToken}`,
        'true',
        7 * 24 * 60 * 60, // 7 days
      );

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Logout user
   */
  async logout(userId: string): Promise<{ message: string }> {
    // Could implement token blacklisting here
    this.loggerService.logAuthEvent('user_logout', userId);
    return { message: 'Logged out successfully' };
  }

  /**
   * Forgot password
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email, authProvider: 'local' }).exec();
    if (!user) {
      // Don't reveal if user exists
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Store reset token in Redis with expiry
    await this.redisService.set(
      `password_reset_${resetTokenHash}`,
      user._id.toString(),
      this.resetTokenExpiry / 1000, // Redis expects seconds
    );

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(email, resetToken);
    } catch (error) {
      this.loggerService.errorWithContext('Failed to send password reset email', error.stack);
      // Don't throw error - we still want to return success message for security
    }

    this.loggerService.logAuthEvent('password_reset_requested', user._id.toString(), {
      email,
    });

    return { message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const userId = await this.redisService.get(`password_reset_${tokenHash}`);

    if (!userId) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);
    
    // Update password
    user.password = hashedPassword;
    user.updatedAt = new Date();
    await user.save();

    // Delete reset token
    await this.redisService.del(`password_reset_${tokenHash}`);

    this.loggerService.logAuthEvent('password_reset_completed', user._id.toString());

    return { message: 'Password reset successfully' };
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);
    
    // Update password
    user.password = hashedPassword;
    user.updatedAt = new Date();
    await user.save();

    this.loggerService.logAuthEvent('password_changed', userId);

    return { message: 'Password changed successfully' };
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<any> {
    const user = await this.userModel
      .findById(userId)
      .select('-password -googleId')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Generate JWT tokens
   */
  private async generateTokens(user: UserDocument): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}