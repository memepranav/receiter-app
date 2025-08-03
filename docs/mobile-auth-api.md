# Mobile Authentication API Documentation

This document provides comprehensive information about the mobile authentication APIs for the Quran Reading App.

## Base URL
```
https://your-domain.com/api/v1
```

## Authentication
All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## User Registration

### POST /auth/register

Register a new user account with email and password.

#### Request Body
```json
{
  "fullName": "أحمد محمد علي",
  "email": "ahmed@example.com",
  "password": "securePassword123",
  "agreeToTerms": true,
  "language": "ar",
  "deviceInfo": {
    "type": "mobile",
    "os": "iOS",
    "version": "17.0"
  }
}
```

#### Request Schema
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fullName` | string | ✅ | User's full name in Arabic or English |
| `email` | string | ✅ | Valid email address |
| `password` | string | ✅ | Password (minimum 6 characters) |
| `agreeToTerms` | boolean | ✅ | Must be `true` to proceed |
| `language` | string | ❌ | User's preferred language (`ar`, `en`). Default: `ar` |
| `deviceInfo` | object | ❌ | Device information for analytics |
| `deviceInfo.type` | string | ❌ | Device type (`mobile`, `tablet`, `web`) |
| `deviceInfo.os` | string | ❌ | Operating system (`iOS`, `Android`, `Web`) |
| `deviceInfo.version` | string | ❌ | OS version |

#### Success Response (201)
```json
{
  "success": true,
  "message": "تم إنشاء الحساب بنجاح",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "66b1a2c4d5e6f7g8h9i0j1k2",
      "email": "ahmed@example.com",
      "profile": {
        "firstName": "أحمد",
        "lastName": "محمد علي",
        "displayName": "أحمد محمد علي",
        "avatar": null
      },
      "stats": {
        "totalReadingTime": 0,
        "completedJuz": 0,
        "completedSurahs": 0,
        "currentStreak": 0,
        "longestStreak": 0,
        "totalPoints": 0,
        "level": 1,
        "rank": 0
      },
      "preferences": {
        "reciter": null,
        "translation": "arabic",
        "fontSize": 16,
        "nightMode": false,
        "notifications": {
          "dailyReminder": true,
          "weeklyProgress": true,
          "achievements": true,
          "rewards": true
        },
        "privacy": {
          "showProgressToOthers": true,
          "allowFriendRequests": true
        }
      },
      "currentProgress": {
        "currentJuz": 1,
        "currentHizb": 1,
        "currentRub": 1,
        "currentSurah": 1,
        "currentAyah": 1,
        "lastReadDate": null
      },
      "emailVerified": false
    },
    "needsEmailVerification": true
  }
}
```

#### Error Responses

**400 Bad Request - Missing Fields**
```json
{
  "success": false,
  "message": "الاسم الكامل والبريد الإلكتروني وكلمة المرور مطلوبة",
  "code": "MISSING_FIELDS"
}
```

**400 Bad Request - Terms Not Agreed**
```json
{
  "success": false,
  "message": "يجب الموافقة على الشروط وسياسة الخصوصية",
  "code": "TERMS_NOT_AGREED"
}
```

**400 Bad Request - Invalid Email**
```json
{
  "success": false,
  "message": "تنسيق البريد الإلكتروني غير صحيح",
  "code": "INVALID_EMAIL"
}
```

**400 Bad Request - Weak Password**
```json
{
  "success": false,
  "message": "كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل",
  "code": "WEAK_PASSWORD"
}
```

**409 Conflict - Email Exists**
```json
{
  "success": false,
  "message": "البريد الإلكتروني مستخدم بالفعل",
  "code": "EMAIL_EXISTS"
}
```

---

## Mobile Login (Enhanced)

### POST /auth/mobile-login

Enhanced mobile login with device management, biometric support, and security features.

#### Request Body
```json
{
  "email": "ahmed@example.com",
  "password": "securePassword123",
  "deviceInfo": {
    "deviceId": "iPhone_12_Pro_A1B2C3D4E5F6",
    "deviceName": "Ahmed's iPhone",
    "deviceType": "phone",
    "platform": "ios",
    "platformVersion": "17.0.1",
    "appVersion": "1.2.0",
    "pushToken": "dGVzdF9wdXNoX3Rva2VuX2Zvcl9ub3RpZmljYXRpb25z"
  },
  "biometricLogin": false,
  "rememberDevice": true,
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
| `email` | string | ✅ | User's email address |
| `password` | string | ✅ | User's password |
| `deviceInfo` | object | ✅ | Device information (required for mobile) |
| `deviceInfo.deviceId` | string | ✅ | Unique device identifier |
| `deviceInfo.deviceName` | string | ✅ | Human-readable device name |
| `deviceInfo.deviceType` | string | ✅ | `phone` or `tablet` |
| `deviceInfo.platform` | string | ✅ | `ios` or `android` |
| `deviceInfo.platformVersion` | string | ✅ | OS version |
| `deviceInfo.appVersion` | string | ✅ | App version |
| `deviceInfo.pushToken` | string | ❌ | Push notification token |
| `biometricLogin` | boolean | ❌ | Whether biometric auth was used |
| `rememberDevice` | boolean | ❌ | Trust this device for future logins |
| `location` | object | ❌ | User's current location |
| `location.latitude` | number | ❌ | GPS latitude |
| `location.longitude` | number | ❌ | GPS longitude |
| `location.country` | string | ❌ | Country code |
| `location.city` | string | ❌ | City name |

#### Success Response (200)
```json
{
  "success": true,
  "message": "تم تسجيل الدخول بنجاح",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "66b1a2c4d5e6f7g8h9i0j1k2",
      "email": "ahmed@example.com",
      "profile": {
        "firstName": "أحمد",
        "lastName": "محمد علي",
        "displayName": "أحمد محمد علي",
        "avatar": null,
        "language": "ar"
      },
      "stats": {
        "totalReadingTime": 1200,
        "completedJuz": 2,
        "completedSurahs": 15,
        "currentStreak": 7,
        "longestStreak": 23,
        "totalPoints": 450,
        "level": 3,
        "rank": 142
      },
      "preferences": {
        "reciter": "abdul_basit",
        "translation": "arabic",
        "fontSize": 18,
        "nightMode": true,
        "notifications": {
          "dailyReminder": true,
          "weeklyProgress": true,
          "achievements": true,
          "rewards": true
        },
        "privacy": {
          "showProgressToOthers": true,
          "allowFriendRequests": true
        }
      },
      "currentProgress": {
        "currentJuz": 3,
        "currentHizb": 5,
        "currentRub": 2,
        "currentSurah": 2,
        "currentAyah": 25,
        "lastReadDate": "2024-08-02T19:30:00.000Z"
      },
      "security": {
        "emailVerified": true,
        "phoneVerified": false,
        "twoFactorEnabled": false,
        "biometricEnabled": false
      },
      "blockchain": {
        "walletConnected": true,
        "walletAddress": "7KzQ...xP2M",
        "totalEarned": 150,
        "totalWithdrawn": 100,
        "pendingRewards": 25
      },
      "subscription": {
        "type": "premium",
        "expiresAt": "2024-12-31T23:59:59.000Z"
      },
      "deviceInfo": {
        "isNewDevice": false,
        "deviceTrusted": true,
        "biometricAvailable": true
      }
    },
    "session": {
      "expiresAt": "2024-08-04T08:15:00.000Z",
      "deviceRegistered": true,
      "requiresDeviceVerification": false
    }
  }
}
```

#### Success Response - New Device Verification Required (200)
```json
{
  "success": true,
  "message": "تم تسجيل الدخول بنجاح. يتطلب التحقق من الجهاز الجديد",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... },
    "session": { ... },
    "requiresVerification": true,
    "verificationMethod": "sms"
  }
}
```

#### Error Responses

**400 Bad Request - Missing Device Info**
```json
{
  "success": false,
  "message": "معلومات الجهاز مطلوبة للتطبيق المحمول",
  "code": "MISSING_DEVICE_INFO"
}
```

**429 Too Many Requests - Account Locked**
```json
{
  "success": false,
  "message": "تم قفل الحساب مؤقتاً بسبب محاولات دخول خاطئة متعددة",
  "code": "ACCOUNT_LOCKED",
  "data": {
    "lockoutExpiresAt": "2024-08-03T09:00:00.000Z"
  }
}
```

### GET /auth/mobile-login

Get device information for the current session.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "currentDevice": {
      "deviceId": "iPhone_12_Pro_A1B2C3D4E5F6",
      "deviceName": "Ahmed's iPhone",
      "platform": "ios",
      "lastLoginDate": "2024-08-03T08:15:00.000Z",
      "isTrusted": true
    },
    "allDevices": [
      {
        "deviceId": "iPhone_12_Pro_A1B2C3D4E5F6",
        "deviceName": "Ahmed's iPhone",
        "platform": "ios",
        "deviceType": "phone",
        "lastLoginDate": "2024-08-03T08:15:00.000Z",
        "isTrusted": true,
        "isActive": true
      },
      {
        "deviceId": "Samsung_Galaxy_S21_B2C3D4E5F6G7",
        "deviceName": "Ahmed's Galaxy",
        "platform": "android",
        "deviceType": "phone",
        "lastLoginDate": "2024-07-28T14:30:00.000Z",
        "isTrusted": false,
        "isActive": false
      }
    ]
  }
}
```

---

## User Login (Basic)

### POST /auth/login

Authenticate user with email and password.

#### Request Body
```json
{
  "email": "ahmed@example.com",
  "password": "securePassword123",
  "deviceInfo": {
    "type": "mobile",
    "os": "iOS",
    "version": "17.0"
  }
}
```

#### Request Schema
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✅ | User's email address |
| `password` | string | ✅ | User's password |
| `deviceInfo` | object | ❌ | Device information for analytics |

#### Success Response (200)
```json
{
  "success": true,
  "message": "تم تسجيل الدخول بنجاح",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "66b1a2c4d5e6f7g8h9i0j1k2",
      "email": "ahmed@example.com",
      "profile": {
        "firstName": "أحمد",
        "lastName": "محمد علي",
        "displayName": "أحمد محمد علي",
        "avatar": null,
        "language": "ar"
      },
      "stats": {
        "totalReadingTime": 1200,
        "completedJuz": 2,
        "completedSurahs": 15,
        "currentStreak": 7,
        "longestStreak": 23,
        "totalPoints": 450,
        "level": 3,
        "rank": 142
      },
      "preferences": {
        "reciter": "abdul_basit",
        "translation": "arabic",
        "fontSize": 18,
        "nightMode": true,
        "notifications": {
          "dailyReminder": true,
          "weeklyProgress": true,
          "achievements": true,
          "rewards": true
        },
        "privacy": {
          "showProgressToOthers": true,
          "allowFriendRequests": true
        }
      },
      "currentProgress": {
        "currentJuz": 3,
        "currentHizb": 5,
        "currentRub": 2,
        "currentSurah": 2,
        "currentAyah": 25,
        "lastReadDate": "2024-08-02T19:30:00.000Z"
      },
      "emailVerified": true,
      "blockchain": {
        "walletConnected": true,
        "totalEarned": 150,
        "pendingRewards": 25
      }
    }
  }
}
```

#### Error Responses

**400 Bad Request - Missing Credentials**
```json
{
  "success": false,
  "message": "البريد الإلكتروني وكلمة المرور مطلوبان",
  "code": "MISSING_CREDENTIALS"
}
```

**400 Bad Request - Use Google Login**
```json
{
  "success": false,
  "message": "يرجى تسجيل الدخول باستخدام Google",
  "code": "USE_GOOGLE_LOGIN"
}
```

**401 Unauthorized - Invalid Credentials**
```json
{
  "success": false,
  "message": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  "code": "INVALID_CREDENTIALS"
}
```

**403 Forbidden - Account Suspended**
```json
{
  "success": false,
  "message": "تم إيقاف حسابك. يرجى التواصل مع الدعم",
  "code": "ACCOUNT_SUSPENDED"
}
```

---

## Forgot Password

### POST /auth/forgot-password

Send password reset email to user's registered email address.

#### Request Body
```json
{
  "email": "ahmed@example.com",
  "language": "ar",
  "deviceInfo": {
    "type": "mobile",
    "platform": "ios",
    "userAgent": "QuranApp/1.2.0 (iPhone; iOS 17.0)"
  }
}
```

#### Request Schema
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✅ | User's email address |
| `language` | string | ❌ | Email language (`ar`, `en`). Default: `ar` |
| `deviceInfo` | object | ❌ | Device information for security logging |
| `deviceInfo.type` | string | ❌ | Device type (`mobile`, `tablet`, `web`) |
| `deviceInfo.platform` | string | ❌ | Platform (`ios`, `android`, `web`) |
| `deviceInfo.userAgent` | string | ❌ | User agent string |

#### Success Response (200)
```json
{
  "success": true,
  "message": "إذا كان البريد الإلكتروني موجود في نظامنا، ستتلقى رابط إعادة تعيين كلمة المرور",
  "data": {
    "emailSent": true,
    "expiresIn": 1800
  }
}
```

#### Error Responses

**400 Bad Request - Missing Email**
```json
{
  "success": false,
  "message": "البريد الإلكتروني مطلوب",
  "code": "MISSING_EMAIL"
}
```

**400 Bad Request - Invalid Email Format**
```json
{
  "success": false,
  "message": "تنسيق البريد الإلكتروني غير صحيح",
  "code": "INVALID_EMAIL"
}
```

**400 Bad Request - Google Account**
```json
{
  "success": false,
  "message": "هذا الحساب مسجل عبر Google. يرجى تسجيل الدخول باستخدام Google",
  "code": "GOOGLE_ACCOUNT"
}
```

**403 Forbidden - Account Suspended**
```json
{
  "success": false,
  "message": "تم إيقاف حسابك. يرجى التواصل مع الدعم",
  "code": "ACCOUNT_SUSPENDED"
}
```

**429 Too Many Requests**
```json
{
  "success": false,
  "message": "يرجى الانتظار قبل طلب إعادة تعيين كلمة المرور مرة أخرى",
  "code": "TOO_MANY_REQUESTS"
}
```

**500 Internal Server Error - Email Send Error**
```json
{
  "success": false,
  "message": "خطأ في إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى",
  "code": "EMAIL_SEND_ERROR"
}
```

### GET /auth/forgot-password

Verify if a password reset token is valid.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | string | ✅ | Password reset token |
| `email` | string | ✅ | User's email address |

#### Example Request
```
GET /api/v1/auth/forgot-password?token=abc123def456&email=ahmed@example.com
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "رمز إعادة التعيين صالح",
  "data": {
    "valid": true,
    "expiresAt": "2024-08-03T09:30:00.000Z"
  }
}
```

#### Error Response - Invalid Token (400)
```json
{
  "success": false,
  "message": "رمز إعادة التعيين غير صالح أو منتهي الصلاحية",
  "code": "INVALID_TOKEN"
}
```

---

## Google OAuth Authentication

### POST /auth/google

Authenticate or register user with Google OAuth.

#### Request Body
```json
{
  "googleId": "112233445566778899001",
  "email": "ahmed.google@gmail.com",
  "name": "أحمد محمد",
  "picture": "https://lh3.googleusercontent.com/a/default-user=s96-c",
  "language": "ar",
  "deviceInfo": {
    "type": "mobile",
    "os": "Android",
    "version": "14"
  }
}
```

#### Request Schema
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `googleId` | string | ✅ | Google user ID |
| `email` | string | ✅ | Google account email |
| `name` | string | ✅ | User's full name from Google |
| `picture` | string | ❌ | Profile picture URL from Google |
| `language` | string | ❌ | Preferred language. Default: `ar` |
| `deviceInfo` | object | ❌ | Device information |

#### Success Response - Existing User (200)
```json
{
  "success": true,
  "message": "تم تسجيل الدخول بنجاح",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "66b1a2c4d5e6f7g8h9i0j1k2",
      "email": "ahmed.google@gmail.com",
      "profile": {
        "firstName": "أحمد",
        "lastName": "محمد",
        "displayName": "أحمد محمد",
        "avatar": "https://lh3.googleusercontent.com/a/default-user=s96-c",
        "language": "ar"
      },
      "stats": { ... },
      "preferences": { ... },
      "currentProgress": { ... },
      "emailVerified": true
    },
    "isNewUser": false
  }
}
```

#### Success Response - New User (201)
```json
{
  "success": true,
  "message": "تم إنشاء الحساب بنجاح",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "66b1a2c4d5e6f7g8h9i0j1k2",
      "email": "ahmed.google@gmail.com",
      "profile": {
        "firstName": "أحمد",
        "lastName": "محمد",
        "displayName": "أحمد محمد",
        "avatar": "https://lh3.googleusercontent.com/a/default-user=s96-c",
        "language": "ar"
      },
      "stats": {
        "totalReadingTime": 0,
        "completedJuz": 0,
        "completedSurahs": 0,
        "currentStreak": 0,
        "longestStreak": 0,
        "totalPoints": 0,
        "level": 1,
        "rank": 0
      },
      "preferences": { ... },
      "currentProgress": { ... },
      "emailVerified": true
    },
    "isNewUser": true
  }
}
```

#### Error Responses

**400 Bad Request - Invalid Google Data**
```json
{
  "success": false,
  "message": "بيانات Google غير مكتملة",
  "code": "INVALID_GOOGLE_DATA"
}
```

---

## User Profile Management

### GET /user/profile

Get the current user's profile information.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "id": "66b1a2c4d5e6f7g8h9i0j1k2",
    "email": "ahmed@example.com",
    "profile": {
      "firstName": "أحمد",
      "lastName": "محمد علي",
      "displayName": "أحمد محمد علي",
      "avatar": null,
      "dateOfBirth": null,
      "gender": "not_specified",
      "country": null,
      "language": "ar",
      "timezone": null
    },
    "stats": {
      "totalReadingTime": 1200,
      "completedJuz": 2,
      "completedSurahs": 15,
      "currentStreak": 7,
      "longestStreak": 23,
      "totalPoints": 450,
      "level": 3,
      "rank": 142
    },
    "preferences": {
      "reciter": "abdul_basit",
      "translation": "arabic",
      "fontSize": 18,
      "nightMode": true,
      "notifications": {
        "dailyReminder": true,
        "weeklyProgress": true,
        "achievements": true,
        "rewards": true
      },
      "privacy": {
        "showProgressToOthers": true,
        "allowFriendRequests": true
      }
    },
    "currentProgress": {
      "currentJuz": 3,
      "currentHizb": 5,
      "currentRub": 2,
      "currentSurah": 2,
      "currentAyah": 25,
      "lastReadDate": "2024-08-02T19:30:00.000Z"
    },
    "security": {
      "emailVerified": true,
      "phoneVerified": false,
      "twoFactorEnabled": false
    },
    "blockchain": {
      "walletConnected": true,
      "walletAddress": "7KzQ...xP2M",
      "totalEarned": 150,
      "totalWithdrawn": 100,
      "pendingRewards": 25
    },
    "status": {
      "subscriptionType": "premium",
      "registrationDate": "2024-07-15T10:30:00.000Z",
      "lastLoginDate": "2024-08-03T08:15:00.000Z"
    }
  }
}
```

