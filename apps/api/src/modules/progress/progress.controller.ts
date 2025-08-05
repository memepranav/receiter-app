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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/auth.interface';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

// DTOs
import { StartReadingSessionDto } from './dto/start-reading-session.dto';
import { UpdateReadingProgressDto } from './dto/update-reading-progress.dto';
import { CompleteReadingSessionDto } from './dto/complete-reading-session.dto';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@ApiTags('Reading Progress & Goals')
@Controller('v1/progress')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  // Reading Sessions
  @ApiOperation({ summary: 'Start new reading session' })
  @ApiResponse({ status: 201, description: 'Reading session started' })
  @Post('session/start')
  async startSession(
    @GetUser() user: AuthenticatedUser,
    @Body() startSessionDto: StartReadingSessionDto,
  ) {
    return this.progressService.startReadingSession(user.id, startSessionDto);
  }

  @ApiOperation({ summary: 'Update reading progress' })
  @ApiResponse({ status: 200, description: 'Progress updated successfully' })
  @Put('session/:sessionId/progress')
  async updateProgress(
    @GetUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
    @Body() updateProgressDto: UpdateReadingProgressDto,
  ) {
    return this.progressService.updateReadingProgress(user.id, sessionId, updateProgressDto);
  }

  @ApiOperation({ summary: 'Complete reading session' })
  @ApiResponse({ status: 200, description: 'Session completed successfully' })
  @Post('session/:sessionId/complete')
  @HttpCode(HttpStatus.OK)
  async completeSession(
    @GetUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
    @Body() completeSessionDto: CompleteReadingSessionDto,
  ) {
    return this.progressService.completeReadingSession(user.id, sessionId, completeSessionDto);
  }

  @ApiOperation({ summary: 'Get current active session' })
  @ApiResponse({ status: 200, description: 'Active session retrieved' })
  @Get('session/active')
  async getActiveSession(@GetUser() user: AuthenticatedUser) {
    return this.progressService.getActiveSession(user.id);
  }

  @ApiOperation({ summary: 'Get reading session history' })
  @ApiResponse({ status: 200, description: 'Session history retrieved' })
  @Get('sessions')
  async getSessionHistory(
    @GetUser() user: AuthenticatedUser,
    @Query('limit') limit = 20,
    @Query('page') page = 1,
  ) {
    return this.progressService.getSessionHistory(user.id, { limit, page });
  }

  // Bookmarks
  @ApiOperation({ summary: 'Get user bookmarks' })
  @ApiResponse({ status: 200, description: 'Bookmarks retrieved successfully' })
  @Get('bookmarks')
  async getBookmarks(
    @GetUser() user: AuthenticatedUser,
    @Query('category') category?: string,
    @Query('surah') surah?: number,
  ) {
    return this.progressService.getBookmarks(user.id, { category, surah });
  }

  @ApiOperation({ summary: 'Create new bookmark' })
  @ApiResponse({ status: 201, description: 'Bookmark created successfully' })
  @Post('bookmarks')
  async createBookmark(
    @GetUser() user: AuthenticatedUser,
    @Body() createBookmarkDto: CreateBookmarkDto,
  ) {
    return this.progressService.createBookmark(user.id, createBookmarkDto);
  }

  @ApiOperation({ summary: 'Update bookmark' })
  @ApiResponse({ status: 200, description: 'Bookmark updated successfully' })
  @Put('bookmarks/:bookmarkId')
  async updateBookmark(
    @GetUser() user: AuthenticatedUser,
    @Param('bookmarkId') bookmarkId: string,
    @Body() updateBookmarkDto: UpdateBookmarkDto,
  ) {
    return this.progressService.updateBookmark(user.id, bookmarkId, updateBookmarkDto);
  }

  @ApiOperation({ summary: 'Delete bookmark' })
  @ApiResponse({ status: 200, description: 'Bookmark deleted successfully' })
  @Delete('bookmarks/:bookmarkId')
  async deleteBookmark(
    @GetUser() user: AuthenticatedUser,
    @Param('bookmarkId') bookmarkId: string,
  ) {
    return this.progressService.deleteBookmark(user.id, bookmarkId);
  }

  // Goals
  @ApiOperation({ summary: 'Get user reading goals' })
  @ApiResponse({ status: 200, description: 'Goals retrieved successfully' })
  @Get('goals')
  async getGoals(
    @GetUser() user: AuthenticatedUser,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.progressService.getGoals(user.id, { status, type });
  }

  @ApiOperation({ summary: 'Create new reading goal' })
  @ApiResponse({ status: 201, description: 'Goal created successfully' })
  @Post('goals')
  async createGoal(
    @GetUser() user: AuthenticatedUser,
    @Body() createGoalDto: CreateGoalDto,
  ) {
    return this.progressService.createGoal(user.id, createGoalDto);
  }

  @ApiOperation({ summary: 'Update reading goal' })
  @ApiResponse({ status: 200, description: 'Goal updated successfully' })
  @Put('goals/:goalId')
  async updateGoal(
    @GetUser() user: AuthenticatedUser,
    @Param('goalId') goalId: string,
    @Body() updateGoalDto: UpdateGoalDto,
  ) {
    return this.progressService.updateGoal(user.id, goalId, updateGoalDto);
  }

  @ApiOperation({ summary: 'Delete reading goal' })
  @ApiResponse({ status: 200, description: 'Goal deleted successfully' })
  @Delete('goals/:goalId')
  async deleteGoal(
    @GetUser() user: AuthenticatedUser,
    @Param('goalId') goalId: string,
  ) {
    return this.progressService.deleteGoal(user.id, goalId);
  }

  // Progress Overview
  @ApiOperation({ summary: 'Get reading progress overview' })
  @ApiResponse({ status: 200, description: 'Progress overview retrieved' })
  @Get('overview')
  async getProgressOverview(@GetUser() user: AuthenticatedUser) {
    return this.progressService.getProgressOverview(user.id);
  }

  @ApiOperation({ summary: 'Get reading statistics' })
  @ApiResponse({ status: 200, description: 'Reading statistics retrieved' })
  @Get('stats')
  async getReadingStats(
    @GetUser() user: AuthenticatedUser,
    @Query('period') period: 'week' | 'month' | 'year' = 'month',
  ) {
    return this.progressService.getReadingStats(user.id, period);
  }
}