# Quran Reciter Mobile App API Documentation

Complete API documentation for the Quran Reciter mobile application with blockchain rewards system.

## Base URL

**Production:** `https://161.35.11.154/api/v1`  
**Local Development:** `http://localhost:4000/api/v1`

## API Overview

The Quran Reciter API provides comprehensive access to Quran content, user authentication, reading progress tracking, and blockchain-based rewards system. The API follows RESTful conventions and returns JSON responses.

## Quick Start

### 1. Authentication
All API endpoints (except registration and public content) require JWT authentication:

```http
Authorization: Bearer <jwt_token>
```

### 2. Response Format
All API responses follow this consistent format:

```json
{
  "success": true,
  "message": "نجح الطلب",
  "data": {
    // Response data here
  }
}
```

### 3. Error Format
```json
{
  "success": false,
  "message": "رسالة الخطأ",
  "error": "Error details",
  "statusCode": 400,
  "code": "ERROR_CODE"
}
```

## Documentation Structure

### Core APIs

1. **[Authentication APIs](./mobile-auth-api.md)** - User registration, login, profile management
2. **[Quran Content APIs](./mobile-quran-content-api.md)** - Surahs, Juz, Ayahs, translations, audio
3. **[Hierarchical Navigation APIs](./mobile-quran-hierarchical-api.md)** - 30 Juz → 60 Hizb → 240 Rubʿ structure
4. **[Reading Progress APIs](./mobile-progress-api.md)** - Sessions, bookmarks, goals, streaks
5. **[Rewards & Blockchain APIs](./mobile-rewards-api.md)** - Points, tokens, leaderboards, withdrawals

### Additional APIs

6. **[Analytics APIs](./mobile-analytics-api.md)** - User activity tracking, insights
7. **[Admin APIs](./admin-api.md)** - Admin panel endpoints (separate documentation)

## Key Features

### 🕌 Quran Structure
- **6,236 Ayahs** organized in traditional Islamic structure
- **114 Surahs** with Arabic names and translations  
- **30 Juz (Para)** for systematic reading
- **60 Hizb** (half Juz) for detailed navigation
- **240 Rubʿ al-Hizb** (quarter Hizb) for precise positioning

### 🎙️ Audio & Translations
- Multiple renowned reciters (Abdul Basit, Sudais, etc.)
- Various translation options (Sahih International, Pickthall, etc.)
- Audio streaming with recitation synchronization
- Multiple Arabic text formats (Uthmani, IndoPak, Simple)

### 📱 Mobile-First Design
- Device-specific authentication
- Optimized for mobile networks
- Offline-capable data structure
- Push notification support

### 🏆 Gamification & Rewards
- **Solana blockchain integration** for token rewards
- Reading streak tracking and achievements
- Points system based on reading activity
- Global leaderboards and social features

### 🔐 Security Features
- JWT-based authentication with refresh tokens
- Device tracking and trusted device management
- Rate limiting and abuse prevention
- Secure wallet integration

## Database Architecture

The API uses a single `quran_ayahs` collection containing all 6,236 ayahs with complete metadata:

```javascript
// Each ayah document structure
{
  "_id": "1:1",                    // Format: "sura_number:ayah_number"
  "sura_number": 1,                // Surah number (1-114)
  "sura_name_arabic": "الفاتحة",    // Arabic surah name
  "ayah_number": 1,                // Ayah number within surah
  "ayah_text_arabic": "بِسْمِ ٱللَّهِ...", // Arabic text
  "juz_number": 1,                 // Juz number (1-30)
  "hizb_number": 1,                // Hizb number (1-60)
  "quarter_hizb_segment": "1",     // Quarter number (1-4)
  "is_bismillah": false            // Whether this is Bismillah
}
```

## Rate Limiting

| Endpoint Category | Rate Limit |
|------------------|------------|
| Authentication | 10 requests/minute |
| Registration | 5 requests/hour |
| Quran Content | 100 requests/minute |
| User Data | 50 requests/minute |
| Rewards/Blockchain | 20 requests/minute |

## HTTP Status Codes