### PUT /user/profile

Update the current user's profile information.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Request Body
```json
{
  "profile": {
    "firstName": "أحمد محمد",
    "lastName": "علي حسن",
    "displayName": "أحمد علي",
    "dateOfBirth": "1990-05-15",
    "gender": "male",
    "country": "SA",
    "language": "ar",
    "timezone": "Asia/Riyadh"
  },
  "preferences": {
    "reciter": "abdul_rahman_sudais",
    "translation": "arabic",
    "fontSize": 20,
    "nightMode": false,
    "notifications": {
      "dailyReminder": false,
      "weeklyProgress": true,
      "achievements": true,
      "rewards": true
    },
    "privacy": {
      "showProgressToOthers": false,
      "allowFriendRequests": true
    }
  }
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "تم تحديث الملف الشخصي بنجاح",
  "data": {
    "updated": true
  }
}
```

#### Error Responses

**401 Unauthorized - No Token**
```json
{
  "success": false,
  "message": "رمز التفويض مطلوب",
  "code": "NO_TOKEN"
}
```

**401 Unauthorized - Invalid Token**
```json
{
  "success": false,
  "message": "رمز التفويض غير صالح أو منتهي الصلاحية",
  "code": "INVALID_TOKEN"
}
```

**404 Not Found - User Not Found**
```json
{
  "success": false,
  "message": "المستخدم غير موجود أو غير نشط",
  "code": "USER_NOT_FOUND"
}
```

