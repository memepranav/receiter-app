# Mobile Reading Progress APIs

API documentation for tracking user reading sessions, bookmarks, goals, and reading statistics.

## Base URL
```
https://161.35.11.154/api/v1
```

## Authentication
All endpoints require JWT authentication:
```http
Authorization: Bearer <jwt_token>
```

---

## Reading Sessions

### POST `/reading/session/start`

Start a new reading session.

#### Request Body
```json
{
  "type": "surah",
  "contentId": "2",
  "contentName": "البقرة",
  "startPosition": {
    "surah": 2,
    "ayah": 1,
    "juz": 1,
    "hizb": 1,
    "quarter": 1
  },
  "deviceInfo": {
    "platform": "ios",
    "appVersion": "1.2.0"
  },
  "location": {
    "latitude": 24.7136,
    "longitude": 46.6753,
    "country": "SA",
    "city": "Riyadh"
  }
}
```

#### Request Schema
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | ✅ | Session type: 'surah', 'juz', 'hizb', 'quarter', 'random' |
| `contentId` | string | ✅ | ID of content being read (surah number, juz number, etc.) |
| `contentName` | string | ✅ | Display name of content |
| `startPosition` | object | ✅ | Starting position details |
| `startPosition.surah` | integer | ✅ | Starting surah number |
| `startPosition.ayah` | integer | ✅ | Starting ayah number |
| `startPosition.juz` | integer | ❌ | Juz number |
| `startPosition.hizb` | integer | ❌ | Hizb number |
| `startPosition.quarter` | integer | ❌ | Quarter number |
| `deviceInfo` | object | ❌ | Device information |
| `location` | object | ❌ | User location for analytics |

#### Success Response (201)
```json
{
  "success": true,
  "message": "تم بدء جلسة القراءة بنجاح",
  "data": {
    "sessionId": "66b1a2c4d5e6f7g8h9i0j1k2",
    "startedAt": "2024-08-07T14:30:00.000Z",
    "type": "surah",
    "contentId": "2",
    "contentName": "البقرة",
    "startPosition": {
      "surah": 2,
      "ayah": 1,
      "juz": 1,
      "hizb": 1,
      "quarter": 1
    },
    "status": "active"
  }
}
```

#### Error Responses

**400 Bad Request - Session Already Active**
```json
{
  "success": false,
  "message": "لديك جلسة قراءة نشطة بالفعل",
  "code": "SESSION_ALREADY_ACTIVE",
  "data": {
    "activeSessionId": "existing_session_id"
  }
}
```

---

### PUT `/reading/session/progress`

Update progress during an active reading session.

#### Request Body
```json
{
  "sessionId": "66b1a2c4d5e6f7g8h9i0j1k2",
  "currentPosition": {
    "surah": 2,
    "ayah": 25,
    "juz": 1,
    "hizb": 1,
    "quarter": 1
  },
  "ayahsRead": [
    {
      "surah": 2,
      "ayah": 1,
      "timeSpent": 15,
      "readAt": "2024-08-07T14:30:15.000Z"
    },
    {
      "surah": 2,
      "ayah": 2,
      "timeSpent": 12,
      "readAt": "2024-08-07T14:30:27.000Z"
    }
  ],
  "totalTimeSpent": 450,
  "isActive": true
}
```

