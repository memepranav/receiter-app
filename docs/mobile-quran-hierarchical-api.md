# Hierarchical Quran API Documentation

## Overview

This API provides hierarchical access to the Holy Quran following the traditional Islamic structure:

**30 Juz → 60 Hizb → 240 Rubʿ al-Hizb → 6,236 Ayahs**

All data is sourced from a unified `quran_ayahs` collection containing all 6,236 ayahs with complete hierarchical metadata.

## Base URL

**Production:** `https://161.35.11.154/api/v1/quran`  
**Local Development:** `http://localhost:4000/api/v1/quran`

## Authentication

All endpoints require JWT authentication:

```http
Authorization: Bearer <your-jwt-token>
```

## Structure Overview

### GET `/structure`

Get the complete Quran structure overview with real-time statistics from the database.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAyahs": 6236,
    "totalJuz": 30,
    "totalHizb": 60,
    "totalQuarters": 240,
    "description": "30 Juz → 60 Hizb → 240 Rubʿ al-Hizb → 6,236 Ayahs"
  }
}
```

**Caching:** Cached for 1 day since structure is static.

---

## Level 1: Juz (Para) Navigation

### GET `/juz`

Get list of all 30 Juz with summary information and included Surahs.

**Response:**
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

**Caching:** Cached for 1 hour.

### GET `/juz/{juzNumber}`

Get specific Juz content with all ayahs organized by Surahs.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `juzNumber` | integer | ✅ | Juz number (1-30) |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `translation` | string | ❌ | Translation identifier |
| `reciter` | string | ❌ | Reciter identifier for audio |
| `textFormat` | string | ❌ | Arabic text format |
| `includeText` | boolean | ❌ | Include ayah text (default: true) |

**Example Request:**
```
GET /api/v1/quran/juz/1?translation=sahih-international
```

**Response:**
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
          // ... all ayahs from Al-Fatiha in this juz
        ]
      },
      {
        "sura_number": 2,
        "sura_name_arabic": "البقرة", 
        "ayahs": [
          // ... ayahs from Al-Baqarah in this juz
        ]
      }
    ],
    "ayahs": [
      // Flat array of all 148 ayahs in chronological order
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
      // ... all ayahs
    ],
    "translation": [
      // Translation data if requested
    ]
  }
}
```

**Caching:** Cached for 30 minutes.

---

## Level 2: Hizb Navigation

### GET `/juz/{juzNumber}/hizbs`

Get list of all Hizb (halves) for a specific Juz with summary information.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `juzNumber` | integer | ✅ | Juz number (1-30) |

**Example Request:**
```
GET /api/v1/quran/juz/1/hizbs
```

**Response:**
```json
{
  "success": true,
  "data": {
    "juzNumber": 1,
    "hizbs": [
      {
        "hizbNumber": 1,
        "ayahCount": 74,
        "quarterCount": 4,
        "surahs": [
          {
            "surah": 1,
            "surahName": "الفاتحة"
          },
          {
            "surah": 2,
            "surahName": "البقرة"
          }
        ]
      },
      {
        "hizbNumber": 2,
        "ayahCount": 74,
        "quarterCount": 4,
        "surahs": [
          {
            "surah": 2,
            "surahName": "البقرة"
          }
        ]
      }
    ]
  }
}
```

**Caching:** Cached for 30 minutes.

### GET `/juz/{juzNumber}/hizb/{hizbNumber}`

Get specific Hizb content with all ayahs and surah organization.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `juzNumber` | integer | ✅ | Juz number (1-30) |
| `hizbNumber` | integer | ✅ | Hizb number (1-60) |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `includeText` | boolean | ❌ | Include full ayah text (default: true) |
| `translation` | string | ❌ | Translation identifier |

**Example Request:**
```
GET /api/v1/quran/juz/1/hizb/1?includeText=true&translation=sahih-international
```

**Response:**
```json
{
  "success": true,
  "data": {
    "juzNumber": 1,
    "hizbNumber": 1,
    "ayahCount": 74,
    "quarterCount": 4,
    "surahs": [
      {
        "surah": 1,
        "surahName": "الفاتحة"
      },
      {
        "surah": 2,
        "surahName": "البقرة"
      }
    ],
    "ayahs": [
      {
        "id": "1:1",
        "surah": 1,
        "surahName": "الفاتحة",
        "ayah": 1,
        "text": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
        "juz": 1,
        "hizb": 1,
        "quarter": 1
      }
      // ... all ayahs in this hizb
    ]
  }
}
```

