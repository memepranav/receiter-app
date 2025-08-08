# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A modern Quran reading app with blockchain rewards system where users can explore and read the Quran by Juz (30 parts), Hizb (60 halves), and Rubʿ al-Hizb (240 quarters). Features structured navigation, bookmarking, translation support, and a Solana-based rewards system with an admin panel for management. The language is Arabic.

This is a monorepo containing:
- **Backend API (NestJS)** - Core application logic and mobile APIs
- **Admin Panel (Next.js)** - Management interface for users, analytics, and rewards
- **Shared Packages** - Common types, utilities, database schemas, and blockchain integration
- **Mobile Integration** - React Native support with Solana wallet connectivity

## Development Commands

### Quick Start
```bash
# Setup monorepo
pnpm install

# Start databases
docker-compose -f docker-compose.dev.yml up -d

# Generate Prisma client
pnpm db:generate

# Seed database
pnpm db:seed

# Start development (both API and admin panel)
pnpm dev
```

### Individual Services
```bash
pnpm dev:api      # Backend API only
pnpm dev:admin    # Admin panel only
```

### Database Operations
```bash
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema changes
pnpm db:seed      # Seed with initial data
pnpm db:studio    # Open Prisma Studio
```

### Building & Testing
```bash
pnpm build        # Build all apps
pnpm build:api    # Build API only
pnpm build:admin  # Build admin only
pnpm test         # Run all tests
pnpm test:e2e     # End-to-end tests
pnpm lint         # Lint code
```

### Blockchain Operations
```bash
pnpm blockchain:build   # Build Solana program
pnpm blockchain:deploy  # Deploy to Solana
```

## Technology Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: MongoDB with Prisma ORM
- **Caching**: Redis
- **Authentication**: JWT with Passport
- **Validation**: Zod schemas
- **API Documentation**: Swagger/OpenAPI

### Frontend (Admin Panel)
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **HTTP Client**: Fetch API with custom wrapper

## UI References (Admin Panel)

### Color Scheme
```css
/* Primary Colors */
--primary: #5955DD; /* Slate Blue - main brand color */
--primary-foreground: #FFFFFF; /* White text on primary backgrounds */
--primary-hover: #4A46C7; /* Darker slate blue for hover states */

/* Secondary Colors */
--secondary: #F149FE; /* Pink Flamingo - secondary brand color */
--secondary-foreground: #FFFFFF; /* White text on secondary backgrounds */
--secondary-hover: #E937ED; /* Darker pink for hover states */

/* Background Colors */
--background: #F5F5F5; /* Light grey background (from mobile app) */
--background-dark: #1E293B; /* Dark theme main background */
--surface: #FFFFFF; /* White card/panel background */
--surface-dark: #334155; /* Dark card/panel background */
--muted: #E8E8E8; /* Subtle background for less prominent elements */
--muted-dark: #475569; /* Dark theme muted background */

/* Text Colors */
--foreground: #1E293B; /* Primary text color (dark) */
--foreground-dark: #F8FAFC; /* Primary text color (dark theme) */
--muted-foreground: #64748B; /* Secondary/subtitle text color */
--muted-foreground-dark: #94A3B8; /* Dark theme secondary text */

/* Status Colors */
--success: #10B981; /* Green for success states */
--warning: #F59E0B; /* Orange for warning states */
--error: #EF4444; /* Red for error states */
--info: #3B82F6; /* Blue for informational states */

/* Border & Divider Colors */
--border: #E2E8F0; /* Default border color */
--border-dark: #475569; /* Dark theme borders */
--input-border: #D1D5DB; /* Form input borders */
--divider: #E5E7EB; /* Section dividers */

/* Gradient Colors */
--gradient-primary: linear-gradient(135deg, #5955DD 0%, #4A46C7 100%); /* Slate Blue gradient */
--gradient-secondary: linear-gradient(135deg, #F149FE 0%, #E937ED 100%); /* Pink Flamingo gradient */
--gradient-dual: linear-gradient(135deg, #5955DD 0%, #F149FE 100%); /* Primary to Secondary gradient */
--gradient-primary-soft: linear-gradient(135deg, #5955DD 20%, rgba(89, 85, 221, 0.1) 100%); /* Soft primary gradient */
--gradient-secondary-soft: linear-gradient(135deg, #F149FE 20%, rgba(241, 73, 254, 0.1) 100%); /* Soft secondary gradient */
--gradient-dual-radial: radial-gradient(circle, #5955DD 0%, #F149FE 100%); /* Radial dual gradient */
```