#### Request Schema
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sessionId` | string | ✅ | Active session ID |
| `currentPosition` | object | ✅ | Current reading position |
| `ayahsRead` | array | ❌ | Array of ayahs read with timing |
| `totalTimeSpent` | integer | ✅ | Total time spent in seconds |
| `isActive` | boolean | ✅ | Whether session is still active |

#### Success Response (200)
```json
{
  "success": true,
  "message": "تم تحديث تقدم القراءة بنجاح",
  "data": {
    "sessionId": "66b1a2c4d5e6f7g8h9i0j1k2",
    "updatedAt": "2024-08-07T14:37:30.000Z",
    "currentPosition": {
      "surah": 2,
      "ayah": 25,
      "juz": 1,
      "hizb": 1,
      "quarter": 1
    },
    "totalTimeSpent": 450,
    "ayahsReadCount": 25,
    "status": "active"
  }
}
```

#### Error Responses

**404 Not Found - Session Not Found**
```json
{
  "success": false,
  "message": "جلسة القراءة غير موجودة أو منتهية الصلاحية",
  "code": "SESSION_NOT_FOUND"
}
```

**400 Bad Request - Invalid Session**
```json
{
  "success": false,
  "message": "جلسة القراءة غير صالحة أو منتهية",
  "code": "INVALID_SESSION"
}
```

---

### POST `/reading/session/complete`

Complete and finalize a reading session.

#### Request Body
```json
{
  "sessionId": "66b1a2c4d5e6f7g8h9i0j1k2",
  "endPosition": {
    "surah": 2,
    "ayah": 50,
    "juz": 1,
    "hizb": 1,
    "quarter": 2
  },
  "totalTimeSpent": 1800,
  "ayahsCompleted": 50,
  "completionPercentage": 17.48,
  "qualityRating": 4,
  "notes": "قراءة هادئة ومركزة",
  "interruptions": 2,
  "distractions": ["notification", "call"]
}
```

#### Request Schema
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sessionId` | string | ✅ | Session ID to complete |
| `endPosition` | object | ✅ | Final reading position |
| `totalTimeSpent` | integer | ✅ | Total session duration in seconds |
| `ayahsCompleted` | integer | ✅ | Number of ayahs completed |
| `completionPercentage` | number | ❌ | Percentage of target content completed |
| `qualityRating` | integer | ❌ | User's self-rating (1-5) |
| `notes` | string | ❌ | User notes about the session |
| `interruptions` | integer | ❌ | Number of times session was paused |
| `distractions` | array | ❌ | List of distraction types |

#### Success Response (200)
```json
{
  "success": true,
  "message": "تم إنهاء جلسة القراءة بنجاح",
  "data": {
    "sessionId": "66b1a2c4d5e6f7g8h9i0j1k2",
    "completedAt": "2024-08-07T15:00:00.000Z",
    "totalTimeSpent": 1800,
    "ayahsCompleted": 50,
    "pointsEarned": 50,
    "achievements": [
      {
        "id": "first_surah_session",
        "name": "بداية القراءة",
        "description": "أكمل أول جلسة قراءة سورة",
        "points": 10,
        "icon": "🌟"
      }
    ],
    "streakUpdate": {
      "currentStreak": 3,
      "longestStreak": 7,
      "streakBonus": 5
    },
    "nextMilestone": {
      "type": "surah_completion",
      "target": "البقرة",
      "progress": 17.48,
      "remaining": 236
    }
  }
}
```

---

### GET `/reading/history`

Get user's reading session history.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | ❌ | Page number (default: 1) |
| `limit` | integer | ❌ | Items per page (default: 20, max: 100) |
| `type` | string | ❌ | Filter by session type |
| `period` | string | ❌ | Filter by time period: 'today', 'week', 'month', 'year' |
| `surah` | integer | ❌ | Filter by specific surah |
| `juz` | integer | ❌ | Filter by specific juz |

#### Example Request
```
GET /api/v1/reading/history?period=month&limit=10&type=surah
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "sessionId": "66b1a2c4d5e6f7g8h9i0j1k2",
        "type": "surah",
        "contentId": "2",
        "contentName": "البقرة",
        "startedAt": "2024-08-07T14:30:00.000Z",
        "completedAt": "2024-08-07T15:00:00.000Z",
        "totalTimeSpent": 1800,
        "ayahsCompleted": 50,
        "startPosition": {
          "surah": 2,
          "ayah": 1
        },
        "endPosition": {
          "surah": 2,
          "ayah": 50
        },
        "completionPercentage": 17.48,
        "pointsEarned": 50,
        "qualityRating": 4
      }
      // ... more sessions
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalSessions": 98,
      "hasNext": true,
      "hasPrevious": false
    },
    "summary": {
      "totalTimeSpent": 45600,
      "totalSessions": 98,
      "averageSessionTime": 465,
      "totalAyahsRead": 2450,
      "totalPointsEarned": 2450
    }
  }
}
```

---

### GET `/reading/stats`