---

## Error Codes Reference

| Code | Description | Arabic Message |
|------|-------------|----------------|
| `MISSING_FIELDS` | Required fields are missing | الحقول المطلوبة مفقودة |
| `MISSING_CREDENTIALS` | Email and password required | البريد الإلكتروني وكلمة المرور مطلوبان |
| `TERMS_NOT_AGREED` | User must agree to terms | يجب الموافقة على الشروط وسياسة الخصوصية |
| `INVALID_EMAIL` | Email format is invalid | تنسيق البريد الإلكتروني غير صحيح |
| `WEAK_PASSWORD` | Password too short | كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل |
| `EMAIL_EXISTS` | Email already registered | البريد الإلكتروني مستخدم بالفعل |
| `INVALID_CREDENTIALS` | Wrong email or password | البريد الإلكتروني أو كلمة المرور غير صحيحة |
| `USE_GOOGLE_LOGIN` | User registered with Google | يرجى تسجيل الدخول باستخدام Google |
| `ACCOUNT_SUSPENDED` | Account is suspended | تم إيقاف حسابك. يرجى التواصل مع الدعم |
| `INVALID_GOOGLE_DATA` | Incomplete Google OAuth data | بيانات Google غير مكتملة |
| `NO_TOKEN` | Authorization token missing | رمز التفويض مطلوب |
| `INVALID_TOKEN` | Token is invalid or expired | رمز التفويض غير صالح أو منتهي الصلاحية |
| `USER_NOT_FOUND` | User not found or inactive | المستخدم غير موجود أو غير نشط |
| `REGISTRATION_FAILED` | Failed to create account | فشل في إنشاء الحساب |
| `GOOGLE_AUTH_ERROR` | Google login error | خطأ في تسجيل الدخول بـ Google |
| `INTERNAL_ERROR` | Server error | خطأ في الخادم |
| `MISSING_DEVICE_INFO` | Device info required for mobile | معلومات الجهاز مطلوبة للتطبيق المحمول |
| `ACCOUNT_LOCKED` | Account temporarily locked | تم قفل الحساب مؤقتاً بسبب محاولات دخول خاطئة متعددة |
| `MISSING_EMAIL` | Email address required | البريد الإلكتروني مطلوب |
| `GOOGLE_ACCOUNT` | Account registered with Google | هذا الحساب مسجل عبر Google. يرجى تسجيل الدخول باستخدام Google |
| `TOO_MANY_REQUESTS` | Too many requests, please wait | يرجى الانتظار قبل طلب إعادة تعيين كلمة المرور مرة أخرى |
| `EMAIL_SEND_ERROR` | Error sending email | خطأ في إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى |
| `MISSING_PARAMETERS` | Required parameters missing | رمز إعادة التعيين والبريد الإلكتروني مطلوبان |

