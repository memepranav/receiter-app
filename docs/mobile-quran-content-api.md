# Mobile Quran Content APIs

Comprehensive API documentation for accessing Quran content, including Surahs, Juz, individual Ayahs, translations, and audio recitations.

## Base URL
```
https://161.35.11.154/api/v1/quran
```

## Authentication
All endpoints require JWT authentication:
```http
Authorization: Bearer <jwt_token>
```

---

## Core Quran Content

### GET `/surahs`

Get list of all 114 Surahs with basic information.

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "number": 1,
      "name": "الفاتحة",
      "numberOfAyahs": 7
    },
    {
      "number": 2,
      "name": "البقرة", 
      "numberOfAyahs": 286
    }
    // ... all 114 surahs
  ]
}
```

#### Caching
- Cached for 1 hour
- Total response size: ~15KB

---

### GET `/surah/{surahNumber}`

Get specific Surah with all its Ayahs.

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `surahNumber` | integer | ✅ | Surah number (1-114) |

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `translation` | string | ❌ | Translation identifier (e.g., 'sahih-international') |
| `reciter` | string | ❌ | Reciter identifier for audio URLs |
| `textFormat` | string | ❌ | Arabic text format: 'uthmani', 'indopak', 'simple' |
| `includeText` | boolean | ❌ | Include Arabic text (default: true) |
| `startAyah` | number | ❌ | Starting ayah number for range |
| `endAyah` | number | ❌ | Ending ayah number for range |

#### Example Request
```
GET /api/v1/quran/surah/1?translation=sahih-international&reciter=abdul_basit
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "number": 1,
    "name": "الفاتحة",
    "numberOfAyahs": 7,
    "ayahs": [
      {
        "number": 1,
        "text": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
        "juz": 1,
        "hizb": 1,
        "quarter": "1",
        "isBismillah": false
      },
      {
        "number": 2,
        "text": "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
        "juz": 1,
        "hizb": 1,
        "quarter": "1",
        "isBismillah": false
      }
      // ... all ayahs in the surah
    ],
    "translation": [
      {
        "surahNumber": 1,
        "ayahNumber": 1,
        "text": "In the name of Allah, the Entirely Merciful, the Especially Merciful."
      },
      {
        "surahNumber": 1,
        "ayahNumber": 2,
        "text": "[All] praise is [due] to Allah, Lord of the worlds -"
      }
      // ... translations for all ayahs
    ],
    "audioUrl": "https://audio.qurancdn.com/abdul_basit/001.mp3"
  }
}
```

#### Range Query Example
```
GET /api/v1/quran/surah/2?startAyah=1&endAyah=10&translation=pickthall
```

Returns only Ayahs 1-10 from Surah Al-Baqarah with Pickthall translation.

#### Error Responses

**400 Bad Request - Invalid Surah Number**
```json
{
  "success": false,
  "message": "Invalid Surah number",
  "statusCode": 400
}
```

**404 Not Found - Surah Not Found**
```json
{
  "success": false,
  "message": "Surah not found",
  "statusCode": 404
}
```

---

### GET `/juz`

Get list of all 30 Juz (Para) with summary information.

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "number": 1,
      "name": "الجزء 1",
      "englishName": "Juz 1",
      "totalAyahs": 148,
      "surahs": [
        {
          "sura_number": 1,
          "sura_name_arabic": "الفاتحة"
        },
        {
          "sura_number": 2,
          "sura_name_arabic": "البقرة"
        }
      ]
    }
    // ... all 30 juz
  ]
}
```

---

### GET `/juz/{juzNumber}`

Get specific Juz with all its content.

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `juzNumber` | integer | ✅ | Juz number (1-30) |

