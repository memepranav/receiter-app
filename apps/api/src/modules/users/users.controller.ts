import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/auth.interface';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

// DTOs
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { ConnectWalletDto } from './dto/connect-wallet.dto';
import { AddFriendDto } from './dto/add-friend.dto';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';

// Query DTOs
import { GetUsersQueryDto } from './dto/get-users-query.dto';

@ApiTags('User Management')
@Controller('api/v1/user')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @Get('profile')
  async getProfile(@GetUser() user: AuthenticatedUser) {
    return this.usersService.getProfile(user.id);
  }

  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @Put('profile')
  async updateProfile(
    @GetUser() user: AuthenticatedUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, updateProfileDto);
  }

  @ApiOperation({ summary: 'Upload profile avatar' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  @ApiConsumes('multipart/form-data')
  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @GetUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatar(user.id, file);
  }

  @ApiOperation({ summary: 'Update reading preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  @Put('preferences')
  async updatePreferences(
    @GetUser() user: AuthenticatedUser,
    @Body() updatePreferencesDto: UpdatePreferencesDto,
  ) {
    return this.usersService.updatePreferences(user.id, updatePreferencesDto);
  }

  @ApiOperation({ summary: 'Get user reading statistics' })
  @ApiResponse({ status: 200, description: 'Reading statistics retrieved' })
  @Get('stats')
  async getReadingStats(@GetUser() user: AuthenticatedUser) {
    return this.usersService.getReadingStats(user.id);
  }

  @ApiOperation({ summary: 'Connect Solana wallet' })
  @ApiResponse({ status: 200, description: 'Wallet connected successfully' })
  @Post('wallet/connect')
  async connectWallet(
    @GetUser() user: AuthenticatedUser,
    @Body() connectWalletDto: ConnectWalletDto,
  ) {
    return this.usersService.connectWallet(user.id, connectWalletDto);
  }

  @ApiOperation({ summary: 'Disconnect wallet' })
  @ApiResponse({ status: 200, description: 'Wallet disconnected successfully' })
  @Post('wallet/disconnect')
  @HttpCode(HttpStatus.OK)
  async disconnectWallet(@GetUser() user: AuthenticatedUser) {
    return this.usersService.disconnectWallet(user.id);
  }

  @ApiOperation({ summary: 'Get user badges' })
  @ApiResponse({ status: 200, description: 'User badges retrieved' })
  @Get('badges')
  async getBadges(@GetUser() user: AuthenticatedUser) {
    return this.usersService.getUserBadges(user.id);
  }

  @ApiOperation({ summary: 'Get friends list' })
  @ApiResponse({ status: 200, description: 'Friends list retrieved' })
  @Get('friends')
  async getFriends(@GetUser() user: AuthenticatedUser) {
    return this.usersService.getFriends(user.id);
  }

  @ApiOperation({ summary: 'Send friend request' })
  @ApiResponse({ status: 200, description: 'Friend request sent' })
  @Post('friends/request')
  async sendFriendRequest(
    @GetUser() user: AuthenticatedUser,
    @Body() addFriendDto: AddFriendDto,
  ) {
    return this.usersService.sendFriendRequest(user.id, addFriendDto.userId);
  }

  @ApiOperation({ summary: 'Accept friend request' })
  @ApiResponse({ status: 200, description: 'Friend request accepted' })
  @Post('friends/:userId/accept')
  async acceptFriendRequest(
    @GetUser() user: AuthenticatedUser,
    @Param('userId') friendUserId: string,
  ) {
    return this.usersService.acceptFriendRequest(user.id, friendUserId);
  }

  @ApiOperation({ summary: 'Reject friend request' })
  @ApiResponse({ status: 200, description: 'Friend request rejected' })
  @Post('friends/:userId/reject')
  async rejectFriendRequest(
    @GetUser() user: AuthenticatedUser,
    @Param('userId') friendUserId: string,
  ) {
    return this.usersService.rejectFriendRequest(user.id, friendUserId);
  }

  @ApiOperation({ summary: 'Remove friend' })
  @ApiResponse({ status: 200, description: 'Friend removed successfully' })
  @Delete('friends/:userId')
  async removeFriend(
    @GetUser() user: AuthenticatedUser,
    @Param('userId') friendUserId: string,
  ) {
    return this.usersService.removeFriend(user.id, friendUserId);
  }

  @ApiOperation({ summary: 'Update notification settings' })
  @ApiResponse({ status: 200, description: 'Notification settings updated' })
  @Put('notifications')
  async updateNotificationSettings(
    @GetUser() user: AuthenticatedUser,
    @Body() updateNotificationSettingsDto: UpdateNotificationSettingsDto,
  ) {
    return this.usersService.updateNotificationSettings(user.id, updateNotificationSettingsDto);
  }

  @ApiOperation({ summary: 'Search users' })
  @ApiResponse({ status: 200, description: 'Users found' })
  @Get('search')
  async searchUsers(
    @GetUser() user: AuthenticatedUser,
    @Query() query: GetUsersQueryDto,
  ) {
    return this.usersService.searchUsers(query, user.id);
  }

  @ApiOperation({ summary: 'Get leaderboard' })
  @ApiResponse({ status: 200, description: 'Leaderboard retrieved' })
  @Get('leaderboard')
  async getLeaderboard(
    @Query('type') type: 'points' | 'reading_time' | 'level' = 'points',
    @Query('limit') limit = 10,
  ) {
    return this.usersService.getLeaderboard(type, limit);
  }

  @ApiOperation({ summary: 'Delete user account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @Delete('account')
  async deleteAccount(@GetUser() user: AuthenticatedUser) {
    return this.usersService.deleteAccount(user.id);
  }
}