---

## Data Models

### User Profile Object
```typescript
interface UserProfile {
  firstName: string | null
  lastName: string | null
  displayName: string | null
  avatar: string | null
  dateOfBirth: Date | null
  gender: 'male' | 'female' | 'not_specified'
  country: string | null
  language: string
  timezone: string | null
}
```

### User Stats Object
```typescript
interface UserStats {
  totalReadingTime: number      // in seconds
  completedJuz: number         // 0-30
  completedSurahs: number      // 0-114
  currentStreak: number        // consecutive days
  longestStreak: number        // best streak record
  totalPoints: number          // earned points
  level: number               // user level
  rank: number                // global ranking
}
```

### User Preferences Object
```typescript
interface UserPreferences {
  reciter: string | null
  translation: 'arabic' | 'english' | string
  fontSize: number
  nightMode: boolean
  notifications: {
    dailyReminder: boolean
    weeklyProgress: boolean
    achievements: boolean
    rewards: boolean
  }
  privacy: {
    showProgressToOthers: boolean
    allowFriendRequests: boolean
  }
}
```

### Current Progress Object
```typescript
interface CurrentProgress {
  currentJuz: number        // 1-30
  currentHizb: number       // 1-60
  currentRub: number        // 1-240
  currentSurah: number      // 1-114
  currentAyah: number       // 1-6236
  lastReadDate: Date | null
}
```