**Caching:** Cached for 30 minutes.

---

## Level 3: Rubʿ al-Hizb (Quarter) Navigation

### GET `/juz/{juzNumber}/hizb/{hizbNumber}/quarters`

Get list of 4 quarters (Rubʿ al-Hizb) for a specific Hizb.

**Parameters:**
- `juzNumber`: Integer (1-30)
- `hizbNumber`: Integer (1-60)

**Response:**
```json
{
  "success": true,
  "data": {
    "juzNumber": 1,
    "hizbNumber": 1,
    "quarters": [
      {
        "quarterNumber": 1,
        "ayahCount": 37,
        "surahs": [
          {
            "surah": 1,
            "surahName": "الفاتحة"
          },
          {
            "surah": 2,
            "surahName": "البقرة"
          }
        ],
        "range": {
          "start": {
            "surah": 1,
            "surahName": "الفاتحة",
            "ayah": 1
          },
          "end": {
            "surah": 2,
            "surahName": "البقرة",
            "ayah": 30
          }
        }
      },
      {
        "quarterNumber": 2,
        "ayahCount": 37,
        "surahs": [
          {
            "surah": 2,
            "surahName": "البقرة"
          }
        ],
        "range": {
          "start": {
            "surah": 2,
            "surahName": "البقرة",
            "ayah": 31
          },
          "end": {
            "surah": 2,
            "surahName": "البقرة",
            "ayah": 67
          }
        }
      },
      {
        "quarterNumber": 3,
        "ayahCount": 37,
        "surahs": [
          {
            "surah": 2,
            "surahName": "البقرة"
          }
        ],
        "range": {
          "start": {
            "surah": 2,
            "surahName": "البقرة",
            "ayah": 68
          },
          "end": {
            "surah": 2,
            "surahName": "البقرة",
            "ayah": 104
          }
        }
      },
      {
        "quarterNumber": 4,
        "ayahCount": 37,
        "surahs": [
          {
            "surah": 2,
            "surahName": "البقرة"
          }
        ],
        "range": {
          "start": {
            "surah": 2,
            "surahName": "البقرة",
            "ayah": 105
          },
          "end": {
            "surah": 2,
            "surahName": "البقرة",
            "ayah": 141
          }
        }
      }
    ]
  }
}
```

---

## Level 4: Ayah Content

### GET `/juz/{juzNumber}/hizb/{hizbNumber}/quarter/{quarterNumber}`

Get specific Rubʿ al-Hizb (quarter) content with all ayahs and detailed metadata.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `juzNumber` | integer | ✅ | Juz number (1-30) |
| `hizbNumber` | integer | ✅ | Hizb number (1-60) |
| `quarterNumber` | integer | ✅ | Quarter number (1-4) |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `translation` | string | ❌ | Translation identifier |
| `reciter` | string | ❌ | Reciter identifier for audio |
| `textFormat` | string | ❌ | Arabic text format: 'uthmani', 'indopak', 'simple' |
| `includeText` | boolean | ❌ | Include ayah text (default: true) |

**Example Request:**
```
GET /api/v1/quran/juz/1/hizb/1/quarter/1?translation=sahih-international&reciter=abdul_basit
```

**Response:**
```json
{
  "success": true,
  "data": {
    "juzNumber": 1,
    "hizbNumber": 1,
    "quarterNumber": 1,
    "rubAlHizb": "Rubʿ 1",
    "ayahCount": 37,
    "surahs": [
      {
        "surah": 1,
        "surahName": "الفاتحة"
      },
      {
        "surah": 2,
        "surahName": "البقرة"
      }
    ],
    "range": {
      "start": {
        "surah": 1,
        "surahName": "الفاتحة",
        "ayah": 1
      },
      "end": {
        "surah": 2,
        "surahName": "البقرة",
        "ayah": 30
      }
    },
    "ayahs": [
      {
        "id": "1:1",
        "surah": 1,
        "surahName": "الفاتحة",
        "ayah": 1,
        "text": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
        "translation": "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
        "juz": 1,
        "hizb": 1,
        "quarter": 1,
        "page": 1,
        "sajda": false
      },
      {
        "id": "1:2",
        "surah": 1,
        "surahName": "الفاتحة",
        "ayah": 2,
        "text": "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
        "translation": "[All] praise is [due] to Allah, Lord of the worlds -",
        "juz": 1,
        "hizb": 1,
        "quarter": 1,
        "page": 1,
        "sajda": false
      }
      // ... more ayahs
    ]
  }
}
```

