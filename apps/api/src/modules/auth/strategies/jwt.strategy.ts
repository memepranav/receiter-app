import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from '../../users/schemas/user.schema';
import { Admin, AdminDocument } from '../../admin/schemas/admin.schema';
import { JwtPayload, AuthenticatedUser } from '../interfaces/auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    // First check if it's a regular user
    const user = await this.userModel.findById(payload.sub).exec();
    
    if (user) {
      if (!user.isActive) {
        throw new UnauthorizedException('User account is deactivated');
      }

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }

    // If not found in users, check if it's an admin
    const admin = await this.adminModel.findById(payload.sub).exec();
    
    if (admin) {
      if (!admin.status?.isActive) {
        throw new UnauthorizedException('Admin account is deactivated');
      }

      return {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.profile?.displayName || 
              `${admin.profile?.firstName} ${admin.profile?.lastName}`.trim() || 
              'Admin User',
        role: admin.role,
      };
    }

    throw new UnauthorizedException('User not found');
  }
}