Get comprehensive reading statistics and progress.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `period` | string | ❌ | Stats period: 'all', 'year', 'month', 'week' (default: 'all') |
| `granularity` | string | ❌ | Data granularity: 'day', 'week', 'month' (default: 'day') |

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalReadingTime": 45600,
      "totalSessions": 98,
      "totalAyahsRead": 2450,
      "completedSurahs": 15,
      "completedJuz": 2,
      "currentStreak": 7,
      "longestStreak": 23,
      "averageSessionTime": 465,
      "totalPoints": 2450,
      "level": 5,
      "globalRank": 142
    },
    "currentProgress": {
      "currentJuz": 3,
      "currentHizb": 5,
      "currentQuarter": 2,
      "currentSurah": 2,
      "currentAyah": 125,
      "lastReadDate": "2024-08-07T15:00:00.000Z",
      "overallProgress": 39.26
    },
    "streakInfo": {
      "currentStreak": 7,
      "longestStreak": 23,
      "streakStartDate": "2024-08-01T00:00:00.000Z",
      "nextMilestone": {
        "days": 30,
        "reward": "شارة الثبات الذهبية",
        "points": 100
      }
    },
    "weeklyGoals": {
      "timeGoalMinutes": 300,
      "ayahGoal": 100,
      "sessionGoal": 7,
      "progress": {
        "timeSpent": 285,
        "ayahsRead": 95,
        "sessionsCompleted": 6,
        "timeProgress": 95.0,
        "ayahProgress": 95.0,
        "sessionProgress": 85.7
      }
    },
    "recentActivity": [
      {
        "date": "2024-08-07",
        "sessionsCount": 2,
        "timeSpent": 3600,
        "ayahsRead": 75,
        "pointsEarned": 75
      },
      {
        "date": "2024-08-06",
        "sessionsCount": 1,
        "timeSpent": 1800,
        "ayahsRead": 42,
        "pointsEarned": 42
      }
      // ... last 30 days
    ],
    "readingPatterns": {
      "favoriteReadingTime": "evening",
      "averageSessionDuration": 465,
      "mostReadSurah": {
        "number": 2,
        "name": "البقرة",
        "sessionsCount": 25
      },
      "readingVelocity": {
        "ayahsPerMinute": 2.3,
        "trend": "improving"
      }
    }
  }
}
```

---

## Bookmarks

### GET `/bookmarks`

Get user's bookmarks.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | ❌ | Page number (default: 1) |
| `limit` | integer | ❌ | Items per page (default: 50) |
| `surah` | integer | ❌ | Filter by surah number |
| `tags` | string | ❌ | Filter by tags (comma-separated) |
| `sort` | string | ❌ | Sort by: 'created', 'position', 'name' (default: 'created') |

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "bookmarks": [
      {
        "id": "66b1a2c4d5e6f7g8h9i0j1k3",
        "name": "آية الكرسي",
        "ayah": {
          "surah": 2,
          "surahName": "البقرة",
          "ayah": 255,
          "text": "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ...",
          "juz": 3,
          "hizb": 5,
          "quarter": 1
        },
        "notes": "آية عظيمة للحفظ والتدبر",
        "tags": ["favorite", "memorization", "protection"],
        "color": "#FFD700",
        "createdAt": "2024-08-05T10:30:00.000Z",
        "lastAccessedAt": "2024-08-07T14:30:00.000Z"
      }
      // ... more bookmarks
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalBookmarks": 45,
      "hasNext": true
    }
  }
}
```

---

### POST `/bookmarks`

Create a new bookmark.

#### Request Body
```json
{
  "name": "آية الكرسي",
  "surah": 2,
  "ayah": 255,
  "notes": "آية عظيمة للحفظ والتدبر",
  "tags": ["favorite", "memorization", "protection"],
  "color": "#FFD700"
}
```

#### Request Schema
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Bookmark name |
| `surah` | integer | ✅ | Surah number |
| `ayah` | integer | ✅ | Ayah number |
| `notes` | string | ❌ | Personal notes |
| `tags` | array | ❌ | Array of tag strings |
| `color` | string | ❌ | Hex color code |

#### Success Response (201)
```json
{
  "success": true,
  "message": "تم حفظ العلامة المرجعية بنجاح",
  "data": {
    "id": "66b1a2c4d5e6f7g8h9i0j1k4",
    "name": "آية الكرسي",
    "ayah": {
      "surah": 2,
      "surahName": "البقرة",
      "ayah": 255,
      "text": "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ...",
      "juz": 3,
      "hizb": 5,
      "quarter": 1
    },
    "notes": "آية عظيمة للحفظ والتدبر",
    "tags": ["favorite", "memorization", "protection"],
    "color": "#FFD700",
    "createdAt": "2024-08-07T15:30:00.000Z"
  }
}
```

#### Error Responses

**409 Conflict - Bookmark Exists**
```json
{
  "success": false,
  "message": "هذه الآية محفوظة في العلامات المرجعية بالفعل",
  "code": "BOOKMARK_EXISTS"
}
```

---

### PUT `/bookmarks/{bookmarkId}`