#### Query Parameters
Same as Surah endpoint: `translation`, `reciter`, `textFormat`, `includeText`

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "number": 1,
    "name": "الجزء 1",
    "englishName": "Juz 1", 
    "totalAyahs": 148,
    "surahs": [
      {
        "sura_number": 1,
        "sura_name_arabic": "الفاتحة",
        "ayahs": [
          {
            "number": 1,
            "text": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
            "juz": 1,
            "hizb": 1,
            "quarter": "1",
            "isBismillah": false
          }
          // ... all ayahs from this surah in this juz
        ]
      }
      // ... all surahs in this juz
    ],
    "ayahs": [
      {
        "number": 1,
        "text": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
        "sura_number": 1,
        "sura_name_arabic": "الفاتحة",
        "juz": 1,
        "hizb": 1,
        "quarter": "1",
        "isBismillah": false
      }
      // ... all 148 ayahs in order
    ],
    "translation": [
      // Translation data if requested
    ]
  }
}
```

#### Error Responses

**400 Bad Request - Invalid Juz Number**
```json
{
  "success": false,
  "message": "Invalid Juz number",
  "statusCode": 400
}
```

**404 Not Found - Juz Not Found**
```json
{
  "success": false,
  "message": "Juz not found",
  "statusCode": 404
}
```

---

### GET `/ayah/{surahNumber}/{ayahNumber}`

Get specific Ayah with detailed information.

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `surahNumber` | integer | ✅ | Surah number (1-114) |
| `ayahNumber` | integer | ✅ | Ayah number within the surah |

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `translation` | string | ❌ | Translation identifier |
| `textFormat` | string | ❌ | Arabic text format |

#### Example Request
```
GET /api/v1/quran/ayah/2/255?translation=sahih-international
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "number": 255,
    "text": "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ...",
    "sura_number": 2,
    "sura_name_arabic": "البقرة",
    "juz": 3,
    "hizb": 5,
    "quarter": "1",
    "isBismillah": false,
    "translation": "Allah - there is no deity except Him, the Ever-Living, the Self-Sustaining..."
  }
}
```

#### Error Responses

**404 Not Found - Ayah Not Found**
```json
{
  "success": false,
  "message": "Ayah not found",
  "statusCode": 404
}
```

---

## Audio & Recitations

### GET `/reciters`

Get list of available reciters.

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "identifier": "abdul_basit",
      "name": "عبدالباسط عبدالصمد",
      "englishName": "Abdul Basit Abdul Samad",
      "style": "مجود",
      "country": "مصر",
      "imageUrl": "https://cdn.quranreciter.com/reciters/abdul_basit.jpg",
      "isComplete": true,
      "popularity": 95
    },
    {
      "identifier": "abdul_rahman_sudais",
      "name": "عبدالرحمن السديس",
      "englishName": "Abdul Rahman Al-Sudais",
      "style": "مرتل",
      "country": "المملكة العربية السعودية",
      "imageUrl": "https://cdn.quranreciter.com/reciters/sudais.jpg",
      "isComplete": true,
      "popularity": 90
    }
    // ... more reciters sorted by popularity
  ]
}
```

---

### GET `/reciter/{reciterId}`

Get specific reciter information.

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `reciterId` | string | ✅ | Reciter identifier |

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "identifier": "abdul_basit",
    "name": "عبدالباسط عبدالصمد",
    "englishName": "Abdul Basit Abdul Samad",
    "style": "مجود",
    "country": "مصر",
    "imageUrl": "https://cdn.quranreciter.com/reciters/abdul_basit.jpg",
    "audioBaseUrl": "https://audio.qurancdn.com/abdul_basit",
    "availableSurahs": [1, 2, 3, 4, 5], // Array of available surah numbers
    "isComplete": true,
    "popularity": 95,
    "description": "One of the most beloved reciters of the Holy Quran...",
    "birthYear": 1927,
    "deathYear": 1988
  }
}
```

---

### GET `/audio/{reciterId}/{surahNumber}`

Get audio recitation URL for specific Surah.

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `reciterId` | string | ✅ | Reciter identifier |
| `surahNumber` | integer | ✅ | Surah number (1-114) |

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "audioUrl": "https://audio.qurancdn.com/abdul_basit/001.mp3"
  }
}
```

#### Error Responses

**404 Not Found - Reciter Not Found**
```json
{
  "success": false,
  "message": "Reciter not found",
  "statusCode": 404
}
```

**404 Not Found - Audio Not Available**
```json
{
  "success": false,
  "message": "Audio not available for this Surah",
  "statusCode": 404
}
```

---

## Translations

### GET `/translations`

Get list of available translations grouped by language.

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "language": "en",
      "languageName": "English",
      "translations": [
        {
          "identifier": "sahih-international",
          "name": "Sahih International",
          "englishName": "Sahih International",
          "translator": "Sahih International",
          "isComplete": true,
          "popularity": 95
        },
        {
          "identifier": "pickthall",
          "name": "Mohammed Marmaduke William Pickthall",
          "englishName": "Pickthall",
          "translator": "Mohammed Marmaduke William Pickthall",
          "isComplete": true,
          "popularity": 85
        }
      ]
    },
    {
      "language": "ar",
      "languageName": "العربية",
      "translations": [
        {
          "identifier": "arabic",
          "name": "النص العربي",
          "englishName": "Arabic Text",
          "translator": null,
          "isComplete": true,
          "popularity": 100
        }
      ]
    }
    // ... more languages
  ]
}
```

---

### GET `/translation/{translationId}`

Get specific translation information.

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `translationId` | string | ✅ | Translation identifier |

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "identifier": "sahih-international",
    "name": "Sahih International",
    "englishName": "Sahih International",
    "language": "en",
    "languageName": "English",
    "translator": "Sahih International",
    "source": "King Fahd Glorious Quran Printing Complex",
    "description": "Clear and accurate modern English translation...",
    "isActive": true,
    "isComplete": true,
    "popularity": 95,
    "version": "1.0",
    "publishDate": "2010-01-01T00:00:00.000Z"
  }
}
```

