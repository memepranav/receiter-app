import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (configService: ConfigService) => ({
  secret: configService.get('JWT_SECRET'),
  signOptions: { 
    expiresIn: configService.get('JWT_EXPIRES_IN') || '7d' 
  },
});