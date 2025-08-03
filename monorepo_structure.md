# Monorepo Project Structure

## Root Configuration

### package.json (Root)
```json
{
  "name": "quran-reciter-platform",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "pnpm run --parallel dev",
    "dev:api": "pnpm --filter api dev",
    "dev:admin": "pnpm --filter admin dev",
    "build": "pnpm run --recursive build",
    "db:generate": "pnpm --filter database generate",
    "db:push": "pnpm --filter database push",
    "db:seed": "pnpm --filter database seed"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "turbo": "^1.10.0"
  }
}
```

### turbo.json (For better build performance)
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "db:generate": {
      "cache": false
    }
  }
}
```

## Backend API Structure (NestJS)

### apps/api/src/
```
src/
├── main.ts                 # Application bootstrap
├── app.module.ts           # Root module
├── config/
│   ├── database.config.ts
│   ├── jwt.config.ts
│   ├── redis.config.ts
│   └── blockchain.config.ts
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── guards/
│   │   │   ├── jwt.guard.ts
│   │   │   └── admin.guard.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── dto/
│   │   └── entities/
│   ├── quran/
│   │   ├── quran.module.ts
│   │   ├── controllers/
│   │   │   ├── juz.controller.ts
│   │   │   ├── surah.controller.ts
│   │   │   └── ayah.controller.ts
│   │   ├── services/
│   │   │   ├── quran.service.ts
│   │   │   └── structure.service.ts
│   │   └── dto/
│   ├── reading/
│   │   ├── reading.module.ts
│   │   ├── controllers/
│   │   │   ├── progress.controller.ts
│   │   │   ├── bookmarks.controller.ts
│   │   │   └── sessions.controller.ts
│   │   ├── services/
│   │   └── dto/
│   ├── rewards/
│   │   ├── rewards.module.ts
│   │   ├── controllers/
│   │   │   ├── rewards.controller.ts
│   │   │   └── blockchain.controller.ts
│   │   ├── services/
│   │   │   ├── rewards.service.ts
│   │   │   ├── calculation.service.ts
│   │   │   └── blockchain.service.ts
│   │   └── dto/
│   ├── analytics/
│   │   ├── analytics.module.ts
│   │   ├── analytics.controller.ts
│   │   ├── analytics.service.ts
│   │   └── dto/
│   └── admin/
│       ├── admin.module.ts
│       ├── controllers/
│       │   ├── dashboard.controller.ts
│       │   ├── user-management.controller.ts
│       │   ├── content.controller.ts
│       │   └── reward-management.controller.ts
│       ├── services/
│       └── dto/
├── common/
│   ├── decorators/
│   │   ├── user.decorator.ts
│   │   └── admin.decorator.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── roles.guard.ts
│   ├── interceptors/
│   │   ├── response.interceptor.ts
│   │   └── logging.interceptor.ts
│   ├── pipes/
│   │   └── validation.pipe.ts
│   └── middleware/
│       ├── cors.middleware.ts
│       └── rate-limit.middleware.ts
└── shared/
    ├── interfaces/
    ├── types/
    ├── constants/
    └── utils/