---

## Search & Discovery

### GET `/search`

Search Quran content (Surahs and Ayahs).

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | ✅ | Search query |
| `limit` | integer | ❌ | Number of results (default: 20, max: 100) |
| `type` | string | ❌ | Search type: 'surah', 'ayah', 'all' (default: 'all') |

#### Example Request
```
GET /api/v1/quran/search?q=الرحمن&limit=10&type=ayah
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "query": "الرحمن",
    "results": [
      {
        "type": "ayah",
        "sura_number": 1,
        "sura_name_arabic": "الفاتحة",
        "ayah_number": 1,
        "ayah_text_arabic": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
        "juz_number": 1,
        "hizb_number": 1,
        "quarter_hizb_segment": "1"
      }
      // ... more search results
    ],
    "total": 169,
    "limit": 10
  }
}
```

---

### GET `/random-ayah`

Get a random Ayah for daily inspiration.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `translation` | string | ❌ | Translation identifier |

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "number": 255,
    "text": "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ...",
    "surahNumber": 2,
    "surahName": "البقرة",
    "juz": 3,
    "hizb": 5,
    "quarter": "1",
    "isBismillah": false,
    "translation": "Allah - there is no deity except Him, the Ever-Living, the Self-Sustaining..."
  }
}
```

---

### GET `/ayah-of-day`

Get the Ayah of the Day (consistent daily selection).

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `translation` | string | ❌ | Translation identifier |

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "number": 186,
    "text": "وَإِذَا سَأَلَكَ عِبَادِى عَنِّى فَإِنِّى قَرِيبٌ...",
    "surahNumber": 2,
    "surahName": "البقرة",
    "juz": 2,
    "hizb": 3,
    "quarter": "2",
    "isBismillah": false,
    "date": "2024-08-07",
    "translation": "And when My servants ask you concerning Me, indeed I am near..."
  }
}
```

---

## Performance Optimization

### Caching Strategy
- **Surahs List**: 1 hour cache
- **Juz List**: 1 hour cache  
- **Specific Surah/Juz/Ayah**: 30 minutes cache
- **Translations List**: 1 hour cache
- **Reciters List**: 1 hour cache
- **Search Results**: 15 minutes cache
- **Ayah of Day**: Cached until end of day

### Response Optimization
- Use `includeText=false` for navigation-only requests
- Request specific ayah ranges with `startAyah` and `endAyah`
- Translations are optional and loaded on demand
- Audio URLs are generated dynamically

### Recommended Usage Patterns

#### 1. **App Initialization**
```javascript
// Load essential data on app start
const [surahs, juzList, reciters, translations] = await Promise.all([
  api.getSurahs(),
  api.getJuzList(), 
  api.getReciters(),
  api.getTranslations()
]);
```

#### 2. **Surah Reading Mode**
```javascript
// Load surah with translation and audio
const surah = await api.getSurah(surahNumber, {
  translation: userPreferences.translation,
  reciter: userPreferences.reciter
});
```

#### 3. **Progressive Loading**
```javascript
// Load ayah ranges for long surahs
const firstPart = await api.getSurah(2, { startAyah: 1, endAyah: 50 });
const secondPart = await api.getSurah(2, { startAyah: 51, endAyah: 100 });
```

#### 4. **Search Implementation**
```javascript
// Debounced search with type filtering
const searchResults = await api.search({
  q: searchTerm,
  type: 'ayah',
  limit: 20
});
```

---

## Error Handling

All endpoints may return these common errors:

| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_PARAMETERS` | Invalid or missing parameters |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication |
| 404 | `NOT_FOUND` | Resource not found |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |

### Error Response Format
```json
{
  "success": false,
  "message": "رسالة الخطأ",
  "error": "Detailed error message",
  "statusCode": 400,
  "code": "ERROR_CODE"
}
```

---

## Rate Limits

- **Quran Content**: 100 requests per minute per user
- **Search**: 50 requests per minute per user  
- **Random/Daily Content**: 20 requests per minute per user

Cached responses don't count toward rate limits.

---

## Best Practices

1. **Cache Aggressively**: Store frequently accessed data locally
2. **Use Appropriate Endpoints**: Don't load full Juz when you need just one Ayah  
3. **Handle Offline**: Cache critical content for offline reading
4. **Progressive Enhancement**: Load translations and audio on demand
5. **User Preferences**: Remember user's preferred reciter and translation
6. **Error Recovery**: Implement retry logic with exponential backoff

---

**Last Updated:** August 2025  
**API Version:** 1.2