Update an existing bookmark.

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bookmarkId` | string | ✅ | Bookmark ID |

#### Request Body
```json
{
  "name": "آية الكرسي المحدثة",
  "notes": "آية عظيمة للحفظ والتدبر - تحديث الملاحظات",
  "tags": ["favorite", "memorization", "protection", "daily"],
  "color": "#FF6B6B"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "تم تحديث العلامة المرجعية بنجاح",
  "data": {
    "updated": true
  }
}
```

---

### DELETE `/bookmarks/{bookmarkId}`

Delete a bookmark.

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bookmarkId` | string | ✅ | Bookmark ID |

#### Success Response (200)
```json
{
  "success": true,
  "message": "تم حذف العلامة المرجعية بنجاح",
  "data": {
    "deleted": true
  }
}
```

---

## Reading Goals

### GET `/goals`

Get user's reading goals.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | ❌ | Filter by status: 'active', 'completed', 'paused' |
| `type` | string | ❌ | Filter by type: 'daily', 'weekly', 'monthly', 'yearly', 'custom' |

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "goals": [
      {
        "id": "66b1a2c4d5e6f7g8h9i0j1k5",
        "title": "قراءة جزء عم",
        "description": "إكمال قراءة جزء عم في شهر",
        "type": "custom",
        "target": {
          "type": "juz",
          "value": 30,
          "name": "جزء عم"
        },
        "timeframe": {
          "type": "monthly",
          "startDate": "2024-08-01T00:00:00.000Z",
          "endDate": "2024-08-31T23:59:59.000Z",
          "daysRemaining": 24
        },
        "progress": {
          "current": 15,
          "total": 37,
          "percentage": 40.54,
          "ayahsRead": 285,
          "timeSpent": 4200
        },
        "milestones": [
          {
            "name": "ربع الطريق",
            "threshold": 25,
            "achieved": true,
            "achievedAt": "2024-08-05T16:30:00.000Z"
          },
          {
            "name": "نصف الطريق",
            "threshold": 50,
            "achieved": false,
            "estimated": "2024-08-15T00:00:00.000Z"
          }
        ],
        "reward": {
          "points": 100,
          "badge": "قارئ جزء عم",
          "description": "مكافأة إكمال جزء عم"
        },
        "status": "active",
        "createdAt": "2024-08-01T00:00:00.000Z"
      }
      // ... more goals
    ]
  }
}
```

---

### POST `/goals`

Create a new reading goal.

#### Request Body
```json
{
  "title": "قراءة سورة البقرة",
  "description": "إكمال قراءة سورة البقرة في أسبوعين",
  "type": "custom",
  "target": {
    "type": "surah",
    "value": 2,
    "name": "البقرة"
  },
  "timeframe": {
    "type": "custom",
    "duration": 14,
    "unit": "days"
  },
  "reminderEnabled": true,
  "reminderTime": "19:00",
  "isPublic": false
}
```

#### Request Schema
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ | Goal title |
| `description` | string | ❌ | Goal description |
| `type` | string | ✅ | Goal type: 'daily', 'weekly', 'monthly', 'yearly', 'custom' |
| `target` | object | ✅ | Goal target specification |
| `target.type` | string | ✅ | Target type: 'ayahs', 'time', 'sessions', 'surah', 'juz' |
| `target.value` | number/string | ✅ | Target value |
| `timeframe` | object | ✅ | Goal timeframe |
| `reminderEnabled` | boolean | ❌ | Enable reminders |
| `reminderTime` | string | ❌ | Reminder time (HH:MM format) |
| `isPublic` | boolean | ❌ | Make goal visible to friends |

#### Success Response (201)
```json
{
  "success": true,
  "message": "تم إنشاء الهدف بنجاح",
  "data": {
    "id": "66b1a2c4d5e6f7g8h9i0j1k6",
    "title": "قراءة سورة البقرة",
    "description": "إكمال قراءة سورة البقرة في أسبوعين",
    "type": "custom",
    "target": {
      "type": "surah",
      "value": 2,
      "name": "البقرة"
    },
    "timeframe": {
      "type": "custom",
      "startDate": "2024-08-07T15:30:00.000Z",
      "endDate": "2024-08-21T15:30:00.000Z",
      "daysRemaining": 14
    },
    "progress": {
      "current": 0,
      "total": 286,
      "percentage": 0,
      "ayahsRead": 0,
      "timeSpent": 0
    },
    "status": "active",
    "createdAt": "2024-08-07T15:30:00.000Z"
  }
}
```

---

### PUT `/goals/{goalId}`

Update an existing goal.

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `goalId` | string | ✅ | Goal ID |

#### Request Body
```json
{
  "title": "قراءة سورة البقرة (محدث)",
  "description": "إكمال قراءة سورة البقرة مع التدبر",
  "reminderEnabled": true,
  "reminderTime": "20:00",
  "status": "active"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "تم تحديث الهدف بنجاح",
  "data": {
    "updated": true
  }
}
```

---

### DELETE `/goals/{goalId}`

Delete a reading goal.

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `goalId` | string | ✅ | Goal ID |

#### Success Response (200)
```json
{
  "success": true,
  "message": "تم حذف الهدف بنجاح",
  "data": {
    "deleted": true
  }
}
```

---

## Analytics & Insights

### GET `/reading/insights`

Get personalized reading insights and recommendations.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `period` | string | ❌ | Analysis period: 'week', 'month', 'quarter' (default: 'month') |
| `includeRecommendations` | boolean | ❌ | Include AI-powered recommendations (default: true) |

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "summary": {
      "period": "month",
      "totalReadingTime": 7200,
      "improvement": "+23%",
      "consistency": 85.7,
      "focus": 92.3
    },
    "patterns": {
      "bestReadingTime": "evening",
      "averageSessionLength": 25,
      "mostProductiveDays": ["Friday", "Saturday", "Sunday"],
      "readingVelocity": {
        "current": 2.3,
        "trend": "improving",
        "improvement": "+15%"
      }
    },
    "achievements": {
      "completedGoals": 3,
      "streakRecords": 1,
      "newPersonalBests": ["longest_session", "daily_ayahs"],
      "badgesEarned": 2
    },
    "recommendations": [
      {
        "type": "schedule",
        "priority": "high",
        "title": "حسن أوقات القراءة",
        "description": "بياناتك تُظهر أن أفضل أوقات القراءة لك هي المساء. احرص على استغلال هذا الوقت.",
        "action": "تنبيه يومي في الساعة 8:00 مساءً"
      },
      {
        "type": "content",
        "priority": "medium",
        "title": "اقتراح قراءة جديدة",
        "description": "بناءً على قراءاتك السابقة، قد تستفيد من قراءة سورة الكهف.",
        "action": "بدء قراءة سورة الكهف",
        "content": {
          "surah": 18,
          "name": "الكهف",
          "ayahs": 110,
          "estimatedTime": "45 دقيقة"
        }
      }
    ],
    "challenges": [
      {
        "id": "consistency_challenge",
        "title": "تحدي الثبات الأسبوعي",
        "description": "اقرأ لمدة 7 أيام متتالية",
        "progress": 4,
        "target": 7,
        "reward": "50 نقطة + شارة الثبات"
      }
    ]
  }
}
```

