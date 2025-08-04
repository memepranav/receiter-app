import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/auth.interface';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

// Admin Guard (would check for admin role)
import { AdminGuard } from './guards/admin.guard';

// DTOs
import { AdminUserUpdateDto } from './dto/admin-user-update.dto';
import { AdminRewardDto } from './dto/admin-reward.dto';
import { AdminQueryDto } from './dto/admin-query.dto';

@ApiTags('Admin Management')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Dashboard & Overview
  @ApiOperation({ summary: 'Get admin dashboard overview' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  @Get('dashboard')
  async getDashboard(@GetUser() admin: AuthenticatedUser) {
    return this.adminService.getDashboardOverview();
  }

  // User Management
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @Get('users')
  async getUsers(@Query() query: AdminQueryDto) {
    return this.adminService.getUsers(query);
  }

  @ApiOperation({ summary: 'Get specific user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @Get('users/:userId')
  async getUser(@Param('userId') userId: string) {
    return this.adminService.getUser(userId);
  }

  @ApiOperation({ summary: 'Update user information' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @Put('users/:userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateDto: AdminUserUpdateDto,
    @GetUser() admin: AuthenticatedUser,
  ) {
    return this.adminService.updateUser(userId, updateDto, admin.id);
  }

  @ApiOperation({ summary: 'Suspend user account' })
  @ApiResponse({ status: 200, description: 'User suspended successfully' })
  @Post('users/:userId/suspend')
  async suspendUser(
    @Param('userId') userId: string,
    @Body('reason') reason: string,
    @GetUser() admin: AuthenticatedUser,
  ) {
    return this.adminService.suspendUser(userId, reason, admin.id);
  }

  @ApiOperation({ summary: 'Activate user account' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  @Post('users/:userId/activate')
  async activateUser(
    @Param('userId') userId: string,
    @GetUser() admin: AuthenticatedUser,
  ) {
    return this.adminService.activateUser(userId, admin.id);
  }

  @ApiOperation({ summary: 'Delete user account' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @Delete('users/:userId')
  async deleteUser(
    @Param('userId') userId: string,
    @GetUser() admin: AuthenticatedUser,
  ) {
    return this.adminService.deleteUser(userId, admin.id);
  }

  // Analytics & Reports
  @ApiOperation({ summary: 'Get user analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  @Get('analytics/users')
  async getUserAnalytics(@Query() query: AdminQueryDto) {
    return this.adminService.getUserAnalytics(query);
  }

  @ApiOperation({ summary: 'Get reading analytics' })
  @ApiResponse({ status: 200, description: 'Reading analytics retrieved successfully' })
  @Get('analytics/reading')
  async getReadingAnalytics(@Query() query: AdminQueryDto) {
    return this.adminService.getReadingAnalytics(query);
  }

  @ApiOperation({ summary: 'Get rewards analytics' })
  @ApiResponse({ status: 200, description: 'Rewards analytics retrieved successfully' })
  @Get('analytics/rewards')
  async getRewardsAnalytics(@Query() query: AdminQueryDto) {
    return this.adminService.getRewardsAnalytics(query);
  }

  @ApiOperation({ summary: 'Export analytics data' })
  @ApiResponse({ status: 200, description: 'Export initiated successfully' })
  @Post('analytics/export')
  async exportAnalytics(
    @Body('type') type: string,
    @Body('format') format: string,
    @GetUser() admin: AuthenticatedUser,
  ) {
    return this.adminService.exportAnalytics(type, format, admin.id);
  }

  // Reward Management
  @ApiOperation({ summary: 'Get pending rewards' })
  @ApiResponse({ status: 200, description: 'Pending rewards retrieved successfully' })
  @Get('rewards/pending')
  async getPendingRewards(@Query() query: AdminQueryDto) {
    return this.adminService.getPendingRewards(query);
  }

  @ApiOperation({ summary: 'Process reward payments' })
  @ApiResponse({ status: 200, description: 'Rewards processed successfully' })
  @Post('rewards/process')
  async processRewards(
    @Body('rewardIds') rewardIds: string[],
    @GetUser() admin: AuthenticatedUser,
  ) {
    return this.adminService.processRewards(rewardIds, admin.id);
  }

  @ApiOperation({ summary: 'Manual reward adjustment' })
  @ApiResponse({ status: 200, description: 'Reward adjusted successfully' })
  @Post('rewards/adjust')
  async adjustReward(
    @Body() adjustmentDto: AdminRewardDto,
    @GetUser() admin: AuthenticatedUser,
  ) {
    return this.adminService.manualRewardAdjustment(adjustmentDto, admin.id);
  }

  @ApiOperation({ summary: 'Get all transactions' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  @Get('rewards/transactions')
  async getTransactions(@Query() query: AdminQueryDto) {
    return this.adminService.getTransactions(query);
  }

  // System Settings
  @ApiOperation({ summary: 'Get app settings' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  @Get('settings')
  async getSettings() {
    return this.adminService.getSettings();
  }

  @ApiOperation({ summary: 'Update app settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  @Put('settings')
  async updateSettings(
    @Body() settings: Record<string, any>,
    @GetUser() admin: AuthenticatedUser,
  ) {
    return this.adminService.updateSettings(settings, admin.id);
  }

  // Content Management
  @ApiOperation({ summary: 'Get content statistics' })
  @ApiResponse({ status: 200, description: 'Content stats retrieved successfully' })
  @Get('content/stats')
  async getContentStats() {
    return this.adminService.getContentStats();
  }

  // System Health
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ status: 200, description: 'System health retrieved successfully' })
  @Get('health')
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  @ApiOperation({ summary: 'Get system logs' })
  @ApiResponse({ status: 200, description: 'Logs retrieved successfully' })
  @Get('logs')
  async getSystemLogs(@Query() query: AdminQueryDto) {
    return this.adminService.getSystemLogs(query);
  }

  // Maintenance
  @ApiOperation({ summary: 'Toggle maintenance mode' })
  @ApiResponse({ status: 200, description: 'Maintenance mode toggled successfully' })
  @Post('maintenance')
  async toggleMaintenance(
    @Body('enabled') enabled: boolean,
    @Body('message') message: string,
    @GetUser() admin: AuthenticatedUser,
  ) {
    return this.adminService.toggleMaintenanceMode(enabled, message, admin.id);
  }
}