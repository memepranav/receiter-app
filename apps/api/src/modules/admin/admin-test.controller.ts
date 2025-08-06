import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Admin Test')
@Controller('admin')
export class AdminTestController {
  
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
}