---

## Query Parameters

### Common Parameters

- `translation`: Translation identifier (e.g., 'sahih-international', 'pickthall')
- `reciter`: Reciter identifier for audio URLs (e.g., 'abdul-basit', 'sudais')
- `textFormat`: Arabic text format ('uthmani', 'indopak', 'simple')
- `includeText`: Boolean to include/exclude Arabic text (performance optimization)

### Available Translations

Use the existing endpoint:

```
GET /v1/quran/translations
```

### Available Reciters

Use the existing endpoint:

```
GET /v1/quran/reciters
```

---

## Navigation Flow Examples

### 1. Browse by Structure

```javascript
// 1. Get structure overview
const structure = await fetch('/api/v1/quran/structure');

// 2. Browse Juz 1
const juz1Hizbs = await fetch('/api/v1/quran/juz/1/hizbs');

// 3. Browse Hizb 1 quarters
const hizb1Quarters = await fetch('/api/v1/quran/juz/1/hizb/1/quarters');

// 4. Get Quarter 1 content
const quarter1 = await fetch('/api/v1/quran/juz/1/hizb/1/quarter/1?translation=sahih-international');
```

### 2. Direct Access

```javascript
// Direct access to specific quarter with translation
const response = await fetch('/api/v1/quran/juz/5/hizb/9/quarter/3?translation=pickthall&reciter=sudais');
```

### 3. Performance Optimization

```javascript
// Get structure without text for navigation
const quarters = await fetch('/api/v1/quran/juz/1/hizb/1/quarters');

// Get full content when needed
const fullQuarter = await fetch('/api/v1/quran/juz/1/hizb/1/quarter/1?includeText=true&translation=sahih-international');
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid Juz number",
  "statusCode": 400
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Quarter not found",
  "statusCode": 404
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

## Caching

- Structure overview: Cached for 1 day
- Juz/Hizb lists: Cached for 30 minutes
- Content with ayahs: Cached for 30 minutes
- All responses include Redis caching for optimal performance

---

## Rate Limiting

- 1000 requests per hour per user
- Cached responses don't count toward rate limit

---

## Islamic Terminology

- **Juz (جزء)**: One of 30 equal sections of the Quran (also called Para in Urdu/Hindi)
- **Hizb (حزب)**: One of 60 sections, each Juz contains 2 Hizb
- **Rubʿ al-Hizb (رُبْعُ الحِزْب)**: Quarter of a Hizb, totaling 240 sections
- **Ayah (آية)**: Individual verse of the Quran

This structure allows users to navigate the Quran exactly as it's traditionally organized in Islamic texts and apps worldwide.

---

## Database Implementation Notes

All hierarchical endpoints now query the unified `quran_ayahs` collection which contains:
- **6,236 individual ayah documents** with complete metadata
- **Efficient indexing** on `juz_number`, `hizb_number`, `sura_number` for fast queries
- **Real-time aggregation** for calculating counts and organizing structure
- **Consistent data** ensuring no mismatches between different levels

## Performance Optimizations

1. **Intelligent Caching**
   - Structure data cached for 1 day (static)
   - Content queries cached for 30 minutes
   - Redis-based caching for optimal response times

2. **Query Efficiency**
   - MongoDB aggregation pipelines for grouping operations
   - Selective field projection to minimize data transfer
   - Indexed queries for sub-millisecond lookups

3. **Response Optimization**
   - Optional `includeText` parameter for navigation-only requests
   - Layered data structure (overview → details)
   - Compressed JSON responses

---

**Last Updated:** August 2025  
**API Version:** 1.2  
**Database Schema:** Unified `quran_ayahs` collection