---

## Error Handling

Common error responses across all progress endpoints:

| Status | Code | Description |
|--------|------|-------------|
| 400 | `VALIDATION_ERROR` | Request data validation failed |
| 401 | `UNAUTHORIZED` | Authentication required |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource already exists |
| 422 | `UNPROCESSABLE_ENTITY` | Invalid entity state |

### Error Response Format
```json
{
  "success": false,
  "message": "رسالة الخطأ باللغة العربية",
  "error": "Detailed error message in English",
  "statusCode": 400,
  "code": "ERROR_CODE"
}
```

---

## Best Practices

### 1. **Session Management**
```javascript
// Start session when user begins reading
const session = await api.startReadingSession({
  type: 'surah',
  contentId: '2',
  contentName: 'البقرة',
  startPosition: currentPosition
});

// Update progress every 30 seconds or when changing ayah
setInterval(() => {
  api.updateSessionProgress({
    sessionId: session.sessionId,
    currentPosition: getCurrentPosition(),
    totalTimeSpent: getSessionDuration()
  });
}, 30000);

// Complete session when user finishes or closes app
await api.completeSession({
  sessionId: session.sessionId,
  endPosition: currentPosition,
  totalTimeSpent: getSessionDuration()
});
```

### 2. **Offline Sync**
```javascript
// Store session data locally and sync when online
const offlineSessionData = {
  sessionId,
  updates: [],
  completed: false
};

// Sync when connection is restored
if (navigator.onLine) {
  await syncOfflineSessions();
}
```

### 3. **Goal Tracking**
```javascript
// Check goal progress after each session
const goals = await api.getGoals({ status: 'active' });
goals.forEach(goal => {
  if (goal.progress.percentage >= 100) {
    showGoalCompletionCelebration(goal);
  }
});
```

### 4. **Performance Optimization**
- Update session progress in batches
- Cache reading statistics locally
- Use progressive loading for history
- Implement optimistic updates for better UX

---

**Last Updated:** August 2025  
**API Version:** 1.2