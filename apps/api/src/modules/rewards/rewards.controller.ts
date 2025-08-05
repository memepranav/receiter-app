import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { RewardsService } from './rewards.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/auth.interface';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

// DTOs
import { ClaimRewardsDto } from './dto/claim-rewards.dto';
import { WithdrawTokensDto } from './dto/withdraw-tokens.dto';
import { GetRewardsQueryDto } from './dto/get-rewards-query.dto';
import { GetTransactionsQueryDto } from './dto/get-transactions-query.dto';

@ApiTags('Rewards & Blockchain')
@Controller('v1/rewards')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @ApiOperation({ summary: 'Get user reward balance' })
  @ApiResponse({ status: 200, description: 'Reward balance retrieved successfully' })
  @Get('balance')
  async getBalance(@GetUser() user: AuthenticatedUser) {
    return this.rewardsService.getBalance(user.id);
  }

  @ApiOperation({ summary: 'Get user reward history' })
  @ApiResponse({ status: 200, description: 'Reward history retrieved successfully' })
  @Get('history')
  async getRewardHistory(
    @GetUser() user: AuthenticatedUser,
    @Query() query: GetRewardsQueryDto,
  ) {
    return this.rewardsService.getRewardHistory(user.id, query);
  }

  @ApiOperation({ summary: 'Get pending rewards' })
  @ApiResponse({ status: 200, description: 'Pending rewards retrieved successfully' })
  @Get('pending')
  async getPendingRewards(@GetUser() user: AuthenticatedUser) {
    return this.rewardsService.getPendingRewards(user.id);
  }

  @ApiOperation({ summary: 'Claim pending rewards' })
  @ApiResponse({ status: 200, description: 'Rewards claimed successfully' })
  @Post('claim')
  @HttpCode(HttpStatus.OK)
  async claimRewards(
    @GetUser() user: AuthenticatedUser,
    @Body() claimRewardsDto: ClaimRewardsDto,
  ) {
    return this.rewardsService.claimRewards(user.id, claimRewardsDto);
  }

  @ApiOperation({ summary: 'Withdraw tokens to wallet' })
  @ApiResponse({ status: 200, description: 'Withdrawal initiated successfully' })
  @Post('withdraw')
  @HttpCode(HttpStatus.OK)
  async withdrawTokens(
    @GetUser() user: AuthenticatedUser,
    @Body() withdrawTokensDto: WithdrawTokensDto,
  ) {
    return this.rewardsService.withdrawTokens(user.id, withdrawTokensDto);
  }

  @ApiOperation({ summary: 'Get transaction history' })
  @ApiResponse({ status: 200, description: 'Transaction history retrieved successfully' })
  @Get('transactions')
  async getTransactionHistory(
    @GetUser() user: AuthenticatedUser,
    @Query() query: GetTransactionsQueryDto,
  ) {
    return this.rewardsService.getTransactionHistory(user.id, query);
  }

  @ApiOperation({ summary: 'Get specific transaction details' })
  @ApiResponse({ status: 200, description: 'Transaction details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @Get('transactions/:transactionId')
  async getTransaction(
    @GetUser() user: AuthenticatedUser,
    @Param('transactionId') transactionId: string,
  ) {
    return this.rewardsService.getTransaction(user.id, transactionId);
  }

  @ApiOperation({ summary: 'Get rewards leaderboard' })
  @ApiResponse({ status: 200, description: 'Leaderboard retrieved successfully' })
  @Get('leaderboard')
  async getLeaderboard(
    @Query('period') period: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'all_time',
    @Query('limit') limit = 10,
  ) {
    return this.rewardsService.getLeaderboard(period, limit);
  }

  @ApiOperation({ summary: 'Get available badges' })
  @ApiResponse({ status: 200, description: 'Available badges retrieved successfully' })
  @Get('badges/available')
  async getAvailableBadges(@GetUser() user: AuthenticatedUser) {
    return this.rewardsService.getAvailableBadges(user.id);
  }

  @ApiOperation({ summary: 'Get user badges' })
  @ApiResponse({ status: 200, description: 'User badges retrieved successfully' })
  @Get('badges')
  async getUserBadges(@GetUser() user: AuthenticatedUser) {
    return this.rewardsService.getUserBadges(user.id);
  }

  @ApiOperation({ summary: 'Claim earned badge' })
  @ApiResponse({ status: 200, description: 'Badge claimed successfully' })
  @ApiResponse({ status: 400, description: 'Badge not available or already claimed' })
  @Post('badges/:badgeId/claim')
  @HttpCode(HttpStatus.OK)
  async claimBadge(
    @GetUser() user: AuthenticatedUser,
    @Param('badgeId') badgeId: string,
  ) {
    return this.rewardsService.claimBadge(user.id, badgeId);
  }

  @ApiOperation({ summary: 'Get reward statistics' })
  @ApiResponse({ status: 200, description: 'Reward statistics retrieved successfully' })
  @Get('stats')
  async getRewardStats(@GetUser() user: AuthenticatedUser) {
    return this.rewardsService.getRewardStats(user.id);
  }

  @ApiOperation({ summary: 'Get referral rewards info' })
  @ApiResponse({ status: 200, description: 'Referral info retrieved successfully' })
  @Get('referral')
  async getReferralInfo(@GetUser() user: AuthenticatedUser) {
    return this.rewardsService.getReferralInfo(user.id);
  }

  @ApiOperation({ summary: 'Process referral (when someone uses your referral code)' })
  @ApiResponse({ status: 200, description: 'Referral processed successfully' })
  @Post('referral/process')
  @HttpCode(HttpStatus.OK)
  async processReferral(
    @GetUser() user: AuthenticatedUser,
    @Body('referralCode') referralCode: string,
  ) {
    return this.rewardsService.processReferral(user.id, referralCode);
  }
}