| Status Code | Meaning |
|-------------|---------|
| `200` | Success |
| `201` | Created (registration, new data) |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (invalid/missing token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not Found |
| `409` | Conflict (duplicate data) |
| `422` | Unprocessable Entity (validation failed) |
| `429` | Too Many Requests (rate limited) |
| `500` | Internal Server Error |

## Common Error Codes

| Code | Description |
|------|-------------|
| `INVALID_TOKEN` | JWT token is invalid or expired |
| `MISSING_CREDENTIALS` | Required authentication fields missing |
| `USER_NOT_FOUND` | User account doesn't exist |
| `VALIDATION_ERROR` | Request data failed validation |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `SURAH_NOT_FOUND` | Requested Surah doesn't exist |
| `JUZ_NOT_FOUND` | Requested Juz doesn't exist |
| `AYAH_NOT_FOUND` | Requested Ayah doesn't exist |

## SDKs and Integration Examples

### Flutter/Dart
```dart
class QuranAPI {
  static const String baseUrl = 'https://161.35.11.154/api/v1';
  
  static Future<Map<String, dynamic>> getJuz(int juzNumber) async {
    final response = await http.get(
      Uri.parse('$baseUrl/quran/juz/$juzNumber'),
      headers: {
        'Authorization': 'Bearer ${await getToken()}',
        'Content-Type': 'application/json',
      },
    );
    return json.decode(response.body);
  }
}
```

### React Native/JavaScript
```javascript
class QuranAPI {
  constructor(baseUrl = 'https://161.35.11.154/api/v1') {
    this.baseUrl = baseUrl;
  }

  async getSurah(surahNumber, options = {}) {
    const token = await AsyncStorage.getItem('auth_token');
    const queryParams = new URLSearchParams(options).toString();
    
    const response = await fetch(`${this.baseUrl}/quran/surah/${surahNumber}?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    return await response.json();
  }
}
```

### Kotlin/Android
```kotlin
class QuranAPI {
    companion object {
        const val BASE_URL = "https://161.35.11.154/api/v1"
    }
    
    suspend fun getAyah(surahNumber: Int, ayahNumber: Int): ApiResponse<Ayah> {
        return apiService.getAyah(surahNumber, ayahNumber)
    }
}
```

### Swift/iOS
```swift
class QuranAPI {
    static let baseURL = "https://161.35.11.154/api/v1"
    
    func getSurahs() async throws -> [Surah] {
        let url = URL(string: "\(Self.baseURL)/quran/surahs")!
        var request = URLRequest(url: url)
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        
        let (data, _) = try await URLSession.shared.data(for: request)
        let response = try JSONDecoder().decode(ApiResponse<[Surah]>.self, from: data)
        return response.data
    }
}
```

## Development Environment

### Local Setup
1. **MongoDB:** Connected to production database (`mongodb://quran_app:QuranAppISLAM2025!@161.35.11.154:27017/quran_reciter`)
2. **Redis:** Cache server at `redis://161.35.11.154:6379`
3. **API Port:** `4000`
4. **Admin Panel Port:** `3005`

### Environment Variables
```bash
# API Configuration
NODE_ENV=development
PORT=4000
API_PORT=4000

# Database
MONGODB_URI=mongodb://quran_app:QuranAppISLAM2025!@161.35.11.154:27017/quran_reciter

# JWT
JWT_SECRET=QuranReciter2025_8K9mP3nX7vB2wE6qR4tY1uI0oL5sA8dF9gH3jM6nZ9xC2vB5nM8kL1qW4eR7tY0uI3oP6sA9dF2gH5jK8lZ1xC4vB7nM0q!
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGINS=http://localhost:3005,http://127.0.0.1:3005
```

## Interactive API Documentation

Access the interactive Swagger documentation at:
- **Production:** `https://161.35.11.154/api/docs`
- **Local:** `http://localhost:4000/api/docs`

## Support and Contact

For API support and questions:
- **Email:** dev@quranreciter.com
- **Documentation Issues:** Create an issue in the project repository
- **Integration Help:** Contact the development team

---

## Change Log

### Version 1.2 (Current)
- ✅ Unified `quran_ayahs` collection for improved performance
- ✅ Enhanced hierarchical navigation (Juz → Hizb → Rubʿ)
- ✅ Solana blockchain integration for rewards
- ✅ Advanced reading progress tracking
- ✅ Mobile-optimized authentication with device management

### Version 1.1
- ✅ Basic Quran content APIs
- ✅ User authentication and profiles
- ✅ Simple rewards system

### Version 1.0
- ✅ Initial API release
- ✅ Core Quran content access
- ✅ Basic user management

---

**Last Updated:** August 2025  
**API Version:** 1.2  
**Database Schema Version:** 2.0