import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { Response } from 'express';

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

  @ApiOperation({ summary: 'Get HTML API documentation' })
  @ApiResponse({ status: 200, description: 'HTML API documentation page' })
  @Public()
  @Get('api-docs')
  getHtmlDocs(@Res() res: Response) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quran Reciter API Documentation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f8f9fa;
        }
        .header {
            background: linear-gradient(135deg, #5955DD 0%, #F149FE 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .section {
            background: white;
            margin: 20px 0;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .endpoint {
            background: #f8f9fa;
            border-left: 4px solid #5955DD;
            padding: 15px;
            margin: 15px 0;
            border-radius: 0 5px 5px 0;
        }
        .method {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 12px;
            margin-right: 10px;
        }
        .post { background: #28a745; color: white; }
        .get { background: #007bff; color: white; }
        .put { background: #ffc107; color: black; }
        .delete { background: #dc3545; color: white; }
        .url { font-family: Monaco, 'Consolas', monospace; color: #495057; }
        .code {
            background: #f1f3f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            font-family: Monaco, 'Consolas', monospace;
            font-size: 14px;
            margin: 10px 0;
        }
        .base-url {
            background: #e9ecef;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            font-family: Monaco, 'Consolas', monospace;
            font-weight: bold;
            margin-bottom: 20px;
        }
        h1, h2, h3 { color: #2c3e50; }
        h2 { border-bottom: 2px solid #5955DD; padding-bottom: 10px; }
        .note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🕌 Quran Reciter API Documentation</h1>
        <p>Complete API reference for mobile app integration</p>
        <p><strong>Version:</strong> 1.0.0</p>
    </div>

    <div class="base-url">
        <strong>Base URL:</strong> http://161.35.11.154/api
    </div>

    <div class="note">
        <strong>🔐 Authentication:</strong> Most endpoints require JWT token in <code>Authorization: Bearer &lt;token&gt;</code> header
    </div>

    <div class="section">
        <h2>🔑 Authentication Endpoints</h2>
        
        <div class="endpoint">
            <span class="method post">POST</span>
            <span class="url">/api/v1/auth/register</span>
            <p><strong>Description:</strong> Register a new user account</p>
            <div class="code">
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name",
  "phoneNumber": "+1234567890"
}
            </div>
        </div>

        <div class="endpoint">
            <span class="method post">POST</span>
            <span class="url">/api/v1/auth/login</span>
            <p><strong>Description:</strong> Login user and get JWT tokens</p>
            <div class="code">
{
  "email": "user@example.com",
  "password": "password123"
}
            </div>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="url">/api/v1/auth/google</span>
            <p><strong>Description:</strong> Google OAuth login</p>
        </div>

        <div class="endpoint">
            <span class="method post">POST</span>
            <span class="url">/api/v1/auth/refresh</span>
            <p><strong>Description:</strong> Refresh access token</p>
            <div class="code">
{
  "refreshToken": "your_refresh_token_here"
}
            </div>
        </div>
    </div>

    <div class="section">
        <h2>👤 User Profile Endpoints</h2>
        
        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="url">/api/v1/user/profile</span>
            <p><strong>Description:</strong> Get user profile data</p>
            <p><strong>Headers:</strong> <code>Authorization: Bearer &lt;token&gt;</code></p>
        </div>

        <div class="endpoint">
            <span class="method put">PUT</span>
            <span class="url">/api/v1/user/profile</span>
            <p><strong>Description:</strong> Update user profile</p>
            <div class="code">
{
  "name": "Updated Name",
  "phoneNumber": "+1234567890"
}
            </div>
        </div>

        <div class="endpoint">
            <span class="method post">POST</span>
            <span class="url">/api/v1/user/wallet/connect</span>
            <p><strong>Description:</strong> Connect Solana wallet</p>
            <div class="code">
{
  "publicKey": "solana_public_key_here",
  "signature": "wallet_signature_here"
}
            </div>
        </div>
    </div>

    <div class="section">
        <h2>📖 Quran Content Endpoints</h2>
        
        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="url">/api/v1/quran/juz/{id}</span>
            <p><strong>Description:</strong> Get Juz content by ID (1-30)</p>
            <p><strong>Example:</strong> <code>/api/v1/quran/juz/1</code></p>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="url">/api/v1/quran/surah/{id}</span>
            <p><strong>Description:</strong> Get Surah content by ID (1-114)</p>
            <p><strong>Example:</strong> <code>/api/v1/quran/surah/1</code></p>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="url">/api/v1/quran/ayah/{surah}/{ayah}</span>
            <p><strong>Description:</strong> Get specific Ayah</p>
            <p><strong>Example:</strong> <code>/api/v1/quran/ayah/1/1</code></p>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="url">/api/v1/quran/translations</span>
            <p><strong>Description:</strong> Get available translations</p>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="url">/api/v1/quran/reciters</span>
            <p><strong>Description:</strong> Get available reciters</p>
        </div>
    </div>

    <div class="section">
        <h2>📚 Reading Progress Endpoints</h2>
        
        <div class="endpoint">
            <span class="method post">POST</span>
            <span class="url">/api/v1/reading/session/start</span>
            <p><strong>Description:</strong> Start a new reading session</p>
            <div class="code">
{
  "type": "juz",
  "contentId": "1"
}
            </div>
        </div>

        <div class="endpoint">
            <span class="method put">PUT</span>
            <span class="url">/api/v1/reading/session/progress</span>
            <p><strong>Description:</strong> Update reading progress</p>
            <div class="code">
{
  "sessionId": "session_id_here",
  "ayahsRead": ["1:1", "1:2", "1:3"],
  "currentPosition": "1:3"
}
            </div>
        </div>

        <div class="endpoint">
            <span class="method post">POST</span>
            <span class="url">/api/v1/reading/session/complete</span>
            <p><strong>Description:</strong> Complete reading session</p>
            <div class="code">
{
  "sessionId": "session_id_here"
}
            </div>
        </div>
    </div>

    <div class="section">
        <h2>🔖 Bookmarks Endpoints</h2>
        
        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="url">/api/v1/bookmarks</span>
            <p><strong>Description:</strong> Get user bookmarks</p>
        </div>

        <div class="endpoint">
            <span class="method post">POST</span>
            <span class="url">/api/v1/bookmarks</span>
            <p><strong>Description:</strong> Create a new bookmark</p>
            <div class="code">
{
  "surah": 1,
  "ayah": 1,
  "note": "Personal note about this ayah"
}
            </div>
        </div>
    </div>

    <div class="section">
        <h2>🎁 Rewards & Blockchain Endpoints</h2>
        
        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="url">/api/v1/rewards/balance</span>
            <p><strong>Description:</strong> Get user reward balance</p>
        </div>

        <div class="endpoint">
            <span class="method post">POST</span>
            <span class="url">/api/v1/rewards/claim</span>
            <p><strong>Description:</strong> Claim pending rewards</p>
        </div>

        <div class="endpoint">
            <span class="method post">POST</span>
            <span class="url">/api/v1/rewards/withdraw</span>
            <p><strong>Description:</strong> Withdraw tokens to Solana wallet</p>
            <div class="code">
{
  "amount": 100,
  "walletAddress": "solana_wallet_address_here"
}
            </div>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="url">/api/v1/rewards/leaderboard</span>
            <p><strong>Description:</strong> Get rewards leaderboard</p>
        </div>
    </div>

    <div class="section">
        <h2>📊 Analytics Endpoints</h2>
        
        <div class="endpoint">
            <span class="method post">POST</span>
            <span class="url">/api/v1/analytics/event</span>
            <p><strong>Description:</strong> Track user events</p>
            <div class="code">
{
  "eventType": "ayah_read",
  "data": {
    "surah": 1,
    "ayah": 1
  }
}
            </div>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="url">/api/v1/analytics/dashboard</span>
            <p><strong>Description:</strong> Get user analytics dashboard</p>
        </div>
    </div>

    <div class="section">
        <h2>📱 Testing Your Integration</h2>
        <div class="code">
# Register a new user
curl -X POST http://161.35.11.154/api/v1/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "phoneNumber": "+1234567890"
  }'

# Login and get token
curl -X POST http://161.35.11.154/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Use token for authenticated requests
curl -X GET http://161.35.11.154/api/v1/user/profile \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
        </div>
    </div>

    <div class="section">
        <h2>ℹ️ Additional Resources</h2>
        <p><strong>JSON Format:</strong> <a href="http://161.35.11.154/api/endpoints">http://161.35.11.154/api/endpoints</a></p>
        <p><strong>Response Format:</strong> All responses are wrapped in <code>{ success, data, message, timestamp }</code></p>
        <p><strong>Error Handling:</strong> HTTP status codes with descriptive error messages</p>
        <p><strong>Rate Limiting:</strong> 100 requests per 15 minutes per IP</p>
    </div>

    <div style="text-align: center; margin: 30px 0; color: #666;">
        <p>📧 Questions? Contact the development team</p>
        <p>🔄 Last Updated: ${new Date().toLocaleDateString()}</p>
    </div>
</body>
</html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}