import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UnauthorizedException,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

import { AdminAuthService } from './services/admin-auth.service';
import { LoginDto } from '../auth/dto/login.dto';
import { Public } from '../auth/decorators/public.decorator';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Admin Authentication')
@Controller('admin/auth')
@UseInterceptors(TransformInterceptor)
@UseGuards(ThrottlerGuard)
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, description: 'Admin successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Validate admin credentials
    const admin = await this.adminAuthService.validateAdmin(email, password);
    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user has admin role
    if (admin.role !== 'admin' && admin.role !== 'super_admin') {
      throw new UnauthorizedException('Access denied. Admin privileges required.');
    }

    return this.adminAuthService.login(admin);
  }

  @ApiOperation({ summary: 'Get admin profile' })
  @ApiResponse({ status: 200, description: 'Admin profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getAdminProfile(@Request() req) {
    return this.adminAuthService.getAdminProfile(req.user.sub);
  }

  @ApiOperation({ summary: 'Update admin profile' })
  @ApiResponse({ status: 200, description: 'Admin profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateAdminProfile(@Request() req, @Body() updateData: any) {
    const { profile } = updateData;
    return this.adminAuthService.updateAdminProfile(req.user.sub, profile);
  }

  @ApiOperation({ summary: 'Change admin password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Request() req, @Body() passwordData: { currentPassword: string; newPassword: string }) {
    const { currentPassword, newPassword } = passwordData;
    await this.adminAuthService.changeAdminPassword(req.user.sub, currentPassword, newPassword);
    return { message: 'Password changed successfully' };
  }
}