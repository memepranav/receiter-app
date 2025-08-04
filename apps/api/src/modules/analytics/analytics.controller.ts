import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/auth.interface';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

// DTOs
import { TrackEventDto } from './dto/track-event.dto';
import { StartSessionDto } from './dto/start-session.dto';
import { EndSessionDto } from './dto/end-session.dto';
import { GetAnalyticsQueryDto } from './dto/get-analytics-query.dto';

@ApiTags('Analytics & Tracking')
@Controller('api/v1/analytics')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiOperation({ summary: 'Track user event' })
  @ApiResponse({ status: 200, description: 'Event tracked successfully' })
  @Post('event')
  @HttpCode(HttpStatus.OK)
  async trackEvent(
    @GetUser() user: AuthenticatedUser,
    @Body() trackEventDto: TrackEventDto,
  ) {
    return this.analyticsService.trackEvent(user.id, trackEventDto);
  }

  @ApiOperation({ summary: 'Start user session' })
  @ApiResponse({ status: 200, description: 'Session started successfully' })
  @Post('session/start')
  @HttpCode(HttpStatus.OK)
  async startSession(
    @GetUser() user: AuthenticatedUser,
    @Body() startSessionDto: StartSessionDto,
  ) {
    return this.analyticsService.startSession(user.id, startSessionDto);
  }

  @ApiOperation({ summary: 'End user session' })
  @ApiResponse({ status: 200, description: 'Session ended successfully' })
  @Post('session/end')
  @HttpCode(HttpStatus.OK)
  async endSession(
    @GetUser() user: AuthenticatedUser,
    @Body() endSessionDto: EndSessionDto,
  ) {
    return this.analyticsService.endSession(user.id, endSessionDto);
  }

  @ApiOperation({ summary: 'Update session activity' })
  @ApiResponse({ status: 200, description: 'Session updated successfully' })
  @Post('session/update')
  @HttpCode(HttpStatus.OK)
  async updateSession(
    @GetUser() user: AuthenticatedUser,
    @Body() updateData: any,
  ) {
    return this.analyticsService.updateSession(user.id, updateData);
  }

  @ApiOperation({ summary: 'Get user analytics dashboard' })
  @ApiResponse({ status: 200, description: 'Analytics dashboard retrieved successfully' })
  @Get('dashboard')
  async getDashboard(
    @GetUser() user: AuthenticatedUser,
    @Query() query: GetAnalyticsQueryDto,
  ) {
    return this.analyticsService.getUserDashboard(user.id, query);
  }

  @ApiOperation({ summary: 'Get user reading insights' })
  @ApiResponse({ status: 200, description: 'Reading insights retrieved successfully' })
  @Get('insights')
  async getInsights(
    @GetUser() user: AuthenticatedUser,
    @Query('period') period: 'week' | 'month' | 'year' = 'month',
  ) {
    return this.analyticsService.getReadingInsights(user.id, period);
  }

  @ApiOperation({ summary: 'Get user activity timeline' })
  @ApiResponse({ status: 200, description: 'Activity timeline retrieved successfully' })
  @Get('timeline')
  async getTimeline(
    @GetUser() user: AuthenticatedUser,
    @Query() query: GetAnalyticsQueryDto,
  ) {
    return this.analyticsService.getActivityTimeline(user.id, query);
  }

  @ApiOperation({ summary: 'Get reading streak information' })
  @ApiResponse({ status: 200, description: 'Streak information retrieved successfully' })
  @Get('streak')
  async getStreak(@GetUser() user: AuthenticatedUser) {
    return this.analyticsService.getStreakInfo(user.id);
  }

  @ApiOperation({ summary: 'Get reading habits analysis' })
  @ApiResponse({ status: 200, description: 'Reading habits retrieved successfully' })
  @Get('habits')
  async getReadingHabits(
    @GetUser() user: AuthenticatedUser,
    @Query('period') period: 'week' | 'month' | 'year' = 'month',
  ) {
    return this.analyticsService.getReadingHabits(user.id, period);
  }

  @ApiOperation({ summary: 'Get user session history' })
  @ApiResponse({ status: 200, description: 'Session history retrieved successfully' })
  @Get('sessions')
  async getSessionHistory(
    @GetUser() user: AuthenticatedUser,
    @Query() query: GetAnalyticsQueryDto,
  ) {
    return this.analyticsService.getSessionHistory(user.id, query);
  }

  @ApiOperation({ summary: 'Get feature usage statistics' })
  @ApiResponse({ status: 200, description: 'Feature usage statistics retrieved successfully' })
  @Get('features')
  async getFeatureUsage(
    @GetUser() user: AuthenticatedUser,
    @Query('period') period: 'week' | 'month' | 'year' = 'month',
  ) {
    return this.analyticsService.getFeatureUsage(user.id, period);
  }

  @ApiOperation({ summary: 'Get user progress metrics' })
  @ApiResponse({ status: 200, description: 'Progress metrics retrieved successfully' })
  @Get('progress')
  async getProgressMetrics(@GetUser() user: AuthenticatedUser) {
    return this.analyticsService.getProgressMetrics(user.id);
  }
}