### Component Styling Guidelines
- **Navigation Elements**: Primary color (#5955DD) for active states and branding
- **Progress Indicators**: Dual gradient (#5955DD to #F149FE) for completion circles
- **Action Buttons**: Primary color for main actions, secondary for special features
- **Card Components**: White surfaces on light grey background with subtle shadows
- **Dark Contrast Cards**: Navy background (#1E293B) with white text for emphasis
- **Status Indicators**: Color-coded badges using primary/secondary colors
- **Floating Elements**: Secondary color (#F149FE) for prominent floating buttons
- **Charts & Analytics**: Primary gradient for data visualization
- **Bottom Navigation**: Dark background with primary color for active icons

### Mobile App Color Usage Reference
Based on the mobile app design:
- **App Background**: Light grey (#F5F5F5) for main screen background
- **Card Surfaces**: Pure white (#FFFFFF) for content cards
- **Branding Elements**: Slate Blue (#5955DD) for logo and primary elements
- **Interactive Elements**: Pink Flamingo (#F149FE) for call-to-action buttons
- **Progress/Stats**: Dual gradient combining both primary colors
- **Contrast Areas**: Dark navy for emphasis cards with white text
- **Success/Rewards**: Gold accent (#F59E0B) for achievement elements

### Blockchain
- **Network**: Solana
- **Framework**: Anchor (Rust)
- **Client Library**: @solana/web3.js
- **Mobile Wallet**: Solana Mobile Stack

### DevOps
- **Package Manager**: pnpm (monorepo workspaces)
- **Build Tool**: Turbo
- **Containerization**: Docker
- **Database**: MongoDB + Redis (Docker Compose)

## Architecture

### Backend Structure
- **Modular Design**: Feature-based modules (auth, users, quran, rewards, analytics)
- **Repository Pattern**: Data access abstraction with Prisma
- **Service Layer**: Business logic separation
- **Guard/Interceptor Pattern**: Authentication and response formatting
- **DTO Pattern**: Request/response validation with Zod

### Frontend Architecture
- **Component-Based**: Reusable UI components with shadcn/ui
- **Custom Hooks**: Data fetching and state management
- **Layout System**: Consistent admin interface with sidebar navigation
- **Form Handling**: Type-safe forms with validation
- **Error Boundaries**: Graceful error handling

### Database Design
- **Document-Oriented**: MongoDB for flexible user data and reading sessions
- **Relational Modeling**: User relationships and reading progress tracking
- **Caching Strategy**: Redis for real-time data (leaderboards, sessions)
- **Indexing**: Optimized queries for user activity and analytics

## Core Features

### Quran Structure Management
- Hierarchical Data: Juz → Hizb → Rubʿ → Ayahs organization
- Content Delivery: Structured JSON-based Quran text serving
- Translation Support: Multi-language translation system
- Audio Integration: Multiple reciter support with streaming

### User Reading System
- Progress Tracking: Real-time reading session monitoring
- Bookmark System: Personal ayah bookmarking with notes
- Completion Detection: Automatic surah/juz completion tracking
- Reading Analytics: Session duration, ayah count, reading patterns

### Rewards & Blockchain Integration
- Point Calculation: Dynamic reward calculation based on reading activity
- Solana Integration: Smart contract for token distribution
- Wallet Management: Mobile wallet connection and balance tracking
- Transaction Processing: Automated reward distribution and withdrawal

### Admin Management System
- User Management: User profiles, activity monitoring, account control
- Analytics Dashboard: Reading statistics, user engagement metrics
- Reward Management: Rule configuration, payout processing, transaction logs
- Content Management: Quran structure, translations, audio files

## Key Database Collections

- **users**: User profiles, preferences, wallet info, statistics
- **reading_sessions**: Individual reading sessions with ayah tracking
- **bookmarks**: User bookmarks with notes and organization
- **rewards**: Reward transactions and blockchain records
- **analytics_events**: User interaction tracking
- **app_settings**: Dynamic application configuration

## API Structure

### Mobile APIs (`/api/v1/`)

#### Authentication Endpoints (`/auth/*`)
- **POST /api/v1/auth/register** - User registration with email/password
- **POST /api/v1/auth/login** - User login authentication
- **POST /api/v1/auth/google** - Google OAuth registration/login
- **POST /api/v1/auth/refresh** - JWT token refresh
- **POST /api/v1/auth/logout** - User logout
- **POST /api/v1/auth/forgot-password** - Password reset request
- **POST /api/v1/auth/reset-password** - Password reset confirmation

#### User Profile Management (`/user/*`)
- **GET /api/v1/user/profile** - Get user profile data
- **PUT /api/v1/user/profile** - Update user profile
- **POST /api/v1/user/avatar** - Upload profile picture
- **PUT /api/v1/user/preferences** - Update user preferences
- **PUT /api/v1/user/password** - Change password
- **DELETE /api/v1/user/account** - Delete user account

#### Quran Content APIs (`/quran/*`)
- **GET /api/v1/quran/juz/{id}** - Get Juz content
- **GET /api/v1/quran/surah/{id}** - Get Surah content
- **GET /api/v1/quran/ayah/{surah}/{ayah}** - Get specific Ayah
- **GET /api/v1/quran/translations** - Get available translations
- **GET /api/v1/quran/reciters** - Get available reciters
- **GET /api/v1/quran/audio/{reciter}/{surah}** - Get audio recitation

#### Reading Progress Tracking (`/reading/*`)
- **POST /api/v1/reading/session/start** - Start reading session
- **PUT /api/v1/reading/session/progress** - Update reading progress
- **POST /api/v1/reading/session/complete** - Complete reading session
- **GET /api/v1/reading/history** - Get reading history
- **GET /api/v1/reading/stats** - Get reading statistics

#### Bookmarks System (`/bookmarks/*`)
- **GET /api/v1/bookmarks** - Get user bookmarks
- **POST /api/v1/bookmarks** - Create bookmark
- **PUT /api/v1/bookmarks/{id}** - Update bookmark
- **DELETE /api/v1/bookmarks/{id}** - Delete bookmark

#### Rewards System (`/rewards/*`)
- **GET /api/v1/rewards/balance** - Get reward balance
- **GET /api/v1/rewards/history** - Get reward history
- **POST /api/v1/rewards/claim** - Claim pending rewards
- **POST /api/v1/rewards/withdraw** - Withdraw to wallet
- **GET /api/v1/rewards/leaderboard** - Get leaderboard

#### Badge System (`/badges/*`)
- **GET /api/v1/badges** - Get user badges
- **GET /api/v1/badges/available** - Get available badges
- **POST /api/v1/badges/claim** - Claim earned badge

#### Social Features (`/social/*`)
- **GET /api/v1/social/friends** - Get friends list
- **POST /api/v1/social/friends/add** - Send friend request
- **PUT /api/v1/social/friends/{id}/accept** - Accept friend request
- **DELETE /api/v1/social/friends/{id}** - Remove friend
- **GET /api/v1/social/leaderboard** - Friends leaderboard

#### Achievements & Streaks (`/achievements/*`)
- **GET /api/v1/achievements** - Get user achievements
- **GET /api/v1/achievements/available** - Get available achievements
- **GET /api/v1/streaks/current** - Get current reading streak
- **GET /api/v1/streaks/history** - Get streak history

#### Notifications (`/notifications/*`)
- **GET /api/v1/notifications** - Get user notifications
- **PUT /api/v1/notifications/{id}/read** - Mark notification as read
- **PUT /api/v1/notifications/read-all** - Mark all as read
- **PUT /api/v1/notifications/settings** - Update notification preferences

#### Analytics & Tracking (`/analytics/*`)
- **POST /api/v1/analytics/event** - Track user event
- **GET /api/v1/analytics/dashboard** - Get user analytics
- **GET /api/v1/analytics/insights** - Get reading insights

### Admin APIs (`/api/admin/`)

#### Admin Authentication
- **POST /api/admin/auth/login** - Admin login
- **GET /api/admin/auth/me** - Get admin profile
- **POST /api/admin/auth/logout** - Admin logout

#### User Management
- **GET /api/admin/users** - Get all users (paginated)
- **GET /api/admin/users/{id}** - Get specific user
- **PUT /api/admin/users/{id}** - Update user
- **DELETE /api/admin/users/{id}** - Delete user
- **PUT /api/admin/users/{id}/suspend** - Suspend user account
- **PUT /api/admin/users/{id}/activate** - Activate user account

#### Analytics & Reports
- **GET /api/admin/analytics/overview** - Dashboard overview
- **GET /api/admin/analytics/users** - User analytics
- **GET /api/admin/analytics/reading** - Reading analytics
- **GET /api/admin/analytics/rewards** - Rewards analytics
- **POST /api/admin/analytics/export** - Export analytics data

#### Reward Management
- **GET /api/admin/rewards/pending** - Get pending rewards
- **POST /api/admin/rewards/process** - Process reward payments
- **PUT /api/admin/rewards/rules** - Update reward rules
- **GET /api/admin/rewards/transactions** - Get all transactions

#### Content Management
- **GET /api/admin/content/quran** - Manage Quran content
- **PUT /api/admin/content/translations** - Update translations
- **PUT /api/admin/content/reciters** - Manage reciters
- **POST /api/admin/content/upload** - Upload audio files

#### System Configuration
- **GET /api/admin/settings** - Get app settings
- **PUT /api/admin/settings** - Update app settings
- **GET /api/admin/logs** - Get system logs
- **POST /api/admin/maintenance** - Maintenance mode toggle


## Security Considerations

### Authentication & Authorization
- JWT-based authentication with 7-day expiration
- Role-based access control (user, admin roles)
- Request rate limiting per endpoint
- Input validation with comprehensive error handling

### Blockchain Security
- Wallet signature verification for fund security
- Multi-signature admin wallet for reward distribution
- Transaction monitoring and fraud detection
- Private key management with environment encryption

## Development Notes

- Uses TypeScript throughout the stack for type safety
- Feature-based module organization for clear code ownership
- Shared component library for UI consistency
- Centralized configuration management
- Automated testing with CI/CD integration
- Code formatting with Prettier and ESLint


## Port Configurations:

# Current Setup (August 2025):
# - Admin Panel: localhost:3000 (Next.js - runs locally)
# - API Server: 161.35.11.154:3001 (NestJS - runs on server)
# - Database: MongoDB on server 161.35.11.154:27017
# - Redis Cache: Server 161.35.11.154:6379
#
# IMPORTANT: Never modify apps/admin/.env.local - keep it pointing to server API
# Admin panel connects to live server API and database for all operations