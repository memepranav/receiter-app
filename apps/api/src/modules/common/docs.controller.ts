import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Documentation')
@Controller()
export class DocsController {
  @ApiOperation({ summary: 'Get all available API endpoints' })
  @ApiResponse({ status: 200, description: 'List of all API endpoints' })
  @Public()
  @Get('endpoints')
  getEndpoints() {
    return {
      title: 'Quran Reciter API Documentation',
      version: '1.0.0',
      baseUrl: 'http://161.35.11.154/api',
      endpoints: {
        authentication: {
          register: {
            method: 'POST',
            url: '/api/v1/auth/register',
            description: 'Register a new user',
            body: {
              email: 'user@example.com',
              password: 'password123',
              name: 'User Name',
              phoneNumber: '+1234567890'
            },
            response: {
              accessToken: 'jwt_token_here',
              refreshToken: 'refresh_token_here',
              user: {
                id: 'user_id',
                email: 'user@example.com',
                name: 'User Name'
              }
            }
          },
          login: {
            method: 'POST',
            url: '/api/v1/auth/login',
            description: 'Login user',
            body: {
              email: 'user@example.com',
              password: 'password123'
            },
            response: {
              accessToken: 'jwt_token_here',
              refreshToken: 'refresh_token_here'
            }
          },
          googleLogin: {
            method: 'GET',
            url: '/api/v1/auth/google',
            description: 'Google OAuth login'
          },
          refreshToken: {
            method: 'POST',
            url: '/api/v1/auth/refresh',
            description: 'Refresh access token',
            body: {
              refreshToken: 'refresh_token_here'
            }
          },
          forgotPassword: {
            method: 'POST',
            url: '/api/v1/auth/forgot-password',
            description: 'Request password reset',
            body: {
              email: 'user@example.com'
            }
          },
          resetPassword: {
            method: 'POST',
            url: '/api/v1/auth/reset-password',
            description: 'Reset password with token',
            body: {
              token: 'reset_token',
              password: 'new_password'
            }
          }
        },
        user: {
          profile: {
            method: 'GET',
            url: '/api/v1/user/profile',
            description: 'Get user profile',
            headers: {
              Authorization: 'Bearer jwt_token_here'
            }
          },
          updateProfile: {
            method: 'PUT',
            url: '/api/v1/user/profile',
            description: 'Update user profile',
            headers: {
              Authorization: 'Bearer jwt_token_here'
            },
            body: {
              name: 'Updated Name',
              phoneNumber: '+1234567890'
            }
          },
          connectWallet: {
            method: 'POST',
            url: '/api/v1/user/wallet/connect',
            description: 'Connect Solana wallet',
            headers: {
              Authorization: 'Bearer jwt_token_here'
            },
            body: {
              publicKey: 'solana_public_key',
              signature: 'wallet_signature'
            }
          }
        },
        quran: {
          getJuz: {
            method: 'GET',
            url: '/api/v1/quran/juz/{id}',
            description: 'Get Juz content by ID',
            example: '/api/v1/quran/juz/1'
          },
          getSurah: {
            method: 'GET',
            url: '/api/v1/quran/surah/{id}',
            description: 'Get Surah content by ID',
            example: '/api/v1/quran/surah/1'
          },
          getAyah: {
            method: 'GET',
            url: '/api/v1/quran/ayah/{surah}/{ayah}',
            description: 'Get specific Ayah',
            example: '/api/v1/quran/ayah/1/1'
          },
          getTranslations: {
            method: 'GET',
            url: '/api/v1/quran/translations',
            description: 'Get available translations'
          },
          getReciters: {
            method: 'GET',
            url: '/api/v1/quran/reciters',
            description: 'Get available reciters'
          }
        },
        reading: {
          startSession: {
            method: 'POST',
            url: '/api/v1/reading/session/start',
            description: 'Start reading session',
            headers: {
              Authorization: 'Bearer jwt_token_here'
            },
            body: {
              type: 'juz',
              contentId: '1'
            }
          },
          updateProgress: {
            method: 'PUT',
            url: '/api/v1/reading/session/progress',
            description: 'Update reading progress',
            headers: {
              Authorization: 'Bearer jwt_token_here'
            },
            body: {
              sessionId: 'session_id',
              ayahsRead: ['1:1', '1:2'],
              currentPosition: '1:2'
            }
          },
          completeSession: {
            method: 'POST',
            url: '/api/v1/reading/session/complete',
            description: 'Complete reading session',
            headers: {
              Authorization: 'Bearer jwt_token_here'
            },
            body: {
              sessionId: 'session_id'
            }
          }
        },
        bookmarks: {
          getBookmarks: {
            method: 'GET',
            url: '/api/v1/bookmarks',
            description: 'Get user bookmarks',
            headers: {
              Authorization: 'Bearer jwt_token_here'
            }
          },
          createBookmark: {
            method: 'POST',
            url: '/api/v1/bookmarks',
            description: 'Create bookmark',
            headers: {
              Authorization: 'Bearer jwt_token_here'
            },
            body: {
              surah: 1,
              ayah: 1,
              note: 'Personal note'
            }
          }
        },
        rewards: {
          getBalance: {
            method: 'GET',
            url: '/api/v1/rewards/balance',
            description: 'Get reward balance',
            headers: {
              Authorization: 'Bearer jwt_token_here'
            }
          },
          claimRewards: {
            method: 'POST',
            url: '/api/v1/rewards/claim',
            description: 'Claim pending rewards',
            headers: {
              Authorization: 'Bearer jwt_token_here'
            }
          },
          withdrawTokens: {
            method: 'POST',
            url: '/api/v1/rewards/withdraw',
            description: 'Withdraw tokens to wallet',
            headers: {
              Authorization: 'Bearer jwt_token_here'
            },
            body: {
              amount: 100,
              walletAddress: 'solana_wallet_address'
            }
          }
        }
      },
      notes: {
        authentication: 'Most endpoints require JWT token in Authorization header',
        baseUrl: 'All endpoints are prefixed with /api',
        mobileVersion: 'Use /api/v1/ prefix for mobile app endpoints',
        adminVersion: 'Admin endpoints use /api/admin/ prefix',
        responseFormat: 'All responses are wrapped in { success, data, message, timestamp } format'
      }
    };
  }
}