```

### Example NestJS Module Structure

#### apps/api/src/modules/auth/auth.module.ts
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '7d' },
      }),
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

#### apps/api/src/modules/auth/auth.controller.ts
```typescript
import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { JwtAuthGuard } from './guards/jwt.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@Request() req) {
    return req.user;
  }
}
```

## Admin Panel Structure (Next.js)

### apps/admin/
```
apps/admin/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Dashboard
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── users/
│   │   │   ├── page.tsx        # Users list
│   │   │   └── [id]/
│   │   │       └── page.tsx    # User details
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── rewards/
│   │   │   ├── page.tsx
│   │   │   ├── rules/
│   │   │   │   └── page.tsx
│   │   │   └── transactions/
│   │   │       └── page.tsx
│   │   ├── content/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Navigation.tsx
│   │   ├── dashboard/
│   │   │   ├── StatsCards.tsx
│   │   │   ├── UserChart.tsx
│   │   │   └── RecentActivity.tsx
│   │   ├── users/
│   │   │   ├── UserTable.tsx
│   │   │   ├── UserModal.tsx
│   │   │   └── UserFilters.tsx
│   │   ├── rewards/
│   │   │   ├── RewardRules.tsx
│   │   │   ├── TransactionTable.tsx
│   │   │   └── PayoutQueue.tsx
│   │   └── common/
│   │       ├── DataTable.tsx
│   │       ├── Modal.tsx
│   │       └── LoadingSpinner.tsx
│   ├── lib/
│   │   ├── api.ts              # API client
│   │   ├── auth.ts             # Authentication utilities
│   │   ├── utils.ts            # Utility functions
│   │   └── validations.ts      # Zod schemas
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   ├── useUsers.ts
│   │   └── useAnalytics.ts
│   ├── store/
│   │   ├── auth.ts             # Zustand auth store
│   │   ├── users.ts
│   │   └── app.ts
│   └── types/
│       ├── auth.ts
│       ├── user.ts
│       ├── analytics.ts
│       └── api.ts
├── public/
├── package.json
└── next.config.js
```

## Shared Packages

### packages/shared/
```
packages/shared/
├── src/
│   ├── types/
│   │   ├── user.ts
│   │   ├── quran.ts
│   │   ├── rewards.ts
│   │   ├── analytics.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   ├── schemas/
│   │   ├── auth.schema.ts      # Zod schemas
│   │   ├── user.schema.ts
│   │   ├── quran.schema.ts
│   │   └── rewards.schema.ts
│   └── config/
│       ├── api.config.ts
│       └── app.config.ts
├── package.json
└── tsconfig.json
```

### packages/database/
```
packages/database/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed/
│       ├── quran-structure.ts
│       ├── users.ts
│       └── index.ts
├── src/
│   ├── client.ts               # Prisma client
│   ├── types.ts                # Generated types
│   └── utils/
│       ├── connection.ts
│       └── migrations.ts
├── package.json
└── scripts/
    ├── seed.ts
    ├── migrate.ts
    └── generate.ts
```

### packages/blockchain/
```
packages/blockchain/
├── src/
│   ├── contracts/
│   │   ├── reward-program.ts
│   │   └── types.ts
│   ├── services/
│   │   ├── solana.service.ts
│   │   ├── wallet.service.ts
│   │   └── reward.service.ts
│   ├── utils/
│   │   ├── connection.ts
│   │   └── keypair.ts
│   └── config/
│       ├── networks.ts
│       └── program-ids.ts
├── programs/                   # Anchor programs
│   └── quran-rewards/
│       ├── src/
│       │   └── lib.rs
│       └── Cargo.toml
├── package.json
└── Anchor.toml
```

## Development Workflow Commands

### Environment Setup
```bash
# Clone and setup
git clone <repo>
cd quran-reciter-platform
pnpm install

# Database setup
pnpm db:generate
pnpm db:push
pnpm db:seed

# Development
pnpm dev                    # Start all apps
pnpm dev:api               # Start only API
pnpm dev:admin             # Start only admin panel

# Build
pnpm build                 # Build all
pnpm build --filter api    # Build only API
```

### Package.json Scripts (Root)
```json
{
  "scripts": {
    "dev": "turbo run dev --parallel",
    "dev:api": "pnpm --filter api dev",
    "dev:admin": "pnpm --filter admin dev",
    "build": "turbo run build",
    "build:api": "pnpm --filter api build",
    "build:admin": "pnpm --filter admin build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "db:generate": "pnpm --filter database generate",
    "db:push": "pnpm --filter database push",
    "db:seed": "pnpm --filter database seed",
    "db:studio": "pnpm --filter database studio",
    "blockchain:build": "pnpm --filter blockchain build-program",
    "blockchain:deploy": "pnpm --filter blockchain deploy"
  }
}
```
