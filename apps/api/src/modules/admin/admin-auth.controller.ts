import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

import { AuthService } from '../auth/auth.service';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { LoginDto } from '../auth/dto/login.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';
import { AuthenticatedUser } from '../auth/interfaces/auth.interface';

@ApiTags('Admin Authentication')
@Controller('api/admin/auth')
@UseInterceptors(TransformInterceptor)
@UseGuards(ThrottlerGuard)
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, description: 'Admin successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(@Body() loginDto: LoginDto, @GetUser() user: AuthenticatedUser) {
    // Check if user has admin role
    if (user.role !== 'admin') {
      throw new Error('Access denied. Admin privileges required.');
    }
    return this.authService.login(user);
  }
}