import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Public } from '../auth/decorators/public.decorator';
import { Admin, AdminDocument } from './schemas/admin.schema';

@ApiTags('Admin Test')
@Controller('admin')
export class AdminTestController {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
  ) {}
  
  @ApiOperation({ summary: 'Test admin API routing - no auth required' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  @Public()
  @Get('test')
  async testApi() {
    return { 
      message: 'Admin API is working!', 
      timestamp: new Date().toISOString(),
      server: 'NestJS Backend',
      routing: 'SUCCESS'
    };
  }

  @ApiOperation({ summary: 'Create default admin user - no auth required' })
  @ApiResponse({ status: 201, description: 'Admin user created' })
  @Public()
  @Post('create-admin')
  async createAdmin() {
    try {
      // Check if admin already exists
      const existingAdmin = await this.adminModel.findOne({ 
        email: 'admin@quranreciter.com' 
      }).exec();
      
      if (existingAdmin) {
        return {
          message: 'Admin user already exists',
          email: 'admin@quranreciter.com'
        };
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash('admin123', 12);

      // Create admin user matching the schema structure
      const admin = new this.adminModel({
        email: 'admin@quranreciter.com',
        password: hashedPassword,
        profile: {
          firstName: 'Admin',
          lastName: 'User',
          displayName: 'Admin User',
          avatar: null
        },
        role: 'super_admin',
        permissions: [
          'users:read',
          'users:write',
          'analytics:read',
          'rewards:read',
          'rewards:write',
          'content:read',
          'content:write',
          'settings:read',
          'settings:write'
        ],
        security: {
          failedLoginAttempts: 0,
          lastLoginDate: null,
          lastLoginIP: null,
          lastActivity: null
        },
        status: {
          isActive: true,
          isEmailVerified: true
        }
      });

      await admin.save();

      return {
        message: 'Admin user created successfully',
        email: 'admin@quranreciter.com',
        password: 'admin123',
        warning: 'Change this password after first login!'
      };
    } catch (error) {
      return {
        message: 'Error creating admin user',
        error: error.message
      };
    }
  }
}