### Blockchain Object
```typescript
interface BlockchainInfo {
  walletConnected: boolean
  walletAddress: string | null
  totalEarned: number
  totalWithdrawn: number
  pendingRewards: number
}
```

---

## Rate Limiting

- **Registration**: 5 requests per hour per IP
- **Login**: 10 requests per minute per IP
- **Profile Update**: 20 requests per minute per user
- **Profile Fetch**: 100 requests per minute per user

## Security Notes

1. **JWT Tokens**: Expire after 24 hours
2. **Password Hashing**: bcrypt with salt rounds of 12
3. **Failed Login Tracking**: Account may be temporarily locked after multiple failed attempts
4. **IP Logging**: All authentication attempts are logged with IP addresses
5. **Email Verification**: Required for password reset and sensitive operations
6. **Device Tracking**: Device information is stored for security purposes

## Mobile SDK Integration

### Flutter/Dart Example
```dart
// Registration
final response = await http.post(
  Uri.parse('$baseUrl/auth/register'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode({
    'fullName': 'أحمد محمد',
    'email': 'ahmed@example.com',
    'password': 'securePassword',
    'agreeToTerms': true,
    'language': 'ar',
    'deviceInfo': {
      'type': 'mobile',
      'os': Platform.isIOS ? 'iOS' : 'Android',
      'version': '1.0.0'
    }
  }),
);
```

### React Native/JavaScript Example
```javascript
// Login
const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        deviceInfo: {
          type: 'mobile',
          os: Platform.OS,
          version: DeviceInfo.getSystemVersion(),
        },
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store token securely
      await AsyncStorage.setItem('auth_token', data.data.token);
      return data.data.user;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
```